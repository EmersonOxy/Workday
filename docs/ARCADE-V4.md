# Workday — Arcade V4

Ampliação do arcade em 04/11/2026. São nove minigames, com os cinco anteriores preservados.

## Novos jogos

- **Três Copos** (`cups`): acompanhar a bola em um dos três copos embaralhados e escolher. A aposta é **opcional**. O botão principal **Jogar sem apostar** inicia uma rodada gratuita mesmo com carteira vazia. Apostar dinheiro fictício é uma alternativa; vitória paga o dobro da entrada, derrota ou desistência perde somente o valor apostado.
- **Ateliê Workday** (`painting`): oito desenhos em preto e branco para colorir por regiões, três inicialmente disponíveis e novas artes liberadas progressivamente. O progresso é salvo e completar as oito concede a conquista Mestre das Cores no Arquivo.
- **Dança das Setas** (`dance`): setas descem em quatro colunas e o jogador precisa acertar no ritmo. Erros e notas perdidas consomem vidas, com teclado e toque.
- **Dardos do Expediente** (`darts`): alvo e mira oscilante; no desktop mira com mouse e segura/solta para medir força; no celular, joystick virtual inferior e botão de arremesso. Solo ou contra Duda. O botão **Jogar sem apostar** inicia o treino gratuito, sem precisar digitar zero; com aposta opcional, vitória paga o dobro.

## Integração

Os jogos usam o canvas pixelado 128×160, são acessíveis pelas chamadas de Duda e pelo arcade secreto, com traduções PT/EN/ES. As seleções de modo versus aparecem apenas nos jogos competitivos. O placar de Duda continua usando Rival.

Uma correção geral faz a mensagem Prepare-se! desaparecer depois de cerca de um segundo. Os sprites de trabalhador, chefe e partes gráficas de labirinto, pênaltis e Snake foram refinados.

## Regras de dinheiro e salvamento

As apostas debitam imediatamente o saldo disponível de P.wallet, gravado por persist(). Jogar sem apostar é sempre permitido, mesmo sem saldo. Para apostar, só são permitidos valores inteiros positivos dentro do saldo. O valor pago ao vencer é duas vezes a entrada (a entrada de volta mais lucro equivalente). Abandonar a rodada após apostar não devolve a entrada. **Três Copos e Dardos** oferecem modo gratuito, sem débito e sem prêmio fictício, inclusive com saldo zero. O jogo não usa dinheiro real.

Os desenhos e cores concluídos ficam no save de arcade-paint; a conquista é registrada na coleção QST.ach.

## Arquivos

`src/js/32e-arcade-bets.js`, `32f-cups.js`, `32g-painting.js`, `32h-dance.js`, `32i-darts.js`, `src/js/40-eventos.js`, `src/css/70z-arcade.css`, `tests/arcade-v4.js`.

Para checar: `python tools/build.py`, `node tests/arcade-new.js`, `node tests/arcade-v4.js`.