/* ================= Mecânica ================= */
const SECTORS = [{ id: 'fin', color: 'var(--fin)' }, { id: 'rh', color: 'var(--rh)' }, { id: 'jur', color: 'var(--jur)' }, { id: 'ti', color: 'var(--ti)' }];
// ===== Balanceamento: todos os números de economia, progressão e dificuldade ficam aqui =====
// (ver design/balanceamento.md e tools/simulate.py). "original" é a chave de armazenamento do perfil padrão:
// o nome ficou para que carteira, enfeites, recorde e carreira dos saves antigos continuem valendo.
// Os outros perfis existem para comparação (Configurações → Experimental) e guardam tudo à parte.
const SALARY_STD = [42, 54, 68, 84, 102, 122, 145], SALARY_MID = [45, 58, 72, 88, 106, 126, 150], SALARY_LONG = [40, 50, 62, 76, 92, 110, 130];
// nível do expediente: no padrão sobe 1,5 por dia e 1 a cada 40 s, então cada mecânica nova chega num dia diferente
const SALARY_25 = [40, 52, 66, 82, 100, 120, 145];
// carreira de 25 dias: nível sobe devagar com o dia e satura em 12 (velocidade da queda e intervalo entre tarefas)
const LEVEL_25 = (d, t) => Math.min(12, 1 + Math.floor((d - 1) * .35) + Math.floor(t / 50));
const LEVEL_OLD = (d, t) => 1 + (d - 1) * 2 + Math.floor(t / 30), LEVEL_STD = (d, t) => 1 + Math.floor((d - 1) * 1.5) + Math.floor(t / 40);
const BALANCE = {
  // Padrão: dinheiro vem do salário do cargo + desempenho com teto (não dos pontos brutos, que crescem com o dia);
  // promoção pede pontos DO DIA e um dia mínimo, então Gerente, Diretor e CEO exigem constância
  // Padrão: carreira de 25 dias mínimos. Nível pesa pouco e satura (×1,8), combo até ×3; promoção pede pontos DO DIA e um
  // dia mínimo (Assistente 3 · Analista 7 · Coordenador 11 · Gerente 16 · Diretor 21 · CEO 25). Ver tools/simulate.py.
  original:      { levelPts: L => 1 + Math.min(L - 1, 8) * .1, multCap: 3, comboStep: 8, ranks: [0, 1800, 4100, 6700, 9500, 12500, 15600],
                   rankDays: [1, 3, 7, 11, 16, 21, 25], level: LEVEL_25,
                   dayBonus: () => 60, pay: (ds, d, r) => SALARY_25[r] + Math.min(30, Math.round(ds / 60)), severance: (ds, r) => 2 * SALARY_25[r], priceMul: 1.3 },   // carreira mais longa: preços 30% maiores
  classica:      { levelPts: L => L, multCap: 5, comboStep: 5, ranks: [0, 300, 1000, 2500, 5000, 9000, 15000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: d => 100 * d, pay: (ds, d) => Math.round(ds / 10) + 30 * d, severance: ds => Math.round(ds / 20), priceMul: 1, oldPrices: true },
  intermediaria: { levelPts: L => 1 + Math.min(L - 1, 20) * .25, multCap: 4, comboStep: 8, ranks: [0, 900, 2800, 6200, 11500, 19000, 30000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: () => 80, pay: (ds, d, r) => SALARY_MID[r] + Math.min(40, Math.round(ds / 60)), severance: (ds, r) => 2 * SALARY_MID[r], priceMul: 1 },
  longa:         { levelPts: L => 1 + Math.min(L - 1, 16) * .12, multCap: 3, comboStep: 10, ranks: [0, 1200, 4000, 9500, 19000, 34000, 56000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: () => 60, pay: (ds, d, r) => SALARY_LONG[r] + Math.min(30, Math.round(ds / 80)), severance: (ds, r) => 2 * SALARY_LONG[r], priceMul: 1 },
};
const BAL_KEY = (() => { try { const c = JSON.parse(localStorage.getItem(WD_NS + 'config') || '{}'); return BALANCE[c.balance] ? c.balance : 'original'; } catch (e) { return 'original'; } })();
const BAL = BALANCE[BAL_KEY];
const RANK_DAYS = BAL.rankDays;   // dia mínimo para alcançar cada cargo (Estagiário … CEO)
// Dificuldade: multiplica o ritmo do expediente.
// fall: queda dos documentos · ttl: prazo das tarefas · tasks: frequência de tarefas · events: frequência de eventos · stress: estresse recebido
// Fácil é acessível de verdade; Normal é o meio-termo; Difícil fica no ritmo antigo do Normal com prazos mais curtos; Burnout é extremo.
const DIFFS = {
  facil:   { fall: .72,  ttl: 1.5,  tasks: .6,   events: .6,   stress: .55 },
  normal:  { fall: .9,   ttl: 1.15, tasks: .85,  events: .85,  stress: .85 },
  dificil: { fall: 1.1,  ttl: .9,   tasks: 1.15, events: 1.1,  stress: 1.2 },
  burnout: { fall: 1.4,  ttl: .65,  tasks: 1.55, events: 1.45, stress: 1.75 },
};
// Primeiros dias mais calmos em qualquer dificuldade: o ritmo chega ao valor cheio no 4º dia (prazo mais longo e menos estresse no começo)
const EASE_IN = [.7, .8, .9];
const DIFF = (() => { let key = '', val = null;
  return () => { const id = (typeof CFG !== 'undefined' && CFG.diff) || 'normal', d = (typeof S !== 'undefined' && S && S.day) || 1, k = id + d;
    if (k === key) return val; const b = DIFFS[id] || DIFFS.normal, e = EASE_IN[d - 1] || 1;
    key = k; val = { fall: b.fall * (.85 + .15 * e), ttl: b.ttl / e, tasks: b.tasks * e, events: b.events * e, stress: b.stress * e }; return val; }; })();
const RANK_POINTS = BAL.ranks;
const UNLOCK = { button: 2, email: 3, type: 4, call: 5, printer: 6, video: 8 };
const EVENTS = { boss: 3, shuffle: 5, freeze: 6, virus: 7 };
// ===== Progressão da carreira por dia (independente da dificuldade e dos modificadores do dia) =====
// DEBUT: dia de estreia de cada mecânica/variante. No dia de estreia ela surge obrigatoriamente depois de FIRST_DELAY s,
// com dica; depois aparece ao acaso com frequência que cresce com os dias (FREQ). Nada antecipa uma estreia.
const DEBUT = { button: 1, sector: 2, urgent: 3, dead: 4, email: 6, spam: 7, call: 8, call2: 9, printer: 10, type: 11, printer2: 11,
  boss: 12, shuffle: 13, freeze: 14, virus: 16, it2: 17, video: 18, video2: 19, complex: 21, crisis: 23 };
const FIRST_DELAY = 20;
const WIN_DAY = 25;
const debutOk = (k, d, t) => d > DEBUT[k] || (d === DEBUT[k] && (t || 0) >= FIRST_DELAY);
const firstOk = k => !!S && debutOk(k, S.day, S.dayT);
// chance de usar a variante/mecânica num sorteio: começa baixa na estreia e chega a 100% em ~5 dias
const FREQ = k => !S || !firstOk(k) ? 0 : Math.min(1, .3 + .14 * (S.day - DEBUT[k]));
// pressão do dia (0 no dia 1 → 1 no dia 25): intervalo entre tarefas, prazos e eventos
const PRESS = d => Math.min(1, Math.max(0, (d - 1) / 24));
const PROG = {
  maxTasks: d => d <= 5 ? 1 : d <= 10 ? 2 : d <= 15 ? 3 : d <= 20 ? 4 : 5,
  taskGap: d => 7.5 - 4 * PRESS(d),                      // segundos entre pendências (antes do sorteio ±30%)
  ttl: d => 1.15 - .35 * PRESS(d),                        // multiplicador de prazo (mais curto com os dias, nunca abaixo de 0,8)
  eventGap: d => 22 - 9 * PRESS(d),                       // segundos entre eventos (chefe, troca, travamento, vírus)
  crisis: d => d >= 24 ? .35 : d >= DEBUT.crisis ? .2 : 0,  // chance de um segundo evento junto (crise)
};
const DAY_SECONDS = 150;
const LEVEL_SECONDS = 30;
const MAX_TASKS = 5;   // teto absoluto; o do dia vem de PROG.maxTasks
const RESOLUTIONS = ['auto', '1280x720', '1366x768', '1600x900', '1920x1080', '2560x1440'];
const MODS = {
  first: {}, sexta: { speed: 0.85, w: { boss: 3 } }, fecha: { finUrgent: true }, home: { w: { boss: 0, shuffle: 0 }, video: 2 },
  ar: { drift: 0.9 }, ti: { w: { freeze: 2, virus: 2 }, earlyTech: true }, segunda: { taskRate: 1.35 }, audit: { errMul: 1.3, ptsMul: 1.3 },
};
const PERK_IDS = ['estagiario', 'fone', 'antivirus', 'secretaria', 'terapia', 'mouse', 'bandeja', 'corretor', 'cafeteira', 'relacoes', 'meta'];
const SHOP = [
  { id: 'cafe', kind: 'use', price: 20, spr: 'coffee' }, { id: 'cha', kind: 'use', price: 30, spr: 'tea' },
  { id: 'fone', kind: 'day', price: 35, spr: 'headphones' }, { id: 'antivirus', kind: 'day', price: 35, spr: 'shield' },
  { id: 'postit', kind: 'day', price: 45, spr: 'postit' }, { id: 'planta', kind: 'decor', price: 60, spr: 'plant' },
  { id: 'foto', kind: 'decor', price: 80, spr: 'frame' }, { id: 'lamp', kind: 'decor', price: 120, spr: 'lamp' },
  { id: 'monitor', kind: 'decor', price: 200, spr: 'monitor' }, { id: 'gato', kind: 'decor', price: 350, spr: 'cat' },
  { id: 'trofeu', kind: 'decor', price: 600, spr: 'trophy' },
  { id: 'cacto', kind: 'decor', price: 70, spr: 'cacto' }, { id: 'radio', kind: 'decor', price: 180, spr: 'radio' }, { id: 'aquario', kind: 'decor', price: 280, spr: 'aquario' },
];
Object.entries(DECOR_EXTRA).forEach(([id, d]) => SHOP.push({ id, kind: 'decor', price: d.price, spr: id }));
// Preços do perfil padrão (consumíveis quase iguais; enfeites grandes e raros viram metas de médio e longo prazo)
const PRICES = { cafe: 20, cha: 30, fone: 45, antivirus: 45, postit: 55, adesivos: 35, pato: 50, cacto: 80, planta: 90, livros: 110, foto: 120,
  webcam: 150, globo: 190, caixas: 220, lamp: 220, diploma: 280, radio: 300, quadro: 340, monitor: 380, neon: 420, aquario: 520, gato: 650, trofeu: 1200 };
if (!BAL.oldPrices) SHOP.forEach(i => { if (PRICES[i.id] !== undefined) i.price = PRICES[i.id]; });
SHOP.forEach(i => { i.price = Math.round(i.price * BAL.priceMul); });
const RANK_DESK = { 1: 'mug', 2: 'nameplate', 4: 'chair', 6: 'crown' };

const $ = id => document.getElementById(id);
const board = $('board'), tasksEl = $('tasks');
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);

