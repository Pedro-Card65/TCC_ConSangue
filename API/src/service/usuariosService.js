import * as repository from '../repository/usuariosRepository.js';

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

export async function fazerCadastro(
    usuario, nascimento, cpf, telefone,
    email, senha, cidade, tipo_sangue, tipo_usuario
) {

    // Verifica campos obrigatórios
    const campos = [
        usuario, nascimento, cpf, telefone,
        email, senha, cidade, tipo_usuario
    ];

    if (campos.some(campo =>
        typeof campo !== 'string' || !campo.trim()
    )) {
        throw criarErro('Preencha todos os campos obrigatórios.');
    }

    // Remove espaços
    usuario = usuario.trim();
    email = email.trim().toLowerCase();
    cidade = cidade.trim();
    tipo_usuario = tipo_usuario.trim().toLowerCase();

    // Valida nome
    if (usuario.length < 3 || usuario.length > 100) {
        throw criarErro('Nome deve ter entre 3 e 100 caracteres.');
    }

    // Valida CPF
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
        throw criarErro('CPF inválido.');
    }

    // Valida telefone
    telefone = telefone.replace(/\D/g, '');

    if (telefone.length < 10 || telefone.length > 11) {
        throw criarErro('Telefone inválido.');
    }

    // Valida email
    if (
        email.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        throw criarErro('Email inválido.');
    }

    // Valida senha
    if (senha.length < 8 || senha.length > 255) {
        throw criarErro('Senha deve ter entre 8 e 255 caracteres.');
    }

    // Valida cidade
    if (cidade.length > 100) {
        throw criarErro('Nome da cidade muito longo.');
    }

    // Valida nascimento
    const data = new Date(nascimento);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(nascimento) ||
        isNaN(data.getTime()) ||
        data.toISOString().slice(0, 10) !== nascimento ||
        new Date(nascimento + 'T00:00:00') > new Date()
    ) {
        throw criarErro('Data de nascimento inválida.');
    }

    // Valida tipo sanguíneo (opcional)
    const tipos = [
        'A+', 'A-', 'B+', 'B-',
        'AB+', 'AB-', 'O+', 'O-'
    ];

    if (tipo_sangue == null || tipo_sangue === '') {
        tipo_sangue = null;
    }
    else {
        if (typeof tipo_sangue !== 'string') {
            throw criarErro('Tipo sanguíneo inválido.');
        }

        tipo_sangue = tipo_sangue.trim().toUpperCase();

        if (tipo_sangue === '') {
            tipo_sangue = null;
        }
        else if (!tipos.includes(tipo_sangue)) {
            throw criarErro('Tipo sanguíneo inválido.');
        }
    }

    // Valida tipo de usuário
    if (tipo_usuario !== 'candidato' &&
        tipo_usuario !== 'instituicao') {
        throw criarErro('Tipo de usuário inválido.');
    }

    // Envia para o Repository
    try {
        return await repository.fazerCadastro(
            usuario, nascimento, cpf, telefone,
            email, senha, cidade, tipo_sangue, tipo_usuario
        );
    }
    catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            throw criarErro('CPF ou email já cadastrado.', 409);
        }

        throw erro;
    }
}


export async function buscarPorID(id) {
    id = Number(id);
    if (!Number.isInteger(id) || id <= 0) {
        const erro = new Error('ID inválido.');
        erro.status = 400;
        throw erro}

    const usuario = await repository.buscarPorID(id);

    if (!usuario) {
        const erro = new Error('Usuário não encontrado.');
        erro.status = 404;
        throw erro}

    return usuario;
}

