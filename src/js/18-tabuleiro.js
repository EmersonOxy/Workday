/* ================= Tabuleiro ================= */
// Dois jeitos de mover o arquivo, que convivem:
//  - tocar/clicar na coluna do setor (ou no próprio arquivo para soltar);
//  - deslizar: arrastar para os lados leva o arquivo coluna a coluna junto com o dedo,
//    um peteleco curto anda uma coluna, e deslizar para baixo solta o arquivo.
const SWIPE = { on: false };
const fileOk = () => S && S.phase === 'day' && !S.paused && !S.frozen && S.file;
function setLane(lane, dir) {
  lane = Math.max(0, Math.min(SECTORS.length - 1, lane));
  if (lane === S.file.lane) return;
  S.file.lane = lane; placeFile(); sfx('key');
  // inclina para o lado do movimento e volta (peso do papel)
  Motion.play(S.file.el, [{ rotate: '0deg' }, { rotate: (dir > 0 ? 7 : -7) + 'deg', offset: .35 }, { rotate: '0deg' }], { duration: Motion.T.med, easing: Motion.E.out, fill: 'none' });
}
board.addEventListener('pointerdown', e => {
  if (!fileOk() || e.target.closest('.coffee')) return;
  Object.assign(SWIPE, { on: true, id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), lane: S.file.lane, moved: false, onFile: !!e.target.closest('.file') });
  try { board.setPointerCapture(e.pointerId); } catch (err) {}
});
board.addEventListener('pointermove', e => {
  if (!SWIPE.on || e.pointerId !== SWIPE.id || !fileOk()) return;
  const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y;
  if (!SWIPE.moved && Math.hypot(dx, dy) < 12) return;
  SWIPE.moved = true;
  if (Math.abs(dx) > Math.abs(dy) * .8) {
    S.file.el.classList.add('dragging');
    setLane(SWIPE.lane + Math.round(dx / (laneWidth() * .9)), dx);
  }
});
const endSwipe = e => {
  if (!SWIPE.on || e.pointerId !== SWIPE.id) return;
  SWIPE.on = false;
  if (!fileOk()) return;
  S.file.el.classList.remove('dragging');
  const dx = e.clientX - SWIPE.x, dy = e.clientY - SWIPE.y, dt = performance.now() - SWIPE.t;
  if (!SWIPE.moved) {                                                      // toque simples
    if (SWIPE.onFile) { if (S.file.kind === 'dead') deleteFile(); else S.dropNow = true; return; }
    setLane(Math.floor((e.clientX - board.getBoundingClientRect().left) / laneWidth()), e.clientX - SWIPE.x || 1);
    return;
  }
  if (dy > 40 && dy > Math.abs(dx) * 1.2) { if (S.file.kind === 'dead') deleteFile(); else S.dropNow = true; return; }   // deslizar para baixo
  if (S.file.lane === SWIPE.lane && Math.abs(dx) >= 24 && dt < 350) setLane(SWIPE.lane + Math.sign(dx), dx);           // peteleco
};
board.addEventListener('pointerup', endSwipe);
board.addEventListener('pointercancel', e => { if (e.pointerId === SWIPE.id) { SWIPE.on = false; if (S && S.file) S.file.el.classList.remove('dragging'); } });
function buildBoard() {
  board.innerHTML = '';
  const w = 100 / SECTORS.length;
  S.trays = SECTORS.map((_, i) => {
    const lane = document.createElement('div');
    lane.className = 'lane'; lane.style.left = (i * w) + '%'; lane.style.width = w + '%';
    const tray = document.createElement('div');
    tray.className = 'tray'; tray.style.left = (i * w) + '%'; tray.style.width = w + '%';
    board.append(lane, tray);
    return tray;
  });
  renderTrays();
}
function renderTrays() {
  S.trays.forEach((t, i) => {
    const s = SECTORS[S.order[i]];
    t.style.background = s.color; t.textContent = '';
    const g = Pixel.el(SPR2[GLYPH[s.id]], 2); g.classList.add('glyph'); t.append(g);
    t.insertAdjacentHTML('beforeend', `<span>${sectorName(s.id)}</span>`);
  });
}

function tip(key) { if (!P.seen.includes(key) && !S.tipQ.includes(key)) S.tipQ.push(key); }
function showNextTip(dt) {
  if (S.tipT > 0) { S.tipT -= dt; if (S.tipT <= 0) { const t = $('tip'); if (t) t.remove(); } return; }
  const key = S.tipQ.shift();
  if (!key) return;
  P.seen.push(key); persist();
  const el = document.createElement('div');
  el.id = 'tip'; el.className = 'px';
  el.innerHTML = `<span>${(document.body.classList.contains('touch') && L.tipsTouch[key]) || L.tips[key]}</span>`;
  board.append(el);
  S.tipT = 4;
}

function toast(from, text) {
  const old = $('toast'); if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'toast'; el.className = 'px';
  el.append(sprite(SPR.mail, document.body.classList.contains('mobile') ? 2 : 3));
  el.insertAdjacentHTML('beforeend', `<div><small>${U().from}: ${from}</small>${text}</div>`);
  uiRoot().append(el);
  Motion.enter(el, 'right');
  setTimeout(() => { const a = Motion.leave(el, 'right'); if (a) a.onfinish = () => el.remove(); else el.remove(); }, 4300);
}

