const crypto = require('crypto');
const sharp = require('sharp');
const multer = require('multer');
const Property = require('../models/Property');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(!file.mimetype.startsWith('image')){
    cb(new AppException(400, 'please upload a valid image file'), false)
  }

  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.resizedPhoto = (req, res, next) => {
  try {
    console.log(req.files)
    if(req.files && Object.keys(req.files).length !== 0){
        // if(req.files.coverImage){
        //     const coverImage = req.files.coverImage[0];
        //     const mimeType = coverImage.mimetype.split('/')[1];
        //     coverImage.filename = `product-${req.body.vendor}-${Date.now()}.${mimeType}`;
        //     sharp(coverImage.buffer)
        //     .resize(500, 500)
        //     .toFormat('jpeg')
        //     .jpeg({ quality: 90 })
        //     .toFile(`public/images/products/${coverImage.filename}`);
      
        // }
    
        if(req.files.images){
            req.files.images.forEach((file, index) => {
            //   file.filename = `product-${req.body.vendor}-${Date.now()}.jpeg`;
            const mimeType = file.mimetype.split('/')[1];  
            file.filename = `${crypto.randomBytes(32).toString('hex')}.${mimeType}`;
            
              sharp(file.buffer)
              .resize(500, 500)
              .toFormat('jpeg')
              .jpeg({ quality: 90 })
              .toFile(`public/images/products/${file.filename}`);
            })
        
        }
      }
  } catch (error) {
      console.log(error)
  }

  return next();
}

exports.uploadPhotos = upload.fields([
  {name:'coverImage', maxCount: 1 },
  {name:'images', maxCount: 5 }
]);

exports.setPropertyId = (type = 'filter') => catchAsync(async (req, res, next) => {
    console.log(req.params.id)
    if(req.user && req.user.role === 'vendor'){
        if(type === 'body'){
            req.body.vendor = req.user._id;
        }
        else{
            const filter = req.filter ? {...req.filter} : {};
            req.filter = { ...filter, property: req.params.id };
        }
    }
    next();
})

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
          location: 1,
          state: 1,
          coverImage: 1,
          unit: 'km'
        }
      }
    ]);
  
    res.status(200).json({
        status: 'success',
        data: distances
    });
});