/* ================= Telas ================= */
function modal(html) {
  // Telas abertas de dentro de um aplicativo da área de trabalho (Personalizar, Perfil) continuam na janela dele
  // redesenhar a mesma tela (ex.: trocar uma opção) mantém a rolagem onde estava
  const keepScroll = (el, fn) => { const h0 = (el.querySelector('h2') || {}).textContent, top = el.scrollTop; fn(); const h1 = (el.querySelector('h2') || {}).textContent; if (h0 && h0 === h1) el.scrollTop = top; };
  if (modal.into && modal.into.isConnected) { const b = modal.into; keepScroll(b, () => { b.innerHTML = html; }); b.classList.add('card-in'); return b; }
  modal.into = null;
  // a área de trabalho (ícones, Iniciar, barra e janelas abertas) continua enquanto estiver no menu
  $('modal').querySelectorAll('.legalbar, .os-smenu' + (document.body.classList.contains('menu-mode') ? '' : ', .os-win, .os-start, .os-icons, .os-tasks')).forEach(e => e.remove());
  $('modal').classList.remove('allmin');
  const card = $('modal').querySelector('.card');
  const oldBody = card.querySelector('.win-body'), oldTitle = card.querySelector('.win-bar .mw-ttl'), st0 = oldBody ? oldBody.scrollTop : 0, t0 = oldTitle ? oldTitle.textContent : null;
  card.className = 'card'; card.style.display = ''; card.innerHTML = html;
  winChrome(card);
  { const nb = card.querySelector('.win-body'), nt = card.querySelector('.win-bar .mw-ttl'); if (nb && nt && t0 === nt.textContent) nb.scrollTop = st0; }
  osFocus(card);
  const was = $('modal').classList.contains('hidden');
  $('modal').classList.remove('hidden');
  if (was) { Motion.play(card, OS_OPEN, { duration: 300, easing: 'steps(10)', fill: 'none' }); sfx('winOpen'); }
  return card;
}
// Toda tela em #modal vira janela do WorkOS: barra de título (com o h2 como título), minimizar (recolhe),
// maximizar (ocupa a área) e fechar (aciona o Voltar/Cancelar da própria tela; sem ele, fecha a janela)
function winChrome(card) {
  if (card.querySelector(':scope > .mw')) return;
  const h = card.querySelector(':scope > h2'), title = (h ? h.textContent : 'WorkOS').trim();
  const bar = document.createElement('div'); bar.className = 'mw-bar win-bar';
  bar.innerHTML = `<span class="mw-ttl"><i class="mw-app"></i></span><i class="mw-stripes"></i><span class="mw-b"><b data-g="min" class="min"></b><b data-g="max" class="max"></b><b data-g="x" class="x"></b></span>`;
  bar.querySelector('.mw-ttl').append(document.createTextNode(title));
  const body = document.createElement('div'); body.className = 'win-body'; body.append(...card.childNodes);
  card.append(bar, body); card.classList.add('oswin');
  card.style.removeProperty('--dx'); card.style.removeProperty('--dy'); delete card.dataset.dx; delete card.dataset.dy; osDrag(card, bar);
  bar.querySelector('.mw-app').append(workosMaterialIcon(MENU_ICO.app, 2));
  bar.querySelectorAll('.mw-b b').forEach(b => b.append(winCtl(b.dataset.g)));
  bar.querySelector('.min').onclick = () => { if (!card.classList.contains('locked')) osMinimize(card); };
  // botão na barra só quando a área de trabalho do WorkOS está à vista (menu, intervalo, aplicativos); na pausa não
  if (document.body.classList.contains('menu-mode') || $('modal').classList.contains('apps')) osTaskBtn(card, title); else card.querySelector('.mw-b .min').style.display = 'none';
  bar.querySelector('.max').onclick = () => { sfx(card.classList.contains('maxi') ? 'winMin' : 'winMax'); card.classList.toggle('maxi'); };
  bar.querySelector('.x').onclick = () => { if (card.classList.contains('locked')) return;
    const u = U(), names = [u.back, u.cancel, u.backToWork, u.close].filter(Boolean);
    const b = [...body.querySelectorAll('button')].find(x => /^(back|b|bgBack|dBack|rsCancel|avCancel|phCancel|close)$/.test(x.id) || names.includes(x.textContent.trim()));
    if (b) b.click(); else { sfx('click'); closeModal(); if (document.body.classList.contains('menu-mode')) showMenu(); }
  };
}
function closeModal() {
  if (modal.into && modal.into.isConnected) { const w = modal.into.closest('.os-win'); modal.into = null; if (w) w.close(); return; }
  $('modal').classList.add('hidden'); const t = osTaskOf($('modal').querySelector('.card')); if (t) t.remove();
}

// Ícones do menu: todos 12×12, contorno de tinta, mesma luz (de cima à esquerda); botões da barra de título 7×7
// orbe do botão Iniciar (18x18, desenhado em pixels; sem círculo/degradê do navegador)
const ORB_ICO = ['......................', '.......kkkkkkkk.......', '.....kkllllllllkk.....', '....kWWWlllllllllk....', '...klWWWWlllllllllk...', '..kllWWWWllllllllllk..', '..kllllllllllllllllk..', '.kLLLLqqqqqL9999LLLLk.', '.kLLLLqRRRRLFFF9LLLLk.', '.kLLLLqRRRRLFFF9LLLLk.', '.kLLLLqRRRRLFFF9LLLLk.', '.kLLLLqRRRRLFFF9LLLLk.', '.kLLLLLLLLLLLLLLLLL7k.', '.kLLLLLllllLYYYzLLL7k.', '.kLLLLLllllLYYYzLLL7k.', '..k777Lllll7YYYz777k..', '..k777LLLLL7zzzz777k..', '...k77777777777777k...', '....k777777777777k....', '.....kk77777777kk.....', '.......kkkkkkkk.......', '......................'];
const MENU_ICO = {
  cont: ['..w..w......', '...w..w.....', '..w..w......', '.kkkkkkkk...', '.kTTTTTTkkk.', '.kTWTTTTk.k.', '.kTWTTTTk.k.', '.kTTTTTTkkk.', '.kTTTTTTk...', '.kuuuuuuk...', '..kkkkkk....', '............'],
  play: ['...kkkkkk...', '.kkkmmmmkkk.', 'kWWkkkkkkWWk', 'kWwwwwwwwwPk', 'kWwppppwwwPk', 'kWwwwwwwwwPk', 'kWwpppwwFwPk', 'kWwwwwwFFwPk', 'kWwppFwFwwPk', 'kWwwwFFwwwPk', 'kWPPPPPPPPPk', 'kkkkkkkkkkkk'],
  how: ['.kkkkkkkkkk.', 'kWWWWWWWWWwk', 'kWWWk77kWWwk', 'kWWk7WW7kWwk', 'kWWWWWW7kWwk', 'kWWWWW7kWWwk', 'kWWWWk7WWWwk', 'kWWWWWWWWWwk', 'kWWWWk7WWWwk', '.kwwwwwwwwk.', '..kkwkkkkk..', '...kk.......'],
  cfg:  ['....kkkk....', '.kk.kmmk.kk.', '.kmkkmmkkmk.', '..kmmmmmmk..', 'kkmmMkkMmmkk', 'kmmmk..kmmmk', 'kmmmk..kmmmk', 'kkMmMkkMMMkk', '..kMMMMMMk..', '.kMkkMMkkMk.', '.kk.kMMk.kk.', '....kkkk....'],
  prof: ['....kkkk....', '....kmMk....', '.kkkkMMkkkk.', '.kLLLLLLLLk.', '.kWWWWWWWWk.', '.kWkkkWWWWk.', '.kWksSkWppk.', '.kWkssk7WWk.', '.kWkLLkWppk.', '.kWkkkkWWWk.', '.kWWWWWWWwk.', '.kkkkkkkkkk.'],
  arc:  ['............', '............', '.kkkkkkkkkk.', 'kCCCCCCCCCCk', 'kCCkCCCCRCCk', 'kCkkkCCRCLCk', 'kCCkCCCCLCCk', 'kCCCCkkCCCCk', 'kEECk..kCEEk', '.kkk....kkk.', '............', '............'],
  snd:  ['............', '.....kk.....', '....kMk..k..', '.kkkMMk.k.k.', '.kmmMMk..k.k', '.kmmMMk..k.k', '.kkkMMk.k.k.', '....kMk..k..', '.....kk.....', '............', '............', '............'],
  mute: ['............', '.....kk.....', '....kMk.....', '.kkkMMk.R..R', '.kmmMMk..RR.', '.kmmMMk..RR.', '.kkkMMk.R..R', '....kMk.....', '.....kk.....', '............', '............', '............'],
  app:  ['...kkkkkk...', '.kkl77777kk.', '.k7RRR7FFFk.', 'k77RRR7FFF7k', 'k7RRRR7FFF7k', 'k7777777777k', 'k7LLL7YYYY7k', 'k7LLL7YYY77k', '.k7LLL7YYYk.', '.kk777777kk.', '...kkkkkk...', '............'],   // orbe do WorkOS (janela em 4 cores)
  doc:  ['kkkkkkkk', 'kFFFFFFk', 'kWWWWWWk', 'kWppppWk', 'kWWWWWWk', 'kWpppWWk', 'kWWWWWWk', 'kkkkkkkk'],
  min:  ['.......', '.......', '.......', '.......', '.......', 'kkkkk..', 'kkkkk..'],
  max:  ['kkkkkkk', 'kkkkkkk', 'k.....k', 'k.....k', 'k.....k', 'k.....k', 'kkkkkkk'],
  x:    ['kk...kk', '.kk.kk.', '..kkk..', '..kkk..', '.kk.kk.', 'kk...kk', '.......'],
};
// Ícone de aplicativo da barra de título: sempre a arte em pixels do próprio app, em escala inteira
function workosMaterialIcon(rows, scale = 2) { return Pixel.el(rows, scale); }
// Glifo dos botões da barra (minimizar, maximizar, fechar); o X é branco sobre o botão vermelho
function winCtl(g) { return Pixel.el(MENU_ICO[g], 2, g === 'x' ? { k: WD_PAL.W } : undefined); }
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

// Foto de usuário do WorkOS: independente do crachá. 'av' usa o personagem; as outras são figurinhas prontas 12×12
const OS_PICS = {
  gato:    ['............', '.k........k.', '.kek....kek.', '.keekkkkeek.', '.keeeeeeeek.', 'keekeeeekeek', 'keeeeeeeeeek', 'keeeerreeeek', '.keeeeeeeek.', '..kkeeeekk..', '....kkkk....', '............'],
  cao:     ['............', '.kkk....kkk.', 'k22k.kk.k22k', 'k22kk11kk22k', '.kk111111kk.', '..k1k11k1k..', '..k111111k..', '..k11kk11k..', '...k1RR1k...', '....kkkk....', '............', '............'],
  flor:    ['....kkkk....', '...kRRRRk...', '.kkkRRRRkkk.', 'kRRRkYYkRRRk', 'kRRRkYYkRRRk', '.kkkRRRRkkk.', '...kRRRRk...', '....kkkk....', '.....kG.....', '..kGGkG.....', '...kkkG.....', '.....kG.....'],
  monte:   ['llllllllllll', 'lllllllYYlll', 'llllllYYYYll', 'lllkllYYYYll', 'llkWklllllll', 'lkWWWkllklll', 'kGkWkGkkhkll', 'GGGkGGkhhhkl', 'GGGGGGhhhhhk', 'hhhhhhhhhhhh', 'HHHHHHHHHHHH', 'HHHHHHHHHHHH'],
  coracao: ['............', '.kkk....kkk.', 'kRRRk..kRRRk', 'kRrRRkkRRRRk', 'kRrRRRRRRRRk', 'kRRRRRRRRRRk', '.kRRRRRRRRk.', '..kRRRRRRk..', '...kRRRRk...', '....kRRk....', '.....kk.....', '............'],
  estrela: ['.....kk.....', '....kYYk....', '....kYYk....', 'kkkkYYYYkkkk', 'kYYYYYYYYYYk', '.kYYYYYYYYk.', '..kYYYYYYk..', '..kYYkkYYk..', '.kYYk..kYYk.', '.kYk....kYk.', '.kk......kk.', '............'],
  cafe:    MENU_ICO.cont,
  nota:    ['.....kkkkkk.', '.....kIIIIk.', '.....kkkkIk.', '.....k...Ik.', '.....k...Ik.', '.....k...Ik.', '..kkkk.kkkk.', '.k6666kk666k', '.k6666kk666k', '..kkkk..kkk.', '............', '............'],
  foguete: ['.....kk.....', '....kWWk....', '...kWWWWk...', '...kWllWk...', '...kWllWk...', '...kWWWWk...', '..kkWWWWkk..', '.kRkWWWWkRk.', '.kkkkkkkkkk.', '....kQQk....', '.....QQ.....', '.....Q......'],
  jogo:    MENU_ICO.arc,
  engrenagem: MENU_ICO.cfg,
};
function osPicEl(size) { const rows = CFG.osPic && OS_PICS[CFG.osPic]; return rows ? Pixel.el(rows, Math.max(1, Math.floor(size / 12))) : portrait(size); }
// Seletor de foto: grade de figurinhas + o personagem
function osPicPicker(anchor, onPick) {
  const g = document.createElement('div'); g.className = 'os-pics';
  ['av', ...Object.keys(OS_PICS)].forEach(k => {
    const b = document.createElement('button'); b.className = 'os-pic' + ((CFG.osPic || 'av') === k ? ' on' : '');
    b.append(k === 'av' ? portrait(36) : Pixel.el(OS_PICS[k], 3));
    b.onclick = e => { e.stopPropagation(); CFG.osPic = k === 'av' ? null : k; persist(); sfx('click'); g.remove(); onPick(); if (typeof Msn !== 'undefined' && Msn.visible()) Msn.render(); };
    g.append(b);
  });
  anchor.after(g);
}

// Botão Iniciar do WorkOS (no menu principal): atalhos e "Desligar", que fecha o WorkOS com animação e volta ao menu
function osStart(u) {
  const m = $('modal'); m.querySelectorAll('.os-start, .os-smenu').forEach(e => e.remove());
  m.insertAdjacentHTML('beforeend', `<button class="os-start" aria-haspopup="true"></button><div class="os-smenu hidden"><div class="os-sh"><span class="os-me"></span><b></b></div>
    <button data-a="prof"><span class="smi"></span>${u.profile}</button><button data-a="msn" data-msn-badge><span class="smi"></span>${u.msn.app}</button><button data-a="pc"><span class="smi"></span>${u.customizePc || 'WorkOS'}</button><button data-a="arr" class="desk-only"><span class="smi"></span>${u.arr.title}</button><button data-a="cfg"><span class="smi"></span>${u.settings}</button><i></i><button data-a="off"><span class="smi"></span>${u.shutdown}</button></div>`);
  { const SMI = { prof: MENU_ICO.prof, msn: APP_ICO.msn, pc: APP_ICO.paint, arr: APP_ICO.arq, cfg: MENU_ICO.cfg, off: MENU_ICO.x }; m.querySelectorAll('.os-smenu button').forEach(bt => bt.querySelector('.smi').append(Pixel.el(SMI[bt.dataset.a], 2, bt.dataset.a === 'off' ? { k: WD_PAL.q } : undefined))); }
  const b = m.querySelector('.os-start'), sm = m.querySelector('.os-smenu');
  b.append(Pixel.el(ORB_ICO, 3)); b.title = 'WorkOS';   // orbe grande, como o Iniciar do Windows 7
  const paintMe = () => sm.querySelector('.os-me').replaceChildren(osPicEl(40));
  paintMe(); sm.querySelector('b').textContent = profileName();
  sm.querySelector('.os-me').onclick = e => { e.stopPropagation(); const old = sm.querySelector('.os-pics'); if (old) old.remove(); else osPicPicker(sm.querySelector('.os-sh'), paintMe); };
  const brk = S && S.onBreak, home = brk ? breakHome : showMenu;
  if (brk) sm.querySelector('[data-a=off]').textContent = u.breakEnd;
  const items = { msn: () => Msn.open(), prof: () => showBadge(home), pc: () => showCustomize(home), cfg: () => showSettings(home), arr: () => deskEditStart() };
  b.onclick = e => { e.stopPropagation(); sm.classList.toggle('hidden'); b.classList.toggle('on'); sfx(sm.classList.contains('hidden') ? 'click' : 'start'); };
  sm.onclick = e => { const a = e.target.closest('button'); if (!a) return; sm.classList.add('hidden'); b.classList.remove('on');
    if (a.dataset.a === 'off') return brk ? endBreak() : osShutdown(); sfx('click'); items[a.dataset.a](); };
  m.addEventListener('pointerdown', e => { if (!e.target.closest('.os-smenu, .os-start')) { sm.classList.add('hidden'); b.classList.remove('on'); } });
}
function osShutdown() {
  sfx('shutdown');
  const o = document.createElement('div'); o.className = 'os-off'; o.innerHTML = `<b>${U().shuttingDown}</b>`; uiRoot().append(o);
  setTimeout(() => { o.classList.add('done'); setTimeout(() => { showMenu(); showTitle(); o.remove(); }, 700); }, 900);   // desliga e volta à tela de título (orbe no centro)
}

// A dificuldade só muda entre dias: durante o expediente (mesmo pausado) fica travada
function diffLocked() { return !!(S && S.running) || !!load('carreira', null); }   // fixa durante a carreira inteira; escolhida ao começar

// Nova carreira: escolhe a dificuldade antes (depois dá para trocar nas Configurações, entre dias)
function setDifficulty(v) { save('recorde2', P.best); CFG.diff = DIFF_REC = v; P.best = load('recorde2', 0); persist(); }
// Arrastar pela barra de título (computador). Usa a propriedade translate (--dx/--dy), sem brigar com as animações.
function osDrag(win, bar) {
  if (document.body.classList.contains('touch')) return;
  bar.style.cursor = 'move';
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('.mw-b') || win.classList.contains('maxi')) return;
    e.preventDefault(); bar.setPointerCapture(e.pointerId);
    const sx = e.clientX - (+win.dataset.dx || 0), sy = e.clientY - (+win.dataset.dy || 0), r0 = win.getBoundingClientRect(), ox = +win.dataset.dx || 0, oy = +win.dataset.dy || 0;
    const mv = ev => {
      let dx = ev.clientX - sx, dy = ev.clientY - sy;
      dx = Math.max(ox - r0.left - r0.width + 80, Math.min(ox + innerWidth - r0.left - 80, dx));     // sempre sobra um pedaço visível
      const mb = $('modal').getBoundingClientRect(), fs = parseFloat(getComputedStyle($('modal')).fontSize) || 16, floor = mb.bottom - fs * 2.5;   // nunca por cima da barra de tarefas
      dy = Math.max(oy - r0.top + mb.top, Math.min(oy + floor - r0.bottom, dy));
      win.dataset.dx = dx; win.dataset.dy = dy; win.style.setProperty('--dx', dx + 'px'); win.style.setProperty('--dy', dy + 'px');
    };
    const up = () => { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); };
    bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up);
  });
}
// Minimizar: a janela some e vira um botão na barra de tarefas; clicar nele restaura
function osTasks() { let t = $('modal').querySelector('.os-tasks'); if (!t) { t = document.createElement('div'); t.className = 'os-tasks'; $('modal').append(t); } return t; }
function osSyncMin() { const m = $('modal'), open = [...m.querySelectorAll('.card, .os-win')].some(w => w.style.display !== 'none' && !(w.classList.contains('card') && m.classList.contains('hidden'))); m.classList.toggle('allmin', !open); osSyncFocus(); }
// Barra de tarefas: cada janela aberta tem um botão. Clicar: se minimizada, restaura; se é a da frente, minimiza; senão traz para a frente
let OS_Z = 10;
// Um botão da barra nunca sobrevive à sua janela: qualquer caminho que remova a janela (fechar, trocar de tela,
// carregar o jogo, encerrar o intervalo) leva o botão junto. Sem isso, botões vazios se acumulavam e viravam riscos.
new MutationObserver(() => {
  $('modal').querySelectorAll('.os-task').forEach(b => { if (!b._win || !b._win.isConnected) b.remove(); });
  osSyncFocus();
})
  .observe($('modal'), { childList: true, subtree: true });
function osTaskOf(win) { return [...$('modal').querySelectorAll('.os-task')].find(b => b._win === win); }
function osSyncFocus() {
  const m = $('modal');
  const visible = [...m.querySelectorAll('.card, .os-win')].filter(w => w.style.display !== 'none' && !(w.classList.contains('card') && m.classList.contains('hidden')));
  if (visible.length && visible.every(w => w.classList.contains('inactive'))) {
    osFocus(visible.sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0]);
  }
}
function osFocus(win) {
  win.style.zIndex = ++OS_Z;
  $('modal').querySelectorAll('.os-win, .card.oswin, .card.menu-card').forEach(w => {
    const active = w === win; w.classList.toggle('active', active); w.classList.toggle('inactive', !active);
  });
  $('modal').querySelectorAll('.os-task').forEach(b => b.classList.toggle('on', b._win === win));
}
function osTaskBtn(win, title, icon) {
  let btn = osTaskOf(win);
  if (!btn) {
    btn = document.createElement('button'); btn.className = 'os-task'; btn._win = win;
    btn.append(workosMaterialIcon(icon || MENU_ICO.app, document.body.classList.contains('mobile') ? 2 : 1)); btn.append(document.createTextNode(''));   // ícone do próprio aplicativo
    btn.onclick = () => { if (win.style.display === 'none') osRestore(win); else if (btn.classList.contains('on')) osMinimize(win); else { sfx('click'); osFocus(win); } };
    osTasks().append(btn);
    if (!win._taskWatch) { win._taskWatch = true; win.addEventListener('pointerdown', () => osFocus(win)); }
  }
  btn.lastChild.textContent = ' ' + title;
  return btn;
}
const osFly = (win, btn) => { const a = win.getBoundingClientRect(), c = btn.getBoundingClientRect();
  return `translate(${Math.round(c.left + c.width / 2 - a.left - a.width / 2)}px, ${Math.round(c.top + c.height / 2 - a.top - a.height / 2)}px) scale(.08)`; };
// minimizar: a janela encolhe e voa até o próprio botão na barra; restaurar faz o caminho de volta
function osMinimize(win) {
  const btn = osTaskOf(win); if (!btn) return; sfx('winMin');
  // efeito "gênio": a janela estreita primeiro e depois escorre até o botão
  const fly = osFly(win, btn);
  const mv = fly.replace(' scale(.08)', '');
  Motion.play(win, [{ transform: 'none', clipPath: 'inset(0 0 0 0)' }, { transform: 'none', clipPath: 'inset(calc(100% - 3px) 0 0 0)', offset: .45 }, { transform: mv, clipPath: 'inset(calc(100% - 3px) 35% 0 35%)' }], { duration: 300, easing: 'steps(10)', fill: 'none' });
  btn.classList.remove('on'); Motion.punch && Motion.punch(btn, 1.08);
  setTimeout(() => { win.style.display = 'none'; osSyncMin(); }, 290);
}
function osRestore(win) {
  const btn = osTaskOf(win); sfx('winMax'); win.style.display = ''; osSyncMin(); osFocus(win);
  if (btn) { const mv = osFly(win, btn).replace(' scale(.08)', ''); Motion.play(win, [{ transform: mv, clipPath: 'inset(calc(100% - 3px) 35% 0 35%)' }, { transform: 'none', clipPath: 'inset(calc(100% - 3px) 0 0 0)', offset: .55 }, { transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 300, easing: 'steps(10)' }); }
}
// Ícones dos aplicativos do WorkOS (12×12, mesma luz e contorno dos outros)
const APP_ICO = {
  cal:   ['.k.k..k.k...', 'kkkkkkkkkkk.', 'kRRRRRRRRRk.', 'kqqqqqqqqqk.', 'kWWWWWWWWWk.', 'kWpWpWpWpWk.', 'kWWWWWWWWWk.', 'kWpWRWpWpWk.', 'kWWWWWWWWWk.', 'kWpWpWpWWWk.', 'kkkkkkkkkkk.', '............'],
  calc: ['.kkkkkkkkkk.', 'kCCCCCCCCCEk', 'kCkkkkkkkCEk', 'kCkvvvvVkCEk', 'kCkkkkkkkCEk', 'kCkWkWkRkCEk', 'kCkkkkkkkCEk', 'kCkWkWkWkCEk', 'kCkkkkkkkCEk', 'kCkWkWkFkCEk', 'kEEEEEEEEEEk', '.kkkkkkkkkk.'],
  music: ['.......k....', '......k.....', '.....k......', '.kkkkkkkkkk.', 'kTTTTTTTTTuk', 'kTkkkkTkkTuk', 'kTkJjkTkYkuk', 'kTkjJkTkkTuk', 'kTkJjkTWWTuk', 'kTkkkkTTTTuk', 'kuuuuuuuuuuk', '.kk......kk.'],
  notes: ['..k.k.k.k...', '.kkkkkkkkk..', '.kyyyyyyyk..', '.kYYYYYYYk..', '.kYZZZZZYk..', '.kYYYYYYYk..', '.kYZZZZYYk..', '.kYYYYYYYk..', '.kYZZZYYYk..', '.kYYYYYYzk..', '.kkkkkkkk...', '............'],
  paint: ['...kkkkk....', '.kkWWWWWkk..', 'kWWRRWWLLWk.', 'kWWRRWWLLWWk', 'kWWWWWWWWWWk', 'kWYYWkkWWWwk', 'kWYYk..kWWwk', 'kWWWk..kFFwk', '.kWWWkkWFFwk', '..kwwwwwwwk.', '...kkkkkkk..', '............'],
};
// Calculadora: mouse/toque e teclado (o teclado só vale com a janela aberta e é liberado ao fechar)
function osCalc() {
  const w = osWindow(U().osApps.calc, `<div class="calc"><div class="calc-hist"></div><div class="calc-d">0</div><div class="calc-k">${['C', '←', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '±', '='].map(k => `<button class="pxbtn${/[=]/.test(k) ? ' main' : ''}" data-k="${k}">${k === '*' ? '×' : k === '/' ? '÷' : k}</button>`).join('')}</div></div>`, { icon: APP_ICO.calc, cls: 'calc-win', onClose: () => removeEventListener('keydown', key, true) });
  const d = w.querySelector('.calc-d'), h = w.querySelector('.calc-hist'); let cur = '0', acc = null, op = null, fresh = false;
  const fmtN = n => String(+(+n).toPrecision(12));
  const calc = () => { const a = +acc, b = +cur; return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? (b === 0 ? NaN : a / b) : b; };
  const press = k => {
    if (/\d/.test(k)) { cur = fresh || cur === '0' ? k : (cur.length < 14 ? cur + k : cur); fresh = false; }
    else if (k === '.') { if (fresh) { cur = '0'; fresh = false; } if (!cur.includes('.')) cur += '.'; }
    else if (k === 'C') { cur = '0'; acc = op = null; }
    else if (k === '←') cur = cur.length > 1 ? cur.slice(0, -1) : '0';
    else if (k === '±') cur = fmtN(-cur);
    else if (k === '%') cur = fmtN(acc !== null ? acc * cur / 100 : cur / 100);
    else if ('+-*/'.includes(k)) { if (op && !fresh) cur = fmtN(calc()); acc = cur; op = k; fresh = true; }
    else if (k === '=') { if (op) { const r = calc(); h.textContent = `${fmtN(acc)} ${op} ${fmtN(cur)} = ${isNaN(r) ? 'Erro' : fmtN(r)}`; cur = isNaN(r) ? '0' : fmtN(r); acc = op = null; fresh = true; } }
    d.textContent = cur; sfx('key');
  };
  w.querySelectorAll('[data-k]').forEach(b => b.onclick = () => press(b.dataset.k));
  const key = e => { if (!w.isConnected || w.style.display === 'none') return; const m = { Enter: '=', Backspace: '←', Escape: 'C', ',': '.' }, k = m[e.key] || e.key;
    if (/^[\d.+\-*/%=C←]$/.test(k)) { e.preventDefault(); e.stopPropagation(); press(k); } };
  addEventListener('keydown', key, true);
}
// Calendário (expediente e data real) e Arquivo de conquistas: ver 40-eventos.js
// Bloco de notas: salva sozinho no aparelho
function osNotes() {
  const w = osWindow(U().osApps.notes, `<textarea class="notes" spellcheck="false" maxlength="5000"></textarea><small class="notes-st"></small>`, { icon: APP_ICO.notes, cls: 'notes-win' });
  const ta = w.querySelector('textarea'), st = w.querySelector('.notes-st'); ta.value = load('notas', '');
  let tm = 0; ta.oninput = () => { clearTimeout(tm); st.textContent = '…'; tm = setTimeout(() => { save('notas', ta.value); st.textContent = U().osApps.saved; }, 400); };
  ta.addEventListener('keydown', e => e.stopPropagation());
  ta.focus();
}
// Playlist: liga/desliga cada faixa, mostra o que está tocando e permite pular
function osMusic() {
  const u = U(), t = u.osApps, w = osWindow(t.music, `<p class="pl-now"></p><ul class="pl">${PLAYLIST.map(p => `<li><button class="pxbtn pl-t" data-t="${p.id}"><i class="pl-ck"></i><b>${t.tracks[p.id][0]}</b><small>${t.tracks[p.id][1]}</small></button></li>`).join('')}</ul>
    <div class="actions"><button class="pxbtn" id="plSkip">${t.skip}</button></div>`, { icon: APP_ICO.music, cls: 'pl-win' });
  const paint = () => {
    w.querySelectorAll('.pl-t').forEach(b => b.classList.toggle('on', trackOn(b.dataset.t)));
    const cur = PLAYLIST.find(p => p.src === A.nowPlaying);
    w.querySelector('.pl-now').textContent = !soundOn ? t.soundOff : cur ? `♪ ${t.tracks[cur.id][0]}` : t.nothing;
  };
  w.querySelectorAll('.pl-t').forEach(b => b.onclick = () => { CFG.playlist = Object.assign({}, CFG.playlist, { [b.dataset.t]: !trackOn(b.dataset.t) }); persist(); sfx('click');
    const cur = PLAYLIST.find(p => p.src === A.nowPlaying); if (!cur || cur.id === b.dataset.t) playlistApply(); paint(); });
  w.querySelector('#plSkip').onclick = () => { sfx('click'); playlistApply(true); setTimeout(paint, 50); };
  const iv = setInterval(() => { if (!w.isConnected) clearInterval(iv); else paint(); }, 1000);
  paint();
}
function osApp(id) {
  if (id === 'music') return osMusic();
  if (id === 'workday') { const c = $('modal').querySelector('.menu-card'); if (!c) showMenu(); else if (c.style.display === 'none') osRestore(c); else { osFocus(c); Motion.shake(c, 3); } return; }
  if (id === 'cal') return osCalendar();
  if (id === 'calc') return osCalc();
  if (id === 'arq') return osArchive();
  if (id === 'shop') return osCatalog();
  if (id === 'notes') return osNotes();
  if (id === 'msn') return Msn.open();   // MSworkN: uma janela só (abrir de novo foca/restaura)
  if (id === 'paint' || id === 'prof') {   // a tela existente roda dentro de uma janela própria, sem tirar o portal do lugar
    const u = U(), w = osWindow(id === 'paint' ? u.osApps.paint : u.profile, '', { icon: id === 'paint' ? APP_ICO.paint : MENU_ICO.prof, cls: 'app-win', onClose: () => { if (modal.into && !modal.into.isConnected) modal.into = null; } });
    const body = w.querySelector('.mw-in'), route = () => { modal.into = body; };
    w.addEventListener('pointerdown', route, true); route();
    if (!osApp.hooked) { osApp.hooked = true; $('modal').addEventListener('pointerdown', e => { if (!e.target.closest('.app-win')) modal.into = null; }, true); }
    const close = () => w.close();
    if (id === 'paint') showCustomize(close); else showBadge(close);
    return;
  }
}
function osIcons() {
  const m = $('modal'), t = U().osApps; m.querySelectorAll('.os-icons').forEach(e => e.remove());
  const g = document.createElement('div'); g.className = 'os-icons';
  for (const [id, rows, label, pal] of [...(S && S.onBreak ? [] : [['workday', SPR2.doc, 'PORTAL_RH.EXE', WD_SECTOR_RAMP.ti]]), ['cal', APP_ICO.cal, t.calendar], ['calc', APP_ICO.calc, t.calc], ['notes', APP_ICO.notes, t.notes], ['music', APP_ICO.music, t.music], ['paint', APP_ICO.paint, t.paint], ['prof', MENU_ICO.prof, U().profile], ['arq', APP_ICO.arq, U().ev.archive], ['shop', APP_ICO.shop, U().cat.app], ['msn', APP_ICO.msn, U().msn.exe]]) {
    const d = document.createElement('button'); d.className = 'osicon'; d.dataset.app = id; if (id === 'msn') d.dataset.msnBadge = ''; d.append(Pixel.el(rows, 3, pal)); d.insertAdjacentHTML('beforeend', `<span>${label}</span>`);
    const open = () => { g.querySelectorAll('.osicon').forEach(x => x.classList.remove('sel')); sfx('pop'); osApp(id); };
    d.onclick = () => { const n = performance.now(); if (n - (osIcons.last || 0) < 700) return; osIcons.last = n; open(); };   // um clique abre; cliques repetidos não duplicam
    g.append(d);
  }
  m.append(g);
  if (typeof Msn !== 'undefined') Msn.badges();
}

// Animações de janela em pixel art: nada de escala fracionada (borra a grade). Abrir: a janela se desenha do centro
// para fora em degraus (primeiro uma linha, depois a altura). Fechar: o contrário, como monitor CRT desligando.
const OS_OPEN = [{ clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(calc(50% - 1px) 0 calc(50% - 1px) 0)', offset: .35 }, { clipPath: 'inset(0 0 0 0)' }];
const OS_CLOSE = [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(calc(50% - 1px) 0 calc(50% - 1px) 0)', offset: .6 }, { clipPath: 'inset(50% 50% 50% 50%)' }];
// Janela flutuante do WorkOS (abre com animação de janela, fecha no X). Base para outras janelas do sistema.
function osWindow(title, html, { icon = MENU_ICO.app, cls = '', onClose } = {}) {
  const w = document.createElement('div'); w.className = 'os-win ' + cls;
  w.innerHTML = `<div class="mw-bar"><span class="mw-ttl"><i class="mw-app"></i>${title}</span><i class="mw-stripes"></i><span class="mw-b"><b data-g="x"></b></span></div><div class="mw-in">${html}</div>`;
  w.querySelector('.mw-app').append(workosMaterialIcon(icon, 2)); w.querySelector('.mw-b b').append(winCtl('x'));
  const close = () => { sfx('winClose'); const a = Motion.play(w, OS_CLOSE, { duration: 260, easing: 'steps(8)' }); const end = () => { const t = osTaskOf(w); if (t) t.remove(); w.remove(); if (onClose) onClose(); if (typeof workAppsClosed === 'function') workAppsClosed(); }; if (a) a.onfinish = end; else end(); };
  w.querySelector('.mw-b').insertAdjacentHTML('afterbegin', '<b data-g="min" class="min"></b><b data-g="max" class="max"></b>');
  w.querySelectorAll('.mw-b .min, .mw-b .max').forEach(b => b.append(winCtl(b.dataset.g)));
  w.querySelector('.mw-b .min').onclick = () => osMinimize(w);
  w.querySelector('.mw-b .max').onclick = () => { sfx(w.classList.contains('maxi') ? 'winMin' : 'winMax'); w.classList.toggle('maxi'); };
  w.querySelector('.mw-b [data-g=x]').onclick = close; w.close = close;
  $('modal').append(w); sfx('winOpen'); osDrag(w, w.querySelector('.mw-bar')); osTaskBtn(w, title, icon); osFocus(w);
  Motion.play(w, OS_OPEN, { duration: 300, easing: 'steps(10)', fill: 'none' });   // sem recorte depois de abrir (balões podem sair da janela)
  return w;
}
function pickDifficulty(back) {
  const u = U(); let sel = CFG.diff || 'normal';
  $('modal').querySelectorAll('.diff-win').forEach(e => { const t = osTaskOf(e); if (t) t.remove(); e.remove(); });
  const inMenu = $('modal').querySelector('.menu-card');
  if (!inMenu) { showMenu(); return pickDifficulty(back); }
  const w = osWindow(`${u.diffLabel.toUpperCase()}.EXE`, `<div class="diff-list">${Object.keys(DIFFS).map(k => `<button class="pxbtn diff-opt" data-d="${k}"><span class="dmeter">${'<i></i>'.repeat(4)}</span><b>${u.diffNames[k]}</b><small>${u.diffDesc[k]}</small></button>`).join('')}</div>
    <div class="actions"><button class="pxbtn main" id="dOk"></button></div>`, { cls: 'diff-win' });
  w.querySelectorAll('.dmeter').forEach((m, n) => m.querySelectorAll('i').forEach((i, k) => i.classList.toggle('on', k <= n)));
  const paint = () => { w.querySelectorAll('[data-d]').forEach(b => b.classList.toggle('on', b.dataset.d === sel)); w.querySelector('#dOk').textContent = `${u.diffStart}: ${u.diffNames[sel]}`; };
  const go = () => { setDifficulty(sel); sfx('ok'); w.remove(); launchWorkday(); };
  // 1º clique escolhe; clicar de novo na mesma (ou no botão de confirmar) começa a carreira
  w.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (b.dataset.d === sel && b.dataset.armed) return go(); w.querySelectorAll('[data-d]').forEach(x => delete x.dataset.armed); sel = b.dataset.d; b.dataset.armed = 1; sfx('click'); paint(); });
  w.querySelector('#dOk').onclick = go;
  paint();
}
// WORKDAY.EXE: janela de carregamento com barra em blocos; ao encher, começa o expediente
function launchWorkday() {
  const u = U(), w = osWindow('WORKDAY.EXE', `<div class="ld"><span class="ld-logo"></span><div class="ld-bar">${'<i></i>'.repeat(16)}</div><small>${u.loading}</small></div>`, { icon: MENU_ICO.doc, cls: 'load-win' });
  w.querySelector('.mw-b').style.visibility = 'hidden';
  w.querySelector('.ld-logo').append(pxSize(logoCanvas(), 3));
  const cells = [...w.querySelectorAll('.ld-bar i')]; let n = 0;
  const tick = () => { if (!w.isConnected) return; if (n < cells.length) { cells[n++].classList.add('on'); if (n % 4 === 0) sfx('key'); setTimeout(tick, 60 + Math.random() * 90); } else setTimeout(() => wipe(() => { w.remove(); newCareer(); }), 250); };
  setTimeout(tick, 300);
}
// Chegada: depois da tela de título, a batida de ponto (só cerimônia) e então o computador com o portal
let ARRIVED = false;
function showArrival() {
  music('menu'); const u = U();
  const sc = scene('sc-in');
  sc.innerHTML = `<div class="sc-col"><h2>${u.arrival}</h2><p class="sc-hint">${u.holdFinger}</p></div>`;
  const stg = Stage.mount(sc, 'hall', { eve: false });
  const dev = clockDevice(gameTime());   // chegada sorteada 07h–08h (relógio global)
  const z = +Math.max(0.8, Math.min(1.4, (innerHeight - 330) / 330, (innerWidth - 32) / 330)).toFixed(2);
  dev.style.zoom = z; pxSnap(dev.querySelector('.pad canvas'), 5, z);
  sc.querySelector('.sc-col').append(dev);
  hallAttach(stg, dev);
  sceneIn(sc, 'h2, .sc-hint', 70, 380);
  fingerprint(dev, () => wipe(() => { closeScene(); ARRIVED = true; showMenu(); }));
}
// Tela de título: nome do jogo e o botão Iniciar (orbe do WorkOS) no centro
function showTitle() {
  const t = document.createElement('div'), a = U().acc; t.id = 'titlescr';
  // nome de usuário obrigatório: cada nome tem o próprio save (ver WD_ACC em 00-cabecalho.js)
  t.innerHTML = `<div class="tt-logo"></div><form class="tt-user" autocomplete="off"><label for="ttName">${a.label}</label>
    <input id="ttName" class="tt-name" type="text" maxlength="18" placeholder="${a.ph}" list="ttUsers" autocomplete="off" spellcheck="false">
    <datalist id="ttUsers">${WD_ACC.list.map(x => `<option value="${String(x.name).replace(/"/g, '&quot;')}">`).join('')}</datalist><span class="tt-hint" role="alert"></span></form>
    <button class="tt-orb" aria-label="${U().diffStart}"></button><p class="tt-legal">${U().footer}</p>`;
  t.querySelector('.tt-logo').append(pxSize(logoCanvas(), 8));
  t.querySelector('.tt-orb').append(Pixel.el(MENU_ICO.app, 8));
  document.body.append(t);
  const inp = t.querySelector('.tt-name'), hint = t.querySelector('.tt-hint');
  inp.value = WD_ACC.cur ? WD_ACC.cur.name : (PROFILE.name || '').trim();
  inp.addEventListener('keydown', e => e.stopPropagation());
  const go = () => {
    const r = wdLogin(inp.value);
    if (r === 'empty') { hint.textContent = a.need; Motion.shake(inp, 4); sfx('click'); inp.focus(); return; }
    removeEventListener('keydown', key); sfx('ok');
    if (r === 'reload') return;   // outra conta: recarrega já com o save dela
    wipe(() => { t.remove(); showMenu(); showArrival(); });
  };
  const key = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
  t.querySelector('form').onsubmit = e => { e.preventDefault(); go(); };
  t.querySelector('.tt-orb').onclick = go; addEventListener('keydown', key);
  if (!document.body.classList.contains('touch')) setTimeout(() => inp.focus(), 50);
}
// Entrar com um nome: cria a conta se for nova. Trocar de conta recarrega o jogo com o save daquela conta.
function wdAccountId(name) { return String(name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' '); }
function wdLogin(name) {
  name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 18); const id = wdAccountId(name); if (!id) return 'empty';
  const list = WD_ACC.list.slice(); let acc = list.find(x => x.id === id);
  if (!acc) { acc = { id, name, ns: (list.length || id === 'teste gatos') ? 'u' + Date.now().toString(36) : '' }; list.push(acc); }
  try { localStorage.setItem('expediente-usuarios', JSON.stringify(list)); localStorage.setItem('expediente-usuario', id); } catch (e) {}
  const same = WD_ACC.cur ? WD_ACC.cur.id === id : !acc.ns;
  WD_ACC.list = list;
  if (!same) { try { sessionStorage.setItem('wd-login', name); } catch (e) {} location.reload(); return 'reload'; }
  WD_ACC.cur = acc;
  if (!(PROFILE.name || '').trim()) { PROFILE.name = name; saveProfile(); }
  return 'ok';
}

function logoCanvas() {
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
    return lc;
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
  const card = modal(`<div class="mw"><div class="mw-bar"><span class="mw-ttl"><i class="mw-app"></i>PORTAL_RH.EXE</span><i class="mw-stripes"></i><span class="mw-b" aria-hidden="true"><b data-g="min"></b><b data-g="max"></b><b data-g="x"></b></span></div>
    <div class="mw-in">
      <div class="mw-hero"><span class="mw-face"></span><div><h2 class="mw-logo" aria-label="WORKDAY"></h2><p class="mw-tag">${u.tagline}</p></div></div>
      <div class="mw-stats"><span><small>${u.record}</small><b>${fmt(P.best)}</b></span><span><small>${u.wallet}</small><b>${money(P.wallet)}</b></span><span><small>${u.daysWorked}</small><b>${fmt(P.stats.days)}</b></span></div>
      <div class="menu">
        ${saved ? `<button class="pxbtn main" id="cont">${ico('cont')}${u.cont(saved.day + 1)}</button>` : ''}
        <button class="pxbtn${saved ? '' : ' main'}" id="play">${ico('play')}${u.play}</button>
        ${document.body.classList.contains('mobile') ? `<button class="pxbtn" id="msnb" data-msn-badge>${ico('msn')}${u.msn.app}</button>` : ''}
        <button class="pxbtn" id="how">${ico('how')}${u.how}</button>
        <button class="pxbtn" id="cfg">${ico('cfg')}${u.settings}</button>
        <button class="pxbtn" id="prof">${ico('prof')}${u.profile}</button>
        ${arcadeUnlocked() ? `<button class="pxbtn arcade" id="arc" aria-label="${u.arcadeBtn}" title="${u.arcadeBtn}">${ico('arc')}${u.arcadeBtn}</button>` : ''}
        <button class="pxbtn menusound" id="msnd">${ico('snd')}${soundOn ? u.soundLabel + ': ' + u.soundOn : u.soundLabel + ': ' + u.soundOff}</button>
      </div>
    </div></div>`);
  card.classList.add('menu-card');
  card.querySelectorAll('.mico').forEach(i => { const n = i.dataset.i === 'snd' && !soundOn ? 'mute' : i.dataset.i; i.append(Pixel.el(n === 'msn' ? APP_ICO.msn : MENU_ICO[n], n === 'msn' ? 1 : 2)); });
  card.querySelectorAll('.mw-b b').forEach(b => b.append(winCtl(b.dataset.g)));
  // o portal não fecha: minimizar (ou fechar) manda para a barra de tarefas; maximizar alterna o tamanho
  osTaskBtn(card, 'PORTAL_RH.EXE', SPR2.doc);
  card.querySelector('.mw-b [data-g=min]').onclick = card.querySelector('.mw-b [data-g=x]').onclick = () => osMinimize(card);
  card.querySelector('.mw-b [data-g=max]').onclick = () => { sfx('click'); card.classList.toggle('maxi'); };
  card.style.removeProperty('--dx'); card.style.removeProperty('--dy'); delete card.dataset.dx; delete card.dataset.dy; osDrag(card, card.querySelector('.mw-bar'));
  card.querySelector('.mw-app').append(workosMaterialIcon(MENU_ICO.app, 2));
  card.querySelector('.mw-face').append(portrait(112));
  {     const logo = card.querySelector('.mw-logo'); logo.append(pxSize(logoCanvas(), 5)); Motion.dropIn(logo); }
  sceneIn(card, '.mw-stats span, .menu .pxbtn', 45, 300);
  // som: troca só o ícone e o texto do botão (sem redesenhar o portal inteiro)
  card.querySelector('#msnd').onclick = () => { setSound(!soundOn); const b = card.querySelector('#msnd'), i = b.querySelector('.mico');
    i.replaceChildren(Pixel.el(MENU_ICO[soundOn ? 'snd' : 'mute'], 2)); b.lastChild.textContent = u.soundLabel + ': ' + (soundOn ? u.soundOn : u.soundOff); Motion.press && Motion.press(b); };
  fitLegal();
  osStart(u); osIcons();
  osSyncMin();
  card.querySelector('#play').onclick = () => pickDifficulty(showMenu);
  if (saved) card.querySelector('#cont').onclick = resumeCareer;
  card.querySelector('#how').onclick = () => { const c = modal(`<h2>${u.how}</h2>${u.howText}<div class="actions"><button class="pxbtn main" id="b">${u.back}</button></div>`); c.querySelector('#b').onclick = showMenu; };
  card.querySelector('#cfg').onclick = () => showSettings(showMenu);
  card.querySelector('#prof').onclick = showProfile;
  if (card.querySelector('#msnb')) card.querySelector('#msnb').onclick = () => Msn.open();
  if (typeof Msn !== 'undefined') Msn.badges();
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
  if (typeof msnProfileLine === 'function') card.querySelector('.over-who').append(msnProfileLine());
  card.querySelector('#eb').onclick = () => showBadge(showProfile);
  card.querySelector('#b').onclick = showMenu;
}

function showSettings(onBack) {
  const u = U();
  const seg = (name, opts, cur) => `<div class="seg" data-set="${name}">${opts.map(([v, l]) => `<button class="pxbtn${v === cur ? ' on' : ''}" data-v="${v}">${l}</button>`).join('')}</div>`;
  const card = modal(`<h2>${u.settings}</h2>
    <h3 class="set-h">${u.setSec.lang}</h3><div class="setting"><span>${u.language}</span>${seg('lang', Object.entries(LANGS).map(([k, v]) => [k, v.label]), CFG.lang)}</div>
    <div class="setting"><span>${u.theme}</span>${seg('theme', [['system', u.themeSystem], ['light', u.themeLight], ['dark', u.themeDark]], CFG.theme)}</div>
    <h3 class="set-h">${u.setSec.game}</h3><div class="setting"><span>${u.diffLabel}</span>${seg('diff', Object.keys(DIFFS).map(k => [k, u.diffNames[k]]), CFG.diff || 'normal')}${diffLocked() ? `<small class="hint">${u.diffLocked}</small>` : ''}</div>
    <div class="setting desk-only"><span>${u.display}</span>${seg('display', [['window', u.windowed], ['full', u.fullscreen]], document.fullscreenElement ? 'full' : 'window')}</div>
    <div class="setting desk-only"><span>${u.resolution}</span><select id="resSel" class="pxsel">${RESOLUTIONS.map(r => `<option value="${r}"${(CFG.res || 'auto') === r ? ' selected' : ''}>${r === 'auto' ? u.autoRes : r.replace('x', '×')}</option>`).join('')}</select></div>
    <div class="setting"><span>${u.focusLabel}</span>${seg('focus', [['1', u.lightOn], ['0', u.lightOff]], CFG.focus ? '1' : '0')}</div>
    <h3 class="set-h desk-only">${u.setSec.keys}</h3>
    <p class="hint desk-only">${u.keysHint}</p>
    <div class="keys-grid desk-only">${KEY_ACTIONS.map(a => `<span>${u.keyNames[a]}</span><button class="pxbtn keybtn" data-k="${a}">${keyName(keyMap()[a])}</button>`).join('')}</div>
    <div class="setting desk-only"><span></span><div class="seg"><button class="pxbtn" id="keysReset">${u.keysReset}</button></div></div>
    <h3 class="set-h">${u.setSec.sound}</h3><div class="setting"><span>${u.soundLabel}</span>${seg('sound', [['1', u.soundOn], ['0', u.soundOff]], soundOn ? '1' : '0')}</div>
    <div class="setting"><span>${u.musicLabel}</span><input type="range" class="pxrange" id="volMusic" min="0" max="100" value="${Math.round(VOL.music * 100)}" aria-label="${u.musicLabel}"></div>
    <div class="setting"><span>${u.sfxLabel}</span><input type="range" class="pxrange" id="volSfx" min="0" max="100" value="${Math.round(VOL.sfx * 100)}" aria-label="${u.sfxLabel}"></div>
    <div class="setting"><span>${u.osApps.music}</span><div class="seg"><button class="pxbtn" id="plOpen">${u.osApps.musicOpen}</button></div></div>
    <h3 class="set-h">${u.setSec.desk}</h3><div class="setting"><span>${u.badgeTitle}</span><div class="seg"><button class="pxbtn" id="editBadge">${u.editBadge}</button><button class="pxbtn" id="custom">${u.customize}</button></div></div>
    <div class="setting desk-only"><span>${u.lights}</span>${seg('light', [['1', u.lightOn], ['0', u.lightOff]], lightState().lamp ? '1' : '0')}</div>
    <h3 class="set-h">${u.setSec.data}</h3><div class="setting"><span>${u.backup}</span><div class="seg" id="bkBox"><button class="pxbtn" id="bkOut">${u.exportSave}</button><button class="pxbtn" id="bkIn">${u.importSave}</button><input type="file" id="bkFile" accept=".json,application/json" hidden></div></div>
    <div class="setting"><span>${u.experimental}</span><div class="seg"><button class="pxbtn" id="balBtn">${u.balTitle}: ${u.balNames[BAL_KEY]}</button></div></div>
    <div class="setting"><span>${u.tutorial}</span><div class="seg"><button class="pxbtn" id="tut">${u.tutorialReset}</button></div></div>
    <div class="setting"><span>${u.progress}</span><div class="seg" id="eraseBox"><button class="pxbtn" id="erase">${u.erase}</button></div></div>
    <div class="actions"><button class="pxbtn main" id="b">${u.back}</button></div>`);
  if (diffLocked()) card.querySelectorAll('[data-set=diff] button').forEach(b => b.disabled = true);
  card.querySelectorAll('[data-set] button').forEach(b => b.onclick = () => {
    const set = b.parentElement.dataset.set, v = b.dataset.v;
    if (set === 'lang') { CFG.lang = v; applyLang(); }
    if (set === 'theme') { CFG.theme = v; applyTheme(); }
    if (set === 'focus') { CFG.focus = v === '1'; officeLayout(); }
    if (set === 'diff') { if (diffLocked()) return; setDifficulty(v); sfx('click'); }
    if (set === 'sound') setSound(v === '1');
    if (set === 'light') { CFG.lights = Object.assign({}, CFG.lights, { lamp: v === '1' }); OFFICE.key = ''; sfx('switch'); }
    if (set === 'display') { CFG.display = v; if ((v === 'full') !== !!document.fullscreenElement) toggleFullscreen(); }
    persist();
    showSettings(onBack);
  });
  card.querySelectorAll('.keybtn').forEach(b => b.onclick = () => {   // troca de tecla: o próximo aperto vira a nova tecla da ação
    b.textContent = u.keysPress; b.classList.add('on');
    const cap = e => { e.preventDefault(); e.stopPropagation(); removeEventListener('keydown', cap, true);
      if (e.code !== 'Escape') { const m = keyMap(); KEY_ACTIONS.forEach(a => { if (m[a] === e.code) m[a] = ''; }); m[b.dataset.k] = e.code; CFG.keys = m; persist(); sfx('ok'); }
      card.querySelectorAll('.keybtn').forEach(x => { x.textContent = keyName(keyMap()[x.dataset.k]); x.classList.remove('on'); }); };
    addEventListener('keydown', cap, true); });
  card.querySelector('#keysReset').onclick = () => { CFG.keys = {}; persist(); sfx('click'); card.querySelectorAll('.keybtn').forEach(x => x.textContent = keyName(keyMap()[x.dataset.k])); };
  card.querySelector('#plOpen').onclick = () => osMusic();
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

