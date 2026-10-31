/* ================= Motor de pixel art v2 ================= */
// Regras: sprites desenhados 1:1 num canvas mestre (em cache) e ampliados só por números inteiros.
// A escala inteira considera o devicePixelRatio, para que cada pixel da arte ocupe pixels físicos inteiros.
const Pixel = {
  cache: new Map(),
  master(rows, pal) {
    const key = rows.join('|') + '#' + Object.entries(pal).map(([k, v]) => k + v).join('');
    let m = this.cache.get(key);
    if (!m) {
      m = document.createElement('canvas');
      m.width = Math.max(...rows.map(r => r.length)); m.height = rows.length;
      const x = m.getContext('2d');
      rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = pal[row[i]]; if (c) { x.fillStyle = c; x.fillRect(i, j, 1, 1); } } });
      this.cache.set(key, m);
    }
    return m;
  },
  // Elemento <canvas> pronto para o HTML, com tamanho CSS = pixels da arte × escala inteira
  el(rows, scale = 2, palOverride) {
    const pal = palOverride ? { ...WD_PAL, ...palOverride } : WD_PAL;
    const m = this.master(rows, pal), c = document.createElement('canvas');
    c.width = m.width; c.height = m.height; c.className = 'px-sprite';
    c.getContext('2d').drawImage(m, 0, 0);
    const dpr = window.devicePixelRatio || 1, css = Math.max(1, Math.round(scale * dpr)) / dpr;  // pixels físicos inteiros
    c.style.width = m.width * css + 'px'; c.style.height = m.height * css + 'px';
    return c;
  },
  // Maior escala inteira em pixels físicos que cabe na área
  fitScale(cssW, cssH, baseW, baseH) {
    const dpr = window.devicePixelRatio || 1;
    return Math.max(1, Math.floor(Math.min(cssW * dpr / baseW, cssH * dpr / baseH)));
  },
  // Fonte 3x5 para letreiros desenhados na própria cena (marcas, etiquetas)
  FONT: { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
    G: '011100101101011', H: '101101111101101', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101',
    N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', J: '001001001101010', Z: '111001010100111', Q: '010101101110011', W: '101101111111101', X: '101101010101101', Y: '101101010010010', 0: '111101101101111', 1: '010110010010111',
    2: '110001010100111', 3: '110001010001110', 5: '111100110001110', 9: '111101111001110', 4: '101101111001001', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', '-': '000000111000000', '.': '000000000000010', ' ': '000000000000000' },
  text(ctx, str, x, y, color) {
    ctx.fillStyle = color;
    for (const ch of str.toUpperCase()) {
      const g = this.FONT[ch] || this.FONT[' '];
      for (let i = 0; i < 15; i++) if (g[i] === '1') ctx.fillRect(x + (i % 3), y + Math.floor(i / 3), 1, 1);
      x += 4;
    }
  },
  // Pontilhado 2x2 (dithering) para transições suaves em áreas grandes, sem degradê borrado
  dither(ctx, x, y, w, h, color, phase = 0) {
    ctx.fillStyle = color;
    for (let j = 0; j < h; j++) for (let i = (j + phase) % 2; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  },
};
