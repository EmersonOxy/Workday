# Gato do Workday — ficha canônica de referência

**ID:** `gato-cinza-frente` · **Revisão do conceito:** 1.0 · **Aprovado pelo criador:** 03/11/2026

**Estado:** **desenho/referência visual aprovado**, **sprite pixel-perfect ainda não produzido**, **nenhuma alteração no jogo nesta etapa**.

**Uso:** esta imagem é a **matriz de aparência** do gato. O objetivo é que futuros quadros, poses, animações e pelagens preservem a sua identidade. Não reinterpretar o gato do zero a cada geração.

## 1. Referência visual, origem e identificação

**Atualização do criador (03/11/2026):** a imagem aprovada foi redimensionada em um editor/site de pixel art para **264 × 241 pixels**. **Esta é a referência mais recente e tem prioridade sobre a versão grande original para produzir as próximas poses.** A aparência aprovada permanece a mesma.

- **Arquivo canônico atual a arquivar:** `gato-cinza-frente-base-264x241.png` (nome padronizado proposto). A imagem foi compartilhada visualmente na conversa, mas o **arquivo binário exato não está acessível para análise automatizada nem está armazenado no repositório** nesta etapa.
- **Dimensões informadas pelo criador:** `264 × 241 px`, proporção aproximada `1,095:1` para o canvas completo. **Ainda é necessário conferir o PNG original**, não apenas a imagem exibida na conversa, para certificar modo, transparência, número de cores, bordas e hashes.
- **Origem:** versão redimensionada pelo próprio criador a partir do gato cinza frontal aprovado; não é sprite de terceiros.
- **Arquivo histórico (não é mais a referência técnica principal):** a geração original de `1312 × 1199` RGBA possui SHA-256 `b8e8ebd3f353bb24adf8062498911863564186a36d48471b89d2a53dc21730ec`. Tinha ~29.904 valores RGBA distintos e muitos pixels semi-transparentes. **Esse hash identifica somente o arquivo antigo**, nunca o novo 264 × 241.
- **Ponto importante:** ter dimensões menores não prova, isoladamente, que um PNG tem pixels perfeitos. A versão obtida no editor pode ter uma grade muito mais definida — e deve ser valorizada —, mas precisamos validar se a redução usou nearest-neighbor/pixelização, se há alpha intermediário, halos, cores excedentes ou densidades diferentes.
- **Destino aprovado para organização (ainda pendente de upload binário):** `assets/pixel-art/gato/gato-cinza-frente-base-264x241.png`. Não substituir esse arquivo por uma recompressão recriada por outra ferramenta ou pela geração original.

### Validação pendente do arquivo novo

Registrar após receber o PNG exato: SHA-256, modo RGB/RGBA/indexado, alpha mínimo/máximo e intermediário, quantidade de cores, bounding box da área visível, clusters e repetição uniforme de pixels. Se necessário, limpar esses elementos **preservando fielmente o desenho escolhido pelo criador**, sem redesenhar outra aparência.

## 2. Silhueta canônica — O QUE NÃO PODE MUDAR

- **Animal:** gato doméstico, compacto e amistoso, reconhecível sem detalhes internos.
- **Postura:** **sentado**, corpo ereto e apoiado nas quatro patas; duas patas dianteiras juntas à frente; traseiras dobradas às laterais.
- **Vista e direção:** **frontal direta, olhando para o jogador**. Os dois olhos e as duas orelhas estão visíveis. Não transformar esta pose base em três-quartos.
- **Cabeça:** larga e arredondada, significativamente maior em relação ao tronco do que a de um gato realista; bochechas amplas, focinho pequeno.
- **Orelhas:** triangulares, grandes, inclinadas suavemente para fora; parte interna rosa.
- **Olhos:** grandes, arredondados e expressivos, verde-oliva/amarelados no conceito, pupilas escuras e reflexos pequenos. Manter posicionamento e distância entre olhos ao animar.
- **Nariz/boca:** nariz rosa pequeno; boca curta com duas curvas discretas; expressão tranquila, curiosa, sem exagero permanente.
- **Bigodes:** curtos a médios, claros, visíveis dos dois lados; não criar linhas longas demais que interfiram com objetos vizinhos.
- **Pelagem:** **cinza tigrado**, listras grafite bem legíveis; peito, queixo, parte do focinho e pontas das patas em cinza muito claro/creme.
- **Peito:** mancha clara grande com recorte em V/forma de coração suavizada, descendo para o centro do tronco.
- **Patas dianteiras:** pequenas, alinhadas, pontas claras, separação definida.
- **Cauda:** volumosa, enrolada ao lado **direito da imagem / direito do observador** (esquerdo anatômico do animal). A assimetria da cauda é uma assinatura visual.
- **Personalidade transmitida:** dócil, tranquilo, curioso e um pouco travesso; não agressivo, humanoide ou mascote caricatural com roupas.

### Marcadores anatômicos para comparar cada novo quadro

| Região | Referência de forma | Ao animar |
|---|---|---|
| Orelhas | Grandes, diagonais externas, rosa dentro | Podem girar/piscar discretamente, sem trocar comprimento ou raiz |
| Olhos e focinho | Rosto frontal equilibrado, olhos bem separados | Piscadas e direção da pupila; preservar distância e eixo facial |
| Bochechas | Largas com bigodes saindo nas laterais | Volume consistente, sem cabeça "derreter" entre frames |
| Peito | Mancha clara central contínua | Acompanha respiração, sem mudar desenho da mancha a cada quadro |
| Patas | Duas dianteiras simétricas, apoiadas | Apoio da pose sentado não pode saltar |
| Cauda | Curva para o lado direito da imagem | Ponta pode balançar; raiz permanece no quadril |
| Listras | Testa, bochechas, dorso, patas e cauda | Seguem o volume da anatomia, sem surgir/desaparecer sem motivo |

## 3. Grade e integração — revisão após o PNG 264 × 241

O novo PNG de **264 × 241** é a **base de referência de trabalho**. Sua resolução representa a imagem entregue; **não se deve assumir automaticamente que cada pixel desse arquivo corresponde a um pixel lógico do jogo**.

**Decisão de produção pendente:** inspecionar a grade real da versão 264 × 241, recortar margens transparentes se necessário, identificar o tamanho ocupado pelo gato e definir o tamanho de exibição em cena. O tamanho lógico, o canvas animado e o pivô precisam ser decididos a partir deste arquivo e de uma captura no jogo.

- **Não fixar 64 × 96 px** com base apenas na imagem original: esta era uma hipótese anterior à entrega redimensionada e está revogada.
- **Canvas-fonte informado:** `264 × 241 px`; preservar o PNG original como matriz visual para todas as poses.
- **Bounding box do gato no novo PNG:** não verificada; não copiar as coordenadas do arquivo 1312 × 1199.
- **Pivot de produção:** ainda não fixado. Ancoragem recomendada: centro das duas patas dianteiras na linha da mesa, independente do espaço transparente em torno da figura.
- **Canvas de animação:** fixar apenas após validar a pose base, incluindo espaço suficiente para cauda, orelhas, alongamentos e pequenas reações.
- **Renderização:** nearest-neighbor, coordenadas inteiras, sem blur e sem rotações arbitrárias. Se o sprite precisar aparecer menor que o arquivo-fonte, criar uma **versão lógica desenhada/ajustada conscientemente**, em vez de aplicar escala fracionária indiscriminada.
- **Não** redesenhar outras vistas antes de aprovar como a base de 264 × 241 funciona no cenário.

### Impacto no código atual

O gato existente foi desenhado como um **modelo em três-quartos** em `src/js/shared/56-gato.js`, com `catSize(k)` equivalente a `42k × 35k`. Na mesa, `src/js/shared/58-mesa.js` reserva `86 × 70` como porte e desenha o gato a `k=2`.

O novo conceito frontal tem uma **silhueta e proporções diferentes**. Não cabe automaticamente no contrato antigo. A integração futura deverá rever área reservada, base/pivot, sobreposição com monitor, hitbox e posição na mesa. O gato deve continuar perceptivelmente grande, sem quebrar os demais objetos.

**Não** substituir nesta etapa `catDrawRaw`, `catSize`, `CatAI` nem as pelagens existentes.

## 4. Paleta-alvo dentro de `WD_PAL`

As cores abaixo são o **mapeamento inicial sugerido** à paleta fechada do Workday, não uma amostragem literal dos 29 mil valores do conceito. Ajustes de cores/íris precisam de revisão visual no jogo.

| Parte | Tokens `WD_PAL` | Hex |
|---|---|---|
| Contorno escuro | `k`, `K` | `#2a1f2d`, `#4a3a4e` |
| Pelagem (4 tons) | `m`, `M`, `j`, `J` | `#d7d9de`, `#9aa0ab`, `#626875`, `#3b3f48` |
| Peito, queixo e patas claras | `W`, `w`, `p` | `#fff8ec`, `#f3e6cc`, `#dcc6a0` |
| Nariz e interior das orelhas | `r`, `O` (opcional) | `#ff9d86`, `#f0915f` |
| Íris verdes | `d`, `D` | `#7ed98c`, `#2f8a45` |
| Brilho do olho | `+` | `#ffffff` |

**Regras:** pelagem com até quatro valores principais; uma fonte de luz superior esquerda; sombras nas laterais inferiores e sob a cabeça, focinho e patas; listras em clusters nítidos e não como ruído/gradiente; contorno seletivo. Não aplicar dithering no rosto só para imitar os detalhes suavizados do conceito.

## 5. Camadas recomendadas em arquivo editável

Ordem ilustrativa, de baixo para cima, para `gato-base.aseprite`:

1. `00-guide` — referências, eixos, pivot e base (**não exportar**).
2. `10-tail-back` — cauda atrás do tronco, sua raiz e sombra.
3. `20-body` — corpo, anca e patas traseiras.
4. `30-bib` — mancha clara do peito.
5. `40-front-paws` — patas dianteiras, contato e dedos.
6. `50-head` — crânio, bochechas e máscara do focinho.
7. `60-ears` — forma externa e interior das orelhas.
8. `70-face` — olhos, pupilas, nariz, boca, bigodes.
9. `80-markings` — listras ajustadas à anatomia de cada pose.
10. `90-effects` — corações, ronronar, sinais de sono (**opcional**, export separado quando adequado).

Evitar tornar cada pelo uma layer. Podem ser usadas camadas e cels vinculados do Aseprite para partes estáticas.

## 6. Plano de animação (futuro, ainda não produzido)

As quantidades abaixo são **propostas para testes**, não frames já existentes. Todos devem compartilhar a anatomia e o pivot da pose base. O motor atual já possui estados equivalentes em `CatAI.STATES`.

| Tag | Quadros sugeridos | Tempo/quadros | Reprodução | Descrição |
|---|---:|---:|---|---|
| `idle_front` | 3–4 | 250–400 ms | Loop | Respiração leve, quase imperceptível; patas fixas |
| `blink_front` | 3 | 80–160 ms | Uma vez | Olhos abertos → fechados → abertos |
| `look_front_left` | 2–3 | 150–250 ms | Uma vez | Só pupilas/cabeça mínima, sem mudar ângulo de câmera |
| `look_front_right` | 2–3 | 150–250 ms | Uma vez | Idem para o outro lado |
| `tail_sway_front` | 4–6 | 100–180 ms | Loop curto | Cauda balança a partir da base; tronco parado |
| `groom_front` | 5–8 | 120–200 ms | Uma vez/loop breve | Ergue pata, lambe, limpa rosto, retorna ao apoio |
| `yawn_front` | 4–6 | 120–220 ms | Uma vez | Fecha olhos, abre boca, relaxa |
| `sleep_enter` | 5–8 | 150–250 ms | Uma vez | Transição de sentado para deitado; redesenhar o volume |
| `sleep_loop` | 2–3 | 450–650 ms | Loop | Respiração lenta, olhos fechados |
| `pet_happy_front` | 3–5 | 120–250 ms | Uma vez | Reação a carinho/clique; expressão satisfeita |

**Ordem sugerida:** (1) quadro base frontal, (2) `blink_front`, (3) `idle_front`, (4) `tail_sway_front`, (5) `pet_happy_front`, (6) transições completas de groom/sleep/stretch. Nunca gerar uma animação antes da aprovação do **primeiro frame limpo**.

## 7. Compatibilidade e variantes

Atualmente o jogo possui `CAT_COATS_NEW` (14 pelagens), `CAT_EYES` e um modelo único renderizado em mesa, Personalizar, mercado, catálogo e cenas. O desenho **cinza tigrado com peito claro** desta ficha é o ponto de referência principal, mas não deve apagar as pelagens existentes.

Depois de homologar a anatomia, todas as variantes devem reutilizar a **mesma silhueta**, os mesmos marcos faciais e as mesmas tags. Mudar somente máscaras/cores/padrões de pelagem e cor da íris, não a estrutura facial. Para poses com movimento lateral, desenhar uma nova vista: não girar a imagem por software.

## 8. Critérios de aceitação do gato

- [ ] PNG atualizado de 264 × 241 arquivado com SHA-256 próprio e análise de pixel-grid/alpha/cores; o hash do conceito antigo não vale para ele.
- [ ] Quadro base pixel-perfect aprovado visualmente pelo criador.
- [ ] Gato claramente **cinza, sentado e frontal**, olhando para o jogador.
- [ ] Mantém orelhas rosas, olhos verdes grandes, peito/patas claras, listras e cauda curvada à direita da imagem.
- [ ] Silhueta reconhecível em 1x, mesmo sem olhos/listras.
- [ ] Mesma densidade de pixels dos demais objetos; paleta `WD_PAL`, contorno seletivo e luz de cima à esquerda.
- [ ] Sem alpha parcial, blur, antialias automático, pixels isolados acidentais ou linhas quebradas.
- [ ] Ponto de apoio estável; nada saltando ao alternar quadros.
- [ ] Proporção adequada ao monitor e presença real sobre a mesa.
- [ ] Bom contraste em fundos claros/escuros, desktop e mobile.
- [ ] Outras pelagens, cores de olhos, interações, cache, saves e movimento reduzido preservados.
- [ ] Animações novas aprovadas uma a uma; mudança integrada ao jogo **somente após validação**.

## 9. Não fazer

- Não redesenhar outra cara de gato a cada pose.
- Não substituir a vista frontal por três-quartos por preferência do implementador.
- Não usar nova imagem de IA como "frame 2" da mesma animação sem reconstruir o mesmo grid/anatomia.
- Não copiar sprites de packs externos; usar referências apenas para anatomia, poses e organização de produção.
- Não interpolar, girar 45°, aplicar blur, alpha suave ou escala fracionária.
- Não encaixar o novo corpo na caixa antiga `42k × 35k` simplesmente deformando-o.
- Não alterar a história, os NPCs ou a gameplay como consequência deste documento.

## 10. Referências de produção

Leia primeiro [GUIA-DE-SPRITES.md](./GUIA-DE-SPRITES.md), as skills internas `pixel-art` e `pixel-art-professional` e os documentos oficiais do Aseprite para frames/tags/slices.

**Próxima ação autorizada por esta ficha:** validar o PNG atualizado 264 × 241, registrar seu hash/paleta/grade e avaliar a base na escala real do Workday. Somente depois, finalizar **um único sprite estático, frontal e limpo** fiel à referência atual e submetê-lo ao criador **antes** de desenhar animações ou substituir o gato em jogo.
