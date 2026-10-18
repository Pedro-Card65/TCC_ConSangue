import * as service from '../service/gruposService.js';
import { Router } from "express";
const endpoints = Router();

//Finalizado

endpoints.post('/grupo', async (req, resp) => {
    try {
        let grupo = req.body;

        let id = await service.criarGrupoService(grupo);
        resp.send({ id });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/grupos', async (req, resp) => {
    try {
        let grupos = await service.listarGruposService();
        resp.send({ grupos });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/grupos/:nome', async (req, resp) => {
    try {
        let nomeGrupo = req.params.nome;

        let grupos = await service.listarGruposPorNomeService(nomeGrupo);
        resp.send({ grupos })
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.put('/grupo/:id', async (req, resp) => {
    try {
        let grupo = req.body;
        let id = req.params.id;

        const linhasAfetadas = await service.editarGrupoService(grupo, id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.delete('/grupo/:id', async (req, resp) => {
    try {
        let id = req.params.id;

        const linhasAfetadas = await service.apagarGrupoService(id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

export default endpoints;