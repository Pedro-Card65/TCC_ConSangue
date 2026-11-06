import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

let abrir;
mock.module('../src/repository/connection.js', {
    namedExports: {
        con: { execute() { throw new Error('Conexão compartilhada não permitida'); } },
        abrirConexao: () => abrir()
    }
});
const { criarGrupo } = await import('../src/repository/gruposRepository.js');
const { criarGrupoService } = await import('../src/service/gruposService.js');
const { inserirMeuId } = await import('../src/utils/permissoes.js');
const grupo = { nome_grupo: 'Grupo teste', descricao: 'Descrição', id_criador: 1 };

function banco(falha, rollbackFalha = false) {
    const eventos = [];
    let pendentes = [];
    let persistidos = [];
    const erro = new Error('Falha simulada');
    let inserts = 0;
    const conexao = {
        async beginTransaction() { eventos.push('begin'); if (falha === 'begin') throw erro; },
        async execute(sql, valores) {
            const etapa = ++inserts === 1 ? 'grupo' : 'membro';
            eventos.push(etapa);
            if (falha === etapa) throw erro;
            pendentes.push({ sql, valores });
            return [{ insertId: 42 }];
        },
        async commit() {
            eventos.push('commit');
            if (falha === 'commit') throw erro;
            persistidos = pendentes;
        },
        async rollback() {
            eventos.push('rollback');
            if (rollbackFalha) throw new Error('Falha no rollback');
            pendentes = [];
        },
        destroy() { eventos.push('destroy'); pendentes = []; }
    };
    abrir = async () => conexao;
    return { eventos, erro, persistidos: () => persistidos };
}

test('cria grupo e administrador na mesma sessão antes de retornar o ID', async () => {
    const db = banco();
    assert.equal(await criarGrupo(grupo), 42);
    assert.deepEqual(db.eventos, ['begin', 'grupo', 'membro', 'commit', 'destroy']);
    assert.match(db.persistidos()[0].sql, /INSERT INTO grupos/);
    assert.match(db.persistidos()[1].sql, /INSERT INTO membros_grupo/);
    assert.deepEqual(db.persistidos()[1].valores, [1, 42, 'administrador']);
});

for (const etapa of ['begin', 'grupo', 'membro', 'commit']) {
    test(`falha em ${etapa}: rollback, descarte e nenhum registro confirmado`, async () => {
        const db = banco(etapa);
        await assert.rejects(criarGrupo(grupo), erro => erro === db.erro);
        assert.deepEqual(db.eventos.slice(-2), ['rollback', 'destroy']);
        assert.deepEqual(db.persistidos(), []);
    });
}
test('falha no rollback não esconde o erro original e descarta a sessão', async () => {
    const db = banco('membro', true);
    await assert.rejects(criarGrupo(grupo), erro => erro === db.erro);
    assert.equal(db.eventos.at(-1), 'destroy');
});
test('falha ao conectar é propagada', async () => {
    abrir = async () => { throw new Error('Sem conexão'); };
    await assert.rejects(criarGrupo(grupo), /Sem conexão/);
});
test('valida entradas antes de abrir conexão', async () => {
    abrir = () => assert.fail('Não deve acessar o banco');
    for (const entrada of [undefined, null, {}, { ...grupo, nome_grupo: 3 },
        { ...grupo, nome_grupo: ' ' }, { ...grupo, descricao: null },
        { ...grupo, descricao: ' ' }, { ...grupo, id_criador: -1 },
        { ...grupo, id_criador: 1.5 }, { ...grupo, id_criador: '1' },
        { ...grupo, nome_grupo: 'a'.repeat(101) }, { ...grupo, descricao: 'a'.repeat(256) }]) {
        await assert.rejects(criarGrupoService(entrada), erro => erro.status === 400);
    }
});
test('normaliza textos e aceita os limites do schema', async () => {
    const db = banco();
    await criarGrupoService({ ...grupo, nome_grupo: ` ${'a'.repeat(100)} `, descricao: 'b'.repeat(255) });
    assert.deepEqual(db.persistidos()[0].valores, ['a'.repeat(100), 'b'.repeat(255), 1]);
});
test('usa o criador autenticado e impede outro ID enviado no corpo', () => {
    const middleware = inserirMeuId('id_criador');
    const req = { body: {}, user: { id_usuario: 1 } };
    let passou = false;
    middleware(req, {}, () => { passou = true; });
    assert.equal(passou, true);
    assert.equal(req.body.id_criador, 1);
    let status;
    const resp = { status(valor) { status = valor; return this; }, json() {} };
    middleware({ ...req, body: { id_criador: 2 } }, resp, () => assert.fail('Não deve permitir'));
    assert.equal(status, 403);
});
test('criações simultâneas recebem sessões distintas', async () => {
    const sessoes = [];
    abrir = async () => {
        const registros = [];
        sessoes.push(registros);
        return {
            async beginTransaction() {},
            async execute(sql, valores) { registros.push(valores); return [{ insertId: valores[2] === 1 ? 10 : 20 }]; },
            async commit() {}, async rollback() {}, destroy() {}
        };
    };
    await Promise.all([criarGrupo(grupo), criarGrupo({ ...grupo, id_criador: 2 })]);
    assert.deepEqual(sessoes.map(s => s[1]), [[1, 10, 'administrador'], [2, 20, 'administrador']]);
});
