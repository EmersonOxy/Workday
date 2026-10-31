/* ================= Paleta WORKDAY v2 ================= */
// Cada material tem no máximo 4 tons (brilho, base, sombra, fundo). O contorno é tinta escura arroxeada, nunca preto puro.
// As letras são usadas nos desenhos em texto dos sprites.
const WD_PALETTE = {
  ink:    { label: 'Tinta (contorno)', tones: { k: '#2a1f2d', K: '#4a3a4e' } },
  paper:  { label: 'Papel',           tones: { W: '#fff8ec', w: '#f3e6cc', p: '#dcc6a0', P: '#b39776' } },
  wood:   { label: 'Madeira',         tones: { 1: '#f0b778', 2: '#d48a4f', 3: '#a8623a', 4: '#6e3b26' } },
  plastic:{ label: 'Plástico bege',   tones: { c: '#fbf3e2', C: '#e9dcc2', e: '#c7b595', E: '#8f7d63' } },
  wall:   { label: 'Parede',          tones: { a: '#86ab9b', A: '#648a7c', b: '#4a6c60', B: '#33504a' } },
  leaf:   { label: 'Folhagem',        tones: { g: '#b8d98a', G: '#7fb35a', h: '#4f8440', H: '#2f5a33' } },
  terra:  { label: 'Terracota',       tones: { t: '#f2a27a', T: '#d9714a', u: '#a24a33' } },
  brass:  { label: 'Latão e luz',     tones: { y: '#ffe7a3', Y: '#f4c15d', z: '#c98a2e', Z: '#8a5420' } },
  metal:  { label: 'Metal',           tones: { m: '#d7d9de', M: '#9aa0ab', j: '#626875', J: '#3b3f48' } },
  screen: { label: 'Tela',            tones: { v: '#a9dccf', V: '#5fa79a', x: '#2f6f78', X: '#1f4a52' } },
  skin:   { label: 'Pele',            tones: { s: '#f2c4a0', S: '#d99a76', 5: '#a8684c' } },
  night:  { label: 'Noite',           tones: { n: '#6c4a7e', N: '#463462', 0: '#2b2340' } },
  fin:    { label: 'Financeiro',      tones: { f: '#c4ebb5', F: '#6fbf73', 9: '#3f8f50' } },
  hr:     { label: 'RH',              tones: { o: '#ffd0b0', O: '#f0915f', 8: '#c25f3b' } },
  legal:  { label: 'Jurídico',        tones: { l: '#c3d5ff', L: '#6f93d9', 7: '#44609f' } },
  it:     { label: 'TI',              tones: { i: '#e0cff7', I: '#a983d6', 6: '#7656a8' } },
  danger: { label: 'Perigo',          tones: { r: '#ff9d86', R: '#ef4b3f', q: '#a8262a' } },
  warn:   { label: 'Alerta',          tones: { Q: '#ffb938', '%': '#c47a14' } },
  ok:     { label: 'Sucesso',         tones: { d: '#7ed98c', D: '#2f8a45' } },
  white:  { label: 'Reflexo',         tones: { '+': '#ffffff' } },
};
const WD_PAL = Object.assign({}, ...Object.values(WD_PALETTE).map(m => m.tones));
// Cada setor reaproveita o mesmo desenho trocando a rampa F/f/9 (cabeçalho do documento)
const WD_SECTOR_RAMP = {
  fin: { F: WD_PAL.F, f: WD_PAL.f, 9: WD_PAL[9] }, rh: { F: WD_PAL.O, f: WD_PAL.o, 9: WD_PAL[8] },
  jur: { F: WD_PAL.L, f: WD_PAL.l, 9: WD_PAL[7] }, ti: { F: WD_PAL.I, f: WD_PAL.i, 9: WD_PAL[6] },
  dead: { F: WD_PAL.M, f: WD_PAL.m, 9: WD_PAL.j }, urgent: { F: WD_PAL.R, f: WD_PAL.r, 9: WD_PAL.q },
};
