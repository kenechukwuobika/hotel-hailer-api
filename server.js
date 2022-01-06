const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bookingController = require('./controllers/bookingController');


dotenv.config({ path: './config.env' });

let db = '';

if(process.env.NODE_ENV === 'production'){
    db = process.env.ONLINE_DATABASE;
    db = process.env.ONLINE_DATABASE.replace('<password>',
    process.env.DATABASE_PASSWORD);
}else{
    db = process.env.LOCAL_DATABASE;
}

mongoose.connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('database connection successful')
    // bookingController.schedule();
}).catch(error => {
    console.log(error)
});

app.listen(process.env.PORT || 3000, () => {
    process.env.NODE_ENV='development'
    console.log(process.env.NODE_ENV)
    console.log(`listening to server on port ${process.env.PORT}`);
})