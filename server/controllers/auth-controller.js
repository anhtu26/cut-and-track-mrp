/**
 * Authentication Controller
 * 
 * Handles authentication-related API endpoints including login,
 * logout, and user info retrieval.
 */

const { StatusCodes } = require('http-status-codes');
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const { generateToken } = require('../middlewares/auth-middleware');
const db = require('../db');

/**
 * Login a user with email and password
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`Login attempt for email: ${email}`);
  
  // Validate input
  if (!email || !password) {
    console.log('Login failed: Email and password are required');
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Email and password are required'
    });
  }
  
  try {
    // Find user by email
    console.log(`Querying database for user: ${email}`);
    const result = await db.query(
      'SELECT id, email, password_hash, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );
    
    console.log(`Query result rows: ${result.rows.length}`);
    const user = result.rows[0];
    
    // Check if user exists
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid email or password'
      });
    }
    
    console.log(`User found: ${user.email}, Role: ${user.role}`);
    
    // Verify password with argon2
    try {
      console.log('Verifying password with argon2...');
      const isPasswordValid = await argon2.verify(user.password_hash, password);
      
      if (!isPasswordValid) {
        console.log('Password verification failed');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'Invalid email or password'
        });
      }
      
      console.log('Password verification successful');
    } catch (err) {
      console.error('Password verification error:', err);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Return user data without password hash
    const { password_hash: _, ...userWithoutPassword } = user;
    
    // Format response for client
    return res.status(StatusCodes.OK).json({
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Authentication failed. Please try again later.'
    });
  }
};

/**
 * Logout a user
 */
exports.logout = async (req, res) => {
  // Note: For JWT authentication, there's no server-side logout
  // The client should remove the token
  
  // We could implement token blacklisting here if needed
  
  return res.status(StatusCodes.OK).json({
    message: 'Logout successful'
  });
};

/**
 * Get the current user's information
 */
exports.getCurrentUser = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Not authenticated'
    });
  }
  
  try {
    // Fetch latest user data from database
    const result = await db.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = result.rows[0];
    
    // Check if user exists
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User not found'
      });
    }
    
    // Format response
    return res.status(StatusCodes.OK).json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve user information'
    });
  }
};

/**
 * Register a new user (admin function)
 */
exports.registerUser = async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  
  // Validate input
  if (!email || !password || !role) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Email, password, and role are required'
    });
  }
  
  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'User with this email already exists'
      });
    }
    
    // Hash password with argon2
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,  // Most secure variant
      memoryCost: 2**16,      // 64 MiB memory usage
      timeCost: 3,            // 3 iterations
      parallelism: 1          // 1 thread
    });
    
    // Insert new user
    const result = await db.query(
      'INSERT INTO users (id, email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name',
      [uuidv4(), email, hashedPassword, role, firstName || null, lastName || null]
    );
    
    const newUser = result.rows[0];
    
    // Format response
    return res.status(StatusCodes.CREATED).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to register user'
    });
  }
};
