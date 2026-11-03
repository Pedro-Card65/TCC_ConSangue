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
        `SELECT id_grupo_campanha, id_grupo, id_campanha, meta_participacoes, data_entrada
         FROM grupos_campanhas ORDER BY data_entrada DESC`
    );
    return linhas;
}

export async function listarGruposCampanhaPorId(id) {
    const [linhas] = await con.execute(
        `SELECT id_grupo_campanha, id_grupo, id_campanha, meta_participacoes, data_entrada
         FROM grupos_campanhas WHERE id_grupo_campanha = ?`,
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
