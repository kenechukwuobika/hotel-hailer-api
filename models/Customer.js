const mongoose = require('mongoose');
const User = require('./User');

const Customer = User.discriminator('customer',  
    new mongoose.Schema({
        paystack_customer_id: String,
        paystack_auth_code: String,
        card_type: String,
        last_4: String,
        exp_month: String,
        exp_year: String,
        bank: String,
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerifiedToken: {
            type: String,
            select: false
        },
        emailVerifiedat: {
            type: String,
            select: false
        }
    })
);

module.exports = Customer;