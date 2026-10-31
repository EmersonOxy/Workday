/* ================= Cenários das cenas (canvas) ================= */
// Mesmo grid e paleta do escritório: pixels de arte inteiros, contorno em tinta, luz de cima à esquerda.
// Cada cenário é desenhado para a proporção da tela (sem barras): as peças se ancoram nas bordas e no chão,
// e só aparecem quando há espaço livre ao redor do conteúdo em HTML (que fica sempre no centro).
const Stage = {
  // Cerca de 280 pixels de arte no menor lado: a mesma escala do escritório numa tela 1366×768
  // O quarto usa pixels mais graúdos (cerca de 180 no menor lado): a cena é íntima e a cama precisa de presença
  measure(cssW, cssH, base = 280) {
    const dpr = window.devicePixelRatio || 1;
    const S = Math.max(1, Math.floor(Math.min(cssW, cssH) * dpr / base)), k = S / dpr;
    return { S, k, VW: Math.ceil(cssW / k), VH: Math.ceil(cssH / k) };
  },
  mount(sc, kind, opt = {}) {
    const c = document.createElement('canvas');
    c.className = 'stage';
    sc.prepend(c); sc.classList.add('staged');
    const st = { kind, opt, c, sc, baked: null, key: '', anchors: {} };
    const loop = now => {
      if (!c.isConnected) return;
      if (now - (st.last || 0) > 120) { st.last = now; this.render(st, now / 1000); }
      requestAnimationFrame(loop);
    };
    this.render(st, 0);
    if (!Motion.reduced.matches) requestAnimationFrame(loop);
    else addEventListener('resize', () => c.isConnected && this.render(st, 0));
    return st;
  },
  set(st, opt) { Object.assign(st.opt, opt); st.key = ''; this.render(st, performance.now() / 1000); },
  render(st, t) {
    const M = this.measure(innerWidth, innerHeight, st.kind === 'bed' ? 180 : 280), key = [M.VW, M.VH, M.k, JSON.stringify(st.opt)].join();
    if (key !== st.key) {
      st.key = key; st.M = M;
      st.c.width = M.VW; st.c.height = M.VH;
      st.c.style.width = M.VW * M.k + 'px'; st.c.style.height = M.VH * M.k + 'px';
      st.L = this.layout(M.VW, M.VH);
      st.sc.style.setProperty('--ak', M.k + 'px');                  // 1 pixel de arte em CSS, para alinhar o HTML ao cenário
      st.baked = this[st.kind](st.L, st.opt, st);
    }
    const x = st.c.getContext('2d');
    x.drawImage(st.baked, 0, 0);
    const a = this.anim[st.kind];
    if (a) a.call(this, x, st.L, st.opt, t, st);
  },
  layout(VW, VH) { return { VW, VH, cx: VW >> 1, floor: VH - Math.max(26, Math.round(VH * .2)) }; },

  // Utilitários de desenho
  ctx(L) { const c = document.createElement('canvas'); c.width = L.VW; c.height = L.VH; return [c, c.getContext('2d')]; },
  F(x, col, a, b, w, h) { x.fillStyle = col; x.fillRect(a, b, w, h); },
  spr(x, rows, a, b, pal) { x.drawImage(Pixel.master(rows, pal ? { ...WD_PAL, ...pal } : WD_PAL), a | 0, b | 0); },
  // Piso de lajotas com perspectiva simples: fileiras ficam mais altas e largas perto da câmera
  tiles(x, L, c1, c2, line) {
    const P = WD_PAL;
    this.F(x, c1, 0, L.floor, L.VW, L.VH - L.floor);
    let y = L.floor, row = 0;
    while (y < L.VH) {
      const h = 4 + row * 2, w = 12 + row * 4, off = (L.cx % w) + (row % 2 ? w >> 1 : 0);
      for (let i = -w + off - w; i < L.VW; i += w * 2) this.F(x, c2, i, y, w, h);
      this.F(x, line, 0, y, L.VW, 1);
      y += h; row++;
    }
    this.F(x, P.k, 0, L.floor - 1, L.VW, 1);
  },
  // Lâmpadas fluorescentes no teto com halo pontilhado na parede
  ceiling(x, L, every, glow) {
    const P = WD_PAL;
    this.F(x, P.E, 0, 0, L.VW, 6); this.F(x, P.e, 0, 6, L.VW, 1);
    const xs = [];
    for (let lx = L.cx % every; lx < L.VW + every; lx += every) {
      xs.push(lx);
      if (glow) for (let j = 0; j < 12; j++) Pixel.dither(x, lx - 26 + j, 9 + j, 52 - j * 2, 1, glow, j);
      this.F(x, P.k, lx - 17, 6, 34, 4); this.F(x, P.W, lx - 16, 7, 32, 2); this.F(x, P.y, lx - 16, 9, 32, 1);
    }
    return xs;
  },
  // Vaso de chão com folhagem procedural
  bigPlant(x, px, base, R) {
    const P = WD_PAL;
    for (let n = 0; n < 9; n++) {
      const a = -Math.PI / 2 + (n - 4) * .32, len = 14 + R() * 10;
      for (let r = 0; r < len; r++) {
        const lx = px + Math.round(Math.cos(a) * r), ly = base - 18 + Math.round(Math.sin(a) * r);
        this.F(x, r > len - 4 ? P.g : n % 2 ? P.G : P.h, lx, ly, 2, 2);
      }
    }
    this.F(x, P.k, px - 9, base - 18, 20, 18); this.F(x, P.T, px - 8, base - 17, 18, 16);
    this.F(x, P.t, px - 8, base - 17, 3, 16); this.F(x, P.u, px + 6, base - 17, 4, 16); this.F(x, P.u, px - 8, base - 14, 18, 1);
  },
  // Janela com céu pontilhado e prédios
  window(x, W, sky, night, R) {
    const P = WD_PAL, bayer = [0, 2, 3, 1];
    this.F(x, P.k, W.x - 2, W.y - 2, W.w + 4, W.h + 4); this.F(x, P.M, W.x - 1, W.y - 1, W.w + 2, W.h + 2);
    for (let j = 0; j < W.h; j++) for (let i = 0; i < W.w; i++) { const f = j / W.h * 4; this.F(x, f > bayer[(i % 2) + (j % 2) * 2] + .5 ? sky[1] : sky[0], W.x + i, W.y + j, 1, 1); }
    let bx = W.x;
    while (bx < W.x + W.w) {
      const bw = 5 + R() * 8 | 0, bh = 8 + R() * W.h * .45 | 0, w = Math.min(bw, W.x + W.w - bx);
      this.F(x, night ? P.N : P.b, bx, W.y + W.h - bh, w, bh);
      if (night) for (let j = W.y + W.h - bh + 2; j < W.y + W.h - 1; j += 3) for (let i = bx + 1; i < bx + w - 1; i += 2) if (R() < .35) this.F(x, P.Y, i, j, 1, 1);
      bx += bw + 1;
    }
    this.F(x, P.m, W.x + (W.w >> 1), W.y, 2, W.h); this.F(x, P.m, W.x, W.y + (W.h * .55 | 0), W.w, 1);
    this.F(x, P.k, W.x - 4, W.y + W.h + 1, W.w + 8, 4); this.F(x, P.m, W.x - 3, W.y + W.h + 2, W.w + 6, 1); this.F(x, P.M, W.x - 3, W.y + W.h + 3, W.w + 6, 1);
  },

  /* ---------- Corredor do relógio de ponto (manhã ou fim de tarde) ---------- */
  hall(L, o) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(11), F = (...a) => this.F(x, ...a);
    const side = L.cx - 100;                                         // espaço livre de cada lado do relógio
    F(P.C, 0, 0, L.VW, L.floor);
    for (let i = (L.cx % 48) - 24; i < L.VW; i += 48) { F(P.e, i, 7, 1, L.floor); F(P.c, i + 1, 7, 1, L.floor); }
    this.ceiling(x, L, 120, P.c);
    // Rodapé alto de madeira com almofadas
    const wy = L.floor - 26;
    F(P.k, 0, wy - 1, L.VW, 1); F(P[1], 0, wy, L.VW, 2); F(P[3], 0, wy + 2, L.VW, 24); F(P[4], 0, L.floor - 3, L.VW, 3);
    for (let i = (L.cx % 40) - 40; i < L.VW; i += 40) { F(P[4], i + 4, wy + 6, 32, 1); F(P[4], i + 4, wy + 6, 1, 14); F(P[2], i + 5, wy + 19, 31, 1); F(P[2], i + 35, wy + 7, 1, 13); }
    this.tiles(x, L, P.w, P.p, P.P);
    // Eletroduto descendo do teto até o relógio
    F(P.k, L.cx - 3, 7, 6, L.floor * .45); F(P.M, L.cx - 2, 7, 4, L.floor * .45); F(P.m, L.cx - 2, 7, 1, L.floor * .45);
    for (let j = 18; j < L.floor * .45; j += 22) F(P.j, L.cx - 3, j, 6, 2);
    const sky = Office.light(o.eve ? 17.6 : 9.2).sky;
    // Janela (lado esquerdo) e mural de recados (lado direito) quando cabem
    if (side > 70) {
      const ww = Math.min(110, side - 34), W = { x: Math.max(14, L.cx - 100 - 20 - ww), y: 20, w: ww, h: Math.max(30, wy - 40) };
      this.window(x, W, sky, o.eve, R);
      L.win = W;
      // Bebedouro entre a janela e o relógio
      const bx = L.cx - 118, by = L.floor;
      if (bx - 10 > W.x + W.w) {
        F(P.k, bx - 9, by - 48, 18, 48); F(P.c, bx - 8, by - 47, 16, 46); F(P.e, bx + 4, by - 47, 4, 46); F(P.C, bx - 8, by - 30, 16, 1);
        F(P.k, bx - 7, by - 66, 14, 19); F(P.l, bx - 6, by - 65, 12, 17); F(P.L, bx + 2, by - 65, 4, 17); F(P.W, bx - 5, by - 63, 1, 10);
        F(P.R, bx - 6, by - 38, 3, 3); F(P.L, bx + 2, by - 38, 3, 3);
      }
      const nx = L.cx + 112, nw = Math.min(84, side - 30);
      if (nw > 44) {
        const ny = 30, nh = 54;
        F(P.k, nx - 2, ny - 2, nw + 4, nh + 4); F(P[3], nx - 1, ny - 1, nw + 2, nh + 2); F(P[1], nx, ny, nw, nh); Pixel.dither(x, nx, ny, nw, nh, P[2], 0);
        const notes = [[P.W, 6, 5, 18, 22], [P.y, 28, 8, 16, 16], [P.l, 50, 4, 20, 14], [P.o, 30, 28, 22, 18], [P.W, 8, 31, 16, 16]];
        for (const [col, a, b, w, h] of notes) {
          if (a + w > nw - 3) continue;
          F(P.k, nx + a, ny + b + 1, w, h); F(col, nx + a, ny + b, w, h);
          for (let l = 4; l < h - 2; l += 3) F(P.P, nx + a + 2, ny + b + l, w - 5 - (l % 2) * 3, 1);
          F(P.R, nx + a + (w >> 1), ny + b, 2, 2);
        }
        Pixel.text(x, 'AVISOS', nx + (nw - 23 >> 1), ny + nh + 5, P.E);
      }
      // Porta da empresa e planta de chão (só em telas largas)
      const dx = L.cx + 110 + Math.max(nw, 0) + 26;
      if (dx + 56 < L.VW) {
        F(P.k, dx - 2, wy - 66, 54, L.floor - wy + 66); F(P[4], dx - 1, wy - 65, 52, L.floor - wy + 65); F(P[2], dx + 2, wy - 62, 46, L.floor - wy + 62);
        F(P[3], dx + 44, wy - 62, 4, L.floor - wy + 62); F(P[1], dx + 2, wy - 62, 46, 1);
        F(P.k, dx + 8, wy - 52, 34, 26); F(P.l, dx + 9, wy - 51, 32, 24); Pixel.dither(x, dx + 9, wy - 51, 32, 24, P.W, 0);
        Pixel.text(x, 'WORKDAY', dx + 11, wy - 42, P[7]);
        F(P.k, dx + 38, wy - 6, 6, 4); F(P.Y, dx + 38, wy - 6, 5, 2);
        if (dx + 82 < L.VW) this.bigPlant(x, dx + 70, L.floor + 4, R);
      }
      if (W.x > 40) this.bigPlant(x, W.x - 22, L.floor + 4, R);
    } else {
      // Retrato: só sobra espaço no chão, à frente; uma planta num canto e uma lixeira no outro
      this.bigPlant(x, 16, L.VH - 6, R);
      const bx = L.VW - 22, by = L.VH - 6;
      F(P.k, bx - 9, by - 22, 18, 22); F(P.M, bx - 8, by - 21, 16, 20); F(P.m, bx - 8, by - 21, 3, 20); F(P.j, bx + 4, by - 21, 4, 20); F(P.J, bx - 9, by - 23, 18, 2);
      F(P.W, bx - 4, by - 26, 7, 4); F(P.p, bx - 4, by - 23, 7, 1);
    }
    // Luz: manhã clara entrando pela janela; fim de tarde alaranjado e sombra arroxeada
    if (o.eve) { x.globalCompositeOperation = 'multiply'; F('rgba(150,100,170,.35)', 0, 0, L.VW, L.VH); x.globalCompositeOperation = 'source-over'; }
    if (L.win) {
      const W = L.win, col = o.eve ? 'rgba(255,160,100,.22)' : 'rgba(255,244,200,.20)';
      for (let j = 0; j < L.VH - W.y; j++) Pixel.dither(x, W.x + j * .9 | 0, W.y + j, W.w, 1, col, j);
    }
    return c;
  },

  /* ---------- Mercadinho e caixa ---------- */
  shopWall(x, L, R) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a);
    F(P.W, 0, 0, L.VW, L.floor);
    for (let j = 7; j < L.floor; j += 8) F(P.w, 0, j, L.VW, 1);
    for (let j = 7, r = 0; j < L.floor; j += 8, r++) for (let i = (r % 2) * 4; i < L.VW; i += 8) F(P.w, i, j, 1, 8);
    const ly = L.floor - 30;
    F(P.V, 0, ly, L.VW, L.floor - ly); F(P.v, 0, ly, L.VW, 2); F(P.x, 0, L.floor - 3, L.VW, 3);
    for (let i = L.cx % 16; i < L.VW; i += 16) F(P.x, i, ly + 3, 1, L.floor - ly - 6);
    this.ceiling(x, L, 96, P.w);
    // Toldo listrado com recorte ondulado
    const ty = 10;
    F(P.k, 0, ty - 1, L.VW, 1);
    for (let i = (L.cx % 16) - 16; i < L.VW; i += 16) { F(P.R, i, ty, 8, 10); F(P.W, i + 8, ty, 8, 10); F(P.q, i, ty + 9, 8, 1); F(P.w, i + 8, ty + 9, 8, 1); }
    for (let i = (L.cx % 8) - 8; i < L.VW; i += 8) { const col = ((i - (L.cx % 16) + 16) / 8 | 0) % 2 ? P.W : P.R;
      F(P.k, i + 1, ty + 10, 6, 3); F(col, i + 2, ty + 10, 4, 2); F(P.k, i, ty + 10, 1, 1); }
    this.tiles(x, L, P.W, P.e, P.C);
  },
  // Geladeira de bebidas com garrafas coloridas
  fridge(x, fx, top, w, base, R) {
    const P = WD_PAL, F = (...a) => this.F(x, ...a);
    F(P.k, fx - 1, top - 1, w + 2, base - top + 1); F(P.m, fx, top, w, base - top); F(P.j, fx + w - 3, top, 3, base - top);
    F(P.k, fx + 3, top + 10, w - 8, base - top - 18); F(P.x, fx + 4, top + 11, w - 10, base - top - 20);
    for (let sy = top + 13; sy < base - 12; sy += 14) {
      for (let bx = fx + 6; bx < fx + w - 9; bx += 5) { const col = [P.R, P.F, P.Q, P.L, P.O][R() * 5 | 0]; F(P.k, bx, sy, 4, 11); F(col, bx + 1, sy + 3, 2, 8); F(P.W, bx + 1, sy + 1, 2, 2); }
      F(P.M, fx + 4, sy + 11, w - 10, 2);
    }
    Pixel.dither(x, fx + 4, top + 11, 3, base - top - 20, P.v, 0);
    F(P.L, fx, top, w, 8); Pixel.text(x, 'GELADO', fx + (w - 23 >> 1), top + 2, P.W);
    F(P.k, fx + w - 6, top + 30, 2, 18);
  },
  shop(L, o) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(23), F = (...a) => this.F(x, ...a);
    this.shopWall(x, L, R);
    // Geladeiras nas laterais em telas largas; caixotes de frutas no chão
    const room = (L.VW - 720) / 2;
    if (room > 50) {
      const w = Math.min(70, room - 16);
      this.fridge(x, 8, 28, w, L.floor, R); this.fridge(x, L.VW - 8 - w, 28, w, L.floor, R);
    }
    const crate = (cx0, base, fruit) => {
      F(P.k, cx0 - 15, base - 16, 30, 16); F(P[2], cx0 - 14, base - 15, 28, 14); F(P[3], cx0 - 14, base - 9, 28, 2); F(P[1], cx0 - 14, base - 15, 28, 1);
      for (let i = 0; i < 6; i++) { const fx = cx0 - 12 + i * 4 + (R() * 2 | 0), fy = base - 20 + (R() * 3 | 0); F(P.k, fx - 1, fy - 1, 5, 5); F(fruit[0], fx, fy, 3, 3); F(fruit[1], fx, fy, 1, 1); }
    };
    crate(22, L.VH - 4, [P.R, P.r]); crate(L.VW - 22, L.VH - 4, [P.Q, P.y]);
    if (L.VW > 380) { crate(56, L.VH - 8, [P.G, P.g]); crate(L.VW - 56, L.VH - 8, [P.O, P.o]); }
    return c;
  },
  cash(L, o) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(31), F = (...a) => this.F(x, ...a);
    this.shopWall(x, L, R);
    // Placa "CAIXA 1" com lâmpada no poste e expositor de balas
    const sx = L.VW - 46;
    F(P.k, sx + 12, 22, 3, L.floor - 22); F(P.M, sx + 13, 22, 1, L.floor - 22);
    F(P.k, sx - 1, 24, 30, 14); F(P.R, sx, 25, 28, 12); F(P.q, sx, 35, 28, 2); Pixel.text(x, 'CAIXA 1', sx + 1, 28, P.W);
    F(P.k, sx + 9, 17, 10, 7); F(P.Y, sx + 10, 18, 8, 5); F(P.y, sx + 10, 18, 3, 2);
    if (L.VW > 380) {
      const rx = 10;
      F(P.k, rx - 1, L.floor - 74, 38, 74); F(P.M, rx, L.floor - 73, 36, 73);
      for (let sy = L.floor - 70; sy < L.floor - 10; sy += 12) {
        F(P.j, rx, sy + 10, 36, 2);
        for (let i = 0; i < 6; i++) { const col = [P.R, P.Q, P.F, P.L, P.I, P.O][(R() * 6) | 0]; F(P.k, rx + 2 + i * 6, sy + 2, 5, 8); F(col, rx + 3 + i * 6, sy + 3, 3, 6); F(P.W, rx + 3 + i * 6, sy + 3, 1, 1); }
      }
    }
    return c;
  },

  /* ---------- Quarto à noite (e ao amanhecer, quando o despertador toca) ---------- */
  bed(L, o, st) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(5), F = (...a) => this.F(x, ...a), dawn = !!o.dawn;
    st.anchors = {};
    const wall = dawn ? [P.n, P.N] : [P.N, P[0]];
    F(wall[0], 0, 0, L.VW, L.floor);
    for (let i = L.cx % 24; i < L.VW; i += 24) Pixel.dither(x, i, 0, 4, L.floor, wall[1], 0);
    // Piso de tacos
    F(P[4], 0, L.floor, L.VW, L.VH - L.floor);
    for (let y = L.floor + 5, r = 0; y < L.VH; y += 6, r++) { F(P.k, 0, y, L.VW, 1); for (let i = (r % 2) * 20; i < L.VW; i += 40) F(P.k, i, y - 5, 1, 5); }
    F(P.k, 0, L.floor, L.VW, 2);
    // Janela central com lua (ou nascer do sol), estrelas e cidade
    const ww = Math.min(150, L.VW * .5 | 0), wh = Math.min(96, L.floor * .45 | 0), W = { x: L.cx - (ww >> 1), y: Math.max(14, L.floor * .1 | 0), w: ww, h: wh };
    st.W = W;
    const sky = dawn ? ['#f6a96c', '#ffe0a8'] : [P[0], P.N];
    this.window(x, W, sky, !dawn, R);
    if (!dawn) {
      const mx = W.x + W.w * .72 | 0, my = W.y + 14;
      for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) if (i * i + j * j <= 49) F((i + 3) ** 2 + (j - 2) ** 2 <= 30 ? P[0] : i + j < -2 ? P.W : P.y, mx + i, my + j, 1, 1);
    } else {
      for (let j = -9; j <= 0; j++) { const w = Math.round(Math.sqrt(81 - j * j)); F(P.y, W.x + W.w * .3 - w | 0, W.y + W.h - 14 + j, w * 2, 1); }
    }
    // Cortinas com dobras e varão
    const cw = Math.max(10, ww * .2 | 0);
    F(P.k, W.x - cw - 10, W.y - 8, ww + cw * 2 + 20, 3); F(P.Z, W.x - cw - 9, W.y - 7, ww + cw * 2 + 18, 1);
    for (const sx of [W.x - cw - 6, W.x + W.w + 6]) {
      F(P.k, sx - 1, W.y - 5, cw + 2, W.h + 22);
      for (let i = 0; i < cw; i++) F(i % 5 === 0 ? P[0] : i % 5 < 2 ? (dawn ? P.o : P.n) : dawn ? P.O : P.N, sx + i, W.y - 4, 1, W.h + 20);
    }
    // Feixe de luz da janela até o chão
    const beam = dawn ? 'rgba(255,214,150,.28)' : 'rgba(200,210,255,.14)';
    for (let j = 0; j < L.VH - W.y - W.h; j++) Pixel.dither(x, W.x - j * .35 | 0, W.y + W.h + j, W.w + j * .7 | 0, 1, beam, j);
    // Cama: cabeceira, colchão; o dorminhoco é desenhado na animação (respira)
    const bw = Math.min(L.VW * .78 | 0, 230), bx = L.cx - (bw >> 1), by = L.floor + Math.min(20, (L.VH - L.floor) * .4 | 0);
    st.bedR = { x: bx, y: by, w: bw };
    F(P.k, bx - 1, by - 34, 12, 34 + 14); F(P[3], bx, by - 33, 10, 33 + 12); F(P[2], bx + 1, by - 33, 3, 33 + 12); F(P[4], bx, by - 33, 10, 2);
    F(P.k, bx + bw - 9, by - 18, 10, 32); F(P[3], bx + bw - 8, by - 17, 8, 30); F(P[2], bx + bw - 7, by - 17, 2, 30);
    F(P.k, bx + 10, by - 2, bw - 18, 14); F(P.W, bx + 11, by - 1, bw - 20, 4); F(P[3], bx + 11, by + 3, bw - 20, 8); F(P[4], bx + 11, by + 9, bw - 20, 2);
    // Criado-mudo com abajur e copo d'água
    const nx = bx + bw + 8;
    if (nx + 28 < L.VW) {
      st.anchors.stand = { x: (nx + 13) * st.M.k, y: (by - 15) * st.M.k };
      F(P.k, nx - 1, by - 15, 28, 27); F(P[2], nx, by - 14, 26, 25); F(P[3], nx, by - 3, 26, 1); F(P.Y, nx + 11, by - 9, 4, 2);
      F(P.k, nx + 3, by - 33, 13, 10); F(dawn ? P.y : P.n, nx + 4, by - 32, 11, 8); F(P.k, nx + 9, by - 24, 2, 9);
      F(P.k, nx + 19, by - 22, 6, 7); F(P.l, nx + 20, by - 21, 4, 5); F(P.L, nx + 20, by - 18, 4, 2);
    }
    // Quadro na parede (só se couber ao lado da janela)
    if (W.x - cw - 60 > 8) { const fx = W.x - cw - 56, fy = W.y + 10; F(P.k, fx - 1, fy - 1, 34, 26); F(P.Z, fx, fy, 32, 24); F(dawn ? P.g : P.h, fx + 3, fy + 3, 26, 18); F(dawn ? P.G : P.H, fx + 3, fy + 14, 26, 7); F(P.y, fx + 20, fy + 6, 3, 3); }
    if (!dawn) { x.globalCompositeOperation = 'multiply'; F('rgba(90,80,150,.45)', 0, 0, L.VW, L.VH); x.globalCompositeOperation = 'source-over'; }
    // Posição da cabeça em pixels CSS, para os "Z" saírem dela
    st.anchors.head = { x: (bx + 27) * st.M.k, y: (by - 14) * st.M.k };
    return c;
  },

  /* ---------- Fim do expediente: a cidade ao entardecer vista da calçada ---------- */
  city(L, o, st) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(41), F = (...a) => this.F(x, ...a);
    const hz = Math.round(L.VH * .62), street = Math.round(L.VH * .84);
    // Céu em faixas da paleta, com pontilhado na passagem de uma para a outra
    const bands = [P[0], P.N, P.n, P.T, P.t, P.Y];
    const bh = hz / bands.length;
    bands.forEach((col, i) => { F(col, 0, Math.floor(i * bh), L.VW, Math.ceil(bh) + 1); if (i) Pixel.dither(x, 0, Math.floor(i * bh) - 2, L.VW, 3, bands[i - 1], i); });
    for (let i = 0; i < 40; i++) F(R() < .7 ? P.W : P.y, R() * L.VW | 0, R() * bh * 1.6 | 0, 1, 1);
    // Sol se pondo atrás dos prédios
    const sx = Math.round(L.VW * .62);
    for (let j = -16; j <= 0; j++) { const w = Math.round(Math.sqrt(256 - j * j)); F(j > -4 ? P.Y : P.y, sx - w, hz + j - 2, w * 2, 1); }
    // Prédios ao fundo (silhueta) e à frente (janelas acesas)
    const row = (base, col, minH, maxH, lit) => {
      let bx = -4; const out = [];
      while (bx < L.VW) {
        const w = 10 + R() * 22 | 0, h = minH + R() * (maxH - minH) | 0;
        F(col, bx, base - h, w, L.VH);
        if (R() < .3) F(col, bx + (w >> 1), base - h - 6, 1, 6);
        if (lit) { F(P.k, bx, base - h, w, 1); out.push([bx, base - h, w]); }
        bx += w + (R() * 3 | 0);
      }
      return out;
    };
    row(hz + 4, P.n, 14, L.VH * .3, false);
    st.lit = row(street - 10, P.N, 20, L.VH * .48, true);
    F(P[0], 0, street - 10, L.VW, 10);
    // Calçada, meio-fio, rua com faixas
    F(P.M, 0, street - 2, L.VW, 3); F(P.m, 0, street - 2, L.VW, 1); F(P.k, 0, street + 1, L.VW, 1);
    F(P.J, 0, street + 2, L.VW, L.VH - street);
    for (let i = (L.cx % 30) - 30; i < L.VW; i += 30) F(P.Y, i, street + 2 + (L.VH - street >> 1), 14, 2);
    // Postes acesos com halo
    st.lamps = [];
    for (let lx = (L.cx % 110) + 30; lx < L.VW; lx += 110) {
      st.lamps.push(lx);
      F(P.k, lx - 1, street - 52, 3, 52); F(P.j, lx, street - 52, 1, 52); F(P.k, lx - 1, street - 53, 12, 3); F(P.k, lx + 7, street - 51, 7, 3); F(P.y, lx + 8, street - 50, 5, 1);
      for (let j = 0; j < 40; j++) Pixel.dither(x, lx + 10 - j * .5 | 0, street - 49 + j, j | 1, 1, 'rgba(255,231,163,.22)', j);
    }
    return c;
  },

  anim: {
    // Janelas dos prédios vão acendendo enquanto escurece
    city(x, L, o, t, st) {
      const P = WD_PAL, R = Office.rng(7), on = Math.min(1, (t - (st.t0 ??= t)) / 4) * .4 + .1;
      for (const [bx, by, w] of st.lit) for (let j = by + 3; j < L.VH * .84 - 12; j += 4) for (let i = bx + 2; i < bx + w - 2; i += 3) { const r = R(); if (r < on) this.F(x, r < .05 ? P.l : P.Y, i, j, 1, 2); }
    },
    hall(x, L, o, t) {
      const P = WD_PAL;
      // Uma lâmpada pisca de vez em quando; poeira no feixe da janela
      if ((t * 10 | 0) % 53 < 2) { const lx = L.cx >= 120 ? L.cx - 120 : L.cx; this.F(x, P.e, lx - 16, 7, 32, 3); }
      if (L.win) for (let i = 0; i < 6; i++) { const W = L.win, ph = t * .15 + i * .37, dx = W.x + 8 + ((ph * 53 + i * 31) % (W.w + 40)), dy = W.y + 20 + ((ph * 17 + i * 23) % (L.floor - W.y - 30)); this.F(x, o.eve ? P.y : P.W, dx | 0, dy | 0, 1, 1); }
    },
    shop(x, L, o, t) { if ((t * 10 | 0) % 37 === 0) this.F(x, WD_PAL.e, L.cx % 96 + 96 - 16, 7, 32, 2); },
    cash(x, L, o, t) { if ((t * 2 | 0) % 2) this.F(x, WD_PAL.Y, L.VW - 46 + 10, 18, 8, 5); else this.F(x, WD_PAL.Z, L.VW - 46 + 10, 18, 8, 5); },
    bed(x, L, o, t, st) {
      const P = WD_PAL, F = (...a) => this.F(x, ...a), B = st.bedR, W = st.W;
      // Estrelas cintilando
      if (!o.dawn) for (let i = 0; i < 10; i++) { const sx = W.x + 3 + (i * 37) % (W.w - 6), sy = W.y + 2 + (i * 13) % (W.h * .4 | 0); if (Math.sin(t * 2 + i * 1.7) > .2) F(i % 3 ? P.W : P.y, sx, sy, 1, 1); }
      // Dorminhoco: travesseiro, cabeça e cobertor que sobe e desce com a respiração (desenhado à parte para receber a luz da noite)
      const bw2 = B.w - 44, sw = bw2 + 40, shh = 34;
      if (!st.sl) { st.sl = document.createElement('canvas'); }
      st.sl.width = sw; st.sl.height = shh;
      const y = st.sl.getContext('2d'), G = (...a) => this.F(y, ...a), ox = B.x + 13, oy = B.y - 20;
      const br = o.dawn ? 0 : Math.sin(t * 1.6) > 0 ? 1 : 0, sh = o.dawn ? ((t * 16 | 0) % 2 ? 1 : -1) : 0, hx = 1, hy = 6, by = B.y - oy;
      G(P.k, hx - 1, hy + 2, 22, 11); G(P.W, hx, hy + 3, 20, 9); G(P.w, hx, hy + 9, 20, 3);
      G(P.k, hx + 5 + sh, hy - 3, 13, 12); G(P.s, hx + 6 + sh, hy - 2, 11, 10); G(P.S, hx + 14 + sh, hy - 2, 3, 10); G(P[4], hx + 6 + sh, hy - 2, 11, 3); G(P[4], hx + 6 + sh, hy + 1, 2, 4);
      if (o.dawn) { G(P.k, hx + 10 + sh, hy + 3, 2, 2); G(P.k, hx + 14 + sh, hy + 3, 1, 2); G(P.k, hx + 11 + sh, hy + 6, 3, 1); }
      else { G(P.k, hx + 10, hy + 4, 2, 1); G(P.k, hx + 14, hy + 4, 1, 1); }
      const top = by - 10 - br;
      G(P.k, hx + 16, top - 1, bw2 + 1, by + 4 - top);
      G(P.L, hx + 17, top, bw2 - 1, by + 3 - top); G(P.l, hx + 17, top, bw2 - 1, 2); G(P[7], hx + 17, by, bw2 - 1, 3);
      for (let i = 14; i < bw2 - 6; i += 14) G(P[7], hx + 17 + i, top + 3, 1, by - top - 2);
      if (!o.dawn) { y.globalCompositeOperation = 'source-atop'; G('rgba(46,36,96,.42)', 0, 0, sw, shh); y.globalCompositeOperation = 'source-over'; }
      x.drawImage(st.sl, ox, oy);
    },
  },
};
