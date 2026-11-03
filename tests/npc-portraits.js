// Duda: retrato estático no MSworkN e nas videochamadas; nenhuma mudança no motor narrativo.
// Uso: python3 tools/build.py && node tests/npc-portraits.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let passed = 0, failed = 0;
function ok(v, s) { if (v) { passed++; console.log('  ✓ ' + s); } else { failed++; console.error('  ✗ ' + s); } }
(async () => {
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:1366,height:768},{width:390,height:844}]) {
      const p = await browser.newPage({viewport});
      const errors = [];
      p.on('pageerror', e => errors.push(e.message));
      await p.goto(URL);
      const r = await p.evaluate(async () => {
        const icon = msnPicEl('duda',2), legacy = msnPicEl('bia',2);
        const stage = document.createElement('div');
        stage.className = 'vc-stage';
        stage.style.cssText = 'position:relative;width:290px;height:220px';
        const host = document.createElement('span');
        host.className = 'vc-face';
        stage.append(host); document.body.append(stage);
        const face = dudaFace(host);
        const shown = host.querySelector('img.npc-static-portrait');
        const picDecoded = await icon.decode().then(() => true, () => false);
        const portraitDecoded = shown && await shown.decode().then(() => true, () => false);
        const initial = host.innerHTML;
        face.set('wow','happy'); face.talk(true); face.talk(false);
        const soc = dudaFaceSoc(host); soc.mood('happy'); soc.talk(true); soc.gesture('wave');
        const stable = host.innerHTML === initial;
        const result = {
          pic: icon.tagName === 'IMG' && icon.width === 32 && icon.height === 32 && picDecoded && icon.naturalWidth === 48,
          portrait: !!shown && portraitDecoded && shown.naturalWidth === 128 && shown.naturalHeight === 128,
          stable, legacy: legacy.tagName === 'CANVAS',
          bio: CAST.duda.bio && CAST.duda.bio[0].includes('Loiro'),
          calls: typeof face.set === 'function' && typeof face.talk === 'function' && typeof soc.mood === 'function'
        };
        stage.remove();
        return result;
      });
      const label = viewport.width < 600 ? 'celular' : 'desktop';
      ok(r.pic && r.portrait, label + ': retrato e ícone do Duda decodificados em PNG transparente');
      ok(r.stable && r.calls, label + ': expressão e fala não animam o retrato, mas mantêm a API da chamada');
      ok(r.legacy && r.bio, label + ': demais NPCs e descrição do Duda preservados');
      ok(!errors.length, label + ': página abre sem erros de JavaScript' + (errors.length ? ' (' + errors.join('|') + ')' : ''));
      await p.close();
    }
  } finally { await browser.close(); }
  console.log('[Retratos NPC] ' + passed + ' aprovados, ' + failed + ' falhas');
  if (failed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
