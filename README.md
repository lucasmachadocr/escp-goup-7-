# Grupo 7 — painel ESCP

Painel minimalista para quatro frentes de trabalho, agenda, equipe, documentos e briefing do integrante AI.

## Dados compartilhados no Google Drive

O repositório público contém apenas código e dados de demonstração. Os documentos originais pertencem à pasta **Grupo 7** no Google Drive. O arquivo privado **Dados do painel/dashboard.json** é a fonte compartilhada para projetos, equipe, tarefas, agenda e links de documentos. Não envie esse arquivo, links privados ou e-mails institucionais ao GitHub.

O botão **Conectar Drive** usa a autorização da conta Google de cada integrante. Depois da conexão, o painel carrega o JSON privado e salva cada alteração nele. Enquanto aparecer **Modo local**, as alterações estão somente neste navegador. O painel detecta uma versão remota mais recente e interrompe a gravação para impedir sobrescritas silenciosas; nesse caso exporte o trabalho local antes de reconectar.

Para ativar a conexão, crie um **OAuth Client ID do tipo Web application** no Google Cloud, habilite a **Google Drive API** e cadastre a origem JavaScript autorizada `https://lucasmachadocr.github.io` (para testes locais, inclua `http://localhost:8000`). Configure a tela de consentimento e os integrantes como usuários de teste, se o aplicativo estiver em modo de teste. Cada integrante precisa de acesso à pasta e ao arquivo no Drive. No site, clique em **Conectar Drive** e informe o Client ID, o link da pasta Grupo 7 e o link de **dashboard.json**. Essas configurações ficam no navegador de cada integrante; o Client ID não é uma senha.

A autorização solicitada é a permissão `drive`, pois o arquivo já existe e não foi criado pelo aplicativo. O Google exibirá o alcance dessa permissão antes do consentimento. O site faz chamadas diretas à API do Google Drive; não há servidor intermediário.

Os avisos por e-mail ainda abrem o aplicativo de e-mail para revisão e envio. O integrante AI prepara um briefing para copiar; não está conectado a um modelo.

## Desenvolvimento

Execute `python3 -m http.server 8000` na raiz e abra http://localhost:8000. Código em HTML, CSS e JavaScript, sem etapa de build. `data/seed.json` guarda somente dados não sensíveis.

## Publicação

O workflow `.github/workflows/pages.yml` publica o site pelo GitHub Pages. URL: https://lucasmachadocr.github.io/escp-goup-7-/ .

## Identidade

Azul corporativo ESCP `#240085` conforme o guia oficial: https://escp.eu/sites/default/files/logo/Usage-ESCP-Logo-Oct-2019.pdf . O site usa apenas referência textual à escola, sem reproduzir o logotipo.
