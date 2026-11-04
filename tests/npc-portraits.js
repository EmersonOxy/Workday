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
        const icon = msnPicEl('duda',2), legacy = msnPicEl('helena',2);
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
      ok(r.legacy && r.bio, label + ': Helena e descrição do Duda preservadas');
      const lib = await p.evaluate(async () => {
        const ids = Object.keys(NPC_PORTRAIT_RESERVE);
        const approved = [['rafa','personagem-03'],['bia','personagem-15'],['otavio','personagem-16']];
        const approvedIcons = approved.map(([id]) => msnPicEl(id,2));
        const approvedPortraits = approved.map(([id]) => npcStaticImg(id,'portrait'));
        const approvedLoaded = await Promise.all([...approvedIcons,...approvedPortraits].map(img => img.decode().then(() => true, () => false)));
        const stage = document.createElement('div');
        stage.className = 'vc-stage'; stage.style.cssText = 'position:relative;width:290px;height:220px';
        const host = document.createElement('span'); host.className='vc-face'; stage.append(host); document.body.append(stage);
        const f = npcApprovedFaceSoc(host, 'bia');
        const video = host.querySelector('img.npc-static-portrait');
        f.mood('happy'); f.talk(true); f.gesture('wave'); f.set('smile','happy'); f.talk(false);
        const staticVideo = !!video && video === host.firstElementChild && await video.decode().then(() => true, () => false) && video.naturalWidth === 128;
        stage.remove();
        const images = ids.map(id => npcReservedPortrait(id,128));
        const decoded = await Promise.all(images.map(img => img.decode().then(() => true, () => false)));
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
        const ctx = canvas.getContext('2d'); ctx.drawImage(images[0],0,0);
        const rgba = ctx.getImageData(0,0,128,128).data;
        let clear = 0, filled = 0;
        for (let i=3;i<rgba.length;i+=4) { if (!rgba[i]) clear++; if (rgba[i]===255) filled++; }
        return {
          count: ids.length, first: ids[0], last: ids.at(-1),
          decoded: decoded.every(Boolean),
          dims: images.every(img=>img.naturalWidth===128 && img.naturalHeight===128),
          pixelated: images.every(img=>img.style.imageRendering==='pixelated'),
          approved: approvedLoaded.every(Boolean) && approvedIcons.every(img=>img.tagName==='IMG' && img.width===32 && img.height===32 && img.naturalWidth===128)
            && approvedPortraits.every(img=>img.tagName==='IMG' && img.naturalWidth===128)
            && approved.every(([id,asset])=>NPC_STATIC_ART[id].portrait.endsWith(asset+'.png') || NPC_STATIC_ART[id].portrait.startsWith('data:image/png;base64,')),
          staticVideo,
          transparent: clear>100 && filled>1000,
          unknown: npcReservedPortrait('personagem-999')===null,
          cast: ['duda','bia','otavio','helena','rafa','lu'].every(id=>!!CAST[id])
            && !!NPC_STATIC_ART.duda && msnPicEl('bia',2).tagName==='CANVAS'
        };
      });
      ok(lib.count===19 && lib.first==='personagem-01' && lib.last==='personagem-19' && lib.unknown,
        label+': galeria de 19 retratos, IDs provisórios e busca segura');
      ok(lib.decoded && lib.dims && lib.transparent,
        label+': todos os PNGs 128x128 decodificados com transparência');
      ok(lib.pixelated && lib.cast,
        label+': pixel art e personagens existentes preservados');
      ok(!errors.length, label + ': página abre sem erros de JavaScript' + (errors.length ? ' (' + errors.join('|') + ')' : ''));
      await p.close();
    }
  } finally { await browser.close(); }
  console.log('[Retratos NPC] ' + passed + ' aprovados, ' + failed + ' falhas');
  if (failed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
