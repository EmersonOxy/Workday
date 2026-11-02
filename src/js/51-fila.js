/* ================= Fila de avisos ================= */
// Avisos do RH (toast) e do MSworkN (Msn.toast) aparecem no mesmo canto e um de cada vez: o próximo espera o atual sair.
const NOTE_Q = [];
let NOTE_BUSY = false;
const noteVisible = () => !!document.querySelector('#toast, .msn-toast');
function noteNext() {
  if (!NOTE_Q.length) { NOTE_BUSY = false; return; }
  if (noteVisible()) { setTimeout(noteNext, 300); return; }
  NOTE_BUSY = true; NOTE_Q.shift()(); setTimeout(noteNext, 400);
}
function noteQueue(fn) { NOTE_Q.push(fn); if (!NOTE_BUSY) noteNext(); }
{ const t0 = toast; toast = (...a) => noteQueue(() => t0(...a)); }
{ const m0 = Msn.toast; Msn.toast = (...a) => noteQueue(() => m0.apply(Msn, a)); }
