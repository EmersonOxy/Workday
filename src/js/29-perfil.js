/* ================= Perfil e crachá ================= */
// Nome, avatar (rosto em pixel art) ou foto do aparelho convertida para a paleta. O número de funcionário (EMP_ID) não muda.
// A foto vira uma grade 16×18 de letras da paleta: cabe no localStorage e desenha igual a qualquer sprite.
// Saves antigos: avatar = índice de 6 rostos prontos (vira configuração em avConfig) e foto = grade 16×18 (ainda exibida).
// Fotos novas ficam em "expediente-perfil-foto" (PNG 60×70 + 30×35, poucos KB); PROFILE.photo = 'local' indica que existe.
const PROFILE = Object.assign({ name: '', avatar: 0, photo: null }, load('perfil', {}));
function saveProfile() { save('perfil', PROFILE); OFFICE.key = ''; }
function profileName() { return (PROFILE.name || '').trim() || U().defaultName; }
// Crachá ampliado: visualização e edição (computador: clique no crachá da mesa; celular: Configurações → Perfil)
function showBadge(back) {
  const u = U(), t = u.av;
  const draft = { name: PROFILE.name, av: avConfig(), photo: PROFILE.photo, data: undefined };   // data: undefined = sem mudança, null = excluir, {big,mini} = nova
  const card = modal(`<div class="badge-big"><div class="bg-clip"></div><div class="bg-card">
      <div class="bg-head">${u.company}</div><div class="bg-photo"></div>
      <b class="bg-name"></b><span class="bg-rank">${S ? L.ranks[S.rankIdx] : L.ranks[0]}</span><span class="bg-num">Nº ${EMP_ID}</span><i class="bg-bar"></i></div></div>
    <div class="bg-edit">
      <label>${u.nameLabel}<input id="bgName" maxlength="18" autocomplete="off" placeholder="${u.namePh}"></label>
      <div class="bg-row"><button class="pxbtn" id="bgChar">${t.editChar}</button><button class="pxbtn" id="bgPick">${t.importPhoto}</button><button class="pxbtn" id="bgNoPhoto">${t.useChar}</button>
        <input type="file" id="bgFile" accept="image/*" hidden></div>
    </div>
    <div class="actions"><button class="pxbtn main" id="bgSave">${u.save}</button><button class="pxbtn" id="bgBack">${u.cancel}</button></div>`);
  card.classList.add('badge-card');
  const photoOv = () => draft.data === null ? null : draft.data ? draft.data.imgs : undefined;
  const paint = () => {
    const keepN = PROFILE.name, keepP = PROFILE.photo; PROFILE.name = draft.name; PROFILE.photo = draft.photo;
    card.querySelector('.bg-photo').replaceChildren(portrait(168, draft.av, photoOv()));
    card.querySelector('.bg-name').textContent = profileName();
    card.querySelector('#bgNoPhoto').disabled = !draft.photo;
    PROFILE.name = keepN; PROFILE.photo = keepP;
  };
  const nameIn = card.querySelector('#bgName');
  nameIn.value = draft.name; nameIn.oninput = () => { draft.name = nameIn.value; paint(); };
  // editar o personagem ou enquadrar uma foto abre outra tela; ao voltar, o crachá reabre com o rascunho
  card.querySelector('#bgChar').onclick = () => showAvatarEditor(draft.av, cfg => { if (cfg) { draft.av = cfg; if (draft.photo) { draft.photo = null; draft.data = null; } } reopenWith(draft); });   // escolher o personagem deixa a foto de lado
  const file = card.querySelector('#bgFile');
  card.querySelector('#bgPick').onclick = () => file.click();
  file.onchange = () => { const f = file.files[0]; if (f) showPhotoEditor(f, res => { if (res) { draft.photo = 'local'; draft.data = res; } reopenWith(draft); }); };
  card.querySelector('#bgNoPhoto').onclick = () => { draft.photo = null; draft.data = null; paint(); };
  card.querySelector('#bgSave').onclick = () => {
    PROFILE.name = draft.name; PROFILE.av = draft.av;
    if (draft.data === null || (!draft.photo && PROFILE.photo)) { try { localStorage.removeItem('expediente-perfil-foto'); } catch (e) {} PROFILE.photo = null; }
    if (draft.data) { save('perfil-foto', { big: draft.data.big, mini: draft.data.mini }); PROFILE.photo = 'local'; }
    saveProfile(); loadPhoto(); sfx('ok'); closeBadge();
  };
  card.querySelector('#bgBack').onclick = closeBadge;
  function closeBadge() { card.classList.remove('badge-card'); if (back) back(); else closeModal(); }
  function reopenWith(d) { showBadgeDraft(d, back); }
  if (draft.data && !draft.data.imgs) prepImgs(draft, paint);
  paint();
  Motion.play(card.querySelector('.badge-big'), [{ transform: 'translateY(-30px) rotate(-6deg)', opacity: 0 }, { transform: 'translateY(4px) rotate(2deg)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: Motion.T.long, easing: Motion.E.out });
  return { card, draft, paint };
}
// Reabre o crachá preservando o rascunho (nome, personagem, foto ainda não salvos)
function showBadgeDraft(d, back) { const r = showBadge(back); Object.assign(r.draft, d); r.card.querySelector('#bgName').value = d.name || ''; if (d.data && !d.data.imgs) prepImgs(r.draft, r.paint); r.paint(); }
function prepImgs(draft, cb) { const imgs = {}; let n = 0; for (const k of ['big', 'mini']) { const im = new Image(); im.onload = () => { imgs[k] = im; if (++n === 2) { draft.data.imgs = imgs; cb(); } }; im.src = draft.data[k]; } }
