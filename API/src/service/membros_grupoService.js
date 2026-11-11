import * as dbMembro from '../repository/membros_grupoRepository.js';
import { buscarIdPorCodigoConvite } from '../repository/gruposRepository.js';
import { validarConviteDeEntrada } from '../utils/codigoConvite.js';
import { erroHttp } from '../utils/erroHttp.js';

const PAPEIS = ['administrador', 'membro'];

function validarId(valor, campo) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw erroHttp(400, `${campo} inválido`);
    }

    return id;
};

export async function entrarGrupoService(membro) {
    const id_usuario = validarId(membro.id_usuario, 'ID do usuário');
    const codigo = validarConviteDeEntrada(membro);
    const id_grupo = await buscarIdPorCodigoConvite(codigo);
    if (!id_grupo) throw erroHttp(404, 'Código de convite não encontrado.');
    const papel = 'membro';

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
        throw erroHttp(400, "Papel deve ser 'administrador' ou 'membro'");
    }

    const linhas = await dbMembro.editarPapel(idMembro, papel);

    if (linhas === 0) {
        throw erroHttp(404, 'Membro não encontrado');
    }

    return linhas;
};

export async function removerMembroService(id) {
    const linhas = await dbMembro.removerMembro(validarId(id, 'ID do membro'));

    if (linhas === 0) {
        throw erroHttp(404, 'Membro não encontrado');
    }

    return linhas;
};