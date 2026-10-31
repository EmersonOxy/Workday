/* ================= Cenas ================= */
function scene(cls) {
  closeScene();
  const el = document.createElement('div');
  el.id = 'scene'; el.className = cls;
  document.body.append(el);
  return el;
}
function closeScene() { const s = $('scene'); if (s) s.remove(); }
function pixelCover(parent, cb) {
  const g = document.createElement('div');
  g.className = 'pxcover';
  const size = 48, cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
  g.style.gridTemplateColumns = `repeat(${cols}, 1fr)`; g.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < cols * rows; i++) { const c = document.createElement('i'); c.style.animationDelay = rand(0, 0.6) + 's'; g.append(c); }
  parent.append(g);
  setTimeout(cb, 850);
}
// Transição entre cenas: pontilhado ordenado (Bayer 4×4) em blocos de pixel de arte, varrendo da esquerda
// para a direita em degraus. Cobre a tela, troca a cena por baixo e revela no mesmo sentido.
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function wipe(swap, { rgb = [42, 31, 45], dur = 360, hold = 90 } = {}) {
  if (wipe.busy) return;
  wipe.busy = true;
  const M = Stage.measure(innerWidth, innerHeight), B = 3, cw = Math.ceil(M.VW / B), ch = Math.ceil(M.VH / B);
  const c = document.createElement('canvas');
  c.className = 'wipe'; c.width = cw; c.height = ch;
  c.style.width = cw * B * M.k + 'px'; c.style.height = ch * B * M.k + 'px';
  document.body.append(c);
  const x = c.getContext('2d'), img = x.createImageData(cw, ch), px = new Uint32Array(img.data.buffer);
  const ink = (255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0];
  const paint = (p, back) => {
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const g = i / cw, th = (BAYER4[(i & 3) + ((j & 3) << 2)] + .5) / 16 * .5 + (back ? 1 - g : g) * .5;
      px[j * cw + i] = (back ? p >= th : p > th) ? ink : 0;
    }
    x.putImageData(img, 0, 0);
  };
  const run = (back, done) => {
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), q = Math.ceil(k * 12) / 12;      // 12 degraus
      paint(back ? 1 - q : q * 1.02, back);
      if (k < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  };
  const finish = () => { c.remove(); wipe.busy = false; };
  if (Motion.reduced.matches) { paint(2); swap(); c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).onfinish = finish; return; }
  run(false, () => { try { swap(); } finally { setTimeout(() => run(true, finish), hold); } });
}
// Entrada escalonada dos objetos de uma cena: caem, achatam no lugar e acomodam
function sceneIn(sc, sel, gap = 45, delay = 260) {
  [...sc.querySelectorAll(sel)].forEach((el, i) => Motion.play(el, [
    { translate: '0 -14px', scale: '.94 1.08', opacity: 0 }, { translate: '0 2px', scale: '1.06 .9', opacity: 1, offset: .6 }, { translate: '0 0', scale: '1 1', opacity: 1 },
  ], { duration: Motion.T.long, delay: delay + i * gap, easing: Motion.E.out, fill: 'backwards' }));
}
// O eletroduto do corredor termina no topo do relógio de ponto: mede o aparelho no HTML e avisa o cenário
function hallAttach(st, dev) {
  const fit = () => { if (!dev.isConnected) return; const r = dev.getBoundingClientRect(); Stage.set(st, { devTop: Math.round(r.top / st.M.k) }); };
  requestAnimationFrame(fit); setTimeout(fit, 700); setTimeout(fit, 1950); dev.addEventListener('animationend', fit); addEventListener('resize', fit);   // inclui o fim do deslize de entrada
  return fit;
}
function sceneMsg(sc, text) {
  const old = sc.querySelector('.msg'); if (old) old.remove();
  const m = document.createElement('div');
  m.className = 'msg px'; m.textContent = text;
  sc.append(m);
  setTimeout(() => m.remove(), 1300);
}

