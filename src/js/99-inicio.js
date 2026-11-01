/* ================= Início ================= */
// Por último: todos os módulos (perfil, personalização, chamada) já existem quando o menu abre
loadPhoto(); applyTheme(); applyLang();
// voltando de uma troca de conta: entra direto (o nome já foi digitado na tela de título)
{ let pend = null; try { pend = sessionStorage.getItem('wd-login'); sessionStorage.removeItem('wd-login'); } catch (e) {}
  if (pend && !(PROFILE.name || '').trim()) { PROFILE.name = pend; saveProfile(); }
  showMenu(); if (pend) showArrival(); else showTitle(); }
