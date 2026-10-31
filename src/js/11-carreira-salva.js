/* ================= Carreira salva ================= */
const EMP_ID = load('func', 0) || (() => { const n = 1000 + Math.floor(Math.random() * 9000); save('func', n); return n; })();
function saveCareer() {
  save('carreira', { day: S.day, score: S.score, rankIdx: S.rankIdx, perks: [...S.perks], today: [...S.today], inv: S.inv,
                     careerCauses: S.careerCauses, stress: S.stress, promoDay: S.promoDay });
}
// Sair no meio do expediente: guarda a carreira como estava no começo do dia atual (o dia é refeito ao continuar)
function saveCareerMidday() {
  save('carreira', { day: S.day - 1, score: S.score - (S.dayScore || 0), rankIdx: S.rankIdx, perks: [...S.perks], today: [...S.today], inv: S.inv,
                     careerCauses: S.careerCauses, stress: S.stress, promoDay: S.promoDay });   // promoDay: refazer o dia não dá outra promoção
}
function clearCareer() { try { localStorage.removeItem('expediente-' + balKey('carreira')); } catch (e) {} }
function resumeCareer() {
  const c = load('carreira', null);
  if (!c) { newCareer(); return; }
  newCareer(true);
  Object.assign(S, { day: c.day, score: c.score, rankIdx: c.rankIdx, perks: new Set(c.perks), today: new Set(c.today || []),
                     inv: c.inv, careerCauses: c.careerCauses || {}, stress: c.stress || 0, promoDay: c.promoDay });
  hud(); renderDesk();
  nextDay();
}

function nextDay() {
  S.day++;
  S.mod = S.day === 1 ? 'first' : pick(Object.keys(MODS).filter(k => k !== 'first'));
  S.phase = 'intro';
  closeModal();
  clockIn();
}

