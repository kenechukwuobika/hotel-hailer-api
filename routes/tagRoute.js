const express = require('express');

const tagController = require('../controllers/tagController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin'));

router.route('/').get(tagController.getAllTags).post(tagController.createTag);

router
    .route('/:id')
    .get(tagController.getTag)
    .patch(tagController.updateTag)
    .delete(tagController.deleteTag);

module.exports = router;
