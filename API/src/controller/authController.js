import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { fazerLogin } from '../service/authService.js';
import { getAuthentication } from '../utils/jwt.js';
import * as usuariosService from '../service/usuariosService.js';

const endpoints = Router();

const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { erro: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
});

endpoints.post('/api/usuarios/login', limiteLogin, async (req, resp) => {
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

// endpoint para testar se o JWT enviado estÃ¡ funcionando
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
            tipo_usuario,
            foto_perfil
        } = usuario;

        resp.status(200).json({
            id_usuario,
 ¶»§q«^