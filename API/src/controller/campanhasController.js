import * as service from '../service/campanhasService.js';
import { Router } from "express";
const endpoints = Router();

//Finalizado

endpoints.post('/campanhas', async (req, resp) => {
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
        let campanhas = await service.listarCampanhaService();
        resp.send({ campanhas });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/campanhas', async (req, resp) => {
    try {
        let nomeCampanha = req.query.nome; 

        let campanhas = await service.listarCampanhasPorNomeService(nomeCampanha);
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

endpoints.put('/campanhas/:id', async (req, resp) => {
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

endpoints.delete('/campanhas/:id', async (req, resp) => {
    try {
        let id_campanha = req.params.id;

        let linhas = await service.apagarCampanhaService(id_campanha);
        resp.send({ linhas });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

export default endpoints;