/* ================= MSworkN: o aplicativo (janela, lista de contatos, conversa, avisos) ================= */
// Uma única janela por vez (abrir de novo restaura/foca a existente). A interface só lê o estado social e chama o motor;
// redesenha quando o estado muda (SocRT.listeners) e a cada 400 ms enquanto aberta (digitação e presença).

// Sons próprios (síntese): mensagem recebida (dois toques ascendentes), contato online, cutucada
Object.assign(SFX, {
  msnIn:    () => { tone({ type: 'triangle', f: 784, d: 0.07, v: 0.13 }); tone({ type: 'triangle', f: 1175, d: 0.12, v: 0.12, at: 0.075 }); tone({ type: 'sine', f: 2349, d: 0.08, v: 0.04, at: 0.075 }); },
  msnOn:    () => { [523, 659, 988].forEach((f, i) => tone({ type: 'sine', f, d: 0.09, v: 0.09, at: i * 0.06 })); },
  msnNudge: () => { for (let i = 0; i < 7; i++) tone({ type: 'square', f: 130 + (i % 2) * 40, d: 0.035, v: 0.09, at: i * 0.045, lp: 900 }); },
  msnReq:   () => { tone({ type: 'triangle', f: 660, d: 0.08, v: 0.12 }); tone({ type: 'triangle', f: 880, d: 0.08, v: 0.12, at: 0.09 }); tone({ type: 'triangle', f: 1320, d: 0.14, v: 0.1, at: 0.18 }); },
});

const MSN_ST = ['online', 'busy', 'away', 'dnd', 'invisible'];
const msnDot = s => `<i class="msn-dot ${s}" aria-hidden="true"></i>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const msnStatusName = s => U().msn.status[s === 'invisible' ? 'offline' : s] || s;   // contato invisível aparece offline

const Msn = {
  win: null, sel: null, info: false, stMenu: false, hint: '', lastToast: -1e9, quiet: 0, tick: 0,
  ui() { return U().msn; },
  open(npc) {
    socSync();
    if (Msn.win && Msn.win.isConnected) {
      if (Msn.win.style.display === 'none') osRestore(Msn.win); else osFocus(Msn.win);
      if (npc) Msn.select(npc); return Msn.win;
    }
    const u = Msn.ui();
    const w = osWindow(u.app, '<div class="msn"></div>', { icon: APP_ICO.msn, cls: 'msn-win', onClose: () => { Msn.win = null; clearInterval(Msn.tick); } });
    Msn.win = w; Msn.info = false; Msn.stMenu = false;
    if (npc) Msn.sel = npc;
    if (!document.body.classList.contains('mobile') && !Msn.sel) Msn.sel = CAST_ORDER.find(id => SOC.c[id] && SOC.c[id].st === 'known' && SOC.c[id].un) || null;
    Msn.mobileChat = !!npc;
    if (Msn.sel && SOC.c[Msn.sel]) { SOC.c[Msn.sel].un = 0; socDirty(); }
    Msn.render(true);
    clearInterval(Msn.tick); Msn.tick = setInterval(() => { if (!w.isConnected) return clearInterval(Msn.tick); Msn.live(); }, 400);
    return w;
  },
  visible() { return !!(Msn.win && Msn.win.isConnected && Msn.win.style.display !== 'none'); },
  reading(npc) { return Msn.visible() && Msn.sel === npc && (!document.body.classList.contains('mobile') || Msn.mobileChat) && document.visibilityState !== 'hidden'; },
  select(id) {
    Msn.sel = id; Msn.info = false; Msn.hint = ''; Msn.mobileChat = true;
    const r = SOC.c[id]; if (r) { r.un = 0; socDirty(); }
    Msn.render(true);
    const inp = Msn.win && Msn.win.querySelector('.msn-in'); if (inp && !document.body.classList.contains('touch')) inp.focus();
  },
  // ---------- desenho ----------
  render(full) {
    if (!Msn.visible() && !(Msn.win && Msn.win.isConnected)) return Msn.badges();
    const root = Msn.win.querySelector('.msn'), u = Msn.ui(), ctx = socCtx();
    const inp = root.querySelector('.msn-in'), keep = inp ? inp.value : '', hadFocus = inp && document.activeElement === inp;
    const psm = root.querySelector('.msn-psm'), psmFocus = psm && document.activeElement === psm, psmVal = psm ? psm.value : null;
    const log = root.querySelector('.msn-log'), nearEnd = !log || log.scrollHeight - log.scrollTop - log.clientHeight < 40, top0 = log ? log.scrollTop : 0;
    root.classList.toggle('chatting', !!Msn.sel && Msn.mobileChat);
    root.innerHTML = `<aside class="msn-side">${Msn.meHTML(u)}<div class="msn-list" role="list">${Msn.listHTML(u, ctx)}</div></aside><section class="msn-chat">${Msn.chatHTML(u, ctx)}</section>`;
    // fotos
    root.querySelector('.msn-mepic').append(osPicEl(56));   // mesma foto do Iniciar, em escala inteira
    root.querySelectorAll('[data-pic]').forEach(e => e.prepend(msnPicEl(e.dataset.pic, +e.dataset.sc || 2)));
    // eventos
    root.querySelector('.msn-st').onclick = e => { e.stopPropagation(); Msn.stMenu = !Msn.stMenu; Msn.render(); };
    root.querySelectorAll('[data-st]').forEach(b => b.onclick = e => { e.stopPropagation(); SOCP.status = b.dataset.st; socpSave(); Msn.stMenu = false; sfx('click'); Msn.render(); Msn.badges(); });
    const pin = root.querySelector('.msn-psm');
    if (psmVal != null) pin.value = psmVal; else pin.value = SOCP.msg || '';
    pin.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') pin.blur(); });
    pin.onchange = pin.onblur = () => { const v = pin.value.trim().slice(0, 48); if (v !== SOCP.msg) { SOCP.msg = v; SOCP.msgDay = ctx.day; socpSave(); } };
    if (psmFocus) pin.focus();
    root.querySelectorAll('.msn-c').forEach(b => b.onclick = () => { sfx('click'); Msn.select(b.dataset.id); });
    // adicionar contato pelo nome
    const ab = root.querySelector('.msn-addbtn'); if (ab) ab.onclick = () => { Msn.addOpen = true; Msn.addMsg = ''; sfx('click'); Msn.render(); const i = Msn.win.querySelector('.msn-addin'); if (i) i.focus(); };
    const af = root.querySelector('.msn-add');
    if (af) { const ai = af.querySelector('.msn-addin'); ai.value = Msn.addVal || '';
      ai.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { Msn.addOpen = false; Msn.render(); } });
      ai.oninput = () => { Msn.addVal = ai.value; };
      af.onsubmit = e => { e.preventDefault(); const res = socAddContact(ai.value); Msn.addMsg = res.msg;
        if (res.ok) { sfx('msnReq'); Msn.addOpen = false; Msn.addVal = ''; Msn.select(res.id); return; }
        sfx('click'); Motion.shake(ai, 3); Msn.render(); const i2 = Msn.win.querySelector('.msn-addin'); if (i2) i2.focus(); };
      if (Msn._addFocus !== false && document.activeElement !== ai && Msn.addOpen && !document.body.classList.contains('touch')) { const was = document.activeElement; if (!was || !was.closest || !was.closest('.msn-chat, .msn-me')) ai.focus(); } }
    root.querySelectorAll('.msn-grp').forEach(h => h.onclick = () => { SOCP.col[h.dataset.g] = !SOCP.col[h.dataset.g]; socpSave(); Msn.render(); });
    const q = s => root.querySelector(s);
    if (q('.msn-back')) q('.msn-back').onclick = () => { Msn.mobileChat = false; Msn.render(); };
    if (q('[data-act=call]')) q('[data-act=call]').onclick = () => Msn.call(Msn.sel);
    if (q('[data-act=nudge]')) q('[data-act=nudge]').onclick = () => Msn.nudge(Msn.sel);
    if (q('[data-act=info]')) q('[data-act=info]').onclick = () => { Msn.info = !Msn.info; sfx('click'); Msn.render(); };
    if (q('[data-req=ok]')) q('[data-req=ok]').onclick = () => { socAccept(Msn.sel); sfx('msnReq'); Msn.render(); };
    if (q('[data-req=no]')) q('[data-req=no]').onclick = () => { socDecline(Msn.sel); sfx('click'); Msn.sel = null; Msn.mobileChat = false; Msn.render(); };
    root.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { if (socChoose(Msn.sel, +b.dataset.ch)) { sfx('click'); Msn.hint = ''; Msn.render(); } });
    root.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { if (socTopic(Msn.sel, b.dataset.topic)) { sfx('click'); Msn.render(); } });
    const form = q('.msn-compose');
    if (form) {
      const fi = form.querySelector('.msn-in'); fi.value = keep;
      fi.addEventListener('keydown', e => e.stopPropagation());
      form.onsubmit = e => { e.preventDefault(); const t = fi.value.trim(); if (!t) return; const r = socSay(Msn.sel, t);
        if (r === 'hint') { Msn.hint = u.composeOff; Motion.shake(fi, 3); sfx('click'); Msn.render(); return; }
        fi.value = ''; Msn.hint = ''; sfx('pop'); Msn.render(); const f2 = Msn.win.querySelector('.msn-in'); if (f2) f2.focus(); };
      if (hadFocus) fi.focus();
    }
    // rolagem: segue a conversa se já estava no fim; ao trocar de contato, vai para o fim
    const lg = q('.msn-log');
    if (lg) { if (full || nearEnd) lg.scrollTop = lg.scrollHeight; else lg.scrollTop = top0;
      if (Msn._lastCount && Msn._lastSel === Msn.sel && Msn._lastCount < lg.children.length && !Motion.reduced.matches) { const nw = lg.lastElementChild; if (nw) Motion.enter(nw, nw.classList.contains('me') ? 'right' : 'left'); }
      Msn._lastCount = lg.children.length; Msn._lastSel = Msn.sel; }
    Msn.badges();
  },
  meHTML(u) {
    const st = SOCP.status;
    return `<div class="msn-me"><span class="msn-mepic"></span><div class="msn-mei"><b class="msn-mename">${esc(profileName())}</b>
      <button class="msn-st" aria-haspopup="true" aria-expanded="${Msn.stMenu}">${msnDot(st)}<span>${u.status[st]}</span> ▾</button>
      ${Msn.stMenu ? `<div class="msn-stm" role="menu">${MSN_ST.map(s => `<button role="menuitem" data-st="${s}"${s === st ? ' class="on"' : ''}>${msnDot(s)}${u.status[s]}</button>`).join('')}</div>` : ''}
      <input class="msn-psm" type="text" maxlength="48" placeholder="${u.psmPh}" aria-label="${u.psmPh}" autocomplete="off"></div></div>
      <div class="msn-addbar">${Msn.addOpen ? `<form class="msn-add" autocomplete="off"><input class="msn-addin" type="text" maxlength="40" placeholder="${u.addPh}" aria-label="${u.add}"><button class="pxbtn main" type="submit">${u.addGo}</button></form>`
        : `<button class="msn-addbtn">+ ${u.add}</button>`}${Msn.addMsg ? `<small class="msn-addmsg">${esc(Msn.addMsg)}</small>` : ''}</div>`;
  },
  listHTML(u, ctx) {
    const req = CAST_ORDER.filter(id => SOC.c[id] && SOC.c[id].st === 'req'), known = CAST_ORDER.filter(id => SOC.c[id] && SOC.c[id].st === 'known');
    if (!req.length && !known.length) return `<p class="msn-empty">${u.empty}</p>`;
    const row = id => { const p = socPresence(id, ctx), r = SOC.c[id], ps = socPsm(id, ctx), s = p.s === 'invisible' ? 'offline' : p.s;
      return `<button class="msn-c${id === Msn.sel ? ' on' : ''}${s === 'offline' ? ' off' : ''}" role="listitem" data-id="${id}"><span class="msn-cp" data-pic="${id}"></span>
        <span class="msn-cn">${msnDot(s)}<b>${esc(CAST[id].name)}</b><small>${esc(ps || (p.m ? u.pmsg[p.m] || '' : msnStatusName(s)))}</small></span>${r.un ? `<em class="msn-un">${r.un > 9 ? '9+' : r.un}</em>` : ''}</button>`; };
    let h = '';
    if (req.length) h += `<div class="msn-grp req" data-g="req">▾ ${u.groups.req} (${req.length})</div>` + req.map(id => `<button class="msn-c req${id === Msn.sel ? ' on' : ''}" data-id="${id}"><span class="msn-cp" data-pic="${id}"></span><span class="msn-cn"><b>${esc(CAST[id].name)}</b><small>${u.newReq}</small></span><em class="msn-un">!</em></button>`).join('');
    for (const g of ['work', 'friends', 'other']) {
      const ids = known.filter(id => socGroup(id) === g); if (!ids.length) continue;
      const on = ids.filter(id => { const s = socPresence(id, ctx).s; return s !== 'offline' && s !== 'invisible'; }).length, col = !!SOCP.col[g];
      h += `<div class="msn-grp" data-g="${g}" role="button" aria-expanded="${!col}">${col ? '▸' : '▾'} ${u.groups[g]} (${on}/${ids.length})</div>` + (col ? '' : ids.map(row).join(''));
    }
    return h;
  },
  chatHTML(u, ctx) {
    const id = Msn.sel, d = id && CAST[id], r = id && SOC.c[id];
    if (!d || !r || r.st === 'none') return `<div class="msn-pick"><span data-pic="unknown" data-sc="4"></span><b>${u.app}</b><small>${u.tagline}</small><p>${u.pick}</p></div>`;
    const back = `<button class="msn-back pxbtn" aria-label="${u.back}">◂ ${u.back}</button>`;
    if (r.st === 'req') {
      return `<div class="msn-ch">${back}</div><div class="msn-req"><span data-pic="${id}" data-sc="5"></span><h3>${u.reqTitle(esc(d.name))}</h3><small>${esc(socRole(id))}</small>
        <blockquote>${esc(tx(d.reqNote) || '')}</blockquote>${r.reqBy ? `<p class="msn-by">${u.reqBy(esc(CAST[r.reqBy].name))}</p>` : ''}
        <div class="actions"><button class="pxbtn main" data-req="ok">${u.accept}</button><button class="pxbtn" data-req="no">${u.decline}</button></div></div>`;
    }
    const p = socPresence(id, ctx), s = p.s === 'invisible' ? 'offline' : p.s, ps = socPsm(id, ctx);
    const head = `<div class="msn-ch">${back}<span class="msn-hp" data-pic="${id}" data-sc="3"></span><div class="msn-hn"><b>${esc(d.name)}</b><small>${esc(socRole(id))}</small>
      <span class="msn-hs">${msnDot(s)}${msnStatusName(s)}${p.m ? ' · ' + (u.pmsg[p.m] || '') : ''}${ps ? ' — <i>' + esc(ps) + '</i>' : ''}</span></div>
      <div class="msn-acts"><button class="msn-a" data-act="call" title="${u.call}" aria-label="${u.call}">${Msn.ico('cam')}</button><button class="msn-a" data-act="nudge" title="${u.nudge}" aria-label="${u.nudge}">${Msn.ico('nudge')}</button><button class="msn-a${Msn.info ? ' on' : ''}" data-act="info" title="${u.info}" aria-label="${u.info}">${Msn.ico('info')}</button></div></div>`;
    if (Msn.info) return head + Msn.infoHTML(u, id);
    return head + `<div class="msn-log" role="log" aria-live="polite">${Msn.logHTML(u, id)}</div><p class="msn-typing">${Msn.typingText(id, ctx)}</p>${Msn.replyHTML(u, id, ctx)}
      <form class="msn-compose" autocomplete="off"><input class="msn-in" type="text" maxlength="140" placeholder="${u.composePh}" aria-label="${u.composePh}"><button class="pxbtn main" type="submit">${u.send}</button></form>
      <p class="msn-hint">${esc(Msn.hint || (!socAvail(p) && !SOC.th[id] ? u.offHint : ''))}</p>`;
  },
  logHTML(u, id) {
    const r = SOC.c[id], d = CAST[id], lastDay = r.log.length ? r.log[r.log.length - 1].d : null; let h = '', lastD = null, lastF = null;
    for (const m of r.log) {
      if (m.d !== lastD) { h += `<div class="msn-day">${u.dayN(m.d === lastDay ? Math.max(m.d, Quests.today()) : m.d)}</div>`; lastD = m.d; lastF = null; }
      const t = esc(msgText(m)), tm = socClock(m) || '';
      if (m.f === 's') { h += `<div class="msn-sys">${t}</div>`; lastF = null; continue; }
      const who = m.f === 'm' ? esc(profileName()) : esc(castFirst(id)), same = lastF === m.f;
      h += `<div class="msn-m ${m.f === 'm' ? 'me' : 'np'}${same ? ' cont' : ''}">${same ? '' : `<span class="msn-mh"><b>${who}</b><time>${tm}</time></span>`}<p>${t}</p></div>`;
      lastF = m.f;
    }
    return h;
  },
  typingText(id, ctx) {
    const th = SOC.th[id]; if (!th || th.phase !== 'npc' || !socAvail(socPresence(id, ctx))) return '';
    const due = SocRT.due[id]; if (!(th.q.length || th.after) || due == null || due - performance.now() > 4500) return '';
    return Msn.ui().typing(esc(castFirst(id)));
  },
  replyHTML(u, id, ctx) {
    const th = SOC.th[id];
    if (th && th.phase === 'choice') { const T = SOC_THREADS[th.id], vis = socVisibleChoices(id, T, th.node, ctx);
      return `<div class="msn-reply">${vis.map((o, i) => `<button class="msn-opt" data-ch="${i}">${esc(socFill(tx(o.c.t)))}</button>`).join('')}</div>`; }
    if (!th) { const tops = socTopics(id, ctx); if (tops.length) return `<div class="msn-reply topics"><small>${u.topics}:</small>${tops.map(T => `<button class="msn-opt topic" data-topic="${T.id}">${esc(tx(T.topic))}</button>`).join('')}</div>`; }
    return '<div class="msn-reply"></div>';
  },
  infoHTML(u, id) {
    const d = CAST[id], r = SOC.c[id], bond = socBond(id);
    const bar = (k, v, max, min = 0) => `<div class="msn-meter"><span>${u.meters[k]}</span><i><b style="width:${Math.round((v - min) / (max - min) * 100)}%"></b></i></div>`;
    const mem = Object.entries(r.f).filter(([f]) => SOC_MEM[id + ':' + f]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([f, day]) => `<li><small>${u.dayN(day)}</small> ${esc(tx(SOC_MEM[id + ':' + f]))}</li>`).join('');
    return `<div class="msn-info"><div class="msn-ib"><span data-pic="${id}" data-sc="4"></span><div><b>${esc(d.name)}</b><small>${esc(socRole(id))}</small><em class="msn-bond ${bond}">${u.bond[bond]}</em>${r.since ? `<small>${u.since(r.since)}</small>` : ''}</div></div>
      <h4>${u.bio}</h4><p>${esc(tx(d.bio))}</p><h4>${u.likes}</h4><p>${esc(tx(d.interests))}</p>
      ${bar('aff', r.aff, 10, -10)}${bar('trust', r.trust, 10)}${bar('fam', r.fam, 10)}${r.riv > 0 ? bar('riv', r.riv, 10) : ''}
      <h4>${u.mem}</h4>${mem ? `<ul class="msn-mem">${mem}</ul>` : `<p class="msn-muted">${u.noMem}</p>`}</div>`;
  },
  ico(k) { return `<i class="msn-ico" data-ico="${k}"></i>`; },
  // atualização leve enquanto aberta: digitação, presença e novas mensagens
  live() {
    if (!Msn.visible()) return;
    const ctx = socCtx(), sig = JSON.stringify([Msn.sel, Msn.sel && SOC.c[Msn.sel] ? SOC.c[Msn.sel].log.length : 0, CAST_ORDER.map(id => SOC.c[id] ? [SOC.c[id].st, SOC.c[id].un, socPresence(id, ctx).s] : 0),
      Msn.sel && SOC.th[Msn.sel] ? SOC.th[Msn.sel].phase : '', SOCP.status, ctx.slot, ctx.day]);
    if (Msn.sel && SOC.c[Msn.sel] && SOC.c[Msn.sel].un && Msn.reading(Msn.sel)) { SOC.c[Msn.sel].un = 0; socDirty(); }
    if (sig !== Msn._sig) { Msn._sig = sig; Msn.render(); return; }
    const ty = Msn.win.querySelector('.msn-typing'); if (ty) { const t = Msn.sel ? Msn.typingText(Msn.sel, ctx) : ''; if (ty.textContent !== t) ty.textContent = t; }
  },
  // ---------- ações ----------
  nudge(id) {
    if (!id || !socNudge(id)) { sfx('click'); return; }
    sfx('msnNudge'); if (!Motion.reduced.matches) Motion.shake(Msn.win, 6); Msn.render();
  },
  call(id) { if (typeof socCall === 'function') socCall(id, {}); },
  // ---------- avisos ----------
  totalUnread() { return SOC ? CAST_ORDER.reduce((n, id) => n + (SOC.c[id] ? (SOC.c[id].st === 'known' ? SOC.c[id].un : SOC.c[id].st === 'req' ? 1 : 0) : 0), 0) : 0; },
  badges() {
    const n = Msn.totalUnread(), txt = n ? (n > 9 ? '9+' : String(n)) : '';
    document.querySelectorAll('[data-msn-badge]').forEach(el => { let b = el.querySelector(':scope > .msn-badge'); if (!n) { if (b) b.remove(); return; } if (!b) { b = document.createElement('em'); b.className = 'msn-badge'; el.append(b); } b.textContent = txt; });
    if (Msn.win) { const t = osTaskOf(Msn.win); if (t) t.lastChild.textContent = ' ' + Msn.ui().app + (n ? ` (${txt})` : ''); }
  },
  incoming(npc, text, block, ctx) {
    Msn.badges();
    if (Msn.reading(npc)) { if (block !== 'quiet') sfx('msnIn'); Msn.render(); return; }
    if (block === 'quiet') {
      if (S && S.phase === 'ending' && $('scene')) Msn.quietNote();
      return;
    }
    if (document.body.classList.contains('mobile') && S && S.openTask && S.openTask.type === 'type') { sfx('msnIn'); return; }   // nunca por cima da palavra a digitar
    const now = performance.now(); if (now - Msn.lastToast < 3500) { sfx('msnIn'); return; }
    Msn.lastToast = now; sfx('msnIn'); Msn.toast(npc, CAST[npc].name, text);
  },
  notifyReq(id) {
    Msn.badges(); const ctx = socCtx(), b = socBlock(ctx); if (b) return;
    Msn.lastToast = performance.now(); sfx('msnReq'); Msn.toast(id, Msn.ui().newReq, CAST[id].name);
  },
  presenceChanged(id, was, s, block, ctx) {
    if (Msn.visible()) Msn.render();
    if (block || ctx.working || s !== 'online' || !['offline', 'away'].includes(was)) return;
    const r = SOC.c[id]; if (!(socGroup(id) === 'friends' || r.aff >= 3)) return;
    const now = performance.now(); if (now - Msn.lastToast < 20000 || now - (SocRT.presAt[id] || 0) < 120000) return;
    SocRT.presAt[id] = Msn.lastToast = now; sfx('msnOn'); Msn.toast(id, Msn.ui().online(CAST[id].name), socPsm(id, ctx), true);
  },
  toast(npc, title, text, small) {
    // celular com o expediente rodando: nenhum balão por cima do jogo (só som e o selo no botão de pausa)
    if (document.body.classList.contains('mobile') && S && S.phase === 'day' && !S.paused) { Msn.badges(); return; }
    document.querySelectorAll('.msn-toast').forEach(e => e.remove());
    const el = document.createElement('button'); el.className = 'msn-toast' + (small ? ' small' : '');
    el.innerHTML = `<span class="msn-tp"></span><span class="msn-tt"><small>${esc(Msn.ui().app)}</small><b>${esc(title)}</b>${text ? `<span>${esc(text)}</span>` : ''}</span>`;
    el.querySelector('.msn-tp').append(msnPicEl(npc, 2));
    el.onclick = () => { el.remove(); Msn.launch(npc); };
    uiRoot().append(el); Motion.enter(el, 'down');
    setTimeout(() => { if (!el.isConnected) return; const a = Motion.leave(el, 'down'); if (a) a.onfinish = () => el.remove(); else el.remove(); }, small ? 3200 : 4500);
  },
  quietNote() {
    const sc = $('scene'); if (!sc) return;
    let el = sc.querySelector('.msn-quiet'); if (!el) { el = document.createElement('div'); el.className = 'msn-quiet'; el.append(Pixel.el(APP_ICO.msn, 3), document.createElement('span')); sc.append(el); Motion.enter(el, 'down'); }
    el.lastChild.textContent = Msn.ui().quietNote(Msn.totalUnread());
  },
  // abrir a partir de um aviso: no expediente vira aplicativo (pausa como os outros); no menu/intervalo abre direto
  launch(npc) {
    if (S && S.phase === 'day' && !S.onBreak) { if (typeof workApp === 'function') workApp('msn'); if (Msn.win) Msn.select(npc); return; }
    if (S && S.phase !== 'over' && !S.onBreak) return;
    Msn.open(npc);
  },
};
SocRT.listeners.push(() => { if (!Msn._raf) Msn._raf = requestAnimationFrame(() => { Msn._raf = 0; if (Msn.visible()) Msn.live(); else Msn.badges(); }); });
// fechar o menu de status ao clicar fora
document.addEventListener('pointerdown', e => { if (Msn.stMenu && !e.target.closest('.msn-stm, .msn-st')) { Msn.stMenu = false; if (Msn.visible()) Msn.render(); } });

// Ícones dos botões da conversa (9×9, brancos sobre o botão)
const MSN_ICO = {
  cam: ['.........', 'WWWWWW...', 'WkkkkW.WW', 'WkkkkWWWW', 'WkkkkWWWW', 'WkkkkW.WW', 'WWWWWW...', '.........', '.........'],
  nudge: ['W...W...W', '.W..W..W.', '.........', 'WW.WWW.WW', '...WkW...', '...WWW...', '.W.....W.', 'W.......W', '.........'],
  info: ['...WWW...', '...WWW...', '.........', '..WWWW...', '...WWW...', '...WWW...', '...WWW...', '..WWWWW..', '.........'],
};
new MutationObserver(() => document.querySelectorAll('.msn-ico:not(.done)').forEach(i => { i.classList.add('done'); i.append(Pixel.el(MSN_ICO[i.dataset.ico], 2)); }))
  .observe(document.body, { childList: true, subtree: true });

// Linha de status na tela de Perfil (mesmo status e mensagem pessoal do MSworkN)
function msnProfileLine() {
  const u = U().msn, el = document.createElement('p'); el.className = 'msn-profline';
  el.innerHTML = `${msnDot(SOCP.status)}<b>${u.status[SOCP.status]}</b>${SOCP.msg ? ` — <i>${esc(SOCP.msg)}</i>` : ''}`;
  return el;
}

// foto/nome do crachá mudou: o perfil do MSworkN acompanha
{ const sp0 = saveProfile; saveProfile = () => { sp0(); if (Msn.visible()) Msn.render(); }; }
