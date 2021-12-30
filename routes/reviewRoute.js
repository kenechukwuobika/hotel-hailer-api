const express = require('express');

const reviewController = require('../controllers/reviewController');
const userController = require('../controllers/userController');

const router = express.Router();

router
.route('/')
.get(userController.setUserId(), reviewController.getAllReviews)
.post(userController.setUserId('body'), reviewController.createReview);

router
.use(userController.setUserId())
.route('/:id')
.get(reviewController.getReview)
.patch(reviewController.updateReview)
.delete(reviewController.deleteReview);

module.exports = router;

