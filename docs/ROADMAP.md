# Roadmap e arquitetura

Status: **proposta, aguardando aprovação** (21 out 2026). Nada da arquitetura foi migrado ainda.

## Problema a resolver
Hoje cada navegador guarda sua própria cópia dos dados (`localStorage`). O grupo precisa de:
edição dentro do site, dados compartilhados entre integrantes, armazenamento na conta ESCP
(pasta Grupo 7), conflitos e falhas visíveis, custo zero e pouca manutenção.

## Opção A (recomendada): site estático + Apps Script da conta ESCP + Planilha privada
```
Navegador (GitHub Pages)  --ID token Google-->  Apps Script Web App  -->  Planilha "Grupo 7 · Dados"
   Sign in with Google                          (dono: conta ESCP,        (pasta Grupo 7, Drive ESCP;
   (escopos openid/email)                        executa como dono)         só o dono tem acesso)
```
- **Autenticação:** botão “Entrar com Google” (Google Identity Services) gera um ID token. O Apps
  Script valida o token (assinatura, `aud`, expiração, e-mail verificado) e confere o e-mail numa
  lista de integrantes autorizados, guardada na própria planilha e fora do Git. Só são usados os
  escopos básicos (`openid email`), sem acesso ao Drive de quem entra, então não há tela de app
  não verificado.
- **Armazenamento:** uma Planilha Google na pasta Grupo 7 do Drive ESCP, com uma aba por tipo
  (Tarefas, Eventos, Documentos, Integrantes, Matérias, Histórico). Os integrantes não precisam de
  acesso direto à planilha: o script executa como dono. A planilha também serve de backup legível.
- **Concorrência:** `LockService` serializa as gravações no servidor. Cada registro tem `rev`, e a
  edição só grava se `rev` não mudou desde a leitura. Se mudou, o site mostra as duas versões e a
  pessoa escolhe. A gravação é por registro, não o arquivo inteiro. Exclusão é lógica e toda
  alteração vai para a aba Histórico (quem, quando, antes/depois).
- **Atualização:** o painel recarrega os dados ao abrir, ao voltar para a aba e a cada 60 s.
- **Falhas:** cada gravação mostra “salvando / salvo / falhou — tentar de novo”. Nunca cai em
  silêncio para o modo local.
- **Manutenção:** o código do Apps Script fica no Git (`apps-script/`) e é publicado com `clasp`
  ou colado no editor. Não há servidor, banco nem chave secreta no front-end; o Client ID é
  público por natureza.
- **Custo:** €0, dentro das cotas gratuitas do Apps Script, mais que suficientes para um grupo.
- **Riscos a verificar:**
  1. O Workspace da ESCP pode impedir que um Web App seja acessível a “qualquer pessoa”. Plano B:
     servir a interface pelo próprio Apps Script (HtmlService), restrita ao domínio. Nesse caso
     há um problema conhecido quando o navegador tem várias contas Google logadas, e a
     recomendação passa a ser usar um perfil do navegador só com a conta ESCP.
  2. É preciso um OAuth Client ID (tipo Web) num projeto do Google Cloud. O ideal é criá-lo com a
     conta ESCP. Se a ESCP bloquear a criação de projetos, é preciso decidir onde criá-lo: ele só
     identifica o app e não armazena dados.
  3. Continuidade: se a conta dona perder acesso (fim do curso), é preciso transferir a planilha e
     o script para outro integrante.

## Opção B: site estático + OAuth de cada integrante + API do Sheets/Drive direto
Evolução do `drive-sync.js` atual: cada integrante autoriza o site a editar a planilha ou o JSON
com a própria conta.
- **Autenticação:** token OAuth de cada pessoa, com escopo `spreadsheets` ou `drive` (sensível).
  Aparece a tela de app não verificado, o app fica em modo de teste com usuários cadastrados, e o
  Workspace da ESCP pode bloquear o acesso.
- **Armazenamento:** o mesmo Drive ESCP, mas todo integrante precisa de permissão de edição no
  arquivo de dados, e pode editá-lo à mão por fora da validação do site.
- **Concorrência:** não há trava no servidor. Dá para reduzir o risco gravando por linha e
  comparando revisão, mas a janela entre ler e gravar continua existindo.
- **Manutenção:** menos peças, porque não há script. Em troca, o token expira em cerca de 1 h,
  exige reautorização, e cada pessoa configura o acesso.
- **Custo:** €0.

## Comparação
| | A · Apps Script + Planilha | B · OAuth direto |
|---|---|---|
| Login do integrante | Google, escopos básicos | Google, escopo sensível do Drive/Sheets |
| Quem acessa o arquivo de dados | só a conta dona (ESCP) | todos, com edição |
| Concorrência | trava no servidor + `rev` por registro | só checagem no cliente |
| Bloqueio pela ESCP | possível (há plano B) | mais provável (escopo sensível) |
| Peças a manter | site + 1 script | site |
| Custo | €0 | €0 |

**Recomendação: Opção A.** Ela resolve concorrência e permissões de forma confiável sem adicionar
servidor pago, e os dados ficam na conta ESCP. As opções Firebase/Supabase foram descartadas
porque os dados sairiam do Drive ESCP.

## Entregas pequenas (cada uma validável sozinha)
0. **Feito (21 out):** diagnóstico, correção do menu no celular, `tests/smoke.mjs`, documentação.
1. **Edição completa, ainda local e rotulada assim:** editar e excluir tarefas, eventos e
   documentos; estados A fazer / Em andamento / Concluída; vários responsáveis; marcar evento
   como confirmado com fonte; documento ligado a integrante e filtro por integrante. O acesso a
   dados passa por uma camada única (`store`) para a troca de armazenamento ser localizada.
2. **Backend (com a conta ESCP):** planilha na pasta Grupo 7, Apps Script em `apps-script/` com
   `list`, `create`, `update` (com `rev`), `delete` e histórico, validação de ID token e lista de
   autorizados. Teste com duas contas antes de ligar ao site.
3. **Site usando o backend:** login Google, carga e atualização periódica, estados de gravação,
   tela de conflito, remoção do `drive-sync.js` e do caminho `dashboard.json`. O `localStorage`
   passa a ser apenas cache de leitura, rotulado como tal.
4. **Conteúdo:** matérias 3 e 4, integrantes, entregas e prazos lidos do Drive ESCP, cada data com
   fonte. O mapa de fontes fica fora do Git.
5. **Aceite em produção** (ver abaixo) e atualização deste documento.
6. *(Opcional, depois)* lembretes por e-mail via gatilho diário do Apps Script.

## Critérios de aceite (o deploy sozinho não conta)
- [ ] Duas contas autorizadas entram e veem o mesmo grupo; uma conta não autorizada é recusada.
- [ ] Uma tarefa criada pela conta 1 aparece para a conta 2 após atualizar o painel.
- [ ] Alterações persistem depois de fechar o navegador e abrir em outro dispositivo.
- [ ] Uma edição simultânea do mesmo registro gera aviso de conflito, sem perda silenciosa.
- [ ] Uma falha de rede ou de autorização mostra erro persistente com “tentar de novo”.
- [ ] Os dados estão na planilha da pasta Grupo 7 do Drive ESCP (conferido no Drive).
- [x] O menu funciona em desktop e celular (`tests/smoke.mjs`, 320–1280 px).
