const express = require('express');

const perkController = require('../controllers/perkController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(perkController.getAllPerks)
.post( perkController.createPerk);

router
.route('/:id')
.get(perkController.getPerk)
.patch(authController.restrictTo('admin'), perkController.updatePerk)
.delete(authController.restrictTo('admin'), perkController.deletePerk);

module.exports = router;

