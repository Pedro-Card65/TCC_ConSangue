import { con } from './connection.js';

//Finalizado

export async function criarCampanha(campanha){
    const command = `
    insert into campanhas (id_hemocentro, nome_campanha, descricao, data_inicio, data_fim, horario_inicio, horario_fim, status_campanha)
    values (?, ?, ?, ?, ?, ?, ?, ?) `

    const [result] = await con.query(command, [
        campanha.id_hemocentro,
        campanha.nome_campanha,
        campanha.descricao,
        campanha.data_inicio,
        campanha.data_fim,
        campanha.horario_inincio,
        campanha.horario_fim,
        campanha.status_campanha
    ]);

    return result.insertId;
};

export async function listarCampanhas(){
    const command = `
    select
        id_campanha,
        id_hemocentro,
        nome_campanha,
        descricao,
        data_inicio,
        data_fim,
        horario_inicio,
        horario_fim,
        status_campanha
    from campanhas `

    const [linhas] = await con.query(command, []);
    return linhas;
};

export async function listarCampanhasPorNome(nome){
    const command = `
    select
        id_campanha,
        id_hemocentro,
        nome_campanha,
        descricao,
        data_inicio,
        data_fim,
        horario_inicio,
        horario_fim,
        status_campanha
    from campanhas
    where nome_campanha like ? `

    const [result] = await con.query(command, [
        `%${nome}%`
    ]);

    return result;
};

export async function listarCampanhasPorHemocentro(id_hemocentro){
    const command = `
    select
        id_campanha,
        id_hemocentro,
        nome_campanha,
        descricao,
        data_inicio,
        data_fim,
        horario_inicio,
        horario_fim,
        status_campanha
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