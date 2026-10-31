/* ================= Tabuleiro ================= */
board.addEventListener('pointerdown', e => {
  if (!S || S.phase !== 'day' || S.paused || S.frozen || !S.file || e.target.closest('.coffee')) return;
  if (e.target.closest('.file')) { if (S.file.kind === 'dead') deleteFile(); else S.dropNow = true; return; }
  const lane = Math.floor((e.clientX - board.getBoundingClientRect().left) / laneWidth());
  S.file.lane = Math.max(0, Math.min(SECTORS.length - 1, lane)); placeFile();
});
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
  el.append(sprite(SPR.mail, 3));
  el.insertAdjacentHTML('beforeend', `<div><small>${U().from}: ${from}</small>${text}</div>`);
  uiRoot().append(el);
  Motion.enter(el, 'right');
  setTimeout(() => { const a = Motion.leave(el, 'right'); if (a) a.onfinish = () => el.remove(); else el.remove(); }, 4300);
}

