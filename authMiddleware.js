const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the 'token' cookie
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
        // If no token, the user is not authenticated
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        // jwt.verify will throw an error if the token is invalid or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user payload (e.g., user ID) to the request object
        // This makes user information available in subsequent route handlers
        req.user = decoded;
        next(); // Proceed to the next middleware/route handler

    } catch (error) {
        // Handle token verification errors (e.g., invalid token, expired token)
        console.error('Token verification error:', error.message);
        return res.status(403).json({ message: 'Token is not valid or expired' });
    }
};

module.exports = { authMiddleware };