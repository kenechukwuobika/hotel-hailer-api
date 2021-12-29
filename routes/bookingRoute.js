const express = require('express');

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.post('/transationWebhook', bookingController.transactionWebhook);

router.post('/initialize/:properyId', bookingController.initializeTransation);
router.post('/verify', bookingController.verifyTransation);

router
.use(authController.protect, authController.restrictTo('admin'))
.route('/')
.get(bookingController.getAllBookings)
.post(bookingController.createBooking);

router
.route('/:id')
.get(bookingController.getBooking)
.patch(bookingController.updateBooking)
.delete(bookingController.deleteBooking);

module.exports = router;

