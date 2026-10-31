/* ================= Telefone da mesa (peça grande, deitado e inclinado) ================= */
// Desenhado em pixel art na mesma densidade da cena, em vista de três quartos: base inclinada com teclado 3×4,
// fone deitado sobre a base e fio enrolado. Fica no canto da frente da mesa e tem cor própria (Personalizar).
// Tocando: treme, o LED pisca e o fone pula. Clicar e segurar (ou Espaço) ergue o fone e atende.
var DPHONE = { el: null };
const PH_Z = 1.4, PH_W = 92, PH_H = 60;   // desenho em coordenadas de 66×42 ampliado 1,4× (mais pixels = mais detalhe)
// preenche um polígono por linhas inteiras (sem serrilhado borrado)
function phPoly(x, pts, col) {
  pts = pts.map(([a, b]) => [a * PH_Z, b * PH_Z]);
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys) | 0, y1 = Math.max(...ys) | 0; x.fillStyle = col;
  for (let y = y0; y <= y1; y++) { const xs = [];
    for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) xs.push(ax + (y + .5 - ay) / (by - ay) * (bx - ax)); }
    xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) x.fillRect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1); }
}
function phoneDraw(x, R, st, t) {
  const P = WD_PAL, ring = st.ring && !st.held, jump = ring && (t * 12 | 0) % 2 ? -2 : 0;
  x.clearRect(0, 0, PH_W, PH_H);
  // sombra na mesa
  x.fillStyle = 'rgba(42,31,45,.35)'; phPoly(x, [[6, 36], [60, 30], [64, 38], [8, 42]], 'rgba(110,59,38,.55)');
  // base: tampo inclinado (perspectiva) + lateral da frente
  const top = [[4, 18], [56, 10], [62, 26], [8, 34]];
  phPoly(x, [[8, 34], [62, 26], [62, 30], [8, 38]], R.dk);                 // espessura da frente
  phPoly(x, [[4, 18], [8, 34], [8, 38], [4, 22]], R.sh);                   // lateral esquerda
  phPoly(x, top, P.k); phPoly(x, [[5, 19], [55, 11], [61, 26], [9, 33]], R.base);
  phPoly(x, [[5, 19], [55, 11], [56, 13], [6, 21]], R.hi);                 // aresta de trás iluminada
  phPoly(x, [[4, 18], [56, 10], [56, 10.7], [4, 18.7]], R.sh);              // contorno seletivo: do lado da luz o contorno clareia (selout)
  phPoly(x, [[9, 33], [61, 26], [61, 27], [9, 34]], R.sh);
  // berço do fone (rebaixo à esquerda) e teclado 3×4 em perspectiva à direita
  phPoly(x, [[8, 20], [36, 15], [38, 22], [10, 27]], R.sh);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const kx = 39 + c * 6.5 + r * 1.3, ky = 13.5 + r * 3.6 - c * 1;
    phPoly(x, [[kx, ky], [kx + 5, ky - .8], [kx + 5.6, ky + 2.6], [kx + .6, ky + 3.4]], P.k);
    phPoly(x, [[kx + .6, ky + .2], [kx + 4.6, ky - .4], [kx + 5, ky + 1.8], [kx + 1, ky + 2.4]], R.hi);
    x.fillStyle = P.W; x.fillRect(Math.round((kx + 2.4) * PH_Z), Math.round((ky + .7) * PH_Z), 1, 1);
  }
  // teclas de função e LED
  phPoly(x, [[57, 14], [60, 13.5], [61, 16], [58, 16.5]], P.k); x.fillStyle = ring && (t * 4 | 0) % 2 ? P.R : P.q; x.fillRect(58 * PH_Z | 0, 14 * PH_Z | 0, 3, 2);
  // fone: deitado no berço; tocando pula; atendido sai e fica erguido inclinado
  const hy = st.held ? -12 : jump, hx = st.held ? 2 : 0, tilt = st.held ? -3 : 0;
  const H = (a, b) => [a + hx, b + hy + (a - 6) / 30 * tilt];
  phPoly(x, [H(4, 15), H(38, 9), H(40, 15), H(6, 21)], P.k);
  phPoly(x, [H(5, 15), H(37, 10), H(39, 14), H(6, 20)], R.base);
  phPoly(x, [H(5, 15), H(37, 10), H(37.5, 11), H(5.5, 16)], R.hi);
  for (const ex of [4, 31]) { phPoly(x, [H(ex, 14), H(ex + 8, 12.6), H(ex + 9, 20), H(ex + 1, 21.5)], P.k); phPoly(x, [H(ex + 1, 15), H(ex + 7, 13.8), H(ex + 8, 19.4), H(ex + 1.6, 20.6)], R.base); phPoly(x, [H(ex + 1, 15), H(ex + 7, 13.8), H(ex + 7.2, 14.8), H(ex + 1.2, 16)], R.hi); }
  // fio enrolado saindo do fone até a lateral da base
  x.fillStyle = P.k; for (let i = 0; i < 12; i++) { const cx = (3 - (i % 2)) * PH_Z, cy = (22 + i * 1.3 + (st.held ? -6 + i * .5 : 0)) * PH_Z; x.fillRect(cx | 0, cy | 0, 3, 1); x.fillStyle = i % 2 ? P.k : R.sh; }
  // detalhes: furos do auscultador e do microfone, teclas de função, faixa da marca e grade do viva-voz na frente
  const Zp = (a, b) => [Math.round((a + hx) * PH_Z), Math.round((b + hy + (a - 6) / 30 * tilt) * PH_Z)];
  x.fillStyle = P.k; for (const ex of [6, 33]) for (let i = 0; i < 3; i++) { const [px, py] = Zp(ex + 1.6 + i * 1.6, 16.6 - i * .2); x.fillRect(px, py, 1, 1); x.fillRect(px + 1, py + 2, 1, 1); }
  for (let i = 0; i < 3; i++) { phPoly(x, [[41 + i * 5, 10.4 - i * .8], [44.5 + i * 5, 9.8 - i * .8], [45 + i * 5, 11.6 - i * .8], [41.4 + i * 5, 12.2 - i * .8]], P.k); phPoly(x, [[41.5 + i * 5, 10.6 - i * .8], [44 + i * 5, 10.2 - i * .8], [44.3 + i * 5, 11.2 - i * .8], [41.8 + i * 5, 11.6 - i * .8]], i === 2 ? P.R : R.hi); }
  for (let i = 0; i < 7; i++) phPoly(x, [[46 + i * 2, 27.4 - i * .3], [47 + i * 2, 27.2 - i * .3], [47 + i * 2, 29.6 - i * .3], [46 + i * 2, 29.8 - i * .3]], R.sh);
  phPoly(x, [[14, 30.8], [34, 28.2], [34, 28.8], [14, 31.4]], R.hi);
  if (ring && (t * 3 | 0) % 2) { x.fillStyle = P.W; for (const [a, b, h] of [[14, 4, 3], [24, 2, 4], [34, 2, 3]]) x.fillRect(a * PH_Z | 0, b * PH_Z | 0, 1, h * PH_Z | 0); }
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
  phoneDraw(el.getContext('2d'), Office.ramp(hw().phone || 'graphite'), st, performance.now() / 1000);
}
deskPhoneLayout();
