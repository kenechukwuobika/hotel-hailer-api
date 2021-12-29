const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyRoute = require('./propertyRoute');
const bookingRoute = require('./bookingRoute');
const walletRoute = require('./walletRoute');
const reviewRoute = require('./reviewRoute');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
.route('/')
.get(userController.getMe, userController.getUser)
.patch(userController.uploadPhoto, userController.resizedPhoto, userController.getMe, userController.updateMe)
.delete(userController.getMe, userController.deleteMe)

router.route('/update_password').put(userController.updatePassword);
router.use('/properties', userController.setOwnerIds, propertyRoute);
router.use('/bookings', bookingRoute);
router.use('/wallets', userController.setOwnerIds, walletRoute);
router.use('/reviews', userController.setOwnerIds, reviewRoute);

module.exports = router;

