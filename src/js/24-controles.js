/* ================= Controles ================= */
// Pausar (Esc ou Espaço) abre a planilha: o "disfarce" do escritório é a própria tela de pausa
// Mapa de teclas alternativas: ação → código da tecla (KeyboardEvent.code). As setas, Espaço, Delete, 1 e 2 continuam valendo.
const KEY_ACTIONS = ['left', 'right', 'drop', 'del', 'pause', 'coffee', 'tea'];
const KEY_DEFAULT = { left: 'KeyA', right: 'KeyD', drop: 'KeyS', del: 'KeyX', pause: 'KeyP', coffee: 'KeyQ', tea: 'KeyE' };
function keyMap() { return Object.assign({}, KEY_DEFAULT, CFG.keys || {}); }
function keyAction(code) { const m = keyMap(); return KEY_ACTIONS.find(a => m[a] === code) || null; }
const keyName = code => !code ? '—' : code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5) : code.replace('Arrow', '↑').replace('Space', '␣');
function setPaused(p) {
  S.paused = p;
  muffle(p);
  if (p) showSheet(true);
  else { hideSheet(); closeModal(); S.last = performance.now(); }
}


document.addEventListener('keydown', e => {
  if (e.target === kb) return;
  if (e.target.tagName === 'INPUT' && e.target.type === 'text' || e.target.id === 'bgName') return;   // digitando o nome no crachá
  const typingTask = S && S.phase === 'day' && !S.paused ? S.tasks.find(k => k.type === 'type' && !k.dead) : null;
  if ((e.key === 'm' || e.key === 'M') && !typingTask) { setSound(!soundOn); return; }
  if (!S || S.phase !== 'day') return;
  if (S.resting) return;                     // durante a pausa para descansar, só a chamada e o minigame recebem teclas
  if (e.key === 'Escape') {
    e.preventDefault();
    if (S.bossAlert && !S.paused) dodgeBoss(); else if (S.bossAuto <= 0 && !$('modal').classList.contains('hidden') && S.paused) { const back = $('modal').querySelector('#rsCancel, #bgBack, #hwOk'); if (back && !back.disabled) back.click(); else if (!back) closeModal(); } else if (S.bossAuto <= 0) setPaused(!S.paused);
    return;
  }
  if (S.bossAuto > 0) return;
  // Teclas alternativas (WASD por padrão, trocáveis nas Configurações). Letras ficam livres quando uma tarefa de
  // digitação está aberta ou a impressora espera aquela letra.
  const alt = keyAction(e.code);
  if (alt && !typingTask && !(e.key.length === 1 && S.tasks.some(k => k.type === 'printer' && !k.dead && k.key === e.key.toUpperCase()))) {
    e.preventDefault();
    if (alt === 'pause') { setPaused(!S.paused); return; }
    if (S.paused) return;
    if (alt === 'coffee') { useItem('cafe'); return; }
    if (alt === 'tea') { useItem('cha'); return; }
    if (S.frozen) { sfx('err'); return; }
    if (alt === 'left') { S.file.lane = Math.max(0, S.file.lane - 1); placeFile(); }
    if (alt === 'right') { S.file.lane = Math.min(SECTORS.length - 1, S.file.lane + 1); placeFile(); }
    if (alt === 'drop') S.fast = true;
    if (alt === 'del') deleteFile();
    return;
  }
  // Espaço: com o telefone tocando, segura o fone (atende); sem ligação, pausa
  if (e.key === ' ') { e.preventDefault(); if (!S.paused && !e.repeat) phoneHold(true); return; }   // Espaço só atende o telefone (pausar é no Esc ou na tecla configurável)
  if (S.paused) return;
  if (e.key === '1') { useItem('cafe'); return; }
  if (e.key === '2') { useItem('cha'); return; }

  if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    if (S.frozen) { sfx('err'); return; }
    if (e.key === 'ArrowLeft')  { S.file.lane = Math.max(0, S.file.lane - 1); placeFile(); }
    if (e.key === 'ArrowRight') { S.file.lane = Math.min(SECTORS.length - 1, S.file.lane + 1); placeFile(); }
    if (e.key === 'ArrowDown')  S.fast = true;
    return;
  }
  if (e.key === 'Delete' || (e.key === 'Backspace' && !typingTask)) {
    e.preventDefault();
    if (!S.frozen) deleteFile();
    return;
  }

  const key = e.key.length === 1 ? e.key.toUpperCase() : '';
  const printer = S.tasks.find(k => k.type === 'printer' && !k.dead && k.key === key);
  if (printer) {
    printer.hits++; sfx('key'); renderPrinter(printer);
    if (printer.hits >= printer.need) { completeTask(printer, 4 + printer.need); stat('prints'); }
    return;
  }

  const t = typingTask;
  if (!t) return;
  if (e.key === 'Backspace') { e.preventDefault(); t.typed = t.typed.slice(0, -1); renderTyped(t); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (t.typed === t.word) { completeTask(t, 8 + t.word.length * 3); stat('typed'); }
    else { fail(6, null, 'typo'); t.typed = ''; renderTyped(t); }
  } else if (/^[A-ZÇÑ]$/.test(key) && t.typed.length < t.word.length) {
    t.typed += key; renderTyped(t); sfx('key');
  }
});
document.addEventListener('keyup', e => { if (S && (e.key === 'ArrowDown' || keyAction(e.code) === 'drop')) S.fast = false; if (S && e.key === ' ' && typeof phoneHold === 'function') phoneHold(false); });
window.addEventListener('blur', () => { if (S && S.phase === 'day' && !S.paused && !S.boss && S.bossAuto <= 0) { S.fast = false; setPaused(true); } });
window.addEventListener('resize', () => { layoutDecor(); if (S && S.file && S.phase === 'day') placeFile(); });
window.addEventListener('beforeunload', () => { if (!window.SKIP_PERSIST) persist(); });   // a importação de backup desliga isto para não sobrescrever os dados novos

