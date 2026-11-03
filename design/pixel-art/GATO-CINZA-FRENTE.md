# Gato do Workday — ficha canônica de referência

**ID:** `gato-cinza-frente` · **Revisão do conceito:** 1.0 · **Aprovado pelo criador:** 03/11/2026

**Estado:** **desenho/referência visual aprovado**, **sprite pixel-perfect ainda não produzido**, **nenhuma alteração no jogo nesta etapa**.

**Uso:** esta imagem é a **matriz de aparência** do gato. O objetivo é que futuros quadros, poses, animações e pelagens preservem a sua identidade. Não reinterpretar o gato do zero a cada geração.

## 1. Referência visual, origem e identificação

Imagem original: **gato cinza sentado de frente**, aprovada nesta conversa pelo criador. Arquivo preparado para arquivamento: `gato-cinza-frente-conceito-v1.png`.

- Origem: imagem gerada especificamente para o Workday e aprovada pelo criador; nenhuma sprite de terceiros foi usada no desenho.
- Resolução do **arquivo de referência**: `1312 × 1199`, modo RGBA, fundo transparente.
- Região principal do gato, alpha >= 128: `x=378..1026`, `y=125..1097`, caixa de `649 × 973` pixels de imagem.
- Identificador SHA-256 do PNG original: `b8e8ebd3f353bb24adf8062498911863564186a36d48471b89d2a53dc21730ec`.
- **Aviso de qualidade técnica:** o PNG de referência contém ~29.904 valores RGBA distintos e ampla quantidade de alpha parcial. É **concept art no estilo pixel art**, não uma fonte pixel-perfect pronta para animação. Não ampliar, reamostrar ou quantizar automaticamente e declarar o resultado final sem limpeza manual.
- **Disponibilidade:** o conceito original foi entregue na conversa; o PNG ainda precisa ser adicionado ao caminho `assets/pixel-art/gato/gato-cinza-frente-conceito-v1.png` quando houver upload binário ao repositório. A ficha e o hash garantem que a referência correta seja usada.

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

## 3. Grade de produção — PROPOSTA, NÃO APROVAÇÃO

A imagem gerada é uma referência ampliada. A versão final precisa ser **redesenhada em pixels lógicos**.

**Candidato inicial para teste:** canvas lógico de `64 × 96 px`, alpha transparente, enquadramento frontal. Este tamanho acompanha aproximadamente a proporção do conceito, mas **não está aprovado como resolução final**. É obrigatório avaliar no cenário real antes de fixá-lo.

- Pivot sugerido: `(32,95)` (base central, junto às patas).
- Linha de contato: `y=95`; não mover entre frames `idle_front`.
- Margens para orelhas e cauda: preservar área para não cortar gestos; o canvas real poderá ser ajustado.
- Proporção de leitura: cabeça + orelhas ocupam visualmente cerca da metade superior da figura; corpo/patas e cauda distribuem-se abaixo.
- Bordas de um frame: alpha `0` ou `255`; nada de contornos semi-transparentes, blur ou anti-aliasing automático.
- Pixel unitário e posicionamento devem coincidir com a densidade dos demais itens no jogo. **O "64×96" não equivale a renderizar uma foto 64×96 nem a esticar arbitrariamente a imagem gerada.**

### Impacto no código atual

O gato existente foi desenhado como um **modelo em três-quartos** em `src/js/shared/56-gato.js`, com `catSize(k)` equivalente a `42k × 35k`. Na mesa, `src/js/shared/58-mesa.js` reserva `86 × 70` como porte e desenha o gato a `k=2`.

A nova silhueta frontal é **mais alta**, portanto não cabe automaticamente no contrato antigo. A integração futura deve rever área reservada, base/pivot, sobreposição com monitor, hitbox e posição na mesa. O gato deve continuar perceptivelmente grande, próximo à proporção visual desejada pelo criador, sem quebrar o posicionamento dos demais objetos.

**Não** substituir agora `catDrawRaw`, `catSize`, `CatAI` nem as configurações existentes só por causa desta ficha.

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

- [ ] Imagem de conceito correspondente ao checksum acima arquivada junto ao projeto.
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

**Próxima ação autorizada por esta ficha:** construir **um único sprite estático, frontal e limpo** que reproduza fielmente o conceito dentro da paleta do Workday, e mostrá-lo ao criador para aprovação **antes** de desenhar animações ou alterar o jogo.
