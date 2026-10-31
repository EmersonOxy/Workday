# Gerar e publicar o WORKDAY

O jogo é HTML, CSS e JavaScript puros, sem dependências. Fontes e áudio vão junto, então nada depende de internet.

## Gerar

```bash
python3 tools/build.py
```

Saídas em `dist/` (não versionadas):

| Arquivo | Para quê |
|---|---|
| `dist/web/index.html` + `dist/web/audio/` + `dist/web/.nojekyll` | Hospedagem estática (GitHub Pages, Netlify, itch.io, qualquer servidor) |
| `dist/workday.html` | Arquivo único offline: abre com dois cliques, sem servidor (áudio e fonte embutidos, cerca de 9 MB) |
| `dist/style-guide.html` | Guia visual |

## Conferir antes de publicar

```bash
python3 tools/palette.py
```

```bash
node tests/regression.js
```

O primeiro verifica a paleta; o segundo roda os testes de regressão (precisa do Playwright com Chromium).

## Publicar no GitHub Pages (manual, quando quiser)

1. Gere o build.
2. Copie o conteúdo de `dist/web/` para um branch `gh-pages` (ou para uma pasta `docs/` no `main`).
3. Em Settings → Pages do repositório, escolha esse branch ou pasta.

Nada disso é feito automaticamente: o repositório não tem fluxo de publicação configurado.

## itch.io

Compacte o conteúdo de `dist/web/` num `.zip` (com `index.html` na raiz) e envie como projeto HTML.

## Dados do jogador

Tudo fica no `localStorage` do navegador, com chaves `expediente-*`:
- progresso e configurações;
- personagem;
- foto processada (PNG pequeno, cerca de 10 KB).

Fotos originais nunca saem do aparelho. O backup (Configurações → Backup) exporta e importa um JSON versionado (`format: workday-save`, `version: 1`).
