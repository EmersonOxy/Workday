/* Gato tricolor de demonstração: liberado na mesa e no menu de personalização.
   A compra do gato no Mercado continua liberando as demais pelagens. */
Object.assign(LANGS.pt.ui, { catNeed: 'Compre um gato no Mercado para liberar outras pelagens.', catDemo: 'Tricolor liberado para testar na mesa. Compre um gato no Mercado para liberar os demais.' });
Object.assign(LANGS.en.ui, { catNeed: 'Buy a cat at the Market to unlock other coats.', catDemo: 'Calico is free to try on the desk. Buy a cat at the Market to unlock the rest.' });
Object.assign(LANGS.es.ui, { catNeed: 'Compra un gato en el Mercado para desbloquear otros pelajes.', catDemo: 'Tricolor gratis para probar en la mesa. Compra un gato en el Mercado para desbloquear los demás.' });
{ const originalShowCustomize=showCustomize;
  showCustomize=(...args)=>{
    const result=originalShowCustomize(...args);
    if(!P.decor.includes('gato')) {
      document.querySelectorAll('.hw-card .walls.cats').forEach(grid=>{
        const row=grid.closest('.setting');
        row.classList.remove('locked-row');
        grid.querySelectorAll('button.cat').forEach(button=>{
          const free=button.dataset.c==='tricolor';
          button.disabled=!free;
          button.classList.toggle('cat-locked',!free);
          button.classList.toggle('cat-free',free);
          button.title=free ? U().catDemo : U().catNeed;
        });
        if(!row.querySelector('.cat-need')){
          const note=document.createElement('small');
          note.className='cat-need';note.textContent=U().catDemo;
          row.append(note);
        }
      });
    }
    return result;
  };
}