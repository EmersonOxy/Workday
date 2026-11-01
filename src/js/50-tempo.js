/* ================= Tempo do jogo: data, chegada, expediente e intervalo ================= */
// Uma única fonte para a hora e a data do jogo (relógio do WorkOS, ponto, MSworkN, luz do escritório, relatórios).
//  · Data: dia N da carreira = N-ésimo dia útil a partir de segunda 05/01/2026 (gameDateOf, 49-atestado.js).
//  · Chegada: hora sorteada entre 07:00 e 08:00 (fixa por carreira e dia). Fica TRAVADA no ponto e no menu até
//    o jogador clicar em Jogar.
//  · Expediente: da chegada até 18:00, descontando a hora do intervalo, distribuído ao longo de DAY_SECONDS.
//  · Intervalo (almoço): começa sozinho numa hora sorteada entre 11:00 e 14:00. Dura TIME.lunchMin minutos do jogo,
//    que passam em TIME.lunchReal segundos reais (valores de teste). O relógio anda devagar durante o intervalo.
//  · Depois do expediente (fim do dia, relatório, noite): 18:00.
const TIME = { arrive: [420, 480], end: 1080, lunch: [660, 840], lunchMin: 60, lunchReal: 420 };
const gameFmt = m => { m = Math.max(0, Math.min(1439, Math.floor(m))); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const dayRng = (day, salt) => Office.rng(EMP_ID * 131 + Quests.cid() * 977 + (day | 0) * 7919 + salt);
function arrivalMin(day) { const R = dayRng(day, 11); R(); return TIME.arrive[0] + Math.floor(R() * (TIME.arrive[1] - TIME.arrive[0] + 1)); }
function lunchAt(day) { const R = dayRng(day, 23); R(); return TIME.lunch[0] + Math.floor(R() * (TIME.lunch[1] - TIME.lunch[0] + 1)); }
// minuto do expediente sem o intervalo (linear no tempo jogado)
function workBase() { const a = arrivalMin(S.day); return a + Math.min(1, (S.dayT || 0) / DAY_SECONDS) * (TIME.end - a - TIME.lunchMin); }
function gameMin() {
  if (S && S.onBreak && S.brk) return S.brk.from + Math.min(TIME.lunchMin, (performance.now() - S.brk.t0) / 1000 / TIME.lunchReal * TIME.lunchMin);
  if (S && S.phase === 'day') return workBase() + (S.brk && S.brk.done ? TIME.lunchMin : 0);
  if (S && ['ending', 'report', 'promo', 'over'].includes(S.phase)) return TIME.end;
  return arrivalMin(Quests.today());
}
function gameTime() { return gameFmt(gameMin()); }
clockText = () => gameTime();
sysClock = function () {
  const t = gameTime(), dt = gameDateOf(Quests.today()).toLocaleDateString(L.htmlLang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  hudSet('osclock', 'text', t + ' · ' + dt); hudSet('sysclock', 'text', t + ' ' + dt.slice(0, 5));
};
setInterval(() => sysClock(), 1000);

/* ---------- intervalo de almoço (todos os cargos) ---------- */
breakUnlocked = () => !!S;
const lunchDue = () => !!S && S.phase === 'day' && !(S.brk && S.brk.done) && workBase() >= lunchAt(S.day);
{ const ba0 = breakAvailable; breakAvailable = () => ba0() && lunchDue(); }
{ const sb0 = startBreak; startBreak = () => {
    const from = gameMin(); if (!sb0()) return false;
    S.brk = { t0: performance.now(), from, done: false };
    breakLabel(); return true; }; }
{ const eb0 = endBreak; endBreak = () => { if (S && S.brk) S.brk.done = true; eb0(); }; }
{ const sd0 = startDay; startDay = () => { sd0(); S.brk = null; }; }
function breakLabel() {
  const b = document.querySelector('#modal .os-back'); if (!b || !S || !S.brk) return;
  const left = Math.max(0, TIME.lunchReal - (performance.now() - S.brk.t0) / 1000);
  b.textContent = `${U().breakEnd} · ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
}
setInterval(() => {
  if (!S) return;
  if (S.onBreak && S.brk) { breakLabel(); if ((performance.now() - S.brk.t0) / 1000 >= TIME.lunchReal) endBreak(); return; }
  // começa sozinho na hora do almoço, assim que nada estiver acontecendo na tela
  if (S.phase === 'day' && !S.paused && !S.appPause && lunchDue() && breakAvailable()) { toast(U().lunchTitle, U().lunchLine(gameTime())); startBreak(); }
}, 500);
Object.assign(LANGS.pt.ui, { breakStart: 'Intervalo', lunchTitle: 'Hora do intervalo', lunchLine: t => `São ${t}. Uma hora de descanso, sem trabalho.` });
Object.assign(LANGS.en.ui, { breakStart: 'Break', lunchTitle: 'Break time', lunchLine: t => `It's ${t}. One hour of rest, no work.` });
Object.assign(LANGS.es.ui, { breakStart: 'Descanso', lunchTitle: 'Hora del descanso', lunchLine: t => `Son las ${t}. Una hora de descanso, sin trabajo.` });

/* ---------- conquistas com a data do jogo ---------- */
const achDateText = id => QST.achDay && QST.achDay[id] != null ? gameDateOf(QST.achDay[id]).toLocaleDateString(L.htmlLang) : '';
