/* ================= Arcade Workday: utilitários dos novos minigames =================
   Canvas 128x160; mesma renderização pixelada, idioma e contrato do minigame original. */
function arcadeClock() {
  const clock = mgClock(false);
  let last = clock.now();
  return {
    step() { const t = clock.now(), dt = Math.max(0, Math.min(.05, t - last)); last = t; return dt; },
    stop() { clock.stop(); }
  };
}
function arcadeEmployee(ctx, x, y, kind = 'player', scale = 1) {
  // Sprite modular de 16×20 px. Cada quadrado é um pixel lógico; nunca há
  // antialias ou escala fracionária, mesmo quando o ator se desloca no campo.
  scale = Math.max(1, Math.round(scale));
  const boss = kind === 'boss', keeper = kind === 'keeper';
  const shirt = boss ? ['J','M','j'] : keeper ? ['Y','z','%'] : ['L','7','6'];
  const hair = boss ? ['j','M'] : keeper ? ['8','O'] : ['4','T'];
  const tie = boss ? 'R' : keeper ? 'x' : 'q';
  const rows = [
    '.....kkkkkk.....',
    '....kHHHHHHk....',
    '...kHHHHHHHHk...',
    '..kHHHHHHHHHHk..',
    '..kHSSSSSSSSSk..',
    '..kHSESSSSESSk..',
    '..kHSkSSSSkSSk..',
    '..kHSSSSSSSSSk..',
    '...kHSSS5SSSk...',
    '....kSSSSSSk....',
    '...kkSSSSSSkk...',
    '..kBBBBBBBBBBk..',
    '.kBBbBBWWBBbBBk.',
    '.kBBbBBWWBBbBBk.',
    '.kBBBBBTBBBBBBk.',
    '.kBBBBBBBBBBBBk.',
    '..kBBBBBBBBBBk..',
    '...kkBBBBBBkk...',
    '...kKK...KKk....',
    '..kkKK...KKkk...'
  ];
  const colors = { k: WD_PAL.k, K: WD_PAL.K, S: WD_PAL.s, E: WD_PAL.S, 5: WD_PAL[5],
    W: WD_PAL.W, B: WD_PAL[shirt[0]], b: WD_PAL[shirt[1]], T: WD_PAL[tie], H: WD_PAL[hair[0]],
    h: WD_PAL[hair[1]] };
  // Cabelo e tecido recebem pequenos highlights separados para volume legível.
  const pixels = rows;
  const ox = Math.round(x / scale) * scale, oy = Math.round(y / scale) * scale;
  for (let py = 0; py < pixels.length; py++) for (let px = 0; px < pixels[py].length; px++) {
    let id = pixels[py][px];
    if (id !== '.' && colors[id]) {
      ctx.fillStyle = colors[id];
      ctx.fillRect(ox + px * scale, oy + py * scale, scale, scale);
    }
  }
  // Penteado e camisa são variantes de setor, sem alterar a silhueta/base.
  ctx.fillStyle = WD_PAL[hair[1]]; ctx.fillRect(ox+5*scale,oy+2*scale,3*scale,scale);
  ctx.fillStyle = WD_PAL[shirt[2]]; ctx.fillRect(ox+2*scale,oy+15*scale,2*scale,scale);
}
function arcadeDoneOnce(done) {
  let completed = false;
  return value => { if (!completed) { completed = true; done(value); } };
}
function arcadePointerXY(cv, e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX-r.left)/r.width*MG.W, y: (e.clientY-r.top)/r.height*MG.H };
}
function arcadeGrade(me, opponent, vs) {
  if (vs) return me > opponent ? 'good' : me === opponent ? 'ok' : 'bad';
  return me >= 2 ? 'good' : me === 1 ? 'ok' : 'bad';
}
