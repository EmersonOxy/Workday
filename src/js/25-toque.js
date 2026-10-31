/* ================= Toque ================= */
const TOUCH = matchMedia('(pointer: coarse)').matches;
const key = (k, type = 'keydown') => document.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true }));
if (TOUCH) {
  document.body.classList.add('touch');
  hud();
  $('pad').querySelectorAll('button').forEach(b => {
    b.onpointerdown = e => { e.preventDefault(); key(b.dataset.k); };
    b.onpointerup = b.onpointercancel = () => key(b.dataset.k, 'keyup');
  });
}
// O teclado virtual manda letras pelo evento "input"; um espaço fica de sentinela para detectar o apagar
const kb = $('kb');
kb.addEventListener('input', e => {
  if (kb.value.length < 1 || e.inputType === 'deleteContentBackward') key('Backspace');
  else for (const ch of kb.value.slice(1)) key(ch);
  kb.value = ' ';
});
// Toque longo não abre menu nem seleciona nada
document.addEventListener('contextmenu', e => { if (document.body.classList.contains('touch')) e.preventDefault(); });
document.addEventListener('selectstart', e => { if (e.target !== kb) e.preventDefault(); });
kb.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); key('Enter'); } });

applyTheme(); applyLang(); showMenu();
