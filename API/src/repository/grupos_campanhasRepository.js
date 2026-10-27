import { con } from './connection.js';

//Finalizado

export async function criarGrupoCampanha(grupo) {
    const command = `
        INSERT INTO grupos (id_grupo, id_capanha, meta_participacoes, data_entrada)
        VALUES (?, ?, ?, ?)
    `
    const [result] = await con.query(command, [
        grupo.id_grupo,
        grupo.id_capanha,
        grupo.meta_participacoes,
        grupo.data_entrada
    ]);

    return result.insertId;
};

export async function listarGruposCampanha() {
    const command = `
        SELECT  id_grupo, 
                id_capanha, 
                meta_participacoes, 
                data_entrada
        FROM    grupos_campanhas;
    `
    const [linhas] = await con.query(command, []);
    return linhas;
};

export async function listarGruposCampanhaPorId(id) {
    const command = `
        SELECT  id_grupo, 
                id_capanha, 
                meta_participacoes, 
                data_entrada
        FROM    grupos_campanhas
        WHERE nome_grupo LIKE ?
    `
    const [linhas] = await con.query(command, [
        `%${id}%`
    ])
    return linhas;
};

export async function editarGrupocampanha(grupo, id) {
    const command = `
        UPDATE  grupos_campanhas
        SET     id_capanha = ?,
                meta_participacoes = ?,
                data_entrada = ?
        WHERE   id_grupo_campanha = ?
    `

    const [linhas] = await con.query(command, [
        grupo.id_capanha,
        grupo.meta_participacoes,
        grupo.data_entrada,
        id
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};

export async function apagarGrupoCampanha(id) {
    const command = `
        DELETE FROM grupos_campanhas
            WHERE id_grupo_campanha = ?
    `

    const [linhas] = await con.query(command, [
        id
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};