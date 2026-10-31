/* ================= Cena do escritório (canvas) ================= */
// Resolução virtual de referência 640×360. O canvas cresce em pixels de arte para preencher qualquer proporção
// (sem barras nem distorção) e é ampliado por escala inteira de pixels físicos. O monitor domina a cena;
// a área da tela é devolvida para posicionar o jogo em HTML exatamente por cima.
const Office = {
  BASE_W: 640, BASE_H: 360,
  BEZEL: 5, CHIN: 9, TOP: 3, DESK: 30, SIDE: 40,
  rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },

  // Escala inteira em pixels físicos e tamanho do canvas em pixels de arte
  measure(cssW, cssH, dprOverride) {
    const dpr = dprOverride || window.devicePixelRatio || 1;
    // A altura manda na escala; a largura mínima de 480 px de arte deixa telas 4:3 e 16:10 com a mesma escala das 16:9
    const S = Math.max(1, Math.floor(Math.min(cssW * dpr / 480, cssH * dpr / this.BASE_H)));  // pixels físicos por pixel de arte
    const k = S / dpr;                                                                                   // pixels CSS por pixel de arte
    return { S, k, dpr, VW: Math.ceil(cssW / k), VH: Math.ceil(cssH / k) };
  },

  // Composição em pixels de arte: moldura fina, tela o maior possível, faixas laterais para o ambiente
  layout(VW, VH, FW = VW, FH = VH) {
    const desk = VH - this.DESK, chinBottom = desk - 4;
    // Tela o maior possível com proporção entre 4:3 e 16:9 (o jogo em HTML se adapta).
    // FW×FH limita o tamanho quando o jogador escolhe uma resolução menor que a janela.
    let sh = Math.min(FH, VH) - this.DESK - 4 - this.CHIN - this.TOP - this.BEZEL;
    const maxW = Math.min(FW, VW) - 2 * (this.BEZEL + this.SIDE);
    let sw = Math.min(maxW, Math.round(sh * 16 / 9));
    if (sw / sh < 4 / 3) sh = Math.round(sw * 3 / 4);
    const sx = Math.round((VW - sw) / 2), sy = chinBottom - this.CHIN - sh;
    const mon = { x: sx - this.BEZEL, y: sy - this.BEZEL, w: sw + this.BEZEL * 2, h: sh + this.BEZEL + this.CHIN };
    const kw = Math.min(180, sw * .36 | 0), kx = (VW - kw) / 2 | 0;
    const back = Math.max(desk - 46, Math.round(VH * .7));   // fundo do tampo (encosta na parede), escondido em parte pelo monitor
    return { VW, VH, desk, back, screen: { x: sx, y: sy, w: sw, h: sh }, mon, left: mon.x, right: VW - (mon.x + mon.w), kx, kw };
  },

  // Céu e luz conforme a hora do expediente (9 a 18)
  // Luz contínua ao longo do expediente: cores do céu, véu da hora e feixe da janela interpolados entre momentos-chave
  LIGHT_KEYS: [
    { k: 0,   top: [143, 203, 232], bot: [201, 236, 247], tint: [255, 214, 140, .10, 'screen'], beam: [255, 236, 170, .30] },
    { k: .45, top: [120, 190, 230], bot: [214, 240, 248], tint: [255, 255, 255, 0, 'source-over'], beam: [255, 248, 220, .22] },
    { k: .68, top: [246, 169, 108], bot: [255, 224, 168], tint: [240, 150, 80, .10, 'multiply'], beam: [255, 190, 110, .34] },
    { k: .85, top: [109, 79, 140],  bot: [228, 138, 106], tint: [240, 120, 70, .18, 'multiply'], beam: [255, 150, 110, .30] },
    { k: 1,   top: [43, 35, 64],    bot: [117, 55, 99],   tint: [110, 70, 150, .30, 'multiply'], beam: [200, 160, 255, .12] },
  ],
  light(hour) {
    const k = Math.max(0, Math.min(1, (hour - 9) / 9)), K = this.LIGHT_KEYS;
    let i = 0; while (i < K.length - 2 && k > K[i + 1].k) i++;
    const a = K[i], b = K[i + 1], f = Math.max(0, Math.min(1, (k - a.k) / (b.k - a.k))), mix = (p, q) => p.map((v, n) => typeof v === 'number' ? v + (q[n] - v) * f : (f < .5 ? v : q[n]));
    const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`, rgba = c => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
    const top = mix(a.top, b.top), bot = mix(a.bot, b.bot), tint = mix(a.tint, b.tint), beam = mix(a.beam, b.beam);
    return { k, top, bot, sky: [rgb(bot), rgb(top)], tint: [rgba(tint), tint[4]], beam: rgba(beam), beamRGB: beam, cloud: k < .75 ? '#ffffff' : '#f6c7b8' };
  },
  // Clima do dia (estável por dia): limpo, nublado, chuva ou neve
  weather(day) { const r = Office.rng(day * 7919 + 13)(); return r < .5 ? 'clear' : r < .75 ? 'cloudy' : r < .93 ? 'rain' : 'snow'; },
  // Céu vivo: degradê pontilhado, nuvens, prédios com janelas que acendem e apagam, letreiro, clima e passantes
  sky(ctx, W, st, t, lit) {
    const P = WD_PAL, F = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a | 0, b | 0, w, h); }, wx = st.weather || 'clear';
    const key = W.w + 'x' + W.h + ':' + (st.hour * 20 | 0) + wx;
    if (this._skyKey !== key) {     // céu em cache por minuto do jogo: muda suave sem custo por quadro
      this._skyKey = key; const c = this._skyC || (this._skyC = document.createElement('canvas')); c.width = W.w; c.height = W.h;
      const x = c.getContext('2d'), B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], gray = wx === 'rain' || wx === 'snow' ? .45 : wx === 'cloudy' ? .2 : 0;
      const img = x.createImageData(W.w, W.h), d = img.data;
      for (let j = 0; j < W.h; j++) { const f = j / W.h; for (let i = 0; i < W.w; i++) { const g = Math.max(0, Math.min(1, f + (B[(i & 3) + ((j & 3) << 2)] / 16 - .5) * .12)), o = (j * W.w + i) * 4;
        for (let n = 0; n < 3; n++) { const c0 = lit.top[n] + (lit.bot[n] - lit.top[n]) * g; d[o + n] = Math.round(c0 + (150 - c0) * gray); } d[o + 3] = 255; } }
      x.putImageData(img, 0, 0);
    }
    ctx.drawImage(this._skyC, W.x, W.y);
    // estrelas no fim do dia
    if (lit.k > .8 && wx === 'clear') for (let i = 0; i < 14; i++) if (Math.sin(t * 1.3 + i * 2.1) > -.2) F(i % 4 ? P.W : P.y, W.x + (i * 37) % W.w, W.y + (i * 23) % (W.h * .4), 1, 1);
    // nuvens: quantidade e cor pelo clima
    const nC = wx === 'clear' ? 3 : wx === 'cloudy' ? 7 : 9, cc = wx === 'rain' ? P.M : wx === 'snow' ? P.m : lit.cloud;
    for (let n = 0; n < nC; n++) { const sp = 1 + (n % 3) * .6, w = 10 + (n * 7) % 14, cx = ((t * sp + n * 41) % (W.w + w + 20)) - w - 10 + W.x, cy = W.y + 6 + (n * 13) % (W.h * .45);
      F(cc, cx, cy, w, 3); F(cc, cx + 2, cy - 2, w - 5, 2); F(cc, cx + 4, cy - 3, Math.max(2, w - 9), 1); if (wx !== 'clear') F(P.j, cx, cy + 3, w, 1); }
    // passantes: um por vez, escolhido pelo tempo (avião, helicóptero, balão, bando de pássaros)
    const slot = t / 18 | 0, ph = (t % 18) / 18, kind = ['plane', 'birds', 'heli', 'birds', 'balloon', 'plane'][(slot * 2654435761 >>> 0) % 6];
    if (wx !== 'rain' || kind === 'plane') {
      const yy = W.y + 10 + ((slot * 37) % (W.h * .3));
      if (kind === 'plane') { const ax = W.x + W.w + 10 - ph * (W.w + 40); F(P.m, ax, yy, 6, 1); F(P.m, ax + 3, yy - 1, 2, 1); F(P.W, ax + 6, yy, Math.min(30, ph * 60), 1); if ((t * 3 | 0) % 2) F(P.R, ax, yy, 1, 1); }
      if (kind === 'heli') { const hx = W.x - 10 + ph * (W.w + 20), hy = yy + Math.sin(t * 2) * 2; F(P.J, hx, hy, 5, 3); F(P.J, hx - 4, hy + 1, 4, 1); F(P.m, hx - 2 + ((t * 20 | 0) % 2) * 3, hy - 1, 7, 1); if ((t * 4 | 0) % 2) F(P.R, hx + 5, hy + 1, 1, 1); }
      if (kind === 'balloon') { const bx = W.x + W.w * .2 + ph * W.w * .6, by = W.y + W.h * .5 - ph * W.h * .35; F(P.R, bx, by, 5, 5); F(P.Q, bx + 1, by, 1, 5); F(P.y, bx + 3, by, 1, 5); F(P.k, bx + 1, by + 6, 3, 2); }
      if (kind === 'birds') for (let n = 0; n < 4; n++) {
        const near = n === 0, bx = W.x - 6 + ph * (W.w + 12) - n * 6, by = yy + n * 3 + Math.round(Math.sin(t * 3 + n)), wg = (t * 8 + n | 0) % 2, c = near ? P.k : P.K;
        if (near) { F(c, bx, by - wg, 2, 1); F(c, bx + 2, by + 1 - wg, 2, 1); F(c, bx + 4, by + 1, 1, 1); F(c, bx + 5, by + 1 - wg, 2, 1); F(c, bx + 7, by - wg, 2, 1); }
        else { F(c, bx, by - wg, 1, 1); F(c, bx + 1, by, 1, 1); F(c, bx + 2, by - wg, 1, 1); }
      }
    }
    // prédios (fixos por janela) com janelas que acendem e apagam ao longo da tarde
    if (!this._bld || this._bldKey !== W.w + 'x' + W.h) {
      this._bldKey = W.w + 'x' + W.h; const R = this.rng(5); this._bld = []; let bx = W.x;
      while (bx < W.x + W.w) { const bw = 5 + R() * 9 | 0, bh = 10 + R() * W.h * .42 | 0; this._bld.push({ x: bx, w: Math.min(bw, W.x + W.w - bx), h: bh, seed: R() * 1000 | 0 }); bx += bw + 1; }
      const big = this._bld.reduce((a, b) => b.h > a.h ? b : a, this._bld[0]); big.sign = true;
    }
    const night = lit.k, base = W.y + W.h, on = Math.max(0, (night - .45) * 1.6);
    for (const b of this._bld) {
      F(night > .75 ? P.N : night > .55 ? P.A : P.b, b.x, base - b.h, b.w, b.h);
      for (let j = base - b.h + 2, r = 0; j < base - 1; j += 3, r++) for (let i = b.x + 1, c = 0; i < b.x + b.w - 1; i += 2, c++) {
        const h = ((b.seed + r * 31 + c * 17) * 2654435761 >>> 0) % 1000 / 1000, flick = ((b.seed + r * 7 + c * 3 + (t / 9 | 0)) * 2246822519 >>> 0) % 100;
        if (h < on && flick > 6) F(h < .08 ? P.l : P.Y, i, j, 1, 1);
      }
      if (b.sign && b.w >= 9) { const sx = b.x, sy = base - b.h - 7, lit2 = night > .55 ? (t * 2 | 0) % 6 ? P.R : P.q : P.q; F(P.k, sx, sy, b.w, 6); F(lit2, sx + 1, sy + 1, b.w - 2, 4); if (b.w > 12) Pixel.text(ctx, (t / 6 | 0) % 2 ? 'CAFE' : 'SALE', sx + 2, sy + 1, P.W); F(P.k, sx + 2, sy + 6, 1, 1); F(P.k, sx + b.w - 3, sy + 6, 1, 1); }
    }
    // chuva e neve na frente de tudo; gotas escorrendo no vidro
    if (wx === 'rain') { for (let n = 0; n < W.w * W.h / 60; n++) { const rx = W.x + ((n * 53 + t * 40) % W.w), ry = W.y + ((n * 97 + t * 160) % W.h); F('rgba(220,235,255,.55)', rx, ry, 1, 3); }
      for (let n = 0; n < 6; n++) { const gx = W.x + 4 + (n * 29) % (W.w - 8), gy = W.y + ((t * (8 + n * 3) + n * 40) % W.h); F('rgba(255,255,255,.6)', gx, gy, 1, 2); } }
    if (wx === 'snow') for (let n = 0; n < W.w * W.h / 90; n++) { const sx = W.x + ((n * 53 + Math.sin(t + n) * 6 + t * 6) % W.w + W.w) % W.w, sy = W.y + ((n * 97 + t * 14) % W.h); F(P.W, sx, sy, 1, 1); }
    // caixilho da janela por cima do céu
    F(P[4], W.x + (W.w >> 1), W.y, 2, W.h);
  },
  // Posições dos objetos: um só lugar define onde cada coisa fica (usado no cache e na animação)
  spots(L) {
    const M = L.mon, s = L.screen;
    return {
      win: (() => { const x0 = Math.max(6, Math.min(20, L.left >> 3)), w = L.mon.x - x0 + Math.min(120, L.mon.w >> 2); return { x: x0, y: 16, w, h: Math.max(54, (L.desk - 30) * .6 | 0), vis: L.mon.x - x0 }; })(),
      plant: { x: Math.max(1, M.x - 26), y: L.back + 18 },
      // Objetos comprados ficam na frente da mesa, fora da tela; só descem para a moldura se não houver espaço
      frame: L.kx - 112 > M.x - 4 ? { x: L.kx - 112, y: L.desk + 5 } : { x: M.x + 6, y: L.desk - 10 },
      trophy: L.kx + L.kw + 106 < L.VW - 34 ? { x: L.kx + L.kw + 92, y: L.desk + 4 } : { x: M.x + M.w - 20, y: L.desk - 12 },
      lamp: { x: Math.min(L.VW - 20, M.x + M.w + 14), y: L.back + 14 },
      // Detalhes do ambiente (não dependem de compras)
      phone: L.kx - 158 > M.x - 4 ? { x: L.kx - 158, y: L.desk + 11 } : null,
      pens: L.kx - 126 > M.x - 4 ? { x: L.kx - 125, y: L.desk + 9 } : null,
      cal: L.right >= 30 ? { x: M.x + M.w + Math.max(5, Math.min(14, (L.right / 2 | 0) - 12)), y: 52 } : null,
      sideMon: { x: M.x + M.w + 4, y: Math.max(40, (s.y + s.h * .28) | 0) },
      clock: { x: M.x + M.w + Math.max(18, Math.min(26, (L.right / 2) | 0)), y: 26 },
      mug: { x: L.kx - 26, y: L.desk + 9 },
      cat: { x: L.kx + L.kw + 66, y: L.desk + 5 },
      nameplate: { x: (L.VW / 2 | 0) - 22, y: L.desk + 2 },
    };
  },

  // Acabamentos do equipamento: rampa própria de 4 tons (brilho, base, sombra, fundo) + cor de letreiro.
  // O grafite não é um filtro: tem brilho metálico frio e sombra arroxeada, como o resto da arte.
  HW: {
    cream:    { hi: '#fbf3e2', base: '#e9dcc2', sh: '#c7b595', dk: '#8f7d63', txt: '#c7b595', key: '#fbf3e2', keySh: '#c7b595' },
    graphite: { hi: '#626875', base: '#3b3f48', sh: '#2b2340', dk: '#2a1f2d', txt: '#626875', key: '#4a3a4e', keySh: '#2b2340' },
    white:    { hi: '#ffffff', base: '#fbf3e2', sh: '#d7d9de', dk: '#9aa0ab', txt: '#d7d9de', key: '#ffffff', keySh: '#d7d9de' },
    black:    { hi: '#4a3a4e', base: '#2a1f2d', sh: '#2b2340', dk: '#2a1f2d', txt: '#4a3a4e', key: '#3b3f48', keySh: '#2a1f2d' },
    silver:   { hi: '#d7d9de', base: '#9aa0ab', sh: '#626875', dk: '#3b3f48', txt: '#d7d9de', key: '#d7d9de', keySh: '#9aa0ab' },
    blue:     { hi: '#c3d5ff', base: '#6f93d9', sh: '#44609f', dk: '#2b2340', txt: '#c3d5ff', key: '#c3d5ff', keySh: '#6f93d9' },
    mint:     { hi: '#a9dccf', base: '#5fa79a', sh: '#2f6f78', dk: '#1f4a52', txt: '#a9dccf', key: '#a9dccf', keySh: '#5fa79a' },
    peach:    { hi: '#ffd0b0', base: '#f2a27a', sh: '#d9714a', dk: '#a24a33', txt: '#ffd0b0', key: '#ffd0b0', keySh: '#f2a27a' },
    grape:    { hi: '#e0cff7', base: '#a983d6', sh: '#7656a8', dk: '#463462', txt: '#e0cff7', key: '#e0cff7', keySh: '#a983d6' },
    lemon:    { hi: '#ffe7a3', base: '#f4c15d', sh: '#c98a2e', dk: '#8a5420', txt: '#ffe7a3', key: '#ffe7a3', keySh: '#f4c15d' },
  },
  ramp(name) { return this.HW[name] || this.HW.cream; },
  // Teclado da mesa em QWERTY físico (KeyboardEvent.code = posição da tecla, independente do idioma do teclado)
  KEYS: (() => {
    const k = [];
    k.push(['Escape', 0, 0, 1]); 'QWERTYUIOP'.split('').forEach((c, i) => k.push(['Key' + c, 0, 1 + i, 1])); k.push(['Backspace', 0, 11, 2], ['Delete', 0, 13, 2]);
    k.push(['CapsLock', 1, 0, 1.5]); 'ASDFGHJKL'.split('').forEach((c, i) => k.push(['Key' + c, 1, 1.5 + i, 1])); k.push(['Enter', 1, 10.5, 2.5], ['Digit1', 1, 13, 1], ['Digit2', 1, 14, 1]);
    k.push(['ShiftLeft', 2, 0, 2]); 'ZXCVBNM'.split('').forEach((c, i) => k.push(['Key' + c, 2, 2 + i, 1])); k.push(['ShiftRight', 2, 9, 3], ['ArrowUp', 2, 13, 1]);
    k.push(['ControlLeft', 3, 0, 1.5], ['AltLeft', 3, 1.5, 1.5], ['Space', 3, 3, 6.5], ['AltRight', 3, 9.5, 1.5], ['ArrowLeft', 3, 12, 1], ['ArrowDown', 3, 13, 1], ['ArrowRight', 3, 14, 1]);
    return k;
  })(),
  // 15 colunas que ocupam o corpo do teclado; teclas de 3 px de altura (2 de face + 1 de sombra) em 4 fileiras
  keyRects(L) {
    if (L._keys) return L._keys;
    const u = Math.max(5, Math.floor((L.kw - 4) / 15)), base = L.kx + ((L.kw - 15 * u) >> 1), ky = L.VH - 15, m = new Map();
    for (const [code, r, c, w] of this.KEYS) m.set(code, { x: base + Math.round(c * u), y: ky + 1 + r * 4, w: Math.round(w * u) - 1 });
    return (L._keys = m);
  },
  lampRect(L) { const Z = this.spots(L); return { x: Z.lamp.x - 16, y: Z.lamp.y - 46, w: 36, h: 50 }; },
  badgeRect(L) { return { x: L.kx - 46, y: L.desk + 1, w: 14, h: 27 }; },
  // Parte estática em cache (parede, janela, mesa, monitor, objetos parados)
  bake(L, st) {
    const c = document.createElement('canvas'); c.width = L.VW; c.height = L.VH;
    const x = c.getContext('2d'), P = WD_PAL, R = this.rng(7), Z = this.spots(L), D = new Set(st.decor || []);
    const F = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    const lit = this.light(st.hour), M = L.mon, s = L.screen;
    // Parede: papel listrado, rodameio
    F(P.A, 0, 0, L.VW, L.desk);
    for (let i = 0; i < L.VW; i += 12) { F(P.a, i, 0, 1, L.desk); Pixel.dither(x, i + 1, 0, 1, L.desk, P.a, 1); }
    F(P.b, 0, L.back - 22, L.VW, 1); F(P.B, 0, L.back - 21, L.VW, 21); F(P.b, 0, L.back - 20, L.VW, 1);
    // Janela alta: moldura de madeira, céu em pontilhado, prédios, persiana recolhida, peitoril
    const W = Z.win;
    F(P.k, W.x - 2, W.y - 2, W.w + 4, W.h + 4); F(P[3], W.x - 1, W.y - 1, W.w + 2, W.h + 2);
    F(P.k, W.x - 4, W.y + W.h + 1, W.w + 8, 5); F(P[1], W.x - 3, W.y + W.h + 2, W.w + 6, 1); F(P[2], W.x - 3, W.y + W.h + 3, W.w + 6, 2);  // peitoril
    // Estante (só em telas largas)
    if (L.right > 110) {
      const sx = M.x + M.w + 64, sw = Math.min(110, L.VW - sx - 8);
      for (let n = 0; n < 4; n++) { const sy = 30 + n * 34; F(P[4], sx, sy + 26, sw, 3); let b = sx + 2;
        while (b < sx + sw - 4) { const bw = 3 + R() * 4 | 0, bh = 14 + R() * 10 | 0, col = [P.L, P.T, P.F, P.z, P.n, P.C][R() * 6 | 0]; F(P.k, b - 1, sy + 26 - bh - 1, bw + 2, bh + 1); F(col, b, sy + 26 - bh, bw, bh); F(P.k, b, sy + 26 - bh + 3, bw, 1); b += bw + 2; } }
    }
    // Relógio de parede com a hora do expediente
    const C = Z.clock;
    if (L.right > 26) {
      // Relógio de parede: aro de latão com volume, marcações e ponteiros
      const R2 = 16;
      for (let j = -R2; j <= R2; j++) for (let i = -R2; i <= R2; i++) { const d = i * i + j * j; if (d > R2 * R2) continue;
        F(d > (R2 - 1) ** 2 ? P.k : d > (R2 - 3) ** 2 ? (i + j < 0 ? P.Y : P.z) : (i + j > 6 ? P.w : P.W), C.x + i, C.y + j, 1, 1); }
      for (let h = 0; h < 12; h++) { const a = h / 12 * Math.PI * 2; F(h % 3 ? P.P : P.k, C.x + Math.round(Math.cos(a) * 11), C.y + Math.round(Math.sin(a) * 11), h % 3 ? 1 : 2, h % 3 ? 1 : 2); }
      Pixel.text(x, 'WD', C.x - 3, C.y + 4, P.p);   // marca no mostrador
      F(P.z, C.x - 1, C.y + R2 + 1, 3, 1);
      const ang = ((st.hour % 12) / 12) * Math.PI * 2 - Math.PI / 2, mang = ((st.hour % 1)) * Math.PI * 2 - Math.PI / 2;
      for (let r = 0; r < 7; r++) F(P.k, C.x + Math.round(Math.cos(ang) * r), C.y + Math.round(Math.sin(ang) * r), 1, 1);
      for (let r = 0; r < 11; r++) F(P.K, C.x + Math.round(Math.cos(mang) * r), C.y + Math.round(Math.sin(mang) * r), 1, 1);
      F(P.R, C.x, C.y, 1, 1);
    }
    // Pôster corporativo (telas largas)
    if (L.right > 110) { const sx = M.x + M.w + 64, sw = Math.min(110, L.VW - sx - 8), px = sx + Math.max(0, (sw - 38) / 2 | 0), py = 30 + 4 * 34 + 14; F(P.k, px - 1, py - 1, 38, 50); F(P.R, px, py, 36, 48); F(P.W, px + 3, py + 3, 30, 30); Pixel.text(x, 'SINERGIA', px + 2, py + 37, P.W);
      for (let i = 0; i < 4; i++) F([P.F, P.O, P.L, P.I][i], px + 7 + i * 6, py + 26 - i * 5, 4, 4 + i * 5); }
    // Tampo da mesa: borda iluminada, veios
    // Tampo em perspectiva: do fundo (encostado na parede, atrás do monitor) até a frente, onde você está sentado.
    // Tábuas e veios convergem para um ponto de fuga no centro; o fundo fica um pouco mais escuro que a frente.
    { const top = L.back, vpx = L.VW / 2, vpy = top - Math.max(120, L.VH * .55), cx2 = L.VW / 2;
      F(P[2], 0, top, L.VW, L.VH - top);
      for (let j = top; j < Math.min(L.VH, top + 8); j++) Pixel.dither(x, 0, j, L.VW, 1, P[3], j);          // fundo mais escuro
      const at = (x0, y) => vpx + (x0 - vpx) * (y - vpy) / (top - vpy);                                      // x de uma linha de fuga na altura y
      const plank = 14;
      for (let n = -Math.ceil(L.VW / plank) * 3; n <= Math.ceil(L.VW / plank) * 3; n++) {
        const x0 = cx2 + n * plank * .55;
        for (let y = top + 1; y < L.VH; y++) { const xx = Math.round(at(x0, y)); if (xx < -2 || xx > L.VW + 2) continue; if (n % 3 === 0) F(P[4], xx, y, 1, 1); else if ((y * 7 + n * 13) % 11 < 4) F(P[3], xx, y, 1, 1); }
      }
      for (let n = 0; n < L.VW / 7; n++) { const y = top + 4 + R() * (L.VH - top - 6) | 0, x0 = R() * L.VW | 0, len = 4 + R() * 10 | 0; for (let k = 0; k < len; k++) { const xx = Math.round(at(x0 + (x0 - vpx) * k * .02, y + k)); if (y + k < L.VH) F(P[3], xx, y + k, 1, 1); } }   // veios seguindo a perspectiva
      F(P.k, 0, top, L.VW, 1); for (let j = 1; j < 4; j++) Pixel.dither(x, 0, top + j, L.VW, 1, P[4], j);   // sombra de contato com a parede
      for (let j = L.VH - 6; j < L.VH; j++) Pixel.dither(x, 0, j, L.VW, 1, P[1], j + 1);                      // borda da frente iluminada
    }
    // Monitor: moldura fina com volume, tela, queixo com marca e pé
    const cx = M.x + (M.w >> 1);
    this.shadow(x, cx - 40, L.desk + 1, 80, 3);
    const HM = this.ramp((st.hw || {}).mon), HK = this.ramp((st.hw || {}).kb), HO = this.ramp((st.hw || {}).mouse);
    F(HM.sh, cx - 16, M.y + M.h, 32, L.desk - (M.y + M.h) + 1); F(HM.dk, cx + 10, M.y + M.h, 6, L.desk - (M.y + M.h) + 1);
    F(P.k, cx - 30, L.desk - 1, 60, 4); F(HM.base, cx - 29, L.desk - 1, 58, 2); F(HM.hi, cx - 29, L.desk - 1, 58, 1);
    F(P.k, M.x - 1, M.y - 1, M.w + 2, M.h + 2); F(HM.base, M.x, M.y, M.w, M.h);
    F(HM.hi, M.x, M.y, M.w, 1); F(HM.hi, M.x, M.y, 1, M.h); F(HM.sh, M.x + M.w - 1, M.y, 1, M.h); F(HM.dk, M.x, M.y + M.h - 1, M.w, 1);
    if (HM === this.HW.graphite) { F(HM.hi, M.x + 2, M.y + 1, Math.min(40, M.w >> 3), 1); F(HM.hi, M.x + 1, M.y + 2, 1, Math.min(30, M.h >> 3)); }   // reflexo do plástico escuro
    F(P.J, s.x - 1, s.y - 1, s.w + 2, s.h + 2); F(P.X, s.x, s.y, s.w, s.h);
    Pixel.text(x, 'WORKSTATION 95', M.x + 26, M.y + M.h - 7, HM.txt);
    F(HM.dk, M.x + M.w - 34, M.y + M.h - 6, 9, 3); F(HM.sh, M.x + M.w - 33, M.y + M.h - 6, 7, 1);
    // Teclado (em primeiro plano, cortado pela borda de baixo)
    const kx = L.kx, kw = L.kw, ky = L.VH - 15;
    this.shadow(x, kx - 2, ky - 3, kw + 4, 2);
    F(P.k, kx - 1, ky - 1, kw + 2, 20); F(HK.base, kx, ky, kw, 19); F(HK.hi, kx, ky, kw, 1); F(HK.sh, kx, ky + 12, kw, 7);
    for (const k of this.keyRects(L).values()) { F(HK.key, k.x, k.y, k.w, 2); F(HK.keySh, k.x, k.y + 2, k.w, 1); if (HK === this.HW.graphite) F(HK.hi, k.x, k.y, k.w, 1); }
    // Mouse com fio
    const mx = kx + kw + 18, my = L.VH - 15;
    this.shadow(x, mx - 1, my + 12, 12, 2);
    F(P.k, mx - 1, my - 1, 11, 16); F(HO.base, mx, my, 9, 15); F(HO.hi, mx, my, 9, 1); F(HO.hi, mx, my, 1, 8); F(HO.sh, mx + 4, my, 1, 6); F(HO.sh, mx, my + 6, 9, 1); F(HO.dk, mx + 4, my + 2, 1, 2); F(HO.sh, mx + 7, my + 2, 2, 13);
    for (let i = 0; i < 16; i++) F(P.j, mx + 4 + Math.round(Math.sin(i / 3) * 3), my - 2 - i, 1, 1);
    // Papéis (crescem com o caos) e crachá
    this.paperStack(x, kx - 84, L.desk + 10, 2 + (st.clutter > 1 ? 3 : 0));
    this.paperStack(x, kx + kw + 34, L.desk + 8, 1 + st.clutter * 2);
    this.shadow(x, kx - 44, L.desk + 24, 14, 2);
    const bd = st.badge || { shirt: P.L }, bx0 = kx - 46, by0 = L.desk + 7;
    this.shadow(x, bx0 - 1, by0 + 20, 16, 2);
    F(P.L, bx0 + 3, L.desk + 1, 1, 6); F(P.L, bx0 + 10, L.desk + 1, 1, 6); F(P.k, bx0 + 5, by0 - 2, 4, 3); F(P.m, bx0 + 6, by0 - 1, 2, 1);   // cordão e presilha
    F(P.k, bx0, by0, 14, 20); F(P.W, bx0 + 1, by0 + 1, 12, 18); F(P.w, bx0 + 12, by0 + 1, 1, 18); F(P.w, bx0 + 1, by0 + 18, 12, 1);
    F(bd.shirt, bx0 + 1, by0 + 1, 12, 3); F(P.W, bx0 + 2, by0 + 2, 3, 1);
    F(P.k, bx0 + 3, by0 + 5, 8, 9);
    if (bd.px) bd.px.forEach((row, j) => row.forEach((c, i) => F(c, bx0 + 4 + i, by0 + 6 + j, 1, 1)));
    F(P.k, bx0 + 4, by0 + 15, 6, 1); F(P.p, bx0 + 3, by0 + 17, 8, 1);                                  // nome e cargo
    for (let i = 0; i < 8; i++) if ((i * 5) % 3) F(P.K, bx0 + 3 + i, by0 + 18, 1, 1);                    // código de barras
    F(P.l, bx0 + 11, by0 + 5, 1, 2); F(P.i, bx0 + 11, by0 + 7, 1, 1); F(P.W, bx0 + 6, by0 + 2, 2, 1);      // holograma e furo
    // Bagunça: bolinhas de papel
    const RC = this.rng(31);
    for (let n = 0; n < st.clutter * 3; n++) { const px = 8 + RC() * (L.VW - 16) | 0, py = L.desk + 6 + RC() * 14 | 0;
      if (px > kx - 4 && px < kx + kw + 4 && py > L.VH - 18) continue;
      F(P.k, px - 1, py - 1, 6, 5); F(P.W, px, py, 4, 3); F(P.p, px + 2, py + 1, 2, 2); }
    // Post-its na borda externa da moldura (aumentam com o caos e à tarde)
    const notes = [[M.x - 4, M.y + 14], [M.x + M.w - 6, M.y + 40], [M.x - 5, M.y + M.h - 56], [M.x + M.w - 5, M.y + M.h - 80]];
    for (let n = 0; n < Math.min(4, st.clutter + (st.hour > 14 ? 1 : 0)); n++) x.drawImage(Pixel.master(SPR2.postit, WD_PAL), notes[n][0], notes[n][1]);
    // Calendário de parede: a folha mostra o dia da carreira
    if (Z.cal && st.day) this.calendar(x, Z.cal.x, Z.cal.y, st.day);
    // Porta-canetas e marca de café na mesa
    if (Z.pens) { const px = Z.pens.x, py = Z.pens.y;
      // copo de metal em tela, com lápis (borracha rosa), caneta azul, régua e tesoura
      this.shadow(x, px - 2, py + 12, 14, 2);
      x.drawImage(Pixel.master(['..kk........', '.krrk....kk.', '.kmmk...kLLk', '.kQQk.k.kLLk', '.kQQkkmkkLLk', '.kQQkkmkkLLk', '.kQQkkmkk7Lk', 'kkkkkkkkkkkk',
        'kJjmjmjmjmJk', 'kjMjMjMjMjjk', 'kJjmjmjmjmJk', 'kjMjMjMjMjjk', 'kJjmjmjmjmJk', 'kjMjMjMjMjjk', 'kJjjjjjjjjJk', '.kkkkkkkkkk.'], P), px - 2, py - 4); }
    if (Z.phone) this.shadow(x, Z.phone.x - 2, Z.phone.y + 15, 31, 2);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; F(P[3], Z.mug.x - 8 + Math.round(Math.cos(a) * 5), L.desk + 22 + Math.round(Math.sin(a) * 2), 1, 1); }
    // Objetos parados: porta-retrato, plaquinha do cargo, coroa de CEO, monitor extra (moldura)
    if (D.has('foto')) this.frame(x, Z.frame.x, Z.frame.y);
    if (st.rank >= 2) this.nameplate(x, Z.nameplate.x, Z.nameplate.y);
    if (st.rank >= 6) this.crown(x, cx - 5, M.y - 2);
    if (D.has('monitor') && L.right >= 36) this.sideMonitor(x, Z.sideMon.x, Z.sideMon.y, Math.min(44, L.right - 6));
    // Sombras dos objetos animados (desenhados por cima a cada quadro)
    if (D.has('planta')) this.shadow(x, Z.plant.x, Z.plant.y - 1, 24, 2);
    if (D.has('gato')) { const cx = Z.cat.x, cy = Z.cat.y + 12;   // almofada: o gato laranja não some na madeira
      this.shadow(x, cx - 3, cy + 6, 22, 2); F(P.k, cx - 3, cy, 22, 6); F(P.L, cx - 2, cy + 1, 20, 4); F(P.l, cx - 2, cy + 1, 20, 1); F(P[7], cx - 2, cy + 4, 20, 1); F(P.Y, cx - 3, cy + 1, 1, 1); F(P.Y, cx + 18, cy + 1, 1, 1); }
    if (D.has('trofeu')) this.shadow(x, Z.trophy.x - 1, Z.trophy.y + 18, 16, 2);
    if (D.has('lamp')) this.shadow(x, Z.lamp.x - 2, Z.lamp.y - 1, 22, 2);
    this.shadow(x, Z.mug.x, Z.mug.y + 12, 16, 2);
    return c;
  },
  calendar(x, px, py, day) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    // folhinha de parede com espiral, cabeçalho vermelho, número grande e a grade da semana embaixo
    F(P.j, px + 11, py - 5, 2, 4); F(P.k, px + 10, py - 6, 4, 1);
    F(P.k, px - 1, py - 1, 26, 31); F(P.W, px, py, 24, 29); F(P.R, px, py, 24, 8); F(P.r, px, py, 24, 1); F(P.q, px, py + 7, 24, 1);
    for (let i = 0; i < 5; i++) { F(P.k, px + 2 + i * 5, py - 2, 2, 3); F(P.m, px + 2 + i * 5, py - 2, 1, 1); }
    Pixel.text(x, 'DIA', px + 7, py + 2, P.W);
    const s = String(day % 1000);
    Pixel.text(x, s, px + 12 - s.length * 2, py + 10, P.k); Pixel.text(x, s, px + 13 - s.length * 2, py + 10, P.k);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 7; i++) F((i + j * 7) === (day - 1) % 14 ? P.R : P.p, px + 2 + i * 3, py + 19 + j * 3, 2, 2);
    F(P.w, px, py + 26, 24, 3); F(P.p, px + 1, py + 28, 23, 1); F(P.w, px + 20, py + 25, 4, 1); F(P.p, px + 22, py + 26, 2, 2); },
  // Telefone de mesa: toca (fone pula, luz pisca) enquanto há uma ligação na fila
  phone(x, px, py, ring, t) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    // telefone de mesa: base inclinada com visor, teclado 3×4, grade do alto-falante e fone com fio enrolado
    const j = ring && (t * 14 | 0) % 2 ? -1 : 0, sh = ring ? ((t * 22 | 0) % 2 ? 1 : 0) : 0, X = px + sh;
    F(P.k, X - 1, py + 3, 30, 14); F(P.C, X, py + 4, 28, 12); F(P.c, X, py + 4, 28, 1); F(P.e, X, py + 13, 28, 2); F(P.E, X, py + 15, 28, 1);
    F(P.k, X + 2, py + 6, 9, 5); F(ring && (t * 4 | 0) % 2 ? P.v : P.V, X + 3, py + 7, 7, 3); F(P.x, X + 4, py + 8, 4, 1);     // visor
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { F(P.k, X + 13 + i * 4, py + 5 + r * 3, 3, 3); F(i === 3 && r === 2 ? P.F : P.c, X + 13 + i * 4, py + 5 + r * 3, 2, 2); }
    for (let i = 0; i < 4; i++) F(P.e, X + 3 + i * 2, py + 12, 1, 1);                                                          // alto-falante
    F(P.k, X + 9, py + 13, 2, 2); F(ring && (t * 4 | 0) % 2 ? P.R : P.q, X + 9, py + 13, 1, 1);                               // luz de chamada
    // fone
    F(P.k, X - 2, py - 2 + j, 32, 6); F(P.J, X - 1, py - 1 + j, 30, 4); F(P.j, X + 6, py - 1 + j, 16, 1); F(P.M, X + 7, py + j, 14, 1);
    F(P.k, X - 2, py + 3 + j, 7, 3); F(P.J, X - 1, py + 3 + j, 5, 2); F(P.k, X + 23, py + 3 + j, 7, 3); F(P.J, X + 24, py + 3 + j, 5, 2);
    for (let i = 0; i < 6; i++) F(i % 2 ? P.J : P.j, X - 3 - (i % 2), py + 5 + i * 2, 1, 2);                                     // fio enrolado
    if (ring && (t * 3 | 0) % 2) { F(P.W, px + 4, py - 6, 1, 2); F(P.W, px + 13, py - 7, 1, 3); F(P.W, px + 22, py - 6, 1, 2); } },
  // Camada de resposta imediata: teclas e botão do mouse, desenhados a cada quadro só enquanto há interação.
  // Apertada: a tecla afunda 1 px e acende; ao soltar, sobe com um brilho de 1 px (sobre-impulso) por ~90 ms.
  keyCell(L, k) {
    const cols = (L.kw - 6) / 7 | 0;
    const [r, i] = k === 'ArrowLeft' ? [2, cols - 3] : k === 'ArrowDown' ? [2, cols - 2] : k === 'ArrowRight' ? [2, cols - 1] : k === 'ArrowUp' ? [1, cols - 2] : k === 'Enter' ? [1, cols - 1] : k === ' ' ? [2, 4] : [k.charCodeAt(0) % 3, (k.charCodeAt(0) * 7) % Math.max(1, cols - 4)];
    const ox = L.kx + 3 + i * 7 + (r % 2) * 3, oy = L.VH - 15 + 2 + r * 5;
    return ox + 6 <= L.kx + L.kw - 2 ? [ox, oy] : null;
  },
  drawInput(ctx, L, hwSel, keys, mouse, now) {
    const P = WD_PAL, HK = this.ramp(hwSel.kb), HO = this.ramp(hwSel.mouse), R = this.keyRects(L);
    ctx.clearRect(0, 0, L.VW, L.VH);
    let active = false;
    for (const [code, s] of keys) {
      const k = R.get(code); if (!k) continue;
      if (s.up === null) { active = true; ctx.fillStyle = HK.base; ctx.fillRect(k.x, k.y, k.w, 3); ctx.fillStyle = HK.keySh; ctx.fillRect(k.x, k.y, k.w, 1); ctx.fillStyle = P.y; ctx.fillRect(k.x, k.y + 1, k.w, 1); }   // afundada (topo escurece) e acesa, visível até na última fileira
      else if (now - s.up < 90) { active = true; ctx.fillStyle = P.W; ctx.fillRect(k.x, k.y, k.w, 1); }   // volta com um brilho (acomodação)
    }
    const mx = L.kx + L.kw + 18, my = L.VH - 15, BTN = [[mx, 4], [mx + 5, 4], [mx + 4, 1]];   // esquerdo, direito, meio
    mouse.btn.forEach((b, i) => {
      const [bx, bw] = BTN[i === 1 ? 2 : i === 2 ? 1 : 0];
      if (b.down) { active = true; ctx.fillStyle = HO.sh; ctx.fillRect(bx, my, bw, 6); ctx.fillStyle = P.y; ctx.fillRect(bx, my + 4, bw, 1); }
      else if (now - b.up < 90) { active = true; ctx.fillStyle = HO.hi; ctx.fillRect(bx, my, bw, 1); }
    });
    return active;
  },
  // Miniatura do equipamento para a tela de personalização (mesmos acabamentos)
  hwPreview(c, h) {
    const x = c.getContext('2d'), P = WD_PAL, F = (col, a, b, w, hh) => { x.fillStyle = col; x.fillRect(a, b, w, hh); };
    const HM = this.ramp(h.mon), HK = this.ramp(h.kb), HO = this.ramp(h.mouse);
    F(P[2], 0, 0, c.width, c.height); F(P.A, 0, 0, c.width, 26); F(P[1], 0, 26, c.width, 1);
    F(P.k, 33, 2, 54, 30); F(HM.base, 34, 3, 52, 28); F(HM.hi, 34, 3, 52, 1); F(HM.hi, 34, 3, 1, 28); F(HM.sh, 85, 3, 1, 28); F(HM.dk, 34, 30, 52, 1);
    F(P.J, 37, 6, 46, 20); F(P.X, 38, 7, 44, 18); F(P.V, 40, 9, 12, 2); F(P.v, 40, 13, 20, 2);
    F(HM.sh, 55, 31, 10, 3); F(P.k, 50, 33, 20, 2); F(HM.base, 51, 33, 18, 1);
    F(P.k, 30, 36, 50, 8); F(HK.base, 31, 37, 48, 7); F(HK.hi, 31, 37, 48, 1);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { F(HK.key, 33 + i * 7 + r * 3, 38 + r * 3, 5, 2); F(HK.keySh, 33 + i * 7 + r * 3, 40 + r * 3, 5, 1); }
    F(P.k, 88, 35, 7, 9); F(HO.base, 89, 36, 5, 8); F(HO.hi, 89, 36, 5, 1); F(HO.sh, 91, 36, 1, 3);
  },
  // Sombra pontilhada no tampo: "assenta" os objetos na mesa
  shadow(x, px, py, w, h) { x.fillStyle = WD_PAL[3]; x.fillRect(px + 1, py, w - 2, 1); Pixel.dither(x, px, py + 1, w, h, WD_PAL[4]); },
  paperStack(x, px, py, n) {
    const P = WD_PAL;
    this.shadow(x, px - 1, py + 13, 33, 2);
    for (let i = 0; i < n; i++) { const ox = px + (i % 2 ? 1 : -1) * (i % 3), oy = py - i * 2;
      x.fillStyle = P.k; x.fillRect(ox - 1, oy - 1, 32, 15); x.fillStyle = P.W; x.fillRect(ox, oy, 30, 13); x.fillStyle = P.w; x.fillRect(ox, oy + 11, 30, 2);
      x.fillStyle = P.p; for (let l = 3; l < 11; l += 2) x.fillRect(ox + 3, oy + l, 16 + (l * 5 % 8), 1); }
    if (n > 0) { const ox = px + ((n - 1) % 2 ? 1 : -1) * ((n - 1) % 3), oy = py - (n - 1) * 2;   // folha de cima: cabeçalho, assinatura e clipe
      x.fillStyle = P.L; x.fillRect(ox + 3, oy + 2, 10, 2); x.fillStyle = P.k; x.fillRect(ox + 20, oy + 9, 6, 1); x.fillRect(ox + 22, oy + 8, 2, 1);
      x.fillStyle = P.k; x.fillRect(ox + 24, oy - 2, 4, 6); x.fillStyle = P.m; x.fillRect(ox + 25, oy - 1, 2, 4); x.fillStyle = P.M; x.fillRect(ox + 25, oy + 2, 2, 1);
      x.fillStyle = P.w; x.fillRect(ox + 27, oy, 3, 3); x.fillStyle = P.p; x.fillRect(ox + 28, oy + 1, 2, 2); }
  },
  frame(x, px, py) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    this.shadow(x, px - 1, py + 19, 20, 2);
    F(P.k, px - 1, py - 1, 20, 21); F(P.z, px, py, 18, 19); F(P.Y, px, py, 18, 1); F(P.Y, px, py, 1, 19); F(P.Z, px + 17, py, 1, 19);
    F(P.v, px + 3, py + 3, 12, 8); F(P.y, px + 11, py + 4, 2, 2); F(P.G, px + 3, py + 11, 12, 5); F(P.h, px + 3, py + 14, 12, 2);
    F(P.s, px + 5, py + 7, 2, 2); F(P.s, px + 10, py + 6, 2, 2); F(P[4], px + 5, py + 9, 2, 5); F(P.L, px + 10, py + 8, 2, 6); F(P.k, px + 3, py + 3, 12, 1); },
  nameplate(x, px, py) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    F(P.k, px - 1, py - 1, 46, 9); F(P.z, px, py, 44, 7); F(P.Y, px, py, 44, 1); F(P[4], px + 2, py + 6, 40, 3); Pixel.text(x, 'WORKDAY', px + 8, py + 1, P[4]); },
  crown(x, px, py) { const P = WD_PAL;
    const m = ['k..k..k..k.', 'kY.kYk.kY.k'.slice(0, 11), 'kYYkYYkYYk.', 'kYYYYYYYYYk', 'kYRYYLYYFYk', 'kzzzzzzzzzk', 'kkkkkkkkkkk'].map(r => r.padEnd(11, '.'));
    x.drawImage(Pixel.master(m, WD_PAL), px, py); },
  sideMonitor(x, px, py, w) { const P = WD_PAL, F = (c, a, b, ww, h) => { x.fillStyle = c; x.fillRect(a, b, ww, h); }, h = Math.round(w * .62);
    F(P.j, px + (w >> 1) - 1, py + h, 3, 12); F(P.J, px + (w >> 1) - 6, py + h + 10, 13, 2);
    F(P.k, px - 1, py - 1, w + 2, h + 2); F(P.C, px, py, w, h); F(P.c, px, py, w, 1); F(P.J, px + 2, py + 2, w - 4, h - 6); F(P.e, px, py + h - 3, w, 3); },

  // Quadro animado: cache + objetos vivos + luz da hora (a tela do monitor fica fora da luz)
  draw(ctx, L, st, baked, t) {
    const P = WD_PAL, D = new Set(st.decor || []), s = L.screen, M = L.mon, Z = this.spots(L), lit = this.light(st.hour);
    ctx.drawImage(baked, 0, 0);
    const W = Z.win;
    ctx.save(); ctx.beginPath(); ctx.rect(W.x - 1, W.y - 1, W.w + 2, W.h + 40); ctx.rect(M.x - 1, M.y - 1, M.w + 2, M.h + 30); ctx.clip('evenodd');
    ctx.save(); ctx.beginPath(); ctx.rect(W.x, W.y, W.w, W.h); ctx.clip(); this.sky(ctx, W, st, t, lit); ctx.restore();
    // Persiana: 0 = recolhida, 1 = fechada. Lâminas de 3 px descem uma a uma; a luz diminui junto
    const bl = st.blind || 0, slats = Math.max(4, Math.round(4 + bl * (W.h / 3 - 4))), yEnd = W.y + slats * 3;
    ctx.fillStyle = P[4]; ctx.fillRect(W.x - 1, W.y - 1, W.w + 2, 3);
    for (let j = 0; j < slats; j++) { const y = W.y + 2 + j * 3; if (y + 2 > W.y + W.h) break; ctx.fillStyle = P.C; ctx.fillRect(W.x, y, W.w, 2); ctx.fillStyle = P.e; ctx.fillRect(W.x, y + 2, W.w, 1); }
    ctx.fillStyle = P.k; ctx.fillRect(W.x - 1, Math.min(yEnd + 1, W.y + W.h - 2), W.w + 2, 3); ctx.fillStyle = P.z; ctx.fillRect(W.x, Math.min(yEnd + 2, W.y + W.h - 1), W.w, 1);
    const cy = Math.min(yEnd + 4, W.y + W.h - 2);
    const cdx = W.x + 4;   // cordão da persiana na ponta visível da janela
    ctx.fillStyle = P.j; ctx.fillRect(cdx, W.y + 2, 1, cy + 12 - W.y); ctx.fillStyle = P.k; ctx.fillRect(cdx - 2, cy + 13, 5, 4); ctx.fillStyle = P.z; ctx.fillRect(cdx - 1, cy + 14, 3, 2);
    ctx.restore();
    // Itens da loja numa prateleira de parede embaixo da janela (rádio com notinhas, aquário com bolhas, cacto)
    const shelfItems = ['radio', 'cacto', 'aquario'].filter(k => D.has(k));
    if (shelfItems.length) {
      const sw = Math.max(20, M.x - 6), sx = 3, sy = W.y + W.h + 28;
      const rows = [[], []]; let used = 0, r = 0;
      for (const k of shelfItems) { const wv = SPR2[k][0].length; if (used + wv > sw - 2 && rows[0].length) { r = 1; used = 0; } rows[r].push(k); used += wv + 2; }
      rows.forEach((row, i) => { if (!row.length) return; const y = sy + i * 24;
        ctx.fillStyle = P.k; ctx.fillRect(sx - 1, y, sw + 2, 4); ctx.fillStyle = P[2]; ctx.fillRect(sx, y + 1, sw, 1); ctx.fillStyle = P[3]; ctx.fillRect(sx, y + 2, sw, 1); ctx.fillStyle = P[4]; ctx.fillRect(sx + 2, y + 4, 1, 3); ctx.fillRect(sx + sw - 3, y + 4, 1, 3);
        let x0 = sx + 1;
        for (const k of row) { const spr = SPR2[k], hh = spr.length; ctx.drawImage(Pixel.master(spr, WD_PAL), x0, y - hh + 1);
          if (k === 'radio' && st.sound) for (let n = 0; n < 2; n++) { const ph = (t * .6 + n * .5) % 1; ctx.fillStyle = ph < .8 ? P.k : P.K; const nx = x0 + 4 + n * 5 + Math.round(Math.sin(t * 3 + n) * 2), ny = y - hh - 2 - ph * 12 | 0; ctx.fillRect(nx, ny, 2, 2); ctx.fillRect(nx + 1, ny - 3, 1, 3); }
          if (k === 'aquario') { ctx.fillStyle = P.W; for (let n = 0; n < 3; n++) { const ph = (t * .5 + n * .33) % 1; ctx.fillRect(x0 + 4 + n * 3, y - hh + 10 - ph * 6 | 0, 1, 1); } }
          x0 += spr[0].length + 2; }
      });
    }
    // Telefone de mesa (toca quando há uma ligação esperando)
    if (Z.phone) this.phone(ctx, Z.phone.x, Z.phone.y, st.ringing, t);
    // Planta (folhas balançam de leve)
    if (D.has('planta')) this.plant(ctx, Z.plant.x, Z.plant.y, t);
    // Monitor extra: gráfico subindo e cursor piscando
    if (D.has('monitor') && L.right >= 36) { const w = Math.min(44, L.right - 6), h = Math.round(w * .62), px = Z.sideMon.x, py = Z.sideMon.y;
      ctx.fillStyle = P.X; ctx.fillRect(px + 3, py + 3, w - 6, h - 8);
      for (let i = 0; i < (w - 10) / 4 | 0; i++) { const v = 2 + ((Math.sin(t * 1.5 + i * .9) + 1) * (h - 14) / 4 | 0) + i; ctx.fillStyle = [P.F, P.Q, P.v][i % 3]; ctx.fillRect(px + 5 + i * 4, py + h - 6 - Math.min(v, h - 10), 3, Math.min(v, h - 10)); }
      if ((t * 2 | 0) % 2) { ctx.fillStyle = P.v; ctx.fillRect(px + w - 8, py + 5, 2, 3); } }
    // Luminária
    const lampOn = !st.lights || st.lights.lamp !== false, lampLv = st.lampLv !== undefined ? st.lampLv : lampOn ? 1 : 0;
    if (D.has('lamp')) this.lamp(ctx, Z.lamp.x, Z.lamp.y, t, lampLv > .5);
    // Troféu com brilho que passa de vez em quando
    if (D.has('trofeu')) this.trophy(ctx, Z.trophy.x, Z.trophy.y, t);
    // Caneca com vapor (enquanto o café está quente)
    // caneca vista um pouco de cima: boca oval com café, alça, brilho e faixa com o logotipo (dourada a partir de Assistente)
    const MUG = ['...kkkkkkkk.....', '.kkTTTTTTTTkk...', 'kTT44444444TTk..', 'kT4333333334Tk..', 'ktT44444444Tuk..', 'ktTTTTTTTTTTukkk', 'ktTWWTTTTTTTuk.k', 'ktTWTTyyyyTTuk.k',
      'ktTWTyYYYYyTuk.k', 'ktTTTTyyyyTTukkk', 'ktTTTTTTTTTTuk..', 'ktTTTTTTTTTTuk..', '.kTTTTTTTTTTk...', '..kuuuuuuuuk....', '...kkkkkkkk.....'];
    const mug = st.rank >= 1 ? MUG : MUG.map(r => r.replace(/[yY]/g, 'W'));
    ctx.drawImage(Pixel.master(mug, WD_PAL), Z.mug.x - 1, Z.mug.y - 3);
    if (st.hour < 16 || st.clutter < 2) ctx.drawImage(Pixel.master(SPR2.steam[(t * 5 | 0) % 3], WD_PAL), Z.mug.x + 3, Z.mug.y - 10);
    // Gato: rabo balança, pisca, mexe a orelha
    if (D.has('gato')) { const cx = Z.cat.x, cy = Z.cat.y, ph = (t % 4) < .7 ? ((t * 8 | 0) % 3) : 0;
      const coat = st.cat || 'laranja'; ctx.drawImage(catCoat(SPR2.catTail[ph], coat, true), cx + 12, cy + 4); ctx.drawImage(catCoat(SPR2.cat, coat), cx, cy);
      if ((t % 6) < .16) { ctx.fillStyle = P[2]; ctx.fillRect(cx + 3, cy + 4, 2, 1); ctx.fillRect(cx + 9, cy + 4, 2, 1); }
      if ((t % 9) < .12) { ctx.fillStyle = P.k; ctx.fillRect(cx + 1, cy, 2, 1); } }
    // Papel do topo da pilha levanta com o caos
    if (st.clutter >= 2 && (t % 3) < .5) { ctx.fillStyle = P.W; ctx.fillRect(L.kx + L.kw + 60, L.desk + 6 - st.clutter * 4, 4, 1); }
    // LED de energia: verde, âmbar ou vermelho piscando conforme o estresse
    const led = st.stress > 80 ? ((t * 4 | 0) % 2 ? P.R : P.q) : st.stress > 50 ? P.Q : P.d;
    ctx.fillStyle = P.k; ctx.fillRect(M.x + M.w - 20, M.y + M.h - 7, 4, 4); ctx.fillStyle = led; ctx.fillRect(M.x + M.w - 19, M.y + M.h - 6, 2, 2);
    // Luz: feixe da janela, poeira, cone da luminária e tom da hora, sem tocar na tela do monitor
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.VW, L.VH); ctx.rect(s.x - 1, s.y - 1, s.w + 2, s.h + 2); ctx.clip('evenodd');
    const open = 1 - (st.blind || 0) * .9;
    ctx.globalAlpha = open; ctx.fillStyle = lit.beam;
    const slope = .55 + lit.k * .5;
    for (let j = W.y + 18; j < L.VH; j++) { const a = W.x + (j - W.y - 18) * slope | 0; ctx.fillRect(a, j, 24 + (j >> 3), 1); }
    ctx.fillStyle = 'rgba(255,248,220,.8)';
    for (let n = 0; n < 8; n++) { const ph = (t * .05 + n * .137) % 1, j = W.y + 30 + ph * (L.desk - W.y - 40) | 0, a = W.x + (j - W.y - 18) * slope + ((n * 7 + Math.sin(t + n) * 3) | 0) % 22; ctx.fillRect(a | 0, j, 1, 1); }
    ctx.globalAlpha = 1;
    // a cor do céu entra pela janela e banha o ambiente, mais forte perto dela (some com a persiana fechada)
    { const b = lit.beamRGB, g = ctx.createLinearGradient(W.x, 0, W.x + L.VW * .75, 0), a = b[3] * .55 * open;
      g.addColorStop(0, `rgba(${b[0] | 0},${b[1] | 0},${b[2] | 0},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${b[0] | 0},${b[1] | 0},${b[2] | 0},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, L.VW, L.VH); }
    if (st.blind) { ctx.fillStyle = `rgba(40,28,60,${.07 * st.blind})`; ctx.fillRect(0, 0, L.VW, L.VH); }
    if (D.has('lamp') && lampLv > 0) { const fl = (.2 + Math.sin(t * 9) * .01) * lampLv; ctx.fillStyle = `rgba(255,231,163,${fl})`; const hx = Z.lamp.x - 14, hy = Z.lamp.y - 44;
      for (let j = 0; j < 44; j++) ctx.fillRect(hx - (j * .5 | 0), hy + 8 + j, 14 + (j * 1.1 | 0), 1); }
    ctx.globalCompositeOperation = lit.tint[1]; ctx.fillStyle = lit.tint[0]; ctx.fillRect(0, 0, L.VW, L.VH);
    ctx.restore();
  },
  // Espada-de-são-jorge: folhas afinando até a ponta, listras e balanço suave
  plant(x, px, baseY, t) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    const blades = [[2, 20, 3, -2], [5, 34, 4, -1], [9, 42, 5, 0], [14, 30, 4, 1], [17, 18, 3, 2]];
    for (const [dx, h, w, lean] of blades) {
      for (let r = 0; r < h; r++) {
        const f = r / h, ww = Math.max(1, Math.round(w * (1 - f * f * .9))), sway = Math.round(Math.sin(t * 1.1 + dx) * f * f * 1.6);
        const bx = px + dx + Math.round(lean * f * f * 5) + sway, by = baseY - 15 - r;
        F(P.H, bx - 1, by, ww + 2, 1); F(r % 6 === 3 ? P.h : P.G, bx, by, ww, 1); F(P.g, bx, by, 1, 1);
      }
    }
    F(P.k, px + 1, baseY - 16, 22, 17); F(P.T, px + 2, baseY - 15, 20, 3); F(P.t, px + 2, baseY - 15, 20, 1); F(P.u, px + 2, baseY - 12, 20, 1);
    F(P.T, px + 3, baseY - 11, 18, 11); F(P.t, px + 3, baseY - 11, 2, 11); F(P.u, px + 18, baseY - 11, 3, 11); F(P.k, px + 1, baseY - 11, 2, 12); F(P.k, px + 21, baseY - 11, 2, 12);
  },
  lamp(x, px, deskY, t, on = true) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    F(P.k, px - 2, deskY - 5, 20, 6); F(P.z, px - 1, deskY - 4, 18, 4); F(P.Y, px - 1, deskY - 4, 18, 1); F(P.Z, px - 1, deskY - 1, 18, 1);
    for (let i = 0; i < 22; i++) { F(P.k, px + 6, deskY - 5 - i, 4, 1); F(P.Z, px + 7, deskY - 5 - i, 2, 1); }                 // haste
    for (let i = 0; i < 14; i++) { F(P.k, px + 7 - i, deskY - 27 - (i >> 1), 3, 2); F(P.Z, px + 8 - i, deskY - 27 - (i >> 1), 1, 1); }  // braço
    const hx = px - 14, hy = deskY - 44;
    F(P.k, hx - 1, hy - 1, 18, 11); F(P.Y, hx, hy, 16, 9); F(P.y, hx, hy, 16, 2); F(P.z, hx + 12, hy, 4, 9); F(P.Z, hx, hy + 8, 16, 1);
    F(P.k, hx + 6, hy - 3, 4, 3); F(P.z, hx + 7, hy - 2, 2, 2);
    F(on ? ((t * 9 | 0) % 7 ? P.y : P.W) : P.e, hx + 4, hy + 9, 8, 2);   // lâmpada (acesa ou apagada)
  },
  trophy(x, px, py, t) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    F(P.k, px - 1, py - 1, 16, 11); F(P.k, px + 4, py + 9, 6, 6); F(P.k, px, py + 13, 14, 7); F(P.Y, px, py, 14, 9); F(P.y, px + 1, py + 1, 2, 7); F(P.z, px + 10, py, 4, 9);
    F(P.k, px - 3, py + 1, 3, 5); F(P.k, px + 14, py + 1, 3, 5); F(P.Y, px - 2, py + 2, 2, 3); F(P.z, px + 14, py + 2, 2, 3);
    F(P.z, px + 5, py + 9, 4, 5); F(P[4], px + 1, py + 14, 12, 5); F(P[3], px + 1, py + 14, 12, 1); F(P.Y, px + 4, py + 16, 6, 1);
    const g = (t % 5) / .5; if (g < 1) { const gx = px + 2 + (g * 10 | 0); F(P.W, gx, py + 1, 1, 7); F(P.W, gx + 1, py + 2, 1, 4); }   // brilho
  },
};
