/* ================= Pontuação ================= */
function mult() { return Math.min(BAL.multCap + (has('meta') ? 1 : 0), 1 + Math.floor(S.combo / BAL.comboStep)); }
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
// Barra de estresse em duas camadas: a clara (#stressHit) mostra o valor novo no mesmo quadro;
// a colorida (#stress) segue com um pequeno atraso e desliza até lá, deixando visível quanto foi recebido.
// Ao aliviar, as duas descem juntas. O valor lógico (S.stress) nunca espera a animação.
const SB = { main: 0, hitAt: 0, last: 0 };
function stressBar() {
  const now = performance.now(), dt = Math.min(.1, (now - (SB.last || now)) / 1000); SB.last = now;
  const v = S.stress;
  if (v > SB.main + .05 && SB.prev !== undefined && v > SB.prev) SB.hitAt = now;
  SB.prev = v;
  if (v < SB.main) SB.main = v;
  else if (now - SB.hitAt > 180) SB.main += (v - SB.main) * Math.min(1, dt * 7);
  if (Motion.reduced.matches) SB.main = v;
  hudSet('stressHit', 'width', v.toFixed(1) + '%');
  hudSet('stress', 'width', SB.main.toFixed(1) + '%');
  hudSet('stress', 'background', v < 50 ? 'var(--fin)' : v < 75 ? 'var(--warn)' : 'var(--danger)');
  const w = $('stressWrap'); if (!w) return;
  const lvl = Math.ceil(v / 100 * 12 - 1e-6);
  if (lvl > (w._lit || 0) && lvl >= 8) Motion.shake(w, Math.min(6, lvl - 6));
  w._lit = lvl; w.classList.toggle('crit', v >= 85);
}
function blame(cause, n) { S.causes[cause] = (S.causes[cause] || 0) + n; S.careerCauses[cause] = (S.careerCauses[cause] || 0) + n; addStress(n); }
function success(base, x, y) {
  const m0 = mult();
  S.combo++;
  if (mult() > m0) { setTimeout(() => sfx('combo'), 90); Motion.punch($('mult'), 1 + mult() * .1); comboLook(); } else Motion.punch($('mult'), 1.12);
  const pts = Math.round(base * BAL.levelPts(S.level) * mult() * (mod().ptsMul || 1));
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
