const Card = require('../models/Card');
const Booking = require('../models/Booking');
const factory = require('./factory');
const AppException = require('../utilities/AppException');
const catchAsync = require('../utilities/catchAsync');
const { PAYMENT_IN_PROGRESS, PAYMENT_ON_HOLD } = require('../constants');

exports.getAllCards = factory.getDocuments(Card);
exports.createCard = factory.createDocument(Card);
exports.getCard = factory.getDocument(Card);
exports.updateCard = factory.updateDocument(Card);

exports.deleteCard = catchAsync(async (req, res, next) => {
    const { cardId } = req.params;

    if (cardId) {
        return next(new AppException(400, 'Please provide a card'));
    }

    const booking = await Booking.findOne({
        cardId,
        $or: [{ status: PAYMENT_IN_PROGRESS }, { status: PAYMENT_ON_HOLD }],
    });

    if (booking) {
        return next(
            new AppException(
                400,
                'Sorry you can not delete a card with an active booking'
            )
        );
    }

    const card = await Card.findByIdAndDelete(cardId);

    return res.status(200).json({
        status: 'success',
        data: card,
    });
});

exports.canDeleteCard = catchAsync(async (req, res, next) => {
    const { cardId } = req.params;

    if (cardId) {
        return next(new AppException(400, 'Please provide a card'));
    }

    const booking = await Booking.findOne({
        card: cardId,
        $or: [{ status: PAYMENT_IN_PROGRESS }, { status: PAYMENT_ON_HOLD }],
    });

    console.log(booking);

    if (booking) {
        return next(
            new AppException(
                400,
                'Sorry you can not delete a card with an active booking'
            )
        );
    }

    return res.status(200).json({
        status: 'success',
        message: 'Card can be deleted sucessfully',
    });
});
