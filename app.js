const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');
const reviewRoute = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const authRoute = require('./routes/authRoute');
const AppException = require('./utilities/AppException');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));

app.use(cors());
app.options('*', cors());

app.use('/api/v1/users', userRoute);
app.use('/api/v1/properties', propertyRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/bookings', bookingRoute);

app.all('*', ( req, res, next) => {
    next(new AppException(404, `Route not found`))
});

app.use(globalErrorHandler);

module.exports = app;