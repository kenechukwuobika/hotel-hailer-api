const cron = require('node-cron');

const paystackService = require('../services/axios/paystack');

const Booking = require('../models/Booking');
const User = require('../models/User');
const Card = require('../models/Card');
const Property = require('../models/Property');
const Email = require('./emailController');
const factory = require('./factory');
const notificationController = require('./notificationController');

const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');
const sendResponse = require('../utilities/sendResponse');
const helpers = require('../utilities/helpers');
const {
    FULL,
    WEEKLY,
    BI_WEEKLY,
    MONTHLY,
    PAYMENT_IN_PROGRESS,
    PAYMENT_COMPLETE,
    COMPLETE,
    IN_PROGRESS,
} = require('../constants');

exports.getAllBookings = factory.getDocuments(Booking, {
    path: 'property',
    select: 'name coverImage',
});
exports.createBooking = factory.createDocument(Booking);
exports.getBooking = factory.getDocument(Booking, {
    path: 'property',
    select: 'name coverImage vendor',
});
exports.updateBooking = factory.updateDocument(Booking);
exports.deleteBooking = factory.deleteDocument(Booking);

const createPaymentPlan = (name, billableInterval, totalAmount) => {
    const amountOnInterval = helpers.round5(totalAmount / billableInterval);
    const nextPaymentDate = helpers.calcNextPaymentDate(name);
    // let totalAmountPaid = 0;
    // const planDetails = [];
    // for(let i = 1; i <= billableInterval; i++){
    //     let amount = 0;
    //     if( (totalAmount - totalAmountPaid) < amountOnInterval ){
    //         amount = (totalAmount - totalAmountPaid);
    //     }else{
    //         amount = amountOnInterval;
    //     }
    //     planDetails.push({
    //         date :new Date(Date.now() + 14 * 24 * 60 * 60 * 1000  * i),
    //         amount
    //     })

    //     totalAmountPaid += amount;
    // }

    return {
        name,
        amountOnInterval,
        nextPaymentDate,
        // planDetails
    };
};

const getBillableInterval = (paymentInterval, differenceInWeeks) => {
    if (paymentInterval === WEEKLY) {
        return differenceInWeeks - 1;
    } else if (paymentInterval === BI_WEEKLY) {
        return Math.floor((differenceInWeeks - 1) / 2);
    } else if (paymentInterval === MONTHLY) {
        return Math.floor((differenceInWeeks - 1) / 4);
    } else {
        return 1;
    }
};

const calcDiffInWeeks = (date) => {
    const currentDate = new Date(Date.now());
    const differenceInSeconds =
        new Date(date).getTime() - currentDate.getTime();
    return Math.floor(differenceInSeconds / (3600 * 1000 * 24 * 7));
};

const calcAmountOnInterval = (
    totalAmount,
    paymentInterval,
    billableInterval
) => {
    if (paymentInterval === FULL || billableInterval === 0) {
        return totalAmount;
    } else {
        return helpers.round5(totalAmount / billableInterval);
    }
};

const validateBooking = async (req, next, mode = 'pay') => {
    try {
        let totalAmount = 0;
        //get reference for rquest body
        const { propertyId } = req.params;
        const { cardId, lodgeEndDate, lodgeStartDate, paymentInterval } =
            req.body;
        const { user } = req;
        const currentDate = new Date(Date.now());

        if (!paymentInterval) {
            return next(
                new AppException(400, 'Please select payment interval')
            );
        }

        if (!lodgeStartDate) {
            return next(
                new AppException(400, 'Please select lodge start date')
            );
        }

        if (!lodgeEndDate) {
            return next(new AppException(400, 'Please select lodge end date'));
        }

        if (new Date(lodgeStartDate) < currentDate) {
            return next(
                new AppException(400, 'Please select today or a future date')
            );
        }

        if (new Date(lodgeEndDate) < new Date(lodgeStartDate)) {
            return next(
                new AppException(
                    400,
                    'Lodge start date has to before the lodge end date'
                )
            );
        }

        const property = await Property.findById(propertyId);

        if (!property) {
            return next(new AppException(404, 'Property not found'));
        }

        const existingBooking = await Booking.findOne({
            property: property.id,
            $or: [
                {
                    lodgeStartDate: {
                        $gte: currentDate,
                        $lte: new Date(lodgeEndDate),
                    },
                    lodgeEndDate: {
                        $gte: new Date(lodgeEndDate),
                        $gte: new Date(lodgeStartDate),
                    },
                },
            ],
        });

        if (existingBooking) {
            return next(
                new AppException(
                    400,
                    'Property not available on selected dates'
                )
            );
        }

        let card = null;

        if (mode === 'pay') {
            // check if reference number was provided
            if (!cardId) {
                return next(new AppException(400, 'Please provide card id'));
            }

            // find booking with reference number
            card = await Card.findById(cardId);

            // check if booking exists or not
            if (!card) {
                return next(new AppException(404, 'card not found'));
            }
        }

        totalAmount =
            property.unitPrice * helpers.dayDiff(lodgeEndDate, lodgeStartDate);

        const differenceInWeeks = calcDiffInWeeks(lodgeStartDate);
        const billableInterval = getBillableInterval(
            paymentInterval,
            differenceInWeeks
        );
        const amountOnInterval = calcAmountOnInterval(
            totalAmount,
            paymentInterval,
            billableInterval
        );

        const data = Object.assign(req.body, {
            user,
            property,
            totalAmount,
            amountOnInterval,
        });

        const booking = new Booking(data);

        const params = JSON.stringify({
            authorization_code: card?.paystack_auth_code,
            email: user.email,
            amount: booking.amountOnInterval * 100,
        });

        return {
            params,
            booking,
            user,
        };
    } catch (error) {
        return next(new AppException(400, 'Validation failed'));
    }
};

const verifyBooking = async (user, booking, response) => {
    try {
        if (!booking.paymentVerified) {
            if (response.status === 200) {
                const result = { ...response.data };
                if (result.status === true) {
                    const { data } = result;
                    if (data.status === 'success') {
                        booking.totalAmountPaid += data.amount / 100;
                        booking.lastPaymentAmount = data.amount / 100;
                        booking.lastPaymentDate = Date.now();
                        if (booking.totalAmountPaid !== booking.totalAmount) {
                            booking.status = PAYMENT_IN_PROGRESS;
                            booking.nextPaymentDate =
                                helpers.calcNextPaymentDate(
                                    booking.paymentInterval
                                );
                        } else {
                            booking.status = PAYMENT_COMPLETE;
                            booking.paymentInterval = FULL;
                        }

                        booking.paymentVerified = true;

                        booking.history.push({
                            date: Date.now(),
                            amount: data.amount / 100,
                            status: 'successful',
                        });

                        const authorization = data.authorization;

                        const filter = {
                            card_type: authorization.card_type,
                            last_4: authorization.last4,
                            user: user._id,
                            email: user.email,
                        };

                        const update = {
                            email: user.email,
                            user: user._id,
                            paystack_auth_code:
                                authorization.authorization_code,
                            card_type: authorization.card_type,
                            last_4: authorization.last4,
                            exp_month: authorization.exp_month,
                            exp_year: authorization.exp_year,
                            bank: authorization.bank,
                        };

                        const card = await Card.findOneAndUpdate(
                            filter,
                            update,
                            {
                                new: true,
                                upsert: true,
                            }
                        );

                        booking.card = card._id;
                        await booking.save();

                        const payload = {
                            endpoint: '/bookings',
                            reference: booking.id,
                            message: 'view booking',
                        };

                        await notificationController.notify(
                            booking.user,
                            'You have sucessfully booked a property',
                            payload
                        );
                    } else {
                        booking.status = 'failed';
                        await booking.save();
                        return next(
                            new AppException(
                                404,
                                'booking failed, please try again'
                            )
                        );
                    }
                } else {
                    booking.status = 'failed';
                    await booking.save();
                    return next(
                        new AppException(
                            404,
                            'booking failed, please try again'
                        )
                    );
                }
                return true;
            }
            return false;
        }

        return false;
    } catch (error) {}
};

exports.getBookedDates = catchAsync(async (req, res, next) => {
    const { month, year, propertyId } = req.query;

    const currentDate = new Date(Date.now());
    const lastDate = new Date(year, month, 0).getDate();

    const bookings = await Booking.find({
        property: propertyId,
        $or: [
            {
                lodgeStartDate: {
                    $gte: currentDate,
                    $lte: `${year}-${month}-${lastDate}`,
                },
            },
            {
                lodgeEndDate: {
                    $gte: currentDate,
                    $lte: `${year}-${month}-${lastDate}`,
                },
            },
        ],
    });

    const bookedDates = [];

    if (bookings && bookings.length !== 0) {
        bookings.forEach((booking) =>
            bookedDates.push({
                lodgeStartDate: booking.lodgeStartDate,
                lodgeEndDate: booking.lodgeEndDate,
            })
        );
    }

    return res.status(200).json({
        status: 'success',
        result: bookedDates.length,
        bookedDates,
    });
});

exports.getBookingPlans = catchAsync(async (req, res, next) => {
    const { propertyId, lodgeStartDate, lodgeEndDate } = req.query;

    if (!propertyId) {
        return next(
            new AppException(
                400,
                'Invalid input. Please provide the property Id'
            )
        );
    }

    if (!lodgeStartDate || !lodgeEndDate) {
        return next(
            new AppException(
                400,
                'Invalid input. Please provide the lodge start and end dates'
            )
        );
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        return next(new AppException(401, 'Property not found'));
    }

    const differenceInWeeks = calcDiffInWeeks(lodgeStartDate);
    let partialPaymentSupport = false;
    const partialPaymentPlans = [];
    const totalAmount =
        property.unitPrice * helpers.dayDiff(lodgeEndDate, lodgeStartDate);

    const plans = [
        {
            name: WEEKLY,
            weekBuffer: 4,
        },
        {
            name: BI_WEEKLY,
            weekBuffer: 6,
        },
        {
            name: MONTHLY,
            weekBuffer: 10,
        },
    ];

    plans.forEach((plan) => {
        const { name, weekBuffer } = plan;
        if (differenceInWeeks >= weekBuffer) {
            partialPaymentSupport = true;
            const billableInterval = getBillableInterval(
                name,
                differenceInWeeks
            );
            const paymentPlan = createPaymentPlan(
                name,
                billableInterval,
                totalAmount
            );
            partialPaymentPlans.push(paymentPlan);
        }
    });

    return res.status(200).json({
        status: 'success',
        totalAmount,
        partialPaymentSupport,
        partialPaymentPlans,
    });
});

exports.initializeTransaction = catchAsync(async (req, res, next) => {
    const { params, booking } = await validateBooking(
        req,
        next,
        (mode = 'initialize')
    );
    try {
        const response = await paystackService.post('/initialize', params);

        if (response.status === 200) {
            const result = response.data;
            if (result.status === true) {
                booking.reference = result.data.reference;
                await booking.save();
                return res.status(200).json({
                    status: 'success',
                    data: result.data,
                });
            }
        }

        return next(new AppException(400, 'Could not initialize booking'));
    } catch (error) {
        console.log(error);
        return next(new AppException(400, 'Could not initialize booking'));
    }
});

/**
 * Verifies the payment status of a booking from Paystack
 * @type {object}
 */
exports.verifyTransation = catchAsync(async (req, res, next) => {
    //get reference for rquest body
    const { reference } = req.body;
    const { user } = req;

    // check if reference number was provided
    if (!reference) {
        return next(
            new AppException(400, 'Please provide a booking reference number')
        );
    }

    // find booking with reference number
    const booking = await Booking.findOne({ reference });

    // check if booking exists or not
    if (!booking) {
        return next(new AppException(404, 'Invalid booking reference number'));
    }

    // verify payment from paystack
    const response = await paystackService.get(`/verify/${reference}`);

    //do if booking has not already been verified
    const verifiedBooking = verifyBooking(user, booking, response);

    const resData = {
        status: 'success',
        data: booking,
    };

    sendResponse(res, 200, resData);
});

/**
 * Verifies the payment status of a booking from Paystack
 * @type {object}
 */
exports.pay = catchAsync(async (req, res, next) => {
    const { params, booking, user } = await validateBooking(
        req,
        next,
        (mode = 'pay')
    );

    // verify payment from paystack
    const response = await paystackService.post(
        `/charge_authorization/`,
        params
    );

    //do if booking has not already been verified
    const verifiedBooking = verifyBooking(user, booking, response);

    const resData = {
        status: 'success',
        data: booking,
    };

    sendResponse(res, 200, resData);
});

exports.schedule = () =>
    cron.schedule(
        '*/10 * * * * *',
        catchAsync(async (data) => {
            console.log('running');
            console.log(data);

            const bookings = await Booking.find({
                status: PAYMENT_IN_PROGRESS,
                paymentVerified: true,
                nextPaymentDate: { $lt: new Date(Date.now()) },
                failedAttempts: { $lt: 3 },
            }).populate('card');

            console.log(bookings.length);

            bookings.forEach(async (booking) => {
                try {
                    const { card } = booking;
                    const params = JSON.stringify({
                        authorization_code: card.paystack_auth_code,
                        email: card.email,
                        amount: booking.nextPaymentAmount * 100,
                    });

                    const response = await paystackService.post(
                        `/charge_authorization`,
                        params
                    );
                    if (response.status === 200) {
                        const result = { ...response.data };
                        if (result.status === true) {
                            const { data } = result;
                            if (data.status === 'success') {
                                booking.totalAmountPaid += data.amount / 100;
                                booking.lastPaymentAmount = data.amount / 100;
                                booking.lastPaymentDate = Date.now();
                                if (
                                    booking.totalAmountPaid !==
                                    booking.totalAmount
                                ) {
                                    booking.status = PAYMENT_IN_PROGRESS;
                                    booking.nextPaymentDate =
                                        helpers.calcNextPaymentDate(
                                            booking.paymentInterval
                                        );
                                } else {
                                    booking.status = PAYMENT_COMPLETE;
                                    booking.paymentInterval = FULL;
                                }

                                booking.history.push({
                                    date: Date.now(),
                                    amount: data.amount / 100,
                                    status: 'successful',
                                });
                                await booking.save();

                                const payload = {
                                    endpoint: '/bookings',
                                    reference: booking.id,
                                    message: 'view booking',
                                };

                                await notificationController.notify(
                                    booking.user,
                                    `You card has been sucessfully charged on booking ${booking.id}`,
                                    payload
                                );
                            } else {
                                booking.history.push({
                                    date: Date.now(),
                                    amount: data.amount / 100,
                                    status: 'failed',
                                });
                                booking.failedAttempts += 1;
                                await booking.save();
                                console.log('booking failed');
                            }
                        } else {
                            booking.history.push({
                                date: Date.now(),
                                amount: data.amount / 100,
                                status: 'failed',
                            });
                            booking.failedAttempts += 1;
                            await booking.save();
                            console.log('booking failed');
                        }
                    } else {
                        booking.history.push({
                            date: Date.now(),
                            amount: data.amount / 100,
                            status: 'failed',
                        });
                        booking.failedAttempts += 1;
                        await booking.save();
                        console.log('booking failed');
                    }
                } catch (error) {
                    console.log(error.response);
                }
            });
        })
    );

exports.transactionWebhook = catchAsync(async (req, res, next) => {
    const { authorization, metadata, amount } = req.body.data;

    const {
        paymentInterval,
        amountOnInterval,
        totalAmount,
        status,
        description,
        lodgeStartDate,
        lodgeEndDate,
    } = metadata;

    const customer = await User.findOne({
        email: req.body.data.customer.email,
    });

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
        nextPaymentDate,
    });

    customer.paystack_auth_code = authorization.authorization_code;
    customer.card_type = authorization.card_type;
    customer.last_4 = authorization.last4;
    customer.exp_month = authorization.exp_month;
    customer.exp_year = authorization.exp_year;
    customer.bank = authorization.bank;

    await customer.save({
        validateBeforeSave: false,
    });

    res.status(200).json({
        status: 'success',
        data: booking,
    });
});
