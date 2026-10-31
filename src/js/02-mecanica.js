/* ================= Mecânica ================= */
const SECTORS = [{ id: 'fin', color: 'var(--fin)' }, { id: 'rh', color: 'var(--rh)' }, { id: 'jur', color: 'var(--jur)' }, { id: 'ti', color: 'var(--ti)' }];
// Balanceamento (ver design/balanceamento.md). "original" é o padrão; os outros existem só para avaliação
// (Configurações → Experimental). Cada um guarda carteira, enfeites, recorde, estatísticas e carreira à parte.
// Estresse, velocidade dos documentos e prazos são iguais nos três.
const SALARY_MID = [45, 58, 72, 88, 106, 126, 150], SALARY_LONG = [40, 50, 62, 76, 92, 110, 130];
const BALANCE = {
  original:      { levelPts: L => L, multCap: 5, comboStep: 5, ranks: [0, 300, 1000, 2500, 5000, 9000, 15000],
                   dayBonus: d => 100 * d, pay: (ds, d) => Math.round(ds / 10) + 30 * d, severance: ds => Math.round(ds / 20), priceMul: 1 },
  intermediaria: { levelPts: L => 1 + Math.min(L - 1, 20) * .25, multCap: 4, comboStep: 8, ranks: [0, 900, 2800, 6200, 11500, 19000, 30000],
                   dayBonus: () => 80, pay: (ds, d, r) => SALARY_MID[r] + Math.min(40, Math.round(ds / 60)), severance: (ds, r) => 2 * SALARY_MID[r], priceMul: 1 },
  longa:         { levelPts: L => 1 + Math.min(L - 1, 16) * .12, multCap: 3, comboStep: 10, ranks: [0, 1200, 4000, 9500, 19000, 34000, 56000],
                   dayBonus: () => 60, pay: (ds, d, r) => SALARY_LONG[r] + Math.min(30, Math.round(ds / 80)), severance: (ds, r) => 2 * SALARY_LONG[r], priceMul: 1 },
};
const BAL_KEY = (() => { try { const c = JSON.parse(localStorage.getItem('expediente-config') || '{}'); return BALANCE[c.balance] ? c.balance : 'original'; } catch (e) { return 'original'; } })();
const BAL = BALANCE[BAL_KEY];
const RANK_DAYS = [1, 1, 2, 3, 5, 7, 10];   // dia mínimo para alcançar cada cargo (Estagiário … CEO)
// Dificuldade: multiplica o ritmo do expediente (Normal = valores originais, sem mudança).
// fall: queda dos documentos · ttl: prazo das tarefas · tasks: frequência de tarefas · events: frequência de eventos · stress: estresse recebido
const DIFFS = {
  facil:   { fall: .8,   ttl: 1.3, tasks: .75, events: .8,   stress: .7 },
  normal:  { fall: 1,    ttl: 1,   tasks: 1,   events: 1,    stress: 1 },
  dificil: { fall: 1.15, ttl: .85, tasks: 1.2, events: 1.15, stress: 1.25 },
  burnout: { fall: 1.35, ttl: .7,  tasks: 1.45, events: 1.35, stress: 1.6 },
};
const DIFF = () => DIFFS[(typeof CFG !== 'undefined' && CFG.diff) || 'normal'] || DIFFS.normal;
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
SHOP.forEach(i => { i.price = Math.round(i.price * BAL.priceMul); });
const RANK_DESK = { 1: 'mug', 2: 'nameplate', 4: 'chair', 6: 'crown' };

const $ = id => document.getElementById(id);
const board = $('board'), tasksEl = $('tasks');
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);

