const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

/**
 * @route GET /api/parts
 * @desc Get all parts with optional filters
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { search, status, customer_id, sort_by, sort_order, limit, offset } = req.query;
    
    // Build base query
    let query = `
      SELECT p.*, c.name as customer_name
      FROM parts p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filters if provided
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.part_number ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND p.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (customer_id) {
      query += ` AND p.customer_id = $${paramIndex}`;
      queryParams.push(customer_id);
      paramIndex++;
    }
    
    // Add sorting
    query += ` ORDER BY ${sort_by || 'p.created_at'} ${sort_order || 'DESC'}`;
    
    // Add pagination
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(limit));
      paramIndex++;
      
      if (offset) {
        query += ` OFFSET $${paramIndex}`;
        queryParams.push(parseInt(offset));
        paramIndex++;
      }
    }
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM parts p
      WHERE 1=1
      ${search ? ` AND (p.name ILIKE $1 OR p.part_number ILIKE $1)` : ''}
      ${status ? ` AND p.status = $${search ? 2 : 1}` : ''}
      ${customer_id ? ` AND p.customer_id = $${(search ? 1 : 0) + (status ? 1 : 0) + 1}` : ''}
    `;
    
    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (status) countParams.push(status);
    if (customer_id) countParams.push(customer_id);
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/parts/:id
 * @desc Get a part by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get part details
    const result = await db.query(
      `SELECT p.*, c.name as customer_name
       FROM parts p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching part ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/parts
 * @desc Create a new part
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      part_number,
      description,
      customer_id,
      material,
      status,
      notes,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name || !part_number) {
      return res.status(400).json({ message: 'Name and part number are required' });
    }
    
    // Insert new part
    const result = await db.query(
      `INSERT INTO parts
       (name, part_number, description, customer_id, material, status, notes, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        name,
        part_number,
        description || '',
        customer_id,
        material || '',
        status || 'active',
        notes || '',
        metadata || {},
        req.user.id
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/parts/:id
 * @desc Update a part
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      part_number,
      description,
      customer_id,
      material,
      status,
      notes,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name || !part_number) {
      return res.status(400).json({ message: 'Name and part number are required' });
    }
    
    // Check if part exists
    const checkResult = await db.query(
      'SELECT * FROM parts WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    // Update part
    const result = await db.query(
      `UPDATE parts
       SET name = $1,
           part_number = $2,
           description = $3,
           customer_id = $4,
           material = $5,
           status = $6,
           notes = $7,
           metadata = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name,
        part_number,
        description || '',
        customer_id,
        material || '',
        status || 'active',
        notes || '',
        metadata || {},
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating part ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/parts/:id
 * @desc Delete a part
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if part exists
    const checkResult = await db.query(
      'SELECT * FROM parts WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    // Check if part is used in work orders
    const workOrderCheck = await db.query(
      'SELECT COUNT(*) FROM work_orders WHERE part_id = $1',
      [id]
    );
    
    if (parseInt(workOrderCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete part that is used in work orders. Archive it instead.' 
      });
    }
    
    // Delete part
    await db.query('DELETE FROM parts WHERE id = $1', [id]);
    
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    console.error(`Error deleting part ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
