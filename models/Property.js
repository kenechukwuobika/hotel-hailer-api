const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name of your property'],
        lowercase: true,
        minlength: [2, 'property name must be 2 characters or more'],
    },

    unitPrice: {
        type: Number,
        required: [true, 'Please enter unit price'],
    },

    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    ratingsAverage: {
        type: Number,
        default: 3.8,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
      },

      ratingsQuantity: {
        type: Number,
        default: 0
      },

    numberOfRooms: {
        type: Number,
        required: [true, 'Please enter the number of rooms'],
    },

    carPark: {
        type: String,
        required: [true, 'Please select a car park option'],
        enum: {
            values: ['true', 'false'],
            message: 'car park option can only either be true or false'
        }
    },

    carParkCapacity: {
        type: Number,
        required: [true, 'Please enter car park capacity'],
    },

    compoundSize: {
        type: String,
        required: [true, 'Please enter compound size'],
    },

    location: {
        type: String,
        required: [true, 'Please enter location'],
    },

    coverPhoto: {
        type: String,
        required: [true, 'Please upload a cover photo'],
    },

    photos: [String],

    videos: [String],

    shortDesc: {
        type: String,
        required: [true, 'Please enter a short description'],
    },

    type: {
        type: String,
        required: [true, 'Please select a property type'],
    },

    perks: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Perk'
        }
    ],

    status: {
        type: String,
        required: [true, 'Please enter property status'],
        enum: {
            values: ['featured', 'published', 'draft'],
            message: 'property status can only either be featured, published or draft'
        }
    },

    distanceToAirport: {
        type: String,
        required: [true, 'Please enter your distance to airport'],
    },

    distanceToCityCentre: {
        type: String,
        required: [true, 'Please enter your distance to city centre'],
    },

    amenities: {
        type: String,
        required: [true, 'Please enter amenities'],
    },

    slug: String,

    createdAt:{
        type: Date,
        default: Date.now()
    },

    updatedAt:{
        type: Date,
        default: Date.now()
    },

    deletedAt: Date
});


const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

