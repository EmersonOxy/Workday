/* Regressão dos minigames do Workday, incluindo modos sem aposta do Arcade V4.
   Uso: python tools/build.py && node tests/arcade-new.js */
const { chromium } = require('playwright');
const path = require('path');
const assert = require('node:assert/strict');
const url = 'file://' + path.resolve(__dirname,'..','dist','workday.html');
(async()=>{
  const browser=await chromium.launch();
  try {
    for(const viewport of [{width:1366,height:768},{width:390,height:844}]) {
      const page=await browser.newPage({viewport});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);
      const registered=await page.evaluate(()=>({
        games:MINIGAMES.slice(),
        locale:['pt','en','es'].every(lang=>['mgPacman','mgPenalty','mgSnake','mgLocal'].every(key=>!!LANGS[lang].ui[key]))
      }));
      assert.deepEqual(registered.games,['rhythm','shooter','pacman','penalty','snake','cups','painting','dance','darts']);
      assert.ok(registered.locale,'traduções PT/EN/ES');
      for(const kind of ['pacman','penalty','snake']) {
        await page.evaluate(kind=>{
          const h=document.createElement('div');h.className='mg-host';h.id='arcade-smoke';
          h.style.cssText='position:fixed;left:1em;top:1em;width:min(440px,95vw);height:75vh;z-index:999;background:#2b2340';
          document.body.append(h);
          window.arcadeSmokeResult=null;
          runMinigame(kind,h,result=>{window.arcadeSmokeResult=result;});
        },kind);
        await page.waitForTimeout(220);
        const state=await page.evaluate(kind=>{
          const h=document.getElementById('arcade-smoke');
          return { canvas:!!h.querySelector('canvas[width="128"][height="160"]'),
            custom:!!h[kind==='pacman'?'_pacman':kind==='penalty'?'_penalty':'_snakeDuel'],
            title:h.querySelector('.mg-head b')?.textContent||'',
            quit:typeof h._quit==='function' };
        },kind);
        assert.ok(state.canvas&&state.custom&&state.title&&state.quit,kind+' iniciou corretamente');
        if(kind==='penalty'){
          const sent=await page.evaluate(()=>document.getElementById('arcade-smoke')._penalty.launch(60,.7));
          assert.equal(sent,true,'pênalti permite chutar');
          await page.waitForTimeout(900);
          const shots=await page.evaluate(()=>document.getElementById('arcade-smoke')._penalty.shots);
          assert.equal(shots,1,'a primeira cobrança foi contabilizada');
        } else if(kind==='snake') {
          const body0=await page.evaluate(()=>document.getElementById('arcade-smoke')._snakeDuel.player.body.map(c=>c.join(',')).join('|'));
          await page.waitForTimeout(360);
          const body1=await page.evaluate(()=>document.getElementById('arcade-smoke')._snakeDuel.player.body.map(c=>c.join(',')).join('|'));
          assert.notEqual(body0,body1,'Snake se move em tempo real');
        } else {
          const state=await page.evaluate(()=>document.getElementById('arcade-smoke')._pacman);
          assert.ok(state.items instanceof Object,'colecionáveis foram criados');
        }
        await page.evaluate(()=>document.getElementById('arcade-smoke')._quit());
        const result=await page.evaluate(()=>window.arcadeSmokeResult);
        assert.ok(result?.quit,'Escape/quit seguro em '+kind);
        await page.evaluate(()=>document.getElementById('arcade-smoke').remove());
      }
      assert.deepEqual(errors,[],'sem erros JavaScript no viewport '+viewport.width);
      console.log('[Arcade] '+viewport.width+'px: 3 jogos e idiomas aprovados');
      await page.close();
    }
  } finally {await browser.close();}
  console.log('[Arcade] OK');
})().then(()=>{
  // Rodar também as regressões do V4 após o conjunto anterior, no mesmo job de CI.
  const cp=require('node:child_process');
  const result=cp.spawnSync(process.execPath,[require('node:path').resolve(__dirname,'arcade-v4.js')],{stdio:'inherit',timeout:120000});
  if(result.error)throw result.error;
  if(result.status!==0)process.exitCode=1;
}).catch(e=>{console.error(e);process.exitCode=1;});
