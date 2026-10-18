import * as service from '../sevice/instituicoesService.js';
import { Router } from 'express';

const endpoints = Router();

endpoints.get('/api/instituicoes', async (req, resp) => {
    try {
        let cidade = req.query.cidade;

        let instituicoes = await service.listarInstituicoes(cidade);

        resp.status(200).send(instituicoes);
    }
    
    catch (erro) {
        console.erro(erro);

        resp.status(500).send({
            erro: 'Erro ao consultar instituições'
        });
    }
});

export default endpoints;