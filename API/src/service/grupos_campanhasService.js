import * as repository from '../repository/grupos_campanhasRepository.js';

function validarId(valor, nome = 'ID') {
    const id = Number(valor);
    if (!/^[1-9]\d*$/.test(String(valor)) || !Number.isSafeInteger(id)) {
        const erro = new Error(`${nome} inválido.`);
        erro.status = 400;
        throw erro;
    }
    return id;
}

function validarMeta(valor) {
    return validarId(valor, 'Meta de participações');
}

export async function criarGrupoCampanhasService(dados) {
    return repository.criarGrupoCampanha({
        id_grupo: validarId(dados?.id_grupo, 'ID do grupo'),
        id_campanha: validarId(dados?.id_campanha, 'ID da campanha'),
        meta_participacoes: validarMeta(dados?.meta_participacoes)
    });
}

export async function listarGruposCampanhasService() {
    return repository.listarGruposCampanha();
}

export async function listarGruposCampanhasPorIdService(id) {
    const resultado = await repository.listarGruposCampanhaPorId(validarId(id));
    if (!resultado) {
        const erro = new Error('Vínculo não encontrado.');
        erro.status = 404;
        throw erro;
    }
    return resultado;
}

export async function editarGrupoCampanhasService(dados, id) {
    // Editar apenas a meta; trocar grupo/campanha exige criar outro vínculo.
    if (dados?.id_grupo !== undefined || dados?.id_campanha !== undefined) {
        const erro = new Error('Não é permitido alterar o grupo ou a campanha do vínculo.');
        erro.status = 400;
        throw erro;
    }
    const linhas = await repository.editarGrupocampanha(
        validarMeta(dados?.meta_participacoes), validarId(id)
    );
    if (!linhas) {
        const erro = new Error('Vínculo não encontrado.');
        erro.status = 404;
        throw erro;
    }
    return linhas;
}

export async function apagarGrupoCampanhasService(id) {
    const linhas = await repository.apagarGrupoCampanha(validarId(id));
    if (!linhas) {
        const erro = new Error('Vínculo não encontrado.');
        erro.status = 404;
        throw erro;
    }
    return linhas;
}
