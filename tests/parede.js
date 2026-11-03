// Regressão da parede do escritório: PNG embutido, repetição, personalização e saves antigos.
// Uso: python3 tools/build.py && node tests/parede.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let passes = 0, fails = 0;
const ok = (pass, desc) => { if (pass) { passes++; console.log('  ✓ ' + desc); } else { fails++; console.error('  ✗ ' + desc); } };
(async () => {
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(URL);
    await p.waitForFunction(() => typeof RoomWall !== 'undefined' && RoomWall.ready, { timeout: 15000 });
    const tex = await p.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const x = c.getContext('2d'); x.drawImage(RoomWall.image, 0, 0);
      const d = x.getImageData(0, 0, 128, 128).data;
      const eq = (a,b) => { for (let i=0;i<4;i++) if (d[a+i] !== d[b+i]) return false; return true; };
      let seamlessX = true, seamlessY = true, opaque = true;
      for (let y=0;y<128;y++) seamlessX &&= eq(y*128*4, (y*128+127)*4);
      for (let j=0;j<128;j++) seamlessY &&= eq(j*4, (127*128+j)*4);
      for (let j=3;j<d.length;j+=4) opaque &&= d[j] === 255;
      return { w: RoomWall.image.width, h: RoomWall.image.height, seamlessX, seamlessY, opaque, classic: hw().roomWall, trim: hw().roomTrim, wallOS: hw().wall };
    });
    ok(tex.w === 128 && tex.h === 128 && tex.seamlessX && tex.seamlessY && tex.opaque, 'tile 128×128 opaco e sem emendas horizontais/verticais');
    ok(tex.classic === 'classic' && tex.trim === 'original', 'saves antigos mantêm a parede e rodameio originais');
    const raster = await p.evaluate(() => {
      const L = OFFICE.L, sample = c => {
        const d = c.getContext('2d').getImageData(200, 4, 140, 10).data;
        return [...d].filter((_,i) => i%4 !== 3).join(',');
      };
      const a = sample(Office.bake(L, officeState()));
      setHw({roomWall:'sage'});
      const b = sample(Office.bake(L, officeState()));
      return { changed:a!==b, state:hw().roomWall, os:hw().wall, width:L.VW, height:L.VH };
    });
    ok(raster.changed && raster.state === 'sage' && raster.width > 0, 'nova textura altera somente a parede renderizada');
    ok(raster.os === tex.wallOS, 'papel de parede do WorkOS permanece independente');
    await p.evaluate(() => { const title = document.getElementById('titlescr'); if (title) title.remove(); closeScene(); ARRIVED = true; showMenu(); showCustomize(showMenu); });
    await p.click('.hw-tab[data-t="desk"]');
    ok(await p.evaluate(() => document.querySelectorAll('.room-wall-opt').length === 2 && document.querySelectorAll('.room-trim-opt').length === 3), 'opções de parede e de acabamento aparecem em Personalizar');
    await p.click('.room-wall-opt[data-room-wall="classic"]');
    await p.click('.room-wall-opt[data-room-wall="sage"]');
    await p.click('.room-trim-opt[data-room-trim="wood"]');
    const saved = await p.evaluate(() => {
      const cfg = JSON.parse(localStorage.getItem('expediente-config') || '{}');
      return { wall:cfg.hw?.roomWall, trim:cfg.hw?.roomTrim, os:cfg.hw?.wall, on:document.querySelector('.room-wall-opt[data-room-wall="sage"]').classList.contains('on') };
    });
    ok(saved.wall === 'sage' && saved.trim === 'wood' && saved.on, 'seleção e acabamento são salvos e marcados na interface');
    ok(saved.os === tex.wallOS, 'troca da parede não altera o fundo do computador');
    await p.reload(); await p.waitForFunction(() => RoomWall.ready);
    ok(await p.evaluate(() => hw().roomWall === 'sage' && hw().roomTrim === 'wood'), 'preferências sobrevivem ao recarregamento');
    ok(await p.evaluate(() => ROOM_WALL_NAMES.pt.title && ROOM_WALL_NAMES.en.title && ROOM_WALL_NAMES.es.title), 'opções traduzidas para PT/EN/ES');
    ok(errors.length === 0, 'sem erros de JavaScript no navegador' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await p.close();
  } finally { await browser.close(); }
  console.log('[Parede] ' + passes + ' aprovados, ' + fails + ' falhas');
  if (fails) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
