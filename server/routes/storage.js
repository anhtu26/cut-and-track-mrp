const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get document type from request
    const docType = req.body.docType || 'general';
    
    // Set destination path based on document type
    let dir;
    switch(docType) {
      case 'part':
        dir = path.join(__dirname, '../../local/storage/documents/parts');
        break;
      case 'operation':
        dir = path.join(__dirname, '../../local/storage/documents/operations');
        break;
      case 'workorder':
        dir = path.join(__dirname, '../../local/storage/documents/workorders');
        break;
      default:
        dir = path.join(__dirname, '../../local/storage/documents');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Sanitize original filename
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Create unique filename: uuid + original extension
    const fileExt = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExt}`;
    
    cb(null, fileName);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/dxf',
    'application/step',
    'application/iges',
    'application/octet-stream', // For CAD files that might not have a specific MIME type
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Configure upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  }
});

/**
 * @route POST /api/storage/upload
 * @desc Upload a file
 * @access Private
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get document metadata
    const docType = req.body.docType || 'general';
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    const parentId = metadata.parentId || null;
    
    // Create the public URL for the file
    const relativePath = path.relative(
      path.join(__dirname, '../../local/storage'),
      file.path
    ).replace(/\\/g, '/');
    
    const publicUrl = `/storage/${relativePath}`;
    
    // Save document record to database
    const result = await db.query(
      `INSERT INTO documents
       (name, type, url, metadata, parent_id, parent_type, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, name, type, url, metadata, parent_id, parent_type, created_at`,
      [
        file.originalname,
        file.mimetype,
        publicUrl,
        metadata,
        parentId,
        docType,
        req.user.id
      ]
    );
    
    const document = result.rows[0];
    
    res.status(201).json({
      message: 'File uploaded successfully',
      document
    });
  } catch (error) {
    console.error('File upload error:', error);
    
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large' });
      }
      return res.status(400).json({ message: `Upload error: ${error.message}` });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/storage/documents/:parentType/:parentId
 * @desc Get documents for a specific parent (part, operation, etc.)
 * @access Private
 */
router.get('/documents/:parentType/:parentId', authenticateToken, async (req, res) => {
  try {
    const { parentType, parentId } = req.params;
    
    // Get documents from database
    const result = await db.query(
      `SELECT id, name, type, url, metadata, parent_id, parent_type, created_at, updated_at
       FROM documents
       WHERE parent_type = $1 AND parent_id = $2
       ORDER BY created_at DESC`,
      [parentType, parentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/storage/documents/:id
 * @desc Delete a document
 * @access Private
 */
router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document details to find the file path
    const docResult = await db.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    // Delete the file from the filesystem
    const filePath = path.join(
      __dirname,
      '../../local',
      document.url.replace(/^\/storage/, '')
    );
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete the database record
    await db.query('DELETE FROM documents WHERE id = $1', [id]);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
