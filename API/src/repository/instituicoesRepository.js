import { con } from './connection.js';

export async function listarInstituicoes(cidade) {
    let sql = `
        SELECT * FROM hemocentros
    `;

    const parametros = [];

    if (cidade) {
        sql += ' WHERE cidade LIKE ?';
        parametros.push(`%${cidade}%`);
    }

    sql += 'ORDER BY nome_hemo';

    const [registros] = await con.execute(sql, parametros);

    return registros;
}

export async function buscarInstituicao(id) {
    const sql = `
        SELECT * FROM hemocentros
        WHERE id_hemocentro = ?
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

export async function inserirInstituicao(dados) {
    const sql = `
        INSERT INTO hemocentros
        (id_usuario, nome_hemo, cep, endereco, cidade, estado, telefone_centro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

    const valores = [
        dados.id_usuario,
        dados.nome_hemo,
        dados.cep,
        dados.endereco,
        dados.cidade,
        dados.estado,
        dados.telefone_centro
    ];

    const [resultado] = await con.execute(sql, valores);

    return resultado.insertId;
}

export async function atualizarInstituicao(id, dados) {
    const sql = `
        UPDATE hemocentros
        SET nome_hemo = ?,
            cep = ?,
            endereco = ?,
            cidade = ?,
            estado = ?,
            telefone_centro = ?
        WHERE id_hemocentro = ?
        `;

    const valores = [
        dados.id_usuario,
        dados.nome_hemo,
        dados.cep,
        dados.endereco,
        dados.cidade,
        dados.estado,
        dados.telefone_centro
    ];

    const [resultado] = await con.execute(sql, valores);

    return resultado.affectedRows;
}

export async function excluirInstituicao(id) {
    const sql = `
        DELETE FROM hemocentros
        WHERE id_hemocentro = ?
    `;

    const [resultado] = await con.execute(sql, [id]);

    return resultado.affectedRows;
}