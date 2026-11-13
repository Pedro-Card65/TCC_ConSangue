# Painel institucional e criação de campanhas

`GET /api/instituicoes/me` exige `Authorization: Bearer <token>` de uma conta do tipo `instituicao`. O titular é extraído do JWT; parâmetros de usuário enviados pelo cliente não escolhem a instituição.

Resposta 200 para uma instituição cadastrada:

```json
{
  "instituicao": { "id_hemocentro": 4, "id_usuario": 7, "nome_hemo": "Exemplo" },
  "estatisticas": { "campanhas": 2, "grupos": 1, "agendamentos": 3 }
}
```

`instituicao` também inclui endereço, cidade, estado, CEP, telefone e data de cadastro. Uma conta sem hemocentro recebe `{ "instituicao": null }`, permitindo completar o cadastro por `POST /api/instituicoes`. O usuário titular desse POST também vem do JWT.

- Campanhas: todas as campanhas da instituição.
- Grupos: grupos distintos vinculados às suas campanhas, sem duplicar um grupo presente em várias campanhas.
- Agendamentos: registros com `status_participacao = 'pretende_ir'`, inclusive de datas passadas. Não representa presença ou doação confirmada.
- 401: sessão ausente, inválida ou expirada; 403: perfil sem permissão; 500: falha interna. Falha de consulta não representa instituição ausente.

O painel oferece criação, edição (`PUT /api/campanhas/:id`) e exclusão (`DELETE /api/campanhas/:id`) de campanhas, com aviso e bloqueio por vínculos. O formulário React usa o contrato existente de `POST /api/campanhas`: `id_hemocentro`, `nome_campanha`, `descricao`, `data_inicio`, `data_fim`, `horario_inicio`, `horario_fim`, `status_campanha`. Datas usam `YYYY-MM-DD`, horários são opcionais, status aceita `ativa` ou `encerrada`. O servidor valida titularidade do hemocentro e datas/horários. Sucesso retorna 200 com `{ "id_campanha": 12 }`; validações retornam 400, recurso alheio 403 e conflito 409. Não existe campo de meta de doações para campanha neste contrato.

## Publicação e conferência manual

Publicar a API com a nova rota antes de disponibilizar o novo painel no React. Nenhuma migração de banco é exigida por esses dois blocos. O preview React usa a URL de API configurada no ambiente: enquanto essa API estiver na versão anterior, o painel novo não estará disponível.

Após revisão e publicação, entrar com uma conta institucional criada para a demonstração, abrir Perfil, cadastrar o hemocentro se necessário, criar campanha, conferir lista e indicadores, recarregar e verificar a campanha na listagem de candidato. Usar um ambiente apropriado para esse fluxo, pois o formulário grava no banco da API configurada. Edição e exclusão estão disponíveis no painel; campanhas com grupos/participações vinculados retornam 409 e não são apagadas.


## Banco de dados — arquivo SQL consolidado

A estrutura atual de um banco MySQL **novo** está em `Database/ConSangue.sql`. Esse arquivo único contém os campos `foto_perfil`, `foto_grupo`, `codigo_convite` e `visibilidade`; os quatro scripts `ALTER TABLE` separados foram incorporados ao esquema e removidos. O arquivo SQL contém somente o esquema de tabelas, sem comandos de preenchimento de registros fictícios.

**Não rode `ConSangue.sql` em um banco já existente**, especialmente no Railway: ele cria as tabelas e não é uma migração incremental. Para bancos antigos, mantenha backup e confira as colunas abaixo. `ALTER TABLE` não é executado em requisições. Para banco antigo, faça backup, revise e execute manualmente `Database/migracao_controlada.sql`. A API retornará 503 com mensagem apropriada se faltar estrutura necessária:

```sql
SHOW COLUMNS FROM ConSangue.usuarios LIKE 'foto_perfil';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'foto_grupo';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'codigo_convite';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'visibilidade';
```

A coluna de visibilidade foi confirmada no MySQL do Railway em 12/11/2026: um grupo público e quatro privados. Não é necessário rodar ALTER em produção.

## Fotos, convites e grupos

- Fotos de grupos são convertidas para JPEG 256 × 256 no frontend e salvas na coluna `foto_grupo`.
- Convites têm 8 caracteres. O ID numérico não é convite e não permite entrar em grupos privados.
- A consulta pública de grupos lista apenas grupos `publico` e não expõe `foto_grupo` nem `codigo_convite`. Os membros acessam seus grupos privados pela rota autenticada `/api/grupos/usuario/:id_usuario`.
- A lista de integrantes exige autenticação e vínculo com o grupo.
- Para grupos públicos, há uma rota separada que exige autenticação e confirma `visibilidade = 'publico'` no banco.
- Os convites expostos anteriormente foram rotacionados; os códigos antigos foram invalidados.

Os antigos utilitários de migração e rotação de códigos foram retirados do repositório; suas versões permanecem recuperáveis no histórico Git. A API não depende deles para iniciar. **O `ConSangue.sql` serve para banco novo e não deve ser executado sobre o MySQL existente.** Não há dados de demonstração no SQL consolidado.


## Segurança da API em produção

- CORS só libera os domínios oficiais do ConSangue e os definidos opcionalmente em CORS_ORIGENS, separados por vírgula.
- O login bloqueia novas tentativas após 20 senhas incorretas pelo mesmo IP em 15 minutos. O limite fica em memória por instância; sistemas distribuídos devem usar armazenamento compartilhado.
- npm start usa Node.js diretamente; npm run dev usa nodemon.
- A lista pública de hemocentros não devolve id_usuario e a de grupos não devolve id_criador.

## Cadastro institucional, conta e testes

- Cadastro de candidato continua público. Para criar uma conta do tipo instituição é necessário o código secreto `CODIGO_CADASTRO_INSTITUICAO` configurado **somente no Railway**, com pelo menos 16 caracteres; o formulário solicita o código. Não coloque o segredo no código-fonte ou no frontend. Convite **não comprova** identidade de um hemocentro e não representa credenciamento oficial.
- `GET /api/usuarios/me` devolve os próprios dados, incluindo telefone. `PUT /api/usuarios/me` atualiza perfil com senha atual. `DELETE /api/usuarios/me/conta-institucional` exige senha e texto `EXCLUIR`.
- A exclusão institucional ocorre numa transação e **bloqueia** a operação se houver membros, participações ou grupos de outras pessoas vinculados. Em falhas, faz rollback e não deve remover dados de terceiros. Validar com banco isolado antes de usar no ambiente real.
- `npm test` na pasta `API` executa testes com `node --test` (municípios, convite e transações). O GitHub Actions inicia um MySQL descartável e valida rollback, vínculos de terceiros e filtros de grupos com registros fictícios, sem acessar a produção. `npm test` na pasta `React` executa testes de referência de municípios. O CI executa os dois e o build. Esses testes **não substituem** testes de integração no MySQL e validação manual do site.
- A base local de municípios permite validar estado/cidade sem dependência de chamadas externas ao IBGE durante o cadastro; fonte e licença em `LICENSE-municipios.txt`.
