const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const catchAsync = require('../utilities/catchAsync');
const AppException = require('../utilities/AppException');
const Email = require('./emailController');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;
  
    res.status(statusCode).json({
      status: 'success',
      token,
      data: user
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });

    if(newUser.role === 'vendor'){
      await Wallet.create({
        vendor: newUser._id
      })
    }
  
    const url = `${req.protocol}://${req.get('host')}/me`;
    const email = new Email(newUser, url);
    // await email.sendWelcome();
  
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, userName, password } = req.body;

    // Check if user exists && password is correct
    let filter = {};

    if(email){
      filter = { email }
    }

    if(userName){
      filter = { userName }
    }

    // Check if email or username and password exist
    if (!filter || !password) {
      return next(new AppException(400, 'Please provide valid credentails!'));
    }
    
    const user = await User.findOne(filter).select('+password');
  
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppException(401, 'Incorrect login credentails'));
    }

    //check if user email is verified
    // if($user->)
  
    // If everything is okay, send token to client
    createSendToken(user, 200, res);
});
  

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new AppException(401, 'You are not logged in! Please log in to get access.')
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppException(401, 'The user associated with this token does no longer exist.')
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppException(401, 'You recently changed password! Please log in again.')
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppException(403, 'You do not have permission to perform this action')
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
	  return next(new AppException(404, 'There is no user with email address.'));
	}
  
	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });
  
	// 3) Send it to user's email
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  
	try {
	  const email = new Email(user, resetURL);
	  await email.sendReset();
	  res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
	  });
	} catch (err) {
    console.log(err)
	  user.passwordResetToken = undefined;
	  user.passwordResetExpires = undefined;
	  await user.save({ validateBeforeSave: false });
  
	  return next(
		new AppException(500, 'There was an error sending the email. Try again later!'));
	}
});
  
exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetExpireToken: hashedToken,
		passwordResetExpiresAt: { $gt: Date.now() }
	});

	// 2) If token has not expired, and there is user, set the new password
	if (!user) {
		return next(new AppException(400, 'Token is invalid or has expired'));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetExpireToken = undefined;
	user.passwordResetExpiresAt = undefined;
	await user.save();

	// 3) Update changedPasswordAt property for the user
	// 4) Log the user in, send JWT
	createSendToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		emailVerifiedToken: hashedToken,
	});

	// 2) If token has not expired, and there is user, set the new password
	if (!user) {
		return next(new AppException(400, 'Token is invalid or has expired'));
	}
	user.emailVerifiedToken = undefined;
	user.emailVerifiedat = Date.now();
	user.emailVerified = true;
	await user.save();

	createSendToken(user, 200, res);
});