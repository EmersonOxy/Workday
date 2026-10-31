/* ================= Linguagem de animação ================= */
// Princípios: antecipação antes de movimentos grandes, impacto com achatamento (squash) e acomodação com
// sobre-impulso (overshoot). Movimento físico usa curvas suaves; o que é "máquina" (LEDs, impressora,
// vapor, cursor) usa quadros (steps). Tudo encolhe para transições simples com "reduzir movimento".
const Motion = {
  reduced: matchMedia('(prefers-reduced-motion: reduce)'),
  T: { micro: 90, short: 160, med: 260, long: 420, beat: 600 },
  E: {
    out: 'cubic-bezier(.22,1,.36,1)',        // desacelera: entradas
    in: 'cubic-bezier(.55,0,1,.45)',          // acelera: quedas, saídas
    back: 'cubic-bezier(.34,1.56,.64,1)',     // passa do ponto e volta: chegadas com personalidade
    anticip: 'cubic-bezier(.6,-.35,.7,.05)',  // recua antes de ir: saídas com intenção
    snap: 'cubic-bezier(.2,.9,.3,1)',         // estalo: botões, carimbos
    inOut: 'cubic-bezier(.65,0,.35,1)',       // ambiente, câmera
  },
  play(el, frames, opts = {}) {
    if (!el || !el.animate) return null;
    if (this.reduced.matches) {
      // Mantém só opacidade/cor; remove deslocamento, escala e rotação
      frames = frames.map(f => { const g = { ...f }; delete g.transform; delete g.translate; delete g.scale; delete g.rotate; return g; });
      opts = { ...opts, duration: Math.min(opts.duration || 200, 120) };
    }
    return el.animate(frames, { fill: 'both', ...opts });
  },
  // Chegada: cai do alto, estica no ar, achata no impacto e acomoda
  dropIn(el, dist = 18) {
    return this.play(el, [
      { transform: `translateY(-${dist}px) scale(.92,1.12)`, opacity: 0 },
      { transform: 'translateY(2px) scale(1.12,.86)', opacity: 1, offset: .55 },
      { transform: 'translateY(-1px) scale(.97,1.04)', offset: .78 },
      { transform: 'none', opacity: 1 },
    ], { duration: this.T.long, easing: 'linear' });
  },
  // Impacto ao pousar (documento na bandeja)
  squash(el) {
    return this.play(el, [
      { transform: 'scale(1,1)' }, { transform: 'scale(1.18,.78)', offset: .25 },
      { transform: 'scale(.94,1.06)', offset: .55 }, { transform: 'scale(1.02,.98)', offset: .8 }, { transform: 'scale(1,1)' },
    ], { duration: this.T.med, easing: this.E.out, fill: 'none' });
  },
  // Erro: quica para fora, inclina e treme
  reject(el) {
    return this.play(el, [
      { transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(0,-14px) rotate(-8deg)', offset: .3 },
      { transform: 'translate(-6px,-6px) rotate(6deg)', offset: .5 }, { transform: 'translate(5px,-4px) rotate(-4deg)', offset: .68 },
      { transform: 'translate(-2px,0) rotate(2deg)', offset: .84 }, { transform: 'translate(0,0) rotate(0)' },
    ], { duration: this.T.beat, easing: this.E.out, fill: 'none' });
  },
  // Entrada de cartão (tarefa, notificação): desliza com sobre-impulso
  enter(el, from = 'right') {
    const d = { right: 'translateX(28px)', left: 'translateX(-28px)', up: 'translateY(-18px)', down: 'translateY(18px)' }[from];
    return this.play(el, [{ transform: d + ' scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: this.T.med, easing: this.E.back });
  },
  // Saída com antecipação: recua um pouco, depois vai
  leave(el, to = 'right') {
    const d = { right: 'translateX(40px)', left: 'translateX(-40px)', up: 'translateY(-24px)', down: 'translateY(24px)' }[to];
    return this.play(el, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.04)', offset: .3, opacity: 1 }, { transform: d + ' scale(.9)', opacity: 0 }],
      { duration: this.T.med, easing: this.E.anticip });
  },
  // Carimbo de concluído: cresce, bate e assenta
  stamp(el) {
    return this.play(el, [{ transform: 'scale(2.2) rotate(-14deg)', opacity: 0 }, { transform: 'scale(.9) rotate(-8deg)', opacity: 1, offset: .55 },
      { transform: 'scale(1.06) rotate(-9deg)', offset: .8 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }],
      { duration: this.T.med, easing: this.E.in });
  },
  // Tremor curto e decrescente (erro, alerta). Força em px.
  shake(el, f = 4) {
    return this.play(el, [0, -f, f * .8, -f * .5, f * .3, 0].map(x => ({ transform: `translateX(${x}px)` })),
      { duration: this.T.med, easing: 'linear', fill: 'none' });
  },
  // Soco: contadores e selos que "batem" ao mudar
  punch(el, k = 1.35) {
    return this.play(el, [{ transform: 'scale(1)' }, { transform: `scale(${k})`, offset: .3 }, { transform: 'scale(.95)', offset: .65 }, { transform: 'scale(1)' }],
      { duration: this.T.med, easing: this.E.out, fill: 'none' });
  },
  // Texto que sobe e some (+pontos, mensagens)
  floatText(parent, text, x, y, cls = '') {
    const t = document.createElement('div');
    t.className = 'mo-float ' + cls; t.textContent = text; t.style.left = x + 'px'; t.style.top = y + 'px';
    parent.append(t);
    const a = this.play(t, [{ transform: 'translateY(6px) scale(.6)', opacity: 0 }, { transform: 'translateY(-4px) scale(1.15)', opacity: 1, offset: .2 },
      { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: .55 }, { transform: 'translateY(-30px) scale(1)', opacity: 0 }],
      { duration: 900, easing: this.E.out });
    if (a) a.onfinish = () => t.remove(); else t.remove();
  },
  // Pulso de urgência (contínuo; devolve a animação para cancelar)
  urgent(el) {
    return this.play(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(-2deg)', offset: .1 }, { transform: 'rotate(2deg)', offset: .2 },
      { transform: 'rotate(-1deg)', offset: .3 }, { transform: 'rotate(0)', offset: .4 }, { transform: 'rotate(0)' }],
      { duration: 900, iterations: Infinity, easing: 'linear', fill: 'none' });
  },
  // Botão físico: afunda ao pressionar, volta com leve sobre-impulso
  press(el) {
    return this.play(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(3px)', offset: .35 }, { transform: 'translateY(-1px)', offset: .75 }, { transform: 'translateY(0)' }],
      { duration: this.T.short, easing: this.E.snap, fill: 'none' });
  },
};
