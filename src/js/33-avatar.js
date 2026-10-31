/* ================= Personagem por camadas (48×56) ================= */
// O retrato é desenhado pixel a pixel nesta resolução: fundo, cabelo de trás, pescoço e roupa, cabeça e orelhas,
// olhos, sobrancelhas, nariz e boca, cabelo da frente. Cada forma recebe luz de cima à esquerda (4 tons da rampa),
// e no fim um contorno de 1 px em tinta envolve o personagem; cabelo e roupa ganham contorno interno no tom escuro.
const AV = { W: 48, H: 56, CX: 24, CY: 23, RX: 11, RY: 13 };
const AV_OPT = {
  hair: ['curto', 'repartido', 'medio', 'longo', 'raspado', 'cacheado', 'crespo', 'franja', 'coque', 'rabo', 'careca'],
  eyes: ['redondo', 'amendoa', 'sonolento', 'feliz', 'arregalado', 'felino'],
  brows: ['normal', 'grossa', 'arqueada', 'reta', 'nenhuma'],
  outfit: ['camiseta', 'camisa', 'social', 'moletom', 'polo', 'sueter'],
  detail: ['nenhum', 'gravata', 'listras', 'cracha'],
  bg: ['azul', 'menta', 'creme', 'listras', 'quadriculado', 'noite', 'escritorio', 'por-do-sol'],
};
const AV_DEFAULT = { hair: 'curto', hairColor: 'castanho', skin: 2, eyes: 'redondo', eyeColor: 'castanho', brows: 'normal', outfit: 'social', outfitColor: 'azul', detail: 'gravata', detailColor: 'vermelho', bg: 'azul' };
// saves antigos (6 rostos prontos) viram configurações equivalentes
const AV_LEGACY = [['castanho', 'azul'], ['preto', 'verde'], ['loiro', 'vermelho'], ['ruivo', 'roxo'], ['grisalho', 'cinza'], ['roxo', 'vermelho']];
function avConfig() {
  if (PROFILE.av) return Object.assign({}, AV_DEFAULT, PROFILE.av);
  const l = AV_LEGACY[PROFILE.avatar] || AV_LEGACY[0];
  return Object.assign({}, AV_DEFAULT, { hairColor: l[0], outfitColor: l[1] });
}

function avRender(cfg) {
  const { W, H, CX, CY, RX, RY } = AV, P = WD_PAL;
  const skin = AV_RAMPS.skin[cfg.skin] || AV_RAMPS.skin[1], hair = AV_RAMPS.hair[cfg.hairColor] || AV_RAMPS.hair.castanho;
  const cloth = AV_RAMPS.cloth[cfg.outfitColor] || AV_RAMPS.cloth.azul, acc = AV_RAMPS.cloth[cfg.detailColor] || AV_RAMPS.cloth.vermelho;
  // camadas: cor por pixel e "material" (para contornos internos)
  const col = new Array(W * H).fill(null), mat = new Array(W * H).fill(null);
  const put = (x, y, c, m) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) { col[y * W + x] = c; mat[y * W + x] = m; } };
  const get = (x, y) => (x >= 0 && y >= 0 && x < W && y < H) ? mat[y * W + x] : null;
  // tom pela posição dentro da forma: luz de cima à esquerda
  const shade = (r, x, y, cx, cy, rx, ry) => { const v = (x - cx) / rx * .55 + (y - cy) / ry * .75; return v < -.6 ? r[0] : v < .35 ? r[1] : v < .85 ? r[2] : r[3]; };
  const ell = (cx, cy, rx, ry, fn) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2; if (d <= 1) fn(x, y, d); } };
  const headIn = (x, y) => { const ry = y > CY + 3 ? RX * (1 - (y - CY - 3) / (RY * 2.6)) : RX; return ((x + .5 - CX) / ry) ** 2 + ((y + .5 - CY) / RY) ** 2 <= 1; };

  // ---- fundo (fica fora do contorno do personagem)
  const bg = new Array(W * H);
  const BG = { azul: ['#c3d5ff', '#6f93d9'], menta: ['#c4ebb5', '#a9dccf'], creme: ['#fbf3e2', '#e9dcc2'], noite: ['#2b2340', '#463462'], escritorio: ['#86ab9b', '#648a7c'] };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let c;
    switch (cfg.bg) {
      case 'listras': c = (x + y) % 8 < 4 ? '#e0cff7' : '#fff8ec'; break;
      case 'quadriculado': c = ((x >> 2) + (y >> 2)) % 2 ? '#dcc6a0' : '#fbf3e2'; break;
      case 'noite': c = BG.noite[0]; if ((x * 7 + y * 13) % 53 === 0) c = '#ffe7a3'; break;
      case 'escritorio': c = x % 8 === 0 ? BG.escritorio[1] : BG.escritorio[0]; if (y > 40) c = '#d48a4f'; break;
      case 'por-do-sol': c = y < 14 ? '#86305e' : y < 26 ? '#a24a33' : y < 36 ? '#f08a50' : '#f0b778'; break;
      default: { const b = BG[cfg.bg] || BG.azul; c = (y + (x % 2)) % 4 === 0 && y > 2 ? b[1] : b[0]; }
    }
    bg[y * W + x] = c;
  }
  // ---- cabelo de trás (longo, médio, crespo, rabo)
  const hs = cfg.hair;
  if (hs === 'longo') ell(CX, CY + 9, RX + 4, RY + 13, (x, y) => { if (y > CY - 6 && y < 50) put(x, y, shade(hair, x, y, CX - 3, CY - 2, RX + 4, RY + 14), 'hair'); });
  if (hs === 'medio') ell(CX, CY + 3, RX + 3, RY + 5, (x, y) => { if (y > CY - 6) put(x, y, shade(hair, x, y, CX - 3, CY - 2, RX + 3, RY + 5), 'hair'); });
  if (hs === 'crespo') ell(CX, CY - 3, RX + 7, RY + 5, (x, y) => put(x, y, (x * 3 + y * 5) % 7 === 0 ? hair[0] : shade(hair, x, y, CX - 4, CY - 8, RX + 7, RY + 5), 'hair'));
  if (hs === 'rabo') for (let y = CY - 4; y < CY + 18; y++) { const w = 3 - Math.abs(y - CY - 6) / 8 | 0; for (let x = CX + RX - 1; x <= CX + RX + 1 + w; x++) put(x + (y > CY + 8 ? 1 : 0), y, shade(hair, x, y, CX + RX, CY + 4, 4, 12), 'hair'); }
  // ---- roupa (ombros e tronco) e pescoço
  for (let y = 40; y < H; y++) { const half = Math.min(23, 9 + (y - 40) * 1.7); for (let x = Math.ceil(CX - half); x < CX + half; x++) put(x, y, shade(cloth, x, y, CX - 6, 44, 20, 14), 'cloth'); }
  for (let y = 33; y < 43; y++) for (let x = CX - 4; x < CX + 4; x++) put(x, y, y < 36 ? skin[2] : x >= CX + 2 ? skin[2] : skin[1], 'skin');
  const of = cfg.outfit, collar = (y0, rim) => { for (let x = CX - 6; x < CX + 6; x++) { const yy = y0 + Math.round(Math.abs(x + .5 - CX) * .25); put(x, yy, rim, 'cloth'); } };
  if (of === 'camiseta') { for (let y = 40; y < 43; y++) for (let x = CX - 4; x < CX + 4; x++) if (y < 41 + (Math.abs(x + .5 - CX) < 3 ? 2 : 0)) put(x, y, skin[1], 'skin'); collar(42, cloth[0]); }
  if (of === 'camisa' || of === 'polo') {
    for (let y = 40; y < 46; y++) { const w = Math.max(0, 5 - (y - 40)); for (let x = CX - 4; x < CX + 4; x++) if (Math.abs(x + .5 - CX) < w) put(x, y, skin[1], 'skin'); }
    for (let i = 0; i < 5; i++) { put(CX - 5 + i, 39 + i, cloth[0], 'cloth'); put(CX - 6 + i, 39 + i, cloth[0], 'cloth'); put(CX + 4 - i, 39 + i, cloth[1], 'cloth'); put(CX + 5 - i, 39 + i, cloth[0], 'cloth'); }
    for (let y = 46; y < H; y += 4) put(CX, y, cloth[3], 'cloth');
    if (of === 'polo') for (let y = 44; y < 49; y++) put(CX, y, cloth[2], 'cloth');
  }
  if (of === 'social') {
    const shirt = AV_RAMPS.cloth.branco;
    for (let y = 40; y < H; y++) { const w = Math.max(1, 5 - (y - 40) * .35); for (let x = CX - 6; x < CX + 6; x++) if (Math.abs(x + .5 - CX) < w) put(x, y, x < CX ? shirt[1] : shirt[2], 'shirt'); }
    for (let y = 40; y < H; y++) { const w = Math.max(1, 5 - (y - 40) * .35); put(CX - w - 1, y, cloth[3], 'cloth'); put(CX + w, y, cloth[3], 'cloth'); }   // lapelas
  }
  if (of === 'moletom') { ell(CX, 41, 10, 4, (x, y) => { if (Math.abs(x + .5 - CX) > 4 || y > 42) put(x, y, shade(cloth, x, y, CX - 4, 39, 10, 4), 'cloth'); }); for (let y = 43; y < 50; y++) { put(CX - 2, y, acc[1], 'cloth'); put(CX + 2, y, acc[1], 'cloth'); } }
  if (of === 'sueter') { for (let x = CX - 6; x < CX + 6; x++) { put(x, 40, cloth[0], 'cloth'); put(x, 41, cloth[2], 'cloth'); } for (let x = Math.ceil(CX - 20); x < CX + 20; x++) if ((x + 1) % 3) put(x, 50, cloth[0], 'cloth'); }
  // detalhes
  const det = cfg.detail;
  if (det === 'gravata' && of !== 'camiseta' && of !== 'moletom') { for (let y = 41; y < H; y++) { const w = y < 43 ? 1 : y < 52 ? 1.6 : 0; for (let x = CX - 2; x < CX + 2; x++) if (Math.abs(x + .5 - CX) <= w) put(x, y, x < CX ? acc[1] : acc[2], 'acc'); } put(CX - 1, 41, acc[0], 'acc'); }
  if (det === 'listras') for (let y = 46; y < H; y += 3) for (let x = 0; x < W; x++) if (get(x, y) === 'cloth') put(x, y, cloth[2], 'cloth');
  if (det === 'cracha') { for (let y = 40; y < 47; y++) { put(CX - 8 + (y - 40) * .2, y, acc[1], 'acc'); } for (let y = 47; y < 53; y++) for (let x = CX - 10; x < CX - 5; x++) put(x, y, y === 47 ? acc[1] : '#fff8ec', 'acc'); }
  // ---- cabeça, orelhas
  for (const s of [-1, 1]) ell(CX + s * (RX + .5), CY + 1, 2, 3, (x, y) => put(x, y, s < 0 ? skin[1] : skin[2], 'skin'));
  for (let y = CY - RY; y <= CY + RY; y++) for (let x = CX - RX - 1; x <= CX + RX + 1; x++) if (headIn(x, y)) put(x, y, shade(skin, x, y, CX - 2, CY - 2, RX, RY), 'skin');
  // bochechas, nariz, boca
  put(CX - 7, CY + 5, skin[2], 'skin'); put(CX + 7, CY + 5, skin[2], 'skin');
  put(CX, CY + 4, skin[2], 'skin'); put(CX + 1, CY + 5, skin[3], 'skin'); put(CX - 1, CY + 5, skin[2], 'skin');
  const lip = skin[3];
  if (cfg.eyes === 'feliz') { for (let x = CX - 3; x <= CX + 3; x++) put(x, CY + 8, lip, 'skin'); put(CX - 4, CY + 7, lip, 'skin'); put(CX + 4, CY + 7, lip, 'skin'); for (let x = CX - 2; x <= CX + 2; x++) put(x, CY + 9, '#a24a33', 'skin'); }
  else { for (let x = CX - 2; x <= CX + 2; x++) put(x, CY + 8, lip, 'skin'); put(CX - 3, CY + 7, lip, 'skin'); put(CX + 3, CY + 7, lip, 'skin'); }
  // ---- olhos (desenhos de 5 px; o direito é espelhado)
  const EYES = {
    redondo: ['.kkk.', 'kwipk', 'kwiik', '.kkk.'], amendoa: ['..kk.', 'kwipk', '.kkk.'], sonolento: ['kkkkk', 'kwipk', '.kkk.'],
    feliz: ['.kkk.', 'k...k'], arregalado: ['.kkk.', 'kwiik', 'kwipk', 'kwwwk', '.kkk.'], felino: ['k....', '.kkkk', '.wipk', '..kk.'],
  };
  const eyeC = AV_RAMPS.eye[cfg.eyeColor] || AV_RAMPS.eye.castanho, er = EYES[cfg.eyes] || EYES.redondo, ey = CY + 1 - (er.length >> 1);
  for (const [ox, flip] of [[CX - 7, false], [CX + 3, true]]) er.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return; const xx = ox + (flip ? 4 - i : i);
    put(xx, ey + j, ch === 'k' ? '#2a1f2d' : ch === 'w' ? '#ffffff' : ch === 'i' ? eyeC : '#17131b', 'eye');
  }));
  // brilho no olho (vida)
  if (cfg.eyes !== 'feliz') for (const ox of [CX - 6, CX + 4]) { if (get(ox, ey + 1) === 'eye') put(ox + 1, ey + 1, '#ffffff', 'eye'); }
  // sobrancelhas no tom escuro do cabelo
  const BR = { normal: [[0, 0], [1, -1], [2, -1], [3, -1]], grossa: [[0, 0], [1, -1], [2, -1], [3, -1], [1, 0], [2, 0], [3, 0]], arqueada: [[0, 1], [1, 0], [2, -1], [3, 0]], reta: [[0, 0], [1, 0], [2, 0], [3, 0]], nenhuma: [] };
  for (const [ox, flip] of [[CX - 7, false], [CX + 3, true]]) for (const [i, j] of BR[cfg.brows] || BR.normal) put(ox + (flip ? 4 - i : i), ey - 2 + j, hair[3], 'brow');
  // ---- cabelo da frente
  const top = (rxp, ryp, cut, fn) => ell(CX, CY - 1, RX + rxp, RY + ryp, (x, y) => { if (y < cut(x)) put(x, y, fn ? fn(x, y) : shade(hair, x, y, CX - 4, CY - 10, RX + rxp, RY + ryp), 'hair'); });
  const strand = (x, y) => (x + (y >> 2)) % 4 === 0 ? hair[2] : shade(hair, x, y, CX - 4, CY - 10, RX + 2, RY + 2);
  const hairline = { base: x => CY - 6 + (Math.abs(x + .5 - CX) > RX - 2 ? 6 : 0) };
  if (['curto', 'medio', 'longo', 'rabo', 'franja', 'repartido', 'coque'].includes(hs)) top(2, 2, x => hairline.base(x) + (hs === 'medio' || hs === 'longo' ? (Math.abs(x + .5 - CX) > RX - 3 ? 8 : 0) : 0), strand);
  if (hs === 'repartido') for (let y = CY - RY - 1; y < CY - 6; y++) { put(CX - 4, y, hair[3], 'hair'); for (let x = CX - 3; x < CX + RX; x++) if (get(x, y) === 'hair' && y > CY - 10 && x < CX + 2) put(x, y + 1, shade(hair, x, y, CX, CY - 10, RX, RY), 'hair'); }
  if (hs === 'franja') for (let y = CY - 7; y < CY - 3; y++) for (let x = CX - RX + 1; x < CX + RX - 1; x++) if (headIn(x, y)) put(x, y, (x % 3 === 0 && y === CY - 4) ? skin[1] : strand(x, y), 'hair');
  if (hs === 'raspado') top(1, 1, () => CY - 6, (x, y) => (x + y) % 2 ? hair[2] : shade(skin, x, y, CX, CY, RX, RY));
  if (hs === 'cacheado') { top(3, 3, x => CY - 4 + (Math.abs(x + .5 - CX) > RX - 2 ? 8 : 0), (x, y) => ((x >> 1) + (y >> 1)) % 2 ? hair[0] : shade(hair, x, y, CX - 4, CY - 10, RX + 3, RY + 3));
    for (let i = 0; i < 9; i++) ell(CX - RX + i * 2.8, CY - RY + 1 - Math.sin(i / 8 * Math.PI) * 2, 2.2, 2.2, (x, y) => put(x, y, shade(hair, x, y, CX - 4, CY - 12, RX + 4, RY), 'hair')); }
  if (hs === 'crespo') top(5, 4, () => CY - 5, (x, y) => (x * 3 + y * 5) % 7 === 0 ? hair[0] : shade(hair, x, y, CX - 4, CY - 10, RX + 7, RY + 5));
  if (hs === 'coque') ell(CX + 1, CY - RY - 3, 4.5, 4, (x, y) => put(x, y, shade(hair, x, y, CX - 1, CY - RY - 5, 4.5, 4), 'hair'));
  // ---- contornos: externo em tinta; internos no tom escuro de cada material
  const out = new Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, m = mat[i];
    if (!m) { out[i] = [get(x - 1, y), get(x + 1, y), get(x, y - 1), get(x, y + 1)].some(Boolean) ? '#2a1f2d' : bg[i]; continue; }
    let c = col[i];
    if (m === 'hair' && [get(x - 1, y), get(x + 1, y), get(x, y + 1)].some(n => n === 'skin' || n === 'eye')) c = hair[3];
    if ((m === 'cloth') && [get(x, y - 1), get(x - 1, y), get(x + 1, y)].some(n => n === 'skin' || n === 'shirt')) c = cloth[3];
    if (m === 'skin' && [get(x - 1, y), get(x + 1, y), get(x, y - 1)].some(n => n === 'cloth')) c = skin[3];
    out[i] = c;
  }
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), img = x.createImageData(W, H);
  out.forEach((h, i) => { const n = parseInt(h.slice(1), 16); img.data[i * 4] = n >> 16; img.data[i * 4 + 1] = n >> 8 & 255; img.data[i * 4 + 2] = n & 255; img.data[i * 4 + 3] = 255; });
  x.putImageData(img, 0, 0);
  return c;
}
// Versão pequena (metade) para espaços apertados: cada bloco 2×2 vira a cor mais frequente, preferindo o contorno
function avHalf(src) {
  const W = src.width >> 1, H = src.height >> 1, c = document.createElement('canvas'); c.width = W; c.height = H;
  const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data, o = c.getContext('2d').createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cnt = new Map(); let ink = false;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const i = ((y * 2 + dy) * src.width + x * 2 + dx) * 4, k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; if (k === 0x2a1f2d) ink = true; cnt.set(k, (cnt.get(k) || 0) + 1); }
    let k = [...cnt].sort((a, b) => b[1] - a[1])[0][0]; if (ink && cnt.get(0x2a1f2d) >= 2) k = 0x2a1f2d;
    const j = (y * W + x) * 4; o.data[j] = k >> 16; o.data[j + 1] = k >> 8 & 255; o.data[j + 2] = k & 255; o.data[j + 3] = 255;
  }
  c.getContext('2d').putImageData(o, 0, 0); return c;
}
// Canvas do retrato no tamanho pedido (altura CSS): resolução cheia quando cabe, metade quando o espaço é pequeno
const PHOTO = { big: null, mini: null };
function loadPhoto() {
  const p = load('perfil-foto', null);
  PHOTO.big = PHOTO.mini = null;
  if (!p || !p.big) return;
  for (const k of ['big', 'mini']) { const im = new Image(); im.onload = () => { PHOTO[k] = im; OFFICE.key = ''; document.querySelectorAll('canvas.portrait').forEach(c => c._redraw && c._redraw()); }; im.src = p[k]; }
}
function portrait(h, cfgOverride, photoOverride) {
  const dpr = window.devicePixelRatio || 1, c = document.createElement('canvas'); c.className = 'portrait';
  const draw = () => {
    const ph = photoOverride !== undefined ? photoOverride : (PROFILE.photo === 'local' ? PHOTO : null);
    let src;
    if (Array.isArray(PROFILE.photo) && photoOverride === undefined) src = Pixel.master(PROFILE.photo, WD_PAL);       // foto de save antigo (16×18)
    else if (ph && ph.big) src = h >= ph.big.height || !ph.mini ? ph.big : ph.mini;
    else { const full = avRender(cfgOverride || avConfig()); src = h >= AV.H ? full : avHalf(full); }
    c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0);
    const n = Math.max(1, Math.floor(h * dpr / src.height));
    c.style.width = src.width * n / dpr + 'px'; c.style.height = src.height * n / dpr + 'px';
  };
  c._redraw = draw; draw();
  return c;
}

/* ---------- Editor de personagem ---------- */
function avRandom() {
  const r = a => a[Math.random() * a.length | 0];
  return { hair: r(AV_OPT.hair), hairColor: r(Object.keys(AV_RAMPS.hair)), skin: Math.random() * AV_RAMPS.skin.length | 0, eyes: r(AV_OPT.eyes), eyeColor: r(Object.keys(AV_RAMPS.eye)),
    brows: r(AV_OPT.brows), outfit: r(AV_OPT.outfit), outfitColor: r(Object.keys(AV_RAMPS.cloth)), detail: r(AV_OPT.detail), detailColor: r(Object.keys(AV_RAMPS.cloth)), bg: r(AV_OPT.bg) };
}
function showAvatarEditor(start, onDone) {
  const u = U(), t = u.av;
  let cfg = Object.assign({}, AV_DEFAULT, start), tab = 'hair';
  const card = modal(`<h2>${t.title}</h2><div class="av-ed"><div class="av-prev"></div><div class="av-side"><div class="av-tabs"></div><div class="av-panel"></div></div></div>
    <div class="actions"><button class="pxbtn" id="avRnd">${t.random}</button><button class="pxbtn" id="avDef">${t.reset}</button><button class="pxbtn main" id="avOk">${u.save}</button><button class="pxbtn" id="avNo">${u.cancel}</button></div>`);
  card.classList.add('av-card');
  const TABS = { hair: [['hair', AV_OPT.hair, 'style'], ['hairColor', Object.keys(AV_RAMPS.hair), 'color', k => AV_RAMPS.hair[k][1]]],
    skin: [['skin', AV_RAMPS.skin.map((_, i) => i), 'color', k => AV_RAMPS.skin[k][1]]],
    eyes: [['eyes', AV_OPT.eyes, 'style'], ['eyeColor', Object.keys(AV_RAMPS.eye), 'color', k => AV_RAMPS.eye[k]], ['brows', AV_OPT.brows, 'style']],
    outfit: [['outfit', AV_OPT.outfit, 'style'], ['outfitColor', Object.keys(AV_RAMPS.cloth), 'color', k => AV_RAMPS.cloth[k][1]], ['detail', AV_OPT.detail, 'style'], ['detailColor', Object.keys(AV_RAMPS.cloth), 'color', k => AV_RAMPS.cloth[k][1]]],
    bg: [['bg', AV_OPT.bg, 'style']] };
  const paintPrev = () => card.querySelector('.av-prev').replaceChildren(portrait(168, cfg, null));
  const paintTabs = () => card.querySelector('.av-tabs').replaceChildren(...Object.keys(TABS).map(k => { const b = document.createElement('button'); b.className = 'pxbtn' + (k === tab ? ' on' : ''); b.textContent = t.tabs[k]; b.onclick = () => { tab = k; paintTabs(); paintPanel(); }; return b; }));
  const paintPanel = () => {
    const panel = card.querySelector('.av-panel'); panel.replaceChildren();
    for (const [key, opts, kind, sw] of TABS[tab]) {
      const row = document.createElement('div'); row.className = 'av-row'; row.innerHTML = `<small>${t.labels[key]}</small>`;
      const list = document.createElement('div'); list.className = kind === 'style' ? 'av-styles' : 'av-colors'; row.append(list);
      for (const o of opts) {
        const b = document.createElement('button'); b.className = 'av-opt' + (cfg[key] === o ? ' on' : ''); b.title = t.names[o] || o;
        if (kind === 'color') { b.classList.add('sw'); b.style.background = sw(o); }
        else { b.append(portrait(56, Object.assign({}, cfg, { [key]: o }), null)); }
        b.onclick = () => { cfg[key] = o; paintPrev(); paintPanel(); sfx('click'); };
        list.append(b);
      }
      panel.append(row);
    }
  };
  card.querySelector('#avRnd').onclick = () => { cfg = avRandom(); paintPrev(); paintPanel(); sfx('pop'); Motion.punch(card.querySelector('.av-prev'), 1.06); };
  card.querySelector('#avDef').onclick = () => { cfg = Object.assign({}, AV_DEFAULT); paintPrev(); paintPanel(); };
  card.querySelector('#avOk').onclick = () => { card.classList.remove('av-card'); onDone(cfg); };
  card.querySelector('#avNo').onclick = () => { card.classList.remove('av-card'); onDone(null); };
  paintPrev(); paintTabs(); paintPanel();
}
