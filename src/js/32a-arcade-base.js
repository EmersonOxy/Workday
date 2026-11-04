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
  // Micro-sprite próprio: cabeça, cabelo, camisa, gravata e braços; sem antialiasing.
  const boss = kind === 'boss', keeper = kind === 'keeper';
  const hair = boss ? '#626875' : keeper ? '#a8683e' : '#87502c';
  const shirt = boss ? '#3b3f48' : keeper ? '#f4c15d' : '#c3d5ff';
  const tie = boss ? '#ef4b3f' : keeper ? '#2f6f78' : '#a8262a';
  const fill = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect((x + a * scale)|0, (y + b * scale)|0, Math.max(1,w*scale), Math.max(1,h*scale)); };
  fill('#2a1f2d',0,0,9,12);
  fill(hair,2,0,5,2);
  fill('#f2c4a0',2,2,5,5);
  fill('#2a1f2d',3,4,1,1); fill('#2a1f2d',6,4,1,1);
  if (boss) { fill('#2a1f2d',2,3,2,1); fill('#2a1f2d',5,3,2,1); }
  fill(shirt,1,7,7,4); fill(tie,4,7,1,4);
  fill('#2a1f2d',1,11,3,1); fill('#2a1f2d',5,11,3,1);
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
