const express = require('express');

const propertyController = require('../controllers/propertyController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const reviewRoute = require('./reviewRoute');

const router = express.Router({ mergeParams: true });

router.get('/nearby', propertyController.getDistances)

router
.route('/')
.get(propertyController.getAllProperties)
.post(
    authController.protect, 
    authController.restrictTo('admin', 'vendor'), 
    userController.setVendorId('body'), 
    propertyController.uploadPhotos, 
    propertyController.resizedPhoto, 
    propertyController.createProperty
);

router
.route('/:id')
.get(propertyController.getProperty)
.patch(
    authController.protect, 
    authController.restrictTo('admin', 'vendor'), 
    userController.setVendorId('filter'),
    propertyController.uploadPhotos,
    propertyController.resizedPhoto,
    propertyController.updateProperty
)
.delete(
    authController.protect,
    authController.restrictTo('admin', 'vendor'),
    propertyController.deleteProperty
);

router.use('/:id/reviews', propertyController.setPropertyId(), reviewRoute);

module.exports = router;

