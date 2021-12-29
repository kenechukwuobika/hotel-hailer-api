const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyRoute = require('../routes/propertyRoute');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
.route('/')
.get(authController.restrictTo('admin'), userController.getAllUsers)
.post(authController.restrictTo('admin'), userController.createUser);

router
.route('/:id')
.get(authController.restrictTo('admin'), userController.getUser)
.patch(authController.restrictTo('admin'), userController.updateUser)
.delete(authController.restrictTo('admin'), userController.deleteUser);

router.use('/:id/properties', userController.setVendorId(), propertyRoute);
router.use(authController.restrictTo('admin'));
router.use('/:id/bookings', userController.setVendorId(), propertyRoute);
router.use('/:id/wallets', userController.setVendorId(), propertyRoute);
router.use('/:id/reviews', userController.setVendorId(), propertyRoute);

module.exports = router;

