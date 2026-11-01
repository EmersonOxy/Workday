/* ================= MSworkN: chamadas de vídeo com qualquer contato ================= */
// Reaproveita a chamada do Duda (31-chamada.js) sem mexer nela: mesmo visual (.vcall), mesmos balões (callSay),
// mesmo encerramento (closeCall com modo próprio, que nunca pausa nem retoma o expediente) e os mesmos minigames.
// Só acontece fora do expediente (menu) ou no Intervalo Livre: as chamadas automáticas do trabalho continuam só do Duda.
// Diferença entre foto de perfil (qualquer coisa) e câmera (busto animado do personagem): câmera desligada mostra a foto.

// Rosto animado do busto: piscar, boca falando, expressões, cabeça que se move 1 px, gestos de mão
function npcFace(host, d, extraPal) {
  const sp = d.bust, pal = Object.assign(bustPal(sp), extraPal || {});
  const base = BUST_MOODS[d.mood || 'neutral'];
  const st = { eyes: base[0], brows: base[1], mouth: base[2], talking: false, blink: false, dx: 0, gest: null, gestT: 0, blush: false };
  const size = () => { const stg = host.closest('.vc-stage'); return Math.max(3, Math.min(12, Math.floor((stg ? stg.clientHeight : 220) * .62 / BUST_H))); };
  let last = '', blinkAt = performance.now() + 2200, swayAt = performance.now() + 3000, swayEnd = 0;
  const draw = () => {
    const talkF = st.talking && (performance.now() / 130 | 0) % 2;
    const key = [st.eyes, st.brows, st.mouth, talkF, st.blink, st.dx, st.gest, st.blush, size()].join();
    if (key === last) return; last = key;
    host.replaceChildren(Pixel.el(bustRows(sp, { eyes: st.blink ? 'blink' : st.eyes, brows: st.brows, mouth: talkF ? 'talk' : st.mouth, dx: st.dx, gest: st.gest, blush: st.blush }), size(), pal));
  };
  const loop = () => {
    if (!host.isConnected) return;
    const now = performance.now();
    if (now > blinkAt) { st.blink = !st.blink; blinkAt = now + (st.blink ? 120 : 2200 + Math.random() * 2200); }
    if (!Motion.reduced.matches) {
      if (!st.dx && now > swayAt) { st.dx = Math.random() < .5 ? -1 : 1; swayEnd = now + 600 + Math.random() * 600; }
      if (st.dx && now > swayEnd) { st.dx = 0; swayAt = now + 2500 + Math.random() * 3500; }
    }
    if (st.gest && now > st.gestT) st.gest = null;
    draw(); requestAnimationFrame(loop);
  };
  draw(); requestAnimationFrame(loop);
  const api = {
    set(m, e) { const mm = { shut: 'shut', talk: 'shut', smile: 'smile', wow: 'wow' }[m] || 'shut'; st.mouth = mm; st.eyes = e === 'happy' ? 'happy' : 'open'; },
    mood(name) { const b = BUST_MOODS[name] || base; [st.eyes, st.brows, st.mouth] = b; st.blush = name === 'shy'; },
    talk(on) { st.talking = on; },
    gesture(g, ms = 1700) { if (!g || !BUST_GEST[g]) return; st.gest = g; st.gestT = performance.now() + ms; },
  };
  return api;
}
// Câmera desligada: a foto de perfil grande, com a borda acendendo enquanto a pessoa fala
function picFace(host, id) {
  const u = U().msn, w = document.createElement('div'); w.className = 'vc-nocam';
  const stg = host.closest('.vc-stage'), sc = Math.max(3, Math.min(10, Math.floor((stg ? stg.clientHeight : 220) * .38 / 16)));
  w.append(msnPicEl(id, sc)); w.insertAdjacentHTML('beforeend', `<small>${u.camOff}</small>`); host.replaceChildren(w);
  return { set() {}, mood() {}, gesture() {}, talk(on) { w.classList.toggle('spk', on); } };
}
// Duda já tem rosto próprio (dudaFace): só traduz as expressões do motor para as dele
function dudaFaceSoc(host) {
  const f = dudaFace(host), map = { smile: ['smile', 'open'], happy: ['smile', 'happy'], wow: ['wow', 'open'], smug: ['smile', 'open'], shy: ['smile', 'happy'] };
  return { set: f.set, talk: f.talk, gesture() {}, mood(n) { const m = map[n] || ['shut', 'open']; f.set(m[0], m[1]); } };
}
function socCamOn(id, ctx = socCtx()) { const d = CAST[id], r = socRel(id); return typeof d.cam === 'function' ? !!d.cam(r, ctx) : d.cam === 'on'; }

// Pode ligar agora?
function socCallCheck(id, ctx = socCtx()) {
  const u = U().msn;
  if (Call.el) return { ok: false, why: '' };
  if (S && S.phase !== 'over' && !S.onBreak) return { ok: false, why: u.callWork };
  const p = socPresence(id, ctx);
  if (socFirstPending(id)) return { ok: false, why: u.callFirst(castFirst(id)) };
  if (p.s === 'offline' || p.s === 'away') return { ok: false, why: u.callOff(castFirst(id)) };
  return { ok: true, busy: p.s === 'busy' };
}
// Roteiro especial disponível (por:'call'), senão a conversa curta do cadastro (cumprimento, uma pergunta, despedida)
function socCallThread(id, ctx = socCtx(), ring) {
  return Object.values(SOC_THREADS).find(T => T.by === 'call' && T.npc === id && (!ring || T.ring) && SOC.done[socKey(T, ctx)] == null && socCond(T.when, id, ctx)) || null;
}

function socCall(id, { incoming = false, thread = null } = {}) {
  const ctx = socCtx(), d = CAST[id], u = U().msn, c = L.call, uu = U();
  if (!d) return;
  if (!incoming) { const chk = socCallCheck(id, ctx); if (!chk.ok) { if (chk.why) { Msn.hint = chk.why; Msn.render(); sfx('click'); } return; } }
  const T = thread ? SOC_THREADS[thread] : socCallThread(id, ctx), cam = socCamOn(id, ctx), busy = !incoming && socPresence(id, ctx).s === 'busy';
  if (T) SOC.done[socKey(T, ctx)] = ctx.day;   // gravado antes: recarregar não repete
  Call.mode = 'social';
  const el = document.createElement('div'); el.className = 'vcall soc';
  el.innerHTML = `<div class="vc-win"><div class="vc-title"><span>${incoming ? c.incoming : u.calling} · ${esc(d.name)}</span><b class="rec">● REC</b><button class="vc-x" aria-label="${uu.mgQuit}" title="${uu.mgQuit}">✕</button></div>
    <div class="vc-stage"><div class="vc-cam${cam ? '' : ' nocam'}"><span class="vc-face"></span><span class="vc-tag">${esc(castFirst(id))}</span></div><div class="vc-bubbles"></div>
      <div class="vc-self"><span class="vc-me"></span><span class="vc-tag">${c.you}</span></div>
      <div class="vc-ring"><div class="vc-pulse"><span class="vc-rpic"></span></div><strong>${esc(d.name)}</strong><small>${incoming ? c.ringIn : u.calling}</small>
        <div class="vc-ringbtns">${incoming ? `<button class="vc-call accept" aria-label="${c.answer}"><i></i><span>${c.answer}</span></button>` : ''}<button class="vc-call decline" aria-label="${c.decline}"><i></i><span>${incoming ? c.decline : c.hangup}</span></button></div></div></div>
    <div class="vc-opts"></div>
    <div class="vc-ctrl"><button class="vc-tg" data-t="mic" title="${c.mic}" aria-label="${c.mic}"></button><button class="vc-tg" data-t="cam" title="${c.cam}" aria-label="${c.cam}"></button><button class="vc-call decline hang" title="${c.hangup}" aria-label="${c.hangup}"><i></i></button></div></div>`;
  uiRoot().append(el); Call.el = el;
  el.querySelector('.vc-rpic').append(msnPicEl(id, 4));
  el.querySelectorAll('.vc-call i').forEach(i => i.append(Pixel.el(i.closest('.accept') ? CALL_ICO.pick : CALL_ICO.hang, 3)));
  el.querySelectorAll('.vc-tg').forEach(b => { b.append(Pixel.el(CALL_ICO[b.dataset.t], 2)); b.onclick = () => { b.classList.toggle('off'); sfx('click'); if (b.dataset.t === 'cam') el.querySelector('.vc-self').classList.toggle('off', b.classList.contains('off')); }; });
  el.querySelector('.vc-me').append(portrait(document.body.classList.contains('mobile') ? 56 : 84));
  let ended = false, kind = 'done';
  const exit = () => { ended = true; socLog(id, { f: 's', r: { sys: 'callLog', a: [kind, d.name] } }); if (Msn.visible()) Msn.render(); };
  const hangup = () => { const h = el.querySelector('.mg-host'); if (h && h._quit) h._quit(); else if (Call.el === el) { sfx('click'); closeCall('social', exit); } };
  el.querySelector('.vc-ctrl .hang').onclick = hangup; el.querySelector('.vc-x').onclick = hangup;
  el.addEventListener('pointerdown', e => { if (Call.el && Call.skip && !e.target.closest('button, .mg-host')) Call.skip(); });
  Call.key = e => { if (Call.el && !Call.el.classList.contains('playing') && (e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); e.stopPropagation(); if (Call.skip) Call.skip(); } };
  addEventListener('keydown', Call.key, true);
  Motion.play(el.querySelector('.vc-win'), [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: Motion.E.out });
  const host = el.querySelector('.vc-face');
  const say = (face, text, mood, gest, opts) => { if (mood) face.mood(mood); if (gest) face.gesture(gest); return callSay(socFill(text, socVars(ctx)), opts, face); };

  (async () => {
    // toque: recebida (aceitar/recusar, perde em 15 s) ou feita (a pessoa atende, ou recusa se estiver ocupada)
    let ringing = true; const ring = () => { if (!ringing || !Call.el) return; sfx('ring'); Motion.shake(el.querySelector('.vc-pulse'), 3); callLater(ring, 1100); }; ring();
    const ans = await new Promise(res => {
      el.querySelector('.vc-ring .decline').onclick = () => { sfx('click'); res(false); };
      const acc = el.querySelector('.vc-ring .accept');
      if (acc) { acc.onclick = () => res(true); callLater(() => res('missed'), 15000); }
      else callLater(() => res(busy ? 'busy' : true), 1800);
    });
    ringing = false;
    if (ans !== true) {
      kind = ans === 'missed' ? 'missed' : incoming ? 'declined' : 'missed';
      if (incoming) socFx(id, { f: ans === 'missed' ? 'missedCall' : 'declinedCall' }, null, ctx);
      if (ans === 'busy') { Msn.hint = u.callBusy(castFirst(id)); }
      closeCall('social', exit); return;
    }
    sfx('join'); el.querySelector('.vc-title span').textContent = d.name; el.classList.add('live');
    const face = d.dudaFace ? dudaFaceSoc(host) : cam && d.bust ? npcFace(host, d, id === 'otavio' && SOC.arc.otavio && SOC.arc.otavio.s === 'padaria' ? d.bust.apron : null) : picFace(host, id);
    face.mood(d.mood || 'smile');
    const r = socRel(id), dk = 'call:' + ctx.day;
    if (!r.chat[dk]) { r.chat[dk] = 1; r.fam = clampN(r.fam + 0.5, 0, 10); socDirty(); }
    if (T) await runCallThread(T, id, face, say, ctx);
    else {
      const cl = d.call || {};
      if (cl.greet) await say(face, tx(pickNew(cl.greet, 'soc-' + id + 'g', true)), 'smile', 'wave');
      if (cl.talk && cl.talk.length) {
        const t = cl.talk[0], q = tx(t[0]);
        face.mood('think');
        const pickI = await callSay(q, [[tx(t[1]), 3], [tx(t[2]), 4]], face);
        socFx(id, null, pickI === 3 ? 'kind' : 'honest', ctx);
        await say(face, tx(t[pickI]), pickI === 3 ? 'happy' : 'smile', pickI === 3 ? 'thumb' : null);
      }
    }
    // Duda: convite para jogar (mesmos minigames e o modo contra ele; resultado entra no placar de sempre)
    if (d.dudaFace) {
      const picks = [[uu.mgRhythm, 'rhythm', 'game'], [uu.mgShooter, 'shooter', 'game'], [uu.mgSurprise, '?', 'game alt'], [c.no, false, 'no']]; picks.inline = true;
      face.mood('happy');
      const g = await callSay(pickNew(c.inviteAny, 'inv'), picks, face);
      if (g) {
        const kindG = g === '?' ? pick(MINIGAMES) : g, opts = {};
        if (kindG === 'rhythm') opts.song = Math.random() * RHY.SONGS.length | 0;
        const mood = Rival.mood(kindG), Tt = Rival.total(), rec = Tt.w + Tt.l + Tt.d ? ' ' + c.vsRecord(Tt.w, Tt.l, Tt.d) : '';
        const m = [[uu.vsSolo, 'solo', 'game'], [uu.vsDuda, 'vs', 'game alt']]; m.inline = true;
        opts.vs = (await callSay(pickNew(c['vsAsk_' + mood], 'ask' + mood) + rec, m, face)) === 'vs';
        if (opts.vs) await callSay(pickNew(c.vsGo, 'go'), null, face);
        const res = await new Promise(done => { const h = document.createElement('div'); h.className = 'mg-host'; el.querySelector('.vc-win').append(h); el.classList.add('playing');
          runMinigame(kindG, h, result => { h.remove(); el.classList.remove('playing'); done(result); }, opts); });
        if (!Call.el) return;
        if (!res.quit && res.vs) { const vs = res.vs, k = vs.broke ? (vs.res === 'win' ? 'vsBrokeMe' : 'vsBrokeDuda') : 'vsAfter_' + vs.res; face.mood(vs.res === 'win' ? 'wow' : 'happy'); await callSay(pickNew(c[k], k).replace('{a}', fmt(vs.me)).replace('{b}', fmt(vs.duda)), null, face); }
        else if (!res.quit && res.grade) { face.mood(res.grade === 'bad' ? 'wow' : 'happy'); await callSay(pickNew(c[res.grade], res.grade), null, face); }
      } else { face.mood('neutral'); await callSay(pick(c.declined), null, face); }
    }
    if (!Call.el) return;
    const bye = (d.call && d.call.bye) || [];
    if (bye.length) await say(face, tx(pickNew(bye, 'soc-' + id + 'b', true)), 'smile', 'wave');
    closeCall('social', exit);
  })();
}
// Roteiro de chamada no mesmo formato das conversas escritas (falas, escolhas, efeitos e reações)
async function runCallThread(T, id, face, say, ctx) {
  let nodeId = T.start || 'a';
  for (let guard = 0; nodeId && guard < 12; guard++) {
    const n = T.n[nodeId]; if (!n || !Call.el) return;
    if (n.fx) socFx(id, n.fx, null, ctx);
    const lines = (n.say || []).filter(l => !(l && l.if) || socCond(l.if, id, ctx)), vis = socVisibleChoices(id, T, nodeId, ctx);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i], last = i === lines.length - 1 && vis.length;
      const opts = last ? vis.map((o, j) => [socFill(tx(o.c.t)), j, j === 0]) : null;
      const ans = await say(face, socLineText(l, 0), l.m, l.g, opts);
      if (!Call.el) return;
      if (last) { const o = vis[ans]; const v = socFx(id, o.c.fx, o.c.tone, ctx); socRel(id).ch[T.id] = o.c.k || String(o.i);
        const re = o.c.re || (n.react && n.react[v > 0 ? 'good' : v < 0 ? 'bad' : 'meh']) || [];
        for (const rl of re) { if (rl && rl.if && !socCond(rl.if, id, ctx)) continue; await say(face, socLineText(rl, 0), rl.m || (v > 0 ? 'happy' : v < 0 ? CAST[id].badMood || 'sad' : null), rl.g); }
        nodeId = socGo(o.c.go, id, ctx); break; }
    }
    if (!vis.length) nodeId = socGo(n.go, id, ctx);
  }
}
// pickNew com memória própria por contato (mesma regra das falas do Duda: não repete as recentes)
{ const pn0 = pickNew; pickNew = (arr, key, soc) => { if (!soc) return pn0(arr, key); const seen = SOC.rec[key] || [], pool = arr.map((_, i) => i).filter(i => !seen.includes(i)), i = pick(pool.length ? pool : arr.map((_, i) => i)); SOC.rec[key] = [i, ...seen].slice(0, Math.min(3, Math.max(0, arr.length - 1))); return arr[i]; }; }

// Chamadas recebidas: só no menu (fora do expediente) ou no intervalo, quando nada mais está acontecendo
setInterval(() => {
  try {
    if (!SOC || Call.el || (S && S.phase !== 'over' && !S.onBreak) || (S && S.phase === 'over')) return;
    const ctx = socCtx(), b = socBlock(ctx); if (b || SOCP.status === 'dnd' || SOCP.status === 'invisible') return;
    const now = performance.now(); if (now - (SocRT.lastRing || 0) < 60000 || now - SocRT.enterMenu < 12000) return;
    for (const id of CAST_ORDER) { if (!SOC.c[id] || SOC.c[id].st !== 'known' || !socAvail(socPresence(id, ctx))) continue;
      const T = socCallThread(id, ctx, true); if (!T) continue;
      SocRT.lastRing = now; socCall(id, { incoming: true, thread: T.id }); return; }
  } catch (e) {}
}, 2000);
