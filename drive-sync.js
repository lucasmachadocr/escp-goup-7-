// The repository contains no private Drive IDs, OAuth credentials, or group data.
// Each browser stores its own connection settings. The Drive file is the shared source.
window.Group7Drive = (() => {
  const KEY = 'grupo7-drive-settings-v1';
  const SCOPE = 'https://www.googleapis.com/auth/drive';
  let settings = null, token = '', version = '', connected = false;
  let onLoad = () => {}, onNotice = () => {}, pending = Promise.resolve();
  const button = () => document.querySelector('#drive-connect');
  const status = () => document.querySelector('#storage-status');

  function setStatus(message) {
    status().textContent = message;
    button().textContent = connected ? 'Drive conectado' : 'Conectar Drive';
  }
  function idFromUrl(value, kind) {
    const v = (value || '').trim();
    const pattern = kind === 'folder' ? /drive\.google\.com\/drive\/folders\/([\w-]+)/ : /drive\.google\.com\/file\/d\/([\w-]+)/;
    return pattern.exec(v)?.[1] || (kind === 'file' && /^[\w-]{20,}$/.test(v) ? v : '');
  }
  function configure() {
    const clientId = prompt('Cole o OAuth Client ID do Google Cloud para este site (não é um segredo):', settings?.clientId || '');
    if (clientId === null) return false;
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId.trim())) throw Error('OAuth Client ID inválido.');
    const folderUrl = prompt('Cole o link da pasta “Grupo 7” no Drive:', settings?.folderUrl || '');
    if (folderUrl === null) return false;
    if (!idFromUrl(folderUrl, 'folder')) throw Error('Link da pasta inválido.');
    const fileUrl = prompt('Cole o link do arquivo dashboard.json em “Dados do painel”:', settings?.fileUrl || '');
    if (fileUrl === null) return false;
    if (!idFromUrl(fileUrl, 'file')) throw Error('Link do arquivo inválido.');
    settings = {clientId: clientId.trim(), folderUrl: folderUrl.trim(), fileUrl: fileUrl.trim()};
    localStorage.setItem(KEY, JSON.stringify(settings));
    return true;
  }
  function loadGoogleIdentity() {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = () => reject(Error('Não foi possível carregar a autorização do Google.'));
      document.head.appendChild(script);
    });
  }
  async function authorize() {
    await loadGoogleIdentity();
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: settings.clientId,
        scope: SCOPE,
        callback: response => response.error ? reject(Error(response.error)) : resolve(response.access_token),
        error_callback: error => reject(Error(error.message || error.type || 'Autorização cancelada.'))
      });
      client.requestAccessToken({prompt: ''});
    });
  }
  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {'Authorization': 'Bearer ' + token, ...(options.headers || {})}
    });
    if (!response.ok) {
      const details = await response.text();
      throw Error('Google Drive ' + response.status + ': ' + details.slice(0, 180));
    }
    return response;
  }
  const fileId = () => idFromUrl(settings.fileUrl, 'file');
  const metadataUrl = () => 'https://www.googleapis.com/drive/v3/files/' + fileId() + '?fields=id,name,version,parents';
  async function metadata() { return (await api(metadataUrl())).json(); }
  async function connect() {
    try {
      if (!settings && !configure()) return;
      setStatus('Autorizando acesso ao Drive…');
      token = await authorize();
      const meta = await metadata();
      if (meta.name !== 'dashboard.json') throw Error('O arquivo selecionado não é dashboard.json.');
      const data = await (await api('https://www.googleapis.com/drive/v3/files/' + fileId() + '?alt=media')).json();
      if (!['projects', 'members', 'tasks', 'events', 'documents'].every(k => Array.isArray(data[k]))) throw Error('Estrutura do dashboard.json inválida.');
      if (localStorage.getItem('grupo7-dashboard-v2') && !confirm('Carregar o arquivo compartilhado do Drive? Alterações locais ainda não enviadas serão substituídas neste navegador.')) {
        token = '';
        setStatus('Modo local · conexão cancelada');
        return;
      }
      version = meta.version;
      connected = true;
      onLoad(data);
      setStatus('Google Drive conectado · dados compartilhados');
      onNotice('Dados carregados da pasta Grupo 7.');
    } catch (error) {
      connected = false;
      token = '';
      setStatus('Modo local · conecte o Google Drive');
      onNotice(error.message);
    }
  }
  async function write(data) {
    if (!connected) return;
    try {
      const latest = await metadata();
      if (latest.version !== version) throw Error('O arquivo mudou no Drive. Exporte suas alterações locais e reconecte para evitar sobrescrever o trabalho de outro integrante.');
      await api('https://www.googleapis.com/upload/drive/v3/files/' + fileId() + '?uploadType=media', {
        method: 'PATCH', headers: {'Content-Type': 'application/json; charset=UTF-8'}, body: JSON.stringify(data)
      });
      version = (await metadata()).version;
      setStatus('Google Drive conectado · dados salvos');
    } catch (error) {
      connected = false;
      setStatus('Modo local · sincronização interrompida');
      onNotice(error.message);
    }
  }
  return {
    init(handlers) {
      onLoad = handlers.onLoad;
      onNotice = handlers.onNotice;
      try { settings = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { settings = null; }
      button().addEventListener('click', () => {
        if (connected) { onNotice('Os dados são salvos na pasta Grupo 7.'); return; }
        if (!settings) { try { if (!configure()) return; } catch (error) { onNotice(error.message); return; } }
        connect();
      });
      loadGoogleIdentity().catch(() => {});
      setStatus(settings ? 'Modo local · clique para conectar ao Drive' : 'Modo local · configurar Google Drive');
    },
    persist(data) {
      if (!connected) return;
      const snapshot = structuredClone(data);
      pending = pending.then(() => write(snapshot));
    },
    isConnected: () => connected,
    folderUrl: () => settings?.folderUrl || ''
  };
})();
