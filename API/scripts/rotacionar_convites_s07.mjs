import 'dotenv/config';
import { randomInt } from 'node:crypto';
import mysql from 'mysql2/promise';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const IDENTIFICADOR = 's07-grupos-fechados-20261111';

function gerarCodigo(existentes) {
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const codigo = Array.from({ length: 8 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
    if (!/^[0-9]+$/.test(codigo) && !existentes.has(codigo)) return codigo;
  }
  throw new Error('Não foi possível gerar um convite único.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ConSangue',
  waitForConnections: true,
  connectionLimit: 2
});

let conexao;
let lock = false;
let emTransacao = false;
try {
  conexao = await pool.getConnection();
  const [[{ obtido }]] = await conexao.query(
    "SELECT GET_LOCK('consangue_rotacao_convites_s07', 20) AS obtido"
  );
  if (Number(obtido) !== 1) throw new Error('Outra operação de convites está em andamento.');
  lock = true;

  await conexao.query(
    'CREATE TABLE IF NOT EXISTS consangue_migracoes_seguranca (identificador VARCHAR(80) PRIMARY KEY, aplicado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  await conexao.query(
    'CREATE TABLE IF NOT EXISTS grupos_convites_backup_s07_20261111 (id_grupo BIGINT UNSIGNED PRIMARY KEY, codigo_convite CHAR(8) NULL, registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );

  await conexao.beginTransaction();
  emTransacao = true;
  const [aplicada] = await conexao.execute(
    'SELECT identificador FROM consangue_migracoes_seguranca WHERE identificador = ? LIMIT 1 FOR UPDATE',
    [IDENTIFICADOR]
  );
  if (aplicada.length) {
    await conexao.commit();
    emTransacao = false;
    console.log('Rotação S07 já aplicada. Nenhuma alteração adicional.');
  } else {
    const [grupos] = await conexao.query(
      'SELECT id_grupo, codigo_convite FROM grupos ORDER BY id_grupo FOR UPDATE'
    );
    await conexao.query(
      'INSERT IGNORE INTO grupos_convites_backup_s07_20261111 (id_grupo, codigo_convite) SELECT id_grupo, codigo_convite FROM grupos'
    );
    const [gravados] = await conexao.query(
      'SELECT id_grupo FROM grupos_convites_backup_s07_20261111'
    );
    const salvos = new Set(gravados.map(g => String(g.id_grupo)));
    if (grupos.some(g => !salvos.has(String(g.id_grupo)))) {
      throw new Error('Backup incompleto. Os códigos não serão alterados.');
    }

    const usados = new Set(grupos.map(g => g.codigo_convite).filter(Boolean));
    for (const grupo of grupos) {
      const novoCodigo = gerarCodigo(usados);
      usados.add(novoCodigo);
      await conexao.execute(
        'UPDATE grupos SET codigo_convite = ? WHERE id_grupo = ?',
        [novoCodigo, grupo.id_grupo]
      );
    }
    const [[conferencia]] = await conexao.query(
      'SELECT COUNT(*) AS total, COUNT(codigo_convite) AS preenchidos, COUNT(DISTINCT codigo_convite) AS distintos FROM grupos'
    );
    if (Number(conferencia.total) !== Number(conferencia.preenchidos) ||
        Number(conferencia.total) !== Number(conferencia.distintos)) {
      throw new Error('Os códigos não passaram na verificação final.');
    }
    await conexao.execute(
      'INSERT INTO consangue_migracoes_seguranca (identificador) VALUES (?)',
      [IDENTIFICADOR]
    );
    await conexao.commit();
    emTransacao = false;
    console.log(`Rotação S07 concluída: ${grupos.length} códigos substituídos. Backup e marcadores preservados no banco.`);
  }
} catch (erro) {
  if (conexao && emTransacao) {
    try { await conexao.rollback(); } catch {}
  }
  console.error('Falha na rotação S07:', erro.code || erro.message);
  process.exitCode = 1;
} finally {
  if (conexao) {
    if (lock) {
      try { await conexao.query("SELECT RELEASE_LOCK('consangue_rotacao_convites_s07')"); } catch {}
    }
    conexao.release();
  }
  await pool.end();
}
