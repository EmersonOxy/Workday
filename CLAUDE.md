# WORKDAY — guia para novas sessões

Jogo de navegador em pixel art (escritório + mini-SO "WorkOS"). © 2026 Émerson K. Boff, todos os direitos reservados.
Responder em pt-BR, direto, sem bajulação. Repositório: https://github.com/EmersonOxy/Workday (branch `main`, push direto).
Demo oficial: https://emersonoxy.github.io/Workday/ (GitHub Pages). O fluxo `.github/workflows/deploy-pages.yml` compila e publica automaticamente após push na `main`. Artifacts antigos do Claude não são a versão oficial.

## Regras do usuário (permanentes)
- Testes de jogabilidade/visual: o usuário faz. Eu faço só verificações técnicas (sintaxe, paleta, capturas para conferir).
- Commit por feature/fase, mensagens em pt-BR, com rodapé Co-Authored-By/Claude-Session. Não sobrescrever trabalho alheio.
- Pixel art: escala inteira, sem rotação/escala fracionária de sprite, sem degradê suave/blur, rampas com variação de matiz,
  luz de cima à esquerda, contorno seletivo, sombra de contato. Paleta fechada `WD_PAL` (`src/js/shared/10-palette.js`).
- Não gerar imagens em serviços externos; usar as skills `pixel-art` e `pixel-art-professional` (.claude/skills).
- Corrigir causas, não empilhar remendos de CSS (`!important`). Preservar saves, PT/EN/ES, offline, movimento reduzido.
- Nada de contorno amarelo de seleção.
- **Gato**: antes de modificar `src/js/shared/56-gato.js`, leia `design/pixel-art/GATO-CINZA-FRENTE.md`, `design/pixel-art/GUIA-DE-SPRITES.md` e `design/pixel-art/gato-cinza-frente.spec.json`. A nova base visual do criador é um gato cinza tigrado **sentado e frontal**, PNG 264×241 redimensionado pelo próprio criador. Não reutilizar a silhueta antiga 3/4 nem criar novas poses sem validar o quadro base. O PNG exato ainda precisa ser arquivado e auditado; não confundir as dimensões 264×241 do arquivo com a grade lógica já homologada (ainda indefinida).
- **Ler `docs/DIALOGOS-E-LORE.md` antes de modificar o MSworkN, e-mails, calendário ou roteiros.** A lore é opcional e avança com os dias, independentemente da leitura. O usuário define o canon: não inventar biografias, segredos, romances, reviravoltas ou finais sem aprovação.
- Em interações livres, preservar contexto por NPC sem provocar decisões irreversíveis por palavra-chave; em nós importantes, respostas por balões e digitação simulada. Efeitos **somente no envio**.
- Regressão de diálogos: `python3 tools/build.py && node tests/mensageiro.js`. Manter textos em PT/EN/ES.


## Build e verificação
- `python3 tools/build.py` → `dist/web/index.html`, `dist/workday.html`. Concatena `src/css/*.css` e `src/js/shared/*.js` + `src/js/*.js` (ordem alfabética).
- Arte em PNG usada pelo código (paredes, materiais da mesa, gatos, caneca, retrato do Duda) fica em `assets/embutidos/` e é
  referenciada no JS por `'@asset-uri:grupo/nome.png'` (vira data URI) ou `'@asset-b64:grupo/nome.png'` (só o base64).
  O build embute nas duas saídas e falha se o arquivo não existir. Não colar base64 no código.
- Sintaxe: `cat src/js/shared/*.js src/js/*.js > /tmp/a.js && node --check /tmp/a.js`
- Paleta: `python3 tools/palette.py` (deve imprimir "paleta: ok").
- Capturas: `python3 -m http.server 8767` na raiz e Playwright (Chromium pré-instalado) abrindo `/dist/web/index.html`.
- Ferramentas de teste no jogo: Ctrl+Shift+D ou `?dev` (src/js/42-dev.js).

## Mapa do código (principais)
- `02-mecanica.js`: balanceamento central (BALANCE, DIFFS, EASE_IN, PRICES) e progressão de 25 dias (DEBUT, PROG, FREQ, WIN_DAY). Chave `original` = perfil padrão (saves).
- `09-telas.js`: modal/janelas do WorkOS (osWindow, barra de tarefas, Iniciar), menu, configurações.
- `30-personalizar.js`: Personalizar (abas), papéis de parede (WALLS), cores (OS_ACCENTS, OS_BARS, BADGE_COLORS).
- `40-eventos.js`: calendário (mês real com ícones e balão), missões, broches, conquistas, Arquivo, promoções/Catálogo (priceOf).
- `41-arrumar.js`: modo "Arrumar a mesa" (arrastar, inverter, guardar). `CFG.desk`.
- `shared/50-office.js`: cena do escritório (layout, bake, draw, luz). `shared/58-mesa.js`: zonas, portes P/M/G e desenho dos objetos da mesa.
- `shared/56-gato.js`: gato (modelo único, 14 pelagens, cor dos olhos, estados/animações, catStill/catRows).
- `shared/57-decor-art.js`: arte dos objetos (ART.*). `39-telefone.js`: telefone — REFERÊNCIA de qualidade/volume.
- Relógio global (`GameClock`, `49-atestado.js`): fonte única de data/hora simuladas. Tempo real (Date) só para metadados;
  expediente = `S.dayT`; simulado = data da carreira (dia útil N desde a data inicial salva em 'relogio') + `GameClock.min()`.
  Expediente 240 s de trabalho (DAY_SECONDS), minuto a minuto; chegada 07h–08h estável por dia; intervalo em horário sorteado 11h–14h, 45 s reais = 1 h, termina às 18h. Testes: `node tests/relogio.js`.
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
3. MSworkN: validar com o usuário tom das conversas, bustos (Bia, Otávio, Helena, Rafa, Lu) e ritmo das mensagens.
4. `tests/mensageiro.js`: a simulação de carreira não é determinística (memórias variam de 1 a 9 por execução); a causa não foi encontrada.

## Verificação antes de publicar
O job `verificar` de `.github/workflows/deploy-pages.yml` roda sintaxe, paleta, build e todas as suítes de `tests/`
(inclusive `regression.js`) a cada push na `main`; o site só é publicado se tudo passar. Para rodar localmente:
`python3 tools/build.py && for t in relogio saves mensageiro mesa parede caneca gatos-estaticos gatos-save-teste npc-portraits workos-wallpapers arcade-new regression; do node tests/$t.js; done`
