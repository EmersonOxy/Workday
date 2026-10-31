/* ================= Textos por idioma ================= */
const LANGS = {
  pt: {
    label: 'Português', htmlLang: 'pt-BR', money: 'R$',
    sectors: { fin: 'Financeiro', rh: 'RH', jur: 'Jurídico', ti: 'TI' },
    docs: { fin: ['Nota fiscal', 'Reembolso', 'Boleto', 'Balancete'], rh: ['Atestado', 'Férias', 'Currículo', 'Ponto'],
            jur: ['Contrato', 'Procuração', 'Notificação', 'Aditivo'], ti: ['Chamado', 'Licença', 'Senha', 'Backup'] },
    words: ['PRAZO', 'PLANILHA', 'REUNIAO', 'PROTOCOLO', 'RELATORIO', 'URGENTE', 'ANEXO', 'SINERGIA',
            'FEEDBACK', 'ALINHAMENTO', 'ORCAMENTO', 'CRONOGRAMA', 'DEMANDA', 'ESCOPO', 'PAUTA'],
    buttons: ['Aprovar', 'Assinar', 'Confirmar', 'Arquivar', 'Imprimir', 'Ciente', 'Validar'],
    callers: ['Cliente irritado', 'Diretoria', 'Fornecedor', 'Ramal 204', 'Número desconhecido'],
    emails: { 'Dúvida sobre pagamento': 'fin', 'Pedido de férias': 'rh', 'Cláusula 4.2': 'jur', 'Impressora travou': 'ti',
              'Holerite errado': 'rh', 'Processo novo': 'jur', 'VPN caiu': 'ti', 'Nota em atraso': 'fin' },
    spam: ['PARABÉNS! Você é o visitante 1.000.000', 'Seu PC está LENTO!!', 'Baixe mais memória RAM', 'Ganhe um celular grátis',
           'Renda extra trabalhando de casa', 'Sua garantia expirou', 'Clique para limpar o PC', '3 vírus detectados!!!'],
    bubbles: ['tá me ouvindo?', 'cê tá mudo', 'compartilha a tela', 'travou aqui', 'alguém?', 'volta um slide',
              'pode repetir?', 'vou ter que sair 5min', 'tá com eco', 'liga a câmera', 'próximo slide', 'tô sem áudio'],
    memos: [['Chefe', 'Reunião para alinhar a reunião de amanhã. Presença obrigatória.'], ['RH', 'Lembrete: sorrir faz parte da cultura da empresa.'],
            ['Chefe', 'Vi que você respirou às 10h14. Podemos conversar?'], ['RH', 'O bolo dos aniversariantes foi cancelado por contenção de custos.'],
            ['TI', 'Favor não reiniciar o computador. Nem ligar.'], ['Chefe', 'Só um pedido rápido (anexo de 340 páginas).'],
            ['RH', 'Pesquisa de clima: responda até ontem.'], ['Diretoria', 'Somos uma família. Família não ganha hora extra.'],
            ['Chefe', 'Pode ficar até mais tarde? Só hoje. De novo.'], ['TI', 'Sua senha expirou. A nova não pode ter letras nem números.']],
    ranks: ['Estagiário', 'Assistente', 'Analista', 'Coordenador', 'Gerente', 'Diretor', 'CEO'],
    mods: { first: ['Primeiro dia', 'Ninguém espera muito de você. Ainda.'], sexta: ['Sexta-feira', 'Tudo 15% mais lento, mas o chefe ronda o triplo.'],
            fecha: ['Fechamento do mês', 'Metade dos arquivos do Financeiro chega urgente.'],
            home: ['Home office', 'Sem chefe e sem setores trocando. Em compensação, chamadas de vídeo desde cedo.'],
            ar: ['Ar-condicionado quebrado', 'O estresse sobe sozinho o dia inteiro.'], ti: ['Dia da TI', 'PC travando e vírus em dobro, e desde cedo.'],
            segunda: ['Segunda-feira', 'Tarefas chegam 35% mais rápido.'], audit: ['Auditoria', 'Erros estressam 30% mais, acertos valem 30% mais.'] },
    perks: { estagiario: ['Estagiário próprio', 'Impressora travada pede metade dos toques.'], fone: ['Fone com cancelamento', 'Ligações exigem metade do tempo segurando.'],
             antivirus: ['Antivírus corporativo', 'Vírus abrem metade das janelas.'], secretaria: ['Secretária', 'Todas as tarefas ganham 20% mais prazo.'],
             terapia: ['Plano de terapia', 'O estresse baixa duas vezes mais rápido.'], mouse: ['Mouse gamer', 'PC travado destrava com metade das balançadas.'],
             bandeja: ['Bandeja inteligente', 'Arquivos caem 15% mais devagar.'], corretor: ['Corretor automático', 'Só aparecem palavras de até 8 letras.'],
             cafeteira: ['Cafeteira na mesa', 'O café aparece duas vezes mais.'], relacoes: ['Puxa-saco', 'Você tem 3s para esconder a tela do chefe.'],
             meta: ['Meta batida', 'O combo vai até ×6.'] },
    shop: { cafe: ['Café coado', 'Tecla 1: deixa tudo lento por 5s.'], cha: ['Chá de camomila', 'Tecla 2: tira 25 de estresse.'],
            fone: ['Fone emprestado', 'Amanhã: ligações pela metade do tempo.'], antivirus: ['Antivírus pirata', 'Amanhã: vírus abrem metade das janelas.'],
            postit: ['Bloco de post-it', 'Amanhã: tarefas com 25% mais prazo.'], planta: ['Planta', 'Alguém precisa sobreviver aqui.'],
            foto: ['Porta-retrato', 'Lembra por que você aguenta isso.'], lamp: ['Luminária', 'Luz própria. Status.'],
            monitor: ['Monitor extra', 'O dobro de telas, o dobro de problemas.'], gato: ['Gato de mesa', 'Não pergunte. Ele só está aqui.'],
            trofeu: ['Troféu', '"Funcionário do mês". Comprado.'] },
    tips: { file: 'Leve o arquivo ao setor da etiqueta com <b>← →</b>. <b>↓</b> acelera.', urgent: 'Arquivo <b>urgente</b>: cai rápido, vale o dobro, erro dói o dobro.',
            dead: '<b>Arquivo morto</b>: apague com <b>Delete</b> antes de cair.', coffee: 'Um <b>café</b> apareceu! Clique para deixar tudo lento.',
            button: '<b>Pendência</b>: clique no botão antes do prazo.', email: '<b>E-mail</b>: encaminhe para o setor do assunto.',
            type: '<b>Digite</b> a palavra e aperte <b>Enter</b>. Sem clicar em nada.', call: '<b>Telefone</b>: clique e <b>segure</b> até encher.',
            printer: '<b>Impressora</b>: aperte a tecla indicada várias vezes.', video: '<b>Chamada</b>: aceite e clique nos balões antes que subam.',
            boss: 'O <b>chefe</b> vem aí! Aperte <b>Esc</b> rápido.', shuffle: 'Os <b>setores</b> vão trocar de lugar! Olhe as bandejas.',
            freeze: '<b>PC travado</b>: as setas param. Balance o mouse!', virus: '<b>Vírus</b>: feche no <b>x</b>. Clicar no anúncio abre outro.' },
    causes: { wrong: 'Setor errado', urgent: 'Urgente errado', dead: 'Arquivo morto', del: 'Apagou documento', deadline: 'Prazo perdido',
              email: 'E-mail errado', boss: 'Chefe', freeze: 'PC travado', virus: 'Vírus', video: 'Reunião', typo: 'Digitação', ar: 'Calor' },
    ui: {
      day: 'Dia', points: 'Pontos', rank: 'Cargo', wallet: 'Carteira', sound: 'SOM', on: 'ON', off: 'OFF', stress: 'Estresse',
      play: 'Jogar', how: 'Como jogar', settings: 'Configurações', profile: 'Ficha', back: 'Voltar',
      howText: `<p>Cada dia vai das 9h às 18h. Arquivos caem na mesa: use <kbd>←</kbd> <kbd>→</kbd> para levá-los ao setor da etiqueta e <kbd>↓</kbd> para acelerar.</p>
        <p>O escritório desanda aos poucos: pendências, e-mails, digitação, ligações, impressora, chefe, PC travado, vírus e reuniões. Cada novidade é explicada na primeira vez que aparece.</p>
        <p>Sobreviva aos dias, receba salário, compre coisas no mercado e suba até CEO. Se o estresse encher, você pede demissão.</p>
        <p class="hint"><kbd>Espaço</kbd> pausa · <kbd>Esc</kbd> planilha falsa · <kbd>M</kbd> som · <kbd>1</kbd> <kbd>2</kbd> itens</p>`,
      language: 'Idioma', theme: 'Tema', themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Escuro', soundLabel: 'Som',
      soundOn: 'Ligado', soundOff: 'Desligado', tutorial: 'Tutorial', tutorialReset: 'Mostrar dicas de novo', tutorialDone: 'Dicas reativadas',
      progress: 'Progresso', erase: 'Apagar tudo', eraseConfirm: 'Apaga dinheiro, enfeites, recorde e estatísticas. Confirmar?', eraseYes: 'Sim, apagar', eraseNo: 'Cancelar', erased: 'Progresso apagado',
      paused: 'Pausa para o café', resumeHint: 'Aperte <kbd>Espaço</kbd> para voltar.', resume: 'Continuar', quit: 'Pedir demissão',
      record: 'Recorde', daysWorked: 'Dias trabalhados', maxDay: 'Maior dia', careers: 'Carreiras', files: 'Arquivos', emails: 'E-mails',
      calls: 'Ligações', viruses: 'Vírus fechados', bosses: 'Fugas do chefe', videos: 'Reuniões', prints: 'Impressões',
      today: 'Hoje', startDay: 'Começar o dia', market: 'Ir ao mercado', marketTitle: 'Mercado', toTake: 'Para levar', decorTitle: 'Enfeites para a mesa',
      decorHint: 'Ficam com você para sempre, mesmo trocando de emprego.', buy: 'Comprar', bought: 'Comprado', has: n => ` (tem ${n})`,
      dayDone: d => `18:00. Dia ${d} concluído!`, dayPoints: (p, b) => `Pontos no dia: <b>${p}</b> (inclui bônus de ${b} por sobreviver).`,
      salary: 'Salário', stressToday: 'O que mais te estressou hoje', perfect: 'Nada. Um dia perfeito, quase suspeito.', goHome: 'Ir para casa',
      quitTitle: 'Você pediu demissão', hrReport: (d, c) => `Relatório do RH, dia ${d}, ${c}.`, rankReached: 'Cargo alcançado',
      summary: (p, d) => `${p} pontos em ${d} dia${d > 1 ? 's' : ''}.`, missing: (n, r) => `Faltaram ${n} pontos para ${r}.`, top: 'Não havia mais para onde subir.',
      severance: 'Rescisão', reasons: 'Motivos do desligamento', newJob: 'Novo emprego', mainMenu: 'Menu',
      promo: 'Promoção!', promoText: r => `Agora você é <b>${r}</b>. Escolha um benefício para o resto da carreira:`,
      from: 'De', pending: 'Pendência', newEmail: 'Novo e-mail', forward: 'encaminhar:', fill: 'Preencher campo', typeHint: 'digite e aperte Enter',
      ringing: 'Telefone tocando', hold: 'segure', printer: 'Impressora travada', press: 'aperte', videoCall: 'Chamada de vídeo', accept: 'Aceitar',
      deadFile: 'Arquivo morto', pressDelete: 'aperte Delete', urgent: 'URGENTE', coffee: 'café!', notResponding: 'NÃO RESPONDENDO', shake: 'balance o mouse!',
      bossComing: 'O CHEFE VEM AÍ!', warning: 'AVISO!!!', meeting: 'Reunião rápida',
      fWrong: 'Setor errado!', fUrgent: 'Urgente no setor errado!', fDead: 'Arquivo morto arquivado!', fDel: 'Você apagou um documento!',
      fEmail: 'E-mail extraviado', fDeadline: 'Prazo perdido!', fMeeting: 'Perdeu a reunião!', fBoss: 'O chefe viu tudo!', fIgnored: 'Ignorou o colega!',
      footer: `<b>Workday</b> © ${YEAR} <b>${AUTHOR}</b>. Todos os direitos reservados. É proibido copiar, modificar, redistribuir, republicar ou adaptar este jogo, no todo ou em parte, em qualquer plataforma, sem autorização prévia e por escrito do autor.`,
    },
  },
  en: {
    label: 'English', htmlLang: 'en', money: '$',
    sectors: { fin: 'Finance', rh: 'HR', jur: 'Legal', ti: 'IT' },
    docs: { fin: ['Invoice', 'Refund', 'Bill', 'Balance sheet'], rh: ['Sick note', 'Vacation', 'Résumé', 'Timesheet'],
            jur: ['Contract', 'Power of attorney', 'Notice', 'Amendment'], ti: ['Ticket', 'License', 'Password', 'Backup'] },
    words: ['DEADLINE', 'SPREADSHEET', 'MEETING', 'PROTOCOL', 'REPORT', 'URGENT', 'ATTACHMENT', 'SYNERGY',
            'FEEDBACK', 'ALIGNMENT', 'BUDGET', 'SCHEDULE', 'DEMAND', 'SCOPE', 'AGENDA'],
    buttons: ['Approve', 'Sign', 'Confirm', 'Archive', 'Print', 'Noted', 'Validate'],
    callers: ['Angry client', 'The board', 'Supplier', 'Ext. 204', 'Unknown number'],
    emails: { 'Payment question': 'fin', 'Vacation request': 'rh', 'Clause 4.2': 'jur', 'Printer jammed': 'ti',
              'Wrong payslip': 'rh', 'New lawsuit': 'jur', 'VPN is down': 'ti', 'Late invoice': 'fin' },
    spam: ['CONGRATS! You are visitor 1,000,000', 'Your PC is SLOW!!', 'Download more RAM', 'Win a free phone',
           'Earn money from home', 'Your warranty expired', 'Click to clean your PC', '3 viruses detected!!!'],
    bubbles: ['can you hear me?', "you're muted", 'share your screen', 'it froze', 'anyone?', 'go back a slide',
              'can you repeat?', 'brb 5 min', "there's an echo", 'turn your camera on', 'next slide', 'no audio here'],
    memos: [['Boss', "Meeting to align tomorrow's meeting. Attendance mandatory."], ['HR', 'Reminder: smiling is part of our culture.'],
            ['Boss', 'I saw you breathe at 10:14. Can we talk?'], ['HR', 'Birthday cake canceled due to cost cutting.'],
            ['IT', 'Please do not restart your computer. Or turn it on.'], ['Boss', 'Just a quick request (340-page attachment).'],
            ['HR', 'Engagement survey: reply by yesterday.'], ['The board', "We are a family. Family doesn't get overtime."],
            ['Boss', 'Can you stay late? Just today. Again.'], ['IT', 'Your password expired. The new one cannot contain letters or numbers.']],
    ranks: ['Intern', 'Assistant', 'Analyst', 'Coordinator', 'Manager', 'Director', 'CEO'],
    mods: { first: ['First day', 'Nobody expects much from you. Yet.'], sexta: ['Friday', 'Everything is 15% slower, but the boss shows up three times as often.'],
            fecha: ['Month-end close', 'Half of the Finance files arrive urgent.'],
            home: ['Work from home', 'No boss and no shuffling. In exchange, video calls start early.'],
            ar: ['Broken air conditioning', 'Stress rises on its own all day.'], ti: ['IT day', 'Double the frozen PCs and viruses, and they start early.'],
            segunda: ['Monday', 'Tasks arrive 35% faster.'], audit: ['Audit', 'Mistakes stress 30% more, hits are worth 30% more.'] },
    perks: { estagiario: ['Your own intern', 'Jammed printers need half the presses.'], fone: ['Noise-cancelling headset', 'Calls need half the holding time.'],
             antivirus: ['Corporate antivirus', 'Viruses open half the windows.'], secretaria: ['Secretary', 'All tasks get 20% more time.'],
             terapia: ['Therapy plan', 'Stress goes down twice as fast.'], mouse: ['Gaming mouse', 'Frozen PCs need half the shaking.'],
             bandeja: ['Smart tray', 'Files fall 15% slower.'], corretor: ['Autocorrect', 'Only words up to 8 letters.'],
             cafeteira: ['Desk coffee maker', 'Coffee shows up twice as often.'], relacoes: ["Teacher's pet", 'You get 3s to hide from the boss.'],
             meta: ['Target hit', 'Combo goes up to ×6.'] },
    shop: { cafe: ['Drip coffee', 'Key 1: slows everything for 5s.'], cha: ['Chamomile tea', 'Key 2: removes 25 stress.'],
            fone: ['Borrowed headset', 'Tomorrow: calls take half the time.'], antivirus: ['Pirated antivirus', 'Tomorrow: viruses open half the windows.'],
            postit: ['Sticky notes', 'Tomorrow: tasks get 25% more time.'], planta: ['Plant', 'Someone has to survive here.'],
            foto: ['Photo frame', 'Reminds you why you put up with this.'], lamp: ['Desk lamp', 'Your own light. Status.'],
            monitor: ['Extra monitor', 'Twice the screens, twice the problems.'], gato: ['Desk cat', "Don't ask. It's just here."],
            trofeu: ['Trophy', '"Employee of the month". Bought.'] },
    tips: { file: 'Move the file to the labeled department with <b>← →</b>. <b>↓</b> drops faster.', urgent: '<b>Urgent</b> file: falls fast, double points, double pain.',
            dead: '<b>Dead file</b>: delete it with <b>Delete</b> before it lands.', coffee: 'A <b>coffee</b> appeared! Click it to slow everything down.',
            button: '<b>Pending item</b>: click the button before time runs out.', email: '<b>Email</b>: forward it to the right department.',
            type: '<b>Type</b> the word and press <b>Enter</b>. No clicking needed.', call: '<b>Phone</b>: click and <b>hold</b> until it fills.',
            printer: '<b>Printer</b>: press the shown key several times.', video: '<b>Video call</b>: accept and click the bubbles before they float away.',
            boss: 'The <b>boss</b> is coming! Press <b>Esc</b> fast.', shuffle: 'The <b>departments</b> are about to swap! Watch the trays.',
            freeze: '<b>Frozen PC</b>: arrows stop working. Shake the mouse!', virus: '<b>Virus</b>: close on the <b>x</b>. Clicking the ad opens another.' },
    causes: { wrong: 'Wrong department', urgent: 'Urgent misplaced', dead: 'Dead file', del: 'Deleted a document', deadline: 'Missed deadline',
              email: 'Wrong email', boss: 'Boss', freeze: 'Frozen PC', virus: 'Virus', video: 'Meeting', typo: 'Typing', ar: 'Heat' },
    ui: {
      day: 'Day', points: 'Score', rank: 'Role', wallet: 'Wallet', sound: 'SOUND', on: 'ON', off: 'OFF', stress: 'Stress',
      play: 'Play', how: 'How to play', settings: 'Settings', profile: 'Profile', back: 'Back',
      howText: `<p>Each day runs from 9 a.m. to 6 p.m. Files fall on your desk: use <kbd>←</kbd> <kbd>→</kbd> to move them to the labeled department and <kbd>↓</kbd> to drop faster.</p>
        <p>The office slowly falls apart: pending items, emails, typing, calls, printer, boss, frozen PC, viruses and meetings. Each new thing is explained the first time it shows up.</p>
        <p>Survive the days, get paid, shop at the market and climb to CEO. If stress fills up, you quit.</p>
        <p class="hint"><kbd>Space</kbd> pause · <kbd>Esc</kbd> fake spreadsheet · <kbd>M</kbd> sound · <kbd>1</kbd> <kbd>2</kbd> items</p>`,
      language: 'Language', theme: 'Theme', themeSystem: 'System', themeLight: 'Light', themeDark: 'Dark', soundLabel: 'Sound',
      soundOn: 'On', soundOff: 'Off', tutorial: 'Tutorial', tutorialReset: 'Show tips again', tutorialDone: 'Tips re-enabled',
      progress: 'Progress', erase: 'Erase everything', eraseConfirm: 'Erases money, decorations, high score and stats. Confirm?', eraseYes: 'Yes, erase', eraseNo: 'Cancel', erased: 'Progress erased',
      paused: 'Coffee break', resumeHint: 'Press <kbd>Space</kbd> to resume.', resume: 'Resume', quit: 'Quit job',
      record: 'High score', daysWorked: 'Days worked', maxDay: 'Best day', careers: 'Careers', files: 'Files', emails: 'Emails',
      calls: 'Calls', viruses: 'Viruses closed', bosses: 'Boss escapes', videos: 'Meetings', prints: 'Prints',
      today: 'Today', startDay: 'Start the day', market: 'Go to the market', marketTitle: 'Market', toTake: 'To take', decorTitle: 'Desk decorations',
      decorHint: 'They stay with you forever, even if you change jobs.', buy: 'Buy', bought: 'Bought', has: n => ` (have ${n})`,
      dayDone: d => `6:00 p.m. Day ${d} complete!`, dayPoints: (p, b) => `Points today: <b>${p}</b> (includes a ${b} survival bonus).`,
      salary: 'Salary', stressToday: 'What stressed you most today', perfect: 'Nothing. A perfect day, almost suspicious.', goHome: 'Go home',
      quitTitle: 'You quit', hrReport: (d, c) => `HR report, day ${d}, ${c}.`, rankReached: 'Role reached',
      summary: (p, d) => `${p} points in ${d} day${d > 1 ? 's' : ''}.`, missing: (n, r) => `${n} points short of ${r}.`, top: 'There was nowhere left to climb.',
      severance: 'Severance', reasons: 'Reasons for leaving', newJob: 'New job', mainMenu: 'Menu',
      promo: 'Promotion!', promoText: r => `You are now <b>${r}</b>. Pick a perk for the rest of your career:`,
      from: 'From', pending: 'Pending', newEmail: 'New email', forward: 'forward to:', fill: 'Fill in field', typeHint: 'type and press Enter',
      ringing: 'Phone ringing', hold: 'hold', printer: 'Printer jammed', press: 'press', videoCall: 'Video call', accept: 'Accept',
      deadFile: 'Dead file', pressDelete: 'press Delete', urgent: 'URGENT', coffee: 'coffee!', notResponding: 'NOT RESPONDING', shake: 'shake the mouse!',
      bossComing: 'THE BOSS IS COMING!', warning: 'WARNING!!!', meeting: 'Quick sync',
      fWrong: 'Wrong department!', fUrgent: 'Urgent file misplaced!', fDead: 'Dead file filed!', fDel: 'You deleted a document!',
      fEmail: 'Email lost', fDeadline: 'Missed deadline!', fMeeting: 'Missed the meeting!', fBoss: 'The boss saw everything!', fIgnored: 'Ignored a coworker!',
      footer: `<b>Workday</b> © ${YEAR} <b>${AUTHOR}</b>. All rights reserved. Copying, modifying, redistributing, reposting or adapting this game, in whole or in part, on any platform, is prohibited without the author's prior written permission.`,
    },
  },
  es: {
    label: 'Español', htmlLang: 'es', money: '$',
    sectors: { fin: 'Finanzas', rh: 'RR. HH.', jur: 'Legal', ti: 'TI' },
    docs: { fin: ['Factura', 'Reembolso', 'Boleta', 'Balance'], rh: ['Certificado médico', 'Vacaciones', 'Currículum', 'Asistencia'],
            jur: ['Contrato', 'Poder', 'Notificación', 'Adenda'], ti: ['Ticket', 'Licencia', 'Contraseña', 'Backup'] },
    words: ['ENTREGA', 'PLANILLA', 'REUNION', 'PROTOCOLO', 'INFORME', 'URGENTE', 'ADJUNTO', 'SINERGIA',
            'FEEDBACK', 'GASTOS', 'CRONOGRAMA', 'DEMANDA', 'ALCANCE', 'AGENDA', 'PENDIENTE'],
    buttons: ['Aprobar', 'Firmar', 'Confirmar', 'Archivar', 'Imprimir', 'Visto', 'Validar'],
    callers: ['Cliente enojado', 'Directorio', 'Proveedor', 'Interno 204', 'Número desconocido'],
    emails: { 'Duda sobre un pago': 'fin', 'Pedido de vacaciones': 'rh', 'Cláusula 4.2': 'jur', 'Se trabó la impresora': 'ti',
              'Recibo de sueldo erróneo': 'rh', 'Juicio nuevo': 'jur', 'Se cayó la VPN': 'ti', 'Factura atrasada': 'fin' },
    spam: ['¡FELICIDADES! Eres el visitante 1.000.000', '¡¡Tu PC está LENTA!!', 'Descarga más RAM', 'Gana un celular gratis',
           'Ingresos extra desde casa', 'Tu garantía expiró', 'Haz clic para limpiar la PC', '¡¡¡3 virus detectados!!!'],
    bubbles: ['¿me escuchas?', 'estás muteado', 'comparte pantalla', 'se congeló', '¿alguien?', 'vuelve una diapo',
              '¿puedes repetir?', 'salgo 5 min', 'hay eco', 'prende la cámara', 'siguiente diapo', 'no tengo audio'],
    memos: [['Jefe', 'Reunión para alinear la reunión de mañana. Asistencia obligatoria.'], ['RR. HH.', 'Recordatorio: sonreír es parte de nuestra cultura.'],
            ['Jefe', 'Vi que respiraste a las 10:14. ¿Hablamos?'], ['RR. HH.', 'La torta de cumpleaños se canceló por recorte de gastos.'],
            ['TI', 'Por favor no reinicien la computadora. Ni la prendan.'], ['Jefe', 'Solo un pedido rápido (adjunto de 340 páginas).'],
            ['RR. HH.', 'Encuesta de clima: respondan hasta ayer.'], ['Directorio', 'Somos una familia. La familia no cobra horas extra.'],
            ['Jefe', '¿Te puedes quedar hasta tarde? Solo hoy. Otra vez.'], ['TI', 'Tu contraseña expiró. La nueva no puede tener letras ni números.']],
    ranks: ['Pasante', 'Asistente', 'Analista', 'Coordinador', 'Gerente', 'Director', 'CEO'],
    mods: { first: ['Primer día', 'Nadie espera mucho de ti. Todavía.'], sexta: ['Viernes', 'Todo un 15% más lento, pero el jefe ronda el triple.'],
            fecha: ['Cierre de mes', 'La mitad de los archivos de Finanzas llega urgente.'],
            home: ['Home office', 'Sin jefe y sin cambios de sector. A cambio, videollamadas desde temprano.'],
            ar: ['Aire acondicionado roto', 'El estrés sube solo todo el día.'], ti: ['Día de TI', 'PC colgada y virus al doble, y desde temprano.'],
            segunda: ['Lunes', 'Las tareas llegan un 35% más rápido.'], audit: ['Auditoría', 'Los errores estresan un 30% más, los aciertos valen un 30% más.'] },
    perks: { estagiario: ['Pasante propio', 'La impresora trabada pide la mitad de toques.'], fone: ['Auriculares con cancelación', 'Las llamadas piden la mitad del tiempo.'],
             antivirus: ['Antivirus corporativo', 'Los virus abren la mitad de ventanas.'], secretaria: ['Secretaria', 'Todas las tareas tienen 20% más de plazo.'],
             terapia: ['Plan de terapia', 'El estrés baja el doble de rápido.'], mouse: ['Mouse gamer', 'La PC colgada se arregla con la mitad de sacudidas.'],
             bandeja: ['Bandeja inteligente', 'Los archivos caen un 15% más lento.'], corretor: ['Autocorrector', 'Solo palabras de hasta 8 letras.'],
             cafeteira: ['Cafetera en el escritorio', 'El café aparece el doble.'], relacoes: ['Chupamedias', 'Tienes 3 s para esconderte del jefe.'],
             meta: ['Meta cumplida', 'El combo llega a ×6.'] },
    shop: { cafe: ['Café de filtro', 'Tecla 1: todo va lento por 5 s.'], cha: ['Té de manzanilla', 'Tecla 2: quita 25 de estrés.'],
            fone: ['Auriculares prestados', 'Mañana: llamadas a la mitad del tiempo.'], antivirus: ['Antivirus pirata', 'Mañana: los virus abren la mitad de ventanas.'],
            postit: ['Taco de post-it', 'Mañana: tareas con 25% más de plazo.'], planta: ['Planta', 'Alguien tiene que sobrevivir aquí.'],
            foto: ['Portarretratos', 'Te recuerda por qué aguantas esto.'], lamp: ['Lámpara', 'Luz propia. Estatus.'],
            monitor: ['Monitor extra', 'El doble de pantallas, el doble de problemas.'], gato: ['Gato de escritorio', 'No preguntes. Solo está aquí.'],
            trofeu: ['Trofeo', '"Empleado del mes". Comprado.'] },
    tips: { file: 'Lleva el archivo al sector de la etiqueta con <b>← →</b>. <b>↓</b> acelera.', urgent: 'Archivo <b>urgente</b>: cae rápido, vale el doble, el error duele el doble.',
            dead: '<b>Archivo muerto</b>: bórralo con <b>Delete</b> antes de que caiga.', coffee: '¡Apareció un <b>café</b>! Haz clic para que todo vaya lento.',
            button: '<b>Pendiente</b>: haz clic en el botón antes del plazo.', email: '<b>Correo</b>: reenvíalo al sector del asunto.',
            type: '<b>Escribe</b> la palabra y pulsa <b>Enter</b>. Sin hacer clic.', call: '<b>Teléfono</b>: haz clic y <b>mantén</b> hasta llenar.',
            printer: '<b>Impresora</b>: pulsa la tecla indicada varias veces.', video: '<b>Videollamada</b>: acepta y haz clic en los globos antes de que suban.',
            boss: '¡Viene el <b>jefe</b>! Pulsa <b>Esc</b> rápido.', shuffle: '¡Los <b>sectores</b> van a cambiar de lugar! Mira las bandejas.',
            freeze: '<b>PC colgada</b>: las flechas no funcionan. ¡Sacude el mouse!', virus: '<b>Virus</b>: cierra en la <b>x</b>. Hacer clic en el anuncio abre otro.' },
    causes: { wrong: 'Sector equivocado', urgent: 'Urgente equivocado', dead: 'Archivo muerto', del: 'Borró un documento', deadline: 'Plazo vencido',
              email: 'Correo equivocado', boss: 'Jefe', freeze: 'PC colgada', virus: 'Virus', video: 'Reunión', typo: 'Escritura', ar: 'Calor' },
    ui: {
      day: 'Día', points: 'Puntos', rank: 'Cargo', wallet: 'Billetera', sound: 'SONIDO', on: 'SÍ', off: 'NO', stress: 'Estrés',
      play: 'Jugar', how: 'Cómo jugar', settings: 'Configuración', profile: 'Ficha', back: 'Volver',
      howText: `<p>Cada día va de 9 a 18 h. Caen archivos en el escritorio: usa <kbd>←</kbd> <kbd>→</kbd> para llevarlos al sector de la etiqueta y <kbd>↓</kbd> para acelerar.</p>
        <p>La oficina se desmorona de a poco: pendientes, correos, escritura, llamadas, impresora, jefe, PC colgada, virus y reuniones. Cada novedad se explica la primera vez que aparece.</p>
        <p>Sobrevive a los días, cobra el sueldo, compra en el mercado y llega a CEO. Si el estrés se llena, renuncias.</p>
        <p class="hint"><kbd>Espacio</kbd> pausa · <kbd>Esc</kbd> planilla falsa · <kbd>M</kbd> sonido · <kbd>1</kbd> <kbd>2</kbd> objetos</p>`,
      language: 'Idioma', theme: 'Tema', themeSystem: 'Sistema', themeLight: 'Claro', themeDark: 'Oscuro', soundLabel: 'Sonido',
      soundOn: 'Activado', soundOff: 'Desactivado', tutorial: 'Tutorial', tutorialReset: 'Mostrar consejos de nuevo', tutorialDone: 'Consejos reactivados',
      progress: 'Progreso', erase: 'Borrar todo', eraseConfirm: 'Borra dinero, adornos, récord y estadísticas. ¿Confirmar?', eraseYes: 'Sí, borrar', eraseNo: 'Cancelar', erased: 'Progreso borrado',
      paused: 'Pausa para el café', resumeHint: 'Pulsa <kbd>Espacio</kbd> para volver.', resume: 'Continuar', quit: 'Renunciar',
      record: 'Récord', daysWorked: 'Días trabajados', maxDay: 'Mejor día', careers: 'Carreras', files: 'Archivos', emails: 'Correos',
      calls: 'Llamadas', viruses: 'Virus cerrados', bosses: 'Escapes del jefe', videos: 'Reuniones', prints: 'Impresiones',
      today: 'Hoy', startDay: 'Empezar el día', market: 'Ir al mercado', marketTitle: 'Mercado', toTake: 'Para llevar', decorTitle: 'Adornos para el escritorio',
      decorHint: 'Se quedan contigo para siempre, aunque cambies de trabajo.', buy: 'Comprar', bought: 'Comprado', has: n => ` (tienes ${n})`,
      dayDone: d => `18:00. ¡Día ${d} completado!`, dayPoints: (p, b) => `Puntos del día: <b>${p}</b> (incluye un bono de ${b} por sobrevivir).`,
      salary: 'Sueldo', stressToday: 'Lo que más te estresó hoy', perfect: 'Nada. Un día perfecto, casi sospechoso.', goHome: 'Ir a casa',
      quitTitle: 'Renunciaste', hrReport: (d, c) => `Informe de RR. HH., día ${d}, ${c}.`, rankReached: 'Cargo alcanzado',
      summary: (p, d) => `${p} puntos en ${d} día${d > 1 ? 's' : ''}.`, missing: (n, r) => `Faltaron ${n} puntos para ${r}.`, top: 'No quedaba más adonde subir.',
      severance: 'Indemnización', reasons: 'Motivos de la salida', newJob: 'Nuevo empleo', mainMenu: 'Menú',
      promo: '¡Ascenso!', promoText: r => `Ahora eres <b>${r}</b>. Elige un beneficio para el resto de tu carrera:`,
      from: 'De', pending: 'Pendiente', newEmail: 'Correo nuevo', forward: 'reenviar a:', fill: 'Completar campo', typeHint: 'escribe y pulsa Enter',
      ringing: 'Suena el teléfono', hold: 'mantén', printer: 'Impresora trabada', press: 'pulsa', videoCall: 'Videollamada', accept: 'Aceptar',
      deadFile: 'Archivo muerto', pressDelete: 'pulsa Delete', urgent: 'URGENTE', coffee: '¡café!', notResponding: 'NO RESPONDE', shake: '¡sacude el mouse!',
      bossComing: '¡VIENE EL JEFE!', warning: '¡¡¡AVISO!!!', meeting: 'Reunión rápida',
      fWrong: '¡Sector equivocado!', fUrgent: '¡Urgente en el sector equivocado!', fDead: '¡Archivaste un archivo muerto!', fDel: '¡Borraste un documento!',
      fEmail: 'Correo perdido', fDeadline: '¡Plazo vencido!', fMeeting: '¡Perdiste la reunión!', fBoss: '¡El jefe lo vio todo!', fIgnored: '¡Ignoraste al colega!',
      footer: `<b>Workday</b> © ${YEAR} <b>${AUTHOR}</b>. Todos los derechos reservados. Se prohíbe copiar, modificar, redistribuir, volver a publicar o adaptar este juego, total o parcialmente, en cualquier plataforma, sin autorización previa y por escrito del autor.`,
    },
  },
};

Object.assign(LANGS.pt.ui, { stampOver: 'RESCINDIDO', certTitle: 'Certificado de promoção', certBody: n => `A WORKDAY LTDA. certifica que o(a) funcionário(a) <b>nº ${n}</b> foi promovido(a) ao cargo de`, signature: 'Assinatura do funcionário', signHint: 'Assine com o mouse ou o dedo', pickEnvelope: 'Escolha um envelope: só um benefício pode ser seu', promoted: 'PROMOVIDO', perkLabel: 'Benefício secreto', display: 'Exibição', windowed: 'Janela', fullscreen: 'Tela cheia', resolution: 'Resolução', autoRes: 'Automática (preencher)', musicLabel: 'Música', sfxLabel: 'Efeitos', overBudget: 'Saldo insuficiente! Toque num item da sacola para deixá-lo para trás.', hide: 'ESCONDER TELA', del: 'APAGAR ARQUIVO', pullTicket: 'Segure o ticket e puxe para cima para rasgar', finish: 'Encerrar compra', swipeHint: 'Segure um produto e deslize por cima do leitor.', noRead: 'Não leu! Passe de novo.', wakeHint: 'Clique no despertador para acordar', cont: d => `Continuar (dia ${d})`, placeFinger: 'POSICIONE O DEDO', reading: 'LENDO...', readFail: 'FALHOU! DE NOVO',
  readOk: 'REGISTRADO', holdFinger: 'Clique e segure na digital', printing: 'Imprimindo...', pullTicket: 'Segure o ticket e puxe para cima para rasgar',
  company: 'WORKDAY LTDA.', receipt: 'COMPROVANTE DE PONTO', employee: 'Funcionário', inTime: 'Entrada', outTime: 'Saída', hoursWorked: 'Horas',
  worst: 'Pior parte', goRest: 'Ir para casa descansar', goShop: 'Ir às compras', exit: 'Sair', store: 'Mercadinho', total: 'Total',
  toCheckout: 'Ir ao caixa', skipHome: 'Ir para casa', cantAfford: 'Dinheiro insuficiente!',
  marketHint: 'Clique nos produtos para pôr na cesta. Clique num produto na cesta para devolver.', checkoutTitle: 'Caixa',
  scanHint: 'Clique nos produtos para passar no leitor.', payHint: 'Tudo registrado. Escolha como pagar.', payWith: 'Forma de pagamento',
  cash: 'Dinheiro', card: 'Cartão', pix: 'Pix', pay: 'Pagar', processing: 'PROCESSANDO...', approved: 'APROVADO' });
Object.assign(LANGS.en.ui, { stampOver: 'TERMINATED', certTitle: 'Certificate of promotion', certBody: n => `WORKDAY INC. certifies that employee <b>no. ${n}</b> has been promoted to`, signature: 'Employee signature', signHint: 'Sign with your mouse or finger', pickEnvelope: 'Pick an envelope: only one perk can be yours', promoted: 'PROMOTED', perkLabel: 'Secret perk', display: 'Display', windowed: 'Window', fullscreen: 'Fullscreen', resolution: 'Resolution', autoRes: 'Auto (fill)', musicLabel: 'Music', sfxLabel: 'Effects', overBudget: 'Not enough money! Tap an item in the bag to leave it behind.', hide: 'HIDE SCREEN', del: 'DELETE FILE', pullTicket: 'Hold the ticket and pull up to tear it off', finish: 'Finish shopping', swipeHint: 'Hold a product and swipe it over the scanner.', noRead: 'No read! Swipe again.', wakeHint: 'Click the alarm clock to wake up', cont: d => `Continue (day ${d})`, placeFinger: 'PLACE FINGER', reading: 'READING...', readFail: 'FAILED! AGAIN',
  readOk: 'RECORDED', holdFinger: 'Click and hold the fingerprint', printing: 'Printing...', pullTicket: 'Hold the ticket and pull up to tear it off',
  company: 'WORKDAY INC.', receipt: 'TIME CARD RECEIPT', employee: 'Employee', inTime: 'In', outTime: 'Out', hoursWorked: 'Hours',
  worst: 'Worst part', goRest: 'Go home and rest', goShop: 'Go shopping', exit: 'Exit', store: 'Corner store', total: 'Total',
  toCheckout: 'Go to checkout', skipHome: 'Go home', cantAfford: 'Not enough money!',
  marketHint: 'Click products to put them in the basket. Click one in the basket to put it back.', checkoutTitle: 'Checkout',
  scanHint: 'Click the products to scan them.', payHint: 'All scanned. Choose how to pay.', payWith: 'Payment method',
  cash: 'Cash', card: 'Card', pix: 'Phone', pay: 'Pay', processing: 'PROCESSING...', approved: 'APPROVED' });
Object.assign(LANGS.es.ui, { stampOver: 'RESCINDIDO', certTitle: 'Certificado de ascenso', certBody: n => `WORKDAY S.A. certifica que el empleado <b>n.º ${n}</b> fue ascendido al cargo de`, signature: 'Firma del empleado', signHint: 'Firma con el mouse o el dedo', pickEnvelope: 'Elige un sobre: solo un beneficio puede ser tuyo', promoted: 'ASCENDIDO', perkLabel: 'Beneficio secreto', display: 'Pantalla', windowed: 'Ventana', fullscreen: 'Pantalla completa', resolution: 'Resolución', autoRes: 'Automática (llenar)', musicLabel: 'Música', sfxLabel: 'Efectos', overBudget: '¡Saldo insuficiente! Toca un producto de la bolsa para dejarlo.', hide: 'OCULTAR PANTALLA', del: 'BORRAR ARCHIVO', pullTicket: 'Mantén el ticket y tira hacia arriba para cortarlo', finish: 'Terminar compra', swipeHint: 'Mantén un producto y deslízalo sobre el lector.', noRead: '¡No leyó! Pásalo de nuevo.', wakeHint: 'Haz clic en el despertador para despertar', cont: d => `Continuar (día ${d})`, placeFinger: 'APOYE EL DEDO', reading: 'LEYENDO...', readFail: '¡FALLÓ! DE NUEVO',
  readOk: 'REGISTRADO', holdFinger: 'Haz clic y mantén sobre la huella', printing: 'Imprimiendo...', pullTicket: 'Mantén el ticket y tira hacia arriba para cortarlo',
  company: 'WORKDAY S.A.', receipt: 'COMPROBANTE DE ASISTENCIA', employee: 'Empleado', inTime: 'Entrada', outTime: 'Salida', hoursWorked: 'Horas',
  worst: 'Lo peor', goRest: 'Ir a casa a descansar', goShop: 'Ir de compras', exit: 'Salir', store: 'Almacén', total: 'Total',
  toCheckout: 'Ir a la caja', skipHome: 'Ir a casa', cantAfford: '¡Dinero insuficiente!',
  marketHint: 'Haz clic en los productos para ponerlos en la canasta. Haz clic en uno de la canasta para devolverlo.', checkoutTitle: 'Caja',
  scanHint: 'Haz clic en los productos para escanearlos.', payHint: 'Todo escaneado. Elige cómo pagar.', payWith: 'Forma de pago',
  cash: 'Efectivo', card: 'Tarjeta', pix: 'QR', pay: 'Pagar', processing: 'PROCESANDO...', approved: 'APROBADO' });

LANGS.pt.tipsTouch = { file: 'Toque na coluna do setor da etiqueta ou deslize o arquivo para os lados. Deslize para baixo para soltar.', dead: '<b>Arquivo morto</b>: toque nele ou deslize para baixo para apagar.', boss: 'O <b>chefe</b> vem aí! Toque em <b>ESCONDER</b>.', printer: '<b>Impressora</b>: toque na tecla várias vezes.', type: '<b>Digite</b>: toque no campo e escreva a palavra.', freeze: '<b>PC travado</b>: balance o dedo na tela!' };
LANGS.en.tipsTouch = { file: 'Tap the column of the labeled department or swipe the file sideways. Swipe down to drop it.', dead: '<b>Dead file</b>: tap it or swipe down to delete.', boss: 'The <b>boss</b> is coming! Tap <b>HIDE</b>.', printer: '<b>Printer</b>: tap the key several times.', type: '<b>Type</b>: tap the field and write the word.', freeze: '<b>Frozen PC</b>: shake your finger on the screen!' };
LANGS.es.tipsTouch = { file: 'Toca la columna del sector de la etiqueta o desliza el archivo a los lados. Desliza hacia abajo para soltarlo.', dead: '<b>Archivo muerto</b>: tócalo o desliza hacia abajo para borrarlo.', boss: '¡Viene el <b>jefe</b>! Toca <b>OCULTAR</b>.', printer: '<b>Impresora</b>: toca la tecla varias veces.', type: '<b>Escribe</b>: toca el campo y escribe la palabra.', freeze: '<b>PC colgada</b>: ¡sacude el dedo en la pantalla!' };

// Entrega 1: assinatura, rescisão, afastamento, crachá e personalização do computador
Object.assign(LANGS.pt.ui, {
  clearSig: 'Limpar assinatura', confirmSig: 'Confirmar assinatura', signFirst: 'Assine no espaço acima', cancel: 'Cancelar',
  certBody: (n, name) => `A WORKDAY LTDA. certifica que <b>${name}</b>, funcionário(a) nº ${n}, foi promovido(a) ao cargo de`,
  resignTitle: 'Termo de rescisão voluntária', resignStamp: 'DESLIGADO', resignHint: 'Assine para confirmar. Ainda dá para voltar atrás.',
  resignBody: (name, n) => `Eu, <b>${name}</b>, funcionário(a) nº ${n}, declaro de livre e espontânea vontade (e sem nenhuma reunião de alinhamento prévio) que encerro meu vínculo com a WORKDAY LTDA.`,
  resignClauses: ['Devolverei o grampeador que nunca foi meu.', 'Reconheço que o café da copa continuará ruim sem mim.', 'Abro mão de todas as reuniões que poderiam ter sido um e-mail.', 'A planta da mesa fica com a empresa. Ela já assinou.'],
  backToWork: 'Voltar ao expediente', resignConfirm: 'Confirmar demissão',
  burnoutTitle: 'Afastamento por estresse', burnoutLine: 'O médico do trabalho recomendou distância de planilhas por tempo indeterminado.',
  quitLine: 'Desligamento voluntário, com termo assinado.', reasonsBurnout: 'O que levou ao esgotamento', reasonsQuit: 'O que mais pesou na carreira',
  profile: 'Perfil', badgeTitle: 'Crachá', editBadge: 'Editar crachá', nameLabel: 'Nome', namePh: 'Seu nome no crachá', defaultName: 'Funcionário(a)',
  avatarLabel: 'Avatar', photoLabel: 'Foto do aparelho', photoPick: 'Escolher foto', photoClear: 'Usar avatar', save: 'Salvar',
  customize: 'Personalizar computador', hwTitle: 'Seu computador', monitorLabel: 'Monitor', keyboardLabel: 'Teclado', mouseLabel: 'Mouse',
  allLabel: 'Tudo igual', cream: 'Creme', graphite: 'Grafite', wallLabel: 'Papel de parede', hwNote: 'O equipamento aparece na mesa do escritório (computador).',
  walls: { teal: 'Petróleo', grid: 'Quadriculado', hills: 'Colinas', night: 'Noite' },
});
Object.assign(LANGS.en.ui, {
  clearSig: 'Clear signature', confirmSig: 'Confirm signature', signFirst: 'Sign in the space above', cancel: 'Cancel',
  certBody: (n, name) => `WORKDAY INC. certifies that <b>${name}</b>, employee no. ${n}, has been promoted to`,
  resignTitle: 'Voluntary resignation form', resignStamp: 'OFFBOARDED', resignHint: 'Sign to confirm. You can still back out.',
  resignBody: (name, n) => `I, <b>${name}</b>, employee no. ${n}, of my own free will (and without any prior alignment meeting) hereby end my employment with WORKDAY INC.`,
  resignClauses: ['I will return the stapler that was never mine.', 'I acknowledge the break room coffee will stay bad without me.', 'I waive every meeting that could have been an email.', 'The desk plant stays with the company. It already signed.'],
  backToWork: 'Back to work', resignConfirm: 'Confirm resignation',
  burnoutTitle: 'Stress leave', burnoutLine: 'The company doctor prescribed staying away from spreadsheets indefinitely.',
  quitLine: 'Voluntary resignation, form signed.', reasonsBurnout: 'What led to the burnout', reasonsQuit: 'What weighed most on your career',
  profile: 'Profile', badgeTitle: 'ID badge', editBadge: 'Edit badge', nameLabel: 'Name', namePh: 'Your name on the badge', defaultName: 'Employee',
  avatarLabel: 'Avatar', photoLabel: 'Photo from device', photoPick: 'Choose photo', photoClear: 'Use avatar', save: 'Save',
  customize: 'Customize computer', hwTitle: 'Your computer', monitorLabel: 'Monitor', keyboardLabel: 'Keyboard', mouseLabel: 'Mouse',
  allLabel: 'All matching', cream: 'Cream', graphite: 'Graphite', wallLabel: 'Wallpaper', hwNote: 'The hardware shows on the office desk (computer).',
  walls: { teal: 'Teal', grid: 'Grid', hills: 'Hills', night: 'Night' },
});
Object.assign(LANGS.es.ui, {
  clearSig: 'Borrar firma', confirmSig: 'Confirmar firma', signFirst: 'Firma en el espacio de arriba', cancel: 'Cancelar',
  certBody: (n, name) => `WORKDAY S.A. certifica que <b>${name}</b>, empleado n.º ${n}, fue ascendido al cargo de`,
  resignTitle: 'Acta de renuncia voluntaria', resignStamp: 'DESVINCULADO', resignHint: 'Firma para confirmar. Todavía puedes arrepentirte.',
  resignBody: (name, n) => `Yo, <b>${name}</b>, empleado n.º ${n}, por mi libre voluntad (y sin ninguna reunión de alineamiento previa) termino mi relación laboral con WORKDAY S.A.`,
  resignClauses: ['Devolveré la engrapadora que nunca fue mía.', 'Reconozco que el café de la cocina seguirá malo sin mí.', 'Renuncio a todas las reuniones que pudieron ser un correo.', 'La planta del escritorio se queda con la empresa. Ya firmó.'],
  backToWork: 'Volver al trabajo', resignConfirm: 'Confirmar renuncia',
  burnoutTitle: 'Licencia por estrés', burnoutLine: 'El médico laboral recetó mantenerse lejos de las planillas por tiempo indefinido.',
  quitLine: 'Renuncia voluntaria, con acta firmada.', reasonsBurnout: 'Lo que llevó al agotamiento', reasonsQuit: 'Lo que más pesó en tu carrera',
  profile: 'Perfil', badgeTitle: 'Credencial', editBadge: 'Editar credencial', nameLabel: 'Nombre', namePh: 'Tu nombre en la credencial', defaultName: 'Empleado',
  avatarLabel: 'Avatar', photoLabel: 'Foto del dispositivo', photoPick: 'Elegir foto', photoClear: 'Usar avatar', save: 'Guardar',
  customize: 'Personalizar computadora', hwTitle: 'Tu computadora', monitorLabel: 'Monitor', keyboardLabel: 'Teclado', mouseLabel: 'Mouse',
  allLabel: 'Todo igual', cream: 'Crema', graphite: 'Grafito', wallLabel: 'Fondo de pantalla', hwNote: 'El equipo aparece en el escritorio de la oficina (computadora).',
  walls: { teal: 'Petróleo', grid: 'Cuadriculado', hills: 'Colinas', night: 'Noche' },
});

// Entrega 2: pausa para descansar, colega (Duda, da TI), minigames, luzes
LANGS.pt.call = {
  incoming: 'Chamada de vídeo', ringIn: 'está ligando…', calling: 'Chamando…', you: 'Você', mic: 'Microfone', cam: 'Câmera', who: 'Duda · TI', answer: 'Atender', decline: 'Recusar', hangup: 'Encerrar', resuming: 'Voltando em',
  greet: ['Psiu! Tá ocupado? Pergunta retórica, eu sei que tá.', 'Oi! Fingi uma reunião pra te ligar. Ninguém percebeu.', 'E aí! Minha planilha travou e eu decidi que isso é um sinal.'],
  talk: [['Você também sente que o dia tem 40 horas?', 'Sinto 50', 'Tá tranquilo', 'Isso é o espírito da firma.', 'Mentira boa, gostei.'],
         ['O café da copa acabou de novo. Suspeito do RH.', 'Sabotagem', 'Eu trouxe o meu', 'Concordo. Vou abrir um chamado.', 'Traidor... mas inteligente.'],
         ['Meu chefe pediu "um ajuste rapidinho". Faz três semanas.', 'Clássico', 'Coragem', 'Rapidinho é unidade de tempo infinita.', 'Valeu. Vou precisar.']],
  invite: ['Bora jogar uma partidinha? Cinco minutos. Ou quarenta segundos.', 'Achei um joguinho no servidor de testes. Bora?'],
  yes: 'Bora!', no: 'Agora não',
  declined: ['Justo. Volta pro batente, herói.', 'Tranquilo, fica pra próxima!'],
  arcade: ['Ah, PLAYER ONE. Sabia que você ia achar o arcade secreto.', 'Bem-vindo à sala de jogos que oficialmente não existe.'],
  good: ['Uau! Vou colocar isso no seu currículo.', 'Isso foi lindo. Quase chorei no headset.'],
  ok: ['Nada mal! Dá pra melhorar, como tudo nessa empresa.', 'Mandou bem. Sem hora extra, mas mandou bem.'],
  bad: ['Pelo menos você tentou. É o que a gente fala na avaliação.', 'Hmm. Vamos chamar isso de aquecimento.'],
  bye: ['Fui! O chefe tá passando.', 'Tchau! Se perguntarem, era reunião de alinhamento.', 'Valeu! Volto em três dias. Ou quando a planilha travar.'],
  again: 'Jogar de novo', menu: 'Voltar ao menu',
};
LANGS.en.call = {
  incoming: 'Video call', ringIn: 'is calling…', calling: 'Calling…', you: 'You', mic: 'Microphone', cam: 'Camera', who: 'Duda · IT', answer: 'Answer', decline: 'Decline', hangup: 'Hang up', resuming: 'Back in',
  greet: ['Psst! Busy? Rhetorical question, I know you are.', 'Hi! I faked a meeting to call you. Nobody noticed.', 'Hey! My spreadsheet crashed and I took it as a sign.'],
  talk: [['Do you also feel the day has 40 hours?', 'Feels like 50', 'All good here', 'That is the company spirit.', 'Nice lie, I like it.'],
         ['The break room coffee ran out again. I suspect HR.', 'Sabotage', 'I brought mine', 'Agreed. I will open a ticket.', 'Traitor... but smart.'],
         ['My boss asked for "a quick tweak". Three weeks ago.', 'Classic', 'Hang in there', '"Quick" is an infinite unit of time.', 'Thanks. I will need it.']],
  invite: ['Wanna play a quick game? Five minutes. Or forty seconds.', 'I found a little game on the test server. Shall we?'],
  yes: 'Let\'s go!', no: 'Not now',
  declined: ['Fair. Back to the grind, hero.', 'No worries, next time!'],
  arcade: ['Ah, PLAYER ONE. I knew you would find the secret arcade.', 'Welcome to the game room that officially does not exist.'],
  good: ['Wow! I am putting this on your résumé.', 'That was beautiful. I almost cried into my headset.'],
  ok: ['Not bad! Room for improvement, like everything here.', 'Nice one. No overtime pay, but nice.'],
  bad: ['At least you tried. That is what we say in reviews.', 'Hmm. Let us call that a warm-up.'],
  bye: ['Gotta go! The boss is coming.', 'Bye! If anyone asks, it was an alignment meeting.', 'Thanks! See you in three days. Or when the spreadsheet crashes.'],
  again: 'Play again', menu: 'Back to menu',
};
LANGS.es.call = {
  incoming: 'Videollamada', ringIn: 'está llamando…', calling: 'Llamando…', you: 'Tú', mic: 'Micrófono', cam: 'Cámara', who: 'Duda · TI', answer: 'Contestar', decline: 'Rechazar', hangup: 'Colgar', resuming: 'Volvemos en',
  greet: ['¡Pss! ¿Ocupado? Pregunta retórica, ya sé que sí.', '¡Hola! Inventé una reunión para llamarte. Nadie se dio cuenta.', '¡Ey! Mi planilla se colgó y lo tomé como una señal.'],
  talk: [['¿También sientes que el día tiene 40 horas?', 'Siento 50', 'Todo tranquilo', 'Ese es el espíritu de la empresa.', 'Buena mentira, me gusta.'],
         ['Se acabó el café de la cocina otra vez. Sospecho de RR. HH.', 'Sabotaje', 'Traje el mío', 'De acuerdo. Abro un ticket.', 'Traidor... pero listo.'],
         ['Mi jefe pidió "un ajuste rapidito". Hace tres semanas.', 'Clásico', 'Ánimo', 'Rapidito es una unidad de tiempo infinita.', 'Gracias. Lo voy a necesitar.']],
  invite: ['¿Jugamos una partidita? Cinco minutos. O cuarenta segundos.', 'Encontré un jueguito en el servidor de pruebas. ¿Vamos?'],
  yes: '¡Vamos!', no: 'Ahora no',
  declined: ['Justo. Vuelve al trabajo, héroe.', '¡Tranquilo, para la próxima!'],
  arcade: ['Ah, PLAYER ONE. Sabía que encontrarías el arcade secreto.', 'Bienvenido a la sala de juegos que oficialmente no existe.'],
  good: ['¡Guau! Voy a poner esto en tu currículum.', 'Eso fue hermoso. Casi lloro en el auricular.'],
  ok: ['¡Nada mal! Se puede mejorar, como todo en esta empresa.', 'Bien hecho. Sin horas extra, pero bien.'],
  bad: ['Al menos lo intentaste. Es lo que decimos en la evaluación.', 'Hmm. Llamémoslo calentamiento.'],
  bye: ['¡Me voy! Viene el jefe.', '¡Chau! Si preguntan, era reunión de alineamiento.', '¡Gracias! Nos vemos en tres días. O cuando se cuelgue la planilla.'],
  again: 'Jugar otra vez', menu: 'Volver al menú',
};
Object.assign(LANGS.pt.ui, { mgRhythm: 'Batida de Ponto', mgShooter: 'Exterminador de Pendências', mgRhythmHelp: 'D F J K ou toque nas colunas quando a nota chegar na linha', mgRhythmHelpT: 'Toque nas colunas quando a nota chegar na linha',
  mgShooterHelp: 'A/D ou ← → para mover · Espaço atira', mgShooterHelpT: 'Arraste a nave · o disparo é automático', mgPerfect: 'PERFEITO', mgGood: 'BOM', mgMiss: 'ERRO', mgScore: 'Pontos', mgCombo: 'Combo', mgLives: 'Vidas', mgReady: 'Prepare-se!', mgEnd: 'Fim de jogo', mgBest: 'Melhor combo', mgAcc: 'Precisão',
  lights: 'Luminária', lightOn: 'Ligada', lightOff: 'Desligada', arcadeBtn: 'Arcade' });
Object.assign(LANGS.en.ui, { mgRhythm: 'Punch-In Beat', mgShooter: 'Backlog Exterminator', mgRhythmHelp: 'D F J K or tap the columns when the note hits the line', mgRhythmHelpT: 'Tap the columns when the note hits the line',
  mgShooterHelp: 'A/D or ← → to move · Space shoots', mgShooterHelpT: 'Drag the ship · firing is automatic', mgPerfect: 'PERFECT', mgGood: 'GOOD', mgMiss: 'MISS', mgScore: 'Score', mgCombo: 'Combo', mgLives: 'Lives', mgReady: 'Get ready!', mgEnd: 'Game over', mgBest: 'Best combo', mgAcc: 'Accuracy',
  lights: 'Desk lamp', lightOn: 'On', lightOff: 'Off', arcadeBtn: 'Arcade' });
Object.assign(LANGS.es.ui, { mgRhythm: 'Ritmo de Fichaje', mgShooter: 'Exterminador de Pendientes', mgRhythmHelp: 'D F J K o toca las columnas cuando la nota llegue a la línea', mgRhythmHelpT: 'Toca las columnas cuando la nota llegue a la línea',
  mgShooterHelp: 'A/D o ← → para moverte · Espacio dispara', mgShooterHelpT: 'Arrastra la nave · el disparo es automático', mgPerfect: 'PERFECTO', mgGood: 'BIEN', mgMiss: 'FALLO', mgScore: 'Puntos', mgCombo: 'Combo', mgLives: 'Vidas', mgReady: '¡Prepárate!', mgEnd: 'Fin del juego', mgBest: 'Mejor combo', mgAcc: 'Precisión',
  lights: 'Lámpara', lightOn: 'Encendida', lightOff: 'Apagada', arcadeBtn: 'Arcade' });
Object.assign(LANGS.pt.ui, { mgInfinite: 'Modo infinito', songs: ['Segunda-feira', 'Hora do Café', 'Fechamento do Mês'], mgPickGame: 'Escolha o jogo', mgPickSong: 'Escolha a música', mgSurprise: 'Surpresa' });
Object.assign(LANGS.en.ui, { mgInfinite: 'Endless mode', songs: ['Monday Morning', 'Coffee Break', 'Month-End Close'], mgPickGame: 'Pick a game', mgPickSong: 'Pick a song', mgSurprise: 'Surprise me' });
Object.assign(LANGS.es.ui, { mgInfinite: 'Modo infinito', songs: ['Lunes', 'Hora del Café', 'Cierre de Mes'], mgPickGame: 'Elige el juego', mgPickSong: 'Elige la canción', mgSurprise: 'Sorpresa' });
LANGS.pt.call.inviteG = ['Bora jogar {g}? Cinco minutos. Ou quarenta segundos.', 'Achei o {g} no servidor de testes. Bora?', 'Hoje é dia de {g}. Topa?'];
LANGS.en.call.inviteG = ['Wanna play {g}? Five minutes. Or forty seconds.', 'I found {g} on the test server. Shall we?', 'Today is a {g} kind of day. You in?'];
LANGS.es.call.inviteG = ['¿Jugamos {g}? Cinco minutos. O cuarenta segundos.', 'Encontré {g} en el servidor de pruebas. ¿Vamos?', 'Hoy toca {g}. ¿Te animas?'];
LANGS.pt.call.byeArcade = ['Volta quando quiser. O arcade nunca fecha.', 'Até a próxima, PLAYER ONE!'];
LANGS.en.call.byeArcade = ['Come back anytime. The arcade never closes.', 'See you next time, PLAYER ONE!'];
LANGS.es.call.byeArcade = ['Vuelve cuando quieras. El arcade nunca cierra.', '¡Hasta la próxima, PLAYER ONE!'];
LANGS.pt.ui.av = { title: 'Personagem', random: 'Aleatório', reset: 'Padrão', editChar: 'Editar personagem', importPhoto: 'Importar foto', useChar: 'Usar personagem',
  tabs: { hair: 'Cabelo', skin: 'Pele', eyes: 'Olhos', outfit: 'Roupa', bg: 'Fundo' },
  labels: { hair: 'Estilo', hairColor: 'Cor', skin: 'Tom de pele', eyes: 'Formato', eyeColor: 'Cor dos olhos', brows: 'Sobrancelhas', outfit: 'Modelo', outfitColor: 'Cor', detail: 'Detalhe', detailColor: 'Cor do detalhe', bg: 'Fundo do crachá' },
  names: { curto: 'Curto', repartido: 'Repartido', medio: 'Médio', longo: 'Longo', raspado: 'Raspado', cacheado: 'Cacheado', crespo: 'Crespo', franja: 'Franja', coque: 'Coque', rabo: 'Rabo de cavalo', careca: 'Careca',
    redondo: 'Redondo', amendoa: 'Amêndoa', sonolento: 'Sonolento', feliz: 'Feliz', arregalado: 'Arregalado', felino: 'Felino', normal: 'Normal', grossa: 'Grossa', arqueada: 'Arqueada', reta: 'Reta', nenhuma: 'Nenhuma',
    camiseta: 'Camiseta', camisa: 'Camisa', social: 'Social', moletom: 'Moletom', polo: 'Polo', sueter: 'Suéter', nenhum: 'Nenhum', gravata: 'Gravata', listras: 'Listras', cracha: 'Cordão',
    azul: 'Azul', menta: 'Menta', creme: 'Creme', quadriculado: 'Quadriculado', noite: 'Noite', escritorio: 'Escritório', 'por-do-sol': 'Pôr do sol' } };
LANGS.en.ui.av = { title: 'Character', random: 'Random', reset: 'Default', editChar: 'Edit character', importPhoto: 'Import photo', useChar: 'Use character',
  tabs: { hair: 'Hair', skin: 'Skin', eyes: 'Eyes', outfit: 'Outfit', bg: 'Background' },
  labels: { hair: 'Style', hairColor: 'Color', skin: 'Skin tone', eyes: 'Shape', eyeColor: 'Eye color', brows: 'Eyebrows', outfit: 'Style', outfitColor: 'Color', detail: 'Detail', detailColor: 'Detail color', bg: 'Badge background' },
  names: { curto: 'Short', repartido: 'Side part', medio: 'Medium', longo: 'Long', raspado: 'Buzz cut', cacheado: 'Curly', crespo: 'Afro', franja: 'Bangs', coque: 'Bun', rabo: 'Ponytail', careca: 'Bald',
    redondo: 'Round', amendoa: 'Almond', sonolento: 'Sleepy', feliz: 'Happy', arregalado: 'Wide', felino: 'Feline', normal: 'Normal', grossa: 'Thick', arqueada: 'Arched', reta: 'Straight', nenhuma: 'None',
    camiseta: 'T-shirt', camisa: 'Shirt', social: 'Suit', moletom: 'Hoodie', polo: 'Polo', sueter: 'Sweater', nenhum: 'None', gravata: 'Tie', listras: 'Stripes', cracha: 'Lanyard',
    azul: 'Blue', menta: 'Mint', creme: 'Cream', quadriculado: 'Checkered', noite: 'Night', escritorio: 'Office', 'por-do-sol': 'Sunset' } };
LANGS.es.ui.av = { title: 'Personaje', random: 'Aleatorio', reset: 'Por defecto', editChar: 'Editar personaje', importPhoto: 'Importar foto', useChar: 'Usar personaje',
  tabs: { hair: 'Pelo', skin: 'Piel', eyes: 'Ojos', outfit: 'Ropa', bg: 'Fondo' },
  labels: { hair: 'Estilo', hairColor: 'Color', skin: 'Tono de piel', eyes: 'Forma', eyeColor: 'Color de ojos', brows: 'Cejas', outfit: 'Modelo', outfitColor: 'Color', detail: 'Detalle', detailColor: 'Color del detalle', bg: 'Fondo de la credencial' },
  names: { curto: 'Corto', repartido: 'Raya al lado', medio: 'Medio', longo: 'Largo', raspado: 'Rapado', cacheado: 'Rizado', crespo: 'Afro', franja: 'Flequillo', coque: 'Moño', rabo: 'Coleta', careca: 'Calvo',
    redondo: 'Redondo', amendoa: 'Almendra', sonolento: 'Somnoliento', feliz: 'Feliz', arregalado: 'Abierto', felino: 'Felino', normal: 'Normal', grossa: 'Gruesa', arqueada: 'Arqueada', reta: 'Recta', nenhuma: 'Ninguna',
    camiseta: 'Camiseta', camisa: 'Camisa', social: 'Traje', moletom: 'Sudadera', polo: 'Polo', sueter: 'Suéter', nenhum: 'Ninguno', gravata: 'Corbata', listras: 'Rayas', cracha: 'Cordón',
    azul: 'Azul', menta: 'Menta', creme: 'Crema', quadriculado: 'Cuadriculado', noite: 'Noche', escritorio: 'Oficina', 'por-do-sol': 'Atardecer' } };
LANGS.pt.ui.ph = { title: 'Enquadrar foto', result: 'Crachá', small: 'Documentos e mesa', face: 'Rosto', bust: 'Cabeça e busto', detail: 'Detalhado', classic: 'Clássico', zoom: 'Aproximar', bright: 'Brilho', contrast: 'Contraste', sat: 'Saturação', dither: 'Pontilhado', confirm: 'Usar esta foto', removePhoto: 'Excluir foto' };
LANGS.en.ui.ph = { title: 'Frame photo', result: 'Badge', small: 'Documents and desk', face: 'Face', bust: 'Head and shoulders', detail: 'Detailed', classic: 'Classic', zoom: 'Zoom', bright: 'Brightness', contrast: 'Contrast', sat: 'Saturation', dither: 'Dithering', confirm: 'Use this photo', removePhoto: 'Delete photo' };
LANGS.es.ui.ph = { title: 'Encuadrar foto', result: 'Credencial', small: 'Documentos y escritorio', face: 'Rostro', bust: 'Cabeza y busto', detail: 'Detallado', classic: 'Clásico', zoom: 'Acercar', bright: 'Brillo', contrast: 'Contraste', sat: 'Saturación', dither: 'Tramado', confirm: 'Usar esta foto', removePhoto: 'Eliminar foto' };
Object.assign(LANGS.pt.ui, { experimental: 'Experimental', balTitle: 'Balanceamento (teste)', balNote: 'Só para avaliação. Cada opção tem carteira, enfeites, recorde e carreira próprios; trocar recarrega o jogo.',
  balNames: { original: 'Original', intermediaria: 'Intermediária', longa: 'Longa' }, balDesc: { original: 'Valores atuais do jogo.', intermediaria: 'Progressão mais equilibrada (CEO perto do dia 12 a 15).', longa: 'Carreira longa (CEO perto do dia 18).' },
  backup: 'Backup', exportSave: 'Exportar', importSave: 'Importar', importBad: 'Arquivo inválido: nada foi alterado.', importOk: 'Backup importado. Recarregando…', importAsk: 'Substituir o progresso atual por este backup?' });
Object.assign(LANGS.en.ui, { experimental: 'Experimental', balTitle: 'Balance (testing)', balNote: 'For evaluation only. Each option has its own wallet, decorations, record and career; switching reloads the game.',
  balNames: { original: 'Original', intermediaria: 'Intermediate', longa: 'Long' }, balDesc: { original: 'Current game values.', intermediaria: 'More balanced progression (CEO around day 12 to 15).', longa: 'Long career (CEO around day 18).' },
  backup: 'Backup', exportSave: 'Export', importSave: 'Import', importBad: 'Invalid file: nothing was changed.', importOk: 'Backup imported. Reloading…', importAsk: 'Replace current progress with this backup?' });
Object.assign(LANGS.es.ui, { experimental: 'Experimental', balTitle: 'Balance (prueba)', balNote: 'Solo para evaluación. Cada opción tiene su billetera, adornos, récord y carrera; cambiar recarga el juego.',
  balNames: { original: 'Original', intermediaria: 'Intermedia', longa: 'Larga' }, balDesc: { original: 'Valores actuales del juego.', intermediaria: 'Progresión más equilibrada (CEO cerca del día 12 a 15).', longa: 'Carrera larga (CEO cerca del día 18).' },
  backup: 'Copia', exportSave: 'Exportar', importSave: 'Importar', importBad: 'Archivo inválido: no se cambió nada.', importOk: 'Copia importada. Recargando…', importAsk: '¿Reemplazar el progreso actual con esta copia?' });
LANGS.pt.ui.mgQuit = 'Sair'; LANGS.en.ui.mgQuit = 'Quit'; LANGS.es.ui.mgQuit = 'Salir';
// Duda (TI): sarcástico e carinhoso, cuida do cacto "Firewall", tem rixa com a impressora do 3º andar, coleciona fliperamas
Object.assign(LANGS.pt.call, {
  greet: ['Psiu! Tá ocupado? Pergunta retórica, eu sei que tá.', 'Oi! Fingi uma reunião pra te ligar. Ninguém percebeu.', 'E aí! Minha planilha travou e eu decidi que isso é um sinal.',
    'Fala! Acabei de reiniciar o servidor. Temos uns dez minutos de paz.', 'Oi, aqui é o Duda. Sim, da TI. Não, não vou resetar sua senha agora.', 'Ei! O Firewall, meu cacto, mandou um oi. Ele te acha produtivo demais.',
    'Oi! A impressora do 3º andar me desafiou de novo. Preciso de uma pausa antes do segundo round.'],
  talk: [['Você também sente que o dia tem 40 horas?', 'Sinto 50', 'Tá tranquilo', 'Isso é o espírito da firma.', 'Mentira boa, gostei.'],
    ['O café da copa acabou de novo. Suspeito do RH.', 'Sabotagem', 'Eu trouxe o meu', 'Concordo. Vou abrir um chamado.', 'Traidor... mas inteligente.'],
    ['Meu chefe pediu "um ajuste rapidinho". Faz três semanas.', 'Clássico', 'Coragem', 'Rapidinho é unidade de tempo infinita.', 'Valeu. Vou precisar.'],
    ['Alguém usou "Senha123" de novo. Adivinha quem foi?', 'Fui eu', 'O chefe?', 'Eu sei. Já troquei pra "Senha124".', 'Quase. Foi o diretor. Duas vezes.'],
    ['Você já tentou desligar e ligar de novo? Digo, você mesmo. Funciona.', 'Vou tentar', 'Já tô desligado', 'Faz bem. Eu faço todo dia às 18h.', 'Modo economia de energia. Respeito.'],
    ['A impressora do 3º andar imprimiu um PDF em branco 400 vezes.', 'Ela te odeia', 'Que poético', 'É recíproco.', 'Arte moderna. Vou emoldurar.'],
    ['Encontrei um fliperama velho no depósito. Liga e tudo.', 'Mentira!', 'Sério?', 'Juro! Tá na sala do servidor, não conta pra ninguém.', 'Sério. É por isso que eu sumo às vezes.']],
  good: ['Uau! Vou colocar isso no seu currículo.', 'Isso foi lindo. Quase chorei no headset.', 'Recorde do andar! O Firewall ficou impressionado. Bom, ele é um cacto.', 'Você joga melhor que o estagiário que eu treinei por um ano.'],
  ok: ['Nada mal! Dá pra melhorar, como tudo nessa empresa.', 'Mandou bem. Sem hora extra, mas mandou bem.', 'Média sólida. Tipo nosso Wi-Fi às sextas.'],
  bad: ['Pelo menos você tentou. É o que a gente fala na avaliação.', 'Hmm. Vamos chamar isso de aquecimento.', 'Tudo bem, eu também perdi pra impressora hoje.'],
  bye: ['Fui! O chefe tá passando.', 'Tchau! Se perguntarem, era reunião de alinhamento.', 'Valeu! Volto em três dias. Ou quando a planilha travar.', 'Vou lá regar o Firewall. Até!', 'Round dois contra a impressora. Me deseja sorte!'],
});
Object.assign(LANGS.en.call, {
  greet: ['Psst! Busy? Rhetorical question, I know you are.', 'Hi! I faked a meeting to call you. Nobody noticed.', 'Hey! My spreadsheet crashed and I took it as a sign.',
    'Hey! I just rebooted the server. We have about ten minutes of peace.', 'Hi, Duda here. Yes, from IT. No, I will not reset your password right now.', 'Hey! Firewall, my cactus, says hi. He thinks you are too productive.',
    'Hi! The third-floor printer challenged me again. I need a break before round two.'],
  talk: [['Do you also feel the day has 40 hours?', 'Feels like 50', 'All good here', 'That is the company spirit.', 'Nice lie, I like it.'],
    ['The break room coffee ran out again. I suspect HR.', 'Sabotage', 'I brought mine', 'Agreed. I will open a ticket.', 'Traitor... but smart.'],
    ['My boss asked for "a quick tweak". Three weeks ago.', 'Classic', 'Hang in there', '"Quick" is an infinite unit of time.', 'Thanks. I will need it.'],
    ['Someone used "Password123" again. Guess who?', 'It was me', 'The boss?', 'I know. I changed it to "Password124".', 'Close. The director. Twice.'],
    ['Have you tried turning it off and on again? I mean you. It works.', 'I will try', 'Already off', 'Good. I do it every day at 6 p.m.', 'Power saving mode. Respect.'],
    ['The third-floor printer printed a blank PDF 400 times.', 'It hates you', 'How poetic', 'The feeling is mutual.', 'Modern art. I will frame it.'],
    ['I found an old arcade cabinet in storage. It even turns on.', 'No way!', 'Seriously?', 'I swear! It is in the server room, do not tell anyone.', 'Seriously. That is why I disappear sometimes.']],
  good: ['Wow! I am putting this on your résumé.', 'That was beautiful. I almost cried into my headset.', 'Floor record! Firewall is impressed. Well, he is a cactus.', 'You play better than the intern I trained for a year.'],
  ok: ['Not bad! Room for improvement, like everything here.', 'Nice one. No overtime pay, but nice.', 'Solid average. Like our Wi-Fi on Fridays.'],
  bad: ['At least you tried. That is what we say in reviews.', 'Hmm. Let us call that a warm-up.', 'It is fine, I lost to the printer today too.'],
  bye: ['Gotta go! The boss is coming.', 'Bye! If anyone asks, it was an alignment meeting.', 'Thanks! See you in three days. Or when the spreadsheet crashes.', 'Off to water Firewall. See you!', 'Round two against the printer. Wish me luck!'],
});
Object.assign(LANGS.es.call, {
  greet: ['¡Pss! ¿Ocupado? Pregunta retórica, ya sé que sí.', '¡Hola! Inventé una reunión para llamarte. Nadie se dio cuenta.', '¡Ey! Mi planilla se colgó y lo tomé como una señal.',
    '¡Hola! Acabo de reiniciar el servidor. Tenemos unos diez minutos de paz.', 'Hola, soy Duda. Sí, de TI. No, no voy a resetear tu contraseña ahora.', '¡Ey! Firewall, mi cactus, te manda saludos. Dice que eres demasiado productivo.',
    '¡Hola! La impresora del tercer piso me desafió otra vez. Necesito una pausa antes del segundo round.'],
  talk: [['¿También sientes que el día tiene 40 horas?', 'Siento 50', 'Todo tranquilo', 'Ese es el espíritu de la empresa.', 'Buena mentira, me gusta.'],
    ['Se acabó el café de la cocina otra vez. Sospecho de RR. HH.', 'Sabotaje', 'Traje el mío', 'De acuerdo. Abro un ticket.', 'Traidor... pero listo.'],
    ['Mi jefe pidió "un ajuste rapidito". Hace tres semanas.', 'Clásico', 'Ánimo', 'Rapidito es una unidad de tiempo infinita.', 'Gracias. Lo voy a necesitar.'],
    ['Alguien usó "Clave123" otra vez. ¿Adivina quién?', 'Fui yo', '¿El jefe?', 'Lo sé. Ya la cambié a "Clave124".', 'Casi. El director. Dos veces.'],
    ['¿Probaste apagar y prender de nuevo? Digo, tú mismo. Funciona.', 'Lo intentaré', 'Ya estoy apagado', 'Bien. Yo lo hago todos los días a las 18 h.', 'Modo ahorro de energía. Respeto.'],
    ['La impresora del tercer piso imprimió un PDF en blanco 400 veces.', 'Te odia', 'Qué poético', 'Es mutuo.', 'Arte moderno. Lo voy a enmarcar.'],
    ['Encontré un arcade viejo en el depósito. Hasta prende.', '¡No puede ser!', '¿En serio?', '¡Lo juro! Está en la sala del servidor, no le digas a nadie.', 'En serio. Por eso desaparezco a veces.']],
  good: ['¡Guau! Voy a poner esto en tu currículum.', 'Eso fue hermoso. Casi lloro en el auricular.', '¡Récord del piso! Firewall quedó impresionado. Bueno, es un cactus.', 'Juegas mejor que el pasante que entrené durante un año.'],
  ok: ['¡Nada mal! Se puede mejorar, como todo en esta empresa.', 'Bien hecho. Sin horas extra, pero bien.', 'Promedio sólido. Como nuestro Wi-Fi los viernes.'],
  bad: ['Al menos lo intentaste. Es lo que decimos en la evaluación.', 'Hmm. Llamémoslo calentamiento.', 'Tranquilo, yo también perdí contra la impresora hoy.'],
  bye: ['¡Me voy! Viene el jefe.', '¡Chau! Si preguntan, era reunión de alineamiento.', '¡Gracias! Nos vemos en tres días. O cuando se cuelgue la planilla.', 'Voy a regar a Firewall. ¡Hasta luego!', 'Segundo round contra la impresora. ¡Deséame suerte!'],
});
Object.assign(LANGS.pt.ui.walls, { ondas: 'Ondas', cidade: 'Cidade', logo: 'Logotipo', blocos: 'Blocos' });
Object.assign(LANGS.en.ui.walls, { ondas: 'Waves', cidade: 'City', logo: 'Logo', blocos: 'Blocks' });
Object.assign(LANGS.es.ui.walls, { ondas: 'Olas', cidade: 'Ciudad', logo: 'Logotipo', blocos: 'Bloques' });
Object.assign(LANGS.pt.shop, { cacto: ['Cacto', 'Fica em cima do monitor. Não precisa de água, só de paciência.'], radio: ['Rádio retrô', 'Toca baixinho em cima do monitor.'], aquario: ['Aquário', 'Um peixinho que trabalha mais tranquilo que você.'] });
Object.assign(LANGS.en.shop, { cacto: ['Cactus', 'Sits on the monitor. Needs no water, only patience.'], radio: ['Retro radio', 'Plays softly on top of the monitor.'], aquario: ['Fishbowl', 'A fish that works more calmly than you.'] });
Object.assign(LANGS.es.shop, { cacto: ['Cactus', 'Va encima del monitor. No necesita agua, solo paciencia.'], radio: ['Radio retro', 'Suena bajito encima del monitor.'], aquario: ['Pecera', 'Un pez que trabaja más tranquilo que tú.'] });
Object.assign(LANGS.pt.ui, { catLabel: 'Gato', coats: { tricolor: 'Tricolor', 'cinza-tigrado': 'Tigrado cinza', 'laranja-tigrado': 'Tigrado laranja', laranja: 'Laranja', preto: 'Preto', branco: 'Branco', frajola: 'Frajola', siames: 'Siamês' } });
Object.assign(LANGS.en.ui, { catLabel: 'Cat', coats: { tricolor: 'Calico', 'cinza-tigrado': 'Gray tabby', 'laranja-tigrado': 'Orange tabby', laranja: 'Orange', preto: 'Black', branco: 'White', frajola: 'Tuxedo', siames: 'Siamese' } });
Object.assign(LANGS.es.ui, { catLabel: 'Gato', coats: { tricolor: 'Tricolor', 'cinza-tigrado': 'Atigrado gris', 'laranja-tigrado': 'Atigrado naranja', laranja: 'Naranja', preto: 'Negro', branco: 'Blanco', frajola: 'Esmoquin', siames: 'Siamés' } });
LANGS.pt.ui.tagline = 'Um expediente aconchegante que vai perdendo o controle.';
LANGS.en.ui.tagline = 'A cozy workday that slowly loses control.';
LANGS.es.ui.tagline = 'Una jornada acogedora que se va descontrolando.';
LANGS.pt.ui.saveMenu = 'Salvar e ir ao menu'; LANGS.en.ui.saveMenu = 'Save and quit to menu'; LANGS.es.ui.saveMenu = 'Guardar e ir al menú';
LANGS.pt.ui.shutdown = 'Desligar'; LANGS.en.ui.shutdown = 'Shut down'; LANGS.es.ui.shutdown = 'Apagar';
LANGS.pt.ui.shuttingDown = 'Desligando o WorkOS…'; LANGS.en.ui.shuttingDown = 'Shutting down WorkOS…'; LANGS.es.ui.shuttingDown = 'Apagando WorkOS…';
LANGS.pt.ui.customizePc = 'Personalizar'; LANGS.en.ui.customizePc = 'Customize'; LANGS.es.ui.customizePc = 'Personalizar';
LANGS.pt.ui.diffLabel = 'Dificuldade'; LANGS.en.ui.diffLabel = 'Difficulty'; LANGS.es.ui.diffLabel = 'Dificultad';
LANGS.pt.ui.diffNames = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil', burnout: 'Burnout' };
LANGS.en.ui.diffNames = { facil: 'Easy', normal: 'Normal', dificil: 'Hard', burnout: 'Burnout' };
LANGS.es.ui.diffNames = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil', burnout: 'Burnout' };
LANGS.pt.ui.diffLocked = 'Fixa durante a carreira. Escolha ao começar uma nova.'; LANGS.en.ui.diffLocked = 'Locked for the whole career. Pick it when starting a new one.'; LANGS.es.ui.diffLocked = 'Fija durante la carrera. Elígela al empezar una nueva.';
LANGS.pt.call.inviteAny = ['Bora uma partida? Escolhe aí:', 'Tenho dois jogos rodando no servidor de testes. Qual vai ser?', 'Pausa merecida. Cinco minutos. Ou quarenta segundos. Qual jogo?', 'Ninguém da TI está olhando. Quer dizer, eu sou a TI. Escolhe:'];
LANGS.en.call.inviteAny = ['Up for a round? Pick one:', 'I have two games running on the test server. Which one?', 'Well-deserved break. Five minutes. Or forty seconds. Which game?', 'Nobody from IT is watching. Well, I am IT. Pick:'];
LANGS.es.call.inviteAny = ['¿Una partida? Elige:', 'Tengo dos juegos en el servidor de pruebas. ¿Cuál?', 'Pausa merecida. Cinco minutos. O cuarenta segundos. ¿Qué juego?', 'Nadie de TI está mirando. Bueno, yo soy TI. Elige:'];
Object.assign(LANGS.pt.ui, { winTitle: 'Carreira concluída', winStamp: 'CEO', winLine: 'Dez dias, do estágio à presidência. A soma de todos os expedientes vai para o quadro de honra.' });
Object.assign(LANGS.en.ui, { winTitle: 'Career complete', winStamp: 'CEO', winLine: 'Ten days, from intern to the corner office. Every shift adds up to the final score.' });
Object.assign(LANGS.es.ui, { winTitle: 'Carrera completada', winStamp: 'CEO', winLine: 'Diez días, de becario a la presidencia. La suma de todas las jornadas va al cuadro de honor.' });
LANGS.pt.ui.diffDesc = { facil: 'Documentos mais lentos, prazos longos, menos estresse.', normal: 'O expediente como foi pensado.', dificil: 'Mais tarefas, prazos curtos, o chefe aparece mais.', burnout: 'Tudo ao mesmo tempo. Boa sorte.' };
LANGS.en.ui.diffDesc = { facil: 'Slower files, longer deadlines, less stress.', normal: 'The workday as designed.', dificil: 'More tasks, tighter deadlines, more interruptions.', burnout: 'Everything at once. Good luck.' };
LANGS.es.ui.diffDesc = { facil: 'Documentos más lentos, plazos largos, menos estrés.', normal: 'La jornada tal como fue pensada.', dificil: 'Más tareas, plazos cortos, más interrupciones.', burnout: 'Todo a la vez. Suerte.' };
LANGS.pt.ui.diffStart = 'Começar'; LANGS.en.ui.diffStart = 'Start'; LANGS.es.ui.diffStart = 'Empezar';
LANGS.pt.ui.loading = 'Carregando expediente…'; LANGS.en.ui.loading = 'Loading workday…'; LANGS.es.ui.loading = 'Cargando jornada…';
LANGS.pt.ui.pressStart = 'Clique no botão ou aperte Enter'; LANGS.en.ui.pressStart = 'Click the button or press Enter'; LANGS.es.ui.pressStart = 'Haz clic en el botón o pulsa Enter';
LANGS.pt.ui.arrival = 'Bom dia!'; LANGS.en.ui.arrival = 'Good morning!'; LANGS.es.ui.arrival = '¡Buenos días!';
LANGS.pt.ui.osApps = { from: 'De: RH · Workday Ltda.', trash: 'Lixeira',
  budget: [['Café', 'R$ 1.240'], ['Post-its', 'R$ 380'], ['Cadeiras novas', 'R$ 0'], ['Consultoria de sinergia', 'R$ 48.000'], ['Festa de fim de ano', 'adiada'], ['TOTAL', 'R$ 49.620']],
  virus: ['Você abriu. Claro que abriu.', 'Instalando 3.482 barras de ferramentas…', 'Parabéns! Você ganhou um iate. Clique para resgatar (não clique).'],
  trashItems: ['planilha_final_FINAL_v3.xls', 'ideias_do_chefe.txt', 'curriculo_atualizado.doc', 'reuniao_que_podia_ser_email.ppt'] };
LANGS.en.ui.osApps = { from: 'From: HR · Workday Ltd.', trash: 'Recycle bin',
  budget: [['Coffee', '$ 1,240'], ['Sticky notes', '$ 380'], ['New chairs', '$ 0'], ['Synergy consulting', '$ 48,000'], ['Holiday party', 'postponed'], ['TOTAL', '$ 49,620']],
  virus: ['You opened it. Of course you did.', 'Installing 3,482 toolbars…', 'Congratulations! You won a yacht. Click to claim (do not click).'],
  trashItems: ['spreadsheet_final_FINAL_v3.xls', 'boss_ideas.txt', 'resume_updated.doc', 'meeting_that_could_be_an_email.ppt'] };
LANGS.es.ui.osApps = { from: 'De: RR. HH. · Workday S.A.', trash: 'Papelera',
  budget: [['Café', '$ 1.240'], ['Post-its', '$ 380'], ['Sillas nuevas', '$ 0'], ['Consultoría de sinergia', '$ 48.000'], ['Fiesta de fin de año', 'aplazada'], ['TOTAL', '$ 49.620']],
  virus: ['Lo abriste. Claro que lo abriste.', 'Instalando 3.482 barras de herramientas…', '¡Felicidades! Ganaste un yate. Haz clic para reclamarlo (no hagas clic).'],
  trashItems: ['planilla_final_FINAL_v3.xls', 'ideas_del_jefe.txt', 'curriculum_actualizado.doc', 'reunion_que_podia_ser_un_correo.ppt'] };
Object.assign(LANGS.pt.ui.osApps, { calendar: 'Calendário', calc: 'Calculadora', notes: 'Bloco de notas', paint: 'Personalizar', saved: 'Salvo no aparelho', week: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  careerDay: n => `Carreira salva: dia ${n} do expediente (dia fictício do jogo).`, noCareer: 'Nenhuma carreira em andamento.' });
Object.assign(LANGS.en.ui.osApps, { calendar: 'Calendar', calc: 'Calculator', notes: 'Notepad', paint: 'Customize', saved: 'Saved on this device', week: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  careerDay: n => `Saved career: workday ${n} (in-game day).`, noCareer: 'No career in progress.' });
Object.assign(LANGS.es.ui.osApps, { calendar: 'Calendario', calc: 'Calculadora', notes: 'Bloc de notas', paint: 'Personalizar', saved: 'Guardado en el dispositivo', week: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  careerDay: n => `Carrera guardada: día ${n} de la jornada (día ficticio del juego).`, noCareer: 'Ninguna carrera en curso.' });
Object.assign(LANGS.pt.ui, { breakStart: 'Intervalo livre', breakEnd: 'Voltar ao expediente' });
Object.assign(LANGS.en.ui, { breakStart: 'Free break', breakEnd: 'Back to work' });
Object.assign(LANGS.es.ui, { breakStart: 'Descanso libre', breakEnd: 'Volver al trabajo' });
Object.assign(LANGS.pt.ui, {"vsYou": "VOCÊ", "vsTurn": "VIRADA!", "vsDudaTurn": "DUDA VIROU!", "vsSolo": "Solo", "vsDuda": "Contra o Duda", "vsRes": {"win": "VOCÊ VENCEU!", "lose": "DUDA VENCEU", "draw": "EMPATE"}});
Object.assign(LANGS.pt.call, {"vsAsk_first": ["Sozinho ou quer medir forças comigo? Nunca te vi jogar, então não prometo piedade.", "Joga solo ou contra mim? Aviso: sou o melhor da TI. Sou o único da TI, mas ainda conta.", "Quer companhia? Eu jogo contra. Juro que não vou mexer no servidor."], "vsAsk_even": ["A gente tá empatado demais. Bora desempatar?", "Rivalidade equilibrada assim só nas finais. Solo ou contra?", "Tá parelho. Hoje alguém sai na frente. Topa?"], "vsAsk_behind": ["Você tá me devendo uma revanche. Quer dizer, eu tô te devendo. Contra?", "Andei treinando no horário de almoço. Contra mim?", "Minha reputação na TI depende disso. Por favor, joga contra."], "vsAsk_ahead": ["Quer apanhar mais um pouco ou vai treinar solo?", "Posso ir com uma mão só, se quiser. Contra?", "Sabe que eu tô na frente, né? Só pra lembrar. Solo ou contra?"], "vsAsk_desperate": ["Três seguidas. Eu atualizei os drivers e tudo. Revanche, agora.", "Ok, você é bom. Mas hoje eu vim de teclado mecânico. Contra?", "Não aguento mais perder. Me dá uma chance de vingança?"], "vsAsk_cocky": ["Mais uma? Tô sem adversário à altura desde... você.", "Sequência de vitórias aqui. Vai tentar quebrar?", "Já pensei no discurso de campeão. Contra?"], "vsGo": ["Valendo! Que vença o mais competente. Ou eu.", "Sem lag, sem desculpa. Bora!", "Já tô aquecendo os dedos. Vai!"], "vsAfter_win": ["{a} a {b}. Tá. Foi sorte. Foi muito sorte.", "Perdi de {b} pra {a}. Vou abrir um chamado contra mim mesmo.", "Você venceu. Isso não sai desta chamada, combinado?"], "vsAfter_lose": ["{b} a {a} pra mim! O rei da TI segue no trono.", "Ganhei! Vou colocar no meu crachá.", "Boa tentativa. Eu diria que foi perto, mas o placar diz {b} a {a}."], "vsAfter_draw": ["Empate! Nem o servidor sabe quem é melhor.", "{a} a {b}. Empatados. Inaceitável. Revanche outro dia.", "Empate técnico. Literalmente técnico, eu sou da TI."], "vsBrokeMe": ["Pronto, acabou minha sequência. Eu tava tão feliz.", "Virada! Você quebrou minha série. Respeito. Com raiva, mas respeito.", "Ok, a coroa caiu. Vou buscar ela depois."], "vsBrokeDuda": ["Finalmente! Quebrei sua sequência! Vou mandar e-mail pra empresa toda.", "Virada do Duda! Eu sabia que o teclado mecânico ia fazer diferença.", "Acabou a festa! A TI voltou!"]});
LANGS.pt.call.vsRecord = (w, l, d) => `(Placar geral: você ${w} × ${l} eu${d ? ' · ' + d + ' =' : ''}.)`;
Object.assign(LANGS.en.ui, {"vsYou": "YOU", "vsTurn": "COMEBACK!", "vsDudaTurn": "DUDA TAKES THE LEAD!", "vsSolo": "Solo", "vsDuda": "Versus Duda", "vsRes": {"win": "YOU WIN!", "lose": "DUDA WINS", "draw": "DRAW"}});
Object.assign(LANGS.en.call, {"vsAsk_first": ["Solo, or want to take me on? Never seen you play, so no mercy promised.", "Solo or against me? Fair warning: I'm the best in IT. I'm the only one in IT, but it counts.", "Want company? I'll play against you. I swear I won't touch the server."], "vsAsk_even": ["We're way too even. Tiebreaker?", "A rivalry this close belongs in the finals. Solo or versus?", "Neck and neck. Someone pulls ahead today. You in?"], "vsAsk_behind": ["I owe you a rematch. I mean, you owe me one. Versus?", "I've been practicing at lunch. Against me?", "My reputation in IT depends on this. Please play versus."], "vsAsk_ahead": ["Want to lose some more, or practice solo?", "I can play one-handed if you want. Versus?", "You know I'm ahead, right? Just a reminder. Solo or versus?"], "vsAsk_desperate": ["Three in a row. I updated the drivers and everything. Rematch, now.", "Fine, you're good. But today I brought a mechanical keyboard. Versus?", "I can't keep losing. Give me a shot at revenge?"], "vsAsk_cocky": ["Another one? Haven't had a worthy rival since... you.", "Win streak over here. Going to try breaking it?", "Already wrote my champion speech. Versus?"], "vsGo": ["Game on! May the most competent win. Or me.", "No lag, no excuses. Go!", "Fingers warmed up. Go!"], "vsAfter_win": ["{a} to {b}. Fine. Lucky. Very lucky.", "Lost {b} to {a}. I'm filing a ticket against myself.", "You won. This stays on this call, deal?"], "vsAfter_lose": ["{b} to {a}, mine! The king of IT keeps the throne.", "I won! Putting it on my badge.", "Nice try. I'd say it was close, but the score says {b} to {a}."], "vsAfter_draw": ["Draw! Even the server doesn't know who's better.", "{a} to {b}. Tied. Unacceptable. Rematch another day.", "Technical draw. Literally technical, I'm IT."], "vsBrokeMe": ["There goes my streak. I was so happy.", "Comeback! You broke my streak. Respect. Angry respect.", "Fine, the crown fell. I'll pick it up later."], "vsBrokeDuda": ["Finally! Broke your streak! I'm emailing the whole company.", "Duda's comeback! I knew the mechanical keyboard would help.", "Party's over! IT is back!"]});
LANGS.en.call.vsRecord = (w, l, d) => `(Overall: you ${w} × ${l} me${d ? ' · ' + d + ' =' : ''}.)`;
Object.assign(LANGS.es.ui, {"vsYou": "TÚ", "vsTurn": "¡REMONTADA!", "vsDudaTurn": "¡DUDA REMONTA!", "vsSolo": "Solo", "vsDuda": "Contra Duda", "vsRes": {"win": "¡GANASTE!", "lose": "GANA DUDA", "draw": "EMPATE"}});
Object.assign(LANGS.es.call, {"vsAsk_first": ["¿Solo o quieres medirte conmigo? Nunca te vi jugar, así que no prometo piedad.", "¿Solo o contra mí? Aviso: soy el mejor de TI. Soy el único de TI, pero cuenta.", "¿Quieres compañía? Juego en contra. Juro que no toco el servidor."], "vsAsk_even": ["Estamos demasiado empatados. ¿Desempatamos?", "Una rivalidad así de pareja es de final. ¿Solo o contra?", "Va parejo. Hoy alguien se adelanta. ¿Te animas?"], "vsAsk_behind": ["Te debo una revancha. Digo, me la debes. ¿Contra?", "Estuve practicando a la hora del almuerzo. ¿Contra mí?", "Mi reputación en TI depende de esto. Por favor, juega contra mí."], "vsAsk_ahead": ["¿Quieres perder un poco más o practicas solo?", "Puedo jugar con una mano, si quieres. ¿Contra?", "Sabes que voy ganando, ¿no? Solo para recordarlo. ¿Solo o contra?"], "vsAsk_desperate": ["Tres seguidas. Actualicé los drivers y todo. Revancha, ya.", "Vale, eres bueno. Pero hoy traje teclado mecánico. ¿Contra?", "No aguanto perder más. ¿Me das la revancha?"], "vsAsk_cocky": ["¿Otra? No tengo rival a la altura desde... ti.", "Racha de victorias por aquí. ¿Vas a intentar romperla?", "Ya escribí mi discurso de campeón. ¿Contra?"], "vsGo": ["¡Va en serio! Que gane el más competente. O yo.", "Sin lag, sin excusas. ¡Vamos!", "Ya calenté los dedos. ¡Dale!"], "vsAfter_win": ["{a} a {b}. Vale. Suerte. Mucha suerte.", "Perdí {b} a {a}. Voy a abrir un ticket contra mí mismo.", "Ganaste. Esto no sale de esta llamada, ¿trato?"], "vsAfter_lose": ["¡{b} a {a} para mí! El rey de TI sigue en el trono.", "¡Gané! Lo pongo en mi credencial.", "Buen intento. Diría que estuvo cerca, pero el marcador dice {b} a {a}."], "vsAfter_draw": ["¡Empate! Ni el servidor sabe quién es mejor.", "{a} a {b}. Empatados. Inaceptable. Revancha otro día.", "Empate técnico. Literalmente técnico, soy de TI."], "vsBrokeMe": ["Adiós a mi racha. Estaba tan feliz.", "¡Remontada! Rompiste mi racha. Respeto. Con rabia, pero respeto.", "Vale, se cayó la corona. La recojo luego."], "vsBrokeDuda": ["¡Por fin! ¡Rompí tu racha! Mando correo a toda la empresa.", "¡Remontada de Duda! Sabía que el teclado mecánico ayudaría.", "¡Se acabó la fiesta! ¡TI ha vuelto!"]});
LANGS.es.call.vsRecord = (w, l, d) => `(General: tú ${w} × ${l} yo${d ? ' · ' + d + ' =' : ''}.)`;
LANGS.pt.ui.hwNames = { cream: 'Creme', graphite: 'Grafite', white: 'Branco', black: 'Preto', silver: 'Prata', blue: 'Azul', mint: 'Menta', peach: 'Pêssego', grape: 'Uva', lemon: 'Limão' };
LANGS.en.ui.hwNames = { cream: 'Cream', graphite: 'Graphite', white: 'White', black: 'Black', silver: 'Silver', blue: 'Blue', mint: 'Mint', peach: 'Peach', grape: 'Grape', lemon: 'Lemon' };
LANGS.es.ui.hwNames = { cream: 'Crema', graphite: 'Grafito', white: 'Blanco', black: 'Negro', silver: 'Plata', blue: 'Azul', mint: 'Menta', peach: 'Durazno', grape: 'Uva', lemon: 'Limón' };
