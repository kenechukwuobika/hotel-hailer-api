const sharp = require('sharp');
const multer = require('multer');

const User = require('../models/User');
const Customer = require('../models/Customer');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');
const Booking = require('../models/Booking');

exports.setVendorId = (type = 'filter') => catchAsync(async (req, res, next) => {
    if(req.user && req.user.role === 'vendor'){
        if(type === 'body'){
            req.body.vendor = req.user._id;
        }
        else if(type === 'filter'){
            const customFilter = req.customFilter ? {...req.customFilter} : {};
            req.customFilter = { ...customFilter, vendor: req.user._id };
        }
        else{
            req.params.id = req.user._id;
        }
    }
    next();
})

exports.setUserId = (type = 'filter') => catchAsync(async (req, res, next) => {
    if(req.user && req.user.role !== 'admin'){
        if(type === 'body'){
            req.body.user = req.user._id;
        }
        else if(type === 'filter'){
            const customFilter = req.customFilter ? {...req.customFilter} : {};
            req.customFilter = { ...customFilter, user: req.user._id };
        }
        else{
            req.params.id = req.user._id;
        }
    }
    next();
})

exports.getAllUsers = factory.getDocuments(User);
exports.createUser = factory.createDocument(User);
exports.getUser = factory.getDocument(User);
exports.updateUser = factory.updateDocument(User);
exports.deleteUser = factory.deleteDocument(User);

exports.getCustomers = factory.getDocuments(Customer);
exports.createCustomer = factory.createDocument(Customer);
exports.getCustomer = factory.getDocument(Customer);
exports.updateCustomer = factory.updateDocument(Customer);
exports.deleteCustomer = factory.deleteDocument(Customer);

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
  if(!req.file) return next();
  const mimeType = req.file.mimetype.split('/')[1];  
  req.file.filename = `user-${req.user.id}.${mimeType}`;
  sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/images/users/${req.file.filename}`);

  next(); 
}

// const upload = multer({ dest: 'public/images/users' });

exports.uploadPhoto = upload.single('image');

const filterObj = (object, ...options) => {
    const newObject = {};
    const objectKeys = Object.keys(object);
    options.forEach(option => {
        if(objectKeys.includes(option)){
            newObject[option] = object[option];
        }
    })
    return newObject;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password){
        console.log('You cannot update your password with this route')
        return next();
    }
    if(req.file) {
        req.body.image = `${req.protocol}://${req.get('host')}/images/users/${req.file.filename}`;
    }
    const filterdBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'phoneNumber', 'image')
    const user = await User.findByIdAndUpdate(req.user.id, filterdBody, {
        new: true,
        runValidators: true
    });

    const bookings = await Booking.find({
        user: user._id,
        status: 'in_progress'
    })

    if(bookings.length !== 0){
        return next(new AppException(401, 'You cannot update your profile if you have an active booking.'));
    }

    res.status(200).json({
        status: 'success',
        data: user,
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user._id).select('+password');
  
    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppException(401, 'Your current password is wrong.'));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
  
    res.status(200).json({
        status: "success",
        message: "Your password was updated sucessfully"
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.user.id)

    const bookings = await Booking.find({
        user: user._id,
        status: 'inprogress'
    })

    if(bookings){
        return next(new AppException(401, 'You cannot delete your profile if you have an active booking.'));
    }

    res.status(200).json({
        status: 'success',
        data: user,
    });
    next();
});

