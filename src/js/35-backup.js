/* ================= Backup do progresso e balanceamento experimental ================= */
// Formato versionado: { format: 'workday-save', version: 1, exported, data: { 'expediente-…': texto JSON } }.
// Inclui tudo o que o jogo guarda (perfil, personagem, foto processada, configurações, dinheiro, estatísticas, carreiras
// de cada balanceamento, desbloqueios). A importação valida tudo antes de tocar no progresso atual.
const SAVE_FORMAT = 'workday-save', SAVE_VERSION = 1;
function exportSave() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('expediente-')) data[k] = localStorage.getItem(k); }
  const blob = new Blob([JSON.stringify({ format: SAVE_FORMAT, version: SAVE_VERSION, game: 'WORKDAY', exported: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `workday-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function validSave(o) {
  if (!o || o.format !== SAVE_FORMAT || o.version !== SAVE_VERSION || !o.data || typeof o.data !== 'object') return false;
  for (const [k, v] of Object.entries(o.data)) { if (!k.startsWith('expediente-') || typeof v !== 'string') return false; try { JSON.parse(v); } catch (e) { return false; } }
  return true;
}
function importSave(file, report) {
  const r = new FileReader();
  r.onload = () => {
    let o; try { o = JSON.parse(r.result); } catch (e) { o = null; }
    if (!validSave(o)) { report(U().importBad, true); sfx('err'); return; }
    if (!confirm(U().importAsk)) return;
    const old = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('expediente-')) old.push(k); }
    window.SKIP_PERSIST = true;
    try { old.forEach(k => localStorage.removeItem(k)); for (const [k, v] of Object.entries(o.data)) localStorage.setItem(k, v); }
    catch (e) { window.SKIP_PERSIST = false; report(U().importBad, true); return; }
    report(U().importOk); setTimeout(() => location.reload(), 600);
  };
  r.readAsText(file);
}
function showBalance(back) {
  const u = U();
  const card = modal(`<h2>${u.balTitle}</h2><p class="hint">${u.balNote}</p>
    <div class="bal-list">${Object.keys(BALANCE).map(k => `<button class="pxbtn${k === BAL_KEY ? ' on' : ''}" data-b="${k}"><b>${u.balNames[k]}</b><small>${u.balDesc[k]}</small></button>`).join('')}</div>
    <div class="actions"><button class="pxbtn main" id="balBack">${u.back}</button></div>`);
  card.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { if (b.dataset.b === BAL_KEY) return; CFG.balance = b.dataset.b; persist(); saveCareer && S && saveCareer(); location.reload(); });
  card.querySelector('#balBack').onclick = back;
}
