// Regressão da caneca ilustrada: pixel art, sombra/vapor independente e fallback.
// Execução: python3 tools/build.py && node tests/caneca.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let passed = 0, failed = 0;
function ok(v, name) { if (v) { passed++; console.log('  ✓ ' + name); } else { failed++; console.error('  ✗ ' + name); } }
(async () => {
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:1366,height:768},{width:1024,height:600}]) {
      const page = await browser.newPage({ viewport, locale: 'pt-BR' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(URL);
      await page.waitForFunction(() => typeof MugStatic !== 'undefined' && MugStatic.ready, { timeout: 15000 });
      const res = await page.evaluate(() => {
        const image = MugStatic.image, cv = document.createElement('canvas');
        cv.width = cv.height = MugStatic.size;
        const c = cv.getContext('2d', { willReadFrequently: true });
        c.imageSmoothingEnabled = false; c.drawImage(image,0,0);
        const pixels = c.getImageData(0,0,cv.width,cv.height).data;
        const palette = new Set(), alphas = new Set();
        let opaqueCount = 0, transparentCount = 0;
        for (let i=0;i<pixels.length;i+=4) {
          alphas.add(pixels[i+3]);
          if (pixels[i+3]===0) transparentCount++;
          else {
            opaqueCount++;
            palette.add([pixels[i],pixels[i+1],pixels[i+2]].join(','));
          }
        }
        const render = (steam, gold) => {
          const canvas = document.createElement('canvas');
          canvas.width = 110; canvas.height = 125;
          const ctx = canvas.getContext('2d',{ willReadFrequently: true });
          ctx.imageSmoothingEnabled = false;
          Office.mugBig(ctx, 40, 105, 2.5, gold, steam);
          return ctx.getImageData(0,0,canvas.width,canvas.height).data;
        };
        const a=render(false,false), b=render(true,false), c2=render(false,true);
        const difference=(u,v, minY=0, maxY=125) => {
          let count=0;for(let y=minY;y<maxY;y++) for(let x=0;x<110;x++){
            const i=(y*110+x)*4;
            if (u[i]!==v[i]||u[i+1]!==v[i+1]||u[i+2]!==v[i+2]||u[i+3]!==v[i+3]) count++;
          }
          return count;
        };
        const steamCount = difference(a,b,0,65);
        const steamOnly = difference(a,b,65,125);
        const goldCount = difference(a,c2);
        // Mudança de cores preparada para futura tela de personalização:
        // o desenho e a transparência permanecem, só a paleta muda.
        const colorVariants = {};
        for (const color of ['azul','verde','rosa','lilas','amarelo','grafite']) {
          MugStatic.setColor(color);
          colorVariants[color] = difference(a, render(false, false));
        }
        const invalidColor = MugStatic.setColor('cor-inexistente');
        MugStatic.setColor('original');
        const restoredOriginal = difference(a, render(false, false));
        const before = a;
        MugStatic.ready = false;
        const old = render(false,false);
        MugStatic.ready = true;
        const fallbackDifferent = difference(before,old)>100;
        const L=OFFICE.L, slots=Office.deskSlots(L,deskEffectiveDecor()), mug=slots.mug;
        return {
          loaded:MugStatic.ready,
          size:[image.naturalWidth,image.naturalHeight],
          palette:palette.size, alphas:[...alphas],
          opaqueCount,transparentCount,
          steamCount,steamOnly,goldCount,fallbackDifferent,colorVariants,invalidColor,restoredOriginal,
          mug:mug&&{off:!!mug.off,x:mug.x,y:mug.y,w:mug.w,h:mug.h},
          L:[L.VW,L.VH]
        };
      });
      const mode = viewport.width < 1100 ? 'Janela menor' : 'Desktop';
      ok(res.loaded && res.size[0]===40 && res.size[1]===40,mode+': PNG 40x40 carregado');
      ok(res.palette <= 32 && res.alphas.every(x=>x===0||x===255)
        && res.opaqueCount>500 && res.transparentCount>100,
        mode+': pixels nítidos, transparência binária e paleta reduzida');
      ok(res.steamCount>0 && res.steamOnly===0,
        mode+': vapor animado separadamente, sem alterar a caneca');
      ok(res.goldCount>0,mode+': emblema de carreira preservado');
      ok(Object.values(res.colorVariants).every(n=>n>50),mode+': seis cores futuras recolorem o sprite');
      ok(res.invalidColor === false && res.restoredOriginal === 0,
        mode+': cores invalidas rejeitadas e arte original restaurada sem diferencas');
      ok(res.fallbackDifferent,mode+': caneca original funciona como reserva');
      ok(res.mug && !res.mug.off && res.mug.w===40 && res.mug.h===40,
        mode+': caneca posicionada em slot correto, sem ser escondida');
      ok(errors.length===0,mode+': nenhum erro JS'+(errors.length?': '+errors.join('; '):''));
      await page.close();
    }
  } finally { await browser.close(); }
  console.log('[Caneca] '+passed+' aprovados, '+failed+' falhas');
  if (failed) process.exitCode = 1;
})().catch(e=>{console.error(e);process.exitCode=1;});
