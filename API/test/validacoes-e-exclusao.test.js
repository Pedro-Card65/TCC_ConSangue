import test from 'node:test';
import assert from 'node:assert/strict';
import { validarLocalizacao } from '../src/service/localidadesService.js';
import { exigirConviteInstitucional } from '../src/utils/cadastroInstitucional.js';
import { excluirContaInstitucionalComPool } from '../src/repository/exclusaoContaInstitucional.js';

test('municípios e UFs são validados sem rede externa', async () => {
  assert.deepEqual(await validarLocalizacao('Sao Paulo', 'SP'), { cidade: 'São Paulo', estado: 'SP' });
  assert.deepEqual(await validarLocalizacao('Brasília', 'DF'), { cidade: 'Brasília', estado: 'DF' });
  await assert.rejects(() => validarLocalizacao('Cidade Inexistente', 'SP'), { status: 422 });
  await assert.rejects(() => validarLocalizacao('São Paulo', 'RJ'), { status: 422 });
});

test('cadastro de instituição exige convite configurado e válido', () => {
  const segredo = 'CONVITE-TESTE-NAO-UTILIZAR-EM-PRODUCAO';
  assert.equal(exigirConviteInstitucional(segredo, segredo), true);
  assert.throws(() => exigirConviteInstitucional('invalido', segredo), { status: 403 });
  assert.throws(() => exigirConviteInstitucional(segredo, 'curto'), { status: 503 });
});

function poolFalso({ outroUsuario = false, falhaSql = false } = {}) {
  const estado = { sql: [], commits: 0, rollbacks: 0, releases: 0 };
  const conexao = {
    async beginTransaction() {},
    async execute(sql, parametros) {
      estado.sql.push({ sql, parametros });
      if (sql.includes('SELECT id_usuario FROM usuarios')) return [[{ id_usuario: 7 }]];
      if (outroUsuario && sql.includes('SELECT p.id_registro FROM participacoes p')) {
        return [[{ id_registro: 15 }]];
      }
      if (falhaSql && sql.startsWith('DELETE FROM grupos')) throw new Error('falha simulada no banco');
      return [sql.startsWith('DELETE FROM usuarios') ? { affectedRows: 1 } : []];
    },
    async commit() { estado.commits++; },
    async rollback() { estado.rollbacks++; },
    release() { estado.releases++; }
  };
  return { pool: { async getConnection() { return conexao; } }, estado };
}

test('protege terceiros e reverte antes de qualquer exclusão', async () => {
  const { pool, estado } = poolFalso({ outroUsuario: true });
  await assert.rejects(() => excluirContaInstitucionalComPool(pool, 7), { status: 409 });
  assert.equal(estado.commits, 0);
  assert.equal(estado.rollbacks, 1);
  assert.equal(estado.releases, 1);
  assert.equal(estado.sql.some(q => q.sql.startsWith('DELETE')), false);
});

test('falha SQL executa rollback e não realiza commit', async () => {
  const { pool, estado } = poolFalso({ falhaSql: true });
  await assert.rejects(() => excluirContaInstitucionalComPool(pool, 7), /falha simulada/);
  assert.equal(estado.commits, 0);
  assert.equal(estado.rollbacks, 1);
  assert.equal(estado.releases, 1);
});

test('sem vínculos externos, exclusão realiza apenas comandos do titular', async () => {
  const { pool, estado } = poolFalso();
  assert.equal(await excluirContaInstitucionalComPool(pool, 7), true);
  assert.equal(estado.commits, 1);
  assert.equal(estado.rollbacks, 0);
  assert.equal(estado.releases, 1);
  const exclusoes = estado.sql.filter(q => q.sql.startsWith('DELETE'));
  assert.ok(exclusoes.length > 5);
  assert.ok(exclusoes.every(q => q.parametros.every(id => id === 7)));
});
