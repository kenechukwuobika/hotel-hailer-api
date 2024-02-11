const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, 'Please enter your user name'],
            lowercase: true,
            unique: true,
            minlength: [2, 'User name must be 2 characters or more'],
        },

        email: {
            type: String,
            required: [true, 'Please enter your email address'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },

        role: {
            type: String,
            required: [true, 'Please select a role'],
            default: 'customer',
            enum: {
                values: ['customer', 'vendor', 'admin'],
                message: 'Role can only either be customer, vendor or admin',
            },
        },

        firstName: {
            type: String,
            lowercase: true,
            minlength: [2, 'First name must be 2 characters or more'],
        },

        lastName: {
            type: String,
            lowercase: true,
            minlength: [2, 'Last name must be 2 characters or more'],
        },

        paystack_customer_id: String,

        paystack_auth_code: String,

        card_type: String,

        last_4: String,

        exp_month: String,

        exp_year: String,

        bank: String,

        phoneNumber: {
            type: Number,
        },

        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minlength: [8, 'Password must be 8 characters or more'],
            select: false,
        },

        // passwordConfirm: {
        //     type: String,
        //     required: [true, 'Please confirm your password'],
        //     validate: {
        //         validator: function(el) {
        //             return el === this.password
        //         },
        //         message: 'Passwords do not match'
        //     }
        // },

        passwordChangedAt: Date,

        passwordResetExpireToken: String,

        passwordResetExpiresAt: Date,

        image: {
            type: String,
            default:
                'https://hotelappartments.herokuapp.com/images/users/default.jpg',
        },

        slug: String,

        emailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerifiedToken: String,

        emailVerifiedat: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.slug = `${this.firstName}-${this.lastName}`;
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^findOneAnd/, async function (next) {
    try {
        this.us = await this.findOne();
        this.us.keiks = `${this.us.firstName}-${this.us.lastName}`;
        await this.us.save({
            validateBeforeSave: false,
        });
    } catch (error) {
        console.log(error);
    }
    next();
});

userSchema.methods.comparePasswords = async function (
    userPassword,
    dbPassword
) {
    const checked = await bcrypt.compare(userPassword, dbPassword);
    return checked;
};

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createEmailVerifyToken = function () {
    const emailVerifiedToken = crypto.randomBytes(32).toString('hex');

    this.emailVerifiedToken = crypto
        .createHash('sha256')
        .update(emailVerifiedToken)
        .digest('hex');

    return emailVerifiedToken;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(4).toString('hex');

    this.passwordResetExpireToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
