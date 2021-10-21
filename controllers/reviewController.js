const Review = require('../models/Review');
const factory = require('./factory');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getDocuments(Review);
exports.createReview = factory.createDocument(Review);
exports.getReview = factory.getDocument(Review);
exports.updateReview = factory.updateDocument(Review);
exports.deleteReview = factory.deleteDocument(Review);
