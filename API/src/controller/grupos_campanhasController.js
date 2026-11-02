import * as service from '../service/grupos_campanhasService.js';
import { Router } from 'express';
import { getAuthentication } from '../utils/jwt.js';
import { somenteAdminGrupo, somenteAdminDoGrupoCampanha } from '../utils/permissoes.js';

const endpoints = Router();

function tratarErro(resp, erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
        return resp.status(409).json({ erro: 'Esse grupo já está vinculado à campanha.' });
    }
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(404).json({ erro: 'Grupo ou campanha não encontrado.' });
    }
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
        return resp.status(409).json({ erro: 'Existem participações neste vínculo.' });
    }
    if (!erro.status) console.error(erro);
    return resp.status(erro.status || 500).json({
        erro: erro.status ? erro.message : 'Erro interno.'
    });
}

endpoints.post('/grupoCampanhas', getAuthentication(), somenteAdminGrupo, async (req, resp) => {
    try {
        const id = await service.criarGrupoCampanhasService(req.body);
        resp.status(201).json({ id });
    } catch (erro) { tratarErro(resp, erro); }
});

endpoints.get('/gruposCampanhas', async (req, resp) => {
    try {
        const grupos = await service.listarGruposCampanhasService();
        resp.json({ grupos });
    } catch (erro) { tratarErro(resp, erro); }
});

endpoints.get('/gruposCampanhas/:id', async (req, resp) => {
    try {
        const grupo = await service.listarGruposCampanhasPorIdService(req.params.id);
        resp.json({ grupo });
    } catch (erro) { tratarErro(resp, erro); }
});

endpoints.put('/grupoCampanhas/:id', getAuthentication(), somenteAdminDoGrupoCampanha, async (req, resp) => {
    try {
        const linhasAfetadas = await service.editarGrupoCampanhasService(req.body, req.params.id);
        resp.json({ linhasAfetadas });
    } catch (erro) { tratarErro(resp, erro); }
});

endpoints.delete('/grupoCampanhas/:id', getAuthentication(), somenteAdminDoGrupoCampanha, async (req, resp) => {
    try {
        const linhasAfetadas = await service.apagarGrupoCampanhasService(req.params.id);
        resp.json({ linhasAfetadas });
    } catch (erro) { tratarErro(resp, erro); }
});

export default endpoints;
