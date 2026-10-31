/* ================= Foto do crachá: enquadramento e conversão para pixel art ================= */
// Tudo acontece no navegador (nada é enviado). O jogador enquadra (arrasta e aproxima), ajusta brilho/contraste/saturação
// e escolhe o modo: "clássico" (cores da paleta do WORKDAY, pontilhado leve) ou "detalhado" (24 cores tiradas da própria foto).
// Saída: 60×70 para o crachá e documentos, e uma versão 30×35 gerada à parte (não só reduzida) para espaços pequenos.
const PH = { W: 60, H: 70 };
function labOf(r, g, b) {
  const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const R = lin(r), G = lin(g), B = lin(b), f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const X = (R * .4124 + G * .3576 + B * .1805) / .95047, Y = R * .2126 + G * .7152 + B * .0722, Z = (R * .0193 + G * .1192 + B * .9505) / 1.08883;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const PAL_RGB = [...new Set(Object.values(WD_PAL))].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
// Amostra a área recortada para uma grade w×h com média por área (sem serrilhado) e aplica os ajustes
function photoSample(img, crop, w, h, adj) {
  const ss = 4, c = document.createElement('canvas'); c.width = w * ss; c.height = h * ss;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data, out = new Float32Array(w * h * 3);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let r = 0, g = 0, b = 0;
    for (let y = 0; y < ss; y++) for (let k = 0; k < ss; k++) { const o = ((j * ss + y) * c.width + i * ss + k) * 4; r += d[o]; g += d[o + 1]; b += d[o + 2]; }
    const n = ss * ss; let R = r / n, G = g / n, B = b / n;
    R = (R - 128) * adj.contrast + 128 + adj.bright; G = (G - 128) * adj.contrast + 128 + adj.bright; B = (B - 128) * adj.contrast + 128 + adj.bright;
    const L = R * .299 + G * .587 + B * .114; R = L + (R - L) * adj.sat; G = L + (G - L) * adj.sat; B = L + (B - L) * adj.sat;
    const o = (j * w + i) * 3; out[o] = R; out[o + 1] = G; out[o + 2] = B;
  }
  // nitidez local (máscara de nitidez leve): preserva contornos de olhos, boca e cabelo
  const sh = new Float32Array(out);
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) for (let ch = 0; ch < 3; ch++) {
    let s = 0; for (let y = -1; y <= 1; y++) for (let k = -1; k <= 1; k++) s += out[((j + y) * w + i + k) * 3 + ch];
    const o = (j * w + i) * 3 + ch; sh[o] = out[o] + adj.sharp * (out[o] - s / 9);
  }
  for (let i = 0; i < sh.length; i++) sh[i] = Math.max(0, Math.min(255, sh[i]));
  return sh;
}
// k-means em Lab para o modo detalhado
function photoPalette(px, k) {
  const n = px.length / 3, labs = []; for (let i = 0; i < n; i++) labs.push(labOf(px[i * 3], px[i * 3 + 1], px[i * 3 + 2]));
  let cen = []; for (let i = 0; i < k; i++) cen.push(labs[Math.floor((i + .5) / k * n)].slice());
  const asg = new Int32Array(n);
  for (let it = 0; it < 7; it++) {
    for (let i = 0; i < n; i++) { let b = 0, bd = 1e9; for (let c = 0; c < k; c++) { const d = (labs[i][0] - cen[c][0]) ** 2 + (labs[i][1] - cen[c][1]) ** 2 + (labs[i][2] - cen[c][2]) ** 2; if (d < bd) { bd = d; b = c; } } asg[i] = b; }
    const sum = cen.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) { const s = sum[asg[i]]; s[0] += px[i * 3]; s[1] += px[i * 3 + 1]; s[2] += px[i * 3 + 2]; s[3]++; }
    const rgb = sum.map(s => s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : null);
    cen = rgb.map((r, c) => r ? labOf(...r) : cen[c]); photoPalette.rgb = rgb.map((r, c) => r || [128, 128, 128]);
  }
  return photoPalette.rgb.map(c => c.map(v => Math.round(v)));
}
function photoQuantize(px, w, h, pal, dither) {
  const labs = pal.map(c => labOf(...c)), c = document.createElement('canvas'); c.width = w; c.height = h;
  const img = c.getContext('2d').createImageData(w, h), B = [-6, 2, 6, -2];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const o = (j * w + i) * 3, t = dither ? B[(i & 1) + (j & 1) * 2] : 0;
    const l = labOf(px[o] + t, px[o + 1] + t, px[o + 2] + t);
    let b = 0, bd = 1e9; for (let k = 0; k < labs.length; k++) { const d = (l[0] - labs[k][0]) ** 2 + (l[1] - labs[k][1]) ** 2 * .8 + (l[2] - labs[k][2]) ** 2 * .8; if (d < bd) { bd = d; b = k; } }
    const q = (j * w + i) * 4; img.data[q] = pal[b][0]; img.data[q + 1] = pal[b][1]; img.data[q + 2] = pal[b][2]; img.data[q + 3] = 255;
  }
  c.getContext('2d').putImageData(img, 0, 0); return c;
}
function photoConvert(img, crop, adj, mode) {
  const big = photoSample(img, crop, PH.W, PH.H, adj), small = photoSample(img, crop, PH.W / 2, PH.H / 2, Object.assign({}, adj, { sharp: adj.sharp * 1.4, contrast: adj.contrast * 1.08 }));
  const pal = mode === 'classic' ? PAL_RGB : photoPalette(big, 24), palS = mode === 'classic' ? PAL_RGB : photoPalette(small, 16);
  return { big: photoQuantize(big, PH.W, PH.H, pal, mode === 'classic' && adj.dither), mini: photoQuantize(small, PH.W / 2, PH.H / 2, palS, false) };
}

function showPhotoEditor(file, onDone) {
  const u = U(), t = u.ph;
  const url = URL.createObjectURL(file), img = new Image();
  img.onerror = () => { URL.revokeObjectURL(url); onDone(null); };
  img.onload = () => {
    const card = modal(`<h2>${t.title}</h2><div class="ph-ed">
        <div class="ph-crop"><canvas class="ph-src"></canvas><i class="ph-frame"></i></div>
        <div class="ph-out"><small>${t.result}</small><div class="ph-big"></div><small>${t.small}</small><div class="ph-small"></div></div></div>
      <div class="ph-ctl">
        <div class="seg" id="phFrame"><button class="pxbtn" data-f="face">${t.face}</button><button class="pxbtn on" data-f="bust">${t.bust}</button></div>
        <div class="seg" id="phMode"><button class="pxbtn on" data-m="detail">${t.detail}</button><button class="pxbtn" data-m="classic">${t.classic}</button></div>
        <label>${t.zoom}<input type="range" class="pxrange" id="phZoom" min="100" max="400" value="100"></label>
        <label>${t.bright}<input type="range" class="pxrange" id="phB" min="-60" max="60" value="0"></label>
        <label>${t.contrast}<input type="range" class="pxrange" id="phC" min="60" max="160" value="110"></label>
        <label>${t.sat}<input type="range" class="pxrange" id="phS" min="0" max="180" value="105"></label>
        <label class="ph-dither"><input type="checkbox" id="phD" checked> ${t.dither}</label>
      </div>
      <div class="actions"><button class="pxbtn main" id="phOk">${t.confirm}</button><button class="pxbtn" id="phNo">${u.cancel}</button></div>`);
    card.classList.add('ph-card');
    const src = card.querySelector('.ph-src'), box = card.querySelector('.ph-crop');
    // a pré-visualização mostra a foto inteira; a moldura (6:7) fica fixa e a foto anda por baixo dela
    const VW = Math.min(300, innerWidth * .8), VH = VW * 7 / 6;
    src.width = VW; src.height = VH; src.style.width = VW + 'px'; src.style.height = VH + 'px';
    const base = Math.max(VW / img.width, VH / img.height);   // zoom 1 = a foto cobre a moldura
    const st = { zoom: 1, cx: img.width / 2, cy: img.height / 2, mode: 'detail', adj: { bright: 0, contrast: 1.1, sat: 1.05, sharp: .7, dither: true } };
    const crop = () => { const s = base * st.zoom, w = VW / s, h = VH / s; st.cx = Math.max(w / 2, Math.min(img.width - w / 2, st.cx)); st.cy = Math.max(h / 2, Math.min(img.height - h / 2, st.cy)); return { x: st.cx - w / 2, y: st.cy - h / 2, w, h }; };
    let out = null, timer = 0;
    const render = () => {
      const c = crop(), x = src.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, VW, VH);
      clearTimeout(timer); timer = setTimeout(() => {
        out = photoConvert(img, c, st.adj, st.mode);
        const show = (cv, h) => { const n = Math.max(1, Math.floor(h * (devicePixelRatio || 1) / cv.height)), k = n / (devicePixelRatio || 1); cv.style.width = cv.width * k + 'px'; cv.style.height = cv.height * k + 'px'; cv.style.imageRendering = 'pixelated'; return cv; };
        card.querySelector('.ph-big').replaceChildren(show(out.big, 168));
        const s2 = document.createElement('canvas'); s2.width = out.mini.width; s2.height = out.mini.height; s2.getContext('2d').drawImage(out.mini, 0, 0);
        card.querySelector('.ph-small').replaceChildren(show(out.mini, 35), show(s2, 70));
      }, 60);
    };
    // arrastar move a foto; a roda do mouse ou o controle aproximam
    let drag = null;
    box.onpointerdown = e => { box.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, cx: st.cx, cy: st.cy }; };
    box.onpointermove = e => { if (!drag) return; const s = base * st.zoom; st.cx = drag.cx - (e.clientX - drag.x) / s; st.cy = drag.cy - (e.clientY - drag.y) / s; render(); };
    box.onpointerup = box.onpointercancel = () => { drag = null; };
    box.onwheel = e => { e.preventDefault(); st.zoom = Math.max(1, Math.min(4, st.zoom * (e.deltaY < 0 ? 1.1 : .9))); card.querySelector('#phZoom').value = st.zoom * 100; render(); };
    card.querySelector('#phZoom').oninput = e => { st.zoom = e.target.value / 100; render(); };
    card.querySelector('#phB').oninput = e => { st.adj.bright = +e.target.value; render(); };
    card.querySelector('#phC').oninput = e => { st.adj.contrast = e.target.value / 100; render(); };
    card.querySelector('#phS').oninput = e => { st.adj.sat = e.target.value / 100; render(); };
    card.querySelector('#phD').onchange = e => { st.adj.dither = e.target.checked; render(); };
    card.querySelectorAll('#phFrame button').forEach(b => b.onclick = () => {
      card.querySelectorAll('#phFrame button').forEach(x => x.classList.toggle('on', x === b));
      // rosto: aproxima no terço de cima (onde o rosto costuma estar em retratos); busto: mostra cabeça e ombros
      if (b.dataset.f === 'face') { st.zoom = 2; st.cy = img.height * .32; } else { st.zoom = 1; st.cy = img.height * .45; }
      card.querySelector('#phZoom').value = st.zoom * 100; render();
    });
    card.querySelectorAll('#phMode button').forEach(b => b.onclick = () => { card.querySelectorAll('#phMode button').forEach(x => x.classList.toggle('on', x === b)); st.mode = b.dataset.m; card.querySelector('.ph-dither').hidden = st.mode !== 'classic'; render(); });
    card.querySelector('.ph-dither').hidden = true;
    card.querySelector('#phOk').onclick = () => { URL.revokeObjectURL(url); card.classList.remove('ph-card'); onDone(out ? { big: out.big.toDataURL(), mini: out.mini.toDataURL() } : null); };
    card.querySelector('#phNo').onclick = () => { URL.revokeObjectURL(url); card.classList.remove('ph-card'); onDone(null); };
    st.cy = img.height * .45; render();
  };
  img.src = url;
}
