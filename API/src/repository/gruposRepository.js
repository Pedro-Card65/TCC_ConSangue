import { con } from './connection.js';

async function colunaFotoDisponivel() {
    const [colunas] = await con.query(
        "SELECT 1 AS existe FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grupos' AND COLUMN_NAME = 'foto_grupo' LIMIT 1"
    );
    return colunas.length > 0;
}


//Finalizado

export async function criarGrupo(grupo) {
    const conexao = await con.getConnection();

    try {
        await conexao.beginTransaction();

        const [resultado] = await conexao.execute(
            `INSERT INTO grupos
            (nome_grupo, descricao, id_criador)
            VALUES (?, ?, ?)`,
            [
                grupo.nome_grupo,
                grupo.descricao,
                grupo.id_criador
            ]
        );

        const idGrupo = resultado.insertId;

        await conexao.execute(
            `INSERT INTO membros_grupo
            (id_usuario, id_grupo, papel)
            VALUES (?, ?, ?)`,
            [
                grupo.id_criador,
                idGrupo,
                'administrador'
            ]
        );

        await conexao.commit();
        
        return idGrupo;
    
    } catch (erro) {
        await conexao.rollback();
        throw erro;
        
    } finally {
        conexao.release();
    }
}

export async function listarGrupos() {
    const command = `
        SELECT  id_grupo,
                nome_grupo,
                descricao,
                id_criador,
                data_criacao
                ${await colunaFotoDisponivel() ? ', foto_grupo' : ''}
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
                ${await colunaFotoDisponivel() ? ', foto_grupo' : ''}
        FROM    grupos
        WHERE nome_grupo LIKE ?
    `
    const [linhas] = await con.query(command, [
        `%${nome}%`
    ])
    return linhas;
};

export async function editarGrupo(grupo, id) {
    const alterarFoto = Object.prototype.hasOwnProperty.call(grupo, 'foto_grupo');
    if (alterarFoto && !(await colunaFotoDisponivel())) {
        const erro = new Error('O armazenamento de fotos dos grupos ainda precisa ser ativado no banco.');
        erro.status = 503;
        throw erro;
    }
    const parametros = [grupo.nome_grupo, grupo.descricao];
    if (alterarFoto) parametros.push(grupo.foto_grupo);
    parametros.push(id, grupo.id_criador);
    const [linhas] = await con.query(
        `UPDATE grupos SET nome_grupo = ?, descricao = ?${alterarFoto ? ', foto_grupo = ?' : ''}
         WHERE id_grupo = ? AND id_criador = ?`,
        parametros
    )

    let linhasAfetadas = linhas.affectedRows;
    return linhasAfetadas;
};


export async function apagarGrupo(id) {
    const conexao = await con.getConnection();

    try {
        await conexao.beginTransaction();

        const [vinculos] = await conexao.execute(
            `SELECT id_grupo_campanha
             FROM grupos_campanhas
             WHERE id_grupo = ?
             LIMIT 1`,
            [id]
        );

        if (vinculos.length > 0) {
            const erro = new Error(
                'Desvincule as campanhas antes de excluir o grupo.'
            );
            erro.status = 409;
            throw erro;
        }

        await conexao.execute(
            'DELETE FROM membros_grupo WHERE id_grupo = ?',
            [id]
        );

        const [resultado] = await conexao.execute(
            'DELETE FROM grupos WHERE id_grupo = ?',
            [id]
        );

        await conexao.commit();
        return resultado.affectedRows;

    } catch (erro) {
        await conexao.rollback();
        throw erro;

    } finally {
        conexao.release();
    }
}
