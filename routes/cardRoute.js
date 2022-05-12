const express = require('express');

const cardController = require('../controllers/cardController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(userController.setUserId('filter'), cardController.getAllCards)
.post(cardController.createCard);

router
.route('/:id')
.get(userController.setUserId('filter'), cardController.getCard)
.patch(userController.setUserId('filter'), cardController.updateCard)
.delete(userController.setUserId('filter'), cardController.deleteCard);

router.get('/delete-card/:id', cardController.canDeleteCard)

module.exports = router;

