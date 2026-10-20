import * as dbMembro from '../repository/membro_grupoRepository.js';

const PAPEIS = ['administrador', 'membro'];

function validarId(valor, campo) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(`${campo} inválido`);
    }

    return id;
};

export async function entrarGrupoService(membro) {
    const id_usuario = validarId(membro.id_usuario, 'ID do usuário');
    const id_grupo = validarId(membro.id_grupo, 'ID do grupo');
    const papel = membro.papel ?? 'membro';

    if (!PAPEIS.includes(papel)) {
        throw new Error("Papel deve ser 'administrador' ou 'membro'");
    }

    return dbMembro.entrarGrupo({ id_usuario, id_grupo, papel });
};

export async function listarMembrosPorGrupoService(idGrupo) {
    return dbMembro.listarMembrosPorGrupo(validarId(idGrupo, 'ID do grupo'));
};

export async function listarGruposPorUsuarioService(idUsuario) {
    return dbMembro.listarGruposPorUsuario(validarId(idUsuario, 'ID do usuário'));
};

export async function editarPapelService(id, papel) {
    const idMembro = validarId(id, 'ID do membro');

    if (!PAPEIS.includes(papel)) {
        throw new Error("Papel deve ser 'administrador' ou 'membro'");
    }

    const linhas = await dbMembro.editarPapel(idMembro, papel);

    if (linhas === 0) {
        throw new Error('Membro não encontrado');
    }

    return linhas;
};

export async function removerMembroService(id) {
    const linhas = await dbMembro.removerMembro(validarId(id, 'ID do membro'));

    if (linhas === 0) {
        throw new Error('Membro não encontrado');
    }

    return linhas;
};