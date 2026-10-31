/* ================= Telefone da mesa (peça grande, deitado e inclinado) ================= */
// Desenhado em pixel art na mesma densidade da cena, em vista de três quartos: base inclinada com teclado 3×4,
// fone deitado sobre a base e fio enrolado. Fica no canto da frente da mesa e tem cor própria (Personalizar).
// Tocando: treme, o LED pisca e o fone pula. Clicar e segurar (ou Espaço) ergue o fone e atende.
var DPHONE = { el: null };
const PH_W = 92, PH_H = 60;
// Desenho direto na grade final (sem ampliar coordenadas): as bordas usam inclinações limpas 6:1 e 1:3,
// que dão degraus regulares (as inclinações quebradas criam serrilhado irregular, o erro clássico de "jaggies").
// Plano do tampo: pt(s, t) anda s pixels ao longo da borda de trás (6 para o lado, 1 para cima) e t para a frente (1:3).
const phPt = (s, t, dy = 0) => [Math.round(6 + s + t / 3), Math.round(26 - s / 6 + t + dy)];
function phPoly(x, pts, col) {
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys) | 0, y1 = Math.max(...ys) | 0; x.fillStyle = col;
  for (let y = y0; y <= y1; y++) { const xs = [];
    for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) xs.push(ax + (y + .5 - ay) / (by - ay) * (bx - ax)); }
    xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) x.fillRect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1); }
}
const phQuad = (x, s0, t0, s1, t1, col, dy = 0) => phPoly(x, [phPt(s0, t0, dy), phPt(s1, t0, dy), phPt(s1, t1, dy), phPt(s0, t1, dy)], col);
function phoneDraw(x, R, st, t) {
  const P = WD_PAL, ring = st.ring && !st.held, jump = ring && (t * 12 | 0) % 2 ? -2 : 0;
  x.clearRect(0, 0, PH_W, PH_H);
  // sombra de contato na madeira (deslocada para baixo e à direita: luz de cima à esquerda)
  x.fillStyle = P[3]; phPoly(x, [phPt(4, 26, 3), phPt(76, 26, 3), phPt(76, 30, 3), phPt(4, 30, 3)], P[3]);
  // espessura: frente e lateral esquerda (lado da sombra mais escuro)
  phPoly(x, [phPt(0, 24), phPt(72, 24), phPt(72, 24, 6), phPt(0, 24, 6)], P.k);
  phPoly(x, [phPt(1, 24, 1), phPt(71, 24, 1), phPt(71, 24, 5), phPt(1, 24, 5)], R.dk);
  x.fillStyle = R.sh; for (let s = 2; s < 71; s += 1) { const [px, py] = phPt(s, 24, 1); x.fillRect(px, py, 1, 1); }      // aresta de baixo pega luz refletida
  phPoly(x, [phPt(0, 0), phPt(0, 24), phPt(0, 24, 6), phPt(0, 0, 6)], P.k);
  // tampo: contorno, base e luz em faixas (fundo iluminado, frente na sombra) — sombreamento por direção, não "almofada"
  phQuad(x, 0, 0, 72, 24, P.k); phQuad(x, 1, 1, 71, 23, R.base);
  phQuad(x, 1, 1, 71, 4, R.hi); phQuad(x, 1, 19, 71, 23, R.sh);
  for (let s = 1; s < 70; s++) { const [px, py] = phPt(s, 0); x.fillStyle = R.sh; x.fillRect(px, py, 1, 1); }                  // contorno seletivo do lado da luz
  // berço do fone (rebaixo) à esquerda e teclado 3×4 à direita, alinhados ao plano
  phQuad(x, 4, 5, 44, 19, R.sh); phQuad(x, 5, 17, 43, 19, R.dk);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const s0 = 48 + c * 7, t0 = 4 + r * 4.5;
    phQuad(x, s0, t0, s0 + 6, t0 + 3.5, P.k); phQuad(x, s0 + 1, t0 + .5, s0 + 5, t0 + 2.5, R.hi);
    const [kx, ky] = phPt(s0 + 3, t0 + 1); x.fillStyle = (r === 3 && c === 2) ? P.F : R.sh; x.fillRect(kx, ky, 2, 1); }
  // teclas de função e LED na faixa de trás
  for (let i = 0; i < 3; i++) { phQuad(x, 48 + i * 7, .8, 53 + i * 7, 2.6, P.k); phQuad(x, 49 + i * 7, 1, 52 + i * 7, 2.2, i === 2 ? (ring && (t * 4 | 0) % 2 ? P.R : P.q) : R.hi); }
  // fone: deitado no berço; tocando pula. Atendido: fica em pé (vertical, como na orelha), à esquerda da base
  const hy = jump - 4;
  if (st.held) {
    const fx = 2, fy = 0, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    F(P.k, fx + 1, fy + 8, 9, 30); F(R.base, fx + 2, fy + 9, 7, 28); F(R.hi, fx + 2, fy + 9, 2, 28); F(R.sh, fx + 7, fy + 9, 2, 28);      // haste
    for (const [cy, h] of [[fy, 11], [fy + 34, 11]]) { F(P.k, fx - 1, cy, 13, h); F(R.base, fx, cy + 1, 11, h - 2); F(R.hi, fx, cy + 1, 3, h - 2); F(R.sh, fx + 8, cy + 1, 3, h - 2);
      x.fillStyle = R.dk; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) x.fillRect(fx + 3 + i * 2, cy + 3 + j * 3, 1, 1); }
    phQuad(x, 4, 5, 44, 19, R.sh); phQuad(x, 5, 17, 43, 19, R.dk);                                                  // berço vazio
  } else {
    phQuad(x, 3, 6, 45, 13, P.k, hy + 3); phQuad(x, 4, 7, 44, 12, R.dk, hy + 3);                                    // lateral do fone
    phQuad(x, 3, 6, 45, 13, P.k, hy); phQuad(x, 4, 7, 44, 12, R.base, hy); phQuad(x, 4, 7, 44, 8.5, R.hi, hy);
    for (const s0 of [2, 34]) { phQuad(x, s0, 3.5, s0 + 11, 15, P.k, hy - 1); phQuad(x, s0 + 1, 4.5, s0 + 10, 14, R.base, hy - 1); phQuad(x, s0 + 1, 4.5, s0 + 10, 6.5, R.hi, hy - 1);
      x.fillStyle = R.dk; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const [px, py] = phPt(s0 + 3 + i * 2.5, 8.5 + j * 2.5, hy - 1); x.fillRect(px, py, 1, 1); } }
  }
  // fio enrolado saindo da ponta esquerda do fone até a lateral
  const [cx0, cy0] = st.held ? [6, 44] : phPt(2, 12, hy); x.fillStyle = P.k;
  for (let i = 0; i < 14; i++) { const yy = cy0 + i * ((phPt(0, 22)[1] - cy0) / 14), xx = cx0 - 3 - (i % 2) * 2; x.fillRect(Math.round(xx), Math.round(yy), 2, 1); }
  if (ring && (t * 3 | 0) % 2) { x.fillStyle = P.W; for (const [a, b, h] of [[20, 2, 4], [34, 0, 5], [48, 2, 4]]) x.fillRect(a, b, 1, h); }
}
function deskPhone() {
  if (!DPHONE) return null;
  if (DPHONE.el) return DPHONE.el;
  const el = document.createElement('canvas'); el.className = 'dphone'; el.width = PH_W; el.height = PH_H;
  document.body.insertBefore(el, $('app')); DPHONE.el = el;   // antes do monitor: a tela e a barra de tarefas ficam por cima
  el.addEventListener('pointerdown', e => { if (phoneHold(true)) { e.preventDefault(); el.setPointerCapture(e.pointerId); } else Motion.shake(el, 2); });
  const up = () => phoneHold(false); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return el;
}
// posição e escala acompanham o layout do escritório (pixel de arte inteiro, como o resto da cena)
function deskPhoneLayout() {
  const el = deskPhone(), L = OFFICE.L, M = OFFICE.M;
  if (!el || !L || !M) return;
  el.style.width = PH_W * M.k + 'px'; el.style.height = PH_H * M.k + 'px';
  el.style.left = Math.round(Math.max(2, L.VW * .015 | 0) * M.k) + 'px';   // canto da frente da mesa
  el.style.bottom = Math.round(-6 * M.k) + 'px';
}
function deskPhoneTick() {
  const el = deskPhone(); if (!el) return;
  const day = S && S.phase === 'day', call = day ? S.tasks.find(k => k.type === 'call' && !k.dead) : null;
  const st = { ring: !!call || !!OFFICE.call, held: !!(call && call.holding) };
  el.classList.toggle('ring', st.ring && !st.held);
  const dim = OFFICE.blind || 0; el.style.filter = dim ? `brightness(${(1 - dim * .45).toFixed(2)}) saturate(${(1 - dim * .25).toFixed(2)})` : '';
  phoneDraw(el.getContext('2d'), Office.ramp(hw().phone || 'graphite'), st, performance.now() / 1000);
}
deskPhoneLayout();
