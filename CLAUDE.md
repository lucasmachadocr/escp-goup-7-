# Plataforma Grupo 7 — instruções para agentes (Claude, GPT ou pessoas)

Painel do Grupo 7 (MSc Real Estate, ESCP) para acompanhar matérias, tarefas, responsáveis,
prazos, agenda e links de documentos. Os documentos continuam sendo produzidos no Google Drive.

Leia antes de mudar qualquer coisa: `docs/HANDOFF.md` (estado real e limitações) e
`docs/ROADMAP.md` (arquitetura decidida/proposta e próximas entregas).

## Regras
- **Simplicidade e baixa manutenção.** HTML, CSS e JavaScript sem build. Não adicionar framework,
  bundler ou backend pago sem decisão registrada em `docs/ROADMAP.md`.
- **Repositório público.** Nunca versionar: e-mails, nomes completos de integrantes, IDs/links de
  pastas e arquivos privados do Drive, tokens, Client Secrets, exportações de dados
  (`grupo7-dados-*.json`), `dashboard.json`. O mapa de fontes privadas fica fora do Git
  (pasta `private/`, ignorada, ou na pasta Grupo 7 do Drive ESCP).
- **Fonte oficial = Drive da conta ESCP.** Nunca usar a conta Google pessoal nem misturar arquivos.
  Confirmar a identidade da conta antes de qualquer integração.
- **localStorage não é armazenamento compartilhado.** Só serve como cache/rascunho local e deve
  ser rotulado assim na interface.
- **Não inventar datas.** Toda data entra com fonte; sem fonte oficial fica "A confirmar".
- **Integrante AI** hoje só gera um briefing de texto para copiar. Não há modelo conectado.

## Executar
```
python3 -m http.server 8000      # na raiz; abrir http://localhost:8000
BASE_URL=http://localhost:8000/ node tests/smoke.mjs   # menu desktop/celular (precisa de playwright)
```
Ao mudar `app.js`/`drive-sync.js`, atualize o `?v=` em `index.html` (cache do GitHub Pages).

## Publicação
`.github/workflows/pages.yml` publica `main` no GitHub Pages:
https://lucasmachadocr.github.io/escp-goup-7-/ . Deploy concluído não significa funcionamento:
validar os critérios de aceite de `docs/ROADMAP.md`.

## Estrutura
- `index.html` estrutura e menu · `app.js` estado, telas e formulários · `drive-sync.js` conexão
  OAuth atual com `dashboard.json` (não validada) · `styles.css` base antiga (tema escuro) ·
  `theme.css` tema ESCP que sobrescreve a base · `data/seed.json` estrutura sem dados privados.
- Cor ESCP: `#240085`. Sem logotipo oficial, só referência textual.

## Git
Commits pequenos e descritivos. Trabalho de agentes em branch própria; `main` publica o site.
