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
        SELECT id_hemocentro, nome_hemo, cep, endereco, cidade, estado, telefone_centro, data_cadastro FROM hemocentros
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
        SELECT id_hemocentro, nome_hemo, cep, endereco, cidade, estado, telefone_centro, data_cadastro FROM hemocentros
        WHE¶»§q«^