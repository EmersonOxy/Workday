/* ================= Personalização: foto do perfil, gato travado, prévias e textos de bloqueio ================= */
Object.assign(LANGS.pt.ui, { rankNeed: r => `Disponível a partir de ${r}`, catNeed: 'Compre um gato no Mercado para personalizá-lo.', picBg: 'Foto: fundo', picFg: 'Foto: cor do ícone' });
Object.assign(LANGS.en.ui, { rankNeed: r => `Available from ${r}`, catNeed: 'Buy a cat at the Market to customize it.', picBg: 'Photo: background', picFg: 'Photo: icon color' });
Object.assign(LANGS.es.ui, { rankNeed: r => `Disponible desde ${r}`, catNeed: 'Compra un gato en el Mercado para personalizarlo.', picBg: 'Foto: fondo', picFg: 'Foto: color del icono' });

// Foto do WorkOS/MSworkN: centralizada numa moldura do tamanho pedido, com fundo e cor do ícone escolhidos
const PIC_BG = { creme: 'W', ceu: 'L', menta: 'a', rosa: 'r', amarelo: 'Y', noite: 'N', grafite: 'g' };
const PIC_FG = { original: null, laranja: 'O', azul: 'B', verde: 'G', vermelho: 'R', roxo: 'u', cinza: 'g', preto: 'k' };
const picMain = rows => { const n = {}; rows.join('').split('').forEach(c => { if (c !== '.' && c !== 'k') n[c] = (n[c] || 0) + 1; }); return Object.keys(n).sort((a, b) => n[b] - n[a])[0]; };
osPicEl = function (size) {
  const rows = CFG.osPic && OS_PICS[CFG.osPic], box = document.createElement('span'); box.className = 'os-picbox';
  const bg = WD_PAL[PIC_BG[CFG.picBg]] || null, fg = WD_PAL[PIC_FG[CFG.picFg]];
  box.style.cssText = `display:inline-grid;place-items:center;width:${size}px;height:${size}px;line-height:0;${bg ? 'background:' + bg : ''}`;
  if (!rows) { box.append(portrait(size)); return box; }
  const sc = Math.max(1, Math.floor(size / rows[0].length)), main = picMain(rows);
  box.append(Pixel.el(rows, sc, fg && main ? { [main]: fg } : undefined)); return box;
};
{ const sc0 = showCustomize; showCustomize = (...a) => { sc0(...a); custExtra(); }; }
function custExtra() {
  const card = document.querySelector('.hw-card'); if (!card) return;
  const u = U(), lay = card.querySelector('.hw-layout'), opts = card.querySelector('.hw-opts'); if (!lay || !opts) return;
  // gato: travado até comprar
  if (!P.decor.includes('gato')) card.querySelectorAll('.walls.cats, [data-hw=catEye]').forEach(w => { const row = w.closest('.setting'); row.classList.add('locked-row');
    w.querySelectorAll('button').forEach(b => { b.disabled = true; b.title = u.catNeed; });
    if (!row.querySelector('.cat-need')) row.insertAdjacentHTML('beforeend', `<small class="cat-need">${u.catNeed}</small>`); });
  // fundo e cor da foto (aba WorkOS)
  const sw = (key, map) => `<div class="swatches" data-pic="${key}">${Object.entries(map).map(([k, c]) => `<button class="sw-btn${(CFG[key] || Object.keys(map)[0]) === k ? ' on' : ''}" data-v="${k}" title="${k}" aria-label="${k}"><i style="background:${c ? WD_PAL[c] : 'repeating-conic-gradient(#dcc6a0 0 25%, #fff8ec 0 50%) 0 0 / 8px 8px'}"></i></button>`).join('')}</div>`;
  const add = (lbl, key, map) => { const r = document.createElement('div'); r.className = 'setting'; r.dataset.cat = 'os'; r.innerHTML = `<span>${lbl}</span>${sw(key, map)}`; opts.append(r);
    r.querySelectorAll('button').forEach(b => b.onclick = () => { CFG[key] = b.dataset.v; persist(); sfx('click'); r.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); paintOs(); if (typeof Msn !== 'undefined' && Msn.visible()) Msn.render(); }); return r; };
  const extra = [add(u.picBg, 'picBg', PIC_BG), add(u.picFg, 'picFg', PIC_FG)];
  // prévia do WorkOS: ícone real do Iniciar e a foto do jogador na barra
  const orb = lay.querySelector('.pv-orb'); const paintOs = () => { if (!orb) return; orb.replaceChildren(Pixel.el(MENU_ICO.app, 2)); let me = lay.querySelector('.pv-me'); if (!me) { me = document.createElement('i'); me.className = 'pv-me'; orb.after(me); } me.replaceChildren(osPicEl(20)); };
  paintOs();
  // aba Mesa: mostra a mesa inteira (mesma prévia do computador) e o gato só se ele foi comprado
  const show = k => { extra.forEach(r => r.hidden = k !== 'os');
    if (k === 'desk') { lay.querySelector('.hw-pv-pc').hidden = false; const c = lay.querySelector('.hw-pv-desk'); if (c) c.hidden = !P.decor.includes('gato'); } };
  lay.querySelectorAll('.hw-tab').forEach(b => b.addEventListener('click', () => show(b.dataset.t)));
  let t0 = 'pc'; try { t0 = sessionStorage.getItem('hwTab') || 'pc'; } catch (e) {} show(t0);
}
