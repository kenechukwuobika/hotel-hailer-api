const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/me', userController.uploadPhoto, userController.resizedPhoto, userController.updateMe);
router.delete('/me', userController.deleteMe);



router
.use(authController.restrictTo('admin'))
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router;

