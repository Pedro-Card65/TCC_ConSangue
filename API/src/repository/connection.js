/*import mysql from 'mysql2/promise';
import 'dotenv/config';

const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ConSangue',
    password: 'root'
})

console.log('-> Conectou com MySQL!');

export { con };

antes da correção
*/

import mysql from 'mysql2/promise';
import 'dotenv/config';

const con = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

await con.query('SELECT 1');

console.log('-> Conectou com MySQL!')

export { con };