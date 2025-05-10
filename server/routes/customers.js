const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

/**
 * @route GET /api/customers
 * @desc Get all customers
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters
    const { search, sort_by, sort_order } = req.query;
    
    // Build query
    let query = 'SELECT * FROM customers WHERE 1=1';
    const queryParams = [];
    
    // Add search filter if provided
    if (search) {
      query += ' AND (name ILIKE $1 OR contact_email ILIKE $1)';
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting
    query += ` ORDER BY ${sort_by || 'name'} ${sort_order || 'ASC'}`;
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/customers/:id
 * @desc Get a customer by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/customers
 * @desc Create a new customer
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      notes,
      status,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    // Check if customer with the same name already exists
    const checkResult = await db.query(
      'SELECT * FROM customers WHERE name = $1',
      [name]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Customer with this name already exists' });
    }
    
    // Insert new customer
    const result = await db.query(
      `INSERT INTO customers
       (name, contact_name, contact_email, contact_phone, address, notes, status, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        name,
        contact_name || '',
        contact_email || '',
        contact_phone || '',
        address || '',
        notes || '',
        status || 'active',
        metadata || {},
        req.user.id
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/customers/:id
 * @desc Update a customer
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      notes,
      status,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }
    
    // Check if customer exists
    const checkResult = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if the updated name is already used by another customer
    const nameCheckResult = await db.query(
      'SELECT * FROM customers WHERE name = $1 AND id != $2',
      [name, id]
    );
    
    if (nameCheckResult.rows.length > 0) {
      return res.status(400).json({ message: 'Another customer with this name already exists' });
    }
    
    // Update customer
    const result = await db.query(
      `UPDATE customers
       SET name = $1,
           contact_name = $2,
           contact_email = $3,
           contact_phone = $4,
           address = $5,
           notes = $6,
           status = $7,
           metadata = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name,
        contact_name || '',
        contact_email || '',
        contact_phone || '',
        address || '',
        notes || '',
        status || 'active',
        metadata || {},
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/customers/:id
 * @desc Delete a customer
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists
    const checkResult = await db.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if customer has any related work orders
    const workOrderCheck = await db.query(
      'SELECT COUNT(*) FROM work_orders WHERE customer_id = $1',
      [id]
    );
    
    if (parseInt(workOrderCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete customer that has work orders. Archive it instead.' 
      });
    }
    
    // Check if customer has any related parts
    const partCheck = await db.query(
      'SELECT COUNT(*) FROM parts WHERE customer_id = $1',
      [id]
    );
    
    if (parseInt(partCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete customer that has parts. Archive it instead.' 
      });
    }
    
    // Delete customer
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(`Error deleting customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
