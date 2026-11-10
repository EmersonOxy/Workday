/* Retratos aprovados para NPCs.
   Duda: base enviada pelo criador, convertida a pixel art 48×48 (MSworkN) e 128×128 (chamadas).
   Embutidos para o build single-file offline e GitHub Pages. Nao e uma animacao. */
const NPC_STATIC_ART = {
  duda: {
    icon: '@asset-uri:npc/duda-icone.png',
    portrait: '@asset-uri:npc/duda-retrato.png',
  },
};
function npcStaticImg(id, type = 'icon') {
  const info = NPC_STATIC_ART[id];
  if (!info || !info[type]) return null;
  const img = document.createElement('img');
  img.src = info[type];
  img.decoding = 'async';
  img.alt = '';
  img.className = 'npc-static-img npc-static-' + type;
  img.style.imageRendering = 'pixelated';
  img.draggable = false;
  return img;
}
