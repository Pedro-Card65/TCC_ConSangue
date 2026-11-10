
import * as dbGrupos from '../repository/gruposRepository.js';


function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// Finalizado

function validarDadosGrupo(grupo) {
    if (!grupo || typeof grupo !== 'object' || Array.isArray(grupo)) {
        throw criarErro('Dados do grupo inválidos.');
    }

    if (typeof grupo.nome_grupo !== 'string' ||
        typeof grupo.descricao !== 'string') {
        throw criarErro('Nome e descrição devem ser textos.');
    }

    const nome_grupo = grupo.nome_grupo.trim();
    const descricao = grupo.descricao.trim();

    if (!nome_grupo || !descricao) {
        throw criarErro('Nome e descrição são obrigatórios.');
    }

    if (nome_grupo.length > 100) {
        throw criarErro('O nome pode ter até 100 caracteres.');
    }

    if (descricao.length > 255) {
        throw criarErro('A descrição pode ter até 255 caracteres.');
    }

    return { ...grupo, nome_grupo, descricao };
}

export async function criarGrupoService(grupo) {
    const dados = validarDadosGrupo(grupo);

    if (!Number.isSafeInteger(Number(dados.id_criador)) ||
        Number(dados.id_criador) <= 0) {
        throw criarErro('ID do criador inválido.');
    }

    return dbGrupos.criarGrupo(dados);
}

export async function listarGruposService() {
    return dbGrupos.listarGrupos();
}

export async function listarGruposPorNomeService(nome) {
    return dbGrupos.listarGruposPorNome(nome);
}

export async function editarGrupoService(grupo, id) {
    const dados = validarDadosGrupo(grupo);
    return dbGrupos.editarGrupo(dados, id);
}

export async function apagarGrupoService(id) {
    return dbGrupos.apagarGrupo(id);
}
