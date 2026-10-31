/* ================= Telefone grande da mesa ================= */
// Peça própria (como o relógio de ponto), em pé no canto esquerdo da mesa. Treme e pisca quando há ligação;
// clicar e segurar (ou segurar Espaço) ergue o fone e atende; o visor mostra o progresso da ligação.
var DPHONE = { el: null };   // var: o layout do escritório chama antes deste arquivo carregar
function deskPhone() {
  if (!DPHONE) return null;
  if (DPHONE.el) return DPHONE.el;
  const el = document.createElement('div'); el.className = 'dphone';
  el.innerHTML = `<div class="dp-cord"></div><div class="dp-body"><div class="dp-top"><span class="dp-brand">FONEMATIC</span><i class="dp-led"></i></div>
    <div class="dp-lcd"><small class="dp-l1"></small><b class="dp-l2"></b><span class="dp-bar"><i></i></span></div>
    <div class="dp-keys">${'123456789*0#'.split('').map(k => `<i>${k}</i>`).join('')}</div><div class="dp-spk">${'<i></i>'.repeat(5)}</div></div>
    <div class="dp-hand"><i class="dp-ear"></i><i class="dp-grip"></i><i class="dp-mouth"></i></div>`;
  document.body.insertBefore(el, $('app')); DPHONE.el = el;   // antes do monitor: a tela e a barra de tarefas ficam por cima
  el.addEventListener('pointerdown', e => { if (phoneHold(true)) { e.preventDefault(); el.setPointerCapture(e.pointerId); } else Motion.shake(el, 2); });
  const up = () => phoneHold(false); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return el;
}
// posição e escala acompanham o layout do escritório (pixel de arte inteiro, como o resto da cena)
function deskPhoneLayout() {
  const el = deskPhone(), L = OFFICE.L, M = OFFICE.M;
  if (!el || !L || !M) return;
  el.style.setProperty('--u', M.k + 'px');
  el.style.left = Math.round(Math.max(3, L.VW * .015 | 0) * M.k + M.k * 4) + 'px';   // canto da frente da mesa
}
function deskPhoneTick() {
  const el = deskPhone(); if (!el) return;
  const u = U(), day = S && S.phase === 'day';
  const call = day ? S.tasks.find(k => k.type === 'call' && !k.dead) : null, ring = !!call || !!OFFICE.call, held = !!(call && call.holding);
  el.classList.toggle('ring', ring && !held); el.classList.toggle('held', held);
  el.querySelector('.dp-l1').textContent = held ? u.phoneLine : ring ? u.phoneRing : 'WORKDAY';
  el.querySelector('.dp-l2').textContent = held ? Math.round(call.held / call.need * 100) + '%' : ring ? '☎ ☎ ☎' : new Date().toTimeString().slice(0, 5);
  el.querySelector('.dp-bar i').style.width = held ? Math.min(100, call.held / call.need * 100) + '%' : '0%';
}
deskPhoneLayout();
