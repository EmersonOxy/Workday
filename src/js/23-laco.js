/* ================= Laço ================= */
function loop(now) {
  if (!S || !S.running) return;
  const dt = Math.min(0.05, (now - S.last) / 1000);
  S.last = now;
  if (S.bossAuto > 0) {
    S.bossAuto -= dt;
    if (S.bossAuto <= 0) { hideSheet(); muffle(false); }
  } else if (S.phase === 'day' && !S.paused) update(dt);
  requestAnimationFrame(loop);
}

function clockText() {
  const m = Math.min(540, Math.floor(((S && S.dayT) || 0) / DAY_SECONDS * 540)) + 540;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60 / 10) * 10).padStart(2, '0');
}

function update(dt) {
  S.dayT += dt;
  if (S.dayT >= DAY_SECONDS) { endDay(); return; }
  S.level = 1 + (S.day - 1) * 2 + Math.floor(S.dayT / LEVEL_SECONDS);
  if (S.level > S.lastLevel) { S.lastLevel = S.level; toast(...pick(L.memos)); }
  const sdt = dt * slow(), u = U();
  if (S.slowT > 0) S.slowT -= dt;
  board.classList.toggle('slow', S.slowT > 0);
  showNextTip(dt);

  const f = S.file;
  const fall = (55 + S.level * 14) * (f.kind === 'urgent' ? 1.6 : 1) * ((S.fast || S.dropNow) && !S.frozen ? 6 : 1) * (has('bandeja') ? 0.85 : 1);
  f.y += fall * sdt;
  if (f.y >= board.clientHeight - S.trays[0].offsetHeight - f.el.offsetHeight) landFile(); else placeFile();

  S.nextTask -= sdt * (mod().taskRate || 1);
  if (S.nextTask <= 0) { spawnTask(); S.nextTask = Math.max(1.4, 6.5 - S.level * 0.55) * rand(0.7, 1.3); }
  S.nextEvent -= sdt;
  if (S.nextEvent <= 0) { startEvent(); S.nextEvent = Math.max(7, 20 - S.level) * rand(0.7, 1.3); }

  if (S.level >= 2) {
    S.nextCoffee -= dt;
    if (S.nextCoffee <= 0 && !S.coffee) {
      tip('coffee');
      const el = document.createElement('div');
      el.className = 'coffee';
      el.append(sprite(SPR.coffee, 4));
      el.style.left = rand(10, board.clientWidth - 60) + 'px'; el.style.top = rand(60, board.clientHeight - 160) + 'px';
      el.onclick = () => { if (S.paused) return; S.slowT = 5; el.remove(); S.coffee = null; sfx('coffee'); flash(u.coffee, 'var(--warn)', parseFloat(el.style.left), parseFloat(el.style.top)); };
      board.append(el);
      S.coffee = { el, life: 6 };
      S.nextCoffee = rand(25, 40) * (has('cafeteira') ? 0.5 : 1);
    }
  }
  if (S.coffee && (S.coffee.life -= dt) <= 0) { S.coffee.el.remove(); S.coffee = null; }

  for (const t of [...S.tasks]) {
    if (t.dead) continue;
    if (t.type === 'call') {
      if (t.holding) t.held += dt; else t.life += sdt;
      t.el.querySelector('.fill').style.width = Math.min(100, t.held / t.need * 100) + '%';
      if (t.held >= t.need) { completeTask(t, 30); stat('calls'); continue; }
    } else t.life += sdt;
    const left = Math.max(0, 1 - t.life / t.ttl);
    t.el.querySelector('.timer').style.width = left * 100 + '%';
    t.el.classList.toggle('soon', left <= .5 && left > .25);
    if (left <= .25 && !t.urg) { t.el.classList.add('late'); t.urg = Motion.urgent(t.el); }
    if (t.chip) { t.chip.style.setProperty('--p', left.toFixed(3)); t.chip.classList.toggle('soon', left <= .5 && left > .25); t.chip.classList.toggle('late', left <= .25); }
    if (t.life >= t.ttl) failTask(t, 12, t.type === 'video' ? u.fMeeting : u.fDeadline, t.type === 'video' ? 'video' : 'deadline');
  }

  if (S.bossAlert) {
    S.bossAlert.t -= dt;
    S.bossAlert.el.querySelector('.cd').textContent = Math.max(0, S.bossAlert.t).toFixed(1);
    if (S.bossAlert.t <= 0) { S.bossAlert.el.remove(); S.bossAlert = null; fail(30, u.fBoss, 'boss'); }
  }
  if (S.shuffleT > 0 && (S.shuffleT -= dt) <= 0) doShuffle();

  if (S.frozen) blame('freeze', 2.5 * dt);
  const popups = POPUPS.length;
  if (popups) blame('virus', popups * 0.7 * dt);
  if (mod().drift) blame('ar', mod().drift * dt);

  const v = S.video;
  if (v) {
    if ((v.mouthT += dt) > 0.18) { v.mouthT = 0; v.mouth ^= 1; v.faces[0].style.display = v.mouth ? 'none' : ''; v.faces[1].style.display = v.mouth ? '' : 'none'; }
    v.next -= sdt;
    if (v.left > 0 && v.next <= 0) {
      v.left--; v.next = rand(0.9, 1.6) * Math.max(0.6, 1 - Math.max(0, S.level - 8) * 0.05);
      const el = document.createElement('div');
      el.className = 'bubble px';
      el.textContent = pick(L.bubbles);
      el.style.left = rand(4, 60) + 'px';
      const bub = { el, y: 0 };
      el.onpointerdown = () => {
        if (S.paused || bub.done) return;
        bub.done = true; el.classList.add('popped'); sfx('pop'); success(8);
        setTimeout(() => el.remove(), 200);
      };
      v.lane.append(el); v.bubbles.push(bub);
    }
    for (const b of v.bubbles) {
      if (b.done) continue;
      b.y += (60 + S.level * 3) * sdt;
      b.el.style.bottom = b.y + 'px';
      if (b.y > v.lane.clientHeight - 30) { b.done = true; b.el.remove(); fail(5, u.fIgnored, 'video'); }
    }
    if (v.left === 0 && v.bubbles.every(b => b.done)) endVideo();
  }

  addStress(-0.8 * dt * (has('terapia') ? 2 : 1));
  musicStress(S.stress);
  if (S.stress >= 80 && (S.heartT = (S.heartT || 0) - dt) <= 0) { S.heartT = 1.1 - (S.stress - 80) / 40; sfx('heart'); }
  hud();
  if (S.burnout) { gameOver(); return; }
  if (rankIdx(S.score) > S.rankIdx) promote();
}

const HUD_LAST = {};
function hudSet(id, prop, value) {
  if (HUD_LAST[id + prop] === value) return;
  HUD_LAST[id + prop] = value;
  const el = $(id);
  if (prop === 'text') el.textContent = value; else el.style[prop] = value;
}
function hudFlag(id, cls, on) {
  const k = id + '.' + cls;
  if (HUD_LAST[k] === on) return;
  HUD_LAST[k] = on;
  $(id).classList.toggle(cls, on);
}
function hud() {
  hudFlag('pad', 'hidden', !document.body.classList.contains('mobile') || !S || S.phase !== 'day');
  if (S && S.phase === 'day') {
    hudFlag('padBoss', 'show', !!S.bossAlert);
    hudFlag('padDel', 'show', !!S.file && S.file.kind === 'dead');
  }
  hudSet('wallet', 'text', money(P.wallet));
  if (!S) {
    hudSet('clock', 'text', '09:00'); hudSet('day', 'text', '-'); hudSet('score', 'text', '0');
    hudSet('mult', 'text', '×1'); hudSet('rank', 'text', L.ranks[0]); hudSet('stress', 'width', '0');
    return;
  }
  hudSet('clock', 'text', clockText());
  hudSet('day', 'text', String(S.day));
  hudSet('score', 'text', fmt(S.score));
  hudSet('mult', 'text', '×' + mult() + (S.combo ? ` (${S.combo})` : ''));
  hudSet('rank', 'text', L.ranks[S.rankIdx]);
  hudSet('stress', 'width', S.stress.toFixed(1) + '%');
  hudSet('stress', 'background', S.stress < 50 ? 'var(--fin)' : S.stress < 75 ? 'var(--warn)' : 'var(--danger)');
  hudFlag('vignette', 'on', S.phase === 'day' && S.stress >= 80);
}

