// Testes de regressão do WORKDAY (Playwright + Chromium do ambiente).
// Uso: node tests/regression.js [caminho-ou-url]   (padrão: dist/web/index.html via servidor local e dist/workday.html via file://)
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(__dirname, 'baseline-balance.json');
let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log('  ✓ ' + msg); } else { fails++; console.log('  ✗ ' + msg); } };

function serve(dir) {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': f.endsWith('.mp3') ? 'audio/mpeg' : 'text/html; charset=utf-8' }); r.end(d); });
    }).listen(0, () => res(srv));
  });
}
// Tudo o que define o balanceamento: se mudar sem querer, o teste acusa
const balance = () => ({ UNLOCK, EVENTS, DAY_SECONDS, LEVEL_SECONDS, MAX_TASKS, RANK_POINTS, MODS, PERK_IDS,
  SHOP: SHOP.map(i => [i.id, i.kind, i.price]), RANK_DESK, keys: Object.keys(LANGS),
  uiKeys: Object.fromEntries(Object.entries(LANGS).map(([k, v]) => [k, Object.keys(v.ui).sort().join(',')])) });

async function holdFinger(p) {
  for (let i = 0; i < 5; i++) {
    const pad = await p.$('.pad'); if (!pad) return;
    const b = await pad.boundingBox(); if (!b) return;
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down(); await p.waitForTimeout(1250); await p.mouse.up(); await p.waitForTimeout(1300);
  }
}

async function desktop(browser, url, label) {
  console.log(`\n[computador] ${label}`);
  const p = await browser.newPage({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  // save no formato da v1.0, gravado antes de abrir o jogo
  await p.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    const s = (k, v) => localStorage.setItem('expediente-' + k, JSON.stringify(v));
    s('carteira', 777); s('enfeites', ['planta', 'gato']); s('recorde2', 4321); s('tutorial', ['file']);
    s('stats', { files: 10, emails: 2, calls: 1, typed: 0, prints: 0, viruses: 3, bosses: 1, videos: 0, days: 4, careers: 2, maxDay: 3 });
    s('config', { lang: 'pt', theme: 'dark' }); s('som', false);
    s('carreira', { day: 2, score: 1500, rankIdx: 2, perks: ['terapia'], today: [], inv: { cafe: 1, cha: 0 }, careerCauses: { wrong: 5 }, stress: 20 });
  });
  await p.goto(url);
  const bal = await p.evaluate(balance);
  if (!fs.existsSync(BASELINE)) { fs.writeFileSync(BASELINE, JSON.stringify(bal, null, 1)); console.log('  (linha de base de balanceamento criada)'); }
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')), strip = o => { const c = { ...o }; delete c.uiKeys; return JSON.stringify(c); };
  ok(strip(bal) === strip(base), 'balanceamento idêntico à v1.0');
  ok(new Set(Object.values(bal.uiKeys)).size === 1, 'os três idiomas têm exatamente as mesmas chaves de texto');
  ok(Object.values(base.uiKeys)[0].split(',').every(k => bal.uiKeys.pt.split(',').includes(k)), 'nenhum texto da v1.0 foi perdido');
  const st = await p.evaluate(() => ({ w: P.wallet, d: P.decor, b: P.best, t: document.documentElement.dataset.theme, cont: !!document.querySelector('#cont') }));
  ok(st.w === 777 && st.d.join() === 'planta,gato' && st.b === 4321, 'save antigo carregado (carteira, enfeites, recorde)');
  ok(st.t === 'dark', 'configuração de tema antiga respeitada');
  ok(st.cont, 'carreira salva oferece "Continuar"');
  for (const lang of ['en', 'es', 'pt']) {
    await p.click('#cfg'); await p.click(`[data-set=lang] [data-v=${lang}]`); await p.click('#b');
    ok(await p.evaluate(l => L === LANGS[l] && document.documentElement.lang === LANGS[l].htmlLang, lang), 'idioma ' + lang);
  }
  await p.click('#cont'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.day === 3 && S.perks.has('terapia') && S.inv.cafe === 1), 'carreira retomada no dia 3 com benefícios e itens');
  await holdFinger(p); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.phase === 'day'), 'bateu o ponto e começou o expediente');
  // arquivo: mover com teclado e acertar
  const hit = await p.evaluate(() => { S.file.kind = 'normal'; S.file.lane = 0; const target = S.order.indexOf(SECTORS.findIndex(s => s.id === S.file.dest)); S.file.lane = target; S.file.y = board.clientHeight; return S.score; });
  await p.waitForTimeout(150);
  ok(await p.evaluate(s0 => S.score > s0 && S.combo >= 1, hit), 'arquivo no setor certo pontua e soma combo');
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowRight');
  // todas as tarefas e eventos ao mesmo tempo
  await p.evaluate(() => { S.dayT = 100; S.level = 12; });
  await p.waitForTimeout(100);
  await p.evaluate(() => { for (let i = 0; i < 6; i++) spawnTask(); bossComing(); freezePc(); startVirus(); startVideo(); S.shuffleT = 0.3; });
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => S.tasks.length > 0 && document.getElementsByClassName('popup').length > 0 && !!S.video && !!S.frozen), 'tarefas, vírus, reunião e PC travado simultâneos');
  for (let i = 0; i < 40; i++) await p.mouse.move(i % 2 ? 900 : 400, 400);
  ok(await p.evaluate(() => !S.frozen), 'PC destrava balançando o mouse');
  await p.keyboard.press('Escape'); await p.waitForTimeout(1900);
  await p.keyboard.press(' '); ok(await p.evaluate(() => S.paused), 'pausa com Espaço'); await p.keyboard.press(' ');
  // fim do dia completo
  await p.evaluate(() => { S.dayT = 149.95; }); await p.waitForTimeout(3600);
  ok(await p.evaluate(() => S.phase === 'ending' && !!document.querySelector('.clockdev')), 'fim do dia: poeira e relógio de ponto');
  await holdFinger(p); await p.waitForTimeout(3200);
  const t = await (await p.$('.ticket')).boundingBox(); const y = t.y + t.height - 50;
  await p.mouse.move(t.x + t.width / 2, y); await p.mouse.down();
  for (let i = 1; i <= 22; i++) { await p.mouse.move(t.x + t.width / 2, Math.max(2, y - i * 8)); await p.waitForTimeout(40); }
  await p.mouse.up(); await p.waitForTimeout(2200);
  ok(!!await p.$('#shopb'), 'ticket rasgado e ações do fim do dia');
  await p.click('#shopb'); await p.waitForTimeout(1100);
  for (const id of ['cafe', 'foto', 'trofeu']) { await p.click(`.slot[data-id=${id}]`); await p.waitForTimeout(650); }
  await p.evaluate(() => { P.wallet = 300; Math.random = (r => () => (r = (r * 9301 + 49297) % 233280) / 233280)(7); }); await p.click('#tocash'); await p.waitForTimeout(1000);
  const s = await (await p.$('.scanner')).boundingBox();
  for (let k = 0; k < 12; k++) {
    const it = await p.$('.lane-in .belt-item'); if (!it) break; const ib = await it.boundingBox();
    await p.mouse.move(ib.x + 15, ib.y + 15); await p.mouse.down();
    for (let i = 0; i <= 12; i++) { await p.mouse.move(s.x - 60 + i * (s.width + 120) / 12, s.y - 30); await p.waitForTimeout(15); }
    await p.mouse.up(); await p.waitForTimeout(250);
  }
  await p.click('.paym'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('#paybtn').disabled), 'caixa trava acima do saldo');
  const bag = await p.$$('.inbag'); for (const b of bag.reverse()) { if (!(await p.evaluate(() => document.querySelector('#paybtn').disabled))) break; await b.click(); await p.waitForTimeout(100); }
  const w0 = await p.evaluate(() => P.wallet);
  await p.click('#paybtn'); await p.waitForTimeout(1300);
  ok(await p.evaluate(w => P.wallet < w, w0), 'pagamento debitou a carteira');
  await p.click('#home'); await p.waitForTimeout(4900);
  ok(!!await p.$('.alarm'), 'ir para casa: escuro, Zzz e despertador');
  await p.click('.alarm'); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => S.phase === 'intro' && S.day === 4 && !!document.querySelector('.sc-in .clockdev')), 'acordou no dia 4 com o ponto de entrada');
  // demissão
  await p.evaluate(() => { closeScene(); startDay(); }); await p.waitForTimeout(200);
  await p.evaluate(() => addStress(100)); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.phase === 'over' && !localStorage.getItem('expediente-carreira')), 'demissão encerra a carreira e apaga o save da carreira');
  ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await p.close();
}

async function mobile(browser, url) {
  console.log('\n[celular] iPhone 13');
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url);
  await p.tap('#play'); await p.waitForTimeout(200);
  await p.evaluate(() => { closeScene(); startDay(); S.file.kind = 'normal'; });
  const bx = await (await p.$('#board')).boundingBox();
  await p.tap('#board', { position: { x: bx.width * 0.9, y: bx.height * 0.5 } });
  ok(await p.evaluate(() => S.file.lane === 3), 'tocar na coluna move o arquivo');
  // deslizar: arrastar leva coluna a coluna, peteleco anda uma, para baixo solta
  const drag = async (x0, y0, x1, y1, steps, ms) => { await p.mouse.move(x0, y0); await p.mouse.down(); for (let i = 1; i <= steps; i++) { await p.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await p.waitForTimeout(ms); } await p.mouse.up(); };
  const lw = bx.width / 4, my = bx.y + bx.height * 0.4;
  await p.evaluate(() => { S.file.lane = 0; S.file.y = 10; placeFile(); });
  await drag(bx.x + lw * 0.5, my, bx.x + lw * 2.5, my, 10, 20);
  ok(await p.evaluate(() => S.file.lane === 2), 'arrastar para o lado leva o arquivo junto (2 colunas)');
  await drag(bx.x + lw * 2.5, my, bx.x + lw * 2.5 - 34, my, 2, 10);
  ok(await p.evaluate(() => S.file.lane === 1), 'peteleco curto anda uma coluna');
  await p.evaluate(() => { S.dropNow = false; });
  await drag(bx.x + lw * 1.5, my, bx.x + lw * 1.5, my + 90, 6, 15);
  ok(await p.evaluate(() => S.dropNow === true || S.file.y < 20), 'deslizar para baixo solta o arquivo');
  ok(await p.evaluate(() => !document.querySelector('#pad').classList.contains('hidden') && !document.querySelector('[data-k=ArrowLeft]')), 'barra de toque sem setas');
  await p.evaluate(() => { S.file.kind = 'dead'; }); await p.waitForTimeout(60);
  ok(await p.evaluate(() => document.querySelector('#padDel').classList.contains('show')), 'botão APAGAR aparece com arquivo morto');
  ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await ctx.close();
}

async function audio(browser, url, label) {
  console.log(`\n[áudio] ${label}`);
  const p = await browser.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.click('#msnd'); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => A.mode === 'menu' && !!A.el && !A.el.paused), 'música do menu tocando');
  await p.evaluate(() => { newCareer(); closeScene(); startDay(); }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => A.mode === 'office' && (!!A.officeSrc || (!!A.el && !A.el.paused))), 'música do escritório tocando');
  ok(errs.length === 0, 'sem erros de JavaScript');
  await p.close();
}

// Arquivo único sem internet: toda requisição de rede é bloqueada; fonte e áudio precisam vir de dentro do HTML
async function offline(browser, url) {
  console.log('\n[offline] arquivo único com a rede bloqueada');
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const ext = []; await ctx.route(/^https?:/, r => { ext.push(r.request().url()); r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(800);
  ok(await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check("20px 'VT323'") && [...document.fonts].some(f => f.family.includes('VT323') && f.status === 'loaded'); }), 'fonte VT323 embutida e carregada');
  await p.click('#msnd'); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => A.mode === 'menu' && !!A.el && !A.el.paused), 'música toca sem rede');
  ok(ext.length === 0, 'nenhuma requisição externa' + (ext.length ? ': ' + ext.join(', ') : ''));
  ok(errs.length === 0, 'sem erros de JavaScript');
  await ctx.close();
}

// Regras do guia que se verificam no código-fonte: paleta fechada, sem preto puro
function paletteLint() {
  console.log('\n[guia visual] paleta');
  const r = require('child_process').spawnSync('python3', [path.join(ROOT, 'tools', 'palette.py')], { encoding: 'utf8' });
  ok(r.status === 0, 'todas as cores do código na paleta WORKDAY' + (r.status ? ': ' + r.stdout.trim().split('\n').slice(-3).join(' / ') : ''));
}

// Entrega 1: estresse imediato, assinatura, promoção, rescisão, crachá, computador, som dos menus
async function entrega1(browser, url) {
  console.log('\n[entrega 1] computador');
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(400);
  await p.evaluate(() => { newCareer(); closeScene(); startDay(); S.level = 3; });
  // 3. estresse: largura muda no mesmo instante do erro
  ok(await p.evaluate(() => { fail(10, 'x', 'wrong'); return Math.abs(parseFloat($('stress').style.width) - S.stress) < .2 && getComputedStyle($('stress')).transitionDuration.split(',').every(d => parseFloat(d) === 0); }), 'estresse: barra reage no mesmo quadro do erro, sem transição');
  // 6. som dos menus: um som por clique, sem duplicar
  await p.evaluate(() => { window._snd = []; const o = sfx; window.sfx = n => { _snd.push(n); return o(n); }; setPaused(true); });
  await p.waitForTimeout(300);
  await p.evaluate(() => { _snd = []; document.querySelector('[data-a=cfg]').click(); });
  await p.waitForTimeout(50);
  ok(await p.evaluate(() => _snd.length === 1), 'aba da planilha toca exatamente um som');
  await p.evaluate(() => { _snd = []; document.querySelector('[data-set=theme] button').click(); });
  await p.waitForTimeout(50);
  ok(await p.evaluate(() => _snd.length === 1), 'opção das configurações toca exatamente um som');
  // 2. pedir demissão: cancelar volta ao expediente sem mexer na carreira
  await p.evaluate(() => { saveCareer(); closeModal(); showSheet(true); document.querySelector('[data-a=quit]').click(); });
  await p.waitForTimeout(400);
  ok(await p.evaluate(() => !!document.querySelector('.resign-card .sig') && S.phase === 'day'), 'pedir demissão abre o termo, sem encerrar a carreira');
  await p.click('#rsCancel'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.phase === 'day' && S.paused && !$('boss').classList.contains('hidden') && !!localStorage.getItem('expediente-carreira')), 'cancelar o termo volta à pausa com a carreira intacta');
  // 4. assinatura: vários traços, nada finaliza ao soltar, limpar e confirmar
  const stroke = async (sel, x0, x1, y, amp = .15) => { const b = await (await p.$(sel)).boundingBox(); await p.mouse.move(b.x + b.width * x0, b.y + b.height * y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(b.x + b.width * (x0 + (x1 - x0) * i / 8), b.y + b.height * (y + (i % 2 ? amp : -amp))); await p.mouse.up(); };
  await p.evaluate(() => document.querySelector('[data-a=quit]').click()); await p.waitForTimeout(400);
  await stroke('.resign-card .sig', .1, .13, .5, 0);
  const st1 = await p.evaluate(() => [document.querySelector('[data-s=ok]').disabled, document.querySelector('[data-s=clear]').disabled, !!document.querySelector('.resign-stamp')]);
  await stroke('.resign-card .sig', .3, .9, .5);
  const st2 = await p.evaluate(() => [document.querySelector('[data-s=ok]').disabled, !!document.querySelector('.resign-stamp')]);
  ok(st1[0] && !st1[1] && !st1[2] && !st2[0] && !st2[1], 'assinatura aceita vários traços e só finaliza ao confirmar');
  await p.click('[data-s=clear]');
  ok(await p.evaluate(() => document.querySelector('[data-s=ok]').disabled && document.querySelector('[data-s=clear]').disabled), 'limpar assinatura zera o desenho');
  await stroke('.resign-card .sig', .1, .9, .5); await p.click('[data-s=ok]'); await p.waitForTimeout(1600);
  ok(await p.evaluate(() => S.phase === 'over' && S.endReason === 'quit' && document.querySelector('.over-card h2').textContent === U().quitTitle && !localStorage.getItem('expediente-carreira')), 'termo assinado encerra a carreira como demissão voluntária');
  // estresse: relatório diferente
  await p.evaluate(() => { newCareer(); closeScene(); startDay(); addStress(100); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.endReason === 'burnout' && document.querySelector('.over-card h2').textContent === U().burnoutTitle), 'estresse em 100 gera afastamento, não pedido de demissão');
  // 9. crachá: nome e avatar salvos, aparecem no certificado
  await p.evaluate(() => { newCareer(); closeScene(); startDay(); showBadge(); });
  await p.fill('#bgName', 'Ana Teste'); await p.click('.bg-av >> nth=2'); await p.click('#bgSave');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('expediente-perfil')).name === 'Ana Teste' && PROFILE.avatar === 2), 'crachá salva nome e avatar');
  ok(await p.evaluate(() => { const r = photoToRows((() => { const c = document.createElement('canvas'); c.width = 40; c.height = 40; const x = c.getContext('2d'); x.fillStyle = '#c33'; x.fillRect(0, 0, 40, 40); x.fillStyle = '#3c3'; x.fillRect(10, 10, 20, 20); return c; })());
    return r.length === 18 && r.every(row => row.length === 16 && [...row].every(ch => ch in WD_PAL)); }), 'foto vira grade 16×18 só com cores da paleta');
  // 1. promoção: assinatura confirmada, carta grande e centralizada
  await p.evaluate(() => { closeModal(); S.score = 400; S.phase = 'day'; promote(); }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelector('.cert-body').textContent.includes('Ana Teste')), 'certificado mostra o nome do crachá');
  await stroke('.promo-card .sig', .1, .9, .5); await p.click('[data-s=ok]'); await p.waitForTimeout(700);
  await p.click('.env >> nth=0'); await p.waitForTimeout(1300);
  ok(await p.evaluate(() => { const c = document.querySelector('.perk-card'), r = c.getBoundingClientRect(), m = $('modal').querySelector('.card').getBoundingClientRect();
    return r.width > 330 && Math.abs((r.left + r.width / 2) - (m.left + m.width / 2)) < 8 && parseFloat(getComputedStyle(c.querySelector('b')).fontSize) > 28; }), 'carta do benefício grande, centralizada e legível');
  await p.click('#pok2'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => S.phase === 'day' && $('modal').classList.contains('hidden')), 'continuar após o benefício volta ao expediente');
  // 7. computador: acabamento salvo e desenhado na mesa
  await p.evaluate(() => showCustomize()); await p.click('[data-hw=all] [data-v=graphite]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const h = hw(); return h.mon === 'graphite' && h.kb === 'graphite' && h.mouse === 'graphite' && JSON.parse(localStorage.getItem('expediente-config')).hw.kb === 'graphite'; }), 'personalização combinada salva');
  await p.click('[data-hw=mouse] [data-v=cream]'); await p.click('#hwOk'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const L = OFFICE.L, c = Office.bake(L, officeState()).getContext('2d'), x = c.getImageData(L.kx + 1, L.VH - 8, 1, 1).data, m = c.getImageData(L.kx + L.kw + 18 + 2, L.VH - 10, 1, 1).data;
    const hex = d => '#' + [0, 1, 2].map(i => d[i].toString(16).padStart(2, '0')).join(''); return hex(x) === Office.HW.graphite.base && hex(m) === Office.HW.cream.base; }), 'teclado grafite e mouse creme desenhados na mesa (cores independentes)');
  // 9. clique no crachá da mesa
  const bp = await p.evaluate(() => { const b = Office.badgeRect(OFFICE.L), k = OFFICE.M.k; return [(b.x + 6) * k, (b.y + 16) * k]; });
  await p.mouse.click(bp[0], bp[1]); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !!document.querySelector('.badge-card') && S.paused), 'clicar no crachá da mesa abre o crachá e congela o expediente');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => $('modal').classList.contains('hidden') && !S.paused), 'Esc fecha o crachá e retoma');
  // papel de parede
  await p.evaluate(() => { setHw({ wall: 'hills' }); showMenu(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /data:image/.test($('osdesk').style.backgroundImage)), 'papel de parede aplicado na área de trabalho');
  await p.evaluate(() => setHw({ wall: 'teal', mon: 'cream', kb: 'cream', mouse: 'cream' }));
  ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await ctx.close();
  console.log('\n[entrega 1] celular');
  const m = await (await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-BR' })).newPage(); const merr = []; m.on('pageerror', e => merr.push(e.message));
  await m.goto(url); await m.waitForTimeout(300);
  await m.evaluate(() => { newCareer(); closeScene(); startDay(); setPaused(true); document.querySelector('[data-a=cfg]').click(); });
  await m.waitForTimeout(300); await m.tap('#editBadge'); await m.waitForTimeout(300);
  ok(await m.evaluate(() => !!document.querySelector('.badge-card .bg-photo canvas')), 'celular: crachá acessível pelas configurações');
  await m.evaluate(() => { closeModal(); showSheet(true); document.querySelector('[data-a=quit]').click(); }); await m.waitForTimeout(400);
  const sb = await (await m.$('.resign-card .sig')).boundingBox();
  for (const [a, c] of [[.1, .4], [.5, .9]]) { await m.mouse.move(sb.x + sb.width * a, sb.y + sb.height / 2); await m.mouse.down(); for (let i = 1; i <= 8; i++) await m.mouse.move(sb.x + sb.width * (a + (c - a) * i / 8), sb.y + sb.height * (i % 2 ? .3 : .7)); await m.mouse.up(); }
  ok(await m.evaluate(() => !document.querySelector('[data-s=ok]').disabled && !document.querySelector('.resign-stamp')), 'celular: assinatura com dois traços, aguardando confirmação');
  ok(merr.length === 0, 'celular: sem erros de JavaScript' + (merr.length ? ': ' + merr.join(' | ') : ''));
}

(async () => {
  paletteLint();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const target = process.argv[2];
  if (target) { await desktop(browser, target, target); await mobile(browser, target); }
  else {
    const srv = await serve(path.join(ROOT, 'dist', 'web'));
    const web = `http://localhost:${srv.address().port}/index.html`;
    await desktop(browser, web, 'versão web (servidor)'); await mobile(browser, web); await entrega1(browser, web); await audio(browser, web, 'versão web');
    await audio(browser, 'file://' + path.join(ROOT, 'dist', 'workday.html'), 'arquivo único offline (file://)');
    await offline(browser, 'file://' + path.join(ROOT, 'dist', 'workday.html'));
    srv.close();
  }
  await browser.close();
  console.log(`\n${passes} ok, ${fails} falha(s)`);
  process.exit(fails ? 1 : 0);
})();
