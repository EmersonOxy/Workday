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

// Ícones do menu: todos 12×12, contorno de tinta, mesma luz (de cima à esquerda); botões da barra de título 7×7
const MENU_ICO = {
  cont: ['..w..w......', '...w..w.....', '..w..w......', '.kkkkkkkk...', '.kTTTTTTkkk.', '.kTWTTTTk.k.', '.kTWTTTTk.k.', '.kTTTTTTkkk.', '.kTTTTTTk...', '.kuuuuuuk...', '..kkkkkk....', '............'],
  play: ['.kkkkkkk....', '.kFFFFFkWk..', '.kfffffkkkk.', '.kWWWWWWWWk.', '.kWppppppWk.', '.kWWWWWWWWk.', '.kWpppppWWk.', '.kWWWWWWWWk.', '.kWWWkWWWWk.', '.kWWWkkWWWk.', '.kWWWkWWWWk.', '.kkkkkkkkkk.'],
  how:  ['..kkkkkkkk..', '.kWWWWWWWWk.', 'kWWW7777WWWk', 'kWW7WWWW7WWk', 'kWWWWWW7WWWk', 'kWWWWW7WWWWk', 'kWWWWWWWWWWk', 'kWWWWW7WWWWk', '.kwwwwwwwwk.', '..kkkwkkkk..', '...kwk......', '...kk.......'],
  cfg:  ['....kkkk....', '.kk.kmmk.kk.', '.kmkkmmkkmk.', '..kmmmmmmk..', 'kkmmMkkMmmkk', 'kmmmk..kmmmk', 'kmmmk..kmmmk', 'kkMmMkkMMMkk', '..kMMMMMMk..', '.kMkkMMkkMk.', '.kk.kMMk.kk.', '....kkkk....'],
  prof: ['....kkkk....', '....kMMk....', '.kkkkkkkkkk.', '.kWWWWWWWWk.', '.kWkkkkWWWk.', '.kWkssk7ppk.', '.kWkssk7WWk.', '.kWkLLkWppk.', '.kWkkkkWWWk.', '.kWWWWWWWWk.', '.kLLLLLLLLk.', '.kkkkkkkkkk.'],
  arc:  ['............', '............', '.kkkkkkkkkk.', 'kCCCCCCCCCCk', 'kCCkCCCCRCCk', 'kCkkkCCRCLCk', 'kCCkCCCCLCCk', 'kCCCCkkCCCCk', 'kEECk..kCEEk', '.kkk....kkk.', '............', '............'],
  snd:  ['............', '.....kk.....', '....kMk..k..', '.kkkMMk.k.k.', '.kmmMMk..k.k', '.kmmMMk..k.k', '.kkkMMk.k.k.', '....kMk..k..', '.....kk.....', '............', '............', '............'],
  mute: ['............', '.....kk.....', '....kMk.....', '.kkkMMk.R..R', '.kmmMMk..RR.', '.kmmMMk..RR.', '.kkkMMk.R..R', '....kMk.....', '.....kk.....', '............', '............', '............'],
  app:  ['kkkkkkkk', 'kFFFFFFk', 'kWWWWWWk', 'kWppppWk', 'kWWWWWWk', 'kWpppWWk', 'kWWWWWWk', 'kkkkkkkk'],
  min:  ['.......', '.......', '.......', '.......', '.......', 'kkkkk..', 'kkkkk..'],
  max:  ['kkkkkkk', 'kkkkkkk', 'k.....k', 'k.....k', 'k.....k', 'k.....k', 'kkkkkkk'],
  x:    ['kk...kk', '.kk.kk.', '..kkk..', '..kkk..', '.kk.kk.', 'kk...kk', '.......'],
};
// O aviso de direitos autorais fica numa linha só no computador: a fonte encolhe até um mínimo legível;
// se ainda assim não couber, a linha rola devagar como letreiro (com "reduzir movimento", volta a quebrar a linha)
function fitLegal() {
  const p = $('modal').querySelector('.legalbar p'); if (!p || document.body.classList.contains('mobile')) return;
  if (!p.dataset.txt) p.dataset.txt = p.innerHTML;
  p.classList.remove('ticker'); p.innerHTML = p.dataset.txt; p.style.fontSize = '';
  requestAnimationFrame(() => {
    let fs = parseFloat(getComputedStyle(p).fontSize);
    while (p.scrollWidth > p.clientWidth + 1 && fs > 11) { fs -= .5; p.style.fontSize = fs + 'px'; }
    if (p.scrollWidth <= p.clientWidth + 1 || Motion.reduced.matches) return;
    p.classList.add('ticker'); p.innerHTML = `<span>${p.dataset.txt}</span><span aria-hidden="true">${p.dataset.txt}</span>`;
    p.style.setProperty('--tk', Math.round(p.scrollWidth / 2 / 40) + 's');   // ~40 px por segundo
  });
}
addEventListener('resize', () => fitLegal());

// Botão Iniciar do WorkOS (no menu principal): atalhos e "Desligar", que fecha o WorkOS com animação e volta ao menu
function osStart(u) {
  if (!document.body.classList.contains('office')) return;
  const m = $('modal'); m.querySelectorAll('.os-start, .os-smenu').forEach(e => e.remove());
  m.insertAdjacentHTML('beforeend', `<button class="os-start" aria-haspopup="true"></button><div class="os-smenu hidden"><div class="os-sh"><span class="os-me"></span><b></b></div>
    <button data-a="prof">${u.profile}</button><button data-a="pc">${u.customizePc || 'WorkOS'}</button><button data-a="cfg">${u.settings}</button><i></i><button data-a="off">${u.shutdown}</button></div>`);
  const b = m.querySelector('.os-start'), sm = m.querySelector('.os-smenu');
  b.append(Pixel.el(MENU_ICO.app, 2)); b.insertAdjacentHTML('beforeend', '<span>WorkOS</span>');
  sm.querySelector('.os-me').append(portrait(40)); sm.querySelector('b').textContent = profileName();
  const items = { prof: () => showBadge(showMenu), pc: () => showCustomize(showMenu), cfg: () => showSettings(showMenu) };
  b.onclick = e => { e.stopPropagation(); sm.classList.toggle('hidden'); b.classList.toggle('on'); sfx('click'); };
  sm.onclick = e => { const a = e.target.closest('button'); if (!a) return; sm.classList.add('hidden'); b.classList.remove('on');
    if (a.dataset.a === 'off') return osShutdown(); sfx('click'); items[a.dataset.a](); };
  m.addEventListener('pointerdown', e => { if (!e.target.closest('.os-smenu, .os-start')) { sm.classList.add('hidden'); b.classList.remove('on'); } });
}
function osShutdown() {
  sfx('err');
  const o = document.createElement('div'); o.className = 'os-off'; o.innerHTML = `<b>${U().shuttingDown}</b>`; uiRoot().append(o);
  setTimeout(() => { o.classList.add('done'); setTimeout(() => { o.remove(); showMenu(); }, 700); }, 900);
}

function showMenu() {
  document.body.classList.add('menu-mode');
  if (typeof applyWallpaper === 'function') setTimeout(applyWallpaper, 0);
  music('menu');
  if (S) { S.running = false; S = null; }
  clearDom(); tasksEl.innerHTML = ''; board.innerHTML = ''; $('chips').innerHTML = '';
  hud(); renderDesk(); closeScene();
  const u = U(), saved = load('carreira', null);
  const ico = n => `<i class="mico" data-i="${n}"></i>`;
  const card = modal(`<div class="mw"><div class="mw-bar"><span class="mw-ttl"><i class="mw-app"></i>WORKDAY.EXE</span><i class="mw-stripes"></i><span class="mw-b" aria-hidden="true"><b data-g="min"></b><b data-g="max"></b><b data-g="x"></b></span></div>
    <div class="mw-in">
      <div class="mw-hero"><span class="mw-face"></span><div><h2 class="mw-logo" aria-label="WORKDAY"></h2><p class="mw-tag">${u.tagline}</p></div></div>
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
  card.querySelectorAll('.mico').forEach(i => { const n = i.dataset.i === 'snd' && !soundOn ? 'mute' : i.dataset.i; i.append(Pixel.el(MENU_ICO[n], 2)); });
  card.querySelectorAll('.mw-b b').forEach(b => b.append(Pixel.el(MENU_ICO[b.dataset.g], 2)));
  card.querySelector('.mw-app').append(Pixel.el(MENU_ICO.app, 2));
  card.querySelector('.mw-face').append(portrait(112));
  { // logotipo em pixel art: fonte 3×5 com cada pixel valendo 2×2, contorno de 1 px em tinta e sombra em degrau
    // fonte própria do logotipo: traços de 2 px, miolos escuros, contorno de tinta e sombra em latão
    const G = { W: ['1100011', '1100011', '1101011', '1101011', '1111111', '1110111', '1100011'], O: ['011110', '110011', '110011', '110011', '110011', '110011', '011110'],
      R: ['111110', '110011', '110011', '111110', '111100', '110110', '110011'], K: ['110011', '110110', '111100', '111000', '111100', '110110', '110011'],
      D: ['111100', '110110', '110011', '110011', '110011', '110110', '111100'], A: ['011110', '110011', '110011', '111111', '110011', '110011', '110011'],
      Y: ['110011', '110011', '011110', '001100', '001100', '001100', '001100'] };
    const word = 'WORKDAY', W0 = [...word].reduce((n, ch) => n + G[ch][0].length + 1, 0) + 3, H0 = 11, grid = new Uint8Array(W0 * H0);
    let cx0 = 2; for (const ch of word) { G[ch].forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '1') grid[(2 + j) * W0 + cx0 + i] = 1; }); cx0 += G[ch][0].length + 1; }
    const lc = document.createElement('canvas'); lc.width = W0; lc.height = H0; const x = lc.getContext('2d'), at = (i, j) => i >= 0 && j >= 0 && i < W0 && j < H0 && grid[j * W0 + i];
    for (let j = 0; j < H0; j++) for (let i = 0; i < W0; i++) {
      const c = at(i, j) ? (j < 5 ? WD_PAL.W : j < 8 ? WD_PAL.w : WD_PAL.p)
        : at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1) || at(i - 1, j - 1) || at(i + 1, j - 1) ? WD_PAL.k
        : at(i - 1, j - 2) || at(i, j - 2) && !at(i, j - 1) ? WD_PAL.z : null;
      if (c) { x.fillStyle = c; x.fillRect(i, j, 1, 1); }
    }
    const logo = card.querySelector('.mw-logo'); logo.append(pxSize(lc, 5)); Motion.dropIn(logo); }
  sceneIn(card, '.mw-stats span, .menu .pxbtn', 45, 300);
  card.querySelector('#msnd').onclick = () => { setSound(!soundOn); showMenu(); };
  $('modal').insertAdjacentHTML('beforeend', `<div class="legalbar"><p>${u.footer}</p></div>`);
  fitLegal();
  osStart(u);
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
    <div class="setting"><span>${u.diffLabel}</span>${seg('diff', Object.keys(DIFFS).map(k => [k, u.diffNames[k]]), CFG.diff || 'normal')}</div>
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
    if (set === 'diff') { CFG.diff = v; sfx('click'); }
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

