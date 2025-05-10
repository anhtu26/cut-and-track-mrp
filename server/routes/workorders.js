const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

/**
 * @route GET /api/workorders
 * @desc Get all work orders with optional filters
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Extract query parameters
    const { search, status, customer_id, part_id, sort_by, sort_order, limit, offset } = req.query;
    
    // Build base query
    let query = `
      SELECT wo.*, 
             c.name as customer_name,
             p.name as part_name,
             p.part_number
      FROM work_orders wo
      LEFT JOIN parts p ON wo.part_id = p.id
      LEFT JOIN customers c ON wo.customer_id = c.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filters
    if (search) {
      query += ` AND (wo.order_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND wo.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (customer_id) {
      query += ` AND wo.customer_id = $${paramIndex}`;
      queryParams.push(customer_id);
      paramIndex++;
    }
    
    if (part_id) {
      query += ` AND wo.part_id = $${paramIndex}`;
      queryParams.push(part_id);
      paramIndex++;
    }
    
    // Add sorting
    query += ` ORDER BY ${sort_by || 'wo.created_at'} ${sort_order || 'DESC'}`;
    
    // Add pagination
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(limit));
      paramIndex++;
      
      if (offset) {
        query += ` OFFSET $${paramIndex}`;
        queryParams.push(parseInt(offset));
      }
    }
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM work_orders wo WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND wo.order_number ILIKE $1';
      countParams.push(`%${search}%`);
    }
    
    if (status) {
      countQuery += ` AND wo.status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    
    if (customer_id) {
      countQuery += ` AND wo.customer_id = $${countParams.length + 1}`;
      countParams.push(customer_id);
    }
    
    if (part_id) {
      countQuery += ` AND wo.part_id = $${countParams.length + 1}`;
      countParams.push(part_id);
    }
    
    const countResult = await db.query(countQuery, countParams);
    
    res.json({
      data: result.rows,
      count: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/workorders/:id
 * @desc Get a work order by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get work order with related data
    const result = await db.query(
      `SELECT wo.*, 
              c.name as customer_name,
              p.name as part_name,
              p.part_number
       FROM work_orders wo
       LEFT JOIN parts p ON wo.part_id = p.id
       LEFT JOIN customers c ON wo.customer_id = c.id
       WHERE wo.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Get operations for this work order
    const operationsResult = await db.query(
      `SELECT * FROM operations
       WHERE work_order_id = $1
       ORDER BY sequence_number ASC`,
      [id]
    );
    
    // Combine work order with its operations
    const workOrder = {
      ...result.rows[0],
      operations: operationsResult.rows
    };
    
    res.json(workOrder);
  } catch (error) {
    console.error(`Error fetching work order ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/workorders
 * @desc Create a new work order
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      order_number,
      part_id,
      customer_id,
      quantity,
      due_date,
      priority,
      status,
      notes,
      metadata,
      operations
    } = req.body;
    
    // Validate required fields
    if (!order_number || !part_id) {
      return res.status(400).json({ message: 'Order number and part ID are required' });
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert work order
      const workOrderResult = await client.query(
        `INSERT INTO work_orders
         (order_number, part_id, customer_id, quantity, due_date, priority, status, notes, metadata, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          order_number,
          part_id,
          customer_id,
          quantity || 1,
          due_date || null,
          priority || 'normal',
          status || 'pending',
          notes || '',
          metadata || {},
          req.user.id
        ]
      );
      
      const workOrder = workOrderResult.rows[0];
      
      // Insert operations if provided
      if (operations && operations.length > 0) {
        for (let i = 0; i < operations.length; i++) {
          const op = operations[i];
          await client.query(
            `INSERT INTO operations
             (work_order_id, name, description, sequence_number, status, estimated_time, metadata, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [
              workOrder.id,
              op.name,
              op.description || '',
              op.sequence_number || i + 1,
              op.status || 'pending',
              op.estimated_time || 0,
              op.metadata || {},
              req.user.id
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Get the complete work order with operations
      const result = await db.query(
        `SELECT wo.*, 
                c.name as customer_name,
                p.name as part_name,
                p.part_number
         FROM work_orders wo
         LEFT JOIN parts p ON wo.part_id = p.id
         LEFT JOIN customers c ON wo.customer_id = c.id
         WHERE wo.id = $1`,
        [workOrder.id]
      );
      
      const operationsResult = await db.query(
        `SELECT * FROM operations
         WHERE work_order_id = $1
         ORDER BY sequence_number ASC`,
        [workOrder.id]
      );
      
      res.status(201).json({
        ...result.rows[0],
        operations: operationsResult.rows
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/workorders/:id
 * @desc Update a work order
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      order_number,
      part_id,
      customer_id,
      quantity,
      due_date,
      priority,
      status,
      notes,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!order_number || !part_id) {
      return res.status(400).json({ message: 'Order number and part ID are required' });
    }
    
    // Check if work order exists
    const checkResult = await db.query(
      'SELECT * FROM work_orders WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Update work order
    const result = await db.query(
      `UPDATE work_orders
       SET order_number = $1,
           part_id = $2,
           customer_id = $3,
           quantity = $4,
           due_date = $5,
           priority = $6,
           status = $7,
           notes = $8,
           metadata = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        order_number,
        part_id,
        customer_id,
        quantity || 1,
        due_date || null,
        priority || 'normal',
        status || 'pending',
        notes || '',
        metadata || {},
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating work order ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/workorders/:id
 * @desc Delete a work order
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if work order exists
    const checkResult = await db.query(
      'SELECT * FROM work_orders WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Delete associated operations
      await client.query('DELETE FROM operations WHERE work_order_id = $1', [id]);
      
      // Delete the work order
      await client.query('DELETE FROM work_orders WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      res.json({ message: 'Work order deleted successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error deleting work order ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
