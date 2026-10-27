import * as service from '../service/grupos_campanhasService.js';

//Finalizado

endpoints.post('/grupoCampanhas', async (req, resp) => {
    try {
        let grupo = req.body;

        let id = await service.criarGrupoCampanhasService(grupo);
        resp.send({ id });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/gruposCampanhas', async (req, resp) => {
    try {
        let grupos = await service.listarGruposCampanhasService();
        resp.send({ grupos });
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.get('/gruposCampanhas/:nome', async (req, resp) => {
    try {
        let nomeGrupo = req.params.nome;

        let grupos = await service.listarGruposCampanhasPorIdService(nomeGrupo);
        resp.send({ grupos })
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.put('/grupoCampanhas/:id', async (req, resp) => {
    try {
        let grupo = req.body;
        let id = req.params.id;

        const linhasAfetadas = await service.editarGrupoCampanhasService(grupo, id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

endpoints.delete('/grupoCampanhas/:id', async (req, resp) => {
    try {
        let id = req.params.id;

        const linhasAfetadas = await service.apagarGrupoCampanhasService(id);

        resp.send({linhasAfetadas});
    }
    catch (error) {
        resp.status(400).send({
            erro: error.message
        });
    }
});

export default endpoints;