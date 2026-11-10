# ConSangue 🩸

**Conectando pessoas, grupos e instituições para fortalecer a doação de sangue.**

O **ConSangue** é uma plataforma web desenvolvida como Trabalho de Conclusão de Curso (TCC) para facilitar a divulgação de campanhas de doação de sangue e estimular a mobilização coletiva. O sistema aproxima candidatos à doação, grupos de pessoas e instituições responsáveis pelas campanhas.

Mais do que informar sobre campanhas, o projeto busca transformar o interesse individual em participação organizada por meio de comunidades, metas coletivas e acompanhamento das ações.

## Objetivo

Centralizar informações sobre campanhas e hemocentros, permitir que usuários encontrem oportunidades de participação e oferecer ferramentas para que grupos e instituições organizem iniciativas de mobilização.

> **Importante:** o ConSangue é uma plataforma de mobilização e acompanhamento. O registro de interesse, intenção ou comparecimento informado **não equivale à confirmação clínica de uma doação de sangue**.

## Funcionalidades

A documentação descreve o escopo funcional da versão prevista para a entrega do TCC.

### Para candidatos à doação

- Cadastro, autenticação e acesso ao perfil pessoal.
- Consulta a campanhas de doação e informações de hemocentros.
- Pesquisa de campanhas e visualização de detalhes.
- Registro e acompanhamento de participações em campanhas.
- Histórico das campanhas com as quais o usuário interagiu.
- Criação e participação em grupos para mobilização coletiva.

### Para grupos

- Criação e gerenciamento de grupos.
- Organização de membros e permissões de administração.
- Associação de grupos a campanhas.
- Definição e acompanhamento de metas de participação.

### Para instituições

- Cadastro e gerenciamento de informações institucionais/hemocentros.
- Criação, edição e gerenciamento de campanhas.
- Divulgação de datas, horários, descrições e status das campanhas.
- Acompanhamento de ações relacionadas às campanhas.

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Front-end | React, React Router, JavaScript, Sass/SCSS |
| Comunicação HTTP | Axios |
| Back-end | Node.js, Express |
| Banco de dados | MySQL, mysql2 |
| Autenticação | JSON Web Token (JWT), bcrypt |
| Configuração | dotenv |
| Hospedagem prevista | Vercel (front-end) e Railway (API) |
| Organização do projeto | GitHub, Trello e Figma |

## Estrutura do repositório

```text
TCC_ConSangue/
├── API/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── api.js
│       ├── routes.js
│       ├── controller/
│       ├── service/
│       ├── repository/
│       └── utils/
├── Database/
│   ├── ConSangue.sql
│   ├── dados_teste.sql
│   └── migracao_foto_perfil.sql
├── React/
│   ├── .env.example
│   ├── .env.production
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── componentes/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── routes.jsx
└── README.md
```

## Requisitos para executar localmente

- **Node.js** e **npm** instalados.
- **MySQL** em execução.
- Um editor de código, como o VS Code.
- MySQL Workbench ou outro cliente SQL (opcional, para facilitar a importação do banco).

Os comandos abaixo consideram a estrutura atual do repositório, com front-end e API em pastas separadas.

## Instalação e execução

### 1. Clonar o repositório

```bash
git clone https://github.com/Pedro-Card65/TCC_ConSangue.git
cd TCC_ConSangue
```

### 2. Criar o banco de dados

Execute o script **`Database/ConSangue.sql`** em uma instância local do MySQL.

Pelo MySQL Workbench, abra o arquivo SQL e execute o script. Outra opção, em um terminal que suporte redirecionamento de entrada (como Bash ou Prompt de Comando), é:

```bash
mysql -u root -p < Database/ConSangue.sql
```

O script cria o banco **`ConSangue`** e as tabelas necessárias.

O arquivo **`Database/dados_teste.sql`** é opcional e deve ser executado **somente em ambiente local/de testes**, após o script principal. Seus registros são fictícios; a senha armazenada no usuário de demonstração não é um hash válido para autenticação. Para testar login, crie uma conta pelo formulário de cadastro.

#### Atualizar um banco já existente (foto de perfil)

Quem já tinha o banco criado antes da foto de perfil deve adicionar a coluna `foto_perfil` com o script **`Database/migracao_foto_perfil.sql`**:

```sql
ALTER TABLE ConSangue.usuarios ADD COLUMN foto_perfil MEDIUMTEXT NULL;
```

O script **não é idempotente**: se a coluna já existir, o MySQL retorna erro de coluna duplicada. Para conferir antes, use `SHOW COLUMNS FROM ConSangue.usuarios LIKE 'foto_perfil';`. Não há nada a fazer se a coluna já aparecer. Bancos novos criados com `ConSangue.sql` já têm a coluna.

### 3. Configurar e iniciar a API

Em um terminal, a partir da raiz do repositório:

```bash
cd API
npm install
```

Crie um arquivo **`API/.env`** com base no **`API/.env.example`**. Exemplo de configuração local:

```dotenv
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_local
DB_NAME=ConSangue

Chave_Secreta=coloque_aqui_uma_chave_longa_forte_e_aleatoria
```

Substitua os valores de exemplo pelas credenciais do **seu ambiente** e use uma chave JWT aleatória forte. Nunca publique o arquivo `.env` nem compartilhe chaves ou senhas.

Inicie o servidor:

```bash
npm start
```

A API local utilizará, por padrão nesta configuração, **http://localhost:3001**.

Para verificar se o servidor está respondendo, acesse:

**http://localhost:3001/api/status**

Resposta esperada:

```json
{
  "status": "ok",
  "mensagem": "API Funcionando"
}
```

> O endpoint `/api/status` comprova que a API responde, mas não substitui um teste completo de autenticação e acesso ao banco.

### 4. Configurar e iniciar o React

Abra **outro terminal** na raiz do projeto:

```bash
cd React
npm install
npm start
```

A aplicação estará disponível em **http://localhost:3000**.

O cliente Axios utiliza a variável `REACT_APP_API_URL` e, na ausência dela, o endereço local `http://localhost:3001`. Se precisar definir explicitamente a URL da API para desenvolvimento, crie **`React/.env`** com:

```dotenv
PORT=3000
REACT_APP_API_URL=http://localhost:3001
```

O arquivo **`React/.env.example`** contém um modelo dessa configuração. Reinicie o React após alterar variáveis de ambiente.

### 5. Gerar a versão de produção do front-end

Dentro da pasta `React`:

```bash
npm run build
```

A compilação gera a pasta `React/build`. A URL pública da API deve estar definida corretamente nas variáveis usadas durante a compilação/deploy.

## Banco de dados

O esquema relacional está definido em `Database/ConSangue.sql`.

| Tabela | Finalidade |
| --- | --- |
| `usuarios` | Contas de candidatos e instituições, com a foto de perfil opcional (`foto_perfil`, em base64) |
| `hemocentros` | Informações das instituições/hemocentros |
| `campanhas` | Dados e períodos das campanhas |
| `grupos` | Comunidades de mobilização |
| `membros_grupo` | Vínculos e papéis dos participantes |
| `grupos_campanhas` | Associação entre grupos e campanhas, com metas |
| `participacoes` | Registros de interesse, intenção e comparecimento informado |

## API — principais endpoints

As rotas são agrupadas sob o prefixo `/api`. Alguns exemplos:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/status` | Verificar resposta da API |
| `POST` | `/api/usuarios/cadastro` | Cadastrar usuário |
| `POST` | `/api/usuarios/login` | Autenticar usuário |
| `GET` | `/api/usuarios/me` | Consultar usuário autenticado (inclui `foto_perfil`) |
| `PUT` | `/api/usuarios/foto` | Definir a foto de perfil do usuário autenticado (`{ "foto": "data:image/jpeg;base64,..." }`, JPEG, PNG ou WEBP, até 300 KB) ou removê-la com `{ "foto": null }`. O usuário vem do token, não do corpo |
| `GET` | `/api/campanhas` | Listar ou pesquisar campanhas |
| `POST` | `/api/campanhas` | Criar campanha (instituição) |
| `GET` | `/api/grupos` | Listar grupos |
| `POST` | `/api/grupo` | Criar grupo (autenticado) |
| `GET` | `/api/grupos/usuario/:id_usuario` | Listar grupos do usuário |
| `GET` | `/api/instituicoes` | Listar instituições |
| `GET` | `/api/participacoes` | Listar participações do candidato |
| `POST` | `/api/participacoes` | Registrar participação do candidato |

Rotas protegidas exigem token JWT, normalmente enviado em:

```http
Authorization: Bearer SEU_TOKEN
```

As permissões dependem do perfil do usuário e, conforme a operação, da titularidade do registro. Para detalhes de parâmetros e respostas, consulte os controllers e services em `API/src/`.

## Segurança e privacidade

- As senhas são tratadas com **bcrypt**.
- A autenticação usa **JWT** e validações de perfil/permissão no back-end.
- Variáveis de ambiente guardam as configurações locais e os segredos do servidor.
- Credenciais reais não devem ser adicionadas ao Git.
- Utilize dados fictícios nas capturas de tela, testes e demonstrações do TCC.
- Informações de participação no sistema não substituem documentos ou comprovantes emitidos por hemocentros.

## Contexto acadêmico

Projeto desenvolvido em equipe como **Trabalho de Conclusão de Curso (TCC)**, reunindo conhecimentos de desenvolvimento front-end, criação de APIs REST, banco de dados relacional, autenticação, design de interfaces e gestão de projeto.

**ConSangue — uma iniciativa para incentivar a participação e a solidariedade por meio da tecnologia.**
