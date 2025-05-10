/**
 * Cut and Track MRP - Local Database Setup
 * 
 * This script sets up the local database for the application
 * by creating tables if they don't exist or altering them if needed.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cut_track_mrp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MatkhAu123$',
  ssl: process.env.DB_SSL === 'true'
};

// Create database connection pool
const pool = new Pool(dbConfig);

/**
 * Check if a table exists in the database
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} True if the table exists
 */
async function tableExists(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
      [tableName]
    );
    return result.rows[0].exists;
  } finally {
    client.release();
  }
}

/**
 * Check if a column exists in a table
 * @param {string} tableName - Name of the table
 * @param {string} columnName - Name of the column
 * @returns {Promise<boolean>} True if the column exists
 */
async function columnExists(tableName, columnName) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)",
      [tableName, columnName]
    );
    return result.rows[0].exists;
  } finally {
    client.release();
  }
}

/**
 * Create users table if it doesn't exist
 */
async function setupUsersTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up users table...');
    
    const exists = await tableExists('users');
    
    if (!exists) {
      console.log('Creating users table...');
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'Staff',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists, checking columns...');
      
      // Check if password column exists
      const hasPassword = await columnExists('users', 'password');
      if (!hasPassword) {
        console.log('Adding password column to users table...');
        await client.query('ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT \'$2b$10$rRsRfhFZIQDUGJp.mFzEAO1yY9sUMR2Jq1sLKXpzYLZJ/Eo7ykzXy\'');
      }
      
      // Check if role column exists
      const hasRole = await columnExists('users', 'role');
      if (!hasRole) {
        console.log('Adding role column to users table...');
        await client.query('ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT \'Staff\'');
      }
    }
    
    // Create admin user if it doesn't exist
    const adminResult = await client.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    if (adminResult.rows.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)',
        ['00000000-0000-0000-0000-000000000000', 'admin@example.com', hashedPassword, 'Administrator']
      );
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error setting up users table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create documents table if it doesn't exist
 */
async function setupDocumentsTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up documents table...');
    
    const exists = await tableExists('documents');
    
    if (!exists) {
      console.log('Creating documents table...');
      await client.query(`
        CREATE TABLE documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filename TEXT NOT NULL,
          filepath TEXT NOT NULL,
          mimetype TEXT,
          size INTEGER,
          entity_type TEXT NOT NULL,
          entity_id UUID NOT NULL,
          description TEXT,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('Documents table created successfully');
    } else {
      console.log('Documents table already exists');
    }
  } catch (error) {
    console.error('Error setting up documents table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create customers table if it doesn't exist
 */
async function setupCustomersTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up customers table...');
    
    const exists = await tableExists('customers');
    
    if (!exists) {
      console.log('Creating customers table...');
      await client.query(`
        CREATE TABLE customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          contact_name TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          address TEXT,
          notes TEXT,
          status TEXT DEFAULT 'active',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('Customers table created successfully');
    } else {
      console.log('Customers table already exists');
    }
  } catch (error) {
    console.error('Error setting up customers table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create parts table if it doesn't exist
 */
async function setupPartsTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up parts table...');
    
    const exists = await tableExists('parts');
    
    if (!exists) {
      console.log('Creating parts table...');
      await client.query(`
        CREATE TABLE parts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          part_number TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          customer_id UUID REFERENCES customers(id),
          material TEXT,
          status TEXT DEFAULT 'active',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(part_number)
        )
      `);
      console.log('Parts table created successfully');
    } else {
      console.log('Parts table already exists');
    }
  } catch (error) {
    console.error('Error setting up parts table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create operations table if it doesn't exist
 */
async function setupOperationsTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up operations table...');
    
    const exists = await tableExists('operations');
    
    if (!exists) {
      console.log('Creating operations table...');
      await client.query(`
        CREATE TABLE operations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          standard_time NUMERIC DEFAULT 0,
          machine_id UUID,
          setup_time NUMERIC DEFAULT 0,
          status TEXT DEFAULT 'active',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log('Operations table created successfully');
    } else {
      console.log('Operations table already exists');
    }
  } catch (error) {
    console.error('Error setting up operations table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create work_orders table if it doesn't exist
 */
async function setupWorkOrdersTable() {
  const client = await pool.connect();
  try {
    console.log('Setting up work_orders table...');
    
    const exists = await tableExists('work_orders');
    
    if (!exists) {
      console.log('Creating work_orders table...');
      await client.query(`
        CREATE TABLE work_orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_number TEXT NOT NULL,
          description TEXT,
          customer_id UUID REFERENCES customers(id),
          part_id UUID REFERENCES parts(id),
          quantity INTEGER DEFAULT 0,
          due_date TIMESTAMPTZ,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'medium',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(order_number)
        )
      `);
      console.log('Work orders table created successfully');
    } else {
      console.log('Work orders table already exists');
    }
  } catch (error) {
    console.error('Error setting up work_orders table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create update_updated_at_column function and triggers
 */
async function setupUpdateTriggers() {
  const client = await pool.connect();
  try {
    console.log('Setting up update triggers...');
    
    // Create function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create triggers for all tables
    const tables = ['users', 'documents', 'customers', 'parts', 'operations', 'work_orders'];
    for (const table of tables) {
      try {
        const exists = await tableExists(table);
        if (exists) {
          await client.query(`
            DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
            CREATE TRIGGER update_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
          `);
          console.log(`Created update trigger for ${table} table`);
        }
      } catch (err) {
        console.warn(`Warning creating trigger for ${table}: ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Error setting up update triggers:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main function to set up the database
 */
async function setupDatabase() {
  try {
    console.log('Setting up Cut and Track MRP local database...');
    
    // Set up tables
    await setupUsersTable();
    await setupDocumentsTable();
    await setupCustomersTable();
    await setupPartsTable();
    await setupOperationsTable();
    await setupWorkOrdersTable();
    
    // Set up triggers
    await setupUpdateTriggers();
    
    console.log('\nDatabase setup completed successfully!');
    console.log(`Connection string: postgres://${dbConfig.user}:***@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
