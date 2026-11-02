/* ================= Arrumar a mesa: arrastar, mandar para frente/trás, inverter, guardar ================= */
// Só fora do expediente (menu do WorkOS ou intervalo). Enquanto arruma, a tela do computador fica translúcida e não
// recebe cliques: o clique vai para o objeto, inclusive o que está atrás do monitor (que aparece através dele).
// Posição salva em CFG.desk[id] = { fx, fy, flip }: fração da largura e da profundidade da mesa (vale em qualquer resolução).
var DESK_EDIT = { on: false, sel: null, drag: null };
LANGS.pt.ui.arr = { title: 'Arrumar a mesa', hint: 'Arraste para os lados e para frente ou para trás (lá no fundo, o objeto passa para trás do monitor). F inverte, Delete guarda, setas ajustam.',
  flip: 'Inverter lado', store: 'Guardar', reset: 'Arrumação automática', done: 'Concluir', stored: 'Guardados:', none: 'nenhum', pick: 'Clique num objeto da mesa.', shelf: 'Na prateleira:', toDesk: 'pôr na mesa' };
LANGS.en.ui.arr = { title: 'Arrange the desk', hint: 'Drag sideways and forward or back (all the way back, the object goes behind the monitor). F flips, Delete stores, arrows nudge.',
  flip: 'Flip side', store: 'Store', reset: 'Automatic layout', done: 'Done', stored: 'Stored:', none: 'none', pick: 'Click an object on the desk.', shelf: 'On the shelf:', toDesk: 'put on desk' };
LANGS.es.ui.arr = { title: 'Ordenar la mesa', hint: 'Arrastra hacia los lados y hacia delante o atrás (al fondo, el objeto queda detrás del monitor). F invierte, Supr guarda, flechas ajustan.',
  flip: 'Invertir lado', store: 'Guardar', reset: 'Orden automático', done: 'Listo', stored: 'Guardados:', none: 'ninguno', pick: 'Haz clic en un objeto de la mesa.', shelf: 'En el estante:', toDesk: 'poner en la mesa' };
const deskName = id => U().deskNames[id] || (L.shop[id] || [])[0] || id;
LANGS.pt.ui.deskNames = { mug: 'Caneca', badge: 'Crachá', pens: 'Porta-canetas', papersL: 'Papéis (esq.)', papersR: 'Papéis (dir.)', caixaL: 'Caixa de som (esq.)', caixaR: 'Caixa de som (dir.)' };
LANGS.en.ui.deskNames = { mug: 'Mug', badge: 'Badge', pens: 'Pen holder', papersL: 'Papers (left)', papersR: 'Papers (right)', caixaL: 'Speaker (left)', caixaR: 'Speaker (right)' };
LANGS.es.ui.deskNames = { mug: 'Taza', badge: 'Credencial', pens: 'Portalápices', papersL: 'Papeles (izq.)', papersR: 'Papeles (der.)', caixaL: 'Altavoz (izq.)', caixaR: 'Altavoz (der.)' };

function deskCanEdit() { return OFFICE.on && !CFG.focus && (!S || S.onBreak || S.phase !== 'day'); }
function deskSet(id, v) { CFG.desk = Object.assign({}, CFG.desk); if (v === undefined) delete CFG.desk[id]; else CFG.desk[id] = v; persist(); Office._slotKey = null; OFFICE.last = 0; }
function deskSlotsNow() { return Office.deskSlots(OFFICE.L, P.decor); }
// fixa a posição atual de um objeto (automático → livre) antes de mexer nele
function deskPin(id) { const q = deskSlotsNow()[id], L0 = OFFICE.L; if (!q || q.off || q.shelf) return null;
  const yB = L0.desk + 5, yF = L0.VH - 4, cur = CFG.desk && CFG.desk[id];
  const m = { fx: (q.x + q.w / 2) / L0.VW, fy: Math.max(0, Math.min(1, (q.y - yB) / (yF - yB))), flip: !!(cur && cur.flip) || !!q.flip };
  if (q.back && m.fy > .05) m.fy = 0; return m; }

function deskEditStart() {
  if (DESK_EDIT.on || !deskCanEdit()) { sfx('err'); return; }
  DESK_EDIT.on = true; DESK_EDIT.sel = null; document.body.classList.add('desk-edit'); sfx('winOpen');
  const a = U().arr, bar = document.createElement('div'); bar.className = 'arr-bar';
  bar.innerHTML = `<b>${a.title}</b><small>${a.hint}</small><div class="arr-row"><span class="arr-sel">${a.pick}</span>
    <button class="pxbtn" data-a="flip">${a.flip}</button><button class="pxbtn" data-a="store">${a.store}</button><button class="pxbtn" data-a="reset">${a.reset}</button><button class="pxbtn main" data-a="done">${a.done}</button></div><div class="arr-row arr-out"></div>`;
  document.body.append(bar); DESK_EDIT.bar = bar;
  bar.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.dataset.a === 'done') return deskEditEnd();
    if (b.dataset.a === 'reset') { CFG.desk = {}; persist(); Office._slotKey = null; DESK_EDIT.sel = null; OFFICE.last = 0; sfx('cancel'); return deskBar(); }
    if (b.dataset.a === 'flip') return deskFlip();
    if (b.dataset.a === 'store') return deskStore();
    if (b.dataset.put) { const id = b.dataset.put; deskSet(id, { fx: .5, fy: 1, flip: false }); DESK_EDIT.sel = id; sfx('pop'); deskBar(); } });
  deskBar(); OFFICE.last = 0;
}
function deskEditEnd() {
  DESK_EDIT.on = false; DESK_EDIT.sel = DESK_EDIT.drag = null; document.body.classList.remove('desk-edit');
  if (DESK_EDIT.bar) DESK_EDIT.bar.remove(); DESK_EDIT.bar = null; persist(); OFFICE.last = 0; sfx('confirm');
}
// barra: objeto selecionado e o que está guardado ou na prateleira (para trazer de volta à mesa)
function deskBar() {
  const bar = DESK_EDIT.bar; if (!bar) return; const a = U().arr, Q = deskSlotsNow();
  bar.querySelector('.arr-sel').textContent = DESK_EDIT.sel ? deskName(DESK_EDIT.sel) : a.pick;
  bar.querySelectorAll('[data-a=flip], [data-a=store]').forEach(b => b.disabled = !DESK_EDIT.sel);
  const ids = Object.keys(DESK_OBJ).filter(id => deskOwned(id, P.decor)), off = ids.filter(id => !Q[id] || Q[id].off), sh = ids.filter(id => Q[id] && Q[id].shelf);
  const chip = id => `<button class="pxbtn arr-chip" data-put="${id}" title="${a.toDesk}">＋ ${deskName(id)}</button>`;
  bar.querySelector('.arr-out').innerHTML = `<small>${a.stored}</small> ${off.length ? off.map(chip).join('') : `<small>${a.none}</small>`}${sh.length ? ` <small>${a.shelf}</small> ${sh.map(chip).join('')}` : ''}`;
}
function deskFlip() { const id = DESK_EDIT.sel; if (!id) return; const m = deskPin(id); if (!m) return; m.flip = !m.flip; deskSet(id, m); sfx('select'); }
function deskStore() { const id = DESK_EDIT.sel; if (!id) return; deskSet(id, 'off'); DESK_EDIT.sel = null; sfx('winMin'); deskBar(); }
// objeto sob o ponteiro: o da frente primeiro; os de trás do monitor também respondem (o monitor está translúcido)
function deskHit(ax, ay) {
  const Q = deskSlotsNow(), list = Object.entries(Q).filter(([id, q]) => DESK_OBJ[id] && q && !q.off && !q.shelf && ax >= q.x - 2 && ax < q.x + q.w + 2 && ay >= q.y - q.h - 2 && ay <= q.y + 3);
  list.sort((a, b) => (a[1].back - b[1].back) || b[1].y - a[1].y); return list.length ? list[0][0] : null;
}
OFFICE.cv.addEventListener('pointerdown', e => {
  if (!DESK_EDIT.on) return; e.stopImmediatePropagation(); e.preventDefault();
  const k = OFFICE.M.k, ax = e.clientX / k, ay = e.clientY / k, id = deskHit(ax, ay);
  DESK_EDIT.sel = id; deskBar(); OFFICE.last = 0; if (!id) return;
  const m = deskPin(id), q = deskSlotsNow()[id]; deskSet(id, m); sfx('click');
  DESK_EDIT.drag = { id, dx: ax - q.x, dy: ay - q.y }; OFFICE.cv.setPointerCapture(e.pointerId);
}, true);
OFFICE.cv.addEventListener('pointermove', e => {
  if (!DESK_EDIT.on) return; e.stopImmediatePropagation();
  const d = DESK_EDIT.drag, k = OFFICE.M.k, L0 = OFFICE.L; OFFICE.cv.style.cursor = d ? 'grabbing' : deskHit(e.clientX / k, e.clientY / k) ? 'grab' : '';
  if (!d) return;
  const o = DESK_OBJ[d.id], x = Math.round(e.clientX / k - d.dx), y = Math.round(e.clientY / k - d.dy), yB = L0.desk + 5, yF = L0.VH - 4, cur = CFG.desk[d.id] || {};
  deskSet(d.id, { fx: (x + o[1] / 2) / L0.VW, fy: Math.max(0, Math.min(1, (y - yB) / (yF - yB))), flip: !!cur.flip });
}, true);
const deskDrop = () => { if (DESK_EDIT.drag) { DESK_EDIT.drag = null; sfx('pop'); } };
OFFICE.cv.addEventListener('pointerup', deskDrop, true); OFFICE.cv.addEventListener('pointercancel', deskDrop, true);
OFFICE.cv.addEventListener('dblclick', e => { if (DESK_EDIT.on) { e.stopImmediatePropagation(); deskFlip(); } }, true);
addEventListener('keydown', e => {
  if (!DESK_EDIT.on) return;
  const id = DESK_EDIT.sel; if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); return deskEditEnd(); }
  if (!id) return;
  if (e.key === 'f' || e.key === 'F') { e.preventDefault(); e.stopImmediatePropagation(); return deskFlip(); }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); e.stopImmediatePropagation(); return deskStore(); }
  const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!mv) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const m = deskPin(id), L0 = OFFICE.L; m.fx += mv[0] * 2 / L0.VW; m.fy = Math.max(0, Math.min(1, m.fy + mv[1] * 2 / (L0.VH - 4 - L0.desk - 5))); deskSet(id, m);
}, true);
