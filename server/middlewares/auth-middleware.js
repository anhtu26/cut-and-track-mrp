/**
 * Authentication Middleware
 * 
 * Provides middleware functions for authenticating API requests
 * with JWT tokens for the local authentication system.
 */

const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret';

/**
 * Verify JWT authentication token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null if invalid
 */
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Middleware to authenticate requests with JWT
 * This adds the user to the request object if authenticated
 */
const authenticate = async (req, res, next) => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }
  
  // Extract and verify token
  const token = extractToken(authHeader);
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  // Verify token and set user
  const decoded = verifyToken(token);
  
  if (decoded) {
    req.user = decoded;
    req.token = token;
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * Middleware to require authentication
 * This will return 401 if the user is not authenticated
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: 'Authentication required'
    });
  }
  
  next();
};

/**
 * Middleware to require a specific role
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (roles) => {
  // Convert to array if string
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // First check if authenticated
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Authentication required'
      });
    }
    
    // Check if user has required role
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Generate a JWT token for a user
 * @param {object} user - User object to include in token
 * @param {object} options - JWT options
 * @returns {string} JWT token
 */
const generateToken = (user, options = {}) => {
  // Only include necessary user data
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  
  // Default expiration of 24 hours
  const defaultOptions = {
    expiresIn: '24h'
  };
  
  return jwt.sign(payload, JWT_SECRET, { ...defaultOptions, ...options });
};

module.exports = {
  authenticate,
  requireAuth,
  requireRole,
  generateToken,
  verifyToken
};
