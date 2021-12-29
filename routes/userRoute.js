const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const propertyRoute = require('../routes/propertyRoute');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(authController.restrictTo('admin'), userController.updateUser)
.delete(authController.restrictTo('admin'), userController.deleteUser);

router.use('/:id/properties', userController.setOwnerIds, propertyRoute);
router.use(authController.restrictTo('admin'));
router.use('/:id/bookings', userController.setOwnerIds, propertyRoute);
router.use('/:id/wallets', userController.setOwnerIds, propertyRoute);
router.use('/:id/reviews', userController.setOwnerIds, propertyRoute);

module.exports = router;

