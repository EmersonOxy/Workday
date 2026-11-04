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
  // Trabalhador em miniatura com silhueta, camisa, gravata, braços e pernas.
  const boss = kind === 'boss', keeper = kind === 'keeper';
  const hair = boss ? '#626875' : keeper ? '#a8683e' : '#87502c';
  const hairLight = boss ? '#9aa0ab' : keeper ? '#c98f30' : '#a8683e';
  const shirt = boss ? '#3b3f48' : keeper ? '#f4c15d' : '#c3d5ff';
  const shade = boss ? '#2b2340' : keeper ? '#c98a2e' : '#44609f';
  const tie = boss ? '#ef4b3f' : keeper ? '#2f6f78' : '#a8262a';
  const fill = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect((x + a * scale)|0, (y + b * scale)|0, Math.max(1,w*scale), Math.max(1,h*scale)); };
  fill('#2a1f2d',1,0,9,8);
  fill(hair,2,1,7,2);fill(hairLight,3,1,3,1);
  fill('#f2c4a0',2,3,7,5);fill('#d99a76',8,4,1,3);
  fill('#2a1f2d',3,5,1,1);fill('#2a1f2d',7,5,1,1);
  if(boss){fill('#2a1f2d',2,4,3,1);fill('#2a1f2d',6,4,3,1);fill('#a8684c',4,7,3,1);}
  else fill('#a8684c',4,7,3,1);
  fill('#2a1f2d',1,8,9,4);fill(shirt,2,8,7,4);
  fill(shade,1,9,1,2);fill(shade,9,9,1,2);
  fill(tie,5,8,1,4);fill('#fff8ec',4,8,1,1);
  fill('#2a1f2d',2,12,3,2);fill('#2a1f2d',6,12,3,2);
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
