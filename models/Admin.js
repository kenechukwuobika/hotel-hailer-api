const mongoose = require('mongoose');
const User = require('./User');

const Admin = User.discriminator(
    'admin',
    new mongoose.Schema({
        employeeNo: {
            type: Number,
            required: [true, 'Please enter your employee Number'],
        },
    })
);

module.exports = Admin;
