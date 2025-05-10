const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Get user from database
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Create JWT token (expires in 24 hours)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key-dev-only',
      { expiresIn: '24h' }
    );
    
    // Return token and user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user (Admin only operation)
 * @access Private/Admin
 */
router.post('/register', authenticateToken, authorizeRoles(['Administrator']), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Validate role
    const validRoles = ['Administrator', 'Manager', 'Staff', 'Operator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user already exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate UUID for new user
    const userId = uuidv4();
    
    // Create user
    const result = await db.query(
      `INSERT INTO users 
       (id, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, role, created_at`,
      [userId, email.toLowerCase(), hashedPassword, role]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/auth/users
 * @desc Get all users (Admin only)
 * @access Private/Admin
 */
router.get('/users', authenticateToken, authorizeRoles(['Administrator']), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/auth/users/:id
 * @desc Update user (Admin only)
 * @access Private/Admin
 */
router.put('/users/:id', authenticateToken, authorizeRoles(['Administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, password } = req.body;
    
    // Get the user to update
    const userCheck = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update query parts
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const queryParams = [];
    let paramIndex = 1;
    
    // Add email if provided
    if (email) {
      updateQuery += `, email = $${paramIndex}`;
      queryParams.push(email.toLowerCase());
      paramIndex++;
    }
    
    // Add role if provided
    if (role) {
      const validRoles = ['Administrator', 'Manager', 'Staff', 'Operator'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      updateQuery += `, role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }
    
    // Add password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = $${paramIndex}`;
      queryParams.push(hashedPassword);
      paramIndex++;
    }
    
    // Add WHERE clause and RETURNING
    updateQuery += ` WHERE id = $${paramIndex} RETURNING id, email, role, updated_at`;
    queryParams.push(id);
    
    // Execute update
    const result = await db.query(updateQuery, queryParams);
    
    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/auth/users/:id
 * @desc Delete user (Admin only)
 * @access Private/Admin
 */
router.delete('/users/:id', authenticateToken, authorizeRoles(['Administrator']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Make sure user exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting the current user
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Delete the user
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export router and authenticateToken for use in other files
module.exports = {
  router,
  authenticateToken
};
