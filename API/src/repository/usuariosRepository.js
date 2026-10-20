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
            data_nascimento,
            cidade,
            tipo_sanguineo,
            tipo_usuario,
            cpf,
            senha_hash,
            telefone,
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
    Select nome, data_nascimento, cidade, tipo_usuario, data_cadastro
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