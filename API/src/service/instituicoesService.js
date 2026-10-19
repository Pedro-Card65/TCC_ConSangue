import * as repository from '../repository/instituicoesRepository.js';

function erroHttp(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(valor) {
    const id = Number(valor);

    if (
        valor == null || typeof valor === 'boolean' ||
        !Number.isSafeInteger(id) || id <= 0
    ) {
        throw erroHttp('ID inválido');
    }

    return id;
}

function textoObrigatorio(valor, campo, limite) {
    if (
        typeof valor !== 'string' || !valor.trim() ||
        valor.trim().length > limite
    ) {
        throw erroHttp(`Campo ${campo} inválido`);
    }

    return valor.trim();
}

function validarDados(dados) {
    if (!dados || typeof dados !== 'object' ||
        Array.isArray(dados)
    ) {
        throw erroHttp('Informe os dados da instituição');
    }
    const resultado = {
        nome_hemo: textoObrigatorio(
            dados.nome_hemo, 'nome_hemo', 100
            ),
            cep: textoObrigatorio(dados.cep, 'cep', 9),
            endereco: textoObrigatorio(
                dados.endereco, 'endereco', 255
            ),
            cidade: textoObrigatorio(
                dados.cidade, 'cidade', 100
            ),
            estado: textoObrigatorio(
                dados.estado, 'estado', 2
            ).toUpperCase(),
            telefone_centro: textoObrigatorio(
                dados.telefone_centro, 'telefone_centro', 20
        )
    };

    if (!/^\d{5}-?\d{3}$/.test(resultado.cep)) {
        throw erroHttp('CEP inválido');
    }

    if (!/^[A-Z]{2}$/.test(resultado.estado)) {
        throw erroHttp('Estado deve conter uma UF de 2 letras');
    }

    return resultado;
}

export async function listarInstituicoes(cidade) {
    if (cidade !== undefined && typeof cidade !== 'string') {
        throw erroHttp('Filtro cidade inválido');
    }

    return repository.listarInstituicoes(cidade?.trim());
}

export async function buscarInstituicao(id) {
    const instituicao = await repository.buscarInstituicao(
        validarId(id)
    );

    if (!instituicao) {
        throw erroHttp('Instituição não encontrada', 404);
    }

    return instituicao;
}

export async function cadastrarInstituicao(dados) {
    const id_usuario = validarId(dados?.id_usuario);
    const campos = validarDados(dados);

    const usuario = await repository.buscarUsuario(id_usuario);

    if (!usuario) {
        throw erroHttp('Usuário não encontrado', 404);
    }

    if (usuario.tipo_usuario !== 'instituicao') {
        throw erroHttp(
            'Usuário não possui perfil de instituição',
            422
        );
    }

    const id = await repository.inserirInstituicao({
        id_usuario,
        ...campos
    });

    return repository.buscarInstituicao(id);
}

export async function atualizarInstituicao(id, dados) {
    const idValidado = validarId(id);
    const campos = validarDados(dados);

    await buscarInstituicao(idValidado);

    const alterados = await repository.atualizarInstituicao(
        idValidado, campos
    );

    if (!alterados) {
        throw erroHttp('Instituição não encontrada', 404);
    }

    return repository.buscarInstituicao(idValidado);
}

export async function excluirInstituicao(id) {
    const idValidado = validarId(id);

    const excluidos = await repository.excluirInstituicao(
        idValidado
    );

    if (!excluidos) {
        throw erroHttp('Instituição não encontrada', 404);
    }
}
