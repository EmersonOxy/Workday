/* ================= Áudio ================= */
// Dois barramentos (música e efeitos) passam por um compressor. A música muda por cena com fade;
// a do escritório toca em loop sem emenda (buffer) e acelera de leve quando o estresse sobe.
let soundOn = load('som', false);
const VOL = Object.assign({ music: 0.6, sfx: 0.8 }, load('volumes', {}));
const A = { ctx: null, master: null, musicBus: null, sfxBus: null, lowpass: null, noise: null, webaudio: true,
            mode: null, want: 'menu', el: null, elNode: null, office: null, officeSrc: null, officeGain: null, menuQueue: [], rate: 1 };
const TRACKS = { menu: ['audio/menu-1.mp3', 'audio/menu-2.mp3', 'audio/menu-3.mp3'], office: 'audio/office-1.mp3', over: 'audio/game-over.mp3' };

function audioInit() {
  if (A.ctx || !soundOn) return;
  try {
    const ctx = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
    A.master = ctx.createGain(); A.master.connect(comp).connect(ctx.destination);
    A.lowpass = ctx.createBiquadFilter(); A.lowpass.type = 'lowpass'; A.lowpass.frequency.value = 20000;
    A.musicBus = ctx.createGain(); A.musicBus.connect(A.lowpass).connect(A.master);
    A.sfxBus = ctx.createGain(); A.sfxBus.connect(A.master);
    const n = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    A.noise = n;
    // Em file:// o navegador não deixa processar áudio de arquivos; aí a música toca direto pelo elemento <audio>
    A.webaudio = location.protocol !== 'file:';
    applyVolumes();
    loadOffice();
  } catch (e) { A.ctx = null; }
}
function applyVolumes() {
  if (!A.ctx) return;
  const t = A.ctx.currentTime;
  A.master.gain.setTargetAtTime(soundOn ? 1 : 0, t, 0.05);
  A.musicBus.gain.setTargetAtTime(VOL.music * 0.55, t, 0.05);
  A.sfxBus.gain.setTargetAtTime(VOL.sfx * 0.5, t, 0.02);
  if (A.el && !A.elNode) A.el.volume = soundOn ? VOL.music * 0.55 : 0;
  save('volumes', VOL);
}
async function loadOffice() {
  if (!A.webaudio || A.office) return;
  try {
    const buf = await A.ctx.decodeAudioData(await (await fetch(TRACKS.office)).arrayBuffer());
    // Corta o silêncio do fim (o MP3 tem preenchimento) para o loop ficar contínuo
    const ch = buf.getChannelData(0); let end = ch.length - 1;
    while (end > 0 && Math.abs(ch[end]) < 0.003) end--;
    A.office = { buf, loopEnd: (end + 1) / buf.sampleRate };
    if (A.mode === 'office' && !A.officeSrc) startOffice();
  } catch (e) { A.webaudio = false; }
}
function startOffice() {
  const src = A.ctx.createBufferSource(), g = A.ctx.createGain();
  src.buffer = A.office.buf; src.loop = true; src.loopStart = 0; src.loopEnd = A.office.loopEnd;
  src.playbackRate.value = A.rate;
  g.gain.value = 0; g.gain.setTargetAtTime(1, A.ctx.currentTime, 0.4);
  src.connect(g).connect(A.musicBus); src.start();
  A.officeSrc = src; A.officeGain = g;
}
function stopOffice(fade = 0.8) {
  if (!A.officeSrc) return;
  const src = A.officeSrc, g = A.officeGain, t = A.ctx.currentTime;
  g.gain.setTargetAtTime(0, t, fade / 4); src.stop(t + fade);
  A.officeSrc = A.officeGain = null;
}
function stopElement(fade = 0.8) {
  const el = A.el, node = A.elNode;
  if (!el) return;
  A.el = A.elNode = null;
  const v0 = el.volume, t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / (fade * 1000));
    if (node) node.gain.value = 1 - k; else el.volume = v0 * (1 - k);
    if (k < 1) requestAnimationFrame(step); else { el.pause(); el.src = ''; }
  };
  step();
}
function playElement(src, loop, onEnd) {
  const el = new Audio(src);
  el.loop = loop; el.preload = 'auto';
  if (A.webaudio) {
    try { const s = A.ctx.createMediaElementSource(el), g = A.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(A.musicBus);
          g.gain.setTargetAtTime(1, A.ctx.currentTime, 0.3); A.elNode = g; } catch (e) { A.elNode = null; }
  }
  if (!A.elNode) el.volume = soundOn ? VOL.music * 0.55 : 0;
  if (onEnd) el.onended = onEnd;
  A.el = el;
  el.play().catch(() => {});
}
// Playlist: cada faixa tem nome próprio e pode ser ligada ou desligada (CFG.playlist). O expediente usa a sua faixa
// se estiver ligada; senão, toca as outras faixas ligadas em sequência. Nenhuma ligada = silêncio.
const PLAYLIST = [{ id: 'm1', src: TRACKS.menu[0] }, { id: 'm2', src: TRACKS.menu[1] }, { id: 'm3', src: TRACKS.menu[2] }, { id: 'of', src: TRACKS.office }];
const trackOn = id => { const p = (typeof CFG !== 'undefined' && CFG.playlist) || {}; return p[id] !== false; };
function nextMenuTrack() {
  const pool = PLAYLIST.filter(t => trackOn(t.id) && (t.id !== 'of' || A.mode !== 'office')).map(t => t.src);
  if (!pool.length) { A.nowPlaying = null; return; }
  A.menuQueue = A.menuQueue.filter(s => pool.includes(s));
  if (!A.menuQueue.length) A.menuQueue = [...pool].sort(() => Math.random() - 0.5);
  const src = A.menuQueue.shift(), mode = A.mode; A.nowPlaying = src;
  playElement(src, false, () => { if (A.mode === mode) { A.el = A.elNode = null; nextMenuTrack(); } });
}
// Reaplica a playlist na hora (pular faixa ou depois de mudar o que está ligado)
function playlistApply(skip) {
  if (!A.ctx) return;
  const m = A.mode; if (m !== 'menu' && m !== 'office') return;
  if (m === 'office') stopOffice(); stopElement(.3);
  if (m === 'office' && trackOn('of') && !skip) { if (A.webaudio && A.office) startOffice(); else playElement(TRACKS.office, true); A.nowPlaying = TRACKS.office; return; }
  nextMenuTrack();
}
// Modos: 'menu' (menu, ponto, fim do dia, mercado), 'office' (expediente), 'over' (demissão), null (silêncio: dormir)
function music(mode) {
  A.want = mode;
  if (!A.ctx || A.mode === mode) return;
  stopOffice(); stopElement();
  A.mode = mode;
  muffle(false);
  if (mode === 'menu') { A.menuQueue = []; nextMenuTrack(); }
  if (mode === 'over') playElement(TRACKS.over, false, () => { A.el = A.elNode = null; if (A.mode === 'over') { A.mode = null; music('menu'); } });
  if (mode === 'office') {
    if (!trackOn('of')) nextMenuTrack();
    else { A.nowPlaying = TRACKS.office; if (A.webaudio && A.office) startOffice(); else if (!A.webaudio) playElement(TRACKS.office, true); }
  }
}
// Abafa a música (pausa, planilha do chefe, configurações durante o dia)
function muffle(on) {
  if (!A.ctx) return;
  A.lowpass.frequency.setTargetAtTime(on ? 650 : 20000, A.ctx.currentTime, 0.08);
}
// O escritório acelera até 7% quando o estresse passa de 60
function musicStress(stress) {
  const r = 1 + Math.max(0, stress - 60) / 40 * 0.07;
  if (Math.abs(r - A.rate) < 0.004) return;
  A.rate = r;
  if (A.officeSrc) A.officeSrc.playbackRate.setTargetAtTime(r, A.ctx.currentTime, 0.5);
}
// O navegador só libera áudio após um gesto: o primeiro toque/tecla cria o contexto e retoma a música pedida
function audioUnlock() {
  if (!soundOn) return;
  audioInit();
  if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
  if (A.ctx && A.mode !== A.want) music(A.want);
}
document.addEventListener('pointerdown', audioUnlock, true);
document.addEventListener('keydown', audioUnlock, true);

/* ----- Efeitos sintetizados ----- */
function tone(o) {
  const c = A.ctx, t = c.currentTime + (o.at || 0), d = o.d || 0.1;
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(o.f, t);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + d);
  if (o.det) osc.detune.value = o.det;
  const v = (o.v || 0.3);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  let out = g;
  if (o.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; g.connect(f); out = f; }
  osc.connect(g); out.connect(A.sfxBus);
  osc.start(t); osc.stop(t + d + 0.02);
}
function noise(o) {
  const c = A.ctx, t = c.currentTime + (o.at || 0), d = o.d || 0.1;
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = A.noise; src.loop = true;
  f.type = o.type || 'bandpass'; f.Q.value = o.q || 1.2;
  f.frequency.setValueAtTime(o.f || 1500, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.v || 0.3, t + (o.a || 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(f).connect(g).connect(A.sfxBus);
  src.start(t, Math.random() * 0.5); src.stop(t + d + 0.02);
}
const SFX = {
  // acerto: papel batendo na bandeja + sininho que sobe com o combo
  ok: () => { const k = 1 + Math.min(S ? S.combo : 0, 20) * 0.025;
    noise({ f: 700, d: 0.07, v: 0.25 }); tone({ type: 'triangle', f: 660 * k, d: 0.09, v: 0.22, at: 0.01 }); tone({ type: 'triangle', f: 990 * k, d: 0.16, v: 0.2, at: 0.07 }); },
  err: () => { tone({ type: 'square', f: 180, f2: 92, d: 0.26, v: 0.2, lp: 900 }); tone({ type: 'square', f: 186, f2: 95, d: 0.26, v: 0.12, lp: 700 }); noise({ f: 200, d: 0.12, v: 0.3, type: 'lowpass' }); },
  click: () => { tone({ type: 'triangle', f: 1300, d: 0.035, v: 0.16 }); noise({ f: 4000, d: 0.02, v: 0.1 }); },
  pop: () => { tone({ type: 'sine', f: 420, f2: 1250, d: 0.09, v: 0.3 }); noise({ f: 3000, d: 0.03, v: 0.08 }); },
  key: () => { noise({ f: 2600 + Math.random() * 1600, d: 0.028, v: 0.18, q: 2 }); tone({ type: 'square', f: 1600 + Math.random() * 500, d: 0.012, v: 0.04 }); },
  task: () => tone({ type: 'sine', f: 660, f2: 880, d: 0.09, v: 0.14 }),
  mail: () => { tone({ type: 'sine', f: 1046, d: 0.12, v: 0.18 }); tone({ type: 'sine', f: 1568, d: 0.22, v: 0.15, at: 0.09 }); },
  ring: () => { for (let i = 0; i < 2; i++) for (let j = 0; j < 8; j++) { const at = i * 0.42 + j * 0.035; tone({ type: 'sine', f: 440, d: 0.03, v: 0.12, at }); tone({ type: 'sine', f: 480, d: 0.03, v: 0.12, at }); } },
  alarm: () => { [880, 660, 880, 660].forEach((f, i) => tone({ type: 'square', f, d: 0.11, v: 0.13, at: i * 0.12, lp: 2600 })); },
  glitch: () => { for (let i = 0; i < 4; i++) tone({ type: 'square', f: 200 + Math.random() * 1400, d: 0.04, v: 0.1, at: i * 0.035 }); },
  freeze: () => { tone({ type: 'sawtooth', f: 320, f2: 55, d: 0.7, v: 0.16, lp: 1200 }); noise({ f: 300, d: 0.5, v: 0.1, type: 'lowpass' }); },
  unfreeze: () => { tone({ type: 'triangle', f: 300, f2: 1200, d: 0.22, v: 0.2 }); tone({ type: 'triangle', f: 1200, d: 0.12, v: 0.15, at: 0.2 }); },
  whoosh: () => noise({ f: 300, f2: 3200, d: 0.38, v: 0.25, q: 0.8, a: 0.12 }),
  coffee: () => { noise({ f: 450, f2: 1900, d: 0.4, v: 0.22, q: 3, a: 0.1 }); tone({ type: 'sine', f: 520, f2: 780, d: 0.3, v: 0.1, at: 0.2 }); },
  trash: () => { for (let i = 0; i < 5; i++) noise({ f: 1200 + Math.random() * 2500, d: 0.04, v: 0.2, at: i * 0.045, q: 3 }); },
  coin: () => { tone({ type: 'square', f: 988, d: 0.08, v: 0.13 }); tone({ type: 'square', f: 1319, d: 0.3, v: 0.13, at: 0.07 }); },
  beep: () => tone({ type: 'sine', f: 1760, d: 0.12, v: 0.25, a: 0.002 }),
  print: () => { noise({ f: 1800, d: 0.035, v: 0.16, q: 4 }); tone({ type: 'square', f: 130, d: 0.03, v: 0.05 }); },
  tear: () => { for (let i = 0; i < 6; i++) noise({ f: 2600 - i * 280, d: 0.05, v: 0.25, at: i * 0.04, q: 1.5 }); },
  level: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f, d: 0.16, v: 0.2, at: i * 0.08 })); tone({ type: 'sine', f: 2093, d: 0.3, v: 0.08, at: 0.32 }); },
  combo: () => { const b = 523 * (1 + (S ? mult() : 1) * 0.06); [1, 1.26, 1.5].forEach((m, i) => tone({ type: 'square', f: b * m, d: 0.08, v: 0.1, at: i * 0.05, lp: 3000 })); },
  scan: () => tone({ type: 'sine', f: 220, f2: 330, d: 1.1, v: 0.08, a: 0.1 }),
  clock: () => { for (let i = 0; i < 4; i++) tone({ type: 'square', f: 2050, d: 0.06, v: 0.1, at: i * 0.12, lp: 4000 }); },
  wake: () => { tone({ type: 'sine', f: 523, f2: 1046, d: 0.35, v: 0.18 }); noise({ f: 5000, f2: 9000, d: 0.4, v: 0.08, a: 0.1 }); },
  join: () => { tone({ type: 'sine', f: 523, d: 0.1, v: 0.16 }); tone({ type: 'sine', f: 784, d: 0.18, v: 0.16, at: 0.09 }); },
  blind: () => { noise({ f: 2200 + Math.random() * 900, d: 0.03, v: 0.12, q: 3 }); tone({ type: 'square', f: 180, d: 0.015, v: 0.03 }); },
  heart: () => { tone({ type: 'sine', f: 70, f2: 45, d: 0.14, v: 0.35 }); tone({ type: 'sine', f: 65, f2: 42, d: 0.14, v: 0.25, at: 0.18 }); },
};
let sfxAt = 0;
function sfx(name) {
  sfxAt = performance.now();
  if (!soundOn || !A.ctx || A.ctx.state !== 'running' || !SFX[name]) return;
  try { SFX[name](); } catch (e) {}
}
function setSound(on, silent) {
  soundOn = on; $('soundBtn').textContent = `${U().sound}: ${on ? U().on : U().off}`;
  save('som', on);
  if (on) { audioInit(); if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); if (A.ctx && A.mode !== A.want) music(A.want); }
  applyVolumes();
  if (on && !silent) sfx('click');
}
$('soundBtn').onclick = e => { setSound(!soundOn); e.currentTarget.blur(); };

// Menus, configurações, abas e opções: um clique discreto quando o próprio botão não tocou nada.
// O som do botão (se houver) toca no handler; este só preenche o silêncio, então nunca há som duplicado.
document.addEventListener('click', e => {
  const b = e.target.closest('button, .xl-tab, select, .pxrange');
  if (!b || b.disabled || b.closest('#pad') || b.classList.contains('tchip')) return;
  const t0 = performance.now();
  setTimeout(() => { if (sfxAt < t0) sfx(b.matches('.main, #pok, #pok2') ? 'pop' : 'click'); }, 0);
});
document.addEventListener('change', e => { if (e.target.matches('select, input[type=checkbox]')) { const t0 = performance.now(); setTimeout(() => { if (sfxAt < t0) sfx('click'); }, 0); } });
// Interruptor: clique seco de duas peças
SFX.switch = () => { noise({ f: 3200, d: 0.018, v: 0.22, q: 3 }); tone({ type: 'square', f: 900, d: 0.015, v: 0.06, at: 0.03 }); noise({ f: 1800, d: 0.02, v: 0.14, at: 0.035 }); };
