/* ================= Assinatura (reutilizável) ================= */
// Vários traços: soltar e apertar de novo continua a mesma assinatura. Nada finaliza sozinho:
// o jogador confirma no botão (ou limpa e recomeça). Funciona com mouse, caneta e dedo (pointer events).
function sigPad(label, onConfirm) {
  const u = U(), el = document.createElement('div');
  el.className = 'cert-sign';
  el.innerHTML = `<canvas class="sig" width="160" height="40"></canvas><i class="line"></i><small>${label}</small>
    <div class="sig-actions"><button class="pxbtn" data-s="clear" disabled>${u.clearSig}</button><button class="pxbtn main" data-s="ok" disabled>${u.confirmSig}</button></div>`;
  const cv = pxFit(el.querySelector('.sig'), () => [Math.min(320, innerWidth * .6), 80]), cx = cv.getContext('2d');
  const clearB = el.querySelector('[data-s=clear]'), okB = el.querySelector('[data-s=ok]');
  let last = null, ink = 0, done = false, ticks = 0;
  const at = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * cv.width), Math.round((e.clientY - r.top) / r.height * cv.height)]; };
  const dot = (x, y) => { cx.fillStyle = WD_PAL.N; cx.fillRect(x, y, 1, 1); };
  const line = (a, b) => { let [x0, y0] = a; const [x1, y1] = b, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { dot(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } } };
  const update = () => { clearB.disabled = done || ink === 0; okB.disabled = done || ink < 40; };
  cv.onpointerdown = e => { if (done) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); last = at(e); dot(...last); ink += 1; update(); };
  cv.onpointermove = e => {
    if (!last || done) return;
    const p = at(e); ink += Math.hypot(p[0] - last[0], p[1] - last[1]); line(last, p); last = p;
    if ((ticks = (ticks + 1) % 7) === 0) sfx('key');
    update();
  };
  cv.onpointerup = cv.onpointercancel = () => { last = null; };
  clearB.onclick = () => { cx.clearRect(0, 0, cv.width, cv.height); ink = 0; update(); sfx('trash'); Motion.shake(cv, 3); };
  okB.onclick = () => { if (okB.disabled) return; done = true; update(); el.classList.add('signed'); onConfirm(); };
  return el;
}

/* ================= Pedido de demissão: termo de rescisão ================= */
// "Pedir demissão" abre um documento para assinar. Cancelar devolve à planilha de pausa sem mudar nada.
function showResign() {
  const u = U();
  hideSheet();
  const card = modal(`<div class="cert resign"><div class="cert-in">
      <div class="cert-head">${u.resignTitle}</div>
      <p class="cert-body">${u.resignBody(profileName(), EMP_ID)}</p>
      <ol class="clauses">${u.resignClauses.map(c => `<li>${c}</li>`).join('')}</ol>
      <div class="cert-foot"><span class="cert-portrait"></span><span class="slot-sig"></span><span class="seal"></span></div>
    </div></div>
    <p class="cert-hint">${u.resignHint}</p>
    <div class="actions"><button class="pxbtn" id="rsCancel">${u.backToWork}</button></div>`);
  card.classList.add('promo-card', 'resign-card');
  card.querySelector('.seal').append(Pixel.el(ENV.seal, 3));
  card.querySelector('.cert-portrait').append(portrait(56));
  sceneIn(card, '.cert, .cert-hint, .actions', 70, 60);
  card.querySelector('.slot-sig').replaceWith(sigPad(u.signature, () => {
    const st = document.createElement('span'); st.className = 'cert-stamp resign-stamp'; st.textContent = u.resignStamp;
    card.querySelector('.cert-in').append(st); Motion.stamp(st); sfx('err');
    card.querySelector('#rsCancel').disabled = true;
    setTimeout(() => { card.classList.remove('promo-card', 'resign-card'); S.paused = false; gameOver('quit'); }, 1100);
  }));
  card.querySelector('#rsCancel').onclick = () => { card.classList.remove('promo-card', 'resign-card'); closeModal(); showSheet(true); };
}
