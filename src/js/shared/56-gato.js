/* ================= Gato (modelo único do jogo: mesa, Personalizar, mercado, catálogo e cenas) ================= */
// Gato sentado em três quartos, virado um pouco para a esquerda (para o monitor). O desenho é montado por partes com
// volume (corpo, anca, peito, pernas, patas, cabeça, bochechas, focinho, orelhas, cauda) direto na grade final — em
// qualquer tamanho as partes são redesenhadas, nunca uma imagem ampliada. Sombreamento por volume com luz de cima à
// esquerda (4 tons por pelagem), tufos de pelo nas transições, linhas internas (queixo, anca, pernas) e contorno seletivo.
// Rosto: olhos amendoados com íris, pupila em fenda (dilata quando curioso) e brilho; nariz, boca em "w", bigodes.
// Estados desenhados quadro a quadro: parado (respira, pisca, mexe orelha, olha em volta), cauda, limpar a pata,
// curioso, bocejo, alongar, dormir enrolado e carinho (olhos fechados de prazer e coraçõezinhos).

const CAT_COATS_NEW = {
  laranja:           { base: ['1', '2', '3', '4'], white: ['+', 'W', 'w', 'p'], eye: ['d', 'D'], nose: 'r', pat: 'bib' },
  'laranja-tigrado': { base: ['1', '2', '3', '4'], a: ['3', '3', '4', '4'], white: ['+', 'W', 'w', 'p'], eye: ['Y', 'z'], nose: 'r', pat: 'tabby', bib: true },
  'cinza-tigrado':   { base: ['m', 'M', 'j', 'J'], a: ['j', 'J', 'J', '0'], white: ['+', 'W', 'w', 'p'], eye: ['d', 'D'], nose: 'r', pat: 'tabby', bib: true },
  preto:             { base: ['j', 'J', '0', 'k'], eye: ['Y', 'z'], nose: 'K', pat: 'none', dark: true },
  branco:            { base: ['+', 'W', 'w', 'p'], eye: ['l', 'L'], nose: 'r', pat: 'none' },
  tricolor:          { base: ['+', 'W', 'w', 'p'], a: ['1', '2', '3', '4'], b: ['j', 'J', '0', 'k'], eye: ['d', 'D'], nose: 'r', pat: 'calico' },
  frajola:           { base: ['j', 'J', '0', 'k'], white: ['+', 'W', 'w', 'p'], eye: ['d', 'D'], nose: 'r', pat: 'tux', dark: true },
  siames:            { base: ['c', 'C', 'e', 'E'], a: ['5', '3', '4', 'k'], eye: ['l', 'L'], nose: '5', pat: 'points' },
};
const CAT_K = 1.3;

// Máquina de estados (duração mínima, máxima, peso). O clique dá carinho; movimento reduzido: só pisca.
const CatAI = {
  STATES: { idle: [4, 9, 6], tail: [3, 6, 3], groom: [3, 4.5, 2], curious: [2.5, 4, 2], yawn: [1.8, 1.8, 1], stretch: [2.2, 2.2, 1], sleep: [9, 18, 2] },
  make() { return { state: 'idle', t0: 0, dur: 5, pet: -9, prev: 'idle', tp: -9 }; },
  step(c, t) {
    if (t - c.t0 < c.dur) return c;
    const S = this.STATES, pool = []; for (const k in S) if (k !== c.state || k === 'idle') for (let i = 0; i < S[k][2]; i++) pool.push(k);
    const k = Motion.reduced.matches ? 'idle' : pool[Math.random() * pool.length | 0];
    c.prev = c.state; c.tp = t; c.state = k; c.t0 = t; c.dur = S[k][0] + Math.random() * (S[k][1] - S[k][0]); return c;
  },
  poke(c, t) { if (c.state === 'sleep') { c.prev = 'sleep'; c.tp = t; } c.pet = t; c.state = 'idle'; c.t0 = t; c.dur = 4; },
};

// ---------- Pose: valores de cada parte para o instante t (passos inteiros = quadros desenhados) ----------
function catPose(c, t) {
  const el = t - c.t0, st = c.state, step = (v, n) => Math.round(Math.min(1, Math.max(0, v)) * n) / n, pet = t - c.pet < 2;
  const p = { hx: 0, hy: 0, earL: 0, earR: 0, eyes: 'open', pupil: 1, look: 0, mouth: 0, tongue: false, paw: 0, breath: 0, tail: .15, sway: 0, loaf: 0, bow: 0, hearts: pet ? t - c.pet : -1, z: false };
  // piscadas (meio fechado, fechado, meio) e respiração
  const bl = (t % 4.7); if (bl < .08 || (bl > .2 && bl < .26)) p.eyes = 'half'; else if (bl < .2) p.eyes = 'closed';
  p.breath = Math.sin(t * 2.4) > .2 ? 1 : 0;
  p.sway = Math.round(Math.sin(t * 1.3) * 2) / 4;
  if (st === 'idle') { if ((t % 7.3) < .3) p.earR = 1; if ((t % 11.1) < .25) p.earL = 1;
    const lk = Math.sin(t * .45); p.look = lk > .7 ? 1 : lk < -.8 ? -1 : 0; p.hx = p.look > 0 ? .5 : 0; }
  if (st === 'tail') { p.tail = .55 + Math.sin(t * 2.2) * .25; p.sway = Math.round(Math.sin(t * 3.2) * 3) / 3; }
  if (st === 'groom') { const ph = (el * 1.6) % 2; p.paw = ph < 1.2 ? 1 : 2; p.eyes = 'closed'; p.hy = .6; p.hx = -.4; p.tongue = p.paw === 1 && (el * 6 | 0) % 2 === 0; p.tail = .1; }
  if (st === 'curious') { p.earL = p.earR = -1; p.pupil = 2; p.hx = ((el * 1.4 | 0) % 2 ? .8 : -.6); p.hy = -.4; p.look = p.hx > 0 ? 1 : -1; p.tail = .85; p.sway = Math.round(Math.sin(t * 5) * 2) / 4; }
  if (st === 'yawn') { const f = el < .5 ? step(el / .5, 3) : el < 1.3 ? 1 : step(1 - (el - 1.3) / .5, 3); p.mouth = f; p.eyes = f > .3 ? 'closed' : p.eyes; p.earL = p.earR = f > .6 ? 1 : 0; p.hy = -f * .6; }
  if (st === 'stretch') { const f = el < .6 ? step(el / .6, 3) : el < 1.6 ? 1 : step(1 - (el - 1.6) / .6, 3); p.bow = f; p.tail = .4 + f * .6; p.eyes = f > .6 ? 'closed' : p.eyes; p.mouth = f > .9 ? .6 : 0; }
  if (st === 'sleep') { const f = step(el / 1.4, 4); p.loaf = f; p.eyes = f > .5 ? 'closed' : 'half'; p.tail = .15 * (1 - f); p.sway = 0; p.z = el > 2.2; p.breath = Math.sin(t * 1.2) > 0 ? 1 : 0; p.earL = p.earR = 0; }
  else if (c.prev === 'sleep' && t - c.tp < 1) { const f = step(1 - (t - c.tp), 4); p.loaf = f; if (f > .5) p.eyes = 'half'; }   // acordando: levanta em quadros
  if (pet) { p.eyes = 'happy'; p.earL = p.earR = .5; p.tail = Math.max(p.tail, .8); p.sway = Math.round(Math.sin(t * 9) * 2) / 4; p.mouth = 0; p.loaf = Math.min(p.loaf, .5); }
  return p;
}

// ---------- Desenho ----------
// Devolve a altura usada. x0, by: canto esquerdo e base (onde as patas tocam)
function catDraw(x, x0, by, coat, c, t, k = CAT_K) {
  const C = CAT_COATS_NEW[coat] || CAT_COATS_NEW.laranja, P = WD_PAL, p = catPose(c, t), oy = 2;
  const W = Math.ceil(39 * k), H = Math.ceil(35 * k), N = W * H;
  const id = new Int8Array(N).fill(-1), L = new Float32Array(N);
  const S = v => v * k, put = (i, j, part, l) => { if (i < 0 || j < 0 || i >= W || j >= H) return; const n = j * W + i; id[n] = part; L[n] = l; };
  const lerp = (a, b, f) => a + (b - a) * f;
  // luz: de cima à esquerda; volume como esfera achatada
  const lit = (nx, ny) => { const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)); return z * .55 - nx * .55 - ny * .75; };
  const ell = (part, cx, cy, rx, ry) => { cx = S(cx); cy = S(cy + oy); rx = S(rx); ry = S(ry);
    for (let j = Math.floor(cy - ry); j <= cy + ry; j++) for (let i = Math.floor(cx - rx); i <= cx + rx; i++) { const nx = (i + .5 - cx) / rx, ny = (j + .5 - cy) / ry; if (nx * nx + ny * ny <= 1) put(i, j, part, lit(nx, ny)); } };
  const cap = (part, ax, ay, bx, by2, r, shade = 0) => { ax = S(ax); ay = S(ay + oy); bx = S(bx); by2 = S(by2 + oy); r = S(r);
    const dx = bx - ax, dy = by2 - ay, l2 = dx * dx + dy * dy || 1;
    for (let j = Math.floor(Math.min(ay, by2) - r); j <= Math.max(ay, by2) + r; j++) for (let i = Math.floor(Math.min(ax, bx) - r); i <= Math.max(ax, bx) + r; i++) {
      const px = i + .5, py = j + .5, u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)), qx = px - (ax + dx * u), qy = py - (ay + dy * u), d = Math.hypot(qx, qy);
      if (d <= r) put(i, j, part, lit(qx / r * .9, qy / r * .5 - .1 - u * .25) - shade); } };
  const tri = (part, a, b, cc, l) => { const A = [S(a[0]), S(a[1] + oy)], B = [S(b[0]), S(b[1] + oy)], Cc = [S(cc[0]), S(cc[1] + oy)];
    const e = (p1, p2, q) => (p2[0] - p1[0]) * (q[1] - p1[1]) - (p2[1] - p1[1]) * (q[0] - p1[0]);
    for (let j = Math.floor(Math.min(A[1], B[1], Cc[1])); j <= Math.max(A[1], B[1], Cc[1]); j++) for (let i = Math.floor(Math.min(A[0], B[0], Cc[0])); i <= Math.max(A[0], B[0], Cc[0]); i++) {
      const q = [i + .5, j + .5], s1 = e(A, B, q), s2 = e(B, Cc, q), s3 = e(Cc, A, q); if ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)) put(i, j, part, l); } };
  // partes: 0 cauda, 1 anca, 2 corpo, 3 perna de trás (longe), 4 peito, 5 perna da frente, 6 patas, 7 cabeça, 8 orelha, 9 focinho, 10 pata erguida
  const lo = p.loaf, bw = p.bow;
  const hx = 12 + p.hx - lo * 1.5 - bw * 3, hy = 10.5 + p.hy + lo * 7.5 + bw * 7;
  // cauda: do quadril para a frente (enrolada) ou para cima (ponto de interrogação); a ponta balança
  const wrap = [[27, 27.5], [31, 28.6], [31.8, 31], [26, 31.7], [19, 31.5], [13.5, 30.8]], up = [[27, 27.5], [31, 24.5], [33, 19.5], [33.2, 14.5], [31.6, 11.2], [29.6, 10.8]];
  const tp = Math.min(1, Math.max(0, p.tail)), tpts = wrap.map((w, i) => [lerp(w[0], up[i][0], tp) + p.sway * i * .5 * (tp > .4 ? 1 : .4), lerp(w[1], up[i][1], tp) + (lo ? lo * (i > 2 ? -.5 : 0) : 0)]);
  const tailFront = tp < .45;
  const drawTail = () => { for (let s = 0; s < tpts.length - 1; s++) for (let u = 0; u < 1; u += .08) { const a = tpts[s], b = tpts[s + 1], q = s + u;
    const px = lerp(a[0], b[0], u), py = lerp(a[1], b[1], u), r = lerp(1.9, 1.25, q / (tpts.length - 1)); ell(0, px, py, r, r); } };
  if (!tailFront) drawTail();
  ell(1, 21.5 + lo * 1.5 - bw * .5, 24.2 + lo * 1.3 - bw * 2.2, 8.8 + lo * 1, 7.2 - lo * .6);                    // anca
  ell(2, 17 - lo * 1 + bw * 1, 20.6 + lo * 3.4 + bw * 2.2 - p.breath * .25, 9.2 + lo * 2, 9 - lo * 2.6 - bw * 2.5 + p.breath * .25);   // corpo (lombo)
  if (tailFront) drawTail();
  ell(6, 24.6 + lo, 30.8, 3.1, 1.3);                                                                            // pata de trás
  if (lo < .6) cap(3, lerp(14.6, 13.5, bw), lerp(23, 28.6, bw), lerp(14.8, 4.2, bw), lerp(29.6, 30.4, bw), 1.55, .25);   // perna de trás (mais escura)
  ell(4, 12.2 - bw * 1 + lo * .5, 22.2 + bw * 4.6 + lo * 3.5, 5.6, 7.4 - lo * 2.6 - bw * 3.2);                       // peito
  if (lo < .6) { if (p.paw) cap(10, 11, 21, p.paw === 1 ? hx - 2.2 : hx - 4, p.paw === 1 ? hy + 4.8 : hy + 2.5, 1.65); else cap(5, lerp(10.6, 12, bw), lerp(22, 27.8, bw), lerp(10.4, 1.6, bw), lerp(29.5, 30.1, bw), 1.65); }
  if (!p.paw && lo < .6) ell(6, lerp(10.4, 1.4, bw), lerp(30.3, 30.6, bw), 2.2, 1.3);
  if (lo >= .6) { ell(6, 8.6, 31, 2.4, 1.2); ell(6, 12.6, 31.1, 2.3, 1.1); }                                     // patinhas recolhidas
  if (!p.paw && lo < .6 && bw < .5) ell(6, 14.8, 30.5, 2, 1.1);
  // cabeça: crânio + bochechas mais largas embaixo + focinho
  ell(7, hx, hy, 7, 6); ell(7, hx, hy + 2.2, 7.9, 4.3);
  const earT = (side) => { const e = side < 0 ? p.earL : p.earR, back = e > 0 ? e : 0, perk = e < 0 ? -e : 0;
    if (side < 0) { tri(8, [hx - 6.9, hy - 2.6], [hx - 5.8 - back * 1.2, hy - 9.4 + back * 2.4 - perk], [hx - 1.8, hy - 5.6], 0); tri(11, [hx - 5.9, hy - 3.3], [hx - 5.4 - back, hy - 7.6 + back * 2 - perk], [hx - 3, hy - 5], 0); }
    else { tri(8, [hx + 1.6, hy - 5.8], [hx + 5.8 + back * 1.2, hy - 9.6 + back * 2.4 - perk], [hx + 6.8, hy - 2.4], 0); tri(11, [hx + 2.9, hy - 5.2], [hx + 5.4 + back, hy - 7.8 + back * 2 - perk], [hx + 5.8, hy - 3.2], 0); } };
  earT(-1); earT(1);
  ell(9, hx - .2, hy + 3.3, 2.9, 1.9);
  if (p.paw) cap(10, 10.4, 22, p.paw === 1 ? hx - 1.2 : hx - 4.2, p.paw === 1 ? hy + 5.4 : hy + 2.6, 1.75);
  // ---------- pintura ----------
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : id[j * W + i];
  const ramp = (i, j, part) => {
    const u = i / k, v = j / k - oy, R = C;
    const bib = (part === 4 && Math.abs(u - (12.2 - bw * 2)) < 3.6 + (v - 17) * .15 && v > 15.5) || part === 9 || (part === 6) || (part === 7 && v > hy + 3.6 && Math.abs(u - hx) < 3.4);
    if (R.pat === 'tux') return bib || (part === 7 && Math.abs(u - hx + .2) < .9 && v > hy - 3 && v < hy + 3) ? R.white : R.base;
    if (R.pat === 'bib') return bib && part !== 6 ? R.white : (part === 6 ? R.white : R.base);
    if (R.pat === 'points') { const mask = part === 8 || part === 11 || part === 0 || part === 6 || part === 3 && v > 26 || part === 5 && v > 26 || part === 10 ||
        (part === 7 || part === 9) && ((u - hx) / 4.6) ** 2 + ((v - hy - 2.4) / 3.6) ** 2 <= 1;
      if (!mask && (part === 7) && ((u - hx) / 5.4) ** 2 + ((v - hy - 2.4) / 4.3) ** 2 <= 1 && (i + j) % 2) return R.a;   // transição pontilhada da máscara
      return mask ? R.a : R.base; }
    if (R.pat === 'tabby') {
      if (R.bib && bib) return R.white;
      if (part === 0) return (Math.round(u * .9 + v * .4) % 3 === 0) ? R.a : R.base;
      if (part === 1 || part === 2) { const s = Math.sin(u * .95 - v * .32 + Math.sin(v * .5) * .8); return s > .62 ? R.a : R.base; }
      if (part === 3 || part === 5) return Math.sin(v * 1.5) > .7 ? R.a : R.base;
      if (part === 7) { const fore = v < hy - 1.6 && v > hy - 5.2 && [-1.8, 0, 1.8].some(o => Math.abs(u - hx - o) < .5); const cheek = v > hy + 1.2 && v < hy + 1.9 && Math.abs(u - hx) > 4.6; return fore || cheek ? R.a : R.base; }
      return R.base; }
    if (R.pat === 'calico') {
      const blob = (cx, cy, r) => (u - cx) ** 2 + (v - cy) ** 2 < r * r;
      if (part === 7 || part === 8 || part === 11) { if (blob(hx - 4.5, hy - 4, 3.6)) return R.b; if (blob(hx + 4.6, hy - 2.4, 3.4)) return R.a; return R.base; }
      if (part === 0) return u > 30 || v < 20 ? R.a : R.b;
      if (part === 1 || part === 2) { if (blob(24, 24.5, 4.4)) return R.b; if (blob(19, 17, 5) || blob(26, 30, 3)) return R.a; }
      return R.base; }
    return R.base;
  };
  const out = new Array(N).fill(null);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const n = j * W + i, part = id[n]; if (part < 0) continue;
    if (part === 11) { out[n] = (i + j) % 3 === 0 ? P[ramp(i, j, 8)[1]] : P[C.dark ? 'n' : 'o']; continue; }                       // orelha por dentro, com tufos
    let l = L[n] + ((((i * 3 + (j >> 1) * 5) % 7) / 7) - .5) * .2;                                                                 // tufos de pelo (faixas curtas)
    let tone = l > .62 ? 0 : l > .12 ? 1 : l > -.38 ? 2 : 3;
    if (part === 9) tone = Math.min(tone, 1);
    // oclusão: sob a cabeça e atrás das pernas o pelo escurece um tom
    if ((part === 2 || part === 4 || part === 1) && (at(i, j - 1) === 7 || at(i, j - 2) === 7 || at(i, j - 1) === 9)) tone = Math.min(3, tone + 1);
    // linhas internas: queixo, anca e separação das pernas
    if (k >= 1.2) {
      if (part === 7 && j + 1 < H && [2, 4, 1].includes(at(i, j + 1))) tone = 3;
      if (part === 1 && (at(i - 1, j) === 2 || at(i, j - 1) === 2) && j / k - oy < 26) tone = Math.max(tone, 2);
      if (part === 5 && at(i + 1, j) === 3) tone = 3;
      // pernas e pata erguida têm contorno interno (um tom acima da sombra) onde encostam em outra parte
      if ((part === 5 || part === 10 || part === 3) && [4, 2, 1, 7, 9].some(q => at(i - 1, j) === q || at(i + 1, j) === q || at(i, j + 1) === q || (part === 10 && at(i, j - 1) === q))) tone = 3;
      // dedos: dois riscos na frente de cada pata
      if (part === 6 && k >= 1.6 && at(i, j + 1) < 0 && [1, 2].includes(((i - Math.round(S(2))) % 3 + 3) % 3) && at(i, j - 1) === 6) tone = Math.max(tone, 2);
      if (part === 6 && at(i, j - 1) !== 6 && at(i, j - 1) >= 0 && k >= 1.6) tone = Math.max(tone, 2);
      if (part === 0 && [1, 2, 4].includes(at(i, j - 1))) tone = 3;
    }
    out[n] = P[ramp(i, j, part)[tone]];
  }
  // ---------- rosto ----------
  const set = (i, j, col) => { i = Math.round(i); j = Math.round(j); if (i >= 0 && j >= 0 && i < W && j < H && id[j * W + i] >= 0) out[j * W + i] = col; };
  const lidCol = P[ramp(Math.round(S(hx)), Math.round(S(hy + oy)), 7)[2]];
  const eye = (cxu) => { const ew = Math.max(2, Math.round(2.3 * k)), eh = Math.max(2, Math.round(1.9 * k)), x0 = Math.round(S(cxu - (ew / k) / 2)), y0 = Math.round(S(hy + oy - .2 - (eh / k) / 2)) + 0;
    const look = Math.round(p.look * Math.max(1, k * .5));
    if (p.eyes === 'closed') { for (let i = 0; i < ew; i++) set(x0 + i, y0 + eh - 1 - (i === 0 || i === ew - 1 ? 1 : 0), P.k); return; }
    if (p.eyes === 'happy') { for (let i = 0; i < ew; i++) set(x0 + i, y0 + (i === 0 || i === ew - 1 ? 1 : 0), P.k); return; }
    for (let j = 0; j < eh; j++) for (let i = 0; i < ew; i++) { const corner = ew > 3 && (j === 0 || j === eh - 1) && (i === 0 || i === ew - 1); if (corner) continue;
      let col = P[j < eh / 2 ? C.eye[0] : C.eye[1]]; const pc = Math.floor(ew / 2) + look - (ew > 3 ? 0 : 0);
      if (i === pc || (p.pupil > 1 && i === pc - 1) || (ew <= 2 && i === ew - 1)) col = P.k;
      if (p.eyes === 'half' && j < Math.ceil(eh / 2)) col = lidCol;
      set(x0 + i, y0 + j, col); }
    if (p.eyes !== 'half') set(x0 + (ew > 3 ? 1 : 0), y0 + (ew > 3 ? 1 : 0) - (ew > 3 ? 0 : 0), P['+']);
    if (k >= 1.6) { for (let i = (ew > 3 ? 1 : 0); i < ew - (ew > 3 ? 1 : 0); i++) set(x0 + i, y0 - 1, P.k); set(x0 - 1, y0 + 1, P.k); }                    // pálpebra de cima
  };
  eye(hx - 3.3); eye(hx + 2.7);
  const nx = S(hx - .2), ny = S(hy + oy + 2.2);
  if (k >= 1.6) { set(nx - 1, ny, P[C.nose]); set(nx, ny, P[C.nose]); set(nx + 1, ny, P[C.nose]); set(nx, ny + 1, P[C.nose]); set(nx - 1, ny - 0, P[C.nose]); }
  else set(nx, ny, P[C.nose]);
  const mo = p.mouth;
  if (mo > 0) { const mh = Math.max(1, Math.round(mo * 2.6 * k * .6)), mw = Math.max(1, Math.round(1.6 * k));
    for (let j = 0; j < mh; j++) for (let i = -mw + (j === 0 || j === mh - 1 ? 1 : 0); i <= mw - (j === 0 || j === mh - 1 ? 1 : 0); i++) set(nx + i, ny + 2 + j, j >= mh - 2 && mh > 2 ? P.r : P.k);
    if (mh > 2 && k >= 1.6) { set(nx - mw + 1, ny + 2, P.W); set(nx + mw - 1, ny + 2, P.W); } }
  else if (k >= 1.6) { set(nx, ny + 2, P.k); set(nx - 1, ny + 3, P.k); set(nx - 2, ny + 2, P.k); set(nx + 1, ny + 3, P.k); set(nx + 2, ny + 2, P.k); }
  else set(nx, ny + 1, P.k);
  if (p.tongue) set(nx, ny + 4, P.r);
  // ---------- contorno seletivo (por fora) ----------
  const deep = P[C.base[3]], buf = new Array(N).fill(null);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const n = j * W + i; if (id[n] >= 0) continue;
    const r = at(i + 1, j) >= 0, d = at(i, j + 1) >= 0, l = at(i - 1, j) >= 0, u = at(i, j - 1) >= 0;
    if (r || d || l || u) buf[n] = (r || d) && !(l || u) && !C.dark ? deep : P.k; }
  // ---------- pinta ----------
  const X0 = Math.round(x0), Y0 = Math.round(by) - H;
  for (let n = 0; n < N; n++) { const col = out[n] || buf[n]; if (col) { x.fillStyle = col; x.fillRect(X0 + n % W, Y0 + (n / W | 0), 1, 1); } }
  // bigodes (fora da silhueta, claros) — só no tamanho grande
  if (k >= 1.6) { x.fillStyle = C.dark ? P.m : P.W;
    for (const [sx, dir] of [[S(hx - 7.8), -1], [S(hx + 7.6), 1]]) for (let w = 0; w < 2; w++) for (let i = 0; i < Math.round(3 * k); i++) { const px = Math.round(sx + dir * i), py = Math.round(ny + w * 2 + i / 4 - 1);
      if (at(px, py) < 0 && !buf[py * W + px]) x.fillRect(X0 + px, Y0 + py, 1, 1); } }
  // coraçõezinhos do carinho e "Z" do sono
  if (p.hearts >= 0 && p.hearts < 1.6) { const hy2 = Y0 + Math.round(S(hy + oy - 9)) - Math.round(p.hearts * 8), hx2 = X0 + Math.round(S(hx + 6)); x.fillStyle = P.k;
    [[1, 0, 2], [4, 0, 2], [0, 1, 7], [0, 2, 7], [1, 3, 5], [2, 4, 3], [3, 5, 1]].forEach(([a, b, w]) => x.fillRect(hx2 + a - 1, hy2 + b, w + 2, 1));
    x.fillStyle = P.R; [[1, 1, 2], [4, 1, 2], [1, 2, 5], [2, 3, 3], [3, 4, 1]].forEach(([a, b, w]) => x.fillRect(hx2 + a, hy2 + b, w, 1)); x.fillStyle = P.r; x.fillRect(hx2 + 1, hy2 + 1, 1, 1); }
  if (p.z) { const q = (t * .45) % 1; Pixel.text(x, 'z', X0 + Math.round(S(hx + 6)) + Math.round(q * 4), Y0 + Math.round(S(hy + oy - 5)) - Math.round(q * 7), P.K); if (q > .4) Pixel.text(x, 'Z', X0 + Math.round(S(hx + 9)) + Math.round(q * 3), Y0 + Math.round(S(hy + oy - 9)) - Math.round(q * 6), P.K); }
  return H;
}
function catDrawBound(...a) { return catDraw(...a); }
// Tamanho (px) do desenho para um k
const catSize = k => [Math.ceil(39 * k), Math.ceil(35 * k)];
// Quadro parado (sem animação) em canvas, com cache; usado no mercado, catálogo, cenas e miniaturas
const CAT_STILL = new Map();
function catStill(coat, k) {
  const key = coat + ':' + k; if (CAT_STILL.has(key)) return CAT_STILL.get(key);
  const [w, h] = catSize(k), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  catDraw(cv.getContext('2d'), 0, h, coat, { state: 'idle', t0: -99, dur: 99, pet: -99, prev: 'idle', tp: -99 }, 2.5, k);
  CAT_STILL.set(key, cv); return cv;
}
// O mesmo gato como linhas de paleta (para quem desenha sprites por letras: prateleira do mercado, catálogo)
function catRows(coat, k) {
  const cv = catStill(coat, k), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, rev = {};
  for (const [ch, hex] of Object.entries(WD_PAL)) rev[hex.toLowerCase()] = ch;
  const rows = []; for (let j = 0; j < cv.height; j++) { let r = ''; for (let i = 0; i < cv.width; i++) { const n = (j * cv.width + i) * 4;
    if (d[n + 3] < 128) { r += '.'; continue; } const hx = '#' + [d[n], d[n + 1], d[n + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); r += rev[hx] || 'k'; } rows.push(r); }
  return rows;
}

// sprite por letras do mesmo gato (prateleira do mercado e catálogo)
SPR2.cat = catRows('laranja', .8);
