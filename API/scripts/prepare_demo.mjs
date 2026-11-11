import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME || 'ConSangue';
const isLoopback = ['localhost', '127.0.0.1', '::1'].includes(host);
if (process.env.CONSANGUE_DEMO_LOCAL !== 'SIM' || !isLoopback || database !== 'ConSangue') {
  throw new Error('Por segurança, confirme CONSANGUE_DEMO_LOCAL=SIM e DB_HOST local com DB_NAME=ConSangue.');
}
const connection = await mysql.createConnection({
  host,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database,
  multipleStatements: true
});
try {
  const sqlPath = fileURLToPath(new URL('../../Database/dados_demonstracao.sql', import.meta.url));
  await connection.query(await readFile(sqlPath, 'utf8'));
  const [rows] = await connection.query("SELECT tipo_usuario, COUNT(*) AS total FROM usuarios WHERE email LIKE '%@consangue.example.invalid' GROUP BY tipo_usuario");
  console.log('Contas fictícias prontas no banco local:', rows);
  console.log('Hemocentro fictício pronto. Senha das contas: DemoConSangue2026!');
} finally {
  await connection.end();
}