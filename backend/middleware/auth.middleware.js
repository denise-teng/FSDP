import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';  // Assuming you have a User model

// Middleware to protect routes by verifying JWT token
export const protectRoute = async (req, res, next) => {
    try {
        // Extract the token from cookies or headers
        const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ message: 'Unauthorized - No access token found' });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the userId from the decoded token
        const user = await User.findById(decoded.userId).select('-password');  // Exclude password

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user info to req object
        req.user = user;            // full user object
        req.userId = user._id;      // user ID
        req.userRole = user.role;   // user role  <-- NEW

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token expired' });
        }
        console.log('Error in protectRoute middleware', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Middleware to ensure that the user is an admin
export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }
};
