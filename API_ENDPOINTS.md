# Endpoints da API ConSangue

Documento gerado a partir de `API/src/routes.js` e dos controllers em `API/src/controller/`. Onde a leitura não confirmou corpo ou resposta, está escrito **verificar no código** com o arquivo de referência.

## Convenções

- **Base:** `http://<host>:<PORT>`. Os caminhos abaixo já incluem o prefixo `/api` quando ele existe no código.
- **Autenticação:** JWT (HS256, validade de 2 horas) enviado em `Authorization: Bearer <token>` ou no header `x-access-token` (`API/src/utils/jwt.js:27-44`). Sem token válido, a resposta é **401** (`jwt.js:57`).
- **Perfil:** `candidato` ou `instituicao` (valor de `tipo_usuario`, gravado no token no login).
- **Formato de erro:** `{ "erro": "mensagem" }`. Em alguns controllers, o 500 devolve mensagem genérica.
- **Verificação de dono:** `API/src/utils/permissoes.js`. Quando o recurso não pertence ao usuário do token, a resposta é **403**. ID inválido (não inteiro positivo) é **400**.
- **Ordem das rotas:** `GET /api/instituicoes/me` está registrada antes de `GET /api/instituicoes/:id`, então `me` não cai no `:id`.

### Legenda de autenticação

| Símbolo | Significado |
|---|---|
| Pública | Sem header de autenticação |
| JWT | Token válido obrigatório; qualquer perfil |
| JWT + candidato | Token válido com `tipo_usuario === 'candidato'` |
| JWT + instituição | Token válido com `tipo_usuario === 'instituicao'` |
| JWT + dono | Token válido e o recurso pertence ao usuário do token |

---

## Status

| Método | Caminho | Auth | Corpo | Resposta | Códigos | Arquivo |
|---|---|---|---|---|---|---|
| GET | `/api/status` | Pública | — | `200 { status: "ok", mensagem: "API Funcionando" }` | 200 | `routes.js:14-19` |

---

## Usuários

Arquivos: `API/src/controller/authController.js` e `API/src/controller/usuariosController.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/usuarios/login` | Pública | — | `{ cpf, senha }` | `200 { token, usuario: { id_usuario, nome, tipo_usuario } }` | 200; 401 `"CPF ou senha incorretos."`; 400 para CPF inválido (verificar no código: `authService.js:6-13`); 500 |
| GET | `/api/usuarios/me` | JWT | Qualquer perfil (dados do próprio token) | — | `200 { id_usuario, nome, email, cidade, tipo_sanguineo, tipo_usuario, foto_perfil }` | 200; 401; 404 `"Usuário não encontrado."` (`usuariosService.js:173-176`); 500 |
| POST | `/api/usuarios/cadastro` | Pública | — | `{ usuario, nascimento, cpf, telefone, email, senha, cidade, tipo_sangue, tipo_usuario }` | `201 { mensagem, id_usuario }` | 201; 400 (campos obrigatórios, CPF, telefone, e-mail, senha 8–255, tipo sanguíneo, tipo de usuário; `usuariosService.js:57-142`); 409 `"CPF ou email já cadastrado."` (`usuariosService.js:156`); 500 |
| GET | `/api/usuarios/busca/:id` | JWT + dono (`somenteMeuId`) | Só o próprio usuário | — | `200` com a linha do usuário: `id_usuario, nome, email, data_nascimento, cidade, tipo_sanguineo, tipo_usuario, telefone, foto_perfil, data_cadastro`. Sem `senha_hash`. A resposta não traz `cpf` a partir da PR #6; antes dela, traz. | 200; 400 `"ID inválido."`; 403 para outro ID (`permissoes.js:32-41`); 404; 500 |
| GET | `/api/usuarios/busca/nome/:nome` | JWT | Qualquer perfil | — `200` **array direto** (sem envelope) com `id_usuario, nome, cidade, tipo_usuario, data_cadastro` (`usuariosRepository.js:51-61`; controller `usuariosController.js:60-75`) | 200; 400 `"Nome obrigatório"` ou `"Digite pelo menos 2 caracteres"` (`usuariosService.js:227-245`); 401; 500 |
| DELETE | `/api/usuarios/deletar/certeza/:id` | JWT + dono (`somenteMeuId`) | Só a própria conta | — | `200 { del }` (número de linhas afetadas; verificar no código: `usuariosController.js:79-106`) | 200; 400; 403; 409 `"Não é possível excluir a conta enquanto existirem registros vinculados."`; 500 |
| PUT | `/api/usuarios/modificar/telefone/:id` | JWT + dono (`somenteMeuId`) | Só a própria conta | `{ novotel, senha }` | `200 { trocarTelefone }` (verificar no código: `usuariosController.js:110-128`, `usuariosService.js`) | 200; 400; 403; 500 |
| PUT | `/api/usuarios/modificar/email/:id` | JWT + dono (`somenteMeuId`) | Só a própria conta | `{ novoemail, senha }` | `200 { trocaremail }` (verificar no código: `usuariosController.js:132-151`, `usuariosService.js`) | 200; 400; 403; 500 |
| PUT | `/api/usuarios/foto` | JWT | Qualquer perfil. O `id` vem do token, nunca do corpo ou da URL (`usuariosController.js:157-158`) | `{ foto }`: string base64 com prefixo `data:image/jpeg;base64,`, `data:image/png;base64,` ou `data:image/webp;base64,`; ou `null` para remover | `200 { mensagem: "Foto de perfil atualizada com sucesso!" }` ou `"Foto de perfil removida com sucesso!"` quando `foto` é `null` | 200; 400 para formato inválido, base64 inválido ou string de foto com mais de 300 KB de caracteres (`usuariosService.js:189`, `205`, `191-213`); 401; 500 `"Erro interno ao atualizar foto de perfil."` |

---

## Instituições

Arquivo: `API/src/controller/instituicoesController.js`. Validações em `API/src/service/instituicoesService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| GET | `/api/instituicoes` | Pública | — | Query opcional `cidade` (filtro parcial) | `200` array de hemocentros (`SELECT *`, ordenado por `nome_hemo`) | 200; 400 `"Filtro cidade inválido"`; 500 |
| GET | `/api/instituicoes/me` | JWT + instituição | Só instituição. Usa o `id_usuario` do token | — | `200 { instituicao, estatisticas: { campanhas, grupos, agendamentos } }`. Sem hemocentro cadastrado: `200 { instituicao: null }` | 200; 401; 403 `"Você não possui permissão."`; 500 |
| GET | `/api/instituicoes/:id` | Pública | — | — | `200` hemocentro (linha completa, incluindo `id_usuario`) | 200; 400 ID inválido; 404 `"Instituição não encontrada"`; 500 |
| POST | `/api/instituicoes` | JWT + instituição | Só instituição. `id_usuario` é injetado pelo servidor (`inserirMeuId`); se vier outro valor, 403 | `{ nome_hemo, cep, endereco, cidade, estado, telefone_centro }` (verificar no código: `instituicoesService.js:50-98`) | `201` hemocentro criado | 201; 400 (campos, CEP `#####-###`, UF, telefone 10–11 dígitos); 403; 404 `"Usuário não encontrado"`; 409 se já houver instituição; 422 `"Usuário não possui perfil de instituição"`; 500 |
| PUT | `/api/instituicoes/:id` | JWT + instituição + dono (`somenteDonoInstituicao`) | Só o dono do hemocentro | Mesmos campos do POST. Enviar `id_usuario` gera erro | `200` hemocentro atualizado | 200; 400; 403; 404; 500 |
| DELETE | `/api/instituicoes/:id` | JWT + instituição + dono | Só o dono do hemocentro | — | `204` sem corpo | 204; 403; 404; 409 `"Instituição possui registros vinculados"`; 500 |

---

## Campanhas

Arquivo: `API/src/controller/campanhasController.js`. Montado com prefixo `/api` (`routes.js:28`). Validações em `API/src/service/campanhasService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/campanhas` | JWT + instituição | Só instituição, e o `id_hemocentro` precisa ser do próprio usuário (`somenteMinhaInstituicaoNoBody`) | `{ id_hemocentro, nome_campanha (até 100), descricao?, data_inicio, data_fim (YYYY-MM-DD), horario_inicio?, horario_fim? (HH:MM), status_campanha: "ativa" \| "encerrada" }` | `200 { id_campanha }` (observação: 200, não 201) | 200; 400 (validações de `campanhasService.js:54-152`); 401; 403 hemocentro de outra instituição ou inexistente; 409; 500 |
| GET | `/api/campanhas` | Pública | — | Query opcional `nome` (busca parcial) | `200 { campanhas }` | 200; 400 `"Nome de busca inválido."`; 500 |
| GET | `/api/campanhas/hemocentro/:id` | Pública | — | — | `200 { campanhas }` | 200; 400 ID inválido; 500 |
| PUT | `/api/campanhas/:id` | JWT + instituição + dono da campanha (`somenteDonoCampanha`) | Só a instituição dona da campanha. O `id_hemocentro` não pode ser trocado (403) | Mesmos campos do POST | `200 { linhas }` | 200; 400; 401; 403; 409; 500 |
| DELETE | `/api/campanhas/:id` | JWT + instituição + dono da campanha | Só a instituição dona da campanha | — | `200 { linhas }` | 200; 403; 409 `"Não é possível excluir a campanha porque existem grupos ou participações vinculados."`; 500 |

---

## Grupos

Arquivo: `API/src/controller/gruposController.js`. Montado com prefixo `/api`. Validações em `API/src/service/gruposService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/grupo` | JWT | Qualquer perfil. `id_criador` é injetado pelo servidor (`inserirMeuId`) | `{ nome_grupo (até 100), descricao (até 255) }` | `200 { id }` (observação: 200, não 201) | 200; 400 (`gruposService.js:15-38`); 401; 404 "Usuário ou grupo relacionado não encontrado."; 500 |
| GET | `/api/grupos` | Pública | — | — | `200 { grupos }` | 200; 500 |
| GET | `/api/grupos/:nome` | Pública | — | — | `200 { grupos }` (busca por nome; verificar no código: `gruposService.listarGruposPorNomeService`) | 200; 500 |
| PUT | `/api/grupo/:id` | JWT + criador (`somenteCriadorGrupo`) | Só o criador do grupo | `{ nome_grupo (texto, até 100), descricao (texto, até 255) }`. Os dois são obrigatórios e não podem ficar vazios após `trim` (`gruposService.js:15-38`, `60-62`). O `id_criador` é definido pelo servidor (`permissoes.js:101`) | `200 { linhasAfetadas }` | 200; 400; 403; 404; 500 |
| DELETE | `/api/grupo/:id` | JWT + criador | Só o criador do grupo | — | `200 { linhasAfetadas }` | 200; 403; 409 `"Desvincule as campanhas antes de excluir o grupo."` (verificar no código: `gruposRepository.js:106-114`); 500 |

---

## Membros de grupo

Arquivo: `API/src/controller/membros_grupoController.js`. Montado com prefixo `/api`. Validações em `API/src/service/membros_grupoService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/membro` | JWT | Qualquer perfil. `id_usuario` vem do token e `papel` é sempre `"membro"` (`membros_grupoController.js:43`) | `{ id_grupo }` | `201 { id }` | 201; 400; 401; 404 `"Usuário ou grupo não encontrado."`; 409 `"Usuário já é membro deste grupo."`; 500 |
| GET | `/api/membros/grupo/:id_grupo` | JWT | Qualquer perfil | — | `200 { membros }` | 200; 400; 401; 500 |
| GET | `/api/grupos/usuario/:id_usuario` | JWT + dono (`somenteMeuId('id_usuario')`) | Só o próprio usuário | — | `200 { grupos }` | 200; 400; 403; 500 |
| PUT | `/api/membro/:id` | JWT + permissão de membro (`permissaoMembro()`) | Administrador do grupo ou criador. Ninguém rebaixa o criador (403) | `{ papel: "administrador" \| "membro" }` | `200 { linhasAfetadas }` | 200; 400 `"Papel deve ser 'administrador' ou 'membro'"`; 403; 404 `"Membro não encontrado"`; 500 |
| DELETE | `/api/membro/:id` | JWT + permissão de membro (`permissaoMembro(true)`) | O próprio membro pode sair; administrador ou criador pode remover. O criador não pode ser removido (403) | — | `200 { linhasAfetadas }` | 200; 403; 404; 409 `"Não é possível remover este vínculo porque existem registros relacionados."`; 500 |

---

## Vínculo grupo x campanha

Arquivo: `API/src/controller/grupos_campanhasController.js`. Montado com prefixo `/api`. Validações em `API/src/service/grupos_campanhasService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/grupoCampanhas` | JWT + administrador do grupo (`somenteAdminGrupo`, usa `id_grupo` do corpo) | Criador ou administrador do grupo | `{ id_grupo, id_campanha, meta_participacoes }` (verificar no código: `grupos_campanhasService.js:17-21`) | `201 { id }` | 201; 400 meta inválida; 401; 403; 404 `"Grupo ou campanha não encontrado."`; 409 `"Esse grupo já está vinculado à campanha."`; 500 |
| GET | `/api/gruposCampanhas` | Pública | — | — | `200 { grupos }` | 200; 500 |
| GET | `/api/gruposCampanhas/:id` | Pública | — | — | `200 { grupo }` | 200; 404 (verificar no código: `grupos_campanhasService.js:29-36`); 500 |
| PUT | `/api/grupoCampanhas/:id` | JWT + administrador do grupo (`somenteAdminDoGrupoCampanha`) | Criador ou administrador do grupo. Só a meta pode mudar; trocar o grupo retorna 403 (`permissoes.js:139-143`) | `{ meta_participacoes }` | `200 { linhasAfetadas }` | 200; 400; 403; 404; 500 |
| DELETE | `/api/grupoCampanhas/:id` | JWT + administrador do grupo | Criador ou administrador do grupo | — | `200 { linhasAfetadas }` | 200; 403; 409 `"Existem participações neste vínculo."`; 500 |

---

## Participações

Arquivo: `API/src/controller/participacoesController.js`. Os endpoints são do candidato (`tipo_usuario === 'candidato'`). Validações em `API/src/service/participacoesService.js`.

| Método | Caminho | Auth | Perfil / permissão | Corpo | Resposta | Códigos |
|---|---|---|---|---|---|---|
| POST | `/api/participacoes` | JWT + candidato | Só candidato. `id_usuario` vem do token | `{ id_campanha` (obrigatório), `id_grupo_campanha?` (vínculo grupo x campanha; o usuário precisa ser membro do grupo), `status_participacao?` (`"interessado"` \| `"pretende_ir"` \| `"comparecimento_informado"`; padrão `"interessado"`), `data_prevista?` (`YYYY-MM-DD`), `horario_previsto?` (`HH:MM` ou `HH:MM:SS`) }`. `id_usuario` vem do token (`participacoesController.js:35`; `participacoesService.js:28-106`, `106-148`) | `201` participação criada | 201; 400 (`participacoesService.js:61-73`); 401; 403 para instituição; 404 usuário/campanha; 409 participação duplicada; 422 `"Campanha não está ativa"` ou grupo não vinculado |
| GET | `/api/participacoes` | JWT + candidato | Só candidato. Lista só as próprias participações | Query opcional (`id_campanha`) | `200` **array direto** (sem envelope). O React aceita array ou `{ participacoes }` | 200; 401; 403 para instituição; 500 |
| GET | `/api/participacoes/:id` | JWT + candidato + dono (`somenteDonoParticipacao`) | Só o dono da participação | — | `200` participação | 200; 400; 403; 404 `"Participação não encontrada"`; 500 |
| PUT | `/api/participacoes/:id` | JWT + candidato + dono | Só o dono da participação | `{ id_grupo_campanha?, status_participacao?, data_prevista?, horario_previsto? }` (todos opcionais). Enviar `id_usuario` ou `id_campanha` retorna 400 `"Não é permitido trocar usuário ou campanha"`; corpo que não é objeto retorna 400 `"Dados inválidos"` (`participacoesService.js:177-215`) | `200` participação atualizada | 200; 400 `"Dados inválidos"` ou `"Não é permitido trocar usuário ou campanha"`; 403; 404; 500 |
| DELETE | `/api/participacoes/:id` | JWT + candidato + dono | Só o dono da participação | — | `204` sem corpo | 204; 403; 404; 500 |

---

## Observações

- **Autorização por perfil:** `GET /api/instituicoes/me` e os endpoints de campanha (`POST`, `PUT`, `DELETE`) exigem `instituicao`. Os endpoints de participação exigem `candidato`. Os de grupo e membro aceitam qualquer usuário autenticado, com checagem de criador ou administrador do grupo.
- **Rotas públicas:** `GET /api/instituicoes`, `GET /api/instituicoes/:id`, `GET /api/campanhas`, `GET /api/campanhas/hemocentro/:id`, `GET /api/grupos`, `GET /api/grupos/:nome`, `GET /api/gruposCampanhas`, `GET /api/gruposCampanhas/:id`. Todas leem dados sem token.
- **POSTs de criação:** `POST /api/usuarios/cadastro`, `POST /api/instituicoes`, `POST /api/membro`, `POST /api/grupoCampanhas` e `POST /api/participacoes` respondem 201. `POST /api/campanhas` e `POST /api/grupo` respondem 200 (ver Pendências). `POST /api/usuarios/login` não é criação e responde 200.
- **Verificação de chave em `jwt.js`:** o servidor não sobe sem `Chave_Secreta` no `.env` (`jwt.js:7-9`).

## Pendências do contrato

- **`GET /api/instituicoes/me`:** a rota já existe na master (`API/src/controller/instituicoesController.js:49`) e faz parte do contrato. O painel institucional do React depende dela.
- **Códigos de criação:** `POST /api/campanhas` e `POST /api/grupo` respondem 200, e os demais POSTs de criação respondem 201. Decidir se padroniza para 201 ou se mantém e documenta.
- **`cpf` na busca por ID:** `GET /api/usuarios/busca/:id` não traz `cpf` a partir da PR #6. Antes dela, traz.
