/* ================= Mercado ================= */
const cartTotal = () => S.cart.reduce((a, id) => a + SHOP.find(i => i.id === id).price, 0);
function canAdd(it) {
  if (it.kind === 'decor' && (P.decor.includes(it.id) || S.cart.includes(it.id))) return false;
  if (it.kind === 'day' && (S.today.has(it.id) || S.cart.includes(it.id))) return false;
  return true;
}
function basketSprite() {
  const W = 26, rows = ['k'.repeat(W)];
  for (let i = 0; i < 6; i++) rows.push('k' + (i % 2 ? 'r'.repeat(W - 2) : [...Array(W - 2)].map((_, j) => j % 3 === 1 ? '.' : 'r').join('')) + 'k');
  rows.push('.k' + 'r'.repeat(W - 4) + 'k.', '..' + 'k'.repeat(W - 4) + '..');
  const c = sprite(rows, 10, { ...PAL, r: '#d94a3a' });
  c.classList.add('bfront');
  return c;
}
function bagSprite() {
  const pal = { ...PAL, a: '#d9b382', A: '#a87d4a' };
  const c = sprite(['.kkkkkkkkkkkkkkkk.', '.kAaAaAaAaAaAaAak.', '.kaaaaaaaaaaaaaak.', '.kaaaaaaaaaaaaaAk.', '.kaaaaakkkkaaaaAk.',
    '.kaaaaakaakaaaaAk.', '.kaaaaakkkkaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.',
    '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kAAAAAAAAAAAAAAk.', '.kkkkkkkkkkkkkkkk.'], 5, pal);
  c.classList.add('bagfront');
  return c;
}

function market() {
  const u = U();
  S.cart = [];
  const sc = scene('sc-market sc-shop');
  sc.innerHTML = `<div class="mk-top"><h2>${u.store}</h2><span class="money">${u.wallet}: <b id="mw"></b></span><span class="money">${u.total}: <b id="mt"></b></span>
      <button class="pxbtn main" id="tocash">${u.toCheckout}</button><button class="pxbtn" id="mkhome">${u.skipHome}</button></div>
    <div class="mk-sign"></div><p class="hint mk-hint">${u.marketHint}</p>
    <div class="shelves px"><div class="shelf" data-r="0"></div><div class="shelf" data-r="1"></div><div class="shelf" data-r="2"></div></div>
    <div class="basket"><div class="bitems"></div></div>`;
  Stage.mount(sc, 'shop');
  sc.querySelector('.basket').append(basketSprite());
  [SHOP.slice(0, 5), SHOP.slice(5, 8), SHOP.slice(8)].forEach((items, i) => {
    const shelf = sc.querySelector(`[data-r="${i}"]`);
    items.forEach(it => shelf.append(shelfSlot(it, sc)));
  });
  sc.querySelector('#tocash').onclick = () => { if (S.cart.length) wipe(checkout); };
  sc.querySelector('#mkhome').onclick = () => { S.cart = []; sleep(); };
  updateCart(sc);
  sceneIn(sc, '.mk-top, .mk-hint, .shelf', 60, 300);
  sceneIn(sc, '.slot', 25, 520);
}
function shelfSlot(it, sc) {
  const el = document.createElement('button');
  el.className = 'slot'; el.dataset.id = it.id; el.title = L.shop[it.id][1];
  const spr = sprite(SPR[it.spr], 5);
  el.append(spr);
  el.insertAdjacentHTML('beforeend', `<span class="nm">${L.shop[it.id][0]}</span><span class="ds">${L.shop[it.id][1]}</span><span class="ptag">${money(it.price)}</span>`);
  el.onclick = () => {
    if (!canAdd(it)) return;
    S.cart.push(it.id); sfx('pop');
    updateCart(sc);
    flyToBasket(spr, it, sc);
  };
  return el;
}
function updateCart(sc) {
  sc.querySelector('#mw').textContent = money(P.wallet);
  sc.querySelector('#mt').textContent = money(cartTotal());
  sc.querySelector('#mt').parentElement.classList.toggle('over', cartTotal() > P.wallet);
  sc.querySelector('#tocash').disabled = !S.cart.length;
  sc.querySelectorAll('.slot').forEach(s => s.classList.toggle('sold', !canAdd(SHOP.find(i => i.id === s.dataset.id))));
}
function burst(sc, cx, cy) {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('i');
    p.className = 'spark';
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    p.style.background = pick(['#ffffff', '#fff1a8', '#f2c14e']);
    sc.append(p);
    const a = i / 10 * Math.PI * 2, d = rand(26, 44);
    p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`, opacity: 0 }],
              { duration: 260, easing: 'steps(4)' }).onfinish = () => p.remove();
  }
}
// "Estoura" na prateleira e cai com gravidade dentro da cesta
function flyToBasket(spr, it, sc) {
  const from = spr.getBoundingClientRect(), basket = sc.querySelector('.basket'), bi = sc.querySelector('.bitems'), br = bi.getBoundingClientRect();
  burst(sc, from.left + from.width / 2, from.top + from.height / 2);
  const w = br.width * rand(0.22, 0.3), s = w / from.width, hS = from.height * s;
  const x = rand(0, br.width - w), y = rand(0, br.height * 0.1);
  const clone = sprite(SPR[it.spr], 5);
  clone.style.cssText += `;position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:10`;
  sc.append(clone);
  const tx = br.left + x - from.left - (from.width - w) / 2;
  const ty = br.bottom - y - from.top - from.height / 2 - hS / 2;
  clone.animate([
    { transform: 'translate(0,0) scale(1)', easing: 'cubic-bezier(.2,.9,.3,1)' },
    { transform: `translate(${tx * 0.06}px,-30px) scale(1.25)`, offset: 0.22, easing: 'cubic-bezier(.6,0,1,.6)' },
    { transform: `translate(${tx}px,${ty}px) scale(${s})` },
  ], { duration: 500, fill: 'forwards' }).onfinish = () => {
    clone.remove(); sfx('key');
    basket.animate([{ translate: '0 0' }, { translate: '0 6px' }, { translate: '0 0' }], { duration: 160, easing: 'steps(3)' });
    const inB = sprite(SPR[it.spr], 5);
    inB.classList.add('inbasket');
    inB.style.width = w + 'px'; inB.style.left = x + 'px'; inB.style.bottom = y + 'px';
    inB.onclick = () => { const k = S.cart.indexOf(it.id); if (k >= 0) S.cart.splice(k, 1); inB.remove(); updateCart(sc); sfx('click'); };
    bi.append(inB);
  };
}

