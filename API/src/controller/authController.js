import { Router } from 'express';
import { fazerLogin } from '../service/authService.js';
import { getAuthentication } from '../utils/jwt.js';

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
endpoints.get('/api/usuarios/me', getAuthentication(), (req, resp) => {
    resp.json({ id_usuario: req.user.id_usuario, tipo_usuario: req.user.tipo_usuario });
});

export default endpoints;
