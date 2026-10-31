# Workday

Jogo de escritório caótico em pixel art, feito para jogar no navegador em pausas curtas.

Arquivos caem na mesa e você os leva ao setor certo, enquanto o expediente desanda: e-mails, ligações, impressora travada, chefe passando, PC travado, vírus e reuniões por vídeo. No fim do dia você bate o ponto, recebe o salário, faz compras no mercadinho e volta no dia seguinte.

## Como jogar

Abra `index.html` em qualquer navegador moderno, no computador ou no celular. Não precisa instalar nada. Mantenha a pasta `audio/` ao lado do `index.html` para ter música.

- Computador: `←` `→` movem o arquivo, `↓` acelera, `Delete` apaga arquivo morto, `Esc` esconde a tela do chefe, `Espaço` pausa.
- Celular: toque na coluna para mover o arquivo e use a barra de botões na parte de baixo.

Idiomas: português, inglês e espanhol. Temas claro e escuro.

## Desenvolvimento

O código fica dividido em `src/` e é montado num arquivo final por um script sem dependências:

```
src/index.html        estrutura da página
src/css/              estilos
src/js/NN-*.js        módulos, concatenados em ordem numérica
audio/                trilha sonora
fonts/                fonte VT323 (SIL Open Font License 1.1, ver fonts/VT323-OFL.txt), embutida no build
tools/build.py        gera dist/web/ (para hospedar) e dist/workday.html (arquivo único offline: áudio e fonte embutidos, nenhuma requisição externa)
tests/regression.js   testes de regressão (Playwright)
releases/             versões congeladas de referência
```

```
python3 tools/build.py
node tests/regression.js
```

## Direitos autorais

© 2026 Émerson K. Boff. Todos os direitos reservados.

É proibido copiar, modificar, redistribuir, republicar ou adaptar este jogo, no todo ou em parte, em qualquer plataforma, sem autorização prévia e por escrito do autor. Veja [LICENSE](LICENSE).


## Publicação

Veja [docs/PUBLICAR.md](docs/PUBLICAR.md): build, arquivo único offline, GitHub Pages, itch.io e backup do jogador.
