import mysql from 'mysql2/promise';
import 'dotenv/config';

const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ConSangue',
    password: 'root'
})

console.log('-> Conectou com MySQL! ');

export { con };