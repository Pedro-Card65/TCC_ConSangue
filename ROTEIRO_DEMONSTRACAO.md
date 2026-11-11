# Roteiro de demonstração — mobilização coletiva

**Responsável:** a definir pela equipe. Paulo é apenas uma sugestão, sem aceite registrado.  
**Pré-requisito:** [T01](https://trello.com/c/fG3mKZyw).  
**Estado:** roteiro preparado; validação independente e evidência visual ainda precisam ser anexadas pela equipe.

## Dados fictícios seguros

Use apenas o banco local `ConSangue`, nunca produção. A preparação exige `CONSANGUE_DEMO_LOCAL=SIM` e recusa host que não seja loopback. As três contas usam CPFs matematicamente inválidos (o endpoint de login aceita 11 dígitos), telefones fictícios e e-mails no domínio reservado `.invalid`; não há dados pessoais reais. A senha local de todas é `DemoConSangue2026!`.

| Perfil | CPF de demonstração |
| --- | --- |
| Instituição | `12345678900` |
| Candidata A, administradora do grupo | `12345678901` |
| Candidato B, membro | `12345678902` |

Com o banco local inicializado por `Database/ConSangue.sql`, execute no PowerShell, a partir de `API`:

```powershell
$env:CONSANGUE_DEMO_LOCAL = 'SIM'
node scripts/prepare_demo.mjs
```

O script aplica `Database/dados_demonstracao.sql` de forma repetível e cria o perfil do hemocentro fictício. Não cria campanha, grupo ou participação: esses passos ficam para a demonstração ao vivo. O SQL deve ser executado somente em `ConSangue` local.

## Preparação do ambiente

1. Confirme que `API/.env` aponta para MySQL local, `DB_NAME=ConSangue` e a API usa a porta 3001. Não copie credenciais para o roteiro nem para capturas de tela.
2. Inicie a API (`cd API; npm start`) e o React (`cd React; npm start`). Faça a preparação dos dados acima antes de abrir o navegador.
3. Aplique as migrações de convite do grupo se quiser demonstrar entrada por código. Sem essa migração, a entrada pelo grupo continua possível pelo identificador exibido na lista.

## Roteiro ponta a ponta (5–7 minutos)

1. **Instituição:** entre com `12345678900`; abra Perfil e crie uma campanha ativa com data futura, horário e descrição. Diga que a instituição publica a oportunidade que será mobilizada.
2. **Candidata A:** entre com `12345678901`; abra Grupos e crie “Rede de Doadores ConSangue”, explicando a meta e o convite.
3. **Candidato B:** entre com `12345678902`; localize o grupo e entre por código de convite ou identificador. Confirme que os dois perfis aparecem como membros.
4. **Mobilização:** volte à conta da candidata A; no grupo, vincule a campanha criada pela instituição e informe uma meta pequena, por exemplo 2 participações.
5. **Participação:** volte ao candidato B; em Campanhas, abra a campanha e escolha “Participar com meu grupo”. Confirme o vínculo e mostre a participação no histórico/perfil.
6. **Retorno institucional:** volte à instituição e confira o indicador de interessados e grupos vinculados da campanha. Explique que interesse/comparecimento informado não é confirmação clínica de doação.

A cada troca de perfil, encerre a sessão e entre com a outra conta para evitar confusão entre tokens. Registre o resultado esperado em cada passo: campanha aparece na busca; grupo tem duas pessoas; participação guarda o vínculo coletivo; painel institucional mostra adesão agregada.

## Verificação automatizada reproduzível

Com a API local e as contas fictícias preparadas, execute em `API`:

```powershell
$env:CONSANGUE_E2E_LOCAL = 'SIM'
node scripts/demo-e2e.mjs
```

O teste HTTP cria campanha, grupo, entrada de membro, vínculo e participação; confere histórico, grupo e indicador institucional; depois remove os registros temporários. Ele não usa internet nem toca em API fora de `localhost`.

## Plano sem internet

Depois de instalar dependências e preparar o MySQL local, a demonstração roda inteiramente em `localhost`; internet externa não é necessária. Faça o teste de inicialização antes da apresentação e mantenha API, React e MySQL no mesmo computador. Se o computador não tiver os serviços locais disponíveis, use este roteiro impresso como narrativa e mostre as telas/capturas da execução previamente validada; não tente apontar para produção como contingência.

## Evidência e revisão

Os resultados técnicos desta execução estão em [EVIDENCIA_DEMONSTRACAO.md](EVIDENCIA_DEMONSTRACAO.md).

Anexe ao cartão T01 o hash do commit/PR, a saída `E2E aprovado...` e capturas sem credenciais das telas de campanha, grupo, participação e indicador institucional. Outra pessoa da equipe deve repetir o roteiro e registrar nome, data, resultado e observações antes de mover o cartão para “Concluídos”. Até essa revisão, manter em “Revisão e testes”.