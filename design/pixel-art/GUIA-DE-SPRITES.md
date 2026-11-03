# Workday — Padrão de documentação de pixel art

**Versão:** 1.0 · **Status:** padrão técnico para novos sprites · **Idioma:** pt-BR

## Objetivo

Documentar a aparência, a construção e o comportamento de cada asset para que diferentes sessões de Claude, Codex ou outros artistas produzam o **mesmo personagem**, não interpretações independentes. Este documento define um padrão de produção do Workday, não uma regra universal para toda pixel art.

**Ficha-mãe do gato aprovada:** [GATO-CINZA-FRENTE.md](./GATO-CINZA-FRENTE.md).

## O que uma ficha de sprite deve conter

| Campo | Obrigatório | Finalidade |
|---|---|---|
| ID, versão e estado | Sim | Separar conceito aprovado de sprite efetivamente implementado |
| Referência visual e proveniência | Sim | Identificar a imagem canônica, autor/origem, licença e checksum quando houver arquivo |
| Vista, orientação e silhueta | Sim | Fixar leitura do personagem a 1x |
| Proporções e elementos imutáveis | Sim | Evitar que cada pose mude rosto, orelhas, patas e cauda |
| Tamanho de tela lógica e pixel-grid | Sim, antes de produzir | Fixar W×H em pixels **lógicos**, sem confundir com tamanho da prévia ampliada |
| Paleta por papel | Sim | Hex exatos para contorno, luz, base, sombras, olhos, detalhes |
| Luz e sombreamento | Sim | Direção de luz, rampas de 3–4 tons, contorno seletivo |
| Layers, pivot e base de contato | Sim | Reutilizar e animar sem oscilações, saltos e recortes |
| Estados e tags de animação | Para animáveis | Nome, pose-chave, frames, duração em ms, loop/transição |
| Renderização, exportação e atlas | Sim | PNG transparente, JSON de frames, sem blur/AA automático |
| Integração no jogo | Sim | Locais de uso, proporções em tela, compatibilidade com saves/skins |
| Testes de aceitação | Sim | Checar silhueta, paleta, alpha, animação, celular e contraste |
| Pendências/aprovação | Sim | Separar decisões tomadas de valores provisórios |

## Convenções do Workday

1. **Pixel perfeito:** os pixels finais são desenhados numa grade uniforme, preferencialmente manualmente. Não confundir PNG ampliado com sprite nativo. Nenhum pixel da borda deve ter alpha intermediário (exceto efeito proposital, explicitamente documentado).
2. **Paleta:** reutilizar `WD_PAL`, definida em `src/js/shared/10-palette.js`. O padrão já existente usa rampas de até 4 tons por material. Novas cores devem ser aprovadas e registradas, nunca espalhadas arbitrariamente.
3. **Contorno:** tinta `k=#2a1f2d` e `K=#4a3a4e`, com contorno seletivo; não preto puro por conveniência.
4. **Iluminação:** origem superior esquerda; brilho nas superfícies superiores/esquerdas, sombra coerente à direita/abaixo; sem pillow shading, blur ou gradientes suaves.
5. **Escala:** coordenadas inteiras, pixel snap, nearest-neighbor. Se a aplicação exigir duas escalas, gerar/desenhar pixels coerentes nas escalas apropriadas. Não usar rotação arbitrária nem interpolação bilinear.
6. **Camadas:** dividir estruturas que realmente se movem, sem fragmentar desnecessariamente. Um arquivo `.aseprite` é a fonte editável preferida; PNG/JSON são produtos exportados.
7. **Nomes:** `<asset>-<variante>-<vista>-<estado>-<indice>` em minúsculas, hífens, sem espaços. Ex.: `gato-cinza-frente-idle-000.png`. Tags Aseprite estáveis: `idle_front`, `blink_front`, `groom_front`, etc.
8. **Animação:** mesmo canvas, pivot e linha de apoio entre quadros de uma mesma família. Duração em ms por quadro; idle e movimentos sutis não precisam de dezenas de quadros. Transições e loops descritos explicitamente.
9. **Revisão visual:** avaliar a 1x no jogo real, 2x e 4x para inspecionar clusters, sobre fundos claros/escuros e junto de objetos de mesma cena. Conferir proporção relativa, não só a aparência do sprite isolado.
10. **Referência não é licença para copiar:** usar exemplos de terceiros para princípios de construção; não incorporar pixels/arquivos de terceiros sem revisar licença e atribuição.

## Organização recomendada

```text
design/pixel-art/
  GUIA-DE-SPRITES.md             # este contrato
  GATO-CINZA-FRENTE.md           # ficha visual e técnica
  gato-cinza-frente.spec.json    # dados de referência para ferramentas
assets/pixel-art/gato/          # destino planejado quando os arquivos estiverem prontos
  gato-cinza-frente-base-264x241.png  # base visual atual do criador, pendente de upload/validação
  gato-cinza-frente-conceito-v1.png   # geração anterior (histórico), não é a base atual
  gato-base.aseprite                  # fonte editável (futuro)
  gato-sheet.png                      # export runtime (futuro)
  gato-sheet.json                     # tags, frames, durações, slices e pivot (futuro)
```

**Importante:** caminhos em `assets/pixel-art/gato/` são o **destino planejado**, não declaração de que esses binários já existem no repositório.

## Diferença entre resolução do PNG e grade lógica

Para o gato cinza frontal, o criador forneceu uma nova referência redimensionada para **264 × 241 pixels** (03/11/2026). Esse número documenta o tamanho do arquivo aprovado na conversa — não a escala final que deve ser aplicada no canvas do jogo.

**Regras:**
- Não inventar uma resolução menor nem voltar a utilizar o arquivo original 1312 × 1199 como fonte visual principal sem autorização.
- Obter o PNG exato da versão 264 × 241 e inspecionar modo de cor, alpha, contagem de cores, retângulo visível e regularidade da grade.
- **Redimensionar em um site de pixel art pode produzir pixels visuais mais nítidos, mas a validação do arquivo continua necessária**; não declarar a imagem tecnicamente pixel-perfect sem examiná-la.
- Evitar reduzí-la arbitrariamente para caber na antiga caixa do gato no código. Se a escala de exibição necessária não for inteira, produzir uma versão lógica específica e revisada.
- Preservar o arquivo-fonte intacto; qualquer limpeza técnica deve gerar uma nova versão com checksum próprio.
- A referência só será usada como quadro animável definitivo quando a aparência e o encaixe no Workday forem aprovados.

## Processo de trabalho

1. Guardar imagem canônica, checksum e silhueta aprovada.
2. Aprovar resolução lógica, proporções e posição/pivot com uma captura **no jogo**.
3. Fazer um quadro base limpo no Aseprite: paleta fechada, alpha binário, clusters coesos.
4. Revisar esse único quadro no Workday antes de criar animações.
5. Criar primeiro as key poses; depois os quadros intermediários, mantendo anatomia.
6. Exportar sheet PNG + JSON de tags/slices (sem mudar dimensões entre frames).
7. Validar no navegador, na mesa, na loja/personalização, no mobile e nas variantes de pelagem.
8. Apenas depois substituir o renderizador antigo; manter compatibilidade com configuração e saves.

## Checklist de aprovação de um sprite

- [ ] Referência visual identificada e aprovada.
- [ ] Silhueta legível em 1x, com vista e orientação corretas.
- [ ] Canvas lógico, frame, pivot, linha de contato e área ocupada definidos.
- [ ] Cores restritas à paleta aprovada; contornos coerentes com o jogo.
- [ ] Transparência binária nas bordas; sem pixels quebrados ou halo.
- [ ] Clusters limpos, iluminação superior esquerda e sem degradês automáticos.
- [ ] Cada estado mantém a mesma identidade anatômica.
- [ ] FPS/duração/loop/tags e transições registrados.
- [ ] Testes com fundo claro/escuro, 1x/2x e posicionamento in-game.
- [ ] Alteração não quebra pelagens, cores de olhos, persistência, desempenho ou movimento reduzido.
- [ ] Aprovação do criador antes de considerar a nova arte canônica.

## Fontes técnicas e skills pesquisadas

- [Aseprite — estrutura de sprite, camadas, frames e cels](https://github.com/aseprite/docs/blob/main/sprite.md).
- [Aseprite — slices e pivots](https://aseprite.com/docs/slices/).
- [Aseprite — CLI, frameTags e metadados de exportação](https://aseprite.org/docs/cli/).
- [fenre/skills — game-graphics/SKILL.md](https://github.com/fenre/skills/blob/main/game-graphics/SKILL.md): art direction (resolução, paleta, contorno, luz, timing, proporções).
- [fenre/skills — animation-reference.md](https://github.com/fenre/skills/blob/main/game-graphics/animation-reference.md): atlas, tags, frames, pivots e organização.
- [with-pebbly/aseprite-ai-artist — concept/SKILL.md](https://github.com/with-pebbly/aseprite-ai-artist/blob/main/skills/concept/SKILL.md): especificação de assunto, silhueta, paleta, frames-chave e critérios de exclusão.
- [willibrandon/pixel-plugin — pixel-art-animator/reference.md](https://github.com/willibrandon/pixel-plugin/blob/main/skills/pixel-art-animator/reference.md): nomenclatura de tags, duração e direção de playback.
- [Skills locais do Workday](../../.claude/skills/pixel-art/SKILL.md) e [Pixel Art Professional](../../.claude/skills/pixel-art-professional/SKILL.md), com seus arquivos `references/patterns.md`, `references/sharp_edges.md` e `references/validations.md`.

O Workday continua sendo a fonte de verdade para sua paleta, resolução e renderização; as referências externas são **metodologia**, não autorização para alterar o estilo visual já aprovado.
