const Notification = require('../models/Notification');
const factory = require('./factory');

exports.getAllNotifications = factory.getDocuments(Notification);
exports.createNotification = factory.createDocument(Notification);
exports.getNotification = factory.getDocument(Notification);
exports.updateNotification = factory.updateDocument(Notification);
exports.deleteNotification = factory.deleteDocument(Notification);