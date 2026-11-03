// Testes técnicos do MSworkN (mensageiro, motor social, chamadas). Playwright + Chromium do ambiente.
// Uso: python3 tools/build.py && node tests/mensageiro.js
const { chromium, devices } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'dist', 'workday.html');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; console.log('  ✓ ' + m); } else { fails++; console.log('  ✗ ' + m); } };

async function boot(ctx, { seed } = {}) {
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (seed) await p.addInitScript(seed);
  await p.goto(URL); await p.waitForTimeout(300);
  await p.evaluate(() => { const t = document.getElementById('titlescr'); if (t) t.remove(); closeScene(); ARRIVED = true; showMenu(); SocRT.enterMenu = -1e9; });
  return { p, errs };
}
// acelera a agenda (sem esperar os intervalos reais entre mensagens) e espera as falas saírem
const fast = p => p.evaluate(() => { SocRT.lastStart = -1e9; SocRT.lastEval = -1e9; for (const k in SocRT.due) SocRT.due[k] = 0; });
async function settle(p, ms = 2500) { const t0 = Date.now(); while (Date.now() - t0 < ms) { await fast(p); await p.waitForTimeout(150); } }

(async () => {
  const browser = await chromium.launch();

  console.log('\n[MSworkN] primeira execução, sem carreira');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' }); const { p, errs } = await boot(ctx);
    await settle(p, 3000);
    const s = await p.evaluate(() => ({ known: Object.keys(SOC.c).filter(k => SOC.c[k].st === 'known'), lu: SOC.c.lu.log.length, un: SOC.c.lu.un, done: Object.keys(SOC.done) }));
    ok(s.known.join() === 'lu', 'antes da carreira só a amiga de fora aparece (colegas ainda não conhecidos)');
    ok(s.lu >= 2 && s.un >= 2 && s.done.includes('lu_pre'), 'mensagem espontânea chega como não lida, com chave de disparo gravada');
    ok(await p.evaluate(() => !!document.querySelector('.osicon[data-app=msn] .msn-badge')), 'ícone da área de trabalho mostra contador de não lidas');
    await p.click('.osicon[data-app=msn]'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.querySelectorAll('.msn-win').length === 1), 'ícone abre o aplicativo no WorkOS');
    await p.evaluate(() => { osApp('msn'); osApp('msn'); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.querySelectorAll('.msn-win').length === 1), 'abrir de novo não cria outra instância');
    await p.click('.msn-c[data-id=lu]'); await settle(p, 1500);
    ok(await p.evaluate(() => SOC.c.lu.un === 0 && document.querySelectorAll('.msn-opt[data-ch]').length === 3), 'ler a conversa zera não lidas; escolhas aparecem');
    ok(await p.evaluate(() => { const i = document.querySelector('.msn-mepic canvas'); return !!i; }), 'perfil do jogador usa a foto do WorkOS');
    const aff0 = await p.evaluate(() => SOC.c.lu.aff);
    const initialLog = await p.evaluate(() => SOC.c.lu.log.length);
    await p.click('.msn-opt[data-ch="0"]');
    ok(await p.evaluate(n => !!document.querySelector('.msn-script') && SOC.c.lu.ch.lu_pre == null && SOC.c.lu.log.length === n && socSay('lu', 'qualquer coisa') === 'hint', initialLog),
      'escolher o balão bloqueia texto livre e não aplica efeitos antes do envio');
    await p.type('.msn-script', 'a');
    const p1 = await p.evaluate(() => document.querySelector('.msn-script').value);
    ok(p1.length >= 2 && p1 !== 'a' && await p.evaluate(() => document.querySelector('.msn-compose-script [type=submit]').disabled),
      'digitação preenche o texto roteirizado, não as teclas usadas');
    await p.press('.msn-script', 'Backspace');
    ok(await p.evaluate(before => document.querySelector('.msn-script').value.length < before, p1.length), 'backspace recua no texto roteirizado');
    await p.click('[data-script-cancel]');
    ok(await p.evaluate(() => SOC.c.lu.ch.lu_pre == null && !document.querySelector('.msn-script') && !!document.querySelector('.msn-opt[data-ch="0"]')),
      'trocar resposta descarta o rascunho sem afetar a história');
    await p.click('.msn-opt[data-ch="0"]');
    await p.type('.msn-script', 'abcdefghijklmnopqrstuvwxyz'.repeat(7));
    ok(await p.evaluate(() => !document.querySelector('.msn-compose-script [type=submit]').disabled),
      'mensagem roteirizada completa libera o botão de enviar');
    await p.click('.msn-compose-script [type=submit]'); await settle(p, 2500);
    const after = await p.evaluate(() => ({ log: SOC.c.lu.log.map(m => m.f), ch: SOC.c.lu.ch.lu_pre, trust: SOC.c.lu.trust, th: !!SOC.th.lu }));
    ok(after.log.filter(f => f === 'm').length === 1 && after.log[after.log.length - 1] === 'n' && after.ch === '0', 'envio explícito registra a fala e gera a resposta do NPC');
    ok(await p.evaluate(() => !document.querySelector('.msn-script') && (document.querySelector('.msn-in') || {}).value === ''),
      'editor livre volta vazio ao fim do roteiro');
    ok(after.trust > 0 && !after.th, 'efeito da escolha aplicado e conversa encerrada');
    // texto livre: intenção reconhecida e resposta no estilo do personagem
    await p.fill('.msn-in', 'oi lu, tudo bem?'); await p.press('.msn-in', 'Enter'); await settle(p, 3000);
    const lg = await p.evaluate(() => SOC.c.lu.log.slice(-2).map(m => [m.f, msgText(m)]));
    ok(lg[0][0] === 'm' && lg[1][0] === 'n' && lg[1][1].length > 3, 'texto livre: mensagem enviada e respondida por intenção local');
    await p.fill('.msn-in', 'e você?'); await p.press('.msn-in', 'Enter'); await settle(p, 2200);
    ok(await p.evaluate(() => SOC.c.lu.talk.intent === 'how' && SOC.c.lu.talk.day === socCtx().day),
      'pergunta curta conserva o assunto anterior como memória contextual por NPC');
    // status do jogador persistente e exibido no Perfil
    await p.click('.msn-st'); await p.click('[data-st=away]');
    await p.fill('.msn-psm', 'sem café não'); await p.press('.msn-psm', 'Enter'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('expediente-social-perfil')).status === 'away' && SOCP.msg === 'sem café não'), 'status e mensagem pessoal salvos');
    await p.evaluate(() => showProfile()); await p.waitForTimeout(300);
    ok(await p.evaluate(() => (document.querySelector('.msn-profline') || {}).textContent.includes('sem café não')), 'mensagem pessoal aparece na tela de Perfil');
    // sem duplicação: esperar mais não repete a mesma conversa; recarregar mantém tudo
    const n1 = await p.evaluate(() => SOC.c.lu.log.length); await settle(p, 3000);
    const keys = await p.evaluate(() => { socFlush(); return Object.keys(SOC.done); });
    await p.reload(); await p.waitForTimeout(400);
    await p.evaluate(() => { const t = document.getElementById('titlescr'); if (t) t.remove(); closeScene(); showMenu(); });
    await settle(p, 2500);
    const r = await p.evaluate(() => ({ n: SOC.c.lu.log.length, keys: Object.keys(SOC.done), st: SOCP.status }));
    ok(r.keys.filter(k => k === 'lu_pre').length === 1 && r.n >= n1 && r.st === 'away', 'recarregar preserva histórico e não dispara de novo');
    // troca de idioma: o histórico é guardado por referência e muda junto
    const pt = await p.evaluate(() => msgText(SOC.c.lu.log[0]));
    const en = await p.evaluate(() => { CFG.lang = 'en'; L = LANGS.en; return msgText(SOC.c.lu.log[0]); });
    const es = await p.evaluate(() => { CFG.lang = 'es'; L = LANGS.es; const t = msgText(SOC.c.lu.log[0]); CFG.lang = 'pt'; L = LANGS.pt; return t; });
    ok(pt !== en && en !== es && /gremlin/i.test(en) && /criatura/i.test(es), 'histórico em PT/EN/ES');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[MSworkN] carreira: contatos, eventos, expediente e chamadas');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' }); const { p, errs } = await boot(ctx);
    await settle(p, 1500);
    // antes do 1º dia: e-mail do RH pede para adicionar o Duda e mandar um oi
    await p.evaluate(() => { window.__go = 0; launchWorkday = launchWorkday; socOnboard(() => { window.__go = 1; }); }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => !!document.querySelector('.onb-win') && document.querySelector('#onbGo').disabled), 'e-mail do RH antes do 1º dia, com "Começar" travado');
    ok(await p.evaluate(() => !socAddContact('otavio').ok && !socAddContact('helena').ok && !socAddContact('fulano').ok), 'adicionar pelo nome: quem a campanha ainda não liberou não é encontrado');
    await p.click('#onbMsn'); await p.waitForTimeout(400);
    await p.fill('.msn-addin', 'Duda'); await p.press('.msn-addin', 'Enter'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => SOC.c.duda.st === 'known' && document.querySelector('#onbGo').disabled), 'Duda adicionado pelo botão do MSworkN; ainda falta o oi');
    ok(await p.evaluate(() => socTopics('duda').length === 0 && !document.querySelector('.msn-opt.topic') && !socTopic('duda', 'duda_jogo') && !socCallCheck('duda').ok), 'antes da primeira conversa com o Duda: sem convite para jogar nem chamada');
    await p.fill('.msn-in', 'oi duda'); await p.press('.msn-in', 'Enter'); await settle(p, 2500);
    ok(await p.evaluate(() => !document.querySelector('#onbGo').disabled && SOC.done.duda_hello != null && SOC.c.duda.log.some(m => m.f === 'n')), 'o oi chega ao Duda, ele responde e o expediente é liberado');
    ok(await p.evaluate(() => +getComputedStyle(document.querySelector('.msn-win')).zIndex > +getComputedStyle(document.querySelector('.onb-win')).zIndex), 'tarefas concluídas: o e-mail só marca e fica em segundo plano');
    await p.evaluate(() => document.querySelector('#onbGo').click()); await p.waitForTimeout(200);
    ok(await p.evaluate(() => window.__go === 1 && !document.querySelector('.onb-win')), '"Começar o expediente" segue para o 1º dia');
    await p.evaluate(() => { newCareer(); closeScene(); startDay(); S.restAt = 999; });
    await p.waitForTimeout(600);
    const c = await p.evaluate(() => ({ pre: SOC.pre, lu: SOC.c.lu && SOC.c.lu.st, newJob: SOC.c.lu && SOC.c.lu.f.newJob, duda: SOC.c.duda && SOC.c.duda.st, bia: SOC.c.bia && SOC.c.bia.st }));
    ok(c.lu === 'known' && !c.pre, 'carreira começa com a amiga de fora já na lista');
    ok(c.duda === 'known' && c.bia === 'req', 'Duda adicionado no e-mail continua; RH manda solicitação no dia 1');
    // durante o expediente: só conversas de trabalho, nunca durante o chefe
    await p.evaluate(() => { window.__toasts = 0; const t0 = Msn.toast; Msn.toast = (...a) => { window.__toasts++; return t0(...a); }; document.querySelectorAll('.msn-toast').forEach(e => e.remove()); window.__d0 = Object.keys(SOC.done).join(); window.__l0 = JSON.stringify(Object.values(SOC.c).map(r => r.log.length)); S.dayT = 30; S.boss = true; });
    await settle(p, 1500);
    ok(await p.evaluate(() => window.__toasts === 0 && Object.keys(SOC.done).join() === window.__d0 && JSON.stringify(Object.values(SOC.c).map(r => r.log.length)) === window.__l0), 'com o chefe na tela nada chega nem aparece (fica na fila)');
    ok(await p.evaluate(() => { const ctx = socCtx(); return !Object.values(SOC_THREADS).some(T => T.by === 'npc' && !T.work && SOC.done[socKey(T, ctx)] === ctx.day && T.npc !== 'lu'); }), 'com o expediente rodando, só conversas marcadas como de trabalho começam');
    await p.evaluate(() => { S.boss = false; Msn.lastToast = -1e9; socAccept('bia'); }); await settle(p, 3000);
    ok(await p.evaluate(() => SOC.done.bia_welcome != null || SOC.done.duda_hello != null), 'conversa de trabalho chega com o expediente rodando');
    ok(await p.evaluate(() => window.__toasts > 0), 'aviso visual de mensagem no WorkOS');
    // abrir pelo expediente pausa como os outros aplicativos e volta com 3,2,1
    await p.evaluate(() => workApp('msn')); await p.waitForTimeout(500);
    ok(await p.evaluate(() => S.paused && S.appPause && !!document.querySelector('.msn-win')), 'no expediente o aplicativo pausa o trabalho');
    await p.evaluate(() => Msn.win.close()); await p.waitForTimeout(4200);
    ok(await p.evaluate(() => !S.paused && !S.appPause), 'fechar o aplicativo devolve o expediente');
    // promoção e fim do dia viram memória
    await p.evaluate(() => { S.dayScore = 2400; S.stress = 75; S.dayT = DAY_SECONDS; }); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => SOC.perf.length === 1 && SOC.perf[0].score >= 2400 && SOC.perf[0].stress === 75), 'fim do dia guardado como desempenho recente');
    // mensagens da noite chegam em silêncio (cenas): sem aviso por cima da cena
    await settle(p, 2000);
    ok(await p.evaluate(() => !document.querySelector('.msn-toast') || !$('scene')), 'nas cenas da noite não aparece aviso por cima');
    await p.evaluate(() => { closeScene(); showMenu(); }); await p.waitForTimeout(300);
    // chamada com câmera ligada (Lu) e desligada (Helena)
    await p.evaluate(() => { SOC.c.helena = Object.assign(socRelBase(), { st: 'known', since: 1 }); socCall('lu', {}); }); await p.waitForTimeout(2600);
    ok(await p.evaluate(() => !!document.querySelector('.vcall.soc.live .vc-face canvas') && !document.querySelector('.vc-nocam')), 'chamada com câmera: busto animado');
    await p.evaluate(() => document.querySelector('.vc-ctrl .hang').click()); await p.waitForTimeout(600);
    ok(await p.evaluate(() => !Call.el && SOC.c.lu.log.some(m => m.f === 's' && m.r && m.r.sys === 'callLog')), 'encerrar chamada registra no histórico');
    await p.evaluate(() => { SOC.ov.helena = { s: 'online', until: 99 }; socCall('helena', {}); }); await p.waitForTimeout(2600);
    ok(await p.evaluate(() => !!document.querySelector('.vcall.soc.live .vc-nocam')), 'câmera desligada: mostra a foto de perfil');
    await p.evaluate(() => document.querySelector('.vc-ctrl .hang').click()); await p.waitForTimeout(500);
    // chamada recebida com roteiro, recusada: personagem lembra
    await p.evaluate(() => { SOC.arc.lu = { s: 'fim', d: 1 }; SOC.c.lu.f.wentExpo = 1; SocRT.lastRing = -1e9; SocRT.enterMenu = -1e9; });
    await p.waitForTimeout(2600);
    ok(await p.evaluate(() => !!document.querySelector('.vcall.soc .vc-ring .accept')), 'chamada recebida: toque com aceitar e recusar');
    await p.evaluate(() => document.querySelector('.vc-ring .decline').click()); await p.waitForTimeout(500);
    ok(await p.evaluate(() => SOC.c.lu.f.declinedCall != null && SOC.done.lu_call_expo != null), 'recusar fica na memória e a chamada não se repete');
    // promessa: prazo vence → quebrada
    await p.evaluate(() => { SOC.prom.cartao = { npc: 'bia', due: 0, chk: 'cartao' }; socPromises(socCtx(), true); });
    ok(await p.evaluate(() => SOC.c.bia.f['broke:cartao'] != null && !SOC.prom.cartao), 'promessa vencida vira memória do personagem');
    // conhecimento separado: o segredo do Duda é do jogador, não da Helena
    await p.evaluate(() => socFx('duda', { pk: 'stapler', f: 'trustedMe' }));
    ok(await p.evaluate(() => SOC.pk.stapler != null && SOC.c.helena.f.trustedMe == null && SOC.c.duda.f.trustedMe != null), 'conhecimento do jogador ≠ conhecimento de cada personagem');
    // a mesma resposta pesa diferente para cada personalidade
    const v = await p.evaluate(() => [socFx('bia', null, 'gossip'), socFx('helena', null, 'gossip')]);
    ok(v[0] > 0 && v[1] < 0, 'fofoca agrada a Bia e incomoda a Helena');
    // backup inclui o social
    ok(await p.evaluate(() => { socFlush(); return !!localStorage.getItem('expediente-social'); }), 'dados sociais entram no backup (chaves expediente-*)');
    // carreira seguinte: colegas recomeçam, amiga continua
    // atestado no lugar de demissão/esgotamento: a mesma run continua no dia seguinte e o calendário marca o dia
    await p.evaluate(() => { resumeCareer(); closeScene(); startDay(); S.restAt = 999; window.__d = S.day; window.__w = P.wallet; S.dayScore = 1000; S.stress = 100; S.burnout = true; }); await p.waitForTimeout(600);
    ok(await p.evaluate(() => !!document.querySelector('.over-card') && document.querySelector('.over-card h2').textContent === U().leave.title && !!load('carreira', null)), 'estresse no limite: atestado médico, sem fim de carreira');
    ok(await p.evaluate(() => sickDays().includes(window.__d) && P.wallet > window.__w && S.stress === 0), 'atestado: dia marcado, salário com desconto pago, estresse zerado');
    await p.evaluate(() => document.querySelector('#home').click()); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => $('scene') && $('scene').className.includes('sleep')), 'atestado: vai para casa dormir e o próximo dia segue');
    ok(await p.evaluate(() => { const d = gameDateOf(1); return d.getDay() === 1 && d.getDate() === 5 && d.getMonth() === 0 && gameDateOf(6).getDate() === 12 && careerDayOf(new Date(2026, 0, 12)) === 6; }), 'calendário do jogo: dia 1 = segunda 05/01, fins de semana pulados');
    await p.evaluate(() => { closeScene(); showMenu(); newCareer(); }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => SOC.c.lu && SOC.c.lu.st === 'known' && (!SOC.c.helena || SOC.c.helena.st !== 'known') && (!SOC.c.bia || SOC.c.bia.st !== 'known')), 'nova carreira: colegas recomeçam, decisões da anterior não vazam');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[MSworkN] compatibilidade com o Duda (chamada automática do expediente)');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' }); const { p, errs } = await boot(ctx);
    await p.evaluate(() => { newCareer(); closeScene(); startDay(); S.day = 3; S.restAt = 0; });
    await p.waitForSelector('.vcall:not(.soc)', { timeout: 6000 });
    ok(await p.evaluate(() => S.paused && S.resting && Call.mode === 'work'), 'pausa do Duda continua igual (modo work, expediente congelado)');
    await p.click('.vc-ring .accept'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => document.querySelector('.vcall').classList.contains('live')), 'atender a chamada do Duda funciona');
    await p.evaluate(() => document.querySelector('.vc-ctrl .hang').click()); await p.waitForTimeout(4300);
    ok(await p.evaluate(() => !Call.el && !S.paused), 'desligar volta ao expediente com contagem');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[MSworkN] celular e movimento reduzido');
  { const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'en-US', reducedMotion: 'reduce' }); const { p, errs } = await boot(ctx);
    await settle(p, 2000);
    ok(await p.evaluate(() => !!document.querySelector('#msnb')), 'celular: botão do MSworkN no portal');
    await p.click('#msnb'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => { const r = document.querySelector('.msn-win').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && getComputedStyle(document.querySelector('.msn-chat')).display === 'none'; }), 'celular: janela cabe na tela, uma coluna (lista)');
    await p.click('.msn-c[data-id=lu]'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.msn-side')).display === 'none' && !!document.querySelector('.msn-back')), 'celular: conversa em tela própria com Voltar');
    ok(await p.evaluate(() => document.querySelector('.msn-win .mw-ttl').textContent.includes('MSworkN') && /Friends/.test(document.querySelector('.msn').textContent + U().msn.groups.friends)), 'inglês: textos da interface');
    await p.evaluate(() => socCall('lu', {})); await p.waitForTimeout(2600);
    ok(await p.evaluate(() => { const w = document.querySelector('.vc-win'); if (!w) return false; const r = w.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; }), 'celular: chamada cabe na tela (movimento reduzido)');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[MSworkN] save antigo (sem dados sociais) e importação');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' });
    const { p, errs } = await boot(ctx, { seed: () => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', 1); const s = (k, v) => localStorage.setItem('expediente-' + k, JSON.stringify(v));
      s('stats', { files: 10, emails: 2, calls: 1, typed: 0, prints: 0, viruses: 3, bosses: 1, videos: 0, days: 14, careers: 2, maxDay: 13 });
      s('carreira', { day: 12, score: 9000, rankIdx: 2, perks: [], today: [], inv: { cafe: 0, cha: 0 }, careerCauses: {}, stress: 10 }); } });
    await settle(p, 2500);
    const s = await p.evaluate(() => ({ cid: SOC.cid, bia: SOC.c.bia && SOC.c.bia.st, day: socCtx().day, add: socAddContact('duda').ok }));
    ok(s.cid === 2 && s.add && s.bia === 'req' && s.day === 13, 'carreira antiga no meio: sistema social começa coerente (dia 13, Duda pode ser adicionado, apresentações pendentes)');
    ok(await p.evaluate(() => validSave({ format: SAVE_FORMAT, version: SAVE_VERSION, data: { 'expediente-social': JSON.stringify(SOC) } })), 'formato aceito pelo importador de backup');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[contas] nome de usuário na tela de título, um save por nome');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL); await p.waitForTimeout(400);
    await p.click('.tt-orb'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => !!$('titlescr') && document.querySelector('.tt-hint').textContent.length > 5), 'sem nome não entra');
    await p.fill('.tt-name', 'Ana'); await p.press('.tt-name', 'Enter'); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => !$('titlescr') && PROFILE.name === 'Ana' && WD_NS === 'expediente-' && profileName() === 'Ana'), 'primeira conta entra com as chaves de antes e o nome vira o nome do jogador');
    await p.evaluate(() => { P.wallet = 555; persist(); showTitle(); }); await p.waitForTimeout(200);
    await p.fill('.tt-name', 'Beto'); await p.press('.tt-name', 'Enter'); await p.waitForLoadState('load'); await p.waitForTimeout(900);
    ok(await p.evaluate(() => PROFILE.name === 'Beto' && P.wallet === 0 && WD_NS !== 'expediente-' && !$('titlescr')), 'outro nome: save novo e separado');
    await p.evaluate(() => showTitle()); await p.fill('.tt-name', 'ana'); await p.press('.tt-name', 'Enter'); await p.waitForLoadState('load'); await p.waitForTimeout(900);
    ok(await p.evaluate(() => PROFILE.name === 'Ana' && P.wallet === 555), 'voltar ao primeiro nome recupera o save dele');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  console.log('\n[MSworkN] integridade do conteúdo e simulação de 30 dias');
  { const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR' }); const { p, errs } = await boot(ctx);
    const lint = await p.evaluate(() => {
      const bad = [], tri = (v, w) => { if (Array.isArray(v) && typeof v[0] === 'string' && (v.length !== 3 || v.some(x => typeof x !== 'string' || (!x && w !== 'psm')))) bad.push(w); };
      const walk = (o, w) => { if (Array.isArray(o)) { tri(o, w); if (typeof o[0] !== 'string') o.forEach((x, i) => walk(x, w + '.' + i)); } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!['arc', 'kw', 'bust', 'blocks', 'slot', 'ev', 'nev'].includes(k)) walk(v, w + '.' + k); };
      for (const T of Object.values(SOC_THREADS)) {
        if (!CAST[T.npc]) bad.push(T.id + ': npc'); if (!T.n[T.start]) bad.push(T.id + ': start');
        for (const [nid, n] of Object.entries(T.n)) {
          const gos = [n.go, ...(Array.isArray(n.ch) ? n.ch.map(c => c.go) : [])].flat().filter(Boolean).map(g => typeof g === 'string' ? g : g.to);
          gos.forEach(g => { if (!T.n[g]) bad.push(T.id + '.' + nid + ' → ' + g); });
        }
        walk(T, T.id);
      }
      for (const id of CAST_ORDER) walk(CAST[id], 'cast.' + id);
      walk(SOC_MEM, 'mem');
      return bad;
    });
    ok(lint.length === 0, 'conversas: destinos válidos e todo texto em PT/EN/ES' + (lint.length ? ': ' + lint.slice(0, 8).join(' | ') : ''));
    // simulação: o relógio narrativo é trocado por um falso (dia/faixa), escolhas automáticas variadas
    const runSim = mode => p.evaluate(async mode => {
      newCareer(); closeScene(); S.running = false; S.phase = 'intro'; socAddContact('duda');
      let fake = { day: 1, slot: 'am' };
      const real = socCtx;
      socCtx = () => { const c = real(); const min = { am: 60, lunch: 200, pm: 400, off: -1 }[fake.slot]; return Object.assign(c, { day: fake.day, cyc: Math.floor((fake.day - 1) / CYCLE), slot: fake.slot, min, inDay: fake.slot !== 'off', working: false, career: true, ev: SPECIAL.filter(e => Quests.on(e, fake.day)).map(e => e.id) }); };
      const blk = socBlock; socBlock = () => null;
      const starts = {}; let picks = 0;
      for (let d = 1; d <= 30; d++) {
        fake.day = d; SOC.perf.push({ d: d - 1, score: 1500 + d * 50, stress: d % 4 === 0 ? 75 : 30 }); SOC.perf = SOC.perf.slice(-5);
        if (d === 5) { SOC.pub.promo = d; SOC.pub.promo1 = d; }
        for (const sl of ['am', 'lunch', 'pm', 'off']) {
          fake.slot = sl;
          for (let i = 0; i < 40; i++) {
            SocRT.lastStart = -1e9; SocRT.lastEval = -1e9; SocRT.enterMenu = -1e9; for (const k in SocRT.due) SocRT.due[k] = 0; for (const k in SOC.daily) delete SOC.daily[k];
            for (const id of CAST_ORDER) if (SOC.c[id] && SOC.c[id].st === 'req') socAccept(id);
            socTick();
            for (const [npc, th] of Object.entries(SOC.th)) if (th.phase === 'choice') { const T = SOC_THREADS[th.id], vis = socVisibleChoices(npc, T, th.node); socChoose(npc, mode === 'first' ? 0 : (d + picks++) % vis.length); }
            for (const T of Object.values(SOC_THREADS)) if (T.by === 'player' && SOC.c[T.npc] && SOC.c[T.npc].st === 'known' && !SOC.th[T.npc] && socTopics(T.npc).includes(T)) socTopic(T.npc, T.id);
          }
        }
      }
      for (const k of Object.keys(SOC.done)) { const b = k.split(/[#@]/)[0]; starts[b] = (starts[b] || 0) + 1; }
      socCtx = real; socBlock = blk;
      return { arcs: Object.fromEntries(Object.entries(SOC.arc).map(([k, v]) => [k, v.s])), known: CAST_ORDER.filter(id => SOC.c[id] && SOC.c[id].st === 'known'), n: Object.keys(SOC.done).length, starts,
        logs: CAST_ORDER.map(id => SOC.c[id] ? SOC.c[id].log.length : 0), dup: Object.entries(starts).filter(([k, n]) => n > 1 && !SOC_THREADS[k].perCycle && !SOC_THREADS[k].daily && !SOC_THREADS[k].repeat).map(([k]) => k),
        mem: CAST_ORDER.reduce((n, id) => n + (SOC.c[id] ? Object.keys(SOC.c[id].f).filter(f => SOC_MEM[id + ':' + f]).length : 0), 0) };
    }, mode);
    const sim = await runSim('mix');
    console.log('    arcos:', JSON.stringify(sim.arcs), '· conversas disparadas:', sim.n, '· memórias:', sim.mem);
    ok(sim.known.length === 6, 'todos os contatos desbloqueados ao longo da carreira (Otávio, Helena e Rafa por apresentação/progressão)');
    ok(['fim'].includes(sim.arcs.lu) && ['fim'].includes(sim.arcs.helena) && ['fim'].includes(sim.arcs.rafa) && ['padaria', 'meio', 'fica', 'fechado'].includes(sim.arcs.otavio) && ['ready', 'off'].includes(sim.arcs.bia), 'as cinco histórias chegam a um desfecho em vários dias');
    ok(sim.dup.length === 0, 'nenhuma conversa única disparou duas vezes' + (sim.dup.length ? ': ' + sim.dup.join(',') : ''));
    ok(sim.mem >= 2, 'escolhas viram memórias estruturadas mesmo quando a agenda aleatória varia');
    await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(300);
    const sim2 = await runSim('first');
    console.log('    arcos (outra rota):', JSON.stringify(sim2.arcs));
    ok(sim2.arcs.otavio !== sim.arcs.otavio || sim2.arcs.bia !== sim.arcs.bia, 'escolhas diferentes levam a desfechos diferentes');
    ok(errs.length === 0, 'sem erros de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
    await ctx.close(); }

  await browser.close();
  console.log(`\n${passes} ok, ${fails} falha(s)`);
  process.exit(fails ? 1 : 0);
})();
