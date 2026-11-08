
import 'dotenv/config';
import mysql from 'mysql2/promise';

const con = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ConSangue',
    waitForConnections: true,
    connectionLimit: 10
});

await con.query('SELECT 1');