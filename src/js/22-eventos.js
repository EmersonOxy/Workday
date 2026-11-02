/* ================= Eventos ================= */
function startEvent() {
  const w = Object.assign({ boss: 1, shuffle: 1, freeze: 1, virus: 1 }, mod().w || {});
  const opts = Object.keys(EVENTS).filter(k => w[k] > 0
    && firstOk(k)
    && !(k === 'boss' && S.bossAlert) && !(k === 'freeze' && S.frozen) && !(k === 'virus' && S.virus) && !(k === 'shuffle' && S.shuffleT > 0));
  if (!opts.length) return;
  let r = Math.random() * opts.reduce((a, k) => a + w[k], 0), k = opts[0];
  for (const o of opts) { r -= w[o]; if (r <= 0) { k = o; break; } }
  tip(k);
  ({ boss: bossComing, shuffle: () => { S.shuffleT = 1.3; S.trays.forEach(t => t.classList.add('warn')); },
     freeze: freezePc, virus: startVirus })[k]();
}

function bossComing() {
  const el = document.createElement('div');
  el.id = 'bossAlert'; el.className = 'px';
  el.append(face('#6e3b26', '#2b2340', false, 3));
  el.insertAdjacentHTML('beforeend', `<span>${U().bossComing} ${document.body.classList.contains('touch') ? '' : '<b>Esc</b> '}<span class="cd"></span></span>`);
  el.onclick = () => { if (S.bossAlert && !S.paused) dodgeBoss(); };
  uiRoot().append(el);
  Motion.play(el, [{ transform: 'translate(-50%,-140%)' }, { transform: 'translate(-50%,10%)', offset: .7 }, { transform: 'translate(-50%,0)' }], { duration: 320, easing: Motion.E.out, fill: 'none' });
  S.bossAlert = { el, t: has('relacoes') ? 3 : 2 };
  sfx('alarm');
}
function dodgeBoss() {
  S.bossAlert.el.remove(); S.bossAlert = null;
  success(20); stat('bosses');
  S.bossAuto = 1.6; muffle(true);
  showSheet(false);
}
function doShuffle() {
  S.trays.forEach(t => t.classList.remove('warn'));
  sfx('whoosh');
  const prev = S.order.join();
  do { S.order.sort(() => Math.random() - 0.5); } while (S.order.join() === prev);
  renderTrays();
}

function freezePc() {
  const el = document.createElement('div');
  el.id = 'freeze';
  const box = document.createElement('div');
  box.className = 'px';
  box.append(sprite(SPR.hourglass, 5));
  box.insertAdjacentHTML('beforeend', `<div>${U().notResponding}</div><div style="font-size:20px">${U().shake}</div><div class="bar"><i></i></div>`);
  el.append(box);
  board.append(el);
  const need = 12 + Math.min(10, Math.max(0, S.level - 6));
  sfx('freeze');
  S.frozen = { el, rev: 0, need: has('mouse') ? Math.ceil(need / 2) : need, dir: 0, x: null };
}
document.addEventListener('pointermove', e => {
  const f = S && S.frozen;
  if (!f || S.paused || S.phase !== 'day') return;
  if (f.x === null) { f.x = e.clientX; return; }
  const dx = e.clientX - f.x;
  if (Math.abs(dx) < 6) return;
  f.x = e.clientX;
  const dir = Math.sign(dx);
  if (f.dir && dir !== f.dir) { f.rev++; sfx('key'); }
  f.dir = dir;
  f.el.querySelector('.bar i').style.width = Math.min(100, f.rev / f.need * 100) + '%';
  if (f.rev >= f.need) { f.el.remove(); S.frozen = null; sfx('unfreeze'); success(15); }
});

function startVirus() {
  S.virus = true;
  let n = 5 + Math.min(5, Math.max(0, S.level - 7));
  if (has('antivirus')) n = Math.ceil(n / 2);
  for (let i = 0; i < n; i++) setTimeout(() => S && S.phase === 'day' && spawnPopup(), i * 90);
}
function spawnPopup() {
  if (POPUPS.length >= 14) return;
  const el = document.createElement('div');
  el.className = 'popup px';
  const root = uiRoot(), rw = root === document.body ? innerWidth : root.clientWidth, rh = root === document.body ? innerHeight : root.clientHeight;
  el.style.left = rand(8, Math.max(10, rw - 250)) + 'px';
  el.style.top = rand(8, Math.max(10, rh - 140)) + 'px';
  el.innerHTML = `<div class="title"><span>${U().warning}</span><button class="x">x</button></div><div class="content"></div>`;
  const content = el.querySelector('.content');
  content.append(sprite(SPR.virus, 4));
  content.insertAdjacentHTML('beforeend', `<span>${pick(L.spam)}</span>`);
  el.querySelector('.x').onclick = e => {
    e.stopPropagation();
    if (S.paused) return;
    el.classList.replace('popup', 'popup-closing'); sfx('pop'); stat('viruses');   // sai da contagem já; a animação termina depois
    const a = Motion.play(el, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.05,.9)', offset: .3, opacity: 1 }, { transform: 'translateY(60%) scale(.2,.05)', opacity: 0 }], { duration: 240, easing: Motion.E.anticip });
    if (a) a.onfinish = () => el.remove(); else el.remove();
    if (!POPUPS.length) { S.virus = false; success(20); }
  };
  content.onclick = () => { if (!S.paused) { sfx('err'); spawnPopup(); } };
  root.append(el);
  Motion.play(el, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: Motion.E.out, fill: 'none' });
  sfx('glitch');
}

function startVideo() {
  const win = document.createElement('div');
  win.id = 'video'; win.className = 'px';
  win.innerHTML = `<div class="title"><span>${U().meeting}</span><span>●</span></div><div class="cam"><span class="rec">REC</span></div>`;
  const hair = pick(['#6e3b26', '#c98a2e', '#2a1f2d', '#a24a33']), shirt = pick(['#44609f', '#2f8a45', '#7656a8', '#c25f3b']);
  const fs = document.body.classList.contains('mobile') ? 4 : innerWidth <= 760 ? 5 : 7;
  const a = face(hair, shirt, false, fs), b = face(hair, shirt, true, fs);
  b.style.display = 'none';
  win.querySelector('.cam').append(a, b);
  const lane = document.createElement('div');
  lane.id = 'lane';
  uiRoot().append(lane, win);
  Motion.enter(win, 'up');
  S.video = { win, lane, faces: [a, b], mouth: 0, mouthT: 0, left: 7 + Math.min(6, Math.max(0, S.level - 8)), next: 0.4, bubbles: [] };
}
function endVideo() { S.video.win.remove(); S.video.lane.remove(); S.video = null; success(25); stat('videos'); }

