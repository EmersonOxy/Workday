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
  const ico = n => `<i class="mico" data-i="${n}"></i>`;
  const card = modal(`<div class="mw"><div class="mw-bar"><span>WORKDAY.EXE</span><span class="mw-b"><b>_</b><b>□</b><b>✕</b></span></div>
    <div class="mw-in">
      <div class="mw-hero"><span class="mw-face"></span><div><h2 class="mw-logo">${[...'WORKDAY'].map(c => `<span>${c}</span>`).join('')}</h2><p class="mw-tag">${u.tagline}</p></div></div>
      <div class="mw-stats"><span><small>${u.record}</small><b>${fmt(P.best)}</b></span><span><small>${u.wallet}</small><b>${money(P.wallet)}</b></span><span><small>${u.daysWorked}</small><b>${fmt(P.stats.days)}</b></span></div>
      <div class="menu">
        ${saved ? `<button class="pxbtn main" id="cont">${ico('cont')}${u.cont(saved.day + 1)}</button>` : ''}
        <button class="pxbtn${saved ? '' : ' main'}" id="play">${ico('play')}${u.play}</button>
        <button class="pxbtn" id="how">${ico('how')}${u.how}</button>
        <button class="pxbtn" id="cfg">${ico('cfg')}${u.settings}</button>
        <button class="pxbtn" id="prof">${ico('prof')}${u.profile}</button>
        ${arcadeUnlocked() ? `<button class="pxbtn arcade" id="arc" aria-label="${u.arcadeBtn}" title="${u.arcadeBtn}">${ico('arc')}${u.arcadeBtn}</button>` : ''}
        <button class="pxbtn menusound" id="msnd">${ico('snd')}${soundOn ? u.soundLabel + ': ' + u.soundOn : u.soundLabel + ': ' + u.soundOff}</button>
      </div>
    </div></div>`);
  card.classList.add('menu-card');
  const ICO = { cont: () => Pixel.el(SPR2.mug, 2), play: () => Pixel.el(SPR2.doc, 2, WD_SECTOR_RAMP.fin), how: () => Pixel.el(SPR2.postit, 2), cfg: () => Pixel.el(SPR2.gear, 2), prof: () => portrait(28), arc: () => Pixel.el(SPR2.pad, 2), snd: () => Pixel.el(SPR2.note, 2) };
  card.querySelectorAll('.mico').forEach(i => i.append(ICO[i.dataset.i]()));
  card.querySelector('.mw-face').append(portrait(112));
  card.querySelectorAll('.mw-logo span').forEach((sp, i) => Motion.play(sp, [{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'translateY(2px)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 360, delay: 120 + i * 60, easing: Motion.E.out, fill: 'backwards' }));
  sceneIn(card, '.mw-stats span, .menu .pxbtn', 45, 300);
  card.querySelector('#msnd').onclick = () => { setSound(!soundOn); showMenu(); };
  $('modal').insertAdjacentHTML('beforeend', `<div class="legalbar"><p>${u.footer}</p></div>`);
  card.querySelector('#play').onclick = () => newCareer();
  if (saved) card.querySelector('#cont').onclick = resumeCareer;
  card.querySelector('#how').onclick = () => { const c = modal(`<h2>${u.how}</h2>${u.howText}<div class="actions"><button class="pxbtn main" id="b">${u.back}</button></div>`); c.querySelector('#b').onclick = showMenu; };
  card.querySelector('#cfg').onclick = () => showSettings(showMenu);
  card.querySelector('#prof').onclick = showProfile;
  const arc = card.querySelector('#arc');
  if (arc) { arc.onclick = () => { closeModal(); startCall('arcade', showMenu); }; }
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
    <div class="setting"><span>${u.backup}</span><div class="seg" id="bkBox"><button class="pxbtn" id="bkOut">${u.exportSave}</button><button class="pxbtn" id="bkIn">${u.importSave}</button><input type="file" id="bkFile" accept=".json,application/json" hidden></div></div>
    <div class="setting"><span>${u.experimental}</span><div class="seg"><button class="pxbtn" id="balBtn">${u.balTitle}: ${u.balNames[BAL_KEY]}</button></div></div>
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
  card.querySelector('#bkOut').onclick = exportSave;
  card.querySelector('#bkIn').onclick = () => card.querySelector('#bkFile').click();
  card.querySelector('#bkFile').onchange = e => { const f = e.target.files[0]; if (f) importSave(f, (msg, bad) => { const s = document.createElement('span'); s.textContent = msg; s.className = bad ? 'bad' : ''; card.querySelector('#bkBox').append(s); }); };
  card.querySelector('#balBtn').onclick = () => showBalance(() => showSettings(onBack));
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

