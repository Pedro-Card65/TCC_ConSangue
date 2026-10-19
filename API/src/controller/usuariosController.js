import * as service from '../service/usuariosService.js';
import { Router } from 'express';

const endpoints = Router();

endpoints.post('/api/usuarios/cadastro', async (req, resp) => {
    try {
        let usuario = req.body.usuario;
        let nascimento = req.body.nascimento;
        let cpf = req.body.cpf;
        let telefone = req.body.telefone;
        let email = req.body.email;
        let senha = req.body.senha;
        let cidade = req.body.cidade;
        let tipo_sangue = req.body.tipo_sangue;
        let tipo_usuario = req.body.tipo_usuario;

        const conta = await service.fazerCadastro(usuario, nascimento, cpf, telefone, email, senha, cidade, tipo_sangue, tipo_usuario);

        resp.status(201).send({
            mensagem: 'Cadastro realizado com sucesso!',
            id_usuario: conta
        });
    }
    catch (erro) {
        console.error(erro);

        resp.status(erro.status || 500).send({
            erro: erro.status
                ? erro.message
                : 'Erro interno ao fazer cadastro.'
        });
    }
});

endpoints.get('/api/usuarios/busca/:id', async (req, resp) => {
    try {
        let id = req.params.id;
        const usuario = await service.buscarPorID(id);
        resp.status(200).send(usuario);
    }
    catch (erro) {
        console.error(erro);

        resp.status(erro.status || 500).send({
            erro: erro.message
        });
    }
});

export default endpoints;