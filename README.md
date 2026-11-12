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
- **Grupos privados ou públicos:** grupo privado exige convite de 8 caracteres; grupo público permite entrada direta de usuário autenticado. Grupos antigos continuam privados por padrão.
- Em `POST /api/membro`, o ID numérico ainda NÃO substitui convite. Apenas a rota separada `POST /api/membro/publico` aceita o ID de um grupo que o banco confirme como público.
- Exibição dos integrantes somente para membros autorizados.
- Edição do nome, descrição e foto do grupo pelo criador.
- Saída e exclusão de grupos, respeitando permissões e relacionamentos existentes.
- Vinculação de grupos às campanhas por administradores, com meta de participações. O vínculo coletivo **não registra interesse ou presença individual automaticamente**: cada membro pode optar por `interessado` ou `pretende_ir`.
- A tela Participações mostra a próxima campanha com base em interesse registrado e/ou intenção de comparecimento, sem equiparar interesse a presença agendada.

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
│   ├── package.json
│   └── src/
│       ├── api.js
│       ├── routes.js
│       ├── controller/
│       ├── service/
│       ├── repository/
│       └── utils/
├── Database/
│   └── ConSangue.sql
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

O arquivo **`Database/ConSangue.sql`** é a única fonte SQL de criação do banco. Ele já contém as sete tabelas e incorpora as antigas alterações de estrutura: foto de perfil, foto de grupo, código único de convite e visibilidade público/privado.

O arquivo contém **somente a estrutura do banco**. Dados fictícios e comandos de preenchimento usados durante o desenvolvimento foram retirados do repositório.

#### Banco novo x banco já existente

O `ConSangue.sql` cria a estrutura **de um banco novo**. Não o reexecute sobre o MySQL já utilizado pelo projeto: isso não é um procedimento de atualização e pode gerar conflitos de tabelas existentes. Para bancos antigos, compare o schema atual com o SQL consolidado, faça backup e aplique **somente as alterações realmente ausentes**, após revisão.

As migrações antigas de estrutura foram incorporadas às definições `CREATE TABLE`; seus arquivos SQL separados foram removidos por redundância. Para inspecionar as colunas de um banco existente sem alterá-lo:

```sql
SHOW COLUMNS FROM ConSangue.usuarios LIKE 'foto_perfil';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'foto_grupo';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'codigo_convite';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'visibilidade';
```

O Railway já recebeu as alterações de foto e convite em 11/11/2026. A API agora verifica e adiciona automaticamente a coluna `visibilidade` na primeira criação/edição de grupo ou entrada em grupo público, caso esteja ausente. Grupos existentes ficam privados por padrão. Esse ajuste não exige script manual, mas a conta da API no MySQL precisa de permissão `ALTER`. Os scripts administrativos antigos foram retirados do projeto por não participarem da execução da API ou da instalação. O histórico Git preserva as versões anteriores; **nunca execute o `ConSangue.sql` completo em um banco existente**. Consulte [API/README.md](API/README.md).

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

### 5. Gerar o build do React

Na pasta `React`:

```bash
npm run build
```

O comando compila o frontend para produção, sem executar a antiga suíte de testes. O workflow `.github/workflows/react-ci.yml` também realiza somente a compilação quando houver alterações no React.

O build gera `React/build`. A URL da API deve ser configurada em `REACT_APP_API_URL` durante a publicação. A API utiliza `npm start` no Railway; seu processo de inicialização não executa a antiga suíte de testes.

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
| `POST` | `/api/membro/publico` | Entrar diretamente em grupo público autenticado |
| `GET` | `/api/membros/grupo/:id_grupo` | Ver integrantes (somente membros autorizados) |
| `POST` | `/api/grupoCampanhas` | Vincular grupo a campanha |
| `GET` | `/api/participacoes` | Consultar participações próprias |
| `POST` | `/api/participacoes` | Registrar participação |
| `DELETE` | `/api/participacoes/:id` | Cancelar participação |

As rotas protegidas exigem JWT, normalmente enviado como:

```http
Authorization: Bearer SEU_TOKEN
```

No endpoint `POST /api/membro`, envie `codigo_convite` com 8 caracteres válidos; informar somente `id_grupo` nessa rota continua proibido. Para grupo **público**, `POST /api/membro/publico` recebe `{ "id_grupo": 123 }`, mas o backend confirma `visibilidade='publico'` no MySQL antes de permitir a entrada. **A API prepara automaticamente a coluna em bancos antigos.** O erro 503 pode ocorrer se o MySQL impedir a alteração (por exemplo, falta de permissão `ALTER`). Em produção, mantenha backup antes de publicar versões que possam modificar a estrutura do banco. A API valida autenticação, perfil e titularidade de cada operação.

## Segurança e privacidade

- As senhas são tratadas com **bcrypt** e o acesso autenticado utiliza **JWT**.
- O backend verifica perfis, titularidade de registros e permissões de administradores de grupos.
- As rotas internas do React são protegidas; uma resposta `401` da API invalida a sessão, exceto na própria tentativa de login.
- Códigos de convite e fotos privadas de grupos não são incluídos nas listagens públicas; a lista de membros exige participação no grupo.
- Tokens, dados pessoais, segredos JWT e credenciais do MySQL não devem ser publicados no GitHub, Trello ou em capturas de tela.
- Utilize dados fictícios e contas de teste nas demonstrações. Revise segredo JWT, CORS e configuração do serviço de produção antes da apresentação.
- O uso de bcrypt, JWT e MySQL **não equivale automaticamente a conformidade integral com a LGPD**; uma implantação real exige avaliação específica de proteção, finalidade, retenção e exclusão de dados.
- O status de comparecimento informado não é comprovante de doação efetiva.

## Limitações conhecidas

- **Cadastro de instituição aberto:** `POST /api/usuarios/cadastro` aceita `tipo_usuario='instituicao'` de qualquer pessoa, sem verificação (`API/src/service/usuariosService.js:140`). Não há validação de que a conta pertence a um hemocentro real.
- **CORS aberto:** a API usa `cors()` sem restrição de origem (`API/src/api.js:7`).
- **Sem limite de tentativas de login:** não há rate limit na API (nenhuma biblioteca de limitação nas dependências de `API/package.json`).
- **Validação manual necessária:** os arquivos de testes automatizados foram removidos do repositório, portanto é necessário verificar os fluxos principais no ambiente publicado.
- **Participação e presença são informadas pelo usuário:** interesse, intenção e comparecimento informado não são confirmação de doação de sangue.
- **Identificadores internos em listagens públicas:** `GET /api/grupos` e `GET /api/grupos/:nome` devolvem `id_criador` (`API/src/repository/gruposRepository.js:97`, `:108`). `GET /api/instituicoes` e `GET /api/instituicoes/:id` usam `SELECT *` e devolvem `id_usuario` do dono (`API/src/repository/instituicoesRepository.js:22`, `:41`).

## Preparação da apresentação

Antes da feira, confira manualmente a disponibilidade do site e da API, o login, a busca, o registro de interesse, a criação de campanhas e os grupos com convites. Prepare contas e registros de demonstração somente em ambiente apropriado, sem incluir dados pessoais ou credenciais no repositório.

**Situação em 12/11/2026:** a `master` mantém as funcionalidades do React e da API, enquanto o banco de dados de produção continua no Railway. O arquivo `Database/ConSangue.sql` contém apenas o esquema de criação. Os testes automatizados e as amostras de dados foram retirados do código por solicitação da equipe; a verificação de comportamento deverá ser feita separadamente.

## Contexto acadêmico

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC) — Técnico em Informática, turma Informática D**, pelos integrantes Igor Prado, Miguel Costa, Miguel Ananias, Paulo Spínola e Pedro Cardoso.

O projeto integra desenvolvimento frontend, API REST, banco relacional, autenticação, UI/UX, controle de versão, testes e implantação web.

**ConSangue — Conectando Vidas.**
