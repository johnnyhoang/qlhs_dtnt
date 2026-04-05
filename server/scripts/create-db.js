const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'qlhs_db';
  
  // Connect to 'postgres' default database to create the new one
  const client = new Client({
    connectionString: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(`/${dbName}`, '/postgres') : 
      undefined,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default db
  });

  try {
    await client.connect();
    // In Postgres, we check if DB exists by querying pg_database
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      // Must use direct query (not parameterized) for CREATE DATABASE
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase().catch(console.error);
