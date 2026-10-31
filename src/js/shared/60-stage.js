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
    if (kind === 'hall') {
      Object.assign(opt, { dark: CFG.hall && CFG.hall.dark ? 1 : 0, curtain: CFG.hall && CFG.hall.curtain ? 1 : 0 });
      sc.addEventListener('pointerdown', e => {
        if (e.target !== sc || !st.hit) return;
        const x = e.clientX / st.M.k, y = e.clientY / st.M.k, inR = r => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
        const k = inR(st.hit.sw) ? 'dark' : inR(st.hit.win) ? 'curtain' : null; if (!k) return;
        const to = st.opt[k] > .5 ? 0 : 1; CFG.hall = Object.assign({}, CFG.hall, { [k]: !!to }); persist(); sfx(k === 'dark' ? 'switch' : 'blind'); this.tween(st, k, to, k === 'dark' ? 380 : 650);
      });
      sc.addEventListener('pointermove', e => { if (e.target !== sc || !st.hit) return; const x = e.clientX / st.M.k, y = e.clientY / st.M.k, inR = r => r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; sc.style.cursor = inR(st.hit.sw) || inR(st.hit.win) ? 'pointer' : ''; });
    }
    if (!Motion.reduced.matches) requestAnimationFrame(loop);
    else addEventListener('resize', () => c.isConnected && this.render(st, 0));
    return st;
  },
  // anima um valor do cenário de 0 a 1 em degraus (cortina correndo, luz baixando), redesenhando a cada passo
  tween(st, key, to, ms) {
    const from = +st.opt[key] || 0, t0 = performance.now(), steps = Motion.reduced.matches ? 1 : 10;
    const step = () => { const k = Math.min(1, (performance.now() - t0) / ms), q = Math.ceil(k * steps) / steps; this.set(st, { [key]: from + (to - from) * q }); if (k < 1) requestAnimationFrame(step); };
    step();
  },
  set(st, opt) { Object.assign(st.opt, opt); st.key = ''; this.render(st, performance.now() / 1000); },
  render(st, t) {
    const M = this.measure(innerWidth, innerHeight, st.kind === 'bed' ? 150 : 280), key = [M.VW, M.VH, M.k, JSON.stringify(st.opt)].join();
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
  hall(L, o, st) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(11), F = (...a) => this.F(x, ...a);
    const side = L.cx - 100;                                         // espaço livre de cada lado do relógio
    F(P.C, 0, 0, L.VW, L.floor);
    for (let i = (L.cx % 48) - 24; i < L.VW; i += 48) { F(P.e, i, 7, 1, L.floor); F(P.c, i + 1, 7, 1, L.floor); }
    this.ceiling(x, L, 120, (+o.dark || 0) > .5 ? null : P.c);
    // Rodapé alto de madeira com almofadas
    const wy = L.floor - 26;
    F(P.k, 0, wy - 1, L.VW, 1); F(P[1], 0, wy, L.VW, 2); F(P[3], 0, wy + 2, L.VW, 24); F(P[4], 0, L.floor - 3, L.VW, 3);
    for (let i = (L.cx % 40) - 40; i < L.VW; i += 40) { F(P[4], i + 4, wy + 6, 32, 1); F(P[4], i + 4, wy + 6, 1, 14); F(P[2], i + 5, wy + 19, 31, 1); F(P[2], i + 35, wy + 7, 1, 13); }
    this.tiles(x, L, P.w, P.p, P.P);
    // Eletroduto descendo do teto até o relógio
    // eletroduto desce do teto até o topo do relógio (o HTML informa onde o aparelho está: o.devTop)
    const cl = o.devTop ? Math.max(12, o.devTop - 6) : L.floor * .45;
    F(P.k, L.cx - 3, 7, 6, cl); F(P.M, L.cx - 2, 7, 4, cl); F(P.m, L.cx - 2, 7, 1, cl);
    for (let j = 18; j < cl; j += 22) F(P.j, L.cx - 3, j, 6, 2);
    if (o.devTop) { F(P.k, L.cx - 8, cl, 16, 6); F(P.M, L.cx - 7, cl + 1, 14, 4); F(P.m, L.cx - 7, cl + 1, 14, 1); F(P.j, L.cx - 5, cl + 2, 1, 1); F(P.j, L.cx + 4, cl + 2, 1, 1); }   // caixa de passagem
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
    // cortina (clique na janela) e interruptor (clique na plaquinha): só estética
    const cur = +o.curtain || 0;
    if (L.win) { const W = L.win, half = (W.w + 4) / 2, open = Math.round(half * (1 - cur) * .82);   // duas folhas correm do meio para as pontas
      for (const [x0, dir] of [[W.x - 2, 1], [W.x + W.w + 1, -1]]) { const n = Math.max(4, half - open | 0); for (let i = 0; i < n; i++) { const f = i % 6, xx = x0 + dir * i; F(f === 0 ? P.x : f < 3 ? P.v : P.V, xx, W.y - 2, 1, W.h + 6); } F(P.x, x0 + dir * (n - 1), W.y - 2, 1, W.h + 6); }
      F(P.k, W.x - 4, W.y - 5, W.w + 8, 3); F(P.Z, W.x - 3, W.y - 4, W.w + 6, 1); }
    st.hit = {};
    if (L.win) {
      const sx = L.cx + 120, sy = L.floor - 26 - 18;
      if (sx + 8 < L.VW) { F(P.k, sx, sy, 8, 12); F(P.c, sx + 1, sy + 1, 6, 10); F(P.e, sx + 6, sy + 1, 1, 10); F(P.k, sx + 3, sy + 3, 2, 6); F(o.dark > .5 ? P.e : P.W, sx + 3, o.dark > .5 ? sy + 6 : sy + 3, 2, 3); st.hit.sw = { x: sx - 2, y: sy - 2, w: 12, h: 16 }; }
      st.hit.win = { x: L.win.x - 4, y: L.win.y - 4, w: L.win.w + 8, h: L.win.h + 8 };
    }
    const dk = +o.dark || 0;
    if (dk > 0) {   // luzes apagando: o corredor escurece aos poucos; a janela (se aberta) continua clara
      x.save(); x.beginPath(); x.rect(0, 0, L.VW, L.VH); if (L.win && cur < .5) x.rect(L.win.x, L.win.y, L.win.w, L.win.h); x.clip('evenodd');
      x.globalCompositeOperation = 'multiply'; F(`rgba(60,50,95,${(.62 * dk).toFixed(3)})`, 0, 0, L.VW, L.VH); x.restore();
    }
    if (L.win && cur < .9) {
      // feixe suave e largo saindo do vão da janela (sem pontilhado, sem cobrir a própria janela)
      const W = L.win, c0 = o.eve ? [255, 160, 100] : [255, 244, 200], H2 = Math.max(1, L.VH - W.y - W.h);
      x.save(); x.beginPath(); x.rect(0, 0, L.VW, L.VH); x.rect(W.x, W.y, W.w, W.h); x.clip('evenodd');
      for (let j = W.y; j < L.VH; j++) { const d = j - W.y, k = j < W.y + W.h ? .5 : 1 - (j - W.y - W.h) / H2 * .8;
        x.fillStyle = `rgba(${c0[0]},${c0[1]},${c0[2]},${(.11 * k).toFixed(3)})`; x.fillRect(W.x + d * .8 | 0, j, W.w + d * .3 | 0, 1); }
      x.restore();
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

  /* ---------- Quarto: noite aconchegante (e amanhecer quando o despertador toca) ---------- */
  bed(L, o, st) {
    const [c, x] = this.ctx(L), P = WD_PAL, R = Office.rng(5), F = (...a) => this.F(x, ...a), dawn = !!o.dawn;
    st.anchors = {};
    const fl = L.floor;
    // parede com papel listrado pontilhado, rodapé e sanca
    F(dawn ? '#6c4a7e' : '#463462', 0, 0, L.VW, fl);
    for (let i = L.cx % 12; i < L.VW; i += 12) Pixel.dither(x, i, 0, 3, fl, dawn ? P.N : P[0], 0);
    F(P.k, 0, 5, L.VW, 1); F(dawn ? P.n : P.N, 0, 0, L.VW, 5);
    F(P.k, 0, fl - 6, L.VW, 1); F(P[3], 0, fl - 5, L.VW, 5); F(P[2], 0, fl - 5, L.VW, 1);
    // piso de tábuas em perspectiva
    F(P[4], 0, fl, L.VW, L.VH - fl);
    let y = fl, row = 0;
    while (y < L.VH) { const h = 3 + row, w = 18 + row * 6, off = (row % 2) * (w >> 1); F(P.k, 0, y, L.VW, 1); for (let i = (L.cx % w) - w + off; i < L.VW; i += w) F(P.k, i, y, 1, h); for (let i = (L.cx % w) - w + off + 3; i < L.VW; i += w) F(P[3], i, y + 1, w - 6, 1); y += h; row++; }
    // janela com cortinas amarradas
    const ww = Math.min(78, L.VW * .38 | 0), wh = Math.min(58, fl * .52 | 0), W = { x: L.cx + (L.VW > 300 ? 14 : -(ww >> 1)), y: Math.max(14, fl * .16 | 0), w: ww, h: wh };
    st.W = W;
    this.window(x, W, dawn ? ['#ffe0a8', '#f6a96c'] : [P[0], P.N], !dawn, R);
    if (!dawn) { const mx = W.x + W.w * .74 | 0, my = W.y + 11; for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) if (i * i + j * j <= 36) F((i + 3) ** 2 + (j - 2) ** 2 <= 22 ? P[0] : i + j < -2 ? P.W : P.y, mx + i, my + j, 1, 1); }
    else for (let j = -7; j <= 0; j++) { const w2 = Math.round(Math.sqrt(49 - j * j)); F(P.y, W.x + W.w * .3 - w2 | 0, W.y + W.h - 12 + j, w2 * 2, 1); }
    const cw = 9;
    F(P.k, W.x - cw - 6, W.y - 6, W.w + cw * 2 + 12, 2); F(P.Z, W.x - cw - 5, W.y - 5, W.w + cw * 2 + 10, 1);
    for (const [sx, dir] of [[W.x - cw - 4, 1], [W.x + W.w + 4, -1]]) for (let j = 0; j < W.h + 14; j++) {
      const pinch = j > W.h * .55 && j < W.h * .7 ? 4 : 0, w2 = cw - pinch;
      for (let i = 0; i < w2; i++) { const xx = dir > 0 ? sx + i : sx + cw - 1 - i, f = i % 3; F(f === 0 ? P.q : f === 1 ? (dawn ? P.r : P.R) : P.R, xx, W.y - 4 + j, 1, 1); }
      if (pinch && j === Math.round(W.h * .62)) F(P.Y, dir > 0 ? sx : sx + cw - 6, W.y - 4 + j, 6, 1);
    }
    // estante com livros e planta, quadro
    const shX = 10, shY = fl * .3 | 0;
    if (W.x - cw - 60 > shX) {
      for (let n = 0; n < 2; n++) { const yy = shY + n * 22; F(P.k, shX - 1, yy + 14, 50, 3); F(P[2], shX, yy + 14, 48, 1); let bx = shX + 2;
        while (bx < shX + (n ? 30 : 44)) { const bw = 3 + R() * 3 | 0, bh = 8 + R() * 5 | 0, col = [P.L, P.T, P.F, P.Y, P.I, P.O][R() * 6 | 0]; F(P.k, bx - 1, yy + 14 - bh - 1, bw + 2, bh + 1); F(col, bx, yy + 14 - bh, bw, bh); F(P.W, bx, yy + 14 - bh + 2, bw, 1); bx += bw + 2; }
        if (n) { F(P.k, shX + 34, yy + 7, 9, 8); F(P.T, shX + 35, yy + 8, 7, 6); for (let k = 0; k < 6; k++) F(k % 2 ? P.G : P.g, shX + 33 + k * 2, yy + 3 + (k % 3), 2, 4); } }
      const fx = shX + 6, fy = shY + 52; F(P.k, fx - 1, fy - 1, 26, 20); F(P.Z, fx, fy, 24, 18); F(dawn ? P.v : P.x, fx + 2, fy + 2, 20, 14); F(P.y, fx + 15, fy + 4, 3, 3); F(P.h, fx + 2, fy + 10, 20, 6); F(P.G, fx + 4, fy + 9, 8, 2);
    }
    // tapete oval sob a cama
    const bw = Math.min(L.VW * .66 | 0, 168), bx = L.cx - (bw >> 1) - (L.VW > 300 ? 28 : 0), by = fl + Math.min(12, (L.VH - fl) * .3 | 0);
    for (let j = -6; j <= 6; j++) { const w2 = Math.round(Math.sqrt(1 - (j / 6.5) ** 2) * (bw / 2 + 16)); F(Math.abs(j) > 4 ? P.k : Math.abs(j) > 3 ? P.Y : (j + 20) % 3 ? P.q : P.R, L.cx - (L.VW > 300 ? 28 : 0) - w2, by + 18 + j, w2 * 2, 1); }
    // cama: cabeceira alta, pés, colchão; a colcha e quem dorme são desenhados na animação
    st.bedR = { x: bx, y: by, w: bw };
    F(P.k, bx - 2, by - 40, 14, 54); F(P[3], bx - 1, by - 39, 12, 52); F(P[2], bx, by - 39, 3, 52); F(P[4], bx + 8, by - 39, 3, 52); F(P[1], bx - 1, by - 39, 12, 2); F(P[4], bx + 2, by - 30, 6, 1); F(P[4], bx + 2, by - 20, 6, 1);
    F(P.k, bx + bw - 10, by - 22, 12, 36); F(P[3], bx + bw - 9, by - 21, 10, 34); F(P[2], bx + bw - 8, by - 21, 3, 34); F(P[1], bx + bw - 9, by - 21, 10, 1);
    F(P.k, bx + 10, by - 2, bw - 20, 16); F(P.W, bx + 11, by - 1, bw - 22, 4); F(P[3], bx + 11, by + 3, bw - 22, 9); F(P[4], bx + 11, by + 10, bw - 22, 3);
    // criado-mudo com abajur aceso e copo d'água
    const nx = bx + bw + 6;
    if (nx + 30 < L.VW) {
      st.anchors.stand = { x: (nx + 14) * st.M.k, y: (by - 17) * st.M.k };
      F(P.k, nx - 1, by - 17, 30, 31); F(P[2], nx, by - 16, 28, 29); F(P[1], nx, by - 16, 28, 1); F(P[3], nx, by - 4, 28, 1); F(P.Y, nx + 12, by - 10, 4, 2); F(P.Y, nx + 12, by + 3, 4, 2);
      st.lampAt = { x: nx + 7, y: by - 32 };
      F(P.k, nx + 2, by - 36, 12, 10); F(dawn ? P.y : P.Y, nx + 3, by - 35, 10, 8); F(P.y, nx + 3, by - 35, 10, 2); F(P.k, nx + 7, by - 26, 2, 9);
      F(P.k, nx + 19, by - 24, 6, 8); F(P.l, nx + 20, by - 23, 4, 6); F(P.L, nx + 20, by - 20, 4, 3);
    }
    if (!dawn) { x.save(); x.globalCompositeOperation = 'multiply'; F('rgba(90,80,150,.42)', 0, 0, L.VW, L.VH); x.restore(); }
    // luz: luar (ou sol) da janela até o chão; halo quente do abajur
    const beam = dawn ? 'rgba(255,214,150,.30)' : 'rgba(200,210,255,.16)';
    for (let j = 0; j < L.VH - W.y - W.h; j++) Pixel.dither(x, W.x - j * .4 | 0, W.y + W.h + j, W.w + j * .5 | 0, 1, beam, j);
    if (st.lampAt && !dawn) for (let r = 34; r > 4; r -= 5) { x.fillStyle = `rgba(255,214,140,${(.05 + (34 - r) / 300).toFixed(3)})`; for (let j = -r; j <= r; j++) { const w2 = Math.round(Math.sqrt(r * r - j * j)); if ((j + r) % 2 === 0) x.fillRect(st.lampAt.x - w2, st.lampAt.y + j, w2 * 2, 1); } }
    st.anchors.head = { x: (bx + 30) * st.M.k, y: (by - 16) * st.M.k };
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
      // poeira só dentro do feixe de luz (e só com a cortina aberta e a luz acesa): partículas discretas que descem devagar
      if (L.win && (+o.curtain || 0) < .5 && (+o.dark || 0) < .5) for (let i = 0; i < 5; i++) { const W = L.win, ph = (t * .04 + i * .21) % 1, dy = W.y + W.h + ph * (L.floor - W.y - W.h - 4), dx = W.x + (dy - W.y) * .8 + ((i * 37) % Math.max(4, W.w - 4)) + Math.sin(t * .7 + i) * 2;
        if (Math.sin(t * 1.1 + i * 2.3) > -.3) this.F(x, P.w, dx | 0, dy | 0, 1, 1); }
    },
    shop(x, L, o, t) { if ((t * 10 | 0) % 37 === 0) this.F(x, WD_PAL.e, L.cx % 96 + 96 - 16, 7, 32, 2); },
    cash(x, L, o, t) { if ((t * 2 | 0) % 2) this.F(x, WD_PAL.Y, L.VW - 46 + 10, 18, 8, 5); else this.F(x, WD_PAL.Z, L.VW - 46 + 10, 18, 8, 5); },
    bed(x, L, o, t, st) {
      const P = WD_PAL, B = st.bedR, W = st.W, G = (...a) => this.F(x, ...a);
      if (!o.dawn) for (let i = 0; i < 9; i++) { const sx = W.x + 3 + (i * 37) % (W.w - 6), sy = W.y + 2 + (i * 13) % (W.h * .4 | 0); if (Math.sin(t * 2 + i * 1.7) > .2) G(i % 3 ? P.W : P.y, sx, sy, 1, 1); }
      // quem dorme tem o cabelo e a pele do personagem do jogador; a colcha de retalhos sobe e desce com a respiração
      let hair = AV_RAMPS.hair.castanho, skin = AV_RAMPS.skin[1], cloth = AV_RAMPS.cloth.azul;
      try { const a = avConfig(); hair = AV_RAMPS.hair[a.hairColor] || hair; skin = AV_RAMPS.skin[a.skin] || skin; cloth = AV_RAMPS.cloth[a.outfitColor] || cloth; } catch (e) {}
      const br = o.dawn ? 0 : Math.sin(t * 1.4) > 0 ? 1 : 0, shake = o.dawn ? ((t * 16 | 0) % 2 ? 1 : -1) : 0, hx = B.x + 12, hy = B.y - 16;
      G(P.k, hx - 1, hy + 3, 26, 13); G(P.W, hx, hy + 4, 24, 11); G(P.w, hx, hy + 12, 24, 3); G(P.p, hx + 20, hy + 5, 3, 9);   // travesseiro
      const fx = hx + 6 + shake;
      G(P.k, fx - 1, hy - 4, 16, 15); G(skin[1], fx, hy - 3, 14, 13); G(skin[2], fx + 10, hy - 3, 4, 13); G(skin[0], fx + 1, hy - 2, 3, 3);
      G(hair[1], fx, hy - 3, 14, 4); G(hair[0], fx + 1, hy - 3, 6, 1); G(hair[2], fx, hy + 1, 3, 6); G(hair[3], fx, hy - 4, 14, 1);
      if (o.dawn) { G(P.k, fx + 6, hy + 3, 2, 2); G(P.k, fx + 10, hy + 3, 2, 2); G(P.k, fx + 7, hy + 7, 4, 1); }
      else { G(P.k, fx + 6, hy + 4, 2, 1); G(P.k, fx + 10, hy + 4, 2, 1); G(skin[3], fx + 8, hy + 7, 2, 1); }
      const top = B.y - 10 - br, w2 = B.w - 40, qx = hx + 22;
      G(P.k, qx - 1, top - 1, w2 + 2, B.y + 5 - top);
      for (let j = top; j < B.y + 4; j++) for (let i = qx; i < qx + w2; i += 6) { const cell = ((i - qx) / 6 + ((j - top) / 5 | 0)) % 3; G(cell === 0 ? cloth[1] : cell === 1 ? cloth[0] : P.W, i, j, Math.min(6, qx + w2 - i), 1); }
      G(cloth[2], qx, B.y + 2, w2, 2); G(P.W, qx, top, w2, 1); for (let i = qx + 6; i < qx + w2; i += 6) G(cloth[3], i, top + 1, 1, B.y + 2 - top);
      // gato dormindo no pé da cama (se o jogador comprou)
      if (o.cat) { const cxp = qx + w2 - 22, cyp = top - 8; const cs = catStill(o.coat || 'laranja', .6); x.drawImage(cs, cxp - 4, cyp + 15 - cs.height); }   // o mesmo gato do jogo, em tamanho de cena
    },
  },
};
