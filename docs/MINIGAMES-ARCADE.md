# Workday — minigames do arcade (04/11/2026)

## Regras de integração

Os minigames vivem dentro das chamadas do Duda e do arcade secreto e não alteram carteira, recorde de carreira ou promoção. Retornam \`{score, grade, quit?, vs?}\` para o fluxo existente. O modo versus Duda usa o histórico \`Rival\`; o modo solo não registra confronto. A versão web e o HTML offline carregam os mesmos módulos pelo build \`tools/build.py\`.

## Jogos implementados

| ID | Nome | Como funciona | Controles |
|---|---|---|---|
| \`rhythm\` | Batida de Ponto | Quatro colunas e música original | DFJK/toque |
| \`shooter\` | Exterminador de Pendências | Nave contra documentos | A/D + Espaço / arrastar |
| \`pacman\` | Caça-Café | Trabalhador percorre labirinto, coleta cafés, clipes e grampos; **um único chefe** persegue. Café paralisa o chefe temporariamente. | Setas/WASD; deslizar para virar |
| \`penalty\` | Pênaltis do Expediente | 3 cobranças do jogador + 3 do rival, com troca de papéis. Puxar a bola para trás define a direção e potência. Na defesa, escolher o setor do gol antes do impacto. | Arrastar e soltar; defesa A/S/D, setas ou clique/toque |
| \`snake\` | Snake: Duelo | Dois participantes simultâneos disputam frutas; bater no corpo adversário ou na parede custa uma vida. | WASD/setas; deslizar no tabuleiro |

## Modos

- **Solo:** Pacman é uma perseguição individual; pênaltis e Snake usam um adversário controlado pelo computador.
- **Contra Duda:** pênaltis e Snake usam o histórico de rivalidade existente com o NPC. Pacman não oferece modo versus Duda: seu único perseguidor é o chefe.
- **Dois jogadores locais:** opção adicional de pênaltis e Snake. Em pênaltis, um jogador chuta e o outro escolhe a direção da defesa; após 3 chutes trocam. No Snake, J1 usa WASD e J2 usa setas, ou dois toques/deslizamentos (um em cada metade). Essa é uma disputa **no mesmo dispositivo**, sem multiplayer pela internet.

## Compatibilidade e limites

- Canvas 128×160, pixel art ampliada sem suavização; desktop e mobile.
- Ao ocultar a aba o relógio é pausado; sair pelo Escape/cancelar remove ouvintes e encerra o jogo.
- Pênaltis representam três zonas de defesa (esquerda, centro, direita), não física realista de goleiros.
- Snake é um duelo em grade com corpos que crescem e colisão; inspirado em competição simultânea de arena, **não** replica o multiplayer online de Slither.io.
- O modo local usa o mesmo aparelho. Duda não é um segundo jogador humano conectado.
- As implementações não adicionam lore aos NPCs. O desbloqueio do arcade secreto segue as regras anteriores.
- Regressão: \`python tools/build.py && node tests/arcade-new.js\`.

## Arquivos

- \`src/js/32-minigames.js\`: adaptador de seleção (mantém os jogos originais).
- \`src/js/32a-arcade-base.js\`: utilitários gráficos/tempo.
- \`src/js/32b-labirinto.js\`, \`32c-penaltis.js\`, \`32d-snake.js\`: implementações isoladas.
- \`src/js/31-chamada.js\` e \`47-social-chamadas.js\`: menus/chamadas.
- \`src/js/01-textos-por-idioma.js\`: PT-BR, EN, ES.
- \`tests/arcade-new.js\`: testes de inicialização, entradas básicas e encerramento.
