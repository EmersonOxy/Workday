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
    return { VW, VH, desk, screen: { x: sx, y: sy, w: sw, h: sh }, mon, left: mon.x, right: VW - (mon.x + mon.w), kx, kw };
  },

  // Céu e luz conforme a hora do expediente (9 a 18)
  light(hour) {
    const k = Math.max(0, Math.min(1, (hour - 9) / 9));
    const sky = k < .45 ? ['#c9ecf7', '#8fcbe8'] : k < .75 ? ['#ffe0a8', '#f6a96c'] : ['#e48a6a', '#6d4f8c'];
    const tint = k < .3 ? ['rgba(255,214,140,.10)', 'screen'] : k < .65 ? ['rgba(255,255,255,0)', 'source-over'] : k < .85 ? ['rgba(240,120,70,.16)', 'multiply'] : ['rgba(110,70,150,.28)', 'multiply'];
    const beam = k < .3 ? 'rgba(255,236,170,.22)' : k < .65 ? 'rgba(255,248,220,.13)' : k < .85 ? 'rgba(255,170,100,.24)' : 'rgba(255,140,120,.14)';
    const cloud = k < .75 ? '#ffffff' : '#f6c7b8';
    return { k, sky, tint, beam, cloud };
  },
  // Posições dos objetos: um só lugar define onde cada coisa fica (usado no cache e na animação)
  spots(L) {
    const M = L.mon, s = L.screen;
    return {
      win: (() => { const w = L.left > 110 ? Math.min(132, L.left - 30) : Math.max(18, Math.min(56, L.left - 8)); return { x: Math.max(3, (L.left - w) / 2 | 0), y: 10, w, h: Math.max(60, L.desk - 26) }; })(),
      plant: { x: Math.max(1, M.x - 30), y: L.desk + 8 },
      // Objetos comprados ficam na frente da mesa, fora da tela; só descem para a moldura se não houver espaço
      frame: L.kx - 112 > M.x - 4 ? { x: L.kx - 112, y: L.desk + 5 } : { x: M.x + 6, y: L.desk - 10 },
      trophy: L.kx + L.kw + 106 < L.VW - 34 ? { x: L.kx + L.kw + 92, y: L.desk + 4 } : { x: M.x + M.w - 20, y: L.desk - 12 },
      lamp: { x: Math.min(L.VW - 20, M.x + M.w + 14), y: L.desk + 3 },
      // Detalhes do ambiente (não dependem de compras)
      phone: L.kx - 158 > M.x - 4 ? { x: L.kx - 158, y: L.desk + 11 } : null,
      pens: L.kx - 126 > M.x - 4 ? { x: L.kx - 125, y: L.desk + 9 } : null,
      cal: L.right >= 26 ? { x: M.x + M.w + Math.max(5, Math.min(14, (L.right / 2 | 0) - 10)), y: 44 } : null,
      sideMon: { x: M.x + M.w + 4, y: Math.max(40, (s.y + s.h * .28) | 0) },
      clock: { x: M.x + M.w + Math.max(15, Math.min(24, (L.right / 2) | 0)), y: 24 },
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
  },
  ramp(name) { return this.HW[name] || this.HW.cream; },
  // Teclado da mesa em QWERTY físico (KeyboardEvent.code = posição da tecla, independente do idioma do teclado)
  KEYS: (() => {
    const k = [];
    'QWERTYUIOP'.split('').forEach((c, i) => k.push(['Key' + c, 0, 1 + i, 1])); k.push(['Backspace', 0, 11, 2]);
    'ASDFGHJKL'.split('').forEach((c, i) => k.push(['Key' + c, 1, 1.5 + i, 1])); k.push(['Enter', 1, 10.5, 2]);
    k.push(['ShiftLeft', 2, 0, 2]); 'ZXCVBNM'.split('').forEach((c, i) => k.push(['Key' + c, 2, 2 + i, 1])); k.push(['ShiftRight', 2, 9, 2], ['ArrowUp', 2, 12, 1]);
    k.push(['ControlLeft', 3, 0, 1], ['AltLeft', 3, 1, 1], ['Space', 3, 2.5, 6], ['AltRight', 3, 8.5, 1], ['ArrowLeft', 3, 11, 1], ['ArrowDown', 3, 12, 1], ['ArrowRight', 3, 13, 1]);
    return k;
  })(),
  keyRects(L) {
    if (L._keys) return L._keys;
    const base = L.kx + Math.max(2, (L.kw - 14 * 7) >> 1), ky = L.VH - 15, m = new Map();
    for (const [code, r, c, w] of this.KEYS) { const x = base + Math.round(c * 7); if (x + w * 7 - 1 > L.kx + L.kw - 2) continue; m.set(code, { x, y: ky + 1 + r * 4, w: w * 7 - 1 }); }
    return (L._keys = m);
  },
  lampRect(L) { const Z = this.spots(L); return { x: Z.lamp.x - 16, y: Z.lamp.y - 46, w: 36, h: 50 }; },
  badgeRect(L) { return { x: L.kx - 44, y: L.desk + 2, w: 14, h: 25 }; },
  // Parte estática em cache (parede, janela, mesa, monitor, objetos parados)
  bake(L, st) {
    const c = document.createElement('canvas'); c.width = L.VW; c.height = L.VH;
    const x = c.getContext('2d'), P = WD_PAL, R = this.rng(7), Z = this.spots(L), D = new Set(st.decor || []);
    const F = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    const lit = this.light(st.hour), M = L.mon, s = L.screen;
    // Parede: papel listrado, rodameio
    F(P.A, 0, 0, L.VW, L.desk);
    for (let i = 0; i < L.VW; i += 12) { F(P.a, i, 0, 1, L.desk); Pixel.dither(x, i + 1, 0, 1, L.desk, P.a, 1); }
    F(P.b, 0, L.desk - 22, L.VW, 1); F(P.B, 0, L.desk - 21, L.VW, 21); F(P.b, 0, L.desk - 20, L.VW, 1);
    // Janela alta: moldura de madeira, céu em pontilhado, prédios, persiana recolhida, peitoril
    const W = Z.win;
    F(P.k, W.x - 2, W.y - 2, W.w + 4, W.h + 4); F(P[3], W.x - 1, W.y - 1, W.w + 2, W.h + 2);
    const bayer = [0, 2, 3, 1];
    for (let j = 0; j < W.h; j++) for (let i = 0; i < W.w; i++) { const f = j / W.h * 4; F(f > bayer[(i % 2) + (j % 2) * 2] + .5 ? lit.sky[1] : lit.sky[0], W.x + i, W.y + j, 1, 1); }
    let bx = W.x;
    while (bx < W.x + W.w) { const bw = 4 + R() * 7 | 0, bh = 10 + R() * 30 | 0; F(lit.k > .75 ? P.N : P.b, bx, W.y + W.h - bh, Math.min(bw, W.x + W.w - bx), bh);
      if (lit.k > .7) for (let j = W.y + W.h - bh + 2; j < W.y + W.h - 1; j += 3) for (let i = bx + 1; i < Math.min(bx + bw - 1, W.x + W.w); i += 2) if (R() < .35) F(P.Y, i, j, 1, 1);
      bx += bw + 1; }
    F(P[4], W.x + (W.w >> 1), W.y, 2, W.h);                                              // divisória da janela
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
      const R2 = 13;
      for (let j = -R2; j <= R2; j++) for (let i = -R2; i <= R2; i++) { const d = i * i + j * j; if (d > R2 * R2) continue;
        F(d > (R2 - 1) ** 2 ? P.k : d > (R2 - 3) ** 2 ? (i + j < 0 ? P.Y : P.z) : (i + j > 6 ? P.w : P.W), C.x + i, C.y + j, 1, 1); }
      for (let h = 0; h < 12; h++) { const a = h / 12 * Math.PI * 2, rr = h % 3 ? 8 : 7; F(h % 3 ? P.P : P.k, C.x + Math.round(Math.cos(a) * 9), C.y + Math.round(Math.sin(a) * 9), 1, h % 3 ? 1 : 2); }
      const ang = ((st.hour % 12) / 12) * Math.PI * 2 - Math.PI / 2, mang = ((st.hour % 1)) * Math.PI * 2 - Math.PI / 2;
      for (let r = 0; r < 6; r++) F(P.k, C.x + Math.round(Math.cos(ang) * r), C.y + Math.round(Math.sin(ang) * r), 1, 1);
      for (let r = 0; r < 9; r++) F(P.K, C.x + Math.round(Math.cos(mang) * r), C.y + Math.round(Math.sin(mang) * r), 1, 1);
      F(P.R, C.x, C.y, 1, 1);
    }
    // Pôster corporativo (telas largas)
    if (L.right > 110) { const sx = M.x + M.w + 64, sw = Math.min(110, L.VW - sx - 8), px = sx + Math.max(0, (sw - 38) / 2 | 0), py = 30 + 4 * 34 + 14; F(P.k, px - 1, py - 1, 38, 50); F(P.R, px, py, 36, 48); F(P.W, px + 3, py + 3, 30, 30); Pixel.text(x, 'SINERGIA', px + 2, py + 37, P.W);
      for (let i = 0; i < 4; i++) F([P.F, P.O, P.L, P.I][i], px + 7 + i * 6, py + 26 - i * 5, 4, 4 + i * 5); }
    // Tampo da mesa: borda iluminada, veios
    F(P[2], 0, L.desk, L.VW, L.VH - L.desk); F(P[1], 0, L.desk, L.VW, 1); F(P[3], 0, L.desk + 1, L.VW, 1);
    for (let n = 0; n < L.VW / 9; n++) { const gx = R() * L.VW | 0, gy = L.desk + 4 + R() * (L.VH - L.desk - 6) | 0; F(P[3], gx, gy, 6 + R() * 22 | 0, 1); }
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
    const bd = st.badge || { hair: P[4], shirt: P.L };
    F(P.L, kx - 41, L.desk + 3, 1, 8); F(P.L, kx - 34, L.desk + 3, 1, 8); F(P.k, kx - 43, L.desk + 10, 12, 16); F(P.W, kx - 42, L.desk + 11, 10, 14); F(bd.shirt, kx - 42, L.desk + 11, 10, 3);
    if (bd.mini) bd.mini.forEach((row, j) => [...row].forEach((ch, i) => F(WD_PAL[ch] || P.k, kx - 40 + i, L.desk + 14 + j, 1, 1)));
    else { F(P.s, kx - 40, L.desk + 15, 4, 4); F(bd.hair, kx - 40, L.desk + 14, 4, 1); } F(P.p, kx - 40, L.desk + 20, 6, 1); F(P.p, kx - 40, L.desk + 22, 4, 1);
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
      this.shadow(x, px - 1, py + 12, 10, 2);
      for (const [dx, h, col] of [[1, 8, P.R], [3, 10, P.L], [5, 7, P.Q]]) { F(P.k, px + dx - 1, py - h + 2, 3, h); F(col, px + dx, py - h + 2, 1, h - 1); }
      F(P.k, px - 1, py + 1, 10, 12); F(P.j, px, py + 2, 8, 10); F(P.M, px, py + 2, 2, 10); F(P.J, px + 6, py + 2, 2, 10); F(P.m, px, py + 2, 8, 1); }
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
    F(P.j, px + 9, py - 3, 2, 3);
    F(P.k, px - 1, py - 1, 22, 25); F(P.W, px, py, 20, 23); F(P.R, px, py, 20, 6); F(P.q, px, py + 5, 20, 1); F(P.w, px, py + 20, 20, 3); F(P.p, px + 1, py + 22, 19, 1);
    Pixel.text(x, 'DIA', px + 5, py + 1, P.W);
    const s = String(day % 1000);
    Pixel.text(x, s, px + 10 - s.length * 2, py + 10, P.k);
    F(P.k, px + 10 - s.length * 2, py + 16, s.length * 4 - 1, 1); },
  // Telefone de mesa: toca (fone pula, luz pisca) enquanto há uma ligação na fila
  phone(x, px, py, ring, t) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    const j = ring && (t * 14 | 0) % 2 ? -1 : 0, sh = ring ? ((t * 22 | 0) % 2 ? 1 : 0) : 0;
    F(P.k, px - 1 + sh, py + 3, 28, 12); F(P.C, px + sh, py + 4, 26, 10); F(P.c, px + sh, py + 4, 26, 1); F(P.e, px + sh, py + 12, 26, 2);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) F(P.e, px + 9 + i * 4 + sh, py + 6 + r * 3, 2, 2);
    F(P.k, px + 2 + sh, py + 6, 5, 5); F(ring && (t * 4 | 0) % 2 ? P.R : P.q, px + 3 + sh, py + 7, 3, 3);
    F(P.k, px - 2 + sh, py - 1 + j, 30, 5); F(P.J, px - 1 + sh, py + j, 28, 3); F(P.j, px - 1 + sh, py + j, 28, 1); F(P.J, px - 1 + sh, py + 3 + j, 5, 2); F(P.J, px + 22 + sh, py + 3 + j, 5, 2);
    for (let i = 0; i < 5; i++) F(P.j, px - 3 - (i % 2) + sh, py + 5 + i * 2, 1, 1);
    if (ring && (t * 3 | 0) % 2) { F(P.W, px + 4, py - 5, 1, 2); F(P.W, px + 12, py - 6, 1, 3); F(P.W, px + 20, py - 5, 1, 2); } },
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
  shadow(x, px, py, w, h) { Pixel.dither(x, px, py, w, h, WD_PAL[3]); },
  paperStack(x, px, py, n) {
    const P = WD_PAL;
    this.shadow(x, px - 1, py + 13, 33, 2);
    for (let i = 0; i < n; i++) { const ox = px + (i % 2 ? 1 : -1) * (i % 3), oy = py - i * 2;
      x.fillStyle = P.k; x.fillRect(ox - 1, oy - 1, 32, 15); x.fillStyle = P.W; x.fillRect(ox, oy, 30, 13); x.fillStyle = P.w; x.fillRect(ox, oy + 11, 30, 2);
      x.fillStyle = P.p; for (let l = 3; l < 11; l += 2) x.fillRect(ox + 3, oy + l, 16 + (l * 5 % 8), 1); }
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
    // Nuvens atravessando a janela devagar
    const W = Z.win;
    ctx.save(); ctx.beginPath(); ctx.rect(W.x, W.y + 18, W.w, W.h - 18); ctx.clip(); ctx.fillStyle = lit.cloud;
    for (let n = 0; n < 3; n++) { const cxw = ((t * (1.2 + n * .5) + n * 37) % (W.w + 30)) - 20 + W.x | 0, cy = W.y + 26 + n * 17;
      ctx.fillRect(cxw, cy, 12, 2); ctx.fillRect(cxw + 2, cy - 2, 7, 2); ctx.fillRect(cxw + 4, cy - 3, 3, 1); }
    // Pássaros cruzam a janela de vez em quando; no fim da tarde, um avião com luz piscando
    const bp = (t % 26) / 5;
    if (bp < 1) { ctx.fillStyle = P.K; for (let n = 0; n < 3; n++) { const bx = W.x - 6 + bp * (W.w + 12) - n * 5 | 0, by = W.y + 22 + n * 3 + Math.round(Math.sin(t * 3 + n)), wing = (t * 8 + n | 0) % 2;
      ctx.fillRect(bx, by - wing, 1, 1); ctx.fillRect(bx + 1, by + 1 - wing, 1, 1); ctx.fillRect(bx + 2, by, 1, 1); ctx.fillRect(bx + 3, by - 1 + wing, 1, 1); } }
    if (lit.k > .6) { const ap = (t % 41) / 12; if (ap < 1) { const ax = W.x + W.w + 4 - ap * (W.w + 10) | 0, ay = W.y + 30;
      ctx.fillStyle = P.n; ctx.fillRect(ax, ay, 5, 1); ctx.fillRect(ax + 3, ay - 1, 1, 1); if ((t * 3 | 0) % 2) { ctx.fillStyle = P.R; ctx.fillRect(ax + 5, ay, 1, 1); } } }
    ctx.restore();
    // Persiana: 0 = recolhida, 1 = fechada. Lâminas de 3 px descem uma a uma; a luz diminui junto
    const bl = st.blind || 0, slats = Math.max(4, Math.round(4 + bl * (W.h / 3 - 4))), yEnd = W.y + slats * 3;
    ctx.fillStyle = P[4]; ctx.fillRect(W.x - 1, W.y - 1, W.w + 2, 3);
    for (let j = 0; j < slats; j++) { const y = W.y + 2 + j * 3; if (y + 2 > W.y + W.h) break; ctx.fillStyle = P.C; ctx.fillRect(W.x, y, W.w, 2); ctx.fillStyle = P.e; ctx.fillRect(W.x, y + 2, W.w, 1); }
    ctx.fillStyle = P.k; ctx.fillRect(W.x - 1, Math.min(yEnd + 1, W.y + W.h - 2), W.w + 2, 3); ctx.fillStyle = P.z; ctx.fillRect(W.x, Math.min(yEnd + 2, W.y + W.h - 1), W.w, 1);
    const cy = Math.min(yEnd + 4, W.y + W.h - 2);
    ctx.fillStyle = P.j; ctx.fillRect(W.x + W.w - 4, W.y + 2, 1, cy + 12 - W.y); ctx.fillStyle = P.k; ctx.fillRect(W.x + W.w - 6, cy + 13, 5, 4); ctx.fillStyle = P.z; ctx.fillRect(W.x + W.w - 5, cy + 14, 3, 2);
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
    const lampOn = !st.lights || st.lights.lamp !== false;
    if (D.has('lamp')) this.lamp(ctx, Z.lamp.x, Z.lamp.y, t, lampOn);
    // Troféu com brilho que passa de vez em quando
    if (D.has('trofeu')) this.trophy(ctx, Z.trophy.x, Z.trophy.y, t);
    // Caneca com vapor (enquanto o café está quente)
    const mug = st.rank >= 1 ? SPR2.mug.map((r, j) => j === 1 ? r.replace(/t/g, 'Y') : r) : SPR2.mug;
    ctx.drawImage(Pixel.master(mug, WD_PAL), Z.mug.x, Z.mug.y);
    if (st.hour < 16 || st.clutter < 2) ctx.drawImage(Pixel.master(SPR2.steam[(t * 5 | 0) % 3], WD_PAL), Z.mug.x + 3, Z.mug.y - 7);
    // Gato: rabo balança, pisca, mexe a orelha
    if (D.has('gato')) { const cx = Z.cat.x, cy = Z.cat.y, ph = (t % 4) < .7 ? ((t * 8 | 0) % 3) : 0;
      ctx.drawImage(Pixel.master(SPR2.catTail[ph], WD_PAL), cx + 12, cy + 4); ctx.drawImage(Pixel.master(SPR2.cat, WD_PAL), cx, cy);
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
    if (st.blind) { ctx.fillStyle = `rgba(40,28,60,${.07 * st.blind})`; ctx.fillRect(0, 0, L.VW, L.VH); }
    if (D.has('lamp') && lampOn) { const fl = .2 + Math.sin(t * 9) * .01; ctx.fillStyle = `rgba(255,231,163,${fl})`; const hx = Z.lamp.x - 14, hy = Z.lamp.y - 44;
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
