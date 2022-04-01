const express = require('express');

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect)
router.post('/transationWebhook', bookingController.transactionWebhook);
router.get('/booked-dates', bookingController.getBookedDates);
router.get('/booking-plans', bookingController.getBookingPlans);
router.post('/initialize/:propertyId', bookingController.initializeTransaction);
router.post('/verify', bookingController.verifyTransation);

router
.route('/')
.get(userController.setUserId('filter'), bookingController.getAllBookings)
.post(authController.restrictTo('admin'), bookingController.createBooking);

router
.route('/:id')
.get(userController.setUserId('filter'), bookingController.getBooking)
.patch(authController.restrictTo('admin'), bookingController.updateBooking)
.delete(authController.restrictTo('admin'), bookingController.deleteBooking);

module.exports = router;

