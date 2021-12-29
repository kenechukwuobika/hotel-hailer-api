const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    unique: true
  },
  
  description: String
  
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Perk = mongoose.model('Tag', tagSchema);

module.exports = Perk;
