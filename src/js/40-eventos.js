/* ================= Calendário da empresa: dias especiais, missões opcionais, coleção e conquistas ================= */
// O calendário interno conta os dias da CARREIRA (dias úteis, segunda a sexta), separado da data real do aparelho.
// Os dias especiais se repetem a cada ciclo de 20 dias úteis, com pequenas variações por carreira. Cada dia especial
// traz uma missão opcional: só começa se o jogador aceitar no calendário, nunca pune quem ignora e a recompensa
// (broche, medalha ou personalização) é entregue uma única vez, gravada antes do aviso (recarregar não duplica).

LANGS.pt.ui.ev = {
  calNote: 'Os ícones marcam eventos da empresa nos dias de expediente. Clique para saber mais.', todo: 'O que fazer:',
  app: 'Calendário', tabCareer: 'Expediente', tabReal: 'Aparelho', archive: 'Arquivo',
  realNote: 'Data real do aparelho. Os eventos da empresa seguem o calendário do expediente.',
  cycle: n => `Ciclo ${n}`, dayN: n => `Dia ${n}`, today: 'Hoje', noCareer: 'Sem carreira em andamento: o calendário mostra o primeiro ciclo.',
  wk: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], hidden: 'Algo está marcado para esse dia…', soon: n => `Começa no dia ${n}.`,
  window: (a, b) => a === b ? `Dia ${a}` : `Dias ${a} a ${b}`, join: 'Participar', joined: 'Participando', done: 'Concluída', expired: 'Passou. Volta no próximo ciclo.',
  notYet: 'Dá para participar quando o evento começar.', optional: 'Opcional: ignorar não tem penalidade.', reward: 'Recompensa', sign: 'Assinar o cartão',
  doneToast: n => `Missão concluída: ${n}`, unlockToast: n => `Desbloqueado: ${n}`, achToast: n => `Conquista: ${n}`, from: 'Calendário',
  sections: { quests: 'Missões', pins: 'Coleção', unlocks: 'Personalizações', ach: 'Conquistas' },
  lockedHint: h => `Bloqueado · ${h}`, owned: 'Na coleção', missing: '???', progress: (a, b) => `${a}/${b}`, empty: 'Nada por aqui ainda.',
  steps: { files: n => `Arquivar ${n} documentos`, emails: n => `Responder ${n} e-mails`, typed: n => `Digitar ${n} relatórios`, bosses: n => `Escapar do chefe ${n} vez(es)`,
    viruses: n => `Fechar ${n} vírus`, cafe: n => `Tomar ${n} café(s)`, duda: n => `Jogar ${n} partida(s) com o Duda`, buy: n => `Comprar ${n} presente(s) no mercado`,
    decor: n => `Ter ${n} enfeites na mesa`, calm: n => `Terminar o dia com estresse abaixo de ${n}%`, sign: () => 'Assinar o cartão no calendário' },
  names: { integracao: 'Dia de integração', cafe: 'Dia do café', chefe: 'Aniversário do chefe', decoracao: 'Concurso de decoração', duda: 'Aniversário do Duda',
    produtividade: 'Semana da produtividade', amigo: 'Amigo secreto', festa: 'Festa de fim de ciclo' },
  desc: { integracao: 'Os novatos fazem o tour pelos setores. Mostre como se faz.', cafe: 'A copa ganhou grãos especiais. Seria indelicado recusar.',
    chefe: 'Tem um cartão rodando pelas mesas. E o chefe está de olho em quem some.', decoracao: 'O RH vai fotografar as mesas mais caprichadas.',
    duda: 'O Duda faz aniversário e só quer uma coisa: uma partida.', produtividade: 'Cinco dias de metas no mural. Ninguém sabe quem inventou isso.',
    amigo: 'O sorteio saiu. O mercado tem uma prateleira só de lembrancinhas.', festa: 'Último dia do ciclo. Chegue inteiro na festa.' },
  pins: { novato: 'Broche do novato', xicara: 'Broche da xícara', bolo: 'Broche do bolo', pincel: 'Broche da paleta', controle: 'Insígnia do controle',
    relogio: 'Medalha da produtividade', laco: 'Adesivo do laço', estrela: 'Medalha da festa' },
  unlocks: { 'wall:confete': 'Papel de parede Confete', 'wall:festa': 'Papel de parede Fogos', 'accent:ouro': 'Janelas Douradas', 'badge:coral': 'Crachá e cordão Coral', 'curc:ouro': 'Ponteiro Dourado' },
  ach: { d1: ['Primeiro expediente', 'Termine um dia de trabalho.'], d10: ['Veterano', 'Trabalhe 10 dias.'], d50: ['Prata da casa', 'Trabalhe 50 dias.'],
    f500: ['Arquivista', 'Arquive 500 documentos.'], f3000: ['Arquivo vivo', 'Arquive 3.000 documentos.'], e100: ['Caixa zerada', 'Responda 100 e-mails.'],
    c50: ['Boa de papo', 'Atenda 50 ligações.'], v25: ['Antivírus humano', 'Feche 25 vírus.'], b10: ['Invisível', 'Escape do chefe 10 vezes.'],
    r1: ['Primeira promoção', 'Seja promovido.'], r4: ['Gerência', 'Chegue a Gerente.'], r6: ['Sala da presidência', 'Chegue a CEO.'],
    dec5: ['Mesa com personalidade', 'Tenha 5 enfeites.'], q3: ['Espírito de equipe', 'Conclua 3 missões.'], all: ['Colecionador', 'Junte todos os broches e medalhas.'] },
};
LANGS.en.ui.ev = {
  calNote: 'Icons mark company events on workdays. Click one to learn more.', todo: 'What to do:',
  app: 'Calendar', tabCareer: 'Workdays', tabReal: 'Device', archive: 'Archive',
  realNote: 'Real date of this device. Company events follow the workday calendar.',
  cycle: n => `Cycle ${n}`, dayN: n => `Day ${n}`, today: 'Today', noCareer: 'No career in progress: showing the first cycle.',
  wk: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], hidden: 'Something is planned for this day…', soon: n => `Starts on day ${n}.`,
  window: (a, b) => a === b ? `Day ${a}` : `Days ${a} to ${b}`, join: 'Join', joined: 'Joined', done: 'Completed', expired: 'Over. It comes back next cycle.',
  notYet: 'You can join once the event starts.', optional: 'Optional: ignoring it has no penalty.', reward: 'Reward', sign: 'Sign the card',
  doneToast: n => `Mission complete: ${n}`, unlockToast: n => `Unlocked: ${n}`, achToast: n => `Achievement: ${n}`, from: 'Calendar',
  sections: { quests: 'Missions', pins: 'Collection', unlocks: 'Customizations', ach: 'Achievements' },
  lockedHint: h => `Locked · ${h}`, owned: 'In collection', missing: '???', progress: (a, b) => `${a}/${b}`, empty: 'Nothing here yet.',
  steps: { files: n => `File ${n} documents`, emails: n => `Answer ${n} e-mails`, typed: n => `Type ${n} reports`, bosses: n => `Dodge the boss ${n} time(s)`,
    viruses: n => `Close ${n} viruses`, cafe: n => `Drink ${n} coffee(s)`, duda: n => `Play ${n} match(es) with Duda`, buy: n => `Buy ${n} gift(s) at the market`,
    decor: n => `Have ${n} decorations on the desk`, calm: n => `End the day with stress below ${n}%`, sign: () => 'Sign the card in the calendar' },
  names: { integracao: 'Onboarding day', cafe: 'Coffee day', chefe: "Boss's birthday", decoracao: 'Desk decoration contest', duda: "Duda's birthday",
    produtividade: 'Productivity week', amigo: 'Secret Santa', festa: 'End-of-cycle party' },
  desc: { integracao: 'New hires tour the departments. Show them how it is done.', cafe: 'The break room got special beans. Refusing would be rude.',
    chefe: "A card is going around the desks. And the boss is watching who disappears.", decoracao: 'HR will photograph the nicest desks.',
    duda: "It's Duda's birthday and he only wants one thing: a match.", produtividade: 'Five days of goals on the board. Nobody knows who came up with this.',
    amigo: 'Names were drawn. The market has a whole shelf of little gifts.', festa: 'Last day of the cycle. Make it to the party in one piece.' },
  pins: { novato: 'Rookie pin', xicara: 'Mug pin', bolo: 'Cake pin', pincel: 'Palette pin', controle: 'Gamepad badge',
    relogio: 'Productivity medal', laco: 'Bow sticker', estrela: 'Party medal' },
  unlocks: { 'wall:confete': 'Confetti wallpaper', 'wall:festa': 'Fireworks wallpaper', 'accent:ouro': 'Golden windows', 'badge:coral': 'Coral badge and lanyard', 'curc:ouro': 'Golden pointer' },
  ach: { d1: ['First shift', 'Finish a workday.'], d10: ['Veteran', 'Work 10 days.'], d50: ['Lifer', 'Work 50 days.'],
    f500: ['Archivist', 'File 500 documents.'], f3000: ['Living archive', 'File 3,000 documents.'], e100: ['Inbox zero', 'Answer 100 e-mails.'],
    c50: ['Smooth talker', 'Take 50 calls.'], v25: ['Human antivirus', 'Close 25 viruses.'], b10: ['Invisible', 'Dodge the boss 10 times.'],
    r1: ['First promotion', 'Get promoted.'], r4: ['Management', 'Reach Manager.'], r6: ['Corner office', 'Reach CEO.'],
    dec5: ['Desk with character', 'Own 5 decorations.'], q3: ['Team spirit', 'Complete 3 missions.'], all: ['Collector', 'Gather every pin and medal.'] },
};
LANGS.es.ui.ev = {
  calNote: 'Los iconos marcan eventos de la empresa en días de trabajo. Haz clic para saber más.', todo: 'Qué hacer:',
  app: 'Calendario', tabCareer: 'Jornadas', tabReal: 'Dispositivo', archive: 'Archivo',
  realNote: 'Fecha real del dispositivo. Los eventos de la empresa siguen el calendario de jornadas.',
  cycle: n => `Ciclo ${n}`, dayN: n => `Día ${n}`, today: 'Hoy', noCareer: 'Sin carrera en curso: se muestra el primer ciclo.',
  wk: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], hidden: 'Hay algo previsto para este día…', soon: n => `Empieza el día ${n}.`,
  window: (a, b) => a === b ? `Día ${a}` : `Días ${a} a ${b}`, join: 'Participar', joined: 'Participando', done: 'Completada', expired: 'Ya pasó. Vuelve el próximo ciclo.',
  notYet: 'Se puede participar cuando empiece el evento.', optional: 'Opcional: ignorarlo no tiene penalización.', reward: 'Recompensa', sign: 'Firmar la tarjeta',
  doneToast: n => `Misión completada: ${n}`, unlockToast: n => `Desbloqueado: ${n}`, achToast: n => `Logro: ${n}`, from: 'Calendario',
  sections: { quests: 'Misiones', pins: 'Colección', unlocks: 'Personalización', ach: 'Logros' },
  lockedHint: h => `Bloqueado · ${h}`, owned: 'En la colección', missing: '???', progress: (a, b) => `${a}/${b}`, empty: 'Nada por aquí todavía.',
  steps: { files: n => `Archivar ${n} documentos`, emails: n => `Responder ${n} correos`, typed: n => `Escribir ${n} informes`, bosses: n => `Esquivar al jefe ${n} vez/veces`,
    viruses: n => `Cerrar ${n} virus`, cafe: n => `Tomar ${n} café(s)`, duda: n => `Jugar ${n} partida(s) con Duda`, buy: n => `Comprar ${n} regalo(s) en el mercado`,
    decor: n => `Tener ${n} adornos en la mesa`, calm: n => `Terminar el día con estrés por debajo del ${n}%`, sign: () => 'Firmar la tarjeta en el calendario' },
  names: { integracao: 'Día de integración', cafe: 'Día del café', chefe: 'Cumpleaños del jefe', decoracao: 'Concurso de decoración', duda: 'Cumpleaños de Duda',
    produtividade: 'Semana de la productividad', amigo: 'Amigo invisible', festa: 'Fiesta de fin de ciclo' },
  desc: { integracao: 'Los nuevos recorren los sectores. Enséñales cómo se hace.', cafe: 'La cocina recibió granos especiales. Rechazarlos sería descortés.',
    chefe: 'Hay una tarjeta pasando por las mesas. Y el jefe vigila quién desaparece.', decoracao: 'RR. HH. fotografiará las mesas más cuidadas.',
    duda: 'Duda cumple años y solo quiere una cosa: una partida.', produtividade: 'Cinco días de metas en el mural. Nadie sabe quién lo inventó.',
    amigo: 'Ya salió el sorteo. El mercado tiene un estante solo de detalles.', festa: 'Último día del ciclo. Llega entero a la fiesta.' },
  pins: { novato: 'Broche del novato', xicara: 'Broche de la taza', bolo: 'Broche de la tarta', pincel: 'Broche de la paleta', controle: 'Insignia del mando',
    relogio: 'Medalla de la productividad', laco: 'Pegatina del lazo', estrela: 'Medalla de la fiesta' },
  unlocks: { 'wall:confete': 'Fondo Confeti', 'wall:festa': 'Fondo Fuegos artificiales', 'accent:ouro': 'Ventanas doradas', 'badge:coral': 'Credencial y cordón coral', 'curc:ouro': 'Puntero dorado' },
  ach: { d1: ['Primera jornada', 'Termina un día de trabajo.'], d10: ['Veterano', 'Trabaja 10 días.'], d50: ['De la casa', 'Trabaja 50 días.'],
    f500: ['Archivista', 'Archiva 500 documentos.'], f3000: ['Archivo viviente', 'Archiva 3.000 documentos.'], e100: ['Bandeja vacía', 'Responde 100 correos.'],
    c50: ['Buena conversación', 'Atiende 50 llamadas.'], v25: ['Antivirus humano', 'Cierra 25 virus.'], b10: ['Invisible', 'Esquiva al jefe 10 veces.'],
    r1: ['Primer ascenso', 'Consigue un ascenso.'], r4: ['Gerencia', 'Llega a Gerente.'], r6: ['Despacho de presidencia', 'Llega a CEO.'],
    dec5: ['Mesa con carácter', 'Ten 5 adornos.'], q3: ['Espíritu de equipo', 'Completa 3 misiones.'], all: ['Coleccionista', 'Reúne todos los broches y medallas.'] },
};

// Broches, medalhas e adesivos (10×10, contorno de tinta, luz de cima à esquerda)
const PIN_SPR = {
  novato:   ['..kkkkkk..', '..kLLLLk..', '.kkkkkkkk.', '.kWWWWWWk.', '.kWssWppk.', '.kWssWWWk.', '.kWkkWppk.', '.kWWWWWWk.', '.kllllllk.', '.kkkkkkkk.'],
  xicara:   ['..w..w....', '...w..w...', '.kkkkkkk..', '.kWuuuWkk.', '.kWWWWWk.k', '.kWWWWWk.k', '.kpWWWpkk.', '..kpppk...', 'kkkkkkkkk.', '.kPPPPPk..'],
  bolo:     ['....R.....', '....Y.....', '....W.....', '.kkkWkkkk.', '.kOOOOOOk.', '.kWrWrWrk.', '.kOOOOOOk.', '.kTTTTTTk.', 'kkkkkkkkkk', '.kPPPPPPk.'],
  pincel:   ['..kkkkkk..', '.kTTTTTTk.', 'kTRTTTYTTk', 'kTTTTTTTTk', 'kTFTTkkTTk', 'kTTTk..kk.', 'kTLTTk....', '.kTTTTkkk.', '..kkTTTTk.', '....kkkk..'],
  controle: ['..........', '.kkkkkkkk.', 'kIIIIIIIIk', 'kIkIIIIRIk', 'kkkkIIRIFk', 'kIkIIIIFIk', 'kIIIkkIIIk', 'kIIk..kIIk', '.kk....kk.', '..........'],
  relogio:  ['.kRk..kLk.', '.kRRkkLLk.', '..kRRLLk..', '...kkkk...', '..kYYYYk..', '.kYyWWYzk.', '.kYWkWWzk.', '.kYWkkWzk.', '..kYzzzk..', '...kkkk...'],
  laco:     ['.kk....kk.', 'kRRk..kRRk', 'kRrRkkRrRk', 'kRRrRRrRRk', '.kkRRRRkk.', '..kRqqRk..', '.kRqk.kRk.', '.kqk...kqk', '..k.....k.', '..........'],
  estrela:  ['....kk....', '...kYYk...', '...kyYk...', 'kkkkyYkkkk', 'kYYYyYYYzk', '.kzYYYYzk.', '..kYYYYk..', '.kYYzzYYk.', '.kYk..kYk.', '.kk....kk.'],
};
const LOCK_SPR = ['..kkk..', '.k...k.', '.k...k.', 'kkkkkkk', 'kYYYYYk', 'kYYkYYk', 'kzYkYzk', 'kkkkkkk'];
APP_ICO.arq = ['............', '.kkkk.......', 'kYYYYkkkkkk.', 'kYyyyyyyyYk.', 'kYkkkkkkkYk.', 'kYkWWWWWkYk.', 'kYkWkkkWkYk.', 'kYkWWWWWkYk.', 'kYkkkkkkkYk.', 'kYYYYYYYYzk.', 'kzzzzzzzzzk.', '.kkkkkkkkk..'];

// Dias especiais: dia de início dentro do ciclo (j = variação sorteada por carreira), duração, passos e recompensas
const CYCLE = 20;
const SPECIAL = [
  { id: 'integracao',    at: 2,  j: 0, len: 1, steps: [['files', 20], ['emails', 2]],      pin: 'novato' },
  { id: 'cafe',          at: 3,  j: 0, len: 1, steps: [['cafe', 2]],                         pin: 'xicara' },
  { id: 'chefe',         at: 4,  j: 2, len: 2, steps: [['sign', 1], ['bosses', 1]],          pin: 'bolo' },
  { id: 'decoracao',     at: 6,  j: 2, len: 3, steps: [['decor', 3]],                        pin: 'pincel', unlock: 'wall:confete' },
  { id: 'duda',          at: 9,  j: 2, len: 2, steps: [['duda', 1]],                         pin: 'controle', unlock: 'curc:ouro' },
  { id: 'produtividade', at: 11, j: 1, len: 5, steps: [['files', 140], ['typed', 6]],        pin: 'relogio', unlock: 'accent:ouro' },
  { id: 'amigo',         at: 16, j: 1, len: 3, steps: [['buy', 1]],                          pin: 'laco', unlock: 'badge:coral' },
  { id: 'festa',         at: 20, j: 0, len: 1, steps: [['calm', 60]],                        pin: 'estrela', unlock: 'wall:festa' },
];
// Personalizações novas que só abrem com missões (nada que já existia fica bloqueado em saves antigos)
const LOCKED = { 'wall:confete': 'decoracao', 'wall:festa': 'festa', 'accent:ouro': 'produtividade', 'badge:coral': 'amigo', 'curc:ouro': 'duda' };
const ACH = [
  ['d1', () => P.stats.days >= 1], ['d10', () => P.stats.days >= 10], ['d50', () => P.stats.days >= 50],
  ['f500', () => P.stats.files >= 500], ['f3000', () => P.stats.files >= 3000], ['e100', () => P.stats.emails >= 100],
  ['c50', () => P.stats.calls >= 50], ['v25', () => P.stats.viruses >= 25], ['b10', () => P.stats.bosses >= 10],
  ['r1', () => (QST.maxRank || 0) >= 1], ['r4', () => (QST.maxRank || 0) >= 4], ['r6', () => (QST.maxRank || 0) >= 6],
  ['dec5', () => P.decor.length >= 5], ['q3', () => Object.keys(QST.done).length >= 3], ['all', () => Object.keys(PIN_SPR).every(k => QST.pins.includes(k))],
];

const QST = Object.assign({ done: {}, active: {}, seen: {}, pins: [], unlocks: [], ach: {}, maxRank: 0 }, load('missoes', {}));
const qSave = () => save('missoes', QST);
const isUnlocked = key => !LOCKED[key] || QST.unlocks.includes(key);

const Quests = {
  cid: () => P.stats.careers || 0,
  // Dia da carreira "de agora": durante o expediente/intervalo é o dia em curso; no menu é o próximo dia a trabalhar
  today() { if (S && (S.running || S.onBreak || ['day', 'promo', 'ending'].includes(S.phase))) return S.day || 1; const c = load('carreira', null); return c ? c.day + 1 : 1; },
  // Janela de um evento no ciclo do dia d (variação fixa por carreira e ciclo)
  win(ev, d) { const c = Math.floor((d - 1) / CYCLE), R = Office.rng(EMP_ID * 31 + this.cid() * 7 + c * 13 + ev.at); R(); R(); const r = R(), a = c * CYCLE + ev.at + Math.floor(r * (ev.j + 1));
    return { a, b: Math.min(a + ev.len - 1, (c + 1) * CYCLE), c }; },
  on(ev, d) { const w = this.win(ev, d); return d >= w.a && d <= w.b ? w : null; },
  // missão aceita nesta carreira e neste ciclo (as de outra carreira ou ciclo já passaram)
  act(id) { const a = QST.active[id]; if (!a || a.cid !== this.cid()) return null; return a; },
  count(ev) { const a = this.act(ev.id); return ev.steps.map(([k, n]) => {
    if (QST.done[ev.id]) return n; if (!a) return 0;
    if (k === 'decor') return Math.min(n, P.decor.length);
    if (k === 'calm' || k === 'sign') return a.p && a.p[k] ? n : 0;
    return Math.min(n, (a.p && a.p[k]) || 0); }); },
  // aceitar: só com o evento acontecendo; ignorar não muda nada
  join(id) { const ev = SPECIAL.find(e => e.id === id), d = this.today(), w = ev && this.on(ev, d);
    if (!w || QST.done[id] || this.act(id)) return false;
    QST.active[id] = { cid: this.cid(), c: w.c, b: w.b, p: {} }; qSave(); this.check(); return true; },
  // progresso: conta só enquanto o dia do evento está em curso
  ev(k, n = 1) {
    if (!S || !S.day) return;
    let ch = false;
    for (const ev of SPECIAL) { const a = this.act(ev.id); if (!a || QST.done[ev.id] || !this.on(ev, S.day) || !ev.steps.some(s => s[0] === k)) continue;
      a.p[k] = (a.p[k] || 0) + n; ch = true; }
    if (ch) { qSave(); this.check(); }
  },
  // conclui o que estiver completo, expira o que passou, confere conquistas. A recompensa é gravada antes do aviso.
  check() {
    const d = this.today(), news = [];
    for (const ev of SPECIAL) { const a = this.act(ev.id); if (!a || QST.done[ev.id]) continue;
      if (this.count(ev).every((v, i) => v >= ev.steps[i][1])) {
        QST.done[ev.id] = { day: d, cid: this.cid() }; delete QST.active[ev.id];
        if (!QST.pins.includes(ev.pin)) QST.pins.push(ev.pin);
        if (ev.unlock && !QST.unlocks.includes(ev.unlock)) QST.unlocks.push(ev.unlock);
        news.push([U().ev.doneToast(U().ev.names[ev.id]), ev.unlock ? U().ev.unlockToast(U().ev.unlocks[ev.unlock]) : U().ev.pins[ev.pin]]);
      } else if (d > a.b) delete QST.active[ev.id];
    }
    for (const [id, ok] of ACH) if (!QST.ach[id] && ok()) { QST.ach[id] = Date.now(); news.push([U().ev.achToast(U().ev.ach[id][0]), U().ev.ach[id][1]]); }
    // missões de carreiras antigas não ficam penduradas
    for (const id of Object.keys(QST.active)) if (QST.active[id].cid !== this.cid()) delete QST.active[id];
    qSave();
    news.forEach(([a, b], i) => setTimeout(() => { sfx('achieve'); toast(U().ev.from, `<b>${a}</b><br>${b}`); }, 400 + i * 1600));
  },
  rank(r) { if (r > (QST.maxRank || 0)) { QST.maxRank = r; qSave(); } },
};

// Ganchos: contadores de estatística, café, compras, partidas com o Duda e fim do dia
{ const st0 = stat; stat = (k, n = 1) => { st0(k, n); if (S && S.phase === 'day') Quests.ev(k, n); }; }
{ const ui0 = useItem; useItem = id => { const had = S && S.inv[id]; ui0(id); if (had && id === 'cafe' && S.inv[id] < had) Quests.ev('cafe'); }; }
// "calm": o passo guarda o limite de estresse; conta 1 quando o dia termina abaixo dele
{ const ed0 = endDay; endDay = () => { const lim = Math.min(...SPECIAL.flatMap(e => e.steps.filter(s => s[0] === 'calm').map(s => s[1]))); if (S.stress < lim) Quests.ev('calm', 1); ed0(); Quests.rank(S.rankIdx); Quests.check(); }; }
{ const pr0 = promote; promote = () => { pr0(); Quests.rank(S.rankIdx); }; }

// Desenho de um broche (silhueta quando ainda não foi conquistado)
function pinEl(id, scale = 3, owned = true) {
  if (owned) return Pixel.el(PIN_SPR[id], scale);
  return Pixel.el(PIN_SPR[id].map(r => r.replace(/[^.]/g, 'K')), scale);
}

// ===== Calendário do WorkOS: o mês real do aparelho, com ícones nos dias que têm evento da empresa =====
// O dia de trabalho "de agora" cai na data de hoje; os dias seguintes de expediente são os próximos dias úteis
// (sábado e domingo não têm expediente). Clicar num ícone abre um balão que vai escrevendo o que é e o que fazer.
function careerDayOf(date, today = Quests.today(), base = new Date()) {
  const wd = d => d.getDay() % 6 !== 0; if (!wd(date)) return 0;
  const a = new Date(base.getFullYear(), base.getMonth(), base.getDate()), b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let n = 0, step = b > a ? 1 : -1; const c = new Date(a);
  while (c.getTime() !== b.getTime()) { c.setDate(c.getDate() + step); if (wd(c)) n += step; }
  if (!wd(a) && step > 0) n -= 1;   // hoje é fim de semana: o próximo dia útil é o dia de trabalho "de agora"
  return today + n;
}
function typeText(el, html, done) {
  // escreve o texto aos poucos (o HTML de cada trecho entra inteiro); com movimento reduzido aparece de uma vez
  const parts = html.split(/(<[^>]+>)/).filter(Boolean); el.innerHTML = '';
  if (Motion.reduced && Motion.reduced.matches) { el.innerHTML = html; done && done(); return () => {}; }
  let pi = 0, ci = 0, out = '', stop = false;
  const tick = () => { if (stop || !el.isConnected) return;
    for (let k = 0; k < 2 && pi < parts.length; k++) { const p = parts[pi]; if (p[0] === '<') { out += p; pi++; k--; continue; } out += p[ci++]; if (ci >= p.length) { pi++; ci = 0; } }
    el.innerHTML = out; if (pi < parts.length) { if (out.length % 9 === 0) sfx('key'); setTimeout(tick, 22); } else done && done(); };
  tick(); return () => { stop = true; el.innerHTML = html; done && done(); };
}
function osCalendar() {
  const u = U(), t = u.osApps, e = u.ev, now = new Date(), first = new Date(now); while (first.getDay() % 6 === 0) first.setDate(first.getDate() + 1);
  let y = first.getFullYear(), mo = first.getMonth();   // abre no mês do próximo dia de expediente (fim de semana pula para segunda)
  const w = osWindow(t.calendar, `<div class="cal"><div class="cal-h"><button class="pxbtn" data-m="-1">◀</button><b></b><button class="pxbtn" data-m="1">▶</button></div><div class="cal-g"></div><p class="cal-note"></p></div>`, { icon: APP_ICO.cal, cls: 'cal-win' });
  Quests.check(); sfx('page');
  const today = Quests.today(), known = (ev, d) => { const w2 = Quests.win(ev, d); return today >= w2.a - 3 || QST.done[ev.id]; };
  const evOf = d => d < 1 ? [] : SPECIAL.filter(ev => Quests.on(ev, d));
  w.querySelector('.cal-note').textContent = e.calNote;
  let bubble = null, skip = null;
  const closeBubble = () => { if (bubble) { bubble.remove(); bubble = null; } };
  const open = (cell, d) => {
    closeBubble(); sfx('pop');
    const evs = evOf(d), b = document.createElement('div'); b.className = 'cal-bub'; bubble = b;
    b.innerHTML = `<div class="cal-bub-t"></div><div class="actions"></div>`;
    const box = w.querySelector('.cal'); box.append(b);
    const r = cell.getBoundingClientRect(), rb = box.getBoundingClientRect();
    b.style.left = Math.max(0, Math.min(rb.width - b.offsetWidth, r.left - rb.left + r.width / 2 - b.offsetWidth / 2)) + 'px';
    b.style.top = (r.bottom - rb.top + 8) + 'px';
    b.style.setProperty('--tip', (r.left - rb.left + r.width / 2 - parseFloat(b.style.left)) + 'px');
    const parts = evs.map(ev => {
      if (!known(ev, d)) return `<p>${e.hidden}</p>`;
      QST.seen[ev.id] = true;
      const w2 = Quests.win(ev, d), cnt = Quests.count(ev), done = !!QST.done[ev.id], a = Quests.act(ev.id), on = today >= w2.a && today <= w2.b;
      return `<p><b>${e.names[ev.id]}</b> · <small>${e.window(w2.a, w2.b)}</small></p><p>${e.desc[ev.id]}</p>
        <p><b>${e.todo}</b> ${ev.steps.map(([k, n], i) => e.steps[k](n) + (k === 'sign' || k === 'calm' || !a ? '' : ` (${e.progress(cnt[i], n)})`)).join('; ')}.</p>
        <p><small>${e.reward}: ${e.pins[ev.pin]}${ev.unlock ? ' + ' + e.unlocks[ev.unlock] : ''}</small></p>
        <p><small>${done ? e.done : today > w2.b ? e.expired : !on ? e.soon(w2.a) : a ? e.joined : e.optional}</small></p>`;
    });
    qSave();
    const acts = () => { const act = b.querySelector('.actions');
      for (const ev of evs) { if (!known(ev, d)) continue; const w2 = Quests.win(ev, d), on = today >= w2.a && today <= w2.b, a = Quests.act(ev.id);
        if (on && !QST.done[ev.id] && !a) { const bt = document.createElement('button'); bt.className = 'pxbtn main'; bt.textContent = e.join; bt.onclick = ev2 => { ev2.stopPropagation(); if (Quests.join(ev.id)) { sfx('confirm'); paint(); open(cell, d); } }; act.append(bt); }
        if (on && a && !QST.done[ev.id] && ev.steps.some(s2 => s2[0] === 'sign') && !(a.p.sign >= 1)) { const bt = document.createElement('button'); bt.className = 'pxbtn'; bt.textContent = e.sign;
          bt.onclick = ev2 => { ev2.stopPropagation(); act.replaceChildren(sigPad(u.signature, () => { a.p.sign = 1; qSave(); Quests.check(); sfx('ok'); paint(); open(cell, d); })); }; act.append(bt); } } };
    skip = typeText(b.querySelector('.cal-bub-t'), parts.join(''), acts);
    b.addEventListener('pointerdown', ev2 => { ev2.stopPropagation(); if (skip && !ev2.target.closest('button, .sig')) { skip(); skip = null; } });
  };
  w.addEventListener('pointerdown', ev2 => { if (bubble && !ev2.target.closest('.cal-bub, .cal-ev')) closeBubble(); });
  const paint = () => {
    closeBubble();
    const first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
    w.querySelector('.cal-h b').textContent = new Date(y, mo, 1).toLocaleDateString(CFG.lang === 'en' ? 'en-US' : CFG.lang === 'es' ? 'es-ES' : 'pt-BR', { month: 'long', year: 'numeric' });
    const g = w.querySelector('.cal-g');
    g.innerHTML = t.week.map(d => `<i>${d}</i>`).join('') + '<span></span>'.repeat(first) +
      Array.from({ length: days }, (_, i) => `<span class="${y === now.getFullYear() && mo === now.getMonth() && i + 1 === now.getDate() ? 'today' : ''}">${i + 1}</span>`).join('');
    [...g.querySelectorAll('span')].slice(first).forEach((sp, i) => {
      const d = careerDayOf(new Date(y, mo, i + 1), today, now), evs = evOf(d).filter(ev => Quests.win(ev, d).a === d || (d === today && known(ev, d))); if (!evs.length || d < today - 25) return;   // ícone no 1º dia do evento (e hoje, se ele estiver acontecendo)
      const ic = document.createElement('button'); ic.className = 'cal-ev' + (evs.some(ev => QST.done[ev.id]) ? ' done' : ''); ic.setAttribute('aria-label', e.hidden);
      const ev = evs[0]; ic.append(known(ev, d) ? pinEl(ev.pin, 2, true) : Pixel.el(CAL_Q, 2));
      if (known(ev, d) && today >= Quests.win(ev, d).a && today <= Quests.win(ev, d).b && !QST.done[ev.id]) ic.classList.add('now');
      sp.classList.add('has'); sp.append(ic); ic.onclick = ev2 => { ev2.stopPropagation(); open(sp, d); };
    });
  };
  w.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mo += +b.dataset.m; if (mo < 0) { mo = 11; y--; } if (mo > 11) { mo = 0; y++; } sfx('click'); paint(); });
  paint();
}
const CAL_Q = ['.kkkk.', 'kWWWWk', 'kkkWWk', '.kWWk.', '.kkkk.', '.kWk..', '.kkk..'];

// ===== Arquivo de conquistas: programa antigo com gavetas (missões, coleção, personalizações, conquistas) =====
function osArchive() {
  const e = U().ev, S0 = e.sections;
  const w = osWindow(e.archive, `<div class="arq"><nav class="arq-nav">${Object.entries(S0).map(([k, v], i) => `<button class="arq-tab${i ? '' : ' on'}" data-s="${k}">${v}</button>`).join('')}</nav><div class="arq-body"></div><div class="arq-st"></div></div>`, { icon: APP_ICO.arq, cls: 'arq-win' });
  Quests.check();
  const body = w.querySelector('.arq-body'), st = w.querySelector('.arq-st');
  const show = s => {
    w.querySelectorAll('.arq-tab').forEach(b => b.classList.toggle('on', b.dataset.s === s)); body.innerHTML = '';
    if (s === 'quests') {
      const d = Quests.today();
      for (const ev of SPECIAL) { const w0 = Quests.win(ev, d), nextA = d <= w0.b ? w0.a : Quests.win(ev, d + CYCLE).a, cnt = Quests.count(ev), done = !!QST.done[ev.id], seen = done || QST.seen[ev.id], a = Quests.act(ev.id);
        const r = document.createElement('div'); r.className = 'arq-row' + (done ? ' ok' : '');
        r.innerHTML = `<span class="arq-ic"></span><div><b>${seen ? e.names[ev.id] : e.missing}</b><small>${seen ? ev.steps.map(([k, n], i) => e.steps[k](n) + (k === 'sign' || k === 'calm' ? '' : ' ' + e.progress(cnt[i], n))).join(' · ') : e.hidden}</small></div><em>${done ? e.done : a ? e.joined : seen && nextA > d ? e.soon(nextA) : ''}</em>`;
        r.querySelector('.arq-ic').append(pinEl(ev.pin, 2, done)); body.append(r); }
    }
    if (s === 'pins') { const g = document.createElement('div'); g.className = 'arq-grid';
      for (const k of Object.keys(PIN_SPR)) { const own = QST.pins.includes(k), ev = SPECIAL.find(x => x.pin === k), c = document.createElement('div'); c.className = 'arq-pin' + (own ? ' own' : '');
        c.append(pinEl(k, 4, own)); c.insertAdjacentHTML('beforeend', `<b>${own ? e.pins[k] : e.missing}</b><small>${own ? e.owned : e.lockedHint(e.names[ev.id])}</small>`); g.append(c); }
      body.append(g); }
    if (s === 'unlocks') for (const [k, q] of Object.entries(LOCKED)) { const own = isUnlocked(k), r = document.createElement('div'); r.className = 'arq-row' + (own ? ' ok' : '');
      r.innerHTML = `<span class="arq-ic"></span><div><b>${e.unlocks[k]}</b><small>${own ? e.owned : e.lockedHint(e.names[q])}</small></div>`;
      r.querySelector('.arq-ic').append(own ? Pixel.el(APP_ICO.paint, 2) : Pixel.el(LOCK_SPR, 3)); body.append(r); }
    if (s === 'ach') for (const [id] of ACH) { const own = !!QST.ach[id], r = document.createElement('div'); r.className = 'arq-row' + (own ? ' ok' : '');
      r.innerHTML = `<span class="arq-ic"></span><div><b>${e.ach[id][0]}</b><small>${e.ach[id][1]}</small></div><em>${own ? new Date(QST.ach[id]).toLocaleDateString(L.htmlLang) : ''}</em>`;
      r.querySelector('.arq-ic').append(own ? Pixel.el(PIN_SPR.estrela, 2) : Pixel.el(LOCK_SPR, 3)); body.append(r); }
    const tot = { quests: [Object.keys(QST.done).length, SPECIAL.length], pins: [QST.pins.length, Object.keys(PIN_SPR).length], unlocks: [QST.unlocks.length, Object.keys(LOCKED).length], ach: [Object.keys(QST.ach).length, ACH.length] }[s];
    st.textContent = `${S0[s]}: ${tot[0]}/${tot[1]}`;
  };
  w.querySelectorAll('.arq-tab').forEach(b => b.onclick = () => { sfx('click'); show(b.dataset.s); });
  show('quests');
}

// Personalizações bloqueadas: cadeado e dica (qual evento libera); o clique não aplica e mostra a dica
const LOCK_SEL = { 'wall:confete': '.wall[data-w=confete]', 'wall:festa': '.wall[data-w=festa]', 'accent:ouro': '[data-hw=accent] [data-v=ouro]',
  'badge:coral': '[data-hw=badge] [data-v=coral], [data-hw=lanyard] [data-v=coral]', 'curc:ouro': '.cur-dot[data-c=ouro]' };
function lockUI(root, note) {
  const e = U().ev;
  for (const [key, sel] of Object.entries(LOCK_SEL)) root.querySelectorAll(sel).forEach(b => {
    if (isUnlocked(key)) { b.removeAttribute('data-lock'); return; }
    const hint = e.lockedHint(e.names[LOCKED[key]]); b.dataset.lock = hint; b.title = hint; b.setAttribute('aria-label', hint); b.setAttribute('aria-disabled', 'true');
    if (!b.querySelector('.lock-ic')) { const i = Pixel.el(LOCK_SPR, 2); i.classList.add('lock-ic'); b.append(i); }
  });
  if (!root._lockHook) { root._lockHook = true;
    root.addEventListener('click', ev => { const b = ev.target.closest('[data-lock]'); if (!b) return; ev.stopImmediatePropagation(); ev.preventDefault(); sfx('err'); Motion.shake && Motion.shake(b, 2);
      const n = note && note(); if (n) n.textContent = b.dataset.lock; }, true); }
}

// ===== Promoções pelo calendário interno: uma regra só para mercado, caixa e catálogo =====
// Vale o dia de trabalho "de agora" (Quests.today). O maior desconto aplicável vence; descontos não se somam.
const GIFTS = ['pato', 'adesivos', 'cacto', 'livros', 'foto', 'planta'];
const PROMOS = [
  { id: 'cafe', off: .4, ids: ['cafe', 'cha'], on: d => !!Quests.on(SPECIAL.find(e => e.id === 'cafe'), d) },
  { id: 'integracao', off: .15, kind: 'decor', on: d => (d - 1) % CYCLE < 5 },
  { id: 'amigo', off: .25, ids: GIFTS, on: d => !!Quests.on(SPECIAL.find(e => e.id === 'amigo'), d) },
];
function promoFor(id, d = Quests.today()) {
  const it = SHOP.find(i => i.id === id); if (!it) return null;
  let best = null; for (const p of PROMOS) if ((p.ids ? p.ids.includes(id) : it.kind === p.kind) && p.on(d) && (!best || p.off > best.off)) best = p;
  return best;
}
function priceOf(id, d) {
  const it = SHOP.find(i => i.id === id), base = it ? it.price : 0, pr = promoFor(id, d);
  return { base, price: pr ? Math.max(1, Math.round(base * (1 - pr.off))) : base, promo: pr };
}
const priceTag = id => { const p = priceOf(id); return p.promo ? `<s>${money(p.base)}</s> <b class="promo">${money(p.price)}</b>` : money(p.price); };

LANGS.pt.ui.cat = { app: 'Catálogo', all: 'Tudo', use: 'Consumíveis', day: 'Do dia', decor: 'Enfeites', owned: 'Na mesa', inBag: n => `Na bolsa: ${n}`, onlyMarket: 'Compra no mercado, no fim do expediente.', usedToday: 'Vale para um dia de trabalho.',
  promo: { cafe: 'Dia do café', integracao: 'Semana de integração', amigo: 'Amigo secreto' }, off: n => `−${n}%`, next: 'Próximas promoções', none: 'Nenhuma promoção à vista.', from: (n, d) => `${n} · dia ${d}` };
LANGS.en.ui.cat = { app: 'Catalog', all: 'All', use: 'Consumables', day: 'Daily', decor: 'Decorations', owned: 'On your desk', inBag: n => `In bag: ${n}`, onlyMarket: 'Bought at the market after work.', usedToday: 'Lasts one workday.',
  promo: { cafe: 'Coffee day', integracao: 'Onboarding week', amigo: 'Secret Santa' }, off: n => `−${n}%`, next: 'Upcoming deals', none: 'No deals in sight.', from: (n, d) => `${n} · day ${d}` };
LANGS.es.ui.cat = { app: 'Catálogo', all: 'Todo', use: 'Consumibles', day: 'Del día', decor: 'Adornos', owned: 'En tu mesa', inBag: n => `En la bolsa: ${n}`, onlyMarket: 'Se compra en el mercado, al final de la jornada.', usedToday: 'Vale para una jornada.',
  promo: { cafe: 'Día del café', integracao: 'Semana de integración', amigo: 'Amigo invisible' }, off: n => `−${n}%`, next: 'Próximas ofertas', none: 'Ninguna oferta a la vista.', from: (n, d) => `${n} · día ${d}` };
APP_ICO.shop = ['............', '..kkkkkkkk..', '.kRWRWRWRWk.', 'kRRWWRRWWRRk', 'kkkkkkkkkkkk', '.kWWWWWWWWk.', '.kWkkkWYYWk.', '.kWkLkWYYWk.', '.kWkLkWWWWk.', '.kWkLkWWWWk.', '.kkkkkkkkkk.', '............'];

// Catálogo do WorkOS: só consulta (as compras continuam no mercado), com o mesmo preço que o caixa vai cobrar
function osCatalog() {
  const c = U().cat, kinds = ['all', 'use', 'day', 'decor'];
  const w = osWindow(c.app, `<div class="ctl"><div class="cal-tabs">${kinds.map((k, i) => `<button class="pxbtn${i ? '' : ' on'}" data-k="${k}">${c[k]}</button>`).join('')}</div><div class="ctl-promo"></div><div class="ctl-list"></div><p class="hint">${c.onlyMarket}</p></div>`, { icon: APP_ICO.shop, cls: 'ctl-win' });
  const d0 = Quests.today(), up = [];
  for (let d = d0; d < d0 + 6; d++) for (const p of PROMOS) if (p.on(d) && !up.some(x => x[0] === p.id)) up.push([p.id, d, p.off]);
  w.querySelector('.ctl-promo').innerHTML = `<b>${c.next}</b> ` + (up.length ? up.map(([id, d, off]) => `<span class="ctl-tag${d === d0 ? ' now' : ''}">${c.from(c.promo[id], d)} ${c.off(off * 100)}</span>`).join(' ') : c.none);
  const inv = (S && S.inv) || (load('carreira', null) || {}).inv || {};
  const paint = k => { w.querySelectorAll('[data-k]').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    const list = w.querySelector('.ctl-list'); list.innerHTML = '';
    for (const it of SHOP.filter(i => k === 'all' || i.kind === k).sort((a, b) => priceOf(a.id).price - priceOf(b.id).price)) {
      const p = priceOf(it.id), own = it.kind === 'decor' && P.decor.includes(it.id), r = document.createElement('div'); r.className = 'ctl-row' + (own ? ' own' : '') + (p.promo ? ' sale' : '');
      r.innerHTML = `<span class="ctl-spr"></span><div><b>${L.shop[it.id][0]}</b><small>${L.shop[it.id][1]}</small><small class="ctl-k">${c[it.kind]}${it.kind === 'day' ? ' · ' + c.usedToday : ''}${it.kind === 'use' && inv[it.id] ? ' · ' + c.inBag(inv[it.id]) : ''}${own ? ' · ' + c.owned : ''}${p.promo ? ' · ' + c.promo[p.promo.id] : ''}</small></div><em>${priceTag(it.id)}</em>`;
      const spr = sprite(SPR[it.spr], 2); pxFit(spr, () => [48, 40]); r.querySelector('.ctl-spr').append(spr); list.append(r); } };
  w.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { sfx('click'); paint(b.dataset.k); });
  paint('all');
}
