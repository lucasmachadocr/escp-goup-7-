# Handoff — estado real da Plataforma Grupo 7

Última revisão: 21 out 2026 (diagnóstico feito sobre o commit `1e2f2f8`).

## Como o diagnóstico foi feito
- Leitura de todo o código (≈400 linhas) e do histórico Git: 12 commits, todos de 16 out 2026.
- O site rodou localmente (`python3 -m http.server`) e os fluxos foram exercitados com Playwright
  (Chromium) a 1280, 900, 390 e 320 px de largura.
- O site publicado não pôde ser aberto a partir do ambiente de diagnóstico (rede bloqueada), então
  a análise vale para o código da `main`, que é o que o workflow publica.

## O que funciona
- Layout ESCP (`#240085`): box central “Grupo 7”, “Próximas datas” logo abaixo e quatro boxes de
  matérias (PropTech, Consulting/MRE06, “Matéria 3”, “Matéria 4”).
- Navegação em desktop: Início, Agenda, Arquivos, Equipe, Avisos e AI.
- Cadastro de tarefa, evento, documento (só links de drive/docs.google.com) e integrante.
- Marcar tarefa como concluída; editar o e-mail de um integrante.
- Busca de documentos por título, matéria ou tag.
- Exportar e importar JSON.
- Os dados persistem **no mesmo navegador** depois de recarregar a página (localStorage).
- Nenhum erro de JavaScript nos fluxos testados.

## Corrigido nesta revisão
- **O menu sumia em telas com até 900 px (celular e tablet).** `styles.css` (tema antigo de barra
  lateral) esconde `.nav span` abaixo de 900 px, e os botões ficavam com largura zero. O commit
  “Keep Group 7 menu usable when seed data fails” não resolveu isso porque a causa era o CSS, não
  os dados. A correção está em `theme.css` e é coberta por `tests/smoke.mjs`: 18 falhas antes,
  0 depois.

## Incompleto
- Não dá para editar nem excluir tarefas, eventos ou documentos. O estado da tarefa só alterna
  entre “A fazer” e “Concluída”: “Em andamento” existe no modelo, mas não há como escolhê-lo.
- Uma tarefa tem um único responsável no formulário, embora o modelo aceite vários.
- Todo evento entra como “A confirmar” e não há como marcá-lo como confirmado.
- Os documentos não se ligam a um integrante, então não dá para localizá-los por integrante.
- As matérias 3 e 4 continuam como placeholders.
- `data/seed.json` não tem datas, integrantes nem documentos.

## Apenas simulado ou não validado
- **Dados compartilhados:** não existem hoje. Uma tarefa criada num navegador não aparece em outro
  (testado com dois contextos de navegador). Tudo fica em `localStorage`.
- **Conexão com o Drive (`drive-sync.js`):** o código existe, mas nunca foi configurado nem
  validado de ponta a ponta. Problemas encontrados:
  - Cada integrante precisa colar Client ID, link da pasta e link do JSON em três `prompt()`.
  - Não há Client ID publicado. Seria preciso um projeto no Google Cloud com tela de consentimento.
  - O escopo é `drive` completo (sensível): o Google mostra um aviso de app não verificado, e o
    Workspace da ESCP pode bloquear o acesso.
  - O arquivo inteiro é sobrescrito a cada alteração. A checagem de `version` é feita antes do
    PATCH, sem atomicidade (*check-then-write*): duas gravações quase simultâneas ainda perdem
    dados.
  - Em caso de conflito ou erro, o painel volta para “Modo local” e continua salvando só no
    navegador. A mensagem some em 6 s.
  - O token dura cerca de 1 h e não é renovado. Depois disso, o próximo salvamento falha e o painel
    cai para o modo local.
  - Não há atualização periódica: alterações de outra pessoa só aparecem ao reconectar.
  - Todo integrante precisaria de permissão de edição no JSON bruto.
- **Avisos:** só abrem o aplicativo de e-mail (`mailto:`). As notificações do navegador funcionam
  apenas com a aba aberta.
- **Integrante AI:** um template de texto montado com os dados locais. Não há modelo conectado.
- **E-mails de integrantes:** ficam apenas no navegador (`localStorage`), sem sincronização.

## Acesso às fontes (diagnóstico de 21 out 2026)
- O conector Google Drive disponível ao agente está autenticado na **conta pessoal**, não na
  conta ESCP. As duas pastas indicadas (central e PropTech) retornam “não encontrado” nessa conta.
- Pela regra do projeto, nenhum conteúdo da conta pessoal foi lido ou usado.
- Para ler os documentos, é preciso conectar a conta ESCP ao agente e abrir uma sessão nova. A
  conta conectada deve ser confirmada por e-mail ou domínio antes de qualquer leitura.

## Duas camadas de acesso (não confundir)
1. **Acesso do agente aos documentos:** leitura, para entender o projeto (matérias, prazos,
   integrantes). Feito pelo conector de Drive da sessão de trabalho, sempre com a conta ESCP.
2. **Autenticação e armazenamento do site:** como cada integrante entra no painel e onde os dados
   compartilhados ficam. Ver `docs/ROADMAP.md`.

## Mapa de matérias (só o que tem fonte verificável)
| Matéria | Código | Fonte | Situação |
|---|---|---|---|
| PropTech | não informado | instrução do grupo; commit `9b18138` | confirmada pelo grupo |
| Consulting | MRE06 | `data/seed.json` (16 out 2026) | código a conferir no syllabus |
| Matéria 3 | — | — | a confirmar no Drive ESCP |
| Matéria 4 | — | — | a confirmar no Drive ESCP |

Integrantes, entregas e prazos ainda não têm fonte acessível. Nenhuma data foi cadastrada.
O mapa completo de fontes (com links privados) deve ficar fora do Git: em `private/`
(ignorada) ou num documento dentro da pasta Grupo 7 do Drive ESCP.
