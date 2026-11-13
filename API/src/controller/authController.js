import { Router } from 'express';
import { fazerLogin } from '../service/authService.js';
import { getAuthentication } from '../utils/jwt.js';
import * as usuariosService from '../service/usuariosService.js';

const endpoints = Router();

const janelaLoginMs = 15 * 60 * 1000;
const limiteFalhas = 20;
const falhasPorIp = new Map();

function limitarLogin(req, resp, next) {
    const chave = req.ip || req.socket.remoteAddress || 'nao-identificado';
    req.chaveLogin = chave;
    const agora = Date.now();
    const registro = falhasPorIp.get(chave);
    if (registro && agora - registro.inicio < janelaLoginMs && registro.falhas >= limiteFalhas) {
        resp.set('Retry-After', String(Math.ceil((janelaLoginMs - (agora - registro.inicio)) / 1000)));
        return resp.status(429).json({ erro: 'Muitas tentativas de login. Tente novamente mais tarde.' });
    }
    if (registro && agora - registro.inicio >= janelaLoginMs) falhasPorIp.delete(chave);
    if (falhasPorIp.size > 5000) {
        for (const [ip, info] of falhasPorIp) {
            if (agora - info.inicio >= janelaLoginMs) falhasPorIp.delete(ip);
        }
    }
    next();
}

function registrarFalhaLogin(chave) {
    if (!chave) return;
    const agora = Date.now();
    const anterior = falhasPorIp.get(chave);
    if (!anterior || agora - anterior.inicio >= janelaLoginMs) {
        falhasPorIp.set(chave, { inicio: agora, falhas: 1 });
    } else {
        anterior.falhas += 1;
    }
}

endpoints.post('/api/usuarios/login', limitarLogin, async (req, resp) => {
    try {
        const { cpf, senha } = req.body || {};
        const resultado = await fazerLogin(cpf, senha);
        falhasPorIp.delete(req.chaveLogin);
        resp.status(200).json(resultado);
    } catch (erro) {
        if (erro.status === 401) registrarFalhaLogin(req.chaveLogin);
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
            telefone,
            cidade,
            tipo_sanguineo,
            tipo_usuario,
            foto_perfil
        } = usuario;

        resp.status(200).json({
            id_usuario,
            nome,
            email,
            telefone,
            cidade,
            tipo_sanguineo,
            tipo_usuario,
            foto_perfil
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
