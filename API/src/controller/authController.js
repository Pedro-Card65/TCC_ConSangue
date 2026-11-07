import { Router } from 'express';
import { fazerLogin } from '../service/authService.js';
import { getAuthentication } from '../utils/jwt.js';
import * as usuariosService from '../service/usuariosService.js';

const endpoints = Router();

endpoints.post('/api/usuarios/login', async (req, resp) => {
    try {
        const { cpf, senha } = req.body || {};
        const resultado = await fazerLogin(cpf, senha);
        resp.status(200).json(resultado);
    } catch (erro) {
        if (!erro.status) console.error(erro);
        resp.status(erro.status || 500).json({
            erro: erro.status ? erro.message : 'Erro interno ao fazer login.'
        });
    }
});

// endpoint para testar se o JWT enviado está funcionando
endpoints.get('/api/usuarios/me', getAuthentication(), async (req, resp) => {
    try {
        const id = req.user.id_usuario;

        const usuario = await usuariosService.buscarPorID(id);

        const {
            id_usuario,
            nome,
            email,
            cidade,
            tipo_sanguineo,
            tipo_usuario
        } = usuario;

        resp.status(200).json({
            id_usuario,
            nome,
            email,
            cidade,
            tipo_sanguineo,
            tipo_usuario
        });

    } catch (erro) {
        resp.status(erro.status || 500).json({
            erro: erro.status
                ? erro.message
                : 'Erro interno ao buscar informações do usuário.'
        });
    }
});

export default endpoints;
