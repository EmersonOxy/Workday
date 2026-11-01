/* ================= Tarefas ================= */
function unlocked(type) {
  if (type === 'video' && mod().video) return S.level >= mod().video;
  return S.level >= UNLOCK[type];
}
function availableTypes() {
  return Object.keys(UNLOCK).filter(t => unlocked(t)
    && !(['type', 'call', 'video'].includes(t) && S.tasks.some(k => k.type === t))
    && !(t === 'video' && S.video));
}

function spawnTask() {
  const types = availableTypes();
  if (!types.length || S.tasks.length >= MAX_TASKS) return;
  const type = pick(types), u = U();
  tip(type);
  const el = document.createElement('div');
  el.className = 'task t-' + type;   // t-type: no celular a tarefa de escrita fica no topo (ver 30-mobile.css)
  const t = { type, el, life: 0, ttl: 0 };
  const speed = Math.max(0.55, 1 - Math.max(0, S.level - UNLOCK[type]) * 0.07) * (has('secretaria') ? 1.2 : 1) * (has('postit') ? 1.25 : 1) * DIFF().ttl;
  const body = document.createElement('div');
  body.className = 'body';

  sfx({ email: 'mail', call: 'ring', video: 'join' }[type] || 'task');
  if (type === 'button') {
    t.ttl = 7 * speed;
    body.innerHTML = `<h3>${u.pending}</h3><button>${pick(L.buttons)}</button>`;
    body.querySelector('button').onclick = () => completeTask(t, 15);
  } else if (type === 'email') {
    const subj = pick(Object.keys(L.emails));
    t.ttl = 11 * speed;
    el.append(sprite(SPR.mail, 3));
    body.innerHTML = `<h3>${u.newEmail}</h3><div style="margin-bottom:6px">“${subj}” → ${u.forward}</div><div class="row"></div>`;
    SECTORS.forEach(s => {
      const b = document.createElement('button');
      b.textContent = sectorName(s.id);
      b.onclick = () => { if (s.id === L.emails[subj]) { completeTask(t, 25); stat('emails'); } else failTask(t, 10, u.fEmail, 'email'); };
      body.querySelector('.row').append(b);
    });
  } else if (type === 'type') {
    const pool = has('corretor') ? L.words.filter(w => w.length <= 8) : L.words;
    t.word = pick(pool); t.typed = '';
    t.ttl = (5 + t.word.length * 0.8) * speed;
    body.innerHTML = `<h3>${u.fill}</h3><div class="typed"></div><div class="hint">${u.typeHint}</div>`;
    el.onclick = () => { if (TOUCH) focusKb(); };
  } else if (type === 'call') {
    t.need = rand(1.6, 3) * (has('fone') ? 0.5 : 1); t.held = 0; t.holding = false;
    t.ttl = 9 * speed;
    body.innerHTML = `<h3>${u.ringing}</h3><button class="phone"><span class="fill"></span>${pick(L.callers)} · ${u.hold}</button>`;
    el.prepend(sprite(SPR.phone, 3));
    const b = body.querySelector('button');
    b.onpointerdown = e => { t.holding = true; b.setPointerCapture(e.pointerId); sfx('click'); };
    b.onpointerup = b.onpointercancel = () => { t.holding = false; if (t.held < t.need) t.held = 0; };
  } else if (type === 'printer') {
    t.key = pick(printerKeys()); t.need = 6 + Math.floor(Math.random() * 6); t.hits = 0;
    if (has('estagiario')) t.need = Math.ceil(t.need / 2);
    t.ttl = (4 + t.need * 0.45) * speed;
    el.append(sprite(SPR.printer, 3));
    body.innerHTML = `<h3>${u.printer}</h3>${u.press} <button class="keycap">${t.key}</button> <b class="cnt"></b>`;
    body.querySelector('.keycap').onpointerdown = e => { e.preventDefault(); key(t.key); };
  } else if (type === 'video') {
    t.ttl = 8 * speed;
    el.append(sprite(SPR.camera, 4));
    body.innerHTML = `<h3>${u.videoCall}</h3><button>${u.accept}</button>`;
    body.querySelector('button').onclick = () => { if (S.paused) return; removeTask(t, 'ok'); sfx('click'); startVideo(); };
  }
  el.append(body);
  el.insertAdjacentHTML('beforeend', '<div class="timer"></div>');
  tasksEl.append(el);
  Motion.enter(el, 'right');
  makeChip(t);
  S.tasks.push(t);
  if (type === 'type') renderTyped(t);
  if (type === 'printer') renderPrinter(t);
}

function renderTyped(t) {
  let html = '';
  for (let i = 0; i < t.word.length; i++) {
    if (i < t.typed.length) html += `<span class="${t.typed[i] === t.word[i] ? 'done' : 'wrong'}">${t.typed[i]}</span>`;
    else html += t.word[i];
  }
  t.el.querySelector('.typed').innerHTML = html;
}
function renderPrinter(t) { t.el.querySelector('.cnt').textContent = `${t.hits}/${t.need}`; }
const CHIP_ICON = { button: () => Pixel.el(SPR2.doc, 2, WD_SECTOR_RAMP.fin), email: () => Pixel.el(SPR2.envelope, 2), type: () => Pixel.el(SPR2.postit, 2),
  call: () => sprite(SPR.phone, 2), printer: () => sprite(SPR.printer, 2), video: () => sprite(SPR.camera, 2) };
function focusKb() { const k = $('kb'); k.value = ' '; k.focus({ preventScroll: true }); }
// Ficha da doca (celular): mostra o tipo e o prazo; tocar abre o cartão da tarefa acima da doca
function makeChip(t) {
  const c = document.createElement('button');
  c.className = 'tchip'; c.setAttribute('aria-label', t.el.querySelector('h3').textContent);
  const inner = document.createElement('span'); inner.append(CHIP_ICON[t.type]()); c.append(inner);
  c.onclick = () => openTask(S.openTask === t ? null : t);
  $('chips').append(c); t.chip = c;
  Motion.play(c, [{ transform: 'translateY(30px) scale(.6)', opacity: 0 }, { transform: 'translateY(-6px) scale(1.08)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: Motion.E.out, fill: 'none' });
}
function openTask(t) {
  const prev = S.openTask;
  if (prev) { prev.el.classList.remove('open'); if (prev.chip) prev.chip.classList.remove('sel'); }
  S.openTask = t;
  if (t && t.type === 'type' && typeof mobileHudPos === 'function') mobileHudPos();
  if (t) { t.el.classList.add('open'); t.chip.classList.add('sel'); Motion.enter(t.el, 'down'); sfx('click'); if (t.type === 'type' && TOUCH) focusKb(); }
  else if (document.activeElement === $('kb')) $('kb').blur();
  if (S.file && S.phase === 'day') requestAnimationFrame(placeFile);
}
function removeTask(t, how) {
  S.tasks = S.tasks.filter(k => k !== t);
  if (t.chip) { const c = t.chip; t.chip = null; const a = Motion.play(c, [{ transform: 'none', opacity: 1 }, { transform: how === 'ok' ? 'translateY(-14px) scale(1.15)' : 'rotate(-12deg) scale(.8)', opacity: 0 }], { duration: 220, easing: Motion.E.in }); if (a) a.onfinish = () => c.remove(); else c.remove(); }
  if (S.openTask === t) openTask(null);
  if (t.urg) t.urg.cancel();
  const el = t.el; el.style.pointerEvents = 'none';
  if (how === 'ok') { const s = document.createElement('span'); s.className = 'okstamp'; s.textContent = 'OK'; el.append(s); Motion.stamp(s); }
  const a = how ? Motion.play(el, how === 'ok' ? [{ transform: 'none', opacity: 1 }, { transform: 'none', opacity: 1, offset: .45 }, { transform: 'scale(1.03)', offset: .6, opacity: 1 }, { transform: 'translateX(40px) scale(.92)', opacity: 0 }]
    : [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-6px) rotate(-1deg)', offset: .15 }, { transform: 'translateX(5px) rotate(1deg)', offset: .3 }, { transform: 'translateY(30px) rotate(3deg)', opacity: 0 }],
    { duration: how === 'ok' ? 560 : 480, easing: how === 'ok' ? Motion.E.anticip : Motion.E.in }) : null;
  if (a) a.onfinish = () => el.remove(); else el.remove();
}
function completeTask(t, pts) { if (S.phase !== 'day' || S.paused || t.dead) return; success(pts); removeTask(t, 'ok'); }
function failTask(t, stress, msg, cause) {
  if (t.dead) return;
  t.dead = true; fail(stress, msg, cause); t.el.classList.add('failed');
  removeTask(t, 'bad');
}

