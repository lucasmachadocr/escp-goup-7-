const KEY = 'grupo7-dashboard-v2';
const TZ = 'Europe/Madrid';
let db, view = 'inicio', filter = '', selectedProject = '';
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = u => /^https:\/\/(drive|docs)\.google\.com\//.test(u || '') ? u : '';
const project = id => db.projects.find(p => p.id === id);
const fmt = date => date ? new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',timeZone:TZ}).format(new Date(date+'T12:00:00+02:00')) : 'Sem data';
const todayISO = () => new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:TZ}).format(new Date());
const sortEvents = () => [...db.events].sort((a,b) => (a.date||'9999').localeCompare(b.date||'9999'));
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function notice(message){const el=$('#notice');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),6000)}
function badge(status){return status==='confirmed'?'<span class="pill">Confirmado</span>':'<span class="pill warn">A confirmar</span>'}
function statusText(s){return ({todo:'A fazer',doing:'Em andamento',done:'Concluída'})[s]||s}
function taskItem(t){
  const p=project(t.projectId);
  return `<div class="item"><div><strong><input class="check" type="checkbox" data-task="${esc(t.id)}" ${t.status==='done'?'checked':''} aria-label="Concluir tarefa"> ${esc(t.title)}</strong><small>${esc(p?.title||'Projeto')} · ${t.dueDate?fmt(t.dueDate):'Sem prazo'} · ${esc(t.ownerIds?.map(id=>db.members.find(m=>m.id===id)?.name).filter(Boolean).join(', ')||'Sem responsável')}</small></div><span class="pill dim">${esc(statusText(t.status))}</span></div>`
}
function eventItem(e){return `<div class="item"><div><strong>${esc(e.title)}</strong><small>${fmt(e.date)} · ${esc(e.type)} · ${esc(project(e.projectId)?.title||'Geral')}</small></div>${badge(e.status)}</div>`}
function overview(){
  const upcoming=sortEvents().filter(e=>e.date>=todayISO()).slice(0,3);
  const slots=['proptech','consulting','subject-3','subject-4'].map(id=>project(id)).filter(Boolean);
  return `<div class="landing"><div class="landing-intro">ESPAÇO DE TRABALHO · MSC REAL ESTATE</div>
    <div class="group-card"><div class="group-monogram">G7</div><h2>Grupo 7</h2><p>Trabalhos, equipe e próximos passos em um só lugar.</p></div>
    <div class="date-area"><div class="date-heading"><h3>Próximas datas</h3><button class="text-button" data-view="agenda">Ver agenda completa →</button></div>
    ${upcoming.length?upcoming.map(e=>`<div class="date-line"><div class="date-number">${esc(e.date.slice(8,10))} <small style="font-size:10px">${esc(new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:TZ}).format(new Date(e.date+'T12:00:00Z')))}</small></div><div class="date-info"><strong>${esc(e.title)}</strong><small>${esc(project(e.projectId)?.title||'Grupo 7')} · ${esc(e.type)}</small></div>${badge(e.status)}</div>`).join(''):'<div class="empty">Ainda não há datas cadastradas. <button class="text-button" data-action="event">Adicionar data</button></div>'}</div>
    <div class="subject-area"><div class="subject-heading"><h3>Matérias do grupo</h3></div><div class="subject-grid">${slots.map((p,i)=>`<button class="subject-card ${p.status==='needs-verification'?'pending':''}" data-project="${esc(p.id)}"><span class="num">0${i+1} / MATÉRIA</span><strong>${esc(p.title)}</strong><small>${p.status==='needs-verification'?'Nome ou conteúdo a confirmar':esc(p.courseCode||'Abrir projeto')}</small><span class="arrow">↗</span></button>`).join('')}</div>
    <p class="landing-note">Prazos marcados “a confirmar” precisam ser conferidos com a fonte oficial.</p></div></div>`
}
function projects(){
 const p=project(selectedProject)||db.projects[0],tasks=db.tasks.filter(t=>t.projectId===p.id),docs=db.documents.filter(d=>d.projectId===p.id),events=sortEvents().filter(e=>e.projectId===p.id);
 return `<div style="padding-top:38px"><button class="text-button" data-view="inicio">← Voltar ao Grupo 7</button><div class="section-head" style="margin-top:25px"><div><span class="eyebrow">MATÉRIA · ${esc(p.courseCode||'A DEFINIR')}</span><h2 style="margin-top:8px;font-size:30px">${esc(p.title)}</h2><p class="muted">${esc(p.description||'Detalhes do trabalho a definir.')}</p></div>${link(p.sourceUrl)?`<a class="button subtle" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Pasta no Drive ↗</a>`:''}</div>
 <div class="grid"><div class="card"><div class="section-head"><h3>Tarefas</h3><button class="text-button" data-action="task">+ Nova tarefa</button></div><div class="stack">${tasks.length?tasks.map(taskItem).join(''):'<div class="empty">Ainda não há tarefas para esta matéria.</div>'}</div></div>
 <div class="card"><div class="section-head"><h3>Datas</h3><button class="text-button" data-action="event">+ Nova data</button></div><div class="stack">${events.length?events.map(eventItem).join(''):'<div class="empty">Nenhuma data cadastrada.</div>'}</div></div></div>
 <div class="card" style="margin-top:20px"><div class="section-head"><h3>Documentos</h3><button class="text-button" data-action="document">+ Adicionar link</button></div><div class="stack">${docs.length?docs.map(d=>`<div class="item"><strong>${esc(d.title)}</strong><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--mint)">Abrir ↗</a></div>`).join(''):'<div class="empty">Nenhum documento vinculado.</div>'}</div></div></div>`
}
function agenda(){
 return `<div class="section-head"><div><h2>Agenda do grupo</h2><p class="muted">Entregas, provas, apresentações e reuniões. Datas sem fonte definitiva são sinalizadas.</p></div><button class="button primary" data-action="event">+ Evento</button></div><div class="stack">${sortEvents().length?sortEvents().map(e=>`<div class="item"><div><strong>${esc(e.title)}</strong><small>${fmt(e.date)} · ${esc(project(e.projectId)?.title||'Geral')} · ${esc(e.type)}</small><small>${esc(e.sourceLabel||'Fonte não informada')}${link(e.sourceUrl)?` · <a href="${esc(e.sourceUrl)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a>`:''}</small></div>${badge(e.status)}</div>`).join(''):'<div class="empty">Nenhum evento cadastrado.</div>'}</div>`
}
function documents(){
 const q=filter.toLowerCase();
 const docs=db.documents.filter(d=>(d.title+' '+(project(d.projectId)?.title||'')+' '+(d.tags||[]).join(' ')).toLowerCase().includes(q));
 return `<div class="section-head"><div><h2>Biblioteca do grupo</h2><p class="muted">Um índice de links para os originais no Drive.</p></div><button class="button primary" data-action="document">+ Documento</button></div><div class="toolbar"><input id="search" class="field" placeholder="Buscar por nome, curso ou tema" value="${esc(filter)}" aria-label="Buscar documentos"></div><table class="table"><thead><tr><th>Documento</th><th>Projeto</th><th>Tipo</th><th>Link</th></tr></thead><tbody>${docs.map(d=>`<tr><td><strong>${esc(d.title)}</strong><br><span class="muted">${esc((d.tags||[]).join(' · '))}</span></td><td>${esc(project(d.projectId)?.title||'Geral')}</td><td>${esc(d.kind)}</td><td><a href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Abrir ↗</a></td></tr>`).join('')}</tbody></table>${!docs.length?'<div class="empty">Nenhum documento encontrado.</div>':''}`
}
function team(){
 return `<div class="section-head"><div><h2>Equipe · Group 7 Team 2</h2><p class="muted">Contatos cadastrados ficam apenas neste navegador.</p></div><button class="button primary" data-action="member">+ Integrante</button></div><div class="member-grid">${db.members.map(m=>`<div class="card member"><div class="avatar">${esc(m.name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase())}</div><h3>${esc(m.name)}</h3><small>${esc(m.role||'Integrante')}</small><small>${m.email?`<a href="mailto:${encodeURIComponent(m.email)}" style="color:var(--mint);overflow-wrap:anywhere">${esc(m.email)}</a>`:'E-mail ainda não cadastrado'}</small><span class="pill dim">${db.tasks.filter(t=>t.ownerIds?.includes(m.id)&&t.status!=='done').length} tarefas abertas</span><p><button class="text-button" data-contact="${esc(m.id)}">Editar e-mail</button></p>${link(m.folderUrl)?`<p><a href="${esc(m.folderUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--mint);font-size:12px">Abrir pasta no Drive ↗</a></p>`:''}</div>`).join('')}<div class="card member agent-card"><div class="avatar">✦</div><h3>Integrante AI</h3><small>Apoio a pesquisa, revisão e planejamento</small><button class="button subtle" data-view="agente">Abrir assistente →</button></div></div>`
}
function notifications(){
 const recipients=db.members.filter(m=>m.email);
 return `<div class="hero"><div><span class="eyebrow">COORDENAÇÃO DO GRUPO</span><h2>Notificações</h2><p>Prepare lembretes para integrantes e abra a mensagem no seu aplicativo de e-mail.</p></div><div class="orb">✉</div></div>
 <div class="agent-grid"><div class="card"><h2>Enviar lembrete</h2><p class="muted">Selecione os destinatários. O envio exige sua revisão e confirmação no aplicativo de e-mail.</p>
 <div class="stack" style="margin:18px 0">${recipients.map(m=>`<label class="item"><span><input type="checkbox" class="recipient check" value="${esc(m.id)}"> ${esc(m.name)}</span><small>${esc(m.email)}</small></label>`).join('')}</div>
 <label class="form-row">Assunto<input id="mail-subject" class="field" value="Grupo 7 — atualização de trabalho"></label>
 <label class="form-row">Mensagem<textarea id="mail-body" class="field" rows="6" placeholder="Escreva o lembrete, tarefa e prazo confirmado."></textarea></label>
 <button id="prepare-mail" class="button primary" style="margin-top:16px">Abrir e-mail para revisão</button></div>
 <div class="card"><h2>Alertas no navegador</h2><p class="muted">O navegador pode avisar sobre eventos futuros enquanto o painel estiver aberto. O aviso não substitui o calendário oficial.</p>
 <button id="enable-alerts" class="button subtle" style="margin:18px 0">Ativar alertas locais</button>
 <p class="tiny">Para avisos por e-mail enviados automaticamente, o site precisará de autenticação, consentimento dos integrantes e um serviço de envio no servidor. Ainda não há envio automático.</p>
 <h3 style="margin:25px 0 12px">Próximos eventos</h3><div class="stack">${sortEvents().filter(e=>e.date>=todayISO()).slice(0,3).map(eventItem).join('')||'<div class="empty">Nenhum evento futuro.</div>'}</div></div></div>`
}
function agent(){
 return `<div class="hero"><div><span class="eyebrow">MEMBRO DIGITAL DO GRUPO</span><h2>Integrante AI</h2><p>Transforma o estado do painel em um briefing estruturado para trabalhar com GPT ou Claude.</p></div><div class="orb">✦</div></div><div class="agent-grid"><div class="card agent-card"><h2>Preparar uma missão</h2><p>Escolha a frente e diga o que a AI deve fazer. O briefing inclui fatos, lacunas e links que já estão no painel.</p><label class="form-row">Projeto<select id="ai-project" class="field">${db.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('')}</select></label><label class="form-row">Pedido<textarea id="ai-request" class="field" placeholder="Ex.: revise a estrutura do Deliverable 1 e liste perguntas que precisamos responder"></textarea></label><button id="generate-brief" class="button primary" style="margin-top:16px">Gerar briefing</button></div><div class="card agent-card"><h2>Briefing pronto para copiar</h2><p class="tiny">O protótipo não envia dados a um modelo. Revise antes de colar em GPT ou Claude, sobretudo links e documentos privados.</p><div id="ai-output" class="agent-output">Selecione um projeto e descreva a missão.</div><button id="copy-brief" class="button subtle">Copiar briefing</button></div></div>`
}
function render(){
 const titles={inicio:'Visão geral',projetos:'Matéria',agenda:'Agenda',documentos:'Documentos',equipe:'Equipe',notificacoes:'Notificações',agente:'Integrante AI'};
 $('#page-title').textContent=titles[view];
 document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
 $('#content').innerHTML=({inicio:overview,projetos:projects,agenda,documentos,equipe:team,notificacoes:notifications,agente:agent})[view]();
}
const options=()=>db.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
function formRow(name,label,type='text',required=true){return `<label class="form-row">${label}<input class="field" name="${name}" type="${type}" ${required?'required':''}></label>`}
function openForm(type){
 const forms={
  task:formRow('title','Tarefa')+`<label class="form-row">Projeto<select class="field" name="projectId">${options()}</select></label><label class="form-row">Responsável<select class="field" name="ownerId"><option value="">A definir</option>${db.members.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}</select></label>`+formRow('dueDate','Prazo (opcional)','date',false),
  event:formRow('title','Evento')+`<label class="form-row">Tipo<select class="field" name="type"><option>entrega</option><option>prova</option><option>apresentação</option><option>reunião</option></select></label><label class="form-row">Projeto<select class="field" name="projectId">${options()}</select></label>`+formRow('date','Data','date')+formRow('sourceLabel','Fonte da data (opcional)','text',false),
  document:formRow('title','Título')+`<label class="form-row">Projeto<select class="field" name="projectId">${options()}</select></label>`+formRow('url','Link do Google Drive','url')+formRow('kind','Tipo (brief, trabalho, syllabus...)'),
  member:formRow('name','Nome')+formRow('email','E-mail institucional (opcional)','email',false)+formRow('role','Papel (opcional)','text',false),
  project:formRow('title','Nome da frente')+formRow('courseCode','Código do curso (opcional)','text',false)+formRow('description','Descrição (opcional)','text',false)
 };
 $('#dialog-title').textContent={task:'Nova tarefa',event:'Novo evento',document:'Novo documento',member:'Novo integrante',project:'Novo projeto'}[type];
 $('#form-fields').innerHTML=forms[type];$('#entry-form').dataset.type=type;$('#entry-dialog').showModal();
}
function addEntry(type, data){
 const id=(crypto.randomUUID?.()||String(Date.now()));
 if(type==='task') db.tasks.push({id,title:data.title.trim(),projectId:data.projectId,ownerIds:data.ownerId?[data.ownerId]:[],dueDate:data.dueDate,status:'todo'});
 if(type==='event') db.events.push({id,title:data.title.trim(),projectId:data.projectId,type:data.type,date:data.date,timeZone:TZ,status:'needs-verification',sourceLabel:data.sourceLabel||'Cadastro manual · verificar com a fonte oficial',sourceUrl:''});
 if(type==='document'){if(!link(data.url))throw Error('Use um link de drive.google.com ou docs.google.com.');db.documents.push({id,title:data.title.trim(),projectId:data.projectId,kind:data.kind.trim(),url:data.url,tags:[]})}
 if(type==='member') db.members.push({id,name:data.name.trim(),email:data.email.trim(),role:data.role.trim()||'Integrante'});
 if(type==='project') db.projects.push({id,title:data.title.trim(),courseCode:data.courseCode.trim(),description:data.description.trim(),status:'needs-verification',sourceUrl:''});
 save();
}
function brief(){
 const p=project($('#ai-project').value), request=$('#ai-request').value.trim();
 if(!request){notice('Descreva a missão antes de gerar o briefing.');return}
 const tasks=db.tasks.filter(t=>t.projectId===p.id),events=db.events.filter(e=>e.projectId===p.id),docs=db.documents.filter(d=>d.projectId===p.id);
 const out=`Você é o integrante AI de um grupo do MSc Real Estate da ESCP. Trabalhe como analista rigoroso, cite a origem de cada afirmação e separe fatos de hipóteses. Não invente prazos, resultados nem conteúdo de arquivos que não tenha lido.

PROJETO: ${p.title} (${p.courseCode||'código não confirmado'})
CONTEXTO: ${p.description}
PASTA: ${p.sourceUrl||'link ainda não localizado'}

EVENTOS:
${events.length?events.map(e=>'- '+e.title+' — '+e.date+' — '+(e.status==='confirmed'?'confirmado':'A CONFIRMAR')+' — '+(e.sourceLabel||'sem fonte')).join('\n'):'- Nenhum evento cadastrado.'}

TAREFAS:
${tasks.length?tasks.map(t=>'- '+t.title+' — '+statusText(t.status)+' — '+(t.dueDate||'sem prazo')).join('\n'):'- Nenhuma tarefa cadastrada.'}

DOCUMENTOS INDEXADOS (abra e leia o original antes de afirmar seu conteúdo):
${docs.length?docs.map(d=>'- '+d.title+': '+d.url).join('\n'):'- Nenhum documento indexado.'}

MINHA MISSÃO: ${request}

Entregue: (1) resposta ou plano de execução; (2) evidências usadas e links; (3) dúvidas essenciais; (4) próximas ações com responsáveis sugeridos. Sinalize qualquer informação ainda não verificada.`;
 $('#ai-output').textContent=out;
}
async function enableAlerts(){
 if(!('Notification' in window)){notice('Este navegador não oferece notificações locais.');return}
 const permission=await Notification.requestPermission();
 if(permission!=='granted'){notice('Permissão de notificações não concedida.');return}
 localStorage.setItem('grupo7-alerts','yes');
 checkAlerts();
 notice('Alertas locais ativados enquanto o painel estiver aberto.');
}
function checkAlerts(){
 if(localStorage.getItem('grupo7-alerts')!=='yes'||!('Notification' in window)||Notification.permission!=='granted')return;
 const now=todayISO(), tomorrow=new Date(now+'T12:00:00Z');
 tomorrow.setUTCDate(tomorrow.getUTCDate()+1);
 const next=tomorrow.toISOString().slice(0,10);
 for(const e of db.events.filter(x=>x.date===now||x.date===next)){
   const key='grupo7-notified-'+e.id+'-'+now;
   if(localStorage.getItem(key))continue;
   new Notification('Grupo 7 · '+e.title,{body:(e.date===now?'Hoje':'Amanhã')+' · '+(e.status==='confirmed'?'confirmado':'data a confirmar')});
   localStorage.setItem(key,'yes');
 }
}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-view]');if(nav){view=nav.dataset.view;filter='';render();return}
 const course=e.target.closest('[data-project]');if(course){selectedProject=course.dataset.project;view='projetos';render();return}
 const contact=e.target.closest('[data-contact]');if(contact){const m=db.members.find(x=>x.id===contact.dataset.contact);const value=prompt('E-mail institucional de '+m.name,m.email||'');if(value!==null){const email=value.trim();if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notice('E-mail inválido.');return}m.email=email;save()}return}
 const action=e.target.closest('[data-action]');if(action){openForm(action.dataset.action);return}
 if(e.target.id==='generate-brief')brief();
 if(e.target.id==='copy-brief')navigator.clipboard.writeText($('#ai-output').textContent).then(()=>notice('Briefing copiado.'));
 if(e.target.id==='prepare-mail'){
   const ids=[...document.querySelectorAll('.recipient:checked')].map(x=>x.value);
   const addresses=db.members.filter(m=>ids.includes(m.id)).map(m=>m.email).filter(Boolean);
   const subject=$('#mail-subject').value.trim(),body=$('#mail-body').value.trim();
   if(!addresses.length||!subject||!body){notice('Escolha destinatários e preencha assunto e mensagem.');return}
   location.href='mailto:'+addresses.map(encodeURIComponent).join(',')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 }
 if(e.target.id==='enable-alerts')enableAlerts();
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-task]')){const t=db.tasks.find(x=>x.id===e.target.dataset.task);if(t){t.status=e.target.checked?'done':'todo';save()}}
});
document.addEventListener('input',e=>{if(e.target.id==='search'){filter=e.target.value;const pos=e.target.selectionStart;render();$('#search').focus();$('#search').setSelectionRange(pos,pos)}});
$('#entry-form').addEventListener('submit',e=>{e.preventDefault();try{addEntry(e.target.dataset.type,Object.fromEntries(new FormData(e.target)));$('#entry-dialog').close();e.target.reset()}catch(err){notice(err.message)}});
$('#close-dialog').onclick=$('#cancel-dialog').onclick=()=>$('#entry-dialog').close();
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='grupo7-dados-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const d=JSON.parse(await file.text());if(!Array.isArray(d.projects)||!Array.isArray(d.members)||!Array.isArray(d.tasks)||!Array.isArray(d.events)||!Array.isArray(d.documents))throw Error('Estrutura JSON inválida.');db=d;save();notice('Dados importados neste navegador.')}catch(err){notice('Importação falhou: '+err.message)}e.target.value=''};
async function init(){try{const seed=await (await fetch('data/seed.json')).json();db=JSON.parse(localStorage.getItem(KEY)||'null')||seed;$('#today').textContent=new Intl.DateTimeFormat('pt-BR',{day:'numeric',month:'long',year:'numeric',timeZone:TZ}).format(new Date());render();checkAlerts();setInterval(checkAlerts,60*60*1000)}catch(err){notice('Não foi possível carregar os dados. Inicie um servidor local conforme README.');console.error(err)}}
init();
