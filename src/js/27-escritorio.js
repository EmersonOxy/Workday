/* ================= Escritório (modo computador) ================= */
// No computador o jogo roda dentro do monitor de uma cena em pixel art (canvas por trás, HTML por cima da tela).
// Telas de toque ou pequenas mantêm o layout próprio.
const OFFICE = { on: false, M: null, L: null, baked: null, key: '', last: 0, cv: $('office'), blind: CFG.blinds ? 1 : 0 };
OFFICE.ctx = OFFICE.cv.getContext('2d');
function officeWanted() { return !document.body.classList.contains('touch') && innerWidth >= 900 && innerHeight >= 500; }
function officeState() {
  const day = S && S.phase === 'day';
  const hour = day ? 9 + Math.min(9, S.dayT / DAY_SECONDS * 9) : S && (S.phase === 'ending' || S.phase === 'report') ? 18 : 9.5;
  const stress = S ? S.stress : 0;
  const clutter = day ? Math.min(3, Math.floor(stress / 30) + (S.level >= 8 ? 1 : 0)) : 0;
  const ringing = day && S.tasks.some(t => t.type === 'call');
  return { hour, stress, clutter, decor: P.decor, rank: S ? S.rankIdx : 0, blind: OFFICE.blind, day: S ? S.day : 0, ringing, press: OFFICE.press, click: OFFICE.click };
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
  if (!want) { OFFICE.cv.style.display = 'none'; app.style.left = app.style.top = app.style.width = app.style.height = ''; return; }
  // Resolução escolhida: limita o tamanho do jogo; o escritório preenche o resto da janela
  let [tw, th] = CFG.res && CFG.res !== 'auto' ? CFG.res.split('x').map(Number) : [innerWidth, innerHeight];
  tw = Math.min(tw, innerWidth); th = Math.min(th, innerHeight);
  const M = OFFICE.M = Office.measure(tw, th); M.VW = Math.ceil(innerWidth / M.k); M.VH = Math.ceil(innerHeight / M.k);
  const L = OFFICE.L = Office.layout(M.VW, M.VH, Math.ceil(tw / M.k), Math.ceil(th / M.k)), cv = OFFICE.cv;
  cv.style.display = 'block'; cv.width = M.VW; cv.height = M.VH; cv.style.width = M.VW * M.k + 'px'; cv.style.height = M.VH * M.k + 'px';
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
  const st = officeState(), key = [OFFICE.L.VW, OFFICE.L.VH, st.hour * 4 | 0, st.clutter, st.decor.join(), st.rank, st.day].join('|');
  if (key !== OFFICE.key) { OFFICE.key = key; OFFICE.baked = Office.bake(OFFICE.L, st); }
  // Persiana anda em degraus até a posição pedida, com estalinhos do mecanismo
  const want = CFG.blinds ? 1 : 0;
  if (OFFICE.blind !== want) { OFFICE.blind = want > OFFICE.blind ? Math.min(want, OFFICE.blind + .09) : Math.max(want, OFFICE.blind - .12); st.blind = OFFICE.blind; sfx('blind'); }
  Office.draw(OFFICE.ctx, OFFICE.L, st, OFFICE.baked, now / 1000);
  if (document.body.classList.contains('menu-mode')) { const d = new Date(); hudSet('osclock', 'text', String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); }
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
function onWindow(e) {
  if (!OFFICE.on || !OFFICE.L) return false;
  const w = Office.spots(OFFICE.L).win, x = e.clientX / OFFICE.M.k, y = e.clientY / OFFICE.M.k;
  return x >= w.x - 2 && x <= w.x + w.w + 2 && y >= w.y - 2 && y <= w.y + w.h + 4;
}
OFFICE.cv.addEventListener('pointerdown', e => { if (onWindow(e)) { CFG.blinds = !CFG.blinds; persist(); } });
OFFICE.cv.addEventListener('pointermove', e => { OFFICE.cv.style.cursor = onWindow(e) ? 'pointer' : ''; });
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
addEventListener('keydown', e => { if (e.key.length === 1 || e.key.startsWith('Arrow') || e.key === 'Enter') OFFICE.press = { k: e.key.length === 1 ? e.key.toUpperCase() : e.key, t: performance.now() / 1000 }; }, true);
addEventListener('pointerdown', () => { OFFICE.click = performance.now() / 1000; }, true);
officeLayout(); requestAnimationFrame(officeFrame);
