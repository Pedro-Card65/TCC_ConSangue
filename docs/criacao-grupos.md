# Criação de grupo com administrador

A API agora grava o grupo e seu criador em membros_grupo, com papel
administrador, na mesma transação e em uma conexão exclusiva. O ID continua
vindo do JWT por getAuthentication e inserirMeuId('id_criador'). A resposta
de sucesso continua sendo HTTP 200 com { "id": numero }, após o commit.

Campos ausentes, tipos incorretos e limites excedidos retornam 400. Falhas
do banco retornam 500 com mensagem genérica, sem SQL ou detalhes internos.
Em falhas, a API tenta rollback e sempre descarta a conexão. Se a conexão
cair durante o commit, a confirmação pode ser incerta: consulte os grupos
antes de repetir o POST; esta alteração não implementa idempotência.

## Validação automatizada

Na pasta API, com Node 24, execute `npm test`.
Os testes usam conexões simuladas, sem instalar dependências nem acessar
dados reais: sucesso, falhas em cada etapa, falha no rollback, concorrência,
validação dos campos e proteção do ID do criador.
Eles não substituem um teste de integração com MySQL e JWT assinado.

## Teste de integração pendente

Use um banco de desenvolvimento. Confirme em information_schema.tables que
grupos e membros_grupo usam InnoDB; transações exigem tabelas transacionais.
Não aplique este fluxo em tabelas MyISAM.

1. Inicie a API com suas configurações locais, sem versionar credenciais.
2. Faça login e use o Bearer Token no Thunder Client.
3. Consulte GET /api/usuarios/me para obter o ID autenticado.
4. Envie POST /api/grupo com apenas nome_grupo e descricao.
5. Confirme HTTP 200 e anote o id retornado.
6. Consulte GET /api/grupos/usuario/SEU_ID: o grupo deve aparecer exatamente
   uma vez com papel administrador, sem chamar POST /api/membro.
7. Confirme no banco que grupos.id_criador e membros_grupo.id_usuario
   correspondem ao usuário autenticado.
8. Teste nome vazio, nome maior que 100 e descrição maior que 255: HTTP 400
   sem inserir registros. Outro id_criador no corpo deve retornar 403.
   Sem token válido, a autenticação deve impedir a criação.
9. Em banco descartável, provoque uma falha no segundo INSERT (por exemplo,
   um trigger temporário de teste em membros_grupo que emita SIGNAL).
   Confirme HTTP 500 e ausência do grupo e do vínculo; remova o trigger.

## Grupo 1 já existente

A correção da API vale para novas criações. O arquivo
Database/corrigir-administrador-grupo-1.sql verifica e bloqueia o vínculo
id_membro=1, id_grupo=1, id_usuario=1, somente quando grupos.id_criador=1.
Ele promove o vínculo existente, sem duplicar membros. Por padrão termina
com ROLLBACK para inspeção. Confirme a linha inicial e o resultado; então
execute novamente trocando apenas o ROLLBACK final por COMMIT. Se já for
administrador, nenhuma alteração é necessária. Se a linha inicial não
existir, investigue os IDs antes de prosseguir.

Esse script não foi executado: o MySQL local estava indisponível.

## Integração React e trabalho da equipe

Base utilizada: master em 1a6756e8d6a0f03b49e994c2f68cffbeb3e3d0df.
Branch isolada: fix/grupo-criador-administrador. Nenhum arquivo React foi
alterado. Na inspeção inicial não havia PRs abertos; isso não permite
conhecer alterações ainda não enviadas pelos colegas. Revisem especialmente
connection.js antes de integrar, pois é compartilhado pela API.

A página React/src/pages/grupos/index.jsx ainda usa cartões estáticos.
O componente lateral-informacoes já consulta o usuário e seus grupos.
Reutilize o cliente de React/src/services/api e o token existente em
sessionStorage, conforme esse componente:

1. Carregar o usuário por GET /api/usuarios/me e listar seus grupos com
   GET /api/grupos/usuario/:id_usuario.
2. Abrir um formulário no botão Criar novo grupo, validando nome e descrição.
3. Enviar uma única requisição POST /api/grupo com Bearer Token e os dois
   campos. Não enviar id_criador, papel nem POST /api/membro para o criador.
4. Desabilitar o envio enquanto aguarda; após sucesso, buscar a lista
   novamente e atualizar também as informações laterais.
5. Renderizar nome_grupo, descricao e papel; tratar carregamento, lista
   vazia, sessão expirada e erro. Em falha de rede, consultar a lista antes
   de repetir a criação.

O GET atual não retorna quantidade de membros, e o contrato de entrada por
código não foi implementado aqui. Combine esses itens com os responsáveis
pelo React antes de substituir os cartões ou o botão Entrar com Código.
