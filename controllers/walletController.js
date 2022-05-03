const Wallet = require('../models/Wallet');
const factory = require('./factory');

exports.getAllWallets = factory.getDocuments(Wallet);
exports.createWallet = factory.createDocument(Wallet);
exports.getWallet = factory.getDocument(Wallet);
exports.updateWallet = factory.updateDocument(Wallet);
exports.deleteWallet = factory.deleteDocument(Wallet);