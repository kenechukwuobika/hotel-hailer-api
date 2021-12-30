const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyRoute = require('./propertyRoute');
const bookingRoute = require('./bookingRoute');
const walletRoute = require('./walletRoute');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
.route('/')
.get(userController.getMe, userController.getUser)
.patch(userController.uploadPhoto, userController.resizedPhoto, userController.getMe, userController.updateMe)
.delete(userController.getMe, userController.deleteMe)

router.route('/update_password').put(userController.updatePassword);
router.use('/bookings', bookingRoute);
router.use(authController.restrictTo('vendor'))
router.use('/properties', userController.setVendorId(), propertyRoute);
router.use('/wallets', userController.setVendorId(), walletRoute);

module.exports = router;

