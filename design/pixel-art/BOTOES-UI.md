# Botões da interface do Workday

Fonte: spritesheet PNG enviada pelo criador.
O atlas em `assets/ui/buttons.png` recorta a grade nativa 6×4 da imagem original, preservando 44×36 px por botão, cores e transparência RGBA.

## Grade

6 colunas × 4 linhas, células de 44×36 px. Os nomes abaixo correspondem a colunas/linhas iniciadas em zero.

| Linha | Coluna 0 | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | atender | desligar | confirmar | negar | curtir | não curtir |
| 1 | alerta | informação | ajuda | voltar | avançar | início |
| 2 | salvar | pasta | excluir | ajustes | favorito | e-mail |
| 3 | executar | pausar | parar | som | mudo | atualizar |

## Uso implementado

- Chamadas do Duda e do MSworkN: atender, recusar e desligar.
- Mensageiro: aceitar/negar solicitação, informações do contato e voltar.
- WorkOS: alto-falante/mudo acompanha o estado do botão de som; o menu de configurações usa a engrenagem.
- Arcade: jogar, apostar, pausar e confirmar usam os pictogramas correspondentes.
- Os demais desenhos ficam disponíveis no atlas, sem forçar associações incorretas a ações do jogo.
- Fonte visual de cada botão em CSS `src/css/95-ui-buttons.css`, respeitando os textos, aria-labels, handlers e saves preexistentes.
- No build web, o PNG é copiado para `ui-buttons/buttons.png`; no build offline, é incorporado ao HTML como data URI.

## Validação

Executar `python3 tools/build.py`, `node tests/mensageiro.js` e testes visuais no navegador.
A imagem base original permanece preservada; o atlas versionado remove apenas as margens transparentes externas da folha.
