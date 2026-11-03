/* Exporta os wallpapers originais do WorkOS como PNG nativo e ampliado.
   Esta rotina NÃO inclui os oito PNGs novos: serve para arquivar os 20 originais.
   Uso: python tools/build.py && node tools/export-workos-originais.js
*/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const url = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
    await page.goto(url);
    await page.waitForFunction(() => typeof WALLS !== 'undefined' && typeof wallCanvas === 'function');
    const data = await page.evaluate(() => Object.keys(WALLS).map(id => {
      const native = wallCanvas(id, 160, 90);
      if (!WALLS[id]) {
        const c = native.getContext('2d');
        c.fillStyle = WD_PAL.X;
        c.fillRect(0, 0, native.width, native.height);
      }
      const large = document.createElement('canvas');
      large.width = 640; large.height = 360;
      const x = large.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(native, 0, 0, 640, 360);
      return { id, native: native.toDataURL('image/png').split(',')[1], large: large.toDataURL('image/png').split(',')[1] };
    }));
    const dir = path.resolve(__dirname, '..', 'dist', 'workos-originais');
    fs.mkdirSync(path.join(dir, 'nativo-160x90'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'ampliado-640x360'), { recursive: true });
    for (const item of data) {
      fs.writeFileSync(path.join(dir, 'nativo-160x90', item.id + '.png'), Buffer.from(item.native, 'base64'));
      fs.writeFileSync(path.join(dir, 'ampliado-640x360', item.id + '.png'), Buffer.from(item.large, 'base64'));
    }
    const note = [
      'Workday / WorkOS — papéis de parede originais',
      '',
      data.length + ' wallpapers existentes antes da nova coleção, gerados pelas funções WALLS em src/js/30-personalizar.js.',
      'nativo-160x90: pixels originais, exatamente como o jogo os desenha.',
      'ampliado-640x360: os mesmos pixels ampliados em 4× com nearest-neighbor, sem suavização.',
      '',
      'teal: o tema de cor simples (sem desenho) é exportado como preenchimento sólido.',
      '',
      'IDs:',
      ...data.map(d => ' - ' + d.id)
    ].join('\n');
    fs.writeFileSync(path.join(dir, 'LEIA-ME.txt'), note + '\n');
    console.log('[WorkOS] Exportados ' + data.length + ' wallpapers antigos em duas resoluções para ' + dir);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
