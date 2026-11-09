import { getAuthentication } from '../utils/jwt.js';
import { inserirMeuId, somenteCriadorGrupo } from '../utils/permissoes.js';
import * as service from '../service/gruposService.js';
import { Router } from "express";
const endpoints = Router();

//Finalizado

endpoints.post('/grupo', getAuthentication(), inserirMeuId('id_criador'), async (req, resp) => {
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

endpoints.put('/grupo/:id', getAuthentication(), somenteCriadorGrupo, async (req, resp) => {
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