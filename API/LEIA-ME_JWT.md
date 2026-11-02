# ConSangue — JWT integrado na API

Esta é uma cópia **somente da pasta API**, com as alterações de JWT e permissões. O React não foi modificado. Não substitua o projeto inteiro: faça backup da pasta API antiga e copie os arquivos desta versão para a sua pasta API.

## 1. Configuração

Na pasta `API`, rode `npm install` caso ainda não tenha dependências instaladas.

Copie `.env.example` para `.env` e configure:

```dotenv
PORT=3000
Chave_Secreta=COLE_AQUI_UMA_CHAVE_ALEATORIA_GERADA_POR_VOCE
```

Gere uma chave forte com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Nunca envie seu `.env` para o GitHub.** O sistema já usa `bcrypt` e `jsonwebtoken`, que constam no `package.json`. Inicie com `npm start`. A conexão MySQL original (host `localhost`, usuário `root`, senha `root`, banco `ConSangue`) não foi alterada. Ajuste-a no arquivo `src/repository/connection.js`, se for diferente no seu computador.

## 2. Login

**POST** `http://localhost:3000/api/usuarios/login`

```json
{ "cpf": "12345678909", "senha": "minhaSenhaDeTeste" }
```

Use **um CPF real cadastrado no seu banco** e a senha correspondente. A resposta terá:

```json
{
  "token": "eyJ...",
  "usuario": {
    "id_usuario": 1,
    "nome": "Exemplo",
    "tipo_usuario": "candidato"
  }
}
```

O token expira em **2 horas**. A senha e o `senha_hash` nunca aparecem nessa resposta.

## 3. Como enviar o token

Em cada endpoint protegido, envie o cabeçalho HTTP:

```http
Authorization: Bearer COLE_O_TOKEN_AQUI
```

No Postman, selecione `Authorization > Bearer Token` e cole o token. Para conferir, use **GET** `/api/usuarios/me`.

- **401**: token faltando, inválido ou expirado;
- **403**: token válido, mas sem permissão;
- **400**: dados inválidos (conforme a rota).

## 4. Proteção dos endpoints

| Recursos | Acesso |
|---|---|
| `POST /api/usuarios/cadastro` e `POST /api/usuarios/login` | Público |
| `GET /api/usuarios/me` | Logado |
| `GET /api/usuarios/busca/:id` e alterações/exclusão de usuário | Somente o próprio usuário |
| `GET /api/usuarios/busca/nome/:nome` | Logado, retorna somente campos públicos |
| `GET /api/instituicoes` e `GET /api/instituicoes/:id` | Público |
| `POST /api/instituicoes` | Usuário tipo `instituicao`; o `id_usuario` vem do token |
| `PUT` e `DELETE /api/instituicoes/:id` | Somente dono do hemocentro |
| `GET /campanhas`, `GET /campanhas/hemocentro/:id` | Público |
| `POST /campanhas` | Instituição dona do hemocentro informado |
| `PUT`, `DELETE /campanhas/:id` | Instituição dona da campanha |
| `GET /grupos`, `GET /grupos/:nome` | Público |
| `POST /grupo` | Logado; o `id_criador` vem do token |
| `PUT`, `DELETE /grupo/:id` | Criador do grupo |
| `POST /api/participacoes`, `GET /api/participacoes` | Candidato logado; ID vem do token e listagem só mostra as próprias participações |
| `GET`, `PUT`, `DELETE /api/participacoes/:id` | Somente dono da participação |
| `POST /membro` | Logado; entra apenas como `membro`, com seu ID do token |
| `GET /membros/grupo/:id_grupo` | Logado; consulta não expõe tipo sanguíneo |
| `GET /grupos/usuario/:id_usuario` | Somente o próprio usuário |
| `PUT /membro/:id` | Criador/admin do grupo |
| `DELETE /membro/:id` | Próprio membro ou criador/admin do grupo |
| `GET /gruposCampanhas`, `GET /gruposCampanhas/:id` | Público |
| `POST /grupoCampanhas` | Criador/admin do grupo informado |
| `PUT`, `DELETE /grupoCampanhas/:id` | Criador/admin do grupo do vínculo |
| `GET /api/status` | Público |

## 5. Mudanças nos corpos das requisições

Por segurança, você não precisa mais enviar o ID de usuário para criar um grupo ou registrar participação: ele é adicionado pelo middleware a partir do JWT. Se enviar um ID de outra pessoa, a API retorna **403**.

Exemplo de **POST** `/grupo`:

```json
{ "nome_grupo": "Doadores SP", "descricao": "Nosso grupo de doação" }
```

Exemplo de **POST** `/api/participacoes`:

```json
{ "id_campanha": 1, "status_participacao": "interessado" }
```

Para `POST /api/instituicoes`, envie os demais campos da instituição, sem `id_usuario`.

Para `POST /campanhas`, envie o `id_hemocentro` da própria instituição. Para `PUT /campanhas/:id`, o middleware recupera o hemocentro existente e não permite trocá-lo.

Para `POST /grupoCampanhas`, envie `{ "id_grupo": 1, "id_campanha": 1, "meta_participacoes": 10 }`. Para editar esse vínculo, envie **somente** `{ "meta_participacoes": 15 }`.

## 6. Arquivos principais

- `src/controller/authController.js` — rotas de login e `me`;
- `src/service/authService.js` — valida CPF/senha e gera token;
- `src/repository/usuariosRepository.js` — busca de credenciais pelo CPF/ID;
- `src/utils/jwt.js` — JWT já existente no projeto;
- `src/utils/permissoes.js` — bloqueia alterações em recursos de outros usuários;
- `src/controller/*Controller.js` — middlewares ligados às rotas;
- `src/routes.js` — registros dos controllers.

Também foram corrigidos problemas preexistentes de imports, duplicidade de GET de campanhas, campo `horario_inicio`, e CRUD básico de `grupos_campanhas` para possibilitar registrar as respectivas rotas.

## 7. Testes importantes

1. Login válido: retorna token (200).
2. Senha inválida: retorna 401.
3. Chamar `/api/usuarios/me` sem token: retorna 401.
4. Chamar `/api/usuarios/me` com token: retorna 200 e os dados do usuário logado.
5. Candidato tentar criar campanha: retorna 403.
6. Instituição A tentar editar campanha da instituição B: retorna 403.
7. Usuário A tentar alterar telefone do usuário B: retorna 403.
8. Membro comum tentar promover outro membro a administrador: retorna 403.

**Limites:** a revisão verificou sintaxe de arquivos JavaScript e resolução de imports, mas não executou testes integrados contra um servidor MySQL real nem contra o frontend React. Antes de implantar em produção, configure TLS/HTTPS, CORS para a origem real, limitação de tentativas de login e testes automatizados de autorização. Como em qualquer token stateless, revogação imediata (logout forçado) exige uma estratégia adicional (por exemplo, lista de revogação ou versão de sessão).
