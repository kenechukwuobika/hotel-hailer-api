const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Websocket = require('./services/Websocket');

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
const cardRoute = require('./routes/cardRoute');
const walletRoute = require('./routes/walletRoute');
const notificationRoute = require('./routes/notificationRoute');
const AppException = require('./utilities/AppException');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

const httpServer = require("http").createServer(app);
const io  = require('socket.io')(httpServer, {
    cors: {
      origin: '*',
    }
});
let ids = {};

io.on('connection', socket => {
    const webSocket = new Websocket(socket)
    const user = webSocket.verifyToken();
    if(user){
        const userSockets = app.get('userSockets') || {};
        ids = { ...userSockets, [socket.id]: { userID: user._id } };
        app.set('userSockets', ids)
        io.to(socket.id).emit('notifications', [socket.id])   
    }

    socket.on('disconnect', () => {
        const userSockets = app.get('userSockets') || {};
        delete(userSockets[socket.id])
        app.set('userSockets', userSockets)
        console.log(userSockets)
    })

});

app.use(express.static(path.join(__dirname, 'public')));
// app.set('socketio', io);
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cors());
app.options('*', cors());
app.set('trust proxy', true);

app.use('/api/v1/auth', authRoute(io));
app.use('/api/v1/me', meRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/properties', propertyRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/api/v1/tags', tagRoute);
app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/amenities', amenityRoute);
app.use('/api/v1/cards', cardRoute);
app.use('/api/v1/transactions', transactionRoute);
app.use('/api/v1/wallets', walletRoute);
app.use('/api/v1/notifications', notificationRoute);

app.all('*', ( req, res, next) => {
    next(new AppException(404, `Route not found`))
});

app.use(globalErrorHandler);

module.exports = httpServer;