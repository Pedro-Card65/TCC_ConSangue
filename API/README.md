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

O formulário React usa o contrato existente de `POST /api/campanhas`: `id_hemocentro`, `nome_campanha`, `descricao`, `data_inicio`, `data_fim`, `horario_inicio`, `horario_fim`, `status_campanha`. Datas usam `YYYY-MM-DD`, horários são opcionais, status aceita `ativa` ou `encerrada`. O servidor valida titularidade do hemocentro e datas/horários. Sucesso retorna 200 com `{ "id_campanha": 12 }`; validações retornam 400, recurso alheio 403 e conflito 409. A meta operacional vem dos vínculos grupo-campanha e é agregada no endpoint institucional de adesão.

## Verificação local

Com Node.js 24 e dependências instaladas, execute `npm test` nesta pasta. Os testes usam HTTP local com JWTs exclusivos de teste e substituem a conexão MySQL. A consulta dos indicadores também é executada sobre dados fictícios em SQLite em memória. Nenhuma conexão com o banco real é aberta. Essa verificação não substitui o teste de implantação com MySQL.

## Publicação e teste funcional

Publicar a API com a nova rota antes de disponibilizar o novo painel no React. Nenhuma migração de banco é exigida por esses dois blocos. O preview React usa a URL de API configurada no ambiente: enquanto essa API estiver na versão anterior, o painel novo não estará disponível.

Após revisão e publicação, entrar com uma conta institucional de teste, abrir Perfil, cadastrar o hemocentro se necessário, criar campanha, conferir lista e indicadores, recarregar e verificar a campanha na listagem de candidato. Usar ambiente/dados de teste para esse fluxo, pois o formulário grava no banco da API configurada. Edição/exclusão de campanhas e metas permanecem fora destes blocos.


## Fotos e convites de grupos

O código aceita editar a foto de cada grupo (JPEG convertido para 256 × 256) e novos convites de 8 caracteres, mantendo compatibilidade com os IDs numéricos anteriores.

Em um banco **já existente**, faça backup e aplique, uma única vez, as migrações:

1. `Database/migracao_foto_grupo.sql`
2. `Database/migracao_codigo_convite_grupo.sql`

Depois, com o ambiente de conexão MySQL corretamente configurado, execute a partir da pasta `API`:

```bash
node scripts/preencher_codigos_grupos.mjs
```

O preenchimento só altera códigos nulos, e pode ser repetido. Grupos, usuários, campanhas e vínculos são preservados. Até aplicar a migração, o código mantém a listagem antiga funcionando e retorna erro informativo ao tentar salvar foto ou entrar por código alfanumérico. Não exponha variáveis `DB_*` em mensagens ou commits.

Os códigos de convite não são um mecanismo de autorização: o backend continua verificando autenticação e permissões para ações administrativas. Fotos devem ser de grupos, não de documentos pessoais.

### Meta de mobilização por campanha

GET /api/instituicoes/me/adesao soma meta_participacoes dos grupos vinculados e retorna, por campanha, meta_participacoes, total_participacoes, progresso_percentual, estado_meta, meta_atingida, totais por status e grupos_vinculados. O total para a meta conta candidatos únicos com status pretende_ir ou comparecimento_informado; interessado aparece separado e não entra no progresso. A unicidade é por candidato/campanha. Sem grupos com meta, meta e progresso são null, estado sem_meta e o total permanece disponível. Comparecimento informado é autodeclarado e não confirma presença observada nem doação realizada.