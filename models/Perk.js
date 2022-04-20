const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    unique: true
  },
  
  description: String,
  
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

amenitySchema.virtual('properties', {
    ref: 'Property',
    foreignField: 'category',
    localField: '_id'
});

const Amenity = mongoose.model('Amenity', amenitySchema);

module.exports = Amenity;
