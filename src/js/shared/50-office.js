/* ================= Cena do escritório (canvas) ================= */
// Resolução virtual de referência 640×360. O canvas cresce em pixels de arte para preencher qualquer proporção
// (sem barras nem distorção) e é ampliado por escala inteira de pixels físicos. O monitor domina a cena;
// a área da tela é devolvida para posicionar o jogo em HTML exatamente por cima.
const Office = {
  BASE_W: 640, BASE_H: 360,
  BEZEL: 5, CHIN: 9, TOP: 3, DESK: 62, SIDE: 78,
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
    // tela até 68% da altura: sobra parede acima (webcam, decoração) e laterais mais largas para o ambiente
    let sh = Math.min(Math.min(FH, VH) - this.DESK - 4 - this.CHIN - this.TOP - this.BEZEL, Math.round(Math.min(FH, VH) * .68));
    const maxW = Math.min(FW, VW) - 2 * (this.BEZEL + this.SIDE);
    let sw = Math.min(maxW, Math.round(sh * 16 / 9));
    if (sw / sh < 4 / 3) sh = Math.round(sw * 3 / 4);
    const sx = Math.round((VW - sw) / 2), sy = chinBottom - this.CHIN - sh;
    const mon = { x: sx - this.BEZEL, y: sy - this.BEZEL, w: sw + this.BEZEL * 2, h: sh + this.BEZEL + this.CHIN };
    const kw = Math.min(180, sw * .36 | 0), kx = (VW - kw) / 2 | 0;
    const back = Math.max(desk - 46, Math.round(VH * .7));   // fundo do tampo (encosta na parede), escondido em parte pelo monitor
    return { VW, VH, desk, back, ky: VH - 22, screen: { x: sx, y: sy, w: sw, h: sh }, mon, left: mon.x, right: VW - (mon.x + mon.w), kx, kw };
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
    // sol (e depois lua) atravessando o céu ao longo do expediente
    { const k = lit.k, sx = W.x + W.w * (.12 + k * .76), sy = W.y + W.h * (.58 - Math.sin(Math.min(1, k * 1.1) * Math.PI) * .42), moon = k > .86, r = moon ? 3 : 4;
      const c1 = moon ? P.m : k > .6 ? P.O : P.y, c2 = moon ? P.M : k > .6 ? P.T : P.Y;
      if (!(wx === 'rain' || wx === 'snow')) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = i * i + j * j; if (d > r * r) continue; if (moon && (i + 2) ** 2 + (j - 1) ** 2 < 6) continue; F(i + j > 1 ? c2 : c1, sx + i, sy + j, 1, 1); }
      if (!moon && wx === 'clear') { ctx.globalAlpha = .18; F(P.y, sx - 6, sy, 13, 1); F(P.y, sx, sy - 6, 1, 13); ctx.globalAlpha = 1; } }
    // estrelas no fim do dia
    if (lit.k > .8 && wx === 'clear') for (let i = 0; i < 14; i++) if (Math.sin(t * 1.3 + i * 2.1) > -.2) F(i % 4 ? P.W : P.y, W.x + (i * 37) % W.w, W.y + (i * 23) % (W.h * .4), 1, 1);
    // nuvens: quantidade e cor pelo clima
    const nC = wx === 'clear' ? 3 : wx === 'cloudy' ? 7 : 9, cc = wx === 'rain' ? P.M : wx === 'snow' ? P.m : lit.cloud;
    for (let n = 0; n < nC; n++) { const sp = 1 + (n % 3) * .6, w = 10 + (n * 7) % 14, cx = ((t * sp + n * 41) % (W.w + w + 20)) - w - 10 + W.x, cy = W.y + 6 + (n * 13) % (W.h * .45);
      F(cc, cx, cy, w, 3); F(cc, cx + 2, cy - 2, w - 5, 2); F(cc, cx + 4, cy - 3, Math.max(2, w - 9), 1);
      F(wx === 'clear' ? P.W : cc, cx + 4, cy - 3, Math.max(2, w - 11), 1);                                   // topo iluminado
      F(wx === 'clear' ? (lit.k > .7 ? P.r : P.l) : P.j, cx + 1, cy + 2, w - 2, 1); }                           // base sombreada
    // passantes: um por vez, escolhido pelo tempo (avião, helicóptero, balão, bando de pássaros)
    const slot = t / 18 | 0, ph = (t % 18) / 18, kind = ['plane', 'birds', 'heli', 'birds', 'balloon', 'plane'][(slot * 2654435761 >>> 0) % 6];
    if (wx !== 'rain' || kind === 'plane') {
      const yy = W.y + 10 + ((slot * 37) % (W.h * .3));
      if (kind === 'plane') { const ax = W.x + W.w + 10 - ph * (W.w + 40) | 0;
        ctx.globalAlpha = .55; F(P.W, ax + 8, yy, Math.min(34, ph * 70), 1); ctx.globalAlpha = .3; F(P.W, ax + 8, yy + 1, Math.min(24, ph * 50), 1); ctx.globalAlpha = 1;   // rastro
        F(P.m, ax, yy, 8, 1); F(P.M, ax + 1, yy + 1, 6, 1); F(P.m, ax + 3, yy - 1, 3, 1); F(P.M, ax + 3, yy + 2, 2, 1); F(P.m, ax + 7, yy - 2, 1, 2); F(P.l, ax + 1, yy, 1, 1);
        if ((t * 3 | 0) % 2) F(P.R, ax + 4, yy - 1, 1, 1); }
      if (kind === 'heli') { const hx = W.x - 10 + ph * (W.w + 20), hy = yy + Math.sin(t * 2) * 2; F(P.J, hx, hy, 5, 3); F(P.J, hx - 4, hy + 1, 4, 1); F(P.m, hx - 2 + ((t * 20 | 0) % 2) * 3, hy - 1, 7, 1); if ((t * 4 | 0) % 2) F(P.R, hx + 5, hy + 1, 1, 1); }
      if (kind === 'balloon') { const bx = W.x + W.w * .2 + ph * W.w * .6 | 0, by = W.y + W.h * .5 - ph * W.h * .35 + Math.sin(t * 1.4) | 0;
        F(P.R, bx + 1, by, 5, 1); F(P.R, bx, by + 1, 7, 4); F(P.R, bx + 1, by + 5, 5, 1); F(P.Q, bx + 2, by, 1, 6); F(P.y, bx + 4, by, 1, 6); F(P.r, bx + 1, by + 1, 1, 2);
        F(P.q, bx + 2, by + 6, 3, 1); F(P.j, bx + 2, by + 7, 1, 1); F(P.j, bx + 4, by + 7, 1, 1); F(P[3], bx + 2, by + 8, 3, 2); }
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
    // camada distante: silhuetas mais claras (perspectiva atmosférica)
    if (!this._bld2 || this._bld2Key !== W.w + 'x' + W.h) { this._bld2Key = W.w + 'x' + W.h; const R2 = this.rng(17); this._bld2 = []; let bx2 = W.x - 3;
      while (bx2 < W.x + W.w) { const bw = 4 + R2() * 7 | 0; this._bld2.push({ x: bx2, w: bw, h: 14 + R2() * W.h * .55 | 0 }); bx2 += bw; } }
    for (const b of this._bld2) { F(night > .75 ? P.n : night > .55 ? P.a : P.v, b.x, base - b.h, b.w, b.h); if (night > .6 && (b.h * 7 + b.x) % 5 === 0) F(P.y, b.x + 1, base - b.h + 3, 1, 1); }
    for (const b of this._bld) {
      if (b.seed % 3 === 0 && b.w >= 5 && !b.sign) { F(P.k, b.x + 2, base - b.h - 4, 1, 4); if (night > .5 && (t * 1.5 | 0) % 2) F(P.R, b.x + 2, base - b.h - 5, 1, 1); }   // antena
      if (b.seed % 5 === 1 && b.w >= 7) { F(P.k, b.x + 1, base - b.h - 3, 4, 3); F(P[3], b.x + 2, base - b.h - 2, 2, 2); }                                            // caixa-d'água
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
  // Mesa em fileiras (direção de arte): a fileira do meio fica entre o pé do monitor e o teclado. À esquerda do teclado,
  // do centro para fora: caneca, crachá, papéis, porta-canetas, porta-retrato; à direita, depois do mouse: papéis, gato,
  // troféu, pato, globo, livros. Quem não cabe vai para o fundo da mesa ao lado do monitor (laterais). Cada item tem
  // largura própria e é ancorado pela base (y = onde encosta no tampo), então nada se sobrepõe nem fica cortado.
  DESK_ITEMS: {
    left:  [['mug', 22, true], ['badge', 16, true], ['papersL', 33, true], ['pens', 17, true], ['foto', 22], ['livros', 31]],
    right: [['papersR', 33, true], ['gato', 30], ['trofeu', 20], ['pato', 18], ['globo', 19]],
    sideL: [['planta', 26], ['caixaL', 13]],
    sideR: [['caixaR', 13], ['lamp', 36]],
  },
  deskSlots(L, decor) {
    const key = [L.VW, L.VH, (decor || []).join()].join('|'); if (this._slotKey === key) return this._slots;
    const has = id => decor && decor.includes(id === 'caixaL' || id === 'caixaR' ? 'caixas' : id), out = {}, ef = Math.max(3, L.VW * .015 | 0);
    const yb = L.ky - 4, over = [];
    // esquerda: do teclado para fora, até encostar no telefone (canto esquerdo da frente)
    let x = L.kx - 8; const minL = ef + 98;
    for (const [id, w, always] of this.DESK_ITEMS.left) { if (!always && !has(id)) continue; if (x - w < minL) { over.push([id, w]); continue; } x -= w; out[id] = { x, y: yb, w }; x -= 6; }
    // direita: depois do mouse até a borda
    x = L.kx + L.kw + 32; const maxR = L.VW - ef - 6;
    for (const [id, w, always] of this.DESK_ITEMS.right) { if (!always && !has(id)) continue; if (x + w > maxR) { over.push([id, w]); continue; } out[id] = { x, y: yb, w }; x += w + 6; }
    // laterais do monitor (fundo da mesa): esquerda encostada no monitor para fora; direita idem
    const bD = L.desk + 3, eb = Math.max(6, L.VW * .07 | 0);
    const sideL = this.DESK_ITEMS.sideL.filter(([id]) => id === 'planta' ? has(id) : has(id)), sideR = this.DESK_ITEMS.sideR.filter(([id]) => has(id));
    let xl = L.mon.x - 3, xr = L.mon.x + L.mon.w + 3;
    const putL = (id, w) => { if (xl - w < 4) return false; xl -= w; out[id] = { x: xl, y: bD, w }; xl -= 4; return true; };
    const putR = (id, w) => { if (xr + w > L.VW - 4) return false; out[id] = { x: xr, y: bD, w }; xr += w + 4; return true; };
    sideL.forEach(([id, w]) => putL(id, w)); sideR.forEach(([id, w]) => putR(id, w));
    // excedente: primeiro o que sobra da fileira da direita, depois as laterais
    over.forEach(([id, w]) => { if (x + w <= maxR) { out[id] = { x, y: yb, w }; x += w + 6; return; } if (!putL(id, w)) putR(id, w); });
    this._slotKey = key; this._slots = out; return out;
  },
  // Posições dos objetos: um só lugar define onde cada coisa fica (usado no cache e na animação)
  spots(L, decor = this._decor) {
    const M = L.mon, s = L.screen, Q = this.deskSlots(L, decor || []), at = (id, dx, dy, fb) => Q[id] ? { x: Q[id].x + dx, y: Q[id].y + dy } : fb;
    return {
      win: (() => { const x0 = Math.max(6, Math.min(20, L.left >> 3)), w = L.mon.x - x0 + Math.min(120, L.mon.w >> 2); return { x: x0, y: 16, w, h: Math.max(54, (L.desk - 30) * .6 | 0), vis: L.mon.x - x0 }; })(),
      // planta e luminária na frente da mesa (o fundo fica atrás do monitor em telas largas); à direita do telefone e no canto direito
      plant: at('planta', 1, 0, { x: -99, y: L.desk }),
      // Objetos comprados ficam na frente da mesa, fora da tela; só descem para a moldura se não houver espaço
      frame: at('foto', 1, -20, { x: -99, y: L.desk }),
      trophy: at('trofeu', 3, -20, { x: -99, y: L.desk }),
      lamp: at('lamp', 16, 0, { x: -99, y: L.desk }),
      // Detalhes do ambiente (não dependem de compras)
      phone: { x: Math.max(L.VW * .07 | 0, 6) + 4, y: L.desk + 6 },   // telefone grande no canto esquerdo da mesa
      pens: at('pens', 4, -12, null),
      cal: L.right >= 30 ? { x: M.x + M.w + Math.max(5, Math.min(14, (L.right / 2 | 0) - 12)), y: 52 } : null,
      sideMon: { x: M.x + M.w + 4, y: Math.max(40, (s.y + s.h * .28) | 0) },
      clock: { x: M.x + M.w + Math.max(18, Math.min(26, (L.right / 2) | 0)), y: 26 },
      mug: at('mug', 5, -13, { x: L.kx - 26, y: L.desk + 9 }),
      badge: at('badge', 1, -26, { x: L.kx - 46, y: L.desk + 7 }),
      papersL: at('papersL', 1, -14, { x: L.kx - 84, y: L.desk + 10 }),
      papersR: at('papersR', 1, -14, { x: L.kx + L.kw + 34, y: L.desk + 8 }),
      cat: at('gato', 3, -18, { x: -99, y: L.desk }),
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
    const u = Math.max(5, Math.floor((L.kw - 4) / 15)), base = L.kx + ((L.kw - 15 * u) >> 1), ky = L.ky, m = new Map();
    for (const [code, r, c, w] of this.KEYS) m.set(code, { x: base + Math.round(c * u), y: ky + 1 + r * 4, w: Math.round(w * u) - 1 });
    return (L._keys = m);
  },
  lampRect(L) { const Z = this.spots(L); return { x: Z.lamp.x - 18, y: Z.lamp.y - 36, w: 38, h: 40 }; },
  phoneRect(L) { const Z = this.spots(L); return { x: Z.phone.x - 6, y: Z.phone.y - 8, w: 54, h: 34 }; },
  badgeRect(L) { const b = this.spots(L).badge; return { x: b.x, y: b.y - 6, w: 14, h: 27 }; },
  // Parte estática em cache (parede, janela, mesa, monitor, objetos parados)
  bake(L, st) {
    const c = document.createElement('canvas'); c.width = L.VW; c.height = L.VH;
    this._decor = st.decor || [];
    const x = c.getContext('2d'), P = WD_PAL, R = this.rng(7), Z = this.spots(L), D = new Set(st.decor || []);
    const F = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    const lit = this.light(st.hour), M = L.mon, s = L.screen;
    // Parede: papel listrado, rodameio
    F(P.A, 0, 0, L.VW, L.desk);
    for (let i = 0; i < L.VW; i += 12) { F(P.a, i, 0, 1, L.desk); Pixel.dither(x, i + 1, 0, 1, L.desk, P.a, 1); }
    F(P.b, 0, L.back - 22, L.VW, 1); F(P.B, 0, L.back - 21, L.VW, 21); F(P.b, 0, L.back - 20, L.VW, 1);
    // Janela alta: moldura de madeira, céu em pontilhado, prédios, persiana recolhida, peitoril
    const W = Z.win;
    // moldura de madeira em relevo (luz de cima à esquerda), batente interno escuro e peitoril com espessura e sombra
    F(P.k, W.x - 5, W.y - 5, W.w + 10, W.h + 10); F(P[2], W.x - 4, W.y - 4, W.w + 8, W.h + 8);
    F(P[1], W.x - 4, W.y - 4, W.w + 8, 1); F(P[1], W.x - 4, W.y - 4, 1, W.h + 8); F(P[3], W.x + W.w + 3, W.y - 3, 1, W.h + 7); F(P[3], W.x - 3, W.y + W.h + 3, W.w + 7, 1);
    F(P.k, W.x - 1, W.y - 1, W.w + 2, W.h + 2); F(P[4], W.x - 2, W.y - 2, W.w + 4, 1); F(P[4], W.x - 2, W.y - 2, 1, W.h + 4);
    F(P.k, W.x - 7, W.y + W.h + 4, W.w + 14, 6); F(P[1], W.x - 6, W.y + W.h + 5, W.w + 12, 1); F(P[2], W.x - 6, W.y + W.h + 6, W.w + 12, 2); F(P[3], W.x - 6, W.y + W.h + 8, W.w + 12, 1);  // peitoril
    for (let i = 0; i < W.w + 12; i += 9) F(P[3], W.x - 4 + i, W.y + W.h + 6, 3, 1);                                                       // veios do peitoril
    this.shadow(x, W.x - 6, W.y + W.h + 10, W.w + 12, 3);
    // Estante (só em telas largas)
    if (L.right > 110) {
      const sx = M.x + M.w + 64, sw = Math.min(110, L.VW - sx - 8);
      // prateleiras com mão-francesa e sombra; livros com lombada (faixas e título), um tombado, aparadores e objetos
      const RAMP = [[P.l, P.L, P[7]], [P.t, P.T, P.u], [P.f, P.F, P[9]], [P.y, P.z, P.Z], [P.i, P.I, P[6]], [P.c, P.C, P.e], [P.o, P.O, P[8]]];
      for (let n = 0; n < 4; n++) { const sy = 30 + n * 34, base = sy + 26;
        F(P.k, sx - 1, base - 1, sw + 2, 5); F(P[2], sx, base, sw, 2); F(P[1], sx, base, sw, 1); F(P[4], sx, base + 2, sw, 1); this.shadow(x, sx, base + 4, sw, 3);
        for (const bx of [sx + 4, sx + sw - 7]) { F(P.k, bx, base + 3, 3, 6); F(P.j, bx + 1, base + 3, 1, 5); }
        let b = sx + 3, k = 0;
        while (b < sx + sw - 5) {
          const r = R() * 1.6, rm = RAMP[R() * RAMP.length | 0];
          if (r < .1 && b < sx + sw - 24) {     // livro deitado
            const lw = 16 + R() * 6 | 0; F(P.k, b - 1, base - 6, lw + 2, 6); F(rm[1], b, base - 5, lw, 4); F(rm[0], b, base - 5, lw, 1); F(rm[2], b, base - 2, lw, 1); F(P.W, b + 3, base - 4, lw - 8, 1); b += lw + 3; continue; }
          if (r < .16) {                        // objeto: vaso pequeno ou troféu
            if (R() < .5) { F(P.k, b, base - 9, 7, 9); F(P.T, b + 1, base - 6, 5, 6); F(P.t, b + 1, base - 6, 1, 6); F(P.G, b + 1, base - 9, 5, 3); F(P.h, b + 3, base - 10, 1, 2); }
            else { F(P.k, b, base - 10, 7, 10); F(P.Y, b + 1, base - 9, 5, 4); F(P.y, b + 1, base - 9, 1, 3); F(P.z, b + 3, base - 5, 1, 3); F(P.Z, b + 1, base - 2, 5, 2); }
            b += 9; continue; }
          const bw = 3 + R() * 4 | 0, bh = 14 + R() * 10 | 0, lean = k % 9 === 8 ? 1 : 0;
          F(P.k, b - 1, base - bh - 1, bw + 2, bh + 1); F(rm[1], b, base - bh, bw, bh); F(rm[0], b, base - bh, 1, bh); F(rm[2], b + bw - 1, base - bh, 1, bh);
          F(rm[2], b, base - bh + 2, bw, 1); F(rm[2], b, base - 4, bw, 1); if (bh > 18) F(P.W, b + (bw >> 1), base - bh + 5, 1, 4 + (bh - 18 >> 1));
          b += bw + 1 + lean; k++;
        }
      }
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
    // Pôster corporativo (telas largas): moldura fina, papel com sombra, gráfico subindo e alfinetes
    if (L.right > 110) { const sx = M.x + M.w + 64, sw = Math.min(110, L.VW - sx - 8), px = sx + Math.max(0, (sw - 38) / 2 | 0), py = 30 + 4 * 34 + 16;
      this.shadow(x, px, py + 50, 38, 3); F(P.k, px - 2, py - 2, 42, 54); F(P[3], px - 1, py - 1, 40, 52); F(P.k, px, py, 38, 50); F(P.R, px + 1, py + 1, 36, 48); F(P.r, px + 1, py + 1, 36, 1);
      F(P.W, px + 4, py + 4, 30, 29); F(P.w, px + 4, py + 31, 30, 2); for (let j = py + 8; j < py + 30; j += 5) F(P.p, px + 6, j, 26, 1);
      for (let i = 0; i < 4; i++) { const hh = 4 + i * 5; F(P.k, px + 7 + i * 6, py + 30 - hh - 1, 6, hh + 1); F([P.F, P.O, P.L, P.I][i], px + 8 + i * 6, py + 30 - hh, 4, hh); }
      F(P.k, px + 6, py + 12, 1, 1); for (let i = 0; i < 18; i++) F(P.q, px + 8 + i, py + 26 - (i * .9 | 0), 1, 1);
      Pixel.text(x, 'SINERGIA', px + 3, py + 37, P.W); F(P.q, px + 3, py + 44, 32, 1);
      F(P.k, px + 3, py - 3, 3, 3); F(P.L, px + 4, py - 2, 1, 1); F(P.k, px + 32, py - 3, 3, 3); F(P.F, px + 33, py - 2, 1, 1); }
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
      // Laterais: a mesa termina antes das bordas da tela. As quinas abrem um pouco em direção a quem está sentado;
      // fora do tampo aparece o chão (carpete escuro), e a espessura do tampo fica visível como uma faixa mais escura.
      const eb = Math.max(6, L.VW * .07 | 0), ef = Math.max(2, L.VW * .015 | 0), H0 = L.VH - top;
      for (let y = top; y < L.VH; y++) {
        const k = (y - top) / H0, xl = Math.round(eb + (ef - eb) * k), xr = L.VW - xl;
        x.fillStyle = P.B; x.fillRect(0, y, xl - 3, 1); x.fillRect(xr + 3, y, L.VW - xr - 3, 1);
        if ((y + (y >> 1)) % 3 === 0) { x.fillStyle = P.b; x.fillRect((y * 7) % Math.max(1, xl - 3), y, 1, 1); x.fillRect(xr + 3 + (y * 5) % Math.max(1, L.VW - xr - 3), y, 1, 1); }
        x.fillStyle = P[4]; x.fillRect(xl - 3, y, 3, 1); x.fillRect(xr, y, 3, 1);        // espessura do tampo
        x.fillStyle = P.k; x.fillRect(xl - 4, y, 1, 1); x.fillRect(xr + 3, y, 1, 1); x.fillRect(xl - 1, y, 1, 1); x.fillRect(xr, y, 1, 1);
        x.fillStyle = P[1]; x.fillRect(xl, y, 1, 1); x.fillRect(xr - 1, y, 1, 1);            // quina iluminada
      }
      // sombra da parede no chão, junto ao fundo
      x.fillStyle = P.k; x.fillRect(0, top, eb - 3, 1); x.fillRect(L.VW - eb + 3, top, eb - 3, 1);
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
    const kx = L.kx, kw = L.kw, ky = L.ky;
    this.shadow(x, kx - 2, ky - 3, kw + 4, 2);
    // teclado com volume: tampo com aba iluminada atrás, laterais, frente grossa na sombra e sombra de contato embaixo
    F('rgba(110,59,38,.5)', kx + 1, ky + 20, kw, 2);
    F(P.k, kx - 1, ky - 1, kw + 2, 21); F(HK.base, kx, ky, kw, 16); F(HK.hi, kx, ky, kw, 1); F(HK.hi, kx, ky, 1, 16); F(HK.sh, kx + kw - 1, ky + 1, 1, 15);
    F(HK.sh, kx, ky + 16, kw, 3); F(HK.dk, kx, ky + 19, kw, 1); F(HK.base, kx + 1, ky + 16, kw - 2, 1);           // frente (espessura)
    // teclas: tampa clara com brilho à esquerda e degrau escuro embaixo
    for (const k of this.keyRects(L).values()) { F(HK.keySh, k.x, k.y + 2, k.w, 1); F(HK.key, k.x, k.y, k.w, 2); F(HK.hi, k.x, k.y, 1, 2); }
    F(P.k, kx + kw - 9, ky + 1, 6, 1); F(P.d, kx + kw - 8, ky + 1, 1, 1); F(P.d, kx + kw - 5, ky + 1, 1, 1);         // LEDs
    // Mouse com fio
    const mx = kx + kw + 18, my = L.ky;
    this.shadow(x, mx - 1, my + 12, 12, 2);
    // mouse arredondado: dois botões com vão, rodinha, corpo com brilho à esquerda e lado da sombra à direita
    F('rgba(110,59,38,.5)', mx + 1, my + 15, 10, 2);
    F(P.k, mx, my - 1, 9, 1); F(P.k, mx - 1, my, 11, 15); F(P.k, mx, my + 15, 9, 1);
    F(HO.base, mx, my, 9, 15); F(HO.hi, mx + 1, my, 3, 1); F(HO.hi, mx, my + 1, 1, 8); F(HO.sh, mx + 7, my + 2, 2, 12); F(HO.dk, mx + 1, my + 14, 7, 1);
    F(HO.sh, mx + 4, my, 1, 6); F(HO.sh, mx, my + 6, 9, 1); F(P.k, mx + 4, my + 2, 1, 3); F(HO.dk, mx + 4, my + 3, 1, 1);
    for (let i = 0; i < 16; i++) F(P.j, mx + 4 + Math.round(Math.sin(i / 3) * 3), my - 2 - i, 1, 1);
    // Papéis (crescem com o caos) e crachá
    this.paperStack(x, Z.papersL.x, Z.papersL.y, 2 + (st.clutter > 1 ? 3 : 0));
    this.paperStack(x, Z.papersR.x, Z.papersR.y, 1 + st.clutter * 2);
    const bd = st.badge || { shirt: P.L }, bx0 = Z.badge.x, by0 = Z.badge.y;
    this.shadow(x, bx0 - 1, by0 + 20, 16, 2);
    const ly = (st.hw && st.hw.lanyardColor) || P.L; F(ly, bx0 + 3, by0 - 6, 1, 6); F(ly, bx0 + 10, by0 - 6, 1, 6); F(P.k, bx0 + 5, by0 - 2, 4, 3); F(P.m, bx0 + 6, by0 - 1, 2, 1);   // cordão e presilha
    F(P.k, bx0, by0, 14, 20); F(P.W, bx0 + 1, by0 + 1, 12, 18); F(P.w, bx0 + 12, by0 + 1, 1, 18); F(P.w, bx0 + 1, by0 + 18, 12, 1);
    F((st.hw && st.hw.badgeColor) || bd.shirt, bx0 + 1, by0 + 1, 12, 3); F(P.W, bx0 + 2, by0 + 2, 3, 1);
    F(P.k, bx0 + 3, by0 + 5, 8, 9);
    if (bd.px) bd.px.forEach((row, j) => row.forEach((c, i) => F(c, bx0 + 4 + i, by0 + 6 + j, 1, 1)));
    F(P.k, bx0 + 4, by0 + 15, 6, 1); F(P.p, bx0 + 3, by0 + 17, 8, 1);                                  // nome e cargo
    for (let i = 0; i < 8; i++) if ((i * 5) % 3) F(P.K, bx0 + 3 + i, by0 + 18, 1, 1);                    // código de barras
    F(P.l, bx0 + 11, by0 + 5, 1, 2); F(P.i, bx0 + 11, by0 + 7, 1, 1); F(P.W, bx0 + 6, by0 + 2, 2, 1);      // holograma e furo
    // Bagunça: bolinhas de papel
    const RC = this.rng(31);
    for (let n = 0; n < st.clutter * 3; n++) { const px = 8 + RC() * (L.VW - 16) | 0, py = L.desk + 6 + RC() * 14 | 0;
      if (px > kx - 4 && px < kx + kw + 4 && py > L.ky - 3) continue;
      F(P.k, px - 1, py - 1, 6, 5); F(P.W, px, py, 4, 3); F(P.p, px + 2, py + 1, 2, 2); }
    // Post-its na borda externa da moldura (aumentam com o caos e à tarde)
    const notes = [[M.x - 4, M.y + 14], [M.x + M.w - 6, M.y + 40], [M.x - 5, M.y + M.h - 56], [M.x + M.w - 5, M.y + M.h - 80]];
    for (let n = 0; n < Math.min(4, st.clutter + (st.hour > 14 ? 1 : 0)); n++) x.drawImage(Pixel.master(SPR2.postit, WD_PAL), notes[n][0], notes[n][1]);
    // Calendário de parede: a folha mostra o dia da carreira
    if (Z.cal && st.day) this.calendar(x, Z.cal.x, Z.cal.y, st.day);
    // Porta-canetas e marca de café na mesa
    if (Z.pens) { const px = Z.pens.x, py = Z.pens.y;
      // copo de metal em tela, com lápis (borracha rosa), caneta azul, régua e tesoura
      this.shadow(x, px - 4, py + 12, 17, 2);
      // cilindro: boca oval com interior escuro, faixa de luz à esquerda (m), sombra à direita (J), base arredondada
      x.drawImage(Pixel.master(['..kk............', '.krrk......kk...', '.kmmk.....kLLk..', '.kQQk..k..kLLk..', '.kQQk.kmk.kLLk..', '.kQQk.kmk.kLLk..', '.kQQk.kmk.kLLk..', '..kkkkkkkkkkkk..', '.kJJJJJJJJJJJJk.', 'k0J0J0J0J0J0J0Jk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', '.kMjjjjjjjjjjJk.', '..kkkkkkkkkkkk..'], P), px - 4, py - 8); }
    if (Z.phone && !st.bigPhone) this.shadow(x, Z.phone.x - 3, Z.phone.y + 22, 48, 3);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; F(P[3], Z.mug.x - 8 + Math.round(Math.cos(a) * 5), L.desk + 22 + Math.round(Math.sin(a) * 2), 1, 1); }
    // Objetos parados: porta-retrato, plaquinha do cargo, coroa de CEO, monitor extra (moldura)
    if (typeof drawDecorExtra === 'function') drawDecorExtra(x, L, st.decor);
    if (D.has('foto') && this._slots.foto) ART.frame(x, this._slots.foto.x + 1, this._slots.foto.y);
    if (st.rank >= 2) this.nameplate(x, Z.nameplate.x, Z.nameplate.y);
    if (st.rank >= 6) this.crown(x, cx - 5, M.y - 2);
    if (D.has('monitor') && L.right >= 36) this.sideMonitor(x, Z.sideMon.x, Z.sideMon.y, Math.min(44, L.right - 6));
    // Sombras dos objetos animados (desenhados por cima a cada quadro)
    if (D.has('planta')) this.shadow(x, Z.plant.x, Z.plant.y - 1, 24, 2);
    if (D.has('gato') && this._slots.gato) { const q = this._slots.gato, cx = q.x, cy = q.y - 5;   // almofada sob o gato
      this.shadow(x, cx - 1, cy + 5, 32, 2); F(P.k, cx - 1, cy, 32, 6); F(P.L, cx, cy + 1, 30, 4); F(P.l, cx, cy + 1, 30, 1); F(P[7], cx, cy + 4, 30, 1); F(P.Y, cx - 1, cy + 1, 1, 1); F(P.Y, cx + 30, cy + 1, 1, 1); }
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
  phone(x, px, py, ring, t, held) { const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a | 0, b | 0, w, h); };
    // telefone grande: base inclinada com visor, teclado 3×4, alto-falante, luz de chamada e fone com fio enrolado.
    // Tocando: treme e o fone pula. Atendido (segurando): o fone sai da base e fica erguido.
    const shake = ring && !held ? ((t * 24 | 0) % 2 ? 1 : -1) : 0, jump = ring && !held && (t * 12 | 0) % 2 ? -2 : 0, X = px + shake;
    F(P.k, X - 1, py + 5, 46, 18); F(P.C, X, py + 6, 44, 16); F(P.c, X, py + 6, 44, 2); F(P.e, X, py + 18, 44, 3); F(P.E, X, py + 21, 44, 1);
    F(P.k, X + 3, py + 9, 15, 7); F(ring ? ((t * 4 | 0) % 2 ? P.v : P.V) : P.x, X + 4, py + 10, 13, 5); F(P.X, X + 5, py + 12, 7, 1); if (ring) F(P.W, X + 5, py + 11, 3, 1);   // visor
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { F(P.k, X + 21 + i * 5, py + 8 + r * 4, 4, 4); F(i === 3 && r === 2 ? P.F : P.c, X + 21 + i * 5, py + 8 + r * 4, 3, 3); F(P.e, X + 23 + i * 5, py + 10 + r * 4, 1, 1); }
    for (let i = 0; i < 6; i++) F(P.e, X + 4 + i * 2, py + 18, 1, 1);
    F(P.k, X + 14, py + 18, 3, 3); F(ring ? ((t * 4 | 0) % 2 ? P.R : P.q) : P.q, X + 15, py + 19, 1, 1);
    // fone: no gancho ou erguido
    const hy = held ? py - 9 : py - 2 + jump, hx = held ? X + 4 : X;
    F(P.k, hx - 2, hy, 48, 7); F(P.J, hx - 1, hy + 1, 46, 5); F(P.j, hx + 9, hy + 1, 26, 1); F(P.M, hx + 10, hy + 2, 24, 1);
    F(P.k, hx - 2, hy + 6, 10, 4); F(P.J, hx - 1, hy + 6, 8, 3); F(P.k, hx + 36, hy + 6, 10, 4); F(P.J, hx + 37, hy + 6, 8, 3);
    for (let i = 0; i < 8; i++) F(i % 2 ? P.J : P.j, X - 4 - (i % 2), py + 8 + i * 2, 1, 2);
    if (ring && !held && (t * 3 | 0) % 2) { F(P.W, px + 6, py - 9, 1, 3); F(P.W, px + 21, py - 11, 1, 4); F(P.W, px + 36, py - 9, 1, 3); } },
  // Camada de resposta imediata: teclas e botão do mouse, desenhados a cada quadro só enquanto há interação.
  // Apertada: a tecla afunda 1 px e acende; ao soltar, sobe com um brilho de 1 px (sobre-impulso) por ~90 ms.
  keyCell(L, k) {
    const cols = (L.kw - 6) / 7 | 0;
    const [r, i] = k === 'ArrowLeft' ? [2, cols - 3] : k === 'ArrowDown' ? [2, cols - 2] : k === 'ArrowRight' ? [2, cols - 1] : k === 'ArrowUp' ? [1, cols - 2] : k === 'Enter' ? [1, cols - 1] : k === ' ' ? [2, 4] : [k.charCodeAt(0) % 3, (k.charCodeAt(0) * 7) % Math.max(1, cols - 4)];
    const ox = L.kx + 3 + i * 7 + (r % 2) * 3, oy = L.ky + 2 + r * 5;
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
    const mx = L.kx + L.kw + 18, my = L.ky, BTN = [[mx, 4], [mx + 5, 4], [mx + 4, 1]];   // esquerdo, direito, meio
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
    // pilha com volume: topo (folha de cima), frente com a borda de cada folha, lateral direita na sombra e sombra de contato
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); }, th = Math.max(2, n + 1), W2 = 30, H2 = 12, ty = py - th + 2;
    this.shadow(x, px + 1, py + H2 + 2, W2 + 3, 3);
    F(P.k, px - 1, ty - 1, W2 + 3, H2 + th + 2);
    F(P.W, px, ty, W2, H2); F(P.w, px, ty + H2 - 1, W2, 1);                                              // topo
    for (let i = 0; i < th; i++) F(i % 2 ? P.p : P.w, px, ty + H2 + i, W2, 1);                         // frente: bordas das folhas
    for (let i = 0; i < th; i += 3) F(P.W, px + 2 + (i * 7) % 9, ty + H2 + i, 6, 1);                     // folhas desalinhadas
    F(P.P, px + W2, ty + 1, 1, H2 + th - 1); F(P.p, px + W2 - 1, ty + H2, 1, th);                         // lateral na sombra
    F(P.L, px + 3, ty + 2, 10, 2); for (let l = 5; l < H2 - 1; l += 2) F(P.p, px + 3, ty + l, 16 + (l * 5 % 8), 1);   // texto da folha de cima
    F(P.k, px + 20, ty + 9, 6, 1); F(P.k, px + 22, ty + 8, 2, 1);                                         // rubrica
    F(P.k, px + W2 - 6, ty - 3, 4, 6); F(P.m, px + W2 - 5, ty - 2, 2, 4); F(P.M, px + W2 - 5, ty + 1, 2, 1); // clipe
    F(P.w, px + W2 - 3, ty, 3, 3); F(P.p, px + W2 - 2, ty + 1, 2, 2);                                     // canto dobrado
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
    this._decor = st.decor || [];
    const P = WD_PAL, D = new Set(st.decor || []), s = L.screen, M = L.mon, Z = this.spots(L), lit = this.light(st.hour);
    // instalação: o item recém-comprado cai no lugar em ~0,6 s (deslocamento inteiro, desacelerando)
    const glows = [];   // fontes de luz desenhadas neste quadro (posição real): usadas na iluminação com a persiana fechada
    const now = performance.now(), drop = id => { const a = (OFFICE_APPEAR[id] || 0), k = (now - a) / 600; return a && k < 1 ? -Math.round((1 - k) * (1 - k) * 18) : 0; };
    ctx.drawImage(baked, 0, 0);
    const W = Z.win;
    ctx.save(); ctx.beginPath(); ctx.rect(W.x - 1, W.y - 1, W.w + 2, W.h + 40); ctx.rect(M.x - 1, M.y - 1, M.w + 2, M.h + 30); ctx.clip('evenodd');
    ctx.save(); ctx.beginPath(); ctx.rect(W.x, W.y, W.w, W.h); ctx.clip(); this.sky(ctx, W, st, t, lit);
    // reflexo no vidro: duas faixas diagonais bem leves que deslizam devagar
    { const off = (t * 2) % (W.w + W.h); ctx.fillStyle = 'rgba(255,255,255,.07)';
      for (const [d0, wd] of [[0, 6], [11, 2]]) for (let j = 0; j < W.h; j++) ctx.fillRect(W.x + ((off + d0 - j * .6) % (W.w + W.h)) - W.h * .3 | 0, W.y + j, wd, 1); }
    ctx.restore();
    // Persiana: 0 = recolhida, 1 = fechada. Lâminas de 3 px descem uma a uma; a luz diminui junto
    const bl = st.blind || 0, slats = Math.max(4, Math.round(4 + bl * (W.h / 3 - 4))), yEnd = W.y + slats * 3;
    ctx.fillStyle = P[4]; ctx.fillRect(W.x - 1, W.y - 1, W.w + 2, 3);
    for (let j = 0; j < slats; j++) { const y = W.y + 2 + j * 3; if (y + 2 > W.y + W.h) break; ctx.fillStyle = P.c; ctx.fillRect(W.x, y, W.w, 1); ctx.fillStyle = P.C; ctx.fillRect(W.x, y + 1, W.w, 1); ctx.fillStyle = P.e; ctx.fillRect(W.x, y + 2, W.w, 1);
      ctx.fillStyle = P.E; ctx.fillRect(W.x + (W.w * .3 | 0), y, 1, 3); ctx.fillRect(W.x + (W.w * .7 | 0), y, 1, 3); }        // fitas que seguram as lâminas
    ctx.fillStyle = P.k; ctx.fillRect(W.x - 1, Math.min(yEnd + 1, W.y + W.h - 2), W.w + 2, 3); ctx.fillStyle = P.z; ctx.fillRect(W.x, Math.min(yEnd + 2, W.y + W.h - 1), W.w, 1);
    const cy = Math.min(yEnd + 4, W.y + W.h - 2);
    const cdx = W.x + 4;   // cordão da persiana na ponta visível da janela
    const sway = Math.round(Math.sin(t * 1.3) * (1 + (st.blindMoving ? 2 : 0)));      // o cordão balança de leve
    ctx.fillStyle = P.j; ctx.fillRect(cdx, W.y + 2, 1, cy + 8 - W.y); ctx.fillRect(cdx + (sway > 0 ? 1 : sway < 0 ? -1 : 0), cy + 8, 1, 5);
    ctx.fillStyle = P.k; ctx.fillRect(cdx - 2 + sway, cy + 13, 5, 4); ctx.fillStyle = P.z; ctx.fillRect(cdx - 1 + sway, cy + 14, 3, 2); ctx.fillStyle = P.y; ctx.fillRect(cdx - 1 + sway, cy + 14, 1, 1);
    ctx.restore();
    // Prateleira sob a janela com rádio, cacto e aquário em tamanho real (arte própria, animados)
    // livros sem lugar na mesa (telas estreitas) vão para a prateleira
    const shelfItems = [['radio', 34], ['cacto', 18], ['aquario', 38], ['livros', 31]].filter(([k]) => D.has(k) && (k !== 'livros' || !(this._slots || {}).livros));
    if (shelfItems.length) {
      const sx = Math.max(3, W.x + 2), maxW = M.x - 6 - sx, rowsS = [[]]; let used = 0;
      for (const it of shelfItems) { if (used + it[1] + 4 > maxW && rowsS[rowsS.length - 1].length) { rowsS.push([]); used = 0; } rowsS[rowsS.length - 1].push(it); used += it[1] + 4; }
      rowsS.forEach((row, ri) => { const sy = W.y + W.h + 38 + ri * 36, sw = Math.min(maxW, row.reduce((a, [, w]) => a + w + 4, 0) + 6);
        ctx.fillStyle = P.k; ctx.fillRect(sx - 1, sy, sw + 2, 5); ctx.fillStyle = P[1]; ctx.fillRect(sx, sy + 1, sw, 1); ctx.fillStyle = P[2]; ctx.fillRect(sx, sy + 2, sw, 2);
        ctx.fillStyle = P[4]; ctx.fillRect(sx + 3, sy + 5, 2, 4); ctx.fillRect(sx + sw - 5, sy + 5, 2, 4); ctx.fillStyle = 'rgba(42,31,45,.25)'; ctx.fillRect(sx, sy + 5, sw, 2);
        let x0 = sx + 3;
        for (const [k, w] of row) { const dy = drop(k);
          if (k === 'radio') { ART.radio(ctx, x0, sy + dy, t, st); if (st.sound) glows.push([x0 + 26, sy - 10, 10, 6, '255,214,140', .3]); } if (k === 'cacto') ART.cactus(ctx, x0, sy + dy, t); if (k === 'livros') ART.books(ctx, x0, sy + dy); if (k === 'aquario') { ART.aquarium(ctx, x0, sy + dy, t, st); glows.push([x0 + 19, sy - 14, 26, 18, '120,200,220', .4]); }
          x0 += w + 4; } });
    }
    // Telefone de mesa (toca quando há uma ligação esperando)
    if (Z.phone && !st.bigPhone) this.phone(ctx, Z.phone.x, Z.phone.y, st.ringing, t, st.phoneHeld);
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
    // caneca maior (22x22): boca oval com café, corpo com luz à esquerda e sombra à direita, alça e faixa do logo
    const MUG = ['....kkkkkkkkkkk.......', '..kTTTTTTTTTTTTTk.....', '.k4t44444444444u4k....', '.k333333333333333k....', '..kkkkkkkkkkkkkkk.....', '.kttTTTTTTTTTTTuuqk...', '.ktWTTTTTTTTTTTuuqk...', '.ktWTTTTTTTTTTTuuqkkk.', '.ktWTTTTTTTTTTTuuqku.k', '.kttTTyyyyyyyTTuuqku.k', '.kttTTyYYYYYyTTuuqkq.k', '.kttTTyYYYYYyTTuuqkq.k', '.kttTTyyyyyyyTTuuqkq.k', '.kttTTTTTTTTTTTuuqkq.k', '.kttTTTTTTTTTTTuuqkq.k', '.kttTTTTTTTTTTTuuqkq.k', '.kttTTTTTTTTTTTuuqkkk.', '.kttTTTTTTTTTTTuuqk...', '.kttTTTTTTTTTTTuuqk...', '.kuuuuuuuuuuuuuuuuk...', '..kkkkkkkkkkkkkkkk....', '......................'];
    const mug = st.rank >= 1 ? MUG : MUG.map(r => r.replace(/[yY]/g, 'W'));
    ctx.drawImage(Pixel.master(mug, WD_PAL), Z.mug.x - 5, Z.mug.y - 9);
    if (st.hour < 16 || st.clutter < 2) ctx.drawImage(Pixel.master(SPR2.steam[(t * 5 | 0) % 3], WD_PAL), Z.mug.x + 1, Z.mug.y - 16);
    // Gato: rabo balança, pisca, mexe a orelha
    // Objetos com arte própria e animação (57-decor-art): gato, webcam, globo, livros, caixas de som
    const Q = this._slots || {};
    if (D.has('gato') && Q.gato) { const c = OFFICE_CAT; CatAI.step(c, t); catDrawBound(ctx, Q.gato.x, Q.gato.y - 4 + drop('gato'), st.cat || 'laranja', c, t); }
    if (D.has('globo') && Q.globo) ART.globe(ctx, Q.globo.x, Q.globo.y + drop('globo'), t, { spin: OFFICE_GLOBE.spin(t) });
    if (D.has('pato') && Q.pato) duckDraw(ctx, Q.pato.x, Q.pato.y + drop('pato'), t);
    if (D.has('livros') && Q.livros) ART.books(ctx, Q.livros.x, Q.livros.y + drop('livros'));
    if (D.has('caixas')) { if (Q.caixaL) ART.speaker(ctx, Q.caixaL.x, Q.caixaL.y + drop('caixas'), t, st); if (Q.caixaR) ART.speaker(ctx, Q.caixaR.x, Q.caixaR.y + drop('caixas'), t, st); }
    // parede: neon e diploma acima do monitor (ladeando a webcam); quadro na faixa da direita, abaixo do monitor extra
    if (M.y >= 22) { if (D.has('neon')) { ART.neon(ctx, M.x + (M.w >> 1) + 26, M.y - 21 + drop('neon'), t); glows.push([M.x + (M.w >> 1) + 42, M.y - 13, 26, 14, '239,75,63', .45]); } if (D.has('diploma')) ART.diploma(ctx, M.x + (M.w * .78 | 0), M.y - 25 + drop('diploma')); }
    if (D.has('quadro') && L.right >= 40) { const rx = M.x + M.w + ((L.right - 34) >> 1); ART.painting(ctx, rx, (D.has('monitor') ? Z.sideMon.y + 46 : 112) + drop('quadro'), t); }
    if (D.has('webcam')) ART.webcam(ctx, M.x + (M.w >> 1), M.y - 13 + drop('webcam'), t, { live: !!st.ringing || !!OFFICE_LIVE() });
    // Papel do topo da pilha levanta com o caos
    if (st.clutter >= 2 && (t % 3) < .5) { ctx.fillStyle = P.W; ctx.fillRect(L.kx + L.kw + 60, L.desk + 6 - st.clutter * 4, 4, 1); }
    // LED de energia: verde, âmbar ou vermelho piscando conforme o estresse
    const led = st.stress > 80 ? ((t * 4 | 0) % 2 ? P.R : P.q) : st.stress > 50 ? P.Q : P.d;
    ctx.fillStyle = P.k; ctx.fillRect(M.x + M.w - 20, M.y + M.h - 7, 4, 4); ctx.fillStyle = led; ctx.fillRect(M.x + M.w - 19, M.y + M.h - 6, 2, 2);
    // Luz: feixe da janela, poeira, cone da luminária e tom da hora, sem tocar na tela do monitor
    // feixe largo e suave: nasce do vão inteiro da janela (do peitoril para baixo), fica atrás do monitor e some aos poucos
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.VW, L.VH); ctx.rect(M.x - 2, M.y - 2, M.w + 4, L.desk - M.y + 6); ctx.rect(W.x, W.y, W.w, W.h); ctx.clip('evenodd');
    const open = 1 - (st.blind || 0) * .9, slope = .45 + lit.k * .45, sill = W.y + W.h, H2 = Math.max(1, L.VH - sill);
    ctx.fillStyle = lit.beam;
    for (let j = W.y; j < L.VH; j++) {
      const d = Math.max(0, j - W.y), a = W.x + d * slope | 0, w = (W.vis || W.w) + d * .35 | 0, fade = j < sill ? .35 : 1 - (j - sill) / H2 * .75;
      ctx.globalAlpha = open * .42 * fade; ctx.fillRect(a, j, w, 1);
    }
    ctx.globalAlpha = (st.blind || 0) > .3 ? 0 : open * .7; ctx.fillStyle = 'rgba(255,248,220,.8)';   // poeira só com a persiana aberta
    for (let n = 0; n < 10; n++) { const ph = (t * .05 + n * .137) % 1, j = W.y + 20 + ph * (L.desk - W.y - 30) | 0, a = W.x + (j - W.y) * slope + ((n * 13 + Math.sin(t + n) * 3) | 0) % Math.max(4, W.vis || W.w); ctx.fillRect(a | 0, j, 1, 1); }
    ctx.globalAlpha = 1;
    // a cor do céu entra pela janela e banha o ambiente, mais forte perto dela (some com a persiana fechada)
    { const b = lit.beamRGB, a = b[3] * .55 * open, span = L.VW * .75, N = 6;   // faixas verticais em degraus, sem degradê suave
      for (let n = 0; n < N; n++) { ctx.fillStyle = `rgba(${b[0] | 0},${b[1] | 0},${b[2] | 0},${(a * (1 - n / N)).toFixed(3)})`; ctx.fillRect(n === 0 ? 0 : Math.round(W.x + span * n / N), 0, Math.round(n === 0 ? W.x + span / N : span / N), L.VH); } }
    // Cortina fechada: a sala escurece de verdade e o que tem luz própria ganha destaque (tela do monitor, luminária, aquário)
    if (st.blind) { const b = st.blind;
      // escurece com um tom roxo-azulado (sombra com matiz frio), sem virar preto
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(86,70,120,${(.5 * b).toFixed(3)})`; ctx.fillRect(0, 0, L.VW, L.VH); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      // luz própria em poças de pixel: 6 degraus pequenos (invisíveis como anéis) e em elipse achatada sobre a mesa
      const pool = (cx, cy, rx, ry, rgb, a) => { ctx.fillStyle = `rgba(${rgb},${(a * b / 6).toFixed(3)})`;
        for (let k = 6; k >= 1; k--) { const fx = rx * k / 6, fy = ry * k / 6; for (let j = -Math.ceil(fy); j <= fy; j++) { const w = Math.round(fx * Math.sqrt(Math.max(0, 1 - (j / fy) ** 2))); if (w > 0) ctx.fillRect(Math.round(cx - w), Math.round(cy + j), w * 2, 1); } } };
      // a tela acesa: brilho de 1 px na borda interna da moldura e um feixe em trapézio, em 3 faixas, caindo sobre a mesa
      ctx.fillStyle = `rgba(150,210,220,${(.35 * b).toFixed(3)})`; ctx.fillRect(s.x - 2, s.y - 2, s.w + 4, 1); ctx.fillRect(s.x - 2, s.y + s.h + 1, s.w + 4, 1); ctx.fillRect(s.x - 2, s.y - 1, 1, s.h + 2); ctx.fillRect(s.x + s.w + 1, s.y - 1, 1, s.h + 2);
      const deskH = L.VH - L.desk;
      for (const [k, a] of [[1, .07], [.8, .07], [.6, .08]]) { ctx.fillStyle = `rgba(130,190,205,${(a * b).toFixed(3)})`;
        for (let j = 0; j < deskH; j++) { const half = Math.round((s.w * .5 + j * 1.2) * k); ctx.fillRect(Math.round(s.x + s.w / 2 - half), L.desk + j, half * 2, 1); } }
      glows.forEach(g => pool(...g));
      ctx.restore(); }
    // Luminária acesa: cone em duas faixas de borda definida (externa mais fraca, miolo mais forte), da boca da cúpula até
    // o tampo, e uma poça de luz em três degraus na mesa. Nada de degradê suave; o brilho oscila 1 degrau, bem de leve.
    if (D.has('lamp') && lampLv > 0) {
      const fl = (1 + ((t * 9 | 0) % 11 === 0 ? -.15 : 0)) * lampLv, cx = Z.lamp.x - 6, y0 = Z.lamp.y - 24, y1 = Z.lamp.y + 1, Hh = y1 - y0;
      for (const [k, a] of [[1, .09], [.6, .1]]) { ctx.fillStyle = `rgba(255,231,163,${(a * fl).toFixed(3)})`;
        for (let j = 0; j <= Hh; j++) { const w = Math.round((7 + j * .75) * k); ctx.fillRect(cx - w, y0 + j, w * 2, 1); } }
      // (sem poça redonda: só o cone)
    }
    ctx.globalCompositeOperation = lit.tint[1]; ctx.fillStyle = lit.tint[0]; ctx.fillRect(0, 0, L.VW, L.VH);
    ctx.restore();
  },
  // Espada-de-são-jorge: folhas afinando até a ponta, listras e balanço suave
  plant(x, px, baseY, t) {
    // Suculenta (echevéria) em vaso redondo de cerâmica. Rosetas de folhas grossas com ponta rosada, luz de cima à esquerda:
    // folhas de trás mais escuras, da frente mais claras. Vaso com boca elíptica, bojo e sombra à direita.
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a | 0, b | 0, w, h); }, cx = px + 12, sway = Math.round(Math.sin(t * .8) * .6);
    // vaso: boca elíptica com terra, bojo arredondado (largura varia por linha), pé
    const vy = baseY - 14;
    F(P.k, cx - 9, vy, 18, 3); F(P[4], cx - 8, vy + 1, 16, 1); F(P.t, cx - 9, vy, 4, 1);
    for (let j = 0; j < 12; j++) { const half = Math.round(9 - Math.max(0, j - 6) * .55); F(P.k, cx - half - 1, vy + 2 + j, half * 2 + 2, 1);
      F(P.T, cx - half, vy + 2 + j, half * 2, 1); F(P.t, cx - half, vy + 2 + j, 2, 1); F(P.t, cx - half + 2, vy + 2 + j, j < 4 ? 1 : 0, 1); F(P.u, cx + half - 3, vy + 2 + j, 3, 1); F(P.q, cx + half - 1, vy + 2 + j, 1, 1); }
    F(P.u, cx - 8, vy + 3, 16, 1); F(P.t, cx - 8, vy + 3, 3, 1);                                              // aro
    F(P.k, cx - 6, vy + 14, 12, 1);
    // roseta: três anéis de folhas (trás escuro, meio, frente claro), cada folha 3x4 com ponta rosada
    // folha grossa com contorno seletivo: escuro só embaixo/à direita (lado da sombra), ponta rosada no alto
    const leaf = (lx, ly, c1, c2, tip) => { F(P.H, lx, ly + 4, 4, 1); F(P.H, lx + 3, ly, 1, 4); F(c1, lx, ly, 3, 4); F(c2, lx + 2, ly + 1, 1, 3); F(P.g, lx, ly + 1, 1, 2); F(tip, lx + 1, ly, 1, 1); };
    const ring = (n, r, dy, c1, c2, tip) => { for (let i = 0; i < n; i++) { const a = Math.PI + i / (n - 1) * Math.PI; leaf(cx - 2 + Math.round(Math.cos(a) * r) + sway, vy + dy + Math.round(Math.sin(a) * r * .45), c1, c2, tip); } };
    ring(7, 9, -2, P.h, P.H, P.r); ring(6, 6, -1, P.G, P.h, P.r); ring(5, 3, 1, P.g, P.G, P.t);
    F(P.g, cx - 2 + sway, vy - 5, 3, 3); F(P.G, cx + sway, vy - 4, 1, 2); F(P.f, cx - 2 + sway, vy - 5, 1, 1);       // miolo
  },

  lamp(x, px, deskY, t, on = true) {
    // Luminária articulada. Luz de cima à esquerda: lado esquerdo das peças em y/Y, direito em z/Z (latão puxa para o
    // laranja na sombra = variação de matiz). Braços em inclinação limpa 1:2 (degraus regulares), juntas com mola.
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    // base: disco pesado (tampo iluminado à esquerda, frente na sombra) com sombra de contato
    F(P.k, px - 2, deskY - 6, 20, 7); F(P.Y, px - 1, deskY - 5, 18, 2); F(P.y, px - 1, deskY - 5, 7, 1); F(P.z, px + 12, deskY - 5, 5, 2);
    F(P.Z, px - 1, deskY - 3, 18, 2); F(P.z, px - 1, deskY - 3, 6, 1); F(P.k, px - 1, deskY - 1, 18, 1);
    F(P.k, px + 5, deskY - 8, 6, 3); F(P.z, px + 6, deskY - 7, 4, 1);                                              // pé da haste
    // haste vertical (2 px + contorno), luz no lado esquerdo
    for (let i = 0; i < 6; i++) { const yy = deskY - 9 - i; F(P.k, px + 6, yy, 4, 1); F(P.Y, px + 7, yy, 1, 1); F(P.Z, px + 8, yy, 1, 1); }
    // cotovelo: junta redonda com parafuso
    const jx = px + 5, jy = deskY - 19; F(P.k, jx, jy, 6, 5); F(P.Y, jx + 1, jy + 1, 4, 3); F(P.y, jx + 1, jy + 1, 2, 1); F(P.Z, jx + 3, jy + 3, 2, 1); F(P.k, jx + 2, jy + 2, 2, 1);
    // mola acompanhando a haste
    for (let i = 0; i < 3; i++) F(i % 2 ? P.j : P.m, px + 10, deskY - 11 - i * 3, 2, 1);
    // braço superior em 1:2 (sobe 1 a cada 2 para a esquerda) até a articulação da cúpula
    for (let i = 0; i < 9; i++) { const ax = jx - 1 - i * 2, ay = jy - 1 - i; F(P.k, ax - 1, ay - 1, 4, 3); F(P.Y, ax, ay, 2, 1); F(P.Z, ax, ay + 1, 2, 0); }
    // cúpula cônica: contorno, três tons por direção da luz, aro inferior iluminado e interior escuro
    const hx = px - 16, hy = deskY - 34;
    F(P.k, hx + 4, hy - 1, 12, 2); F(P.k, hx + 2, hy + 1, 16, 2); F(P.k, hx, hy + 3, 20, 7);
    F(P.y, hx + 5, hy, 6, 1); F(P.Y, hx + 11, hy, 4, 1);
    F(P.y, hx + 3, hy + 1, 5, 2); F(P.Y, hx + 8, hy + 1, 7, 2); F(P.z, hx + 15, hy + 1, 2, 2);
    F(P.y, hx + 1, hy + 3, 4, 5); F(P.Y, hx + 5, hy + 3, 9, 5); F(P.z, hx + 14, hy + 3, 4, 5); F(P.Z, hx + 18, hy + 3, 1, 5);
    F(P.Z, hx + 1, hy + 8, 18, 1); F(P.y, hx + 1, hy + 8, 3, 1);                                                  // aro
    F(P.k, hx + 8, hy - 3, 4, 3); F(P.z, hx + 9, hy - 2, 2, 2);                                                   // articulação no topo
    // lâmpada: acesa com miolo claro e halo de 1 px; apagada cinza
    if (on) { F(P.W, hx + 6, hy + 9, 8, 2); F(P.y, hx + 5, hy + 9, 1, 2); F(P.y, hx + 14, hy + 9, 1, 2); if ((t * 9 | 0) % 7 === 0) F(P.y, hx + 7, hy + 9, 6, 1); }
    else { F(P.e, hx + 6, hy + 9, 8, 2); F(P.E, hx + 6, hy + 10, 8, 1); }
  },
  trophy(x, px, py, t) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
    // taça: contorno, três faixas de luz da esquerda para a direita, boca com interior escuro
    F(P.k, px - 1, py - 1, 16, 11); F(P.Y, px, py, 14, 9); F(P.y, px + 1, py + 1, 3, 7); F(P.z, px + 9, py + 1, 3, 8); F(P.Z, px + 12, py + 1, 2, 8);
    F(P.Z, px + 1, py, 12, 1); F(P.y, px + 1, py, 4, 1);                                                          // boca
    F(P.Y, px + 3, py + 8, 8, 1); F(P.k, px + 2, py + 9, 10, 1);
    // alças (esquerda iluminada, direita na sombra)
    F(P.k, px - 4, py + 1, 4, 6); F(P.y, px - 3, py + 2, 1, 3); F(P.Y, px - 2, py + 2, 1, 1); F(P.Y, px - 2, py + 5, 2, 1);
    F(P.k, px + 14, py + 1, 4, 6); F(P.z, px + 16, py + 2, 1, 3); F(P.Z, px + 14, py + 2, 1, 1); F(P.Z, px + 14, py + 5, 2, 1);
    // haste e base de madeira com placa
    F(P.k, px + 4, py + 9, 6, 5); F(P.Y, px + 5, py + 9, 2, 4); F(P.z, px + 7, py + 9, 2, 4);
    F(P.k, px, py + 13, 14, 7); F(P[3], px + 1, py + 14, 12, 5); F(P[2], px + 1, py + 14, 12, 1); F(P[4], px + 1, py + 18, 12, 1); F(P[2], px + 1, py + 14, 1, 4);
    F(P.k, px + 3, py + 15, 8, 3); F(P.Y, px + 4, py + 16, 6, 1); F(P.y, px + 4, py + 16, 2, 1);
    const g = (t % 5) / .5; if (g < 1) { const gx = px + 2 + (g * 10 | 0); F(P.W, gx, py + 1, 1, 6); F(P.W, gx + 1, py + 2, 1, 3); }   // brilho correndo
  },

};
