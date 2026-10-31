/* ================= Planilha (pausa e fuga do chefe) ================= */
// A pausa mostra uma planilha em pixel art; as abas embaixo são o menu de pausa.
const XL_ICON = {
  new:   ['kkkkkk..', 'kWWWWkk.', 'kWWWWWk.', 'kWWWWWk.', 'kWWWWWk.', 'kWWWWWk.', 'kWWWWWk.', 'kkkkkkk.'],
  open:  ['.kkk....', 'kYYYkkkk', 'kYYYYYYk', 'kzzzzzzk', 'kzYYYYzk', 'kzYYYYzk', 'kzzzzzzk', 'kkkkkkkk'],
  save:  ['kkkkkkkk', 'kLWWWWLk', 'kLWWWWLk', 'kLLLLLLk', 'kLkkkkLk', 'kLkWWkLk', 'kLkkkkLk', 'kkkkkkkk'],
  print: ['..kkkk..', '..kWWk..', 'kkkkkkkk', 'kMMMMMMk', 'kMMMMdMk', 'kkkkkkkk', '.kWWWWk.', '.kkkkkk.'],
  sum:   ['kkkkkkk.', 'k.....k.', '.k......', '..k.....', '.k......', 'k.....k.', 'kkkkkkk.', '........'],
  chart: ['.....kk.', '.....FF.', '..kk.FF.', '..LL.FF.', 'kkLL.FF.', 'OOLL.FF.', 'OOLL.FF.', 'kkkkkkkk'],
  sheet: ['kkkkkkkkkk', 'kDDDDDDDDk', 'kWkWkWkWWk', 'kkkkkkkkkk', 'kWkWkWkWWk', 'kkkkkkkkkk', 'kWkWkWkWWk', 'kkkkkkkkkk'],
};
const XL_ROWS = { pt: ['Receita', 'Custos fixos', 'Pessoal', 'Marketing', 'Café', 'Reuniões', 'Sinergia', 'TOTAL'],
                  en: ['Revenue', 'Fixed costs', 'Staff', 'Marketing', 'Coffee', 'Meetings', 'Synergy', 'TOTAL'],
                  es: ['Ingresos', 'Costos fijos', 'Personal', 'Marketing', 'Café', 'Reuniones', 'Sinergia', 'TOTAL'] };
function buildSheet(paused) {
  const u = U(), box = $('boss'), rows = XL_ROWS[CFG.lang] || XL_ROWS.pt, cols = 'ABCDEFG';
  const months = { pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN'], en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'], es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'] }[CFG.lang] || [];
  const R = Office.rng(S ? S.day * 7 + 3 : 3), data = rows.slice(0, -1).map(() => months.map(() => Math.round(800 + R() * 9200)));
  const tot = months.map((_, c) => data.reduce((a, r) => a + r[c], 0));
  let grid = `<tr><th></th>${[...cols].map(c => `<th>${c}</th>`).join('')}</tr><tr><th>1</th><td class="h"></td>${months.map(m => `<td class="h">${m}</td>`).join('')}</tr>`;
  rows.forEach((name, i) => { const vals = i < rows.length - 1 ? data[i] : tot;
    grid += `<tr><th>${i + 2}</th><td class="lbl${i === rows.length - 1 ? ' tot' : ''}">${name}</td>${vals.map((v, c) => `<td class="${i === rows.length - 1 ? 'tot' : ''}${i === 5 && c === 2 ? ' sel' : ''}">${fmt(v)}</td>`).join('')}</tr>`; });
  for (let r = rows.length + 2; r <= 22; r++) grid += `<tr><th>${r}</th>${[...cols].map(() => '<td></td>').join('')}</tr>`;
  box.innerHTML = `<div class="xl">
    <div class="xl-title"><span class="ic"></span><span>ORCAMENTO_Q4_v7_FINAL.XLS</span><span class="sp"></span><i>_</i><i>□</i><i>x</i></div>
    <div class="xl-menu"><span>Arquivo</span><span>Editar</span><span>Exibir</span><span>Inserir</span><span>Formatar</span><span>Dados</span><span>Ajuda</span></div>
    <div class="xl-tools"></div>
    <div class="xl-fx"><span class="ref">D7</span><b>fx</b><span>=SOMA(B2:G8)*SINERGIA</span></div>
    <div class="xl-grid"><table>${grid}</table><canvas class="xl-chart"></canvas></div>
    <div class="xl-tabs">${paused ? `<button class="xl-tab on" data-a="resume">${u.resume}</button><button class="xl-tab" data-a="cfg">${u.settings}</button><button class="xl-tab" data-a="menu">${u.saveMenu}</button><button class="xl-tab" data-a="quit">${u.quit}</button>` : '<span class="xl-tab on">Plan1</span><span class="xl-tab">Plan2</span><span class="xl-tab">Plan3</span>'}</div>
    <div class="xl-status"><span>${paused ? u.paused.toUpperCase() + ' · Esc' : 'Pronto'}</span><span>SOMA=${fmt(tot.reduce((a, b) => a + b, 0))}</span></div></div>`;
  box.querySelector('.xl-title .ic').append(Pixel.el(XL_ICON.sheet, 2));
  const tools = box.querySelector('.xl-tools');
  for (const k of ['new', 'open', 'save', 'print', 'sum', 'chart']) { const b = document.createElement('span'); b.className = 'xl-btn'; b.append(Pixel.el(XL_ICON[k], 2)); tools.append(b); }
  tools.insertAdjacentHTML('beforeend', '<span class="xl-font">Arial · 10</span>');
  // Gráfico embutido, desenhado em pixels com a paleta do jogo
  const cv = box.querySelector('.xl-chart'); cv.width = 64; cv.height = 40; pxSize(cv, 3);
  const x = cv.getContext('2d'), P = WD_PAL, mx = Math.max(...tot);
  x.fillStyle = P.W; x.fillRect(0, 0, 64, 40); x.fillStyle = P.k; x.fillRect(0, 0, 64, 1); x.fillRect(0, 39, 64, 1); x.fillRect(0, 0, 1, 40); x.fillRect(63, 0, 1, 40);
  x.fillStyle = P.p; for (let j = 8; j < 36; j += 7) x.fillRect(4, j, 56, 1);
  tot.forEach((v, i) => { const h = Math.round(v / mx * 26); x.fillStyle = P.k; x.fillRect(6 + i * 9, 35 - h, 7, h + 1); x.fillStyle = [P.F, P.L, P.O, P.I, P.Y, P.T][i]; x.fillRect(7 + i * 9, 36 - h, 5, h - 1); });
  box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    if (b.dataset.a === 'resume') setPaused(false);
    if (b.dataset.a === 'cfg') showSettings(closeModal);
    if (b.dataset.a === 'quit') showResign();
    if (b.dataset.a === 'menu') { saveCareerMidday(); persist(); hideSheet(); S.paused = false; muffle(false); showMenu(); }
  });
}
function showSheet(paused) {
  buildSheet(paused);
  const box = $('boss'); box.classList.remove('hidden');
  Motion.play(box.firstElementChild, [{ transform: 'scale(.96)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 140, easing: Motion.E.out, fill: 'none' });
}
function hideSheet() { $('boss').classList.add('hidden'); }

/* ================= Promoção: certificado e envelopes ================= */
const ENV = {
  closed: ['kkkkkkkkkkkkkkkkkkkk', 'kpWWWWWWWWWWWWWWWWpk', 'kWpWWWWWWWWWWWWWWpWk', 'kWWpWWWWWWWWWWWWpWWk', 'kWWWpWWWWWWWWWWpWWWk', 'kWWWWpWWWWWWWWpWWWWk',
           'kWWWWWpWWWWWWpWWWWWk', 'kWWWWWWpWRRWpWWWWWWk', 'kWWWWWWWpRRpWWWWWWWk', 'kwwwwwwwwqqwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kppppppppppppppppppk', 'kkkkkkkkkkkkkkkkkkkk'],
  half: ['kkkkkkkkkkkkkkkkkkkk', 'kPPPPPPPPPPPPPPPPPPk', 'kppppppppppppppppppk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk',
         'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kwwwwwwwwwwwwwwwwwwk', 'kppppppppppppppppppk', 'kkkkkkkkkkkkkkkkkkkk'],
  open: ['.........kk.........', '........kppk........', '.......kpPPpk.......', '......kpPPPPpk......', '.....kpPPPPPPpk.....', '....kpPPPPPPPPpk....', '...kpPPPPPPPPPPpk...',
         '..kpPPPPPPPPPPPPpk..', '.kpPPPPPPPPPPPPPPpk.', 'kkkkkkkkkkkkkkkkkkkk', 'kpwwwwwwwwwwwwwwwwpk', 'kWpwwwwwwwwwwwwwwpWk', 'kWWpwwwwwwwwwwwwpWWk', 'kWWWpWWWWWWWWWWpWWWk',
         'kWWWWpWWWWWWWWpWWWWk', 'kWWWWWpWWWWWWpWWWWWk', 'kwwwwwwpwwwwpwwwwwwk', 'kwwwwwwwppppwwwwwwwk', 'kppppppppppppppppppk', 'kkkkkkkkkkkkkkkkkkkk'],
  seal: ['...kkkkk...', '..kRRRRRk..', '.kRrRRRqRk.', 'kRrRRRRRRqk', 'kRRRyyyRRqk', 'kRRRyRyRRqk', 'kRRRyyyRRqk', 'kRRRRRRRqqk', '.kRRRRRqqk.', '..kqqqqqk..',
         '...kkkkk...', '..kRk.kRk..', '..kRk.kRk..', '..kqk.kqk..'],
};
function promote() {
  S.phase = 'promo';
  S.rankIdx++;
  sfx('level'); renderDesk();
  const opts = PERK_IDS.filter(k => !S.perks.has(k)).sort(() => Math.random() - .5).slice(0, 2);
  if (!opts.length) { S.phase = 'day'; return; }
  const u = U();
  const card = modal(`<div class="cert"><div class="cert-in">
      <div class="cert-head">${u.certTitle}</div>
      <p class="cert-body">${u.certBody(EMP_ID, profileName())}</p>
      <div class="cert-rank">${L.ranks[S.rankIdx]}</div>
      <div class="cert-foot"><span class="cert-portrait"></span><span class="slot-sig"></span><span class="seal"></span></div>
    </div></div>
    <p class="cert-hint">${u.signHint}</p>
    <div class="envs"></div><div class="actions" hidden><button class="pxbtn main" id="pok">${u.resume}</button></div>`);
  card.classList.add('promo-card');
  card.querySelector('.seal').append(Pixel.el(ENV.seal, 3));
  card.querySelector('.cert-portrait').append(portrait(56));
  // Assinatura com quantos traços quiser; só vale ao confirmar
  card.querySelector('.slot-sig').replaceWith(sigPad(u.signature, () => sign()));
  const sign = () => {
    sfx('level');
    const st = document.createElement('span'); st.className = 'cert-stamp'; st.textContent = u.promoted; card.querySelector('.cert-in').append(st); Motion.stamp(st);
    card.querySelector('.cert-hint').textContent = u.pickEnvelope;
    const envs = card.querySelector('.envs');
    opts.forEach((k, i) => {
      const b = document.createElement('button'); b.className = 'env'; b.setAttribute('aria-label', u.pickEnvelope);
      b.append(Pixel.el(ENV.closed, 5)); b.insertAdjacentHTML('beforeend', '<b>?</b>'); envs.append(b);
      setTimeout(() => Motion.enter(b, 'down'), 250 + i * 120);
      b.onclick = () => openEnvelope(b, k);
    });
  };
  const openEnvelope = (b, k) => {
    const envs = card.querySelector('.envs');
    if (envs.classList.contains('chosen')) return;
    envs.classList.add('chosen'); sfx('pop');
    envs.querySelectorAll('.env').forEach(o => { if (o !== b) Motion.play(o, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-8px) rotate(-6deg)', offset: .3, opacity: 1 }, { transform: 'translateY(60px) rotate(14deg) scale(.6)', opacity: 0 }], { duration: 420, easing: Motion.E.anticip }).onfinish = () => o.style.visibility = 'hidden'; });
    b.querySelector('b').remove();
    const frames = [ENV.half, ENV.open];
    frames.forEach((f, i) => setTimeout(() => { b.querySelector('canvas').replaceWith(Pixel.el(f, 5)); sfx('key'); }, 140 + i * 130));
    setTimeout(() => {
      // A carta sai do envelope e cresce até o centro, em degraus (como um sprite sendo ampliado), com brilho passando
      const letter = document.createElement('div'); letter.className = 'letter';
      b.append(letter);
      Motion.play(letter, [{ transform: 'translate(-50%, 30%) scale(.8)', opacity: 0 }, { transform: 'translate(-50%,-30%) scale(1)', opacity: 1 }], { duration: 260, easing: Motion.E.out });
      S.perks.add(k);
      setTimeout(() => perkReveal(card, k, b), 300);
    }, 460);
  };
  card.querySelector('#pok').onclick = () => { closeModal(); card.classList.remove('promo-card'); S.phase = 'day'; S.last = performance.now(); renderDesk(); sfx('ok'); };
}
// Carta do benefício em destaque: centralizada, grande, com moldura em pixel e leitura confortável
function perkReveal(card, k, env) {
  const u = U(), from = env.getBoundingClientRect();
  const ov = document.createElement('div'); ov.className = 'perk-reveal';
  ov.innerHTML = `<div class="perk-card"><small>${u.perkLabel}</small><b>${L.perks[k][0]}</b><span>${L.perks[k][1]}</span><i class="shine"></i>
    <button class="pxbtn main" id="pok2">${u.resume}</button></div>`;
  card.append(ov);
  const pc = ov.querySelector('.perk-card'), to = pc.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top - (to.top + to.height / 2);
  sfx('coin');
  Motion.play(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'steps(4)' });
  Motion.play(pc, [{ transform: `translate(${dx}px,${dy}px) scale(.2)` }, { transform: 'translate(0,-6px) scale(1.06)', offset: .75 }, { transform: 'none' }], { duration: 560, easing: 'steps(9)' });
  setTimeout(() => sfx('level'), 420);
  ov.querySelector('#pok2').onclick = () => card.querySelector('#pok').click();
}
