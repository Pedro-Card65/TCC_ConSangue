import { con } from './connection.js';

export async function fazerCadastro(usuario, nascimento, cpf, telefone,email, senha, cidade, tipo_sangue, tipo_usuario) {

    const command = `
        INSERT INTO usuarios (
            nome,
            data_nascimento,
            cpf,
            telefone,
            email,
            senha_hash,
            cidade,
            tipo_sanguineo,
            tipo_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await con.query(command, [usuario,nascimento,cpf,telefone,email, senha, cidade, tipo_sangue, tipo_usuario]);
    return result.insertId;
}

////////////////////////////////////////////////////////////////////////////////////////

export async function buscarPorID(id) {

    const command = `
        SELECT
            id_usuario,
            nome,
            email,
            data_nascimento,
            cidade,
            tipo_sanguineo,
            tipo_usuario,
            telefone,
            foto_perfil,
            data_cadastro
        FROM usuarios
        WHERE id_usuario = ?
    `;

    const [result] = await con.query(command, [id]);

    return result[0];
}

////////////////////////////////////////////////////////////////////////////////////////

export async function buscarPorUser(nome){
    const command = `
    Select id_usuario, nome, cidade, tipo_usuario, data_cadastro
    From usuarios
    Where nome like ?
    `

    const [result] = await con.query(command, [`%${nome}%`])

    return result
}

////////////////////////////////////////////////////////////////////////////////////////

export async function deletarPorID(id) {
    const command = `
        Delete from usuarios
        Where id_usuario = ?
    `;

    const [result] = await con.query(command, [id]);

    return result.affectedRows;
}

////////////////////////////////////////////////////////////////////////////////////////

export async function trocarTelefone(id, novotel) {
    const command = `
        Update usuarios
        Set telefone = ?
        Where id_usuario = ?
    `;

    const [result] = await con.query(command, [novotel, id]);

    return result.affectedRows;
}

////////////////////////////////////////////////////////////////////////////////////////

export async function trocarEmail(id, novoemail) {
    const command = `
        Update usuarios
        Set email = ?
        Where id_usuario = ?
    `;

    const [result] = await con.query(command, [novoemail, id]);

    return result.affectedRows;
}

export async function buscarLoginPorCPF(cpf) {
    const [linhas] = await con.execute(
        `SELECT id_usuario, 
        nome, 
        tipo_usuario, 
        senha_hash 
        FROM usuarios 
        WHERE cpf = ? 
        LIMIT 1`,
        [cpf]
    );
    return linhas[0] ?? null;
}

export async function atualizarFotoPerfil(id, foto) {
    const command = `
        Update usuarios
        Set foto_perfil = ?
        Where id_usuario = ?
    `;

    const [result] = await con.query(command, [foto, id]);

    return result.affectedRows;
}

export async function buscarCredenciaisPorID(id) {
    const [linhas] = await con.execute(
        `SELECT id_usuario, 
        senha_hash 
        FROM usuarios 
        WHERE id_usuario = ? 
        LIMIT 1`,
        [id]
    );
    return linhas[0] ?? null;
}


export async function atualizarDadosPerfil(id, dados) {
    const [resultado] = await con.execute(
        'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, cidade = ?, tipo_sanguineo = ? WHERE id_usuario = ?',
        [dados.nome, dados.email, dados.telefone, dados.cidade, dados.tipo_sanguineo, id]
    );
    return resultado.affectedRows;
}

// Transação explícita: remove os dados da instituição e suas dependências,
// mas preserva as contas de outras pessoas.
export async function excluirContaInstitucional(id) {
    const conexao = await con.getConnection();
    try {
        await conexao.beginTransaction();
        const [titulares] = await conexao.execute(
            "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND tipo_usuario = 'instituicao' FOR UPDATE",
            [id]
        );
        if (!titulares.length) {
            const erro = new Error('Conta institucional não encontrada.');
            erro.status = 404;
            throw erro;
        }
        await conexao.execute(
            'DELETE p FROM participacoes p ' +
            'LEFT JOIN campanhas c ON c.id_campanha = p.id_campanha ' +
            'LEFT JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
            'LEFT JOIN grupos_campanhas gc ON gc.id_grupo_campanha = p.id_grupo_campanha ' +
            'LEFT JOIN grupos g ON g.id_grupo = gc.id_grupo ' +
            'WHERE p.id_usuario = ? OR h.id_usuario = ? OR g.id_criador = ?',
            [id, id, id]
        );
        await conexao.execute(
            'DELETE gc FROM grupos_campanhas gc ' +
            'LEFT JOIN grupos g ON g.id_grupo = gc.id_grupo ' +
            'LEFT JOIN campanhas c ON c.id_campanha = gc.id_campanha ' +
            'LEFT JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
            'WHERE g.id_criador = ? OR h.id_usuario = ?',
            [id, id]
        );
        await conexao.execute(
            'DELETE m FROM membros_grupo m ' +
            'LEFT JOIN grupos g ON g.id_grupo = m.id_grupo ' +
            'WHERE m.id_usuario = ? OR g.id_criador = ?',
            [id, id]
        );
        await conexao.execute('DELETE FROM grupos WHERE id_criador = ?', [id]);
        await conexao.execute(
            'DELETE c FROM campanhas c ' +
            'JOIN hemocentros h ON h.id_hemocentro = c.id_hemocentro ' +
            'WHERE h.id_usuario = ?',
            [id]
        );
        await conexao.execute('DELETE FROM hemocentros WHERE id_usuario = ?', [id]);
        const [resultado] = await conexao.execute(
            "DELETE FROM usuarios WHERE id_usuario = ? AND tipo_usuario = 'instituicao'",
            [id]
        );
        if (resultado.affectedRows !== 1) throw new Error('Exclusão incompleta.');
        await conexao.commit();
        return true;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

export async function buscarLoginPorIdParaExclusao(id) {
    const [linhas] = await con.execute(
        'SELECT id_usuario, tipo_usuario, senha_hash FROM usuarios WHERE id_usuario = ? LIMIT 1',
        [id]
    );
    return linhas[0] ?? null;
}
