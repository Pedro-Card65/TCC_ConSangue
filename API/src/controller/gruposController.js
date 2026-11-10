import { getAuthentication } from '../utils/jwt.js';
import { inserirMeuId, somenteCriadorGrupo } from '../utils/permissoes.js';
import * as service from '../service/gruposService.js';
import { Router } from "express";
const endpoints = Router();


function tratarErro(resp, error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return resp.status(404).send({
            erro: 'Usuário ou grupo relacionado não encontrado.'
        });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return resp.status(409).send({
            erro: 'Existem registros vinculados a este grupo.'
        });
    }

    if (error.status) {
        return resp.status(error.status).send({
            erro: error.message
        });
    }

    console.error(error);

    return resp.status(500).send({
        erro: 'Erro interno ao processar o grupo.'
    });
}


//Finalizado

endpoints.post('/grupo', getAuthentication(), inserirMeuId('id_criador'), async (req, resp) => {
    try {
        let grupo = req.body;

        let id = await service.criarGrupoService(grupo);
        resp.send({ id });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.get('/grupos', async (req, resp) => {
    try {
        let grupos = await service.listarGruposService();
        resp.send({ grupos });
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.get('/grupos/:nome', async (req, resp) => {
    try {
        let nomeGrupo = req.params.nome;

        let grupos = await service.listarGruposPorNomeService(nomeGrupo);
        resp.send({ grupos })
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.put('/grupo/:id', getAuthentication(), somenteCriadorGrupo, async (req, resp) => {
    try {
        let grupo = req.body;
        let id = req.params.id;

        const linhasAfetadas = await service.editarGrupoService(grupo, id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        tratarErro(resp, error);
    }
});

endpoints.delete('/grupo/:id', getAuthentication(), somenteCriadorGrupo, async (req, resp) => {
    try {
        let id = req.params.id;

        const linhasAfetadas = await service.apagarGrupoService(id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        if (!error.status) console.error(error);

        resp.status(error.status || 500).json({
            erro: error.status
                ? error.message
                : 'Não foi possível excluir o grupo.'
        });
    }
});

export default endpoints;