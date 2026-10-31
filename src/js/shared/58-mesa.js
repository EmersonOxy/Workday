/* ================= Mesa: zonas, escala dos objetos e arrumação escolhida pelo jogador ================= */
// A mesa não é uma fileira de miniaturas. Cada objeto tem um porte (P pequeno, M médio, G grande/"herói") e ocupa
// uma zona da mesa: os cantos, a frente (dos dois lados do teclado), as laterais do monitor (podendo ficar
// parcialmente atrás dele) e a prateleira da janela. O telefone fica no canto da frente à esquerda e é a referência de
// presença: os objetos G têm a mesma ordem de grandeza (60 a 100 px de arte), os M ficam entre 28 e 40 px e os P abaixo.
// A escolha do jogador fica em CFG.desk = { id: zona | 'off' }; sem escolha, a arrumação automática abaixo vale.

// id → [porte, largura que ocupa na mesa, altura visual]
const DESK_OBJ = {
  gato: ['G', 82, 70], lamp: ['G', 78, 92], aquario: ['G', 62, 42],
  mug: ['M', 34, 34], globo: ['M', 30, 38], trofeu: ['M', 30, 38], foto: ['M', 24, 28], planta: ['M', 28, 32], radio: ['M', 34, 24],
  badge: ['P', 16, 26], pens: ['P', 17, 21], papersL: ['P', 33, 12], papersR: ['P', 33, 12], pato: ['P', 18, 16], livros: ['P', 31, 22],
  caixaL: ['P', 13, 22], caixaR: ['P', 13, 22], cacto: ['P', 18, 26],
};
// objetos da mesa que não dependem de compra (podem ser guardados, nunca vendidos)
const DESK_BASE = ['mug', 'badge', 'pens', 'papersL', 'papersR'];
// arrumação automática: ordem de prioridade e zona preferida
const DESK_AUTO = [['gato', 'esqFundo'], ['lamp', 'dirFundo'], ['aquario', 'dirFrente'], ['caixaL', 'esqFundo'], ['caixaR', 'dirFundo'],
  ['mug', 'centroEsq'], ['badge', 'centroEsq'], ['pens', 'centroEsq'], ['foto', 'centroEsq'], ['trofeu', 'centroDir'], ['globo', 'centroDir'],
  ['papersR', 'centroDir'], ['pato', 'centroDir'], ['planta', 'dirFrente'], ['papersL', 'centroEsq'],
  ['radio', 'prateleira'], ['cacto', 'prateleira'], ['livros', 'prateleira']];
const DESK_ZONES = ['esqFundo', 'centroEsq', 'centroDir', 'dirFrente', 'dirFundo', 'prateleira'];
// quanto o objeto pode entrar atrás da moldura do monitor (px) e para onde vai se a zona escolhida estiver cheia
const DESK_TUCK = { gato: 20, lamp: 16, aquario: 8 };
const DESK_FALLBACK = { caixaL: ['centroEsq', 'centroDir'], caixaR: ['centroDir', 'centroEsq'], papersL: [], papersR: ['centroEsq'], planta: ['centroEsq', 'centroDir', 'prateleira'] };
// qual compra libera cada objeto (caixas de som são um par)
const deskOwned = (id, decor) => DESK_BASE.includes(id) || (decor || []).includes(id === 'caixaL' || id === 'caixaR' ? 'caixas' : id);

Object.assign(Office, {
  // Zonas em pixels de arte. back = encostadas na parede (desenhadas atrás do monitor quando se sobrepõem)
  deskZones(L) {
    const M = L.mon, s = L.screen, glassB = s.y + s.h + 1, phR = Math.max(2, L.VW * .015 | 0) + 96, frontY = L.ky - 3;
    return {
      esqFundo:  { x0: 4, x1: M.x - 2, y: L.desk + 5, back: true, maxH: 999, dir: -1 },
      dirFundo:  { x0: M.x + M.w + 2, x1: L.VW - 4, y: L.desk + 5, back: true, maxH: 999, dir: 1 },
      centroEsq: { x0: phR + 2, x1: L.kx - 6, y: frontY, maxH: frontY - glassB, dir: -1 },
      centroDir: { x0: L.kx + L.kw + 30, x1: M.x + M.w - 6, y: frontY, maxH: frontY - glassB, dir: 1 },
      dirFrente: { x0: M.x + M.w - 6, x1: L.VW - 3, y: L.VH - 5, maxH: 999, dir: 1, corner: true },
      prateleira: { shelf: true, maxH: 30, maxW: 40, cap: 2 * Math.max(30, M.x - 14) },   // duas fileiras sob a janela
    };
  },
  deskFits(id, z) { const o = DESK_OBJ[id]; if (!o || !z) return false; if (z.shelf) return o[0] !== 'G' && o[1] <= z.maxW && !DESK_BASE.includes(id); return o[2] <= z.maxH || o[0] === 'G' && !z.maxH; },
  // Posições: { id: { x, y (base), w, h, zone, back } }. Cache pelo tamanho, compras e escolhas
  deskSlots(L, decor) {
    const pick = (typeof CFG !== 'undefined' && CFG.desk) || {}, key = [L.VW, L.VH, (decor || []).join(), JSON.stringify(pick)].join('|');
    if (this._slotKey === key) return this._slots;
    const Z = this.deskZones(L), out = {}, used = {}, shelf = [];
    // a prateleira da janela perde a 2ª fileira quando algo alto ocupa o canto esquerdo da mesa
    const shelf0 = 16 + Math.max(54, (L.desk - 30) * .6 | 0) + 38, shelfRows = () => { const top = Math.min(999, ...Object.values(out).filter(q => q && q.zone === 'esqFundo').map(q => q.y - q.h - 4)); return top >= shelf0 + 34 ? 2 : 1; };
    const want = DESK_AUTO.map(([id, z]) => [id, typeof pick[id] === 'string' ? pick[id] : z]).filter(([id, z]) => z !== 'off' && deskOwned(id, decor));
    // escolhas do jogador primeiro (na ordem de prioridade), depois as automáticas
    want.sort((a, b) => (pick[b[0]] ? 1 : 0) - (pick[a[0]] ? 1 : 0) || (a[1] === 'prateleira') - (b[1] === 'prateleira'));
    const place = (id, zid) => {
      const z = Z[zid], o = DESK_OBJ[id]; if (!this.deskFits(id, z)) return false;
      if (z.shelf) { const u = used[zid] || 0, rows = shelfRows(); if (u + o[1] + 3 > z.cap / 2 * rows) return false; used[zid] = u + o[1] + 3; shelf.push(id); out[id] = { zone: zid, shelf: true, w: o[1], h: o[2] }; return true; }
      const u = used[zid] || 0, tuck = z.back && !u ? (DESK_TUCK[id] || 0) : 0, w = o[1], free = z.x1 - z.x0 - u + tuck; if (w > free) return false;
      // nas laterais do monitor o primeiro objeto pode entrar um pouco atrás da moldura (o gato encostado no monitor)
      const x = z.dir < 0 ? z.x1 - u - w + tuck : z.x0 + u - tuck;
      out[id] = { x, y: z.y, w, h: o[2], zone: zid, back: !!z.back, corner: !!z.corner };
      used[zid] = u + w - tuck + (o[0] === 'P' ? 3 : 5); return true;
    };
    // objetos arrumados à mão: { fx, fy, flip } (centro em fração da largura e profundidade entre o fundo e a borda da frente)
    const yBack = L.desk + 5, yFront = L.VH - 4, s0 = L.screen, glassB = s0.y + s0.h + 1;
    for (const [id] of want) { const m = pick[id]; if (!m || typeof m !== 'object') continue; const o = DESK_OBJ[id], w = o[1], h = o[2];
      let x = Math.round(m.fx * L.VW - w / 2), y = Math.round(yBack + m.fy * (yFront - yBack));
      x = Math.max(-8, Math.min(L.VW - w + 8, x)); y = Math.max(yBack, Math.min(yFront, y));
      let back = y < yBack + 8;
      // na frente, não pode subir por cima do vidro da tela (ficaria escondido pelo jogo): desce ou vai para trás do monitor
      if (!back && x + w > s0.x && x < s0.x + s0.w && y - h < glassB) {
        if (glassB + h <= yFront) y = glassB + h;
        // alto demais: desliza para a direita da tela (a frente esquerda é do telefone); sem espaço, vai para o fundo
        else if (s0.x + s0.w + w <= L.VW + 14) x = s0.x + s0.w; else { y = yBack; back = true; }   // pode sair um pouco pela borda da cena
      }
      const phR = Math.max(2, L.VW * .015 | 0) + 94; if (!back && x < phR && y > L.VH - 58) x = phR;   // o telefone fica por cima: não esconde nada embaixo dele
      out[id] = { x, y, w, h, zone: 'livre', back, flip: !!m.flip, manual: true }; }
    for (const [id, zid] of want) {
      if (out[id]) continue;
      if (place(id, zid)) continue;
      // sem espaço na zona escolhida: tenta as outras que comportam o porte (o aviso aparece na arrumação)
      if (!(DESK_FALLBACK[id] || DESK_ZONES).some(z2 => z2 !== zid && place(id, z2))) out[id] = { off: true };
      if (out[id] && !out[id].off) out[id].moved = zid;
    }
    // compatibilidade com quem lê as posições antigas
    out._shelf = shelf; out._shelfRows = shelfRows();
    this._slotKey = key; this._slots = out; return out;
  },
  lampRect(L) { const q = this.deskSlots(L, this._decor || [])['lamp']; if (!q || q.off) return { x: -99, y: -99, w: 0, h: 0 };
    return (q.zone === 'esqFundo') !== !!q.flip ? { x: q.x, y: q.y - 92, w: 80, h: 92 } : { x: q.x + q.w - 80, y: q.y - 92, w: 80, h: 92 }; },
  badgeRect(L) { const q = this.deskSlots(L, this._decor || [])['badge']; return q && !q.off ? { x: q.x, y: q.y - 32, w: 16, h: 32 } : { x: -99, y: -99, w: 0, h: 0 }; },

  // ---------- Caneca grande: cilindro com boca elíptica, café com reflexo, faixa lavanda, alça em anel e vapor ----------
  mugBig(x, x0, by, t, gold, steam) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); }, W = 26, H = 28, top = by - H, cx = x0 + W / 2;
    ART.contact(x, x0 - 1, by, W + 8);
    // alça: anel grosso à direita (contorno, face clara em cima, sombra embaixo)
    const hx = x0 + W - 3, hy = top + 8;
    for (let j = -8; j <= 8; j++) for (let i = 0; i <= 9; i++) { const d = Math.sqrt((i / 9) ** 2 + (j / 8) ** 2); if (d > 1 || i < 2) continue;
      if (d > .4) F(d > .82 ? P.k : d > .55 ? (j < 0 ? P.W : j < 4 ? P.w : P.p) : P.k, hx + i, hy + 8 + j, 1, 1); }
    // corpo: colunas com luz à esquerda, base arredondada nas duas últimas linhas
    for (let j = 3; j < H; j++) { const ins = j >= H - 2 ? j - (H - 3) : 0;
      for (let i = ins; i < W - ins; i++) { const u = i / (W - 1), band = j >= 12 && j <= 18;
        let c = u < .12 ? (band ? P.i : P['+']) : u < .62 ? (band ? P.I : P.W) : u < .84 ? (band ? P.I : P.w) : (band ? P[6] : P.p);
        if (band && (j === 12 || j === 18)) c = P[6];
        if (i === ins || i === W - 1 - ins || j === H - 1) c = P.k; F(c, x0 + i, top + j, 1, 1); } }
    if (gold) { F(P.k, cx - 3, top + 13, 6, 5); F(P.Y, cx - 2, top + 14, 4, 3); F(P.y, cx - 2, top + 14, 1, 1); F(P.z, cx + 1, top + 16, 1, 1); }   // emblema dourado (a partir de Assistente)
    // boca elíptica: aro claro, café escuro com reflexo
    for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(1 - (j / 3.5) ** 2) * (W / 2)), y = top + 3 + j; F(P.k, cx - w, y, w * 2, 1);
      const wi = w - 2; if (wi > 0 && j > -3 && j < 3) F(j < 0 ? P.w : P.W, cx - wi, y, wi * 2, 1);
      const wc = w - 3; if (wc > 0 && j > -2 && j < 3) F(j <= 0 ? P[4] : P[3], cx - wc, y, wc * 2, 1); }
    F(P[2], cx - 6, top + 3, 3, 1); F(P.w, cx + 4, top + 2, 2, 1);                                 // reflexo no café
    // vapor: três fios de pixels subindo e oscilando (só enquanto está quente)
    if (steam) for (let s = 0; s < 3; s++) for (let k = 0; k < 7; k++) { if ((k + (t * 6 | 0) + s) % 3 === 0) continue;
      const yy = top - 2 - k * 2 - ((t * 6 | 0) % 2), xx = cx - 6 + s * 6 + Math.round(Math.sin(t * 2.2 + k * .8 + s * 2) * 1.5);
      F(k < 3 ? P.W : P.w, xx, yy, 1, 2); }
  },

  // ---------- Troféu médio: taça com alças em anel, haste, nó e base de madeira com plaquinha ----------
  trophyBig(x, x0, by, t) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); }, cx = x0 + 15, y0 = by - 38;
    ART.contact(x, x0 + 3, by, 24);
    const metal = u => u < .2 ? P.y : u < .55 ? P.Y : u < .85 ? P.z : P.Z;
    // alças (anel de 2 px nos dois lados)
    for (const sd of [-1, 1]) for (let a = -1.6; a <= 1.6; a += .1) { const px = cx + sd * (11 + Math.round(Math.cos(a) * 5)), py = y0 + 7 + Math.round(Math.sin(a) * 5);
      F(P.k, px - 1, py - 1, 3, 3); }
    for (const sd of [-1, 1]) for (let a = -1.6; a <= 1.6; a += .1) { const px = cx + sd * (11 + Math.round(Math.cos(a) * 5)), py = y0 + 7 + Math.round(Math.sin(a) * 5); F(sd < 0 ? P.Y : P.z, px, py, 1, 1); }
    // taça
    for (let j = 0; j <= 16; j++) { const hw = Math.round(11 - (j / 16) ** 2 * 7); F(P.k, cx - hw - 1, y0 + j, hw * 2 + 2, 1);
      for (let i = -hw; i < hw; i++) F(j < 2 ? (j ? P.Z : P.Y) : metal((i + hw) / (hw * 2)), cx + i, y0 + j, 1, 1); }
    F(P.k, cx - 12, y0 - 1, 24, 1);
    // brilho que atravessa a taça de vez em quando (faixa diagonal de 2 px)
    const sh = (t % 5) / 1.2; if (sh < 1) { const bx = cx - 10 + Math.round(sh * 20); for (let j = 3; j < 15; j++) { const hw = Math.round(11 - (j / 16) ** 2 * 7), xx = bx - (j >> 1); if (xx > cx - hw && xx < cx + hw - 1) F(P['+'], xx, y0 + j, 2, 1); } }
    // haste, nó e base
    F(P.k, cx - 3, y0 + 17, 6, 6); F(P.Y, cx - 2, y0 + 17, 2, 6); F(P.z, cx, y0 + 17, 2, 6);
    F(P.k, cx - 5, y0 + 22, 10, 3); F(P.y, cx - 4, y0 + 23, 3, 1); F(P.Y, cx - 1, y0 + 23, 4, 1); F(P.z, cx + 3, y0 + 23, 1, 1);
    F(P.k, cx - 10, y0 + 25, 20, 13); F(P[2], cx - 9, y0 + 26, 18, 11); F(P[1], cx - 9, y0 + 26, 18, 1); F(P[1], cx - 9, y0 + 26, 1, 11); F(P[3], cx + 8, y0 + 27, 1, 10); F(P[4], cx - 9, y0 + 36, 18, 1);
    F(P.k, cx - 6, y0 + 29, 12, 5); F(P.Y, cx - 5, y0 + 30, 10, 3); F(P.y, cx - 5, y0 + 30, 10, 1); F(P.z, cx - 3, y0 + 32, 6, 1);   // plaquinha
  },

  // ---------- Luminária articulada grande (azul, juntas vermelhas). flip = virada para a direita ----------
  // Base pesada, haste, braço inferior subindo para trás, braço superior vindo para a frente e cúpula cônica.
  // Devolve a boca da cúpula (origem do cone de luz).
  lampBig(x, bx, by, t, on, flip) {
    const P = WD_PAL, X = (dx, w = 1) => flip ? bx - dx - w + 1 : bx + dx, F = (c, dx, y, w, h) => { x.fillStyle = c; x.fillRect(X(dx, w), y, w, h); };
    const A = { hi: P.l, b: P.L, sh: P[7], dk: P.N }, J = { hi: P.r, b: P.R, sh: P.q };
    ART.contact(x, Math.min(X(-18), X(17)), by, 36);
    // base: disco com tampo iluminado e frente na sombra
    F(P.k, -15, by - 9, 30, 1); F(P.k, -17, by - 8, 34, 8); F(A.b, -16, by - 8, 32, 4); F(A.hi, -16, by - 8, 11, 1); F(A.hi, -16, by - 7, 4, 2); F(A.sh, 6, by - 8, 10, 4);
    F(A.dk, -16, by - 4, 32, 3); F(A.sh, -16, by - 4, 7, 1); F(P.k, -16, by - 1, 32, 1); F(P.m, 9, by - 3, 3, 1);   // interruptor
    // haste curta
    F(P.k, -3, by - 21, 6, 12); F(A.b, -2, by - 21, 4, 12); F(A.hi, -2, by - 21, 1, 12); F(A.sh, 1, by - 21, 1, 12);
    const joint = (dx, y, r) => { F(P.k, dx - r, y - r, r * 2, r * 2); F(J.b, dx - r + 1, y - r + 1, r * 2 - 2, r * 2 - 2); F(J.hi, dx - r + 1, y - r + 1, r - 1, 1); F(J.hi, dx - r + 1, y - r + 1, 1, r - 1); F(J.sh, dx, y + r - 2, r - 1, 1); F(P.k, dx - 1, y - 1, 2, 2); F(P.m, dx - 1, y - 1, 1, 1); };
    // braço inferior: sobe 4 para cada 1 para trás, com mola ao lado
    for (let i = 0; i < 46; i++) { const dx = i >> 2, y = by - 24 - i; F(P.k, dx - 2, y, 5, 1); F(A.hi, dx - 1, y, 1, 1); F(A.b, dx, y, 1, 1); F(A.sh, dx + 1, y, 1, 1); if (i > 6 && i < 40 && i % 3 === 0) F(i % 6 ? P.m : P.j, dx + 3, y, 1, 1); }
    joint(0, by - 22, 4);
    const ex = 11, ey = by - 71;
    // braço superior: vem para a frente, subindo 1 a cada 5
    for (let i = 0; i < 40; i++) { const dx = ex - i, y = ey - 1 - (i / 5 | 0); F(P.k, dx, y - 2, 1, 1); F(A.hi, dx, y - 1, 1, 1); F(A.b, dx, y, 1, 1); F(A.sh, dx, y + 1, 1, 1); F(P.k, dx, y + 2, 1, 1); }
    joint(ex, ey, 4);
    const hx = ex - 41, hy = ey - 9;
    // cúpula: cone apontado para baixo, três tons pela luz, aro e interior
    const sy = hy + 2, cxs = hx - 3;
    for (let j = 0; j < 20; j++) { const hw = 4 + (j * .85 | 0);
      F(P.k, cxs - hw - 1, sy + j, hw * 2 + 2, 1);
      for (let i = -hw; i < hw; i++) { const u = (i + hw) / (hw * 2), sx = flip ? 1 - u : u; F(j < 2 ? A.hi : sx < .3 ? A.hi : sx < .7 ? A.b : sx < .9 ? A.sh : A.dk, cxs + i, sy + j, 1, 1); } }
    const bw = 4 + (19 * .85 | 0);
    F(P.k, cxs - bw - 1, sy + 20, bw * 2 + 2, 2); F(A.dk, cxs - bw, sy + 20, bw * 2, 1);
    if (on) { F(P.W, cxs - 7, sy + 20, 14, 2); F(P.y, cxs - 9, sy + 20, 2, 1); F(P.y, cxs + 7, sy + 20, 2, 1); if ((t * 9 | 0) % 7 === 0) F(P.y, cxs - 6, sy + 20, 12, 1); }
    else F(P.e, cxs - 7, sy + 20, 14, 1);
    joint(hx, hy, 3);
    return { x: X(cxs), y: sy + 22 };
  },

  // ---------- Crachá deitado sobre a mesa, com cordão (mesmo desenho de antes, agora numa função) ----------
  badgeObj(x, bx0, by0, st) {
    const P = WD_PAL, F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); }, bd = st.badge || { shirt: P.L };
    this.shadow(x, bx0 - 1, by0 + 20, 16, 2);
    const ly = (st.hw && st.hw.lanyardColor) || P.L; F(ly, bx0 + 3, by0 - 6, 1, 6); F(ly, bx0 + 10, by0 - 6, 1, 6); F(P.k, bx0 + 5, by0 - 2, 4, 3); F(P.m, bx0 + 6, by0 - 1, 2, 1);
    F(P.k, bx0, by0, 14, 20); F(P.W, bx0 + 1, by0 + 1, 12, 18); F(P.w, bx0 + 12, by0 + 1, 1, 18); F(P.w, bx0 + 1, by0 + 18, 12, 1);
    F((st.hw && st.hw.badgeColor) || bd.shirt, bx0 + 1, by0 + 1, 12, 3); F(P.W, bx0 + 2, by0 + 2, 3, 1);
    F(P.k, bx0 + 3, by0 + 5, 8, 9);
    if (bd.px) bd.px.forEach((row, j) => row.forEach((c, i) => F(c, bx0 + 4 + i, by0 + 6 + j, 1, 1)));
    F(P.k, bx0 + 4, by0 + 15, 6, 1); F(P.p, bx0 + 3, by0 + 17, 8, 1);
    for (let i = 0; i < 8; i++) if ((i * 5) % 3) F(P.K, bx0 + 3 + i, by0 + 18, 1, 1);
    F(P.l, bx0 + 11, by0 + 5, 1, 2); F(P.i, bx0 + 11, by0 + 7, 1, 1); F(P.W, bx0 + 6, by0 + 2, 2, 1);
  },
  PENS: ['..kk............', '.krrk......kk...', '.kmmk.....kLLk..', '.kQQk..k..kLLk..', '.kQQk.kmk.kLLk..', '.kQQk.kmk.kLLk..', '.kQQk.kmk.kLLk..', '..kkkkkkkkkkkk..', '.kJJJJJJJJJJJJk.', 'k0J0J0J0J0J0J0Jk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', 'kmJjmjmjmjmjJJjk', 'kmjMjMjMjMjMjjJk', '.kMjjjjjjjjjjJk.', '..kkkkkkkkkkkk..'],

  // Desenha um objeto da mesa na posição da zona. Devolve fontes de luz (para a iluminação com a persiana fechada)
  deskObj(x, id, q, st, t, dy = 0) {
    if (q.flip && id !== 'lamp') { x.save(); x.translate(2 * q.x + q.w, 0); x.scale(-1, 1); const g = this.deskObj0(x, id, q, st, t, dy); x.restore();
      if (g) g[0] = 2 * q.x + q.w - g[0]; if (id === 'aquario' && this._aqua) this._aqua[0] = 2 * q.x + q.w - this._aqua[0] - 36; return g; }
    return this.deskObj0(x, id, q, st, t, dy);
  },
  deskObj0(x, id, q, st, t, dy = 0) {
    const P = WD_PAL, y = q.y + dy;
    if (id === 'gato') { const k = 2, cw = catSize(k)[0] - 8, cxx = q.x + ((q.w - cw) >> 1);
      this.shadow(x, cxx - 1, y + 1, cw + 2, 2); const F = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
      F(P.k, cxx - 2, y - 6, cw + 4, 7); F(P.L, cxx - 1, y - 5, cw + 2, 5); F(P.l, cxx - 1, y - 5, cw + 2, 1); F(P[7], cxx - 1, y - 1, cw + 2, 1); F(P.Y, cxx - 2, y - 5, 1, 1); F(P.Y, cxx + cw + 1, y - 5, 1, 1);   // almofada
      CatAI.step(OFFICE_CAT, t); catDraw(x, cxx - 4, y - 4, st.cat || 'laranja', OFFICE_CAT, t, k); return; }
    if (id === 'lamp') { const flip = (q.zone === 'esqFundo') !== !!q.flip, on = (st.lampLv !== undefined ? st.lampLv : 1) > .5, bx = flip ? q.x + 26 : q.x + q.w - 26; const h = this.lampBig(x, bx, y, t, on, flip); this._lampCone = { cx: h.x, y0: h.y, y1: y + 1 }; return; }
    if (id === 'aquario') { this._aqua = [q.x, y - q.h - 2]; ART.aquarium(x, q.x, y, t, Object.assign({}, st, { W: q.w - 2, H: q.h - 4 })); return [q.x + (q.w >> 1), y - q.h / 2, q.w * .7, q.h * .6, '120,200,220', .45]; }
    if (id === 'mug') { this.mugBig(x, q.x + 1, y, t, st.rank >= 1, st.hour < 16 || st.clutter < 2); return; }
    if (id === 'trofeu') { this.trophyBig(x, q.x, y, t); return; }
    if (id === 'globo') { ART.globe(x, q.x, y, t, { spin: OFFICE_GLOBE.spin(t), r: 10 }); return; }
    if (id === 'foto') { ART.frame(x, q.x + 2, y); return; }
    if (id === 'planta') { this.plant(x, q.x + 2, y, t); return; }
    if (id === 'radio') { ART.radio(x, q.x, y, t, st); return st.sound ? [q.x + 26, y - 10, 10, 6, '255,214,140', .3] : undefined; }
    if (id === 'cacto') { ART.cactus(x, q.x, y, t); return; }
    if (id === 'livros') { ART.books(x, q.x, y); return; }
    if (id === 'pato') { duckDraw(x, q.x, y, t); return; }
    if (id === 'caixaL' || id === 'caixaR') { ART.speaker(x, q.x, y, t, st); return; }
    if (id === 'badge') { this.badgeObj(x, q.x + 1, y - 26, st); return; }
    if (id === 'pens') { this.shadow(x, q.x, y, 17, 2); x.drawImage(Pixel.master(this.PENS, P), q.x, y - 20); return; }
    if (id === 'papersL') { this.paperStack(x, q.x + 1, y - 14, 2 + (st.clutter > 1 ? 3 : 0)); return; }
    if (id === 'papersR') { this.paperStack(x, q.x + 1, y - 14, 1 + st.clutter * 2); return; }
  },
  // Seleção na arrumação: cantoneiras de tinta com miolo claro (sem contorno amarelo), piscando devagar
  deskMark(x, q, t) {
    const P = WD_PAL, x0 = q.x - 3, y0 = q.y - q.h - 3, x1 = q.x + q.w + 2, y1 = q.y + 3, c = (t * 2 | 0) % 2 ? P.W : P.w;
    for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      x.fillStyle = P.k; x.fillRect(Math.min(cx, cx + dx * 5), cy - (dy < 0 ? 1 : 0), 6, 3); x.fillRect(cx - (dx < 0 ? 1 : 0), Math.min(cy, cy + dy * 5), 3, 6);
      x.fillStyle = c; x.fillRect(Math.min(cx, cx + dx * 4) + (dx > 0 ? 1 : 0), cy, 4, 1); x.fillRect(cx, Math.min(cy, cy + dy * 4) + (dy > 0 ? 1 : 0), 1, 4); }
  },
  // Todos os objetos da mesa, em camadas: fundo (atrás do monitor quando se sobrepõem), frente e cantos da frente
  deskDraw(x, L, st, t, drop, glows) {
    const Q = this.deskSlots(L, st.decor || []), M = L.mon, list = Object.entries(Q).filter(([id, q]) => DESK_OBJ[id] && q && !q.off && !q.shelf);
    const layer = f => list.filter(([, q]) => f(q)).sort((a, b) => a[1].y - b[1].y || a[1].x - b[1].x);
    const run = ([id, q]) => { const g = this.deskObj(x, id, q, st, t, drop(id === 'caixaL' || id === 'caixaR' ? 'caixas' : id)); if (g) glows.push(g); };
    // fundo: recorta o retângulo do monitor (o que passa por trás fica escondido pela moldura)
    x.save(); x.beginPath(); x.rect(0, 0, L.VW, L.VH); x.rect(M.x - 1, M.y - 1, M.w + 2, M.h + 2); x.clip('evenodd'); layer(q => q.back).forEach(run); x.restore();
    layer(q => !q.back && !q.corner).forEach(run);
    layer(q => q.corner).forEach(run);
    const ed = typeof DESK_EDIT !== 'undefined' && DESK_EDIT.on;
    if (ed) {   // arrumando: o monitor fica translúcido sobre o que está atrás dele
      x.save(); x.globalAlpha = .6; x.beginPath(); x.rect(M.x - 1, M.y - 1, M.w + 2, M.h + 2); x.clip(); layer(q => q.back).forEach(([id, q]) => this.deskObj(x, id, q, st, t, 0)); x.restore();
      const sel = DESK_EDIT.sel && Q[DESK_EDIT.sel]; if (sel && !sel.off && !sel.shelf) this.deskMark(x, sel, t); }
  },
});
