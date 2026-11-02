/* ================= Personalização: gato travado até a compra ================= */
Object.assign(LANGS.pt.ui, { catNeed: 'Compre um gato no Mercado para personalizá-lo.' });
Object.assign(LANGS.en.ui, { catNeed: 'Buy a cat at the Market to customize it.' });
Object.assign(LANGS.es.ui, { catNeed: 'Compra un gato en el Mercado para personalizarlo.' });
{ const sc0 = showCustomize; showCustomize = (...a) => { const r = sc0(...a); if (!P.decor.includes('gato')) {
    document.querySelectorAll('.hw-card .walls.cats, .hw-card [data-hw=catEye]').forEach(w => { const row = w.closest('.setting'); row.classList.add('locked-row');
      w.querySelectorAll('button').forEach(b => { b.disabled = true; b.title = U().catNeed; });
      if (!row.querySelector('.cat-need')) row.insertAdjacentHTML('beforeend', `<small class="cat-need">${U().catNeed}</small>`); }); }
  return r; }; }
