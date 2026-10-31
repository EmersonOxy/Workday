/* ================= Mecânica ================= */
const SECTORS = [{ id: 'fin', color: 'var(--fin)' }, { id: 'rh', color: 'var(--rh)' }, { id: 'jur', color: 'var(--jur)' }, { id: 'ti', color: 'var(--ti)' }];
const RANK_POINTS = [0, 300, 1000, 2500, 5000, 9000, 15000];
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
];
const RANK_DESK = { 1: 'mug', 2: 'nameplate', 4: 'chair', 6: 'crown' };

const $ = id => document.getElementById(id);
const board = $('board'), tasksEl = $('tasks');
const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);

