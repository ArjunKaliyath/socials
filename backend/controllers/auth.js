const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    //add validation and hashing later
    bcrypt.hash(password, 12) //12 is the number of salt rounds, higher the number more secure but slower
        .then(hashedPw => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPw
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500; //500 status code for server error
            }
            next(err);
        });
};


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401; //401 status code for unauthorized
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password); //compare the plain text password with the hashed password
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'anothersupersecretkey', //should be long and complex string and should be in env variable
                { expiresIn: '1h' } //token will expire in 1 hour
            );

            res.status(200).json({ token : token , userId: loadedUser._id.toString() });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

