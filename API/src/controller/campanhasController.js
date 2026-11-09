import { getAuthentication } from '../utils/jwt.js';
import { somenteMinhaInstituicaoNoBody, somenteDonoCampanha } from '../utils/permissoes.js';
import * as service from '../service/campanhasService.js';
import { Router } from "express";
const endpoints = Router();

//Finalizado

endpoints.post('/campanhas', getAuthentication(u => u.tipo_usuario === 'instituicao'), somenteMinhaInstituicaoNoBody, async (req, resp) => {
    try {
        let campanha = req.body;

        let id_campanha = await service.criarCampanhaService(campanha);
        resp.send({ id_campanha });
    } 
    catch (error) {
        resp.status(400).send({ 
            erro: error.message 
        });
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
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/campanhas/hemocentro/:id', async (req, resp) => {
    try {
        let id_hemocentro = req.params.id;
        let campanhas = await service.listarCampanhasPorHemocentroService(id_hemocentro);
        resp.send({ campanhas });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
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
        resp.status(400).send({
            erro: error.message
        });
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