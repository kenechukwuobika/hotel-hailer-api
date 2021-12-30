const express = require('express');

const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(userController.setUserId(), notificationController.getAllNotifications)
.post(authController.restrictTo('admin'), notificationController.createNotification);

router
.use(authController.restrictTo('admin'))
.route('/:id')
.get(notificationController.getNotification)
.patch(notificationController.updateNotification)
.delete(notificationController.deleteNotification);

module.exports = router;

