const mongoose = require('mongoose');

const perkSchema = new mongoose.Schema({
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

perkSchema.virtual('properties', {
    ref: 'Property',
    foreignField: 'category',
    localField: '_id'
});

const Perk = mongoose.model('Perk', perkSchema);

module.exports = Perk;
