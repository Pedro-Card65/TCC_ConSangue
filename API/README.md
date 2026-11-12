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

O formulário React usa o contrato existente de `POST /api/campanhas`: `id_hemocentro`, `nome_campanha`, `descricao`, `data_inicio`, `data_fim`, `horario_inicio`, `horario_fim`, `status_campanha`. Datas usam `YYYY-MM-DD`, horários são opcionais, status aceita `ativa` ou `encerrada`. O servidor val���q�^