/* ================= Intervalo Livre ================= */
// Pausa voluntária (cargo Analista em diante, uma vez por dia). Congela o expediente como a chamada do Duda
// (S.paused + S.resting), esconde a interface de trabalho e libera a área de trabalho do WorkOS sem limite de tempo.
// Não dá pontos, dinheiro nem alivia estresse. Ao voltar: contagem 3, 2, 1 e tudo continua de onde parou.
const BREAK_RANK = 2;
function breakUnlocked() { return !!S && S.rankIdx >= BREAK_RANK; }
function breakAvailable() {
  return !!S && S.phase === 'day' && breakUnlocked() && S.breakDay !== S.day && !S.resting && !S.boss && !S.bossAlert && S.bossAuto <= 0
    && !S.frozen && !S.virus && !S.video && !Call.el && document.body.classList.contains('office');
}
function startBreak() {
  if (!breakAvailable()) return false;
  const u = U(), m = $('modal');
  S.breakDay = S.day; S.paused = true; S.resting = true; S.onBreak = true; S.fast = false;
  muffle(true); hideSheet(); music('menu'); sfx('pop');
  document.body.classList.add('menu-mode', 'on-break');
  const card = m.querySelector('.card'); card.style.display = 'none';
  m.classList.remove('hidden'); osSyncMin();
  osIcons(); osStart(u);
  m.insertAdjacentHTML('beforeend', `<button class="os-back">${u.breakEnd}</button>`);
  m.querySelector('.os-back').onclick = endBreak;
  return true;
}
// Telas abertas durante o intervalo (Configurações etc.) voltam para a área de trabalho, não para o menu principal
function breakHome() { const c = $('modal').querySelector('.card'); c.style.display = 'none'; const t = osTaskOf(c); if (t) t.remove(); osSyncMin(); }
function endBreak() {
  if (!S || !S.onBreak) return;
  const m = $('modal');
  m.querySelectorAll('.os-icons, .os-start, .os-smenu, .os-win, .os-tasks, .os-back, .legalbar').forEach(e => e.remove());
  modal.into = null;
  m.querySelector('.card').style.display = ''; m.classList.add('hidden'); m.classList.remove('allmin');
  document.body.classList.remove('menu-mode', 'on-break');
  S.onBreak = false; sfx('click');
  countdown(() => { S.resting = false; S.paused = false; S.last = performance.now(); muffle(false); if (S.phase === 'day') music('office'); });
}
