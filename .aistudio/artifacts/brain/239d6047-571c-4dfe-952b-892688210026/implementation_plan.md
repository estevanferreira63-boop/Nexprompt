# Plano de Implementação: Otimização de Navegação, Quizzes, Terminal Hacker e Novos Labs

Este plano detalha as melhorias estruturais, arquiteturais e de experiência do usuário solicitadas para a plataforma, alinhadas às diretrizes de design de simulações educacionais e às respostas fornecidas pelo usuário.

---

## 1. Análise de Requisitos & Diagnóstico do Sistema

### 1.1. Navegação & Exibição In-Place (Zero Scroll Jump)
* **Problema:** Ao clicar em um card ou conceito na matriz ou nos grafos, a página sofria saltos de rolagem ou rolava involuntariamente a tela para o topo.
* **Solução:** 
  * Travar o scroll da página (`body { overflow: hidden }`) durante a exibição do modal centralizado.
  * Capturar cliques com `e.preventDefault()` e `e.stopPropagation()`.
  * Preservar o scroll offset original do usuário para que, ao fechar o modal, a visualização retorne exatamente à posição anterior sem tremores visuais.

### 1.2. Correção Crítica dos Quizzes ("Respostas sempre letra B")
* **Problema:** No banco de dados dos 100 conceitos (`section1.ts` a `section7.ts`), a propriedade `correctIndex` estava configurada como `1` em quase todas as questões, fazendo com que a opção correta fosse invariavelmente a letra "B".
* **Solução:**
  * Implementar uma função de embaralhamento dinâmico (Fisher-Yates shuffle determinístico ou aleatório) tanto no `QuizHubView.tsx` quanto no `ConceptDetailModal.tsx`.
  * A função embaralha as 4 opções e rastreia o novo índice da resposta correta, garantindo uma distribuição uniforme de 25% entre as letras **A (0), B (1), C (2) e D (3)**.

### 1.3. Terminal Estilo Hacker com Histórico e Autocomplete
* **Problema:** O terminal atual possuía execução básica de comandos estáticos, sem histórico navegável com setas ou sugestões inteligentes de autocompletação.
* **Solução:**
  * **Histórico de Comandos:** Navegação por comandos anteriores e posteriores utilizando as teclas `ArrowUp` e `ArrowDown`.
  * **Autocomplete com tecla `Tab`:** Autocompletação de comandos do ecossistema de dados (`spark-submit`, `kafka-consumer-groups`, `dbt run`, `debezium status`, `duckdb`, `delta vacuum`, `redis-cli`, `matrix`, `labs`, `theme`, `clear`, `help`).
  * **Visual Hacker:** Opção de tema verde Matrix / ciano Cyberpunk, indicador sonoro de digitação retrô e saída formatada com tabelas e status coloridos.

### 1.4. Redesenho Moderno do Ícone / Logotipo (`AppLogo.tsx`)
* **Problema:** O ícone atual era simplificado e precisava de uma identidade visual mais moderna, marcante e alinhada a sistemas de alta engenharia e IA.
* **Solução:** Criação de um emblema geométrico tridimensional em SVG combinando camadas de dados holográficas (Lakehouse), conexões neurais de IA e iluminação volumétrica com gradientes ciano/índigo/esmeralda.

### 1.5. Três Novos Laboratórios Visuais Interativos (15 Labs no total)
1. **Debezium CDC Streaming Lab (`DebeziumCdcLab.tsx`):**
   * Simulação visual de Change Data Capture: transações no PostgreSQL geram eventos no Write-Ahead Log (WAL), capturados pelo Debezium, transmitidos pelo Kafka e gravados na camada Bronze do Lakehouse.
2. **Redis Cache & Invalidation Lab (`RedisCacheInvalidationLab.tsx`):**
   * Simulação de estratégias Cache-Aside, Write-Through e TTL, demonstrando visualmente o impacto de Cache Hit (0.2ms em RAM) vs Cache Miss (45ms em disco) e a mecânica de invalidação de cache.
3. **Parquet Compression & I/O Lab (`ParquetCompressionLab.tsx`):**
   * Comparação em tempo real entre Snappy, ZSTD, GZIP e dados não-comprimidos, com velocímetros de CPU, taxa de compressão e I/O de disco.

---

## 2. Diretrizes de Layout & Visual Architecture (Frontend Design)

* **Layout de Simulação em Duas Zonas:** Estágio interativo superior/esquerdo (60-70% do espaço) com animação física do fluxo de dados e deck de controle e parâmetros inferior/direito.
* **Disciplina Anti-Slop & Zero-Pills:** Eliminar badges estáticos em cápsula redundantes; usar tipografia limpa com separadores sutis (`·`) e manter apenas controles de filtros interativos como botões funcionais.
* **Contraste WCAG AA:** Paleta `slate-950` de fundo com texto de alta fidelidade em `slate-100` e acentos ciano (`#06b6d4`), esmeralda (`#10b981`) e índigo (`#6366f1`).
* **Micro-Interações e Efeitos Sonoros:** Sons táteis para cliques de comando, conclusão de quiz e trocas de abas, respeitando a configuração de mudo (`soundMuted`).

---

## 3. Plano de Execução Técnica por Fases

### Fase 1: Correção dos Quizzes (Randomização das Alternativas)
1. Criar utilitário `shuffleQuizOptions` em `src/utils/quizUtils.ts`:
   * Recebe `options` e `correctIndex`.
   * Retorna `shuffledOptions` e o novo `shuffledCorrectIndex`.
2. Integrar em `QuizHubView.tsx` para que cada pergunta exibida tenha suas opções embaralhadas dinamicamente.
3. Integrar em `ConceptDetailModal.tsx` na aba de Quiz do conceito.
4. Testar a distribuição das respostas para assegurar alternância natural entre A, B, C e D.

### Fase 2: Modal In-Place sem Rolagem de Tela
1. Em `ConceptMatrix.tsx`, aplicar `e.preventDefault()` em todos os seletores de conceito.
2. Em `ConceptDetailModal.tsx`, implementar `useEffect` para travar o `document.body.style.overflow = 'hidden'` e salvar/restaurar o scroll offset.
3. Otimizar a transição do modal com `backdrop-blur-md` e animação CSS limpa sem reflow do documento pai.

### Fase 3: Terminal Hacker Interativo
1. Atualizar `src/components/DataEngTerminalModal.tsx`:
   * Adicionar array de histórico de comandos digitados (`commandHistory: string[]`) com índice navegável (`historyPointer: number`).
   * Adicionar listener para `ArrowUp` (comando anterior) e `ArrowDown` (comando seguinte).
   * Adicionar listener para tecla `Tab` com autocompletação do comando mais próximo.
   * Suporte a novos comandos simulados: `debezium status`, `redis-cli monitor`, `parquet-tools inspect`, `delta vacuum`, `duckdb`.
   * Adicionar alternador de estilo hacker (Matrix Verde vs Cyber Ciano vs Stealth Dark).

### Fase 4: Redesenho do Logotipo / Ícone
1. Atualizar `src/components/AppLogo.tsx` com novo design SVG vetorial de alta definição:
   * Hexágono isométrico com disco de dados central e núcleo de luz de inteligência artificial.
   * Renderização nítida em tamanhos `sm`, `md` e `lg`.

### Fase 5: Criação dos 3 Novos Laboratórios Visuais
1. Criar `src/components/VisualLabs/DebeziumCdcLab.tsx` (CDC PostgreSQL WAL -> Debezium -> Kafka -> Lakehouse).
2. Criar `src/components/VisualLabs/RedisCacheInvalidationLab.tsx` (Cache Hit vs Miss, TTL, Eviction LRU).
3. Criar `src/components/VisualLabs/ParquetCompressionLab.tsx` (Snappy vs ZSTD vs GZIP com medidor de I/O e CPU).
4. Atualizar `src/types/concept.ts` para registrar novos tipos em `LabType`:
   * `'debezium-cdc' | 'redis-cache' | 'parquet-compression'`.
5. Registrar os novos labs em `VisualLabHub.tsx` com ícones, descrições e badges.

---

## 4. Plano de Validação & Testes

* **Testes de Navegação:** Clicar em conceitos em diferentes seções da página e verificar se a janela modal abre suavemente sem rolar o documento de fundo.
* **Testes dos Quizzes:** Responder a 10 perguntas consecutivas no Quiz Hub e verificar que as respostas corretas se alternam equilibradamente entre A, B, C e D.
* **Testes do Terminal:** Testar ArrowUp/ArrowDown para comandos anteriores, tecla Tab para autocompletação e execução dos novos comandos (`debezium`, `redis-cli`, `duckdb`).
* **Testes dos Laboratórios:** Interagir com os 3 novos simuladores (ajuste de taxa de mutação, TTL de cache e algoritmos de compressão).
* **Verificação de Compilação & Lint:** Executar `compile_applet` e `lint_applet` para assegurar build sem erros ou advertências.
