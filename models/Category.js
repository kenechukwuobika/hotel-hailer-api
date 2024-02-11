const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter a name'],
            unique: true,
        },

        description: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

categorySchema.virtual('properties', {
    ref: 'Property',
    foreignField: 'category',
    localField: '_id',
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
