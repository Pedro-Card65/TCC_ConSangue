import { con } from './connection.js';

export async function entrarGrupo(membro) {
    const command = `
        INSERT INTO membros_grupo (id_usuario, id_grupo, papel)
        VALUES (?, ?, ?)
    `

    const [result] = await con.query(command, [
        membro.id_usuario,
        membro.id_grupo,
        membro.papel
    ]);

    return result.insertId;
};

export async function listarMembrosPorGrupo(idGrupo) {
    const command = `
        SELECT  m.id_membro,
                m.id_usuario,
                u.nome,
                u.tipo_sanguineo,
                m.papel,
                m.data_entrada
        FROM    membros_grupo m
        JOIN    usuarios u ON u.id_usuario = m.id_usuario
        WHERE   m.id_grupo = ?
        ORDER BY m.data_entrada
    `

    const [linhas] = await con.query(command, [idGrupo]);
    return linhas;
};

export async function listarGruposPorUsuario(idUsuario) {
    const command = `
        SELECT  m.id_membro,
                g.id_grupo,
                g.nome_grupo,
                g.descricao,
                m.papel,
                m.data_entrada
        FROM    membros_grupo m
        JOIN    grupos g ON g.id_grupo = m.id_grupo
        WHERE   m.id_usuario = ?
        ORDER BY m.data_entrada DESC
    `

    const [linhas] = await con.query(command, [idUsuario]);
    return linhas;
};

export async function editarPapel(id, papel) {
    const command = `
        UPDATE  membros_grupo
        SET     papel = ?
        WHERE   id_membro = ?
    `

    const [linhas] = await con.query(command, [papel, id]);

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};

export async function removerMembro(id) {
    const command = `
        DELETE FROM membros_grupo
        WHERE id_membro = ?
    `

    const [linhas] = await con.query(command, [id]);

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};