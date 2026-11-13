import { con } from './connection.js';

// Nenhuma alteração de tabela durante requisições: aplicar a migração SQL com backup.
async function garantirFotoCampanha() {
    const [colunas] = await con.execute(
        "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'campanhas' AND COLUMN_NAME = 'foto_campanha' LIMIT 1"
    );
    if (!colunas.length) {
        const erro = new Error('O banco ainda precisa da migração da coluna de foto da campanha.');
        erro.status = 503;
        throw erro;
    }
}

export async function atualizarFotoCampanha(id, foto) {
    await garantirFotoCampanha();
    const [resultado] = await con.execute('UPDATE campanhas SET foto_campanha = ? WHERE id_campanha = ?', [foto, id]);
    return resultado.affectedRows;
}

export async function criarCampanha(campanha){
    const comFoto = campanha.foto_campanha != null;
    if (comFoto) await garantirFotoCampanha();
    const command = `
    insert into campanhas (id_hemocentro, nome_campanha, descricao, data_inicio, data_fim, horario_inicio, horario_fim, status_campanha${comFoto ? ', foto_campanha' : ''})
    values (?, ?, ?, ?, ?, ?, ?, ?${comFoto ? ', ?' : ''}) `

    const [result] = await con.query(command, [
        campanha.id_hemocentro,
        campanha.nome_campanha,
        campanha.descricao,
        campanha.data_inicio,
        campanha.data_fim,
        campanha.horario_inicio,
        campanha.horario_fim,
        campanha.status_campanha,
        ...(comFoto ? [campanha.foto_campanha] : [])
    ]);

    return result.insertId;
};

// Os dados do hemocentro permitem pesquisar e exibir a localização real.
export async function listarCampanhas(){
    const [linhas] = await con.query(`
        SELECT c.*, h.nome_hemo, h.endereco, h.cidade, h.estado, h.telefone_centro
        FROM campanhas c
        JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro
        ORDER BY c.data_inicio DESC, c.id_campanha DESC
    `);
    return linhas;
};

export async function listarCampanhasPorNome(nome){
    const [linhas] = await con.query(`
        SELECT c.*, h.nome_hemo, h.endereco, h.cidade, h.estado, h.telefone_centro
        FROM campanhas c
        JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro
        WHERE c.nome_campanha LIKE ? OR h.nome_hemo LIKE ?
        ORDER BY c.data_inicio DESC, c.id_campanha DESC
    `, [`%${nome}%`, `%${nome}%`]);
    return linhas;
};

export async function listarCampanhasPorHemocentro(id_hemocentro){
    const command = `
    select *
    from campanhas
    where id_hemocentro = ? `

    const [result] = await con.query(command, [
        id_hemocentro
    ]);

    return result;
};

export async function editarCampanha(campanha, id){
    const command = `
    update campanhas
    set nome_campanha = ?, 
        descricao = ?, 
        data_inicio = ?, 
        data_fim = ?, 
        horario_inicio = ?, 
        horario_fim = ?, 
        status_campanha = ?
    where id_campanha = ? and id_hemocentro = ?`

    const [linhas] = await con.query(command, [
        campanha.nome_campanha,
        campanha.descricao,
        campanha.data_inicio,
        campanha.data_fim,
        campanha.horario_inicio,
        campanha.horario_fim,
        campanha.status_campanha,
        id,
        campanha.id_hemocentro
    ]);

    let result = linhas.affectedRows;
    return result;
};

export async function apagarCampanha(id){
    const command = `
    delete from campanhas
        where id_campanha = ? `

    const [linhas] = await con.query(command, [
        id
    ])
     let result = linhas.affectedRows;
     return result;
};