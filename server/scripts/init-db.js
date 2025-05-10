/**
 * Cut and Track MRP - Database Initialization Script
 * 
 * This script initializes the database with the schema and initial data
 * without relying on external tools like psql.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cut_track_mrp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'MatkhAu123$',
  ssl: process.env.DB_SSL === 'true'
};

// Path to schema file
const SCHEMA_FILE = path.resolve(__dirname, '../db/schema.sql');

// Create database connection pool
const pool = new Pool(dbConfig);

/**
 * Execute SQL from a file
 * @param {string} filePath - Path to SQL file
 * @returns {Promise<void>}
 */
async function executeSqlFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`SQL file not found: ${filePath}`);
    }
    
    // Read SQL file content
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    console.log(`SQL file loaded, size: ${sqlContent.length} bytes`);
    
    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      console.log('Executing SQL schema...');
      // Execute the SQL directly - PostgreSQL can handle the entire file
      await client.query(sqlContent);
      console.log('Schema initialization completed successfully!');
    } catch (error) {
      console.error('Error executing SQL:', error.message);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
    throw error;
  }
}

/**
 * Add tables needed for the application
 */
async function addAdditionalTables() {
  const client = await pool.connect();
  
  try {
    console.log('Adding additional tables...');
    
    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
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
      );
    `);
    
    // Parts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS parts (
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
      );
    `);
    
    // Operations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS operations (
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
      );
    `);
    
    // Work orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS work_orders (
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
      );
    `);
    
    // Create update trigger function if it doesn't exist
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
        await client.query(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
          CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `);
      } catch (err) {
        console.warn(`Warning creating trigger for ${table}: ${err.message}`);
      }
    }
    
    console.log('Additional tables created successfully!');
  } catch (error) {
    console.error('Error creating additional tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Cut and Track MRP Database Initialization');
    console.log('========================================');
    
    // Execute schema file
    await executeSqlFile(SCHEMA_FILE);
    
    // Add additional tables
    await addAdditionalTables();
    
    console.log('\nDatabase initialization completed successfully!');
    console.log(`Connection string: postgres://${dbConfig.user}:***@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
