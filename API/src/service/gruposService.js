import * as dbGrupos from '../repository/gruposRepository.js';

//Finalizado

export async function criarGrupoService(grupo) {
    if (!grupo.nome_grupo.trim() || !grupo.descricao.trim() || !grupo.id_criador) {
        throw new Error('Nome do Grupo, Descrição e ID do criador são obrigatórios')
    }

    return dbGrupos.criarGrupo(grupo);
};

export async function listarGruposService() {
    return dbGrupos.listarGrupos();
};

export async function listarGruposPorNomeService(nome) {
    return dbGrupos.listarGruposPorNome(nome);
};

export async function editarGrupoService(grupo, id) {
    if (!grupo.nome_grupo.trim() || !grupo.descricao.trim()) {
        throw new Error('Nome do Grupo e Descrição são obrigatórios')
    }

    return dbGrupos.editarGrupo(grupo, id);
};

export async function apagarGrupoService(id) {
    return dbGrupos.apagarGrupo(id);
};