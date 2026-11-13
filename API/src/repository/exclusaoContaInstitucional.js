// Rotina transacional e conservadora: em nenhuma hipótese apagamos
// participações, vínculos ou associações pertencentes a terceiros.
function erroVinculos() {
  const erro = new Error(
    'A conta possui campanhas ou grupos com participações/vínculos de outras pessoas. ' +
    'Para preservar esses registros, desvincule ou encerre as campanhas e grupos antes de excluir sua conta.'
  );
  erro.status = 409;
  return erro;
}

export async function excluirContaInstitucionalComPool(pool, id) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [titulares] = await conexao.execute(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND tipo_usuario = 'instituicao' FOR UPDATE",
      [id]
    );
    if (!titulares.length) {
      const erro = new Error('Conta institucional não encontrada.');
      erro.status = 404;
      throw erro;
    }

    // Protegemos: participantes de nossas campanhas, membros de nossos grupos,
    // grupos de terceiros ligados às nossas campanhas e participantes dos
    // vínculos de grupos criados pela conta. Leitura com trava na transação.
    const consultasTerceiros = [
      [
        'SELECT p.id_registro FROM participacoes p ' +
        'JOIN campanhas c ON c.id_campanha = p.id_campanha ' +
        'JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
        'WHERE h.id_usuario = ? AND p.id_usuario <> ? LIMIT 1 FOR UPDATE',
        [id, id]
      ],
      [
        'SELECT m.id_membro FROM membros_grupo m ' +
        'JOIN grupos g ON g.id_grupo = m.id_grupo ' +
        'WHERE g.id_criador = ? AND m.id_usuario <> ? LIMIT 1 FOR UPDATE',
        [id, id]
      ],
      [
        'SELECT gc.id_grupo_campanha FROM grupos_campanhas gc ' +
        'JOIN campanhas c ON c.id_campanha = gc.id_campanha ' +
        'JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
        'JOIN grupos g ON g.id_grupo = gc.id_grupo ' +
        'WHERE h.id_usuario = ? AND g.id_criador <> ? LIMIT 1 FOR UPDATE',
        [id, id]
      ],
      [
        'SELECT p.id_registro FROM participacoes p ' +
        'JOIN grupos_campanhas gc ON gc.id_grupo_campanha = p.id_grupo_campanha ' +
        'JOIN grupos g ON g.id_grupo = gc.id_grupo ' +
        'WHERE g.id_criador = ? AND p.id_usuario <> ? LIMIT 1 FOR UPDATE',
        [id, id]
      ]
    ];
    for (const [consulta, parametros] of consultasTerceiros) {
      const [linhas] = await conexao.execute(consulta, parametros);
      if (linhas.length) throw erroVinculos();
    }

    // Tudo abaixo afeta apenas o titular. As FKs abortam a transação caso
    // apareça qualquer novo vínculo de terceiros entre leitura e exclusão.
    await conexao.execute('DELETE FROM participacoes WHERE id_usuario = ?', [id]);
    await conexao.execute(
      'DELETE FROM grupos_campanhas WHERE id_grupo IN (SELECT id_grupo FROM grupos WHERE id_criador = ?)',
      [id]
    );
    await conexao.execute(
      'DELETE FROM grupos_campanhas WHERE id_campanha IN (' +
      'SELECT c.id_campanha FROM campanhas c JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
      'WHERE h.id_usuario = ?)',
      [id]
    );
    await conexao.execute('DELETE FROM membros_grupo WHERE id_usuario = ?', [id]);
    await conexao.execute(
      'DELETE FROM membros_grupo WHERE id_grupo IN (SELECT id_grupo FROM grupos WHERE id_criador = ?)',
      [id]
    );
    await conexao.execute('DELETE FROM grupos WHERE id_criador = ?', [id]);
    await conexao.execute(
      'DELETE c FROM campanhas c JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro WHERE h.id_usuario = ?',
      [id]
    );
    await conexao.execute('DELETE FROM hemocentros WHERE id_usuario = ?', [id]);
    const [resultado] = await conexao.execute(
      "DELETE FROM usuarios WHERE id_usuario = ? AND tipo_usuario = 'instituicao'",
      [id]
    );
    if (resultado.affectedRows !== 1) throw new Error('Exclusão incompleta.');
    await conexao.commit();
    return true;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}
