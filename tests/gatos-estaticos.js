// Regressão dos dez gatos nativos 80x120 aprovados pelo criador.
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
       const img=CatStatic.images[id],w=img.naturalWidth,h=img.naturalHeight;
       const c=document.createElement('canvas');c.width=w;c.height=h;
       const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
       const p=ctx.getImageData(0,0,w,h).data;
       const col=(x,y)=>p[(y*w+x)*4+3];
       const center=col(Math.floor(w/2),Math.round(h*.57)),corner=col(0,0);
       return{size:w===80&&h===120,corner,center,data:c.toDataURL()};
     });
     const body=CatStatic.sizes(2);
     // Todos os gatos: 80x120 nativos na mesa, em escala 1:1.
     // Validar todos os canais, mesmo quando suavizacao foi ativada.
     const pixelPerfect=ids.every(id=>{
       const img=CatStatic.images[id],w=img.naturalWidth,h=img.naturalHeight;
       const sx=80/w,sy=120/h;
       if(!Number.isInteger(sx)||sx!==sy)return false;
       const src=document.createElement('canvas');src.width=w;src.height=h;
       const sc=src.getContext('2d');sc.drawImage(img,0,0);
       const raw=sc.getImageData(0,0,w,h).data;
       const dest=document.createElement('canvas');dest.width=80;dest.height=120;
       const dc=dest.getContext('2d');dc.imageSmoothingEnabled=true;
       CatStatic.draw(dc,0,120,id,2);
       const painted=dc.getImageData(0,0,80,120).data;
       for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let yy=0;yy<sy;yy++)for(let xx=0;xx<sx;xx++){
         const a=(y*w+x)*4,b=((y*sy+yy)*80+(x*sx+xx))*4;
         for(let ch=0;ch<4;ch++)if(raw[a+ch]!==painted[b+ch])return false;
       }
       return true;
     });
     // A inversao horizontal da arrumacao deve manter o grid.
     const mirror=document.createElement('canvas');mirror.width=80;mirror.height=120;
     const mc=mirror.getContext('2d');mc.translate(80,0);mc.scale(-1,1);
     CatStatic.draw(mc,0,120,'tricolor',2);
     const mirrored=mc.getImageData(0,0,80,120).data;
     const original=document.createElement('canvas');original.width=80;original.height=120;
     CatStatic.draw(original.getContext('2d'),0,120,'tricolor',2);
     const normal=original.getContext('2d').getImageData(0,0,80,120).data;
     let mirrorMatches=true;
     for(let y=0;y<120&&mirrorMatches;y++)for(let x=0;x<80&&mirrorMatches;x++){
       const a=(y*80+x)*4,b=(y*80+(79-x))*4;
       for(let ch=0;ch<4;ch++)if(normal[a+ch]!==mirrored[b+ch]){mirrorMatches=false;break;}
     }
     const q=Office.deskSlots(Office.layout(640,360),['gato']).gato;
     const deskFit=!!q&&!q.off&&q.w>=80&&q.h===120&&
       Math.round(q.x+(q.w-80)/2)+80<=640&&q.y-q.h>=0;
     const previewFits=CatStatic.sizes(1.12)[0]<=56&&CatStatic.sizes(1.12)[1]<=72;
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
       static: first===second,size:body,still:[still.width,still.height],oldAlias,pixelPerfect,mirrorMatches,deskFit,previewFits
     };
   });
   const mobile=viewport.width<600?'Mobile':'Desktop';
   ok(r.count===10&&r.ready===10,mobile+': dez PNGs integrados e carregados');
   ok(r.sizeOk&&r.transparent,mobile+': dez gatos nativos 80x120 transparentes');
   ok(r.unique===10,mobile+': dez artes diferentes preservadas');
   ok(r.static&&r.size[0]===80&&r.size[1]===120,mobile+': gato 80x120 sem animacao');
   ok(r.pixelPerfect,mobile+': dez gatos nativos sem reamostragem ou distorcao');
   ok(r.mirrorMatches,mobile+': espelhamento sem distorcer os pixels');
   ok(r.deskFit,mobile+': espaço na mesa e hitbox ajustados');
   ok(r.previewFits,mobile+': previsualizacao respeita o quadro');
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
