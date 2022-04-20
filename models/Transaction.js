const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

  amountPaid: {
    type: Number,
    default: 0
  },

  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: [true, 'Transaction must belong to a booking']
  },

  wallet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Wallet',
    required: [true, 'Transaction must belong to a wallet']
  },

  status: {
    type: String,
    required: [true, 'Transaction must have a status'],
    default: 'successful',
    enum: {
        values: ['successful', 'failed'],
        message: 'Transaction status can only either be successful or failed'
    }
  },
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
