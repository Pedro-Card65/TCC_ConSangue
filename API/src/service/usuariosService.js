import * as repository from '../repository/usuariosRepository.js';
import bcrypt from 'bcrypt';


function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}


function validarCPF(cpf) {
    if (typeof cpf !== 'string') return false;

    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    for (let tamanho = 9; tamanho < 11; tamanho++) {
        let soma = 0;

        for (let i = 0; i < tamanho; i++) {
            soma += Number(cpf[i]) * (tamanho + 1 - i);
        }

        let digito = (soma * 10) % 11;

        if (digito === 10) digito = 0;

        if (digito !== Number(cpf[tamanho])) {
            return false;
        }
    }

    return true;
}


////////////////////////////////////////////////////////////////////////////////////////

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

   if (!validarCPF(cpf)) {
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
        const senhaHash = await bcrypt.hash(senha, 12);

        return await repository.fazerCadastro(
            usuario, nascimento, cpf, telefone,
            email, senhaHash, cidade, tipo_sangue, tipo_usuario
        );
    }
    catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            throw criarErro('CPF ou email já cadastrado.', 409);
        }

        throw erro;
    }
}
////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////

export async function buscarPorUser(nome) {

    if (!nome || typeof nome !== 'string') {
        const erro = new Error("Nome obrigatório");
        erro.status = 400;
        throw erro;
    }

    nome = nome.trim();

    if (nome.length < 2) {
        const erro = new Error("Digite pelo menos 2 caracteres");
        erro.status = 400;
        throw erro;
    }

    const usuarios = await repository.buscarPorUser(nome);

    return usuarios;
}

////////////////////////////////////////////////////////////////////////////////////////

export async function deletarPorID(id) {
    id = Number(id);
    if (!Number.isInteger(id) || id <= 0) {
        const erro = new Error("ID inválido");
        erro.status = 400;
        throw erro;
    }
    const del = await repository.deletarPorID(id);
    if (del === 0) {
        const erro = new Error("Usuário não encontrado");
        erro.status = 404;
        throw erro;
    }

    return del;
}

////////////////////////////////////////////////////////////////////////////////////////

export async function trocarTelefone(id, novotel, senha) {
    id = Number(id);

    if (!Number.isInteger(id) || id <= 0) {
        throw criarErro('ID inválido');
    }

    if (typeof senha !== 'string' || !senha ||
        (typeof novotel !== 'string' && typeof novotel !== 'number')) {
        throw criarErro('Telefone e senha são obrigatórios');
    }

    novotel = String(novotel).replace(/\D/g, '');

    if (novotel.length < 10 || novotel.length > 11) {
        throw criarErro('Telefone inválido');
    }

    const usuario = await repository.buscarCredenciaisPorID(id);

    if (!usuario) {
        throw criarErro('Usuário não encontrado', 404);
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha_hash
    );

    if (!senhaCorreta) {
        throw criarErro('Senha incorreta', 401);
    }

    return await repository.trocarTelefone(id, novotel);
}

////////////////////////////////////////////////////////////////////////////////////////


export async function trocarEmail(id, novoemail, senha) {
    id = Number(id);

    if (!Number.isInteger(id) || id <= 0) {
        throw criarErro('ID inválido');
    }

    if (typeof novoemail !== 'string' ||
        typeof senha !== 'string' || !senha) {
        throw criarErro('Email e senha são obrigatórios');
    }

    novoemail = novoemail.trim().toLowerCase();

    if (novoemail.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoemail)) {
    throw criarErro('Email inválido');
}

    const usuario = await repository.buscarCredenciaisPorID(id);

    if (!usuario) {
        throw criarErro('Usuário não encontrado', 404);
    }

    const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha_hash
    );

    if (!senhaCorreta) {
        throw criarErro('Senha incorreta', 401);
    }

    try {
        return await repository.trocarEmail(id, novoemail);
    }
    catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            throw criarErro('Email já cadastrado', 409);
        }

        throw erro;
    }
}
