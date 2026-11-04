// Regressão dos dez gatos estáticos aprovados pelo criador.
// Uso: python tools/build.py && node tests/gatos-estaticos.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname,'..','dist','workday.html');
let passed=0,failed=0;
function ok(value,name){if(value){passed++;console.log('  ✓ '+name);}else{failed++;console.error('  ✗ '+name);}}
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(URL);
   await page.waitForFunction(()=>window.WorkdayCatStatic && CatStatic.loaded.size===10,{timeout:15000});
   const r=await page.evaluate(()=>{
     const ids=CAT_STATIC_IDS;
     const masks=ids.map(id=>{
       const c=document.createElement('canvas');c.width=40;c.height=60;
       const ctx=c.getContext('2d');ctx.drawImage(CatStatic.images[id],0,0);
       const p=ctx.getImageData(0,0,40,60).data;
       const col=(x,y)=>p[(y*40+x)*4+3];
       const center=col(20,34), corner=col(0,0);
       return{size:CatStatic.images[id].naturalWidth===40 && CatStatic.images[id].naturalHeight===60,corner,center,data:c.toDataURL()};
     });
     const body=CatStatic.sizes(2);
     const c=document.createElement('canvas');c.width=150;c.height=140;
     const ctx=c.getContext('2d');
     const state=CatAI.make();state.state='sleep';state.pet=0;
     catDraw(ctx,30,130,'tricolor',state,10,2);
     const first=c.toDataURL();
     ctx.clearRect(0,0,150,140);
     state.state='tail';state.pet=9;
     catDraw(ctx,30,130,'tricolor',state,999,2);
     const second=c.toDataURL();
     const still=catStill('branco',.85);
     const oldAlias=CatStatic.id('laranja-tigrado')==='laranja'
       && CatStatic.id('cinza')==='cinza-azul' && CatStatic.id('vaquinha')==='frajola';
     return{
       count:ids.length,ready:CatStatic.loaded.size,
       sizeOk:masks.every(m=>m.size),transparent:masks.every(m=>m.corner===0 && m.center===255),
       unique:new Set(masks.map(m=>m.data)).size,
       static: first===second,size:body,still:[still.width,still.height],oldAlias
     };
   });
   const mobile=viewport.width<600?'Mobile':'Desktop';
   ok(r.count===10&&r.ready===10,mobile+': dez PNGs integrados e carregados');
   ok(r.sizeOk&&r.transparent,mobile+': todos os sprites 40x60 têm fundo transparente');
   ok(r.unique===10,mobile+': dez artes diferentes preservadas');
   ok(r.static&&r.size[0]>=60&&r.size[1]>=90,mobile+': gato grande na mesa e sem animação');
   ok(r.still[0]>20&&r.still[1]>35&&r.oldAlias,mobile+': miniaturas e saves antigos compatíveis');
   await page.evaluate(()=>{
     document.getElementById('titlescr')?.remove();
     closeScene();ARRIVED=true;showMenu();showCustomize(showMenu);
   });
   await page.click('.hw-tab[data-t="desk"]');
   ok(await page.evaluate(()=>document.querySelectorAll('.hw-card .cat[data-c]').length===10),
       mobile+': dez pelagens no menu Personalizar > Mesa');
   ok(await page.evaluate(()=>!!document.querySelector('.cat-eyes-note') &&
       !document.querySelector('.hw-card [data-hw="catEye"]')),
       mobile+': olhos fixos documentados, sem controle enganoso');
   const demo=await page.evaluate(()=>{
     const c=document.querySelector('.hw-card .cat[data-c="tricolor"]'), other=document.querySelector('.hw-card .cat[data-c="preto-verde"]');
     const grid=document.querySelector('.hw-card .walls.cats');
     const a=c?.querySelector('.cimg')?.getBoundingClientRect(),label=c?.querySelector('small')?.getBoundingClientRect();
     return {free:!c?.disabled,othersLocked:other?.disabled,available:deskEffectiveDecor().includes('gato'),
       selected:hw().cat==='tricolor',notWashed:parseFloat(getComputedStyle(grid).opacity)>.95,
       noOverlap:!!a&&!!label&&label.top>=a.bottom-1,owned:P.decor.includes('gato')};
   });
   if(!demo.owned) {
     ok(demo.free&&demo.othersLocked&&demo.available&&demo.selected,
       mobile+': tricolor livre na mesa, demais pelagens exigem Mercado');
     ok(demo.notWashed&&demo.noOverlap,mobile+': miniaturas sem filtro global e nome abaixo do gato');
   }
   const selectable=await page.evaluate(()=>document.querySelector('.hw-card .cat[data-c="preto-verde"]')?.disabled===false);
   if(selectable){
     await page.click('.hw-card .cat[data-c="preto-verde"]');
     ok(await page.evaluate(()=>hw().cat==='preto-verde' &&
       !!document.querySelector('.hw-card .cat[data-c="preto-verde"].on')),
       mobile+': escolha de gato salvo e destacada');
   } else {
     ok(await page.evaluate(()=>document.querySelector('.hw-card .cat[data-c="preto-verde"]')?.disabled &&
       document.querySelector('.hw-card .cat-need')?.textContent.length>0),
       mobile+': personalização protegida até comprar o gato');
   }
   ok(errors.length===0,mobile+': nenhum erro Javascript'+(errors.length?': '+errors.join('; '):''));
   await page.close();
  }
 } finally{await browser.close();}
 console.log('[Gatos estáticos] '+passed+' aprovados, '+failed+' falhas');
 if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
