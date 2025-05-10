const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new Pool instance for connecting to PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cut_track_mrp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? true : false
});

// The pool will emit an error on behalf of any idle clients
// if a backend error or network partition happens
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export the query method for use by other modules
module.exports = {
  /**
   * Execute SQL query with optional parameters
   * @param {string} text - SQL query text
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  query: (text, params) => pool.query(text, params),
  
  /**
   * Get a client from the pool
   * @returns {Promise} Pool client
   */
  getClient: () => pool.connect(),
  
  /**
   * Test database connection
   * @returns {Promise} Connection test result
   */
  testConnection: async () => {
    try {
      const client = await pool.connect();
      console.log('Database connection successful');
      client.release();
      return true;
    } catch (err) {
      console.error('Database connection error:', err);
      return false;
    }
  }
};
