import { con } from './connection.js';

export async function buscarPainelPorUsuario(idUsuario) {
    const [instituicoes] = await con.execute(`
        SELECT h.*,
            (SELECT COUNT(*) FROM campanhas c
             WHERE c.id_hemocentro = h.id_hemocentro) AS total_campanhas,
            (SELECT COUNT(DISTINCT gc.id_grupo) FROM grupos_campanhas gc
             JOIN campanhas c ON c.id_campanha = gc.id_campanha
             WHERE c.id_hemocentro = h.id_hemocentro) AS total_grupos,
            (SELECT COUNT(*) FROM participacoes p
             JOIN campanhas c ON c.id_campanha = p.id_campanha
             WHERE c.id_hemocentro = h.id_hemocentro
               AND p.status_participacao = 'pretende_ir') AS total_agendamentos
        FROM hemocentros h WHERE h.id_usuario = ? LIMIT 1
    `, [idUsuario]);
    return instituicoes[0] ?? null;
}

export async function listarInstituicoes(cidade) {
    let sql = `
        SELECT * FROM hemocentros
    `;

    const parametros = [];

    if (cidade) {
        sql += ' WHERE cidade LIKE ?';
        parametros.push(`%${cidade}%`);
    }

    sql += ' ORDER BY nome_hemo';

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
        dados.nome_hemo,
        dados.cep,
        dados.endereco,
        dados.cidade,
        dados.estado,
        dados.telefone_centro,
        id
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

export async function listarAdesaoPorCampanha(idUsuario) {
    const [linhas] = await con.execute(`
        SELECT c.id_campanha,
               COUNT(DISTINCT CASE WHEN p.status_participacao = 'interessado' THEN p.id_usuario END) AS interessados,
               COUNT(DISTINCT CASE WHEN p.status_participacao = 'pretende_ir' THEN p.id_usuario END) AS pretendem_ir,
               COUNT(DISTINCT CASE WHEN p.status_participacao = 'comparecimento_informado' THEN p.id_usuario END) AS comparecimentos_informados,
               COUNT(DISTINCT gc.id_grupo) AS grupos_vinculados
        FROM campanhas c
        JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro
        LEFT JOIN participacoes p ON p.id_campanha = c.id_campanha
        LEFT JOIN grupos_campanhas gc ON gc.id_campanha = c.id_campanha
        WHERE h.id_usuario = ?
        GROUP BY c.id_campanha
    `, [idUsuario]);
    return linhas;
}
