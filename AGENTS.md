# WORKDAY — instruções para agentes (Codex e outros)

Projeto: jogo de escritório em HTML, CSS e JavaScript puros. Idioma de trabalho: português brasileiro.

## Fonte de verdade
1. **Leia `docs/DIALOGOS-E-LORE.md` antes de criar/editar diálogos, e-mails, eventos do calendário, relações dos NPCs ou desfechos.** A história existe em paralelo à gameplay e deve ser totalmente opcional de ler.
2. O **criador decide o canon**. Uma ideia escrita por IA não vira fato canônico sem aprovação explícita. Não inventar novas biografias, segredos, casais, traumas, mortes ou finais para completar lacunas.
3. Consulte `CLAUDE.md` para o mapa do código, diretrizes visuais e pendências de implementação.
4. Não reescrever diálogos anteriores ou apagar mecânicas sem necessidade. Preservar saves, offline, desktop/celular, acessibilidade, PT/EN/ES e a identidade pixel art.

## Pixel art — gato cinza

Antes de alterar o gato ou iniciar animações, consultar `design/pixel-art/GATO-CINZA-FRENTE.md`, `design/pixel-art/GUIA-DE-SPRITES.md` e `design/pixel-art/gato-cinza-frente.spec.json`. A referência atual é o gato cinza tigrado frontal, sentado, olhando para o jogador, redimensionado pelo criador para PNG 264×241. Não criar outro gato reinterpretado, não assumir que resolução do PNG = tamanho lógico no jogo; conferir alpha, grade, paleta, pivô e tela. A imagem exata ainda aguarda inclusão binária no GitHub. A atual implementação runtime permanece intacta.

## MSworkN
- `src/js/43-social-motor.js`: estado, relações, memórias, agenda, interpretação de mensagem.
- `src/js/44-social-elenco.js`: elenco e repertório de cada NPC.
- `src/js/45-social-conversas.js`: roteiros, opções e consequências.
- `src/js/46-mensageiro.js` + `src/css/90-mensageiro.css`: interface.
- **Conversa casual** aceita texto livre com interpretações locais; não fingir que o motor é IA generativa e não fazer texto livre alterar decisões irreversíveis por detecção de palavras.
- **Conversa importante** bloqueia texto livre, apresenta balões roteirizados e revela a fala escolhida conforme o jogador digita. Selecionar ou começar a digitar **não aplica consequências**; somente o envio da fala completa.
- A história e seus prazos podem progredir mesmo sem o jogador abrir o mensageiro.

## Verificação
```bash
python3 tools/build.py
node tests/mensageiro.js
```
O build gera `dist/web/` e `dist/workday.html`; `dist/` não é versionado. O GitHub Pages publica automaticamente as alterações da branch `main` em https://emersonoxy.github.io/Workday/.

Ao ampliar a interpretação contextual, documentar exatamente quais frases são reconhecidas, quais memórias são persistidas, quais efeitos de lore são permitidos e adicionar testes. Não confundir 'mais padrões' com compreensão ilimitada.
