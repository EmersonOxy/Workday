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
    ok(tex.w === 128 && tex.h === 128 && tex.seamlessX && tex.seamlessY && tex.opaque, 'tile original 128×128 opaco e sem emendas horizontais/verticais');
    await p.waitForFunction(() => Object.keys(ROOM_WALL_EXTRA_ASSETS).every(id => RoomWall.loaded(id)), { timeout: 15000 });
    const collection = await p.evaluate(() => {
      const keys = Object.keys(ROOM_WALL_EXTRA_ASSETS);
      const hashes = new Set();
      const bad = [];
      for (const id of keys) {
        const im = RoomWall.images[id], w = im.naturalWidth, h = im.naturalHeight;
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
        const pix = ctx.getImageData(0, 0, w, h).data;
        const at = (x,y,k) => pix[(y*w+x)*4+k];
        let seamX = true, seamY = true, opaque = true;
        for (let y=0; y<h; y++) for(let k=0; k<4; k++) seamX &&= at(0,y,k) === at(w-1,y,k);
        for (let x=0; x<w; x++) for(let k=0; k<4; k++) seamY &&= at(x,0,k) === at(x,h-1,k);
        for (let k=3; k<pix.length; k+=4) opaque &&= pix[k]===255;
        if (!seamX || !seamY || !opaque || w < 96 || w > 192 || h!==w) bad.push(id);
        hashes.add(cv.toDataURL());
      }
      return {n:keys.length,unique:hashes.size,bad,all:RoomWall.ids.length,
        names: Object.values(ROOM_WALL_NAMES).every(t=>RoomWall.ids.every(id=>!!t[id]))};
    });
    ok(collection.n===10 && collection.unique===10 && collection.all===12, 'dez padrões distintos preservados junto aos dois anteriores');
    ok(collection.bad.length===0, 'todos os novos tiles são quadrados, opacos e repetíveis sem emendas: '+collection.bad.join(','));
    ok(collection.names, 'todos os doze padrões possuem rótulos em PT/EN/ES');
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
    ok(await p.evaluate(() => document.querySelectorAll('.room-wall-opt').length === 12 && document.querySelectorAll('.room-trim-opt').length === 3), 'doze paredes e três acabamentos aparecem em Personalizar');
    await p.click('.room-wall-opt[data-room-wall="classic"]');
    await p.click('.room-wall-opt[data-room-wall="sage"]');
    await p.click('.room-wall-opt[data-room-wall="gatinhos"]');
    await p.click('.room-wall-opt[data-room-wall="deco"]');
    await p.click('.room-trim-opt[data-room-trim="wood"]');
    const saved = await p.evaluate(() => {
      const cfg = JSON.parse(localStorage.getItem('expediente-config') || '{}');
      return { wall:cfg.hw?.roomWall, trim:cfg.hw?.roomTrim, os:cfg.hw?.wall, on:document.querySelector('.room-wall-opt[data-room-wall="deco"]').classList.contains('on') };
    });
    ok(saved.wall === 'deco' && saved.trim === 'wood' && saved.on, 'seleção e acabamento são salvos e marcados na interface');
    ok(saved.os === tex.wallOS, 'troca da parede não altera o fundo do computador');
    await p.reload(); await p.waitForFunction(() => RoomWall.ready);
    ok(await p.evaluate(() => hw().roomWall === 'deco' && hw().roomTrim === 'wood'), 'preferências sobrevivem ao recarregamento');
    ok(await p.evaluate(() => ROOM_WALL_NAMES.pt.title && ROOM_WALL_NAMES.en.title && ROOM_WALL_NAMES.es.title), 'opções traduzidas para PT/EN/ES');
    ok(errors.length === 0, 'sem erros de JavaScript no navegador' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await p.close();
  } finally { await browser.close(); }
  console.log('[Parede] ' + passes + ' aprovados, ' + fails + ' falhas');
  if (fails) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
