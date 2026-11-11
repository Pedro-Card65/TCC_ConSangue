
import 'dotenv/config';
import mysql from 'mysql2/promise';

const con = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ConSangue',
    waitForConnections: true,
    connectionLimit: 10
});

try {
    await con.query('SELECT 1');
    console.log('-> Conectou com MySQL!');
} catch (erro) {
    // Não imprime a senha: mostra só o código do erro e onde conferir.
    console.error(`-> Não foi possível conectar ao MySQL (${erro.code || 'erro desconhecido'}). Confira DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME no .env.`);
    process.exit(1);
}

export { con };