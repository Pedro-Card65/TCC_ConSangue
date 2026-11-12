import { con } from './connection.js';

export async function criarGrupoCampanha(dados) {
    const [result] = await con.execute(
        `INSERT INTO grupos_campanhas (id_grupo, id_campanha, meta_participacoes)
         VALUES (?, ?, ?)`,
        [dados.id_grupo, dados.id_campanha, dados.meta_participacoes]
    );
    return result.insertId;
}

export async function listarGruposCampanha() {
    const [linhas] = await con.execute(
        `SELECT gc.id_grupo_campanha, gc.id_grupo, gc.id_campanha,
                gc.meta_participacoes, gc.data_entrada,
                (SELECT COUNT(DISTINCT p.id_usuario) FROM participacoes p
                 WHERE p.id_grupo_campanha = gc.id_grupo_campanha
                   AND p.status_participacao IN ('pretende_ir', 'comparecimento_informado')) AS total_participacoes,
                (SELECT COUNT(DISTINCT p.id_usuario) FROM participacoes p
                 WHERE p.id_grupo_campanha = gc.id_grupo_campanha
                   AND p.status_participacao = 'interessado') AS total_interessados
         FROM grupos_campanhas gc ORDER BY gc.data_entrada DESC`
    );
    return linhas;
}

export async function listarGruposCampanhaPorId(id) {
    const [linhas] = await con.execute(
        `SELECT gc.id_grupo_campanha, gc.id_grupo, gc.id_campanha,
                gc.meta_participacoes, gc.data_entrada,
                (SELECT COUNT(DISTINCT p.id_usuario) FROM participacoes p
                 WHERE p.id_grupo_campanha = gc.id_grupo_campanha
                   AND p.status_participacao IN ('pretende_ir', 'comparecimento_informado')) AS total_participacoes,
                (SELECT COUNT(DISTINCT p.id_usuario) FROM participacoes p
                 WHERE p.id_grupo_campanha = gc.id_grupo_campanha
                   AND p.status_participacao = 'interessado') AS total_interessados
         FROM grupos_campanhas gc WHERE gc.id_grupo_campanha = ?`,
        [id]
    );
    return linhas[0] ?? null;
}

export async function editarGrupocampanha(meta, id) {
    const [result] = await con.execute(
        `UPDATE grupos_campanhas SET meta_participacoes = ?
         WHERE id_grupo_campanha = ?`,
        [meta, id]
    );
    return result.affectedRows;
}

export async function apagarGrupoCampanha(id) {
    const [result] = await con.execute(
        `DELETE FROM grupos_campanhas WHERE id_grupo_campanha = ?`, [id]
    );
    return result.affectedRows;
}
