/* ================= Pausa para descansar: videochamada com o colega ================= */
// Duas entradas, a mesma experiência: 'work' (durante o expediente, a cada REST_EVERY dias) e 'arcade'
// (menu principal, com o nome secreto no crachá). O expediente congela por S.paused + S.resting:
// relógio, documentos, prazos, eventos e estresse contínuo não avançam até a contagem regressiva terminar.
const REST_EVERY = 3;                 // dias entre as pausas para descansar
const SECRET_NAME = 'PLAYER ONE';     // nome no crachá que revela o arcade secreto no menu
const MINIGAMES = ['rhythm', 'shooter'];
// sorteia sem repetir as últimas falas (lembra as 3 mais recentes de cada grupo)
function pickNew(arr, key) { const seen = load('duda-' + key, []), pool = arr.map((_, i) => i).filter(i => !seen.includes(i)), i = pick(pool.length ? pool : arr.map((_, i) => i)); save('duda-' + key, [i, ...seen].slice(0, Math.min(3, arr.length - 1))); return arr[i]; }
function nextGame() { const last = load('ultimo-minigame', null), g = last === 'rhythm' ? 'shooter' : last === 'shooter' ? 'rhythm' : pick(MINIGAMES); save('ultimo-minigame', g); return g; }
const gameName = k => k === 'rhythm' ? U().mgRhythm : U().mgShooter;
function arcadeUnlocked() { return (PROFILE.name || '').trim().toUpperCase() === SECRET_NAME; }

// Duda, da TI: rosto próprio (cabelo ruivo curto, óculos, headset com microfone)
const DUDA_PAL = { h: '#c25f3b', H: '#a24a33', n: '#5fa79a', N: '#2f6f78' };
function dudaRows(mouth = 'shut', eyes = 'open') {
  const E = { open: '.ksJlkJsJlkJsSk.', blink: '.ksJJJJsJJJJsSk.', happy: '.ksJkkJsJkkJsSk.' }[eyes];
  const M = { shut: ['..kssssssssSkJ..', '..kSsssRRssSSJ..'], talk: ['..ksssRRRsssSJ..', '..kSssrqrssSkJ..'],
              smile: ['..ksRssssRsSkJ..', '..kSsRRRRsSSJ..'], wow: ['..kssssRRssSkJ..', '..kSssRqRssSJ...'] }[mouth];
  return ['.....kkkkkk.....', '...kkhhhhhhkk...', '..khhhhhhhhhhk..', '.khhHhhhhhhhhhk.', 'JkhHssssssssHhkJ', 'JkHsssssssssSHkJ',
    E, '.kpssssssssspSk.', '.kssssssSsssSk..', M[0], M[1], '...kSSssssSSk...', '....kkSSSSkk....', '...kNnnwwnnNk...',
    '..kNnnnwrwnnnNk.', '.kNnnnnwrwnnnnNk', '.kNnnnnnrnnnnnNk', '.kkkkkkkkkkkkkkk'];
}
const Call = { el: null, mode: null, timers: [] };
function callLater(fn, ms) { const t = setTimeout(fn, ms); Call.timers.push(t); return t; }
function callClear() { Call.timers.forEach(clearTimeout); Call.timers = []; }

// Avatar falante: boca abre/fecha enquanto o texto aparece; pisca de vez em quando; expressões nas reações
function dudaFace(host) {
  const st = { mouth: 'shut', eyes: 'open', talking: false };
  const draw = () => { const c = Pixel.el(dudaRows(st.talking && (performance.now() / 120 | 0) % 2 ? 'talk' : st.mouth, st.eyes), document.body.classList.contains('mobile') ? 5 : 6, DUDA_PAL); host.replaceChildren(c); };
  let last = '', blinkAt = performance.now() + 2500;
  const loop = () => {
    if (!host.isConnected) return;
    const now = performance.now();
    if (now > blinkAt) { st.eyes = st.eyes === 'blink' ? st.base || 'open' : 'blink'; blinkAt = now + (st.eyes === 'blink' ? 120 : 2200 + Math.random() * 2000); }
    const key = st.talking + st.mouth + st.eyes + ((now / 120 | 0) % 2);
    if (key !== last) { last = key; draw(); }
    requestAnimationFrame(loop);
  };
  draw(); requestAnimationFrame(loop);
  return { set(m, e) { st.mouth = m; st.base = e || 'open'; st.eyes = st.base; }, talk(on) { st.talking = on; } };
}

// Fala: o texto aparece letra a letra (com bipes discretos) e depois mostra as opções
function callSay(text, opts, face) {
  const line = Call.el.querySelector('.vc-line'), box = Call.el.querySelector('.vc-opts');
  box.replaceChildren(); line.textContent = '';
  return new Promise(res => {
    let i = 0, waiting = null; face.talk(true);
    Call.skip = () => { if (i < text.length) { i = text.length - 1; } else if (waiting) { clearTimeout(waiting); waiting = null; res(); } };
    const step = () => {
      if (!Call.el) return;
      line.textContent = text.slice(0, ++i);
      if (i % 3 === 0) sfx('key');
      if (i < text.length) callLater(step, Motion.reduced.matches ? 0 : 22);
      else {
        face.talk(false);
        if (!opts) { waiting = callLater(() => { waiting = null; res(); }, 1400); return; }
        opts.forEach(([label, val, main], n) => {
          const b = document.createElement('button'); b.className = 'pxbtn' + (main ? ' main' : ''); b.textContent = label;
          b.onclick = () => { box.querySelectorAll('button').forEach(x => x.disabled = true); res(val); };
          box.append(b); Motion.enter(b, 'down');
        });
      }
    };
    step();
  });
}

function callFrozen() { return S && S.phase === 'day'; }
// Pode começar? Nunca em cima do chefe, vírus, travamento, reunião, planilha falsa ou outra janela
function restCanStart() {
  return S && S.phase === 'day' && !S.paused && !S.resting && !S.bossAlert && !S.boss && S.bossAuto <= 0 && !S.frozen && !S.virus && !S.video
    && !POPUPS.length && $('modal').classList.contains('hidden') && S.day % REST_EVERY === 0;
}
function restTick() {
  if (S.restDone || S.dayT < S.restAt || !restCanStart()) return;
  S.restDone = true;
  startCall('work');
}

function startCall(mode, onExit) {
  const u = U(), c = L.call;
  Call.mode = mode;
  if (mode === 'work') { S.paused = true; S.resting = true; S.fast = false; muffle(true); }
  const el = document.createElement('div'); el.className = 'vcall';
  el.innerHTML = `<div class="vc-win"><div class="vc-title"><span>${c.incoming} · ${c.who}</span><b class="rec">●</b><button class="vc-x" aria-label="${U().mgQuit}" title="${U().mgQuit}">✕</button></div>
    <div class="vc-body"><div class="vc-cam"><span class="vc-face"></span></div><div class="vc-talk"><p class="vc-line"></p><div class="vc-opts"></div></div></div></div>`;
  uiRoot().append(el); Call.el = el;
  const skip = e => { if (Call.el && Call.skip && !e.target.closest('button, .mg-host')) Call.skip(); };
  el.addEventListener('pointerdown', skip);
  Call.key = e => { if (Call.el && !Call.el.classList.contains('playing') && (e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); e.stopPropagation(); if (Call.skip) Call.skip(); } };
  addEventListener('keydown', Call.key, true);
  const face = dudaFace(el.querySelector('.vc-face'));
  // X da janela: no meio de um minigame encerra a partida; fora dele, desliga a chamada
  el.querySelector('.vc-x').onclick = () => { const h = el.querySelector('.mg-host'); if (h && h._quit) h._quit(); else if (Call.el === el) { sfx('click'); closeCall(mode, onExit); } };
  Motion.play(el.querySelector('.vc-win'), [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: Motion.E.out });
  const finish = async (reaction) => {
    if (reaction) { face.set(reaction === 'bad' ? 'wow' : 'smile', reaction === 'good' ? 'happy' : 'open'); await callSay(pickNew(c[reaction], reaction), null, face); }
    face.set('smile', 'happy');
    await callSay(pickNew(mode === 'arcade' ? c.byeArcade : c.bye, mode + 'b'), null, face);
    closeCall(mode, onExit);
  };
  (async () => {
    // Toque: telefone da mesa toca, a janela balança até atender ou recusar
    let ringing = true;
    if (mode === 'work') { OFFICE.call = true; const ring = () => { if (!ringing || !Call.el) return; sfx('ring'); Motion.shake(el.querySelector('.vc-win'), 3); callLater(ring, 1100); }; ring(); }
    const ans = mode === 'arcade' ? true : await callSay(c.who + '…', [[c.answer, true, true], [c.decline, false]], face);
    ringing = false; OFFICE.call = false;
    if (!ans) { closeCall(mode, onExit); return; }
    sfx('join'); el.querySelector('.vc-title span').textContent = c.who;
    face.set('smile');
    await callSay(pickNew(mode === 'arcade' ? c.arcade : c.greet, mode + 'g'), null, face);
    if (mode === 'work') {
      const t = pickNew(c.talk, 'talk'); face.set('shut');
      const r = await callSay(t[0], [[t[1], 3], [t[2], 4]], face);
      face.set('smile'); await callSay(t[r], null, face);
    }
    face.set('smile', 'happy');
    let kind, opts = {};
    if (mode === 'arcade') {
      // arcade: o jogador escolhe o jogo e, no ritmo, a música ou o modo infinito
      const g = await callSay(u.mgPickGame, [[u.mgRhythm, 'rhythm', true], [u.mgShooter, 'shooter', true], [u.mgSurprise, '?'], [c.no, false]], face);
      if (!g) { face.set('shut'); await callSay(pick(c.declined), null, face); closeCall(mode, onExit); return; }
      kind = g === '?' ? pick(MINIGAMES) : g;
      if (kind === 'rhythm') { const sg = await callSay(u.mgPickSong, [...u.songs.map((n, i) => [n, i, true]), [u.mgInfinite, 'inf', true]], face); opts.song = sg; }
    } else {
      kind = nextGame();
      const go = await callSay(pick(c.inviteG).replace('{g}', gameName(kind)), [[c.yes, true, true], [c.no, false]], face);
      if (!go) { face.set('shut'); await callSay(pick(c.declined), null, face); closeCall(mode, onExit); return; }
      if (kind === 'rhythm') opts.song = Math.random() * RHY.SONGS.length | 0;
    }
    if (mode === 'work') music(null);
    const host = document.createElement('div'); host.className = 'mg-host'; el.querySelector('.vc-win').append(host);
    el.classList.add('playing');
    runMinigame(kind, host, result => {
      host.remove(); el.classList.remove('playing');
      if (mode === 'work') addStress(-10);          // descanso de verdade: alivia um pouco, sem pontos nem dinheiro
      finish(result.quit ? null : result.grade);
    }, opts);
  })();
}

function closeCall(mode, onExit) {
  callClear(); OFFICE.call = false; Call.skip = null; if (Call.key) { removeEventListener('keydown', Call.key, true); Call.key = null; }
  const el = Call.el; Call.el = null;
  if (el) { const a = Motion.play(el.querySelector('.vc-win'), [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.05,.9)', offset: .3, opacity: 1 }, { transform: 'scale(.2,.05) translateY(300%)', opacity: 0 }], { duration: 240, easing: Motion.E.anticip }); if (a) a.onfinish = () => el.remove(); else el.remove(); }
  if (mode === 'work') countdown(() => { S.resting = false; S.paused = false; S.last = performance.now(); muffle(false); if (S.phase === 'day') music('office'); });
  else if (onExit) onExit();
}
// "3, 2, 1" antes de o expediente voltar exatamente de onde parou
function countdown(done) {
  const o = document.createElement('div'); o.className = 'countdown';
  uiRoot().append(o);
  let n = 3;
  const tick = () => {
    if (n === 0) { o.remove(); done(); return; }
    o.innerHTML = `<small>${L.call.resuming}</small><b>${n}</b>`; sfx('beep');
    Motion.punch(o.querySelector('b'), 1.4); n--; setTimeout(tick, 1000);
  };
  tick();
}
