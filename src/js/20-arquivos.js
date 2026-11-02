/* ================= Arquivos ================= */
function spawnFile() {
  const dest = pick(SECTORS), u = U();
  let kind = S.day >= 3 && S.level >= 4 && Math.random() < 0.15 ? 'dead' : S.day >= 2 && S.level >= 3 && Math.random() < 0.2 ? 'urgent' : 'normal';
  if (kind === 'normal' && mod().finUrgent && dest.id === 'fin' && Math.random() < 0.5) kind = 'urgent';
  tip(kind === 'normal' ? 'file' : kind);
  const el = document.createElement('div');
  el.className = 'file' + (kind === 'normal' ? '' : ' ' + kind);
  if (kind === 'dead') {
    el.append(sprite(SPR.trash, 3));
    el.insertAdjacentHTML('beforeend', `<div class="txt"><span class="tag">${u.deadFile}</span><span class="sub">${u.pressDelete}</span></div>`);
  } else {
    el.style.borderColor = dest.color;
    el.style.setProperty('--c', kind === 'urgent' ? 'var(--danger)' : dest.color);
    if (kind === 'urgent') el.insertAdjacentHTML('beforeend', `<i class="stampu">${u.urgent}</i>`);
    const tile = document.createElement('span'); tile.className = 'tile'; tile.append(Pixel.el(SPR2[GLYPH[dest.id]], 2)); el.append(tile);
    el.insertAdjacentHTML('beforeend', `<div class="txt"><span class="tag" style="color:${dest.color}">${kind === 'urgent' ? '! ' : ''}${sectorName(dest.id)}</span><span class="sub">${kind === 'urgent' ? u.urgent + ' · ' : ''}${pick(L.docs[dest.id])}</span></div>`);
  }
  board.append(el);
  Motion.play(el, [{ transform: 'translateY(-10px) scale(.9,1.14)', opacity: 0 }, { transform: 'scale(1.03,.97)', opacity: 1, offset: .6 }, { transform: 'none', opacity: 1 }], { duration: Motion.T.med, easing: Motion.E.out, fill: 'none' });
  S.dropNow = false;
  // cada documento cai do seu jeito: fase, ritmo e amplitude próprios do balanço, e um leve desvio dentro da coluna
  S.file = { el, kind, dest: dest.id, lane: Math.floor(Math.random() * SECTORS.length), y: -60, ph: Math.random() * 6.28, sp: 2.2 + Math.random() * 1.4, amp: 1.5 + Math.random() * 2, off: Math.round((Math.random() - .5) * 8) };
  placeFile();
}
// A queda é desenhada com aceleração (velocidade sobe de 0,72× a 1,28× da média), mas o arquivo chega
// à bandeja no mesmo instante da física original: a posição lógica (f.y) e o tempo de reação não mudam.
function fallVis(y, H) { if (H <= 0 || y <= 0) return y; const u = Math.min(1, y / H); return H * (.72 * u + .28 * u * u); }
function placeFile() {
  const f = S.file, w = laneWidth(), H = board.clientHeight - S.trays[0].offsetHeight - f.el.offsetHeight;
  f.el.style.left = (f.lane * w + 8) + 'px'; f.el.style.width = (w - 16) + 'px'; const u = H > 0 ? Math.min(1, Math.max(0, f.y / H)) : 0, red = Motion.reduced.matches;
  f.el.style.top = (red ? f.y : fallVis(f.y, H)) + 'px';
  // balanço de folha caindo, sem girar o sprite (girar borra a grade): pêndulo lateral no tempo, que amortece perto da bandeja;
  // o deslocamento é arredondado para pixels físicos inteiros (nítido) e acompanha cada quadro (suave)
  const dpr = window.devicePixelRatio || 1, damp = 1 - u * .65, t = performance.now() / 1000;
  const sx = red ? 0 : ((f.off || 0) + Math.sin(t * (f.sp || 2.6) + (f.ph || 0)) * (f.amp || 4) * damp), sy = red ? 0 : Math.abs(Math.cos(t * (f.sp || 2.6) + (f.ph || 0))) * 1.5 * damp;
  f.el.style.rotate = ''; f.el.style.translate = red ? '' : `${Math.round(sx * dpr) / dpr}px ${Math.round(-sy * dpr) / dpr}px`;
}
// O documento que saiu de jogo continua na tela só para terminar a animação
function retireFile(el, how) {
  el.style.pointerEvents = 'none'; el.classList.add('gone');
  const end = () => el.remove();
  const a = how === 'ok' ? Motion.play(el, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.16,.8)', opacity: 1, offset: .3 }, { transform: 'scale(.98,1.04)', offset: .55 }, { transform: 'translateY(40%) scale(.9,.5)', opacity: 0 }], { duration: 420, easing: Motion.E.out })
    : how === 'trash' ? Motion.play(el, [{ transform: 'none', opacity: 1 }, { transform: 'scale(1.1,.9) rotate(-4deg)', offset: .25, opacity: 1 }, { transform: 'scale(.15) rotate(50deg)', opacity: 0 }], { duration: 360, easing: Motion.E.anticip })
    : Motion.play(el, [{ transform: 'none', opacity: 1 }, { transform: 'translate(0,-26%) rotate(-9deg)', offset: .3, opacity: 1 }, { transform: 'translate(-6%,-14%) rotate(6deg)', offset: .55, opacity: 1 }, { transform: 'translate(4%,30%) rotate(-3deg)', opacity: 0 }], { duration: 620, easing: Motion.E.out });
  if (a) a.onfinish = end; else end();
}
function bumpTray(i, bad) {
  const t = S.trays[i];
  Motion.play(t, [{ transform: 'translateY(0)' }, { transform: 'translateY(6px)', offset: .3 }, { transform: 'translateY(-2px)', offset: .7 }, { transform: 'translateY(0)' }], { duration: 300, easing: Motion.E.out, fill: 'none' });
  if (bad) { Motion.shake(t, 5); t.classList.remove('bad'); void t.offsetWidth; t.classList.add('bad'); }
}
function landFile() {
  const f = S.file, w = laneWidth(), x = f.lane * w + w / 2 - 20, y = board.clientHeight - S.trays[0].offsetHeight - f.el.offsetHeight - 30, u = U();
  if (f.kind === 'dead') fail(12, u.fDead, 'dead');
  else if (SECTORS[S.order[f.lane]].id === f.dest) {
    success(f.kind === 'urgent' ? 20 : 10, x, y); stat('files');
    bumpTray(f.lane, false); retireFile(f.el, 'ok'); spawnFile(); return;
  } else if (f.kind === 'urgent') { fail(26, null, 'urgent'); Motion.floatText(board, u.fUrgent, Math.max(4, x - 40), y, 'bad'); }
  else { fail(14, null, 'wrong'); Motion.floatText(board, u.fWrong, Math.max(4, x - 40), y, 'bad'); }
  bumpTray(f.lane, true); retireFile(f.el, 'bad');
  spawnFile();
}
function deleteFile() {
  const f = S.file;
  if (f.kind === 'dead') { sfx('trash'); success(12, f.lane * laneWidth() + 10, f.y); retireFile(f.el, 'trash'); }
  else { fail(18, U().fDel, 'del'); retireFile(f.el, 'trash'); }
  spawnFile();
}

