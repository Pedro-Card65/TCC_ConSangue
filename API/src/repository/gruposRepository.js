import { con, abrirConexao } from './connection.js';

//Finalizado

export async function criarGrupo(grupo) {
    const conexao = await abrirConexao();
    try {
        await conexao.beginTransaction();
        const [result] = await conexao.execute(
            `INSERT INTO grupos (nome_grupo, descricao, id_criador) VALUES (?, ?, ?)`,
            [grupo.nome_grupo, grupo.descricao, grupo.id_criador]
        );
        await conexao.execute(
            `INSERT INTO membros_grupo (id_usuario, id_grupo, papel) VALUES (?, ?, ?)`,
            [grupo.id_criador, result.insertId, 'administrador']
        );
        await conexao.commit();
        return result.insertId;
    } catch (erro) {
        try {
            await conexao.rollback();
        } catch {
            // Descarte a sessão e preserve o erro original.
        }
        throw erro;
    } finally {
        // Não reutilizar a conexão, inclusive se o rollback falhar.
        conexao.destroy();
    }
}

export async function listarGrupos() {
    const command = `
        SELECT  id_grupo,
                nome_grupo,
                descricao,
                id_criador,
                data_criacao
        FROM    grupos;
    `
    const [linhas] = await con.query(command, []);
    return linhas;
};

export async function listarGruposPorNome(nome) {
    const command = `
        SELECT  id_grupo,
                nome_grupo,
                descricao,
                id_criador,
                data_criacao
        FROM    grupos
        WHERE nome_grupo LIKE ?
    `
    const [linhas] = await con.query(command, [
        `%${nome}%`
    ])
    return linhas;
};

export async function editarGrupo(grupo, id) {
    const command = `
        UPDATE  grupos
        SET     nome_grupo = ?,
                descricao = ?
        WHERE   id_grupo = ?
        AND     id_criador = ?
    `

    const [linhas] = await con.query(command, [
        grupo.nome_grupo,
        grupo.descricao,
        id,
        grupo.id_criador
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};

export async function apagarGrupo(id) {
    const command = `
        DELETE FROM grupos
            WHERE id_grupo = ?
    `

    const [linhas] = await con.query(command, [
        id
    ])

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};
