/* ================= Escritório (modo computador) ================= */
// No computador o jogo roda dentro do monitor de uma cena em pixel art (canvas por trás, HTML por cima da tela).
// Telas de toque ou pequenas mantêm o layout próprio.
const OFFICE = { on: false, M: null, L: null, baked: null, key: '', last: 0, cv: $('office'), blind: CFG.blinds ? 1 : 0 };
OFFICE.ctx = OFFICE.cv.getContext('2d');
OFFICE.fx = $('officeFx'); OFFICE.fxCtx = OFFICE.fx.getContext('2d'); OFFICE.keys = new Map(); OFFICE.mouse = { btn: [0, 1, 2].map(() => ({ down: false, up: -1 })) };
function officeWanted() { return !document.body.classList.contains('touch') && innerWidth >= 900 && innerHeight >= 500; }
function officeState() {
  const day = S && S.phase === 'day';
  const hour = day ? 9 + Math.min(9, S.dayT / DAY_SECONDS * 9) : S && (S.phase === 'ending' || S.phase === 'report') ? 18 : 9.5;
  const stress = S ? S.stress : 0;
  const clutter = day ? Math.min(3, Math.floor(stress / 30) + (S.level >= 8 ? 1 : 0)) : 0;
  const ringing = (day && S.tasks.some(t => t.type === 'call')) || !!OFFICE.call;
  return { hour, stress, clutter, decor: P.decor, rank: S ? S.rankIdx : 0, blind: OFFICE.blind, day: S ? S.day : 0, ringing, press: OFFICE.press, click: OFFICE.click, hw: hw(), badge: badgeInfo(), lights: lightState(), weather: Office.weather(S ? S.day : 1) };
}
// Crachá da mesa: cores do avatar ou miniatura 4×5 da foto
function badgeInfo() {
  // miniatura 4×5 do crachá da mesa: amostra do retrato atual (foto ou personagem)
  const src = PROFILE.photo === 'local' && PHOTO.mini ? PHOTO.mini : Array.isArray(PROFILE.photo) ? Pixel.master(PROFILE.photo, WD_PAL) : avRender(avConfig());
  const c = document.createElement('canvas'); c.width = 6; c.height = 7; const x = c.getContext('2d'); x.imageSmoothingEnabled = true;
  x.drawImage(src, src.width * .14, src.height * .08, src.width * .72, src.height * .72, 0, 0, 6, 7);
  const d = x.getImageData(0, 0, 6, 7).data, hex = i => '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
  const av = avConfig();
  return { shirt: (AV_RAMPS.cloth[av.outfitColor] || AV_RAMPS.cloth.azul)[1], px: [0, 1, 2, 3, 4, 5, 6].map(j => [0, 1, 2, 3, 4, 5].map(i => hex((j * 6 + i) * 4))) };
}
function officeLayout() {
  const want = officeWanted();
  if (want !== OFFICE.on) {
    OFFICE.on = want; document.body.classList.toggle('office', want); document.body.classList.toggle('mobile', !want);
    // Diálogos, planilha falsa, vinheta e janelas passam a viver dentro da tela do monitor
    const host = uiRoot();
    for (const id of ['modal', 'boss', 'vignette']) host.append($(id));
    document.querySelectorAll('.popup, #toast, #bossAlert, #video, #lane').forEach(e => host.append(e));
    layoutDecor();
  }
  const app = $('app');
  document.body.classList.toggle('mobile', !want);
  if (!want) { OFFICE.cv.style.display = OFFICE.fx.style.display = 'none'; app.style.left = app.style.top = app.style.width = app.style.height = ''; return; }
  // Resolução escolhida: limita o tamanho do jogo; o escritório preenche o resto da janela
  let [tw, th] = CFG.res && CFG.res !== 'auto' ? CFG.res.split('x').map(Number) : [innerWidth, innerHeight];
  tw = Math.min(tw, innerWidth); th = Math.min(th, innerHeight);
  const M = OFFICE.M = Office.measure(tw, th); M.VW = Math.ceil(innerWidth / M.k); M.VH = Math.ceil(innerHeight / M.k);
  const L = OFFICE.L = Office.layout(M.VW, M.VH, Math.ceil(tw / M.k), Math.ceil(th / M.k)), cv = OFFICE.cv;
  for (const c of [cv, OFFICE.fx]) { c.style.display = 'block'; c.width = M.VW; c.height = M.VH; c.style.width = M.VW * M.k + 'px'; c.style.height = M.VH * M.k + 'px'; }
  const s = L.screen, k = M.k;
  Object.assign(app.style, { left: s.x * k + 'px', top: s.y * k + 'px', width: s.w * k + 'px', height: s.h * k + 'px' });
  app.style.setProperty('--fs', Math.max(13, Math.min(26, s.h * k * .027)).toFixed(1) + 'px');
  OFFICE.key = '';
  if (S && S.file && S.phase === 'day') placeFile();
}
function officeFrame(now) {
  requestAnimationFrame(officeFrame);
  if (!OFFICE.on || document.hidden || now - OFFICE.last < 80) return;   // ~12 quadros/s bastam para o ambiente
  OFFICE.last = now;
  const st = officeState(), key = [OFFICE.L.VW, OFFICE.L.VH, st.hour * 4 | 0, st.clutter, st.decor.join(), st.rank, st.day, JSON.stringify(st.hw), JSON.stringify(st.badge), JSON.stringify(st.lights)].join('|');
  if (key !== OFFICE.key) { OFFICE.key = key; OFFICE.baked = Office.bake(OFFICE.L, st); }
  // Persiana anda em degraus até a posição pedida, com estalinhos do mecanismo
  const want = CFG.blinds ? 1 : 0;
  if (OFFICE.blind !== want) { OFFICE.blind = want > OFFICE.blind ? Math.min(want, OFFICE.blind + .09) : Math.max(want, OFFICE.blind - .12); st.blind = OFFICE.blind; sfx('blind'); }
  Office.draw(OFFICE.ctx, OFFICE.L, st, OFFICE.baked, now / 1000);
  sysClock();
}
// Área de trabalho do "WorkOS" no menu inicial: ícones decorativos e barra de tarefas
(() => {
  const icons = $('osdesk').querySelector('.icons');
  for (const [rows, label, pal] of [[SPR2.doc, 'WORKDAY.EXE', WD_SECTOR_RAMP.ti], [XL_ICON.sheet, 'ORCAMENTO.XLS'], [SPR2.envelope, 'E-MAIL'], [SPR2.virus, 'NAO_ABRA.EXE'], [SPR.trash, 'LIXEIRA']]) {
    const d = document.createElement('div'); d.className = 'osicon'; d.append(Pixel.el(rows, 3, pal)); d.insertAdjacentHTML('beforeend', `<span>${label}</span>`); icons.append(d); }
  $('osdesk').querySelector('.start').append(Pixel.el(SPR2.doc, 1, WD_SECTOR_RAMP.ti));
  $('osdesk').querySelector('.start').insertAdjacentHTML('beforeend', ' WorkOS');
})();
// Clicar na janela abre ou fecha a persiana
// Hora e data reais do aparelho: na barra do WorkOS (menu) e no canto do cabeçalho durante o expediente
function sysClock() {
  const d = new Date(), t = d.toLocaleTimeString(L.htmlLang, { hour: '2-digit', minute: '2-digit' }), dt = d.toLocaleDateString(L.htmlLang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  hudSet('osclock', 'text', t + ' · ' + dt); hudSet('sysclock', 'text', t + ' ' + dt.slice(0, 5));
}
setInterval(sysClock, 15000);
function onWindow(e) {
  if (!OFFICE.on || !OFFICE.L) return false;
  const w = Office.spots(OFFICE.L).win, x = e.clientX / OFFICE.M.k, y = e.clientY / OFFICE.M.k;
  return x >= w.x - 2 && x <= w.x + w.w + 2 && y >= w.y - 2 && y <= w.y + w.h + 4;
}
// Fontes de luz independentes: id, objeto que precisa existir na mesa e estado salvo (CFG.lights).
// Hoje só a luminária; abajures e outras luzes entram aqui com seu próprio retângulo de clique e área de luz.
const LIGHTS = [{ id: 'lamp', needs: 'lamp', rect: L => Office.lampRect(L) }];
function lightState() { const s = {}; for (const l of LIGHTS) s[l.id] = !(CFG.lights && CFG.lights[l.id] === false); return s; }
function toggleLight(id) { CFG.lights = Object.assign({}, CFG.lights, { [id]: !lightState()[id] }); persist(); OFFICE.key = ''; OFFICE.last = 0; sfx('switch'); }
function onLamp(e) {
  if (!OFFICE.on || !OFFICE.L || !P.decor.includes('lamp')) return false;
  const b = Office.lampRect(OFFICE.L), x = e.clientX / OFFICE.M.k, y = e.clientY / OFFICE.M.k;
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}
function onBadge(e) {
  if (!OFFICE.on || !OFFICE.L) return false;
  const b = Office.badgeRect(OFFICE.L), x = e.clientX / OFFICE.M.k, y = e.clientY / OFFICE.M.k;
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}
// Clicar no crachá abre a versão ampliada; o expediente congela enquanto isso
function openBadgeFromDesk() {
  const was = S && S.paused;
  if (S && S.phase === 'day') S.paused = true;
  sfx('pop');
  showBadge(() => { closeModal(); if (S && S.phase === 'day') { S.paused = was; S.last = performance.now(); } });
}
OFFICE.cv.addEventListener('pointerdown', e => { if (onWindow(e)) { CFG.blinds = !CFG.blinds; persist(); } else if (onLamp(e)) toggleLight('lamp'); else if (onBadge(e) && $('modal').classList.contains('hidden')) openBadgeFromDesk(); });
OFFICE.cv.addEventListener('pointermove', e => { const hov = onBadge(e) ? 'badge' : onLamp(e) ? 'lamp' : onWindow(e) ? 'win' : null; OFFICE.cv.style.cursor = hov ? 'pointer' : ''; if (hov !== OFFICE.hover) { OFFICE.hover = hov; fxWake(); } });
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch (e) {}
}
$('fsBtn').onclick = e => { e.currentTarget.blur(); toggleFullscreen(); };
if (!document.documentElement.requestFullscreen) $('fsBtn').hidden = true;
addEventListener('resize', officeLayout);
document.addEventListener('fullscreenchange', () => { CFG.display = document.fullscreenElement ? 'full' : 'window'; persist(); officeLayout(); });
// Preferência de tela cheia: o navegador só permite entrar após um clique ou tecla
document.addEventListener('pointerdown', () => { if (CFG.display === 'full' && !document.fullscreenElement && document.documentElement.requestFullscreen) toggleFullscreen(); }, { once: true });
// Botões físicos: afundam ao apertar
document.addEventListener('pointerdown', e => { const b = e.target.closest('.pxbtn, .task button, .slot, .paym'); if (b && !b.disabled) Motion.press(b); });
// Teclas e cliques do jogador aparecem no teclado e no mouse da mesa
// Resposta imediata do teclado e do mouse da mesa: camada própria, redesenhada a cada quadro só enquanto há tecla
// apertada ou o brilho de soltura (~90 ms). O resto do escritório segue no ritmo ambiente (~12 qps).
function fxFrame() {
  if (!OFFICE.on || !OFFICE.L) { OFFICE.fxRun = false; return; }
  const now = performance.now();
  const active = Office.drawInput(OFFICE.fxCtx, OFFICE.L, hw(), OFFICE.keys, OFFICE.mouse, now, OFFICE.hover);
  for (const [k, s] of OFFICE.keys) if (s.up !== null && now - s.up > 120) OFFICE.keys.delete(k);
  if (active) requestAnimationFrame(fxFrame); else OFFICE.fxRun = false;
}
const fxWake = () => { if (!OFFICE.fxRun) { OFFICE.fxRun = true; requestAnimationFrame(fxFrame); } };
// Cada tecla real acende a tecla do mesmo lugar no teclado da mesa (KeyboardEvent.code); várias ao mesmo tempo
addEventListener('keydown', e => { if (e.repeat || !e.code) return; OFFICE.keys.set(e.code, { up: null }); fxWake(); }, true);
addEventListener('keyup', e => { const s = OFFICE.keys.get(e.code); if (s) s.up = performance.now(); fxWake(); }, true);
// Botão real do mouse: 0 esquerdo, 1 meio, 2 direito
addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; const b = OFFICE.mouse.btn[e.button]; if (b) { b.down = true; fxWake(); } }, true);
addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; const b = OFFICE.mouse.btn[e.button]; if (b) { b.down = false; b.up = performance.now(); fxWake(); } }, true);
addEventListener('blur', () => { OFFICE.keys.clear(); OFFICE.mouse.btn.forEach(b => b.down = false); fxWake(); });
officeLayout(); requestAnimationFrame(officeFrame);
