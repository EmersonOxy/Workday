/* ================= Atestado médico e relógio global do jogo ================= */
// Ninguém é demitido nem pede demissão: estresse no limite (ou "Pedir atestado" na pausa) vira um atestado médico.
// O dia termina mais cedo com desconto (metade do salário e dos pontos do dia), o jogador vai para casa e a mesma run
// continua no dia seguinte. O calendário marca o dia como atestado. Dificuldade e desbloqueios seguem a ordem dos dias.
//
// RELÓGIO GLOBAL (fonte única de data e hora simuladas — WorkOS, ponto, expediente, calendário, MSworkN, missões, conquistas).
// Três tempos, nunca misturados:
//   • tempo real ......... relógio do aparelho (Date): só para metadados (backup exportado, id de conta). Nunca aparece no jogo.
//   • tempo de expediente  S.dayT, segundos de jogo efetivo (0..DAY_SECONDS); para em pausas, janelas e no intervalo.
//   • tempo simulado ..... data da carreira + minuto do dia (GameClock.min()), derivado dos dois acima e do estado do dia.
// Data: o dia N da carreira é o N-ésimo dia útil a partir da data inicial da carreira (padrão: seg 05/01/2026, guardada
// por carreira em 'relogio'); avança um dia útil a cada expediente e nunca usa a data real.
// Hora: chegada sorteada entre 07:00 e 07:59 (estável por carreira+dia, então sair e voltar não muda); o expediente vai
// das 09:00 às 18:00 em DAY_SECONDS (240 s) de trabalho ativo, minuto a minuto. Quem tem intervalo (Analista+) recebe um
// horário sorteado entre 11h e 14h; o intervalo dura 45 s reais = 1 h simulada (13:34 → 14:34) e o trabalho fica parado.
// Com intervalo previsto, o trabalho anda 480 min simulados em 240 s (2 min/s) desde as 09:00, então o relógio não muda de
// ritmo ao voltar; se o intervalo atrasar/adiantar ou não acontecer, o restante é redistribuído proporcionalmente até 18:00.
// Fora do expediente o relógio fica parado.
const GAME_EPOCH = new Date(2026, 0, 5);   // segunda-feira (data inicial padrão; saves antigos usam esta)
const GameClock = {
  WORK_IN: 9 * 60, WORK_OUT: 18 * 60, BRK_A: 11 * 60, BRK_B: 14 * 60, BRK_LEN: 60, BRK_REAL: 45,   // minutos simulados / segundos reais
  // data inicial da carreira atual (preservada no save; carreira nova herda a padrão)
  start() {
    const cid = Quests.cid(), r = load('relogio', null);
    if (r && r.cid === cid && Array.isArray(r.start)) return new Date(r.start[0], r.start[1], r.start[2]);
    const d = r && Array.isArray(r.next) ? new Date(r.next[0], r.next[1], r.next[2]) : new Date(GAME_EPOCH);
    while (d.getDay() % 6 === 0) d.setDate(d.getDate() + 1);   // começa sempre num dia útil
    save('relogio', { cid, start: [d.getFullYear(), d.getMonth(), d.getDate()], next: r && r.next });
    return d;
  },
  // define a data inicial das PRÓXIMAS carreiras (a atual mantém a sua)
  setStart(d) { const r = load('relogio', null) || {}; r.next = [d.getFullYear(), d.getMonth(), d.getDate()]; save('relogio', r); },
  date(day = Quests.today()) { const d = this.start(); let n = Math.max(1, day | 0) - 1; while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n--; } return d; },
  // dia da carreira de uma data (0 = fim de semana ou antes do dia 1)
  dayOf(date) {
    const a = this.start(), b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (b < a || b.getDay() % 6 === 0) return 0;
    let n = 1; while (a < b) { a.setDate(a.getDate() + 1); if (a.getDay() % 6) n++; } return n;
  },
  arrival(day = Quests.today()) { return 7 * 60 + Math.floor(Office.rng(EMP_ID * 977 + Quests.cid() * 131 + day * 7)() * 60); },
  // começo do expediente: 09:00; plan = minuto sorteado do intervalo (só quem tem intervalo)
  beginDay() {
    const plan = typeof breakUnlocked === 'function' && breakUnlocked()
      ? this.BRK_A + Math.floor(Office.rng(EMP_ID * 541 + Quests.cid() * 37 + S.day * 11)() * (this.BRK_B - this.BRK_A)) : null;
    S.clk = { m0: this.WORK_IN, t0: 0, plan, brk: null, bt: 0 };
  },
  pending() { const c = S && S.clk; return !!c && c.plan != null && S.breakDay !== S.day; },
  // minuto simulado do momento atual do jogo (contínuo; a tela mostra minuto a minuto)
  min() {
    if (!S) return this.arrival();
    const c = S.clk;
    if (S.phase === 'day' && c) {
      if (c.brk != null) return Math.min(c.brk + this.BRK_LEN, c.brk + c.bt * this.BRK_LEN / this.BRK_REAL);
      const left = DAY_SECONDS - c.t0, end = this.WORK_OUT - (this.pending() ? this.BRK_LEN : 0);
      return Math.min(this.WORK_OUT, c.m0 + (left > 0 ? Math.max(0, (S.dayT || 0) - c.t0) * (end - c.m0) / left : 0));
    }
    if (S.phase === 'ending' || S.phase === 'promo' || S.phase === 'over') return c ? this.WORK_OUT : this.arrival();
    return this.arrival();   // antes do expediente (menu, ponto, intro): parado na chegada do dia de hoje
  },
  text(m = this.min()) { m = Math.floor(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); },
  // rebase: o restante do expediente passa a ser distribuído a partir de agora (sem salto: começa do minuto atual)
  rebase() { const c = S.clk, m = this.min(); c.m0 = m; c.t0 = S.dayT || 0; },
  // intervalo manual (botão) só entre 11h e 14h
  breakWindow() { const m = this.min(); return m >= this.BRK_A && m < this.BRK_B; },
  // a cada quadro de trabalho: no horário sorteado, entra no intervalo assim que o jogo permitir; até 14h, senão desiste
  workTick() {
    if (!this.pending() || S.onBreak) return;
    const m = this.min();
    if (m >= this.BRK_B) { this.rebase(); S.clk.plan = null; return; }
    if (m >= S.clk.plan && breakAvailable()) startBreak();
  },
  breakStart() { const c = S.clk; if (!c) return; const m = this.min(); c.brk = m; c.bt = 0; },
  breakTick(dt) {
    const c = S && S.clk; if (!c || c.brk == null) return;
    c.bt = Math.min(this.BRK_REAL, c.bt + dt);
    hudSet('clock', 'text', clockText());
    if (c.bt >= this.BRK_REAL && S.onBreak && !Call.el) endBreak();   // 45 s: volta (com 3, 2, 1); numa chamada, espera ela acabar
  },
  breakEnd() {
    const c = S && S.clk; if (!c || c.brk == null) return;
    c.m0 = this.min(); c.t0 = S.dayT || 0; c.brk = null; c.bt = 0;   // continua do minuto em que o intervalo parou
  },
  // carimbo de data (conquistas etc.): meia-noite da data da carreira, em ms — mesmo formato numérico dos saves antigos
  stamp(day = Quests.today()) { return this.date(day).getTime(); },
};
function gameDateOf(day) { return GameClock.date(day); }
function careerDayOf(date) { return GameClock.dayOf(date); }
function gameTime() { return GameClock.text(); }
function sysClock() {
  const t = gameTime(), dt = gameDateOf(Quests.today()).toLocaleDateString(L.htmlLang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  hudSet('osclock', 'text', t + ' · ' + dt); hudSet('sysclock', 'text', t + ' ' + dt.slice(0, 5));
}
setInterval(() => sysClock(), 250);   // < 0,75 s (1 min simulado no intervalo): nenhum minuto é pulado

// dias de atestado da carreira atual (chave própria, ligada à carreira)
const sickDays = () => { const a = load('atestados', null); return a && a.cid === Quests.cid() ? a.days : []; };
function markSick(day) { const days = sickDays(); if (!days.includes(day)) days.push(day); save('atestados', { cid: Quests.cid(), days }); }

LANGS.pt.ui.leave = { title: 'Atestado médico', stamp: 'ATESTADO', home: 'Ir para casa', burnout: 'O estresse passou do limite. O médico da empresa mandou você para casa descansar.',
  ask: 'Você pediu para ir embora mais cedo. O médico da empresa assinou o atestado.', back: n => `Amanhã você volta para o dia ${n}.`,
  pay: 'Salário do dia (com desconto)', lost: 'Pontos perdidos', cal: 'Atestado' };
LANGS.en.ui.leave = { title: 'Sick note', stamp: 'SICK NOTE', home: 'Go home', burnout: 'Your stress went over the limit. The company doctor sent you home to rest.',
  ask: 'You asked to leave early. The company doctor signed the sick note.', back: n => `Tomorrow you come back for day ${n}.`,
  pay: "Day's pay (with deduction)", lost: 'Points lost', cal: 'Sick note' };
LANGS.es.ui.leave = { title: 'Certificado médico', stamp: 'BAJA MÉDICA', home: 'Ir a casa', burnout: 'El estrés pasó del límite. El médico de la empresa te mandó a casa a descansar.',
  ask: 'Pediste irte antes. El médico de la empresa firmó el certificado.', back: n => `Mañana vuelves para el día ${n}.`,
  pay: 'Sueldo del día (con descuento)', lost: 'Puntos perdidos', cal: 'Baja médica' };
// "Pedir demissão" na pausa vira "Pedir atestado" (mesmo documento para assinar)
Object.assign(LANGS.pt.ui, { quit: 'Pedir atestado', resignTitle: 'Atestado médico', resignStamp: 'ATESTADO', resignHint: 'Assine para ir para casa. Você volta amanhã, com desconto no salário de hoje.',
  resignBody: (name, n) => `Atesto, para os devidos fins, que <b>${name}</b>, funcionário(a) nº ${n}, precisa ir para casa descansar pelo restante do dia.`,
  resignClauses: ['Repouso até amanhã, longe de planilhas.', 'Metade do salário do dia, por ter saído mais cedo.', 'Metade dos pontos do dia fica com a empresa.'] });
Object.assign(LANGS.en.ui, { quit: 'Ask for sick note', resignTitle: 'Sick note', resignStamp: 'SICK NOTE', resignHint: "Sign to go home. You're back tomorrow, with a deduction from today's pay.",
  resignBody: (name, n) => `I hereby certify that <b>${name}</b>, employee no. ${n}, needs to go home and rest for the remainder of the day.`,
  resignClauses: ['Rest until tomorrow, away from spreadsheets.', "Half of today's pay, for leaving early.", "Half of today's points stay with the company."] });
Object.assign(LANGS.es.ui, { quit: 'Pedir baja médica', resignTitle: 'Certificado médico', resignStamp: 'BAJA MÉDICA', resignHint: 'Firma para irte a casa. Vuelves mañana, con descuento en el sueldo de hoy.',
  resignBody: (name, n) => `Certifico, a los efectos oportunos, que <b>${name}</b>, empleado n.º ${n}, necesita ir a casa a descansar el resto del día.`,
  resignClauses: ['Reposo hasta mañana, lejos de las planillas.', 'La mitad del sueldo del día, por salir antes.', 'La mitad de los puntos del día se queda en la empresa.'] });

function sickLeave(reason) {
  if (!S || S.phase !== 'day') return;
  const u = U().leave, day = S.day;
  S.phase = 'ending'; S.fast = false; S.paused = false; S.burnout = false;
  const pay = Math.round(BAL.pay(Math.max(0, S.dayScore || 0), S.day, S.rankIdx) * 0.5), lost = Math.round(Math.max(0, S.dayScore || 0) * 0.5);
  S.score -= lost; S.dayScore -= lost; P.wallet += pay; stat('days'); P.stats.maxDay = Math.max(P.stats.maxDay, S.day);
  const st = S.stress; S.stress = 0; S.today.clear();
  markSick(day);
  persist(); saveCareer(); hud(); renderDesk();
  clearDom(); hideSheet(); music(null); sfx('err');
  try { socSync(); SOC.perf = [...SOC.perf.filter(p => p.d !== day), { d: day, score: S.dayScore, stress: st, sick: true }].slice(-5); SOC.pub.sick = day; socDirty(); } catch (e) {}
  Quests.rank(S.rankIdx); Quests.check();
  const card = modal(`<span class="over-stamp">${u.stamp}</span><h2>${u.title}</h2><p>${reason === 'burnout' ? u.burnout : u.ask}</p>
    <p class="over-who"><span class="over-face"></span><b>${profileName()}</b> · Nº ${EMP_ID}</p>
    <p class="money">${u.pay}: + ${money(pay)}</p><p>${u.lost}: − ${fmt(lost)}</p><p>${u.back(day + 1)}</p>
    <div class="actions"><button class="pxbtn main" id="home">${u.home}</button></div>`);
  card.classList.add('over-card', 'locked');
  card.querySelector('.over-face').append(portrait(56));
  setTimeout(() => { const s = card.querySelector('.over-stamp'); if (s) { s.classList.add('on'); Motion.stamp(s); } }, 500);
  card.querySelector('#home').onclick = () => { card.classList.remove('over-card', 'locked'); closeModal(); sleep(); };
}
// estresse no limite e "Pedir atestado": atestado no lugar do fim de carreira (a vitória continua indo para gameOver)
{ const go0 = gameOver; gameOver = (reason = 'burnout') => { if ((reason === 'burnout' || reason === 'quit') && S && S.phase === 'day') return sickLeave(reason === 'quit' ? 'ask' : 'burnout'); go0(reason); }; }
