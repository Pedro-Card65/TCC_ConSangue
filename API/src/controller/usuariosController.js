import * as service from '../service/usuariosService.js';
import { Router } from 'express';


const endpoints = Router();

////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////

endpoints.get('/api/usuarios/busca/nome/:nome', async (req, resp) => {
  try {
        let nome = req.params.nome;
        const usuarios = await service.buscarPorUser(nome);
        resp.status(200).send(
            usuarios
        );
    }
    catch (erro) {
        console.error(erro);

        resp.status(erro.status || 500).send({
            erro: erro.message
        });
    }
})

////////////////////////////////////////////////////////////////////////////////////////

endpoints.delete('/api/usuarios/deletar/certeza/:id', async (req, resp) => {
    try{ 
        let id = req.params.id;
        const del = await service.deletarPorID(id)
        resp.status(200).send({
            del
    })
    }
    catch(erro) {
        console.error(erro)
        resp.status(erro.status || 500).send({
            erro: erro.message
        })
    }
})

////////////////////////////////////////////////////////////////////////////////////////

endpoints.put('/api/usuarios/modificar/telefone/:id', async (req, resp) => {
    try {
        let id = req.params.id;
        let novotel = req.body.novotel;
        let senha = req.body.senha;

        const trocarTelefone = await service.trocarTelefone(id, novotel, senha);

        resp.status(200).send({
            trocarTelefone
        });
    }
    catch(erro) {
        console.error(erro);
        resp.status(erro.status || 500).send({
            erro: erro.message
        });
    }
});

////////////////////////////////////////////////////////////////////////////////////////

endpoints.put('/api/usuarios/modificar/email/:id', async (req, resp) => {
    try{
        let id = req.params.id
        let novoemail = req.body.novoemail
        let senha = req.body.senha


        const trocaremail = await service.trocarEmail(id, novoemail, senha)

        resp.status(200).send({
            trocaremail
        })
    }
    catch(erro){
        console.error(erro)
        resp.status(erro.status || 500).send({
            erro: erro.message
        })
    }
})

////////////////////////////////////////////////////////////////////////////////////////

export default endpoints;