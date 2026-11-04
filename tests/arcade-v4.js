/* Arcade V4: integração, apostas, arte, dança e dardos em desktop/mobile. */
const {chromium}=require('playwright');
const path=require('path');
const assert=require('node:assert/strict');
const url='file://'+path.resolve(__dirname,'..','dist','workday.html');
(async()=>{
  const browser=await chromium.launch();
  try{
    for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
      const page=await browser.newPage({viewport});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url);
      const n=await page.evaluate(()=>{
        P.wallet=120;persist();
        const names=['cups','painting','dance','darts'];
        return {games:MINIGAMES.slice(),locales:['pt','en','es'].every(l=>names.every(k=>!!LANGS[l].ui[{cups:'mgCups',painting:'mgPainting',dance:'mgDance',darts:'mgDarts'}[k]]))};
      });
      assert.equal(n.games.length,9,'9 jogos registrados');
      assert.ok(n.locales,'4 jogos traduzidos');
      const start=async kind=>page.evaluate(kind=>{
        const h=document.createElement('div');h.className='mg-host';h.id='arc-v4';
        h.style.cssText='position:fixed;inset:5px;z-index:900;background:#2b2340;max-height:98vh;overflow:auto';
        document.body.append(h);
        window.arcV4Result=null;
        runMinigame(kind,h,r=>window.arcV4Result=r);
      },kind);
      const quit=async()=>{
        await page.evaluate(()=>{
          const h=document.getElementById('arc-v4');h._quit();
          if(!window.arcV4Result?.quit)throw Error('quit não retornou');
          h.remove();
        });
      };
      await start('cups');
      const pre=await page.evaluate(()=>{
        const h=document.getElementById('arc-v4');
        const v=h.querySelector('.mg-wager input');
        v.value='20';h.querySelector('.mg-wager button').click();
        return {wallet:P.wallet,stake:h._cups.stake,phase:h._cups.phase};
      });
      assert.equal(pre.wallet,100,'aposta é debitada imediatamente');
      assert.equal(pre.stake,20);
      assert.equal(pre.phase,'show');
      await page.waitForTimeout(1330);
      assert.ok(await page.evaluate(()=>!document.querySelector('#arc-v4 .mg-msg')),'aviso Prepare-se/Watch não persiste na tela');
      await quit();
      assert.equal(await page.evaluate(()=>P.wallet),100,'abandonar não duplica dinheiro');
      await start('painting');
      const paint=await page.evaluate(()=>{
        const h=document.getElementById('arc-v4'),p=h._painting;
        for(let i=0;i<ARTWORKS.length;i++){
          p.select(i);
          for(let j=0;j<ARTWORKS[i].shapes.length;j++)p.fill(j,3);
        }
        return {done:Object.keys(p.state.done).length,achievement:!!QST.ach.gallery,wallet:P.wallet};
      });
      assert.equal(paint.done,8,'oito obras coloridas progressivamente');
      assert.ok(paint.achievement,'conquista de todas as obras registrada');
      assert.equal(paint.wallet,100,'pintura não altera a carteira');
      await quit();
      await start('dance');
      const dance=await page.evaluate(()=>{
        const g=document.getElementById('arc-v4')._dance;
        const initial=g.lives;g.hit(0);
        return {initial,lives:g.lives};
      });
      assert.equal(dance.lives,dance.initial-1,'errar uma seta custa uma vida');
      await quit();
      await start('darts');
      const stake=await page.evaluate(()=>{
        const h=document.getElementById('arc-v4');
        h.querySelector('.mg-wager input').value='0';
        h.querySelector('.mg-wager button').click();
        h._darts.press();
        return {wallet:P.wallet,phase:h._darts.phase};
      });
      assert.equal(stake.wallet,100,'treino de dardos sem aposta');
      assert.equal(stake.phase,'aim');
      await page.waitForTimeout(350);
      await page.evaluate(()=>document.getElementById('arc-v4')._darts.release());
      await page.waitForTimeout(780);
      assert.equal(await page.evaluate(()=>document.getElementById('arc-v4')._darts.shots),1,'força medida e dardo arremessado');
      await quit();
      assert.deepEqual(errors,[],'sem erros JS em '+viewport.width);
      console.log('Arcade V4 OK '+viewport.width+'px');
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
