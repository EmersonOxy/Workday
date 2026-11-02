/* ================= MSworkN: motor social (relacionamentos, memória, conversas e agenda) ================= */
// Camadas, de baixo para cima:
//  1. Cadastro (CAST, 43-social-elenco.js) e conteúdo (SOC_THREADS / socMem / SOC_PROMISE, 45-social-conversas.js): só dados.
//  2. Estado persistente (SOC): contatos, relação com cada um, fatos que cada personagem sabe, conhecimento do jogador,
//     fatos públicos da empresa, arcos de história, promessas, conversas em andamento e o que já foi disparado.
//  3. Contexto narrativo (socCtx): dia da carreira (Quests.today) e faixa do expediente simulado (S.dayT → 09h–18h).
//     Fora do expediente (menu, cenas da noite) a faixa é 'off' — o relógio do trabalho nunca anda sozinho.
//  4. Agenda (socTick): desbloqueios, escolha da próxima conversa espontânea, entrega linha a linha (com digitação),
//     prazos de resposta, promessas e presença. Tudo idempotente: cada conversa tem chave única gravada antes de começar.
// Regra entre carreiras: colegas (scope 'work') recomeçam do zero numa carreira nova; amigos de fora ('life') continuam
// e lembram que você trocou de emprego. Os dados ficam em "expediente-social" (por balanceamento, como a carreira) e o
// perfil do mensageiro (status e mensagem pessoal) em "expediente-social-perfil" (global). Ambos entram no backup.
BAL_KEYS.push('social');

const tx = v => Array.isArray(v) && typeof v[0] === 'string' ? (v[{ pt: 0, en: 1, es: 2 }[CFG.lang] || 0] ?? v[0]) : v;
const socNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const CAST = {}, CAST_ORDER = [];
function castAdd(def) { CAST[def.id] = Object.assign({ likes: {}, open: 1, speed: 1, group: 'work', scope: 'work', start: 'none', intents: {}, psm: [] }, def); CAST_ORDER.push(def.id); }
const castFirst = id => CAST[id] ? CAST[id].name.split(' ')[0] : id;
const SOC_THREADS = {}, SOC_MEM = {}, SOC_PROMISE = {};
function socThreads(list) { list.forEach(t => { SOC_THREADS[t.id] = Object.assign({ by: 'npc', prio: 50, ttl: 2, start: 'a' }, t); }); }
function socMem(map) { Object.assign(SOC_MEM, map); }

/* ---------- estado ---------- */
const SOC_V = 1;
const SOCP = Object.assign({ status: 'online', msg: '', col: {}, msgDay: null }, load('social-perfil', {}));
const socpSave = () => save('social-perfil', SOCP);
function socFresh() { return { v: SOC_V, cid: Quests.cid(), day: 0, c: {}, th: {}, done: {}, arc: {}, pub: {}, pk: {}, prom: {}, perf: [], rec: {}, daily: {}, ov: {} }; }
function socLoad() {
  let s = load('social', null);
  if (!s || typeof s !== 'object' || s.v !== SOC_V) s = {};   // versões futuras: migrar aqui
  s = Object.assign(socFresh(), s);
  for (const r of Object.values(s.c)) Object.assign(r, Object.assign(socRelBase(), r));
  return s;
}
const socRelBase = () => ({ st: 'none', aff: 0, trust: 0, fam: 0, riv: 0, f: {}, ch: {}, log: [], un: 0, chat: {} });
let SOC = null;
const SocRT = { due: {}, lastStart: -1e9, lastEval: -1e9, lastToast: -1e9, pres: {}, presAt: {}, savedAt: 0, quietN: 0, enterMenu: -1e9, listeners: [] };
function socRel(id) { return SOC.c[id] || (SOC.c[id] = socRelBase()); }
function socDirty() { SOC._dirty = true; SocRT.listeners.forEach(f => f()); }
function socFlush() { if (!SOC || window.SKIP_PERSIST) return; const { _dirty, ...data } = SOC; save('social', data); SOC._dirty = false; SocRT.savedAt = performance.now(); }
addEventListener('pagehide', () => { if (SOC && SOC._dirty) socFlush(); });

// Carreira nova: colegas recomeçam; amigos de fora ficam (com as datas da história ajustadas ao novo calendário)
function socNewCareerState(cid) {
  const old = SOC, now = 1, shift = now - (old.day || now), life = id => CAST[id] && CAST[id].scope === 'life';
  SOC = socFresh(); SOC.cid = cid;
  for (const [id, r] of Object.entries(old.c)) if (life(id)) { SOC.c[id] = r; if (old.c.duda || old.cid > 0) r.f.newJob = now; }
  for (const [k, d] of Object.entries(old.done)) { const T = SOC_THREADS[k.split(/[#@]/)[0]]; if (T && life(T.npc)) SOC.done[k] = Math.max(0, d + shift); }
  for (const [k, a] of Object.entries(old.arc)) if (life(k)) SOC.arc[k] = { s: a.s, d: a.d + shift };
  for (const [id, th] of Object.entries(old.th)) if (life(id)) { SOC.th[id] = th; if (th.at != null) th.at += shift; }
  SOC.day = now; socDirty();
}
function socSync() {
  if (!SOC) SOC = socLoad();
  const cid = Quests.cid();
  if (SOC.pre && SOC.cid === cid) { delete SOC.pre; socDirty(); }               // a carreira preparada no e-mail do RH começou
  else if (SOC.pre && SOC.cid === cid + 1) {}                                     // e-mail do 1º dia aberto: carreira nova já preparada
  else if (SOC.cid !== cid) socNewCareerState(cid);
  const ctx = socCtx();
  for (const id of CAST_ORDER) { const d = CAST[id], r = SOC.c[id];
    if ((d.start === 'always' || (d.start === 'career' && ctx.career)) && (!r || r.st === 'none')) { const rr = socRel(id); rr.st = 'known'; rr.since = ctx.day; socDirty(); } }
}

/* ---------- contexto narrativo ---------- */
function socCareer() { return !!S && S.phase !== 'over' || !!load('carreira', null) || !!(SOC && SOC.pre); }
function socCtx() {
  const career = socCareer(), day = SOC && SOC.pre ? 1 : career ? Quests.today() : (SOC && SOC.day) || 1;
  const inDay = !!S && (S.phase === 'day' || !!S.onBreak), intro = !!S && S.phase === 'intro';
  const clock = gameMin();   // hora do relógio do jogo (50-tempo.js)
  const min = inDay ? Math.max(0, Math.min(539, clock - 540)) : intro ? 0 : -1;
  const slot = min < 0 ? 'off' : S && S.onBreak ? 'lunch' : min < 180 ? 'am' : min < 270 ? 'lunch' : 'pm';
  const c = !S ? load('carreira', null) : null;
  return { day, cyc: Math.floor((day - 1) / CYCLE), min, clock, slot, inDay, career,
    working: inDay && !S.paused, rank: S && S.phase !== 'over' ? S.rankIdx : c ? c.rankIdx || 0 : 0,
    ev: career ? SPECIAL.filter(e => Quests.on(e, day)).map(e => e.id) : [] };
}
const socClock = m => m.at != null ? gameFmt(m.at) : m.tm < 0 ? null : String(9 + Math.floor(m.tm / 60)).padStart(2, '0') + ':' + String(m.tm % 60 - m.tm % 10).padStart(2, '0');

/* ---------- presença: rotina do expediente, reuniões, almoço, fora do horário e estados da história ---------- */
// Cada personagem tem blocos em minutos desde as 09h ([início, fim, status, chave da mensagem]); o que não estiver em
// bloco vale 'online'. Reunião: 1 h por dia, sorteada pelo dia (determinística). Fora do expediente: def.off.
const socHash = (...a) => { let h = 2166136261; for (const ch of a.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
function socPresence(id, ctx = socCtx()) {
  const d = CAST[id]; if (!d) return { s: 'offline' };
  if (d.scope === 'work' && !ctx.career) return { s: 'offline', m: null };
  if (d.presence) { const p = d.presence(ctx); if (p) return p; }
  const ov = SOC && SOC.ov[id];
  if (ov && ov.until >= ctx.day && (!ov.slot || ov.slot.includes(ctx.slot))) return { s: ov.s, m: ov.m };
  let s = 'online', m = null;
  if (ctx.slot === 'off') s = typeof d.off === 'function' ? d.off(ctx) : d.off || 'offline';
  else {
    const b = (d.blocks || []).find(([a, z]) => ctx.min >= a && ctx.min < z); if (b) { s = b[2]; m = b[3] || null; }
    if (d.meeting && s === 'online') { const st = 30 + Math.floor(socHash(id, ctx.day) * 7) * 60; if (ctx.min >= st && ctx.min < st + 60) { s = 'busy'; m = 'meeting'; } }
  }
  return { s, m };
}
const socAvail = p => p.s === 'online' || p.s === 'busy' || p.s === 'invisible';
// mensagem pessoal do contato: a última regra que vale (a lista vai das mais antigas às mais recentes)
function socPsm(id, ctx = socCtx()) { const d = CAST[id]; let t = null; for (const p of d.psm) if (socCond(p.when, id, ctx)) t = p.t; return t ? tx(t) : ''; }

/* ---------- condições (dados, sem código específico por personagem) ---------- */
function socEvDone(id, ctx) { const q = QST.done[id]; return !!q && q.cid === Quests.cid() && Math.floor(((q.day || 1) - 1) / CYCLE) === ctx.cyc; }
function socDoneAny(id, ctx) { return SOC.done[id] != null || SOC.done[id + '#' + ctx.cyc] != null; }
const asList = v => Array.isArray(v) ? v : [v];
function socRange(v, x) { return Array.isArray(v) ? x >= v[0] && x <= v[1] : x >= v; }
function socRelOk(r, spec) { return Object.entries(spec).every(([k, v]) => socRange(v, r[k] || 0)); }
function socCond(w, npc, ctx = socCtx()) {
  if (!w) return true;
  const me = npc ? socRel(npc) : null, rel = id => SOC.c[id] || socRelBase();
  for (const [k, v] of Object.entries(w)) {
    let ok = true;
    switch (k) {
      case 'day': ok = socRange(v, ctx.day); break;
      case 'slot': ok = asList(v).includes(ctx.slot); break;
      case 'working': ok = ctx.working === v; break;
      case 'ev': ok = asList(v).some(e => ctx.ev.includes(e)); break;
      case 'nev': ok = !asList(v).some(e => ctx.ev.includes(e)); break;
      case 'evDone': ok = socEvDone(v, ctx); break;
      case 'evJoined': ok = !!Quests.act(v) || socEvDone(v, ctx); break;
      case 'evNotJoined': ok = !Quests.act(v) && !socEvDone(v, ctx); break;
      case 'evPast': { const ev = SPECIAL.find(e => e.id === v), wn = ev && Quests.win(ev, ctx.day); ok = !!wn && ctx.day > wn.b; break; }
      case 'rank': ok = socRange(v, ctx.rank); break;
      case 'known': ok = asList(v).every(id => rel(id).st === 'known'); break;
      case 'nknown': ok = asList(v).every(id => rel(id).st !== 'known'); break;
      case 'k': ok = socRelOk(me, v); break;
      case 'kOf': ok = Object.entries(v).every(([id, spec]) => socRelOk(rel(id), spec)); break;
      case 'f': ok = asList(v).every(f => me.f[f] != null); break;
      case 'nf': ok = asList(v).every(f => me.f[f] == null); break;
      case 'fOf': ok = Object.entries(v).every(([id, f]) => asList(f).every(x => rel(id).f[x] != null)); break;
      case 'nfOf': ok = Object.entries(v).every(([id, f]) => asList(f).every(x => rel(id).f[x] == null)); break;
      case 'pub': ok = asList(v).every(f => SOC.pub[f] != null); break;
      case 'npub': ok = asList(v).every(f => SOC.pub[f] == null); break;
      case 'pk': ok = asList(v).every(f => SOC.pk[f] != null); break;
      case 'npk': ok = asList(v).every(f => SOC.pk[f] == null); break;
      case 'arc': ok = Object.entries(v).every(([a, st]) => SOC.arc[a] && asList(st).includes(SOC.arc[a].s)); break;
      case 'narc': ok = asList(v).every(a => !SOC.arc[a]); break;
      case 'arcAge': ok = Object.entries(v).every(([a, n]) => SOC.arc[a] && ctx.day - SOC.arc[a].d >= n); break;
      case 'done': ok = asList(v).every(t => socDoneAny(t, ctx)); break;
      case 'ndone': ok = asList(v).every(t => !socDoneAny(t, ctx)); break;
      case 'doneAge': ok = Object.entries(v).every(([t, n]) => { const d = SOC.done[t] ?? SOC.done[t + '#' + ctx.cyc]; return d != null && ctx.day - d >= n; }); break;
      case 'chose': ok = Object.entries(v).every(([t, c]) => asList(c).includes(me.ch[t])); break;
      case 'choseOf': ok = Object.entries(v).every(([id, m]) => Object.entries(m).every(([t, c]) => asList(c).includes(rel(id).ch[t]))); break;
      case 'st': ok = asList(v).includes(SOCP.status); break;
      case 'career': ok = ctx.career === v; break;
      case 'careers': ok = socRange(v, P.stats.careers || 0); break;
      case 'cyc': ok = socRange(v, ctx.cyc); break;
      case 'perf': ok = !!SOC.perf.length && socRelOk(SOC.perf[SOC.perf.length - 1], v); break;
      case 'any': ok = v.some(c => socCond(c, npc, ctx)); break;
      case 'fn': ok = !!v(ctx, me); break;
    }
    if (!ok) return false;
  }
  return true;
}

/* ---------- efeitos: a mesma resposta pesa diferente para cada personalidade ---------- */
// Tom da escolha × gostos do personagem = variação de afinidade. A confiança tem teto pela familiaridade (gente
// reservada abre devagar). Provocar um competitivo aumenta a rivalidade sem necessariamente estragar a amizade.
function socTrustCap(id) { const r = socRel(id); return 1 + r.fam * (CAST[id].open || 1); }
function socFx(npc, fx, tone, ctx = socCtx()) {
  const r = socRel(npc), d = CAST[npc] || { likes: {} };
  let v = (tone ? d.likes[tone] || 0 : 0) + ((fx && fx.aff) || 0);
  r.aff = clampN(r.aff + v, -10, 10);
  if (tone === 'tease' && d.rival) r.riv = clampN(r.riv + 1, 0, 10);
  if (fx) {
    if (fx.riv) r.riv = clampN(r.riv + fx.riv, 0, 10);
    if (fx.fam) r.fam = clampN(r.fam + fx.fam, 0, 10);
    if (fx.trust) r.trust = fx.trust > 0 ? Math.max(r.trust, Math.min(r.trust + fx.trust, socTrustCap(npc))) : clampN(r.trust + fx.trust, 0, 10);
    for (const f of asList(fx.f || [])) r.f[f] = ctx.day;
    for (const f of asList(fx.uf || [])) delete r.f[f];
    for (const f of asList(fx.pub || [])) SOC.pub[f] = SOC.pub[f] ?? ctx.day;
    for (const f of asList(fx.pk || [])) SOC.pk[f] = SOC.pk[f] ?? ctx.day;
    if (fx.arc) SOC.arc[fx.arc[0]] = { s: fx.arc[1], d: ctx.day };
    if (fx.tell) for (const [id, f] of Object.entries(fx.tell)) for (const x of asList(f)) socRel(id).f[x] = ctx.day;
    if (fx.req) socRequest(typeof fx.req === 'string' ? fx.req : fx.req.id, npc, ctx);
    if (fx.ov) SOC.ov[fx.ov.id || npc] = { s: fx.ov.s, m: fx.ov.m || null, until: ctx.day + (fx.ov.days || 0), slot: fx.ov.slot || null };
    if (fx.prom) SOC.prom[fx.prom.id] = { npc, due: ctx.day + (fx.prom.days || 1), chk: fx.prom.chk || fx.prom.id };
    if (fx.relOf) for (const [id, m] of Object.entries(fx.relOf)) { const o = socRel(id); for (const [kk, n] of Object.entries(m)) o[kk] = clampN((o[kk] || 0) + n, kk === 'aff' ? -10 : 0, 10); }
    if (fx.fn) fx.fn(ctx, r);
  }
  socDirty();
  return v;
}
// Rótulo da relação (só leitura: deriva das dimensões, nunca é um contador próprio)
function socBond(id) {
  const r = socRel(id), d = CAST[id];
  if (r.aff <= -3) return 'cold';
  if (r.riv >= 3 && r.aff >= 0) return r.aff >= 3 ? 'frenemy' : 'rival';
  if (r.trust >= 5 && r.aff >= 4) return 'confidant';
  if (r.aff >= 4) return d.scope === 'life' ? 'bestie' : 'friend';
  if (r.fam >= 3) return d.group === 'work' ? 'colleague' : 'friend';
  return 'acquaintance';
}

/* ---------- textos: referências (para trocar de idioma depois) + cópia de segurança ---------- */
function socLine(T, nodeId, i) { const n = T && T.n[nodeId]; return n && n.say ? n.say[i] : null; }
function socChoiceList(T, nodeId) { const n = T && T.n[nodeId]; return n && n.ch ? (typeof n.ch === 'function' ? n.ch() : n.ch) : []; }
function socResolve(r) {
  if (!r) return null;
  if (r.sys) { const f = U().msn.sys[r.sys]; return typeof f === 'function' ? f(...(r.a || [])) : f; }
  if (r.it) { const d = CAST[r.npc], arr = (d && (d.intents[r.it] || (SOC_INTENT_FALLBACK[r.it]))) || []; return tx(arr[r.j]); }
  const T = SOC_THREADS[r.t]; if (!T) return null;
  if (r.o) return tx(T.open);
  if (r.c != null && r.j == null) { const c = socChoiceList(T, r.n)[r.c]; return c ? tx(c.t) : null; }
  if (r.c != null) { const c = socChoiceList(T, r.n)[r.c]; return c && c.re ? socLineText(c.re[r.j], r.p) : null; }
  if (r.rk) { const n = T.n[r.n]; return n && n.react && n.react[r.rk] ? socLineText(n.react[r.rk][r.j], r.p) : null; }
  return socLineText(socLine(T, r.n, r.i), r.p);
}
function socLineText(line, p) { if (line == null) return null; if (line.pick) return tx(line.pick[p || 0]); if (line.t) return tx(line.t); return tx(line); }
function socVars(ctx = socCtx()) {
  const last = SOC.perf[SOC.perf.length - 1] || { score: 0, stress: 0 }, R = Rival.total();
  const decor = (P.decor || []).filter(id => id !== 'gato' || true).slice(0, 3).map(id => deskName(id));
  return { score: fmt(last.score || 0), stress: Math.round(last.stress || 0), rafa: fmt(socRafaScore(ctx)), w: R.w, l: R.l, dd: R.d, decor: decor.join(', ') || '—', decorN: (P.decor || []).length,
    rank: L.ranks[ctx.rank] || '', day: ctx.day, cyc: ctx.cyc + 1 };
}
// Placar do Rafa: sempre perto do seu (às vezes acima, às vezes abaixo), fixo para cada dia
function socRafaScore(ctx = socCtx()) { const last = SOC.perf[SOC.perf.length - 1]; const base = last ? last.score : 1500; return Math.max(300, Math.round(base * (0.82 + socHash('rafa', ctx.day) * 0.4) / 10) * 10); }
function socFill(s, v = {}) {
  if (s == null) return '';
  return String(s).replace(/\{(\w+)(?::(\w+))?\}/g, (m, k, a) => k === 'name' ? profileName() : k === 'n' ? castFirst(a) : v[k] != null ? v[k] : m);
}
function msgText(m) { const t = m.r ? socResolve(m.r) : null; return socFill(t != null ? t : m.s, m.v); }

/* ---------- histórico ---------- */
const SOC_LOG_MAX = 140;
function socLog(npc, m, ctx = socCtx()) {
  const r = socRel(npc);
  m.d = ctx.day; m.tm = ctx.min; m.at = ctx.clock;
  if (m.r && m.s == null) { const t = socResolve(m.r); m.s = t; }
  if (m.s && /\{/.test(m.s)) { const v = socVars(ctx), used = {}; m.s.replace(/\{(\w+)\}/g, (_, k) => { if (v[k] != null) used[k] = v[k]; }); if (Object.keys(used).length) m.v = used; }
  r.log.push(m); if (r.log.length > SOC_LOG_MAX) r.log.splice(0, r.log.length - SOC_LOG_MAX);
  if (m.f === 'n' && !(typeof Msn !== 'undefined' && Msn.reading(npc))) r.un++;
  socDirty();
  return m;
}

/* ---------- conversas: entrada em nós, fila de falas, escolhas ---------- */
const socKey = (T, ctx) => T.id + (T.perCycle ? '#' + ctx.cyc : '') + (T.daily ? '@d' + ctx.day : '') + (T.perCareer ? '@c' + Quests.cid() : '');
function socVisibleChoices(npc, T, nodeId, ctx = socCtx()) { return socChoiceList(T, nodeId).map((c, i) => ({ c, i })).filter(o => socCond(o.c.if, npc, ctx)); }
function socLinesOf(npc, T, nodeId, list, ctx, mk) {
  const out = [];
  (list || []).forEach((line, j) => {
    if (line && line.if && !socCond(line.if, npc, ctx)) return;
    const ref = mk(j);
    if (line && line.pick) { const key = T.id + '.' + nodeId + '.' + j, seen = SOC.rec[key] || [], pool = line.pick.map((_, i) => i).filter(i => !seen.includes(i)); ref.p = pick(pool.length ? pool : line.pick.map((_, i) => i)); SOC.rec[key] = [ref.p, ...seen].slice(0, Math.max(0, line.pick.length - 1)); }
    out.push(ref);
  });
  return out;
}
function socGo(go, npc, ctx) { if (!go) return null; if (typeof go === 'string') return go; for (const g of go) { if (typeof g === 'string') return g; if (socCond(g.if, npc, ctx)) return g.to; } return null; }
function socEnter(npc, th, nodeId, ctx = socCtx()) {
  const T = SOC_THREADS[th.id], n = T && T.n[nodeId];
  if (!n) return socEnd(npc, th, ctx);
  th.node = nodeId; th.phase = 'npc'; th.after = undefined;
  if (n.fx) socFx(npc, n.fx, null, ctx);
  th.q = socLinesOf(npc, T, nodeId, n.say, ctx, i => ({ t: T.id, n: nodeId, i }));
  socDirty();
}
function socEnd(npc, th, ctx = socCtx()) {
  const T = th.id && SOC_THREADS[th.id], r = socRel(npc);
  if (T && !th.mini) { r.fam = clampN(r.fam + (th.chose ? 1 : 0.5), 0, 10); if (T.end) socFx(npc, T.end, null, ctx); }
  delete SOC.th[npc]; delete SocRT.due[npc]; socDirty();
}
// Uma conversa começa: a chave é gravada antes de qualquer fala (recarregar a página retoma, nunca repete)
function socStart(T, ctx = socCtx(), opener) {
  const npc = T.npc;
  SOC.done[socKey(T, ctx)] = ctx.day;
  const th = SOC.th[npc] = { id: T.id, node: T.start, q: [], phase: 'npc' };
  if (opener) { socLog(npc, { f: 'm', r: { t: T.id, o: 1 }, s: typeof opener === 'string' ? opener : undefined }, ctx); th.chose = true; }
  socEnter(npc, th, T.start, ctx);
  SocRT.due[npc] = performance.now() + (opener ? socReplyDelay(npc, ctx) : 350);
  return th;
}
function socReplyDelay(npc, ctx) { const p = socPresence(npc, ctx); return (p.s === 'busy' ? 7000 : 1800) + Math.random() * 1400; }
function socTypeMs(npc, text) { return clampN(700 + (text || '').length * 38 / (CAST[npc].speed || 1), 900, 4200); }
// Jogador escolheu uma resposta
function socChoose(npc, idx, typed) {
  const ctx = socCtx(), th = SOC.th[npc]; if (!th || th.phase !== 'choice') return false;
  const T = SOC_THREADS[th.id], node = T.n[th.node], vis = socVisibleChoices(npc, T, th.node, ctx), o = vis[idx]; if (!o) return false;
  socLog(npc, typed ? { f: 'm', s: typed } : { f: 'm', r: { t: T.id, n: th.node, c: o.i } }, ctx);
  const v = socFx(npc, o.c.fx, o.c.tone, ctx);
  socRel(npc).ch[T.id] = o.c.k || String(o.i);
  th.chose = true; th.lastV = v;
  let re = [];
  if (o.c.re) re = socLinesOf(npc, T, th.node, o.c.re, ctx, j => ({ t: T.id, n: th.node, c: o.i, j }));
  else if (node.react) { const rk = v > 0 ? 'good' : v < 0 ? 'bad' : 'meh', list = node.react[rk] || node.react.meh || []; re = socLinesOf(npc, T, th.node, list, ctx, j => ({ t: T.id, n: th.node, rk, j })); }
  th.q = re; th.phase = 'npc'; th.after = socGo(o.c.go, npc, ctx) || null;
  SocRT.due[npc] = performance.now() + socReplyDelay(npc, ctx);
  socDirty(); return true;
}
// Assuntos que o jogador pode puxar com aquele contato agora
// contato com diálogo inicial (ex.: o oi para o Duda): nada de assuntos sugeridos nem chamadas antes dele acontecer
function socFirstPending(npc) { const fm = CAST[npc] && CAST[npc].firstMsg; return !!fm && !Object.keys(SOC.done).some(k => k.split(/[#@]/)[0] === fm); }
function socTopics(npc, ctx = socCtx()) {
  if (socFirstPending(npc)) return [];
  return Object.values(SOC_THREADS).filter(T => T.by === 'player' && T.npc === npc && socCond(T.when, npc, ctx)
    && (T.repeat ? (SOC.done[socKey(T, ctx)] == null || ctx.day - SOC.done[socKey(T, ctx)] >= T.repeat) : SOC.done[socKey(T, ctx)] == null));
}
function socTopic(npc, id, typed) {
  const ctx = socCtx(), T = SOC_THREADS[id]; if (!T || SOC.th[npc] || socFirstPending(npc)) return false;
  socStart(T, ctx, typed || true); return true;
}

/* ---------- texto livre: intenções reconhecidas localmente (sem IA externa) ---------- */
// Prioridade: 1) resposta parecida com uma das opções da conversa em curso; 2) assunto disponível com palavra-chave;
// 3) intenção simples (cumprimento, agradecimento, piada…), respondida no estilo de cada personagem.
const SOC_INTENTS = [
  ['game', /\b(jog(ar|o|uinho)|partida|play|game|match|jugar|juego|arcade)\b/], ['sorry', /(desculp|foi mal|perdao|sorry|my bad|perdon|lo siento)/],
  ['thanks', /(obrigad|valeu|vlw|brigad|thank|thx|gracias)/], ['bye', /(tchau|falou|flw|ate (mais|logo|amanha)|\bbye\b|see (you|ya)|adios|hasta (luego|manana))/],
  ['how', /(tudo (bem|bom|certo)|td bem|como (vai|voce|vc|ta|esta|estas|anda)|how are|how's it|what's up|\bsup\b|que tal|todo bien)/],
  ['hi', /^(oi+|ola|opa|e ai|eai|eae|bom dia|boa (tarde|noite)|hey|hi|hello|hola|buen(o|a)s)\b/], ['joke', /(k{3,}|haha|hehe|\brs+\b|\blol\b|lmao|jaja|jeje|piada|joke|chiste)/],
  ['coffee', /(\bcafe|coffee)/], ['work', /(trabalh|servico|chefe|reuniao|planilha|\bwork|\bjob\b|\bboss\b|meeting|trabaj|jefe|reunion)/],
];
const SOC_INTENT_FALLBACK = {};
function socIntentOf(text) { const t = socNorm(text).trim(); for (const [k, re] of SOC_INTENTS) if (re.test(t)) return k; return 'unknown'; }
const socWords = s => socNorm(s).split(/[^a-z0-9]+/).filter(w => w.length >= 3);
function socMatch(text, list) {
  const words = new Set(socWords(text)); let best = -1, score = 0, tie = false;
  list.forEach((o, i) => { const kw = [...(o.kw || []), ...socWords(tx(o.t))]; const sc = kw.filter(w => words.has(socNorm(w))).length;
    if (sc > score) { score = sc; best = i; tie = false; } else if (sc && sc === score) tie = true; });
  return score >= 1 && !tie ? best : -1;
}
// devolve: 'choice' | 'topic' | 'intent' | 'hint'
function socSay(npc, text) {
  text = String(text || '').trim().slice(0, 140); if (!text) return null;
  const ctx = socCtx(), th = SOC.th[npc];
  if (th && th.phase === 'choice') {
    const T = SOC_THREADS[th.id], vis = socVisibleChoices(npc, T, th.node, ctx), i = socMatch(text, vis.map(o => o.c));
    if (i >= 0) { socChoose(npc, i, text); return 'choice'; }
    return 'hint';
  }
  // primeira mensagem do jogador para esse contato: alguns respondem com uma conversa própria (ex.: o oi para o Duda)
  const r0 = socRel(npc), first = r0.f.saidHi == null; if (first) { r0.f.saidHi = ctx.day; socDirty(); }
  const fm = CAST[npc].firstMsg && SOC_THREADS[CAST[npc].firstMsg];
  if (first && fm && !th && SOC.done[socKey(fm, ctx)] == null) { socStart(fm, ctx, text); return 'topic'; }
  if (!th) { const tops = socTopics(npc, ctx), i = socMatch(text, tops.map(T => ({ t: T.topic, kw: T.kw }))); if (i >= 0) { socTopic(npc, tops[i].id, text); return 'topic'; } }
  socLog(npc, { f: 'm', s: text }, ctx);
  socIntent(npc, socIntentOf(text), ctx);
  return 'intent';
}
function socIntent(npc, it, ctx = socCtx(), opts = {}) {
  const d = CAST[npc], r = socRel(npc), key = d.intents[it] ? it : 'unknown', list = d.intents[key] || [];
  if (!list.length) return;
  const seen = SOC.rec['it.' + npc + '.' + key] || [], pool = list.map((_, i) => i).filter(i => !seen.includes(i)), j = pick(pool.length ? pool : list.map((_, i) => i));
  SOC.rec['it.' + npc + '.' + key] = [j, ...seen].slice(0, Math.max(0, list.length - 1));
  // conversa fiada aproxima um pouco, uma vez por dia por assunto (não dá para "farmar" amizade)
  const dk = ctx.day + ':' + key;
  if (!r.chat[dk] && !opts.silent) { r.chat[dk] = 1; r.fam = clampN(r.fam + 0.2, 0, 10);
    if (key === 'joke') socFx(npc, null, 'joke', ctx); if (key === 'sorry' && r.f.hurt != null) socFx(npc, { aff: 1, uf: 'hurt' }, null, ctx); if (key === 'nudge') socFx(npc, null, 'nudge', ctx); }
  for (const k of Object.keys(r.chat)) if (+k.split(':')[0] < ctx.day - 1) delete r.chat[k];
  const ref = { it: key, npc, j };
  const th = SOC.th[npc];
  if (th) th.q.push(ref); else { SOC.th[npc] = { id: null, mini: true, q: [ref], phase: 'npc' }; SocRT.due[npc] = performance.now() + (opts.delay ?? socReplyDelay(npc, ctx)); }
  socDirty();
}
function socNudge(npc) {
  const ctx = socCtx(), r = socRel(npc), now = performance.now();
  if (now - (SocRT.nudgeAt || 0) < 8000) return false;   // cutucar de novo depois de alguns segundos
  SocRT.nudgeAt = now; socLog(npc, { f: 's', r: { sys: 'nudgeOut', a: [castFirst(npc)] } }, ctx);
  socIntent(npc, 'nudge', ctx); return true;
}

/* ---------- solicitações de contato ---------- */
function socRequest(id, by, ctx = socCtx()) {
  const r = socRel(id); if (r.st === 'known' || r.st === 'req') return;
  r.st = 'req'; r.reqDay = ctx.day; r.reqBy = by || null; socDirty();
  if (typeof Msn !== 'undefined') Msn.notifyReq(id);
}
function socAccept(id) {
  const ctx = socCtx(), r = socRel(id); if (r.st !== 'req') return;
  r.st = 'known'; r.since = ctx.day; socLog(id, { f: 's', r: { sys: 'added', a: [CAST[id].name] } }, ctx); socDirty();
}
function socDecline(id) {
  const ctx = socCtx(), r = socRel(id); if (r.st !== 'req') return;
  r.st = 'none'; r.retry = ctx.day + 3; r.f.declined = ctx.day; r.aff = clampN(r.aff - 1, -10, 10); socDirty();
}
function socUnlocks(ctx) {
  for (const id of CAST_ORDER) { const d = CAST[id], r = socRel(id);
    if (r.st !== 'none' || !d.unlock || (r.retry && ctx.day < r.retry)) continue;
    if (d.scope === 'work' && !ctx.career) continue;
    if (socCond(d.unlock.when, id, ctx)) socRequest(id, d.unlock.by, ctx); }
}

/* ---------- bloqueios: quando nada pode aparecer, ou só pode chegar em silêncio ---------- */
// 'hard': chefe, vírus, travamento, videochamada, chamada, cenas de abertura, promoção, fim de carreira → espera.
// 'quiet': pausa (planilha), cenas da noite, Não perturbe → mensagens chegam como não lidas, sem aviso nem som.
function socBlock(ctx) {
  if ($('titlescr') || Call.el) return 'hard';
  if (S && S.phase !== 'over') {
    if (S.boss || S.bossAlert || S.bossAuto > 0 || S.virus || S.frozen || S.video || POPUPS.length) return 'hard';
    if (['intro', 'promo'].includes(S.phase)) return 'hard';
    if (S.phase === 'ending') return 'quiet';
    if (S.phase === 'day' && S.paused && !S.resting) return 'quiet';
  }
  if (S && S.phase === 'over') return 'hard';
  if ($('scene')) return 'hard';
  if (document.body.classList.contains('desk-edit')) return 'quiet';
  return SOCP.status === 'dnd' ? 'quiet' : null;
}

/* ---------- agenda: escolhe a próxima conversa espontânea ---------- */
function socSchedule(ctx, now, block) {
  if (now - SocRT.lastEval < 1000) return; SocRT.lastEval = now;
  socPromises(ctx, false);
  const period = ctx.day + ':' + (ctx.slot === 'off' ? 'off' : 'work'), used = SOC.daily[period] || 0;
  const gap = (ctx.slot === 'off' ? 9000 : ctx.working ? 38000 : 11000) * (SOCP.status === 'busy' ? 1.6 : 1);
  if (now - SocRT.lastStart < gap || now - SocRT.enterMenu < 3500) return;
  if (ctx.working && (S.dayT || 0) < 10) return;
  let best = null;
  for (const T of Object.values(SOC_THREADS)) {
    if (T.by !== 'npc') continue;
    const r = SOC.c[T.npc]; if (!r || r.st !== 'known' || SOC.th[T.npc]) continue;
    if (SOC.done[socKey(T, ctx)] != null) continue;
    if ((T.career ?? true) !== ctx.career) continue;
    if (ctx.working && !T.work) continue;
    if (SOCP.status === 'invisible' && T.prio < 90 && !T.invis) continue;
    if (used >= 3 && T.prio < 90) continue;
    if (block === 'quiet' && ctx.slot !== 'off' && !T.work) continue;
    if (!socAvail(socPresence(T.npc, ctx)) && !T.anyStatus) continue;
    if (!socCond(T.when, T.npc, ctx)) continue;
    if (!best || T.prio > best.prio) best = T;
  }
  if (!best) return socPsmComment(ctx, now, used);
  SOC.daily[period] = used + 1; SocRT.lastStart = now;
  for (const k of Object.keys(SOC.daily)) if (+k.split(':')[0] < ctx.day - 2) delete SOC.daily[k];
  socStart(best, ctx);
}
// Mensagem pessoal do jogador: quem tem mais intimidade e está por perto comenta (uma vez por mensagem nova)
function socPsmComment(ctx, now, used) {
  if (!SOCP.msg || SOCP.msgSeen === SOCP.msg || used >= 3 || ctx.working) return;
  const who = CAST_ORDER.filter(id => SOC.c[id] && SOC.c[id].st === 'known' && !SOC.th[id] && socAvail(socPresence(id, ctx)) && CAST[id].intents.psm)
    .sort((a, b) => SOC.c[b].fam + SOC.c[b].aff - SOC.c[a].fam - SOC.c[a].aff)[0];
  SOCP.msgSeen = SOCP.msg; socpSave();
  if (!who) return;
  const t = socNorm(SOCP.msg), cls = /(cansad|sono|exaust|tired|sleep|exhaust|cansad|sueno|agotad)/.test(t) ? 'psmTired' : /(cafe|coffee)/.test(t) ? 'psmCoffee'
    : /(sexta|friday|viernes|fds|weekend|finde)/.test(t) ? 'psmFriday' : /(feliz|happy|alegr|:\)|:d|\bfeliz)/.test(t) ? 'psmHappy' : 'psm';
  SocRT.lastStart = now; SOC.daily[ctx.day + ':' + (ctx.slot === 'off' ? 'off' : 'work')] = used + 1;
  socIntent(who, CAST[who].intents[cls] ? cls : 'psm', ctx, { silent: true, delay: 600 });
}

/* ---------- entrega linha a linha ---------- */
function socStream(ctx, now, block) {
  for (const [npc, th] of Object.entries(SOC.th)) {
    if (th.phase !== 'npc') continue;
    if (SocRT.due[npc] == null) SocRT.due[npc] = now + 1500;
    if (block === 'hard') { SocRT.due[npc] = Math.max(SocRT.due[npc], now + 600); continue; }
    if (!socAvail(socPresence(npc, ctx)) && !(th.id && SOC_THREADS[th.id].anyStatus)) { SocRT.due[npc] = Math.max(SocRT.due[npc], now + 1000); continue; }
    if (now < SocRT.due[npc]) continue;
    if (th.q.length) {
      const ref = th.q.shift(), m = socLog(npc, { f: 'n', r: ref }, ctx);
      socNotify(npc, msgText(m), block, ctx);
      const nx = th.q[0]; SocRT.due[npc] = now + (nx ? socTypeMs(npc, socResolve(nx)) : 300);
      continue;
    }
    if (th.mini) { socEnd(npc, th, ctx); continue; }
    if (th.after !== undefined) { const a = th.after; th.after = undefined; if (a) { socEnter(npc, th, a, ctx); SocRT.due[npc] = now + socTypeMs(npc, socResolve(th.q[0])); } else socEnd(npc, th, ctx); continue; }
    const T = SOC_THREADS[th.id], node = T && T.n[th.node];
    if (!node) { socEnd(npc, th, ctx); continue; }
    if (node.ch && socVisibleChoices(npc, T, th.node, ctx).length) { th.phase = 'choice'; th.at = ctx.day; socDirty(); continue; }
    const g = socGo(node.go, npc, ctx);
    if (g) { socEnter(npc, th, g, ctx); SocRT.due[npc] = now + socTypeMs(npc, socResolve(th.q[0])); } else socEnd(npc, th, ctx);
  }
}
// Quem não responde a tempo: a conversa se encerra e o personagem pode lembrar disso (T.ignore)
function socExpire(ctx) {
  for (const [npc, th] of Object.entries(SOC.th)) {
    if (th.phase !== 'choice' || th.at == null) continue;
    const T = SOC_THREADS[th.id]; if (!T || ctx.day - th.at <= T.ttl) continue;
    if (T.ignore) socFx(npc, T.ignore, null, ctx);
    socRel(npc).f['ignored:' + T.id] = ctx.day;
    delete SOC.th[npc]; socDirty();
  }
}
// Promessas: cumpridas assim que a condição vale; quebradas quando o prazo passa
function socPromises(ctx, dayChanged) {
  for (const [id, p] of Object.entries(SOC.prom)) {
    const chk = SOC_PROMISE[p.chk];
    if (chk && chk(ctx)) { socFx(p.npc, { aff: 1, trust: 1, f: 'kept:' + id }, null, ctx); delete SOC.prom[id]; }
    else if (dayChanged && ctx.day > p.due) { socFx(p.npc, { aff: -1, trust: -2, f: ['broke:' + id, 'hurt'] }, null, ctx); delete SOC.prom[id]; }
  }
}
function socNewDay(ctx) { if (ctx.career) socPromises(ctx, true); SOC.day = ctx.day; socDirty(); }
// Aviso discreto de quem ficou online (só amigos próximos, fora do trabalho corrido)
function socPresenceWatch(ctx, block) {
  for (const id of CAST_ORDER) {
    const r = SOC.c[id]; if (!r || r.st !== 'known') continue;
    const s = socPresence(id, ctx).s, was = SocRT.pres[id]; SocRT.pres[id] = s;
    if (was && was !== s && typeof Msn !== 'undefined') Msn.presenceChanged(id, was, s, block, ctx);
  }
}
function socNotify(npc, text, block, ctx) { if (typeof Msn !== 'undefined') Msn.incoming(npc, text, block, ctx); }

/* ---------- relógio da agenda ---------- */
function socTick() {
  try {
    socSync();
    const ctx = socCtx(), now = performance.now(), block = socBlock(ctx);
    if (ctx.day !== SOC.day) socNewDay(ctx);
    socPresenceWatch(ctx, block);
    if (block !== 'hard') { socUnlocks(ctx); socSchedule(ctx, now, block); }
    socStream(ctx, now, block);
    socExpire(ctx);
    if (SOC._dirty && now - SocRT.savedAt > 900) socFlush();
  } catch (e) { if (!socTick.err) { socTick.err = true; console.error('MSworkN:', e); } }
}
setInterval(socTick, 250);

/* ---------- ganchos nos acontecimentos do jogo ---------- */
// fim do dia: desempenho recente (pontos, estresse) vira memória curta que os personagens comentam
{ const ed0 = endDay; endDay = () => { const d = S && S.day, sc = S ? S.dayScore || 0 : 0, st = S ? S.stress || 0 : 0; ed0();
  if (!d) return; socSync(); SOC.perf = [...SOC.perf.filter(p => p.d !== d), { d, score: sc, stress: st, rank: S ? S.rankIdx : 0 }].slice(-5); socDirty(); }; }
// promoção: fato público da empresa (todo mundo fica sabendo; cada um reage do seu jeito)
{ const pr0 = promote; promote = () => { pr0(); if (!S) return; socSync(); SOC.pub['promo' + S.rankIdx] = S.day; SOC.pub.promo = S.day; socDirty(); }; }
// fim de carreira: quem é de fora fica sabendo (pedido de demissão, esgotamento ou vitória)
{ const go0 = gameOver; gameOver = (reason = 'burnout') => { if (S) { socSync(); for (const id of CAST_ORDER) if (CAST[id].scope === 'life' && SOC.c[id]) SOC.c[id].f['left:' + reason] = S.day; SOC.pub.left = S.day; socFlush(); } go0(reason); }; }
// voltar ao menu: dá um respiro antes da primeira mensagem
{ const sm0 = showMenu; showMenu = () => { sm0(); SocRT.enterMenu = performance.now(); }; }

// papel e grupo podem mudar com a história (ex.: quem sai da empresa vai para "Outros contatos")
const socRole = id => tx((SOC.c[id] && SOC.c[id].role) || CAST[id].role);
const socGroup = id => (SOC.c[id] && SOC.c[id].group) || CAST[id].group;
