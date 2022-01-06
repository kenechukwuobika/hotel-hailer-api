const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name of the property'],
        lowercase: true,
        minlength: [2, 'property name must be 2 characters or more'],
    },

    unitPrice: {
        type: Number,
        required: [true, 'Please enter unit price'],
    },

    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },

    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
    },

    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be above 0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },

    ratingsQuantity: {
        type: Number,
        default: 0
    },

    location: {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: {
            type: Array,
            validate: {
                validator: function(val) {
                    return val.length !== 0 ? true : false;
                },
                message: 'Please enter property coordinates'
            }
        }
    },

    city: {
        type: String,
        required: [true, 'Please enter city'],
        lowercase: true
    },

    state: {
        type: String,
        required: [true, 'Please enter state'],
        lowercase: true
    },

    address: {
        type: String,
        required: [true, 'Please enter address'],
        lowercase: true
    },

    coverImage: {
        type: String,
        required: [true, 'Please upload a cover image'],
    },

    images: [String],

    videos: [String],

    shortDesc: {
        type: String,
        required: [true, 'Please enter a short description'],
    },

    amenities: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Amenity'
        }
    ],

    status: {
        type: String,
        required: [true, 'Please enter property status'],
        enum: {
            values: ['published', 'draft'],
            message: 'property status can only either be published or draft'
        },
        lowercase: true,
        default: 'draft'
    },

    slug: String,
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

propertySchema.index({ location: '2dsphere' });


const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

