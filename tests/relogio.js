// Testes técnicos do relógio global (data/hora simuladas). Uso: python3 tools/build.py && node tests/relogio.js
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ✓ ' + m); } else { fails++; console.log('  ✗ ' + m); } };
async function boot(ctx) {
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  await p.evaluate(() => { const t = document.getElementById('titlescr'); if (t) t.remove(); closeScene(); ARRIVED = true; showMenu(); });
  return { p, errs };
}
const GameClock_t = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m) % 60).padStart(2, '0');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
  let { p, errs } = await boot(ctx);
  const r0 = await p.evaluate(() => ({ t1: gameTime(), m1: GameClock.min() }));
  await p.waitForTimeout(2200);
  const r1 = await p.evaluate(() => ({ t: gameTime(), arr: GameClock.arrival(), d: gameDateOf(1).toDateString() }));
  ok(r0.m1 >= 420 && r0.m1 < 480, 'chegada entre 07:00 e 07:59 (' + r0.t1 + ')');
  ok(r0.t1 === r1.t, 'fora do expediente o relógio fica parado');
  ok(r1.d === new Date(2026, 0, 5).toDateString(), 'dia 1 = data inicial da carreira (05/01/2026)');
  // começa o expediente
  const r2 = await p.evaluate(() => { newCareer(); ARRIVED = true; clockIn(); return { m: GameClock.min(), day: S.day }; });
  ok(r2.m === 540 && r2.day === 1, 'expediente começa às 09:00');
  ok(await p.evaluate(() => DAY_SECONDS === 240), 'expediente de 240 s de trabalho ativo');
  // sem intervalo (cargo inicial): 540 min em 240 s, minuto a minuto
  const r3 = await p.evaluate(() => { const out = []; let prev = -1, jump = 0, back = 0; for (let t = 0; t <= DAY_SECONDS; t += 0.05) { S.dayT = t; const m = Math.floor(GameClock.min()); if (prev >= 0) { if (m - prev > 1) jump++; if (m < prev) back++; } prev = m; } S.dayT = 120; return { jump, back, mid: gameTime(), end: (S.dayT = DAY_SECONDS, gameTime()) }; });
  ok(!r3.jump && !r3.back, 'sem intervalo: minuto a minuto, sem saltos nem retrocessos');
  ok(r3.mid === '13:30' && r3.end === '18:00', 'sem intervalo: 120 s = 13:30, 240 s = 18:00');
  // com intervalo: horário sorteado entre 11h e 14h, 45 s = 1 h, termina às 18:00
  async function dayWithBreak(plan, blockUntil) {
    return p.evaluate(([plan, blockUntil]) => {
      document.body.classList.add('office'); S.rankIdx = BREAK_RANK; S.breakDay = 0; S.dayT = 0; S.phase = 'day'; GameClock.beginDay(); const p0 = S.clk.plan; if (plan) S.clk.plan = plan;
      const log = []; let prev = 540, jump = 0, back = 0, real = 0, brkAt = null, brkEnd = null, rates = [];
      const ba = breakAvailable; breakAvailable = () => GameClock.min() >= blockUntil && ba();
      for (let i = 0; i < 400 * 20 && S.phase === 'day'; i++) {
        real += 0.05;
        if (S.onBreak) { GameClock.breakTick(0.05); if (!S.onBreak) { brkEnd = GameClock.min(); S.resting = false; S.paused = false; } }
        else if (S.paused) { S.resting = false; S.paused = false; }
        else { const m0 = GameClock.min(); S.dayT += 0.05; if (S.dayT >= DAY_SECONDS) { S.dayT = DAY_SECONDS; } GameClock.workTick(); if (S.onBreak && brkAt == null) brkAt = GameClock.min(); rates.push(GameClock.min() - m0); if (S.dayT >= DAY_SECONDS) break; }
        const m = Math.floor(GameClock.min()); if (m - prev > 1) jump++; if (m < prev) back++; prev = m;
      }
      breakAvailable = ba;
      const w = rates.filter(x => x > 0), maxR = Math.max(...w), minR = Math.min(...w);
      return { p0, brkAt, brkEnd, end: GameClock.min(), real: Math.round(real), jump, back, maxR, minR, workT: S.dayT };
    }, [plan, blockUntil || 0]);
  }
  const d1 = await dayWithBreak(null);
  ok(d1.p0 >= 660 && d1.p0 < 840, 'intervalo sorteado entre 11h e 14h (' + GameClock_t(d1.p0) + ')');
  ok(Math.abs(d1.brkEnd - d1.brkAt - 60) < 0.01, 'intervalo dura 1 h simulada');
  ok(d1.end === 1080 && d1.workT === 240 && d1.real === 285, 'termina às 18:00 com 240 s de trabalho + 45 s de intervalo (' + d1.real + ' s reais)');
  ok(!d1.jump && !d1.back, 'com intervalo: minuto a minuto, sem saltos nem retrocessos');
  ok(Math.abs(d1.maxR - d1.minR) < 1e-6, 'ritmo do trabalho constante antes e depois do intervalo');
  const d2 = await dayWithBreak(814);
  ok(Math.floor(d2.brkAt) === 814 && Math.floor(d2.brkEnd) === 874 && d2.end === 1080, 'começa 13:34 → termina 14:34 e o dia fecha às 18:00');
  const d3 = await dayWithBreak(700, 760);
  ok(Math.floor(d3.brkAt) === 760 && d3.end === 1080 && !d3.jump && !d3.back, 'intervalo atrasado pelo jogo: restante redistribuído, termina às 18:00');
  const d4 = await dayWithBreak(700, 9999);
  ok(d4.brkAt == null && d4.end === 1080 && !d4.jump && !d4.back, 'intervalo impedido até 14h: desiste e termina às 18:00');
  await p.evaluate(() => { S.rankIdx = 0; S.breakDay = 0; GameClock.beginDay(); S.dayT = DAY_SECONDS; });
  // fim do dia e dias seguintes
  const r6 = await p.evaluate(() => { endDay(); return { t: gameTime(), ph: S.phase }; });
  ok(r6.t === '18:00', 'fim do dia: relógio em 18:00');
  await p.waitForTimeout(2000);
  const r7 = await p.evaluate(() => { closeScene(); nextDay(); return { day: S.day, t: gameTime(), arr: GameClock.text(GameClock.arrival(2)), date: gameDateOf(Quests.today()).toDateString() }; });
  ok(r7.day === 2 && r7.t === r7.arr, 'dia 2: chegada do próprio dia (' + r7.t + ')');
  ok(r7.date === new Date(2026, 0, 6).toDateString(), 'dia 2 = 06/01/2026');
  ok(await p.evaluate(() => gameDateOf(5).toDateString() === new Date(2026, 0, 9).toDateString() && gameDateOf(6).toDateString() === new Date(2026, 0, 12).toDateString()), 'pula fim de semana (dia 6 = seg 12/01)');
  ok(await p.evaluate(() => careerDayOf(new Date(2026, 0, 12)) === 6 && careerDayOf(new Date(2026, 0, 10)) === 0), 'calendário: data → dia da carreira');
  // retomada de save: reabrir o jogo mantém data e hora
  const before = await p.evaluate(() => { const r = { d: Quests.today(), t: gameTime(), start: GameClock.start().toDateString() }; return r; });
  await p.evaluate(() => persist());   // a carreira foi salva pelo endDay do dia 1
  ({ p, errs } = await boot(ctx));
  const after = await p.evaluate(() => ({ d: Quests.today(), t: gameTime(), start: GameClock.start().toDateString(), arr: GameClock.text(GameClock.arrival(Quests.today())) }));
  ok(after.d === before.d && after.d === 2, 'reabrir: mesmo dia da carreira (' + after.d + ')');
  ok(after.start === before.start && after.t === after.arr, 'reabrir: mesma data inicial e horário de chegada estável');
  ok(await p.evaluate(() => { Quests.check(); return Object.values(QST.ach).every(v => typeof v === 'number'); }), 'conquistas com carimbo numérico');
  ok(!errs.length, 'sem erros de página' + (errs.length ? ': ' + errs.join(' | ') : ''));
  console.log(`\n${passes} ok, ${fails} falhas`); await browser.close(); process.exit(fails ? 1 : 0);
})();
