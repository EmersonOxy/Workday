// Regressão da proteção dos saves: aviso quando a gravação falha e preservação de dados sociais de outra versão.
// Uso: python3 tools/build.py && node tests/saves.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let passed = 0, failed = 0;
function ok(v, name) { if (v) { passed++; console.log('  ✓ ' + name); } else { failed++; console.error('  ✗ ' + name); } }
(async () => {
  const browser = await chromium.launch();
  try {
    for (const lang of ['pt-BR', 'en-US', 'es-ES']) {
      const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: lang });
      const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(URL);
      await page.evaluate(() => { document.getElementById('titlescr')?.remove(); closeScene(); ARRIVED = true; showMenu(); });
      const r = await page.evaluate(async () => {
        const real = Storage.prototype.setItem; let calls = 0;
        Storage.prototype.setItem = function () { calls++; throw new DOMException('cheio', 'QuotaExceededError'); };
        const before = P.wallet; P.wallet += 5; persist(); persist();
        await new Promise(res => setTimeout(res, 1500));
        Storage.prototype.setItem = real;
        const el = document.getElementById('toast');
        return { calls, shown: !!el && el.textContent.includes(U().saveFail), text: U().saveFail, warned: SAVE_WARNED, wallet: P.wallet === before + 5 };
      });
      ok(r.calls > 1 && r.shown && r.text.length > 20, lang + ': gravação recusada mostra aviso traduzido');
      ok(r.warned && r.wallet, lang + ': aviso único por sessão e jogo continua em memória');
      ok(errors.length === 0, lang + ': sem erros de JavaScript' + (errors.length ? ': ' + errors.join('; ') : ''));
      await ctx.close();
    }
    { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
      const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('expediente-social', JSON.stringify({ v: 99, cid: 3, c: { duda: { st: 'known' } } })); } });
      await page.goto(URL); await page.waitForTimeout(1500);
      const r = await page.evaluate(() => { socSync(); socFlush(); return { v: SOC.v, kept: JSON.parse(localStorage.getItem('expediente-social-v99') || 'null'), cur: JSON.parse(localStorage.getItem('expediente-social') || 'null') }; });
      ok(r.v === 1 && r.kept && r.kept.v === 99 && r.kept.c.duda.st === 'known', 'dados sociais de outra versão ficam guardados à parte');
      ok(r.cur && r.cur.v === r.v, 'estado social atual recomeça na versão corrente');
      const exported = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('expediente-')).includes('expediente-social-v99'));
      ok(exported, 'cópia preservada usa o prefixo incluído no backup');
      ok(errors.length === 0, 'sem erros de JavaScript' + (errors.length ? ': ' + errors.join('; ') : ''));
      await ctx.close(); }
  } finally { await browser.close(); }
  console.log('[Saves] ' + passed + ' aprovados, ' + failed + ' falhas');
  if (failed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
