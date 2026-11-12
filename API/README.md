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

## Publicação e conferência manual

Publicar a API com a nova rota antes de disponibilizar o novo painel no React. Nenhuma migração de banco é exigida por esses dois blocos. O preview React usa a URL de API configurada no ambiente: enquanto essa API estiver na versão anterior, o painel novo não estará disponível.

Após revisão e publicação, entrar com uma conta institucional criada para a demonstração, abrir Perfil, cadastrar o hemocentro se necessário, criar campanha, conferir lista e indicadores, recarregar e verificar a campanha na listagem de candidato. Usar um ambiente apropriado para esse fluxo, pois o formulário grava no banco da API configurada. Edição/exclusão de campanhas e metas permanecem fora destes blocos.


## Banco de dados — arquivo SQL consolidado

A estrutura atual de um banco MySQL **novo** está em `Database/ConSangue.sql`. Esse arquivo único contém os campos `foto_perfil`, `foto_grupo`, `codigo_convite` e `visibilidade`; os quatro scripts `ALTER TABLE` separados foram incorporados ao esquema e removidos. O arquivo SQL contém somente o esquema de tabelas, sem comandos de preenchimento de registros fictícios.

**Não rode `ConSangue.sql` em um banco já existente**, especialmente no Railway: ele cria as tabelas e não é uma migração incremental. Para atualizar um banco antigo, faça backup, confira as colunas abaixo e prepare somente os ajustes ainda necessários, revisando cada `ALTER TABLE`:

```sql
SHOW COLUMNS FROM ConSangue.usuarios LIKE 'foto_perfil';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'foto_grupo';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'codigo_convite';
SHOW COLUMNS FROM ConSangue.grupos LIKE 'visibilidade';
```

As alterações de fotos e convites já foram executadas no Railway em 11/11/2026. A aplicação da coluna `visibilidade` no Railway **ainda deve ser conferida**. Se ela estiver ausente, a criação/entrada em grupos públicos pode retornar 503, conforme os repositórios da API. Os grupos existentes permanecem privados por padrão ao adicionar esse campo.

## Fotos, convites e grupos

- Fotos de grupos são convertidas para JPEG 256 × 256 no frontend e salvas na coluna `foto_grupo`.
- Convites têm 8 caracteres. O ID numérico não é convite e não permite entrar em grupos privados.
- A consulta pública de grupos não expõe `foto_grupo` nem `codigo_convite`. Esses dados são acessíveis apenas ao próprio integrante.
- A lista de integrantes exige autenticação e vínculo com o grupo.
- Para grupos públicos, há uma rota separada que exige autenticação e confirma `visibilidade = 'publico'` no banco.
- Os convites expostos anteriormente foram rotacionados; os códigos antigos foram invalidados.

Os scripts em `API/scripts/` são ferramentas operacionais históricas para bancos existentes, **não** fazem parte da criação de um novo banco e não devem ser executados em produção sem verificar o estado atual e garantir backup. Não há dados de demonstração incluídos no SQL consolidado.
