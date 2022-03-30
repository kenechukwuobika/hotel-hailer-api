const Review = require('../models/Review');
const factory = require('./factory');

exports.getAllReviews = factory.getDocuments(Review);
exports.createReview = factory.createDocument(Review);
exports.getReview = factory.getDocument(Review);
exports.updateReview = factory.updateDocument(Review);
exports.deleteReview = factory.deleteDocument(Review);
