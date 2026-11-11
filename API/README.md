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

O formulário React usa o contrato existente de `POST /api/campanhas`: `id_hemocentro`, `nome_campanha`, `descricao`, `data_inicio`, `data_fim`, `horario_inicio`, `horario_fim`, `status_campanha`. Datas usam `YYYY-MM-DD`, horários são opcionais, status aceita `ativa` ou `encerrada`. O servidor valida titularidade do hemocentro e datas/horários. Sucesso retorna 200 com `{ "id_campanha": 12 }`; validações retornam 400, recurso alheio 403 e conflito 409. Não existe campo de meta de doações para campanha neste contrato.

## Publicação e teste funcional

Publicar a API com a nova rota antes de disponibilizar o novo painel no React. Nenhuma migração de banco é exigida por esses dois blocos. O preview React usa a URL de API configurada no ambiente: enquanto essa API estiver na versão anterior, o painel novo não estará disponível.

Após revisão e publicação, entrar com uma conta institucional de teste, abrir Perfil, cadastrar o hemocentro se necessário, criar campanha, conferir lista e indicadores, recarregar e verificar a campanha na listagem de candidato. Usar ambiente/dados de teste para esse fluxo, pois o formulário grava no banco da API configurada. Edição/exclusão de campanhas e metas permanecem fora destes blocos.


## Fotos e convites de grupos

O código permite editar a foto de cada grupo (JPEG convertido para 256 × 256) e usar convites de 8 caracteres. **IDs numéricos são somente identificadores internos e não permitem entrar em grupos fechados.**

Em um banco **já existente**, faça backup e aplique, uma única vez, as migrações:

1. `Database/migracao_foto_grupo.sql`
2. `Database/migracao_codigo_convite_grupo.sql`

Depois, com o ambiente de conexão MySQL corretamente configurado, execute a partir da pasta `API`:

```bash
node scripts/preencher_codigos_grupos.mjs
```

O preenchimento só altera códigos nulos, e pode ser repetido. Grupos, usuários, campanhas e vínculos são preservados. Até aplicar a migração, o código mantém a listagem antiga funcionando e retorna erro informativo ao tentar salvar foto ou entrar por código alfanumérico. Não exponha variáveis `DB_*` em mensagens ou commits.

Códigos de convite permitem ingresso, mas não substituem a autorização: o backend valida autenticação, vínculo aos grupos e permissões administrativas. `GET /api/grupos` e `GET /api/grupos/:nome` são públicos **sem foto nem código**; `GET /api/grupos/usuario/:id_usuario` devolve esses campos somente ao próprio membro; `GET /api/membros/grupo/:id_grupo` exige participação. Os convites de produção expostos antes da correção S07 foram substituídos; compartilhar somente os códigos novos. Fotos devem representar grupos, não documentos pessoais.
