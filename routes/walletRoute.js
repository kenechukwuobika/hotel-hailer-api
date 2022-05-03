const express = require('express');

const walletController = require('../controllers/walletController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin'));

router
.route('/')
.get(walletController.getAllWallets)
.post(walletController.createWallet);

router
.route('/:id')
.get(walletController.getWallet)
.patch(walletController.updateWallet)
.delete(walletController.deleteWallet);

module.exports = router;

