const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect private routes
// Verifies the JWT token from the Authorization header
// If valid, attaches the user object to req.user for use in controllers
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the JWT secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user to the request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware or controller
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };