/* ================= Duda como adversário ================= */
// Módulo de competição reutilizável: cada minigame cria um rival com Rival.create(jogo, vs) e informa os eventos
// que pontuam (nota que passa, alvo que surge). O rival decide cada evento pelas MESMAS regras de pontuação do
// jogador, com habilidade estável na partida e variação natural por evento. Nada é inventado no final.
// Histórico em "expediente-duda-rival": por jogo {w, l, d} (do ponto de vista do jogador), últimas 10 partidas e sequência.
const RIVAL_SKILL = { facil: .58, normal: .7, dificil: .8, burnout: .88 };
const Rival = {
  load() { return Object.assign({ games: {}, last: [], streak: null }, load('duda-rival', {})); },
  total(H = Rival.load()) { return Object.values(H.games).reduce((a, g) => ({ w: a.w + g.w, l: a.l + g.l, d: a.d + g.d }), { w: 0, l: 0, d: 0 }); },
  create(game, vs) {
    if (!vs) return null;
    const H = Rival.load(), g = H.games[game] || { w: 0, l: 0, d: 0 };
    // perdendo a rivalidade, Duda se esforça mais; liderando, relaxa um pouco
    const adj = Math.max(-.05, Math.min(.07, (g.w - g.l) * .02));
    return { game, skill: Math.min(.95, (RIVAL_SKILL[CFG.diff || 'normal'] || .7) + adj + (Math.random() - .5) * .06), score: 0, combo: 0, best: 0, hits: 0, miss: 0, lead: 0, queue: [], el: null };
  },
  // Batida de Ponto: julga a nota com a mesma tabela (perfeito 300 + combo×5, bom 120 + combo×2, sustentada +100)
  note(r, n) {
    const p = Math.random(), tired = Math.min(.08, r.combo * .002);    // combos longos pesam um pouco
    if (p < r.skill * .6 - tired) { r.score += 300 + r.combo * 5; r.combo++; r.hits++; }
    else if (p < r.skill + .12 - tired) { r.score += 120 + r.combo * 2; r.combo++; r.hits++; }
    else { r.combo = 0; r.miss++; return; }
    r.best = Math.max(r.best, r.combo);
    if (n.end && Math.random() < r.skill + .1) r.score += 100;
  },
  // Exterminador: cada alvo que surge vira uma tentativa do Duda após um tempo de reação; acerto vale 10 × multiplicador
  foe(r, t, f) { r.queue.push({ at: t + .5 + Math.random() * 1.1 * (1.2 - r.skill), hp: f.hp }); },
  tick(r, t) {
    while (r.queue.length && r.queue[0].at <= t) {
      r.queue.shift();
      if (Math.random() < r.skill + .08) { r.combo++; r.hits++; r.best = Math.max(r.best, r.combo); r.score += 10 * Math.min(5, 1 + (r.combo / 5 | 0)); }
      else { r.combo = 0; r.miss++; }
    }
  },
  // Placar ao vivo no canto da tela do jogo; anuncia viradas
  hud(r, st, me) {
    if (!r) return;
    if (!r.el) { r.el = document.createElement('div'); r.el.className = 'mg-vs'; r.el.innerHTML = `<span class="me"></span><b>×</b><span class="du"></span>`; st.cv.parentElement.append(r.el); }
    const u = U(), lead = me > r.score ? 1 : me < r.score ? -1 : 0;
    r.el.querySelector('.me').textContent = `${u.vsYou} ${fmt(me)}`; r.el.querySelector('.du').textContent = `${fmt(r.score)} DUDA`;
    r.el.classList.toggle('ahead', lead > 0); r.el.classList.toggle('behind', lead < 0);
    if (lead && r.lead && lead !== r.lead) { mgPop(st, lead > 0 ? u.vsTurn : u.vsDudaTurn, lead > 0 ? 'ok' : 'bad'); Motion.punch(r.el, 1.15); }
    if (lead) r.lead = lead;
  },
  // Fim da partida: registra o confronto e devolve o resultado do ponto de vista do jogador
  finish(r, me) {
    const res = me > r.score ? 'win' : me < r.score ? 'lose' : 'draw', H = Rival.load(), g = H.games[r.game] || (H.games[r.game] = { w: 0, l: 0, d: 0 });
    const prev = H.streak;
    g[res === 'win' ? 'w' : res === 'lose' ? 'l' : 'd']++;
    H.last = [{ g: r.game, me, duda: r.score, r: res, at: Date.now() }, ...H.last].slice(0, 10);
    const who = res === 'win' ? 'me' : res === 'lose' ? 'duda' : null;
    H.streak = who ? (prev && prev.who === who ? { who, n: prev.n + 1 } : { who, n: 1 }) : null;
    save('duda-rival', H);
    // virada: alguém quebrou uma sequência de pelo menos 2 vitórias do outro
    const broke = prev && who && prev.who !== who && prev.n >= 2;
    return { res, me, duda: r.score, broke };
  },
  // Humor do Duda antes da partida, a partir do histórico (confrontos, não pontuações absolutas)
  mood(game) {
    const H = Rival.load(), g = H.games[game] || { w: 0, l: 0, d: 0 }, T = Rival.total(H), n = T.w + T.l + T.d;
    if (!n) return 'first';
    if (H.streak && H.streak.n >= 3) return H.streak.who === 'me' ? 'desperate' : 'cocky';
    const diff = (g.w + T.w) - (g.l + T.l);
    return diff >= 2 ? 'behind' : diff <= -2 ? 'ahead' : 'even';
  },
};
