/* ================= Personalização do computador ================= */
// Aparência física do equipamento na mesa (independente do tema claro/escuro da interface) e papel de parede do WorkOS.
// Salvo em CFG.hw (localStorage "expediente-config"); saves antigos sem essa chave usam o padrão.
const HW_DEFAULT = { mon: 'cream', kb: 'cream', mouse: 'cream', wall: 'teal' };
function hw() { return Object.assign({}, HW_DEFAULT, CFG.hw || {}); }
function setHw(patch) { CFG.hw = Object.assign(hw(), patch); persist(); OFFICE.key = ''; applyWallpaper(); }

// Papéis de parede desenhados em baixa resolução com a paleta e ampliados por escala inteira
const WALLS = {
  teal: null,
  grid(x, w, h) { const P = WD_PAL; x.fillStyle = P.X; x.fillRect(0, 0, w, h); x.fillStyle = P.x; for (let j = 0; j < h; j += 8) for (let i = (j / 8 % 2) * 8; i < w; i += 16) x.fillRect(i, j, 8, 8); },
  hills(x, w, h) { const P = WD_PAL, R = Office.rng(3);
    const sky = [P.v, P.a]; for (let j = 0; j < h * .6; j++) for (let i = 0; i < w; i++) { x.fillStyle = (j / (h * .6)) * 4 > [0, 2, 3, 1][(i % 2) + (j % 2) * 2] + .5 ? sky[1] : sky[0]; x.fillRect(i, j, 1, 1); }
    x.fillStyle = P.W; for (let n = 0; n < 4; n++) { const cx = R() * w | 0, cy = 6 + R() * h * .25 | 0; x.fillRect(cx, cy, 14, 3); x.fillRect(cx + 3, cy - 2, 8, 2); }
    const hill = (base, amp, col, ph) => { x.fillStyle = col; for (let i = 0; i < w; i++) { const y = base + Math.round(Math.sin(i / 17 + ph) * amp + Math.sin(i / 7 + ph * 2) * amp * .3); x.fillRect(i, y, 1, h - y); } };
    hill(h * .55, 5, P.G, 1); hill(h * .68, 4, P.h, 3); hill(h * .82, 3, P.H, 5); },
  night(x, w, h) { const P = WD_PAL, R = Office.rng(9);
    x.fillStyle = P[0]; x.fillRect(0, 0, w, h); x.fillStyle = P.N; x.fillRect(0, h * .55, w, h);
    for (let n = 0; n < w * h / 60; n++) { x.fillStyle = R() < .8 ? P.W : P.y; x.fillRect(R() * w | 0, R() * h * .55 | 0, 1, 1); }
    const mx = w * .78 | 0, my = h * .2 | 0; for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) if (i * i + j * j <= 36 && (i + 3) ** 2 + (j - 2) ** 2 > 22) { x.fillStyle = P.y; x.fillRect(mx + i, my + j, 1, 1); }
    let bx = 0; while (bx < w) { const bw = 6 + R() * 12 | 0, bh = 8 + R() * h * .35 | 0; x.fillStyle = P.n; x.fillRect(bx, h - bh, bw, bh);
      x.fillStyle = P.Y; for (let j = h - bh + 2; j < h - 2; j += 3) for (let i = bx + 1; i < bx + bw - 1; i += 2) if (R() < .3) x.fillRect(i, j, 1, 1); bx += bw + 1; } },
};
function wallCanvas(name, w = 160, h = 90) { const c = document.createElement('canvas'); c.width = w; c.height = h; if (WALLS[name]) WALLS[name](c.getContext('2d'), w, h); return c; }
function applyWallpaper() {
  const d = $('osdesk'), name = hw().wall, root = document.documentElement;
  if (!d) return;
  if (!WALLS[name]) { d.style.backgroundImage = ''; root.style.removeProperty('--wall'); return; }
  const a = $('app').getBoundingClientRect(), r = d.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const W = Math.max(r.width, a.width), H = Math.max(r.height, a.height);
  const n = Math.max(1, Math.ceil(Math.max(W / 160, H / 90) * dpr)), k = n / dpr;   // cobre a tela em escala inteira
  const url = `url(${wallCanvas(name).toDataURL()})`, size = `${160 * k}px ${90 * k}px`;
  d.style.backgroundImage = url; d.style.backgroundSize = size; d.style.backgroundPosition = 'center'; d.style.imageRendering = 'pixelated';
  root.style.setProperty('--wall', url); root.style.setProperty('--wallsz', size);
}
addEventListener('resize', applyWallpaper);

function showCustomize(back) {
  const u = U(), cur = hw();
  const seg = (key, opts) => `<div class="seg" data-hw="${key}">${opts.map(o => `<button class="pxbtn${cur[key] === o ? ' on' : ''}" data-v="${o}">${u[o]}</button>`).join('')}</div>`;
  const card = modal(`<h2>${u.hwTitle}</h2><p class="hint">${u.hwNote}</p>
    <div class="hw-prev"><canvas class="hw-scene" width="120" height="44"></canvas></div>
    <div class="setting"><span>${u.allLabel}</span><div class="seg" data-hw="all"><button class="pxbtn" data-v="cream">${u.cream}</button><button class="pxbtn" data-v="graphite">${u.graphite}</button></div></div>
    <div class="setting"><span>${u.monitorLabel}</span>${seg('mon', ['cream', 'graphite'])}</div>
    <div class="setting"><span>${u.keyboardLabel}</span>${seg('kb', ['cream', 'graphite'])}</div>
    <div class="setting"><span>${u.mouseLabel}</span>${seg('mouse', ['cream', 'graphite'])}</div>
    <div class="setting"><span>${u.wallLabel}</span><div class="walls">${Object.keys(WALLS).map(w => `<button class="pxbtn wall${cur.wall === w ? ' on' : ''}" data-w="${w}"><canvas width="160" height="90"></canvas><small>${u.walls[w]}</small></button>`).join('')}</div></div>
    <div class="actions"><button class="pxbtn main" id="hwOk">${u.resume}</button></div>`);
  card.classList.add('hw-card');
  const prev = card.querySelector('.hw-scene');
  const draw = () => {
    const h = hw();
    card.querySelectorAll('.seg[data-hw]').forEach(s => { const k = s.dataset.hw; s.querySelectorAll('button').forEach(b => b.classList.toggle('on', k === 'all' ? ['mon', 'kb', 'mouse'].every(q => h[q] === b.dataset.v) : h[k] === b.dataset.v)); });
    card.querySelectorAll('.wall').forEach(b => b.classList.toggle('on', b.dataset.w === h.wall));
    Office.hwPreview(prev, h);
  };
  pxFit(prev, () => [Math.min(360, innerWidth * .7), 140]);
  card.querySelectorAll('.wall').forEach(b => { const c = b.querySelector('canvas'); if (WALLS[b.dataset.w]) WALLS[b.dataset.w](c.getContext('2d'), 160, 90); else { const x = c.getContext('2d'); x.fillStyle = WD_PAL.X; x.fillRect(0, 0, 160, 90); }
    pxFit(c, () => [64, 36]); b.onclick = () => { setHw({ wall: b.dataset.w }); draw(); }; });
  card.querySelectorAll('.seg[data-hw] button').forEach(b => b.onclick = () => {
    const k = b.parentElement.dataset.hw, v = b.dataset.v;
    setHw(k === 'all' ? { mon: v, kb: v, mouse: v } : { [k]: v }); draw();
  });
  card.querySelector('#hwOk').onclick = () => { card.classList.remove('hw-card'); if (back) back(); else closeModal(); };
  draw();
}
