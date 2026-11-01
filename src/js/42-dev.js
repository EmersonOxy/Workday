/* ================= Ferramentas de teste (dev) ================= */
// Abre com Ctrl+Shift+D (ou ?dev na URL). Só para testes: mexe no save deste aparelho.
function devPanel() {
  let w = document.getElementById('devp'); if (w) { w.remove(); return; }
  w = document.createElement('div'); w.id = 'devp';
  w.style.cssText = 'position:fixed;z-index:9999;right:8px;top:8px;width:260px;padding:8px;background:#fff8ec;color:#2a1f2d;font:12px monospace;box-shadow:0 0 0 2px #2a1f2d;display:flex;flex-direction:column;gap:4px';
  const B = [
    ['+ R$ 1.000', () => { P.wallet += 1000; persist(); hud(); }],
    ['Carteira = 0', () => { P.wallet = 0; persist(); hud(); }],
    ['Pular para o dia…', () => { const d = +prompt('Dia da carreira', S ? S.day : 1); if (!d) return; const c = load('carreira', null) || {}; save('carreira', Object.assign({ score: 0, rankIdx: 0, perks: [], today: [], inv: {}, careerCauses: {}, stress: 0 }, c, { day: d - 1 })); if (S) S.day = d; hud(); }],
    ['Terminar o dia agora', () => { if (S && S.phase === 'day') S.dayT = DAY_SECONDS; }],
    ['Promover (+1 cargo)', () => { if (S && S.rankIdx < RANK_POINTS.length - 1) { S.rankIdx++; Quests.rank(S.rankIdx); saveCareer(); hud(); renderDesk(); } }],
    ['Estresse 0', () => { if (S) S.stress = 0; }],
    ['Todos os enfeites', () => { P.decor = SHOP.filter(i => i.kind === 'decor').map(i => i.id); persist(); OFFICE.key = ''; Office._slotKey = null; }],
    ['Remover enfeites', () => { P.decor = []; persist(); OFFICE.key = ''; Office._slotKey = null; }],
    ['Liberar broches e personalizações', () => { SPECIAL.forEach(e => { QST.done[e.id] = QST.done[e.id] || { day: 0 }; if (!QST.pins.includes(e.pin)) QST.pins.push(e.pin); if (e.unlock && !QST.unlocks.includes(e.unlock)) QST.unlocks.push(e.unlock); }); qSave(); }],
    ['Zerar missões/conquistas', () => { Object.assign(QST, { done: {}, active: {}, seen: {}, pins: [], unlocks: [], ach: {}, maxRank: 0 }); qSave(); }],
    ['MSworkN: liberar todos os contatos', () => { socSync(); CAST_ORDER.forEach(id => { const r = socRel(id); if (r.st !== 'known') { r.st = 'known'; r.since = socCtx().day; } }); socDirty(); }],
    ['MSworkN: próxima mensagem agora', () => { SocRT.lastStart = SocRT.lastEval = SocRT.enterMenu = -1e9; for (const k in SOC.daily) delete SOC.daily[k]; for (const k in SocRT.due) SocRT.due[k] = 0; }],
    ['MSworkN: zerar relacionamentos (carreira)', () => { SOC = socFresh(); socSync(); socFlush(); if (Msn.visible()) Msn.render(); }],
    ['MSworkN: chamada recebida (Lu)', () => { if (!Call.el) socCall('lu', { incoming: true }); }],
    ['Gato: próximo estado', () => { const k = Object.keys(CatAI.STATES), i = (k.indexOf(OFFICE_CAT.state) + 1) % k.length; Object.assign(OFFICE_CAT, { state: k[i], t0: performance.now() / 1000, dur: 6 }); }],
  ];
  w.innerHTML = '<b>DEV · Ctrl+Shift+D fecha</b>';
  B.forEach(([t, f]) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'font:inherit;text-align:left;padding:3px 6px;cursor:pointer'; b.onclick = () => { f(); OFFICE.last = 0; sfx('click'); }; w.append(b); });
  document.body.append(w);
}
addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) { e.preventDefault(); devPanel(); } }, true);
if (/[?&]dev\b/.test(location.search)) setTimeout(devPanel, 800);
