const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true); //cb is a callback function. first argument is for error handling. if we pass null means no error and second argument is true or false to accept or reject the file
    } else {
        cb(null, false);
    }
}

app.use('/images', express.static(path.join(__dirname, 'images'))); //making the images folder publicly accessible for incoming requests to /images route
//this allows us to access the images folder directly from the browser

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')); //the field name should be same as the one used in the frontend to send the file
app.use(bodyParser.json()); // application/json //body parser which will create a body property on the request object req.body



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


const MONGODB_URI = 'mongodb+srv://arjundpfc:K6o6rylxEYik1kWl@cluster0.kitwcix.mongodb.net/socials?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then((result) => {
        const server = app.listen(8080);
        const io = require('./socket.io').init(server);  //we are exporting the io object from socket.js file and initializing it with the server object
        //we use this io object to manage web socket connections and send and receive events
    })
    .catch((err) => {
        console.log(err);
    });

// app.listen(8080);