const STATUS_CONTADOS_PARA_META = new Set(['pretende_ir', 'comparecimento_informado']);

/** A meta mede mobilização. Comparecimento informado continua autodeclarado. */
export function agregarAdesaoPorCampanha(linhas) {
    const campanhas = new Map();
    for (const linha of linhas) {
        let campanha = campanhas.get(linha.id_campanha);
        if (!campanha) {
            campanha = {
                id_campanha: linha.id_campanha,
                meta_participacoes: linha.meta_participacoes == null ? null : Number(linha.meta_participacoes),
                grupos_vinculados: Number(linha.grupos_vinculados),
                interessados: new Set(),
                pretendem_ir: new Set(),
                comparecimentos_informados: new Set(),
                total_participacoes: new Set()
            };
            campanhas.set(linha.id_campanha, campanha);
        }
        if (linha.id_usuario == null) continue;
        const status = linha.status_participacao;
        if (status === 'interessado') campanha.interessados.add(linha.id_usuario);
        if (status === 'pretende_ir') campanha.pretendem_ir.add(linha.id_usuario);
        if (status === 'comparecimento_informado') campanha.comparecimentos_informados.add(linha.id_usuario);
        if (STATUS_CONTADOS_PARA_META.has(status)) campanha.total_participacoes.add(linha.id_usuario);
    }
    return [...campanhas.values()].map(campanha => {
        const total = campanha.total_participacoes.size;
        const meta = campanha.meta_participacoes;
        return {
            id_campanha: campanha.id_campanha,
            meta_participacoes: meta,
            total_participacoes: total,
            progresso_percentual: meta === null ? null : Math.round(total / meta * 100),
            estado_meta: meta === null ? 'sem_meta' : total >= meta ? 'atingida' : 'em_andamento',
            meta_atingida: meta !== null && total >= meta,
            interessados: campanha.interessados.size,
            pretendem_ir: campanha.pretendem_ir.size,
            comparecimentos_informados: campanha.comparecimentos_informados.size,
            grupos_vinculados: campanha.grupos_vinculados
        };
    });
}

export function comProgressoMeta(vinculo) {
    const meta = vinculo.meta_participacoes == null ? null : Number(vinculo.meta_participacoes);
    const total = Number(vinculo.total_participacoes ?? 0);
    return { ...vinculo, meta_participacoes: meta, total_participacoes: total,
        total_interessados: Number(vinculo.total_interessados ?? 0),
        progresso_percentual: meta === null ? null : Math.round(total / meta * 100),
        estado_meta: meta === null ? 'sem_meta' : total >= meta ? 'atingida' : 'em_andamento',
        meta_atingida: meta !== null && total >= meta };
}
