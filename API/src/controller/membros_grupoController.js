import { getAuthentication } from '../utils/jwt.js';
import { inserirMeuId, somenteMeuId, permissaoMembro, somenteMembroGrupo } from '../utils/permissoes.js';
import * as service from '../service/membros_grupoService.js';
import { Router } from 'express';

const endpoints = Router();


function tratarErro(resp, error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return resp.status(409).json({
            erro: 'Usuário já é membro deste grupo.'
        });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(404).json({
            erro: 'Usuário ou grupo não encontrado.'
        });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return resp.status(409).json({
            erro: 'Não é possível remover este vínculo porque existem registros relacionados.'
        });
    }

    if (error.status) {
        return resp.status(error.status).json({
            erro: error.message
        });
    }

    console.error(error);

    return resp.status(500).json({
        erro: 'Erro interno ao processar a solicitação.'
    });
}


// Entrar em um grupo / adicionar membro
endpoints.post('/membro', getAuthentication(), inserirMeuId('id_usuario'), (req, resp, next) => { req.body.papel = 'membro'; next(); }, async (req, resp) => {
    try {
        let membro = req.body;

        let id = await service.entrarGrupoService(membro);
        resp.status(201).send({ id });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Entrar diretamente apenas em grupos marcados como públicos.
endpoints.post('/membro/publico', getAuthentication(), inserirMeuId('id_usuario'), async (req, resp) => {
    try {
        const id = await service.entrarGrupoPublicoService(req.body);
        resp.status(201).json({ id });
    } catch (error) {
        tratarErro(resp, error);
    }
});

// Listar membros de um grupo
endpoints.get('/membros/grupo/:id_grupo', getAuthentication(), somenteMembroGrupo, async (req, resp) => {
    try {
        let membros = await service.listarMembrosPorGrupoService(req.params.id_grupo);
        resp.send({ membros });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Listar grupos de um usuário
endpoints.get('/grupos/usuario/:id_usuario', getAuthentication(), somenteMeuId('id_usuario'), async (req, resp) => {
    try {
        let grupos = await service.listarGruposPorUsuarioService(req.params.id_usuario);
        resp.send({ grupos });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Mudar papel (administrador / membro)
endpoints.put('/membro/:id', getAuthentication(), permissaoMembro(), async (req, resp) => {
    try {
        let id = req.params.id;
        let papel = req.body?.papel;

        const linhasAfetadas = await service.editarPapelService(id, papel);
        resp.send({ linhasAfetadas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

// Sair do grupo / remover membro
endpoints.delete('/membro/:id', getAuthentication(), permissaoMembro(true), async (req, resp) => {
    try {
        const linhasAfetadas = await service.removerMembroService(req.params.id);
        resp.send({ linhasAfetadas });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

export default endpoints;