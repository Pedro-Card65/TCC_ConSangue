import * as service from '../service/membro_grupoService.js';
import { Router } from 'express';

const endpoints = Router();

function tratarErro(resp, error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return resp.status(409).send({
            erro: 'Usuário já é membro deste grupo'
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(404).send({
            erro: 'Usuário ou grupo não encontrado'
        });
    }

    resp.status(400).send({
        erro: error.message
    });
}

// Entrar em um grupo / adicionar membro
endpoints.post('/membro', async (req, resp) => {
    try {
        let membro = req.body;

        let id = await service.entrarGrupoService(membro);
        resp.status(201).send({ id });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Listar membros de um grupo
endpoints.get('/membros/grupo/:id_grupo', async (req, resp) => {
    try {
        let membros = await service.listarMembrosPorGrupoService(req.params.id_grupo);
        resp.send({ membros });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Listar grupos de um usuário
endpoints.get('/grupos/usuario/:id_usuario', async (req, resp) => {
    try {
        let grupos = await service.listarGruposPorUsuarioService(req.params.id_usuario);
        resp.send({ grupos });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Mudar papel (administrador / membro)
endpoints.put('/membro/:id', async (req, resp) => {
    try {
        let id = req.params.id;
        let papel = req.body.papel;

        const linhasAfetadas = await service.editarPapelService(id, papel);
        resp.send({ linhasAfetadas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Sair do grupo / remover membro
endpoints.delete('/membro/:id', async (req, resp) => {
    try {
        const linhasAfetadas = await service.removerMembroService(req.params.id);
        resp.send({ linhasAfetadas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

export default endpoints;