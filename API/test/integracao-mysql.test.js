import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import mysql from 'mysql2/promise';
import { excluirContaInstitucionalComPool } from '../src/repository/exclusaoContaInstitucional.js';

// Este arquivo roda SOMENTE com TEST_DB_HOST e um banco descartável.
// O workflow GitHub Actions inicia uma instância MySQL separada de produção.
test('MySQL isolado: preserva terceiros, bloqueia vínculos e só então permite excluir', {
  skip: !process.env.TEST_DB_HOST
}, async () => {
  const configuracao = {
    host: process.env.TEST_DB_HOST,
    port: Number(process.env.TEST_DB_PORT || 3306),
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || ''
  };
  const admin = await mysql.createConnection({ ...configuracao, multipleStatements: true });
  let pool;
  try {
    const ddl = readFileSync(new URL('../../Database/ConSangue.sql', import.meta.url), 'utf8');
    await admin.query(ddl);
    pool = mysql.createPool({ ...configuracao, database: 'ConSangue' });

    const cadastrar = async (nome, cpf, tipo) => {
      const [r] = await pool.execute(
        'INSERT INTO usuarios (nome, data_nascimento, cpf, telefone, email, senha_hash, cidade, tipo_usuario) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, '2000-01-01', cpf, '11999999999', cpf + '@example.test', 'hash-teste', 'São Paulo', tipo]
      );
      return r.insertId;
    };

    const titular = await cadastrar('Instituição Teste', '12345678901', 'instituicao');
    const terceiro = await cadastrar('Participante Teste', '10987654321', 'candidato');
    const [h] = await pool.execute(
      'INSERT INTO hemocentros (id_usuario, nome_hemo, cep, endereco, cidade, estado, telefone_centro) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titular, 'Hemocentro de Teste', '01001-000', 'Praça da Sé, 1', 'São Paulo', 'SP', '11999999999']
    );
    const [campanha] = await pool.execute(
      'INSERT INTO campanhas (id_hemocentro, nome_campanha, data_inicio, data_fim, status_campanha) ' +
      "VALUES (?, ?, '2026-11-13', '2026-11-20', 'ativa')",
      [h.insertId, 'Campanha Fictícia']
    );
    await pool.execute(
      "INSERT INTO participacoes (id_usuario, id_campanha, status_participacao) VALUES (?, ?, 'interessado')",
      [terceiro, campanha.insertId]
    );

    await assert.rejects(
      () => excluirContaInstitucionalComPool(pool, titular), { status: 409 }
    );
    let [contagem] = await pool.execute(
      'SELECT COUNT(*) AS total FROM participacoes WHERE id_usuario = ?', [terceiro]
    );
    assert.equal(contagem[0].total, 1, 'participação de terceiro preservada após rollback');

    await pool.execute('DELETE FROM participacoes WHERE id_usuario = ?', [terceiro]);
    const [grupo] = await pool.execute(
      "INSERT INTO grupos (nome_grupo, descricao, visibilidade, id_criador) VALUES (?, ?, 'privado', ?)",
      ['Grupo Privado Teste', 'Acesso por convite', titular]
    );
    // Regressão: grupos privados antigos podem não ter registro do criador
    // em membros_grupo. O criador ainda deve ver e administrar o grupo.
    const { listarGruposPorUsuario, listarMembrosPorGrupo } =
      await import('../src/repository/membros_grupoRepository.js');
    const gruposDoCriador = await listarGruposPorUsuario(titular);
    const privadoCriado = gruposDoCriador.find(g => g.id_grupo === grupo.insertId);
    assert.ok(privadoCriado, 'criador enxerga seu grupo privado sem registro em membros');
    assert.equal(privadoCriado.papel, 'administrador');
    assert.equal(privadoCriado.visibilidade, 'privado');
    assert.equal(privadoCriado.id_membro, null);

    const gruposAntesDoConvite = await listarGruposPorUsuario(terceiro);
    assert.equal(gruposAntesDoConvite.some(g => g.id_grupo === grupo.insertId), false,
      'usuário de fora não deve encontrar grupo privado');
    const membrosLegados = await listarMembrosPorGrupo(grupo.insertId);
    assert.equal(membrosLegados.filter(m => m.id_usuario === titular).length, 1,
      'criador aparece na contagem de membros mesmo com registro legado');

    const { somenteMembroGrupo } = await import('../src/utils/permissoes.js');
    const consultarAcesso = idUsuario => new Promise(resolve => {
      const resposta = {
        status(status) { this.codigo = status; return this; },
        json(dados) { resolve({ permitido: false, status: this.codigo, dados }); }
      };
      somenteMembroGrupo(
        { params: { id_grupo: String(grupo.insertId) }, user: { id_usuario: idUsuario } },
        resposta,
        () => resolve({ permitido: true })
      );
    });
    assert.equal((await consultarAcesso(titular)).permitido, true,
      'criador legado acessa os membros do próprio grupo');
    assert.equal((await consultarAcesso(terceiro)).permitido, false,
      'usuário externo não acessa membros do grupo privado');

    await pool.execute('INSERT INTO membros_grupo (id_usuario, id_grupo) VALUES (?, ?)', [terceiro, grupo.insertId]);
    const gruposDoMembro = await listarGruposPorUsuario(terceiro);
    assert.equal(gruposDoMembro.some(g => g.id_grupo === grupo.insertId), true,
      'participante convidado encontra o grupo privado');
    assert.equal((await consultarAcesso(terceiro)).permitido, true,
      'participante convidado pode consultar membros do grupo privado');
    await assert.rejects(
      () => excluirContaInstitucionalComPool(pool, titular), { status: 409 }
    );
    await pool.execute('DELETE FROM membros_grupo WHERE id_usuario = ?', [terceiro]);

    const [grupoOutro] = await pool.execute(
      "INSERT INTO grupos (nome_grupo, descricao, visibilidade, id_criador) VALUES (?, ?, 'publico', ?)",
      ['Grupo Público Teste', 'Descoberta livre', terceiro]
    );
    await pool.execute(
      'INSERT INTO grupos_campanhas (id_grupo, id_campanha, meta_participacoes) VALUES (?, ?, ?)',
      [grupoOutro.insertId, campanha.insertId, 3]
    );
    await assert.rejects(
      () => excluirContaInstitucionalComPool(pool, titular), { status: 409 }
    );
    await pool.execute('DELETE FROM grupos_campanhas WHERE id_grupo = ?', [grupoOutro.insertId]);

    // Também verifica que a consulta pública nunca expõe o grupo privado.
    const { listarGrupos, listarGruposPorNome } = await import('../src/repository/gruposRepository.js');
    const publicos = await listarGrupos();
    assert.equal(publicos.some(g => g.id_grupo === grupo.insertId), false);
    assert.equal(publicos.some(g => g.id_grupo === grupoOutro.insertId), true);
    const pesquisa = await listarGruposPorNome('Privado Teste');
    assert.equal(pesquisa.length, 0);

    assert.equal(await excluirContaInstitucionalComPool(pool, titular), true);
    const [titulares] = await pool.execute('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [titular]);
    const [terceiros] = await pool.execute('SELECT id_usuario FROM usuarios WHERE id_usuario = ?', [terceiro]);
    const [campanhas] = await pool.execute('SELECT id_campanha FROM campanhas WHERE id_campanha = ?', [campanha.insertId]);
    assert.equal(titulares.length, 0);
    assert.equal(campanhas.length, 0);
    assert.equal(terceiros.length, 1);

    const { con } = await import('../src/repository/connection.js');
    await con.end();
  } finally {
    if (pool) await pool.end();
    await admin.end();
  }
});
