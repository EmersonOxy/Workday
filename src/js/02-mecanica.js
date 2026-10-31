/* ================= Mecânica ================= */
const SECTORS = [{ id: 'fin', color: 'var(--fin)' }, { id: 'rh', color: 'var(--rh)' }, { id: 'jur', color: 'var(--jur)' }, { id: 'ti', color: 'var(--ti)' }];
// ===== Balanceamento: todos os números de economia, progressão e dificuldade ficam aqui =====
// (ver design/balanceamento.md e tools/simulate.py). "original" é a chave de armazenamento do perfil padrão:
// o nome ficou para que carteira, enfeites, recorde e carreira dos saves antigos continuem valendo.
// Os outros perfis existem para comparação (Configurações → Experimental) e guardam tudo à parte.
const SALARY_STD = [42, 54, 68, 84, 102, 122, 145], SALARY_MID = [45, 58, 72, 88, 106, 126, 150], SALARY_LONG = [40, 50, 62, 76, 92, 110, 130];
// nível do expediente: no padrão sobe 1,5 por dia e 1 a cada 40 s, então cada mecânica nova chega num dia diferente
const LEVEL_OLD = (d, t) => 1 + (d - 1) * 2 + Math.floor(t / 30), LEVEL_STD = (d, t) => 1 + Math.floor((d - 1) * 1.5) + Math.floor(t / 40);
const BALANCE = {
  // Padrão: dinheiro vem do salário do cargo + desempenho com teto (não dos pontos brutos, que crescem com o dia);
  // promoção pede pontos DO DIA e um dia mínimo, então Gerente, Diretor e CEO exigem constância
  original:      { levelPts: L => 1 + Math.min(L - 1, 18) * .2, multCap: 4, comboStep: 8, ranks: [0, 900, 2700, 5300, 8900, 13300, 18500],
                   rankDays: [1, 1, 3, 5, 8, 11, 14], level: LEVEL_STD,
                   dayBonus: () => 80, pay: (ds, d, r) => SALARY_STD[r] + Math.min(35, Math.round(ds / 70)), severance: (ds, r) => 2 * SALARY_STD[r], priceMul: 1 },
  classica:      { levelPts: L => L, multCap: 5, comboStep: 5, ranks: [0, 300, 1000, 2500, 5000, 9000, 15000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: d => 100 * d, pay: (ds, d) => Math.round(ds / 10) + 30 * d, severance: ds => Math.round(ds / 20), priceMul: 1, oldPrices: true },
  intermediaria: { levelPts: L => 1 + Math.min(L - 1, 20) * .25, multCap: 4, comboStep: 8, ranks: [0, 900, 2800, 6200, 11500, 19000, 30000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: () => 80, pay: (ds, d, r) => SALARY_MID[r] + Math.min(40, Math.round(ds / 60)), severance: (ds, r) => 2 * SALARY_MID[r], priceMul: 1 },
  longa:         { levelPts: L => 1 + Math.min(L - 1, 16) * .12, multCap: 3, comboStep: 10, ranks: [0, 1200, 4000, 9500, 19000, 34000, 56000], rankDays: [1, 1, 2, 3, 5, 7, 10], level: LEVEL_OLD,
                   dayBonus: () => 60, pay: (ds, d, r) => SALARY_LONG[r] + Math.min(30, Math.round(ds / 80)), severance: (ds, r) => 2 * SALARY_LONG[r], priceMul: 1 },
};
const BAL_KEY = (() => { try { const c = JSON.parse(localStorage.getItem('expediente-config') || '{}'); return BALANCE[c.balance] ? c.balance : 'original'; } catch (e) { return 'original'; } })();
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
const DAY_SECONDS = 150;
const LEVEL_SECONDS = 30;
const MAX_TASKS = 5;
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

