import { randomInt } from 'node:crypto';
import { con } from '../src/repository/connection.js';

const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function codigoAleatorio() {
  let codigo;
  do {
    codigo = Array.from({ length: 8 }, () => alfabeto[randomInt(alfabeto.length)]).join('');
  } while (/^\d+$/.test(codigo));
  return codigo;
}

try {
  const [grupos] = await con.query('SELECT id_grupo FROM grupos WHERE codigo_convite IS NULL ORDER BY id_grupo');
  let atualizados = 0;
  for (const { id_grupo } of grupos) {
    let gravado = false;
    for (let tentativa = 0; tentativa < 10; tentativa++) {
      try {
        const [resultado] = await con.execute(
          'UPDATE grupos SET codigo_convite = ? WHERE id_grupo = ? AND codigo_convite IS NULL',
          [codigoAleatorio(), id_grupo]
        );
        if (resultado.affectedRows === 1) atualizados++;
        gravado = true;
        break;
      } catch (erro) {
        if (erro.code !== 'ER_DUP_ENTRY') throw erro;
      }
    }
    if (!gravado) throw new Error('Não foi possível gerar código único para o grupo ' + id_grupo);
  }
  console.log('Códigos de convite atualizados:', atualizados);
} catch (erro) {
  console.error('Falha ao preencher códigos:', erro.code || erro.message);
  process.exitCode = 1;
} finally {
  await con.end();
}
