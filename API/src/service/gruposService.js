import * as dbGrupos from '../repository/gruposRepository.js';

//Finalizado

export async function criarGrupoService(grupo) {
    if (typeof grupo?.nome_grupo !== 'string' || !grupo.nome_grupo.trim() ||
        typeof grupo?.descricao !== 'string' || !grupo.descricao.trim() ||
        !Number.isSafeInteger(grupo?.id_criador) || grupo.id_criador <= 0) {
        const erro = new Error('Nome do Grupo, Descrição e ID do criador são obrigatórios');
        erro.status = 400;
        throw erro;
    }
    const nome = grupo.nome_grupo.trim();
    const descricao = grupo.descricao.trim();
    if ([...nome].length > 100 || [...descricao].length > 255) {
        const erro = new Error('Nome deve ter até 100 caracteres e descrição até 255.');
        erro.status = 400;
        throw erro;
    }
    return dbGrupos.criarGrupo({ nome_grupo: nome, descricao, id_criador: grupo.id_criador });
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
