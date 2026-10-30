import * as repository from '../repository/participacoesRepository.js';

function erroHttp(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(valor, campo = 'ID') {

    if (
        (typeof valor !== 'string' && typeof valor !== 'number') ||
        !/^[1-9]\d*$/.test(String(valor))
    ) {
        throw erroHttp(`${campo} inválido`);
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw erroHttp(`${campo} inválido`);
    }

    return id;
}

function validarData(data) {
    if (data == null) return null;

    if (typeof data !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw erroHttp('Data prevista inválida');
    }

    const dataConvertida = new Date(`${data}T00:00:00Z`);

    if (Number.isNaN(dataConvertida.getTime()) ||
    dataConvertida.toISOString().slice(0, 10) !== data) {
        throw erroHttp('Data prevista inválida');
    }

    return data;
}


function validarHorario(horario) {
    if (horario == null) return null;

    if (typeof horario !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(horario)) {
        throw erroHttp('Horário previsto inválido');
    }

    return horario.length === 5
    ? `${horario}:00`
    : horario;
}

function validarDados(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw erroHttp('Informe os dados da participação');
    }

    const status = dados.status_participacao ?? 'interessado';

    const statusPermitidos = [
        'interessado',
        'pretende_ir',
        'comparecimento_informado'
    ];

    if(!statusPermitidos.includes(status)) {
        throw erroHttp('Status da participação inválido');
    }

    return{
        id_grupo_campanha: dados.id_grupo_campanha == null
        ? null
        : validarId(dados.id_grupo_campanha, 'ID do vínculo'),

        status_participacao: status,
        data_prevista: validarData(dados.data_prevista),
        horario_previsto: validarHorario(dados.horario_previsto)
    };
}

async function validarVinculo(idUsuario, idCampanha, idVinculo) {
    if (idVinculo === null) return;

    const vinculo = await repository.buscarGrupoCampanha(idVinculo);

    if (!vinculo || vinculo.id_campanha !== idCampanha) {
        throw erroHttp('Grupo não está vinculado à campanha', 422);
    }

    const membro =await repository.verificarMembro(
        idUsuario,
        vinculo.id_grupo
    );

    if (!membro) {
        throw erroHttp('Usuário não pertence ao grupo informado', 422);
    }
}

export async function criarParticipacao(dados) {
    const idUsuario = validarId(dados?.id_usuario, 'ID do usuário');

    const idCampanha = validarId(dados?.id_campanha, 'ID da campanha');

    const campos = validarDados(dados);

    const usuario = await repository.buscarUsuario(idUsuario);

    if (!usuario) {
        throw erroHttp('Usuário não encontrado', 404);
    }

    if (usuario.tipo_usuario !== 'candidato') {
        throw erroHttp(
            'Somente candidatos podem registrar participação', 
            422
        );
    }
    
    const campanha = await repository.buscarCampanha(idCampanha);

    if (!campanha) {
        throw erroHttp('Campanha não encontrada', 404);
    }

    if (campanha.status_campanha !== 'ativa') {
        throw erroHttp('Campanha não está ativa', 422);
    }

    await validarVinculo(
        idUsuario,
        idCampanha,
        campos.id_grupo_campanha
    );

    const id = await repository.criarParticipacao({
        id_usuario: idUsuario,
        id_campanha: idCampanha,
        ...campos
    });

    return repository.buscarParticipacao(id);
}

export async function listarParticipacoes(filtros = {}) {
    const validados = {};

    if (filtros.id_usuario !== undefined) {
        validados.id_usuario = validarId (filtros.id_usuario, 'ID do usuário');
    }

    if (filtros.id_campanha !== undefined) {
        validados.id_campanha = validarId (filtros.id_campanha, 'ID da campanha');
    }

    return repository.listarParticipacoes(validados);
}

export async function buscarParticipacao(id) {
    const participacao = await repository.buscarParticipacao(
        validarId(id)
    );

    if (!participacao) {
        throw erroHttp('Participação não encontrada', 404);
    }

    return participacao;
}

export async function atualizarParticipacao(id, dados) {
    const idValidado = validarId(id);

    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw erroHttp('Dados inválidos');
    }

    if('id_usuario' in dados || 'id_campanha' in dados) {
        throw erroHttp('Não é permitido trocar usuário ou campanha');
    }

    const atual = await buscarParticipacao(idValidado);

    const campos = validarDados({
        id_grupo_campanha:
            dados.id_grupo_campanha === undefined
            ? atual.id_grupo_campanha 
            : dados.id.id_grupo_campanha,

        status_participacao:
            dados.status_participacao === undefined
                ? atual.status_participacao
                : dados.status_participacao,

        data_prevista:
            dados.data_prevista === undefined
                ? (atual.data_prevista instanceof Date
                    ? atual.data_prevista.toISOString().slice(0, 10)
                    : atual.data_prevista)
                : dados.data_prevista,

        horario_previsto:
            dados.horario_previsto === undefined
                ? atual.horario_previsto
                : dados.horario_previsto
    });

    await validarVinculo(
        atual.id_usuario,
        atual.id_campanha,
        campos.id_grupo_campanha
    );

    await repository.atualizarParticipacao(
        idValidado,
        campos
    );

    return buscarParticipacao(idValidado);
}

export async function excluirParticipacao(id) {
    const idValidado = validarId(id);

    const excluidos = await repository.excluirParticipacao(
        idValidado
    );

    if (!excluidos) {
        throw erroHttp('Participação não encontrada', 404);
    }
}