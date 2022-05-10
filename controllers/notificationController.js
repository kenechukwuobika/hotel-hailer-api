const Notification = require('../models/Notification');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');

exports.getAllNotifications = factory.getDocuments(Notification);
exports.createNotification = factory.createDocument(Notification);
exports.getNotification = factory.getDocument(Notification);
exports.updateNotification = factory.updateDocument(Notification);
exports.deleteNotification = factory.deleteDocument(Notification);

exports.notify = catchAsync(async (id, text) => {
    const notification = await Notification.create({
        user: id,
        text
    })
    console.log(notification)
})

exports.markAsRead = catchAsync(async (req, res, next) => {
    const notifications = await Notification.updateMany({user: req.user._id, status: 'unread'}, {
        "$set": { status: 'read' }
    })

    res.status(200).json({
        status: "success",
        message: "Notifications read"
    })
})