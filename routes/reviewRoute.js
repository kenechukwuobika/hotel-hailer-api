const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(reviewController.getAllReviews)
.post(userController.setUserId('body'), reviewController.createReview);

router
.use(userController.setUserId())
.route('/:id')
.get(reviewController.getReview)
.patch(reviewController.updateReview)
.delete(reviewController.deleteReview);

module.exports = router;

