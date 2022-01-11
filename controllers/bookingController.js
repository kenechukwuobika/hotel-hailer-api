const https = require('https');

const axios = require('axios');
const cron = require('node-cron');

const Booking = require('../models/Booking');
const User = require('../models/User');
const Property = require('../models/Property');
const Transaction = require('../models/Transaction');
const Email = require('./emailController');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');
const sendResponse = require('../utilities/sendResponse');
const notificationController = require('./notificationController');

exports.getAllBookings = factory.getDocuments(Booking);
exports.createBooking = factory.createDocument(Booking);
exports.getBooking = factory.getDocument(Booking);
exports.updateBooking = factory.updateDocument(Booking);
exports.deleteBooking = factory.deleteDocument(Booking);

const calcNextPaymentDate = (interval) => {
  var date = '';
  switch (interval) {
    case 'hourly':
      date = new Date(Date.now() + 60 * 60 * 1000);
      break;
    
    case 'daily':
      date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      break;
    
    case 'weekly':
      date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      break;

    case 'bi-weekly':
      date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      break;

    case 'monthly':
      date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    break;
  
    default:
      break;
  }

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

}

const monthDiff = (d1, d2) => {
	var months;
	const date1 = new Date(d1);
	const date2 = new Date(d2)
	months = (date2.getFullYear() - date1.getFullYear()) * 12;
	months -= date1.getMonth();
	months += date2.getMonth();
	date = date1.getDay() - date2.getDay();
	console.log(date)
	return months <= 0 ? 0 : months;
	// const date1 = new Date(d1);
	// const date2 = new Date(d2)
	// return date2.getMonth() - date1.getMonth()
}

const dayDiff = (d1, d2) => {
	const date1 = new Date(d1);
	const date2 = new Date(d2)
	return date2.getDate() - date1.getDate()
}

exports.initializeTransation = catchAsync( async (req, res, next) => {
 
	const property = await Property.findById(req.params.properyId);

	if(!property){
		return next(new AppException(401, "Property not found"))
	}
	console.log(req.body.lodgeStartDate)
	const totalAmount = property.unitPrice * dayDiff(req.body.lodgeStartDate, req.body.lodgeEndDate);

	const { user } = req;

	const data = {
   		...req.body,
		user,
		property,
		totalAmount,
	};
  
	const booking = new Booking(data);

	const params = JSON.stringify({
		"email": user.email,
		"amount": booking.amountOnInterval * 100,
	});

  	const response = await axios.post('https://api.paystack.co/transaction/initialize', params, {
	  	headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
			'Content-Type': 'application/json'
		}
	})

	if(response.status === 200){
		const result = { ...response.data };
		if(result.status === true){
			booking.reference = result.data.reference;
			booking.status = 'awaiting_payment';
			await booking.save();
			return res.status(200).json({
				status: 'success',
				...result.data
			});
		}
	}

    return next(new AppException(400, 'Could not initialize booking'));

});

exports.verifyTransation = catchAsync( async (req, res, next) => {
  	const { reference } = req.body;
	
	const booking = await Booking.findOne({ reference });
	
	if(!booking){
		return next(new AppException(404, 'booking not found'));
	}

	if(booking.paymentVerified){
		return next(new AppException(400, 'booking already verified'));
	}

	const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
		headers: {
		Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`
		}
	})

	if(response.status === 200){
		const result = { ...response.data };
		if(result.status === true){
		const { data } = result;
		booking.totalAmountPaid += data.amount * 1/100;
		booking.status = booking.totalAmountPaid < booking.totalAmount ? 'in_progress' : 'completed';
		booking.lastPaymentDate = Date.now();
		booking.nextPaymentDate = calcNextPaymentDate(booking.paymentInterval);
		booking.paymentVerified = true;

		booking.history.push({date: Date.now(), amount: data.amount * 1/100, status: 'successful'});

		await booking.save();

		const resData = {
			status: "success",
			data: booking,
		}
		
		notificationController.notify(booking.user, 'You have sucessfully booked a property');

		sendResponse(res, 200, resData);
		}

		else{
			booking.status = 'failed';
			await booking.save();
			return next(new AppException(404, 'booking failed, please try again'));
		}
	}

});

exports.transactionWebhook = catchAsync( async (req, res, next) => {
  const {authorization, metadata, amount } = req.body.data;

  const {
    paymentInterval,
    amountOnInterval,
    totalAmount,
    status,
    description,
    lodgeStartDate,
    lodgeEndDate,
  } = metadata;
  
  const customer = await User.findOne({email: req.body.data.customer.email});

  const property = await Property.findById(metadata.property);

  const nextPaymentDate = calcNextPaymentDate(paymentInterval);

  const booking = await Booking.create({
      property,
      customer,
      paymentInterval,
      amountOnInterval,
      totalAmount,
      lastPaymentAmount: amount,
      amountPaid: amount,
      status,
      description,
      lodgeStartDate,
      lodgeEndDate,
      nextPaymentDate
  });

  customer.paystack_auth_code = authorization.authorization_code;
  customer.card_type = authorization.card_type;
  customer.last_4 = authorization.last4;
  customer.exp_month = authorization.exp_month;
  customer.exp_year = authorization.exp_year;
  customer.bank = authorization.bank;

  await customer.save({
    validateBeforeSave: false
  })

  res.status(200).json({
    status: 'success',
    data: booking
  });


});

// exports.schedule = cron.schedule('*/2 * * * * *', catchAsync( async () => {
    
//   console.log('running')

//   const bookings = await Booking.find({ status: 'inprogress' });

//   bookings.forEach(async (booking) => {
//     const customer = await Customer.findById(booking.customer);

//     const params = JSON.stringify({
//       "authorization_code" : customer.paystack_auth_code,
//       "email" : customer.email,
//       "amount" : booking.nextPaymentAmount * 100
//     })

//     const options = {
//       hostname: 'api.paystack.co',
//       port: 443,
//       path: '/transaction/charge_authorization',
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
//         'Content-Type': 'application/json'
//       }
//     }
//     const req1 = https.request(options, response => {
//       let data = ''
//       response.on('data', (chunk) => {
//         data += chunk
//       });
//       response.on('end', () => {
//         console.log(JSON.parse(data))
//         // res.status(200).json({
//         //   data
//         // })
//       })
//     }).on('error', error => {
//       console.error(error)
//     })
//     req1.write(params)
//     req1.end()
//   });

// }));
