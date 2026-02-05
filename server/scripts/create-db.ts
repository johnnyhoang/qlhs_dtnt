import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createDatabase() {
    const config = {
        server: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 1433,
        user: process.env.DB_USERNAME || 'sa',
        password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
        options: {
            encrypt: false,
            trustServerCertificate: true,
        },
    };

    console.log(`Connecting to MSSQL at ${config.server}:${config.port} as ${config.user}...`);

    try {
        await sql.connect(config);
        console.log('Connected successfully!');

        const dbName = process.env.DB_NAME || 'qlhs_db';
        
        // Check if DB exists
        const result = await sql.query(`SELECT name FROM master.dbo.sysdatabases WHERE name = '${dbName}'`);
        
        if (result.recordset.length === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            await sql.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        await sql.close();
        process.exit(0);
    } catch (error: any) {
        console.error('Error creating database:', error.message);
        if (error.code === 'ESOCKET') {
            console.error('\nPOSSIBLE CAUSES:\n1. MSSQL Server is NOT running.\n2. TCP/IP is disabled in SQL Server Configuration Manager.\n3. Wrong port or credentials.');
        }
        process.exit(1);
    }
}

createDatabase();
