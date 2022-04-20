const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyRoute = require('../routes/propertyRoute');

const router = express.Router({ mergeParams: true });

router
.route('/')
.get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers)
.post(
    authController.protect, 
    authController.restrictTo('admin'), 
    userController.uploadPhoto,
    userController.resizedPhoto,
    userController.createUser
);

router
.route('/:id')
.get(userController.getUser)
.patch(
    authController.protect, 
    authController.restrictTo('admin'),
    userController.uploadPhoto,
    userController.resizedPhoto,
    userController.updateUser
)
.delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);

router.use('/:id/properties', userController.setVendorId(), propertyRoute);
router.use('/:id/bookings', userController.setVendorId(), propertyRoute);
router.use('/:id/wallets', userController.setVendorId(), propertyRoute);
router.use('/:id/reviews', userController.setVendorId(), propertyRoute);

module.exports = router;

