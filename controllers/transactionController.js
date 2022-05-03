const Transaction = require('../models/Transaction');
const factory = require('./factory');

exports.getAllTransactions = factory.getDocuments(Transaction);
exports.createTransaction = factory.createDocument(Transaction);
exports.getTransaction = factory.getDocument(Transaction);
exports.updateTransaction = factory.updateDocument(Transaction);
exports.deleteTransaction = factory.deleteDocument(Transaction);
