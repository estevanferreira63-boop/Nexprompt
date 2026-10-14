import { Concept } from '../../types/concept';

export const SECTION_2_CONCEPTS: Concept[] = [
  {
    id: 11,
    sectionId: 2,
    name: 'Batch Processing',
    tagline: 'Processamento de grandes volumes finitos de dados em lotes periódicos de alto rendimento.',
    difficulty: 'Iniciante',
    overview: 'Processamento em Lote (Batch) manipula conjuntos delimitados e finitos de dados de uma só vez, normalmente executados em janelas programadas (hora em hora, noturno, diário). Prioriza throughput máximo (gigabytes ou terabytes processados por minuto) em detrimento de latência instantânea.',
    whyItMatters: 'É a espinha dorsal de relatórios contábeis, fechamentos diários de balanço, reconciliação de pagamentos e pipelines pesados onde segundos de atraso não prejudicam a tomada de decisão.',
    underTheHood: 'Motores de lote (MapReduce, Spark Core, dbt com Snowflake) otimizam o plano de execução lendo arquivos sequencialmente em blocos contíguos gigantes, minimizando o overhead de transações individuais e maximizando a saturação de I/O e CPU.',
    realWorldExample: 'Fechamento de faturas de cartão de crédito à meia-noite ou cálculo diário de comissões de vendas.',
    codeSnippet: {
      language: 'python',
      title: 'Job Spark Batch Típico',
      code: `from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("DailyBatchJob").getOrCreate()

# Processamento de lote fechado por partição diária
df_dia = spark.read.parquet("s3://dados/vendas/ano=2026/mes=10/dia=04/")
fechamento = df_dia.groupBy("loja_id").agg({"faturamento": "sum", "transacoes": "count"})
fechamento.write.mode("overwrite").parquet("s3://dados/relatorios/fechamento_20261004/")`,
    },
    antiPatterns: ['Rodar jobs batch caros a cada 1 minuto para fingir streaming, gastando overhead de inicialização de cluster.'],
    bestPractices: ['Garanta que jobs batch sejam idempotentes (rodar duas vezes a mesma janela produz o mesmo resultado).'],
    relatedIds: [12, 13, 16, 17],
    quiz: {
      question: 'Qual é o foco principal do processamento Batch?',
      options: [
        'Throughput máximo e custo eficiente sobre grandes volumes delimitados de dados.',
        'Responder em menos de 10 milissegundos para um evento unitário.',
        'Eliminar a necessidade de armazenar arquivos em disco.',
        'Processar dados infinitos sem delimitação de tempo.',
      ],
      correctIndex: 0,
      explanation: 'O processamento em lote prioriza alta vazão (throughput) e eficiência de recursos sobre dados finitos, sem a exigência de latência milissegunda de streaming.',
    },
  },
  {
    id: 12,
    sectionId: 2,
    name: 'Stream Processing',
    tagline: 'Processamento contínuo de registros individuais em tempo real assim que o evento ocorre.',
    difficulty: 'Intermediário',
    overview: 'Stream Processing atua sobre fluxos infinitos (unbounded) de dados, analisando, enriquecendo ou disparando ações registro a registro (record-by-record) com latências sub-segundo ou milissegundas.',
    whyItMatters: 'Essencial para casos onde o valor do dado decai exponencialmente com o tempo: detecção imediata de fraudes bancárias, telemetria hospitalar, precificação dinâmica e alertas de segurança.',
    underTheHood: 'Motores como Apache Flink usam processamento nativo evento a evento baseado em pipelining assíncrono com gerenciamento de estado resiliente (RocksDB state backend) e controle temporal avançado (Event Time vs Processing Time com Watermarks).',
    realWorldExample: 'Nubank bloqueando um cartão suspeito em 80 milissegundos enquanto o usuário ainda está na maquininha.',
    codeSnippet: {
      language: 'python',
      title: 'Stream Processing com PySpark / Kafka',
      code: `streaming_df = spark.readStream \\
    .format("kafka") \\
    .option("kafka.bootstrap.servers", "broker:9092") \\
    .option("subscribe", "transacoes-pix") \\
    .load()

# Detecção de transação suspeita em streaming
fraudes = streaming_df \\
    .selectExpr("CAST(value AS STRING) as json_payload") \\
    .filter("valor > 50000 AND horario_noturno = true")

fraudes.writeStream \\
    .format("kafka") \\
    .option("topic", "alertas-bloqueio") \\
    .start()`,
    },
    antiPatterns: ['Fazer chamadas síncronas HTTP lentas para APIs externas dentro do loop de streaming record-by-record.'],
    bestPractices: ['Projete sistemas de streaming considerando eventos fora de ordem usando watermarks claros.'],
    relatedIds: [11, 13, 14, 15],
    quiz: {
      question: 'O que caracteriza um fluxo de dados em Stream Processing?',
      options: [
        'Dados são finitos e conhecidos antes do início do job.',
        'O processamento só pode ocorrer uma vez por semana.',
        'Dados são contínuos, infinitos (unbounded) e processados com baixíssima latência à medida que chegam.',
        'Não suporta agregações matemáticas.',
      ],
      correctIndex: 2,
      explanation: 'Streams são sequências contínuas e ilimitadas de eventos que chegam em tempo real e exigem processamento imediato sem esperar o encerramento do lote.',
    },
  },
  {
    id: 13,
    sectionId: 2,
    name: 'Micro-batch',
    tagline: 'O meio-termo pragmático: fatiando o fluxo contínuo em pequenos lotes de alguns segundos.',
    difficulty: 'Intermediário',
    overview: 'Micro-batch é a técnica de acumular eventos contínuos em fatias temporais muito curtas (ex: 500ms, 2s, 10s) e processá-los utilizando o motor de computação de lote.',
    whyItMatters: 'Permite reutilizar o mesmo ecossistema, otimizadores e código de lote (como Spark Structured Streaming) para cenários de tempo quase real (near-real-time), obtendo alta vazão com simplicidade operacional.',
    underTheHood: 'Em vez de gerenciar estado permanente por evento como o Flink, o Spark Streaming agenda RDDs discretos em cada intervalo de trigger. Os checkpoints salvam o offset consumido no Kafka ou Delta Lake para garantir entrega Exactly-Once.',
    realWorldExample: 'Atualização do placar de audiência de transmissões ao vivo ou contadores de visualização do YouTube a cada 5 segundos.',
    codeSnippet: {
      language: 'python',
      title: 'Micro-batch Trigger no Spark Structured Streaming',
      code: `query = df.writeStream \\
    .format("delta") \\
    .outputMode("append") \\
    .option("checkpointLocation", "/checkpoints/vendas_microbatch") \\
    .trigger(processingTime="5 seconds") \\
    .toTable("silver_vendas")`,
    },
    antiPatterns: ['Esperar latência sub-5ms usando micro-batching; para ultra baixa latência, Flink é mais apropriado.'],
    bestPractices: ['Ajuste o processingTime de forma que o tempo de execução do micro-batch seja sempre inferior ao intervalo de trigger.'],
    relatedIds: [11, 12, 14],
    quiz: {
      question: 'Qual é a principal vantagem da abordagem Micro-batch?',
      options: [
        'Elimina a necessidade de conexões de rede.',
        'Substitui bancos de dados transacionais.',
        'Garante latência de nanossegundos.',
        'Permite alta vazão reutilizando os mesmos motores e otimizadores robustos de processamento em lote em intervalos rápidos.',
      ],
      correctIndex: 3,
      explanation: 'Micro-batch permite aplicar o motor de batch altamente otimizado em rajadas frequentes, equilibrando throughput robusto e latência de poucos segundos.',
    },
  },
  {
    id: 14,
    sectionId: 2,
    name: 'Event-Driven',
    tagline: 'Arquiteturas desacopladas que reagem instantaneamente a acontecimentos do ecossistema.',
    difficulty: 'Intermediário',
    overview: 'Em arquiteturas Event-Driven (orientadas a eventos), a comunicação entre sistemas ocorre através da emissão, detecção e consumo de eventos imutáveis (ex: "PedidoCriado", "PagamentoRecusado") via mensageria (Kafka, RabbitMQ, SNS/SQS).',
    whyItMatters: 'Desacopla completamente produtores de consumidores. Novos serviços analíticos ou de IA podem plugar no fluxo de eventos sem tocar ou sobrecarregar o microserviço de pedidos original.',
    underTheHood: 'Event brokers utilizam logs distribuídos particionados (commit log). Cada consumidor controla seu próprio ponteiro (offset), permitindo leituras paralelas e replay de eventos históricos à vontade.',
    realWorldExample: 'Quando um usuário conclui uma compra, um evento dispara simultaneamente: emissão de nota, envio de email, baixa no estoque e atualização do Data Lake analítico.',
    codeSnippet: {
      language: 'json',
      title: 'Payload de Evento Estruturado (CloudEvents)',
      code: `{
  "specversion": "1.0",
  "type": "com.ecommerce.pedido.criado",
  "source": "/servicos/checkout",
  "id": "evt-98231-a7b2",
  "time": "2026-10-05T08:15:30Z",
  "datacontenttype": "application/json",
  "data": {
    "pedido_id": 894120,
    "cliente_id": "cli-4491",
    "valor_total": 459.90,
    "itens_count": 3
  }
}`,
    },
    antiPatterns: ['Usar eventos como RPC (Remote Procedure Call) disfarçado, esperando respostas síncronas bloqueantes.'],
    bestPractices: ['Adote schemas padronizados (Avro/Protobuf) com Schema Registry para versionar eventos sem quebrar consumidores.'],
    relatedIds: [12, 15, 16],
    quiz: {
      question: 'Por que o desacoplamento é a grande força de arquiteturas Event-Driven?',
      options: [
        'Porque dispensa o uso de servidores e nuvem.',
        'Porque produtores não precisam saber quem ou quantos consumidores estão escutando os eventos.',
        'Porque eventos apagam registros do banco transacional.',
        'Porque impede que o sistema seja escalado.',
      ],
      correctIndex: 1,
      explanation: 'O produtor apenas publica o evento no tópico de mensageria. Novos consumidores podem ser criados a qualquer momento para ler o mesmo fluxo sem alterar o código de quem gerou o evento.',
    },
  },
  {
    id: 15,
    sectionId: 2,
    name: 'CDC',
    tagline: 'Change Data Capture: streaming em tempo real de cada INSERT, UPDATE e DELETE do banco de dados.',
    difficulty: 'Intermediário',
    overview: 'Change Data Capture (CDC) é o padrão de rastrear e capturar alterações em nível de linha nos bancos transacionais de origem e replicá-las continuamente para destinos analíticos (Data Lake, Kafka, DW) sem sobrecarregar o banco com queries periódicas de polling.',
    whyItMatters: 'Fazer `SELECT * WHERE updated_at > ontem` no banco OLTP é lento, trava tabelas e perde alterações intermediárias e registros excluídos (DELETEs). O CDC captura tudo lendo os logs nativos do banco.',
    underTheHood: 'Ferramentas como Debezium escutam diretamente o log de transações do banco (Write-Ahead Log / WAL no Postgres, Binlog no MySQL, Redo Log no Oracle). Como os dados são lidos do arquivo de log e não da tabela, o impacto na CPU do banco é praticamente nulo.',
    realWorldExample: 'Replicar o banco PostgreSQL operacional de uma fintech para o Snowflake e Apache Iceberg em near-real-time com atraso de menos de 2 segundos.',
    codeSnippet: {
      language: 'json',
      title: 'Mensagem gerada por CDC (Debezium / Kafka)',
      code: `{
  "before": { "id": 101, "status": "PENDENTE", "limite": 1000.00 },
  "after": { "id": 101, "status": "APROVADO", "limite": 2500.00 },
  "source": { "version": "2.4.0", "connector": "postgresql", "table": "contas" },
  "op": "u",
  "ts_ms": 1728116130000
}`,
    },
    antiPatterns: ['Fazer polling com query SQL repetitiva com sleep(5) fingindo ser CDC.'],
    bestPractices: ['Inclua metadados do CDC (op: c/u/d, ts_ms) na camada Bronze para permitir reconstruir o estado histórico exato.'],
    relatedIds: [2, 10, 14, 18, 66],
    quiz: {
      question: 'Como o CDC baseado em log (Log-based CDC) captura alterações sem sobrecarregar o banco transacional?',
      options: [
        'Executa um SELECT COUNT(*) a cada segundo.',
        'Bloqueia as tabelas até os dados serem replicados.',
        'Lê diretamente os arquivos de log de transação do banco (WAL/Binlog), sem fazer queries SQL nas tabelas ativas.',
        'Exporta um dump completo do banco todas as noites.',
      ],
      correctIndex: 2,
      explanation: 'O CDC moderno lê o log de transações gerado nativamente pelo banco para durabilidade (WAL/Binlog), sem executar consultas nas tabelas de produção.',
    },
  },
  {
    id: 16,
    sectionId: 2,
    name: 'Data Pipeline',
    tagline: 'A jornada automatizada que move, limpa, transforma e entrega dados do ponto A ao ponto B.',
    difficulty: 'Iniciante',
    overview: 'Data Pipeline é o conjunto de etapas conectadas que extraem dados de origens heterogêneas, aplicam transformações de qualidade e formato, e os entregam de forma confiável para consumidores de relatórios, dashboards ou modelos de IA.',
    whyItMatters: 'Dados isolados em silos operacionais não geram inteligência. O pipeline garante que a informação flua com pontualidade, integridade e governança contínua.',
    underTheHood: 'Pipelines modernos são modelados como Grafos Acíclicos Dirigidos (DAGs), onde nós representam tarefas e arestas representam dependências. Incluem mecanismos de retry, monitoramento de SLA, validação de schema e tolerância a falhas.',
    realWorldExample: 'Pipeline diário: Extrai logs do Cloudflare no S3 -> Converte para Parquet -> Envia ao Lakehouse -> Executa modelos dbt -> Alimenta o dashboard executivo no Looker.',
    codeSnippet: {
      language: 'python',
      title: 'Conceito de Pipeline em Código',
      code: `def run_pipeline():
    # 1. Ingestão
    raw_data = extract_from_source(api_url="https://api.crm.com/v1/leads")
    # 2. Validação & Qualidade
    validated_data = validate_schema(raw_data, strict=True)
    # 3. Transformação & Enriquecimento
    enriched_data = enrich_geolocation(validated_data)
    # 4. Carga no Lakehouse
    load_to_lakehouse(enriched_data, table="silver.leads_qualificados")
    # 5. Notificação
    notify_success_slack(channel="#dados-alertas")`,
    },
    antiPatterns: ['Criar scripts monolíticos "caixa preta" sem logs intermediários, alertas ou idempotência.'],
    bestPractices: ['Estruture pipelines de forma modular, testável e idempotente.'],
    relatedIds: [17, 18, 19, 51, 52],
    quiz: {
      question: 'O que é a propriedade de Idempotência em um Data Pipeline?',
      options: [
        'Executar o pipeline múltiplas vezes com a mesma entrada gera exatamente o mesmo estado final, sem duplicar dados.',
        'O pipeline roda mais rápido a cada dia.',
        'O pipeline não precisa de conexão de rede.',
        'O código do pipeline nunca pode ser alterado.',
      ],
      correctIndex: 0,
      explanation: 'Idempotência garante que se um pipeline falhar no meio e for reexecutado, ele não duplicará linhas ou corromperá métricas, alcançando o mesmo resultado final previsível.',
    },
  },
  {
    id: 17,
    sectionId: 2,
    name: 'ETL vs ELT',
    tagline: 'Transformar antes de carregar vs Carregar tudo bruto e transformar usando o poder da nuvem.',
    difficulty: 'Iniciante',
    overview: 'No ETL (Extract-Transform-Load), os dados eram transformados em um servidor intermediário antes de entrar no DW. No moderno ELT (Extract-Load-Transform), os dados são carregados brutos diretamente no Lake/Warehouse (Load) e transformados internamente usando o poder escalável do próprio motor analítico (Transform).',
    whyItMatters: 'O ELT viabilizou o Modern Data Stack (Fivetran + Snowflake + dbt). Permite preservar os dados brutos para sempre, acelera a ingestão inicial e possibilita aos analistas iterar nas transformações em SQL sem mexer nos conectores.',
    underTheHood: 'ETL exigia clusters caros dedicados de processamento (Informatica, Talend). ELT transfere a computação de transformação para motores colunares massivamente paralelos (MPP) que custam centavos por segundo de consulta.',
    realWorldExample: 'Airbyte extrai dados da API do Stripe e carrega JSON cru no BigQuery (E e L). Em seguida, o dbt roda SQL interno no BigQuery para transformar em tabelas financeiras (T).',
    codeSnippet: {
      language: 'sql',
      title: 'A fase "T" do ELT com SQL puro (dbt)',
      code: `-- No ELT, a transformação roda dentro do Warehouse sobre os dados já carregados
WITH raw_stripe_events AS (
    SELECT 
        JSON_EXTRACT_SCALAR(payload, '$.charge_id') as charge_id,
        CAST(JSON_EXTRACT_SCALAR(payload, '$.amount') AS FLOAT64) / 100 as valor_brl,
        TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(payload, '$.created') AS INT64)) as criado_em
    FROM \`empresa.raw_lake.stripe_webhooks\`
)
SELECT 
    DATE(criado_em) as data,
    COUNT(charge_id) as total_cobrancas,
    SUM(valor_brl) as volume_transacionado
FROM raw_stripe_events
GROUP BY 1;`,
    },
    antiPatterns: ['Descartar colunas na extração em ETL tradicional; anos depois a empresa precisa daquele campo e não há histórico salvo.'],
    bestPractices: ['Sempre adote ELT quando trabalhar com Data Warehouses e Lakehouses modernos na nuvem.'],
    relatedIds: [7, 8, 16, 18, 19],
    quiz: {
      question: 'Qual é o motivo crucial para a vitória do ELT sobre o ETL no cenário moderno de nuvem?',
      options: [
        'A transformação roda dentro do próprio Data Warehouse ou Lakehouse escalável, preservando o dado bruto e evitando servidores intermediários lentos.',
        'ELT não permite usar linguagens como SQL.',
        'ETL é proibido pelas leis de privacidade.',
        'ELT só funciona com bancos de dados relacionais antigos.',
      ],
      correctIndex: 0,
      explanation: 'No ELT, os dados brutos são carregados imediatamente e o processamento pesado aproveita o poder computacional MPP da nuvem, trazendo flexibilidade total para modificar regras de negócio sem reingerir.',
    },
  },
  {
    id: 18,
    sectionId: 2,
    name: 'Ingestion',
    tagline: 'A porta de entrada: coletar dados de bancos, APIs, arquivos e sensores para o lake.',
    difficulty: 'Iniciante',
    overview: 'Ingestão é o ato de capturar e importar dados de suas fontes originárias para o ambiente analítico. Pode ser operada em modos Push (a fonte envia via webhooks ou mensageria) ou Pull (o pipeline consulta periodicamente a fonte via JDBC ou APIs REST).',
    whyItMatters: 'É a fase mais vulnerável a instabilidades externas: rate limits de APIs, quedas de conexão, mudanças repentinas de formato e controle de estado de paginação.',
    underTheHood: 'Usa estratégias de watermark / offset para garantir ingestão incremental sem reler o histórico inteiro. Inclui dead-letter queues (DLQ) para mensagens corrompidas e buffer pools para absorver picos de tráfego.',
    realWorldExample: 'Coletor de eventos do frontend (Segment / RudderStack) capturando cliques e pageviews de milhões de usuários e despachando para o Kafka.',
    codeSnippet: {
      language: 'python',
      title: 'Ingestão Incremental com Python e Requests',
      code: `import requests
import json

def fetch_incremental_crm_leads(last_watermark):
    # Pull incremental baseado em timestamp
    url = f"https://api.crm.com/leads?updated_after={last_watermark}&limit=500"
    response = requests.get(url, headers={"Authorization": "Bearer TOKEN"})
    response.raise_for_status()
    
    payload = response.json()
    leads = payload.get("data", [])
    novo_watermark = max([lead["updated_at"] for lead in leads]) if leads else last_watermark
    
    return leads, novo_watermark`,
    },
    antiPatterns: ['Fazer full-dump de tabelas com 500 milhões de linhas todos os dias via SELECT * sem paginação ou filtro incremental.'],
    bestPractices: ['Implemente circuit-breakers e exponential backoff para proteger sistemas de origem contra sobrecarga.'],
    relatedIds: [15, 16, 17, 27],
    quiz: {
      question: 'Qual é a principal função de um Watermark na ingestão incremental?',
      options: [
        'Adicionar uma marca d’água visual nas fotos do banco.',
        'Guardar o último ponto de leitura (timestamp ou ID) para que a próxima execução traga apenas dados novos ou atualizados.',
        'Deletar os dados velhos da origem.',
        'Comprimir arquivos em formato ZIP.',
      ],
      correctIndex: 1,
      explanation: 'O watermark registra a última posição ou data/hora consumida com sucesso, garantindo que a ingestão seguinte puxe somente os deltas novos sem duplicar esforço.',
    },
  },
  {
    id: 19,
    sectionId: 2,
    name: 'Transformation',
    tagline: 'O coração da engenharia: moldar, limpar, enriquecer e agregar dados para gerar valor.',
    difficulty: 'Iniciante',
    overview: 'Transformação é a fase onde regras de negócio, correções de qualidade, tipagens, junções e agregações são aplicadas sobre os dados ingeridos para transformá-los de dados brutos caóticos em modelos analíticos consumíveis.',
    whyItMatters: 'Dados puros de origem contêm valores nulos, formatos inconsistentes de telefone, fusos horários divergentes e duplicatas. A transformação é o que transforma ruído em inteligência confiável.',
    underTheHood: 'Utiliza operadores relacionais da álgebra relacional: projeção (select), restrição (filter), junção (join), agregação (group by), e funções analíticas de janela (window functions: rank, lead, lag, rolling averages).',
    realWorldExample: 'Converter moedas em USD e EUR para BRL usando a cotação do Banco Central na data exata da venda, padronizando CPFs com máscara e calculando o LTV (Lifetime Value).',
    codeSnippet: {
      language: 'sql',
      title: 'Transformação analítica com Window Functions',
      code: `-- Enriquecendo pedidos com a média móvel de 7 dias e ordem do pedido por cliente
SELECT 
    pedido_id,
    cliente_id,
    data_pedido,
    valor,
    -- Ordem sequencial de pedidos deste cliente
    ROW_NUMBER() OVER(PARTITION BY cliente_id ORDER BY data_pedido) as sequencia_compra_cliente,
    -- Média móvel dos últimos 7 pedidos
    AVG(valor) OVER(
        ORDER BY data_pedido 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as media_movel_7_pedidos
FROM silver_pedidos;`,
    },
    antiPatterns: ['Executar transformações complexas com loops iterativos "for row in df" no Python em vez de operações vetorizadas.'],
    bestPractices: ['Utilize ferramentas especializadas como dbt para transformações declarativas versionadas no Git com testes automatizados.'],
    relatedIds: [1, 10, 16, 17],
    quiz: {
      question: 'Por que operações vetorizadas ou baseadas em SQL/DataFrames são preferidas para transformações?',
      options: [
        'Porque apagam colunas não utilizadas sem avisar.',
        'Porque são mais difíceis de ler.',
        'Porque exigem menos memória de vídeo.',
        'Porque operam sobre blocos contíguos de memória com otimizações SIMD e em paralelo, em vez de percorrer linha por linha em loops lentos.',
      ],
      correctIndex: 3,
      explanation: 'Motores modernos aplicam álgebra relacional vetorizada sobre colunas inteiras aproveitando instruções modernas de CPU/GPU, superando loops manuais em centenas de vezes.',
    },
  },
  {
    id: 20,
    sectionId: 2,
    name: 'Serving',
    tagline: 'A entrega final: APIs, camadas semânticas e caches velozes para alimentar o negócio.',
    difficulty: 'Intermediário',
    overview: 'Serving é a camada de entrega onde os dados processados são disponibilizados aos usuários finais, sistemas de automação, dashboards interativos ou modelos de machine learning através de APIs de baixa latência, caches (Redis) ou motores SQL interativos (ClickHouse, Trino).',
    whyItMatters: 'De nada adianta ter terabytes de dados processados se uma consulta em um dashboard demora 4 minutos para carregar. A camada de serving otimiza a latência e a concorrência de leitura.',
    underTheHood: 'Usa estratégias de agregação pré-computada (Materialized Views, Cube, Rollups), caches de resultado em memória, e bancos NoSQL indexados por chave (DynamoDB, Redis) para responder em sub-50ms a milhares de requisições por segundo.',
    realWorldExample: 'O painel do motorista da Uber mostrando os ganhos da semana atualizado em 20ms usando dados servidos via Cassandra/Redis.',
    codeSnippet: {
      language: 'python',
      title: 'FastAPI servindo métricas pré-computadas do Lakehouse via Cache',
      code: `from fastapi import FastAPI, HTTPException
import redis
import json

app = FastAPI()
r = redis.Redis(host='localhost', port=6379, db=0)

@app.get("/api/v1/cliente/{cliente_id}/score")
def get_customer_score(cliente_id: str):
    # Consulta direta no cache de Serving (baixa latência)
    cached = r.get(f"score:{cliente_id}")
    if cached:
        return json.loads(cached)
    
    # Se não estiver no cache, consulta camada Gold com fallback
    return {"erro": "Métricas ainda em processamento"}, 404`,
    },
    antiPatterns: ['Conectar milhares de usuários de um app diretamente no banco de dados analítico pesado sem camada de cache intermediária.'],
    bestPractices: ['Implemente rate-limiting e monitore p99 de latência na camada de serving.'],
    relatedIds: [2, 10, 72, 79],
    quiz: {
      question: 'Qual é o objetivo primordial da camada de Serving?',
      options: [
        'Fazer backup dos discos da nuvem.',
        'Substituir o processo de ingestão.',
        'Entregar dados com alta concorrência e baixa latência para clientes, dashboards e sistemas operacionais.',
        'Limpar registros duplicados.',
      ],
      correctIndex: 2,
      explanation: 'A camada de serving existe para garantir que a leitura de dados atenda aos requisitos de desempenho e escalabilidade dos consumidores finais (latência baixa e alto throughput de queries).',
    },
  },
  {
    id: 21,
    sectionId: 2,
    name: 'Partitioning',
    tagline: 'Dividir para conquistar: organize pastas físicas no disco para podar varreduras desnecessárias.',
    difficulty: 'Iniciante',
    overview: 'Particionamento é a divisão física dos dados em subdiretórios no sistema de arquivos ou storage baseada no valor de uma ou mais colunas de baixa cardinalidade (ex: `ano=2026/mes=10/`).',
    whyItMatters: 'Permite o que chamamos de Partition Pruning: quando você consulta `WHERE ano = 2026 AND mes = 10`, o motor analítico nem sequer abre as pastas dos outros anos ou meses, economizando 99% do custo de I/O.',
    underTheHood: 'Ao listar arquivos, o catálogo de tabelas (Hive Metastore, Glue, Unity Catalog) consulta os metadados de partição e elimina caminhos de diretório antes de agendar as tarefas do Spark ou Trino.',
    realWorldExample: 'Particionar tabelas de logs por data (`dt=YYYY-MM-DD`) e país (`country=BR`), fazendo com que auditorias de um único dia em um país leiam apenas 50MB em vez de 10TB.',
    codeSnippet: {
      language: 'sql',
      title: 'Gravação e Leitura Particionada no Spark / Hive',
      code: `-- Salvando com particionamento físico por data
df.write \\
  .partitionBy("ano", "mes") \\
  .parquet("s3://meu-lake/vendas_particionadas/")

-- Na consulta com partition pruning, apenas a pasta correspondente é tocada:
SELECT SUM(valor) FROM vendas WHERE ano = 2026 AND mes = 10;`,
    },
    antiPatterns: [
      'Over-partitioning: particionar por coluna de altíssima cardinalidade (como `user_id` ou timestamp em milissegundos), criando milhões de pastas quase vazias.',
    ],
    bestPractices: ['Cada partição deve conter idealmente entre centenas de megabytes até poucos gigabytes de dados.'],
    relatedIds: [8, 22, 28, 30],
    quiz: {
      question: 'O que acontece durante o Partition Pruning em uma consulta SQL?',
      options: [
        'O motor de consulta lê os metadados e ignora completamente os diretórios que não atendem aos filtros da cláusula WHERE.',
        'Os dados são deletados permanentemente para liberar espaço.',
        'O banco de dados reinicia os servidores.',
        'As partições são compactadas em tempo de execução.',
      ],
      correctIndex: 0,
      explanation: 'O Partition Pruning evita varreduras de arquivos irrelevantes, pulando fisicamente os diretórios que não casam com os predicados de filtro da consulta.',
    },
  },
  {
    id: 22,
    sectionId: 2,
    name: 'Bucketing',
    tagline: 'Agrupamento determinístico por Hash para eliminar Shuffles em JOINs massivos.',
    difficulty: 'Intermediário',
    overview: 'Bucketing (ou Clustered By) divide os dados dentro de uma partição em um número fixo de arquivos (buckets) usando uma função de Hash sobre uma coluna de alta cardinalidade (ex: `hash(user_id) % 32`).',
    whyItMatters: 'Se duas tabelas gigantescas forem particionadas em buckets usando a mesma chave (`user_id`) e a mesma quantidade de buckets, o Spark pode executar um Bucket Join sem necessidade de fazer Shuffle pela rede!',
    underTheHood: 'Cada bucket contém apenas registros cujo hash da chave coincide. Ao juntar Tabela A e Tabela B, o executor junta o Bucket 3 de A diretamente com o Bucket 3 de B na memória do mesmo nó, economizando terabytes de tráfego de rede.',
    realWorldExample: 'Junção diária entre 2 bilhões de impressões de anúncios e 100 milhões de cliques no Facebook pareados por `ad_id`.',
    codeSnippet: {
      language: 'python',
      title: 'Bucketing em PySpark',
      code: `# Salvando tabela com 16 buckets na chave cliente_id
df_clientes.write \\
    .bucketBy(16, "cliente_id") \\
    .sortBy("cliente_id") \\
    .saveAsTable("clientes_bucketed")

# Se pedidos também tiver 16 buckets em cliente_id, o Spark faz Sort-Merge Join sem Shuffle!`,
    },
    antiPatterns: ['Usar bucketing em tabelas pequenas onde o custo de criar os arquivos excede o benefício do join.'],
    bestPractices: ['Escolha uma quantidade de buckets que seja potência de 2 (ex: 16, 32, 64, 128) para facilitar otimizações de divisão.'],
    relatedIds: [21, 35, 41],
    quiz: {
      question: 'Qual é o maior benefício do Bucketing quando aplicado a tabelas que sofrem JOIN frequente?',
      options: [
        'Elimina a necessidade de conexões de internet.',
        'Converte todos os textos em números binários.',
        'Permite a realização de Bucket Joins eliminando o Shuffle de rede, pois dados com a mesma chave já estão no mesmo arquivo.',
        'Cria uma cópia idêntica da tabela em cada nó.',
      ],
      correctIndex: 2,
      explanation: 'Como ambas as tabelas já foram pré-distribuídas fisicamente pelos mesmos hashes de chave, o motor de execução não precisa redistribuir (shuffle) os dados pela rede durante o JOIN.',
    },
  },
  {
    id: 23,
    sectionId: 2,
    name: 'Indexing',
    tagline: 'Estruturas auxiliares de busca rápida: chegue ao registro sem varrer a tabela inteira.',
    difficulty: 'Iniciante',
    overview: 'Índice é uma estrutura de dados separada (como B-Tree, Hash, Bitmap ou Bloom Filter) que armazena referências ordenadas para a localização física das linhas, acelerando buscas pontuais de O(N) para O(log N) ou O(1).',
    whyItMatters: 'Sem índice, encontrar um cliente pelo CPF exige ler 100 milhões de linhas do disco (Full Table Scan). Com índice B-Tree, são necessárias apenas 3 ou 4 leituras de páginas.',
    underTheHood: 'B-Trees mantêm chaves ordenadas em nós de árvore balanceada. Bitmaps usam vetores de bits ideais para colunas de baixa cardinalidade (ex: gênero, status). Bloom Filters usam funções de hash probabilísticas para responder com certeza se um valor "definitivamente NÃO está" naquele bloco de arquivo.',
    realWorldExample: 'Bancos OLTP indexando chave primária e colunas de busca frequente (`email`, `documento_fiscal`).',
    codeSnippet: {
      language: 'sql',
      title: 'Índice B-Tree vs Bitmap Index',
      code: `-- Em banco relacional OLTP
CREATE INDEX idx_clientes_email ON clientes(email);

-- Em banco analítico (ex: Databricks / Delta Lake Bloom Filter)
-- Cria um filtro probabilístico para pular arquivos parquet que não contêm o id:
CREATE BLOOMFILTER INDEX ON TABLE clientes FOR COLUMNS(documento_hash OPTIONS (fpp=0.05));`,
    },
    antiPatterns: ['Criar índices em todas as colunas de uma tabela de escrita intensa, degradando a velocidade dos INSERTs.'],
    bestPractices: ['Analise o plano de execução (`EXPLAIN ANALYZE`) para confirmar que o otimizador realmente escolheu usar o índice.'],
    relatedIds: [1, 2, 28],
    quiz: {
      question: 'Qual é o impacto negativo de ter índices em excesso em uma tabela com alta taxa de escrita (OLTP)?',
      options: [
        'O tamanho da tela do monitor diminui.',
        'Cada operação de INSERT, UPDATE ou DELETE fica mais lenta, pois o banco precisa atualizar os nós de todos os índices adicionais.',
        'A tabela é convertida para CSV.',
        'Impede a criação de chaves estrangeiras.',
      ],
      correctIndex: 1,
      explanation: 'Todo índice precisa ser atualizado a cada escrita no banco. Índices em excesso aumentam substancialmente o overhead de CPU e I/O durante inserções e atualizações.',
    },
  },
  {
    id: 24,
    sectionId: 2,
    name: 'File Formats',
    tagline: 'Parquet, Avro e ORC: a escolha do formato define a velocidade e o custo do seu Lake.',
    difficulty: 'Intermediário',
    overview: 'Formatos de arquivo em Big Data determinam a codificação física dos bytes no storage. Apache Parquet e ORC são orientados a coluna (ideais para analítica e OLAP); Apache Avro é orientado a linha em binário (ideal para mensageria no Kafka e ingestão com schema evolution).',
    whyItMatters: 'Trocar CSV/JSON por Parquet no Data Lake frequentemente reduz o tamanho em disco em 80% e acelera consultas analíticas em até 20x, economizando dezenas de milhares de dólares em nuvem.',
    underTheHood: 'Parquet agrupa dados em Row Groups e armazena cada coluna separada com compressão contextual (Dictionary, Run Length, Bit Packing). Seus footers guardam estatísticas de Min/Max por bloco para data skipping.',
    realWorldExample: 'Uber e Netflix usando Apache Parquet como formato padrão para petabytes de dados analíticos no S3.',
    codeSnippet: {
      language: 'python',
      title: 'Gravando em Parquet com Compressão Snappy',
      code: `# Salvando DataFrame com formato colunar otimizado
df.write \\
  .format("parquet") \\
  .option("compression", "snappy") \\
  .save("s3://lake/silver_transacoes/")`,
    },
    antiPatterns: ['Guardar centenas de gigabytes de dados analíticos em arquivos JSON ou CSV descompactados no Data Lake.'],
    bestPractices: ['Use Avro na mensageria e transmissão de eventos (Kafka) e Parquet nas camadas Silver e Gold do Lakehouse.'],
    relatedIds: [2, 8, 25, 28],
    quiz: {
      question: 'Por que o formato Apache Parquet é muito superior ao JSON para consultas analíticas no Data Lake?',
      options: [
        'Porque Parquet é colorido e suporta emojis nativos.',
        'Porque Parquet elimina a necessidade de chaves primárias.',
        'Porque arquivos Parquet podem ser editados diretamente no Bloco de Notas.',
        'Porque é um formato colunar com compressão eficiente e estatísticas embutidas que permitem ler apenas as colunas e blocos necessários.',
      ],
      correctIndex: 3,
      explanation: 'O Parquet organiza os dados por colunas com metadados detalhados de Min/Max e compressão específica por tipo de dado, permitindo ler apenas fatias exatas do arquivo.',
    },
  },
  {
    id: 25,
    sectionId: 2,
    name: 'Compression',
    tagline: 'Snappy, GZIP, ZSTD: balanceando economia de disco com tempo de CPU.',
    difficulty: 'Intermediário',
    overview: 'Compressão reduz o tamanho físico dos arquivos no disco aplicando algoritmos matemáticos que eliminam redundâncias de bytes. Algoritmos diferentes equilibram a taxa de compressão (tamanho final) com a velocidade de descompressão (gasto de CPU).',
    whyItMatters: 'Em sistemas distribuídos, o maior gargalo costuma ser o I/O de rede e disco. Ler um arquivo comprimido de 100MB e descomprimi-lo na RAM é muito mais rápido do que transferir 1GB de dados crus pela rede.',
    underTheHood: 'Snappy: foco em ultra-alta velocidade com taxa moderada de compressão (padrão em Parquet). GZIP: altíssima compressão, mas lento e geralmente não divisível (non-splittable). Zstandard (ZSTD): algoritmo moderno do Meta que oferece alta compressão próxima do GZIP com velocidade próxima do Snappy.',
    realWorldExample: 'Databricks adotando Zstandard (ZSTD) como algoritmo de compressão padrão para tabelas Delta Lake para economizar storage e acelerar downloads do S3.',
    codeSnippet: {
      language: 'sql',
      title: 'Configurando Compressão ZSTD no Spark / Delta',
      code: `-- Configurando compressão padrão para tabelas no cluster
SET spark.sql.parquet.compression.codec = zstd;

-- Delta Lake com ZSTD para arquivos compactos
ALTER TABLE vendas_gold SET TBLPROPERTIES ('delta.parquet.compression' = 'zstd');`,
    },
    antiPatterns: ['Usar GZIP em arquivos gigantes sem indexação prévia, criando gargalos onde apenas 1 core da CPU consegue descomprimir o arquivo inteiro.'],
    bestPractices: ['Adote Snappy para pipelines focados em velocidade pura e ZSTD para arquivos grandes de longa retenção com ótimo balanço.'],
    relatedIds: [24, 28, 30],
    quiz: {
      question: 'Qual é o benefício do algoritmo Zstandard (ZSTD) em relação ao Snappy e ao GZIP?',
      options: [
        'ZSTD não usa algoritmo de compressão.',
        'Funciona apenas em redes locais sem nuvem.',
        'Combina taxas de compressão muito altas (similares ao GZIP) com velocidades extremamente rápidas de descompressão.',
        'Apaga os dados duplicados permanentemente do storage.',
      ],
      correctIndex: 2,
      explanation: 'O ZSTD tornou-se o queridinho da engenharia de dados moderna por entregar quase a mesma compressão de arquivo que o GZIP, mas com velocidades de descompressão muito superiores.',
    },
  },
  {
    id: 26,
    sectionId: 2,
    name: 'Schema Evolution',
    tagline: 'Adaptar-se à mudança: adicionar novas colunas e alterar tipos sem quebrar pipelines históricos.',
    difficulty: 'Intermediário',
    overview: 'Schema Evolution é a capacidade de um sistema de armazenamento ou mensageria de aceitar alterações na estrutura dos dados (adicionar novas colunas, alterar tipos compatíveis, renomear campos) ao longo do tempo, mantendo a compatibilidade com dados gravados no passado.',
    whyItMatters: 'Negócios mudam semanalmente. Se o aplicativo lançar uma nova coluna de "cupom_desconto", os pipelines não podem quebrar nem exigir reescrever 5 anos de dados históricos no Data Lake.',
    underTheHood: 'Formatos como Delta Lake, Iceberg e Avro registram o histórico de esquemas nos metadados. Ao ler arquivos antigos que não têm a nova coluna, o motor preenche automaticamente com `NULL` ou valor default configurado.',
    realWorldExample: 'Um app de entregas inclui um novo campo `gorjeta_entregador`; tabelas Delta Lake absorvem a coluna automaticamente via `mergeSchema = true`.',
    codeSnippet: {
      language: 'python',
      title: 'Evolução de Schema com PySpark e Delta Lake',
      code: `# Salvando DataFrame com uma nova coluna adicionada dinamicamente
novos_dados_df.write \\
    .format("delta") \\
    .mode("append") \\
    .option("mergeSchema", "true") \\ # Ativa a evolução automática
    .save("s3://lake/clientes_silver/")`,
    },
    antiPatterns: ['Alterar tipos de forma incompatível (ex: converter string com letras para int), corrompendo a leitura de dados históricos.'],
    bestPractices: ['Mantenha regras de evolução explícitas e use Schema Registry para contratos de streaming.'],
    relatedIds: [24, 27, 59, 61, 62],
    quiz: {
      question: 'O que o parâmetro mergeSchema=true faz ao gravar em uma tabela Delta Lake?',
      options: [
        'Atualiza automaticamente o esquema da tabela para incluir colunas novas presentes no novo lote de dados.',
        'Apaga todas as colunas antigas da tabela.',
        'Bloqueia qualquer escrita de novos dados.',
        'Converte todos os números em texto.',
      ],
      correctIndex: 0,
      explanation: 'A opção mergeSchema permite que a tabela Lakehouse adapte seus metadados, adicionando as novas colunas que acabaram de chegar sem abortar o job por divergência de schema.',
    },
  },
  {
    id: 27,
    sectionId: 2,
    name: 'Schema Enforcement',
    tagline: 'A barreira de segurança: rejeite dados corrompidos antes que eles poluam o lago.',
    difficulty: 'Intermediário',
    overview: 'Schema Enforcement (ou Schema Validation) é o mecanismo que impede que registros com tipos incompatíveis ou campos fora de padrão sejam gravados em uma tabela, garantindo a integridade dos dados.',
    whyItMatters: 'Evita a degradação do Data Lake em um "Data Swamp". Se um serviço bugado começar a enviar um campo `preco` como string `"vinte reais"` em vez de número float, o sistema aborta a gravação com erro claro.',
    underTheHood: 'Na tentativa de commit, o driver compara o schema do DataFrame com o schema do catálogo ou metadata log. Qualquer violação de tipo, nulidade ou restrição dispara uma exceção imediata antes de alocar ponteiros de arquivos.',
    realWorldExample: 'Um serviço de streaming financeiro rejeita pacotes de pagamento onde o campo `moeda` é omitido ou o `valor` é negativo.',
    codeSnippet: {
      language: 'sql',
      title: 'Restrições de Schema Enforcement (Delta Constraints)',
      code: `-- Adicionando restrição explícita de validação de dados
ALTER TABLE silver_pedidos ADD CONSTRAINT chk_valor_positivo CHECK (valor > 0);
ALTER TABLE silver_pedidos ADD CONSTRAINT chk_moeda_valida CHECK (moeda IN ('BRL', 'USD', 'EUR'));`,
    },
    antiPatterns: ['Desativar o enforcement para "fazer a ingestão passar rápido", empurrando dados inconsistentes para dashboards de diretoria.'],
    bestPractices: ['Encaminhe registros rejeitados pelo enforcement para uma pasta de quarentena (Dead Letter Queue) para inspeção.'],
    relatedIds: [26, 58, 59, 61],
    quiz: {
      question: 'Qual é o papel do Schema Enforcement no Lakehouse?',
      options: [
        'Converter todos os arquivos para formato CSV.',
        'Criar partições temporárias sem avisar.',
        'Diminuir a velocidade de leitura.',
        'Rejeitar gravações que violem os tipos de dados e contratos definidos na tabela, protegendo a qualidade analítica.',
      ],
      correctIndex: 3,
      explanation: 'Schema Enforcement atua como porteiro do Lakehouse, impedindo que dados inconsistentes ou com tipos incompatíveis quebrem a tabela de destino.',
    },
  },
  {
    id: 28,
    sectionId: 2,
    name: 'Data Skipping',
    tagline: 'Otimização inteligente: use estatísticas de Min/Max para não abrir arquivos desnecessários.',
    difficulty: 'Intermediário',
    overview: 'Data Skipping é a técnica em que motores analíticos utilizam estatísticas armazenadas nos metadados (como valores mínimo e máximo de cada coluna por arquivo) para ignorar completamente a leitura de arquivos que comprovadamente não contêm os dados procurados.',
    whyItMatters: 'Se uma tabela tem 1.000 arquivos Parquet e você procura `idade > 80`, o motor examina o rodapé ou catálogo e descobre que 950 arquivos têm `max_idade = 65`. Esses 950 arquivos nem chegam a ser baixados do S3!',
    underTheHood: 'Em cada arquivo Parquet ou commit log do Delta/Iceberg, são salvos `minValues` e `maxValues` para as primeiras N colunas. Durante o planejamento da query, filtros `WHERE x = 42` viram testes lógicos rápidos: se `42 < min` ou `42 > max`, o arquivo é descartado da lista de leitura.',
    realWorldExample: 'Consulta em petabytes de logs buscando uma requisição com `request_id = "abc-992"` respondendo em 3 segundos em vez de 40 minutos.',
    codeSnippet: {
      language: 'json',
      title: 'Estatísticas de Data Skipping salvas no Delta Log',
      code: `{
  "add": {
    "path": "part-00000.parquet",
    "size": 1420583,
    "stats": "{\\"numRecords\\": 50000, \\"minValues\\": {\\"id\\": 1000, \\"idade\\": 18}, \\"maxValues\\": {\\"id\\": 50000, \\"idade\\": 65}}"
  }
}`,
    },
    antiPatterns: ['Ordenar dados de forma aleatória no disco, fazendo com que todos os arquivos tenham intervalos de min/max idênticos e o skipping seja inútil.'],
    bestPractices: ['Combine Data Skipping com Z-Ordering ou ordenação física nas colunas mais consultadas em filtros WHERE.'],
    relatedIds: [21, 24, 29, 61, 62],
    quiz: {
      question: 'Como o Data Skipping sabe se pode ignorar um arquivo Parquet sem ler o arquivo inteiro?',
      options: [
        'Ele tenta ler e se demorar mais de 1 segundo ele desiste.',
        'Ele consulta as estatísticas de valores Mínimo e Máximo registradas nos metadados/rodapé do arquivo.',
        'Ele adivinha com base no nome do arquivo.',
        'Ele lê apenas a primeira linha de cada arquivo.',
      ],
      correctIndex: 1,
      explanation: 'O motor examina as estatísticas pré-calculadas de Min e Max de cada bloco/arquivo. Se o valor buscado estiver fora desse intervalo, o arquivo é pulado sem I/O.',
    },
  },
  {
    id: 29,
    sectionId: 2,
    name: 'Z-Ordering',
    tagline: 'Curva multidimensional de Morton: acelere filtros em múltiplas colunas simultâneas.',
    difficulty: 'Avançado',
    overview: 'Z-Ordering (baseado em Space-Filling Curves de Morton) é uma técnica de ordenação multidimensional que organiza os registros nos arquivos físicos agrupando pontos próximos no espaço n-dimensional.',
    whyItMatters: 'Se você ordenar apenas por `Data`, filtros por `Cliente` não se beneficiam de Data Skipping. O Z-Order permite ordenar por `(Data, Cliente)` simultaneamente, garantindo alto Data Skipping em ambas as colunas!',
    underTheHood: 'Intercala os bits binários das representações das colunas ordenadas gerando um valor Z-Hash unidimensional. Ao ordenar os dados por esse Z-Hash, a localidade de dados multidimensional é preservada nos arquivos físicos.',
    realWorldExample: 'Tabelas financeiras gigantes consultadas frequentemente tanto por `data_transacao` quanto por `id_comerciante`.',
    labType: 'z-ordering',
    codeSnippet: {
      language: 'sql',
      title: 'Aplicando Z-Order em Delta Lake',
      code: `-- Otimiza o layout físico dos arquivos agrupando por data e cliente
OPTIMIZE vendas_silver
ZORDER BY (data_venda, cliente_id);`,
    },
    antiPatterns: [
      'Aplicar Z-Order em mais de 4 ou 5 colunas ao mesmo tempo; a eficiência da curva multidimensional degrada rapidamente com muitas dimensões (curse of dimensionality).',
    ],
    bestPractices: ['Escolha as colunas de maior cardinalidade que são mais frequentemente utilizadas juntas em cláusulas WHERE.'],
    relatedIds: [21, 28, 61, 69],
    quiz: {
      question: 'Qual é a principal vantagem do Z-Ordering sobre uma ordenação hierárquica simples (ORDER BY colA, colB)?',
      options: [
        'Z-Ordering diminui a quantidade de memória RAM do computador.',
        'Z-Ordering dá peso estatístico balanceado para ambas as colunas, preservando localidade de dados para filtros em colB mesmo sem filtrar colA.',
        'Z-Ordering impede a criação de chaves duplicadas.',
        'Z-Ordering só funciona com arquivos CSV.',
      ],
      correctIndex: 1,
      explanation: 'Num ORDER BY convencional (colA, colB), a colB só fica agrupada quando colA é idêntica. O Z-Order intercala bits gerando agrupamento espacial conjunto para ambas.',
    },
  },
  {
    id: 30,
    sectionId: 2,
    name: 'Small Files',
    tagline: 'O pesadelo do Data Lake: milhões de micro-arquivos que asfixiam catálogos e motores de busca.',
    difficulty: 'Intermediário',
    overview: 'O problema dos "Small Files" (pequenos arquivos) ocorre quando jobs de streaming ou ingestão frequente gravam milhares de arquivos minúsculos (poucos KBs) no storage em vez de arquivos consolidados de tamanho ideal (128MB a 1GB).',
    whyItMatters: 'Cada arquivo exige uma chamada de metadados separada (HTTP GET no S3 ou consulta no NameNode). Listar 500.000 pequenos arquivos pode levar minutos antes mesmo da consulta começar a rodar, explodindo a memória do Driver no Spark.',
    underTheHood: 'Formatos colunares perdem sua capacidade de compressão e Data Skipping quando têm poucas linhas por arquivo. O overhead dos headers e footers do Parquet passa a ocupar mais espaço do que os próprios dados.',
    realWorldExample: 'Um pipeline Spark Streaming com trigger de 1 segundo e 200 partições gerando 12.000 arquivos por minuto no S3.',
    labType: 'small-files',
    codeSnippet: {
      language: 'python',
      title: 'Mitigando Small Files no PySpark antes de salvar',
      code: `# Em vez de salvar 200 partições minúsculas:
# df.write.parquet("s3://lake/...")

# Reduz para um número ideal de arquivos sem full shuffle:
df.coalesce(4).write.parquet("s3://lake/silver_compactada/")

# Ou no Delta Lake rodando compactação programada:
# spark.sql("OPTIMIZE delta_table")`,
    },
    antiPatterns: ['Gravar streams direto no Data Lake com dezenas de tasks sem job de compactação periódico associado.'],
    bestPractices: ['Agende jobs automáticos de bin-packing / compactação diária para consolidar micro-arquivos em blocos de 256MB.'],
    relatedIds: [8, 24, 43, 69],
    quiz: {
      question: 'Por que o problema dos Small Files prejudica dramaticamente o desempenho no Data Lake?',
      options: [
        'Porque arquivos pequenos não aceitam números inteiros.',
        'Porque obriga o Spark a desligar os executores.',
        'Porque nuvens cobram por megabyte apagado.',
        'Porque o overhead de listar metadados e abrir conexões de rede separadas para milhares de arquivos pequenos asfixia o motor de consulta.',
      ],
      correctIndex: 3,
      explanation: 'O overhead de listar, gerenciar conexões de rede e ler headers/footers de milhares de micro-arquivos supera amplamente o tempo real de computação dos dados.',
    },
  },
];
