const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please enter a text'],
    unique: true
  },
  
  description: String
  
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
