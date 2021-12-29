const express = require('express');

const propertyController = require('../controllers/propertyController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/nearby', propertyController.getDistances)

router
.route('/')
.get(propertyController.getAllProperties)
.post(authController.protect, authController.restrictTo('admin', 'vendor'), propertyController.setOwnerId('body'), propertyController.createProperty);

router
.route('/:id')
.get(propertyController.getProperty)
.patch(authController.protect, authController.restrictTo('admin', 'vendor'), propertyController.updateProperty)
.delete(authController.protect, authController.restrictTo('admin', 'vendor'), propertyController.deleteProperty);

module.exports = router;

