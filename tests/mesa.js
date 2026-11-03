// Nogueira escura: tile opaco, mesa preservada, selecao persistente e compatibilidade offline.
// Uso: python tools/build.py && node tests/mesa.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let passed = 0, failed = 0;
const ok = (value, label) => { if (value) { passed++; console.log('  ✓ ' + label); } else { failed++; console.error('  ✗ ' + label); } };
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:1366,height:768},locale:'pt-BR'});
    const errors = []; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(URL);
    await page.waitForFunction(()=>typeof DeskMaterial !== 'undefined' && DeskMaterial.ready,{timeout:15000});
    const tex = await page.evaluate(()=>{
      const im=DeskMaterial.image,c=document.createElement('canvas');c.width=128;c.height=128;
      const x=c.getContext('2d');x.drawImage(im,0,0);
      const d=x.getImageData(0,0,128,128).data;
      const pix=(px,py)=>[...d.slice((py*128+px)*4,(py*128+px)*4+4)].join(',');
      let hor=true,vert=true,opaque=true;const colors=new Set();
      for(let i=0;i<128;i++){hor&&=pix(0,i)===pix(127,i);vert&&=pix(i,0)===pix(i,127);}
      for(let j=0;j<d.length;j+=4){colors.add(d.slice(j,j+3).join(','));opaque&&=d[j+3]===255;}
      return{w:im.naturalWidth,h:im.naturalHeight,hor,vert,opaque,colors:colors.size,
        desk:hw().deskMaterial,wall:hw().roomWall,wallOS:hw().wall,slotCfg:JSON.stringify(CFG.desk || {})};
    });
    ok(tex.w===128&&tex.h===128&&tex.hor&&tex.vert&&tex.opaque&&tex.colors<=8,
      'textura PNG 128x128, paleta reduzida, opaca e seamless');
    ok(tex.desk==='original','saves sem deskMaterial preservam madeira original');
    const renders=await page.evaluate(()=>{
      const L=OFFICE.L,st=officeState(),a=Office.bake(L,st),old=a.getContext('2d');
      const dataA=old.getImageData(0,L.back,L.VW,L.VH-L.back).data;
      const p=()=>{const z=old.getImageData(L.mon.x+2,L.mon.y+2,1,1).data;return [...z].join(',');};
      const monitorBefore=p();
      setHw({deskMaterial:'walnut'});
      const b=Office.bake(L,officeState()),ctx=b.getContext('2d');
      const dataB=ctx.getImageData(0,L.back,L.VW,L.VH-L.back).data;
      let changed=0;for(let i=0;i<dataA.length;i+=4)
        if(dataA[i]!==dataB[i]||dataA[i+1]!==dataB[i+1]||dataA[i+2]!==dataB[i+2])changed++;
      const monitorAfter=[...ctx.getImageData(L.mon.x+2,L.mon.y+2,1,1).data].join(',');
      return{changed,monitorUnchanged:monitorBefore===monitorAfter,selected:hw().deskMaterial,
        wall:hw().roomWall,wallOS:hw().wall,slotCfg:JSON.stringify(CFG.desk || {})};
    });
    ok(renders.changed>500&&renders.selected==='walnut','Nogueira muda o tampo sem deixar os objetos vazios');
    ok(renders.monitorUnchanged&&renders.wall===tex.wall&&renders.wallOS===tex.wallOS,
      'monitor e wallpapers permanecem independentes');
    ok(renders.slotCfg===tex.slotCfg,'posicionamento dos objetos nao e alterado');
    await page.evaluate(()=>{const title=document.getElementById('titlescr');if(title)title.remove();closeScene();ARRIVED=true;showMenu();showCustomize(showMenu);});
    await page.click('.hw-tab[data-t="desk"]');
    ok(await page.evaluate(()=>document.querySelectorAll('.desk-material-opt').length===2
      && !document.querySelector('.desk-material-opt').hidden),
      'duas opcoes de material exibidas na aba Mesa');
    ok(await page.evaluate(() => {
      const opts = document.querySelector('.hw-opts');
      const firstVisible = [...opts.querySelectorAll(':scope > .setting')]
        .find(row => getComputedStyle(row).display !== 'none');
      const materialRow = document.querySelector('.desk-material-opt')?.closest('.setting');
      return firstVisible === materialRow && materialRow?.dataset.cat === 'desk'
        && materialRow.getBoundingClientRect().top >= opts.getBoundingClientRect().top - 5;
    }), 'material da mesa aparece como primeira opcao da aba, sem rolar 12 paredes');
    await page.click('.desk-material-opt[data-desk-material="original"]');
    await page.click('.desk-material-opt[data-desk-material="walnut"]');
    const saved=await page.evaluate(()=>({
      value:hw().deskMaterial,
      storage:JSON.parse(localStorage.getItem('expediente-config')||'{}').hw?.deskMaterial,
      active:document.querySelector('.desk-material-opt[data-desk-material="walnut"]').classList.contains('on'),
      roomWall:hw().roomWall
    }));
    ok(saved.value==='walnut'&&saved.storage==='walnut'&&saved.active,'selecao Nogueira salva e realcada');
    ok(saved.roomWall===tex.wall,'escolha da mesa nao modifica a parede');
    await page.reload();
    await page.waitForFunction(()=>DeskMaterial.ready);
    ok(await page.evaluate(()=>hw().deskMaterial==='walnut'),'selecao persiste apos recarregar');
    ok(await page.evaluate(()=>['pt','en','es'].every(k=>DESK_MATERIAL_LABELS[k].walnut)),
      'descricao da mesa em PT, EN e ES');
    ok(errors.length===0,'sem erros JavaScript'+(errors.length?': '+errors.join('; '):''));
    await page.close();
  } finally { await browser.close(); }
  console.log('[Mesa] '+passed+' testes aprovados, '+failed+' falhas');
  if(failed) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
