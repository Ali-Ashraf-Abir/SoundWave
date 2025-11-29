// middleware/authMiddleware.js
const JWTUtils = require('../utils/jwtUtils');
const User = require('../models/User');
const ResponseHandler = require('../utils/response');

// Protect routes - Verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return ResponseHandler.error(
        res,
        401,
        'Not authorized to access this route'
      );
    }

    try {
      // Verify token
      const decoded = JWTUtils.verifyToken(token);

      // Check if user still exists
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return ResponseHandler.error(
          res,
          401,
          'User no longer exists'
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return ResponseHandler.error(
          res,
          401,
          'Account is deactivated'
        );
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return ResponseHandler.error(
        res,
        401,
        'Not authorized to access this route'
      );
    }
  } catch (error) {
    next(error);
  }
};

// Optional authentication - doesn't block if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = JWTUtils.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

