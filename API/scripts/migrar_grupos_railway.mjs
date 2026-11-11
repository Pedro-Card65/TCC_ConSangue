import mysql from 'mysql2/promise';
import { randomInt } from 'node:crypto';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const BACKUP = 'grupos_backup_20261111';
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ConSangue',
  connectionLimit: 2,
  waitForConnections: true
});

function codigoConvite() {
  let codigo;
  do {
    codigo = Array.from({ length: 8 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
  } while (/^\d{8}$/.test(codigo));
  return codigo;
}

let conexao;
let bloqueio = false;
try {
  conexao = await pool.getConnection();
  const [[{ adquirido }]] = await conexao.query("SELECT GET_LOCK('consangue_migracao_grupos_v1', 20) AS adquirido");
  if (adquirido !== 1) throw new Error('Outra migração está em andamento.');
  bloqueio = true;

  const [tabelas] = await conexao.query("SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' LIMIT 1");
  if (!tabelas.length) throw new Error('A tabela grupos não foi encontrada no banco configurado.');

  const [colunas] = await conexao.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos'");
  const existentes = new Set(colunas.map(coluna => coluna.COLUMN_NAME));
  const [indices] = await conexao.query("SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos'");
  const indicesExistentes = new Set(indices.map(indice => indice.INDEX_NAME));
  const exigeAlteracao = !existentes.has('foto_grupo') || !existentes.has('codigo_convite') || !indicesExistentes.has('uq_grupos_codigo_convite');

  if (exigeAlteracao) {
    const [backupExiste] = await conexao.query(
      'SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1', [BACKUP]
    );
    if (!backupExiste.length) {
      await conexao.query('CREATE TABLE `grupos_backup_20261111` LIKE `grupos`');
      await conexao.query('INSERT INTO `grupos_backup_20261111` SELECT * FROM `grupos`');
    }
    const [[{ quantidadeOriginal }]] = await conexao.query('SELECT COUNT(*) AS quantidadeOriginal FROM `grupos`');
    const [[{ quantidadeBackup }]] = await conexao.query('SELECT COUNT(*) AS quantidadeBackup FROM `grupos_backup_20261111`');
    if (Number(quantidadeBackup) === 0 && Number(quantidadeOriginal) > 0) {
      throw new Error('Backup da tabela grupos está vazio; não vou modificar o esquema.');
    }
    console.log(`Backup verificado: ${quantidadeBackup} grupos preservados.`);
  }

  if (!existentes.has('foto_grupo')) {
    await conexao.query('ALTER TABLE `grupos` ADD COLUMN `foto_grupo` MEDIUMTEXT NULL');
    console.log('Coluna foto_grupo adicionada.');
  }
  if (!existentes.has('codigo_convite')) {
    await conexao.query('ALTER TABLE `grupos` ADD COLUMN `codigo_convite` CHAR(8) NULL');
    console.log('Coluna codigo_convite adicionada.');
  }
  if (!indicesExistentes.has('uq_grupos_codigo_convite')) {
    await conexao.query('ALTER TABLE `grupos` ADD UNIQUE KEY `uq_grupos_codigo_convite` (`codigo_convite`)');
    console.log('Índice único de códigos criado.');
  }

  const [pendentes] = await conexao.query('SELECT id_grupo FROM grupos WHERE codigo_convite IS NULL ORDER BY id_grupo');
  let preenchidos = 0;
  for (const { id_grupo } of pendentes) {
    let concluido = false;
    for (let tentativa = 0; tentativa < 12; tentativa++) {
      try {
        const [alteracao] = await conexao.execute(
          'UPDATE grupos SET codigo_convite = ? WHERE id_grupo = ? AND codigo_convite IS NULL',
          [codigoConvite(), id_grupo]
        );
        preenchidos += Number(alteracao.affectedRows);
        concluido = true;
        break;
      } catch (erro) {
        if (erro.code !== 'ER_DUP_ENTRY') throw erro;
      }
    }
    if (!concluido) throw new Error(`Código único não pôde ser atribuído ao grupo ${id_grupo}.`);
  }

  const [[resultado]] = await conexao.query(
    'SELECT COUNT(*) AS total, COUNT(foto_grupo) AS comFoto, COUNT(codigo_convite) AS comCodigo, COUNT(DISTINCT codigo_convite) AS distintos FROM grupos'
  );
  if (Number(resultado.comCodigo) !== Number(resultado.total) || Number(resultado.distintos) !== Number(resultado.total)) {
    throw new Error('A verificação final de códigos de convite não passou.');
  }
  console.log(`Migração concluída: ${resultado.total} grupos, ${preenchidos} códigos preenchidos, ${resultado.comFoto} com foto.`);
} catch (erro) {
  console.error('A migração não foi concluída:', erro.code || erro.message);
  process.exitCode = 1;
} finally {
  if (conexao) {
    if (bloqueio) {
      try { await conexao.query("SELECT RELEASE_LOCK('consangue_migracao_grupos_v1')"); } catch {}
    }
    conexao.release();
  }
  await pool.end();
}
