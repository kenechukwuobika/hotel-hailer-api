const sharp = require('sharp');
const multer = require('multer');

const User = require('../models/User');
const Customer = require('../models/Customer');
const factory = require('./factory');
const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');

exports.setOwnerIds = catchAsync(async (req, res, next) => {
    req.body.owner = req.user._id;
    req.filter = { owner: req.user._id };
    req.params.id = req.user._id;
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
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  
  sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/img/users/${req.file.filename}`);

  next(); 
}

// const upload = multer({ dest: 'public/img/users' });

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
    const filterdBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'phoneNumber', 'image')
    const user = await User.findByIdAndUpdate(req.user.id, filterdBody, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        status: 'success',
        data: user,
    });
    next();
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
        message: "User password updated sucessfully"
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.user.id)

    res.status(200).json({
        status: 'success',
        data: user,
    });
    next();
});

