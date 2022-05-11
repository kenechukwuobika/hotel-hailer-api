const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please enter a text']
  },
  
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  payload: {
    endpoint: {
        type: String,
        required: true
    },
    reference: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    message: String
  },

  status: {
    type: String,
    enum: {
      values: ['read', 'unread'],
      message: 'booking status can only either be read or unread'
    },
    default: 'unread'
  },
  
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
