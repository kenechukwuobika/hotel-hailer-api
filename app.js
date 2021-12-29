const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoute = require('./routes/authRoute');
const meRoute = require('./routes/meRoute');
const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');
const reviewRoute = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const tagRoute = require('./routes/tagRoute');
const categoryRoute = require('./routes/categoryRoute');
const amenityRoute = require('./routes/amenityRoute');
const transactionRoute = require('./routes/transactionRoute');
const walletRoute = require('./routes/walletRoute');
const AppException = require('./utilities/AppException');
const globalErrorHandler = require('./controllers/errorController');
const authController = require('./controllers/authController');

const app = express();

app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));

app.use(cors());
app.options('*', cors());

app.use('/api/v1/me', meRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/properties', propertyRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/tags', tagRoute);
app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/amenities', amenityRoute);
app.use('/api/v1/transactions', transactionRoute);
app.use('/api/v1/wallets', walletRoute);

app.all('*', ( req, res, next) => {
    next(new AppException(404, `Route not found`))
});

app.use(globalErrorHandler);

module.exports = app;