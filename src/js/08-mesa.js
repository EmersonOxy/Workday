/* ================= Mesa ================= */
// Lugar de cada enfeite nas laterais: lado, altura (fração da tela) e tamanho relativo
const DECOR_SLOTS = { planta: ['L', 0.03, 0.7], foto: ['L', 0.38, 1], trofeu: ['L', 0.72, 0.62],
                      lamp: ['R', 0.02, 0.62], monitor: ['R', 0.3, 1], gato: ['R', 0.68, 0.6] };
function layoutDecor() {
  const layer = $('decorLayer');
  layer.innerHTML = '';
  if (document.body.classList.contains('office')) return;  // no computador os enfeites estão na cena
  const appW = Math.min(980, innerWidth), margin = (innerWidth - appW) / 2;
  if (margin < 90) return;  // sem espaço lateral (telas estreitas): os enfeites ficam fora
  const size = Math.min(260, margin - 28);
  for (const it of SHOP) {
    if (it.kind !== 'decor' || !P.decor.includes(it.id)) continue;
    const [side, top, rel] = DECOR_SLOTS[it.id], w = Math.round(size * rel);
    const c = sprite(SPR[it.spr], 1);
    c.style.width = w + 'px';
    c.style.top = Math.round(top * innerHeight) + 'px';
    c.style.left = side === 'L' ? Math.round((margin - w) / 2) + 'px' : Math.round(innerWidth - margin + (margin - w) / 2) + 'px';
    layer.append(c);
  }
}
function renderDesk() {
  const decor = $('desk').querySelector('.decor'), inv = $('inv');
  decor.innerHTML = ''; inv.innerHTML = '';
  decor.append(sprite(SPR.badge, 4));
  const r = S ? S.rankIdx : 0;
  for (const [i, spr] of Object.entries(RANK_DESK)) if (r >= +i) decor.append(sprite(SPR[spr], 3));
  layoutDecor();
  if (!S) return;
  for (const [k, id] of [['1', 'cafe'], ['2', 'cha']]) {
    if (!S.inv[id]) continue;
    const b = document.createElement('button');
    b.className = 'pxbtn'; b.textContent = `[${k}] ${L.shop[id][0]} ×${S.inv[id]}`;
    b.onclick = e => { e.currentTarget.blur(); useItem(id); };
    inv.append(b);
  }
  for (const id of S.today) inv.insertAdjacentHTML('beforeend', `<span class="chip">${L.shop[id][0]}</span>`);
  for (const id of S.perks) inv.insertAdjacentHTML('beforeend', `<span class="chip perk-chip">${L.perks[id][0]}</span>`);
}
function useItem(id) {
  if (!S || S.phase !== 'day' || S.paused || !S.inv[id]) return;
  S.inv[id]--;
  if (id === 'cafe') { S.slowT = 5; sfx('coffee'); }
  if (id === 'cha') { addStress(-25); sfx('ok'); }
  renderDesk();
}

