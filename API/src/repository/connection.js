import mysql from 'mysql2/promise';
import 'dotenv/config';

const con = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER ||'root',
    database: process.env.DB_NAME || 'ConSangue',
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10
});

console.log('-> Conectou com MySQL! ');

export { con };