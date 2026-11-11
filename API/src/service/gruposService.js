
import * as dbGrupos from '../repository/gruposRepository.js';
import { validarVisibilidadeGrupo } from '../utils/visibilidadeGrupo.js';


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

    if (Object.prototype.hasOwnProperty.call(grupo, 'foto_grupo')) {
        const foto = grupo.foto_grupo;
        if (foto !== null) {
            if (typeof foto !== 'string' || !foto.startsWith('data:image/jpeg;base64,')
                || foto.length > 300 * 1024) {
                throw criarErro('A foto do grupo deve ser JPEG e ter até 300 KB.');
            }
            const dados = foto.slice('data:image/jpeg;base64,'.length);
            if (!/^[A-Za-z0-9+/]+={0,2}$/.test(dados)) {
                throw criarErro('Foto do grupo inválida.');
            }
            const bytes = Buffer.from(dados, 'base64');
            if (bytes.length < 4 || bytes.length > 220 * 1024
                || bytes[0] !== 0xff || bytes[1] !== 0xd8
                || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
                throw criarErro('Formato ou tamanho de foto do grupo inválido.');
            }
        }
    }

    return {
        ...grupo,
        nome_grupo,
        descricao,
        ...(Object.prototype.hasOwnProperty.call(grupo, 'visibilidade')
            ? { visibilidade: validarVisibilidadeGrupo(grupo.visibilidade) }
            : {})
    };
}

export async function criarGrupoService(grupo) {
    const dados = validarDadosGrupo(grupo);

    if (!Number.isSafeInteger(Number(dados.id_criador)) ||
        Number(dados.id_criador) <= 0) {
        throw criarErro('ID do criador inválido.');
    }

    return dbGrupos.criarGrupo({ ...dados, visibilidade: validarVisibilidadeGrupo(dados.visibilidade) });
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
