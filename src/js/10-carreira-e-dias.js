/* ================= Carreira e dias ================= */
function newCareer(resume) {
  document.body.classList.remove('menu-mode');
  $('modal').querySelectorAll('.os-start, .os-smenu, .os-icons, .os-tasks, .os-win').forEach(e => e.remove());
  S = { running: true, phase: 'intro', paused: false, boss: false, bossAuto: 0, day: 0, score: 0, combo: 0, stress: 0,
        rankIdx: 0, perks: new Set(), today: new Set(), inv: { cafe: 0, cha: 0 }, causes: {}, careerCauses: {},
        tasks: [], order: [0, 1, 2, 3], cart: [], last: performance.now() };
  if (resume !== true) { clearCareer(); stat('careers'); persist(); nextDay(); }
  hud(); renderDesk();
  requestAnimationFrame(loop);
}

