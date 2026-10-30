import { con } from './connection.js';

export async function criarParticipacao(dados) {
    const sql = `
        INSERT INTO participacoes
        (id_usuario, 
        id_campanha, 
        id_grupo_campanha,
        status_participacao, 
        data_prevista, 
        horario_previsto)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dados.id_usuario,
        dados.id_campanha,
        dados.id_grupo_campanha,
        dados.status_participacao,
        dados.data_prevista,
        dados.horario_previsto
    ];

    const [resultado] = await con.execute(sql, valores);

    return resultado.insertId;
}

export async function listarParticipacoes(filtros) {
    let sql = 'SELECT * FROM participacoes where 1 = 1';

    const valores = [];

    if (filtros.id_usuario !== undefined) {
        sql += ' AND id_usuario = ?';
        valores.push(filtros.id_usuario);
    }

    if (filtros.id_campanha !== undefined) {
        sql += ' AND id_campanha = ?';
        valores.push(filtros.id_campanha);
    }

    sql += ' ORDER BY data_registro DESC';

    const [registros] = await con.execute(sql, valores);

    return registros;
}

export async function buscarParticipacao(id) {
    const sql = `
        SELECT * FROM participacoes
        WHERE id_registro = ?
    `;

    const [registros] = await con.execute(sql, [id]);

    return registros[0] ?? null;
}

export async function buscarUsuario(id) {
    const sql = `
        SELECT id_usuario, tipo_usuario
        FROM usuarios
        WHERE id_usuario = ?
    `;

    const [registros] = await con.execute(sql, [id]);

    return registros[0] ?? null;
}

export async function buscarCampanha(id) {
    const sql = `
        SELECT id_campanha, status_campanha
        FROM campanhas
        WHERE id_campanha = ?
    `;

    const [registros] = await con.execute(sql, [id]);

    return registros[0] ?? null;
}

export async function buscarGrupoCampanha(id) {
    const sql = `
        SELECT id_grupo, id_campanha
        FROM grupos_campanhas
        WHERE id_grupo_campanha = ?
    `;

    const [registros] = await con.execute(sql, [id]);

    return registros[0] ?? null;
}

export async function verificarMembro(idUsuario, idGrupo) {
    const sql = `
        SELECT id_membro FROM membros_grupo
        WHERE id_usuario = ? AND id_grupo = ?
    `;

    const [registros] = await con.execute(sql, [idUsuario, idGrupo]);

    return registros.length > 0;
}

export async function atualizarParticipacao(id, dados) {
    const sql = `
        UPDATE participacoes
        SET id_grupo_campanha = ?,
            status_participacao = ?,
            data_prevista = ?,
            horario_previsto = ?
        WHERE id_registro = ?
    `;

    const valores = [
        dados.id_grupo_campanha,
        dados.status_participacao,
        dados.data_prevista,
        dados.horario_previsto,
        id
    ];

    const [resultado] = await con.execute(sql, valores);

    return resultado.affectedRows;
}

export async function excluirParticipacao(id) {
    const sql = `
        DELETE FROM participacoes
        WHERE id_registro = ?
    `;

    const [resultado] = await con.execute(sql, [id]);

    return resultado.affectedRows;
}


