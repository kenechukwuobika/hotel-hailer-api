const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    firstName: {
        type: String,
        lowercase: true,
        minlength: [2, 'First name must be 2 characters or more'],
    },

    lastName: {
        type: String,
        lowercase: true,
        minlength: [2, 'Last name must be 2 characters or more'],
    },

    paystack_customer_id: String,
    
    paystack_auth_code: String,
    
    card_type: String,
    
    last_4: String,
    
    exp_month: String,
    
    exp_year: String,
    
    bank: String,

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
