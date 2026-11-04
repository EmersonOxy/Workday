// Conta de laboratorio "Teste Gatos": separacao de saves, acesso aos 10 gatos e persistencia.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname,'..','dist','workday.html');
let passed=0,failed=0;
function check(value, label) {
  if(value) {passed++;console.log('  ✓ '+label);}
  else {failed++;console.error('  ✗ '+label);}
}
async function openCustomizer(page) {
  await page.evaluate(()=>{
    document.getElementById('titlescr')?.remove();
    closeScene();ARRIVED=true;showMenu();showCustomize(showMenu);
  });
  await page.click('.hw-tab[data-t="desk"]');
}
(async()=>{
  const browser=await chromium.launch();
  try {
    for(const viewport of [{width:1366,height:768},{width:390,height:844}]) {
      const label=viewport.width>600?'Desktop':'Mobile';
      const ctx=await browser.newContext({viewport});
      const page=await ctx.newPage(), errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(URL);
      // Simula o cadastro de duas contas distintas, sem depender de outras contas no navegador.
      await page.evaluate(()=>{
        localStorage.setItem('expediente-usuarios',JSON.stringify([
          {id:'principal',name:'Principal',ns:''},
          {id:'teste gatos',name:'Teste Gatos',ns:'u-gatos-teste'}
        ]));
        localStorage.setItem('expediente-usuario','teste gatos');
      });
      await page.reload();
      await page.waitForFunction(()=>window.WorkdayCatStatic && CatStatic.loaded.size===10);
      check(await page.evaluate(()=>catTestSave()&&WD_NS==='expediente-u-gatos-teste-' &&
        !P.decor.includes('gato')&&deskEffectiveDecor().includes('gato')),label+': laboratorio tem save isolado e gato na mesa');
      await openCustomizer(page);
      check(await page.evaluate(()=>document.querySelectorAll('.hw-card .cat[data-c]').length===10 &&
        [...document.querySelectorAll('.hw-card .cat[data-c]')].every(b=>!b.disabled) &&
        document.querySelector('.cat-need')?.textContent.includes('SAVE DE TESTE')),label+': dez pelagens disponiveis na personalizacao');
      await page.click('.hw-card .cat[data-c="preto-verde"]');
      check(await page.evaluate(()=>hw().cat==='preto-verde' &&
        deskEffectiveDecor().includes('gato') && !P.decor.includes('gato')),label+': pelagem selecionada sem conceder compra');
      // Trocar a conta ativa e recarregar deve restaurar o save normal sem desbloqueios extras.
      await page.evaluate(()=>localStorage.setItem('expediente-usuario','principal'));
      await page.reload();
      await page.waitForFunction(()=>window.WorkdayCatStatic && CatStatic.loaded.size===10);
      check(await page.evaluate(()=>!catTestSave() && WD_NS==='expediente-' &&
        !P.decor.includes('gato')&&hw().cat==='tricolor'),label+': save principal nao recebe as mudancas do laboratorio');
      await openCustomizer(page);
      check(await page.evaluate(()=>!!document.querySelector('.hw-card .cat[data-c="tricolor"]') &&
        !document.querySelector('.hw-card .cat[data-c="tricolor"]').disabled &&
        document.querySelector('.hw-card .cat[data-c="preto-verde"]').disabled),label+': bloqueios normais intactos');
      await page.evaluate(()=>localStorage.setItem('expediente-usuario','teste gatos'));
      await page.reload();
      check(await page.evaluate(()=>catTestSave() && hw().cat==='preto-verde' &&
        !P.decor.includes('gato')&&deskEffectiveDecor().includes('gato')),label+': escolha no laboratorio persiste separadamente');
      check(errors.length===0,label+': sem erros JavaScript'+(errors.length?': '+errors.join('; '):''));
      await ctx.close();
    }
  } finally { await browser.close(); }
  console.log('[Save teste gatos] '+passed+' aprovados, '+failed+' falhas');
  if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
