# Evidência de demonstração — ConSangue

**Data:** 11/11/2026 (America/Sao_Paulo)  
**Ambiente:** React local em HTTP 200, API local em `localhost:3001`, MySQL em loopback; dados de demonstração sem dados pessoais.

## Resultado

- `React`: `npm test -- --watchAll=false` — 1 suíte, 7 testes aprovados.
- `React`: `npm run build` — compilação de produção concluída.
- `API/scripts/demo-e2e.mjs` — passou por login dos três perfis, criação institucional de campanha, criação de grupo pela candidata, entrada do segundo candidato, vínculo grupo-campanha, participação e indicador agregado da instituição.
- O teste removeu os registros temporários. Conferência posterior: `temporários campanha=0 grupo=0`.
- Interface local: HTTP 200.

Saída do teste ponta a ponta:

```text
E2E aprovado: instituição criou campanha; candidata criou grupo; candidato entrou; participação coletiva e indicador institucional conferidos.
```

## Limite da evidência

O E2E exercita a API real local e o build confirma que o React compila. Não houve automação de navegador nem captura de tela; outra pessoa deve repetir os passos visuais de [ROTEIRO_DEMONSTRACAO.md](ROTEIRO_DEMONSTRACAO.md), registrar observações e validar a apresentação antes de mover o cartão para “Concluídos”.