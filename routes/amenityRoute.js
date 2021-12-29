const express = require('express');

const amenityController = require('../controllers/amenityController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(amenityController.getAllAmenities)
.post( amenityController.createAmenity);

router
.route('/:id')
.get(amenityController.getAmenity)
.patch(authController.restrictTo('admin'), amenityController.updateAmenity)
.delete(authController.restrictTo('admin'), amenityController.deleteAmenity);

module.exports = router;

