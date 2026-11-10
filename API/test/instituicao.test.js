import { test, before, after, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';

process.env.Chave_Secreta = 'chave-exclusiva-dos-testes-locais';
const consultas = [];
let semInstituicao = false;
let gravacoes = [];
const con = {
    async execute(sql, valores) {
        consultas.push({ sql, valores });
        if (sql.includes('AS total_campanhas')) {
            return [semInstituicao ? [] : [{ id_hemocentro: 4, id_usuario: valores[0], nome_hemo: 'Teste', total_campanhas: '2', total_grupos: '1', total_agendamentos: '3' }]];
        }
        if (sql.includes('FROM hemocentros WHERE id_hemocentro = ? AND id_usuario = ?')) {
            return [valores[0] === 4 && valores[1] === 7 ? [{ id_hemocentro: 4 }] : []];
        }
        throw new Error('Consulta inesperada no teste');
    },
    async query(sql, valores) {
        if (!sql.includes('insert into campanhas')) throw new Error('Gravação inesperada no teste');
        gravacoes.push(valores);
        return [{ insertId: 12 }];
    }
};
mock.module('../src/repository/connection.js', { namedExports: { con } });
const { default: instituicoes } = await import('../src/controller/instituicoesController.js');
const { default: campanhas } = await import('../src/controller/campanhasController.js');
const { generateToken } = await import('../src/utils/jwt.js');
const token = generateToken({ id_usuario: 7, tipo_usuario: 'instituicao' });
const candidato = generateToken({ id_usuario: 8, tipo_usuario: 'candidato' });
let servidor, base;
before(async () => {
    const app = express();
    app.use(express.json()); app.use(instituicoes); app.use('/api', campanhas);
    servidor = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    base = `http://127.0.0.1:${servidor.address().port}`;
});
after(async () => { await new Promise(resolve => servidor.close(resolve)); mock.restoreAll(); });
beforeEach(() => { consultas.length = 0; gravacoes = []; semInstituicao = false; });
const dados = { id_hemocentro: 4, nome_campanha: ' Campanha teste ', descricao: '', data_inicio: '2026-12-01', data_fim: '2026-12-01', horario_inicio: '09:00', horario_fim: '12:00', status_campanha: 'ativa' };
function requisicao(path, credencial = token, body) {
    return fetch(base + path, { method: body ? 'POST' : 'GET', headers: { ...(credencial ? { Authorization: `Bearer ${credencial}` } : {}), 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
}

test('painel rejeita ausência de JWT, JWT inválido e candidato antes de consultar banco', async () => {
    for (const [credencial, status] of [[null, 401], ['invalido', 401], [candidato, 403]]) {
        assert.equal((await requisicao('/api/instituicoes/me', credencial)).status, status);
    }
    assert.equal(consultas.length, 0);
});

test('painel usa titular do JWT, ignora parâmetro alheio e não retorna participantes', async () => {
    const resposta = await requisicao('/api/instituicoes/me?id_usuario=999');
    assert.equal(resposta.status, 200);
    const body = await resposta.json();
    assert.deepEqual(body.estatisticas, { campanhas: 2, grupos: 1, agendamentos: 3 });
    assert.equal(body.instituicao.id_usuario, 7);
    assert.deepEqual(consultas[0].valores, [7]);
    assert.match(consultas[0].sql, /COUNT\(DISTINCT gc.id_grupo\)/);
    assert.match(consultas[0].sql, /p.status_participacao = 'pretende_ir'/);
    assert.equal(Object.hasOwn(body, 'participantes'), false);
});

test('conta institucional sem hemocentro retorna ausência explícita', async () => {
    semInstituicao = true;
    const resposta = await requisicao('/api/instituicoes/me');
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), { instituicao: null });
});

test('SQL do painel isola instituições e não multiplica contagens por vínculos', async () => {
    const db = new DatabaseSync(':memory:');
    const executarOriginal = con.execute;
    try {
        db.exec(`
            CREATE TABLE hemocentros (id_hemocentro INTEGER, id_usuario INTEGER, nome_hemo TEXT);
            CREATE TABLE campanhas (id_campanha INTEGER, id_hemocentro INTEGER);
            CREATE TABLE grupos_campanhas (id_grupo INTEGER, id_campanha INTEGER);
            CREATE TABLE participacoes (id_campanha INTEGER, status_participacao TEXT);
            INSERT INTO hemocentros VALUES (4, 7, 'Nossa'), (5, 8, 'Outra'), (6, 9, 'Vazia');
            INSERT INTO campanhas VALUES (11, 4), (12, 4), (13, 5);
            INSERT INTO grupos_campanhas VALUES (1, 11), (1, 12), (2, 12), (3, 13);
            INSERT INTO participacoes VALUES (11, 'pretende_ir'), (12, 'pretende_ir'),
                (12, 'interessado'), (12, 'comparecimento_informado'), (13, 'pretende_ir');
        `);
        con.execute = async (sql, valores) => [db.prepare(sql).all(...valores)];
        const resposta = await requisicao('/api/instituicoes/me');
        assert.deepEqual((await resposta.json()).estatisticas, { campanhas: 2, grupos: 2, agendamentos: 2 });
        const vazio = generateToken({ id_usuario: 9, tipo_usuario: 'instituicao' });
        assert.deepEqual((await (await requisicao('/api/instituicoes/me', vazio)).json()).estatisticas, { campanhas: 0, grupos: 0, agendamentos: 0 });
    } finally {
        con.execute = executarOriginal;
        db.close();
    }
});

test('criação rejeita candidato e instituição alheia sem inserir campanha', async () => {
    assert.equal((await requisicao('/api/campanhas', candidato, dados)).status, 403);
    assert.equal((await requisicao('/api/campanhas', token, { ...dados, id_hemocentro: 99 })).status, 403);
    assert.equal(gravacoes.length, 0);
});

test('criação valida datas reais, ordem, horários e nome antes da gravação', async () => {
    for (const invalido of [{ data_inicio: '2026-02-30' }, { data_fim: '2026-11-30' }, { horario_fim: '08:00' }, { nome_campanha: '   ' }]) {
        assert.equal((await requisicao('/api/campanhas', token, { ...dados, ...invalido })).status, 400);
    }
    assert.equal(gravacoes.length, 0);
});

test('criação autorizada retorna ID e persiste somente dados normalizados', async () => {
    const resposta = await requisicao('/api/campanhas', token, dados);
    assert.equal(resposta.status, 200);
    assert.deepEqual(await resposta.json(), { id_campanha: 12 });
    assert.deepEqual(gravacoes, [[4, 'Campanha teste', null, '2026-12-01', '2026-12-01', '09:00:00', '12:00:00', 'ativa']]);
});
