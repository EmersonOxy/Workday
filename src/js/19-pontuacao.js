/* ================= Pontuação ================= */
function mult() { return Math.min(has('meta') ? 6 : 5, 1 + Math.floor(S.combo / 5)); }
function flash(text, color, x, y) {
  const el = document.createElement('div');
  el.className = 'flash'; el.textContent = text; el.style.color = color;
  el.style.left = Math.max(4, Math.min(x, board.clientWidth - 160)) + 'px'; el.style.top = y + 'px';
  board.append(el);
  setTimeout(() => el.remove(), 800);
}
// O valor muda e a barra acompanha no mesmo instante; o "dano" (faixa clara do trecho recém-somado) tem tempo próprio
function addStress(n) {
  const before = S.stress;
  S.stress = Math.max(0, Math.min(100, S.stress + n));
  if (n > 0 && S.stress >= 100) S.burnout = true;
  if (n >= 1 && S.phase === 'day') stressBar();
}
// Barra aprovada (contínua, com marcas de segmento): muda no mesmo quadro do erro.
// Sinais de perigo do guia: a partir de 2/3 cada aumento faz a barra vibrar mais forte; acima de 5/6 ela pisca.
function stressBar() {
  hudSet('stress', 'width', S.stress.toFixed(1) + '%');
  hudSet('stress', 'background', S.stress < 50 ? 'var(--fin)' : S.stress < 75 ? 'var(--warn)' : 'var(--danger)');
  const w = $('stressWrap'); if (!w) return;
  if (!w._segs) { w._segs = []; for (let n = 0; n < 12; n++) { const i = document.createElement('i'); i.className = 'sseg'; i.style.setProperty('--c', n < 6 ? 'var(--fin)' : n < 9 ? 'var(--warn)' : 'var(--danger)'); w.append(i); w._segs.push(i); } }
  const v = Math.ceil(S.stress / 100 * 12 - 1e-6);
  if (v !== w._lit) w._segs.forEach((s, n) => s.classList.toggle('on', n < v));
  if (v > (w._lit || 0) && v >= 8) Motion.shake(w, v - 6);
  w._lit = v; w.classList.toggle('hot', v >= 10);
}
function blame(cause, n) { S.causes[cause] = (S.causes[cause] || 0) + n; S.careerCauses[cause] = (S.careerCauses[cause] || 0) + n; addStress(n); }
function success(base, x, y) {
  const m0 = mult();
  S.combo++;
  if (mult() > m0) { setTimeout(() => sfx('combo'), 90); Motion.punch($('mult'), 1 + mult() * .1); comboLook(); } else Motion.punch($('mult'), 1.12);
  const pts = Math.round(base * S.level * mult() * (mod().ptsMul || 1));
  S.score += pts; S.dayScore += pts; addStress(-2); sfx('ok');
  if (x !== undefined) Motion.floatText(board, '+' + pts, x, y, 'ok');
  if (S.score > P.best) P.best = S.score;
  return pts;
}
function fail(stress, msg, cause) {
  const broke = S.combo >= 5;
  S.combo = 0;
  if (broke) comboBreak(); blame(cause, stress * (mod().errMul || 1)); sfx('err');
  board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
  if (msg) flash(msg, 'var(--danger)', 20, 60 + Math.random() * 60);
}

// Visual do combo acompanha o multiplicador: ×4 em diante brilha em âmbar; ao quebrar, treme e fica vermelho um instante
function comboLook() { const m = $('combo'); if (m) m.classList.remove('broke'); }
function comboBreak() {
  const m = $('combo'); if (!m) return;
  m.classList.remove('hot'); m.classList.add('broke'); Motion.shake($('mult'), 8);
  clearTimeout(comboBreak.t); comboBreak.t = setTimeout(() => m.classList.remove('broke'), 700);
}
