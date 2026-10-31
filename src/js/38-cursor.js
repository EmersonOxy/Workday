/* ================= Ponteiro do mouse em pixel art ================= */
// Cada ponteiro: linhas da paleta, ponto ativo (hx, hy) e escala. Gerado como imagem (data URL) e aplicado a toda a página.
const CUR_ARROW = ['k...........', 'kk..........', 'kWk.........', 'kWWk........', 'kWWWk.......', 'kWWWWk......', 'kWWWWWk.....', 'kWWWWWWk....', 'kWWWWWWWk...', 'kWWWWWWWWk..', 'kWWWWWkkkkk.', 'kWWkWWk.....', 'kWk.kWWk....', 'kk..kWWk....', 'k....kWWk...', '.....kkk....'];
const CURSORS = {
  padrao: null,
  triangulo: { rows: ['kk..........', 'kLkk........', 'kLLLkk......', 'kLLLLLkk....', 'kLLLLLLLkk..', 'kLLLLLLLLLk.', 'kLLLLLLLkk..', 'kLLLLkkk....', 'kLLkk.......', 'kkk.........'], hx: 0, hy: 0, s: 2 },
  pequeno: { rows: CUR_ARROW, hx: 0, hy: 0, s: 1 },
  grande: { rows: CUR_ARROW, hx: 0, hy: 0, s: 3 },
  patinha: { rows: ['..kk....kk..', '.kook..kook.', '.kook..kook.', '..kk.kk.kk..', '.kk.kook.kk.', 'kook.kk.kook', '.kk......kk.', '...kkkkkk...', '..kooooook..', '.kooooooook.', '.kooooooook.', '..kooooook..', '...kkkkkk...'], hx: 6, hy: 1, s: 2 },
  cenoura: { rows: ['k.............', 'kTk...........', '.kTTk.........', '.kTtTk........', '..kTTTk.......', '...kTtTk......', '....kTTTk.....', '.....kTtTkk...', '......kTTkGk..', '.......kkGGk..', '........kGhGk.', '.........kGGk.', '..........kk..'], hx: 0, hy: 0, s: 2 },
  mao: { rows: ['....kk......', '...kWWk.....', '...kWWk.....', '...kWWk.....', '...kWWkkk...', '...kWWkWWkk.', '.kkkWWkWWkWk', 'kWWkWWWWWkWk', 'kWWWWWWWWWWk', '.kWWWWWWWWWk', '.kWWWWWWWWk.', '..kWWWWWWWk.', '..kWWWWWWk..', '...kkkkkk...'], hx: 4, hy: 0, s: 2 },
  mira: { rows: (() => { const n = 13, c = 6, r = []; for (let y = 0; y < n; y++) { let s = ''; for (let x = 0; x < n; x++) { const d = Math.hypot(x - c, y - c); s += (x === c && (y < 4 || y > 8)) || (y === c && (x < 4 || x > 8)) ? 'R' : Math.abs(d - 4.6) < .55 ? 'k' : x === c && y === c ? 'R' : '.'; } r.push(s); } return r; })(), hx: 6, hy: 6, s: 2 },
  lapis: { rows: ['kk............', 'kpk...........', '.kpYk.........', '..kYYYk.......', '...kYzYk......', '....kYYYk.....', '.....kYzYk....', '......kYYYk...', '.......kYzYk..', '........kYYrk.', '.........krrk.', '..........kk..'], hx: 0, hy: 0, s: 2 },
  estrela: { rows: ['.....k.....', '....kYk....', '....kYk....', 'kkkkYYYkkkk', '.kYYYYYYYk.', '..kYYYYYk..', '..kYYkYYk..', '.kYk...kYk.', '.kk.....kk.'], hx: 5, hy: 4, s: 2 },
};
function cursorURL(c, scale) {
  const m = Pixel.master(c.rows, WD_PAL), k = scale || c.s, cv = document.createElement('canvas'); cv.width = m.width * k; cv.height = m.height * k;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(m, 0, 0, cv.width, cv.height); return cv.toDataURL();
}
function applyCursor() {
  let st = document.getElementById('curStyle'); if (!st) { st = document.createElement('style'); st.id = 'curStyle'; document.head.append(st); }
  const c = CURSORS[(CFG.hw || {}).cursor];
  if (!c || document.body.classList.contains('touch')) { st.textContent = ''; return; }
  st.textContent = `html, body, body * { cursor: url(${cursorURL(c)}) ${c.hx * c.s} ${c.hy * c.s}, auto !important; }`;
}
applyCursor();
