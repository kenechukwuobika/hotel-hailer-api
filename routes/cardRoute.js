const express = require('express');

const cardController = require('../controllers/cardController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
.route('/')
.get(cardController.getAllCards)
.post(cardController.createCard);

router
.route('/:id')
.get(cardController.getCard)
.patch(cardController.updateCard)
.delete(cardController.deleteCard);

router.get('/can-delete-card/:id', cardController.canDeleteCard)

module.exports = router;

