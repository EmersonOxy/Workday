/* ================= Pontuação ================= */
function mult() { return Math.min(has('meta') ? 6 : 5, 1 + Math.floor(S.combo / 5)); }
function flash(text, color, x, y) {
  const el = document.createElement('div');
  el.className = 'flash'; el.textContent = text; el.style.color = color;
  el.style.left = Math.max(4, Math.min(x, board.clientWidth - 160)) + 'px'; el.style.top = y + 'px';
  board.append(el);
  setTimeout(() => el.remove(), 800);
}
function addStress(n) { S.stress = Math.max(0, Math.min(100, S.stress + n)); if (n > 0 && S.stress >= 100) S.burnout = true; }
function blame(cause, n) { S.causes[cause] = (S.causes[cause] || 0) + n; S.careerCauses[cause] = (S.careerCauses[cause] || 0) + n; addStress(n); }
function success(base, x, y) {
  const m0 = mult();
  S.combo++;
  if (mult() > m0) { setTimeout(() => sfx('combo'), 90); Motion.punch($('mult'), 1.45); }
  const pts = Math.round(base * S.level * mult() * (mod().ptsMul || 1));
  S.score += pts; S.dayScore += pts; addStress(-2); sfx('ok');
  if (x !== undefined) Motion.floatText(board, '+' + pts, x, y, 'ok');
  if (S.score > P.best) P.best = S.score;
  return pts;
}
function fail(stress, msg, cause) {
  if (S.combo >= 5) Motion.shake($('mult'), 6);
  S.combo = 0; blame(cause, stress * (mod().errMul || 1)); sfx('err');
  Motion.shake($('stressWrap'), 3 + Math.min(6, stress / 4));
  board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
  if (msg) flash(msg, 'var(--danger)', 20, 60 + Math.random() * 60);
}

