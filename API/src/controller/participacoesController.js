import * as service from '../service/participacoesService.js';
import { Router } from 'express';

const endpoints = Router();

function tratarErro(resp, erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
        return resp.status(409).json({
            erro: 'Usuário já possui participação nestas campanha'
        });
    }

    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(409).json({
            erro: 'Registro relacionado não encontrado'
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

//Registrar participação
endpoints.post('/api/participacoes', async (req, resp) => {
    try {
        const participacao = 
            await service.criarParticipacao(req.body);

        resp.status(201).json(participacao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

//Listar participações
endpoints.get('/api/participacoes', async (req, resp) => {
    try {
        const participacoes =
            await service.listarParticipacoes(req.query);

        resp.status(200).json(participacoes);
    } catch (erro) {
        tratarErro(resp,erro);
    }
});

//Buscar participações pelo ID
endpoints.get('/api/participacoes/:id', async (req, resp) => {
    try {
        const participacao = 
            await service.buscarParticipacao(req.params.id);

        resp.status(200).json(participacao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

//Atualizar participação
endpoints.put('/api/participacoes/:id', async (req, resp) => {
    try {
        const participacao =
            await service.atualizarParticipacao(req.params.id, req.body);

        resp.status(200).json(participacao);
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

//Excluir participações
endpoints.delete('/api/participacoes/:id', async (req, resp) => {
    try {
        await service.excluirParticipacao(req.params.id);

        resp.status(204).send();
    } catch (erro) {
        tratarErro(resp, erro);
    }
});

export default endpoints;