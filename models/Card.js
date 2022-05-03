const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
    firstName: {
        type: String,
        lowercase: true,
        minlength: [2, 'First name must be 2 characters or more']
    },

    lastName: {
      type: String,
      lowercase: true,
      minlength: [2, 'Last name must be 2 characters or more']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Card must belong to a user!']
    },

    email: {
      type: String,
      required: [true, 'Please provide user email address'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },

    paystack_customer_id: {
        type: String,
        required: [true, 'Card must have a paystack customer id']
    },
    
    paystack_auth_code: {
        type: String,
        required: [true, 'Card must have a paystack auth code']
    },
    
    card_type: {
        type: String,
        required: [true, 'Card must have a card type']
    },
    
    last_4: {
        type: String,
        required: [true, 'Card must have a last-4 digit']
    },
    
    exp_month: {
        type: String,
        required: [true, 'Card must have an expiry month']
    },
    
    exp_year: {
        type: String,
        required: [true, 'Card must have an expiry year']
    },
    
    bank: {
        type: String,
        required: [true, 'Card must have a bank']
    },

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
