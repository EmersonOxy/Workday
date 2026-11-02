# WORKDAY — Balanceamento

## Aplicado (perfil padrão, chave de armazenamento `original`)

Todos os parâmetros ficam em `src/js/02-mecanica.js` (`BALANCE`, `DIFFS`, `EASE_IN`, `PRICES`).

| Parâmetro | Antes | Agora |
|---|---|---|
| Nível do expediente | 1 + 2 × (dia − 1) + 1 a cada 30 s | 1 + ⌊1,5 × (dia − 1)⌋ + 1 a cada 40 s (mecânicas chegam em dias diferentes) |
| Peso do nível nos pontos | × nível | × (1 + 0,2 × (nível − 1)), teto no nível 19 |
| Combo | até × 5, +1 a cada 5 | até × 4, +1 a cada 8 |
| Promoção (pontos no dia) | 300 · 700 · 1.500 · 2.500 · 4.000 · 6.000 | 900 · 1.800 · 2.600 · 3.600 · 4.400 · 5.200 |
| Dia mínimo do cargo | 1 · 1 · 2 · 3 · 5 · 7 · 10 | 1 · 1 · 3 · 5 · 8 · 11 · 14 |
| Salário | pontos ÷ 10 + 30 × dia | salário do cargo (42 a 145) + desempenho (pontos ÷ 70, até 35) |
| Bônus de fim de dia (pontos) | 100 × dia | 80 |
| Rescisão | pontos do dia ÷ 20 | 2 × salário do cargo |
| Preços | 20 a 600 | consumíveis 20 a 55; enfeites 35 a 1.200 por utilidade e raridade |
| Dificuldade | Normal = 1,0 | Fácil 0,55 a 0,72 · Normal 0,85 a 0,9 · Difícil 1,1 a 1,2 · Burnout 1,4 a 1,75 |
| Primeiros dias | — | dias 1, 2 e 3 a 70%, 80% e 90% do ritmo em todas as dificuldades |

Simulação (`python3 tools/simulate.py`, regra de promoção igual à do jogo): regular chega a Gerente no dia 8 e a CEO no 14;
casual chega a Gerente perto do dia 12. Saves antigos: carteira, enfeites e cargo atual são mantidos; nenhuma promoção é
dada ou retirada retroativamente. O exploit de sair no meio do dia depois de uma promoção e ganhar outra no mesmo dia foi
fechado (`promoDay` agora é salvo). Os valores antigos continuam disponíveis como perfil "Clássica" (Experimental).

---

## Proposta original (histórico)

Os números abaixo eram a proposta inicial. Os números vêm de `tools/simulate.py`, uma simulação Monte Carlo
que reproduz as regras do código (nível, queda dos arquivos, tarefas com prazo, eventos, combo,
estresse, salário e promoções) com três perfis de jogador, 250 carreiras cada.

## Diagnóstico (valores atuais)

| Perfil | Assistente | Analista | Coordenador | Gerente | Diretor | CEO | Todos os enfeites (R$ 1.410) | Saldo após o dia 5 |
|---|---|---|---|---|---|---|---|---|
| Casual | dia 1 | dia 1 | dia 1 | dia 2 | dia 2 | **dia 3** | dia 3 | R$ 2.524 |
| Regular | dia 1 | dia 1 | dia 1 | dia 1 | dia 2 | **dia 2** | dia 2 | R$ 5.600 |
| Experiente | dia 1 | dia 1 | dia 1 | dia 1 | dia 1 | **dia 2** | dia 2 | R$ 10.514 |

A causa é estrutural, não um número isolado:

1. **Pontos = base × nível × combo.** O nível começa cada dia em `1 + 2 × (dia − 1)` e sobe mais 1 a cada 30 s.
   No dia 5 o nível vai de 9 a 13, então um arquivo vale de 9 a 13 vezes o que valia no dia 1, e ainda pode ser multiplicado por 5 pelo combo.
   Isso dá até **65 vezes** o valor do dia 1.
2. **O combo chega a ×5 com 20 acertos seguidos.** Um jogador regular mantém isso boa parte do dia.
3. **Os limiares de cargo (300 → 15.000) são lineares**, mas a pontuação cresce de forma explosiva com o dia.
4. **Salário = pontos do dia ÷ 10 + 30 × dia.** O dinheiro herda a explosão dos pontos: o mercado inteiro (R$ 1.410) se paga no 2º ou 3º dia.
5. **Bônus de fim de dia = 100 × dia.** Também cresce sem limite.
6. **Os benefícios dependem das promoções.** Com 6 promoções em 2 ou 3 dias, quase todos os benefícios saem logo no começo.

## Proposta

| Parâmetro | Atual | Proposto | Por quê |
|---|---|---|---|
| Peso do nível nos pontos | × nível (1, 2, 3, …) | × (1 + 0,12 × (nível − 1)), com teto no nível 17 (× 2,92) | A dificuldade sobe com o nível, a recompensa sobe devagar |
| Multiplicador de combo | até × 5, +1 a cada 5 acertos | até × 3, +1 a cada 10 acertos | Combo premia constância sem dominar a pontuação |
| Limiares dos cargos | 300 · 1.000 · 2.500 · 5.000 · 9.000 · 15.000 | 1.200 · 4.000 · 9.500 · 19.000 · 34.000 · 56.000 | Cada cargo leva mais dias que o anterior |
| Bônus de fim de dia | 100 × dia | 60 fixo | Deixa de crescer sem limite |
| Salário | pontos ÷ 10 + 30 × dia | salário do cargo + desempenho (pontos ÷ 80, até R$ 30) | O dinheiro acompanha o cargo, com um extra pelo bom dia |
| Salário por cargo | — | 40 · 50 · 62 · 76 · 92 · 110 · 130 | Promoção vira aumento perceptível |
| Preços do mercado | sem mudança | sem mudança | Com o salário novo, os preços atuais já ficam no ritmo certo |
| Rescisão no game over | pontos do dia ÷ 20 | (sugestão) 2 × salário do cargo | Coerente com o novo salário; não acelera a próxima carreira |

### Resultado simulado da proposta

| Perfil | Assistente | Analista | Coordenador | Gerente | Diretor | CEO | Todos os enfeites | Saldo após o dia 5 |
|---|---|---|---|---|---|---|---|---|
| Casual | dia 1 | dia 3 | dia 6 | dia 10 | dia 17 | **dia 26** | dia 15 | R$ 99 |
| Regular | dia 1 | dia 2 | dia 4 | dia 8 | dia 12 | **dia 18** | dia 14 | R$ 173 |
| Experiente | dia 1 | dia 2 | dia 3 | dia 5 | dia 9 | **dia 13** | dia 13 | R$ 194 |

Efeitos esperados:
- **Cargos e benefícios**: os 6 benefícios de promoção se espalham pela carreira em vez de saírem todos nos 2 primeiros dias. A primeira promoção continua rápida (dia 1), para o jogador sentir o sistema cedo.
- **Mercado**: com cerca de R$ 50 a 100 por dia no início, a escolha entre consumíveis (R$ 20 a 45) e enfeites (R$ 60 a 600) passa a ser uma decisão real. O troféu (R$ 600) vira meta de médio prazo.
- **Habilidade importa sem quebrar**: o experiente chega a CEO cerca de 2 vezes mais rápido que o casual, contra 1,5 vez hoje, quando todos chegam em 2 ou 3 dias.

## Limites desta análise

- O modelo de jogador é simplificado: reação fixa, precisão que cai levemente com o nível, uma tarefa por vez. Ele **não** modela itens (café e chá), benefícios nem as variações de cada dia.
- **A estimativa de duração da carreira (esgotamento) não é confiável neste modelo.** Ele aponta esgotamento em cerca de 50 a 75% das carreiras regulares e experientes por volta do dia 28, e nenhum no casual. Isso contradiz a intuição: o casual deveria se esgotar mais, já que perde mais prazos. Suspeito que o modelo de atenção (tarefas versus arquivos) não represente bem o jogo real. Antes de usar esse número para decidir, recomendo medir com jogo real (por exemplo, registrando em que dia as carreiras terminam).
- A proposta mexe só em pontos, cargos e dinheiro. O estresse causado por cada erro não foi alterado, conforme pedido.

Para reproduzir: `python3 tools/simulate.py --runs 250`.

## Carreira de 25 dias (perfil padrão, aplicado)

Configuração central em `src/js/02-mecanica.js` (`DEBUT`, `PROG`, `FREQ`, `WIN_DAY`, perfil `original`). Uma novidade por dia:
pendência simples (1), setor (2), urgente (3), morto (4), e-mail (6), spam (7), ligação (8), ligação difícil (9), impressora (10),
relatório + impressora alternada (11), chefe (12), troca de setores (13), travamento (14), vírus (16), TI intenso (17), vídeo (18),
reunião longa (19), pendência em etapas (21), crises (23). Estreia obrigatória após 20 s com dica; depois frequência crescente.
Pendências simultâneas: 1/2/3/4/5 por faixa de 5 dias. Combo até ×3, bônus de nível até ×1,8. Cargos nos dias 1·3·7·11·16·21·25,
metas do dia 1.800 · 2.300 · 2.600 · 2.800 · 3.000 · 3.100. Vitória: terminar um expediente como CEO a partir do dia 25.
Simulação (`python3 tools/simulate.py`): regular chega aos cargos nos dias mínimos (mediana); casual atrasa (Gerente ~20, sem CEO no 30).
