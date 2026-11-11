import { test } from 'node:test';
import assert from 'node:assert/strict';

test('API de produção protege convites, integrantes e ingresso por ID', {
  skip: process.env.RUN_DB_SMOKE_TESTS !== '1'
}, async () => {
  const [{ default: express }, { default: jwt }, { addRoutes }, { con }] = await Promise.all([
    import('express'),
    import('jsonwebtoken'),
    import('../src/routes.js'),
    import('../src/repository/connection.js')
  ]);
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  addRoutes(app);
  const server = await new Promise((resolve, reject) => {
    const srv = app.listen(0, '127.0.0.1');
    srv.once('listening', () => resolve(srv));
    srv.once('error', reject);
  });

  const porta = server.address().port;
  const requisitar = async (rota, options) => {
    const resposta = await fetch(`http://127.0.0.1:${porta}/api${rota}`, options);
    let dados;
    try { dados = await resposta.json(); } catch { dados = null; }
    return { status: resposta.status, dados };
  };

  try {
    const publica = await requisitar('/grupos');
    assert.equal(publica.status, 200);
    assert.ok(Array.isArray(publica.dados?.grupos));

    for (const grupo of publica.dados.grupos) {
      assert.ok(!Object.hasOwn(grupo, 'codigo_convite'), 'Código não deve aparecer em listagem pública.');
      assert.ok(!Object.hasOwn(grupo, 'foto_grupo'), 'Foto não deve aparecer em listagem pública.');
    }

    if (publica.dados.grupos.length === 0) return;
    const id = publica.dados.grupos[0].id_grupo;
    const nome = publica.dados.grupos[0].nome_grupo;

    const porNome = await requisitar(`/grupos/${encodeURIComponent(nome)}`);
    assert.equal(porNome.status, 200);
    for (const grupo of porNome.dados?.grupos || []) {
      assert.ok(!Object.hasOwn(grupo, 'codigo_convite'));
      assert.ok(!Object.hasOwn(grupo, 'foto_grupo'));
    }

    assert.equal((await requisitar(`/membros/grupo/${id}`)).status, 401);

    const [[{ maior }]] = await con.query('SELECT COALESCE(MAX(id_usuario), 0) AS maior FROM usuarios');
    const usuarioInexistente = Number(maior) + 100;
    const token = jwt.sign(
      { id_usuario: usuarioInexistente, tipo_usuario: 'candidato' },
      process.env.Chave_Secreta,
      { algorithm: 'HS256', expiresIn: '2m' }
    );
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    assert.equal((await requisitar(`/membros/grupo/${id}`, { headers })).status, 403);
    assert.equal((await requisitar('/membro', {
      method: 'POST', headers, body: JSON.stringify({ id_grupo: id })
    })).status, 400);
    assert.equal((await requisitar('/membro', {
      method: 'POST', headers, body: JSON.stringify({ codigo_convite: 'INVALIDO' })
    })).status, 400);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await con.end();
  }
});
