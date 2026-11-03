/* Wallpapers externos do WorkOS — retratos horizontais 16:9.
   Os PNGs do catálogo permanecem independentes da parede do escritório.
   O build mantém arquivos na versão web e embute PNGs no HTML offline. */
const WORKOS_EXTRA_WALLS = {
  'espaco-terra': { src: 'wallpapers/espaco-terra.png', names: { pt: 'Terra e galáxia', en: 'Earth and galaxy', es: 'Tierra y galaxia' } },
  'cerejeira-luar': { src: 'wallpapers/cerejeira-luar.png', names: { pt: 'Cerejeira ao luar', en: 'Moonlit blossoms', es: 'Cerezos a la luna' } },
  'outono-dourado': { src: 'wallpapers/outono-dourado.png', names: { pt: 'Outono dourado', en: 'Golden autumn', es: 'Otoño dorado' } },
  'deserto-por-do-sol': { src: 'wallpapers/deserto-por-do-sol.png', names: { pt: 'Deserto ao pôr do sol', en: 'Desert sunset', es: 'Atardecer desértico' } },
  'lago-primavera': { src: 'wallpapers/lago-primavera.png', names: { pt: 'Lago na primavera', en: 'Spring lake', es: 'Lago primaveral' } },
  'praia-tropical': { src: 'wallpapers/praia-tropical.png', names: { pt: 'Praia tropical', en: 'Tropical beach', es: 'Playa tropical' } },
  'planeta-aneis': { src: 'wallpapers/planeta-aneis.png', names: { pt: 'Planeta com anéis', en: 'Ringed planet', es: 'Planeta con anillos' } },
  'farol-por-do-sol': { src: 'wallpapers/farol-por-do-sol.png', names: { pt: 'Farol ao entardecer', en: 'Sunset lighthouse', es: 'Faro al atardecer' } }
};
function workosWallNames() { return [...Object.keys(WALLS), ...Object.keys(WORKOS_EXTRA_WALLS)]; }
function workosWallTitle(id, legacy) {
  const art = WORKOS_EXTRA_WALLS[id];
  return art ? (art.names[CFG.lang] || art.names.pt) : (legacy[id] || id);
}
function workosWallPreview(canvas, id) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const art = WORKOS_EXTRA_WALLS[id];
  if (!art) {
    const tile = wallCanvas(id, 160, 90);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (id === 'teal') { ctx.fillStyle = WD_PAL.X; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    else ctx.drawImage(tile, 0, 0, canvas.width, canvas.height);
    return;
  }
  const img = new Image();
  img.onload = () => {
    if (!canvas.isConnected) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  img.src = art.src;
}
