const express = require('express');

const propertyController = require('../controllers/propertyController');

const router = express.Router();

router
.route('/')
.get(propertyController.getAllProperties)
.post(propertyController.createProperty);

router
.route('/:id')
.get(propertyController.getProperty)
.patch(propertyController.updateProperty)
.delete(propertyController.deleteProperty);

module.exports = router;

