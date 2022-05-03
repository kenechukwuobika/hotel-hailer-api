const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Wallet can not be empty!'],
      default: 0
    },

    totalAmountEarned: {
      type: Number,
      required: [true, 'Total Amount Earned can not be empty!'],
      default: 0
    },
    
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Wallet must belong to a vendor']
    },

    transactions: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Transaction'
        }
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
