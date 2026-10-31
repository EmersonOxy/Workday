/* ================= Calendário da empresa: dias especiais, missões opcionais, coleção e conquistas ================= */
// O calendário interno conta os dias da CARREIRA (dias úteis, segunda a sexta), separado da data real do aparelho.
// Os dias especiais se repetem a cada ciclo de 20 dias úteis, com pequenas variações por carreira. Cada dia especial
// traz uma missão opcional: só começa se o jogador aceitar no calendário, nunca pune quem ignora e a recompensa
// (broche, medalha ou personalização) é entregue uma única vez, gravada antes do aviso (recarregar não duplica).

LANGS.pt.ui.ev = {
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
    news.forEach(([a, b], i) => setTimeout(() => { sfx('level'); toast(U().ev.from, `<b>${a}</b><br>${b}`); }, 400 + i * 1600));
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

// ===== Calendário do WorkOS: expediente (eventos) e data real do aparelho =====
function osCalendar() {
  const u = U(), t = u.osApps, e = u.ev;
  const w = osWindow(t.calendar, `<div class="cal cal2"><div class="cal-tabs"><button class="pxbtn on" data-tab="c">${e.tabCareer}</button><button class="pxbtn" data-tab="r">${e.tabReal}</button></div>
    <div class="cal-pane" data-p="c"><div class="cal-h"><button class="pxbtn" data-c="-1">◀</button><b></b><button class="pxbtn" data-c="1">▶</button></div><div class="cal-g cal-w5"></div><div class="cal-ev"></div></div>
    <div class="cal-pane" data-p="r" hidden><div class="cal-h"><button class="pxbtn" data-m="-1">◀</button><b></b><button class="pxbtn" data-m="1">▶</button></div><div class="cal-g"></div><p class="cal-note">${e.realNote}</p></div></div>`, { icon: APP_ICO.cal, cls: 'cal-win' });
  Quests.check();
  const today = Quests.today(), hasCareer = !!load('carreira', null) || !!(S && S.running);
  let cyc = Math.floor((today - 1) / CYCLE), sel = null;
  // eventos de um ciclo: dia → lista de eventos (descobertos até 3 dias antes; antes disso só um "?")
  const evOf = d => SPECIAL.filter(ev => { const w2 = Quests.win(ev, d); return d >= w2.a && d <= w2.b; });
  const known = (ev, d) => { const w2 = Quests.win(ev, d); return today >= w2.a - 3 || QST.done[ev.id]; };
  const paintC = () => {
    const pc = w.querySelector('[data-p=c]'); pc.querySelector('.cal-h b').textContent = e.cycle(cyc + 1);
    pc.querySelector('[data-c="-1"]').disabled = cyc <= 0;
    const g = pc.querySelector('.cal-g'); g.innerHTML = e.wk.map(x => `<i>${x}</i>`).join('');
    for (let i = 1; i <= CYCLE; i++) { const d = cyc * CYCLE + i, evs = evOf(d), b = document.createElement('button');
      b.className = 'cal-d' + (d === today ? ' today' : '') + (d < today ? ' past' : '') + (sel === d ? ' sel' : '');
      b.innerHTML = `<b>${d}</b>`; const ic = document.createElement('span'); ic.className = 'cal-ic';
      evs.forEach(ev => ic.append(known(ev, d) ? pinEl(ev.pin, 2, true) : Object.assign(document.createElement('em'), { textContent: '?' })));
      if (evs.length) b.classList.add('has');
      b.append(ic); b.onclick = () => { sel = d; sfx('click'); paintC(); detail(d); }; g.append(b); }
    if (!hasCareer) { const n = document.createElement('p'); n.className = 'cal-note'; n.textContent = e.noCareer; g.after(n); pc.querySelectorAll('.cal-note').forEach((x, i, a) => i < a.length - 1 && x.remove()); }
  };
  const detail = d => {
    const box = w.querySelector('.cal-ev'), evs = evOf(d); box.innerHTML = '';
    const head = document.createElement('p'); head.className = 'cal-dayh'; head.textContent = `${e.dayN(d)} · ${e.wk[(d - 1) % 5]}${d === today ? ' · ' + e.today : ''}`; box.append(head);
    if (!evs.length) { box.insertAdjacentHTML('beforeend', `<p class="hint">${e.empty}</p>`); return; }
    for (const ev of evs) {
      const card = document.createElement('div'); card.className = 'cal-evc';
      if (!known(ev, d)) { card.innerHTML = `<p class="hint">${e.hidden}</p>`; box.append(card); continue; }
      QST.seen[ev.id] = true; qSave();
      const w2 = Quests.win(ev, d), on = today >= w2.a && today <= w2.b, a = Quests.act(ev.id), done = !!QST.done[ev.id], cnt = Quests.count(ev);
      card.innerHTML = `<div class="cal-evh"><span class="cal-pin"></span><div><b>${e.names[ev.id]}</b><small>${e.window(w2.a, w2.b)}</small></div></div>
        <p>${e.desc[ev.id]}</p><ul class="cal-steps">${ev.steps.map(([k, n], i) => `<li class="${cnt[i] >= n ? 'ok' : ''}"><i></i>${e.steps[k](n)}${k === 'sign' || k === 'calm' ? '' : ` <small>${e.progress(cnt[i], n)}</small>`}</li>`).join('')}</ul>
        <p class="cal-rw"><small>${e.reward}:</small> ${e.pins[ev.pin]}${ev.unlock ? ' + ' + e.unlocks[ev.unlock] : ''}</p>
        <div class="actions"></div><p class="hint">${done ? e.done : today > w2.b ? e.expired : !on ? e.soon(w2.a) : a ? e.joined : e.optional}</p>`;
      card.querySelector('.cal-pin').append(pinEl(ev.pin, 3, done));
      const act = card.querySelector('.actions');
      if (on && !done && !a) { const b = document.createElement('button'); b.className = 'pxbtn main'; b.textContent = e.join; b.onclick = () => { if (Quests.join(ev.id)) { sfx('ok'); detail(d); paintC(); } }; act.append(b); }
      if (on && a && !done && ev.steps.some(s => s[0] === 'sign') && !(a.p.sign >= 1)) {
        const b = document.createElement('button'); b.className = 'pxbtn'; b.textContent = e.sign;
        b.onclick = () => { act.replaceChildren(sigPad(u.signature, () => { a.p.sign = 1; qSave(); Quests.check(); sfx('ok'); detail(d); })); };
        act.append(b);
      }
      box.append(card);
    }
  };
  w.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cyc = Math.max(0, cyc + +b.dataset.c); sel = null; sfx('click'); paintC(); w.querySelector('.cal-ev').innerHTML = ''; });
  // data real do aparelho (como antes)
  const now = new Date(); let y = now.getFullYear(), mo = now.getMonth();
  const paintR = () => { const pr = w.querySelector('[data-p=r]'), first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
    pr.querySelector('.cal-h b').textContent = new Date(y, mo, 1).toLocaleDateString(CFG.lang === 'en' ? 'en-US' : CFG.lang === 'es' ? 'es-ES' : 'pt-BR', { month: 'long', year: 'numeric' });
    pr.querySelector('.cal-g').innerHTML = t.week.map(d => `<i>${d}</i>`).join('') + '<span></span>'.repeat(first) +
      Array.from({ length: days }, (_, i) => `<span class="${y === now.getFullYear() && mo === now.getMonth() && i + 1 === now.getDate() ? 'today' : ''}">${i + 1}</span>`).join(''); };
  w.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mo += +b.dataset.m; if (mo < 0) { mo = 11; y--; } if (mo > 11) { mo = 0; y++; } sfx('click'); paintR(); });
  w.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { sfx('click'); w.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); w.querySelectorAll('.cal-pane').forEach(p => p.hidden = p.dataset.p !== b.dataset.tab); });
  paintC(); paintR(); sel = today; paintC(); detail(today);
}

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
