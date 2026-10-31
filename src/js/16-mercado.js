/* ================= Mercado ================= */
const cartTotal = () => S.cart.reduce((a, id) => a + priceOf(id).price, 0);   // mesma regra de preço do catálogo
function canAdd(it) {
  if (it.kind === 'decor' && (P.decor.includes(it.id) || S.cart.includes(it.id))) return false;
  if (it.kind === 'day' && (S.today.has(it.id) || S.cart.includes(it.id))) return false;
  return true;
}
function basketSprite() {
  // cesta plástica: aro claro, trama vazada em dois tons, faixa com logo e fundo mais escuro
  const W = 26, rows = ['k'.repeat(W), 'k' + 'r'.repeat(W - 2) + 'k', 'k' + 'R'.repeat(W - 2) + 'k'];
  for (let i = 0; i < 4; i++) rows.push('k' + [...Array(W - 2)].map((_, j) => (j + (i % 2) * 2) % 4 === 1 ? '.' : (i % 2 ? 'R' : 'q')).join('') + 'k');
  rows.push('k' + 'RRRRRRRRRRrWWrRRRRRRRRRR'.slice(0, W - 2) + 'k');
  rows.push('.k' + 'q'.repeat(W - 4) + 'k.', '..' + 'k'.repeat(W - 4) + '..');
  const c = sprite(rows, 10, { ...PAL, r: '#ff9d86', R: '#ef4b3f', q: '#a8262a', W: '#fff8ec' });
  c.classList.add('bfront');
  return c;
}
// A cesta usa a maior escala inteira que cabe em 25% da altura e 38% da largura
function fitBasket(sc) {
  const b = sc.querySelector('.basket'), front = b.querySelector('.bfront'), dpr = window.devicePixelRatio || 1;
  const n = Math.max(1, Math.floor(Math.min(innerHeight * .25, innerWidth * .38) * dpr / 15)), k = n / dpr;
  b.style.width = 26 * k + 'px'; b.style.height = 15 * k + 'px';
  front.style.width = front.width * k + 'px'; front.style.height = front.height * k + 'px';
  sc.style.setProperty('--bh', 15 * k + 'px');
  if (!b._fit) { b._fit = true; addEventListener('resize', () => b.isConnected && fitBasket(sc)); }
}
function bagSprite() {
  const pal = { ...PAL, a: '#c7b595', A: '#8f7d63' };
  const c = sprite(['.kkkkkkkkkkkkkkkk.', '.kAaAaAaAaAaAaAak.', '.kaaaaaaaaaaaaaak.', '.kaaaaaaaaaaaaaAk.', '.kaaaaakkkkaaaaAk.',
    '.kaaaaakaakaaaaAk.', '.kaaaaakkkkaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.',
    '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kaaaaaaaaaaaaaAk.', '.kAAAAAAAAAAAAAAk.', '.kkkkkkkkkkkkkkkk.'], 5, pal);
  pxFit(c, () => innerWidth <= 760 ? [54, 999] : [c.width * 5, c.height * 5]);
  c.classList.add('bagfront');
  return c;
}

const MK_DESK = ['planta', 'foto', 'lamp', 'gato', 'trofeu', 'cacto', 'globo', 'livros', 'pato'], MK_PC = ['monitor', 'webcam', 'caixas', 'adesivos'];
const MK_CATS = { use: it => it.kind !== 'decor', desk: it => MK_DESK.includes(it.id), pc: it => MK_PC.includes(it.id), wall: it => it.kind === 'decor' && !MK_DESK.includes(it.id) && !MK_PC.includes(it.id) };
function market() {
  const u = U();
  S.cart = [];
  const sc = scene('sc-market sc-shop');
  sc.innerHTML = `<div class="mk-top"><h2>${u.store}</h2><span class="money">${u.wallet}: <b id="mw"></b></span><span class="money">${u.total}: <b id="mt"></b></span>
      <button class="pxbtn main" id="tocash">${u.toCheckout}</button><button class="pxbtn" id="mkhome">${u.skipHome}</button></div>
    <div class="mk-sign"></div><p class="hint mk-hint">${u.marketHint}</p>
    <div class="mk-tabs">${Object.keys(MK_CATS).map(k => `<button class="pxbtn mk-tab" data-c="${k}">${u.mkCats[k]}</button>`).join('')}</div>
    <div class="shelves px"><div class="shelf" data-r="0"></div><div class="shelf" data-r="1"></div><div class="shelf" data-r="2"></div></div>
    <div class="basket"><div class="bitems"></div></div>`;
  Stage.mount(sc, 'shop');
  sc.querySelector('.basket').append(basketSprite());
  // prateleiras por categoria: consumo, mesa, computador e parede (no máximo 4 itens por prateleira)
  const showCat = cat => {
    sc.querySelectorAll('.mk-tab').forEach(b => b.classList.toggle('on', b.dataset.c === cat));
    const items = SHOP.filter(MK_CATS[cat]), per = Math.max(1, Math.ceil(items.length / 3));
    sc.querySelectorAll('.shelf').forEach((shelf, i) => { shelf.replaceChildren(...items.slice(i * per, (i + 1) * per).map(it => shelfSlot(it, sc))); });
    sc.querySelectorAll('.slot canvas').forEach(pxRefit); sceneIn(sc, '.slot', 25, 0);
  };
  sc.querySelectorAll('.mk-tab').forEach(b => b.onclick = () => { sfx('click'); showCat(b.dataset.c); });
  showCat('use');
  sc.querySelector('#tocash').onclick = () => { if (S.cart.length) wipe(checkout); };
  sc.querySelector('#mkhome').onclick = () => { S.cart = []; sleep(); };
  updateCart(sc);
  fitBasket(sc);
  sc.querySelectorAll('.slot canvas').forEach(pxRefit);
  sceneIn(sc, '.mk-top, .mk-hint, .shelf', 60, 300);
  sceneIn(sc, '.slot', 25, 520);
}
function shelfSlot(it, sc) {
  const el = document.createElement('button');
  el.className = 'slot'; el.dataset.id = it.id; el.title = L.shop[it.id][1];
  const spr = sprite(SPR[it.spr], 5);
  // cabe na prateleira: até 62% da altura e a largura de uma vaga, sempre em escala inteira
  pxFit(spr, () => { const sh = el.parentElement; return sh ? [sh.clientWidth / Math.max(3, sh.children.length) * .8, sh.clientHeight * .62] : [80, 80]; });
  el.append(spr);
  el.insertAdjacentHTML('beforeend', `<span class="nm">${L.shop[it.id][0]}</span><span class="ds">${L.shop[it.id][1]}</span><span class="ptag">${priceTag(it.id)}</span>`);
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
    p.style.background = pick(['#ffffff', '#ffe7a3', '#f4c15d']);
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
    const inB = pxFit(sprite(SPR[it.spr], 5), () => [w, w * 2]);
    inB.classList.add('inbasket');
    inB.style.left = x + 'px'; inB.style.bottom = y + 'px';
    inB.onclick = () => { const k = S.cart.indexOf(it.id); if (k >= 0) S.cart.splice(k, 1); inB.remove(); updateCart(sc); sfx('click'); };
    bi.append(inB);
  };
}

