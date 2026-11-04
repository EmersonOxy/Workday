# Botões da interface do Workday

Fonte: spritesheet PNG enviada e aprovada pelo criador na conversa de 04/11/2026.
O atlas em `assets/ui/buttons.png` foi preparado em baixa resolução, com transparência, paleta reduzida e escala de exibição inteira (nearest-neighbor).

## Grade

6 colunas × 4 linhas, células de 22×18 pixels lógicos. Renderização 1x ou 2x inteiro. Os nomes abaixo correspondem a colunas/linhas iniciadas em zero.

| Linha | Coluna 0 | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | atender | desligar | confirmar | negar | curtir | não curtir |
| 1 | alerta | informação | ajuda | voltar | avançar | início |
| 2 | salvar | pasta | excluir | ajustes | favorito | e-mail |
| 3 | executar | pausar | parar | som | mudo | atualizar |

## Uso implementado

- Chamadas do Duda e do MSworkN: atender, recusar e desligar.
- Mensageiro: aceitar/negar solicitação, informações do contato e voltar.
- Os demais desenhos ficam disponíveis no atlas, sem forçar associações incorretas a ações do jogo.
- Fonte visual de cada botão em CSS `src/css/95-ui-buttons.css`, respeitando os textos, aria-labels, handlers e saves preexistentes.
- No build web, o PNG é copiado para `ui-buttons/buttons.png`; no build offline, é incorporado ao HTML como data URI.

## Validação

Executar `python3 tools/build.py`, `node tests/mensageiro.js` e testes visuais no navegador.
A imagem base original permanece preservada pelo criador; o atlas versionado é uma cópia otimizada para runtime.
