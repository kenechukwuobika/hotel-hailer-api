const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Booking must have a property!']
  },
  
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Booking must belong to a customer!']
  },

  paymentInterval: {
    type: String,
    required: [true, 'Booking must have a total amount!'],
    enum: {
        values: ['hourly', 'weekly', 'bi-weekly', 'monthly', 'daily', 'full'],
        message: 'paymentInterval can only either be hourly, daily, weekly, bi-weekly, monthly, or full'
    }
  },
  
  amountOnInterval: {
    type: Number,
    required: [true, 'Booking must have an amount on interval!']
  },

  totalAmount: {
    type: Number,
    required: [true, 'Booking must have a total amount!']
  },

  totalAmountPaid: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    required: [true, 'Booking must have a status!'],
    default: 'awaiting_payment',
    enum: {
        values: ['awaiting_payment', 'cancelled', 'failed', 'in_progress', 'hold', 'completed'],
        message: 'booking status can only either be awaiting_payment, cancelled, failed, in_progress, hold or completed'
    }
  },

  reference: String,

  description: {
    type: String,
    required: [true, 'Booking must have a description!'],
  },

  lastPaymentDate: {
    type: Date,
  },
  
  nextPaymentDate: {
    type: Date,
  },

  lastPaymentAmount: Number,
  
  nextPaymentAmount: Number,

  lodgeStartDate: {
    type: Date,
    required: [true, 'Booking must have a lodge start date!'],
  },

  lodgeEndDate: {
    type: Date,
    required: [true, 'Booking must have a lodge end date!'],
  },

  // lodgeRemainingDays: {
  //   type: Number,
  //   required: [true, 'Booking must have a lodge remaining days!'],
  //   default: 2
  // },

  history: [Array],

  createdAt: {
    type: Date,
    default: Date.now()
  },

  updatedAt: {
    type: Date,
    default: Date.now()
  },

  deletedAt: Date,
  
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookingSchema.pre('save', async function(next){
  if( (this.totalAmount - this.totalAmountPaid) < this.amountOnInterval ){
    this.nextPaymentAmount = (this.totalAmount - this.totalAmountPaid);
  }else{
    this.nextPaymentAmount = this.amountOnInterval;
  }
  
  next();
});

bookingSchema.virtual('lodgeRemainingDays').get(function() {
  const currentDate = Date.now();
  const lodgeStartDate = new Date(this.lodgeStartDate)
  const lodgeEndDate = new Date(this.lodgeEndDate)

  if(currentDate < lodgeStartDate){
    const diffTime = Math.abs(this.lodgeEndDate - this.lodgeStartDate);
    const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDate;
  }
  else if(currentDate > lodgeEndDate){
    return 0;
  }
  
  const diffTime = Math.abs(this.lodgeEndDate - currentDate);
  const diffDate = diffTime ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  return diffDate;
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
