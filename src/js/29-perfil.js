/* ================= Perfil e crachá ================= */
// Nome, avatar (rosto em pixel art) ou foto do aparelho convertida para a paleta. O número de funcionário (EMP_ID) não muda.
// A foto vira uma grade 16×18 de letras da paleta: cabe no localStorage e desenha igual a qualquer sprite.
const AVATARS = [
  { hair: '#6e3b26', shirt: '#44609f' }, { hair: '#2a1f2d', shirt: '#3f8f50' }, { hair: '#f4c15d', shirt: '#c25f3b' },
  { hair: '#a24a33', shirt: '#7656a8' }, { hair: '#c7b595', shirt: '#626875' }, { hair: '#6c4a7e', shirt: '#a24a33' },
];
const PROFILE = Object.assign({ name: '', avatar: 0, photo: null }, load('perfil', {}));
function saveProfile() { save('perfil', PROFILE); OFFICE.key = ''; }
function profileName() { return (PROFILE.name || '').trim() || U().defaultName; }
// Retrato no tamanho pedido (escala inteira de pixels físicos)
function portrait(scale) {
  if (PROFILE.photo) { const c = Pixel.el(PROFILE.photo, scale); c.classList.add('portrait'); return c; }
  const a = AVATARS[PROFILE.avatar] || AVATARS[0], c = face(a.hair, a.shirt, false, scale);
  c.classList.add('portrait'); return c;
}
// Foto → 16×18 na paleta (recorte central, cor mais próxima em espaço RGB ponderado, contorno de tinta)
function photoToRows(img) {
  const W = 16, H = 18, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), s = Math.min(img.width / W, img.height / H);
  x.imageSmoothingEnabled = true;
  x.drawImage(img, (img.width - W * s) / 2, (img.height - H * s) / 2, W * s, H * s, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const keys = Object.keys(WD_PAL).filter(k => k !== 'k'), rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const pal = keys.map(k => [k, rgb(WD_PAL[k])]);
  const rows = [];
  for (let j = 0; j < H; j++) {
    let r = '';
    for (let i = 0; i < W; i++) {
      if (i === 0 || j === 0 || i === W - 1 || j === H - 1) { r += 'k'; continue; }
      const o = (j * W + i) * 4, p = [d[o], d[o + 1], d[o + 2]];
      let best = keys[0], bd = 1e9;
      for (const [k, q] of pal) { const dd = 2 * (p[0] - q[0]) ** 2 + 4 * (p[1] - q[1]) ** 2 + 3 * (p[2] - q[2]) ** 2; if (dd < bd) { bd = dd; best = k; } }
      r += best;
    }
    rows.push(r);
  }
  return rows;
}
// Crachá ampliado: visualização e edição (computador: clique no crachá da mesa; celular: Configurações → Perfil)
function showBadge(back) {
  const u = U();
  let draft = { ...PROFILE };
  const card = modal(`<div class="badge-big"><div class="bg-clip"></div><div class="bg-card">
      <div class="bg-head">${u.company}</div><div class="bg-photo"></div>
      <b class="bg-name"></b><span class="bg-rank">${S ? L.ranks[S.rankIdx] : L.ranks[0]}</span><span class="bg-num">Nº ${EMP_ID}</span><i class="bg-bar"></i></div></div>
    <div class="bg-edit">
      <label>${u.nameLabel}<input id="bgName" maxlength="18" autocomplete="off" placeholder="${u.namePh}"></label>
      <div class="bg-row"><span>${u.avatarLabel}</span><div class="bg-avs"></div></div>
      <div class="bg-row"><span>${u.photoLabel}</span><button class="pxbtn" id="bgPick">${u.photoPick}</button><button class="pxbtn" id="bgNoPhoto">${u.photoClear}</button>
        <input type="file" id="bgFile" accept="image/*" hidden></div>
    </div>
    <div class="actions"><button class="pxbtn main" id="bgSave">${u.save}</button><button class="pxbtn" id="bgBack">${u.cancel}</button></div>`);
  card.classList.add('badge-card');
  const nameIn = card.querySelector('#bgName');
  const paint = () => {
    const keep = { ...PROFILE }; Object.assign(PROFILE, draft);
    card.querySelector('.bg-photo').replaceChildren(portrait(6));
    card.querySelector('.bg-name').textContent = profileName();
    card.querySelectorAll('.bg-av').forEach((b, i) => b.classList.toggle('on', !draft.photo && draft.avatar === i));
    card.querySelector('#bgNoPhoto').disabled = !draft.photo;
    Object.assign(PROFILE, keep);
  };
  nameIn.value = draft.name; nameIn.oninput = () => { draft.name = nameIn.value; paint(); };
  AVATARS.forEach((a, i) => { const b = document.createElement('button'); b.className = 'pxbtn bg-av'; b.append(face(a.hair, a.shirt, false, 2));
    b.onclick = () => { draft.avatar = i; draft.photo = null; paint(); }; card.querySelector('.bg-avs').append(b); });
  const file = card.querySelector('#bgFile');
  card.querySelector('#bgPick').onclick = () => file.click();
  file.onchange = () => {
    const f = file.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { const img = new Image(); img.onload = () => { draft.photo = photoToRows(img); paint(); sfx('pop'); }; img.src = r.result; };
    r.readAsDataURL(f);
  };
  card.querySelector('#bgNoPhoto').onclick = () => { draft.photo = null; paint(); };
  card.querySelector('#bgSave').onclick = () => { Object.assign(PROFILE, draft); saveProfile(); sfx('ok'); closeBadge(); };
  card.querySelector('#bgBack').onclick = closeBadge;
  function closeBadge() { card.classList.remove('badge-card'); if (back) back(); else closeModal(); }
  paint();
  Motion.play(card.querySelector('.badge-big'), [{ transform: 'translateY(-30px) rotate(-6deg)', opacity: 0 }, { transform: 'translateY(4px) rotate(2deg)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: Motion.T.long, easing: Motion.E.out });
}
