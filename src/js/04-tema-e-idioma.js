/* ================= Tema e idioma ================= */
const hostTheme = document.documentElement.getAttribute('data-theme');
function applyTheme() {
  const r = document.documentElement;
  if (CFG.theme === 'system') { if (hostTheme) r.setAttribute('data-theme', hostTheme); else r.removeAttribute('data-theme'); }
  else r.setAttribute('data-theme', CFG.theme);
}
function applyLang() {
  L = LANGS[CFG.lang];
  $('padBoss').textContent = L.ui.hide; $('padDel').textContent = L.ui.del;
  document.documentElement.lang = L.htmlLang;
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = U()[el.dataset.t]; });
  $('stressWrap').title = U().stress;
  for (const k in HUD_LAST) delete HUD_LAST[k];
  setSound(soundOn, true);
  if (S && S.trays) renderTrays();
  hud(); renderDesk();
}

