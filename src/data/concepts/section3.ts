import { Concept } from '../../types/concept';

export const SECTION_3_CONCEPTS: Concept[] = [
  {
    id: 31,
    sectionId: 3,
    name: 'Distributed Systems',
    tagline: 'Múltiplos computadores independentes operando em conjunto como se fossem uma única máquina.',
    difficulty: 'Iniciante',
    overview: 'Sistemas Distribuídos unem dezenas ou milhares de servidores (nós) conectados via rede para dividir tarefas e armazenar volumes de dados impossíveis de caber em um único computador.',
    whyItMatters: 'Permite escalabilidade horizontal (adicionar mais máquinas baratas ao cluster em vez de comprar um supercomputador caríssimo) e alta disponibilidade.',
    underTheHood: 'Governada pelo Teorema CAP (Consistência, Disponibilidade e Tolerância a Partições). Exige protocolos de consenso (Raft, Paxos, Zookeeper) para coordenar estado entre nós e lidar com nós que caem repentinamente.',
    realWorldExample: 'Clusters de centenas de nós no Databricks ou EMR processando petabytes de telemetria.',
    codeSnippet: {
      language: 'python',
      title: 'Inicialização de Contexto de Cluster Distribuído',
      code: `from pyspark.sql import SparkSession

# O driver se conecta ao cluster manager (Kubernetes / YARN)
spark = SparkSession.builder \\
    .master("k8s://https://k8s-cluster:6443") \\
    .appName("DistributedProcessing") \\
    .config("spark.executor.instances", "20") \\
    .config("spark.executor.cores", "4") \\
    .getOrCreate()`,
    },
    antiPatterns: ['Tratar um cluster distribuído como se fosse uma máquina local com memória compartilhada ou arquivos locais.'],
    bestPractices: ['Projete computações que possam ser divididas em pedaços independentes para maximizar o ganho de escala.'],
    relatedIds: [32, 33, 34, 47],
    quiz: {
      question: 'O que o Teorema CAP afirma sobre sistemas distribuídos durante uma partição de rede (Network Partition)?',
      options: [
        'O sistema é forçado a escolher entre Consistência (rejeitar requisições) ou Disponibilidade (responder com dados possivelmente defasados).',
        'O sistema pode garantir Consistência absoluta E Disponibilidade total ao mesmo tempo.',
        'Todos os servidores queimam fisicamente.',
        'A velocidade de transmissão aumenta.',
      ],
      correctIndex: 0,
      explanation: 'O Teorema CAP estabelece que, na presença inevitável de partições de rede, um sistema distribuído deve priorizar consistência estrita (CP) ou disponibilidade ininterrupta (AP).',
    },
  },
  {
    id: 32,
    sectionId: 3,
    name: 'Parallelism',
    tagline: 'Execução simultânea de tarefas em múltiplos núcleos e nós de processamento.',
    difficulty: 'Iniciante',
    overview: 'Paralelismo é a capacidade de executar múltiplas tarefas computacionais no exato mesmo instante de tempo, distribuindo partições de dados entre múltiplos núcleos de CPU (cores) em diferentes nós do cluster.',
    whyItMatters: 'Se você tiver 100 núcleos de CPU no cluster, um job paralelo bem balanceado pode rodar até 100 vezes mais rápido do que em um único núcleo.',
    underTheHood: 'No Spark, o nível de paralelismo é determinado pelo número de partições do RDD/DataFrame. 1 partição de dados = 1 tarefa (task) alocada para 1 slot/core de CPU de um executor.',
    realWorldExample: 'Dividir um dataset de 1 bilhão de registros em 200 partições processadas em paralelo por 50 cores de CPU.',
    codeSnippet: {
      language: 'python',
      title: 'Controlando Nível de Paralelismo no Spark',
      code: `# Verificando quantas partições paralelas existem no DataFrame
print("Partições atuais:", df.rdd.getNumPartitions())

# Ajustando o paralelismo padrão para operações de shuffle
spark.conf.set("spark.sql.shuffle.partitions", "200")`,
    },
    antiPatterns: ['Ter 64 cores ociosos enquanto os dados estão concentrados em apenas 2 partições, gerando subutilização de 97% do cluster.'],
    bestPractices: ['Mantenha entre 2 a 4 partições por core de CPU disponível no cluster para amortizar variações de tempo de execução.'],
    relatedIds: [31, 35, 43, 48],
    quiz: {
      question: 'Se o seu cluster possui 40 cores disponíveis e seu DataFrame tem apenas 4 partições, o que acontece?',
      options: [
        'Todos os 40 cores dividem as 4 partições igualmente.',
        'O cluster entra em colapso por falta de partições.',
        'Apenas 4 cores trabalham enquanto os outros 36 cores ficam totalmente ociosos.',
        'O Spark cria cópias das partições para preencher os 40 cores.',
      ],
      correctIndex: 2,
      explanation: 'No Spark, cada partição é processada por no máximo 1 core por vez. Se você tem 4 partições, no máximo 4 cores executam tarefas simultaneamente.',
    },
  },
  {
    id: 33,
    sectionId: 3,
    name: 'Fault Tolerance',
    tagline: 'Resiliência a falhas: a capacidade do sistema continuar operando mesmo se nós desligarem no meio do caminho.',
    difficulty: 'Intermediário',
    overview: 'Tolerância a Falhas garante que a perda inesperada de máquinas, nós de computação ou conexões de rede não cause a perda de dados nem a falha do job completo.',
    whyItMatters: 'Em clusters de centenas de nós rodando por horas na nuvem com instâncias Spot baratas, falhas de nós são uma certeza estatística, não uma exceção.',
    underTheHood: 'O Spark alcança resiliência sem gravar tudo em disco através do Lineage Graph (Linhagem de RDDs imutáveis). Se um nó cai e perde a partição 7, o driver simplesmente reexecuta a cadeia exata de transformações que gerou a partição 7 em outro nó saudável.',
    realWorldExample: 'Usar instâncias Spot da AWS (70% mais baratas) para processamento pesado: nós podem ser revogados a qualquer instante e o Spark reexecuta as tasks perdidas.',
    codeSnippet: {
      language: 'python',
      title: 'Checkpointing explícito para quebrar a cadeia de linhagem em loops longos',
      code: `# Em algoritmos iterativos (ex: grafos ou machine learning)
spark.sparkContext.setCheckpointDir("s3://checkpoints-bucket/spark-recovery/")

# Salva o estado físico em disco e trunca a linhagem para economizar memória do driver
df_iterativo.checkpoint()`,
    },
    antiPatterns: ['Encadear centenas de transformações iterativas em loop sem checkpointing, estourando a pilha de memória do Driver com linhagem infinita.'],
    bestPractices: ['Aproveite a resiliência nativa do Spark para usar nós Spot e economizar custos de infraestrutura.'],
    relatedIds: [31, 37, 38, 97],
    quiz: {
      question: 'Como o Spark recupera uma partição de dados perdida se o nó onde ela estava sofrer um desligamento físico?',
      options: [
        'Ele cancela todo o job e pede para o engenheiro reiniciar.',
        'Ele restaura de uma fita magnética.',
        'Ele inventa valores médios para substituir o dado perdido.',
        'Ele usa a linhagem do RDD (DAG) para recomputar apenas a partição perdida a partir do dado original em outro nó.',
      ],
      correctIndex: 3,
      explanation: 'Graças à imutabilidade dos RDDs e ao grafo de linhagem registrado no driver, o Spark sabe a receita exata para reexecutar apenas as etapas necessárias para reconstruir a partição perdida.',
    },
  },
  {
    id: 34,
    sectionId: 3,
    name: 'Data Locality',
    tagline: 'Mova a computação para onde os dados estão, em vez de mover os dados para onde a computação está.',
    difficulty: 'Intermediário',
    overview: 'Data Locality é a heurística de agendar a execução de tarefas nos nós físicos onde os dados já estão armazenados (em memória ou disco local), minimizando transferências caras pela rede.',
    whyItMatters: 'A velocidade de leitura da RAM/disco local é de gigabytes por segundo, enquanto a placa de rede frequentemente se torna o funil de lentidão do cluster.',
    underTheHood: 'O scheduler do Spark avalia níveis de localidade: 1) `PROCESS_LOCAL` (dados no mesmo processo da JVM); 2) `NODE_LOCAL` (no mesmo nó físico); 3) `RACK_LOCAL` (no mesmo rack do datacenter); 4) `ANY` (em qualquer lugar pela rede). O scheduler aguarda alguns milissegundos na esperança de um slot local liberar.',
    realWorldExample: 'Hadoop HDFS ou caches Alluxio onde blocos de 128MB já residem no disco do nó worker que executa a task.',
    codeSnippet: {
      language: 'python',
      title: 'Configurações de espera por localidade no Spark',
      code: `# Tempo que o Spark espera antes de desistir de localidade ótima e mandar para outro nó:
spark.conf.set("spark.locality.wait", "3s")
spark.conf.set("spark.locality.wait.process", "3s")
spark.conf.set("spark.locality.wait.node", "3s")`,
    },
    antiPatterns: ['Configurar `spark.locality.wait` para valores gigantescos em clusters elásticos na nuvem onde os nós não possuem discos de storage local.'],
    bestPractices: ['Em nuvem com S3/GCS desacoplado, use instâncias com placas de rede de alta largura de banda (10Gbps+).'],
    relatedIds: [31, 32, 35, 47],
    quiz: {
      question: 'Qual nível de localidade de dados no Spark representa a maior velocidade de execução?',
      options: [
        'ANY (rede externa)',
        'PROCESS_LOCAL (dados já na memória do mesmo processo de execução)',
        'RACK_LOCAL (mesmo rack de servidores)',
        'DISK_FALLBACK (leitura de disco magnético)',
      ],
      correctIndex: 1,
      explanation: 'PROCESS_LOCAL é o melhor nível de localidade possível, pois os dados já estão na memória RAM da JVM do próprio processo que vai executar a tarefa.',
    },
  },
  {
    id: 35,
    sectionId: 3,
    name: 'Shuffle',
    tagline: 'O elefante na sala: redistribuição de dados pela rede entre nós, o maior gargalo de sistemas distribuídos.',
    difficulty: 'Intermediário',
    overview: 'Shuffle é o processo de reorganizar e redistribuir dados entre partições e nós do cluster quando operações exigem dados agrupados por uma chave comum (ex: `groupByKey`, `reduceByKey`, `join`, `distinct`).',
    whyItMatters: 'O Shuffle é o responsável por 90% das lentidões, estouros de memória e falhas de jobs Spark, pois envolve serialização, gravação em disco local, transferência massiva de rede e desserialização.',
    underTheHood: 'Na fase Map, cada executor divide os dados em buckets de shuffle e grava arquivos intermediários no disco local. Na fase Reduce, todos os executores conectam-se entre si via HTTP/Netty para baixar as fatias correspondentes às suas novas partições.',
    realWorldExample: 'Agrupar 500 milhões de cliques por `user_id` força o cluster a enviar todos os cliques do mesmo usuário para o mesmo nó pela rede.',
    labType: 'spark-dag',
    codeSnippet: {
      language: 'python',
      title: 'Evitando Shuffle com Broadcast Join',
      code: `from pyspark.sql.functions import broadcast

# Em vez de Shuffle Hash Join (pesado, envia as duas tabelas pela rede):
# df_grande.join(df_pequeno, "categoria_id")

# Faz broadcast da tabela pequena para todos os nós (zero shuffle na tabela grande!):
df_resultado = df_grande.join(broadcast(df_pequeno), "categoria_id")`,
    },
    antiPatterns: ['Usar groupByKey() que shuffla todos os registros sem agregação prévia no nó mapper, em vez de reduceByKey().'],
    bestPractices: ['Ative o Adaptive Query Execution (AQE) para coalesce automático de partições de shuffle e tratamento de skew.'],
    relatedIds: [36, 41, 42, 43],
    quiz: {
      question: 'Por que o Shuffle é geralmente a etapa mais lenta de um job distribuído?',
      options: [
        'Porque ele pausa o relógio do sistema.',
        'Porque ele só roda com 1 único core.',
        'Porque exige serializar dados, gravar em disco intermediário e transferir gigabytes de dados pela rede entre todos os nós do cluster.',
        'Porque apaga as tabelas temporárias.',
      ],
      correctIndex: 2,
      explanation: 'O Shuffle envolve escrever arquivos intermediários em disco no nó emissor, trafegar milhares de conexões de rede simultâneas e ler no nó receptor, saturando disco e rede.',
    },
  },
  {
    id: 36,
    sectionId: 3,
    name: 'Narrow vs Wide',
    tagline: 'Transformações Narrow (rápidas, sem shuffle) vs Wide (lentas, exigem redistribuição de dados).',
    difficulty: 'Intermediário',
    overview: 'Transformações Narrow são aquelas em que cada partição de saída depende de apenas uma partição de entrada (ex: `map`, `filter`). Transformações Wide exigem que dados de múltiplas partições sejam combinados em novas partições, disparando um Shuffle obrigatório.',
    whyItMatters: 'Saber a diferença é o segredo para entender os limites de estágios (Stage Boundaries) do Spark e desenhar pipelines que rodam em minutos em vez de horas.',
    underTheHood: 'Operações Narrow rodam em "pipeline" contínuo dentro da mesma CPU e memória sem tocar o disco. Quando o DAG encontra uma transformação Wide (ex: `groupBy`), o Spark corta o plano e cria uma barreira de estágio (Stage Barrier) com Shuffle.',
    realWorldExample: '`filter(idade > 18)` é Narrow (avalia linha a linha localmente). `groupBy("cidade").count()` é Wide (precisa juntar todas as pessoas da mesma cidade no mesmo nó).',
    labType: 'spark-dag',
    codeSnippet: {
      language: 'python',
      title: 'Comparativo de Código Narrow vs Wide',
      code: `# NARROW: Não gera shuffle, roda em pipeline no mesmo estágio
df_limpo = df_raw.filter(df_raw["status"] == "ATIVO").select("user_id", "valor")

# WIDE: Dispara Shuffle Boundary e cria novo Stage no DAG do Spark
df_agregado = df_limpo.groupBy("user_id").sum("valor")`,
    },
    antiPatterns: ['Encadear múltiplos groupBys e joins consecutivos sem filtrar previamente com operações Narrow.'],
    bestPractices: ['Filtre (Narrow) o máximo de dados possível ANTES de qualquer agregação ou join (Wide).'],
    relatedIds: [35, 37, 38, 41],
    quiz: {
      question: 'Qual das seguintes operações é uma transformação Narrow no Apache Spark?',
      options: [
        'df.groupBy("estado").count()',
        'df.filter(df["idade"] >= 21)',
        'df.distinct()',
        'df_a.join(df_b, "id")',
      ],
      correctIndex: 1,
      explanation: 'O filter() avalia cada partição de forma 100% independente sem precisar consultar dados de outros nós ou partições, caracterizando uma transformação Narrow.',
    },
  },
  {
    id: 37,
    sectionId: 3,
    name: 'Lazy Evaluation',
    tagline: 'Avaliação preguiçosa: não faça nada até que o resultado seja realmente solicitado.',
    difficulty: 'Iniciante',
    overview: 'No Spark, transformações (`select`, `filter`, `join`) não processam os dados imediatamente. Elas apenas constroem um plano lógico de execução. O processamento real só é disparado quando uma Ação (`count`, `collect`, `show`, `save`) é chamada.',
    whyItMatters: 'Permite ao otimizador Catalyst enxergar o pipeline inteiro de ponta a ponta e aplicar otimizações revolucionárias (como predicate pushdown e projection pruning) antes de gastar um único ciclo de CPU.',
    underTheHood: 'Ao chamar 5 filtros sucessivos, o Spark não varre o dataset 5 vezes. Ele compõe uma única expressão booleana combinada `(A AND B AND C)` e empurra o filtro direto para a leitura do arquivo Parquet na nuvem.',
    realWorldExample: 'Você escreve 20 transformações complexas em um DataFrame de 10TB. O código roda em 2 milissegundos porque nada foi executado fisicamente ainda. Só ao rodar `.show()` o cluster inicia as tarefas.',
    codeSnippet: {
      language: 'python',
      title: 'Transformações Preguiçosas vs Ação no Spark',
      code: `# Transformações (Lazy - apenas constroem a receita):
step1 = df.filter("pais = 'BR'")
step2 = step1.filter("valor > 100")
step3 = step2.select("cliente_id", "valor")
# NENHUM byte foi lido do S3 até aqui!

# Ação (Eager - dispara a execução física de fato):
total = step3.count() # Agora o cluster trabalha!`,
    },
    antiPatterns: ['Chamar ações repetitivas de depuração como `.count()` ou `.show()` no meio do código de produção, forçando o Spark a reprocessar tudo várias vezes.'],
    bestPractices: ['Aproveite a avaliação preguiçosa para escrever código modular legível sem medo de penalidades de desempenho.'],
    relatedIds: [36, 38, 39, 44],
    quiz: {
      question: 'Qual é o maior benefício técnico da Avaliação Preguiçosa (Lazy Evaluation)?',
      options: [
        'Permite ao otimizador Catalyst analisar o grafo completo de transformações e otimizar o plano físico antes de executar qualquer leitura.',
        'Economiza energia desligando os monitores.',
        'Impede a ocorrência de erros no código.',
        'Dispensa o uso de nós executores.',
      ],
      correctIndex: 0,
      explanation: 'Como o Spark sabe tudo o que você quer fazer antes de começar, ele pode reorganizar e podar operações desnecessárias, aplicando técnicas como Predicate Pushdown.',
    },
  },
  {
    id: 38,
    sectionId: 3,
    name: 'DAG',
    tagline: 'Grafo Acíclico Dirigido: o mapa topológico que organiza tarefas em estágios sem loops infinitos.',
    difficulty: 'Intermediário',
    overview: 'DAG (Directed Acyclic Graph) é a representação matemática do fluxo de execução. É "Dirigido" porque as operações fluem em sentido único (origem -> destino) e "Acíclico" porque não contém ciclos ou loops que voltariam ao mesmo ponto.',
    whyItMatters: 'Tanto o Apache Spark (em nível de tarefas de computação distribuída) quanto o Apache Airflow (em nível de orquestração de pipelines de dados) usam DAGs para planejar dependências e paralelismo com precisão.',
    underTheHood: 'No Spark, o DAGScheduler quebra o grafo lógico em Estágios (Stages) físicos divididos exatamente nas fronteiras de Shuffle. Cada estágio é subdividido em um conjunto de tarefas paralelas idênticas (TaskSet).',
    realWorldExample: 'Na UI do Spark, a aba Jobs exibe o grafo visual mostrando quais estágios podem rodar ao mesmo tempo e onde ocorre a troca de shuffle.',
    labType: 'spark-dag',
    codeSnippet: {
      language: 'python',
      title: 'Visualizando o Plano de Execução do DAG no Spark',
      code: `# Mostra o plano lógico e físico do DAG no console:
df.explain(mode="extended")
# Exibe: Parsed Logical Plan -> Analyzed Logical Plan -> Optimized Plan -> Physical Plan`,
    },
    antiPatterns: ['Tentar criar dependências circulares (A depende de B que depende de A), o que viola a definição fundamental de aciclicidade.'],
    bestPractices: ['Acompanhe a Spark UI para identificar estágios de DAG que possuem gargalos de tempo ou shuffles desnecessários.'],
    relatedIds: [35, 36, 37, 39, 52],
    quiz: {
      question: 'O que define a divisão de estágios (Stages) no DAG de execução do Apache Spark?',
      options: [
        'A quantidade de arquivos salvos em formato CSV.',
        'As fronteiras de operações Wide que exigem Shuffle de dados pela rede.',
        'O número de linhas do código Python.',
        'A quantidade de tabelas no banco de dados.',
      ],
      correctIndex: 1,
      explanation: 'O DAGScheduler do Spark divide as operações em Estágios independentes sempre que encontra uma operação Wide (Shuffle Dependency).',
    },
  },
  {
    id: 39,
    sectionId: 3,
    name: 'Catalyst',
    tagline: 'O cérebro do Spark SQL: o otimizador extensível de consultas relacionais.',
    difficulty: 'Avançado',
    overview: 'O Catalyst é a engine de otimização relacional interna do Spark. Ele recebe seu código SQL ou DataFrame API e executa 4 fases: Análise, Otimização Lógica, Planejamento Físico e Geração de Código.',
    whyItMatters: 'Garante que desenvolvedores escrevendo consultas simples atinjam performance de nível sênior, pois o otimizador reordena operações, elimina colunas inúteis e empurra filtros para o banco de origem.',
    underTheHood: 'Aplica regras de reescrita em árvores de expressões (Pattern Matching em Scala). Otimizações clássicas incluem: Constant Folding (`1 + 1` vira `2`), Predicate Pushdown (filtra no Parquet/JDBC antes de ler) e Projection Pruning (descarta colunas não usadas).',
    realWorldExample: 'Você faz um JOIN de duas tabelas e filtra por `cidade = "SP"` no final. O Catalyst empurra o filtro para ANTES do JOIN, reduzindo o volume de linhas a serem pareadas de 1 bilhão para 20 milhões.',
    codeSnippet: {
      language: 'sql',
      title: 'Predicate Pushdown gerado pelo Catalyst',
      code: `-- Consulta escrita pelo usuário:
SELECT c.nome, p.valor 
FROM clientes c JOIN pedidos p ON c.id = p.cliente_id 
WHERE c.estado = 'SP';

-- O Catalyst otimiza internamente para:
-- 1. Ler apenas colunas 'nome', 'id' de clientes com filtro 'estado = SP' empurrado para o storage
-- 2. Ler apenas colunas 'valor', 'cliente_id' de pedidos
-- 3. Fazer o JOIN com os conjuntos já reduzidos!`,
    },
    antiPatterns: ['Usar RDDs brutos em vez de DataFrames/SQL, contornando e desativando completamente o otimizador Catalyst.'],
    bestPractices: ['Sempre utilize DataFrames e Spark SQL para se beneficiar automaticamente das novas otimizações do Catalyst.'],
    relatedIds: [37, 40, 41, 50],
    quiz: {
      question: 'Qual é o efeito do Predicate Pushdown executado pelo Catalyst Optimizer?',
      options: [
        'Aumenta o tamanho da memória de paginação.',
        'Desliga a compressão de arquivos.',
        'Converte a consulta SQL em um arquivo JSON.',
        'Empurra as condições de filtro WHERE diretamente para a camada de leitura dos arquivos/banco, evitando carregar linhas irrelevantes na RAM.',
      ],
      correctIndex: 3,
      explanation: 'O Catalyst transfere o filtro para o mais perto possível da fonte física de dados, garantindo que registros descartados nem cheguem a trafegar pela rede ou ocupar memória do Spark.',
    },
  },
  {
    id: 40,
    sectionId: 3,
    name: 'Tungsten',
    tagline: 'O motor de execução de baixo nível: geração de código em tempo de execução e gestão de memória sem GC.',
    difficulty: 'Avançado',
    overview: 'Project Tungsten é o motor de execução física de baixo nível do Apache Spark, focado em otimizar o uso de hardware moderno (CPU e memória de primeiro nível L1/L2/L3) em vez de focar apenas em I/O.',
    whyItMatters: 'Com SSDs NVMe e redes 100GbE ultrarrápidas, o gargalo dos sistemas modernos migrou de disco/rede para CPU e Garbage Collection da JVM. O Tungsten traz velocidade próxima a código C++ compilado.',
    underTheHood: 'Três pilares fundamentais: 1) Gestão de Memória Off-Heap: armazena dados em memória binária pura gerenciada manualmente pelo Spark, evitando overhead de objetos Java e pausas de Garbage Collection; 2) Algoritmos Cache-Aware: alinha estruturas em blocos de 64 bytes para caber nas linhas de cache L1/L2 da CPU; 3) Whole-Stage Code Generation: compila o pipeline de operadores inteiro em uma única função Java bytecode contínua (eliminando dispatch virtual).',
    realWorldExample: 'Na UI do Spark, nós do plano de execução marcados com `*` (asterisco), como `*Filter` e `*HashAggregate`, indicam aceleração pelo Tungsten Whole-Stage CodeGen.',
    codeSnippet: {
      language: 'python',
      title: 'Verificando Whole-Stage CodeGen do Tungsten',
      code: `# O asterisco (*) antes dos operadores indica que o Tungsten compilou o estágio em bytecode único:
# +- *HashAggregate(keys=[categoria], functions=[sum(valor)])
#    +- *Exchange hashpartitioning(...)
#       +- *Filter (valor > 0)
#          +- *FileScan parquet [...]`,
    },
    antiPatterns: ['Criar User Defined Functions (UDFs) em Python puro sem Pandas/Arrow, obrigando o Tungsten a serializar dados para processos Python externos.'],
    bestPractices: ['Utilize Vectorized UDFs (PySpark Pandas UDFs com Apache Arrow) para manter a compatibilidade com a memória binária do Tungsten.'],
    relatedIds: [39, 45, 46, 50],
    quiz: {
      question: 'Qual problema crônico de aplicações baseadas na JVM (Java/Scala) o Tungsten combate com sua gestão de memória Off-Heap?',
      options: [
        'A falta de portas USB nos servidores.',
        'A impossibilidade de conectar com bancos relacionais.',
        'Pausas longas e imprevisíveis de Garbage Collection (GC) e o gigantesco overhead de tamanho dos objetos Java.',
        'O limite de 100 usuários simultâneos.',
      ],
      correctIndex: 2,
      explanation: 'Objetos Java comuns carregam cabeçalhos pesados e sobrecarregam o Garbage Collector ao processar bilhões de registros. O Tungsten guarda dados em bytes binários compactos fora da pilha do GC.',
    },
  },
  {
    id: 41,
    sectionId: 3,
    name: 'Joins',
    tagline: 'Broadcast Hash Join, Shuffle Hash Join, Sort-Merge Join: estratégias que ditam o custo da união.',
    difficulty: 'Intermediário',
    overview: 'Em sistemas distribuídos, a junção de duas tabelas (JOIN) pode ser executada por estratégias muito distintas dependendo do tamanho das tabelas e da presença de ordenação prévia.',
    whyItMatters: 'Escolher a estratégia errada de JOIN pode fazer uma consulta demorar 2 horas em vez de 10 segundos, ou derrubar o cluster com OutOfMemory durante o shuffle.',
    underTheHood: '1) **Broadcast Hash Join (BHJ)**: Quando uma das tabelas é pequena (< 10MB default), o driver envia uma cópia integral para a memória de cada executor. Zero shuffle na tabela grande! 2) **Shuffle Hash Join (SHJ)**: Ambas as tabelas são shuffladas pela chave e a menor vira uma tabela hash em memória no executor. 3) **Sort-Merge Join (SMJ)**: Padrão para duas tabelas gigantes: dados são shufflados, ordenados em disco/memória e mesclados linearmente sem risco de estouro de memória.',
    realWorldExample: 'Juntar uma tabela de 500 milhões de pedidos com uma tabela de 10 categorias de produtos: usando BHJ, o job roda em 15 segundos.',
    codeSnippet: {
      language: 'python',
      title: 'Forçando Broadcast Join no Spark',
      code: `from pyspark.sql.functions import broadcast

# Aumentando o limite para broadcast automático para 50MB
spark.conf.set("spark.sql.autoBroadcastJoinThreshold", 50 * 1024 * 1024)

# Forçando explicitamente via hint
df_resultado = df_grande.join(broadcast(df_dimensao_pequena), "categoria_id")`,
    },
    antiPatterns: ['Tentar fazer broadcast de tabelas com múltiplos gigabytes, estourando a memória RAM do Driver na fase de coleta.'],
    bestPractices: ['Priorize Broadcast Hash Join sempre que uma das tabelas couber tranquilamente na memória dos executores.'],
    relatedIds: [35, 36, 42, 50],
    quiz: {
      question: 'Qual é o requisito principal para que o Spark possa utilizar um Broadcast Hash Join (BHJ)?',
      options: [
        'Uma das tabelas deve ser pequena o suficiente para caber na memória RAM de cada nó executor sem sobrecarregar a rede.',
        'Ambas as tabelas precisam ter mais de 1 bilhão de linhas.',
        'As tabelas não podem ter chaves de junção.',
        'O cluster precisa ter apenas 1 nó.',
      ],
      correctIndex: 0,
      explanation: 'No BHJ, a tabela menor é copiada integralmente para todos os executores, eliminando o Shuffle da tabela gigante.',
    },
  },
  {
    id: 42,
    sectionId: 3,
    name: 'Skew Handling',
    tagline: 'O terror da task lenta: 99% das tarefas terminam em 5 segundos e uma fica travada por 2 horas.',
    difficulty: 'Avançado',
    overview: 'Data Skew (assimetria de dados) ocorre quando os dados não estão uniformemente distribuídos entre as chaves de partição, fazendo com que uma única chave hiperfrequente (hot key) concentre a imensa maioria dos registros.',
    whyItMatters: 'Em um cluster de 100 máquinas, o tempo total do job é ditado pela máquina mais lenta ("the slowest task problem"). Um único cliente ou valor nulo pode concentrar 80% do trabalho.',
    underTheHood: 'Técnicas de resolução: 1) **Salting**: adiciona um sufixo aleatório (`chave_0`, `chave_1`, ..., `chave_N`) para espalhar a hot key entre N partições diferentes e depois junta; 2) **Adaptive Query Execution (AQE)**: o Spark 3+ detecta partições assimétricas no runtime e as fatia automaticamente em sub-partições menores.',
    realWorldExample: 'Em uma rede social, o perfil de um influenciador com 100 milhões de seguidores gera skew massivo em comparação a usuários comuns com 200 seguidores.',
    codeSnippet: {
      language: 'python',
      title: 'Técnica de Salting para eliminar Skew no PySpark',
      code: `from pyspark.sql.functions import concat, lit, rand, floor

# 1. Adiciona um número aleatório (sal) de 0 a 9 na tabela enviesada
df_skewed = df_pedidos.withColumn("salt", floor(rand() * 10))
df_skewed = df_skewed.withColumn("salted_key", concat("cliente_id", lit("_"), "salt"))

# 2. Na tabela menor, duplica os registros 10 vezes (uma cópia para cada sal)
# 3. Faz o join usando a 'salted_key', espalhando o trabalho em 10 partições balanceadas!`,
    },
    antiPatterns: ['Ignorar valores NULL ou valores padrão como "00000000000" na chave de join, fazendo todas as linhas sem cliente irem para o mesmo executor.'],
    bestPractices: ['Ative `spark.sql.adaptive.skewJoin.enabled = true` para mitigar a maioria dos casos de forma transparente.'],
    relatedIds: [32, 35, 41, 50],
    quiz: {
      question: 'O que caracteriza visualmente o problema de Data Skew na interface do Spark (Spark UI)?',
      options: [
        'Todas as tarefas usam exatamente o mesmo tempo de CPU.',
        'O número de partições se torna negativo.',
        'Quase todas as tarefas do estágio concluem rapidamente, mas uma ou poucas tarefas demoram ordens de grandeza a mais.',
        'O Spark se recusa a compilar o código.',
      ],
      correctIndex: 2,
      explanation: 'O sintoma clássico de Data Skew é ver 199 tarefas terminando em segundos e a tarefa 200 processando 90% dos dados sozinha por horas.',
    },
  },
  {
    id: 43,
    sectionId: 3,
    name: 'Repartition vs Coalesce',
    tagline: 'Aumentar ou diminuir partições: com shuffle pesado ou com fusão estreita e eficiente.',
    difficulty: 'Intermediário',
    overview: '`repartition()` e `coalesce()` controlam a quantidade de partições de um DataFrame. `repartition()` realiza um Full Shuffle pela rede para redistribuir dados uniformemente (pode aumentar ou diminuir). `coalesce()` apenas mescla partições existentes no mesmo nó sem shuffle (só pode diminuir).',
    whyItMatters: 'Usar `repartition()` quando você só queria salvar menos arquivos gera tráfego de rede gigantesco desnecessário. Usar `coalesce()` para diminuir de 1.000 para 2 partições antes de um filtro pode derrubar o paralelismo de todo o estágio anterior.',
    underTheHood: '`coalesce()` usa uma dependência Narrow: nós vizinhos combinam suas partições locais sem passar pela fase de map-shuffle. Já `repartition()` usa Round-Robin ou Hash partitioning com Shuffle Dependency.',
    realWorldExample: 'Após filtrar 99% das linhas de um dataset, sobram 200 partições quase vazias. Usar `coalesce(5)` antes de gravar consolida a saída em 5 arquivos sem custo de rede.',
    codeSnippet: {
      language: 'python',
      title: 'Uso correto de Repartition vs Coalesce',
      code: `# 1. DIMINUIR partições após filtro (RÁPIDO, sem shuffle):
df_filtrado = df_grande.filter("status = 'ERRO'").coalesce(4)

# 2. AUMENTAR paralelismo para alimentar mais cores (exige repartition com shuffle):
df_mais_paralelo = df_pequeno.repartition(64)

# 3. REPARTICIONAR por chave de negócio para escrita física organizada:
df.repartition("departamento").write.parquet("s3://lake/departamentos/")`,
    },
    antiPatterns: ['Usar `coalesce(1)` em datasets de 500GB, forçando 1 única máquina a processar tudo e estourando a memória.'],
    bestPractices: ['Prefira `coalesce` para diminuir partições na escrita final de arquivos e `repartition` quando precisar balancear dados por chave.'],
    relatedIds: [21, 30, 32, 35],
    quiz: {
      question: 'Qual é a diferença fundamental entre df.coalesce(N) e df.repartition(N)?',
      options: [
        'coalesce() pode aumentar o número de partições sem limites.',
        'coalesce() apenas mescla partições existentes para baixo sem Shuffle de rede; repartition() realiza um Shuffle completo e pode aumentar ou diminuir partições.',
        'repartition() é gratuito e coalesce() é pago na nuvem.',
        'Não há diferença alguma.',
      ],
      correctIndex: 1,
      explanation: 'O coalesce evita a fase cara de Shuffle ao apenas agrupar partições locais, enquanto repartition redistribui os dados completamente via rede.',
    },
  },
  {
    id: 44,
    sectionId: 3,
    name: 'Caching',
    tagline: 'Armazene DataFrames reutilizados na memória para não recomputar o DAG do zero a cada ação.',
    difficulty: 'Intermediário',
    overview: 'Caching (`.cache()` ou `.persist()`) armazena os dados intermediários de um DataFrame na memória RAM dos executores ou em disco após a primeira vez em que ele for computado.',
    whyItMatters: 'Se você usar o mesmo DataFrame transformado para treinar 3 modelos de machine learning e rodar 2 agregações, sem cache o Spark vai reler os arquivos do storage e reexecutar todo o DAG 5 vezes!',
    underTheHood: '`.cache()` usa por padrão o nível `MEMORY_AND_DISK_DESER` (deserializado na memória; se não couber, joga o excedente em disco). `.persist()` permite escolher `StorageLevel` finos, como `MEMORY_ONLY_SER` (serializado para caber 3x mais dados na RAM).',
    realWorldExample: 'Algoritmos iterativos de grafos (PageRank) ou gradient descent que passam pelos mesmos dados 50 vezes.',
    codeSnippet: {
      language: 'python',
      title: 'Uso de Cache e Persist com Liberação de Memória',
      code: `from pyspark.storagelevel import StorageLevel

# Carrega e aplica limpeza pesada
df_limpo = df_raw.filter("valido = true").join(df_dim, "id")

# Marca para cache na RAM de forma serializada (mais compacto)
df_limpo.persist(StorageLevel.MEMORY_AND_DISK_SER)

# Múltiplas ações reutilizam o resultado em memória:
qtd = df_limpo.count()
soma = df_limpo.agg({"valor": "sum"}).collect()

# CRUCIAL: Liberar a memória quando não for mais usar!
df_limpo.unpersist()`,
    },
    antiPatterns: ['Chamar `.cache()` em tudo cegamente, enchendo a RAM dos executores e forçando Garbage Collection agressivo ou eviction de blocos.'],
    bestPractices: ['Sempre execute `.unpersist()` ao terminar de usar os DataFrames cacheados.'],
    relatedIds: [37, 45, 46],
    quiz: {
      question: 'O que acontece se você chamar df.cache() mas nunca invocar uma Ação (como count() ou write()) no código?',
      options: [
        'O computador trava imediatamente.',
        'O Spark avisa a equipe por e-mail.',
        'O cache consome toda a memória do disco.',
        'Nada é colocado no cache, pois o Spark é preguiçoso (Lazy Evaluation) e só computa e armazena os dados quando uma ação for chamada.',
      ],
      correctIndex: 3,
      explanation: 'O método .cache() apenas marca o DataFrame para persistência. Os dados só são realmente carregados na memória quando uma Ação exigir o processamento.',
    },
  },
  {
    id: 45,
    sectionId: 3,
    name: 'Memory Mgmt',
    tagline: 'Gestão Unificada de Memória: equilibrando execução de shuffles com espaço para caches.',
    difficulty: 'Avançado',
    overview: 'A Unified Memory Management do Spark divide a memória da JVM do executor dinamicamente entre duas piscinas principais: Execution Memory (para shuffles, joins e agregações) e Storage Memory (para caching de DataFrames e broadcast variables).',
    whyItMatters: 'Compreender como a memória é fatiada é o único jeito de diagnosticar e resolver erros clássicos de `OutOfMemoryError: Java heap space` ou `Container killed by YARN for exceeding memory limits`.',
    underTheHood: 'Geralmente 60% da heap é reservada para a Memória Spark (`spark.memory.fraction = 0.6`). Dentro dela, uma fronteira dinâmica permite que Execution pegue espaço emprestado de Storage se houver sobra. Se Execution precisar de memória, ela pode forçar Storage a despejar blocos de cache para o disco!',
    realWorldExample: 'Configurar clusters onde um job de Machine Learning precisa de 70% de Storage para cache, enquanto um job de ETL pesado com joins exige 80% de Execution.',
    codeSnippet: {
      language: 'python',
      title: 'Configuração dos Parâmetros de Memória no Spark',
      code: `# Proporção da heap dedicada a execução e storage (default 0.6)
spark.conf.set("spark.memory.fraction", "0.7")

# Fração de storage imune a ser despejada por execução (default 0.5)
spark.conf.set("spark.memory.storageFraction", "0.3")

# Overhead de memória fora da JVM para buffers de rede / C++ (PySpark):
spark.conf.set("spark.executor.memoryOverhead", "2g")`,
    },
    antiPatterns: ['Aumentar cegamente a heap Java para 120GB em um único executor, criando pausas de Garbage Collection de vários minutos que causam timeout do heartbeat.'],
    bestPractices: ['Mantenha executores com tamanho médio saudável (entre 16GB a 32GB de RAM e 4 a 5 cores).'],
    relatedIds: [40, 44, 46, 48],
    quiz: {
      question: 'O que acontece quando a Execution Memory (necessária para Joins e Shuffles) precisa de mais espaço e a Storage Memory está cheia de DataFrames cacheados?',
      options: [
        'O Spark desliga imediatamente com erro fatal.',
        'O job congela até o usuário comprar mais memória.',
        'A Execution Memory tem prioridade e pode forçar o despejo (eviction) dos blocos de cache da Storage Memory para o disco.',
        'O Spark ignora o join e continua sem dados.',
      ],
      correctIndex: 2,
      explanation: 'No modelo unificado do Spark, a memória de execução tem prioridade sobre o cache: blocos de storage são despejados para o disco para que as tarefas ativas consigam concluir suas agregações e joins.',
    },
  },
  {
    id: 46,
    sectionId: 3,
    name: 'Spill to Disk',
    tagline: 'A válvula de escape que salva seu job do OOM, mas derruba a velocidade ao chão.',
    difficulty: 'Avançado',
    overview: 'Spill to Disk (Despejo para Disco) ocorre quando as estruturas em memória de uma tarefa (tabelas hash de agregação ou buffers de ordenação de shuffle) excedem a RAM disponível e o Spark é obrigado a serializar e gravar blocos intermediários no disco local da máquina.',
    whyItMatters: 'O Spill impede que o job quebre com erro de OutOfMemory (OOM), atuando como salva-vidas. Contudo, a velocidade despenca: ler e gravar em disco é ordens de grandeza mais lento do que operar na RAM.',
    underTheHood: 'Na Spark UI, o Spill é reportado em dois números: "Spill (Memory)" (o tamanho que os dados ocupavam descompactados na RAM) e "Spill (Disk)" (o tamanho compactado gravado no disco). Se você ver dezenas de gigabytes de spill, suas tarefas estão com subalocação crítica de memória por partição.',
    realWorldExample: 'Um job de agregação que rodava em 3 minutos passa a demorar 45 minutos porque os dados cresceram e 80GB de shuffle sofreram Spill para o disco.',
    codeSnippet: {
      language: 'python',
      title: 'Identificando e Corrigindo Spill to Disk',
      code: `# Sintoma: Alto Spill na Spark UI durante Shuffle / Agregação
# Causa: Partições grandes demais para a RAM do core de CPU

# Solução 1: Aumentar o número de partições para que cada uma fique menor
spark.conf.set("spark.sql.shuffle.partitions", "800")

# Solução 2: Aumentar a memória por core do executor
# spark.executor.memory = 32g com spark.executor.cores = 4 (8GB por core)`,
    },
    antiPatterns: ['Normalizar a presença de centenas de gigabytes de Spill no dashboard como se fosse operação saudável.'],
    bestPractices: ['Aumente o número de partições ou a memória por slot de CPU sempre que detectar métricas de Spill relevantes na UI.'],
    relatedIds: [35, 42, 45, 48],
    quiz: {
      question: 'Por que o Spill to Disk é considerado um alerta de desempenho sério, embora não derrube o job?',
      options: [
        'Porque a velocidade de I/O em disco é muito inferior à da memória RAM, aumentando expressivamente o tempo total de execução.',
        'Porque ele apaga os arquivos do S3.',
        'Porque invalida as licenças do software.',
        'Porque obriga a trocar os processadores.',
      ],
      correctIndex: 0,
      explanation: 'O Spill salva a tarefa da morte por OOM, mas pagar o preço de serializar, gravar em disco e reler posteriormente transforma operações milissegundas em minutos de espera de I/O.',
    },
  },
  {
    id: 47,
    sectionId: 3,
    name: 'Driver vs Executor',
    tagline: 'O maestro e a orquestra: entenda quem planeja a execução e quem realmente carrega o piano.',
    difficulty: 'Iniciante',
    overview: 'No Apache Spark, o **Driver** é o processo central que coordena a aplicação (mantém a sessão, analisa o código, gera o DAG e agenda tarefas). Os **Executors** são processos trabalhadores (workers) distribuídos nos nós do cluster que executam as tarefas físicas e armazenam dados em cache.',
    whyItMatters: 'Compreender essa divisão evita o erro mais cometido por iniciantes: tentar trazer terabytes de dados para o Driver com `.collect()`, derrubando o nó mestre.',
    underTheHood: 'O Driver roda a função `main()` do programa e conversa com o Cluster Manager (Kubernetes, YARN) para solicitar executores. O Driver despacha as Tasks (`TaskRunner`) para os executores via RPC (Akka/Netty) e coleta apenas resumos de status e métricas.',
    realWorldExample: 'Em um cluster com 1 Driver (8GB RAM) e 50 Executors (32GB RAM cada): os 50 executores processam 500GB de logs em paralelo e enviam apenas um número final (ex: total = 42) de volta ao Driver.',
    codeSnippet: {
      language: 'python',
      title: 'O perigo do collect() no Driver',
      code: `# ERRADO: Tenta puxar 100 milhões de registros para a RAM do Driver
# lista_pedidos = df_100_milhoes.collect() # FATAL: Driver OutOfMemory!

# CORRETO: Deixa a computação distribuída nos executores
df_agregado = df_100_milhoes.groupBy("categoria").count()

# Traz para o driver apenas o resultado sumarizado pequeno (ex: 20 linhas):
resultado_final = df_agregado.collect()`,
    },
    antiPatterns: ['Usar Pandas puro ou loops de Python esperando que eles rodem em paralelo nos executores; código Python comum roda apenas na CPU única do Driver!'],
    bestPractices: ['Mantenha a memória do Driver calibrada e nunca use `.collect()` em datasets cujo tamanho você não conheça com certeza absoluta.'],
    relatedIds: [31, 32, 48, 49],
    quiz: {
      question: 'Qual é a principal responsabilidade do processo Driver no Apache Spark?',
      options: [
        'Armazenar todos os terabytes de dados do cluster no seu disco rígido.',
        'Substituir o provedor de computação em nuvem.',
        'Executar tarefas de compilação de vídeo.',
        'Analisar o código, otimizar o plano no Catalyst, coordenar o DAG de execução e agendar tarefas para os executores.',
      ],
      correctIndex: 3,
      explanation: 'O Driver é o cérebro/maestro da aplicação Spark: ele traduz seu código em estágios e tarefas, gerencia a linhagem e comanda os executores que farão o trabalho pesado.',
    },
  },
  {
    id: 48,
    sectionId: 3,
    name: 'Cluster Sizing',
    tagline: 'Dimensionamento cirúrgico: a fórmula de ouro para memória, cores e nós sem desperdiçar dinheiro.',
    difficulty: 'Avançado',
    overview: 'Cluster Sizing é a ciência de calcular a quantidade exata de nós, CPUs por executor, memória RAM e limites de overhead necessários para rodar cargas de trabalho com eficiência máxima sem pagar por recursos ociosos.',
    whyItMatters: 'Clusters mal dimensionados geram custos astronômicos na nuvem (superdimensionamento) ou falhas crônicas de OOM e pausas de Garbage Collection (subdimensionamento).',
    underTheHood: 'A regra empírica da indústria para nós Spark: 1) Reserve 1 core e 1GB de RAM por máquina física para o sistema operacional e daemon do YARN/K8s; 2) Aloque **4 a 5 cores por executor** (acima de 5 cores o Garbage Collection degrada; com 1 core perde-se o benefício de compartilhamento de memória); 3) Divida a RAM restante proporcionalmente, separando ~10% para `executor.memoryOverhead`.',
    realWorldExample: 'Para uma instância de 16 vCPUs e 64GB de RAM: configure 3 executores por nó, cada um com 5 cores e ~19GB de RAM (17GB heap + 2GB overhead).',
    codeSnippet: {
      language: 'bash',
      title: 'Configurações de Sizing em linha de comando (spark-submit)',
      code: `spark-submit \\
  --master yarn \\
  --deploy-mode cluster \\
  --num-executors 20 \\
  --executor-cores 4 \\
  --executor-memory 16G \\
  --conf spark.executor.memoryOverhead=2G \\
  --driver-cores 4 \\
  --driver-memory 8G \\
  meu_job_spark.py`,
    },
    antiPatterns: ['Configurar executores "Tiny" de 1 único core ou executores "Fat" de 32 cores e 128GB de RAM.'],
    bestPractices: ['Padronize executores com 4 ou 5 cores e dimensione a quantidade de instâncias através de auto-scaling / Dynamic Allocation.'],
    relatedIds: [45, 47, 49, 97, 98],
    quiz: {
      question: 'Por que a maioria dos especialistas em Spark recomenda configurar entre 4 e 5 cores por executor?',
      options: [
        'Porque processadores não aceitam números pares.',
        'Porque mais de 5 cores por executor leva a sobrecarga e pausas excessivas de Garbage Collection (GC) da JVM, enquanto 1 único core perde eficiência de cache e pools de conexão compartilhados.',
        'Porque o Spark é programado para desligar se ver 6 cores.',
        'Porque a licença proíbe mais de 5 cores.',
      ],
      correctIndex: 1,
      explanation: 'O ponto de equilíbrio ótimo entre concorrência de I/O e tempo gasto em pausas de Garbage Collection na JVM fica tradicionalmente na faixa de 4 a 5 vCPUs por executor.',
    },
  },
  {
    id: 49,
    sectionId: 3,
    name: 'Resource Allocation',
    tagline: 'Alocação dinâmica e filas de prioridade: escale executores sob demanda e evite cluster ocioso.',
    difficulty: 'Avançado',
    overview: 'Alocação de Recursos gerencia como CPU e memória são concedidos às aplicações ao longo do tempo. Com Dynamic Allocation, o Spark solicita novos executores ao cluster manager quando há fila de tarefas pendentes e devolve executores ociosos quando o trabalho diminui.',
    whyItMatters: 'Evita pagar por um cluster de 100 máquinas que passa 80% do dia esperando uma query ser disparada. O cluster cresce e encolhe elasticamente de acordo com a carga real de trabalho.',
    underTheHood: 'Utiliza o External Shuffle Service ou shuffle tracking nativo no Kubernetes para garantir que, quando um executor ocioso for desligado, os arquivos intermediários de shuffle que ele produziu não sejam perdidos.',
    realWorldExample: 'Um pipeline de streaming que opera com 4 executores de madrugada e escala automaticamente para 40 executores na Black Friday.',
    codeSnippet: {
      language: 'python',
      title: 'Habilitando Alocação Dinâmica no Spark',
      code: `spark.conf.set("spark.dynamicAllocation.enabled", "true")
spark.conf.set("spark.dynamicAllocation.minExecutors", "2")
spark.conf.set("spark.dynamicAllocation.maxExecutors", "50")
spark.conf.set("spark.dynamicAllocation.executorIdleTimeout", "60s")
# Permite rastrear shuffles sem precisar de daemon externo no K8s:
spark.conf.set("spark.dynamicAllocation.shuffleTracking.enabled", "true")`,
    },
    antiPatterns: ['Fixar número estático gigante de executores para jobs que rodam em 30 segundos, bloqueando recursos de outros times no cluster.'],
    bestPractices: ['Configure limites máximos rigorosos (`maxExecutors`) para evitar surpresas na fatura da nuvem em loops infinitos.'],
    relatedIds: [47, 48, 97, 98],
    quiz: {
      question: 'O que o recurso de Dynamic Allocation do Apache Spark faz quando uma aplicação fica sem tarefas para rodar?',
      options: [
        'Desliga todo o datacenter da nuvem.',
        'Libera gradualmente os executores ociosos de volta para o cluster manager, reduzindo o consumo de recursos e custos.',
        'Reinicia o computador do usuário.',
        'Apaga os dados processados.',
      ],
      correctIndex: 1,
      explanation: 'A alocação dinâmica devolve nós ociosos quando não há tarefas ativas e requisita novos quando a fila acumula, garantindo elasticidade financeira e operacional.',
    },
  },
  {
    id: 50,
    sectionId: 3,
    name: 'Optimization',
    tagline: 'O checklist do engenheiro sênior: AQE, Predicate Pushdown, Broadcast e Pruning combinados.',
    difficulty: 'Avançado',
    overview: 'Otimização no ecossistema Spark e sistemas distribuídos envolve um conjunto integrado de técnicas arquiteturais e configurações de tempo de execução que transformam pipelines caros e instáveis em execuções rápidas e resilientes.',
    whyItMatters: 'Em empresas de tecnologia, otimizar queries e pipelines de dados frequentemente reduz faturas de nuvem de US$ 100.000 para US$ 30.000 por mês, além de viabilizar SLAs de minutos em vez de horas.',
    underTheHood: 'Principais alavancas de otimização: 1) **Adaptive Query Execution (AQE)**: recalcula o plano físico em tempo de execução com base no tamanho real das estatísticas de shuffle; 2) **Partition Pruning**: não ler diretórios desnecessários; 3) **Predicate Pushdown**: filtrar na origem; 4) **Evitar UDFs Python puras**: usar PySpark nativo ou Pandas/Arrow Vectorized; 5) **Broadcast Joins**: eliminar shuffles em tabelas pequenas.',
    realWorldExample: 'Migrar um pipeline legado do Spark 2 para o Spark 3 com AQE ativado: tempo total cai de 55 minutos para 12 minutos sem alterar uma linha de lógica de negócio.',
    codeSnippet: {
      language: 'python',
      title: 'Habilitando a tríade de ouro do AQE no Spark 3+',
      code: `# Ativa o Adaptive Query Execution completo
spark.conf.set("spark.sql.adaptive.enabled", "true")

# 1. Coalesce automático de partições de shuffle (elimina small files):
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")

# 2. Converte joins comuns para Broadcast Join em runtime se a tabela for pequena:
spark.conf.set("spark.sql.adaptive.autoBroadcastJoinThreshold", "30MB")

# 3. Corrige automaticamente Data Skew dividindo partições gigantes:
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")`,
    },
    antiPatterns: ['Tentar otimizar código "no escuro" sem inspecionar o plano de execução (`df.explain()`) e os gargalos na Spark UI.'],
    bestPractices: ['Ative sempre o Adaptive Query Execution (AQE) como padrão em qualquer cluster moderno de Spark.'],
    relatedIds: [35, 39, 41, 42, 43],
    quiz: {
      question: 'O que o Adaptive Query Execution (AQE) do Spark 3+ faz de diferente dos otimizadores tradicionais?',
      options: [
        'Ele reescreve seu código Python em JavaScript.',
        'Ele substitui o banco de dados por arquivos de texto.',
        'Ele impede que o usuário veja os erros.',
        'Ele adapta e re-otimiza o plano de execução dinamicamente durante a execução com base nas estatísticas reais de dados geradas em cada estágio intermediário.',
      ],
      correctIndex: 3,
      explanation: 'Enquanto otimizadores antigos planejavam tudo estaticamente antes de rodar, o AQE para entre estágios de shuffle, mede o tamanho real das partições e ajusta o plano físico dinamicamente.',
    },
  },
];
