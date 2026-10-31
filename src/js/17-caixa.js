/* ================= Caixa ================= */
// O jogador arrasta cada produto por cima do leitor; às vezes não lê e precisa passar de novo
function checkout() {
  const u = U();
  const sc = scene('sc-market sc-cash');
  sc.innerHTML = `<div class="mk-top"><h2>${u.checkoutTitle}</h2><button class="pxbtn main" id="finish" disabled>${u.finish}</button></div>
    <p class="hint mk-hint" id="chint">${u.swipeHint}</p>
    <div class="register">
      <div class="lcd2" id="lcd"><div class="lines"></div><div class="tot">${u.total}: ${money(0)}</div><div class="funds"></div></div>
      <div class="belt"><div class="lane-in"></div><div class="scanner"><i class="laser"></i><span class="glass"></span></div><div class="bags"></div></div>
    </div>
    <div class="pay hidden"><h4>${u.payWith}</h4><div class="seg" id="methods"></div><button class="pxbtn main" id="paybtn" disabled>${u.pay}</button></div>
    <div class="actions hidden" id="after"><button class="pxbtn main" id="home">${u.skipHome}</button></div>`;
  Stage.mount(sc, 'cash');
  sceneIn(sc, '.mk-top, .mk-hint, .lcd2, .belt', 70, 300);
  const laneIn = sc.querySelector('.lane-in'), bags = sc.querySelector('.bags'), scanner = sc.querySelector('.scanner');
  const lines = sc.querySelector('.lines'), tot = sc.querySelector('.tot'), hint = sc.querySelector('#chint'), finish = sc.querySelector('#finish');
  const bought = [], funds = sc.querySelector('.funds'), lcd = sc.querySelector('#lcd');
  let total = 0, fails = 0, closed = false, method = null, paid = false;
  // Se o que passou no leitor custa mais do que a carteira, o pagamento trava até o jogador deixar algo para trás
  const checkFunds = () => {
    const over = total > P.wallet;
    funds.textContent = `${u.wallet}: ${money(P.wallet)}`;
    lcd.classList.toggle('over', over);
    if (closed && !paid) {
      hint.textContent = over ? u.overBudget : u.payHint;
      sc.querySelector('#paybtn').disabled = over || !method;
    }
  };

  const flashScanner = cls => { scanner.classList.remove('ok', 'bad'); void scanner.offsetWidth; scanner.classList.add(cls); };
  const addToBag = id => {
    let bag = bags.lastElementChild;
    if (!bag || bag.querySelectorAll('.inbag').length >= 3) {
      bag = document.createElement('div');
      bag.className = 'bag'; bag.innerHTML = '<div class="bagin"></div>';
      bag.append(bagSprite()); bags.append(bag);
      bag.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, easing: 'steps(4)' });
    }
    const n = bag.querySelectorAll('.inbag').length;
    const c = sprite(SPR[SHOP.find(i => i.id === id).spr], 3);
    pxFit(c, () => innerWidth <= 760 ? [30, 30] : [c.width * 3, c.height * 3]);
    c.classList.add('inbag'); c.style.left = (4 + n * 26) + '%';
    c.onclick = () => {
      if (paid) return;
      const k = bought.indexOf(id);
      if (k >= 0) bought.splice(k, 1);
      total -= SHOP.find(i => i.id === id).price;
      const line = lines.querySelector(`[data-id="${id}"]`); if (line) line.remove();
      tot.textContent = `${u.total}: ${money(total)}`;
      c.remove(); if (!bag.querySelector('.inbag')) bag.remove();
      sfx('click'); checkFunds();
      if (!bought.length && closed) hint.textContent = u.payHint;
    };
    bag.querySelector('.bagin').append(c);
    c.animate([{ transform: 'translateY(-50px)' }, { transform: 'translateY(0)' }], { duration: 240, easing: 'cubic-bezier(.6,0,1,.6)' });
    sfx('key');
  };
  const registerItem = id => {
    const it = SHOP.find(i => i.id === id);
    bought.push(id); total += it.price;
    lines.insertAdjacentHTML('beforeend', `<div data-id="${id}"><span>${L.shop[id][0]}</span><span>${money(it.price)}</span></div>`);
    tot.textContent = `${u.total}: ${money(total)}`;
    finish.disabled = false;
    checkFunds();
  };
  const showPay = () => {
    if (closed) return;
    closed = true; finish.disabled = true;
    laneIn.querySelectorAll('.belt-item').forEach(el => el.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 300, fill: 'forwards' }));
    sc.querySelector('.pay').classList.remove('hidden');
    checkFunds();
  };
  finish.onclick = showPay;

  const startDrag = (e, el, id) => {
    if (closed) return;
    e.preventDefault();
    const r = el.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    el.style.setProperty('--dw', r.width + 'px');
    el.classList.add('dragging');
    el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
    sc.append(el);
    let inside = false, enterSide = 0, read = false;
    const move = ev => {
      el.style.left = ev.clientX - ox + 'px'; el.style.top = ev.clientY - oy + 'px';
      if (read) return;
      const s = scanner.getBoundingClientRect(), mid = s.left + s.width / 2;
      const now = ev.clientX > s.left - 10 && ev.clientX < s.right + 10 && ev.clientY > s.top - 110 && ev.clientY < s.bottom + 10;
      if (now && !inside) { inside = true; enterSide = ev.clientX < mid ? -1 : 1; }
      if (!now && inside) {
        inside = false;
        if ((ev.clientX < mid ? -1 : 1) !== enterSide) {
          if (fails < 2 && Math.random() < 0.3) { fails++; flashScanner('bad'); sfx('err'); hint.textContent = u.noRead; }
          else { fails = 0; read = true; flashScanner('ok'); sfx('beep'); el.classList.add('read'); registerItem(id); hint.textContent = u.swipeHint; }
        }
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      el.classList.remove('dragging');
      el.style.left = el.style.top = '';
      if (read) { el.remove(); addToBag(id); if (!laneIn.querySelector('.belt-item')) showPay(); }
      else laneIn.append(el);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
  };
  for (const id of S.cart) {
    const el = pxFit(sprite(SPR[SHOP.find(i => i.id === id).spr], 5), () => { const t = Math.min(96, Math.max(TOUCH ? 60 : 48, innerWidth * .06)); return [t, t]; });
    el.classList.add('belt-item');
    el.onpointerdown = e => startDrag(e, el, id);
    laneIn.append(el);
  }

  const methods = sc.querySelector('#methods'), payBtn = sc.querySelector('#paybtn');
  [['cash', 'bill'], ['card', 'card'], ['pix', 'paycel']].forEach(([k, spr]) => {
    const b = document.createElement('button');
    b.className = 'pxbtn paym';
    b.append(sprite(SPR[spr], 3));
    b.insertAdjacentHTML('beforeend', `<span>${u[k]}</span>`);
    b.onclick = () => { method = k; methods.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); sfx('click'); checkFunds(); };
    methods.append(b);
  });
  payBtn.onclick = () => {
    if (total > P.wallet || !bought.length) { sfx('err'); checkFunds(); return; }
    paid = true; payBtn.disabled = true; methods.querySelectorAll('button').forEach(x => { x.disabled = true; });
    tot.textContent = u.processing;
    setTimeout(() => {
      tot.textContent = `${u.approved} · ${money(total)}`; sc.querySelector('#lcd').classList.add('good'); sfx('coin');
      P.wallet -= total;
      funds.textContent = `${u.wallet}: ${money(P.wallet)}`;
      for (const id of bought) {
        const it = SHOP.find(i => i.id === id);
        if (it.kind === 'use') S.inv[id]++;
        if (it.kind === 'day') S.today.add(id);
        if (it.kind === 'decor' && !P.decor.includes(id)) P.decor.push(id);
      }
      S.cart = [];
      persist(); saveCareer(); hud(); renderDesk();
      sc.querySelector('#after').classList.remove('hidden');
    }, 1000);
  };
  sc.querySelector('#home').onclick = sleep;
}

function clearDom() {
  document.querySelectorAll('.popup, #bossAlert, #video, #lane, #toast, #tip, #dust').forEach(e => e.remove());
  $('boss').classList.add('hidden');
  hudFlag('vignette', 'on', false);
}

function startDay() {
  closeModal(); clearDom();
  tasksEl.innerHTML = ''; $('chips').innerHTML = '';
  Object.assign(S, { phase: 'day', paused: false, boss: false, bossAuto: 0, dayT: 0, dayScore: 0, level: 1, lastLevel: 1,
    stress: Math.round(S.stress * 0.4), causes: {}, file: null, fast: false, tasks: [], nextTask: 5, nextEvent: 16,
    nextCoffee: rand(15, 25), order: [0, 1, 2, 3], slowT: 0, coffee: null, bossAlert: null, frozen: null, virus: false,
    shuffleT: 0, video: null, burnout: false, openTask: null, tipQ: [], tipT: 0, last: performance.now() });
  buildBoard(); spawnFile(); hud(); renderDesk();
  music('office');
}

function causeBars(causes) {
  const list = Object.entries(causes).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!list.length) return `<p>${U().perfect}</p>`;
  const total = list.reduce((a, [, v]) => a + v, 0);
  return list.map(([k, v]) => `<div class="cause"><span>${L.causes[k]}</span><div class="b" style="width:${v / list[0][1] * 100}%"></div><span>${Math.round(v / total * 100)}%</span></div>`).join('');
}

// reason: 'quit' (termo de rescisão assinado) ou 'burnout' (estresse chegou a 100). Cada um tem título, carimbo e relatório próprios.
function gameOver(reason = 'burnout') {
  music('over');
  S.running = false; S.phase = 'over';
  clearDom(); closeScene(); clearCareer();
  const u = U();
  const rescisao = Math.round((S.dayScore || 0) / 20);
  P.wallet += rescisao;
  if (S.score > P.best) P.best = S.score;
  P.stats.maxDay = Math.max(P.stats.maxDay, S.day);
  persist(); hud();
  const r = S.rankIdx, next = r + 1 < RANK_POINTS.length ? r + 1 : null;
  const quit = reason === 'quit';
  S.endReason = reason;
  const card = modal(`<span class="over-box"></span><span class="over-stamp">${quit ? u.resignStamp : u.stampOver}</span><h2>${quit ? u.quitTitle : u.burnoutTitle}</h2><p>${u.hrReport(S.day, clockText())} ${quit ? u.quitLine : u.burnoutLine}</p>
    <p class="over-who"><span class="over-face"></span><b>${profileName()}</b> · Nº ${EMP_ID}</p>
    <h4>${u.rankReached}</h4><div class="big">${L.ranks[r]}</div>
    <p>${u.summary(fmt(S.score), S.day)} ${next !== null ? u.missing(fmt(RANK_POINTS[next] - S.score), L.ranks[next]) : u.top} ${u.record}: ${fmt(P.best)}.</p>
    <p class="money">${u.severance}: + ${money(rescisao)}</p>
    <h4>${quit ? u.reasonsQuit : u.reasonsBurnout}</h4>${causeBars(S.careerCauses)}
    <div class="actions"><button class="pxbtn main" id="go">${u.newJob}</button><button class="pxbtn" id="menu">${u.mainMenu}</button></div>`);
  card.classList.add('over-card');
  card.querySelector('.over-box').append(Pixel.el(SPR2.box, 4));
  card.querySelector('.over-face').append(portrait(2));
  setTimeout(() => { const st = card.querySelector('.over-stamp'); if (st) { st.classList.add('on'); Motion.stamp(st); sfx('err'); } }, 650);
  card.querySelector('#go').onclick = () => newCareer();
  card.querySelector('#menu').onclick = showMenu;
}


