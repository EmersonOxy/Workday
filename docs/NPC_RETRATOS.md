# Retratos de NPCs — biblioteca de reserva

**19 retratos** recebidos do criador e preparados em **128 × 128 px**, pixel art transparente, sem animações. Guardados individualmente em `assets/npc/portraits/`.

**Nenhum personagem foi adicionado à história ainda.** Os IDs são provisórios, apenas pela ordem de envio. Duda, Bia, Otávio, Helena, Rafa e Lu continuam usando os visuais, interações, agendas e conversas atuais. Associações de novos retratos aos NPCs só devem ser feitas quando o criador confirmar a identidade.

## Catálogo visual

| ID | Imagem | Identidade |
|---|---|---|
| 01 · `personagem-01` | ![Retrato 1](../assets/npc/portraits/personagem-01.png) | Pendente |
| 02 · `personagem-02` | ![Retrato 2](../assets/npc/portraits/personagem-02.png) | Pendente |
| 03 · `personagem-03` | ![Retrato 3](../assets/npc/portraits/personagem-03.png) | Pendente |
| 04 · `personagem-04` | ![Retrato 4](../assets/npc/portraits/personagem-04.png) | Pendente |
| 05 · `personagem-05` | ![Retrato 5](../assets/npc/portraits/personagem-05.png) | Pendente |
| 06 · `personagem-06` | ![Retrato 6](../assets/npc/portraits/personagem-06.png) | Pendente |
| 07 · `personagem-07` | ![Retrato 7](../assets/npc/portraits/personagem-07.png) | Pendente |
| 08 · `personagem-08` | ![Retrato 8](../assets/npc/portraits/personagem-08.png) | Pendente |
| 09 · `personagem-09` | ![Retrato 9](../assets/npc/portraits/personagem-09.png) | Pendente |
| 10 · `personagem-10` | ![Retrato 10](../assets/npc/portraits/personagem-10.png) | Pendente |
| 11 · `personagem-11` | ![Retrato 11](../assets/npc/portraits/personagem-11.png) | Pendente |
| 12 · `personagem-12` | ![Retrato 12](../assets/npc/portraits/personagem-12.png) | Pendente |
| 13 · `personagem-13` | ![Retrato 13](../assets/npc/portraits/personagem-13.png) | Pendente |
| 14 · `personagem-14` | ![Retrato 14](../assets/npc/portraits/personagem-14.png) | Pendente |
| 15 · `personagem-15` | ![Retrato 15](../assets/npc/portraits/personagem-15.png) | Pendente |
| 16 · `personagem-16` | ![Retrato 16](../assets/npc/portraits/personagem-16.png) | Pendente |
| 17 · `personagem-17` | ![Retrato 17](../assets/npc/portraits/personagem-17.png) | Pendente |
| 18 · `personagem-18` | ![Retrato 18](../assets/npc/portraits/personagem-18.png) | Pendente |
| 19 · `personagem-19` | ![Retrato 19](../assets/npc/portraits/personagem-19.png) | Pendente |

## Usar quando necessário

- O manifesto `assets/npc/portraits/manifest.json` identifica a imagem e o arquivo original, com `npcId: null` enquanto não houver vínculo confirmado.
- A função `npcReservedPortrait('personagem-01', 128)` cria um elemento `<img>` pixelado para futuras conversas, chamadas, e-mails ou eventos.
- No GitHub Pages, o build copia os PNGs para `dist/web/npc-portraits/`.
- No arquivo `dist/workday.html` offline, o build embute os PNGs como data URIs: não é necessária internet.
- Para associar a imagem a um NPC existente, mapear o ID para o retrato em `src/js/shared/52-npc-portraits.js` após confirmação; não substituir automaticamente pelo aspecto visual.
- Manter `image-rendering: pixelated` e preferir fatores inteiros de escala. Animações podem ser adicionadas futuramente, mas não são necessárias para usar estes retratos.
