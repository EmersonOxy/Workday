/* ================= Relógio de ponto ================= */
function clockDevice(time) {
  const u = U();
  const dev = document.createElement('div');
  dev.className = 'clockdev';
  dev.innerHTML = `<div class="paper"></div><div class="hump"><div class="slot"></div></div>
    <div class="cd-row">
      <div class="lcd"><div class="date">${u.day} ${S ? S.day : 1} · WORKDAY</div><div class="t1">${time}</div><div class="t2">${u.placeFinger}</div><div class="menu">MENU</div></div>
      <div class="cd-side"><span class="usb"></span><span class="btns"><i class="rb"></i><i class="bb"></i></span><span class="brand">PONTO<br>MATIC</span></div>
    </div>
    <div class="cd-row cd-bottom"><span class="sticker">WORKDAY LTDA.<br>Nº ${EMP_ID}</span>
      <div class="reader"><div class="pad"><span class="fp"></span><i class="scan"></i><b class="prog"></b></div></div></div>`;
  dev.querySelector('.fp').replaceWith(sprite(SPR.finger, 5, { ...PAL, k: '#c3d5ff' }));
  return dev;
}
// Segurar na digital por 1,1 s; às vezes a leitura falha e é preciso repetir
function fingerprint(dev, onOk) {
  const pad = dev.querySelector('.pad'), lcd = dev.querySelector('.lcd'), t2 = dev.querySelector('.t2'), prog = dev.querySelector('.prog'), u = U();
  let holding = false, t = 0, last = 0, fails = 0, busy = false;
  const set = (txt, cls) => { t2.textContent = txt; lcd.className = 'lcd ' + (cls || ''); };
  const tick = now => {
    if (!holding) return;
    t += (now - last) / 1000; last = now;
    prog.style.height = Math.min(100, t / 1.1 * 100) + '%';
    if (t >= 1.1) { holding = false; finish(); return; }
    requestAnimationFrame(tick);
  };
  const finish = () => {
    busy = true; pad.classList.remove('reading');
    if (fails < 2 && Math.random() < 0.3) {
      fails++; set(u.readFail, 'bad'); sfx('err');
      dev.classList.remove('shake'); void dev.offsetWidth; dev.classList.add('shake');
      setTimeout(() => { busy = false; prog.style.height = '0'; set(u.placeFinger); }, 1000);
    } else { set(u.readOk, 'good'); sfx('ok'); setTimeout(onOk, 600); }
  };
  pad.onpointerdown = e => {
    if (busy) return;
    holding = true; t = 0; last = performance.now();
    pad.setPointerCapture(e.pointerId); pad.classList.add('reading'); set(u.reading); sfx('scan');
    requestAnimationFrame(tick);
  };
  pad.onpointerup = pad.onpointercancel = () => {
    if (!holding) return;
    holding = false; pad.classList.remove('reading'); prog.style.height = '0'; set(u.placeFinger);
  };
}

function clockIn() {
  music('menu');
  const u = U(), [name, desc] = L.mods[S.mod];
  const sc = scene('sc-in');
  sc.innerHTML = `<div class="sc-col"><h2>${u.day} ${S.day}</h2>
    <div class="note px"><small>${u.today}</small><b>${name}</b><span>${desc}</span></div>
    <p class="sc-hint">${u.holdFinger}</p></div>`;
  const stg = Stage.mount(sc, 'hall', { eve: false });
  const dev = clockDevice('09:00');
  const z = +Math.max(0.8, Math.min(1.4, (innerHeight - 330) / 330, (innerWidth - 32) / 330)).toFixed(2);
  dev.style.zoom = z; pxSnap(dev.querySelector('.pad canvas'), 5, z);
  sc.querySelector('.sc-col').append(dev);
  hallAttach(stg, dev);
  sceneIn(sc, 'h2, .note, .sc-hint', 70, 380);
  fingerprint(dev, () => wipe(() => { closeScene(); startDay(); }));
}

