import bcrypt from 'bcrypt';
import * as repository from '../repository/usuariosRepository.js';
import { generateToken } from '../utils/jwt.js';

export async function fazerLogin(cpf, senha) {
    if (typeof cpf !== 'string' || typeof senha !== 'string' || !senha) {
        const erro = new Error('CPF e senha são obrigatórios.');
        erro.status = 400;
        throw erro;
    }

    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) {
        const erro = new Error('CPF inválido.');
        erro.status = 400;
        throw erro;
    }

    const usuario = await repository.buscarLoginPorCPF(cpf);
    const senhaConfere = usuario
        ? await bcrypt.compare(senha, usuario.senha_hash)
        : false;

    if (!senhaConfere) {
        const erro = new Error('CPF ou senha incorretos.');
        erro.status = 401;
        throw erro;
    }

    return {
        token: generateToken(usuario),
        usuario: {
            id_usuario: usuario.id_usuario,
            nome: usuario.nome,
            tipo_usuario: usuario.tipo_usuario
        }
    };
}
