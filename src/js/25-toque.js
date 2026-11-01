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

// Teclado virtual: nada se reorganiza. O cartão de escrita fica no topo (sob o placar), onde o teclado nunca chega;
// o resto da tela fica parado. O campo invisível também fica no topo, para o navegador não rolar a página ao focar;
// se ainda assim o iOS deslocar a página, ela volta para o lugar.
if (window.visualViewport) {
  const vv = visualViewport, fitVV = () => {
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
    if (document.activeElement === kb && (scrollX || scrollY)) scrollTo(0, 0);
  };
  vv.addEventListener('resize', fitVV); vv.addEventListener('scroll', fitVV); fitVV();
}
// posição do cartão de escrita: logo abaixo do placar (o placar muda de altura com a fonte e a orientação)
function mobileHudPos() { const h = document.querySelector('#app > header'); if (h && document.body.classList.contains('mobile')) document.documentElement.style.setProperty('--hudb', Math.round(h.getBoundingClientRect().bottom + 8) + 'px'); }
addEventListener('resize', mobileHudPos); setInterval(mobileHudPos, 1000); mobileHudPos();

