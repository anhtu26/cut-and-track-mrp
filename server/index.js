const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Import routes
const authRouter = require('./routes/auth-routes');
// Legacy auth router - to be removed after full migration
// const { router: legacyAuthRouter } = require('./routes/auth');
const storageRouter = require('./routes/storage');
const partsRouter = require('./routes/parts');
const workordersRouter = require('./routes/workorders');
const customersRouter = require('./routes/customers');
const operationsRouter = require('./routes/operations');
const db = require('./db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the local storage directory
app.use('/storage', express.static(path.join(__dirname, '../local/storage')));

// Basic route to verify server is running
app.get('/', (req, res) => {
  res.json({ message: 'Cut and Track MRP Local Server is running!' });
});

// Test database connection at startup
db.testConnection()
  .then(connected => {
    if (!connected) {
      console.warn('Database connection failed! Make sure PostgreSQL is running and properly configured.');
    }
  })
  .catch(err => {
    console.error('Error testing database connection:', err);
  });

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/storage', storageRouter);
app.use('/api/parts', partsRouter);
app.use('/api/workorders', workordersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/operations', operationsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes
