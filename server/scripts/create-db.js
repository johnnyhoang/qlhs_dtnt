const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'M1nh.kh01',
  });

  const dbName = process.env.DB_NAME || 'qlhs_db';
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  console.log(`Database "${dbName}" created or already exists.`);
  await connection.end();
}

createDatabase().catch(console.error);
