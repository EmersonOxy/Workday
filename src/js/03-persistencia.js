/* ================= Persistência ================= */
function load(k, d) { try { const v = localStorage.getItem('expediente-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem('expediente-' + k, JSON.stringify(v)); } catch (e) {} }
const STAT_KEYS = ['files', 'emails', 'calls', 'typed', 'prints', 'viruses', 'bosses', 'videos', 'days', 'careers', 'maxDay'];
const freshStats = () => Object.fromEntries(STAT_KEYS.map(k => [k, 0]));
function guessLang() { const l = (navigator.language || 'pt').slice(0, 2); return LANGS[l] ? l : 'pt'; }
const P = { wallet: load('carteira', 0), decor: load('enfeites', []), seen: load('tutorial', []), best: load('recorde2', 0),
            stats: Object.assign(freshStats(), load('stats', {})) };
const CFG = Object.assign({ lang: guessLang(), theme: 'system' }, load('config', {}));
if (!LANGS[CFG.lang]) CFG.lang = 'pt';
function persist() { save('carteira', P.wallet); save('enfeites', P.decor); save('tutorial', P.seen); save('recorde2', P.best); save('stats', P.stats); save('config', CFG); }
function stat(k, n = 1) { P.stats[k] += n; }

let L = LANGS[CFG.lang];
const U = () => L.ui;
const fmt = n => n.toLocaleString(L.htmlLang);
const money = n => `${L.money} ${fmt(n)}`;
const sectorName = id => L.sectors[id];

