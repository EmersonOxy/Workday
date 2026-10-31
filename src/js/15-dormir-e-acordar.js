/* ================= Dormir e acordar ================= */
function sleep() {
  music(null);
  wipe(sleepScene, { rgb: [43, 35, 64], dur: 520, hold: 260 });
}
function sleepScene() {
  const sc = scene('sc-sleep');
  const st = sc.stage = Stage.mount(sc, 'bed', { cat: P.decor.includes('gato'), coat: hw().cat }), head = st.anchors.head;
  for (let i = 0; i < 11; i++) {
    const z = document.createElement('span');
    z.className = 'zz'; z.textContent = i % 3 ? 'z' : 'Z';
    z.style.cssText = `left:${head.x + rand(0, 30) | 0}px;top:${head.y - rand(10, 40) | 0}px;font-size:${rand(24, 64) | 0}px;animation-delay:${0.1 + i * 0.26}s`;
    sc.append(z);
  }
  setTimeout(() => { if ($('scene') === sc) alarm(sc); }, 3500);
}
// Dígitos de despertador feitos de quadradinhos (fonte 3x5)
function segDigits(str) {
  const F = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'], ':': ['0', '1', '0', '1', '0'] };
  const cell = 9, gap = 2, glyphs = [...str].map(ch => F[ch]);
  const cols = glyphs.reduce((a, g) => a + g[0].length + 1, -1);
  const c = document.createElement('canvas');
  c.width = cols * cell; c.height = 5 * cell; c.className = 'segs';
  const x = c.getContext('2d');
  let ox = 0;
  for (const g of glyphs) {
    g.forEach((row, j) => [...row].forEach((v, i) => {
      x.fillStyle = v === '1' ? '#ef4b3f' : '#2a1f2d';
      x.fillRect((ox + i) * cell, j * cell, cell - gap, cell - gap);
    }));
    ox += g[0].length + 1;
  }
  return c;
}
function alarm(sc) {
  const box = document.createElement('button');
  box.className = 'alarm';
  box.innerHTML = `<i class="bell l"></i><i class="bell r"></i><span class="face"></span><i class="leg l"></i><i class="leg r"></i>`;
  box.querySelector('.face').append(pxFit(segDigits('06:00'), () => { const t = box.closest('.onstand') ? Math.min(150, Math.max(90, innerWidth * .09)) : Math.min(360, Math.max(200, innerWidth * .4)); return [t, t]; }));
  const hint = document.createElement('p');
  hint.className = 'sc-hint'; hint.textContent = U().wakeHint;
  if (sc.stage) Stage.set(sc.stage, { dawn: true });
  // Com espaço ao lado da cama, o despertador fica em cima do criado-mudo; senão, à frente da cena
  const stand = sc.stage && sc.stage.anchors.stand;
  if (stand) { const w = document.createElement('div'); w.className = 'onstand'; w.style.cssText = `left:${stand.x}px;top:${stand.y}px`; w.append(box); sc.append(w, hint); }
  else sc.append(box, hint);
  pxRefit(box.querySelector('.segs'));   // o tamanho depende de onde o despertador ficou
  sfx('clock');
  const ring = setInterval(() => sfx('clock'), 1000);
  box.onclick = () => {
    clearInterval(ring); sfx('wake');
    box.classList.add('off'); hint.remove();
    const flash = document.createElement('div');
    flash.className = 'wakeflash';
    sc.append(flash);
    setTimeout(nextDay, 750);
  };
}

