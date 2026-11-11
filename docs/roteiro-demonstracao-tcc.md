# G02 — Roteiro de demonstração do TCC ConSangue

**Preparação:** 11/11/2026 · **Entrega:** 13/11/2026 · **Apresentação:** 17/11/2026  
**Responsabilidade de execução e conferência:** Pedro Cardoso, com Paulo Spínola e Miguel Costa na demonstração e nos slides.  
**Status deste documento:** roteiro preparado para ensaio; **ainda não é evidência de teste ponta a ponta aprovado**.

## 1. Preparação segura (antes do ensaio)

- Abrir a versão publicada em https://tcc-consangue1.vercel.app e verificar o status de https://tccconsangue-production.up.railway.app/api/status. A resposta de status não confirma acesso ao banco.
- Confirmar que a Vercel e a API Railway correspondem ao commit escolhido para apresentar. Abrir cada rota após recarregar a página.
- Separar **duas contas de candidato** e **uma conta de instituição**, criadas com **dados inteiramente fictícios** em um ambiente autorizado; não publicar CPFs, telefones, senhas ou tokens no Trello, README, slides ou gravações.
- Só criar registros na base de produção depois de conferir que é um banco destinado a demonstração e que a equipe autoriza dados de teste. Caso contrário, usar uma base de teste isolada, sem alterar dados reais.
- Usar identificações claramente fictícias: instituição “Instituição Demonstração ConSangue”; campanha “Campanha Demonstração ConSangue”; grupo “Equipe Demonstração ConSangue”; datas futuras em relação ao ensaio. **Não apresentar a campanha fictícia como evento real.**
- Ter navegador anônimo ou sessão separada para alternar candidato/instituição; evitar mostrar tokens, console com dados privados e senhas no projetor.

## 2. Sequência sugerida (3 a 4 minutos)

| Tempo aproximado | Perfil/tela | Demonstração e resultado que deve ser observado |
| --- | --- | --- |
| 0:00–0:25 | Abertura | Explicar o problema: dificuldade em mobilizar pessoas para campanhas. Mostrar a Home e o diferencial: grupos e campanhas. |
| 0:25–1:10 | Instituição / painel | Fazer login institucional, abrir o painel, apresentar campanhas vinculadas e indicadores de mobilização. Conferir que dados exibidos são daquela instituição. |
| 1:10–1:40 | Instituição / criar campanha | Abrir o formulário, criar **campanha fictícia** válida, confirmar mensagem de sucesso; recarregar e verificar se continua listada. Se o formulário estiver indisponível no deploy, declarar a limitação sem improvisar alteração no banco. |
| 1:40–2:15 | Candidato / campanhas | Entrar com conta de candidato, localizar a campanha, abrir detalhes e registrar **interesse ou intenção**, de acordo com a UI e as regras da API. |
| 2:15–2:50 | Candidato / grupos | Mostrar um grupo de demonstração, código de convite **somente para membros**, convite alfanumérico (não ID numérico) e eventual associação a campanha, sem expor códigos reais fora do grupo. |
| 2:50–3:20 | Candidato / perfil e histórico | Conferir o registro no histórico, o perfil e a persistência após atualizar a página. Se possível, demonstrar cancelamento e atualização do histórico em conta de teste. |
| 3:20–3:45 | Fechamento | Reforçar mobilização coletiva; explicar que “comparecimento informado” é **autodeclaração**, não comprovação clínica de doação. |

Caso o tempo disponível seja menor, priorizar **painel institucional → campanha → candidato → interesse → histórico**. Só incluir uma operação quando ela tiver sido testada previamente.

## 3. Checklist de ensaio e evidência

- [ ] Login do candidato e da instituição funciona na versão publicada.
- [ ] Usuário anônimo não acessa páginas privadas; API rejeita token inválido e conta sem permissão.
- [ ] Instituição vê apenas sua área e consegue cadastrar uma campanha fictícia.
- [ ] A nova campanha aparece na listagem e permanece após F5.
- [ ] Candidato consegue localizar a campanha e registrar interesse/intenção.
- [ ] Histórico e perfil mostram os dados corretos após recarga.
- [ ] Grupos: convite com código alfanumérico e consulta de membros restrita a integrantes.
- [ ] Não ocorre vazamento de CPF, hash de senha, token ou convite em listagens públicas.
- [ ] Responsáveis documentam pass/fail, ambiente, commit e capturas SEM dados privados.
- [ ] Fluxo completo repetido e revisado por outro integrante antes de marcar como concluído.

**Observação:** não há registro neste documento de que os cenários tenham passado. Marcar as caixas apenas após executar e conferir.

## 4. Plano B para falha de internet ou servidor

1. Salvar uma versão exportada dos slides em PDF e manter uma cópia offline.
2. Com dados inteiramente fictícios e depois de confirmar que o fluxo realmente funciona, gravar vídeo curto de tela (G03), com login, campanha, interesse, grupo e histórico; ocultar credenciais e dados pessoais.
3. Manter capturas de tela do painel institucional, campanhas, grupos e histórico, com identificações de teste.
4. Se o site falhar, avisar à banca que a demonstração ao vivo está indisponível e usar o vídeo ou os prints. **Não afirmar que um recurso foi testado ou funcionou quando não foi.**

## 5. Perguntas prováveis da banca

**Como uma instituição é reconhecida como legítima?**  
Nesta versão acadêmica, o cadastro público permite selecionar o perfil institucional; isso **não é credenciamento oficial**. Um produto real exigiria validação e aprovação da instituição antes de habilitar campanhas públicas.

**Qualquer pessoa pode ver o convite e os membros de um grupo?**  
A versão atual protege a relação de integrantes e não fornece código de convite nas listagens públicas. Convites de grupos são alfanuméricos; a entrada por ID numérico foi removida. Isso ainda precisa ser testado em produção entre contas diferentes.

**O sistema comprova que alguém doou sangue?**  
Não. Ele registra interesse, intenção ou comparecimento **informado pelo próprio usuário**, para apoiar a mobilização coletiva. Comprovação clínica seria feita pelo hemocentro.

**E se a internet cair durante a apresentação?**  
A equipe terá slides exportados, prints e, se a gravação for concluída, um vídeo de reserva, indicando claramente o que foi demonstrado e o que está pendente.

## 6. Materiais vinculados

- [Apresentação no Canva](https://www.canva.com/design/DAHZVBdjUbM/D61dblRGT4FPgOVENItxSw/edit)
- [Trello — roteiro G02](https://trello.com/c/udkxHqyu)
- [Trello — testes T02](https://trello.com/c/3t7wmfmX)
- [Trello — vídeo de reserva G03](https://trello.com/c/Xsj7zdym)
- [README do projeto](../README.md)
