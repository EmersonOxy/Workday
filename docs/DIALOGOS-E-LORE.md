# WORKDAY — Direção narrativa e diálogos do MSworkN

> **Decisão do criador (03/11/2026).** Este documento estabelece como o jogo deve contar histórias. Não transforma sugestões ou textos antigos gerados por IA em canon.

## Princípio central

A gameplay é o expediente. A história é **opcional** e contada pelos meios já presentes no jogo: MSworkN, e-mails, calendário, ligações e consequências discretas na gameplay.

Um jogador deve poder terminar uma carreira sem ler mensagens ou e-mails. Quem acompanha a história percebe relações, dilemas e consequências que os demais não conhecem. Os acontecimentos continuam com ou sem leitura/intervenção do jogador. O jogador não precisa resolver todos os problemas dos NPCs.

Referências de direção: *Emily Is Away* (conversas pessoais e passagem do tempo) e *Undertale* (ações acumuladas e desfechos distintos, sem copiar as obras).

## Dois modos complementares

### Modo livre — conversas comuns

- O jogador digita texto livre (limite atual: 140 caracteres).
- O motor local interpreta intenções e, progressivamente, contexto, negações, assunto, tom e mensagens anteriores.
- Cada contato tem seu próprio repertório, personalidade e memória, respeitando quem sabe de cada fato.
- O motor **não é uma IA generativa**: não tem licença para inventar fatos do universo ou segredos; responde a partir de regras e conteúdo validado.
- Mensagens casuais nunca devem disparar sozinhas uma escolha de enredo irreversível por semelhança de palavras.
- Memória curta de acompanhamento deve ser registrada individualmente por contato e persistir entre sessões; memórias de carreira obedecem às regras existentes de escopo.

### Modo roteiro — pontos importantes

- Quando o NPC chega a um nó de escolha roteirizada, a entrada de texto livre é bloqueada **apenas naquela conversa**.
- Aparecem balões com opções integralmente escritas, traduzidas e aprovadas para o roteiro.
- Ao escolher um balão, o jogador passa a digitar: cada tecla avança a frase previamente escolhida. Teclas digitadas não substituem o conteúdo.
- Backspace recua; é possível cancelar e escolher outra resposta.
- Somente **enviar a mensagem completa** registra a escolha e aplica efeitos sociais/narrativos. Selecionar, digitar parcialmente, sair da janela ou trocar o balão não altera o enredo.
- Não forçar uma leitura ou resposta para progredir a gameplay. Conversas ignoradas seguem as regras existentes de prazo e desfecho, quando houver.
- Retornar ao texto livre quando a sequência roteirizada terminar.
- PT-BR, inglês, espanhol, desktop e celular devem permanecer funcionais.

## Arcos e finais futuros

- Problemas dos personagens devem ser concretos, verossímeis e com evolução ao longo de dias.
- As situações podem ser reveladas de formas complementares pelo MSN, e-mail e calendário.
- Arcos podem cruzar-se, mas um NPC não pode conhecer automaticamente o que foi dito a outro.
- Decisões de diálogo e comportamentos recorrentes de gameplay podem afetar finais futuros; não usar moralidade simplista ou escolhas binárias "certas".
- Não criar novos segredos, relações, mortes, romances, biografias, resoluções ou eventos canônicos sem aprovação explícita do criador.

## Organização de conteúdo futuro

Separar a **bíblia do universo**, os **arcos dos personagens** e a **cronologia de eventos** dos arquivos de execução. A IA pode implementar, sugerir e redigir versões para revisão, mas o direcionamento e a canonização da lore são decisões do criador.

## Implementação inicial

- `src/js/43-social-motor.js`: decisões com efeitos no envio; memória curta por contato para texto livre.
- `src/js/46-mensageiro.js`: editor bloqueado, balões e digitação simulada.
- `src/css/90-mensageiro.css`: apresentação do modo roteirizado.
- `tests/mensageiro.js`: regressões de seleção, cancelamento, envio, texto livre, contexto e histórico.

A classificação semântica extensa, mais diálogos contextuais por NPC, novos arcos e finais **não fazem parte desta implementação inicial**. Exigem conteúdo autoral e testes específicos.
