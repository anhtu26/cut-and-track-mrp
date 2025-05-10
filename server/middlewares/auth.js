const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to validate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  // Check if header exists and has a token
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Extract token (Bearer token format)
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  
  // Verify token
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-dev-only', (err, user) => {
    if (err) {
      // Handle different JWT errors
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    // Add user info to request object
    req.user = user;
    next();
  });
}

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the resource
 * @returns {Function} Middleware function
 */
function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    // Must run after authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
