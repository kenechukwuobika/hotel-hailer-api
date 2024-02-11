const Notification = require('../models/Notification');

class Websocket {
    constructor(socket) {
        this.socket = socket;
        this.token = socket ? socket.request.headers.authorization : null;
    }

    init() {
        this.verifyToken();
    }

    verifyToken() {
        if (this.token) {
            console.log('connected to socket');
            return this.token;
        }

        return null;
    }

    getNotifcations() {
        this.socket.on('getNotifications', async (t) => {
            const notifications = await Notification.find({ user: t._id });
            this.socket.emit('notifications', notifications);
        });
    }

    createNotifcation() {
        this.socket.on('createNotifcation', async (data) => {
            const notification = await Notification.create(data);
            this.socket.emit('notification', notification);
        });
    }
}

module.exports = Websocket;
