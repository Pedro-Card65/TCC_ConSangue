# ConSangue 🩸

**Conectando Vidas — tecnologia e mobilização coletiva para incentivar a doação de sangue.**

O **ConSangue** é uma plataforma web desenvolvida como Trabalho de Conclusão de Curso (TCC) para facilitar a divulgação de campanhas de doação de sangue e estimular a mobilização coletiva. O sistema aproxima candidatos à doação, grupos de pessoas e instituições responsáveis pelas campanhas.

Mais do que informar sobre campanhas, o projeto busca transformar o interesse individual em participação organizada por meio de comunidades, metas coletivas e acompanhamento das ações.

## Objetivo

Centralizar informações sobre campanhas e hemocentros, permitir que usuários encontrem oportunidades de participação e oferecer ferramentas para que grupos e instituições organizem iniciativas de mobilização.

> **Importante:** o ConSangue é uma plataforma de mobilização e acompanhamento. O registro de interesse, intenção ou comparecimento informado **não equivale à confirmação clínica de uma doação de sangue**.

## Acesso ao projeto

| Recurso | Endereço |
| --- | --- |
| Site publicado (Vercel) | https://tcc-consangue1.vercel.app |
| API (Railway) | https://tccconsangue-production.up.railway.app |
| Status HTTP da API | https://tccconsangue-production.up.railway.app/api/status |
| Protótipo (Figma) | https://www.figma.com/design/bdDJZeDB4bHFSi6C6EUbuP/ConSangue |
| Organização (Trello) | https://trello.com/b/aTNrT1IH/consangue |

O código está publicado na branch principal. **Os registros de deploy bem-sucedido não substituem testes de acesso ao MySQL, autenticação e persistência em produção.**

## Funcionalidades desenvolvidas

### Candidatos à doação

- Cadastro, login, logout, JWT e rotas privadas protegidas.
- Home com campanhas reais, informações de hemocentros e detalhes das campanhas.
- **Busca global** por campanhas, hemocentros e grupos, com página de resultados.
- Filtros disponíveis na página de campanhas (nome, cidade e status).
- Registro e remoção de interesse em campanhas ativas; participação individual ou associada a grupo.
- Histórico de participações com consulta e cancelamento dos registros.
- Perfil com foto, informações da conta, contadores de participação e grupos.

### Grupos de mobilização

- Consulta de grupos disponíveis e dos grupos do usuário.
- Criação de grupos, com atribuição automática do papel de administrador ao criador.
- **Entrada mediante código de convite alfanumérico de 8 caracteres**. A API atual **não permite entrar informando somente o ID numérico do grupo**.
- Exibição dos integrantes somente para membros autorizados.
- Edição do nome, descrição e foto do grupo pelo criador.
- Saída e exclusão de grupos, respeitando permissões e relacionamentos existentes.
- Vinculação de grupos às campanhas por administradores, com meta de participações.

### Instituições e hemocentros

- Cadastro do hemocentro por conta institucional autenticada.
- Painel institucional com listagem das campanhas próprias.
- Criação de campanhas com nome, descrição, datas, horários opcionais e status.
- Indicadores de campanhas, grupos vinculados e intenções de comparecimento.
- Indicadores agregados de interessados, usuários que pretendem ir, comparecimentos informados e grupos associados às campanhas.
- API de atualização/exclusão de dados institucionais e campanhas com controle de titularidade.

> Os indicadores representam registros feitos na plataforma, **não** doações de sangue clinicamente comprovadas. Nem todas as operações administrativas disponíveis na API possuem telas completas no frontend.

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Front-end | React, React Router, JavaScript, Sass/SCSS |
| Comunicação HTTP | Axios |
| Back-end | Node.js, Express |
| Banco de dados | MySQL, mysql2 |
| Autenticação | JSON Web Token (JWT), bcrypt |
| Configuração | dotenv |
| Hospedagem | Vercel (front-end), Railway (API e MySQL) |
| Organização e qualidade | GitHub, GitHub Actions, Trello, Figma e VS Code |

## Estrutura do repositório

```text
TCC_ConSangue/
├── API/
│   ├── .env.example
│   ├── README.md
│   ├── scripts/
│   │   ├── preencher_codigos_grupos.mjs
│   │   └── migrar_grupos_railway.mjs
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
│   ├── migracao_foto_perfil.sql
│   ├── migracao_foto_grupo.sql
│   └── migracao_codigo_convite_grupo.sql
├── React/
│   ├── .env.example
│   ├── .env.production
│   ├── vercel.json
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── componentes/
│       ├── layouts/
│       ├── pages/
│       │   ├── login/
│       │   ├── home/
│       │   ├── busca/
│       │   ├── campanhas/
│       │   ├── grupos/
│       │   ├── participacoesHistorico/
│       │   └── perfil/
│       ├── services/
│       └── routes.jsx
├── .github/workflows/react-ci.yml
├── API_ENDPOINTS.md
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

#### Migrações para bancos já existentes

A criação de um banco novo pelo `Database/ConSangue.sql` já inclui fotos de perfil e grupo e códigos de convite. Para **bancos antigos**, existem migrações separadas:

| Migração | Atualização |
| --- | --- |
| `Database/migracao_foto_perfil.sql` | Coluna `foto_perfil` em `usuarios` |
| `Database/migracao_foto_grupo.sql` | Coluna `foto_grupo` em `grupos` |
| `Database/migracao_codigo_convite_grupo.sql` | Coluna `codigo_convite` em `grupos` |

**Faça backup e confira o schema antes de cada migração.** Os comandos `ALTER TABLE` não devem ser repetidos se as colunas já existirem. Para consultar as colunas, por exemplo:

```sql
SHOW COLUMNS FROM ConSangue.usuarios LIKE 'foto_perfil';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'foto_grupo';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'codigo_convite';
```

Após migrar os códigos de convite de um banco que já possuía grupos, preencha os códigos ausentes. Execute na pasta `API`, com as variáveis de conexão do **ambiente desejado**:

```bash
node scripts/preencher_codigos_grupos.mjs
```

Não execute scripts sobre o Railway sem backup e conferência do banco de destino. Detalhes em [API/README.md](API/README.md).

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

### 5. Executar testes e gerar o build do React

Na pasta `React`:

```bash
npm test -- --watchAll=false --runInBand
npm run build
```

O `prebuild` do React executa os testes antes do build. O repositório também possui o workflow `.github/workflows/react-ci.yml`, que executa os testes e a compilação em alterações relevantes da `master` e em pull requests. **Confira os resultados mais recentes em GitHub Actions**; a existência do workflow não significa que os testes tenham passado.

O build gera a pasta `React/build`. A URL da API deve estar configurada corretamente por `REACT_APP_API_URL` durante a compilação/publicação.

**Nota sobre a API:** o `npm test` de `API/package.json` ainda utiliza o script padrão de erro e não corresponde a uma suíte automatizada funcional na versão atual. O `npm start` da API utiliza `nodemon`; revisar o comando de produção no Railway.

## Banco de dados

O esquema relacional está definido em `Database/ConSangue.sql`.

| Tabela | Finalidade |
| --- | --- |
| `usuarios` | Candidatos e instituições, com foto de perfil opcional |
| `hemocentros` | Informações das instituições/hemocentros |
| `campanhas` | Dados e períodos das campanhas |
| `grupos` | Comunidades, criadores, foto de grupo e códigos de convite |
| `membros_grupo` | Vínculos e papéis dos participantes |
| `grupos_campanhas` | Vínculos grupo–campanha e metas de participações |
| `participacoes` | Registros de interesse, intenção e comparecimento informado |

## API — principais endpoints

A API utiliza o prefixo `/api`. A documentação detalhada está em [API_ENDPOINTS.md](API_ENDPOINTS.md) e [API/README.md](API/README.md).

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/status` | Resposta HTTP básica da API |
| `POST` | `/api/usuarios/cadastro` | Cadastro de usuário |
| `POST` | `/api/usuarios/login` | Login e emissão de JWT |
| `GET` | `/api/usuarios/me` | Dados do usuário autenticado |
| `PUT` | `/api/usuarios/foto` | Atualizar/remover foto de perfil |
| `GET` | `/api/campanhas` | Listar campanhas |
| `POST` | `/api/campanhas` | Criar campanha (instituição) |
| `GET` | `/api/instituicoes` | Listar hemocentros |
| `GET` | `/api/instituicoes/me` | Perfil e dados da instituição autenticada |
| `GET` | `/api/instituicoes/me/adesao` | Indicadores de adesão às campanhas |
| `GET` | `/api/grupos` | Lista pública de grupos |
| `POST` | `/api/grupo` | Criar grupo |
| `PUT` | `/api/grupo/:id` | Editar grupo (somente criador) |
| `GET` | `/api/grupos/usuario/:id_usuario` | Listar os próprios grupos |
| `POST` | `/api/membro` | Entrar com código de convite |
| `GET` | `/api/membros/grupo/:id_grupo` | Ver integrantes (somente membros autorizados) |
| `POST` | `/api/grupoCampanhas` | Vincular grupo a campanha |
| `GET` | `/api/participacoes` | Consultar participações próprias |
| `POST` | `/api/participacoes` | Registrar participação |
| `DELETE` | `/api/participacoes/:id` | Cancelar participação |

As rotas protegidas exigem JWT, normalmente enviado como:

```http
Authorization: Bearer SEU_TOKEN
```

No endpoint `POST /api/membro`, envie `codigo_convite` com 8 caracteres válidos. **Informar somente `id_grupo` não é aceito para ingresso.** A API valida autenticação, perfil e titularidade de cada operação.

## Segurança e privacidade

- As senhas são tratadas com **bcrypt** e o acesso autenticado utiliza **JWT**.
- O backend verifica perfis, titularidade de registros e permissões de administradores de grupos.
- As rotas internas do React são protegidas; uma resposta `401` da API invalida a sessão, exceto na própria tentativa de login.
- Códigos de convite e fotos privadas de grupos não são incluídos nas listagens públicas; a lista de membros exige participação no grupo.
- Tokens, dados pessoais, segredos JWT e credenciais do MySQL não devem ser publicados no GitHub, Trello ou em capturas de tela.
- Utilize dados fictícios e contas de teste nas demonstrações. Revise segredo JWT, CORS e configuração do serviço de produção antes da apresentação.
- O uso de bcrypt, JWT e MySQL **não equivale automaticamente a conformidade integral com a LGPD**; uma implantação real exige avaliação específica de proteção, finalidade, retenção e exclusão de dados.
- O status de comparecimento informado não é comprovante de doação efetiva.

## Testes de aceitação e preparação para o TCC

A demonstração deve ser validada com **contas fictícias**, na versão realmente publicada:

1. Criar uma conta institucional, autenticar e cadastrar o hemocentro.
2. Criar campanha, confirmar a listagem e recarregar a página.
3. Entrar com uma conta de candidato, buscar campanha e registrar interesse.
4. Abrir o histórico, verificar a participação e testar o cancelamento.
5. Criar grupo, compartilhar o código de convite e ingressar com outro usuário fictício.
6. Associar grupo e campanha, respeitando as permissões.
7. Verificar persistência no MySQL após recarregar e testar logout, `401`, `403` e duplicidade.

O endpoint `/api/status` confirma apenas que o servidor HTTP está respondendo. Use uma consulta real, como `GET /api/campanhas`, e operações com dados fictícios para verificar a integração com MySQL.

**Situação em 11/11/2026:** o frontend está configurado para Vercel e a API/MySQL para Railway. A branch `master` contém busca global, grupos com convites, painel institucional, foto de grupos, indicadores e testes React. As migrações de fotos e convites foram executadas no MySQL do Railway em 11/11/2026, com backup e rotação dos 3 códigos expostos. Os convites antigos não funcionam mais. Os testes automatizados de React e de política de convites passam no Vercel/Railway; ainda são necessários testes ponta a ponta com contas de demonstração, autorização entre membros e revisão visual em dispositivos reais.

## Contexto acadêmico

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC) — Técnico em Informática, turma Informática D**, pelos integrantes Igor Prado, Miguel Costa, Miguel Ananias, Paulo Spínola e Pedro Cardoso.

O projeto integra desenvolvimento frontend, API REST, banco relacional, autenticação, UI/UX, controle de versão, testes e implantação web.

**ConSangue — Conectando Vidas.**
