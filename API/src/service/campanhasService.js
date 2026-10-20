import * as dbCampanhas from '../repository/campanhasRepository.js';

export async function criarCampanhaService(campanha){
    if(!campanha.id_hemocentro || !campanha.nome_campanha || !campanha.data_inicio || !campanha.data_fim || !campanha.status_campanha){
        throw new Error('Todos os campos são obrigatórios');
    }

    return await dbCampanhas.criarCampanha(campanha);
};

export async function listarCampanhaService(){
    return await dbCampanhas.listarCampanhas();
};

export async function listarCampanhasPorNomeService(nome){
    if(!nome){
        throw new Error('O campo nome é obrigatório');
    }

    return await dbCampanhas.listarCampanhasPorNome(nome);
};

export async function listarCampanhasPorHemocentroService(id_hemocentro){
    if(!id_hemocentro){
        throw new Error('O campo id_hemocentro é obrigatório');
    }

    return await dbCampanhas.listarCampanhasPorHemocentro(id_hemocentro);
};

export async function editarCampanhaService(campanha, id){
    if(!campanha.id_hemocentro || !campanha.nome_campanha || !campanha.data_inicio || !campanha.data_fim || !campanha.status_campanha){
        throw new Error('Todos os campos são obrigatórios');
    }

    return await dbCampanhas.editarCampanha(campanha, id);
};

export async function apagarCampanhaService(id){
    if(!id){
        throw new Error('O campo id é obrigatório');
    }

    return await dbCampanhas.apagarCampanha(id);
};