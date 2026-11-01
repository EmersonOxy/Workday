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
  if (from !== U().ev.from) sfx('notify');   // recado do RH; avisos do calendário tocam o próprio som
  const env = Pixel.el(SPR2.envelope, document.body.classList.contains('mobile') ? 2 : 3); env.classList.add('env-ico'); el.append(env);
  el.insertAdjacentHTML('beforeend', `<div><small>${U().from}: ${from}</small>${text}</div>`);
  uiRoot().append(el);
  // celular em pé: notificação de celular — desce do topo, fica sobre o cabeçalho e sobe; tocar ou arrastar para cima dispensa
  if (document.body.classList.contains('mobile') && !matchMedia('(orientation: landscape) and (max-height: 560px)').matches) { phoneNotif(el); return; }
  const ent = Motion.enter(el, 'right');
  // o envelope "chacoalha" como algo vivo, depois que o cartão assenta
  const wob = async () => { for (let i = 0; i < 3 && env.isConnected; i++) { const a = Motion.play(env, [{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg) translateY(-3px)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0)' }], { duration: 300, easing: Motion.E.out, fill: 'none' }); if (!a) return; await a.finished.catch(() => {}); } };
  if (ent) ent.finished.then(wob, () => {}); else wob();
  setTimeout(() => { const a = Motion.leave(el, 'right'); if (a) a.onfinish = () => el.remove(); else el.remove(); }, 4300);
}
function phoneNotif(el) {
  el.classList.add('notif');
  const reduced = Motion.reduced.matches, out = 'translateY(calc(-100% - 24px))';
  let y = 0, gone = false, drag = null;
  const set = v => { y = v; el.style.transform = v ? `translateY(${Math.round(v)}px)` : ''; };
  const dismiss = () => { if (gone) return; gone = true; clearTimeout(tm);
    if (reduced) { el.remove(); return; }
    const a = el.animate([{ transform: `translateY(${Math.round(y)}px)` }, { transform: out }], { duration: 220, easing: 'steps(6)' }); a.onfinish = () => el.remove(); };
  if (!reduced) el.animate([{ transform: out }, { transform: 'translateY(4px)', offset: .75 }, { transform: 'none' }], { duration: 320, easing: 'steps(8)' });
  const tm = setTimeout(dismiss, 4300);
  el.addEventListener('pointerdown', e => { drag = { y0: e.clientY, moved: false }; el.setPointerCapture(e.pointerId); e.stopPropagation(); });
  el.addEventListener('pointermove', e => { if (!drag) return; const dy = Math.min(0, e.clientY - drag.y0); if (dy < -4) drag.moved = true; set(dy); });
  const up = () => { if (!drag) return; const d = drag; drag = null; if (!d.moved || y < -18) dismiss(); else set(0); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', () => { drag = null; set(0); });
}

