# Grupo 7 — painel ESCP

Painel minimalista para quatro frentes de trabalho, agenda, equipe, documentos e briefing do integrante AI.

## Estado atual

Esta é uma prévia estática. Alterações são guardadas somente no navegador de quem as fez. A pasta do Google Drive abre com as permissões originais. Não há login, sincronização entre membros, envio automático de e-mails ou agente AI conectado. Não use esta versão como fonte oficial de prazos.

Os e-mails institucionais não estão no código público. Na aba Equipe, cada pessoa pode cadastrar o contato localmente. Não envie exportações JSON contendo contatos ao repositório público.

## Desenvolvimento

Execute `python3 -m http.server 8000` na raiz e abra http://localhost:8000. Código em HTML, CSS e JavaScript, sem etapa de build. `data/seed.json` guarda somente dados não sensíveis.

## Publicação

O workflow `.github/workflows/pages.yml` publica o site pelo GitHub Pages assim que a opção Pages → Source → GitHub Actions estiver habilitada nas configurações do repositório. URL esperada após deployment bem-sucedido: https://lucasmachadocr.github.io/escp-goup-7-/ . Confira o deployment antes de divulgar.

## Identidade

Azul corporativo ESCP `#240085` conforme o guia oficial: https://escp.eu/sites/default/files/logo/Usage-ESCP-Logo-Oct-2019.pdf . O site usa apenas referência textual à escola, sem reproduzir o logotipo.
