/* ================= MSworkN: textos da interface, arte dos contatos e elenco ================= */
// Um personagem novo = um castAdd() aqui (identidade, rotina, gostos, foto, busto) + conversas em 45-social-conversas.js.

LANGS.pt.ui.msn = {
  app: 'MSworkN', exe: 'MSWORKN.EXE', tagline: 'o mensageiro do escritório',
  status: { online: 'Online', busy: 'Ocupado', away: 'Ausente', dnd: 'Não perturbe', invisible: 'Invisível', offline: 'Offline' },
  psmPh: 'Escreva uma mensagem pessoal', groups: { req: 'Solicitações', work: 'Colegas de trabalho', friends: 'Amigos', other: 'Outros contatos' },
  pick: 'Escolha um contato para conversar.', empty: 'Ninguém por aqui ainda. Os colegas aparecem conforme a carreira anda.',
  send: 'Enviar', composePh: 'Digite uma mensagem…', composeOff: 'Escolha uma resposta acima ou escreva algo parecido.', typing: n => `${n} está digitando…`,
  topics: 'Puxar assunto', call: 'Chamada de vídeo', nudge: 'Cutucar', info: 'Perfil', back: 'Contatos', close: 'Fechar',
  reqTitle: n => `${n} quer adicionar você`, reqBy: n => `Indicação de ${n}`, accept: 'Aceitar', decline: 'Agora não', newReq: 'Nova solicitação de contato',
  online: n => `${n} está online`, unread: n => n === 1 ? '1 mensagem nova' : `${n} mensagens novas`, offHint: 'Fora do expediente. A mensagem fica guardada até a pessoa voltar.',
  bond: { cold: 'Distante', rival: 'Rivalidade', frenemy: 'Rival amigável', confidant: 'Confidente', friend: 'Amizade', bestie: 'Melhor amizade', colleague: 'Colega', acquaintance: 'Conhecido(a)' },
  meters: { aff: 'Afinidade', trust: 'Confiança', fam: 'Familiaridade', riv: 'Rivalidade' }, mem: 'Lembra de', noMem: 'Nada marcante ainda.',
  bio: 'Sobre', likes: 'Assuntos favoritos', since: d => `Contato desde o dia ${d}`, dayN: d => `Dia ${d} · ${gameDateOf(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`, evening: 'noite',
  callBusy: n => `${n} recusou: está ocupado(a) agora.`, callOff: n => `${n} não está disponível para chamadas.`, callWork: 'Chamadas só fora do expediente ou no intervalo.',
  camOff: 'Câmera desligada', missed: 'Chamada perdida', callDone: 'Chamada encerrada', calling: 'Chamando…',
  quietNote: n => `MSworkN: ${n === 1 ? '1 mensagem nova' : n + ' mensagens novas'}`,
  pmsg: { lunch: 'almoçando', meeting: 'em reunião', coffee: 'na copa', closing: 'fechamento do dia', gym: 'academia rápida', sleeping: 'dormindo', painting: 'pintando', raid: 'em uma raid', overtime: 'hora extra', baking: 'no forno', away: 'fora' },
  sys: { added: n => `${n} agora é seu contato.`, nudgeOut: n => `Você cutucou ${n}.`, nudgeIn: n => `${n} cutucou você!`, callLog: (k, n) => k === 'missed' ? `Chamada perdida de ${n}` : k === 'declined' ? 'Você recusou a chamada' : 'Chamada de vídeo encerrada' },
};
LANGS.en.ui.msn = {
  app: 'MSworkN', exe: 'MSWORKN.EXE', tagline: 'the office messenger',
  status: { online: 'Online', busy: 'Busy', away: 'Away', dnd: 'Do not disturb', invisible: 'Invisible', offline: 'Offline' },
  psmPh: 'Type a personal message', groups: { req: 'Requests', work: 'Coworkers', friends: 'Friends', other: 'Other contacts' },
  pick: 'Pick a contact to chat with.', empty: 'Nobody here yet. Coworkers show up as your career moves along.',
  send: 'Send', composePh: 'Type a message…', composeOff: 'Pick a reply above or write something similar.', typing: n => `${n} is typing…`,
  topics: 'Start a topic', call: 'Video call', nudge: 'Nudge', info: 'Profile', back: 'Contacts', close: 'Close',
  reqTitle: n => `${n} wants to add you`, reqBy: n => `Introduced by ${n}`, accept: 'Accept', decline: 'Not now', newReq: 'New contact request',
  online: n => `${n} is online`, unread: n => n === 1 ? '1 new message' : `${n} new messages`, offHint: 'After hours. The message waits until they are back.',
  bond: { cold: 'Distant', rival: 'Rivalry', frenemy: 'Friendly rival', confidant: 'Confidant', friend: 'Friendship', bestie: 'Best friends', colleague: 'Coworker', acquaintance: 'Acquaintance' },
  meters: { aff: 'Affinity', trust: 'Trust', fam: 'Familiarity', riv: 'Rivalry' }, mem: 'Remembers', noMem: 'Nothing memorable yet.',
  bio: 'About', likes: 'Favorite topics', since: d => `Contact since day ${d}`, dayN: d => `Day ${d} · ${gameDateOf(d).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' })}`, evening: 'evening',
  callBusy: n => `${n} declined: busy right now.`, callOff: n => `${n} is not available for calls.`, callWork: 'Calls only after hours or during your break.',
  camOff: 'Camera off', missed: 'Missed call', callDone: 'Call ended', calling: 'Calling…',
  quietNote: n => `MSworkN: ${n === 1 ? '1 new message' : n + ' new messages'}`,
  pmsg: { lunch: 'at lunch', meeting: 'in a meeting', coffee: 'in the break room', closing: 'end-of-day closing', gym: 'quick gym run', sleeping: 'sleeping', painting: 'painting', raid: 'in a raid', overtime: 'overtime', baking: 'at the oven', away: 'away' },
  sys: { added: n => `${n} is now your contact.`, nudgeOut: n => `You nudged ${n}.`, nudgeIn: n => `${n} nudged you!`, callLog: (k, n) => k === 'missed' ? `Missed call from ${n}` : k === 'declined' ? 'You declined the call' : 'Video call ended' },
};
LANGS.es.ui.msn = {
  app: 'MSworkN', exe: 'MSWORKN.EXE', tagline: 'el mensajero de la oficina',
  status: { online: 'En línea', busy: 'Ocupado', away: 'Ausente', dnd: 'No molestar', invisible: 'Invisible', offline: 'Desconectado' },
  psmPh: 'Escribe un mensaje personal', groups: { req: 'Solicitudes', work: 'Compañeros de trabajo', friends: 'Amigos', other: 'Otros contactos' },
  pick: 'Elige un contacto para conversar.', empty: 'Aún no hay nadie. Los compañeros aparecen a medida que avanza la carrera.',
  send: 'Enviar', composePh: 'Escribe un mensaje…', composeOff: 'Elige una respuesta arriba o escribe algo parecido.', typing: n => `${n} está escribiendo…`,
  topics: 'Sacar un tema', call: 'Videollamada', nudge: 'Zumbido', info: 'Perfil', back: 'Contactos', close: 'Cerrar',
  reqTitle: n => `${n} quiere agregarte`, reqBy: n => `Recomendación de ${n}`, accept: 'Aceptar', decline: 'Ahora no', newReq: 'Nueva solicitud de contacto',
  online: n => `${n} está en línea`, unread: n => n === 1 ? '1 mensaje nuevo' : `${n} mensajes nuevos`, offHint: 'Fuera de horario. El mensaje queda guardado hasta que vuelva.',
  bond: { cold: 'Distante', rival: 'Rivalidad', frenemy: 'Rival amistoso', confidant: 'Confidente', friend: 'Amistad', bestie: 'Mejor amistad', colleague: 'Compañero(a)', acquaintance: 'Conocido(a)' },
  meters: { aff: 'Afinidad', trust: 'Confianza', fam: 'Familiaridad', riv: 'Rivalidad' }, mem: 'Recuerda', noMem: 'Nada memorable todavía.',
  bio: 'Sobre', likes: 'Temas favoritos', since: d => `Contacto desde el día ${d}`, dayN: d => `Día ${d} · ${gameDateOf(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`, evening: 'noche',
  callBusy: n => `${n} rechazó: está ocupado(a) ahora.`, callOff: n => `${n} no está disponible para llamadas.`, callWork: 'Llamadas solo fuera de horario o en el descanso.',
  camOff: 'Cámara apagada', missed: 'Llamada perdida', callDone: 'Llamada finalizada', calling: 'Llamando…',
  quietNote: n => `MSworkN: ${n === 1 ? '1 mensaje nuevo' : n + ' mensajes nuevos'}`,
  pmsg: { lunch: 'almorzando', meeting: 'en reunión', coffee: 'en la cocina', closing: 'cierre del día', gym: 'gimnasio exprés', sleeping: 'durmiendo', painting: 'pintando', raid: 'en una raid', overtime: 'horas extra', baking: 'en el horno', away: 'fuera' },
  sys: { added: n => `${n} ahora es tu contacto.`, nudgeOut: n => `Le enviaste un zumbido a ${n}.`, nudgeIn: n => `¡${n} te envió un zumbido!`, callLog: (k, n) => k === 'missed' ? `Llamada perdida de ${n}` : k === 'declined' ? 'Rechazaste la llamada' : 'Videollamada finalizada' },
};

/* ---------- ícone do aplicativo (12×12): dois balões de conversa, laranja do RH e verde da tela ---------- */
APP_ICO.msn = ['.kkkkkk.....', 'kOOOOOOk....', 'kOWOWOOk....', 'kOOOOOOkkkk.', '.kOkkkkvvvvk', '.kkkvVvvvvvk', '...kvWvWvWVk', '...kvvvvvVVk', '....kkkkVkk.', '.......kVk..', '.......kk...', '............'];

/* ---------- fotos de perfil (16×16): podem ser qualquer coisa — bicho, objeto, símbolo ou rosto ---------- */
const MSN_PICS = {
  duda: { rows: ['XXXXXXXXXXXXXXXX', 'XXXXkXXXXXXkXXXX', 'XXXXXkXXXXkXXXXX', 'XXXXXXkkkkXXXXXX', 'XXXXXk6666kXXXXX', 'XXXXk6+66+6kXXXX', 'XkXXkkkkkkkkXXkX', 'XXkkIIIkkIIIkkXX',
    'XXXkIiIkkIiIkXXX', 'XkkkIIIkkIIIkkkX', 'XXXkIIIkkI6IkXXX', 'XXkkI6IkkI66kkXX', 'XkXXkI6kk66kXXkX', 'XXXXXkkkkkkXXXXX', 'XVVXXXVXXVVVXXVX', 'XXXXXXXXXXXXXXXX'] },
  bia: { rows: ['ooookkkkkkkkoooo', 'oookHHhHHHhHkooo', 'ookHhHHHHhHHHkoo', 'okHHHHHHHHHHHHko', 'okHHssssssSHHHko', 'okHsssssssSSHHko', 'kHHskksssskkSHHk', 'kHHsssssssssSHHk',
    'kHYsssss5sssSYHk', 'okYsskssssksSYko', 'okYsssk++kssSYko', 'ookYssskkkssSkoo', 'oookSSsssssSkooo', 'ooookkSSSSkkoooo', 'ooOOkccccccOOooo', 'oOOkccWWWWcckOOo'],
    pal: { s: '#a8714a', S: '#8a5634', 5: '#6a3f24', h: '#7a4a30', H: '#432516', c: '#c25f3b' } },
  otavio: { rows: ['wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww', 'wwwwwkkkkkkwwwww', 'wwwkk11y1111kkww', 'wwk11y11y11112kw', 'wk11y11y11y1122k', 'wk2112112112223k',
    'wk2222222223333k', 'wwk33333333333kw', 'wwwkkkkkkkkkkkww', 'RWRWRWRWRWRWRWRW', 'WRWRWRWRWRWRWRWR', 'RWRWRWRWRWRWRWRW', 'pppppppppppppppp', 'PPPPPPPPPPPPPPPP'] },
  helena: { rows: ['7777777777777l77', '7777777777777777', '777kkk7kk7kkk777', '777kWkkWwkkwk777', '777kWWWWwwwwk777', '7777kkkkkkkk7777', '7777kWWWwwwk7777', '7777kWWkkwwk7777',
    '7777kWWkkwwk7777', '7777kWWWwwwk7777', '7777kWWWwwwk7777', '777kkkkkkkkkk777', '777kWWWWwwwwk777', '77kkkkkkkkkkkk77', '77kWWWWWwwwwwk77', '77kkkkkkkkkkkk77'] },
  rafa: { rows: ['RRRRRRRRRRRRRRRR', 'RRRkkkkkkkkkkR+R', 'RkkkyyYYYYYzkkkR', 'RkRkyYYkkYYzkRkR', 'RkRkyYYYkYYzkRkR', 'RRkkyYYYkYYzkkRR', 'RRRkzYYYkYYzkRRR', 'RRRRkzYkkkzkRRRR',
    'RRRRRkzzzzkRRRRR', 'RRRRRRkzzkRRRRRR', 'RRRRRRkYzkRRRRRR', 'RRRRRkkkkkkRRRRR', 'RRRRk433334kRRRR', 'RRRRkkkkkkkkRRRR', 'qqqqqqqqqqqqqqqq', 'qqqqqqqqqqqqqqqq'] },
  lu: { rows: ['vvvvvvvvvvvvvvvv', 'vvkkvvvvvvvvkkvv', 'vk8kkvvvvvvkk8kv', 'vk8OOkkkkkkOO8kv', 'vkOOO8O88O8OOOkv', 'kOOOOO8OO8OOOOOk', 'kOOkkkOOOOkkkOOk', 'kOkYdkOOOOkdYkOk',
    'kOkkkkOooOkkkkOk', 'kooOOOOrrOOOOook', 'kWooOOkOOkOOooWk', 'vkWWoOOkkOOoWWkv', 'vvkkWWWWWWWWkkvv', 'vVVVkkkkkkkkVVVv', 'VVRVVVVVVVVVVQVV', 'VVVVVVVVVVVVVVVV'] },
  unknown: { rows: ['mmmmmmmmmmmmmmmm', 'mmmmmmmmmmmmmmmm', 'mmmmmmkkkkmmmmmm', 'mmmmmkMMMMkmmmmm', 'mmmmkMMMMMMkmmmm', 'mmmmkMMMMMMkmmmm', 'mmmmkMMMMMMkmmmm', 'mmmmmkMMMMkmmmmm',
    'mmmmmmkMMkmmmmmm', 'mmmmkkkMMkkkmmmm', 'mmmkMMMMMMMMkmmm', 'mmkMMMMMMMMMMkmm', 'mmkMMMMMMMMMMkmm', 'mkMMMMMMMMMMMMkm', 'mkMMMMMMMMMMMMkm', 'mkMMMMMMMMMMMMkm'] },
};
function msnPicEl(id, scale = 2) { const p = MSN_PICS[id] || MSN_PICS.unknown; return Pixel.el(p.rows, scale, p.pal); }

/* ---------- busto para a câmera (24×26): gerado em camadas, com expressões, piscadas, boca e gestos ---------- */
// Regras de pixel art do projeto: escala inteira, luz de cima à esquerda (rampas de 4 tons), contorno seletivo
// (tom mais escuro do material no lado iluminado, tinta no lado da sombra), nada de rotação: cabeça só desloca 1 px.
// Letras próprias do busto (trocadas pela paleta do personagem): pele s S 5 u · cabelo h H n N · roupa c C e E ·
// acessório a A b B · camisa W w p P · boca m · íris i.
const BUST_W = 24, BUST_H = 26;
const BUST_EYES = { open: ['+kk', 'kkk'], blink: ['...', 'kkk'], happy: ['.k.', 'k.k'], half: ['555', 'kkk'], wide: ['+kk', 'kkk'] };
const BUST_BROWS = { normal: [0, 0, 0], up: [-1, -1, -1], angry: [-1, 0, 1], sad: [1, 0, -1], skeptic: [0, 0, 0] };
const BUST_MOUTH = { shut: ['.KK.', '....'], talk: ['.mm.', '.mm.'], smile: ['K..K', '.KK.'], grin: ['m++m', '.mm.'], frown: ['.KK.', 'K..K'], wow: ['.mm.', '.mm.'], smirk: ['...K', 'KKK.'], flat: ['KKKK', '....'] };
const BUST_MOODS = { neutral: ['open', 'normal', 'shut'], smile: ['open', 'normal', 'smile'], happy: ['happy', 'up', 'grin'], sad: ['open', 'sad', 'frown'],
  annoyed: ['half', 'angry', 'flat'], angry: ['open', 'angry', 'frown'], wow: ['wide', 'up', 'wow'], smug: ['half', 'normal', 'smirk'], skeptic: ['half', 'skeptic', 'flat'], shy: ['half', 'sad', 'smile'], think: ['open', 'skeptic', 'flat'] };
// gestos (posição absoluta; braço em tecido, mão em pele, contorno próprio para passar por cima do rosto)
const BUST_GEST = {
  wave:  [18, 7, ['.k.k..', 'ksksk.', 'kssssk', 'kssssk', '.kSSk.', '.kcCk.', '.kcCk.', '.kCek.', '.kCek.', '.kCek.', '.kCek.', 'kCCek.']],
  thumb: [14, 15, ['..k...', '.ksk..', '.ksk..', 'ksssk.', 'ksSSk.', 'kSSSk.', '.kkkk.', 'kCCCek', 'kCCCek']],
  chin:  [8, 16, ['.kkkkkk.', 'kssssSSk', 'kSSSSS5k', '.kkkkkk.', '..kCek..', '..kCek..', '.kCCek..']],
  shrug: [0, 15, ['.kk..................kk.', 'ksSk................ksSk', 'kSSk................kSSk', '.kCk................kCk.', '.kCek..............kCek.']],
  face:  [6, 8, ['.kkkkkkk..', 'kssssssSk.', 'ksssssSS5k', 'kSSSSS55k.', '.kkkkkkk..', '...kCek...', '...kCek...', '...kCek...', '..kCCek...', '..kCCek...', '..kCCek...', '.kCCCek...']],
};
function bustRows(sp, st = {}) {
  const W = BUST_W, H = BUST_H, G = Array.from({ length: H }, () => Array(W).fill('.'));
  const dx = st.dx || 0, dy = st.dy || 0;
  const abs = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H && c && c !== '.') G[y][x] = c; };
  const put = (x, y, c) => abs(x + dx, y + dy, c);
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? G[y][x] : '.';
  const tone = (r, v) => v < -.55 ? r[0] : v < .3 ? r[1] : v < .8 ? r[2] : r[3];
  const sh = (r, x, y, cx, cy, rx, ry) => tone(r, (x + .5 - cx) / rx * .55 + (y + .5 - cy) / ry * .75);
  const ell = (cx, cy, rx, ry, fn) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) { const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2; if (d < 1) fn(x, y, d); } };
  const stamp = (rows, x0, y0, fn = abs) => rows.forEach((r, j) => [...r].forEach((c, i) => fn(x0 + i, y0 + j, c)));
  const SK = ['s', 'S', '5', 'u'], HR = ['h', 'H', 'n', 'N'], CL = ['c', 'C', 'e', 'E'], AC = ['a', 'A', 'b', 'B'];
  const T = { put, abs, at, ell, sh, stamp, SK, HR, CL, AC, st };
  // tronco e ombros (não acompanham a cabeça)
  const b = { slim: [3.6, 1.9, 10.5], mid: [4, 2.2, 11.5], broad: [4.6, 2.6, 12] }[sp.build || 'mid'];
  for (let y = 19; y < H; y++) { const half = Math.min(b[2], b[0] + (y - 19) * b[1]); for (let x = Math.ceil(12 - half); x < 12 + half; x++) abs(x, y, sh(CL, x, y, 12, 19, 10, 8)); }
  if (sp.outfit) sp.outfit(T);
  // cabelo de trás, pescoço, cabeça e orelhas
  if (sp.back) sp.back(T);
  if (!sp.noNeck) for (let y = 16; y < 21; y++) for (let x = 9; x < 15; x++) abs(x, y, y < 18 ? '5' : x > 12 ? '5' : 'S');
  if (sp.collar) sp.collar(T);
  const rx = sp.rx || 7, ry = sp.ry || 8, jaw = sp.jaw || 2.4, cx = 12, cy = 11;
  for (let y = cy - ry - 1; y <= cy + ry; y++) for (let x = 3; x < 21; x++) {
    const yy = y + .5 - cy, er = yy > 2 ? rx * (1 - (yy - 2) / (ry * jaw)) : rx;
    if (((x + .5 - cx) / er) ** 2 + (yy / ry) ** 2 < 1) put(x, y, sh(SK, x, y, cx - 1.5, cy - 2.5, rx, ry));
  }
  put(4, 11, 'S'); put(4, 12, '5'); put(19, 11, '5'); put(19, 12, 'u');
  // rosto: olhos, sobrancelhas, nariz, boca, rubor
  const ey = 11 + (sp.eyeY || 0), eyes = BUST_EYES[st.eyes] || BUST_EYES.open;
  stamp(eyes, 7, ey, put); stamp(eyes, 14, ey, put);
  const bo = BUST_BROWS[st.brows] || BUST_BROWS.normal, bc = sp.brow || 'N', by = ey - 2 + (st.eyes === 'wide' ? -1 : 0);
  for (let i = 0; i < 3; i++) { put(7 + i, by + bo[i], bc); put(16 - i, by + (st.brows === 'skeptic' ? (i === 0 ? -1 : 0) : bo[i]), bc); }
  put(12, 13, '5'); put(12, 14, '5');
  if (st.blush) { put(7, 14, 't'); put(8, 14, 't'); put(15, 14, 't'); put(16, 14, 't'); }
  stamp(BUST_MOUTH[st.mouth] || BUST_MOUTH.shut, 10, 15 + (sp.mouthY || 0), put);
  if (sp.front) sp.front(T);
  // contorno interno: borda de baixo do cabelo sobre a pele
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W; x++) if ('hHn'.includes(G[y][x]) && 'sS5u'.includes(at(x, y + 1)) && !sp.noHairEdge) G[y][x] = 'N';
  if (sp.extra) sp.extra(T);
  const g = st.gest && BUST_GEST[st.gest]; if (g) stamp(g[2], g[0], g[1]);
  // contorno seletivo: lado iluminado (cima/esquerda) no tom mais escuro do material; sombra (baixo/direita) em tinta
  const deep = c => 'sS5u'.includes(c) ? 'u' : 'hHnN'.includes(c) ? 'N' : 'cCeE'.includes(c) ? 'E' : 'aAbB'.includes(c) ? 'B' : 'k';
  const out = G.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (G[y][x] !== '.') continue;
    const r = at(x + 1, y), d = at(x, y + 1), l = at(x - 1, y), u = at(x, y - 1);
    if (r !== '.' && r !== 'k') out[y][x] = sp.selout === false ? 'k' : deep(r);
    else if (d !== '.' && d !== 'k') out[y][x] = sp.selout === false ? 'k' : deep(d);
    else if ((l !== '.' && l !== 'k') || (u !== '.' && u !== 'k')) out[y][x] = 'k';
  }
  return out.map(r => r.join(''));
}
function bustPal(sp) {
  const sk = AV_RAMPS.skin[sp.skin] || AV_RAMPS.skin[1], hr = Array.isArray(sp.hair) ? sp.hair : AV_RAMPS.hair[sp.hair] || AV_RAMPS.hair.castanho;
  const cl = Array.isArray(sp.cloth) ? sp.cloth : AV_RAMPS.cloth[sp.cloth] || AV_RAMPS.cloth.azul, ac = Array.isArray(sp.acc) ? sp.acc : AV_RAMPS.cloth[sp.acc] || AV_RAMPS.cloth.vermelho;
  return { s: sk[0], S: sk[1], 5: sk[2], u: sk[3], h: hr[0], H: hr[1], n: hr[2], N: hr[3], c: cl[0], C: cl[1], e: cl[2], E: cl[3], a: ac[0], A: ac[1], b: ac[2], B: ac[3], m: WD_PAL.q, i: sp.eye || WD_PAL.k, ...(sp.pal || {}) };
}
// rampas extras montadas só com cores da paleta
const RAMP_CORAL = ['#ffd0b0', '#f0915f', '#c25f3b', '#a24a33'], RAMP_MUSGO = ['#b8d98a', '#7fb35a', '#4f8440', '#2f5a33'], RAMP_DENIM = ['#c3d5ff', '#6f93d9', '#44609f', '#2b3f6e'];

// Roupas reaproveitáveis
const OUTFIT = {
  blazer: tie => T => { for (let y = 19; y < 26; y++) { const w = Math.max(0, 3 - Math.floor((y - 19) / 2)); for (let x = 12 - w - 1; x < 12 + w + 1; x++) T.abs(x, y, x === 12 - w - 1 || x === 12 + w ? 'e' : y === 19 ? 'w' : 'W'); }
    for (let y = 20; y < 26; y++) { T.abs(8 - Math.floor((y - 20) / 3), y, 'e'); T.abs(15 + Math.floor((y - 20) / 3), y, 'E'); }
    if (tie) for (let y = 20; y < 26; y++) { T.abs(11, y, y === 20 ? 'a' : 'A'); T.abs(12, y, y === 20 ? 'A' : 'b'); } },
  vest: T => { for (let y = 20; y < 26; y++) for (let x = 4; x < 20; x++) { const v = Math.abs(x + .5 - 12); if (v > 2.5 - (y - 20) * -.0 && v < 7.5 + (y - 20) * .6 && !(v < 3.6 - (y - 20) * .6)) T.abs(x, y, T.sh(T.AC, x, y, 12, 19, 8, 8)); }
    for (let y = 19; y < 23; y++) for (let x = 10; x < 14; x++) T.abs(x, y, y === 19 ? 'c' : 'C'); for (let y = 20; y < 26; y++) { T.abs(11, y, '3'); T.abs(12, y, y > 22 ? '4' : '3'); } },
  turtle: T => { for (let y = 16; y < 21; y++) for (let x = 9; x < 15; x++) T.abs(x, y, (x + y) % 2 ? 'C' : 'e'); },
  hoodie: T => { for (let x = 6; x < 18; x++) T.abs(x, 19, x < 9 || x > 14 ? 'e' : 'E'); T.abs(10, 21, 'W'); T.abs(10, 22, 'W'); T.abs(13, 21, 'W'); T.abs(13, 23, 'W'); },
  jacket: T => { for (let y = 19; y < 26; y++) for (let x = 9; x < 15; x++) T.abs(x, y, T.sh(T.AC, x, y, 10, 19, 4, 6));
    for (let y = 19; y < 26; y++) { T.abs(8, y, 'e'); T.abs(15, y, 'E'); } T.abs(6, 22, 'R'); T.abs(17, 23, 'Y'); T.abs(17, 22, 'z'); T.abs(11, 23, 'Q'); T.abs(13, 24, 'L'); },
  shirt: T => { for (let x = 9; x < 15; x++) T.abs(x, 19, 'c'); T.abs(10, 20, 'c'); T.abs(13, 20, 'c'); T.abs(12, 22, 'e'); T.abs(12, 24, 'e'); },
};

/* ---------- elenco ---------- */
const L3 = (pt, en, es) => [pt, en, es];
castAdd({
  id: 'duda', name: 'Duda', role: L3('Suporte de TI', 'IT Support', 'Soporte de TI'), sector: 'ti', group: 'work', scope: 'work', firstMsg: 'duda_hello',
  likes: { joke: 1, tease: 1, gossip: 0, formal: -1, kind: 0, honest: 1, distant: -1, nudge: 1 }, open: 1.2, speed: 1.4, cam: 'on', dudaFace: true,
  blocks: [[180, 235, 'busy', 'raid']], off: ctx => SOC && SOC.pre ? 'online' : socHash('duda-off', ctx.day) < .65 ? 'online' : 'away',
  bio: L3('Cuida dos computadores, do servidor e de um servidor de jogos que oficialmente não existe. Ruivo, de óculos e headset, responde chamado com meme.',
    'Looks after the computers, the server and a game server that officially does not exist. Red hair, glasses, headset; answers tickets with memes.',
    'Cuida de las computadoras, del servidor y de un servidor de juegos que oficialmente no existe. Pelirrojo, con gafas y auriculares; responde tickets con memes.'),
  interests: L3('jogos antigos · recordes · cabos bem organizados · pizza fria', 'retro games · high scores · tidy cables · cold pizza', 'juegos retro · récords · cables ordenados · pizza fría'),
  psm: [{ t: L3('reiniciou? tenta reiniciar.', 'did you try turning it off and on?', '¿probaste reiniciar?') },
    { when: { fn: () => Rival.total().w + Rival.total().l > 0 }, t: L3('placar oficial: ver com o TI', 'official scoreboard: ask IT', 'marcador oficial: preguntar a TI') },
    { when: { ev: 'duda' }, t: L3('ANIVERSARIANTE · aceito partidas', 'BIRTHDAY BOY · accepting matches', 'CUMPLEAÑERO · acepto partidas') }],
  intents: {
    hi: [L3('salve! o servidor e eu estamos de pé. por enquanto.', 'hey! the server and I are both up. for now.', '¡buenas! el servidor y yo seguimos en pie. por ahora.'), L3('opa! fala, colega de baia.', 'yo! what\'s up, cubicle buddy.', '¡epa! dime, compa de cubículo.')],
    how: [L3('tô bem. três chamados abertos, dois são "o mouse sumiu". era a pilha.', 'good. three tickets open, two are "my mouse vanished". it was the battery.', 'bien. tres tickets abiertos, dos son "desapareció el ratón". era la pila.'), L3('tranquilo. fingindo que estou atualizando drivers.', 'chill. pretending to update drivers.', 'tranqui. fingiendo que actualizo drivers.')],
    thanks: [L3('de nada! fecha o chamado com 5 estrelas aí.', 'no problem! close the ticket with 5 stars.', '¡de nada! cierra el ticket con 5 estrellas.')],
    bye: [L3('falou! não clica em anexo estranho.', 'later! don\'t click weird attachments.', '¡nos vemos! no abras adjuntos raros.'), L3('gg, até mais.', 'gg, see ya.', 'gg, hasta luego.')],
    joke: [L3('KKKKK essa vai pro mural do TI.', 'LOL that one goes on the IT wall.', 'JAJAJA esa va al mural de TI.'), L3('ri alto e o Otávio me olhou feio.', 'laughed out loud and Otávio glared at me.', 'me reí fuerte y Otávio me miró feo.')],
    work: [L3('trabalho? conheço. de longe.', 'work? heard of it. from afar.', '¿trabajo? me suena. de lejos.'), L3('se a planilha travar, me chama. se não travar, me chama também, tô entediado.', 'if the spreadsheet freezes, ping me. if it doesn\'t, ping me anyway, I\'m bored.', 'si la planilla se cuelga, avísame. si no, avísame igual, estoy aburrido.')],
    coffee: [L3('café é só um patch de energia com bug de abstinência.', 'coffee is an energy patch with a withdrawal bug.', 'el café es un parche de energía con bug de abstinencia.')],
    game: [L3('ALGUÉM FALOU EM JOGAR? me liga fora do expediente que eu abro o servidor.', 'DID SOMEONE SAY PLAY? call me after hours and I\'ll open the server.', '¿ALGUIEN DIJO JUGAR? llámame fuera de horario y abro el servidor.')],
    sorry: [L3('relaxa, já esqueci. memória de TI é cache: limpa toda sexta.', 'relax, already forgot. IT memory is cache: cleared every friday.', 'tranqui, ya lo olvidé. la memoria de TI es caché: se borra cada viernes.')],
    nudge: [L3('AAAH tremeu tudo aqui! faz de novo. não, pera, não faz.', 'AAAH everything shook! do it again. no wait, don\'t.', '¡AAAH tembló todo! hazlo otra vez. no, espera, no.')],
    psm: [L3('vi sua mensagem pessoal. aprovado pelo TI.', 'saw your status message. IT approved.', 'vi tu mensaje personal. aprobado por TI.')],
    psmTired: [L3('"cansado(a)"? já tentou desligar e ligar de novo? eu chamo isso de dormir.', '"tired"? tried turning yourself off and on? I call it sleeping.', '¿"cansado(a)"? ¿probaste apagarte y encenderte? yo lo llamo dormir.')],
    unknown: [L3('não entendi, mas registrei como chamado de prioridade baixa.', 'didn\'t get it, but logged it as a low-priority ticket.', 'no entendí, pero lo registré como ticket de prioridad baja.'), L3('hm? tá falando em código? eu falo código. esse eu não reconheço.', 'hm? speaking in code? I speak code. not this one.', '¿hm? ¿hablas en código? yo hablo código. este no lo reconozco.')],
  },
  call: {
    greet: [L3('E aí! Liguei a câmera, o cabelo não colaborou.', 'Hey! Camera\'s on, hair is not cooperating.', '¡Ey! Encendí la cámara, el pelo no coopera.')],
    talk: [[L3('Sabe o que eu fiz hoje? Organizei os cabos por cor.', 'Guess what I did today? Sorted the cables by color.', '¿Sabes qué hice hoy? Ordené los cables por color.'), L3('Artista', 'Artist', 'Artista'), L3('Por quê?', 'Why?', '¿Por qué?'),
      L3('Finalmente alguém reconhece.', 'Finally someone gets it.', 'Por fin alguien lo reconoce.'), L3('Porque alguém tinha que fazer. E porque o servidor caiu e eu precisava parecer ocupado.', 'Because someone had to. And because the server was down and I needed to look busy.', 'Porque alguien tenía que hacerlo. Y porque el servidor se cayó y necesitaba parecer ocupado.')]],
    bye: [L3('Valeu! Se o chefe perguntar, era suporte remoto.', 'Thanks! If the boss asks, it was remote support.', '¡Gracias! Si el jefe pregunta, era soporte remoto.')],
  },
});
castAdd({
  id: 'bia', name: 'Bia Torres', role: L3('Analista de RH', 'HR Analyst', 'Analista de RR. HH.'), sector: 'rh', group: 'work', scope: 'work',
  unlock: { when: { career: true, day: 1, fn: () => !SOC.pre } }, reqNote: L3('Oi! Sou a Bia, do RH. Te adiciono pra você não se perder por aqui :)', 'Hi! I\'m Bia from HR. Adding you so you don\'t get lost around here :)', '¡Hola! Soy Bia, de RR. HH. Te agrego para que no te pierdas por aquí :)'),
  likes: { kind: 2, joke: 1, gossip: 1, honest: 1, formal: 0, tease: -1, distant: -2, nudge: 0, ambitious: 0 }, open: 1, speed: 1.3, meeting: true, cam: 'on',
  blocks: [[180, 240, 'away', 'lunch']], off: 'offline',
  bio: L3('Organiza a integração, os aniversários, o amigo secreto e a festa de fim de ciclo — quase sempre sem verba. Sabe de tudo que acontece no prédio, mas o que é sigilo do RH morre com ela.',
    'Runs onboarding, birthdays, Secret Santa and the end-of-cycle party — almost always with no budget. Knows everything that happens in the building, but HR secrets die with her.',
    'Organiza la integración, los cumpleaños, el amigo invisible y la fiesta de fin de ciclo — casi siempre sin presupuesto. Sabe todo lo que pasa en el edificio, pero los secretos de RR. HH. mueren con ella.'),
  interests: L3('festas · planilhas coloridas · fofoca leve · karaokê', 'parties · color-coded spreadsheets · harmless gossip · karaoke', 'fiestas · planillas de colores · chismes inofensivos · karaoke'),
  bust: { skin: 5, hair: 'escuro', cloth: RAMP_CORAL, acc: 'amarelo', build: 'mid', rx: 7.2, ry: 7.8, outfit: OUTFIT.blazer(false),
    back: T => T.ell(12, 8.5, 10.6, 9.2, (x, y, d) => { if (y > 17 || (d > .8 && (x * 5 + y * 3) % 4 === 0)) return; T.put(x, y, (x * 7 + y * 5) % 11 === 0 ? 'h' : T.sh(T.HR, x, y, 8, 4, 10, 9)); }),
    front: T => { for (let x = 5; x < 19; x++) { const top = 3 + ((x * 3) % 4 === 0 ? 2 : (x % 3 === 0 ? 1 : 0)) + (x > 6 && x < 17 ? 1 : 2); for (let y = 2; y < top; y++) T.put(x, y, (x + y) % 5 === 0 ? 'h' : T.sh(T.HR, x, y, 8, 2, 8, 5)); } },
    extra: T => { T.put(4, 14, 'Y'); T.put(3, 15, 'Y'); T.put(4, 16, 'z'); T.put(19, 14, 'Y'); T.put(20, 15, 'z'); T.put(19, 16, 'z'); } },
  mood: 'smile', psm: [{ t: L3('integração amanhã: sorria!', 'onboarding tomorrow: smile!', 'integración mañana: ¡sonríe!') }, { when: { ev: ['chefe'] }, t: L3('assinem o cartão!!!', 'sign the card!!!', '¡¡¡firmen la tarjeta!!!') },
    { when: { ev: 'amigo' }, t: L3('amigo secreto: valor sugerido é sugestão', 'secret santa: suggested price is a suggestion', 'amigo invisible: el precio sugerido es sugerencia') },
    { when: { arc: { bia: [1, 2] } }, t: L3('orçamento da festa: R$ 0,00 :)', 'party budget: $0.00 :)', 'presupuesto de la fiesta: $0,00 :)') }, { when: { ev: 'festa' }, t: L3('FESTA HOJE!', 'PARTY TODAY!', 'FIESTA HOY!') }],
  intents: {
    hi: [L3('Oiii! Tudo certo por aí?', 'Hiii! All good over there?', '¡Holaaa! ¿Todo bien por ahí?'), L3('Oi, oi! Passou na copa hoje? Tem bolo de ontem.', 'Hi hi! Stopped by the break room? There\'s yesterday\'s cake.', '¡Hola, hola! ¿Pasaste por la cocina? Hay pastel de ayer.')],
    how: [L3('Correndo, como sempre! Mas feliz. Quase sempre.', 'Running around as usual! But happy. Mostly.', '¡Corriendo, como siempre! Pero feliz. Casi siempre.'), L3('Bem! Três crachás pra imprimir e uma impressora com personalidade.', 'Good! Three badges to print and a printer with a personality.', '¡Bien! Tres credenciales por imprimir y una impresora con personalidad.')],
    thanks: [L3('Imagina! RH também é gente :)', 'Don\'t mention it! HR are people too :)', '¡Nada! RR. HH. también es gente :)')],
    bye: [L3('Beijo! Bebe água!', 'Bye! Drink water!', '¡Besos! ¡Toma agua!'), L3('Tchau! Qualquer coisa, tô aqui.', 'Bye! Anything, I\'m here.', '¡Chau! Cualquier cosa, aquí estoy.')],
    joke: [L3('KKKK para, tô na frente do diretor!', 'LOL stop, I\'m in front of the director!', '¡JAJA para, estoy frente al director!')],
    work: [L3('Se estiver pesado, fala comigo. Não prometo milagre, prometo planilha.', 'If it\'s too much, talk to me. No miracles, but I promise a spreadsheet.', 'Si está pesado, háblame. No prometo milagros, prometo una planilla.')],
    coffee: [L3('O café da copa é por conta da casa. A casa reclama, mas paga.', 'Break room coffee is on the house. The house complains, but pays.', 'El café de la cocina corre por cuenta de la casa. La casa se queja, pero paga.')],
    sorry: [L3('Tá tudo bem, sério. Obrigada por falar.', 'It\'s fine, really. Thanks for saying it.', 'Está todo bien, en serio. Gracias por decirlo.')],
    nudge: [L3('Ei! Tô aqui, tô aqui :)', 'Hey! I\'m here, I\'m here :)', '¡Ey! ¡Aquí estoy, aquí estoy! :)')],
    psm: [L3('Amei sua mensagem pessoal! Vou roubar.', 'Love your status message! Stealing it.', '¡Me encantó tu mensaje personal! Te lo robo.')],
    psmTired: [L3('Vi seu status… tá tudo bem mesmo? Descansa, viu.', 'Saw your status… are you really ok? Get some rest.', 'Vi tu estado… ¿de verdad estás bien? Descansa, eh.')],
    psmHappy: [L3('Que status feliz! Isso que eu gosto de ver.', 'What a happy status! Love to see it.', '¡Qué estado tan feliz! Así me gusta.')],
    unknown: [L3('Hmm, não entendi direito… mas tô aqui se precisar!', 'Hmm, didn\'t quite get that… but I\'m here if you need!', 'Mmm, no entendí bien… ¡pero aquí estoy si necesitas!'), L3('Haha, oi? Explica de novo, tô em três conversas.', 'Haha, what? Say it again, I\'m in three chats.', 'Jaja, ¿qué? Explícalo otra vez, estoy en tres chats.')],
  },
  call: {
    greet: [L3('Oi! Que bom te ver de rosto. Desculpa a parede bege.', 'Hi! Nice to see your face. Sorry about the beige wall.', '¡Hola! Qué bueno verte la cara. Perdón por la pared beige.')],
    talk: [[L3('Pergunta sincera: você tá gostando daqui?', 'Honest question: are you liking it here?', 'Pregunta sincera: ¿te está gustando estar aquí?'), L3('Tô sim', 'I am', 'Sí'), L3('Ainda não sei', 'Not sure yet', 'Todavía no sé'),
      L3('Ai, que alívio! Vou anotar na pesquisa de clima. Mentira. Ou não.', 'Phew, what a relief! I\'ll note it in the climate survey. Kidding. Or not.', '¡Ay, qué alivio! Lo anoto en la encuesta de clima. Mentira. O no.'), L3('Justo. Me fala quando souber. E se for "não", me fala antes do chefe.', 'Fair. Tell me when you know. And if it\'s a "no", tell me before the boss.', 'Justo. Avísame cuando sepas. Y si es un "no", dímelo antes que al jefe.')]],
    bye: [L3('Vou nessa, tem novato perdido no elevador. Beijo!', 'Gotta go, there\'s a new hire lost in the elevator. Bye!', 'Me voy, hay un nuevo perdido en el ascensor. ¡Besos!')],
  },
});
castAdd({
  id: 'otavio', name: 'Otávio Prado', role: L3('Analista Financeiro Sênior', 'Senior Financial Analyst', 'Analista Financiero Sénior'), sector: 'fin', group: 'work', scope: 'work',
  unlock: { when: { career: true, known: 'bia', any: [{ done: 'bia_integra' }, { day: 3 }] }, by: 'bia' },
  reqNote: L3('A Bia insistiu que eu adicionasse "os novos". Estou adicionando. Prado, Financeiro.', 'Bia insisted I add "the new people". I am adding. Prado, Finance.', 'Bia insistió en que agregara a "los nuevos". Estoy agregando. Prado, Finanzas.'),
  likes: { honest: 2, joke: 1, kind: -1, formal: 1, gossip: -1, tease: 0, distant: 0, ambitious: -1, nudge: -1 }, open: 0.7, speed: 0.8, meeting: true,
  cam: (r, ctx) => r.trust >= 3 || SOC.arc.otavio && SOC.arc.otavio.s === 'padaria',
  blocks: [[0, 30, 'away', 'coffee'], [150, 240, 'away', 'lunch'], [480, 540, 'busy', 'closing']], off: 'offline',
  bio: L3('Vinte e dois anos de Financeiro, três sistemas de reembolso enterrados e um bigode que já viu tudo. Reclama de tudo, mas nunca atrasou um pagamento.',
    'Twenty-two years in Finance, three expense systems buried and a mustache that has seen it all. Complains about everything, but never paid anyone late.',
    'Veintidós años en Finanzas, tres sistemas de reembolso enterrados y un bigote que lo ha visto todo. Se queja de todo, pero nunca pagó tarde a nadie.'),
  interests: L3('pão de fermentação natural · rádio AM · conferir notas fiscais · silêncio', 'sourdough bread · AM radio · checking receipts · silence', 'pan de masa madre · radio AM · revisar facturas · silencio'),
  bust: { skin: 1, hair: 'grisalho', cloth: 'azul', acc: RAMP_MUSGO, build: 'broad', rx: 7.4, ry: 7.6, jaw: 3, brow: 'n', outfit: OUTFIT.vest,
    front: T => { for (const [x, y] of [[4, 8], [4, 9], [4, 10], [5, 7], [5, 8], [19, 8], [19, 9], [19, 10], [18, 7], [18, 8], [4, 13], [19, 13]]) T.put(x, y, (x + y) % 2 ? 'H' : 'n');
      T.put(9, 5, 's'); T.put(10, 4, 's'); T.put(8, 6, 's');
      for (let x = 9; x < 15; x++) { T.put(x, 14, x === 9 || x === 14 ? 'n' : 'H'); } T.put(8, 15, 'n'); T.put(15, 15, 'n'); T.put(10, 14, 'h');
      for (const [a, b2] of [[6, 10], [13, 17]]) { for (let x = a; x <= b2; x++) { T.put(x, 10, 'j'); T.put(x, 13, 'j'); } T.put(a, 11, 'j'); T.put(a, 12, 'j'); T.put(b2, 11, 'j'); T.put(b2, 12, 'j'); }
      T.put(11, 11, 'j'); T.put(12, 11, 'j'); T.put(5, 11, 'j'); T.put(18, 11, 'j'); },
    apron: { c: '#fff8ec', C: '#f3e6cc', e: '#dcc6a0', E: '#b39776', a: '#fbf3e2', A: '#e9dcc2', b: '#c7b595', B: '#8f7d63' } },
  mood: 'skeptic', badMood: 'annoyed',
  psm: [{ t: L3('Reembolsa+ = Reembolsa−', 'Expensify+ = Expensify−', 'Reembolsa+ = Reembolsa−') }, { when: { arc: { otavio: [2, 3] } }, t: L3('contando os dias. não sei para quê.', 'counting the days. not sure to what.', 'contando los días. no sé para qué.') },
    { when: { arc: { otavio: 'padaria' } }, t: L3('Fermento & Prado — abre às 6h', 'Prado & Rise — opens at 6am', 'Fermento & Prado — abre a las 6') }, { when: { arc: { otavio: 'meio' } }, t: L3('sexta é dia de massa madre', 'friday is sourdough day', 'el viernes es día de masa madre') }],
  intents: {
    hi: [L3('Bom dia. Se é que existe.', 'Good morning. If such a thing exists.', 'Buenos días. Si es que existen.'), L3('Olá. Seja breve, estou conciliando.', 'Hello. Be brief, I am reconciling.', 'Hola. Sé breve, estoy conciliando.')],
    how: [L3('Como estou? O sistema caiu duas vezes e a máquina de café pediu senha. Enfim.', 'How am I? The system crashed twice and the coffee machine asked for a password. Anyway.', '¿Cómo estoy? El sistema se cayó dos veces y la cafetera pidió contraseña. En fin.'), L3('Vivo. Isso já está acima da meta do trimestre.', 'Alive. That is already above this quarter\'s target.', 'Vivo. Eso ya supera la meta del trimestre.')],
    thanks: [L3('Não há de quê. Literalmente: não há verba para quê.', 'Don\'t mention it. Literally: there is no budget for it.', 'No hay de qué. Literalmente: no hay presupuesto.')],
    bye: [L3('Até. Feche a porta ao sair. Digo, a janela.', 'Bye. Close the door on your way out. The window, I mean.', 'Adiós. Cierra la puerta al salir. La ventana, digo.')],
    joke: [L3('Hm. Isso foi engraçado. Não conte a ninguém que eu disse.', 'Hm. That was funny. Don\'t tell anyone I said so.', 'Mm. Eso fue gracioso. No le digas a nadie que lo dije.')],
    work: [L3('O trabalho em si é fácil. Difícil é o formulário para pedir permissão para trabalhar.', 'The work itself is easy. The hard part is the form requesting permission to work.', 'El trabajo en sí es fácil. Lo difícil es el formulario para pedir permiso para trabajar.')],
    coffee: [L3('O café da copa é um ativo depreciado. Como eu.', 'The break room coffee is a depreciated asset. Like me.', 'El café de la cocina es un activo depreciado. Como yo.')],
    sorry: [L3('Desculpas aceitas. Arquivadas em três vias.', 'Apology accepted. Filed in triplicate.', 'Disculpa aceptada. Archivada por triplicado.')],
    nudge: [L3('Por favor, não sacuda minha janela. Ela já sofre o suficiente.', 'Please don\'t shake my window. It suffers enough already.', 'Por favor, no sacudas mi ventana. Ya sufre bastante.')],
    psm: [L3('Li sua mensagem pessoal. Tem mais vírgulas que o meu contracheque.', 'Read your status. It has more commas than my paycheck.', 'Leí tu mensaje personal. Tiene más comas que mi nómina.')],
    psmFriday: [L3('Sexta-feira. A única entrega que nunca atrasa.', 'Friday. The only delivery that is never late.', 'Viernes. La única entrega que nunca se retrasa.')],
    unknown: [L3('Não compreendi. Mas, por experiência, a resposta é "não tem verba".', 'I did not understand. But, from experience, the answer is "no budget".', 'No entendí. Pero, por experiencia, la respuesta es "no hay presupuesto".'), L3('Pode reformular? De preferência em três vias.', 'Could you rephrase? Preferably in triplicate.', '¿Puedes reformular? De preferencia por triplicado.')],
  },
  call: {
    greet: [L3('Pois não. A ligação está sendo cobrada? Brincadeira. Ou não, nunca se sabe aqui.', 'Yes. Is this call being billed? Kidding. Or not, you never know here.', 'Diga. ¿Se está cobrando la llamada? Broma. O no, nunca se sabe aquí.')],
    talk: [[L3('Você acha que o trabalho define uma pessoa?', 'Do you think work defines a person?', '¿Crees que el trabajo define a una persona?'), L3('Não define', 'It doesn\'t', 'No la define'), L3('Um pouco', 'A little', 'Un poco'),
      L3('Concordo. Por isso eu sou, na verdade, um padeiro preso num corpo de contador.', 'Agreed. That\'s why I am, in fact, a baker trapped in an accountant\'s body.', 'De acuerdo. Por eso soy, en realidad, un panadero atrapado en el cuerpo de un contador.'), L3('Um pouco. Como fermento: pouco, mas muda a massa inteira.', 'A little. Like yeast: a bit, but it changes the whole dough.', 'Un poco. Como la levadura: poco, pero cambia toda la masa.')]],
    bye: [L3('Bom. Vou desligar antes que alguém me peça um relatório.', 'Well. I\'ll hang up before someone asks me for a report.', 'Bien. Cuelgo antes de que alguien me pida un informe.')],
  },
});
castAdd({
  id: 'helena', name: 'Helena Vaz', role: L3('Advogada Corporativa', 'Corporate Lawyer', 'Abogada Corporativa'), sector: 'jur', group: 'work', scope: 'work',
  unlock: { when: { career: true, known: 'bia', day: 4, any: [{ done: 'bia_helena' }, { day: 6 }] }, by: 'bia' },
  reqNote: L3('helena vaz, jurídico. a bia sugeriu. aceite se quiser. não é obrigatório. verifiquei.', 'helena vaz, legal. bia suggested it. accept if you want. it is not mandatory. i checked.', 'helena vaz, jurídico. bia lo sugirió. acepta si quieres. no es obligatorio. lo verifiqué.'),
  likes: { formal: 1, honest: 2, joke: 0, kind: 0, gossip: -2, tease: -1, distant: 1, pry: -2, nudge: -2 }, open: 0.5, speed: 1.1,
  cam: (r) => r.trust >= 6 && r.fam >= 5, blocks: [[0, 180, 'invisible'], [180, 225, 'away', 'lunch'], [225, 540, 'invisible']], off: 'offline',
  bio: L3('Lê contratos inteiros por diversão. Fala pouco, anota tudo e tem uma mecha branca que ninguém tem coragem de perguntar. Fica sempre invisível no MSworkN — "por princípio".',
    'Reads entire contracts for fun. Talks little, notes everything and has a white streak nobody dares to ask about. Always invisible on MSworkN — "on principle".',
    'Lee contratos enteros por diversión. Habla poco, anota todo y tiene un mechón blanco sobre el que nadie se atreve a preguntar. Siempre invisible en MSworkN — "por principio".'),
  interests: L3('xadrez por correspondência · romances policiais · cláusulas bem escritas · chá preto', 'correspondence chess · detective novels · well-written clauses · black tea', 'ajedrez por correspondencia · novelas policiales · cláusulas bien escritas · té negro'),
  bust: { skin: 3, hair: 'preto', cloth: 'grafite', acc: 'cinza', build: 'slim', rx: 6.6, ry: 8.4, jaw: 2.1, outfit: OUTFIT.turtle, noNeck: false, mouthY: 0,
    back: T => T.ell(12, 10.5, 8.6, 9.6, (x, y) => { if (y < 1 || y > 18) return; T.put(x, y, T.sh(T.HR, x, y, 9, 4, 9, 10)); }),
    front: T => { for (let y = 2; y < 7; y++) for (let x = 5; x < 19; x++) { if (x === 11 && y < 5) { T.put(x, y, 'u'); continue; } if (y > 4 && x > 7 && x < 16) continue; T.put(x, y, T.sh(T.HR, x, y, 8, 2, 8, 6)); }
      for (let y = 7; y < 18; y++) { T.put(5, y, 'n'); T.put(18, y, 'N'); if (y < 15) { T.put(6, y, 'H'); T.put(17, y, 'n'); } }
      for (const [x, y] of [[8, 2], [8, 3], [9, 3], [9, 4], [7, 4], [7, 5], [6, 6], [6, 7], [5, 8], [5, 9]]) T.put(x, y, (x + y) % 2 ? 'W' : 'w'); },
    extra: T => { T.abs(11, 22, '+'); T.abs(12, 22, 'M'); T.abs(12, 23, 'j'); } },
  mood: 'skeptic', badMood: 'annoyed',
  psm: [{ t: L3('leitura em andamento.', 'reading in progress.', 'lectura en curso.') }, { when: { arc: { helena: [1, 2] } }, t: L3('procura-se: grampeador. recompensa: nenhuma.', 'wanted: stapler. reward: none.', 'se busca: grapadora. recompensa: ninguna.') },
    { when: { arc: { helena: 'fim' } }, t: L3('caso encerrado.', 'case closed.', 'caso cerrado.') }],
  intents: {
    hi: [L3('olá.', 'hello.', 'hola.'), L3('oi. sim, estou invisível. não, isso não é um convite.', 'hi. yes, i\'m invisible. no, that is not an invitation.', 'hola. sí, estoy invisible. no, no es una invitación.')],
    how: [L3('bem, dentro dos limites contratuais.', 'fine, within contractual limits.', 'bien, dentro de los límites contractuales.'), L3('sem intercorrências relevantes.', 'no relevant incidents.', 'sin incidencias relevantes.')],
    thanks: [L3('disponha.', 'you\'re welcome.', 'a la orden.')],
    bye: [L3('até.', 'bye.', 'adiós.'), L3('encerrando.', 'closing.', 'cerrando.')],
    joke: [L3('isso foi quase engraçado. anotado.', 'that was almost funny. noted.', 'eso fue casi gracioso. anotado.')],
    work: [L3('tenho dezenove contratos e um estagiário. ambos precisam de revisão.', 'i have nineteen contracts and an intern. both need review.', 'tengo diecinueve contratos y un pasante. ambos necesitan revisión.')],
    coffee: [L3('chá. o café desta empresa não passaria numa auditoria.', 'tea. this company\'s coffee would not pass an audit.', 'té. el café de esta empresa no pasaría una auditoría.')],
    sorry: [L3('desculpas registradas. não há dano a reparar.', 'apology recorded. no damages to repair.', 'disculpa registrada. no hay daños que reparar.')],
    nudge: [L3('não faça isso de novo. falo sério. tenho jurisprudência.', 'don\'t do that again. i mean it. i have case law.', 'no lo vuelvas a hacer. lo digo en serio. tengo jurisprudencia.')],
    psm: [L3('sua mensagem pessoal é pública. considere isso.', 'your status message is public. consider that.', 'tu mensaje personal es público. tenlo en cuenta.')],
    unknown: [L3('não entendi. reformule com sujeito, verbo e objeto.', 'i didn\'t understand. rephrase with subject, verb and object.', 'no entendí. reformula con sujeto, verbo y objeto.'), L3('ambíguo. vou interpretar a seu desfavor.', 'ambiguous. i will interpret it against you.', 'ambiguo. lo interpretaré en tu contra.')],
  },
  call: {
    greet: [L3('Helena. Câmera desligada, por princípio. Pode falar.', 'Helena. Camera off, on principle. Go ahead.', 'Helena. Cámara apagada, por principio. Adelante.')],
    talk: [[L3('Você lê os termos de uso antes de aceitar?', 'Do you read the terms of use before accepting?', '¿Lees los términos de uso antes de aceptar?'), L3('Sempre', 'Always', 'Siempre'), L3('Nunca', 'Never', 'Nunca'),
      L3('Mentira. Mas é uma mentira respeitável.', 'A lie. But a respectable one.', 'Mentira. Pero una mentira respetable.'), L3('Honesto. Você cedeu os direitos da sua foto a uma lanterna de celular em 2014.', 'Honest. You gave away your photo rights to a flashlight app in 2014.', 'Honesto. Cediste los derechos de tu foto a una app de linterna en 2014.')]],
    bye: [L3('Encerrando. Bom trabalho.', 'Closing. Good work.', 'Cerrando. Buen trabajo.')],
  },
});
castAdd({
  id: 'rafa', name: 'Rafa Nogueira', role: L3('Analista de Arquivo', 'Filing Analyst', 'Analista de Archivo'), sector: null, group: 'work', scope: 'work', rival: true,
  unlock: { when: { career: true, any: [{ rank: 1 }, { day: 6 }] } },
  reqNote: L3('E AÍ, NOVATO(A)! Rafa, Arquivo Central, 3º andar. Te adicionando pra acompanhar a concorrência kkkk', 'HEY ROOKIE! Rafa, Central Filing, 3rd floor. Adding you to keep an eye on the competition lol', '¡EY, NOVATO(A)! Rafa, Archivo Central, 3er piso. Te agrego para vigilar a la competencia jaja'),
  likes: { tease: 1, ambitious: 2, joke: 1, kind: -1, honest: 0, formal: -1, distant: -1, gossip: 1, nudge: 1 }, open: 0.9, speed: 1.6, cam: 'on',
  blocks: [[200, 230, 'away', 'gym']], off: 'busy',
  bio: L3('Arquiva rápido, fala alto e sabe o placar de todo mundo. Quer a vaga de coordenador desde o primeiro dia. Por trás da pose, confere três vezes se o chefe leu o e-mail dele.',
    'Files fast, talks loud and knows everyone\'s score. Has wanted the coordinator job since day one. Behind the act, checks three times whether the boss read his e-mail.',
    'Archiva rápido, habla fuerte y sabe el marcador de todos. Quiere el puesto de coordinador desde el primer día. Detrás de la pose, revisa tres veces si el jefe leyó su correo.'),
  interests: L3('rankings · academia às 12h15 · podcasts de produtividade · futebol de quinta', 'rankings · gym at 12:15 · productivity podcasts · thursday soccer', 'rankings · gimnasio a las 12:15 · podcasts de productividad · fútbol de los jueves'),
  bust: { skin: 2, hair: 'loiro', cloth: 'branco', acc: 'vermelho', build: 'broad', rx: 7, ry: 7.8, jaw: 3.2, outfit: T => { OUTFIT.shirt(T); for (let y = 20; y < 26; y++) { T.abs(12, y, y === 20 ? 'a' : 'A'); T.abs(13, y + 1, 'b'); } },
    front: T => { const rows = [[10, 16], [8, 18], [7, 18], [5, 18], [5, 18], [5, 7]]; rows.forEach(([a, b2], y) => { for (let x = a; x <= b2; x++) T.put(x, y + (y > 3 ? 0 : 0), (x + y) % 6 === 0 ? 'h' : T.sh(T.HR, x, y, 9, 0, 8, 5)); });
      for (let y = 5; y < 11; y++) { T.put(5, y, y % 2 ? '5' : 'n'); T.put(18, y, y % 2 ? 'n' : '5'); } T.put(16, 5, 'H'); T.put(17, 5, 'H'); T.put(17, 6, 'n');
      for (const [x, y] of [[8, 17], [10, 18], [13, 18], [15, 17], [9, 16], [14, 16]]) T.put(x, y, '5'); } },
  mood: 'smug', badMood: 'annoyed',
  psm: [{ t: L3('foco · força · fichário', 'focus · force · folders', 'foco · fuerza · fichero') }, { when: { ev: 'produtividade' }, t: L3('SEMANA DA PRODUTIVIDADE: modo fera', 'PRODUCTIVITY WEEK: beast mode', 'SEMANA DE LA PRODUCTIVIDAD: modo bestia') },
    { when: { arc: { rafa: 'vaga' } }, t: L3('em breve: coordenador?', 'coming soon: coordinator?', 'próximamente: ¿coordinador?') }],
  intents: {
    hi: [L3('FALA, CAMPEÃO(Ã)! ou vice kkkk', 'HEY, CHAMP! or runner-up lol', '¡QUÉ TAL, CAMPEÓN(A)! o subcampeón jaja'), L3('e aí! já bateu a meta ou tá aquecendo?', 'hey! hit your target yet or still warming up?', '¡ey! ¿ya cumpliste la meta o sigues calentando?')],
    how: [L3('voando! arquivei 40 antes das 10. e você?', 'flying! filed 40 before 10am. you?', '¡volando! archivé 40 antes de las 10. ¿y tú?'), L3('cansado mas não conta pra ninguém. imagem é tudo.', 'tired but don\'t tell anyone. image is everything.', 'cansado pero no le digas a nadie. la imagen es todo.')],
    thanks: [L3('tmj. mas na tabela eu continuo na frente kkk', 'got you. but on the board I\'m still ahead lol', 'cuenta conmigo. pero en la tabla sigo adelante jaja')],
    bye: [L3('vou nessa, o ranking não se atualiza sozinho!', 'gotta go, the ranking won\'t update itself!', '¡me voy, el ranking no se actualiza solo!')],
    joke: [L3('KKKKKKK ok essa foi boa, ponto pra você. UM ponto.', 'LOLOL ok that was good, point to you. ONE point.', 'JAJAJAJA ok esa estuvo buena, punto para ti. UN punto.')],
    work: [L3('trabalho é esporte. eu sou atleta. você é… torcida? kkk brincadeira', 'work is a sport. I\'m an athlete. you\'re… the crowd? lol kidding', 'el trabajo es deporte. yo soy atleta. tú eres… ¿la hinchada? jaja broma')],
    coffee: [L3('café é pré-treino de pobre. tomo três.', 'coffee is the budget pre-workout. I have three.', 'el café es el pre-entreno barato. tomo tres.')],
    game: [L3('jogar com o Duda? ele roubou no último placar, fica a dica.', 'play with Duda? he cheated on the last score, just saying.', '¿jugar con Duda? hizo trampa en el último marcador, te aviso.')],
    sorry: [L3('de boa. rival que é rival não guarda mágoa. guarda placar.', 'all good. a real rival doesn\'t hold grudges. holds scores.', 'tranqui. un rival de verdad no guarda rencor. guarda marcadores.')],
    nudge: [L3('CUTUCOU? então é guerra. *cutuca de volta*', 'NUDGE? then it\'s war. *nudges back*', '¿ZUMBIDO? entonces es guerra. *zumbido de vuelta*')],
    psm: [L3('mensagem pessoal nova, é? a minha é melhor.', 'new status message, huh? mine\'s better.', '¿mensaje personal nuevo, eh? el mío es mejor.')],
    unknown: [L3('hã? fala a língua do arquivo, manda número.', 'huh? speak filing language, send numbers.', '¿eh? habla el idioma del archivo, manda números.'), L3('não entendi mas concordo se for elogio kkk', 'didn\'t get it but I agree if it\'s a compliment lol', 'no entendí pero estoy de acuerdo si es un halago jaja')],
  },
  call: {
    greet: [L3('E AÍ! Câmera ligada, iluminação profissional, ring light de 30 reais.', 'HEY! Camera on, pro lighting, a ten-dollar ring light.', '¡EY! Cámara encendida, iluminación profesional, aro de luz de diez dólares.')],
    talk: [[L3('Pergunta rápida: quantos documentos você arquivou hoje?', 'Quick question: how many documents did you file today?', 'Pregunta rápida: ¿cuántos documentos archivaste hoy?'), L3('Mais que você', 'More than you', 'Más que tú'), L3('Não conto', 'I don\'t count', 'No los cuento'),
      L3('MENTIRA. …será? Vou conferir. Vou conferir AGORA.', 'LIAR. …or? I\'ll check. Checking RIGHT NOW.', 'MENTIRA. …¿será? Voy a revisar. AHORA MISMO.'), L3('Não conta?! Como você DORME à noite?', 'You don\'t count?! How do you SLEEP at night?', '¡¿No los cuentas?! ¿Cómo DUERMES de noche?')]],
    bye: [L3('Fui! Série de agachamento entre um arquivo e outro.', 'Off I go! Squats between files.', '¡Me voy! Sentadillas entre archivo y archivo.')],
  },
});
castAdd({
  id: 'lu', name: 'Lu Reis', role: L3('Ilustradora · amiga de longa data', 'Illustrator · old friend', 'Ilustradora · amiga de toda la vida'), sector: null, group: 'friends', scope: 'life', start: 'always',
  likes: { joke: 2, honest: 1, kind: 1, tease: 1, gossip: 0, formal: -2, distant: -2, ambitious: -1, nudge: 0 }, open: 1.3, speed: 1.2, cam: 'on',
  blocks: [[0, 180, 'offline'], [270, 540, 'away', 'painting']], off: 'online',
  bio: L3('Amizade desde a escola. Ilustradora freelancer, trabalha de madrugada, vive de encomenda e café requentado. Mora com um gato laranja chamado Boleto, "porque ele sempre chega".',
    'Friends since school. Freelance illustrator, works through the night, lives on commissions and reheated coffee. Lives with an orange cat named Invoice, "because he always shows up".',
    'Amistad desde la escuela. Ilustradora freelance, trabaja de madrugada, vive de encargos y café recalentado. Vive con un gato naranja llamado Factura, "porque siempre llega".'),
  interests: L3('desenho · o Boleto · bandas que ninguém conhece · reclamar de cliente', 'drawing · Invoice the cat · bands nobody knows · complaining about clients', 'dibujo · Factura el gato · bandas que nadie conoce · quejarse de clientes'),
  bust: { skin: 1, hair: 'rosa', cloth: RAMP_DENIM, acc: 'branco', build: 'slim', rx: 7.2, ry: 7.7, outfit: OUTFIT.jacket,
    back: T => { for (let y = 5; y < 25; y++) { const w = y < 12 ? 9.5 : 9.5 - (y - 12) * .25; for (let x = Math.ceil(12 - w); x < 12 + w; x++) { if (y > 18 && x > 7 && x < 16) continue; T.put(x, y, ((x + Math.floor(y / 3)) % 5 === 0) ? 'h' : T.sh(T.HR, x, y, 8, 6, 10, 14)); } } },
    front: T => { for (let x = 4; x < 20; x++) for (let y = 0; y < 5; y++) { if ((y === 0 && (x < 7 || x > 16)) || (y === 1 && (x < 5 || x > 18))) continue; T.put(x, y, y >= 3 ? (x % 2 ? 'z' : 'Z') : (x % 2 ? 'y' : 'Y')); }
      for (let x = 5; x < 19; x++) { const len = 5 + ((x * 5) % 3); for (let y = 5; y < len + 1; y++) T.put(x, y, (x + y) % 4 === 0 ? 'h' : T.sh(T.HR, x, y, 8, 4, 8, 4)); }
      for (const [x, y] of [[8, 14], [10, 14], [14, 14], [16, 14], [9, 15]]) T.put(x, y, '5'); T.put(13, 14, 'W'); } },
  mood: 'smile',
  psm: [{ t: L3('desenhando até o sol nascer', 'drawing till sunrise', 'dibujando hasta el amanecer') }, { when: { arc: { lu: [2, 3] } }, t: L3('EXPOSIÇÃO?? eu??', 'AN EXHIBITION?? me??', '¿¿EXPOSICIÓN?? ¿¿yo??') },
    { when: { arc: { lu: 'fim' } }, t: L3('obrigada a quem foi <3', 'thank you to everyone who came <3', 'gracias a quienes fueron <3') }],
  intents: {
    hi: [L3('CRIATURA! finalmente', 'GREMLIN! finally', '¡CRIATURA! por fin'), L3('oiê. o Boleto mandou um miado pra você', 'heyo. Invoice sends you a meow', 'holi. Factura te manda un maullido')],
    how: [L3('viva, com café, devendo duas encomendas. o normal', 'alive, caffeinated, two commissions late. the usual', 'viva, con café, debiendo dos encargos. lo normal'), L3('bem! o Boleto derrubou tinta no meu tênis e ficou lindo, então tô bem', 'good! Invoice spilled paint on my sneakers and it looks great, so I\'m good', '¡bien! Factura derramó pintura en mis zapatillas y quedaron lindas, así que bien')],
    thanks: [L3('imagina, criatura', 'anytime, gremlin', 'nada, criatura')],
    bye: [L3('tchau!! dorme, hein', 'bye!! go sleep, ok', '¡¡chau!! duerme, eh'), L3('vai lá. beijo do Boleto', 'go on. kisses from Invoice', 've. besos de Factura')],
    joke: [L3('KKKKKKKKK eu vou desenhar isso', 'LMAOOO I\'m drawing this', 'JAJAJAJAJA voy a dibujar eso'), L3('para que eu tô rindo sozinha às 3 da manhã', 'stop I\'m laughing alone at 3am', 'para que me estoy riendo sola a las 3 de la mañana')],
    work: [L3('lá vem você falando de firma… me conta, mas me conta uma coisa boa também', 'here you go with office talk… tell me, but tell me something good too', 'ahí vas con la oficina… cuéntame, pero cuéntame algo bueno también')],
    coffee: [L3('café é a minha tinta principal', 'coffee is my main paint', 'el café es mi pintura principal')],
    sorry: [L3('tá perdoado(a). mas me deve um pão de queijo', 'forgiven. but you owe me a cheese bread', 'perdonado(a). pero me debes un pan de queso')],
    nudge: [L3('AI! tava com o pincel na mão, olha o risco que ficou', 'OW! I had the brush in hand, look at this line now', '¡AY! tenía el pincel en la mano, mira la raya que quedó')],
    psm: [L3('vi teu status. tá precisando de um café comigo, né', 'saw your status. you need coffee with me, right', 'vi tu estado. necesitas un café conmigo, ¿no?')],
    psmTired: [L3('cansado(a)?? larga tudo e vem ver o Boleto dormir de barriga pra cima', 'tired?? drop everything and come watch Invoice sleep belly-up', '¿¿cansado(a)?? deja todo y ven a ver a Factura dormir panza arriba')],
    psmCoffee: [L3('falou em café no status, eu senti daqui', 'you said coffee in your status, I could smell it from here', 'pusiste café en tu estado, lo olí desde aquí')],
    unknown: [L3('hein? escreve direito, criatura kkk', 'huh? use your words, gremlin lol', '¿eh? escribe bien, criatura jaja'), L3('não entendi mas mandei um coração mental <3', 'didn\'t get it but sending a mental heart <3', 'no entendí pero te mando un corazón mental <3')],
  },
  call: {
    greet: [L3('OI! Olha quem tá aqui! Boleto, dá oi! …ele não vai dar oi.', 'HI! Look who it is! Invoice, say hi! …he won\'t say hi.', '¡HOLA! ¡Mira quién está! ¡Factura, saluda! …no va a saludar.')],
    talk: [[L3('Me conta uma coisa que não seja de trabalho. Qualquer coisa.', 'Tell me something that isn\'t about work. Anything.', 'Cuéntame algo que no sea del trabajo. Lo que sea.'), L3('Vi um pombo de chapéu', 'Saw a pigeon in a hat', 'Vi una paloma con sombrero'), L3('Não tenho nada', 'I got nothing', 'No tengo nada'),
      L3('MENTIRA. Vou desenhar esse pombo. Ele vai ter nome. Ele vai ter história.', 'NO WAY. I\'m drawing that pigeon. He\'ll have a name. He\'ll have a backstory.', 'MENTIRA. Voy a dibujar esa paloma. Tendrá nombre. Tendrá historia.'), L3('Isso me preocupa um pouco. Domingo a gente sai, combinado?', 'That worries me a bit. Sunday we go out, deal?', 'Eso me preocupa un poco. El domingo salimos, ¿trato?')]],
    bye: [L3('Vai dormir! E bebe água, eu sei que você não bebe.', 'Go to sleep! And drink water, I know you don\'t.', '¡Ve a dormir! Y toma agua, sé que no tomas.')],
  },
});
