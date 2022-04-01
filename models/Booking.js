const mongoose = require('mongoose');
const { 
    AWAITING_PAYMENT,
    CANCELLED,
    FAILED,
    PAYMENT_IN_PROGRESS,
    PAYMENT_ON_HOLD,
    PAYMENT_COMPLETE,
    IN_PROGRESS,
    COMPLETE
} = require('../constants');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: [true, 'Booking must have a property!']
    },
  
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user!']
    },

    card: {
        type: mongoose.Schema.ObjectId,
        ref: 'Card'
    },

    paymentInterval: {
        type: String,
        required: [true, 'Booking must have a payment interval!'],
        enum: {
            values: ['hourly',  'daily', 'weekly', 'bi-weekly', 'monthly', 'full'],
            message: 'paymentInterval can only either be hourly, daily, weekly, bi-weekly, monthly, or full'
        },
        lowercase: true
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
            values: [AWAITING_PAYMENT, CANCELLED, FAILED, PAYMENT_IN_PROGRESS, PAYMENT_ON_HOLD, PAYMENT_COMPLETE, IN_PROGRESS, COMPLETE],
            message: `booking status can only either be ${AWAITING_PAYMENT}, ${CANCELLED}, ${FAILED}, ${PAYMENT_IN_PROGRESS}, ${PAYMENT_ON_HOLD}, ${PAYMENT_COMPLETE}, ${IN_PROGRESS}, ${COMPLETE}`
        },
        lowercase: true
    },

    reference: String,

    paymentVerified: {
        type: Boolean,
        required: [true, 'Booking must have a paymentVerified status!'],
        default: false
    },

    description: {
        type: String,
        lowercase: true
    },

    lastPaymentDate: Date,

    nextPaymentDate: Date,

    lastPaymentAmount: {
        type: Number,
        default: 0
    },

    nextPaymentAmount: {
        type: Number,
        default: 0
    },

    lodgeStartDate: {
        type: Date,
        required: [true, 'Booking must have a lodge start date!'],
    },

    lodgeEndDate: {
        type: Date,
        required: [true, 'Booking must have a lodge end date!'],
        validate: {
            validator: function(el) {
                if(this.lodgeStartDate){
                    return (el.getTime() > this.lodgeStartDate.getTime())
                }
            },
            message: 'Booking lodge end date should be at least one day ahead of the start date'
        }
    },

    // transactions: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Transaction'
    //     }
    // ],

    history: [{
        amount: Number,
        date: Date,
        status: {
            type: String,
            required: [true, 'Booking must have a status!'],
            enum: {
                values: ['failed', 'successful'],
                message: 'booking status can only either be failed or successful'
            },
            lowercase: true
        }
    }],

    failedAttempts: {
        type: Number,
        default: 0
    }

    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

    bookingSchema.pre('save', async function(next){
        if(this.paymentInterval !== 'full'){
            if( (this.totalAmount - this.totalAmountPaid) < this.amountOnInterval ){
                this.nextPaymentAmount = (this.totalAmount - this.totalAmountPaid);
            }else{
                this.nextPaymentAmount = this.amountOnInterval;
            }
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
