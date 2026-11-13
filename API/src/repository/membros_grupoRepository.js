import { con } from './connection.js';
import { garantirVisibilidadeGrupos } from './gruposRepository.js';

// Entrada pública não utiliza convite, mas só é possível quando o próprio banco
// confirma que o grupo está marcado como público. Os grupos privados continuam fechados.
export async function entrarGrupoPublico(idUsuario, idGrupo) {
    await garantirVisibilidadeGrupos();

    const [resultado] = await con.execute(
        `INSERT INTO membros_grupo (id_usuario, id_grupo, papel)
         SELECT ?, g.id_grupo, 'membro' FROM grupos g
         WHERE g.id_grupo = ? AND g.visibilidade = 'publico'`,
        [idUsuario, idGrupo]
    );

    if (!resultado.affectedRows) {
        const erro = new Error('Grupo inexistente ou privado: utilize um convite para entrar.');
        erro.status = 403;
        throw erro;
    }
    return resultado.insertId;
}

export async function entrarGrupo(membro) {
    const command = `
        INSERT INTO membros_grupo (id_usuario, id_grupo, papel)
        VALUES (?, ?, ?)
    `

    const [result] = await con.query(command, [
        membro.id_usuario,
        membro.id_grupo,
        membro.papel
    ]);

    return result.insertId;
};

export async function listarMembrosPorGrupo(idGrupo) {
    const command = `
        SELECT  m.id_membro,
                m.id_usuario,
                u.nome,
                u.foto_perfil,
                m.papel,
                m.data_entrada
        FROM    membros_grupo m
        JOIN    usuarios u ON u.id_usuario = m.id_usuario
        WHERE   m.id_grupo = ?
        UNION ALL
        SELECT  NULL AS id_membro,
                g.id_criador AS id_usuario,
                u.nome,
                u.foto_perfil,
                'administrador' AS papel,
                g.data_criacao AS data_entrada
        FROM    grupos g
        JOIN    usuarios u ON u.id_usuario = g.id_criador
        WHERE   g.id_grupo = ?
            AND NOT EXISTS (
                SELECT 1 FROM membros_grupo m
                WHERE m.id_grupo = g.id_grupo
                  AND m.id_usuario = g.id_criador
            )
        ORDER BY data_entrada
    `

    const [linhas] = await con.query(command, [idGrupo, idGrupo]);
    return linhas;
};


export async function listarGruposPorUsuario(idUsuario) {
    const [colunas] = await con.query(
        "SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' AND COLUMN_NAME = 'visibilidade' LIMIT 1"
    );
    const visibilidade = colunas.length ? 'g.visibilidade' : "'privado' AS visibilidade";
    // O criador tem acesso ao próprio grupo mesmo em registros legados sem
    // linha correspondente em membros_grupo. Outros usuários só enxergam
    // grupos nos quais realmente possuem vínculo de participação.
    const command = `
        SELECT  m.id_membro,
                g.id_grupo,
                g.nome_grupo,
                g.descricao,
                g.id_criador,
                g.codigo_convite,
                g.foto_grupo,
                ${visibilidade},
                CASE WHEN g.id_criador = ? THEN 'administrador' ELSE m.papel END AS papel,
                COALESCE(m.data_entrada, g.data_criacao) AS data_entrada
        FROM    grupos g
        LEFT JOIN membros_grupo m
               ON m.id_grupo = g.id_grupo AND m.id_usuario = ?
        WHERE   g.id_criador = ? OR m.id_membro IS NOT NULL
        ORDER BY COALESCE(m.data_entrada, g.data_criacao) DESC
    `;

    const [linhas] = await con.query(command, [idUsuario, idUsuario, idUsuario]);

    return linhas;
};


export async function editarPapel(id, papel) {
    const command = `
        UPDATE  membros_grupo
        SET     papel = ?
        WHERE   id_membro = ?
    `

    const [linhas] = await con.query(command, [papel, id]);

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};

export async function removerMembro(id) {
    const command = `
        DELETE FROM membros_grupo
        WHERE id_membro = ?
    `

    const [linhas] = await con.query(command, [id]);

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};