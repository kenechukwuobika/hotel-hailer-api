const Property = require('../models/Property');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');

exports.getAllProperties = factory.getDocuments(Property);
exports.createProperty = factory.createDocument(Property);
exports.getProperty = factory.getDocument(Property);
exports.updateProperty = factory.updateDocument(Property);
exports.deleteProperty = factory.deleteDocument(Property);

exports.getDistances = catchAsync(async (req, res, next) => {
    const { lat, lng, unit } = req.query;
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          key: 'location',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1,
          unitPrice: 1,
          images:1,
          location: 1,
          state: 1
        }
      }
    ]);
  
    res.status(200).json({
        status: 'success',
        data: distances
    });
});