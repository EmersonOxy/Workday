/* ================= Personalização do computador ================= */
// Aparência física do equipamento na mesa (independente do tema claro/escuro da interface) e papel de parede do WorkOS.
// Salvo em CFG.hw (localStorage "expediente-config"); saves antigos sem essa chave usam o padrão.
const HW_DEFAULT = { phone: 'graphite', mon: 'cream', kb: 'cream', mouse: 'cream', wall: 'teal', cat: 'tricolor', accent: 'azul', bar: 'bege', badge: 'azul', lanyard: 'azul' };
// Cores do WorkOS (barra de título das janelas e barra de tarefas) e do crachá (cordão e faixa do cartão)
const OS_ACCENTS = { azul: ['#44609f', '#6f93d9'], verde: ['#2f8a45', '#6fbf73'], uva: ['#7656a8', '#a983d6'], tijolo: ['#a24a33', '#d9714a'], petroleo: ['#2f6f78', '#5fa79a'], grafite: ['#3b3f48', '#626875'] };
const OS_BARS = { bege: ['#c7b595', '#fff8ec', '#8f7d63', '#e9dcc2'], cinza: ['#9aa0ab', '#d7d9de', '#626875', '#d7d9de'], noite: ['#2b2340', '#4a3a4e', '#2a1f2d', '#463462'], menta: ['#5fa79a', '#a9dccf', '#2f6f78', '#a9dccf'] };
const BADGE_COLORS = { azul: ['#6f93d9', '#44609f'], vermelho: ['#ef4b3f', '#a8262a'], verde: ['#6fbf73', '#3f8f50'], amarelo: ['#f4c15d', '#c98a2e'], roxo: ['#a983d6', '#7656a8'], preto: ['#4a3a4e', '#2a1f2d'] };
function applyOsTheme() {
  const h = hw(), r = document.documentElement.style, a = OS_ACCENTS[h.accent] || OS_ACCENTS.azul, b = OS_BARS[h.bar] || OS_BARS.bege, bc = BADGE_COLORS[h.badge] || BADGE_COLORS.azul;
  r.setProperty('--os-ac', a[0]); r.setProperty('--os-ac-hi', a[1]);
  r.setProperty('--os-bar', b[0]); r.setProperty('--os-bar-hi', b[1]); r.setProperty('--os-bar-sh', b[2]); r.setProperty('--os-btn', b[3]); r.setProperty('--os-bar-ink', h.bar === 'noite' ? '#fff8ec' : '#2a1f2d');
  r.setProperty('--badge', bc[0]); r.setProperty('--badge-sh', bc[1]); r.setProperty('--lanyard', (BADGE_COLORS[h.lanyard] || BADGE_COLORS.azul)[0]);
}
function hw() { return Object.assign({}, HW_DEFAULT, CFG.hw || {}); }
function setHw(patch) { CFG.hw = Object.assign(hw(), patch); persist(); OFFICE.key = ''; applyWallpaper(); applyOsTheme(); }

// Papéis de parede desenhados em baixa resolução com a paleta e ampliados por escala inteira
const WALLS = {
  teal: null,
  // azulejos com bisel: luz em cima/à esquerda, sombra embaixo/à direita, rejunte escuro
  grid(x, w, h) { const P = WD_PAL; x.fillStyle = P.X; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j += 10) for (let i = 0; i < w; i += 10) { const alt = ((i + j) / 10) % 2;
      x.fillStyle = alt ? P.x : P.V; x.fillRect(i + 1, j + 1, 8, 8); x.fillStyle = alt ? P.V : P.v; x.fillRect(i + 1, j + 1, 8, 1); x.fillRect(i + 1, j + 1, 1, 8);
      x.fillStyle = alt ? P.X : P.x; x.fillRect(i + 1, j + 8, 8, 1); x.fillRect(i + 8, j + 1, 1, 8); } },
  // colinas: céu em faixas, nuvens com base sombreada e três planos de morros com crista iluminada
  hills(x, w, h) { const P = WD_PAL, R = Office.rng(3);
    [[0, P.l], [h * .22, P.v], [h * .42, P.m]].forEach(([y0, c]) => { x.fillStyle = c; x.fillRect(0, y0 | 0, w, h); });
    for (let n = 0; n < 4; n++) { const cx = R() * w | 0, cy = 6 + R() * h * .25 | 0; x.fillStyle = P.W; x.fillRect(cx, cy, 16, 3); x.fillRect(cx + 3, cy - 2, 9, 2); x.fillStyle = P.m; x.fillRect(cx + 1, cy + 3, 14, 1); }
    const hill = (base, amp, col, top, ph) => { for (let i = 0; i < w; i++) { const y = base + Math.round(Math.sin(i / 17 + ph) * amp + Math.sin(i / 7 + ph * 2) * amp * .3); x.fillStyle = col; x.fillRect(i, y, 1, h - y); x.fillStyle = top; x.fillRect(i, y, 1, 1); } };
    hill(h * .55, 5, P.h, P.G, 1); hill(h * .68, 4, P.G, P.g, 3); hill(h * .82, 3, P.H, P.h, 5);
    x.fillStyle = P.Y; for (let n = 0; n < 12; n++) x.fillRect(R() * w | 0, h * .85 + R() * h * .13 | 0, 1, 1); },
  ondas(x, w, h) { const P = WD_PAL; x.fillStyle = P.x; x.fillRect(0, 0, w, h);
    for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i++) { const y = j + Math.round(Math.sin((i + j * 3) / 9) * 2); x.fillStyle = (j / 6) % 2 ? P.V : P.X; x.fillRect(i, y, 1, 2); } },
  // cidade de dia: céu em 3 faixas, sol com halo em anel, dois planos de prédios com face iluminada à esquerda
  cidade(x, w, h) { const P = WD_PAL, R = Office.rng(21);
    [[0, P.l], [h * .3, P.v], [h * .55, P.y]].forEach(([y0, c]) => { x.fillStyle = c; x.fillRect(0, y0 | 0, w, h); });
    const sx = w * .74 | 0, sy = h * .32 | 0; for (const [r, c] of [[10, P.y], [7, P.Y]]) { x.fillStyle = c; for (let j = -r; j <= r; j++) { const ww = Math.round(Math.sqrt(r * r - j * j)); x.fillRect(sx - ww, sy + j, ww * 2, 1); } }
    let bx = -2; while (bx < w) { const bw = 7 + R() * 8 | 0, bh = 14 + R() * h * .3 | 0; x.fillStyle = P.L; x.fillRect(bx, h - bh - 18, bw, bh + 18); x.fillStyle = P.l; x.fillRect(bx, h - bh - 18, 1, bh + 18); bx += bw; }
    bx = 0; while (bx < w) { const bw = 9 + R() * 12 | 0, bh = 22 + R() * h * .42 | 0, top = h - bh;
      x.fillStyle = P.k; x.fillRect(bx - 1, top - 1, bw + 2, bh + 1); x.fillStyle = P[7]; x.fillRect(bx, top, bw, bh); x.fillStyle = P.L; x.fillRect(bx, top, 2, bh); x.fillStyle = P.X; x.fillRect(bx + bw - 2, top, 2, bh);
      x.fillStyle = P.l; for (let j = top + 3; j < h - 3; j += 4) for (let i = bx + 3; i < bx + bw - 3; i += 3) if (R() < .55) x.fillRect(i, j, 1, 2);
      if (R() < .4) { x.fillStyle = P.k; x.fillRect(bx + (bw >> 1), top - 5, 1, 5); x.fillStyle = P.R; x.fillRect(bx + (bw >> 1), top - 6, 1, 1); }
      bx += bw + 2; } },
  logo(x, w, h) { const P = WD_PAL; x.fillStyle = P.n; x.fillRect(0, 0, w, h); for (let j = 4; j < h; j += 12) for (let i = ((j / 12) % 2) * 22; i < w; i += 44) Pixel.text(x, 'WORKDAY', i, j, P.N); x.fillStyle = P.Y; x.fillRect(0, h - 4, w, 4); },
  // blocos de brinquedo alinhados numa grade: cada um com topo iluminado, lateral sombreada e pino
  blocos(x, w, h) { const P = WD_PAL, R = Office.rng(33), C = [[P.f, P.F, P[9]], [P.o, P.O, P[8]], [P.l, P.L, P[7]], [P.i, P.I, P[6]], [P.y, P.Y, P.z], [P.t, P.T, P.u]];
    x.fillStyle = P.w; x.fillRect(0, 0, w, h); x.fillStyle = P.p; for (let j = 0; j < h; j += 12) for (let i = 0; i < w; i += 12) x.fillRect(i, j, 1, 1);
    for (let j = 2; j < h - 8; j += 12) for (let i = 2; i < w - 8; i += 12) { if (R() < .35) continue; const c = C[R() * C.length | 0], s = 8;
      if (i + s > w - 2 || j + s > h - 2) continue; x.fillStyle = P.k; x.fillRect(i - 1, j - 1, s + 2, s + 2); x.fillStyle = c[1]; x.fillRect(i, j, s, s);
      x.fillStyle = c[0]; x.fillRect(i, j, s, 1); x.fillRect(i, j, 1, s); x.fillStyle = c[2]; x.fillRect(i, j + s - 1, s, 1); x.fillRect(i + s - 1, j, 1, s);
      x.fillStyle = c[0]; x.fillRect(i + (s >> 1) - 1, j + (s >> 1) - 1, 2, 2); x.fillStyle = c[2]; x.fillRect(i + (s >> 1), j + (s >> 1), 1, 1); } },
  // listras diagonais em cores vizinhas (análogas quentes), separadas por fio claro: vivas sem agredir
  listras(x, w, h) { const P = WD_PAL, C = [P.T, P.O, P.Y, P.o, P.t]; for (let i = -h; i < w; i++) { const k = ((i + h) / 9 | 0) % C.length, edge = (i + h) % 9 === 0; x.fillStyle = edge ? P.w : C[k]; for (let j = 0; j < h; j++) x.fillRect(i + j, j, 1, 1); } },
  // pôr do sol em faixas limpas (sem pontilhado), sol com reflexo quebrado na água
  entardecer(x, w, h) { const P = WD_PAL, C = [P.N, P.n, P.I, P.T, P.O, P.Y], hz = h * .66 | 0;
    C.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, Math.round(hz * i / C.length), w, h); });
    x.fillStyle = P.y; for (let j = -10; j <= 0; j++) { const ww = Math.round(Math.sqrt(100 - j * j)); x.fillRect(w / 2 - ww, hz + j, ww * 2, 1); }
    x.fillStyle = P.n; x.fillRect(0, hz, w, h); x.fillStyle = P.N; x.fillRect(0, hz + 6, w, h);
    x.fillStyle = P.Y; for (let j = hz + 1, k = 0; j < h; j += 2, k++) { const ww = Math.max(2, 12 - k * 1.2) | 0; x.fillRect(w / 2 - ww + (k % 2 ? 2 : -2), j, ww * 2 - 4, 1); }
    x.fillStyle = P.y; for (let n = 0; n < 3; n++) x.fillRect(w * (.18 + n * .26) | 0, hz * .2 + n * 6 | 0, 14 - n * 3, 1); },
  // xadrez de piso com bisel (casas claras e escuras com luz e sombra)
  xadrez(x, w, h) { const P = WD_PAL; for (let j = 0; j < h; j += 8) for (let i = 0; i < w; i += 8) { const d = ((i + j) / 8) % 2;
    x.fillStyle = d ? P.e : P.c; x.fillRect(i, j, 8, 8); x.fillStyle = d ? P.C : P.W; x.fillRect(i, j, 8, 1); x.fillRect(i, j, 1, 8); x.fillStyle = d ? P.E : P.C; x.fillRect(i, j + 7, 8, 1); x.fillRect(i + 7, j, 1, 8); } },
  aquario(x, w, h) { const P = WD_PAL, R = Office.rng(44); x.fillStyle = P.x; x.fillRect(0, 0, w, h); x.fillStyle = P.X; for (let j = 0; j < h; j += 4) x.fillRect(0, j, w, 1);
    for (let n = 0; n < 7; n++) { const fx = R() * (w - 12) | 0, fy = 8 + R() * (h - 24) | 0, c = [P.O, P.Y, P.R, P.l][n % 4]; x.fillStyle = P.k; x.fillRect(fx - 1, fy - 1, 10, 6); x.fillStyle = c; x.fillRect(fx, fy, 8, 4); x.fillRect(fx + 8, fy - 1, 3, 6); x.fillStyle = P.k; x.fillRect(fx + 1, fy + 1, 1, 1); }
    x.fillStyle = P.v; for (let n = 0; n < 20; n++) x.fillRect(R() * w | 0, R() * h | 0, 1, 1); x.fillStyle = P.h; for (let i = 0; i < w; i += 9) { const hh = 8 + (i * 7) % 12; x.fillRect(i, h - hh, 2, hh); } x.fillStyle = P.y; x.fillRect(0, h - 3, w, 3); },
  // pontilhado ordenado entre duas cores (degradês suaves sem sair da paleta)
  praia(x, w, h) { const P = WD_PAL, R = Office.rng(51), D = [0, 2, 3, 1];
    for (let j = 0; j < h * .55; j++) for (let i = 0; i < w; i++) { const k = j / (h * .55) * 3 + D[(i % 2) + (j % 2) * 2] / 4; x.fillStyle = [P.l, P.v, P.y, P.o][Math.min(3, k | 0)]; x.fillRect(i, j, 1, 1); }
    x.fillStyle = P.Y; for (let j = -7; j <= 0; j++) { const ww = Math.round(Math.sqrt(49 - j * j)); x.fillRect(w * .62 - ww, h * .55 + j, ww * 2, 1); }
    for (let j = h * .55 | 0; j < h * .78; j++) { x.fillStyle = (j % 3) ? P.V : P.x; x.fillRect(0, j, w, 1); x.fillStyle = P.y; if (j % 2) x.fillRect(w * .62 - 10 + (j % 5), j, 20 - (j % 5) * 2, 1); }
    x.fillStyle = P.W; for (let i = 0; i < w; i += 7) x.fillRect(i + (R() * 3 | 0), h * .78 - 1, 3, 1);
    for (let j = h * .78 | 0; j < h; j++) for (let i = 0; i < w; i++) { x.fillStyle = (i * 3 + j * 5) % 11 ? P[1] : P[2]; x.fillRect(i, j, 1, 1); }
    const palm = (px, s) => { x.fillStyle = P[4]; for (let j = 0; j < 30 * s; j++) x.fillRect(px + Math.round(Math.sin(j / 9) * 3), h - j, 2, 1);
      const ty = h - 30 * s; x.fillStyle = P.H; for (let a = 0; a < 5; a++) for (let r = 0; r < 14 * s; r++) { const ang = -2.6 + a * .55; x.fillRect(px + Math.round(Math.cos(ang) * r), ty + Math.round(Math.sin(ang) * r * .5 + r * r * .02), 2, 1); }
      x.fillStyle = P.h; x.fillRect(px - 1, ty - 1, 3, 2); };
    palm(w * .14 | 0, 1.1); palm(w * .86 | 0, .9);
    x.fillStyle = P.k; for (let n = 0; n < 3; n++) { const bx = w * (.3 + n * .08) | 0, by = h * (.18 + n * .05) | 0; x.fillRect(bx, by, 2, 1); x.fillRect(bx + 2, by - 1, 1, 1); x.fillRect(bx - 1, by - 1, 1, 1); } },
  floresta(x, w, h) { const P = WD_PAL, R = Office.rng(61);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { x.fillStyle = (j / h * 2 + [0, 2, 3, 1][(i % 2) + (j % 2) * 2] / 4) < 1 ? P.v : P.a; x.fillRect(i, j, 1, 1); }
    const row = (base, col, dk, sz, n) => { for (let k = 0; k < n; k++) { const tx = R() * w | 0, th = sz * (0.8 + R() * .5) | 0, by = base + (R() * 4 | 0);
      for (let j = 0; j < th; j++) { const ww = Math.round(j / th * sz * .45); x.fillStyle = j % 4 === 3 ? dk : col; x.fillRect(tx - ww, by - th + j, ww * 2 + 1, 1); }
      x.fillStyle = P[4]; x.fillRect(tx, by, 1, 3); } x.fillStyle = col; x.fillRect(0, base + 2, w, h); };
    row(h * .55 | 0, P.b, P.B, 18, 18); row(h * .72 | 0, P.h, P.H, 22, 14); row(h * .92 | 0, P.G, P.h, 26, 10);
    x.fillStyle = P.W; for (let n = 0; n < 3; n++) { const cx = R() * w | 0, cy = 6 + R() * 12 | 0; x.fillRect(cx, cy, 12, 2); x.fillRect(cx + 3, cy - 2, 6, 2); }
    x.fillStyle = P.y; for (let n = 0; n < 10; n++) x.fillRect(R() * w | 0, h * .75 + R() * h * .2 | 0, 1, 1); },
  espaco(x, w, h) { const P = WD_PAL, R = Office.rng(71); x.fillStyle = P[0]; x.fillRect(0, 0, w, h);
    for (let n = 0; n < w * h / 45; n++) { x.fillStyle = R() < .7 ? P.W : R() < .5 ? P.l : P.y; x.fillRect(R() * w | 0, R() * h | 0, 1, 1); }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const d = Math.abs((j - h * .5) - (i - w * .5) * .35); if (d < 10 && (i + j * 3) % (d < 4 ? 2 : 5) === 0) { x.fillStyle = d < 4 ? P.i : P.n; x.fillRect(i, j, 1, 1); } }
    const planet = (px, py, r, c1, c2, ring) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) { x.fillStyle = i + j > r * .4 ? c2 : c1; x.fillRect(px + i, py + j, 1, 1); }
      if (ring) { x.fillStyle = P.y; for (let i = -r - 5; i <= r + 5; i++) { const yy = Math.round(i * .25); if (Math.abs(i) > r - 1 || yy > 0) x.fillRect(px + i, py + yy, 1, 1); } } };
    planet(w * .78 | 0, h * .3 | 0, 9, P.O, P[8], true); planet(w * .2 | 0, h * .72 | 0, 5, P.L, P[7], false); planet(w * .5 | 0, h * .15 | 0, 2, P.m, P.M, false); },
  neve(x, w, h) { const P = WD_PAL, R = Office.rng(81);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { x.fillStyle = (j / h * 2.4 + [0, 2, 3, 1][(i % 2) + (j % 2) * 2] / 4) < 1 ? P.l : P.m; x.fillRect(i, j, 1, 1); }
    const mt = (cx, base, hgt, c1, c2) => { for (let j = 0; j < hgt; j++) { const ww = j * 1.3 | 0; x.fillStyle = j < hgt * .3 ? P.W : (j % 5 ? c1 : c2); x.fillRect(cx - ww, base - hgt + j, ww * 2 + 1, 1); if (j < hgt * .3) { x.fillStyle = P.m; x.fillRect(cx + (ww >> 1), base - hgt + j, ww - (ww >> 1), 1); } } };
    mt(w * .3 | 0, h * .8 | 0, h * .55 | 0, P.M, P.j); mt(w * .7 | 0, h * .85 | 0, h * .65 | 0, P.j, P.J); mt(w * .05 | 0, h * .9 | 0, h * .4 | 0, P.M, P.j);
    x.fillStyle = P.W; x.fillRect(0, h * .85 | 0, w, h);
    x.fillStyle = P.H; for (let k = 0; k < 6; k++) { const tx = (k * 31 + 7) % w, ty = h * .88 | 0; for (let j = 0; j < 10; j++) { const ww = j >> 2; x.fillRect(tx - ww, ty - 10 + j, ww * 2 + 1, 1); } }
    x.fillStyle = P.W; for (let n = 0; n < 50; n++) x.fillRect(R() * w | 0, R() * h * .85 | 0, 1, 1); },
  campo(x, w, h) { const P = WD_PAL, R = Office.rng(91);
    for (let j = 0; j < h * .5; j++) for (let i = 0; i < w; i++) { x.fillStyle = (j / (h * .5) * 2 + [0, 2, 3, 1][(i % 2) + (j % 2) * 2] / 4) < 1 ? P.l : P.v; x.fillRect(i, j, 1, 1); }
    x.fillStyle = P.y; for (let j = -5; j <= 5; j++) { const ww = Math.round(Math.sqrt(25 - j * j)); x.fillRect(w * .15 - ww, h * .18 + j, ww * 2, 1); }
    for (let j = h * .5 | 0; j < h; j++) { x.fillStyle = j < h * .6 ? P.G : j < h * .75 ? P.h : P.H; x.fillRect(0, j, w, 1); }
    for (let n = 0; n < 140; n++) { const fx = R() * w | 0, fy = h * .52 + Math.pow(R(), .7) * h * .46 | 0, s = fy > h * .8 ? 2 : 1; x.fillStyle = [P.R, P.Y, P.W, P.I, P.O][R() * 5 | 0]; x.fillRect(fx, fy, s, s); if (s > 1) { x.fillStyle = P.y; x.fillRect(fx, fy, 1, 1); } }
    x.fillStyle = P.W; for (let n = 0; n < 4; n++) { const cx = R() * w | 0, cy = 4 + R() * h * .25 | 0; x.fillRect(cx, cy, 14, 3); x.fillRect(cx + 3, cy - 2, 8, 2); } },
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
    <div class="setting"><span>${u.phoneLabel}<small></small></span>${seg('phone', HWK)}</div>
    <div class="setting"><span>${u.curLabel}<small></small></span><div class="swatches cursors" data-hw="cursor" data-names='${JSON.stringify(u.curNames)}'>${Object.keys(CURSORS).map(k => `<button class="sw-btn cur-btn${(cur.cursor || 'padrao') === k ? ' on' : ''}" data-v="${k}" title="${u.curNames[k]}" aria-label="${u.curNames[k]}"></button>`).join('')}</div></div>
    <div class="setting"><span>${u.curColorLabel}</span><div class="swatches cur-colors"></div></div>
    <div class="setting"><span>${u.theme}<small></small></span><div class="seg" id="hwTheme">${[['system', u.themeSystem], ['light', u.themeLight], ['dark', u.themeDark]].map(([v, l]) => `<button class="pxbtn${(CFG.theme || 'system') === v ? ' on' : ''}" data-t="${v}">${l}</button>`).join('')}</div></div>
    <div class="setting"><span>${u.catLabel}</span><div class="walls cats">${CAT_COATS.map(c2 => `<button class="pxbtn wall cat${cur.cat === c2 ? ' on' : ''}" data-c="${c2}"><span class="cimg"></span><small>${u.coats[c2]}</small></button>`).join('')}</div></div>
    <div class="setting"><span>${u.wallLabel}</span><div class="walls">${Object.keys(WALLS).map(w => `<button class="pxbtn wall${cur.wall === w ? ' on' : ''}" data-w="${w}"><canvas width="64" height="36"></canvas><small>${u.walls[w]}</small></button>`).join('')}</div></div>
    <div class="actions"><button class="pxbtn main" id="hwOk">${u.resume}</button></div>`);
  card.classList.add('hw-card');
  // Layout de aplicativo: abas por categoria à esquerda e prévia grande à direita (computador, janela do WorkOS,
  // crachá e gato), tudo atualizado em tempo real. As linhas existentes são só redistribuídas (nenhuma opção some).
  { const rows = [...card.querySelectorAll(':scope .setting')], CAT = ['pc', 'pc', 'pc', 'pc', 'os', 'os', 'badge', 'badge', 'pc', 'ptr', 'ptr', 'os', 'desk', 'os'];
    const lay = document.createElement('div'); lay.className = 'hw-layout';
    lay.innerHTML = `<div class="hw-main"><div class="hw-tabs">${['pc', 'os', 'badge', 'desk', 'ptr'].map(k => `<button class="pxbtn hw-tab" data-t="${k}">${u.hwTabs[k]}</button>`).join('')}</div><div class="hw-opts"></div></div>
      <aside class="hw-side"><div class="hw-pv hw-pv-pc"></div><div class="hw-pv hw-pv-os"><div class="pv-win"><i class="pv-bar"><b></b><b></b><b class="x"></b></i><div class="pv-body"></div></div><i class="pv-task"><i class="pv-orb"></i></i></div>
        <div class="hw-pv hw-pv-badge"><div class="pv-badge"><i class="pv-lan"></i><div class="pv-card"><i class="pv-head"></i><span class="pv-face"></span><b></b></div></div></div>
        <div class="hw-pv hw-pv-desk"><canvas class="pv-cat" width="40" height="34"></canvas></div><p class="hint hw-note"></p></aside>`;
    const opts = lay.querySelector('.hw-opts'); rows.forEach((r, i) => { r.dataset.cat = CAT[i] || 'os'; opts.append(r); });
    card.querySelector('.hw-prev').remove(); const pcBox = lay.querySelector('.hw-pv-pc'); pcBox.innerHTML = '<canvas class="hw-scene" width="120" height="44"></canvas>';
    card.querySelector('.hint').remove(); card.querySelector('h2').after(lay);
    lay.querySelector('.pv-face').append(portrait(40)); lay.querySelector('.pv-card b').textContent = profileName();
    const tab = k => { lay.querySelectorAll('.hw-tab').forEach(b => b.classList.toggle('on', b.dataset.t === k)); rows.forEach(r => r.hidden = r.dataset.cat !== k);
      lay.querySelectorAll('.hw-pv').forEach(p => p.hidden = !p.classList.contains('hw-pv-' + k) && !(k === 'ptr' && p.classList.contains('hw-pv-os')));
      lay.querySelector('.hw-note').textContent = u.hwTabNotes[k]; try { sessionStorage.setItem('hwTab', k); } catch (e) {} };
    lay.querySelectorAll('.hw-tab').forEach(b => b.onclick = () => { sfx('click'); tab(b.dataset.t); });
    let t0 = 'pc'; try { t0 = sessionStorage.getItem('hwTab') || 'pc'; } catch (e) {} tab(t0);
    // gato da prévia animado com a mesma lógica da mesa
    const pc = lay.querySelector('.pv-cat'), ai = CatAI.make(); const anim = () => { if (!pc.isConnected) return; const t = performance.now() / 1000; CatAI.step(ai, t); const x = pc.getContext('2d'); x.clearRect(0, 0, 40, 34); catDrawBound(x, 5, 32, hw().cat, ai, t); requestAnimationFrame(anim); };
    pc.onclick = () => CatAI.poke(ai, performance.now() / 1000); requestAnimationFrame(anim); }
  const prev = card.querySelector('.hw-scene');
  const draw = () => {
    const h = hw();
    card.querySelectorAll('[data-hw]').forEach(s => { const k = s.dataset.hw; s.querySelectorAll('button').forEach(b => b.classList.toggle('on', k === 'all' ? ['mon', 'kb', 'mouse'].every(q => h[q] === b.dataset.v) : h[k] === b.dataset.v));
      const lb = s.parentElement.querySelector(':scope > span small'), names = JSON.parse(s.dataset.names || '{}'), on = s.querySelector('.on'); if (lb) lb.textContent = on ? names[on.dataset.v] || '' : '—'; });
    card.querySelectorAll('.wall:not(.cat)').forEach(b => b.classList.toggle('on', b.dataset.w === h.wall));
    Office.hwPreview(prev, h);
  };
  pxFit(prev, () => { const sd = card.querySelector('.hw-side'); const w = Math.max(120, (sd ? sd.clientWidth : 300) - 24); return [w, innerWidth < 700 ? 130 : Math.min(260, Math.round(w * .66))]; });
  requestAnimationFrame(() => { if (prev.isConnected) pxRefit(prev); });   // a coluna lateral só tem largura real depois do layout
  card.querySelectorAll('.wall:not(.cat)').forEach(b => { const c = b.querySelector('canvas'); if (WALLS[b.dataset.w]) WALLS[b.dataset.w](c.getContext('2d'), 64, 36); else { const x = c.getContext('2d'); x.fillStyle = WD_PAL.X; x.fillRect(0, 0, 64, 36); }   // miniatura desenhada já pequena
    pxFit(c, () => [80, 45]); b.onclick = () => { setHw({ wall: b.dataset.w }); draw(); }; });
  card.querySelectorAll('.cat').forEach(b => { const c2 = catCoat(SPR2.cat, b.dataset.c), cv = document.createElement('canvas'); cv.width = c2.width; cv.height = c2.height; cv.getContext('2d').drawImage(c2, 0, 0); b.querySelector('.cimg').append(pxSize(cv, 3));
    b.onclick = () => { setHw({ cat: b.dataset.c }); card.querySelectorAll('.cat').forEach(x => x.classList.toggle('on', x === b)); sfx('pop'); }; });
  // ponteiros: prévia na cor escolhida; passar o mouse sobre um ponteiro que aceita cor mostra as cores dele
  const curPaint = () => card.querySelectorAll('.cur-btn').forEach(b => { const c = CURSORS[b.dataset.v]; b.replaceChildren(); if (c) { const im = new Image(); im.src = cursorURL(c, 2, curRows(b.dataset.v)); b.append(im); } else b.textContent = '↖'; });
  curPaint();
  // cores do ponteiro escolhido: linha fixa logo abaixo dos ponteiros (some para os que têm cor própria)
  const curCol = card.querySelector('.cur-colors');
  const paintCurCol = () => { const id = (CFG.hw || {}).cursor || 'padrao', ok = !!CUR_FILL[id], cur = (((CFG.hw || {}).curColor) || {})[id] || 'padrao';
    curCol.parentElement.style.display = ok ? '' : 'none';
    curCol.innerHTML = Object.entries(CUR_COLORS).map(([k, l]) => `<button class="cur-dot${cur === k ? ' on' : ''}" data-c="${k}" title="${u.curColors[k]}" aria-label="${u.curColors[k]}" style="background:${l ? WD_PAL[l] : 'transparent'}">${l ? '' : '×'}</button>`).join('');
    curCol.querySelectorAll('.cur-dot').forEach(d => d.onclick = () => { const id2 = (CFG.hw || {}).cursor; setHw({ curColor: Object.assign({}, (CFG.hw || {}).curColor, { [id2]: d.dataset.c }) }); applyCursor(); curPaint(); paintCurCol(); sfx('click'); }); };
  card.querySelectorAll('.cur-btn').forEach(b => b.addEventListener('click', () => setTimeout(paintCurCol, 0)));
  paintCurCol();
  card.querySelectorAll('#hwTheme button').forEach(b => b.onclick = () => { CFG.theme = b.dataset.t; persist(); applyTheme(); sfx('click'); card.querySelectorAll('#hwTheme button').forEach(x => x.classList.toggle('on', x === b)); });
  card.querySelectorAll('[data-hw] button').forEach(b => b.onclick = () => { sfx('click');
    const k = b.parentElement.dataset.hw, v = b.dataset.v;
    setHw(k === 'all' ? { mon: v, kb: v, mouse: v } : { [k]: v }); if (k === 'cursor') applyCursor(); draw();
  });
  card.querySelector('#hwOk').onclick = () => { card.classList.remove('hw-card'); if (back) back(); else closeModal(); };
  draw();
}
applyOsTheme();
