/* ================= Fim do dia ================= */
function endDay() {
  S.phase = 'ending'; S.fast = false;
  const pay = Math.round(S.dayScore / 10) + 30 * S.day;
  const bonus = 100 * S.day;
  S.score += bonus; S.dayScore += bonus;
  P.wallet += pay; stat('days'); P.stats.maxDay = Math.max(P.stats.maxDay, S.day);
  if (S.score > P.best) P.best = S.score;
  S.today.clear();
  const worst = Object.entries(S.causes).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1])[0];
  S.ticket = { pay, points: S.dayScore, rank: L.ranks[S.rankIdx], worst: worst ? L.causes[worst[0]] : '—' };
  persist(); saveCareer(); hud(); renderDesk(); sfx('level');
  hudFlag('vignette', 'on', false); $('boss').classList.add('hidden');
  thanos(); music(null);
  setTimeout(() => { music('menu'); clockOut(); }, 1600);
}

// Tudo o que estava na tela vira poeira, da esquerda para a direita
function thanos() {
  const layer = document.createElement('div');
  layer.id = 'dust';
  document.body.append(layer);
  const els = [...document.querySelectorAll('#tasks .task, #board .file, .coffee, .popup, #video, .bubble, #toast, #bossAlert, #tip, #freeze')];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) { el.remove(); continue; }
    const cs = getComputedStyle(el);
    const colors = [cs.backgroundColor, cs.borderTopColor, cs.color].filter(c => c && c !== 'rgba(42,31,45,0)');
    const n = Math.min(90, Math.max(20, Math.round(r.width * r.height / 220)));
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const x = Math.random() * r.width, y = Math.random() * r.height;
      p.style.cssText = `left:${r.left + x}px;top:${r.top + y}px;background:${pick(colors)}`;
      layer.append(p);
      p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${rand(30, 120)}px,${rand(-80, -10)}px)`, opacity: 0 }],
                { duration: rand(700, 1100), delay: x / r.width * 700 + Math.random() * 200, easing: 'ease-out', fill: 'both' });
    }
    el.style.pointerEvents = 'none';
    el.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 900, easing: 'steps(10)', fill: 'forwards' });
  }
  setTimeout(() => { els.forEach(e => e.remove()); layer.remove(); S.tasks = []; S.video = null; }, 1700);
}

function clockOut() {
  const sc = scene('sc-out');
  sc.innerHTML = `<p class="sc-hint">${U().holdFinger}</p>`;
  Stage.mount(sc, 'hall', { eve: true });
  const dev = clockDevice('18:00');
  dev.classList.add('slide-in');
  // Grande enquanto lê a digital; depois encolhe para baixo e abre espaço para o ticket sair por cima
  const wrap = document.createElement('div');
  wrap.className = 'devwrap';
  const fit = (h) => Math.min(1.7, (innerHeight - 70) / h, (innerWidth - 24) / 330);
  wrap.style.transform = `translateX(-50%) scale(${fit(350)})`; pxSnap(dev.querySelector('.pad canvas'), 5, fit(350));
  wrap.append(dev);
  sc.append(wrap);
  fingerprint(dev, () => { wrap.style.transform = `translateX(-50%) scale(${fit(690)})`; pxSnap(dev.querySelector('.pad canvas'), 5, fit(690)); setTimeout(() => printTicket(sc, dev), 650); });
}

function ticketHTML() {
  const u = U(), tk = S.ticket;
  const row = (k, v) => `<div class="tk-row"><span>${k}</span><b>${v}</b></div>`;
  return `<div class="tk-head">${u.company}</div><div class="tk-sub">${u.receipt}</div>
    ${row(u.employee, profileName())}${row('Nº', EMP_ID)}${row(u.day, S.day)}${row(u.inTime, '09:00')}${row(u.outTime, '18:00')}
    ${row(u.hoursWorked, '9h00')}${row(u.points, fmt(tk.points))}${row(u.salary, '+ ' + money(tk.pay))}
    ${row(u.rank, tk.rank)}${row(u.worst, tk.worst)}<div class="tk-bar"></div>`;
}

// O ticket rasga aos poucos: o lado esquerdo se solta primeiro, depois o direito
function printTicket(sc, dev) {
  const u = U(), hint = sc.querySelector('.sc-hint');
  hint.textContent = u.printing;
  const paper = dev.querySelector('.paper');
  paper.innerHTML = `<div class="strip"><div class="ticket">${ticketHTML()}</div><div class="perf"></div><div class="stub"></div></div>`;
  const strip = paper.querySelector('.strip'), perf = paper.querySelector('.perf'), tkt = paper.querySelector('.ticket');
  const noise = setInterval(() => sfx('print'), 120);
  let ready = false, y0 = null, t0 = 0, torn = false, R = null, lastTick = 0;
  strip.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 2200, easing: 'steps(14)', fill: 'forwards' })
    .onfinish = () => { clearInterval(noise); hint.textContent = u.pullTicket; ready = true; };
  const pose = p => {
    tkt.style.transformOrigin = 'bottom right';
    tkt.style.transform = `translateY(${-p * 10}px) rotate(${-p * 7}deg)`;
    perf.style.setProperty('--p', (p * 100).toFixed(1) + '%');
  };
  tkt.onpointerdown = e => {
    if (!ready || torn) return;
    R = tkt.getBoundingClientRect();
    y0 = e.clientY; t0 = performance.now();
    tkt.setPointerCapture(e.pointerId); tkt.classList.add('grab');
  };
  tkt.onpointermove = e => {
    if (y0 === null || torn) return;
    const p = Math.max(0, Math.min(1, (y0 - e.clientY - 8) / 120));
    pose(p);
    if (p - lastTick > 0.12) { lastTick = p; sfx('key'); }
    if (p >= 1 && performance.now() - t0 > 300) tear();
  };
  tkt.onpointerup = tkt.onpointercancel = () => {
    if (torn) return;
    y0 = null; lastTick = 0; tkt.classList.remove('grab');
    tkt.animate([{ transform: tkt.style.transform }, { transform: 'none' }], { duration: 150, easing: 'steps(3)' });
    pose(0); tkt.style.transform = '';
  };
  const tear = () => {
    torn = true; sfx('tear');
    const z = R.width / 196, h = R.height / z;
    sc.append(tkt);
    tkt.className = 'ticket free';
    tkt.style.cssText = `left:${R.left}px;top:${R.top}px;width:196px;transform-origin:0 0`;
    perf.style.setProperty('--p', '100%'); perf.classList.add('torn');
    hint.remove();
    const S1 = Math.min(1.35, (innerHeight - 150) / h, (innerWidth - 40) / 196);
    const tx = innerWidth / 2 - 196 * S1 / 2 - R.left, ty = Math.max(16, (innerHeight - 110) / 2 - h * S1 / 2) - R.top;
    // o canto direito se solta, o ticket cai um pouco e balança
    tkt.animate([{ transform: `scale(${z}) rotate(-5deg)` }, { transform: `translate(-6px,-30px) scale(${z}) rotate(6deg)`, offset: 0.5 },
                 { transform: `translate(0,34px) scale(${z}) rotate(-3deg)` }], { duration: 420, easing: 'ease-out', fill: 'forwards' });
    dusk(sc, () => {
      tkt.animate([{ transform: `translate(0,34px) scale(${z}) rotate(-3deg)` }, { transform: `translate(${tx}px,${ty}px) scale(${S1}) rotate(0deg)` }],
                  { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      setTimeout(() => dayEndActions(sc), 680);
    });
  };
}

// Fundo do fim do expediente: blocos escuros cobrem tudo e revelam o entardecer em pixel art
function dusk(sc, cb) {
  const g = document.createElement('div');
  g.className = 'pxcover dusk';
  const size = 48, cols = Math.ceil(innerWidth / size), rows = Math.ceil(innerHeight / size);
  g.style.gridTemplateColumns = `repeat(${cols}, 1fr)`; g.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < cols * rows; i++) { const c = document.createElement('i'); c.style.animationDelay = rand(0, 0.5) + 's'; g.append(c); }
  sc.append(g);
  setTimeout(() => {
    sc.querySelectorAll('.clockdev, .devwrap').forEach(e => e.remove());
    const sky = skyline();
    sc.append(sky);
    sky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'steps(5)', fill: 'forwards' }).onfinish = () => g.remove();
    sc.classList.add('evening');
    cb();
  }, 750);
}
// Cenário da cidade ao entardecer, no mesmo grid de pixels das outras cenas
function skyline() {
  const holder = document.createElement('div');
  holder.className = 'skyline';
  Stage.mount(holder, 'city');
  return holder;
}

function dayEndActions(sc) {
  const u = U();
  const box = document.createElement('div');
  box.className = 'endbtns';
  box.innerHTML = `<button class="pxbtn main" id="rest">${u.goRest}</button><button class="pxbtn" id="shopb">${u.goShop}</button><button class="pxbtn" id="exit">${u.exit}</button>`;
  sc.append(box);
  box.querySelector('#rest').onclick = sleep;
  box.querySelector('#shopb').onclick = () => wipe(market);
  box.querySelector('#exit').onclick = () => wipe(() => { saveCareer(); persist(); closeScene(); showMenu(); });
  sceneIn(sc, '.endbtns .pxbtn', 70, 120);
}

