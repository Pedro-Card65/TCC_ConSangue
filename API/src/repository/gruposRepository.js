import { con } from './connection.js';

//Finalizado

export async function criarGrupo(grupo) {
    const command = `
        INSERT INTO grupos (nome_grupo, descricao, id_criador)
        VALUES (?, ?, ?)
    `
    const [result] = await con.query(command, [
        grupo.nome_grupo,
        grupo.descricao,
        grupo.id_criador
    ]);

    return result.insertId;
}

export async function listarGrupos() {
    const command = `
        SELECT  id_grupo,
                nome_grupo,
                descricao,
                id_criador,
                data_criacao
        FROM    grupos;
    `
    const [linhas] = await con.query(command, []);
    return linhas;
};

export async function listarGruposPorNome(nome) {
    const command = `
        SELECT  id_grupo,
                nome_grupo,
                descricao,
                id_criador,
                data_criacao
        FROM    grupos
        WHERE nome_grupo LIKE ?
    `
    const [linhas] = await con.query(command, [
        `%${nome}%`
    ])
    return linhas;
};

export async function editarGrupo(grupo, id) {
    const command = `
        UPDATE  grupos
        SET     nome_grupo = ?,
                descricao = ?
        WHERE   id_grupo = ?
        AND     id_criador = ?
    `

    const [linhas] = await con.query(command, [
        grupo.nome_grupo,
        grupo.descricao,
        id,
        grupo.id_criador
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};

export async function apagarGrupo(id) {
    const command = `
        DELETE FROM grupos
            WHERE id_grupo = ?
    `

    const [linhas] = await con.query(command, [
        id
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};