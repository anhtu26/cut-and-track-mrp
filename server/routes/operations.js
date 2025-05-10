const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

/**
 * @route GET /api/operations
 * @desc Get all operations
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters
    const { search, sort_by, sort_order } = req.query;
    
    // Build query
    let query = 'SELECT * FROM operations WHERE 1=1';
    const queryParams = [];
    
    // Add search filter if provided
    if (search) {
      query += ' AND (name ILIKE $1 OR description ILIKE $1)';
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting
    query += ` ORDER BY ${sort_by || 'name'} ${sort_order || 'ASC'}`;
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/operations/:id
 * @desc Get an operation by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM operations WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching operation ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/operations
 * @desc Create a new operation
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      standard_time,
      machine_id,
      setup_time,
      status,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Operation name is required' });
    }
    
    // Check if operation with the same name already exists
    const checkResult = await db.query(
      'SELECT * FROM operations WHERE name = $1',
      [name]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Operation with this name already exists' });
    }
    
    // Insert new operation
    const result = await db.query(
      `INSERT INTO operations
       (name, description, standard_time, machine_id, setup_time, status, metadata, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        name,
        description || '',
        standard_time || 0,
        machine_id || null,
        setup_time || 0,
        status || 'active',
        metadata || {},
        req.user.id
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating operation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/operations/:id
 * @desc Update an operation
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      standard_time,
      machine_id,
      setup_time,
      status,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Operation name is required' });
    }
    
    // Check if operation exists
    const checkResult = await db.query(
      'SELECT * FROM operations WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    
    // Check if the updated name is already used by another operation
    const nameCheckResult = await db.query(
      'SELECT * FROM operations WHERE name = $1 AND id != $2',
      [name, id]
    );
    
    if (nameCheckResult.rows.length > 0) {
      return res.status(400).json({ message: 'Another operation with this name already exists' });
    }
    
    // Update operation
    const result = await db.query(
      `UPDATE operations
       SET name = $1,
           description = $2,
           standard_time = $3,
           machine_id = $4,
           setup_time = $5,
           status = $6,
           metadata = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name,
        description || '',
        standard_time || 0,
        machine_id || null,
        setup_time || 0,
        status || 'active',
        metadata || {},
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating operation ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/operations/:id
 * @desc Delete an operation
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if operation exists
    const checkResult = await db.query(
      'SELECT * FROM operations WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    
    // Check if operation is used in any routing
    const routingCheck = await db.query(
      'SELECT COUNT(*) FROM routing_steps WHERE operation_id = $1',
      [id]
    );
    
    if (parseInt(routingCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete operation that is used in routing. Archive it instead.' 
      });
    }
    
    // Delete operation
    await db.query('DELETE FROM operations WHERE id = $1', [id]);
    
    res.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error(`Error deleting operation ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/operations/machine/:machineId
 * @desc Get operations by machine ID
 * @access Private
 */
router.get('/machine/:machineId', authenticateToken, async (req, res) => {
  try {
    const { machineId } = req.params;
    
    const result = await db.query(
      'SELECT * FROM operations WHERE machine_id = $1 ORDER BY name ASC',
      [machineId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching operations for machine ${req.params.machineId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
