/* ================= Personalização do computador ================= */
// Aparência física do equipamento na mesa (independente do tema claro/escuro da interface) e papel de parede do WorkOS.
// Salvo em CFG.hw (localStorage "expediente-config"); saves antigos sem essa chave usam o padrão.
const HW_DEFAULT = { mon: 'cream', kb: 'cream', mouse: 'cream', wall: 'teal', cat: 'tricolor', accent: 'azul', bar: 'bege', badge: 'azul', lanyard: 'azul' };
// Cores do WorkOS (barra de título das janelas e barra de tarefas) e do crachá (cordão e faixa do cartão)
const OS_ACCENTS = { azul: ['#44609f', '#6f93d9'], verde: ['#2f8a45', '#6fbf73'], uva: ['#7656a8', '#a983d6'], tijolo: ['#a24a33', '#d9714a'], petroleo: ['#2f6f78', '#5fa79a'], grafite: ['#3b3f48', '#626875'] };
const OS_BARS = { bege: ['#c7b595', '#fff8ec', '#8f7d63', '#e9dcc2'], cinza: ['#9aa0ab', '#d7d9de', '#626875', '#d7d9de'], noite: ['#2b2340', '#4a3a4e', '#2a1f2d', '#463462'], menta: ['#5fa79a', '#a9dccf', '#2f6f78', '#a9dccf'] };
const BADGE_COLORS = { azul: ['#6f93d9', '#44609f'], vermelho: ['#ef4b3f', '#a8262a'], verde: ['#6fbf73', '#3f8f50'], amarelo: ['#f4c15d', '#c98a2e'], roxo: ['#a983d6', '#7656a8'], preto: ['#4a3a4e', '#2a1f2d'] };
function applyOsTheme() {
  const h = hw(), r = document.documentElement.style, a = OS_ACCENTS[h.accent] || OS_ACCENTS.azul, b = OS_BARS[h.bar] || OS_BARS.bege, bc = BADGE_COLORS[h.badge] || BADGE_COLORS.azul;
  r.setProperty('--os-ac', a[0]); r.setProperty('--os-ac-hi', a[1]);
  r.setProperty('--os-bar', b[0]); r.setProperty('--os-bar-hi', b[1]); r.setProperty('--os-bar-sh', b[2]); r.setProperty('--os-btn', b[3]); r.setProperty('--os-bar-ink', h.bar === 'noite' ? '#fff8ec' : '#2a1f2d');
  r.setProperty('--badge', bc[0]); r.setProperty('--badge-sh', bc[1]);
}
function hw() { return Object.assign({}, HW_DEFAULT, CFG.hw || {}); }
function setHw(patch) { CFG.hw = Object.assign(hw(), patch); persist(); OFFICE.key = ''; applyWallpaper(); applyOsTheme(); }

// Papéis de parede desenhados em baixa resolução com a paleta e ampliados por escala inteira
const WALLS = {
  teal: null,
  grid(x, w, h) { const P = WD_PAL; x.fillStyle = P.X; x.fillRect(0, 0, w, h); x.fillStyle = P.x; for (let j = 0; j < h; j += 8) for (let i = (j / 8 % 2) * 8; i < w; i += 16) x.fillRect(i, j, 8, 8); },
  hills(x, w, h) { const P = WD_PAL, R = Office.rng(3);
    const sky = [P.v, P.a]; for (let j = 0; j < h * .6; j++) for (let i = 0; i < w; i++) { x.fillStyle = (j / (h * .6)) * 4 > [0, 2, 3, 1][(i % 2) + (j % 2) * 2] + .5 ? sky[1] : sky[0]; x.fillRect(i, j, 1, 1); }
    x.fillStyle = P.W; for (let n = 0; n < 4; n++) { const cx = R() * w | 0, cy = 6 + R() * h * .25 | 0; x.fillRect(cx, cy, 14, 3); x.fillRect(cx + 3, cy - 2, 8, 2); }
    const hill = (base, amp, col, ph) => { x.fillStyle = col; for (let i = 0; i < w; i++) { const y = base + Math.round(Math.sin(i / 17 + ph) * amp + Math.sin(i / 7 + ph * 2) * amp * .3); x.fillRect(i, y, 1, h - y); } };
    hill(h * .55, 5, P.G, 1); hill(h * .68, 4, P.h, 3); hill(h * .82, 3, P.H, 5); },
  ondas(x, w, h) { const P = WD_PAL; x.fillStyle = P.x; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i++) { const y = j + Math.round(Math.sin((i + j * 3) / 9) * 2); x.fillStyle = (j / 6) % 2 ? P.V : P.X; x.fillRect(i, y, 1, 2); } },
  cidade(x, w, h) { const P = WD_PAL, R = Office.rng(21); x.fillStyle = P.v; x.fillRect(0, 0, w, h); x.fillStyle = P.y; for (let j = -8; j <= 8; j++) { const ww = Math.round(Math.sqrt(64 - j * j)); x.fillRect(w * .7 - ww, h * .3 + j, ww * 2, 1); }
    let bx = 0; while (bx < w) { const bw = 8 + R() * 14 | 0, bh = 20 + R() * h * .5 | 0; x.fillStyle = [P.L, P[7], P.x][R() * 3 | 0]; x.fillRect(bx, h - bh, bw, bh); x.fillStyle = P.l; for (let j = h - bh + 3; j < h - 2; j += 4) for (let i = bx + 2; i < bx + bw - 2; i += 3) if (R() < .5) x.fillRect(i, j, 1, 2); bx += bw + 1; } },
  logo(x, w, h) { const P = WD_PAL; x.fillStyle = P.n; x.fillRect(0, 0, w, h); for (let j = 4; j < h; j += 12) for (let i = ((j / 12) % 2) * 22; i < w; i += 44) Pixel.text(x, 'WORKDAY', i, j, P.N); x.fillStyle = P.Y; x.fillRect(0, h - 4, w, 4); },
  blocos(x, w, h) { const P = WD_PAL, R = Office.rng(33), C = [P.F, P.O, P.L, P.I, P.Y, P.T]; x.fillStyle = P.W; x.fillRect(0, 0, w, h);
    for (let n = 0; n < 40; n++) { const s = 4 + (R() * 3 | 0) * 4, bx = R() * w | 0, by = R() * h | 0; x.fillStyle = P.k; x.fillRect(bx - 1, by - 1, s + 2, s + 2); x.fillStyle = C[R() * C.length | 0]; x.fillRect(bx, by, s, s); } },
  listras(x, w, h) { const P = WD_PAL, C = [P.T, P.Y, P.F, P.L, P.I]; for (let i = -h; i < w; i++) { x.fillStyle = C[((i + h) / 10 | 0) % C.length]; for (let j = 0; j < h; j++) x.fillRect(i + j, j, 1, 1); } },
  entardecer(x, w, h) { const P = WD_PAL, C = [P.n, P.I, P.T, P.O, P.Y, P.y];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = j / h * (C.length - 1) + ([0, 2, 3, 1][(i % 2) + (j % 2) * 2] / 4 - .4); x.fillStyle = C[Math.max(0, Math.min(C.length - 1, Math.round(k)))]; x.fillRect(i, j, 1, 1); }
    x.fillStyle = P.y; for (let j = -9; j <= 0; j++) { const ww = Math.round(Math.sqrt(81 - j * j)); x.fillRect(w / 2 - ww, h * .72 + j, ww * 2, 1); }
    x.fillStyle = P.N; x.fillRect(0, h * .72, w, h); x.fillStyle = P.n; for (let j = h * .72 + 3; j < h; j += 4) x.fillRect(w / 2 - 12 + (j % 8), j, 24 - (j % 8) * 2, 1); },
  xadrez(x, w, h) { const P = WD_PAL; for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i += 6) { x.fillStyle = ((i + j) / 6) % 2 ? P.C : P.e; x.fillRect(i, j, 6, 6); } x.fillStyle = P.E; for (let i = 0; i < w; i += 12) x.fillRect(i, 0, 1, h); },
  aquario(x, w, h) { const P = WD_PAL, R = Office.rng(44); x.fillStyle = P.x; x.fillRect(0, 0, w, h); x.fillStyle = P.X; for (let j = 0; j < h; j += 4) x.fillRect(0, j, w, 1);
    for (let n = 0; n < 7; n++) { const fx = R() * (w - 12) | 0, fy = 8 + R() * (h - 24) | 0, c = [P.O, P.Y, P.R, P.l][n % 4]; x.fillStyle = P.k; x.fillRect(fx - 1, fy - 1, 10, 6); x.fillStyle = c; x.fillRect(fx, fy, 8, 4); x.fillRect(fx + 8, fy - 1, 3, 6); x.fillStyle = P.k; x.fillRect(fx + 1, fy + 1, 1, 1); }
    x.fillStyle = P.v; for (let n = 0; n < 20; n++) x.fillRect(R() * w | 0, R() * h | 0, 1, 1); x.fillStyle = P.h; for (let i = 0; i < w; i += 9) { const hh = 8 + (i * 7) % 12; x.fillRect(i, h - hh, 2, hh); } x.fillStyle = P.y; x.fillRect(0, h - 3, w, 3); },
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
  const HWK = Object.keys(Office.HW), nm = o => (u.hwNames && u.hwNames[o]) || u[o] || o;
  const sw = o => { const r = Office.HW[o]; return `<i style="background:${r.base};box-shadow:inset 3px 3px 0 ${r.hi},inset -3px -3px 0 ${r.sh}"></i>`; };
  // amostras quadradas (o nome da cor aparece no rótulo da linha e na dica)
  const cseg = (key, map, i) => `<div class="swatches" data-hw="${key}" data-names='${JSON.stringify(Object.fromEntries(Object.keys(map).map(k => [k, u.osc.names[k] || k])))}'>${Object.entries(map).map(([k, c]) => `<button class="sw-btn${cur[key] === k ? ' on' : ''}" data-v="${k}" title="${u.osc.names[k] || k}" aria-label="${u.osc.names[k] || k}"><i style="background:${c[i]};box-shadow:inset 3px 3px 0 ${c[1] || c[0]}"></i></button>`).join('')}</div>`;
  const seg = (key, opts) => `<div class="swatches" data-hw="${key}" data-names='${JSON.stringify(Object.fromEntries(opts.map(o => [o, nm(o)])))}'>${opts.map(o => `<button class="sw-btn${cur[key] === o ? ' on' : ''}" data-v="${o}" title="${nm(o)}" aria-label="${nm(o)}">${sw(o)}</button>`).join('')}</div>`;
  const card = modal(`<h2>${u.hwTitle}</h2><p class="hint">${u.hwNote}</p>
    <div class="hw-prev"><canvas class="hw-scene" width="120" height="44"></canvas></div>
    <div class="setting"><span>${u.allLabel}<small></small></span>${seg('all', HWK)}</div>
    <div class="setting"><span>${u.monitorLabel}<small></small></span>${seg('mon', HWK)}</div>
    <div class="setting"><span>${u.keyboardLabel}<small></small></span>${seg('kb', HWK)}</div>
    <div class="setting"><span>${u.mouseLabel}<small></small></span>${seg('mouse', HWK)}</div>
    <div class="setting"><span>${u.osc.accent}<small></small></span>${cseg('accent', OS_ACCENTS, 0)}</div>
    <div class="setting"><span>${u.osc.bar}<small></small></span>${cseg('bar', OS_BARS, 0)}</div>
    <div class="setting"><span>${u.osc.badge}<small></small></span>${cseg('badge', BADGE_COLORS, 0)}</div>
    <div class="setting"><span>${u.osc.lanyard}<small></small></span>${cseg('lanyard', BADGE_COLORS, 0)}</div>
    <div class="setting"><span>${u.catLabel}</span><div class="walls cats">${CAT_COATS.map(c2 => `<button class="pxbtn wall cat${cur.cat === c2 ? ' on' : ''}" data-c="${c2}"><span class="cimg"></span><small>${u.coats[c2]}</small></button>`).join('')}</div></div>
    <div class="setting"><span>${u.wallLabel}</span><div class="walls">${Object.keys(WALLS).map(w => `<button class="pxbtn wall${cur.wall === w ? ' on' : ''}" data-w="${w}"><canvas width="64" height="36"></canvas><small>${u.walls[w]}</small></button>`).join('')}</div></div>
    <div class="actions"><button class="pxbtn main" id="hwOk">${u.resume}</button></div>`);
  card.classList.add('hw-card');
  const prev = card.querySelector('.hw-scene');
  const draw = () => {
    const h = hw();
    card.querySelectorAll('[data-hw]').forEach(s => { const k = s.dataset.hw; s.querySelectorAll('button').forEach(b => b.classList.toggle('on', k === 'all' ? ['mon', 'kb', 'mouse'].every(q => h[q] === b.dataset.v) : h[k] === b.dataset.v));
      const lb = s.parentElement.querySelector(':scope > span small'), names = JSON.parse(s.dataset.names || '{}'), on = s.querySelector('.on'); if (lb) lb.textContent = on ? names[on.dataset.v] || '' : '—'; });
    card.querySelectorAll('.wall:not(.cat)').forEach(b => b.classList.toggle('on', b.dataset.w === h.wall));
    Office.hwPreview(prev, h);
  };
  pxFit(prev, () => [Math.min(360, innerWidth * .7), 140]);
  card.querySelectorAll('.wall:not(.cat)').forEach(b => { const c = b.querySelector('canvas'); if (WALLS[b.dataset.w]) WALLS[b.dataset.w](c.getContext('2d'), 64, 36); else { const x = c.getContext('2d'); x.fillStyle = WD_PAL.X; x.fillRect(0, 0, 64, 36); }   // miniatura desenhada já pequena
    pxFit(c, () => [80, 45]); b.onclick = () => { setHw({ wall: b.dataset.w }); draw(); }; });
  card.querySelectorAll('.cat').forEach(b => { const c2 = catCoat(SPR2.cat, b.dataset.c), cv = document.createElement('canvas'); cv.width = c2.width; cv.height = c2.height; cv.getContext('2d').drawImage(c2, 0, 0); b.querySelector('.cimg').append(pxSize(cv, 3));
    b.onclick = () => { setHw({ cat: b.dataset.c }); card.querySelectorAll('.cat').forEach(x => x.classList.toggle('on', x === b)); sfx('pop'); }; });
  card.querySelectorAll('[data-hw] button').forEach(b => b.onclick = () => { sfx('click');
    const k = b.parentElement.dataset.hw, v = b.dataset.v;
    setHw(k === 'all' ? { mon: v, kb: v, mouse: v } : { [k]: v }); draw();
  });
  card.querySelector('#hwOk').onclick = () => { card.classList.remove('hw-card'); if (back) back(); else closeModal(); };
  draw();
}
applyOsTheme();
