const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    unique: true
  },

  icon: {
    type: String,
    required: [true, 'Please provide an icon path']
  }
  
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

AmenitySchema.virtual('properties', {
    ref: 'Property',
    foreignField: 'Amenities',
    localField: '_id'
});

const Perk = mongoose.model('Perk', AmenitySchema);

module.exports = Perk;
