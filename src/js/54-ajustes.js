/* ================= Fila única de avisos e foto do perfil enquadrada ================= */
// Avisos do RH (toast) e do MSworkN (Msn.toast) saem no canto inferior direito, um de cada vez: o próximo espera o atual sair.
const NOTE_Q = []; let NOTE_BUSY = false;
const noteVisible = () => !!document.querySelector('#toast, .msn-toast');
function noteNext() {
  if (!NOTE_Q.length) { NOTE_BUSY = false; return; }
  if (noteVisible()) { setTimeout(noteNext, 300); return; }
  NOTE_BUSY = true; NOTE_Q.shift()(); setTimeout(noteNext, 400);
}
const noteQueue = fn => { NOTE_Q.push(fn); if (!NOTE_BUSY) noteNext(); };
{ const t0 = toast; toast = (...a) => noteQueue(() => t0(...a)); }
{ const m0 = Msn.toast; Msn.toast = (...a) => noteQueue(() => m0.apply(Msn, a)); }
// Foto do WorkOS/MSworkN: figurinha centralizada numa moldura quadrada do tamanho pedido, em escala inteira (sem cortar nem deformar)
{ const op0 = osPicEl; osPicEl = size => {
    const rows = CFG.osPic && OS_PICS[CFG.osPic]; if (!rows) return op0(size);
    const box = document.createElement('span'); box.className = 'os-picbox';
    box.style.cssText = `display:inline-grid;place-items:center;width:${size}px;height:${size}px;line-height:0;overflow:hidden`;
    box.append(Pixel.el(rows, Math.max(1, Math.floor(size / Math.max(rows.length, rows[0].length))))); return box; }; }
