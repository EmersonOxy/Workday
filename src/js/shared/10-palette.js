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
// Rampas do editor de personagem (brilho, base, sombra, fundo). Pele em 8 tons, do mais claro ao mais escuro;
// cabelos naturais e fantasia; olhos; tecidos. Ampliam a paleta só para retratos, com a mesma lógica de 4 tons.
const AV_RAMPS = {
  skin: [['#ffe3cc', '#f6cbaa', '#e0a585', '#b9785e'], ['#f9d2b0', '#f2c4a0', '#d99a76', '#a8684c'], ['#f0c08f', '#dba272', '#bd7f52', '#8e5a37'], ['#dca673', '#c08655', '#9c6640', '#734629'],
         ['#c98e5e', '#a8703f', '#86552c', '#5f3a1c'], ['#a8714a', '#8a5634', '#6a3f24', '#4a2a17'], ['#80553a', '#653f29', '#4c2e1d', '#331f14'], ['#5f3f2d', '#4a3022', '#382318', '#26180f']],
  hair: { preto: ['#4a4152', '#2e2733', '#211c26', '#17131b'], escuro: ['#7a4a30', '#5c3420', '#432516', '#2c180e'], castanho: ['#a8683e', '#87502c', '#673b1f', '#472713'],
          loiro: ['#ffe39a', '#f0c35c', '#c98f30', '#8a5a1c'], ruivo: ['#f08a50', '#d0602e', '#a2421f', '#6e2a14'], branco: ['#ffffff', '#e6e6ec', '#bdbdcb', '#8e8e9f'],
          grisalho: ['#c9c9cf', '#9a9aa6', '#74747f', '#4f4f5a'], rosa: ['#ffb8d6', '#f07fb0', '#c2528a', '#86305e'], azul: ['#9ed0ff', '#5f9ae8', '#3d6bbd', '#26467f'],
          verde: ['#b8e3a0', '#7fbf6a', '#4f8e45', '#2f5a2c'], roxo: ['#d0a8f0', '#a87ad6', '#7d52a8', '#55356f'] },
  eye: { castanho: '#5c3420', preto: '#211c26', azul: '#3d6bbd', verde: '#3f8f50', cinza: '#74747f', ambar: '#c98a2e', violeta: '#7656a8' },
  cloth: { azul: ['#c3d5ff', '#6f93d9', '#44609f', '#2b3f6e'], verde: ['#c4ebb5', '#6fbf73', '#3f8f50', '#2a5e36'], vermelho: ['#ff9d86', '#ef4b3f', '#a8262a', '#6e1a1e'],
           petroleo: ['#a9dccf', '#5fa79a', '#2f6f78', '#1f4a52'], roxo: ['#e0cff7', '#a983d6', '#7656a8', '#4e3872'], cinza: ['#d7d9de', '#9aa0ab', '#626875', '#3b3f48'],
           bege: ['#fbf3e2', '#e9dcc2', '#c7b595', '#8f7d63'], grafite: ['#626875', '#3b3f48', '#2b2340', '#1b1622'], amarelo: ['#ffe7a3', '#f4c15d', '#c98a2e', '#8a5420'], branco: ['#ffffff', '#fff8ec', '#dcc6a0', '#b39776'] },
};
