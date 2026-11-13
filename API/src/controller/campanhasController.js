import { getAuthentication } from '../utils/jwt.js';
import { somenteMinhaInstituicaoNoBody, somenteDonoCampanha } from '../utils/permissoes.js';
import * as service from '../service/campanhasService.js';
import { Router } from "express";
const endpoints = Router();

function tratarErro(resp, error) {
    if (error.status) {
        return resp.status(error.status).json({ erro: error.message });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(409).json({ erro: 'Hemocentro informado não existe.' });
    }

    if (error.code === 'ER_DUP_ENTRY') {
        return resp.status(409).json({ erro: 'Já existe um registro com esses dados.' });
    }

    console.error(error);
    return resp.status(500).json({ erro: 'Erro interno ao processar a solicitação.' });
}

endpoints.post('/campanhas', getAuthentication(u => u.tipo_usuario === 'instituicao'), somenteMinhaInstituicaoNoBody, async (req, resp) => {
    try {
        let campanha = req.body;

        let id_campanha = await service.criarCampanhaService(campanha);
        resp.send({ id_campanha });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.get('/campanhas', async (req, resp) => {
    try {
        let campanhas = req.query.nome
            ? await service.listarCampanhasPorNomeService(req.query.nome)
            : await service.listarCampanhaService();
        resp.send({ campanhas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.get('/campanhas/hemocentro/:id', async (req, resp) => {
    try {
        let id_hemocentro = req.params.id;
        let campanhas = await service.listarCampanhasPorHemocentroService(id_hemocentro);
        resp.send({ campanhas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.put('/campanhas/:id/foto', getAuthentication(u => u.tipo_usuario === 'instituicao'), somenteDonoCampanha, async (req, resp) => {
    try {
        await service.atualizarFotoCampanhaService(req.params.id, req.body.foto_campanha);
        resp.send({ mensagem: 'Foto da campanha atualizada.' });
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

endpoints.put('/campanhas/:id', getAuthentication(u => u.tipo_usuario === 'instituicao'), somenteDonoCampanha, async (req, resp) => {
    try {
        let campanha = req.body;
        let id_campanha = req.params.id;

        let linhas = await service.editarCampanhaService(campanha, id_campanha);
        resp.send({ linhas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.delete('/campanhas/:id', getAuthentication(u => u.tipo_usuario === 'instituicao'), somenteDonoCampanha, async (req, resp) => {
    try {
        let id_campanha = req.params.id;

        let linhas = await service.apagarCampanhaService(id_campanha);
        resp.send({ linhas });
    }

    catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return resp.status(409).json({
                erro: 'Não é possível excluir a campanha porque existem grupos ou participações vinculados.'
            });
        }

        if (!error.status) {
            console.error(error);
        }

        return resp.status(error.status || 500).json({
            erro: error.status
                ? error.message
                : 'Não foi possível excluir a campanha.'
        });
    }

});

export default endpoints;