/* ================= Arte dos objetos de destaque (decorações compradas e periféricos) ================= */
// Desenhos procedurais em pixel art, na mesma densidade da cena. Regras (skills de pixel art do projeto):
// luz de cima à esquerda; rampas de 3-4 tons por material com variação de matiz; contorno escuro só por fora;
// brilho/reflexo em vidro e metal; sombra de contato; nada de degradê suave nem rotação de sprite.
// Cada objeto: draw(ctx, x, baseY, t, st) com base no tampo (baseY) e um retângulo de clique opcional.
const ART = {
  F(x, c, a, b, w, h) { x.fillStyle = c; x.fillRect(a | 0, b | 0, w, h); },
  disc(x, cx, cy, r, c) { for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); this.F(x, c, cx - w, cy + j, w * 2 + 1, 1); } },
  contact(x, x0, y, w) { this.F(x, 'rgba(110,59,38,.55)', x0 + 1, y, w, 1); this.F(x, 'rgba(110,59,38,.3)', x0 + 2, y + 1, w - 2, 1); },

  // ---------- Webcam: corpo de plástico arredondado, aro metálico, lente com reflexo, LED e presilha no monitor ----------
  webcam(x, cx, top, t, st) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), y = Math.max(1, top);
    F(P.k, cx - 13, y + 1, 26, 12); F(P.k, cx - 12, y, 24, 14);                                  // silhueta arredondada
    F(P.J, cx - 12, y + 1, 24, 12); F(P.j, cx - 12, y + 1, 24, 2); F(P.j, cx - 12, y + 1, 2, 10); F(P[0], cx - 12, y + 11, 24, 2);
    F(P.M, cx - 9, y + 2, 5, 1);                                                                   // reflexo no plástico
    // lente: aro de metal (m/M), anel preto, vidro azul com dois reflexos
    this.disc(x, cx, y + 7, 5, P.k); this.disc(x, cx, y + 7, 4, P.M); F(P.m, cx - 3, y + 4, 3, 1); F(P.m, cx - 4, y + 5, 1, 2);
    this.disc(x, cx, y + 7, 3, P.k); this.disc(x, cx, y + 7, 2, P[7]); F(P.L, cx - 1, y + 6, 2, 2); F(P.l, cx - 1, y + 5, 1, 1); F(P.W, cx + 1, y + 8, 1, 1);
    // microfone e LED (vermelho aceso durante a videochamada)
    for (let i = 0; i < 3; i++) F(P[0], cx - 10 + i * 2, y + 9, 1, 1);
    F(P.k, cx + 8, y + 5, 3, 3); F(st.live ? ((t * 2 | 0) % 2 ? P.R : P.r) : P.q, cx + 9, y + 6, 1, 1);
    // presilha: desce pela frente da moldura
    F(P.k, cx - 5, y + 13, 10, 5); F(P.j, cx - 4, y + 13, 8, 4); F(P.J, cx - 4, y + 16, 8, 1);
  },

  // ---------- Rádio retrô: caixa de madeira, grade do alto-falante, mostrador com ponteiro, botões, antena ----------
  radio(x, x0, by, t, st) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 34, H = 21, y = by - H, on = st.sound;
    this.contact(x, x0, by, W);
    F(P.k, x0 - 1, y + 1, W + 2, H); F(P.k, x0 + 1, y - 1, W - 2, 2);                              // cantos arredondados
    F(P[2], x0, y, W, H - 1); F(P[1], x0, y, W, 2); F(P[1], x0, y, 2, H - 2); F(P[3], x0 + W - 3, y + 1, 3, H - 2); F(P[4], x0, y + H - 3, W, 2);
    // grade do alto-falante (tecido creme com tramas) que "pulsa" 1 px na batida
    const beat = on && (t * 4 | 0) % 2 ? 1 : 0;
    F(P.k, x0 + 3, y + 4, 15, 13); F(P.w, x0 + 4, y + 5, 13, 11);
    for (let j = 0; j < 11; j += 2) for (let i = (j >> 1) % 2; i < 13; i += 2) F(beat && j > 2 && j < 8 && i > 3 && i < 10 ? P.P : P.p, x0 + 4 + i, y + 5 + j, 1, 1);
    // mostrador: vidro claro com escala e ponteiro que anda quando toca
    F(P.k, x0 + 20, y + 4, 11, 7); F(on ? P.y : P.C, x0 + 21, y + 5, 9, 5); for (let i = 0; i < 9; i += 2) F(P[4], x0 + 21 + i, y + 9, 1, 1);
    F(P.R, x0 + 22 + Math.round((Math.sin(t * .3) * .5 + .5) * 6 * (on ? 1 : 0)), y + 5, 1, 4);
    // botões e LED
    for (const bx of [x0 + 21, x0 + 27]) { F(P.k, bx, y + 12, 4, 4); F(P.m, bx + 1, y + 13, 2, 2); F(P.W, bx + 1, y + 13, 1, 1); }
    F(P.k, x0 + 25, y + 13, 2, 2); F(on ? P.d : P.q, x0 + 25, y + 13, 1, 1);
    // antena inclinada (1:2) com bolinha
    for (let i = 0; i < 7; i++) F(P.M, x0 + W - 6 + (i >> 1), y - 1 - i, 1, 1); F(P.k, x0 + W - 3, y - 9, 2, 2);
    // notinhas subindo quando toca (uma de cada vez)
    if (on) { const ph = (t * .5) % 1; if (ph < .85) { const nx = x0 + 9 + Math.round(Math.sin(t * 2) * 3), ny = y - 3 - ph * 12 | 0; F(P.k, nx, ny, 2, 2); F(P.k, nx + 1, ny - 3, 1, 3); F(P.k, nx + 2, ny - 3, 1, 1); } }
  },

  // ---------- Aquário: tampa e base pretas, vidro com reflexo, água com superfície ondulando, areia, plantas, peixes e bolhas ----------
  aquarium(x, x0, by, t, st) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 38, H = 28, y = by - H;
    this.contact(x, x0, by, W);
    F(P.k, x0 - 1, y - 1, W + 2, H + 2); F(P.J, x0, y, W, 3); F(P.j, x0, y, W, 1);                // tampa
    F(P.v, x0 + 1, y + 3, W - 2, H - 7);                                                           // água clara (perto da luz)
    F(P.V, x0 + 1, y + 10, W - 2, H - 14); F(P.x, x0 + 1, y + 18, W - 2, H - 22);                    // mais funda, mais escura (faixas)
    for (let i = 0; i < W - 2; i++) if (Math.sin(i / 3 + t * 2) > .3) F(P.W, x0 + 1 + i, y + 4, 1, 1);   // superfície ondulando
    // areia com pedrinhas e plantas balançando
    F(P[1], x0 + 1, y + H - 4, W - 2, 2); F(P[2], x0 + 1, y + H - 2, W - 2, 1); for (let i = 3; i < W - 3; i += 7) F(P.m, x0 + i, y + H - 4, 2, 1);
    for (const [px, hgt, ph] of [[4, 12, 0], [8, 8, 1.3], [31, 14, 2.1]]) for (let j = 0; j < hgt; j++) { const sw = Math.round(Math.sin(t * 1.2 + ph + j / 4) * (j / hgt) * 1.5); F(j % 3 ? P.h : P.G, x0 + px + sw, y + H - 4 - j, 1, 1); F(P.H, x0 + px + 1 + sw, y + H - 4 - j, 1, 1); }
    // peixes: vão e voltam (espelham na volta), velocidades diferentes
    const fish = (sp, yy, c1, c2, off) => { const ph = (t * sp + off) % 2, dir = ph < 1 ? 1 : -1, u = ph < 1 ? ph : 2 - ph, fx = x0 + 4 + Math.round(u * (W - 14)), fy = y + yy + Math.round(Math.sin(t * 2 + off) * 1);
      F(P.k, fx - 1, fy - 1, 8, 5); F(c1, fx, fy, 6, 3); F(c2, fx + (dir > 0 ? 0 : 3), fy + 2, 3, 1);
      if (dir > 0) { F(c1, fx - 2, fy - 1, 2, 1); F(c1, fx - 2, fy + 3, 2, 1); F(P.k, fx + 4, fy, 1, 1); F(P.W, fx + 1, fy, 1, 1); }
      else { F(c1, fx + 6, fy - 1, 2, 1); F(c1, fx + 6, fy + 3, 2, 1); F(P.k, fx + 1, fy, 1, 1); F(P.W, fx + 4, fy, 1, 1); } };
    fish(.12, 9, P.O, P[8], 0); fish(.09, 16, P.Y, P.z, .7);
    // bolhas do filtro subindo (somem na superfície)
    F(P.M, x0 + W - 6, y + 3, 3, 10); for (let n = 0; n < 3; n++) { const ph = (t * .6 + n * .33) % 1, by2 = y + 12 - ph * 8 | 0; F(P.W, x0 + W - 5 + (n % 2), by2, 1, 1); }
    // vidro: reflexo vertical e borda clara
    F('rgba(255,255,255,.35)', x0 + 2, y + 5, 1, H - 11); F('rgba(255,255,255,.2)', x0 + 4, y + 5, 1, H - 13);
    F(P.k, x0, y + H - 1, W, 1); F(P.J, x0 - 1, y + H, W + 2, 2);                                   // base
  },

  // ---------- Cacto em vaso de cerâmica: braços, espinhos, flor que abre e fecha devagar ----------
  cactus(x, x0, by, t) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), cx = x0 + 8;
    this.contact(x, x0, by, 16);
    // vaso
    F(P.k, x0, by - 8, 17, 8); F(P.T, x0 + 1, by - 7, 15, 6); F(P.t, x0 + 1, by - 7, 3, 6); F(P.u, x0 + 12, by - 7, 4, 6); F(P.k, x0 - 1, by - 10, 19, 3); F(P.t, x0, by - 9, 17, 1);
    // tronco e braços (luz à esquerda: g/G/h)
    F(P.k, cx - 3, by - 26, 7, 17); F(P.G, cx - 2, by - 25, 5, 16); F(P.g, cx - 2, by - 25, 1, 15); F(P.h, cx + 1, by - 25, 2, 16);
    F(P.k, cx - 8, by - 20, 6, 4); F(P.k, cx - 8, by - 24, 3, 6); F(P.G, cx - 7, by - 23, 1, 5); F(P.G, cx - 7, by - 19, 4, 2); F(P.g, cx - 7, by - 23, 1, 2);
    F(P.k, cx + 3, by - 17, 6, 4); F(P.k, cx + 6, by - 22, 3, 6); F(P.h, cx + 7, by - 21, 1, 5); F(P.G, cx + 4, by - 16, 4, 2);
    for (let j = 0; j < 14; j += 3) { F(P.W, cx - 3, by - 24 + j, 1, 1); F(P.W, cx + 3, by - 23 + j, 1, 1); }   // espinhos
    const open = Math.sin(t * .15) > 0; F(P.k, cx - 1, by - 29, 3, 3); F(open ? P.r : P.R, cx, by - 28, 1, 1); if (open) { F(P.r, cx - 1, by - 28, 1, 1); F(P.r, cx + 1, by - 28, 1, 1); F(P.Y, cx, by - 29, 1, 1); }
  },

  // ---------- Globo: esfera com continentes que giram (ao clicar acelera), meridiano de latão e base ----------
  GLOBE_MAP: (() => { const R = Office.rng(77), m = []; for (let j = 0; j < 14; j++) { const row = []; for (let i = 0; i < 40; i++) row.push(Math.sin(i / 4 + j / 3) + Math.sin(i / 7 - j / 2) * .8 + (R() - .5) * .6 > .7 ? 1 : 0); m.push(row); } return m; })(),
  globe(x, x0, by, t, st) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), cx = x0 + 9, cy = by - 16, r = 7, spin = (st.spin || 0) + t * 1.2;
    this.contact(x, x0 + 2, by, 14);
    // base de madeira torneada: disco com tampo claro à esquerda e frente escura; pé com anel de latão
    F(P.k, x0 + 2, by - 4, 15, 4); F(P[2], x0 + 3, by - 4, 13, 2); F(P[1], x0 + 3, by - 4, 5, 1); F(P[3], x0 + 11, by - 4, 5, 2); F(P[3], x0 + 3, by - 2, 13, 1); F(P[4], x0 + 12, by - 2, 4, 1);
    F(P.k, cx - 2, by - 8, 5, 5); F(P[2], cx - 1, by - 8, 3, 4); F(P[1], cx - 1, by - 8, 1, 4); F(P[4], cx + 1, by - 8, 1, 4); F(P.z, cx - 1, by - 6, 3, 1); F(P.Y, cx - 1, by - 6, 1, 1);
    // esfera: oceano em 3 tons pela luz, continentes do mapa deslocados pelo giro
    this.disc(x, cx, cy, r + 1, P.k);
    for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); for (let i = -w; i <= w; i++) {
      const lit = (i + j) / r, u = Math.round((Math.asin(Math.max(-1, Math.min(1, i / (w + .01)))) / Math.PI + .5) * 13 + spin * 2) , v = Math.round((j + r) / (2 * r) * 13);
      const land = this.GLOBE_MAP[Math.min(13, v)][((u % 40) + 40) % 40];
      F(land ? (lit < -.5 ? P.g : lit < .5 ? P.G : P.h) : (lit < -.5 ? P.l : lit < .5 ? P.L : P[7]), cx + i, cy + j, 1, 1); } }
    F(P.W, cx - 4, cy - 4, 2, 1); F(P.W, cx - 5, cy - 3, 1, 1);                                     // brilho do verniz
    // meridiano de latão: meio anel na lateral direita (2 px: face iluminada em cima, sombra embaixo), pinos nos polos
    for (let a = -1.62; a <= 1.62; a += .06) { const c = Math.cos(a), sn = Math.sin(a);
      F(P.k, cx + Math.round(c * (r + 3)), cy + Math.round(sn * (r + 3)), 1, 1);
      F(sn < -.3 ? P.y : sn < .4 ? P.Y : P.z, cx + Math.round(c * (r + 2)), cy + Math.round(sn * (r + 2)), 1, 1); }
    F(P.k, cx - 1, cy - r - 4, 3, 2); F(P.Y, cx, cy - r - 4, 1, 1); F(P.k, cx - 1, cy + r + 2, 3, 2); F(P.z, cx, cy + r + 3, 1, 1);
  },

  // ---------- Livros: pilha deitada com lombadas coloridas, páginas visíveis e marcador; um em pé encostado ----------
  books(x, x0, by) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a);
    this.contact(x, x0, by, 26);
    const book = (bx, y, w, c, cd, ch) => { F(P.k, bx - 1, y - 1, w + 2, 6); F(c, bx, y, w, 4); F(ch, bx, y, w, 1); F(cd, bx, y + 3, w, 1);
      F(P.w, bx + w - 4, y + 1, 3, 2); F(P.p, bx + w - 4, y + 2, 3, 1); F(P.Y, bx + 3, y + 1, 4, 1); };
    book(x0, by - 5, 24, P.L, P[7], P.l); book(x0 + 2, by - 10, 21, P.T, P.u, P.t); book(x0 + 1, by - 15, 22, P.F, P[9], P.f);
    F(P.R, x0 + 16, by - 16, 1, 4); F(P.R, x0 + 17, by - 13, 1, 2);                                // marcador de fita
    // livro em pé, encostado
    F(P.k, x0 + 24, by - 22, 6, 22); F(P.I, x0 + 25, by - 21, 4, 20); F(P.i, x0 + 25, by - 21, 1, 20); F(P[6], x0 + 28, by - 21, 1, 20); F(P.y, x0 + 25, by - 17, 4, 1); F(P.y, x0 + 25, by - 6, 4, 1);
  },

  // ---------- Caixa de som: gabinete com laterais de madeira, tweeter e woofer com cone; pulsa com a música ----------
  speaker(x, x0, by, t, st) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 12, H = 22, y = by - H, kick = st.sound && (t * 4 | 0) % 2;
    this.contact(x, x0, by, W);
    F(P.k, x0 - 1, y - 1, W + 2, H + 1); F(P.J, x0, y, W, H); F(P.j, x0, y, 2, H); F(P[0], x0 + W - 2, y, 2, H); F(P.j, x0, y, W, 1);
    this.disc(x, x0 + 6, y + 5, 2, P.k); F(P.M, x0 + 5, y + 4, 2, 2); F(P.m, x0 + 5, y + 4, 1, 1);  // tweeter
    this.disc(x, x0 + 6, y + 14, 4, P.k); this.disc(x, x0 + 6, y + 14, 3, kick ? P.j : P.J); this.disc(x, x0 + 6, y + 14, 1, P.k); F(P.M, x0 + 4, y + 12, 2, 1);   // woofer
  },

  // ---------- Diploma emoldurado: moldura dourada em bisel, papel com selo vermelho e fita, assinatura ----------
  diploma(x, x0, y) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 30, H = 22;
    F('rgba(42,31,45,.3)', x0 + 2, y + 2, W, H);                                                   // sombra na parede
    F(P.k, x0 - 1, y - 1, W + 2, H + 2); F(P.z, x0, y, W, H); F(P.Y, x0, y, W, 1); F(P.Y, x0, y, 1, H); F(P.Z, x0 + W - 1, y, 1, H); F(P.Z, x0, y + H - 1, W, 1);
    F(P.k, x0 + 2, y + 2, W - 4, H - 4); F(P.W, x0 + 3, y + 3, W - 6, H - 6); F(P.w, x0 + 3, y + H - 5, W - 6, 2);
    F(P.k, x0 + 7, y + 5, 16, 1); for (let l = 0; l < 3; l++) F(P.p, x0 + 6, y + 8 + l * 2, 18 - l * 4, 1);
    this.disc(x, x0 + 21, y + 14, 2, P.R); F(P.r, x0 + 20, y + 13, 1, 1); F(P.q, x0 + 20, y + 17, 1, 2); F(P.q, x0 + 22, y + 17, 1, 2);   // selo com fita
    F(P.k, x0 + 6, y + 15, 5, 1); F(P.k, x0 + 8, y + 14, 2, 1);                                      // assinatura
  },
  // ---------- Quadro de paisagem: moldura de madeira escura, céu em faixas, montanhas com neve, lago com reflexo ----------
  painting(x, x0, y, t) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 34, H = 24;
    F('rgba(42,31,45,.3)', x0 + 2, y + 2, W, H);
    F(P.k, x0 - 1, y - 1, W + 2, H + 2); F(P[3], x0, y, W, H); F(P[2], x0, y, W, 1); F(P[2], x0, y, 1, H); F(P[4], x0 + W - 1, y, 1, H); F(P[4], x0, y + H - 1, W, 1);
    const ix = x0 + 3, iy = y + 3, iw = W - 6, ih = H - 6; F(P.k, ix - 1, iy - 1, iw + 2, ih + 2);
    F(P.l, ix, iy, iw, 4); F(P.v, ix, iy + 4, iw, 4); F(P.y, ix + iw - 7, iy + 2, 3, 3);
    for (let i = 0; i < iw; i++) { const h = Math.round(5 + Math.sin(i / 3.5) * 3 + Math.sin(i / 1.7) * 1); F(P.b, ix + i, iy + 11 - h, 1, h); if (h > 6) F(P.W, ix + i, iy + 11 - h, 1, 1); }
    F(P.G, ix, iy + 11, iw, 2); F(P.x, ix, iy + 13, iw, ih - 13); for (let i = 0; i < iw; i += 3) F(P.V, ix + i + ((t * 2 | 0) % 2), iy + 14, 2, 1);
  },
  // ---------- Letreiro neon: tubos de 2 px escrevendo CAFÉ, halo em anel, oscila e às vezes falha ----------
  neon(x, x0, y, t) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), word = 'CAFE', off = (t % 11) < .12 || ((t % 11) > .3 && (t % 11) < .38);
    F(P.k, x0 - 1, y - 1, 34, 18); F(P[0], x0, y, 32, 16); F(P.N, x0, y, 32, 1);                     // placa escura
    const tube = off ? P.q : P.r, glow = off ? null : 'rgba(239,75,63,.35)';
    [...word].forEach((ch, n) => { const g = Pixel.FONT[ch]; for (let k = 0; k < 15; k++) if (g[k] === '1') { const px = x0 + 3 + n * 7 + (k % 3) * 2, py = y + 3 + (k / 3 | 0) * 2;
      if (glow) F(glow, px - 1, py - 1, 4, 4); F(tube, px, py, 2, 2); if (!off) F(P.W, px, py, 1, 1); } });
    F(P.k, x0 + 30, y + 2, 1, 1); if (!off) F(P.R, x0 + 29, y + 2, 1, 1);                            // acento
  },
  // ---------- Porta-retrato com cavalete: moldura de madeira em bisel, foto (paisagem com sol), reflexo do vidro ----------
  frame(x, x0, by) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a), W = 20, H = 24, y = by - H;
    this.contact(x, x0, by, W);
    F(P.k, x0 + W - 4, y + 6, 3, H - 6); F(P[4], x0 + W - 3, y + 7, 1, H - 7);                    // pé do cavalete
    F(P.k, x0 - 1, y - 1, W + 2, H + 1); F(P[2], x0, y, W, H); F(P[1], x0, y, W, 2); F(P[1], x0, y, 2, H); F(P[3], x0 + W - 2, y, 2, H); F(P[3], x0, y + H - 2, W, 2);
    F(P.k, x0 + 3, y + 3, W - 6, H - 6); F(P.l, x0 + 4, y + 4, W - 8, 8); F(P.y, x0 + W - 8, y + 5, 3, 3);   // céu e sol
    F(P.G, x0 + 4, y + 12, W - 8, 3); F(P.h, x0 + 4, y + 15, W - 8, H - 19); F(P.T, x0 + 7, y + 10, 2, 5); F(P.L, x0 + 11, y + 11, 2, 4);   // grama e duas pessoinhas
    F('rgba(255,255,255,.45)', x0 + 4, y + 4, 2, 1); F('rgba(255,255,255,.45)', x0 + 5, y + 5, 1, 1); F('rgba(255,255,255,.3)', x0 + W - 6, y + H - 8, 1, 2);
  },
};

/* ================= Gato: personagem com estados (máquina de estados leve e reutilizável) ================= */
// O gato é montado por partes (corpo, cabeça, orelhas, olhos, patas, cauda) numa grade de materiais e depois pintado
// com a pelagem escolhida. Cada pose é desenhada (não é um sprite girado). Estados: parado, sono, alongar, limpar,
// curioso, carinho. Durações variadas e escolha ponderada; o clique dispara carinho. Com movimento reduzido: só pisca.
const CAT_K = 1.3;   // gato da mesa ~30% maior que o modelo base (39×34 px de arte)
const CAT_PAL = {
  tricolor:         { base: ['W', 'w', 'p'], a: ['1', '2', '3'], b: ['K', 'k', 'k'], pat: 'patch' },
  'cinza-tigrado':  { base: ['m', 'M', 'j'], a: ['j', 'J', 'J'], pat: 'stripe' },
  'laranja-tigrado':{ base: ['1', '2', '3'], a: ['3', '4', '4'], pat: 'stripe' },
  laranja:          { base: ['1', '2', '3'], pat: 'none', chest: ['W', 'w', 'p'] },
  preto:            { base: ['K', 'J', 'k'], pat: 'none' },
  branco:           { base: ['W', 'w', 'p'], pat: 'none' },
  frajola:          { base: ['K', 'J', 'k'], pat: 'tux', chest: ['W', 'w', 'p'] },
  siames:           { base: ['c', 'C', 'e'], a: ['3', '4', '4'], pat: 'points' },
};
const CatAI = {
  STATES: { idle: [4, 9, 5], tail: [3, 6, 3], sleep: [8, 16, 2], stretch: [1.8, 1.8, 1], groom: [3, 4.5, 2], curious: [2.5, 4, 2] },
  make() { return { state: 'idle', t0: 0, dur: 5, pet: -9 }; },
  step(c, t) {
    if (t - c.t0 < c.dur) return c;
    const S = this.STATES, pool = []; for (const k in S) if (k !== c.state || k === 'idle') for (let i = 0; i < S[k][2]; i++) pool.push(k);
    const k = Motion.reduced.matches ? 'idle' : pool[Math.random() * pool.length | 0]; c.state = k; c.t0 = t; c.dur = S[k][0] + Math.random() * (S[k][1] - S[k][0]); return c;
  },
  poke(c, t) { c.pet = t; c.state = 'idle'; c.t0 = t; c.dur = 4; },
};
// k: tamanho do modelo. A geometria é refeita na grade maior (elipses e partes redesenhadas), nunca uma imagem ampliada.
function catDraw(x, x0, by, coat, c, t, k = CAT_K) {
  const W = Math.round(30 * k), H = Math.round(26 * k), g = new Array(W * H).fill(null), put = (i, j, m) => { i |= 0; j |= 0; if (i >= 0 && j >= 0 && i < W && j < H) g[j * W + i] = m; };
  const ell = (cx, cy, rx, ry, m) => { for (let j = Math.floor(cy - ry); j <= cy + ry; j++) for (let i = Math.floor(cx - rx); i <= cx + rx; i++) if (((i + .5 - cx) / rx) ** 2 + ((j + .5 - cy) / ry) ** 2 <= 1) put(i, j, m); };
  const el = t - c.t0, st = c.state, petting = t - c.pet < 1.8, B = H - 1, R = v => Math.round(v * k);
  // pose: valores por estado e fase (cada combinação é um quadro desenhado)
  let headY = B - R(17), headX = R(10), bodyRX = 8 * k, bodyRY = 7 * k, bodyY = B - R(7), eyes = 'open', paw = 0, earFlick = 0, look = 0, tailA = Math.sin(t * 1.6) * .6, breath = 0;
  if ((t % 5.3) < .14 || (el % 3.7) < .1) eyes = 'closed';                                          // piscadas
  if (st === 'idle') { if ((t % 7) < .3) earFlick = 1; if (Math.sin(t * 1.1) > .985) look = 1; breath = Math.sin(t * 2.2) > 0 ? 0 : 1; }
  if (st === 'tail') tailA = Math.sin(t * (3 + Math.sin(t * .7))) * 1.1;
  if (st === 'sleep') { const q = Math.min(1, el / 2); eyes = q < .5 ? 'half' : 'closed'; headY += R(q * 4); headX += R(q * 2); tailA = .9; bodyRY = 6 * k; breath = Math.sin(t * 1.5) > 0 ? 1 : 0; }
  if (st === 'stretch') { const f = Math.min(1, el / .5) * (el > 1.3 ? Math.max(0, 1 - (el - 1.3) / .5) : 1); bodyRX = (8 + f * 4) * k; bodyRY = (7 - f * 3) * k; bodyY = B - R(7 - f * 2); headY = B - R(17 - f * 6); headX = R(10 - f * 4); eyes = f > .5 ? 'closed' : eyes; tailA = -.8 * f + .3; }
  if (st === 'groom') { const ph = (el * 2.4) % 1; paw = ph < .5 ? 1 : 2; eyes = 'closed'; headX -= 1; }
  if (st === 'curious') { headY -= R(2); look = Math.sin(el * 1.4) > 0 ? 1 : -1; earFlick = (el * 3 | 0) % 2; }
  if (petting) { eyes = 'happy'; headY += 1; tailA = Math.sin(t * 6) * .4 + .5; }
  bodyRY += breath * .5;                                                                             // respiração: 1 px no lombo
  // cauda (atrás), corpo, peito, patas, cabeça, orelhas
  const tw = Math.max(2, R(2)), n = R(12);
  for (let s = 0; s < n; s++) { const a = -1.2 + s / (n - 1) * (1.6 + tailA), r = (9 + s / k * .3) * k, tx = R(19) + Math.cos(a) * r * .6 + s * .6, ty = B - R(3) - Math.sin(a + 1.2) * s * .9; for (let w = 0; w < tw; w++) put(tx + w, ty, 'tail'); }
  ell(R(15), bodyY, bodyRX, bodyRY, 'body');
  ell(headX + R(3), B - R(6), 3 * k, 4 * k, 'chest');
  const pw = R(2), pawsY = B - pw; for (const px of [headX + R(1), headX + R(5)]) for (let a = 0; a < pw + 1; a++) for (let b = 0; b <= pw; b++) put(px + a, pawsY + b, b === pw && a === 1 ? 'toe' : 'paw');
  ell(headX + R(3), headY + R(4), 6 * k, 5 * k, 'head');
  // bochechas: 1 px a mais de cada lado na altura da boca (cara de gato, não de bola)
  for (const d of [-1, 1]) { put(headX + R(3) + d * R(6.4), headY + R(5.5), 'head'); put(headX + R(3) + d * R(6.4), headY + R(6.3), 'head'); }
  // limpeza: a pata sobe na frente do rosto (dois quadros: alta lambendo, mais baixa esfregando)
  if (paw) { const py = paw === 1 ? headY + R(4) : headY + R(6); for (let j = 0; j < R(5); j++) for (let a = -1; a < pw; a++) put(headX + a, py + j, 'paw'); }
  const eh = R(4), ear = (ex, flip, down) => { for (let j = 0; j < eh; j++) for (let i = 0; i <= eh - 1 - j; i++) put(ex + (flip ? -i : i), headY - 1 - j + down, j < eh - 1 && i > 0 && i < eh - 1 - j ? 'earIn' : 'ear'); };
  ear(headX - R(2), false, 0); ear(headX + R(8), true, earFlick);
  // olhos (2×2 com reflexo e pupila vertical), focinho claro, nariz e boca
  const ey = headY + R(3), ex1 = headX + look, ex2 = headX + R(5) + look;
  if (eyes === 'open') { for (const ex of [ex1, ex2]) { put(ex, ey, 'glint'); put(ex + 1, ey, 'eye'); put(ex, ey + 1, 'eye'); put(ex + 1, ey + 1, 'pupil'); if (k > 1.15) { put(ex, ey + 2, 'eyeD'); put(ex + 1, ey + 2, 'pupil'); } } }
  else if (eyes === 'half') { for (const ex of [ex1, ex2]) { put(ex, ey + 1, 'eye'); put(ex + 1, ey + 1, 'pupil'); put(ex, ey, 'lid'); put(ex + 1, ey, 'lid'); } }
  else if (eyes === 'happy') { for (const ex of [ex1, ex2]) { put(ex, ey + 1, 'lid'); put(ex + 1, ey, 'lid'); put(ex + 2, ey + 1, 'lid'); } }
  else for (const ex of [ex1, ex2]) { put(ex, ey + 1, 'lid'); put(ex + 1, ey + 1, 'lid'); }
  const nx = headX + R(3) + look, ny = headY + R(5);
  put(nx - 1, ny + 1, 'muzzle'); put(nx + 1, ny + 1, 'muzzle'); put(nx, ny, 'nose'); put(nx, ny + 1, 'mouth');
  if (petting || st === 'groom') { put(nx - 1, ny + 2, 'mouth'); put(nx + 1, ny + 2, 'mouth'); }
  // pintura com a pelagem: luz de cima à esquerda (tom 0 em cima/esquerda, 2 embaixo/direita), padrão por pelagem
  const pal = CAT_PAL[coat] || CAT_PAL.laranja, P = WD_PAL, M = (i, j) => (i >= 0 && j >= 0 && i < W && j < H) ? g[j * W + i] : null;
  const furParts = { body: 1, head: 1, tail: 1, paw: 1, ear: 1, chest: 1, muzzle: 1 };
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const m = M(i, j);
    if (!m) { if ([M(i - 1, j), M(i + 1, j), M(i, j - 1), M(i, j + 1)].some(Boolean)) this.ART_F(x, P.k, x0 + i, by - H + j, 1, 1); continue; }
    let col;
    if (furParts[m]) {
      const edgeR = !M(i + 1, j) || !M(i, j + 1), edgeL = !M(i - 1, j) || !M(i, j - 1), tone = m === 'muzzle' ? 0 : edgeR ? 2 : edgeL ? 0 : 1;
      let ramp = pal.base;
      if (pal.pat === 'stripe' && (m === 'body' || m === 'tail' || (m === 'head' && j < headY + R(2))) && ((i + (m === 'tail' ? 0 : j >> 1)) % R(4) === 0)) ramp = pal.a;
      if (pal.pat === 'patch' && ((i < R(12) && j < B - R(8) && m !== 'chest') || (m === 'tail' && i > R(22)))) ramp = pal.a;
      if (pal.pat === 'patch' && m === 'head' && i > headX + R(4) && j < headY + R(4)) ramp = pal.b;
      if (pal.pat === 'points' && (m === 'ear' || m === 'paw' || m === 'tail' || (m === 'head' && ((i + .5 - headX - R(3)) / (3.6 * k)) ** 2 + ((j + .5 - headY - R(6)) / (3.2 * k)) ** 2 <= 1))) ramp = pal.a;   // máscara oval
      if ((pal.pat === 'tux' || pal.chest) && (m === 'chest' || m === 'paw' || (m === 'head' && j >= headY + R(5) && Math.abs(i - headX - R(3)) < R(3)))) ramp = pal.chest || pal.base;
      col = P[ramp[tone]];
    } else col = { earIn: P.r, eye: coat === 'siames' ? P.l : P.d, eyeD: coat === 'siames' ? P.L : P.D, glint: P['+'], pupil: P.k, lid: P.k, nose: P.r, mouth: P.q, toe: P.r }[m];
    this.ART_F(x, col, x0 + i, by - H + j, 1, 1);
  }
  if (petting) { const k = t - c.pet; if (k < 1.5) { const hy = by - H - 2 - Math.round(k * 6); this.ART_F(x, P.R, x0 + headX + 8, hy, 3, 1); this.ART_F(x, P.R, x0 + headX + 7, hy - 1, 2, 1); this.ART_F(x, P.R, x0 + headX + 10, hy - 1, 2, 1); this.ART_F(x, P.R, x0 + headX + 9, hy + 1, 1, 1); } }
  if (c.state === 'sleep' && el > 2) { const k = (t * .5) % 1; x.fillStyle = P.K; Pixel.text(x, 'Z', x0 + headX + 9 + Math.round(k * 3), by - H - Math.round(k * 6), P.K); }
}
catDraw.ART_F = ART.F;
function catDrawBound(...a) { return catDraw.call({ ART_F: (x, c, ...r) => ART.F(x, c, ...r) }, ...a); }

// Estado compartilhado dos objetos vivos do escritório
var OFFICE_APPEAR = {};                       // id → instante em que apareceu (animação de instalação)
var OFFICE_CAT = CatAI.make();
var OFFICE_DUCK = { at: -9 };
var OFFICE_GLOBE = { from: 0, to: 0, at: 0,
  spin() { const k = Math.min(1, (performance.now() - this.at) / 1600); return this.from + (this.to - this.from) * (1 - (1 - k) ** 3); },
  kick() { this.from = this.spin(); this.to = this.from + 30; this.at = performance.now(); } };
function OFFICE_LIVE() { return typeof Call !== 'undefined' && !!Call.el; }
// Pato: balança 1 px para os lados por ~1 s depois do clique (quadros desenhados por deslocamento inteiro + bico aberto)
function duckDraw(x, x0, by, t) {
  const d = DECOR_EXTRA.pato, k = (performance.now() - OFFICE_DUCK.at) / 1000, wob = k < 1 ? [0, -1, 0, 1][(k * 12 | 0) % 4] : 0;
  ART.contact(x, x0, by, 16); x.drawImage(Pixel.master(d.rows, WD_PAL), x0 + wob, by - d.rows.length);
  if (k < .6) { ART.F(x, WD_PAL.k, x0 + 12 + wob, by - 11, 2, 1); }
}
// Áreas clicáveis dos objetos vivos (coordenadas de arte)
function officeArtHit(L, ax, ay) {
  const Q = Office.deskSlots(L, Office._decor || []), D = Office._decor || [], inR = (q, w, h) => q && ax >= q.x && ax < q.x + w && ay >= q.y - h && ay <= q.y;
  if (D.includes('gato') && inR(Q.gato, Math.round(30 * CAT_K), Math.round(26 * CAT_K))) return 'gato';
  if (D.includes('globo') && inR(Q.globo, 19, 26)) return 'globo';
  if (D.includes('pato') && inR(Q.pato, 18, 16)) return 'pato';
  return null;
}
