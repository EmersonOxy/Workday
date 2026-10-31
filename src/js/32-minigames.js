/* ================= Minigames (compartilhados pela pausa e pelo arcade secreto) ================= */
// Cada minigame recebe um "host" (div), desenha num canvas de baixa resolução ampliado por escala inteira,
// e chama done({ score, grade: 'good' | 'ok' | 'bad' }) ao terminar. Não toca em pontos, dinheiro ou cargo.
const MG = { W: 128, H: 160 };
function mgStage(host, title, help) {
  host.innerHTML = `<div class="mg-head"><b>${title}</b><span class="mg-hud"></span></div><div class="mg-view"><canvas width="${MG.W}" height="${MG.H}"></canvas><div class="mg-pop"></div></div><p class="mg-help">${help}</p>`;
  const cv = host.querySelector('canvas');
  pxFit(cv, () => { const v = host.querySelector('.mg-view'); return [v.clientWidth || 256, v.clientHeight || 320]; });
  requestAnimationFrame(() => pxRefit(cv));
  return { cv, x: cv.getContext('2d'), hud: host.querySelector('.mg-hud'), pop: host.querySelector('.mg-pop') };
}
function mgPop(stage, text, cls) {
  const p = document.createElement('span'); p.className = 'mg-msg ' + (cls || ''); p.textContent = text; stage.pop.replaceChildren(p);
  Motion.play(p, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .5 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: Motion.E.out });
}
// Pausa ao trocar de aba: o tempo do minigame congela junto
function mgClock(useAudio) {
  const ac = useAudio ? A.ctx : null;
  let acc = 0, hidAt = null;
  const onVis = () => {
    if (document.hidden) { if (ac) ac.suspend(); else hidAt = performance.now(); }
    else { if (ac) ac.resume(); else if (hidAt !== null) { acc += performance.now() - hidAt; hidAt = null; } }
  };
  document.addEventListener('visibilitychange', onVis);
  return {
    // relógio do áudio menos a latência de saída: o que se ouve e o que se julga ficam no mesmo instante
    now: () => ac ? ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) : (performance.now() - acc) / 1000,
    stop: () => { document.removeEventListener('visibilitychange', onVis); if (ac && ac.state === 'suspended') ac.resume(); },
  };
}
function mgParticles(list, x, y, col, n = 8) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 20 + Math.random() * 50; list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, t: .35 + Math.random() * .25, col }); } }
function mgDrawParticles(x, list, dt) {
  for (const p of list) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; x.fillStyle = p.col; x.fillRect(p.x | 0, p.y | 0, p.t > .2 ? 2 : 1, p.t > .2 ? 2 : 1); }
  for (let i = list.length - 1; i >= 0; i--) if (list[i].t <= 0) list.splice(i, 1);
}
function runMinigame(kind, host, done, opts) { (kind === 'rhythm' ? mgRhythm : mgShooter)(host, done, opts); }
function mgResult(stage, host, rows, grade, done) {
  const u = U(), box = document.createElement('div'); box.className = 'mg-end';
  box.innerHTML = `<b>${u.mgEnd}</b>${rows.map(([k, v]) => `<span>${k} <i>${v}</i></span>`).join('')}`;
  host.querySelector('.mg-view').append(box); Motion.dropIn(box); sfx(grade === 'bad' ? 'err' : 'level');
  setTimeout(() => done(grade), 2200);
}

/* ---------- Batida de Ponto: ritmo em 4 colunas ---------- */
// Músicas originais descritas como dados: andamento, acordes (MIDI) e frases de um compasso em colcheias
// [passo 0-7, coluna, duração em colcheias se for sustentada]. A melodia só soa quando o jogador acerta a nota.
// Um agendador gera os compassos um pouco à frente do relógio do áudio: notas, bateria e baixo nascem juntos.
const RHY = { LEAD: 1.35, PERFECT: .055, GOOD: .12, AHEAD: 2.5,
  SONGS: [
    { bpm: 112, bars: 14, roots: [45, 41, 48, 43], wave: 'triangle', drums: 'soft',
      pats: [[[0, 0], [4, 2]], [[0, 1], [2, 2], [4, 3], [6, 2]], [[0, 0], [2, 1], [4, 2, 3]], [[0, 3], [2, 2], [4, 1], [6, 0]]] },
    { bpm: 128, bars: 16, roots: [48, 44, 51, 46], wave: 'square', drums: 'four',
      pats: [[[0, 0], [2, 1], [4, 2], [6, 3]], [[0, 3], [2, 2], [4, 1], [5, 1], [6, 0]], [[0, 0], [0, 3], [4, 1, 3], [7, 2]], [[0, 2], [1, 1], [2, 0], [4, 3], [6, 3]],
             [[0, 1], [0, 2], [2, 0], [3, 3], [4, 1, 2], [7, 3]], [[0, 0], [1, 1], [2, 2], [3, 3], [4, 2], [5, 1], [6, 0, 2]]] },
    { bpm: 146, bars: 18, roots: [50, 46, 53, 48], wave: 'sawtooth', drums: 'break',
      pats: [[[0, 0], [1, 1], [3, 2], [4, 3], [6, 1]], [[0, 3], [1, 2], [2, 3], [4, 0], [5, 1], [6, 0]], [[0, 0], [0, 2], [2, 1], [2, 3], [4, 0, 2], [6, 3]],
             [[0, 1], [1, 2], [2, 1], [3, 2], [4, 0], [4, 3], [6, 1, 2]], [[0, 2], [2, 0], [3, 1], [4, 2], [5, 3], [6, 2], [7, 1]]] },
  ] };
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
// Gera o compasso b: dos padrões da música, ou aleatório e cada vez mais denso no modo infinito
function rhythmBar(song, b, inf) {
  const n = song.pats.length;
  if (!inf) { const p = b < 2 ? song.pats[0] : song.pats[(b - 2) % (n - 1) + 1]; return b >= song.bars / 2 && b % 2 ? p.map(([s, l, h]) => [s, 3 - l, h]) : p; }
  const all = RHY.SONGS.flatMap(x => x.pats), lvl = Math.min(all.length - 1, (b / 4 | 0) + 2), p = all[Math.random() * lvl | 0];
  return Math.random() < .5 ? p.map(([s, l, h]) => [s, 3 - l, h]) : p;
}
function mgRhythm(host, done, opts = {}) {
  const u = U(), touch = document.body.classList.contains('touch'), inf = opts.song === 'inf';
  const song = inf ? { ...RHY.SONGS[1], bars: Infinity } : RHY.SONGS[opts.song || 0];
  const st = mgStage(host, `${u.mgRhythm} · ${inf ? u.mgInfinite : u.songs[opts.song || 0]}`, touch ? u.mgRhythmHelpT : u.mgRhythmHelp), x = st.x, P = WD_PAL;
  const LX = [12, 38, 64, 90], LW = 24, HIT = 138, KEYS = { KeyD: 0, KeyF: 1, KeyJ: 2, KeyK: 3 };
  const COL = [WD_SECTOR_RAMP.fin, WD_SECTOR_RAMP.rh, WD_SECTOR_RAMP.jur, WD_SECTOR_RAMP.ti];
  const useAudio = soundOn && A.ctx && A.ctx.state === 'running', clock = mgClock(useAudio);
  const lat = useAudio ? (A.ctx.outputLatency || A.ctx.baseLatency || 0) : 0, start = clock.now() + 2.2;
  const notes = [], held = [false, false, false, false], flash = [0, 0, 0, 0], parts = [];
  let score = 0, combo = 0, best = 0, perfect = 0, good = 0, miss = 0, over = false, lastT = clock.now();
  let nextBar = 0, barT = 0, bpm = song.bpm, life = 10;
  const songT = () => clock.now() - start;
  // agenda bateria e baixo do compasso no relógio do áudio (o que se ouve = o que se julga)
  const scheduleBar = (b, t0, spb) => {
    if (!useAudio) return;
    const c = A.ctx, at = t => start + lat + t - c.currentTime, root = song.roots[b % 4];
    for (let q = 0; q < 4; q++) {
      const t = t0 + q * spb;
      if (q % 2 === 0 || song.drums === 'four') tone({ type: 'sine', f: 150, f2: 45, d: .16, v: .5, at: at(t) });
      if (q % 2 === 1) noise({ f: song.drums === 'soft' ? 1200 : 1800, d: .1, v: song.drums === 'soft' ? .14 : .26, at: at(t) });
      if (song.drums === 'break' && q === 3) noise({ f: 1800, d: .06, v: .2, at: at(t + spb * .75) });
      noise({ f: 7000, d: .03, v: .08, at: at(t + spb / 2) });
      tone({ type: 'triangle', f: midiHz(root - 12), d: spb * .45, v: .2, at: at(t) });
      tone({ type: 'triangle', f: midiHz(root - 12 + (q === 3 ? 7 : 0)), d: spb * .3, v: .12, at: at(t + spb / 2) });
    }
  };
  const genAhead = () => {
    while (nextBar < song.bars && barT < songT() + RHY.AHEAD + RHY.LEAD) {
      const spb = 60 / bpm, e = spb / 2, b = nextBar;
      for (const [s, lane, hold] of rhythmBar(song, b, inf)) { const t = barT + s * e; notes.push({ t, lane, end: hold ? t + hold * e : null, root: song.roots[b % 4] }); }
      scheduleBar(b, barT, spb);
      barT += 4 * spb; nextBar++;
      if (inf && nextBar % 8 === 0) bpm = Math.min(180, bpm + 6);     // infinito: acelera a cada 8 compassos
    }
  };
  // a nota acertada toca seu tom (grau do acorde pela coluna); errar fica em silêncio
  const play = (n, dur) => { if (useAudio) tone({ type: song.wave, f: midiHz(n.root + 24 + [0, 3, 7, 12][n.lane]), d: dur, v: .09, lp: 2600 }); };
  const judge = (n, d) => {
    const a = Math.abs(d);
    if (a <= RHY.PERFECT) { perfect++; score += 300 + combo * 5; mgPop(st, u.mgPerfect, 'ok'); life = Math.min(10, life + .5); }
    else { good++; score += 120 + combo * 2; mgPop(st, u.mgGood); }
    combo++; best = Math.max(best, combo); n.hit = true; if (n.end) n.holding = true; else n.done = true;
    play(n, n.end ? Math.max(.12, n.end - songT()) : .14);
    mgParticles(parts, LX[n.lane] + LW / 2, HIT, COL[n.lane].F, a <= RHY.PERFECT ? 12 : 6);
  };
  const missNote = n => { n.done = true; miss++; combo = 0; life--; mgPop(st, u.mgMiss, 'bad'); };
  const press = lane => {
    if (over) return;
    held[lane] = true; flash[lane] = .12;
    const t = songT(), n = notes.find(k => !k.hit && !k.done && k.lane === lane && Math.abs(k.t - t) <= RHY.GOOD);
    if (n) judge(n, n.t - t);
  };
  const release = lane => {
    held[lane] = false;
    const n = notes.find(k => k.holding && k.lane === lane);
    if (n) { n.holding = false; n.done = true; if (songT() < n.end - RHY.GOOD) { combo = 0; mgPop(st, u.mgMiss, 'bad'); } else { score += 100; mgParticles(parts, LX[lane] + LW / 2, HIT, P.y, 8); } }
  };
  const kd = e => { if (e.code in KEYS && !e.repeat) { e.preventDefault(); e.stopPropagation(); press(KEYS[e.code]); } };
  const ku = e => { if (e.code in KEYS) { e.stopPropagation(); release(KEYS[e.code]); } };
  addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
  const ptrLane = new Map(), laneAt = e => { const r = st.cv.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * MG.W; return Math.max(0, Math.min(3, Math.floor((vx - LX[0] + 1) / 26))); };
  st.cv.onpointerdown = e => { e.preventDefault(); st.cv.setPointerCapture(e.pointerId); const l = laneAt(e); ptrLane.set(e.pointerId, l); press(l); };
  st.cv.onpointerup = st.cv.onpointercancel = e => { const l = ptrLane.get(e.pointerId); if (l !== undefined) { ptrLane.delete(e.pointerId); release(l); } };
  const frame = () => {
    if (!st.cv.isConnected) return finish(true);
    genAhead();
    const now = clock.now(), dt = Math.min(.05, Math.max(0, now - lastT)), t = songT(); lastT = now;
    for (const n of notes) {
      if (!n.hit && !n.done && t - n.t > RHY.GOOD) missNote(n);
      if (n.holding && t >= n.end) { n.holding = false; n.done = true; score += 100; mgParticles(parts, LX[n.lane] + LW / 2, HIT, P.y, 10); }
    }
    while (notes.length && notes[0].done && notes[0].t < t - 2) notes.shift();
    x.fillStyle = P.X; x.fillRect(0, 0, MG.W, MG.H);
    for (let i = 0; i < 4; i++) { x.fillStyle = held[i] ? P.x : P.J; x.fillRect(LX[i], 0, LW, MG.H); for (let j = (t * 40 | 0) % 8; j < MG.H; j += 8) { x.fillStyle = 'rgba(255,255,255,.04)'; x.fillRect(LX[i], j, LW, 1); } }
    for (const n of notes) {
      if (n.done && !n.holding) continue;
      const y = HIT - (n.t - t) / RHY.LEAD * HIT, c = COL[n.lane];
      if (y < -10 && !n.holding) continue;
      if (n.end) { const ye = Math.max(0, HIT - (n.end - t) / RHY.LEAD * HIT), yb = n.holding ? HIT : y; if (yb > ye) { x.fillStyle = P.k; x.fillRect(LX[n.lane] + 8, ye, 8, yb - ye); x.fillStyle = c.f; x.fillRect(LX[n.lane] + 9, ye, 6, yb - ye); } }
      if (!n.holding) { const ny = y - 4 | 0; x.fillStyle = P.k; x.fillRect(LX[n.lane] + 1, ny - 1, LW - 2, 9); x.fillStyle = c.F; x.fillRect(LX[n.lane] + 2, ny, LW - 4, 7); x.fillStyle = c.f; x.fillRect(LX[n.lane] + 2, ny, LW - 4, 2); x.fillStyle = c[9]; x.fillRect(LX[n.lane] + 2, ny + 6, LW - 4, 1); x.fillStyle = P.W; x.fillRect(LX[n.lane] + 10, ny + 3, 4, 1); }
    }
    for (let i = 0; i < 4; i++) {
      flash[i] = Math.max(0, flash[i] - dt); const c = COL[i];
      x.fillStyle = P.k; x.fillRect(LX[i], HIT - 5, LW, 11); x.fillStyle = flash[i] > 0 || held[i] ? c.f : c[9]; x.fillRect(LX[i] + 1, HIT - 4, LW - 2, 9);
      x.fillStyle = c.F; x.fillRect(LX[i] + 3, HIT - 2, LW - 6, 5);
      if (!touch) Pixel.text(x, 'DFJK'[i], LX[i] + 11, HIT + 9, P.W);
    }
    x.fillStyle = P.W; x.fillRect(LX[0], HIT, LX[3] + LW - LX[0], 1);
    if (inf) { x.fillStyle = P.k; x.fillRect(4, 4, 4, 82); x.fillStyle = life > 3 ? P.F : P.R; x.fillRect(5, 5 + (10 - life) * 8, 2, life * 8); }   // energia do modo infinito
    mgDrawParticles(x, parts, dt);
    if (t < 0) Pixel.text(x, String(Math.ceil(-t)), 62, 70, P.y);
    st.hud.textContent = `${u.mgScore} ${fmt(score)} · ${u.mgCombo} ${combo}`;
    if (inf ? life <= 0 : (nextBar >= song.bars && !notes.some(n => !n.done) && t > barT)) return finish(false);
    requestAnimationFrame(frame);
  };
  const finish = aborted => {
    if (over) return; over = true;
    removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); clock.stop();
    if (aborted) return;
    const total = perfect + good + miss || 1, acc = (perfect + good * .6) / total, grade = inf ? (score >= 15000 ? 'good' : score >= 5000 ? 'ok' : 'bad') : acc >= .85 ? 'good' : acc >= .6 ? 'ok' : 'bad';
    mgResult(st, host, [[u.mgScore, fmt(score)], [u.mgBest, best], [u.mgAcc, Math.round(acc * 100) + '%']], grade, g => done({ score, grade: g, acc }));
  };
  mgPop(st, u.mgReady);
  genAhead();
  host._rhythm = { notes, start, clock, press, release, songT, get genAhead() { return genAhead; } };   // usado pelos testes automatizados
  requestAnimationFrame(frame);
}

/* ---------- Exterminador de Pendências: nave vertical ---------- */
const SHIP = { rows: ['.....k.....', '....kWk....', '....kLk....', '...kWLWk...', '..kWWLWWk..', '.kWLWWWLWk.', 'kWLLkWkLLWk', 'kkk.kRk.kkk', '....kQk....'],
  // pendências com sprite próprio: documento, planilha, e-mail, post-it
  foes: {
    doc: ['kkkkkkkk.', 'kWWWWWWkk', 'kWppppWWk', 'kWWWWWWWk', 'kWpppppWk', 'kWWWWWWWk', 'kWppppWWk', 'kkkkkkkkk'],
    sheet: ['kkkkkkkkk', 'kFFFFFFFk', 'kWfWfWfWk', 'kffffffFk', 'kWfWfWfWk', 'kffffffFk', 'kWfWfWfWk', 'kkkkkkkkk'],
    mail: ['kkkkkkkkk', 'kpWWWWWpk', 'kWpWWWpWk', 'kWWpRpWWk', 'kWWWqWWWk', 'kwwwwwwwk', 'kkkkkkkkk'],
    note: ['kkkkkkkk', 'kyyyyyyk', 'kYZZZYYk', 'kYYYYYYk', 'kYZZYYzk', 'kYYYYzzk', 'kkkkkkk.'],
  } };
function mgShooter(host, done) {
  const u = U(), touch = document.body.classList.contains('touch');
  const st = mgStage(host, u.mgShooter, touch ? u.mgShooterHelpT : u.mgShooterHelp), x = st.x, P = WD_PAL;
  const ship = { x: 58, y: 146, vx: 0, inv: 0, cd: 0 }, foes = [], shots = [], parts = [], keys = {};
  const DUR = 40;
  let t = -1.6, score = 0, combo = 0, best = 0, lives = 3, kills = 0, spawnT = 0, over = false, last = performance.now(), hidden = false, target = null;
  const types = Object.keys(SHIP.foes);
  const spawn = () => {
    const k = t > 22 ? pick(types) : t > 10 ? pick(['doc', 'mail', 'sheet']) : pick(['doc', 'mail']), spr = SHIP.foes[k];
    foes.push({ k, x: 4 + Math.random() * (MG.W - 16), y: -10, hp: k === 'sheet' ? 2 : 1, vy: 14 + t * .7 + Math.random() * 8, ph: Math.random() * 6, w: spr[0].length, h: spr.length, hit: 0 });
  };
  const kd = e => { if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) { e.preventDefault(); e.stopPropagation(); keys[e.code] = true; } };
  const ku = e => { if (e.code in keys) { e.stopPropagation(); keys[e.code] = false; } };
  addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
  const toVX = e => { const r = st.cv.getBoundingClientRect(); return (e.clientX - r.left) / r.width * MG.W; };
  st.cv.onpointerdown = e => { st.cv.setPointerCapture(e.pointerId); target = toVX(e); };
  st.cv.onpointermove = e => { if (target !== null || e.pointerType === 'mouse') target = toVX(e); };
  st.cv.onpointerup = st.cv.onpointercancel = e => { if (e.pointerType !== 'mouse') target = null; };
  const onVis = () => { hidden = document.hidden; last = performance.now(); };
  document.addEventListener('visibilitychange', onVis);
  const loseLife = () => { if (ship.inv > 0) return; lives--; combo = 0; ship.inv = 1.4; sfx('err'); Motion.shake(st.cv, 4); mgParticles(parts, ship.x + 5, ship.y + 3, P.R, 14); };
  const frame = now => {
    if (!st.cv.isConnected) return finish(true);
    const dt = hidden ? 0 : Math.min(.05, (now - last) / 1000); last = now; t += dt;
    // movimento: teclado acelera com inércia leve; dedo/mouse leva a nave até o ponto
    const dir = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
    if (target !== null && !dir) ship.vx = Math.max(-140, Math.min(140, (target - 5 - ship.x) * 10));
    else ship.vx += (dir * 130 - ship.vx) * Math.min(1, dt * 12);
    ship.x = Math.max(0, Math.min(MG.W - 11, ship.x + ship.vx * dt));
    ship.cd -= dt; ship.inv = Math.max(0, ship.inv - dt);
    const firing = t > 0 && (keys.Space || touch || target !== null);
    if (firing && ship.cd <= 0) { shots.push({ x: ship.x + 5, y: ship.y - 2 }); ship.cd = .2; sfx('key'); }
    if (t > 0 && t < DUR) { spawnT -= dt; if (spawnT <= 0) { spawn(); if (t > 18 && Math.random() < .4) spawn(); spawnT = Math.max(.35, 1.1 - t * .02); } }
    for (const s of shots) s.y -= 150 * dt;
    for (const f of foes) {
      f.y += f.vy * dt; f.x += Math.sin(t * 2 + f.ph) * 10 * dt; f.hit = Math.max(0, f.hit - dt);
      for (const s of shots) if (!s.gone && s.x >= f.x && s.x <= f.x + f.w && s.y >= f.y && s.y <= f.y + f.h) {
        s.gone = true; f.hp--; f.hit = .08; sfx('pop');
        if (f.hp <= 0) { f.dead = true; kills++; combo++; best = Math.max(best, combo); score += 10 * Math.min(5, 1 + (combo / 5 | 0)); mgParticles(parts, f.x + f.w / 2, f.y + f.h / 2, f.k === 'sheet' ? P.F : f.k === 'note' ? P.Y : P.W, 12); }
      }
      if (!f.dead && f.y + f.h >= ship.y && f.x < ship.x + 10 && f.x + f.w > ship.x) { f.dead = true; loseLife(); }
      if (!f.dead && f.y > MG.H) { f.dead = true; loseLife(); }
    }
    for (let i = foes.length - 1; i >= 0; i--) if (foes[i].dead) foes.splice(i, 1);
    for (let i = shots.length - 1; i >= 0; i--) if (shots[i].gone || shots[i].y < -4) shots.splice(i, 1);
    // desenho: céu de escritório à noite, estrelas que passam
    x.fillStyle = P[0]; x.fillRect(0, 0, MG.W, MG.H);
    for (let i = 0; i < 24; i++) { x.fillStyle = i % 3 ? P.N : P.n; x.fillRect((i * 53) % MG.W, ((i * 37 + t * (20 + i % 3 * 15)) % MG.H) | 0, 1, i % 4 ? 1 : 2); }
    for (const f of foes) { x.drawImage(Pixel.master(SHIP.foes[f.k], WD_PAL), f.x | 0, f.y | 0); if (f.hit > 0) { x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(f.x | 0, f.y | 0, f.w, f.h); } }
    x.fillStyle = P.y; for (const s of shots) x.fillRect(s.x | 0, s.y | 0, 1, 3);
    if (ship.inv <= 0 || (t * 12 | 0) % 2) {
      const bank = ship.vx > 50 ? 1 : ship.vx < -50 ? -1 : 0;
      x.drawImage(Pixel.master(SHIP.rows, WD_PAL), (ship.x | 0) + bank * 0, ship.y | 0);
      x.fillStyle = (t * 16 | 0) % 2 ? P.Q : P.R; x.fillRect((ship.x | 0) + 5, (ship.y | 0) + 9, 1, 1 + (t * 16 | 0) % 2);   // chama do propulsor
    }
    mgDrawParticles(x, parts, dt);
    if (t < 0) Pixel.text(x, String(Math.ceil(-t)), 62, 70, P.y);
    st.hud.textContent = `${u.mgScore} ${fmt(score)} · ${u.mgCombo} ${combo} · ${u.mgLives} ${'♥'.repeat(Math.max(0, lives))}`;
    if (lives <= 0 || (t >= DUR && !foes.length) || t >= DUR + 6) return finish(false);
    requestAnimationFrame(frame);
  };
  const finish = aborted => {
    if (over) return; over = true;
    removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); document.removeEventListener('visibilitychange', onVis);
    if (aborted) return;
    const grade = score >= 400 && lives > 0 ? 'good' : score >= 180 ? 'ok' : 'bad';
    mgResult(st, host, [[u.mgScore, fmt(score)], [u.mgBest, best], [u.mgLives, Math.max(0, lives)]], grade, g => done({ score, grade: g }));
  };
  mgPop(st, u.mgReady);
  host._shooter = { foes, shots, ship, get t() { return t; }, set t(v) { t = v; }, get lives() { return lives; }, set lives(v) { lives = v; } };
  requestAnimationFrame(frame);
}
