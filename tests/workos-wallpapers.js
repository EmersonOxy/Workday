// Teste da coleção WorkOS 16:9: PNGs, UI, saves, preview e build offline.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const EXPECTED = ['espaco-terra','cerejeira-luar','outono-dourado','deserto-por-do-sol',
  'lago-primavera','praia-tropical','planeta-aneis','farol-por-do-sol'];
let okCount = 0, failCount = 0;
const ok = (cond, msg) => {
  if (cond) { okCount++; console.log('  ✓ '+msg); }
  else { failCount++; console.error('  ✗ '+msg); }
};
(async () => {
  const browser = await chromium.launch();
  try {
    for (const mode of ['web', 'offline']) {
      const file = mode === 'web' ? path.resolve(__dirname, '../dist/web/index.html')
        : path.resolve(__dirname, '../dist/workday.html');
      const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('file://' + file);
      await page.waitForFunction(() => typeof WORKOS_EXTRA_WALLS !== 'undefined' && typeof WALLS !== 'undefined');
      const assets = await page.evaluate(async () => {
        const ids = Object.keys(WORKOS_EXTRA_WALLS);
        const loaded = await Promise.all(ids.map(async id => {
          const img = new Image(); img.src = WORKOS_EXTRA_WALLS[id].src;
          try { await img.decode(); return { id, loaded: true, w: img.naturalWidth, h: img.naturalHeight }; }
          catch { return { id, loaded: false }; }
        }));
        return {
          ids, loaded, old:Object.keys(WALLS),
          embedded:ids.every(id => WORKOS_EXTRA_WALLS[id].src.startsWith('data:image/png;base64,')),
          languages:ids.every(id => ['pt','en','es'].every(l=>WORKOS_EXTRA_WALLS[id].names[l]))
        };
      });
      ok(EXPECTED.every(id=>assets.ids.includes(id)) && assets.ids.length===8, mode+': oito wallpapers cadastrados');
      ok(assets.old.length===20 && assets.old.includes('espaco') && assets.old.includes('teal'), mode+': vinte wallpapers antigos preservados');
      ok(assets.loaded.every(a=>a.loaded && a.w===320 && a.h===180), mode+': oito PNGs legíveis e em 16:9');
      ok(assets.languages, mode+': nomes traduzidos PT/EN/ES');
      ok(assets.embedded === (mode==='offline'), mode+': caminhos web e dados embutidos offline');
      await page.evaluate(() => {
        const title=document.getElementById('titlescr'); if(title) title.remove();
        closeScene(); ARRIVED=true; showMenu(); showCustomize(showMenu);
      });
      await page.click('.hw-tab[data-t="os"]');
      const choices = await page.evaluate(() => [...document.querySelectorAll('.wall[data-w]')].map(b=>b.dataset.w));
      ok(choices.length===28 && EXPECTED.every(id=>choices.includes(id)), mode+': vinte antigos + oito novos na galeria');
      await page.click('.wall[data-w="planeta-aneis"]');
      const selection=await page.evaluate(()=>({
        wall:hw().wall, size:document.getElementById('osdesk').style.backgroundSize,
        img:document.getElementById('osdesk').style.backgroundImage,
        active:document.querySelector('.wall[data-w="planeta-aneis"]').classList.contains('on'),
        stored:JSON.parse(localStorage.getItem('expediente-config')||'{}').hw?.wall
      }));
      ok(selection.wall==='planeta-aneis'&&selection.stored==='planeta-aneis'&&selection.active,
        mode+': escolha de planeta salva na galeria');
      ok(selection.size==='100% 100%'&&selection.img.includes('planeta-aneis.png'||'data:image'),
        mode+': imagem inteira sem crop/zoom no monitor');
      await page.reload();
      ok(await page.evaluate(()=>hw().wall==='planeta-aneis'),mode+': seleção preservada após recarregar');
      ok(errors.length===0,mode+': nenhum erro no navegador'+(errors.length?' ('+errors.join('; ')+')':''));
      await page.close();
    }
  } finally { await browser.close(); }
  console.log('[WorkOS] '+okCount+' testes aprovados, '+failCount+' falhas');
  if (failCount) process.exitCode=1;
})().catch(e => { console.error(e);process.exitCode=1; });
