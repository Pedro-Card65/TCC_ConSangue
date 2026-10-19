import * as service from '../service/instituicoesService.js';
import { Router } from 'express';

const endpoints = Router();

function tratarErro(resp, erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
        return resp.status(409).json({
            erro: 'Usuário já possui uma instituição cadastrada'
        });
    }

    if (erro.code === 'ER_ROW_ISS_REFERENCED_2') {
        return resp.status(409).json({
            erro: 'Instituição possui registros vinculados'
        });
    }

    if (erro.status) {
        return resp.status(erro.status).json({
            erro: erro.message
        });
    }

    console.error(erro);

    return resp.status(500).json({
        erro: 'Erro interno do servidor'
    });
}

// Mostrar instituições
endpoints.get('/instituicoes', async (req, resp) => {
    try {
        const cidade = req.query.cidade;

        const instituicoes = 
            await service.listarInsituicoes(cidade);

        resp.status(200).json(insituicoes);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});


//Buscar instituições
endpoints.get('/instituicoes:id', async (req, resp) => {
    try {
        const instituicao = 
            await service.buscarInstituicao(req.params.id);

        resp.status(200).jsoon(instituicao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

// Cadastar instituições
endpoints.post('/instituicoes', async (req, resp) => {
    try {
        const instituicao = 
            await service.cadastarInstituicao(req.body);

        resp.status(201).json(instituicao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

// Atualizar institução
endpoints.put('/instituicoes/:id', async (req, resp) => {
    try {
        const instituicao =
            await service.atualizarInstituicao(
                    req.params.id,
                    req.body
            );

        resp.status(200).json(instituicao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

//Excluir instituição
endpoints.delete('/api/instituicoes/:id', async (req, resp) => {
    try {
        await service.excluirInstituicao(req.params.id);

        resp.status(204).send();
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

export default endpoints;
