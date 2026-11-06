/* ================= Ponteiro do mouse em pixel art ================= */
// Cada ponteiro: linhas da paleta, ponto ativo (hx, hy) e escala. Gerado como imagem (data URL) e aplicado a toda a página.
const CUR_ARROW = ['k...........', 'kk..........', 'kWk.........', 'kWWk........', 'kWWWk.......', 'kWWWWk......', 'kWWWWWk.....', 'kWWWWWWk....', 'kWWWWWWWk...', 'kWWWWWWWWk..', 'kWWWWWkkkkk.', 'kWWkWWk.....', 'kWk.kWWk....', 'kk..kWWk....', 'k....kWWk...', '.....kkk....'];
const CURSORS = {
  padrao: { rows: CUR_ARROW, hx: 0, hy: 0, s: 2, arrow: true },   // ponteiro do WorkOS: seta creme com contorno de tinta; sobre algo clicável vira mão
  triangulo: { arrow: true, rows: ['kk..........', 'kLkk........', 'kLLLkk......', 'kLLLLLkk....', 'kLLLLLLLkk..', 'kLLLLLLLLLk.', 'kLLLLLLLkk..', 'kLLLLkkk....', 'kLLkk.......', 'kkk.........'], hx: 0, hy: 0, s: 2 },
  pequeno: { rows: CUR_ARROW, hx: 0, hy: 0, s: 1, arrow: true },
  grande: { rows: CUR_ARROW, hx: 0, hy: 0, s: 3, arrow: true },
  patinha: { rows: ['..kk....kk..', '.kook..kook.', '.kook..kook.', '..kk.kk.kk..', '.kk.kook.kk.', 'kook.kk.kook', '.kk......kk.', '...kkkkkk...', '..kooooook..', '.kooooooook.', '.kooooooook.', '..kooooook..', '...kkkkkk...'], hx: 6, hy: 1, s: 2 },
  cenoura: { rows: ['k.............', 'kTk...........', '.kTTk.........', '.kTtTk........', '..kTTTk.......', '...kTtTk......', '....kTTTk.....', '.....kTtTkk...', '......kTTkGk..', '.......kkGGk..', '........kGhGk.', '.........kGGk.', '..........kk..'], hx: 0, hy: 0, s: 2 },
  mao: { rows: ['....kk......', '...kWWk.....', '...kWWk.....', '...kWWk.....', '...kWWkkk...', '...kWWkWWkk.', '.kkkWWkWWkWk', 'kWWkWWWWWkWk', 'kWWWWWWWWWWk', '.kWWWWWWWWWk', '.kWWWWWWWWk.', '..kWWWWWWWk.', '..kWWWWWWk..', '...kkkkkk...'], hx: 4, hy: 0, s: 2 },
  mira: { rows: (() => { const n = 13, c = 6, r = []; for (let y = 0; y < n; y++) { let s = ''; for (let x = 0; x < n; x++) { const d = Math.hypot(x - c, y - c); s += (x === c && (y < 4 || y > 8)) || (y === c && (x < 4 || x > 8)) ? 'R' : Math.abs(d - 4.6) < .55 ? 'k' : x === c && y === c ? 'R' : '.'; } r.push(s); } return r; })(), hx: 6, hy: 6, s: 2 },
  lapis: { rows: ['kk............', 'kpk...........', '.kpYk.........', '..kYYYk.......', '...kYzYk......', '....kYYYk.....', '.....kYzYk....', '......kYYYk...', '.......kYzYk..', '........kYYrk.', '.........krrk.', '..........kk..'], hx: 0, hy: 0, s: 2 },
  estrela: { rows: ['.....k.....', '....kYk....', '....kYk....', 'kkkkYYYkkkk', '.kYYYYYYYk.', '..kYYYYYk..', '..kYYkYYk..', '.kYk...kYk.', '.kk.....kk.'], hx: 5, hy: 4, s: 2 },
};
const CUR_IBEAM = ['kkkkkkk', 'kWWkWWk', 'kkkWkkk', '..kWk..', '..kWk..', '..kWk..', '..kWk..', '..kWk..', '..kWk..', '..kWk..', '..kWk..', 'kkkWkkk', 'kWWkWWk', 'kkkkkkk'];
// Cores: a letra de preenchimento de cada ponteiro é trocada pela cor escolhida (ponteiros com cor própria não mudam)
const CUR_FILL = { padrao: 'W', triangulo: 'L', pequeno: 'W', grande: 'W', mao: 'W', estrela: 'Y', patinha: 'o', mira: 'R' };
const CUR_COLORS = { padrao: null, branco: 'W', azul: 'L', verde: 'F', rosa: 'r', amarelo: 'Y', uva: 'I', menta: 'v', laranja: 'O', vermelho: 'R', cinza: 'M', ouro: 'z' };   // ouro: libera no Aniversário do Duda
function curRows(id, mode) {
  const c = CURSORS[id], col = CUR_COLORS[((CFG.hw || {}).curColor || {})[id]], f = CUR_FILL[id];
  let rows = c.rows.map(r => col && f ? r.split(f).join(col) : r);
  if (mode === 'hover') rows = rows.map(r => r.replace(/k/g, '7'));                         // sobre algo clicável: contorno azul
  if (mode === 'press') rows = ['.'.repeat(rows[0].length + 1), ...rows.map(r => '.' + r.replace(/W/g, 'w').replace(/L/g, '7').replace(/Y/g, 'z'))];   // clique: afunda 1 px e escurece
  return rows;
}
function cursorURL(c, scale, rows) {
  const m = Pixel.master(rows || c.rows, WD_PAL), k = scale || c.s, cv = document.createElement('canvas'); cv.width = m.width * k; cv.height = m.height * k;
  const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(m, 0, 0, cv.width, cv.height); return cv.toDataURL();
}
function applyCursor() {
  let st = document.getElementById('curStyle'); if (!st) { st = document.createElement('style'); st.id = 'curStyle'; document.head.append(st); }
  const id = (CFG.hw || {}).cursor || 'padrao', c = CURSORS[id];
  if (!c || document.body.classList.contains('touch')) { st.textContent = ''; return; }
  const hs = `${c.hx * c.s} ${c.hy * c.s}`, url = (m, rows) => `url(${cursorURL(c, 0, rows || curRows(id, m))})`;
  // ponteiros em forma de seta viram mão sobre algo clicável; os temáticos (pata, cenoura…) só trocam o contorno para azul
  const hand = CURSORS.mao, col = CUR_COLORS[((CFG.hw || {}).curColor || {})[id]], handRows = hand.rows.map(r => col ? r.split('W').join(col) : r);
  const overHand = c.arrow ? `url(${cursorURL(hand, 0, handRows)}) ${hand.hx * hand.s} ${hand.hy * hand.s}` : `${url('hover')} ${hs}`;
  const ibeam = `url(${cursorURL({ s: 2 }, 0, CUR_IBEAM)}) 7 14`;
  const CLICK = 'button, a, select, label, summary, [role=button], .osicon, .slot, .dphone, .belt-item, .inbag, .task, .vc-pick, .sw-btn, .os-task, .os-start, .xl-tab, .mw-b b, input[type=range], input[type=checkbox], input[type=radio]';
  const TEXT = 'input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=color]):not([type=button]):not([type=file]), textarea, [contenteditable=true]';
  const FREE = '.ticket, .belt-item, .ph-crop, #toast.notif';   // arrastáveis: mantêm mãos de agarrar do sistema
  st.textContent = `html, body, body * { cursor: ${url()} ${hs}, auto !important; }
    body :is(${CLICK}), body :is(${CLICK}) * { cursor: ${overHand}, pointer !important; }
    body :is(${TEXT}) { cursor: ${ibeam}, text !important; }
    body :is(button, input, select, textarea):disabled, body [aria-disabled=true] { cursor: ${url()} ${hs}, not-allowed !important; }
    body :is(${FREE}) { cursor: grab !important; } body :is(${FREE}).grab, body :is(${FREE}).dragging { cursor: grabbing !important; }
    html.cur-press, html.cur-press body * { cursor: ${url('press')} ${hs}, auto !important; }
    html.cur-press body :is(${TEXT}) { cursor: ${ibeam}, text !important; }`;
}
// animação de clique: enquanto o botão do mouse está apertado, o ponteiro afunda
addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') document.documentElement.classList.add('cur-press'); }, true);
addEventListener('pointerup', () => document.documentElement.classList.remove('cur-press'), true);
addEventListener('blur', () => document.documentElement.classList.remove('cur-press'));
applyCursor();
