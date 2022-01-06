const mongoose = require('mongoose');
const Property = require('./Property');

const reviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'text can not be empty!'],
      lowercase: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have a rating.']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    property: {
      type: mongoose.Schema.ObjectId,
      ref: 'Property',
      required: [true, 'Review must belong to a property.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'userName image'
  }).populate({
    path: 'property',
    select: 'name coverImage'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(propertyId) {
  
  const stats = await this.aggregate([
    {
      $match: { property: propertyId }
    },
    {
      $group: {
        _id: '$property',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  console.log(stats);

  if (stats.length > 0) {
    console.log('above');
    await Property.findByIdAndUpdate(propertyId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    console.log('below');
    await Property.findByIdAndUpdate(propertyId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};

reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.property);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.property);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
