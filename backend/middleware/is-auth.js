const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization'); //get the Authorization header from the request
    if (!authHeader) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401; //401 status code for unauthorized
        throw error;
    }

    const token = authHeader.split(' ')[1]; //Authorization: Bearer token
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'anothersupersecretkey'); //should be same as the one used to sign the token
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId; //store the userId in the request object for further use in the next middleware or route handler
    next();
};