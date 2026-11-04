/* O tricolor continua livre em saves comuns. Outras pelagens exigem compra no Mercado.
   Somente a conta nomeada "Teste Gatos" libera todas as pelagens sem comprar.
   Esse save possui namespace proprio, sem afetar dinheiro, carreira ou itens de outros usuarios. */
Object.assign(LANGS.pt.ui, {
  catNeed: 'Compre um gato no Mercado para liberar outras pelagens.',
  catDemo: 'Tricolor liberado para testar na mesa. Compre um gato no Mercado para liberar os demais.',
  catTest: 'SAVE DE TESTE — Todas as pelagens liberadas apenas na conta Teste Gatos. As outras contas mantêm seus desbloqueios.'
});
Object.assign(LANGS.en.ui, {
  catNeed: 'Buy a cat at the Market to unlock other coats.',
  catDemo: 'Calico is free to try on the desk. Buy a cat at the Market to unlock the rest.',
  catTest: 'TEST SAVE — All coats are available only in the Teste Gatos account. Other accounts keep their own unlocks.'
});
Object.assign(LANGS.es.ui, {
  catNeed: 'Compra un gato en el Mercado para desbloquear otros pelajes.',
  catDemo: 'Tricolor gratis para probar en la mesa. Compra un gato en el Mercado para desbloquear los demás.',
  catTest: 'SAVE DE PRUEBA — Todos los pelajes están disponibles solo en la cuenta Teste Gatos. Las demás cuentas conservan sus desbloqueos.'
});
{ const originalShowCustomize=showCustomize;
  showCustomize=(...args)=>{
    const result=originalShowCustomize(...args);
    const testSave=catTestSave();
    if(testSave || !P.decor.includes('gato')) {
      document.querySelectorAll('.hw-card .walls.cats').forEach(grid=>{
        const row=grid.closest('.setting');
        if(!row)return;
        row.classList.remove('locked-row');
        grid.querySelectorAll('button.cat').forEach(button=>{
          const free=testSave || button.dataset.c==='tricolor';
          button.disabled=!free;
          button.classList.toggle('cat-locked',!free);
          button.classList.toggle('cat-free',free);
          button.title=testSave ? U().catTest : (free ? U().catDemo : U().catNeed);
        });
        let note=row.querySelector('.cat-need');
        if(!note) {
          note=document.createElement('small');
          note.className='cat-need';
          row.append(note);
        }
        note.textContent=testSave ? U().catTest : U().catDemo;
      });
    }
    if (window.WorkdayCatStatic) window.WorkdayCatStatic.refresh();
    return result;
  };
}
