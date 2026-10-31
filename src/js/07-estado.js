/* ================= Estado ================= */
let S = null;
function uiRoot() { return document.body.classList.contains('office') ? $('app') : document.body; }
const GLYPH = { fin: 'glyphFin', rh: 'glyphHr', jur: 'glyphJur', ti: 'glyphTi' };
const POPUPS = document.getElementsByClassName('popup');  // coleção viva: sempre atualizada
const has = id => S && (S.perks.has(id) || S.today.has(id));
function laneWidth() { return board.clientWidth / SECTORS.length; }
function rankIdx(score) { let r = 0; RANK_POINTS.forEach((p, i) => { if (score >= p) r = i; }); return r; }
const mod = () => MODS[S.mod];
function slow() { return (S.slowT > 0 ? 0.4 : 1) * (mod().speed || 1); }
const printerKeys = () => [...'QWYZXJKV'].filter(c => !L.words.some(w => w.includes(c)));

