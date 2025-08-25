// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided, authorization denied'
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Change from decoded.id to decoded.userId
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Token is not valid'
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
    
//     // Provide more specific error messages
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token has expired'
//       });
//     }
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token'
//       });
//     }
    
//     res.status(401).json({
//       success: false,
//       message: 'Token is not valid'
//     });
//   }
// };

// module.exports = auth;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token);
    console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token payload:', decoded);

    // Check if we have userId in the decoded payload
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token payload invalid - missing userId'
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', user ? user.email : 'None');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error details:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = auth;