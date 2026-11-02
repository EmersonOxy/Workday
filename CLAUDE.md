# WORKDAY — guia para novas sessões

Jogo de navegador em pixel art (escritório + mini-SO "WorkOS"). © 2026 Émerson K. Boff, todos os direitos reservados.
Responder em pt-BR, direto, sem bajulação. Repositório: https://github.com/EmersonOxy/Workday (branch `main`, push direto).
Demo publicada: https://claude.ai/artifact/3nh9vz2gjUmGC3EngUTjAS (republicar após mudanças: gerar `dist/web/index.html`,
remover tags doctype/html/head/body e publicar no mesmo artifact).

## Regras do usuário (permanentes)
- Testes de jogabilidade/visual: o usuário faz. Eu faço só verificações técnicas (sintaxe, paleta, capturas para conferir).
- Commit por feature/fase, mensagens em pt-BR, com rodapé Co-Authored-By/Claude-Session. Não sobrescrever trabalho alheio.
- Pixel art: escala inteira, sem rotação/escala fracionária de sprite, sem degradê suave/blur, rampas com variação de matiz,
  luz de cima à esquerda, contorno seletivo, sombra de contato. Paleta fechada `WD_PAL` (`src/js/shared/10-palette.js`).
- Não gerar imagens em serviços externos; usar as skills `pixel-art` e `pixel-art-professional` (.claude/skills).
- Corrigir causas, não empilhar remendos de CSS (`!important`). Preservar saves, PT/EN/ES, offline, movimento reduzido.
- Nada de contorno amarelo de seleção.

## Build e verificação
- `python3 tools/build.py` → `dist/web/index.html`, `dist/workday.html`. Concatena `src/css/*.css` e `src/js/shared/*.js` + `src/js/*.js` (ordem alfabética).
- Sintaxe: `cat src/js/shared/*.js src/js/*.js > /tmp/a.js && node --check /tmp/a.js`
- Paleta: `python3 tools/palette.py` (deve imprimir "paleta: ok").
- Capturas: `python3 -m http.server 8767` na raiz e Playwright (Chromium pré-instalado) abrindo `/dist/web/index.html`.
- Ferramentas de teste no jogo: Ctrl+Shift+D ou `?dev` (src/js/42-dev.js).

## Mapa do código (principais)
- `02-mecanica.js`: balanceamento central (BALANCE, DIFFS, EASE_IN, PRICES) e progressão de 25 dias (DEBUT, PROG, FREQ, WIN_DAY). Chave `original` = perfil padrão (saves). Tempo do jogo: `50-tempo.js`; fila de avisos: `51-fila.js`.
- `09-telas.js`: modal/janelas do WorkOS (osWindow, barra de tarefas, Iniciar), menu, configurações.
- `30-personalizar.js`: Personalizar (abas), papéis de parede (WALLS), cores (OS_ACCENTS, OS_BARS, BADGE_COLORS).
- `40-eventos.js`: calendário (mês real com ícones e balão), missões, broches, conquistas, Arquivo, promoções/Catálogo (priceOf).
- `41-arrumar.js`: modo "Arrumar a mesa" (arrastar, inverter, guardar). `CFG.desk`.
- `shared/50-office.js`: cena do escritório (layout, bake, draw, luz). `shared/58-mesa.js`: zonas, portes P/M/G e desenho dos objetos da mesa.
- `shared/56-gato.js`: gato (modelo único, 14 pelagens, cor dos olhos, estados/animações, catStill/catRows).
- `shared/57-decor-art.js`: arte dos objetos (ART.*). `39-telefone.js`: telefone — REFERÊNCIA de qualidade/volume.
- `design/balanceamento.md`, `tools/simulate.py`: economia e simulação.
- MSworkN (mensageiro do WorkOS, camada social): `43-social-motor.js` (estado `SOC` por carreira/balanceamento, condições,
  efeitos, agenda, presença, ganchos em endDay/promote/gameOver), `44-social-elenco.js` (textos da UI em `LANGS.*.ui.msn`,
  fotos 16×16 `MSN_PICS`, gerador de bustos `bustRows`, `castAdd`), `45-social-conversas.js` (conversas/arcos em dados, memórias,
  promessas), `46-mensageiro.js` (janela única `Msn`, avisos, selos), `47-social-chamadas.js` (chamadas com qualquer contato,
  reaproveita `callSay`/`closeCall`/minigames; só fora do expediente ou no intervalo). CSS em `src/css/90-mensageiro.css`.
  Personagem novo = `castAdd()` + conversas em `socThreads([...])`; texto sempre `L3(pt, en, es)`. Testes: `node tests/mensageiro.js`.
  Regra entre carreiras: colegas (`scope: 'work'`) recomeçam; amigos de fora (`'life'`) continuam.
- Contas: a tela de título pede um nome de usuário; cada nome tem o próprio save (`WD_NS`, prefixo das chaves; ver
  `00-cabecalho.js` e `wdLogin` em `09-telas.js`). A 1ª conta herda as chaves sem prefixo. Use sempre `load`/`save` (ou `WD_NS`).
- Antes do 1º dia de cada carreira: e-mail da Bia (`48-social-inicio.js`) pede adicionar o Duda e mandar um oi; contatos
  podem ser adicionados pelo nome (`SOC_ADD`), só quando a campanha libera.

## Pendências (próximo passo)
1. Refazer TODOS os objetos da mesa no padrão do telefone (vista 3/4 com faces próprias — tampo, frente, lateral — e
   detalhes desenhados dentro das faces; ver `phPt`/`phPoly` em 39-telefone.js). A tentativa de só "extrudar" foi rejeitada.
   Ordem combinada: piloto com rádio + caixa de som, mostrar ao usuário, depois o resto (livros, porta-retrato, aquário,
   porta-canetas, papéis, pato, vasos, troféu, globo, luminária, caneca, webcam, quadros de parede), teclado, mouse,
   base do monitor e o orbe do Iniciar (mais detalhado).
2. Bug não reproduzido: HUD do expediente aparecendo atrás da área de trabalho (há proteção via `:has` em 80-entrega3.css).
3. Modo celular: minimizar o portal deixa a tela vazia (sem ícones/Iniciar).
4. `tests/regression.js` está desatualizado (falhas anteriores ao MSworkN: linha de base de balanceamento, pausa com Espaço,
   loja `.slot[data-id=foto]`, escolha de jogo na chamada do Duda). A tela de título agora é removida no teste; o resto falta atualizar.
5. MSworkN: validar com o usuário tom das conversas, bustos (Bia, Otávio, Helena, Rafa, Lu) e ritmo das mensagens.
