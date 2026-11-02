/* ================= Textos da progressão de 25 dias (variantes de pendências e e-mails, dicas de estreia) ================= */
LANGS.pt.ui.prog = { steps: ['Conferir', 'Assinar', 'Enviar'], order: 'Fora de ordem!', which: 'Setor do documento:', wrongSector: 'Setor errado!',
  spam: 'Spam', spamFwd: 'Golpe encaminhado!', notSpam: 'Não era spam!',
  spamSubj: ['Você ganhou um iPhone!!!', 'URGENTE: confirme sua senha', 'Herança do príncipe esperando', 'Boleto atrasado (abra o anexo)', 'Promoção só hoje, clique aqui'],
  spamFrom: ['ti-suporte@workday.bizz', 'premio@sorteio.xyz', 'rh.pagamento@gmaill.com', 'banco@seguro-banco.top'] };
LANGS.en.ui.prog = { steps: ['Check', 'Sign', 'Send'], order: 'Out of order!', which: 'Document department:', wrongSector: 'Wrong department!',
  spam: 'Spam', spamFwd: 'Scam forwarded!', notSpam: "That wasn't spam!",
  spamSubj: ['You won an iPhone!!!', 'URGENT: confirm your password', "A prince's inheritance awaits", 'Overdue invoice (open attachment)', 'Today only, click here'],
  spamFrom: ['it-support@workday.bizz', 'prize@raffle.xyz', 'hr.payroll@gmaill.com', 'bank@safe-bank.top'] };
LANGS.es.ui.prog = { steps: ['Revisar', 'Firmar', 'Enviar'], order: '¡Fuera de orden!', which: 'Sector del documento:', wrongSector: '¡Sector equivocado!',
  spam: 'Spam', spamFwd: '¡Estafa reenviada!', notSpam: '¡No era spam!',
  spamSubj: ['¡¡¡Ganaste un iPhone!!!', 'URGENTE: confirma tu contraseña', 'La herencia del príncipe te espera', 'Factura vencida (abre el adjunto)', 'Solo hoy, haz clic aquí'],
  spamFrom: ['ti-soporte@workday.bizz', 'premio@sorteo.xyz', 'rrhh.pago@gmaill.com', 'banco@banco-seguro.top'] };
Object.assign(LANGS.pt.tips, { sector: 'Pendência com <b>setor</b>: confirme no setor da cor do documento.', spam: 'E-mail <b>suspeito</b>? Marque <b>Spam</b>. E-mail normal se encaminha.',
  call2: 'Ligação <b>difícil</b>: segure mais tempo, e outra pendência chega junto.', printer2: 'Impressora <b>emperrada</b>: alterne as duas teclas.',
  it2: 'O TI está instável: <b>travamentos e vírus</b> mais frequentes e mais longos.', video2: 'Reuniões <b>mais longas</b>: mais falas para acompanhar.',
  complex: 'Pendência <b>complexa</b>: clique nas etapas na ordem 1, 2, 3.', crisis: '<b>Crise!</b> Dois problemas ao mesmo tempo.' });
Object.assign(LANGS.en.tips, { sector: '<b>Department</b> task: confirm on the department matching the document color.', spam: '<b>Suspicious</b> e-mail? Mark it <b>Spam</b>. Normal e-mails get forwarded.',
  call2: '<b>Tough</b> call: hold longer, and another task arrives with it.', printer2: '<b>Jammed</b> printer: alternate the two keys.',
  it2: 'IT is unstable: <b>freezes and viruses</b> come more often and last longer.', video2: '<b>Longer</b> meetings: more lines to follow.',
  complex: '<b>Complex</b> task: click the steps in order 1, 2, 3.', crisis: '<b>Crisis!</b> Two problems at once.' });
Object.assign(LANGS.es.tips, { sector: 'Pendiente con <b>sector</b>: confirma en el sector del color del documento.', spam: '¿Correo <b>sospechoso</b>? Márcalo como <b>Spam</b>. Los normales se reenvían.',
  call2: 'Llamada <b>difícil</b>: mantén más tiempo, y llega otra tarea a la vez.', printer2: 'Impresora <b>atascada</b>: alterna las dos teclas.',
  it2: 'TI inestable: <b>bloqueos y virus</b> más frecuentes y largos.', video2: 'Reuniones <b>más largas</b>: más frases que seguir.',
  complex: 'Pendiente <b>complejo</b>: haz clic en las etapas en orden 1, 2, 3.', crisis: '<b>¡Crisis!</b> Dos problemas a la vez.' });
