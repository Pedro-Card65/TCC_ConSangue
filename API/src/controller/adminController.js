import { Router } from 'express';
import { getAuthentication, generateAdminToken } from '../utils/jwt.js';
import {
    contaAdministradoraValida, codigoAdministrativoValido,
    exigirAdministracao, possuiAdministracao
} from '../utils/adminProjeto.js';
import { listarTodosGruposAdmin } from '../repository/gruposRepository.js';

const endpoints = Router();

// Não expor CPF, e-mail nem código. O cliente recebe apenas o estado.
endpoints.get('/admin/situacao', getAuthentication(), async (req, resp) => {
    try {
        const pode_ativar = await contaAdministradoraValida(req.user);
        resp.json({
            pode_ativar,
            administrador: pode_ativar && await possuiAdministracao(req.user)
        });
    } catch (erro) {
        console.error(erro);
        resp.status(500).json({ erro: 'Erro ao verificar permissões.' });
    }
});

endpoints.post('/admin/ativar', getAuthentication(), async (req, resp) => {
    try {
        if (!(await contaAdministradoraValida(req.user)) ||
            !codigoAdministrativoValido(req.body?.codigo)) {
            return resp.status(403).json({ erro: 'Credenciais administrativas inválidas.' });
        }
        const token = generateAdminToken(req.user);
        return resp.json({ token, administrador: true });
    } catch (erro) {
        console.error(erro);
        return resp.status(500).json({ erro: 'Não foi possível ativar o acesso.' });
    }
});

// Somente no modo administrativo: listagem também inclui grupos privados,
// mas nunca códigos de convite nem imagens privadas.
endpoints.get('/admin/grupos', getAuthentication(), exigirAdministracao, async (_req, resp) => {
    try {
        resp.json({ grupos: await listarTodosGruposAdmin() });
    } catch (erro) {
        console.error(erro);
        resp.status(500).json({ erro: 'Não foi possível consultar os grupos.' });
    }
});

export default endpoints;
