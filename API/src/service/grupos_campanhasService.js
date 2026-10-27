import * as dbGrupos_campanhas from '../repository/grupos_campanhasRepository.js';

//

export async function criarGrupoCampanhasService(grupo) {
    if (!grupos_campanhas.id_grupo.trim() || !grupo_campanhas.id_campanha.trim() || !grupo_campanhas.meta_participacoes.trim() || !grupo_campanhas.data_entrada.trim()) {
        throw new Error('Todos os campos são obrigatórios')
    }

    return dbGrupos_campanhas.criarGrupoCampanha(grupo);
};

export async function listarGruposCampanhasService() {
    return dbGrupos_campanhas.listarGruposCampanha();
};

export async function listarGruposPorNomeService(nome) {
    return dbGrupos_campanhas.listarGruposCampanhaPorId(nome);
};

export async function editarGrupoCampanhasService(grupo, id) {
    if (!grupo.nome_grupo.trim() || !grupo.descricao.trim()) {
        throw new Error('Todos os campos são obrigatórios')
    }

    return dbGrupos_campanhas.editarGrupocampanha(grupo, id);
};

export async function apagarGrupoCampanhasService(id) {
    return dbGrupos_campanhas.apagarGrupoCampanha(id);
};