// Smoke test do menu em desktop e celular.
// Uso: python3 -m http.server 8000 & BASE_URL=http://localhost:8000/ node tests/smoke.mjs
// Requer o pacote "playwright" disponível (npm i -g playwright ou npx).
import { chromium } from 'playwright';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8000/';
const views = [['agenda','Agenda'],['documentos','Documentos'],['equipe','Equipe'],['notificacoes','Notificações'],['agente','Integrante AI'],['inicio','Visão geral']];
const browser = await chromium.launch();
let failures = 0;
for (const viewport of [{width:1280,height:800},{width:900,height:1000},{width:390,height:844},{width:320,height:640}]) {
  const page = await (await browser.newContext({viewport})).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE_URL);
  for (const [view, title] of views) {
    const button = page.locator(`nav [data-view="${view}"]`);
    try { await button.scrollIntoViewIfNeeded(); await button.click({timeout:3000}); }
    catch { failures++; console.log(`✗ ${viewport.width}px: botão ${view} não clicável`); continue; }
    if (await page.textContent('#page-title') !== title) { failures++; console.log(`✗ ${viewport.width}px: ${view} não abriu`); }
  }
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) { failures++; console.log(`✗ ${viewport.width}px: rolagem horizontal`); }
  if (errors.length) { failures++; console.log(`✗ ${viewport.width}px: ${errors.join(' | ')}`); }
  console.log(`${viewport.width}px verificado`);
}
await browser.close();
console.log(failures ? `${failures} falha(s)` : 'OK');
process.exit(failures ? 1 : 0);
