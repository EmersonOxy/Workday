/* Biblioteca de 19 retratos em pixel art; IDs neutros, ainda sem NPC associado.
   Arquivos PNG separados, compatíveis com o HTML offline e GitHub Pages.
   Não altera retratos, histórias, agendas nem o elenco existente. */
const NPC_PORTRAIT_RESERVE = Object.freeze({
  'personagem-01': 'npc-portraits/personagem-01.png',
  'personagem-02': 'npc-portraits/personagem-02.png',
  'personagem-03': 'npc-portraits/personagem-03.png',
  'personagem-04': 'npc-portraits/personagem-04.png',
  'personagem-05': 'npc-portraits/personagem-05.png',
  'personagem-06': 'npc-portraits/personagem-06.png',
  'personagem-07': 'npc-portraits/personagem-07.png',
  'personagem-08': 'npc-portraits/personagem-08.png',
  'personagem-09': 'npc-portraits/personagem-09.png',
  'personagem-10': 'npc-portraits/personagem-10.png',
  'personagem-11': 'npc-portraits/personagem-11.png',
  'personagem-12': 'npc-portraits/personagem-12.png',
  'personagem-13': 'npc-portraits/personagem-13.png',
  'personagem-14': 'npc-portraits/personagem-14.png',
  'personagem-15': 'npc-portraits/personagem-15.png',
  'personagem-16': 'npc-portraits/personagem-16.png',
  'personagem-17': 'npc-portraits/personagem-17.png',
  'personagem-18': 'npc-portraits/personagem-18.png',
  'personagem-19': 'npc-portraits/personagem-19.png',
});
function npcReservedPortrait(id, pixels = 128) {
  const url = NPC_PORTRAIT_RESERVE[id];
  if (!url) return null;
  const img = document.createElement('img');
  img.src = url;
  img.alt = '';
  img.width = img.height = pixels;
  img.draggable = false;
  img.decoding = 'async';
  img.className = 'npc-static-img npc-static-portrait';
  img.style.imageRendering = 'pixelated';
  return img;
}
