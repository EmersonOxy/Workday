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
  const r3 = await p.evaluate(() => { S.dayT = DAY_SECONDS / 9 * 2.5; return { m: GameClock.min(), win: GameClock.breakWindow() }; });
  ok(Math.round(r3.m) === 690 && r3.win, '11:30 dentro da janela de intervalo');
  ok(await p.evaluate(() => { S.dayT = DAY_SECONDS / 9; return !GameClock.breakWindow(); }), '10:00 fora da janela de intervalo');
  // intervalo: 7 min reais = 1 h
  const r4 = await p.evaluate(() => { S.dayT = DAY_SECONDS / 9 * 2.5; S.onBreak = true; GameClock.breakStart(); const t0 = S.dayT;
    for (let i = 0; i < 210 * 20; i++) GameClock.breakTick(0.05);   // 210 s reais
    const mid = GameClock.min(); for (let i = 0; i < 9000 * 20; i++) GameClock.breakTick(0.05);
    const cap = GameClock.min(); return { mid, cap, dayT: S.dayT === t0 }; });
  ok(Math.abs(r4.mid - 720) < 0.01, 'meio intervalo: 3,5 min reais = 30 min simulados (12:00)');
  ok(r4.cap === 840 && r4.dayT, 'intervalo não passa das 14:00 e o expediente fica parado');
  const r5 = await p.evaluate(() => { S.clk.brk = 760; GameClock.breakEnd(); S.onBreak = false; const a = GameClock.min();
    S.dayT += 0.5; const b = GameClock.min(); S.dayT = DAY_SECONDS - 1e-6; const c = GameClock.min(); S.dayT = DAY_SECONDS; const d = GameClock.min(); return { a, b, c, d }; });
  ok(r5.a === 760 && r5.b > 760, 'volta do intervalo continua do horário certo (sem retroceder)');
  ok(r5.d === 1080 && r5.c <= 1080, 'expediente termina exatamente às 18:00');
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
