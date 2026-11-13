import * as dbCampanhas from '../repository/campanhasRepository.js';
import { erroHttp } from '../utils/erroHttp.js';

const fotosExemplo = new Set([
    '/assets/images/campanha-solidariedade.webp',
    '/assets/images/campanha-comunidade.webp'
]);

export function validarFotoCampanha(foto) {
    if (foto === null) return null;
    if (typeof foto !== 'string') throw erroHttp(400, 'Foto da campanha inválida.');
    if (fotosExemplo.has(foto)) return foto;
    if (foto.length > 300 * 1024) throw erroHttp(400, 'A foto deve ocupar no máximo 300 KB.');
    const partes = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(foto);
    if (!partes) throw erroHttp(400, 'Envie uma imagem JPEG, PNG ou WEBP.');
    const bytes = Buffer.from(partes[2], 'base64');
    const formatoValido = partes[1] === 'jpeg'
        ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        : partes[1] === 'png'
            ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!formatoValido) throw erroHttp(400, 'O conteúdo da foto não corresponde ao formato informado.');
    return foto;
}

export async function atualizarFotoCampanhaService(id, foto) {
    const idCampanha = validarId(id, 'ID da campanha');
    return dbCampanhas.atualizarFotoCampanha(idCampanha, validarFotoCampanha(foto));
}

function validarId(valor, campo = 'ID') {
    const id = Number(valor);

    if (
        !/^[1-9]\d*$/.test(String(valor)) ||
        !Number.isSafeInteger(id)
    ) {
        throw erroHttp(400, `${campo} inválido.`);
    }

    return id;
}

function validarData(valor, campo) {
    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        throw erroHttp(400, `${campo} inválida.`);
    }

    const data = new Date(`${valor}T00:00:00Z`);

    if (
        Number.isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== valor
    ) {
        throw erroHttp(400, `${campo} inválida.`);
    }

    return valor;
}

function validarHorario(valor, campo) {
    if (valor === undefined || valor === null || valor === '') {
        return null;
    }

    if (
        typeof valor !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(valor)
    ) {
        throw erroHttp(400, `${campo} inválido.`);
    }

    return valor.length === 5
        ? `${valor}:00`
        : valor;
}

function validarDadosCampanha(campanha) {
    if (
        !campanha ||
        typeof campanha !== 'object' ||
        Array.isArray(campanha)
    ) {
        throw erroHttp(400, 'Dados da campanha inválidos.');
    }

    const id_hemocentro = validarId(
        campanha.id_hemocentro,
        'ID do hemocentro'
    );

    if (
        typeof campanha.nome_campanha !== 'string' ||
        !campanha.nome_campanha.trim()
    ) {
        throw erroHttp(400, 'Nome da campanha é obrigatório.');
    }

    const nome_campanha = campanha.nome_campanha.trim();

    if (nome_campanha.length > 100) {
        throw erroHttp(
            400,
            'O nome da campanha pode ter até 100 caracteres.'
        );
    }

    let descricao = null;

    if (campanha.descricao != null) {
        if (typeof campanha.descricao !== 'string') {
            throw erroHttp(400, 'Descrição inválida.');
        }

        descricao = campanha.descricao.trim() || null;
    }

    const data_inicio = validarData(
        campanha.data_inicio,
        'Data de início'
    );

    const data_fim = validarData(
        campanha.data_fim,
        'Data de término'
    );

    if (data_inicio > data_fim) {
        throw erroHttp(
            400,
            'A data de início não pode ser maior que a data de término.'
        );
    }

    const horario_inicio = validarHorario(
        campanha.horario_inicio,
        'Horário de início'
    );

    const horario_fim = validarHorario(
        campanha.horario_fim,
        'Horário de término'
    );

    if (
        data_inicio === data_fim &&
        horario_inicio !== null &&
        horario_fim !== null &&
        horario_inicio >= horario_fim
    ) {
        throw erroHttp(
            400,
            'O horário de término deve ser posterior ao horário de início.'
        );
    }

    const statusPermitidos = ['ativa', 'encerrada'];

    if (!statusPermitidos.includes(campanha.status_campanha)) {
        throw erroHttp(
            400,
            "O status deve ser 'ativa' ou 'encerrada'."
        );
    }

    return {
        id_hemocentro,
        nome_campanha,
        descricao,
        data_inicio,
        data_fim,
        horario_inicio,
        horario_fim,
        status_campanha: campanha.status_campanha
    };
}

export async function criarCampanhaService(campanha) {
    const dados = validarDadosCampanha(campanha);
    dados.foto_campanha = campanha.foto_campanha == null ? null : validarFotoCampanha(campanha.foto_campanha);
    return dbCampanhas.criarCampanha(dados);
}

export async function listarCampanhaService() {
    return dbCampanhas.listarCampanhas();
}

export async function listarCampanhasPorNomeService(nome) {
    if (
        typeof nome !== 'string' ||
        !nome.trim() ||
        nome.trim().length > 100
    ) {
        throw erroHttp(400, 'Nome de busca inválido.');
    }

    return dbCampanhas.listarCampanhasPorNome(nome.trim());
}

export async function listarCampanhasPorHemocentroService(id_hemocentro) {
    const id = validarId(id_hemocentro, 'ID do hemocentro');

    return dbCampanhas.listarCampanhasPorHemocentro(id);
}

export async function editarCampanhaService(campanha, id) {
    const idCampanha = validarId(id, 'ID da campanha');
    const dados = validarDadosCampanha(campanha);

    return dbCampanhas.editarCampanha(dados, idCampanha);
}

export async function apagarCampanhaService(id) {
    const idCampanha = validarId(id, 'ID da campanha');

    return dbCampanhas.apagarCampanha(idCampanha);
}