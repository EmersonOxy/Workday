/* ================= Contas, adicionar contatos e o primeiro dia (e-mail do RH) ================= */
// Antes do 1º dia de cada carreira chega um e-mail da Bia (RH): adicionar o Duda no MSworkN e mandar um oi para ele.
// Só depois disso o expediente começa. Contatos podem ser adicionados pelo nome, mas só quem a campanha já liberou
// aparece na busca (os outros respondem "nenhum usuário encontrado", sem revelar quem existe).

LANGS.pt.ui.acc = { label: 'Nome de usuário', ph: 'Digite seu nome', need: 'Digite um nome para entrar. Cada nome tem o próprio save.' };
LANGS.en.ui.acc = { label: 'Username', ph: 'Type your name', need: 'Type a name to sign in. Each name has its own save.' };
LANGS.es.ui.acc = { label: 'Nombre de usuario', ph: 'Escribe tu nombre', need: 'Escribe un nombre para entrar. Cada nombre tiene su propia partida.' };
Object.assign(LANGS.pt.ui.msn, {
  callFirst: n => `Mande uma mensagem para ${n} antes de ligar.`, add: 'Adicionar contato', addPh: 'Nome ou e-mail do contato', addGo: 'Adicionar', addNone: 'Nenhum usuário encontrado com esse nome.', addHas: n => `${n} já está na sua lista.`, addOk: n => `${n} foi adicionado(a).`,
  onb: { title: 'E-MAIL · CAIXA DE ENTRADA', from: 'Bia Torres · RH', subject: 'Antes do seu primeiro dia', open: 'Abrir o MSworkN', start: 'Começar o expediente', back: 'Depois',
    body: n => `<p>Oi, ${n}! Seja bem-vindo(a) à Workday!</p><p>Antes de bater o ponto, só uma coisinha: abra o <b>MSworkN</b> (o ícone de balões na área de trabalho) e adicione o <b>Duda</b>, do TI. É só clicar em <i>Adicionar contato</i> e procurar por "Duda".</p><p>Depois manda um <b>oi</b> pra ele, assim ele também fica com o seu contato e consegue te socorrer quando o computador travar (vai travar).</p><p>Te vejo lá dentro!<br>Bia Torres — RH</p>`,
    steps: { add: 'Adicionar o Duda no MSworkN', hi: 'Mandar um oi para o Duda' } },
});
Object.assign(LANGS.en.ui.msn, {
  callFirst: n => `Send ${n} a message before calling.`, add: 'Add contact', addPh: 'Contact name or e-mail', addGo: 'Add', addNone: 'No user found with that name.', addHas: n => `${n} is already on your list.`, addOk: n => `${n} was added.`,
  onb: { title: 'E-MAIL · INBOX', from: 'Bia Torres · HR', subject: 'Before your first day', open: 'Open MSworkN', start: 'Start the workday', back: 'Later',
    body: n => `<p>Hi, ${n}! Welcome to Workday!</p><p>Before you clock in, one small thing: open <b>MSworkN</b> (the speech-bubble icon on the desktop) and add <b>Duda</b> from IT. Just click <i>Add contact</i> and search for "Duda".</p><p>Then send him a <b>hi</b>, so he has your contact too and can rescue you when the computer freezes (it will).</p><p>See you inside!<br>Bia Torres — HR</p>`,
    steps: { add: 'Add Duda on MSworkN', hi: 'Say hi to Duda' } },
});
Object.assign(LANGS.es.ui.msn, {
  callFirst: n => `Envía un mensaje a ${n} antes de llamar.`, add: 'Agregar contacto', addPh: 'Nombre o correo del contacto', addGo: 'Agregar', addNone: 'No se encontró ningún usuario con ese nombre.', addHas: n => `${n} ya está en tu lista.`, addOk: n => `${n} fue agregado(a).`,
  onb: { title: 'CORREO · BANDEJA DE ENTRADA', from: 'Bia Torres · RR. HH.', subject: 'Antes de tu primer día', open: 'Abrir MSworkN', start: 'Empezar la jornada', back: 'Después',
    body: n => `<p>¡Hola, ${n}! ¡Bienvenido(a) a Workday!</p><p>Antes de marcar entrada, una cosita: abre <b>MSworkN</b> (el icono de globos en el escritorio) y agrega a <b>Duda</b>, de TI. Solo haz clic en <i>Agregar contacto</i> y busca "Duda".</p><p>Después mándale un <b>hola</b>, así él también tiene tu contacto y puede rescatarte cuando la computadora se cuelgue (se va a colgar).</p><p>¡Nos vemos adentro!<br>Bia Torres — RR. HH.</p>`,
    steps: { add: 'Agregar a Duda en MSworkN', hi: 'Saludar a Duda' } },
});

// Quem pode ser adicionado pelo nome, e a partir de quando (o resto da campanha libera por apresentação/solicitação)
const SOC_ADD = {
  lu: { keys: ['lu', 'luana', 'reis', 'lu reis'], when: {} },
  duda: { keys: ['duda', 'eduardo', 'ti', 'it', 'suporte', 'support', 'soporte', 'duda@workday'], when: { career: true } },
  bia: { keys: ['bia', 'beatriz', 'torres', 'bia torres', 'rh', 'hr', 'bia@workday'], when: { career: true } },
  otavio: { keys: ['otavio', 'prado', 'otavio prado', 'financeiro', 'finance', 'finanzas'], when: { career: true, day: 2 } },
  helena: { keys: ['helena', 'vaz', 'helena vaz', 'juridico', 'legal'], when: { career: true, day: 4 } },
  rafa: { keys: ['rafa', 'rafael', 'nogueira', 'rafa nogueira', 'arquivo', 'filing', 'archivo'], when: { career: true, any: [{ rank: 1 }, { day: 5 }] } },
};
function socAddContact(text) {
  socSync();
  const q = socNorm(text).trim().replace(/\s+/g, ' ').replace(/\.com.*$/, ''); if (!q) return { ok: false, msg: '' };
  const u = U().msn, ctx = socCtx();
  const id = Object.keys(SOC_ADD).find(k => SOC_ADD[k].keys.includes(q));
  if (!id || !CAST[id] || !socCond(SOC_ADD[id].when, id, ctx)) return { ok: false, msg: u.addNone };
  const r = socRel(id);
  if (r.st === 'known') return { ok: false, msg: u.addHas(CAST[id].name), id };
  r.st = 'known'; r.since = ctx.day; r.f.addedMe = ctx.day; delete r.reqBy;
  socLog(id, { f: 's', r: { sys: 'added', a: [CAST[id].name] } }, ctx); socDirty();
  return { ok: true, msg: u.addOk(CAST[id].name), id };
}

// ---------- primeiro dia: o e-mail da Bia e as duas tarefas ----------
// A carreira nova é preparada já aqui (colegas da carreira anterior saem, o Duda adicionado agora fica para ela).
function socPrepareCareer() {
  socSync();
  const next = Quests.cid() + 1;
  if (SOC.pre && SOC.cid === next) return;
  socNewCareerState(next); SOC.pre = true; socDirty(); socFlush();
}
function socOnboardDone() { const r = SOC.c.duda; return { add: !!r && r.st === 'known', hi: !!r && r.st === 'known' && r.f.saidHi != null }; }
function socOnboard(go) {
  socPrepareCareer();
  const u = U().msn.onb;
  $('modal').querySelectorAll('.onb-win').forEach(w => { const t = osTaskOf(w); if (t) t.remove(); w.remove(); });
  const w = osWindow(u.title, `<div class="onb"><div class="onb-h"><span class="onb-pic"></span><div><b>${u.from}</b><small>${u.subject}</small></div></div>
    <div class="onb-body">${u.body(esc(profileName()))}</div><ul class="onb-ck"><li data-k="add"><i></i>${u.steps.add}</li><li data-k="hi"><i></i>${u.steps.hi}</li></ul>
    <div class="actions"><button class="pxbtn" id="onbMsn">${u.open}</button><button class="pxbtn main" id="onbGo" disabled>${u.start}</button></div></div>`,
    { icon: SPR2.envelope, cls: 'onb-win', onClose: () => clearInterval(iv) });
  w.querySelector('.onb-pic').append(msnPicEl('bia', 2));
  let ready = false;
  const paint = () => { const d = socOnboardDone(), ok = d.add && d.hi; w.querySelectorAll('.onb-ck li').forEach(li => li.classList.toggle('ok', d[li.dataset.k])); w.querySelector('#onbGo').disabled = !ok;
    // tudo feito: só marca e libera o botão; o e-mail continua em segundo plano (o jogador volta a ele quando quiser)
    if (ok && !ready) ready = true; };
  const iv = setInterval(() => { if (!w.isConnected) return clearInterval(iv); paint(); }, 400);
  w.querySelector('#onbMsn').onclick = () => { sfx('click'); const has = SOC.c.duda && SOC.c.duda.st === 'known'; if (!has) Msn.addOpen = true; Msn.open(has ? 'duda' : null); if (!has) Msn.render(); };
  w.querySelector('#onbGo').onclick = () => { const d = socOnboardDone(); if (!(d.add && d.hi)) return; clearInterval(iv); sfx('ok');
    document.querySelectorAll('.msn-win, .onb-win').forEach(x => { const t = osTaskOf(x); if (t) t.remove(); x.remove(); }); Msn.win = null; go(); };
  paint(); sfx('mail');
}
{ const lw0 = launchWorkday; launchWorkday = () => socOnboard(lw0); }
