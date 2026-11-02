/* ================= MSworkN/WorkOS: cores da foto de perfil e textos de espera ================= */
Object.assign(LANGS.pt.ui.msn, { waitHint: n => `${n} não está disponível agora. Pode escrever: a resposta chega quando voltar.` });
Object.assign(LANGS.en.ui.msn, { waitHint: n => `${n} isn't available right now. You can still write: the reply comes when they're back.` });
Object.assign(LANGS.es.ui.msn, { waitHint: n => `${n} no está disponible ahora. Puedes escribir: la respuesta llega cuando vuelva.` });
Object.assign(LANGS.pt.ui, { picBg: 'Foto: fundo', picFg: 'Foto: cor do ícone' });
Object.assign(LANGS.en.ui, { picBg: 'Photo: background', picFg: 'Photo: icon color' });
Object.assign(LANGS.es.ui, { picBg: 'Foto: fondo', picFg: 'Foto: color del icono' });
// Cores da paleta fechada (WD_PAL). Salvas em CFG (por conta); sem escolha = como antes.
const PIC_BG = { padrao: null, creme: 'W', ceu: 'L', menta: 'a', rosa: 'r', amarelo: 'Y', noite: 'N', grafite: 'g' };
const PIC_FG = { padrao: null, laranja: 'O', azul: 'B', verde: 'G', vermelho: 'R', roxo: 'u', cinza: 'g', preto: 'k' };
const picMain = rows => { const n = {}; for (const c of rows.join('')) if (c !== '.' && c !== 'k') n[c] = (n[c] || 0) + 1; return Object.keys(n).sort((a, b) => n[b] - n[a])[0]; };
{ const op0 = osPicEl; osPicEl = size => {
    const el = op0(size), bg = WD_PAL[PIC_BG[CFG.picBg]], fg = WD_PAL[PIC_FG[CFG.picFg]], rows = CFG.osPic && OS_PICS[CFG.osPic];
    if (rows && fg) { const m = picMain(rows), cv = el.querySelector('canvas') || (el.tagName === 'CANVAS' ? el : null);
      if (m && cv) cv.replaceWith(Pixel.el(rows, Math.max(1, Math.floor(size / Math.max(rows.length, rows[0].length))), { [m]: fg })); }
    if (!bg) return el;
    const box = el.classList && el.classList.contains('os-picbox') ? el : (() => { const b = document.createElement('span'); b.className = 'os-picbox';
      b.style.cssText = `display:inline-grid;place-items:center;width:${size}px;height:${size}px;line-height:0;overflow:hidden`; b.append(el); return b; })();
    box.style.background = bg; return box; }; }
// linhas na aba WorkOS da Personalização
{ const sc0 = showCustomize; showCustomize = (...a) => { const r = sc0(...a); picRows(); return r; }; }
function picRows() {
  const card = document.querySelector('.hw-card'), opts = card && card.querySelector('.hw-opts'); if (!opts) return;
  const u = U(), names = { padrao: '—' };
  const add = (lbl, key, map) => { const row = document.createElement('div'); row.className = 'setting'; row.dataset.cat = 'os';
    row.innerHTML = `<span>${lbl}</span><div class="swatches">${Object.entries(map).map(([k, c]) => `<button class="sw-btn${(CFG[key] || 'padrao') === k ? ' on' : ''}" data-v="${k}" title="${names[k] || k}" aria-label="${names[k] || k}"><i style="background:${c ? WD_PAL[c] : 'repeating-conic-gradient(#dcc6a0 0 25%, #fff8ec 0 50%) 0 0 / 8px 8px'}"></i></button>`).join('')}</div>`;
    row.querySelectorAll('button').forEach(b => b.onclick = () => { CFG[key] = b.dataset.v === 'padrao' ? null : b.dataset.v; persist(); sfx('click');
      row.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      if (typeof Msn !== 'undefined' && Msn.visible()) Msn.render(); });
    const wall = opts.querySelector('.walls:not(.cats)'); if (wall) wall.closest('.setting').before(row); else opts.append(row); return row; };
  const rows = [add(u.picBg, 'picBg', PIC_BG), add(u.picFg, 'picFg', PIC_FG)];
  const sync = () => { const t = card.querySelector('.hw-tab.on'); rows.forEach(r => r.hidden = !t || t.dataset.t !== 'os'); };
  card.querySelectorAll('.hw-tab').forEach(b => b.addEventListener('click', () => setTimeout(sync, 0))); sync();
}
