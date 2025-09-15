const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();


router.put('signup' , [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail()
    .custom((value, { req }) => { //custom validator to check if user email already exists, custom function takes value of the field and an object with req property which is the request object
        return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-Mail address already exists!'); //rejecting the promise will trigger the error handling of express-validator and error will be added to the errors array
            }
        })
    }),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authController.signup);


router.post('/login', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail(),
    body('password').trim().isLength({ min: 5 })
], authController.login);


module.exports = router;