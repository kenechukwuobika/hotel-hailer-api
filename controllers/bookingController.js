const https = require('https');

const axios = require('axios');
const cron = require('node-cron');

const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Property = require('../models/Property');
const Email = require('./emailController');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');
const sendResponse = require('../utilities/sendResponse');

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

exports.initializeTransation = catchAsync( async (req, res, next) => {

  const property = await Property.findById(req.params.properyId);
  
  const totalAmount = property.unitPrice;

  const customer = req.user;

  const {
    paymentInterval,
    amountOnInterval,
    description,
    lodgeStartDate,
    lodgeEndDate,
  } = req.body;
  
  const booking = await Booking.create({
    property,
    customer,
    paymentInterval,
    amountOnInterval,
    totalAmount,
    description,
    lodgeStartDate,
    lodgeEndDate,
    status: 'awaiting_payment'
  });

  const params = JSON.stringify({
    "email": req.user.email,
    "amount": booking.amountOnInterval * 100,
    "metadata": {
      "booking": booking.id
    }
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
      'Content-Type': 'application/json'
    }
  }

  const httpsRequest = https.request(options, httpsResponse => {
  let data = ''
  httpsResponse.on('data', (chunk) => {
    data += chunk
  });
  httpsResponse.on('end', () => {
    
    res.status(201).json({
      status: 'success',
      data: JSON.parse(data)
    });
  })
  }).on('error', async error => {
    console.log(error);
    booking.status = 'failed';
    await booking.save();
    return next(new AppException(400, 'booking failed, please try again'));
  })
  httpsRequest.write(params)
  httpsRequest.end();

});

exports.verifyTransation = catchAsync( async (req, res, next) => {
  const https = require('https')
  
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${req.body.reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`
    }
  }

  const req1 = https.request(options, response => {
    let data = ''
    response.on('data', (chunk) => {
      data += chunk
    });
    response.on('end', async () => {
      const result = JSON.parse(data);
      if(result.status === 'success'){

        console.log(result);
        const booking = await Booking.findById(result.data.metadata.booking);
        booking.totalAmountPaid += result.data.amount * 1/100;
        booking.status = booking.totalAmountPaid < booking.totalAmount ? 'inprogress' : 'completed';
        booking.lastPaymentDate = Date.now();
        booking.nextPaymentDate = calcNextPaymentDate(booking.paymentInterval);
        booking.reference = result.data.reference;

        booking.history.push({date: Date.now(), amountPaid: result.data.amount * 1/100, status: 'success'});

        await booking.save({
          validateBeforeSave: false
        });

        sendResponse(res, 200, result);
      }

      else{
        console.log(result.message);
        return next(new AppException(404, 'booking failed, please try again'));
      }
    })
  }).on('error', error => {
    console.error(error)
    return next(new AppException(400, 'booking failed, please try again'));
  })

  req1.end()

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
