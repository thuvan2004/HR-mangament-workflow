const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Token missing.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_flowwise_access_token_key_2026_jwt_token');

    // Populate user and attach to req
    req.user = await User.findById(decoded.id).populate('department');
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User matching token not found.' });
    }

    if (req.user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is suspended or inactive.' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'JWT_EXPIRED', detail: 'Token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Invalid token.' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
