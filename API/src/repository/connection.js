import mysql from 'mysql2/promise';

const configuracao = {
    host: 'localhost',
    user: 'root',
    database: 'ConSangue',
    password: 'root'
};

// Cada transação precisa de uma sessão exclusiva.
export function abrirConexao() {
    return mysql.createConnection(configuracao);
}

const con = await abrirConexao();

console.log('-> Conectou com MySQL! ');

export { con };
