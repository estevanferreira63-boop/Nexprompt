import { Concept } from '../../types/concept';

export const SECTION_5_CONCEPTS: Concept[] = [
  {
    id: 61,
    sectionId: 5,
    name: 'Delta Lake',
    tagline: 'O pioneiro dos formatos de tabela aberta ACID: Delta Log com transações atômicas e Parquet.',
    difficulty: 'Intermediário',
    overview: 'Delta Lake é um formato de armazenamento de código aberto mantido pela Linux Foundation (criado originalmente pela Databricks) que adiciona transações ACID, controle de versão (Time Travel) e gerenciamento de metadados escalável sobre arquivos Apache Parquet.',
    whyItMatters: 'Transformou buckets estáticos do S3/ADLS em verdadeiras tabelas de banco de dados relacionais onde é possível fazer UPDATE, DELETE e MERGE sem corromper leituras simultâneas.',
    underTheHood: 'Utiliza uma pasta `_delta_log/` contendo arquivos de commit JSON ordenados (`000000.json`, `000001.json`). A cada 10 commits, consolida um arquivo de checkpoint em Parquet. O leitor reconstrói o estado atual da tabela em milissegundos lendo apenas os logs atômicos.',
    realWorldExample: 'Databricks, Walmart, Apple e centenas de grandes corporações utilizando Delta Lake como padrão central de seus Lakehouses.',
    labType: 'time-travel',
    codeSnippet: {
      language: 'sql',
      title: 'Comandos ACID nativos no Delta Lake',
      code: `-- Criação e atualização atômica no Delta Lake
CREATE TABLE clientes_delta (
  id BIGINT,
  nome STRING,
  email STRING,
  ativo BOOLEAN
) USING DELTA;

-- Operação de UPDATE em arquivos no S3/GCS!
UPDATE clientes_delta SET ativo = false WHERE email LIKE '%@spam.com';`,
    },
    antiPatterns: ['Deletar arquivos `.parquet` diretamente no bucket da nuvem sem usar comandos Delta, quebrando a integridade do Delta Log.'],
    bestPractices: ['Execute rotinas regulares de `OPTIMIZE` e `VACUUM` para manter a saúde e velocidade das tabelas.'],
    relatedIds: [9, 24, 64, 65, 66, 69, 70],
    quiz: {
      question: 'Como o Delta Lake rastreia quais arquivos Parquet pertencem à versão mais recente da tabela?',
      options: [
        'Ele consulta o log de transações ordenado na pasta _delta_log/ que registra commits atômicos de adição e remoção de arquivos.',
        'Ele faz uma varredura física completa em todas as subpastas a cada consulta.',
        'Ele grava as informações no registro do Windows.',
        'Ele envia um e-mail para os administradores.',
      ],
      correctIndex: 0,
      explanation: 'O Delta Log mantém um histórico atômico de adições e remoções de arquivos Parquet. O motor lê apenas o log para saber instantaneamente quais arquivos compõem o snapshot atual.',
    },
  },
  {
    id: 62,
    sectionId: 5,
    name: 'Iceberg',
    tagline: 'Apache Iceberg: o padrão aberto da Netflix com árvores de snapshots e particionamento oculto.',
    difficulty: 'Intermediário',
    overview: 'Apache Iceberg é um formato de tabela de alto desempenho projetado originalmente pela Netflix para resolver limitações históricas do Apache Hive em tabelas com petabytes de dados em nuvem.',
    whyItMatters: 'Oferece suporte multi-motor extraordinário (Snowflake, Spark, Trino, Flink, StarRocks lêem a mesma tabela Iceberg nativamente) e Partition Evolution sem necessidade de reescrever a tabela.',
    underTheHood: 'Estrutura hierárquica em árvore: 1) Iceberg Catalog aponta para o Metadata File atual; 2) Metadata File aponta para a Snapshot Tree; 3) Cada Snapshot aponta para um Manifest List; 4) Manifest List aponta para Manifest Files que listam os Data Files com métricas colunares completas.',
    realWorldExample: 'Netflix e Apple migrando centenas de petabytes de dados do Hive para o Iceberg, reduzindo tempos de planejamento de queries de dezenas de minutos para centenas de milissegundos.',
    codeSnippet: {
      language: 'sql',
      title: 'Particionamento Oculto (Hidden Partitioning) no Iceberg',
      code: `-- No Iceberg você não precisa criar colunas artificiais como 'ano' e 'mes'!
CREATE TABLE logs_eventos (
  evento_id STRING,
  usuario_id BIGINT,
  dados STRING,
  ts TIMESTAMP
) USING ICEBERG
PARTITIONED BY (hours(ts)); -- O Iceberg calcula e oculta a partição automaticamente!

-- O usuário consulta normalmente sem saber como está particionado:
SELECT * FROM logs_eventos WHERE ts >= TIMESTAMP '2026-10-05 08:00:00';`,
    },
    antiPatterns: ['Pensar que precisa criar partições manuais com strings duplicadas, desrespeitando o Hidden Partitioning do Iceberg.'],
    bestPractices: ['Utilize Iceberg quando seu ecossistema corporativo exigir que múltiplos motores analíticos concorrentes (ex: Snowflake + Trino + Spark) operem sobre a mesma tabela.'],
    relatedIds: [9, 21, 26, 61, 64],
    quiz: {
      question: 'O que é o "Hidden Partitioning" (Particionamento Oculto) do Apache Iceberg?',
      options: [
        'As partições são criptografadas com senha militar e ninguém pode ler.',
        'As pastas ficam escondidas pelo sistema operacional.',
        'O usuário não precisa criar nem gerenciar colunas artificiais de partição; o Iceberg deriva as partições a partir dos dados originais e poda arquivos automaticamente em filtros WHERE.',
        'Partições que só funcionam à noite.',
      ],
      correctIndex: 2,
      explanation: 'O Hidden Partitioning liberta os analistas de precisarem saber se a tabela é particionada por dia, mês ou hora: basta filtrar pela coluna de timestamp original que o Iceberg cuida do pruning.',
    },
  },
  {
    id: 63,
    sectionId: 5,
    name: 'Hudi',
    tagline: 'Apache Hudi: o pioneiro em Upserts rápidos e streaming contínuo no Data Lake.',
    difficulty: 'Intermediário',
    overview: 'Apache Hudi (Hadoop Upserts Deletes and Incrementals) foi criado pela Uber para gerenciar petabytes de dados de telemetria e corridas com altíssima taxa de mutabilidade e ingestão streaming em tempo real.',
    whyItMatters: 'Oferece dois tipos poderosos de tabela: Copy-on-Write (otimizado para leitura rápida com reescrita síncrona) e Merge-on-Read (otimizado para escrita rápida em streaming, combinando logs append com arquivos base).',
    underTheHood: 'Na arquitetura Merge-on-Read (MoR), novos deltas e updates são gravados instantaneamente em arquivos de log compactos em formato Avro. Leitores que precisam dos dados mais recentes (Near Real-Time) mesclam os deltas em memória durante a leitura.',
    realWorldExample: 'Uber atualizando status de viagens, ratings de passageiros e coordenadas GPS com ingestão contínua em escala global.',
    codeSnippet: {
      language: 'python',
      title: 'Configuração de Ingestão Upsert com Apache Hudi',
      code: `hudi_options = {
  'hoodie.table.name': 'viagens_uber',
  'hoodie.datasource.write.recordkey.field': 'viagem_id',
  'hoodie.datasource.write.table.type': 'MERGE_ON_READ',
  'hoodie.datasource.write.operation': 'upsert',
  'hoodie.datasource.write.precombine.field': 'timestamp_atualizacao'
}

df_novos_status.write.format("hudi") \\
    .options(**hudi_options) \\
    .mode("append") \\
    .save("s3://lake/viagens_uber")`,
    },
    antiPatterns: ['Usar Copy-on-Write para tabelas que recebem 50.000 updates por segundo, provocando reescrita massiva contínua de arquivos Parquet.'],
    bestPractices: ['Utilize Merge-on-Read para ingestão de alta frequência e configure compaction assíncrona em background.'],
    relatedIds: [9, 15, 61, 62, 66],
    quiz: {
      question: 'Qual é a diferença entre as tabelas Copy-on-Write (CoW) e Merge-on-Read (MoR) no Apache Hudi?',
      options: [
        'CoW só aceita textos e MoR só aceita números.',
        'CoW reescreve arquivos Parquet inteiros a cada alteração (otimizando leitura posterior), enquanto MoR grava updates em logs rápidos e mescla na hora da leitura (otimizando velocidade de escrita).',
        'CoW é exclusivo para bancos de dados Oracle.',
        'MoR não suporta transações ACID.',
      ],
      correctIndex: 1,
      explanation: 'Copy-on-Write favorece performance analítica de leitura; Merge-on-Read favorece velocidade brutal de ingestão de escrita em streaming gravando deltas compactos.',
    },
  },
  {
    id: 64,
    sectionId: 5,
    name: 'ACID Lakes',
    tagline: 'Atomicidade, Consistência, Isolamento e Durabilidade aplicados ao armazenamento em nuvem.',
    difficulty: 'Intermediário',
    overview: 'ACID Lakes trazem as quatro propriedades clássicas de bancos de dados transacionais para o Data Lake: Atomicidade (tudo ou nada), Consistência (regras de validação), Isolamento (leitores não vêem escritas incompletas) e Durabilidade (dados confirmados são permanentes).',
    whyItMatters: 'No passado, se um job Spark caísse no meio de uma gravação no S3, o lago ficava com metade dos arquivos gravados, gerando leituras corrompidas e parciais. Com ACID Lakes, operações parciais são descartadas atomicamente.',
    underTheHood: 'Implementado com Serializable Snapshot Isolation (SSI) ou Snapshot Isolation com Optimistic Concurrency Control (OCC). Quando dois nós tentam alterar a mesma tabela simultaneamente, o log de transações valida se houve conflito de arquivos; se não houver conflito, ambos têm sucesso.',
    realWorldExample: 'Um pipeline de folha de pagamento inserindo 100.000 salários: se o nó falhar na linha 99.999, absolutamente nenhum arquivo incompleto fica visível para os relatórios.',
    codeSnippet: {
      language: 'sql',
      title: 'Isolamento de Transações no Lakehouse',
      code: `-- Leitor A consultando a tabela durante um UPDATE pesado do Escritor B:
-- O Leitor A enxerga o snapshot consistente da versão 14 de forma imutável,
-- enquanto o Escritor B grava novos arquivos da versão 15 em paralelo!
SELECT COUNT(*) FROM vendas; -- Sempre consistente, sem leituras sujas (dirty reads)!`,
    },
    antiPatterns: ['Assumir que armazenamento de objetos (S3/GCS) tem garantias ACID por conta própria sem uma camada de tabela como Delta, Iceberg ou Hudi.'],
    bestPractices: ['Entenda o nível de isolamento configurado (Read Committed vs Serializable) para cenários de alta concorrência de escrita.'],
    relatedIds: [9, 61, 62, 65, 66],
    quiz: {
      question: 'O que a propriedade de Atomicidade garante quando uma gravação no Data Lake sofre uma interrupção inesperada no meio do processo?',
      options: [
        'A gravação incompleta permanece visível para quem quiser ver.',
        'Os arquivos são convertidos em áudio.',
        'O computador é formatado.',
        'Ou a operação é concluída integralmente com sucesso, ou é revertida por completo, como se nada tivesse sido escrito.',
      ],
      correctIndex: 3,
      explanation: 'A atomicidade é o princípio do "tudo ou nada": se houver qualquer erro antes do commit final, nenhum registro parcial ou corrompido é disponibilizado aos leitores.',
    },
  },
  {
    id: 65,
    sectionId: 5,
    name: 'Time Travel',
    tagline: 'A máquina do tempo do Lakehouse: consulte ou restaure a tabela em qualquer versão ou data do passado.',
    difficulty: 'Intermediário',
    overview: 'Time Travel (Viagem no Tempo) é a funcionalidade que permite consultar o estado exato de uma tabela em um instante temporal anterior (`TIMESTAMP AS OF`) ou em um número de commit específico (`VERSION AS OF`).',
    whyItMatters: 'Permite reverter erros humanos instantaneamente (ex: um estagiário rodou um `DELETE` sem `WHERE`), reproduzir auditorias regulatórias com os dados exatos do fechamento do trimestre passado e garantir que modelos de Machine Learning sejam treinados em snapshots idênticos.',
    underTheHood: 'Como formatos como Delta Lake e Iceberg usam imutabilidade de arquivos (Copy-on-Write / novos commits adicionam arquivos sem apagar os antigos imediatamente), arquivos de versões passadas continuam no disco até que o comando VACUUM seja executado.',
    realWorldExample: 'Um bug inseriu dados duplicados às 14h: o engenheiro roda `RESTORE TABLE vendas TO TIMESTAMP AS OF "2026-10-05 13:59:00"` e a tabela volta a ficar perfeita em 1 segundo.',
    labType: 'time-travel',
    codeSnippet: {
      language: 'sql',
      title: 'Consultas com Time Travel em Delta Lake / Iceberg',
      code: `-- 1. Consultando como a tabela estava ontem às 18h:
SELECT * FROM clientes TIMESTAMP AS OF '2026-10-04 18:00:00';

-- 2. Consultando uma versão exata do log de transações:
SELECT * FROM clientes VERSION AS OF 42;

-- 3. Restaurando a tabela inteira para o estado da versão 40:
RESTORE TABLE clientes TO VERSION AS OF 40;`,
    },
    antiPatterns: ['Rodar `VACUUM` com retenção de zero horas, apagando todos os snapshots históricos e desativando a capacidade de Time Travel.'],
    bestPractices: ['Configure uma janela de retenção de Time Travel saudável (ex: 7 a 30 dias) para dar margem a auditorias e recuperações de desastre.'],
    relatedIds: [61, 62, 64, 66, 70],
    quiz: {
      question: 'Por que o comando RESTORE TABLE TO VERSION AS OF 10 é praticamente instantâneo em um Lakehouse de terabytes?',
      options: [
        'Porque ele copia todos os terabytes de volta pela internet.',
        'Porque ele usa computação quântica.',
        'Porque ele apenas grava um novo commit no log de transações apontando os metadados de volta para a lista de arquivos da versão 10, sem mover dados físicos.',
        'Porque ele apaga o banco de dados.',
      ],
      correctIndex: 2,
      explanation: 'O Time Travel e o RESTORE são operações puramente em nível de metadados. O sistema apenas atualiza ponteiros atômicos no log de transações em milissegundos.',
    },
  },
  {
    id: 66,
    sectionId: 5,
    name: 'Merge / Upserts',
    tagline: 'Inserir se não existe, atualizar se já existe: a operação essencial para sincronização de dados.',
    difficulty: 'Intermediário',
    overview: 'MERGE (também conhecido como Upsert = Update + Insert) sincroniza duas tabelas com base em uma condição de correspondência (Match). Se o registro já existir, ele é atualizado com novos valores; se for um registro inédito, é inserido; se for marcado para exclusão, é deletado.',
    whyItMatters: 'É a fundação do processamento de CDC (Change Data Capture) e dimensões lentamente mutáveis (SCD Type 1 e Type 2). Sem MERGE, seria necessário recarregar a tabela inteira todos os dias.',
    underTheHood: 'O motor executa um Outer Join entre a tabela de origem (source) e a tabela de destino (target) para identificar linhas modificadas, novas e intocadas. No Delta Lake, reescreve apenas os arquivos Parquet que contêm linhas alteradas e preserva os demais intocados.',
    realWorldExample: 'Sincronizar a base de clientes do Salesforce com o Lakehouse: 10.000 clientes alteraram telefone e 2.000 novos clientes se cadastraram hoje.',
    codeSnippet: {
      language: 'sql',
      title: 'Comando MERGE INTO completo',
      code: `MERGE INTO silver.dim_clientes AS target
USING bronze.staging_clientes AS source
ON target.cliente_id = source.cliente_id
WHEN MATCHED AND source.status_operacao = 'DELETE' THEN
  DELETE
WHEN MATCHED THEN
  UPDATE SET 
    target.nome = source.nome,
    target.email = source.email,
    target.atualizado_em = current_timestamp()
WHEN NOT MATCHED THEN
  INSERT (cliente_id, nome, email, criado_em, atualizado_em)
  VALUES (source.cliente_id, source.nome, source.email, current_timestamp(), current_timestamp());`,
    },
    antiPatterns: ['Executar MERGE sem predicados de particionamento na cláusula ON em tabelas gigantes, forçando o motor a varrer todos os arquivos do lago.'],
    bestPractices: ['Inclua a coluna de partição na cláusula ON (`AND target.data = source.data`) para podar arquivos na busca de correspondência.'],
    relatedIds: [15, 61, 62, 64],
    quiz: {
      question: 'O que o comando MERGE INTO faz quando encontra um registro na origem que NÃO existe na tabela de destino (WHEN NOT MATCHED)?',
      options: [
        'Insere o novo registro na tabela de destino.',
        'Cancela o pipeline com erro.',
        'Apaga o registro da origem.',
        'Converte a tabela em modo somente leitura.',
      ],
      correctIndex: 0,
      explanation: 'A cláusula WHEN NOT MATCHED trata novos registros que chegaram na origem, inserindo-os de forma automática na tabela de destino.',
    },
  },
  {
    id: 67,
    sectionId: 5,
    name: 'Incremental Loads',
    tagline: 'Eficiência energética e financeira: processe apenas os deltas que mudaram desde a última execução.',
    difficulty: 'Iniciante',
    overview: 'Cargas Incrementais (Incremental Loads) processam exclusivamente os dados novos ou alterados desde o último ponto de corte (watermark ou número de commit), em vez de reprocessar o conjunto de dados histórico completo.',
    whyItMatters: 'Processar 5 anos de histórico todos os dias custa caro e demora horas. Processar apenas as 10.000 linhas geradas na última hora roda em 10 segundos e custa centavos.',
    underTheHood: 'Formatos de Lakehouse facilitam isso através do Change Data Feed (CDF) ou rastreamento de commits no log: o leitor pede `readStream` ou `tableChanges` entre o commit 45 e o commit 52, obtendo diretamente a lista exata de registros alterados.',
    realWorldExample: 'Pipeline de reconciliação de pagamentos que lê apenas as transações confirmadas nos últimos 15 minutos via Change Data Feed.',
    codeSnippet: {
      language: 'sql',
      title: 'Habilitando e Lendo Change Data Feed (CDF)',
      code: `-- 1. Habilita o rastreamento incremental fino na tabela:
ALTER TABLE silver_pedidos SET TBLPROPERTIES (delta.enableChangeDataFeed = true);

-- 2. Lê apenas as alterações ocorridas entre os commits 10 e 15:
SELECT * FROM table_changes('silver_pedidos', 10, 15);
-- Retorna colunas de metadados: _change_type ('insert', 'update_preimage', 'update_postimage', 'delete')`,
    },
    antiPatterns: ['Assumir que a tabela sempre cresce sequencialmente por ID numérico, perdendo registros atualizados no passado.'],
    bestPractices: ['Use Change Data Feed ou chaves de timestamp confiáveis com margem de segurança (lookback window) para absorver eventos atrasados.'],
    relatedIds: [10, 15, 18, 61, 66],
    quiz: {
      question: 'Qual é a principal vantagem da carga incremental sobre o Full Refresh diário?',
      options: [
        'Carga incremental não precisa de energia elétrica.',
        'Garante que os dados nunca precisem de backup.',
        'Dispensa o uso de chaves primárias.',
        'Redução drástica de tempo de execução, consumo de CPU, I/O de rede e custos de nuvem ao processar apenas as alterações.',
      ],
      correctIndex: 3,
      explanation: 'Processar apenas o delta novo evita a recomputação redundante de dados históricos estáticos, trazendo eficiência extrema de custo e tempo.',
    },
  },
  {
    id: 68,
    sectionId: 5,
    name: 'Streaming Reads',
    tagline: 'Tabelas como fluxos infinitos: trate seu Lakehouse como se fosse um tópico do Kafka.',
    difficulty: 'Intermediário',
    overview: 'Streaming Reads é a capacidade de ler uma tabela de Lakehouse (Delta Lake, Iceberg) como uma fonte contínua de streaming (`spark.readStream.table(...)`). À medida que novos commits são adicionados na tabela, eles são transmitidos para o consumidor em micro-batches.',
    whyItMatters: 'Unifica o mundo de Streaming e Batch: você pode encadear tabelas Medallion (Bronze -> Silver -> Gold) com pipelines de streaming contínuos usando arquivos estáticos baratos em buckets de nuvem, sem precisar gerenciar um cluster de Kafka intermediário.',
    underTheHood: 'O leitor monitora o diretório de metadados da tabela. Quando um novo commit `0000X.json` aparece, o motor lê os arquivos Parquet associados àquele commit, avança o offset de streaming e grava o checkpoint.',
    realWorldExample: 'Um pipeline onde a tabela Bronze recebe dados via micro-batch e uma leitura de streaming na Silver processa cada novo arquivo instantaneamente.',
    codeSnippet: {
      language: 'python',
      title: 'Streaming Read de uma tabela Delta',
      code: `# Lê a tabela Lakehouse como fonte contínua de streaming
df_streaming = spark.readStream \\
    .format("delta") \\
    .option("ignoreChanges", "true") \\
    .table("lakehouse.bronze_eventos")

# Processa e grava na camada Silver em streaming contínuo:
query = df_streaming.filter("tipo = 'COMPRA'") \\
    .writeStream \\
    .format("delta") \\
    .option("checkpointLocation", "/checkpoints/silver_compras") \\
    .toTable("lakehouse.silver_compras")`,
    },
    antiPatterns: ['Fazer streaming read em tabelas que sofrem UPDATEs e DELETEs frequentes sem configurar o tratamento adequado de alterações (`ignoreChanges` ou CDF).'],
    bestPractices: ['Aproveite Streaming Reads para simplificar a arquitetura de dados substituindo filas de mensageria complexas quando latências de segundos forem aceitáveis.'],
    relatedIds: [10, 12, 13, 61, 67],
    quiz: {
      question: 'O que possibilita que uma tabela Delta Lake ou Apache Iceberg seja consumida via Streaming Read?',
      options: [
        'A tabela é deletada e recriada a cada segundo.',
        'O log de transações atômico e ordenado da tabela permite ao leitor acompanhar novos commits e arquivos adicionados de forma sequencial.',
        'O provedor de nuvem liga para o servidor.',
        'Os arquivos são convertidos para MP3.',
      ],
      correctIndex: 1,
      explanation: 'O log de transações é uma sequência ordenada de commits. O motor de streaming lê esses commits cronologicamente, tratando adições como eventos em um stream.',
    },
  },
  {
    id: 69,
    sectionId: 5,
    name: 'Compaction',
    tagline: 'Bin-packing: empacote centenas de micro-arquivos em blocos colunares perfeitos de 512MB.',
    difficulty: 'Intermediário',
    overview: 'Compaction (Compactação ou Bin-packing) é a manutenção periódica que lê múltiplos arquivos pequenos gerados por gravações em streaming e os reescreve consolidados em um número menor de arquivos Parquet de tamanho ideal (geralmente entre 128MB e 1GB).',
    whyItMatters: 'Resolve de forma definitiva o problema crônico dos "Small Files" no Data Lake, restaurando a velocidade das consultas analíticas e aliviando a memória do driver.',
    underTheHood: 'Executa um commit atômico: os arquivos pequenos são lidos, mesclados e gravados como novos arquivos Parquet maiores. O log de transações registra o `add` dos arquivos novos e o `remove` dos arquivos antigos, garantindo que leituras em andamento não sofram interrupção.',
    realWorldExample: 'No Delta Lake, rodar `OPTIMIZE tabela` semanalmente em tabelas de streaming para fundir 50.000 micro-arquivos em 120 arquivos compactados.',
    labType: 'small-files',
    codeSnippet: {
      language: 'sql',
      title: 'Comando de Compactação (OPTIMIZE) no Lakehouse',
      code: `-- Compacta pequenos arquivos da tabela em arquivos ideais de ~1GB:
OPTIMIZE silver_telemetria;

-- Compactando apenas uma partição específica de dados recentes:
OPTIMIZE silver_telemetria WHERE data >= '2026-10-01';`,
    },
    antiPatterns: ['Rodar compactação a cada 5 segundos em um loop de streaming, gastando mais CPU compactando do que ingerindo dados novos.'],
    bestPractices: ['Agende jobs de compactação automáticos durante horários de menor tráfego ou use Auto-Compaction nativa.'],
    relatedIds: [24, 30, 61, 70],
    quiz: {
      question: 'O que o comando OPTIMIZE / Compaction faz nos arquivos físicos do Lakehouse?',
      options: [
        'Apaga todos os dados da tabela.',
        'Lê os múltiplos arquivos pequenos e os regrava agrupados em arquivos maiores de tamanho ideal, registrando a troca no log de transações.',
        'Aumenta o espaçamento das linhas do código.',
        'Altera a senha do banco.',
      ],
      correctIndex: 1,
      explanation: 'A compactação funde pequenos arquivos dispersos em arquivos consolidados de 128MB a 1GB, melhorando drasticamente o throughput de leitura e a compressão.',
    },
  },
  {
    id: 70,
    sectionId: 5,
    name: 'Vacuum',
    tagline: 'A faxina da nuvem: remova arquivos obsoletos antigos e economize milhares de dólares em storage.',
    difficulty: 'Intermediário',
    overview: 'VACUUM é o processo de limpeza e expurgo físico de arquivos de dados que foram marcados como obsoletos (removidos por updates, deletes ou compactions) e cuja idade ultrapassa a janela de retenção de segurança configurada.',
    whyItMatters: 'Como o Lakehouse mantém arquivos antigos para viabilizar Time Travel, sem VACUUM o tamanho em disco continuaria crescendo indefinidamente, acumulando terabytes de versões mortas e inflando a conta da AWS/GCP.',
    underTheHood: 'O VACUUM varre o storage físico e compara com a lista de snapshots ativos no transaction log. Arquivos que não pertencem a nenhuma versão ativa mais recente do que o limiar de retenção (ex: 7 dias) são fisicamente deletados do bucket.',
    realWorldExample: 'Rodar `VACUUM vendas RETAIN 168 HOURS` semanalmente, liberando 40TB de arquivos antigos obsoletos e economizando US$ 900 por mês no S3.',
    labType: 'time-travel',
    codeSnippet: {
      language: 'sql',
      title: 'Comando VACUUM no Delta Lake',
      code: `-- Remove fisicamente arquivos órfãos com mais de 7 dias (168 horas):
VACUUM gold_pedidos RETAIN 168 HOURS;

-- Dry run: Lista os arquivos que seriam deletados sem apagá-los de fato:
VACUUM gold_pedidos RETAIN 168 HOURS DRY RUN;`,
    },
    antiPatterns: ['Executar VACUUM com retenção zero (`RETAIN 0 HOURS`) enquanto outros jobs ainda estão lendo snapshots antigos, quebrando queries em andamento.'],
    bestPractices: ['Mantenha a retenção padrão de segurança de 7 dias (168h) para garantir que consultas longas terminem sem falha.'],
    relatedIds: [61, 62, 65, 69, 97],
    quiz: {
      question: 'Qual é o efeito de executar o comando VACUUM com uma janela de retenção de 7 dias em uma tabela Delta Lake?',
      options: [
        'A tabela inteira é apagada e recriada do zero.',
        'A velocidade da internet aumenta.',
        'Os dados são enviados para o e-mail do gestor.',
        'Arquivos de dados obsoletos (substituídos por updates/compactions) que não são mais necessários para consultas de Time Travel nos últimos 7 dias são deletados fisicamente do storage.',
      ],
      correctIndex: 3,
      explanation: 'O VACUUM faz a limpeza física do disco: remove os arquivos físicos antigos não mais necessários para garantir o histórico dentro da janela de retenção, recuperando espaço em disco.',
    },
  },
];
