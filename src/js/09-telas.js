/* ================= Telas ================= */
function modal(html) {
  $('modal').querySelectorAll('.legalbar').forEach(e => e.remove());
  const card = $('modal').querySelector('.card');
  card.className = 'card'; card.innerHTML = html;
  const was = $('modal').classList.contains('hidden');
  $('modal').classList.remove('hidden');
  if (was) Motion.play(card, [{ transform: 'translateY(14px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: Motion.T.med, easing: Motion.E.back, fill: 'none' });
  return card;
}
function closeModal() { $('modal').classList.add('hidden'); }

function showMenu() {
  document.body.classList.add('menu-mode');
  if (typeof applyWallpaper === 'function') setTimeout(applyWallpaper, 0);
  music('menu');
  if (S) { S.running = false; S = null; }
  clearDom(); tasksEl.innerHTML = ''; board.innerHTML = ''; $('chips').innerHTML = '';
  hud(); renderDesk(); closeScene();
  const u = U(), saved = load('carreira', null);
  const card = modal(`
    <div class="logo"><span id="lf"></span><h2>WORKDAY</h2></div>
    <p class="center hint">${u.record}: ${fmt(P.best)} · ${u.wallet}: ${money(P.wallet)}</p>
    <div class="menu">
      ${saved ? `<button class="pxbtn main" id="cont">${u.cont(saved.day + 1)}</button>` : ''}
      <button class="pxbtn${saved ? '' : ' main'}" id="play">${u.play}</button>
      <button class="pxbtn" id="how">${u.how}</button>
      <button class="pxbtn" id="cfg">${u.settings}</button>
      <button class="pxbtn" id="prof">${u.profile}</button>
      ${arcadeUnlocked() ? `<button class="pxbtn arcade" id="arc" aria-label="${u.arcadeBtn}" title="${u.arcadeBtn}"></button>` : ''}
      <button class="pxbtn menusound" id="msnd">${soundOn ? '♪ ' + u.soundLabel + ': ' + u.soundOn : '♪ ' + u.soundLabel + ': ' + u.soundOff}</button>
    </div>`);
  card.querySelector('#msnd').onclick = () => { setSound(!soundOn); showMenu(); };
  $('modal').insertAdjacentHTML('beforeend', `<div class="legalbar"><p>${u.footer}</p></div>`);
  card.querySelector('#lf').replaceWith(face('#6e3b26', '#2b2340', false, 4));
  card.querySelector('#play').onclick = () => newCareer();
  if (saved) card.querySelector('#cont').onclick = resumeCareer;
  card.querySelector('#how').onclick = () => { const c = modal(`<h2>${u.how}</h2>${u.howText}<div class="actions"><button class="pxbtn main" id="b">${u.back}</button></div>`); c.querySelector('#b').onclick = showMenu; };
  card.querySelector('#cfg').onclick = () => showSettings(showMenu);
  card.querySelector('#prof').onclick = showProfile;
  const arc = card.querySelector('#arc');
  if (arc) { arc.append(Pixel.el(SPR2.pad, 3)); Motion.dropIn(arc); arc.onclick = () => { closeModal(); startCall('arcade', showMenu); }; }
}

function showProfile() {
  const s = P.stats, u = U();
  const rows = [[u.record, fmt(P.best)], [u.wallet, money(P.wallet)], [u.daysWorked, s.days], [u.maxDay, s.maxDay], [u.careers, s.careers],
    [u.files, fmt(s.files)], [u.emails, fmt(s.emails)], [u.calls, fmt(s.calls)], [u.viruses, fmt(s.viruses)], [u.bosses, fmt(s.bosses)],
    [u.videos, fmt(s.videos)], [u.prints, fmt(s.prints)]];
  const card = modal(`<h2>${u.profile}</h2><div class="statgrid">${rows.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</div>
    <div class="actions"><button class="pxbtn" id="eb">${u.editBadge}</button><button class="pxbtn main" id="b">${u.back}</button></div>`);
  card.querySelector('.statgrid').before(Object.assign(document.createElement('div'), { className: 'over-who' }));
  card.querySelector('.over-who').append(portrait(112), Object.assign(document.createElement('b'), { textContent: profileName() + ' · Nº ' + EMP_ID }));
  card.querySelector('#eb').onclick = () => showBadge(showProfile);
  card.querySelector('#b').onclick = showMenu;
}

function showSettings(onBack) {
  const u = U();
  const seg = (name, opts, cur) => `<div class="seg" data-set="${name}">${opts.map(([v, l]) => `<button class="pxbtn${v === cur ? ' on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const card = modal(`<h2>${u.settings}</h2>
    <div class="setting"><span>${u.language}</span>${seg('lang', Object.entries(LANGS).map(([k, v]) => [k, v.label]), CFG.lang)}</div>
    <div class="setting"><span>${u.theme}</span>${seg('theme', [['system', u.themeSystem], ['light', u.themeLight], ['dark', u.themeDark]], CFG.theme)}</div>
    <div class="setting"><span>${u.display}</span>${seg('display', [['window', u.windowed], ['full', u.fullscreen]], document.fullscreenElement ? 'full' : 'window')}</div>
    <div class="setting"><span>${u.resolution}</span><select id="resSel" class="pxsel">${RESOLUTIONS.map(r => `<option value="${r}"${(CFG.res || 'auto') === r ? ' selected' : ''}>${r === 'auto' ? u.autoRes : r.replace('x', '×')}</option>`).join('')}</select></div>
    <div class="setting"><span>${u.soundLabel}</span>${seg('sound', [['1', u.soundOn], ['0', u.soundOff]], soundOn ? '1' : '0')}</div>
    <div class="setting"><span>${u.musicLabel}</span><input type="range" class="pxrange" id="volMusic" min="0" max="100" value="${Math.round(VOL.music * 100)}" aria-label="${u.musicLabel}"></div>
    <div class="setting"><span>${u.sfxLabel}</span><input type="range" class="pxrange" id="volSfx" min="0" max="100" value="${Math.round(VOL.sfx * 100)}" aria-label="${u.sfxLabel}"></div>
    <div class="setting"><span>${u.badgeTitle}</span><div class="seg"><button class="pxbtn" id="editBadge">${u.editBadge}</button><button class="pxbtn" id="custom">${u.customize}</button></div></div>
    <div class="setting"><span>${u.lights}</span>${seg('light', [['1', u.lightOn], ['0', u.lightOff]], lightState().lamp ? '1' : '0')}</div>
    <div class="setting"><span>${u.tutorial}</span><div class="seg"><button class="pxbtn" id="tut">${u.tutorialReset}</button></div></div>
    <div class="setting"><span>${u.progress}</span><div class="seg" id="eraseBox"><button class="pxbtn" id="erase">${u.erase}</button></div></div>
    <div class="actions"><button class="pxbtn main" id="b">${u.back}</button></div>`);
  card.querySelectorAll('[data-set] button').forEach(b => b.onclick = () => {
    const set = b.parentElement.dataset.set, v = b.dataset.v;
    if (set === 'lang') { CFG.lang = v; applyLang(); }
    if (set === 'theme') { CFG.theme = v; applyTheme(); }
    if (set === 'sound') setSound(v === '1');
    if (set === 'light') { CFG.lights = Object.assign({}, CFG.lights, { lamp: v === '1' }); OFFICE.key = ''; sfx('switch'); }
    if (set === 'display') { CFG.display = v; if ((v === 'full') !== !!document.fullscreenElement) toggleFullscreen(); }
    persist();
    showSettings(onBack);
  });
  card.querySelector('#resSel').onchange = e => { CFG.res = e.target.value; persist(); officeLayout(); };
  card.querySelector('#volMusic').oninput = e => { VOL.music = e.target.value / 100; applyVolumes(); };
  card.querySelector('#volSfx').oninput = e => { VOL.sfx = e.target.value / 100; applyVolumes(); };
  card.querySelector('#volSfx').onchange = () => sfx('ok');
  card.querySelector('#editBadge').onclick = () => showBadge(() => showSettings(onBack));
  card.querySelector('#custom').onclick = () => showCustomize(() => showSettings(onBack));
  const tut = card.querySelector('#tut');
  tut.onclick = () => { P.seen = []; persist(); tut.textContent = u.tutorialDone; tut.disabled = true; };
  card.querySelector('#erase').onclick = () => {
    const box = card.querySelector('#eraseBox');
    box.innerHTML = `<span>${u.eraseConfirm}</span><button class="pxbtn" id="y">${u.eraseYes}</button><button class="pxbtn" id="n">${u.eraseNo}</button>`;
    box.querySelector('#n').onclick = () => showSettings(onBack);
    box.querySelector('#y').onclick = () => {
      Object.assign(P, { wallet: 0, decor: [], seen: [], best: 0, stats: freshStats() });
      persist(); hud(); renderDesk();
      box.innerHTML = `<span>${u.erased}</span>`;
    };
  };
  card.querySelector('#b').onclick = onBack;
}

function showPause() { closeModal(); showSheet(true); }

