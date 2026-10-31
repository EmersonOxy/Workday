/* ================= Decoração extra da loja (mesa, computador e parede) ================= */
// Registro reutilizável: cada item tem desenho (linhas da paleta), área e posição calculada a partir do layout.
// O mesmo desenho serve de ícone na loja. Adicionar um item novo = uma entrada aqui + nome/descrição nas traduções.
const padRows = rows => { const w = Math.max(...rows.map(r => r.length)); return rows.map(r => r.padEnd(w, '.')); };
const quadroRows = (() => { const W = 22, H = 16, out = [];
  for (let j = 0; j < H; j++) { let r = '';
    for (let i = 0; i < W; i++) {
      const edge = i === 0 || j === 0 || i === W - 1 || j === H - 1, fr = i < 3 || j < 3 || i > W - 4 || j > H - 4;
      const hill = j > 10 - Math.round(Math.sin(i / 3) * 1.5) ? (j > 12 ? 'h' : 'G') : null, sun = (i - 15) ** 2 + (j - 6) ** 2 <= 3;
      r += edge ? 'k' : fr ? (i < 3 || j < 3 ? '2' : '4') : hill || (sun ? 'Y' : j < 7 ? 'l' : 'v');
    } out.push(r); }
  return out; })();
const DECOR_EXTRA = {
  globo:   { price: 140, zone: 'desk', rows: padRows(['....kkkkk.....', '..kkLLlLLkk...', '.kLLGGlLLLLk..', '.kLGGGGLLGLk..', 'kLLGGGLLGGGLk.', 'kLLLGLLLGGLLk.', 'kLlLLLLLLGLLk.', 'kLLLLGGLLLLLk.', '.kLLGGGGLLLk..', '.kLLLGGLLLLk..', '..kkLLLLLkk...', '....kkkkk.....', '.....kZk......', '....kzZzk.....', '..kkkkkkkkk...', '..kzzzzzzzk...', '...kkkkkkk....']),
             at: (L) => [L.VW - Math.max(L.VW * .07 | 0, 4) - 48, L.desk - 4] },
  livros:  { price: 90, zone: 'desk', rows: padRows(['..kkkkkkkkkkkkkk..', '..kRRRRRRRRRRRWk..', '..kqqqqqqqqqqqWk..', 'kkkkkkkkkkkkkkkk..', 'kLLLLLLLLLLLLLWk..', 'k777777777777Wk...', '.kkkkkkkkkkkkkkkk.', '.kFFFFFFFFFFFFFWk.', '.k9999999999999Wk.', '.kkkkkkkkkkkkkkkk.']),
             at: (L) => [L.VW - Math.max(L.VW * .07 | 0, 4) - 24, L.desk + 6] },
  pato:    { price: 40, zone: 'desk', rows: padRows(['...kkk......', '..kYYYk.....', '..kYkYkk....', '..kYYYkOk...', '...kYYkk....', '.kkkYYYkk...', 'kYYYYYYYYk..', 'kYyYYYYYzk..', '.kzzzzzzk...', '..kkkkkk....']),
             at: (L) => L.kx + L.kw + 120 < L.VW - 40 ? [L.kx + L.kw + 120, L.desk + 10] : [L.kx + L.kw + 8, L.desk - 4] },
  webcam:  { price: 110, zone: 'pc', rows: padRows(['..kkkkkkkk..', '.kJJJJJJJJk.', '.kJkmmkJRJk.', '.kJkmxkJJJk.', '.kJJJJJJJJk.', '..kkkJJkkk..', '....kJJk....']),
             at: (L) => [L.mon.x + (L.mon.w >> 1) - 6, L.mon.y - 6] },
  caixas:  { price: 160, zone: 'pc', rows: padRows(['kkkkkkk', 'kJjjjJk', 'kJkkkJk', 'kJkmkJk', 'kJkkkJk', 'kJJJJJk', 'kJkkkJk', 'kJkmkJk', 'kJkkkJk', 'kJJJJJk', 'kkkkkkk']), pair: true,
             at: (L) => [L.mon.x + (L.mon.w >> 1) - 46, L.desk - 10] },
  adesivos:{ price: 30, zone: 'pc', rows: padRows(['kkkk.kkkk', 'kRRk.kYYk', 'kRRk.kYYk', 'kkkk.kkkk', '..kkkk...', '..kFFk...', '..kFFk...', '..kkkk...']),
             at: (L) => [L.mon.x + 3, L.mon.y + L.mon.h - 11] },
  diploma: { price: 220, zone: 'wall', rows: padRows(['kkkkkkkkkkkkkkkkkk', 'kzZZZZZZZZZZZZZZzk', 'kZWWWWWWWWWWWWWWZk', 'kZWkkkkkkkkkkkkWZk', 'kZWWWWWWWWWWWWWWZk', 'kZWpppppppppppWWZk', 'kZWWWWWWWWWWWWWWZk', 'kZWppppppppWWRRWZk', 'kZWWWWWWWWWWWRRWZk', 'kzZZZZZZZZZZZZZZzk', 'kkkkkkkkkkkkkkkkkk']),
             at: (L) => L.right >= 20 ? [L.VW - 21, 50] : null },
  quadro:  { price: 260, zone: 'wall', rows: quadroRows,
             at: (L) => L.right >= 24 ? [L.VW - 24, Office.spots(L).sideMon.y + 36] : null },
  neon:    { price: 300, zone: 'wall', rows: padRows(['kkkkkkkkkkkkkkkkkkkkk', 'k0000000000000000000k', 'k0rRr0rRr0rRr0rRrr00k', 'k0R000R0R0R000R00000k', 'k0R000RRR0RR00RR0000k', 'k0R000R0R0R000R00000k', 'k0rRr0R0R0R000rRrr00k', 'k0000000000000000000k', 'kkkkkkkkkkkkkkkkkkkkk']),
             at: (L) => L.right >= 22 ? [L.VW - 22, 70] : null },
};
// Desenha os itens comprados no cache da cena (sombras incluídas)
function drawDecorExtra(x, L, decor) {
  for (const [id, d] of Object.entries(DECOR_EXTRA)) {
    if (!decor.includes(id)) continue;
    const p = d.at(L); if (!p) continue;
    const m = Pixel.master(d.rows, WD_PAL), [px, py] = p, by = py + m.height;
    if (d.zone !== 'wall') Office.shadow(x, px - 1, by, m.width + 2, 2);
    x.drawImage(m, px, py);
    if (d.pair) { const qx = L.mon.x + (L.mon.w >> 1) + 39; Office.shadow(x, qx - 1, by, m.width + 2, 2); x.drawImage(m, qx, py); }
  }
}
