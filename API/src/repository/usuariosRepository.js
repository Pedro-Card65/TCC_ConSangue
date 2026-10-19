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


export async function buscarPorID(id) {

    const command = `
        SELECT
            id_usuario,
            nome,
            data_nascimento,
            cidade,
            tipo_sanguineo,
            tipo_usuario,
            data_cadastro,
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
