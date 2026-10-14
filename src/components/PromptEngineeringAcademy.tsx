import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Wand2,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  ArrowRight,
  Database,
  Cpu,
  Terminal,
  ExternalLink,
  Bot,
  RefreshCw,
  Trophy,
  Sliders,
  FileCode,
  ShieldCheck,
  Layers,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

type TabType = 'frameworks' | 'builder' | 'comparisons' | 'gym' | 'library';

interface PromptTemplate {
  id: string;
  category: 'data_eng' | 'sql' | 'spark' | 'rag_ai' | 'architecture' | 'debugging';
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  targetRole: string;
  promptText: string;
  tags: string[];
}

export const PromptEngineeringAcademy: React.FC<{
  onOpenChatWithPrompt?: (promptText: string) => void;
}> = ({ onOpenChatWithPrompt }) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [activeTab, setActiveTab] = useState<TabType>('builder');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Interactive Prompt Builder State ---
  const [builderRole, setBuilderRole] = useState<string>(
    'Principal Data Engineer e Especialista em Arquitetura Distribuída'
  );
  const [builderContext, setBuilderContext] = useState<string>(
    'Estamos processando 15TB diários em um Lakehouse Delta Lake no Databricks. As queries de agregação noturna estão sofrendo com alto shuffle write e pequenos arquivos (small files problem).'
  );
  const [builderTask, setBuilderTask] = useState<string>(
    'Desenvolva um plano de otimização em 3 etapas abordando particionamento inteligente, Z-Ordering e estratégias de compactação automática (Auto-Optimize / Optimize Write).'
  );
  const [builderConstraints, setBuilderConstraints] = useState<string>(
    '1. Não sugira aumentar os nós do cluster como primeira opção (foco em eficiência de I/O).\n2. Forneça sintaxe exata em SQL/PySpark.\n3. Indique os trade-offs de custo computacional vs velocidade de leitura para cada decisão.'
  );
  const [builderOutputFormat, setBuilderOutputFormat] = useState<string>(
    'Tabela comparativa dos trade-offs seguida por snippets de código prontos para produção e checklist de validação pós-deploy.'
  );
  const [builderFewShot, setBuilderFewShot] = useState<string>('');
  const [builderCopied, setBuilderCopied] = useState<boolean>(false);
  const [isSimulatingAI, setIsSimulatingAI] = useState<boolean>(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);

  const handleSimulateExecution = () => {
    setIsSimulatingAI(true);
    setSimulatedResponse(null);
    setTimeout(() => {
      setIsSimulatingAI(false);
      setSimulatedResponse(`🧠 <raciocinio_interno_cot>
1. Compreensão do Cenário: O usuário atua em um ambiente Lakehouse com alto shuffle write e small files problem em 15TB diários.
2. Derivação de Primeiros Princípios:
   - Particionamento por data/hora isola queries, mas particionamento excessivo gera arquivos < 10MB.
   - Z-Ordering em colunas de alta cardinalidade de filtro permite Data Skipping via estatísticas de min/max dos footers Parquet.
   - Auto-Optimize reduz arquivos intermediários durante a escrita através de bin-packing.
3. Decisão de Código: Combinar 'OPTIMIZE ZORDER BY' com reconfiguração de 'spark.databricks.delta.optimizeWrite.enabled'.
</raciocinio_interno_cot>

### Plano de Otimização em 3 Etapas

#### 1. Diagnóstico e Sizing de Arquivos
Execute a inspeção da distribuição física para mensurar a fragmentação atual:
\`\`\`sql
-- Analisar contagem de arquivos e tamanho médio por partição
DESCRIBE DETAIL lakehouse.gold_transactions;
\`\`\`

#### 2. Compactação Automática & Z-Ordering
Configure a tabela para realizar bin-packing durante a escrita e ordene os dados por cardinalidade de filtro:
\`\`\`sql
-- Ativar Optimize Write e Auto-Compact na tabela
ALTER TABLE lakehouse.gold_transactions SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.targetFileSize' = '134217728' -- Alvo de 128MB por arquivo Parquet
);

-- Executar Z-Ordering nas colunas de filtro mais frequentes
OPTIMIZE lakehouse.gold_transactions
ZORDER BY (customer_id, transaction_timestamp);
\`\`\`

#### 3. Checklist de Validação & Impacto em Custos
| Ação | Impacto em Leitura | Custo de Escrita | Ganho Estimado |
|---|---|---|---|
| **Optimize Write** | Sem impacto | +5% tempo de escrita | Elimina 90% dos small files |
| **Z-Ordering** | 5x a 20x mais rápido | Requer job batch diário | -40% DBU de clusters analíticos |

✅ Deploy Seguro: Execute primeiro em staging com vacuum retention check para evitar exclusão acidental de versões recentes.`);
    }, 1200);
  };

  // --- Gym / Quiz State ---
  const [gymAnswers, setGymAnswers] = useState<Record<number, number>>({});
  const [gymSubmitted, setGymSubmitted] = useState<Record<number, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Assembled Generated Prompt in Professional XML / Markdown Delimited Format
  const generatedPrompt = `Você atuará como: ${builderRole}.

<contexto>
${builderContext}
</contexto>

<tarefa_principal>
${builderTask}
</tarefa_principal>

<restricoes_e_regras>
${builderConstraints}
- Se faltarem informações críticas de infraestrutura, declare as premissas assumidas explicitamente.
- Não invente métricas fictícias sem alertar que são estimativas teóricas.
</restricoes_e_regras>

<formato_de_saida>
${builderOutputFormat}
</formato_de_saida>
${
  builderFewShot.trim()
    ? `\n<exemplo_referencia>\n${builderFewShot}\n</exemplo_referencia>`
    : ''
}

Execute uma análise profunda passo a passo (Chain-of-Thought) antes de apresentar a solução final.`;

  // Calculate Prompt Health Score
  const computePromptScore = () => {
    let score = 0;
    if (builderRole.trim().length > 10) score += 20;
    if (builderContext.trim().length > 25) score += 20;
    if (builderTask.trim().length > 20) score += 20;
    if (builderConstraints.trim().length > 20) score += 20;
    if (builderOutputFormat.trim().length > 15) score += 20;
    return score;
  };
  const promptScore = computePromptScore();

  // Curated Professional Prompts Library
  const TEMPLATES: PromptTemplate[] = [
    {
      id: 'tpl_spark_memory',
      category: 'spark',
      titlePt: 'Diagnóstico & Resolução de Spark OOM (OutOfMemory)',
      titleEn: 'Spark OOM & Memory Tuning Diagnostic',
      descriptionPt: 'Prompt com framing sênior para analisar logs de heap, spill to disk e cálculo de spark.executor.memory.',
      descriptionEn: 'Senior prompt to diagnose heap logs, spill to disk, and calculate executor memory parameters.',
      targetRole: 'Staff Spark Performance Tuning Engineer',
      promptText: `Você é um Staff Spark Performance Engineer especialista em resolução de problemas de heap e rede em clusters distribuidos.

<contexto>
Nosso job Spark está falhando na Stage 4 com erro 'java.lang.OutOfMemoryError: Java heap space' durante um join largo entre uma tabela fato de 800M de linhas e uma dimensão de 5M de linhas.
Configurações atuais:
- spark.executor.instances = 20
- spark.executor.cores = 4
- spark.executor.memory = 16g
- spark.memory.fraction = 0.6
- spark.sql.shuffle.partitions = 200 (default)
</contexto>

<tarefa>
1. Analise as causas-raiz mais prováveis (Skew de partições, Broadcast threshold excedido, Shuffle Spill).
2. Forneça o plano de contingência em 3 passos com código Spark SQL / PySpark exato para inspecionar a distribuição de chaves.
3. Sugira valores matematicamente justificados para 'spark.sql.shuffle.partitions' e 'spark.sql.autoBroadcastJoinThreshold'.
</tarefa>

<restricoes>
- Explique o trade-off de usar Broadcast Hash Join vs Sort Merge Join com Salting neste caso.
- Não sugira simplesmente dobrar a memória das máquinas.
</restricoes>

<formato_de_saida>
Diagnóstico estruturado em tópicos:
1. Causa Raiz Provável
2. Script de Inspeção de Data Skew
3. Nova Configuração Recomendada com Justificativa Matemática
4. Código de Mitigação (ex: Salting se necessário)
</formato_de_saida>`,
      tags: ['Spark', 'Performance', 'Memória', 'OOM'],
    },
    {
      id: 'tpl_sql_optimize',
      category: 'sql',
      titlePt: 'Otimização Extrema de Query SQL Analítica (DuckDB / BigQuery)',
      titleEn: 'Analytical SQL Optimization (DuckDB / BigQuery)',
      descriptionPt: 'Exige análise de plano de execução, eliminação de subqueries correlacionadas e uso de Window Functions.',
      descriptionEn: 'Demands execution plan analysis, eliminating correlated subqueries, and efficient window functions.',
      targetRole: 'Lead Analytics Engineer & Query Optimizer',
      promptText: `Atue como um Lead Analytics Engineer especialista em bancos de dados analíticos colunares (BigQuery, DuckDB, Snowflake).

<contexto>
A consulta SQL abaixo calcula o LTV (Lifetime Value) e o tempo médio entre compras para cada cliente, mas leva 14 minutos e consome 450GB de scan em produção.
Dialeto: BigQuery Standard SQL / ANSI.

[COLE SUA QUERY SQL AQUI]
</contexto>

<tarefa>
Reescreva a consulta para reduzir drasticamente a leitura de bytes (I/O) e o tempo de computação.
Aplique:
- Substituição de subconsultas correlacionadas por CTEs com Window Functions.
- Uso de QUALIFY e PARTITION BY adequados.
- Eliminação de SELECT * e GROUP BY redundantes.
</tarefa>

<formato_de_saida>
1. SQL Otimizado pronto para copiar (comentado).
2. Tabela de Antes vs Depois explicando cada transformação e por que ela reduz custos.
3. Recomendação de particionamento e clustering para a tabela subjacente.
</formato_de_saida>`,
      tags: ['SQL', 'BigQuery', 'Window Functions', 'FinOps'],
    },
    {
      id: 'tpl_rag_vector',
      category: 'rag_ai',
      titlePt: 'Pipeline RAG Anti-Alucinação com Citações Estritas',
      titleEn: 'Anti-Hallucination Strict RAG Pipeline Prompt',
      descriptionPt: 'Prompt de sistema para agentes de IA garantirem groundedness absoluta e citação de fontes com metadados.',
      descriptionEn: 'System prompt ensuring 100% groundedness, provenance citation, and JSON fallback.',
      targetRole: 'Senior MLOps & RAG System Architect',
      promptText: `Você é um Assistente de Conhecimento Técnico estritamente ancorado nos documentos fornecidos.

<regras_fundamentais_de_groundedness>
1. Sua única fonte de verdade são os blocos contidos em <contexto_recuperado>.
2. Se a resposta para a pergunta não puder ser 100% comprovada pelos trechos fornecidos, você DEVE responder:
   "Desculpe, a documentação interna fornecida não contém evidências suficientes para responder com certeza a esta questão."
3. É expressamente PROIBIDO usar conhecimento prévio do mundo para extrapolar fatos técnicos que não estejam explicitamente documentados.
4. Para cada afirmação técnica, cite o [Doc ID: X, Parágrafo Y].
</regras_fundamentais_de_groundedness>

<contexto_recuperado>
[INSERIR CHUNKS RETORNADOS PELO VECTOR DB AQUI COM METADADOS]
</contexto_recuperado>

<pergunta_do_usuario>
[INSERIR DÚVIDA DO USUÁRIO]
</pergunta_do_usuario>

Responda de forma concisa, citando os identificadores dos trechos utilizados.`,
      tags: ['RAG', 'Vector DB', 'Groundedness', 'Anti-Hallucination'],
    },
    {
      id: 'tpl_airflow_dag',
      category: 'data_eng',
      titlePt: 'Design de DAG Airflow Resiliente com Sensores e Idempotência',
      titleEn: 'Idempotent Airflow DAG with Exponential Retries',
      descriptionPt: 'Criação de DAG moderna no Airflow 2.x com TaskFlow API, retries exponenciais e SLA.',
      descriptionEn: 'Modern Airflow 2.x DAG with TaskFlow API, dynamic retries, and clean idempotency.',
      targetRole: 'Data Platform Architect',
      promptText: `Atue como um Data Platform Architect especialista em orquestração com Apache Airflow 2.8+.

<requisitos_da_dag>
- Nome: crm_events_silver_ingestion
- Frequência: Diária (@daily) com catchup=False
- Paradigma: TaskFlow API com decoradores (@dag, @task)
- Fonte: S3/GCS bucket com arquivos JSON horários
- Destino: Tabela Delta Lake / Iceberg com merge idempotente
</requisitos_da_dag>

<diretrizes_de_resiliencia>
1. Configurar 'retries=3', 'retry_delay=timedelta(minutes=2)' com 'retry_exponential_backoff=True'.
2. Garantir IDEMPOTÊNCIA total: se a tarefa rodar 5 vezes com o mesmo execution_date, o resultado final no banco deve ser idêntico e sem duplicatas.
3. Implementar um ExternalTaskSensor ou FileSensor em modo 'reschedule' (nunca 'poke' para não travar slots de worker).
4. Adicionar callback de alerta em caso de falha ('on_failure_callback').
</diretrizes_de_resiliencia>

<formato_de_saida>
Código Python completo, formatado com PEP 8 e tipagem estrita (type hints). Acompanhado de breve explicação das escolhas de resiliência.`,
      tags: ['Airflow', 'Orquestração', 'Idempotência', 'Python'],
    },
    {
      id: 'tpl_interview_prep',
      category: 'architecture',
      titlePt: 'Simulador de Entrevista de System Design para Big Tech',
      titleEn: 'FAANG Data Engineering System Design Interviewer',
      descriptionPt: 'Transforma a IA em um entrevistador rigoroso de Big Tech fazendo perguntas socráticas sobre trade-offs.',
      descriptionEn: 'Turns AI into a rigorous Big Tech interviewer evaluating data system design trade-offs.',
      targetRole: 'Staff Data Engineering Interviewer na Google/Meta',
      promptText: `Você é um Staff Data Engineer e Bar Raiser conduzindo uma entrevista técnica sênior de System Design em uma Big Tech.

O desafio proposto ao candidato é:
"Desenhe a arquitetura de dados em tempo real para processar métricas de visualização de vídeos do YouTube/Instagram, lidando com 1 milhão de eventos por segundo, detecção de fraude de cliques e relatórios agregados de 1 minuto para os criadores."

<instrucoes_de_conducao>
1. NÃO dê a resposta pronta nem desenhe o sistema inteiro de imediato.
2. Comece pedindo ao candidato que faça as perguntas de clarificação de requisitos funcionais e não-funcionais (RPS, SLAs, tolerância a dados duplicados).
3. Após cada resposta do candidato, avalie criticamente:
   - Apontando um ponto fraco ou gargalo real (ex: 'O que acontece se o Kafka sofrer partição quente aqui?').
   - Desafiando os trade-offs escolhidos (ex: 'Por que Flink e não Spark Streaming?').
4. Mantenha um tom profissional, incisivo e desafiador de entrevista técnica de alto nível.
</instrucoes_de_conducao>

Inicie a entrevista com a introdução do problema e convide o candidato a dar os primeiros passos.`,
      tags: ['Entrevistas', 'System Design', 'Big Tech', 'Streaming'],
    },
    {
      id: 'tpl_data_contract',
      category: 'data_eng',
      titlePt: 'Especificação de Contrato de Dados (Data Contracts v2)',
      titleEn: 'Data Contracts Specification & Great Expectations Suite',
      descriptionPt: 'Gera contrato de dados formal com JSON Schema, SLA de latência, regras de integridade e suíte de testes.',
      descriptionEn: 'Generates formal data contract with JSON Schema, latency SLA, integrity rules, and automated test suite.',
      targetRole: 'Data Governance & Platform Lead',
      promptText: `Atue como um Data Governance & Platform Architect implementando Data Mesh e Data Contracts.

<contexto>
O time de Checkout/Pagamentos emite eventos transacionais para a equipe de Engenharia de Dados.
Precisamos de um Data Contract v2 formal para o evento 'payment_processed'.
Tecnologia de validação: JSON Schema + Great Expectations / Soda Core.
</contexto>

<tarefa>
1. Gere o contrato formal de dados em YAML/JSON contendo:
   - Metadados do Domínio (Owner, Slack channel, Version: 2.1.0)
   - Schema com tipos de dados estritos, campos obrigatórios e regex para IDs
   - SLAs explícitos: Freshness (< 15 minutos), Disponibilidade (99.9%)
2. Forneça o script Python com Great Expectations correspondente para validar o dataset antes do commit na camada Silver.
</tarefa>

<regras_de_qualidade>
- Proíba campos sem tipagem explícita.
- Defina políticas de quebra de schema (Breaking changes vs Non-breaking changes).
</regras_de_qualidade>`,
      tags: ['Data Contracts', 'Great Expectations', 'Data Mesh', 'Qualidade'],
    },
    {
      id: 'tpl_rca_postmortem',
      category: 'debugging',
      titlePt: 'Post-Mortem & Análise de Causa-Raiz de Incidente Crítico (RCA)',
      titleEn: 'Production Incident Root Cause Analysis (RCA) Memo',
      descriptionPt: 'Estrutura um relatório de RCA executivo sem culpados (blameless) com técnica dos 5 Porquês e plano de ação.',
      descriptionEn: 'Drafts executive blameless RCA post-mortem with 5 Whys analysis and prioritized remediation actions.',
      targetRole: 'Data SRE & Platform Operations Lead',
      promptText: `Você é um Staff Data SRE conduzindo uma análise de causa-raiz (Post-Mortem Blameless) para a diretoria de engenharia.

<dados_do_incidente>
- Duração do Incidente: 3h42min (Severidade: P1 - Crítica)
- Impacto: Relatórios financeiros de fechamento mensal falharam; 4.5 milhões de transações represadas no Kafka.
- Causa Inicial: Um deploy atualizou a versão de uma lib Python que causou crash loop no cluster de workers do Spark.
- Resolução Provisória: Rollback manual do container Docker e re-execução com aumento temporário de máquinas.
</dados_do_incidente>

<tarefa>
Estruture o documento executivo contendo:
1. Resumo Executivo em 1 parágrafo (sem jargões excessivos para o VP de Engenharia).
2. Linha do Tempo Cronológica com MTTA (Mean Time to Acknowledge) e MTTR (Mean Time to Resolve).
3. Análise Profunda dos "5 Porquês" (Five Whys) para atingir a causa raiz sistêmica e não apenas o erro humano.
4. Tabela de Ações Corretivas categorizadas em Prevenção Imediata (P0), Mitigação (P1) e Melhoria de Processo (P2) com prazos sugeridos.
</tarefa>

Mantenha um tom profissional, analítico e estritamente sem atribuição de culpa individual (Blameless Culture).`,
      tags: ['SRE', 'Post-Mortem', 'RCA', 'Confiabilidade'],
    },
    {
      id: 'tpl_finops_storage',
      category: 'architecture',
      titlePt: 'Estratégia FinOps: Redução de Custos de Cloud Storage & Compute',
      titleEn: 'FinOps Cloud Storage & Compute Sizing Strategy',
      descriptionPt: 'Plano de ação para cortar custos em clusters e object storage (S3/GCS) mantendo SLAs.',
      descriptionEn: 'Tactical blueprint to reduce cloud data spend by 30-40% across compute, storage, and networking.',
      targetRole: 'Principal Cloud FinOps & Infrastructure Architect',
      promptText: `Atue como um Principal Cloud FinOps Architect especialista em plataformas de dados (AWS/Databricks/Snowflake).

<fatura_mensal_atual>
- Custo mensal total de dados: $85.000 / mês.
- 45% do custo: Instâncias sob demanda para clusters noturnos (AWS EMR / Databricks).
- 35% do custo: Armazenamento S3 Standard com 1.2 Petabytes sem ciclo de vida configurado.
- 20% do custo: Transferência de dados entre zonas de disponibilidade (Cross-AZ traffic) e queries pesadas ad-hoc.
</fatura_mensal_atual>

<tarefa>
Elabore um plano tático em 4 semanas para reduzir o gasto em no mínimo 35% mantendo os SLAs de entrega.
Apresente:
1. Computação: Estratégia de Spot instances com fallback, sizing de workers e desativação de autoscaling agressivo.
2. Armazenamento: Políticas de Lifecycle S3 (Standard -> Infrequent Access -> Glacier Instant Retrieval) e compactação de small files.
3. Rede: Como reestruturar VPCs e subnets para zerar taxas cross-AZ.
4. Tabela com Economia Estimada em dólares por mês para cada medida.
</tarefa>`,
      tags: ['FinOps', 'AWS S3', 'Databricks', 'Custos'],
    },
    {
      id: 'tpl_kafka_flink_streaming',
      category: 'spark',
      titlePt: 'Arquitetura de Streaming Kafka + Flink com Exactly-Once',
      titleEn: 'Kafka + Flink Streaming with Exactly-Once Semantics',
      descriptionPt: 'Guia de configuração para garantias transacionais de Exactly-Once com RocksDB State Backend.',
      descriptionEn: 'Architecture guide for end-to-end exactly-once semantics using Flink two-phase commits and Kafka.',
      targetRole: 'Staff Real-Time Streaming Systems Engineer',
      promptText: `Você é um Staff Real-Time Systems Engineer especialista em Apache Kafka 3.7 e Apache Flink 1.19.

<cenario>
Pipeline de detecção de fraudes financeiras com volume de 120.000 transações/segundo.
Requisito mandatório: Semântica Exactly-Once ponta a ponta (desde a leitura do Kafka até a gravação no Delta Lake).
Gargalo atual: O checkpointing do Flink está levando 45 segundos e causando pausas (backpressure) nos operadores.
</cenario>

<tarefa>
1. Explique como funciona o protocolo Two-Phase Commit (2PC) do Flink Kafka Sink para garantir Exactly-Once.
2. Forneça os parâmetros exatos de configuração para o RocksDB StateBackend:
   - Incremental Checkpointing
   - Memória de buffer off-heap
   - Alinhamento de checkpoint não-bloqueante (Unaligned Checkpoints)
3. Sugira estratégias de particionamento de chave no Kafka para evitar Hot Partitions.
</tarefa>`,
      tags: ['Kafka', 'Flink', 'Streaming', 'Exactly-Once'],
    },
  ];

  // Comparisons Data (Bad vs Pro Prompt)
  const COMPARISONS = [
    {
      id: 'comp_1',
      title: 'Geração de Consulta SQL Analítica',
      category: 'SQL / Data Warehousing',
      badPrompt: 'Me dá um SQL pra calcular o churn de clientes da minha loja.',
      badReason:
        'Sem schema, sem tipos de dados, sem dialeto especificado (Postgres? Snowflake? BigQuery?), sem definição do que constitui churn (30 dias sem compra? cancelamento ativo?), gerando código genérico inútil.',
      badResult:
        'Gera um SQL básico com `SELECT * FROM orders WHERE date < NOW() - INTERVAL 30 DAY` que quebra em qualquer banco real.',
      proPrompt: `Você é um Analytics Engineer sênior especialista em PostgreSQL 16.
<contexto>
Temos a tabela 'subscriptions':
- user_id (UUID)
- plan_id (VARCHAR)
- status (VARCHAR: 'active', 'canceled', 'paused')
- started_at (TIMESTAMPTZ)
- canceled_at (TIMESTAMPTZ, nullable)
- monthly_amount (NUMERIC(10,2))
</contexto>
<tarefa>
Escreva uma consulta SQL que calcule a taxa mensal de Churn de Receita (MRR Churn Rate) e Churn de Logos (clientes) para cada mês de 2024.
Fórmula: (MRR cancelado no mês) / (MRR ativo no início do mês).
</tarefa>
<restricoes>
- Use Common Table Expressions (WITH) e Window Functions.
- Trate divisão por zero com NULLIF.
- Ordene por mês cronologicamente.
</restricoes>`,
      proReason:
        'Define dialeto, DDL com tipos de colunas, fórmula matemática exata de negócio, tratamento defensivo de erros (NULLIF) e restrições de código limpo.',
      proResult:
        'Gera uma CTE perfeita pronta para colar em dbt ou Metabase com cálculo rigoroso de MRR, sem erros de sintaxe ou ambiguidade.',
    },
    {
      id: 'comp_2',
      title: 'Diagnóstico de Pipeline e Debugging',
      category: 'Data Pipelines / Spark',
      badPrompt: 'Meu Spark deu erro de shuffle memory, como conserto?',
      badReason:
        'Não informa volumetria, cluster size, versão do Spark, código do job, tipo de erro específico ou chave de join.',
      badResult:
        'Responde dicas genéricas como "aumente a memória ou diminua partições", o que frequentemente piora o problema.',
      proPrompt: `Atue como um Engenheiro de Performance Spark.
<log_de_erro>
ExecutorLostFailure (executor 12 exited caused by one of the running tasks) Reason: Container killed by YARN for exceeding memory limits. 16.4 GB of 16 GB physical memory used.
</log_de_erro>
<codigo_executado>
df_large.join(df_events, "customer_id").groupBy("customer_id").agg(count("*"))
</codigo_executado>
<cenario>
- df_large: 2 bilhões de linhas com forte skew (10% dos clientes representam 70% dos eventos).
- df_events: 50 milhões de linhas.
- spark.sql.shuffle.partitions = 200.
</cenario>
<tarefa>
Explique por que o skew está sobrecarregando uma partição específica de shuffle e forneça o código com Salting (adição de chave aleatória de 1 a 10) para distribuir o join homogeneamente entre os executores.
</tarefa>`,
      proReason:
        'Isola o log exato de YARN/Container, mostra a query causadora, identifica o data skew e solicita a técnica específica recomendada (Salting) com código executável.',
      proResult:
        'Entrega diagnóstico preciso do YARN overhead e implementação imediata de salting com broadcast de chave composta.',
    },
    {
      id: 'comp_3',
      title: 'Arquitetura de Lakehouse & Governança',
      category: 'System Design',
      badPrompt: 'Como estruturo um Lakehouse bom na AWS?',
      badReason:
        'Pergunta aberta que gera respostas genéricas de 20 páginas copiadas de whitepapers com buzzwords.',
      badResult:
        'Lista ferramentas genéricas (S3, Glue, Athena, Redshift) sem critérios de escolha ou governança.',
      proPrompt: `Atue como Principal Cloud Data Architect.
<requisitos_de_negocio>
- Ingestão: 50 tópicos Kafka com 50.000 msgs/seg em formato JSON.
- SLA: Dados analíticos prontos para BI em menos de 5 minutos.
- Conformidade: LGPD/GDPR com capacidade de exclusão de dados de um cliente específico em menos de 24 horas (Right to be Forgotten).
</requisitos_de_negocio>
<tarefa>
Compare Delta Lake vs Apache Iceberg especificamente para este caso de uso na AWS.
Avalie:
1. Performance de MERGE/DELETE para exclusões LGPD.
2. Integração com Amazon Athena e AWS Glue Catalog.
3. Custo estimado de compactação (Vacuum / Compaction).
Apresente uma matriz de decisão recomendando a melhor opção fundamentada.
</tarefa>`,
      proReason:
        'Foca em SLAs específicos (5 min), volumetria real (50k msgs/s) e requisito regulatório complexo (Right to be Forgotten no Lakehouse).',
      proResult:
        'Entrega uma análise técnica cirúrgica comparando Delta Lake Deletion Vectors com Iceberg Position Deletes e impactos em custos.',
    },
  ];

  // Gym Interactive Exercises
  const GYM_EXERCISES = [
    {
      id: 1,
      scenario:
        'Você quer pedir para a IA criar um pipeline dbt para calcular KPIs de vendas, mas você quer garantir que ela não invente campos ou adote tabelas que não existem no seu data warehouse.',
      question:
        'Qual técnica avançada de prompt engineering é a mais crucial para evitar que a IA invente nomes de colunas e tabelas?',
      options: [
        'Incluir a DDL/Schema exato das tabelas de origem delimitado em tags XML ou markdown e instruir explicitamente: "Utilize APENAS as colunas descritas no schema fornecido".',
        'Aumentar o valor de temperatura do modelo para 1.0 para incentivar criatividade.',
        'Pedir para a IA responder apenas em inglês.',
        'Escrever o prompt com letras maiúsculas para dar mais ênfase.',
      ],
      correctIndex: 0,
      explanation:
        'Excelente! Grounding com Schema DDL explícito e instrução restritiva negativa ("Utilize apenas as colunas informadas") elimina 99% das alucinações de campos fictícios em geração de código SQL/dbt.',
    },
    {
      id: 2,
      scenario:
        'Você está solicitando uma análise de trade-offs de desempenho entre Apache Kafka e Apache Pulsar para um sistema crítico de telemetria.',
      question:
        'Qual das opções abaixo representa um Role Framing (definição de persona) profissional e efetivo?',
      options: [
        '"Você é uma IA muito inteligente que sabe tudo de tecnologia."',
        '"Atue como um Staff Distributed Systems Architect com 10 anos de experiência em mensageria de alta throughput, focado em tolerância a falhas, latência de p99 e facilidade operacional de Kubernetes."',
        '"Finja que é um programador de computador."',
        '"Você é o ChatGPT."',
      ],
      correctIndex: 1,
      explanation:
        'Correto! Personas eficazes ancoram o modelo em um nível de maturidade técnica específico (Staff Architect), com critérios de avaliação concretos (latência p99, tolerância a falhas, operações K8s).',
    },
    {
      id: 3,
      scenario:
        'Você precisa que a resposta da IA seja consumida por um script Python automatizado em uma esteira de CI/CD sem risco de quebrar o parser.',
      question:
        'Qual diretriz de Formato de Saída (Output Formatting) garante a máxima confiabilidade para consumo por código?',
      options: [
        '"Responda com uma redação bonita e um resumo no final."',
        '"Peça para a IA enviar um email com o resultado."',
        '"Exija a saída estritamente em JSON puro seguindo um JSON Schema fornecido, delimitado por ```json, sem nenhum texto explicativo antes ou depois."',
        '"Instrua a IA a usar emojis para separar as seções."',
      ],
      correctIndex: 2,
      explanation:
        'Perfeito! O uso de JSON Schema estrito e proibição de texto de preâmbulo ("sem comentários antes ou depois") permite que bibliotecas como Pydantic ou json.loads() consumam o payload diretamente sem erros de parsing.',
    },
  ];

  const handleSelectGymOption = (exId: number, optIdx: number) => {
    if (gymSubmitted[exId]) return;
    setGymAnswers((prev) => ({ ...prev, [exId]: optIdx }));
  };

  const handleSubmitGymExercise = (exId: number) => {
    const selected = gymAnswers[exId];
    if (selected === undefined) return;
    setGymSubmitted((prev) => ({ ...prev, [exId]: true }));
    const ex = GYM_EXERCISES.find((e) => e.id === exId);
    if (ex && selected === ex.correctIndex) {
      addXp(50, 'Desafio de Prompt Engineering Superado!');
      sound.playSuccess();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'pt'
                  ? 'Masterclass • Engenharia de Prompts para IA'
                  : 'Masterclass • AI Prompt Engineering'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{language === 'pt' ? 'Como Escrever Prompts Profissionais' : 'Mastering Professional AI Prompts'}</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl font-sans leading-relaxed">
              {language === 'pt'
                ? 'Modelos de linguagem não leem pensamentos; eles respondem a restrições, contexto estruturado e personas calibradas. Aprenda frameworks consolidados (CREATE, RTF, Delimitadores XML, Guardrails Anti-Alucinação) e construa prompts de nível Staff/Principal.'
                : 'LLMs do not read minds; they respond to constraints, structured context, and calibrated personas. Master battle-tested frameworks (CREATE, XML Delimiters, Anti-Hallucination Guardrails) and craft Staff-level prompts.'}
            </p>
          </div>

          {/* Prompt Health Quick Indicator */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{language === 'pt' ? 'Qualidade do Prompt' : 'Prompt Score'}:</span>
              <span className="text-amber-400 font-bold">{promptScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  promptScore >= 80 ? 'bg-emerald-400' : promptScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${promptScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {promptScore === 100
                ? '🏆 Padrão Staff Engineer atingido!'
                : 'Adicione mais restrições e contexto para maximizar precisão.'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center overflow-x-auto gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'builder'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>{language === 'pt' ? '1. Construtor Visual de Prompts' : '1. Visual Prompt Studio'}</span>
          </button>

          <button
            onClick={() => setActiveTab('frameworks')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'frameworks'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'pt' ? '2. Os 8 Princípios & Lógica CoT/ReAct' : '2. Principles & CoT/ReAct Logic'}</span>
          </button>

          <button
            onClick={() => setActiveTab('comparisons')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'comparisons'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{language === 'pt' ? '3. Comparativo: Ruim vs Pro' : '3. Bad vs Pro Comparisons'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gym')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gym'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{language === 'pt' ? '4. Academia de Desafios (Gym)' : '4. Prompt Gym Challenges'}</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{language === 'pt' ? '5. Biblioteca Enterprise (10 Templates)' : '5. Enterprise Library (10 Templates)'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL PROMPT BUILDER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: The 5 Layers of Professional Prompting */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white font-mono">
                  {language === 'pt' ? 'Arquitetura do Prompt em Camadas' : 'Layered Prompt Architecture'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {language === 'pt' ? 'Preencha cada bloco técnico' : 'Fill each technical block'}
              </span>
            </div>

            {/* Layer 1: Persona / Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                <span>1. PERSONA & EXPERTISE (Role Framing)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'Define a profundidade do vocabulário' : 'Calibrates tone and vocabulary'}
                </span>
              </label>
              <input
                type="text"
                value={builderRole}
                onChange={(e) => setBuilderRole(e.target.value)}
                placeholder="Ex: Staff Data Architect especialista em Apache Spark e Delta Lake"
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            {/* Layer 2: Technical Context */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                <span>2. CONTEXTO & DADOS DE ENTRADA (&lt;contexto&gt;)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'Volumetria, tecnologias, versões e schema' : 'Data scale, tech stack, versions'}
                </span>
              </label>
              <textarea
                rows={3}
                value={builderContext}
                onChange={(e) => setBuilderContext(e.target.value)}
                placeholder="Descreva o cenário: bancos envolvidos, volumetria diária, infraestrutura, logs de erro..."
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans resize-none"
              />
            </div>

            {/* Layer 3: Direct Task Directives */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-amber-400 flex items-center justify-between">
                <span>3. TAREFA EXATA & OBJETIVO (&lt;tarefa&gt;)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'Verbo no imperativo, sem ambiguidades' : 'Clear imperative directive'}
                </span>
              </label>
              <textarea
                rows={2}
                value={builderTask}
                onChange={(e) => setBuilderTask(e.target.value)}
                placeholder="Ex: Desenvolva um plano de particionamento e otimização..."
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans resize-none"
              />
            </div>

            {/* Layer 4: Negative Constraints & Guardrails */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-rose-400 flex items-center justify-between">
                <span>4. RESTRIÇÕES & GUARDRAILS (&lt;restricoes&gt;)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'O que a IA NÃO DEVE fazer (anti-alucinação)' : 'What the AI MUST NOT do'}
                </span>
              </label>
              <textarea
                rows={3}
                value={builderConstraints}
                onChange={(e) => setBuilderConstraints(e.target.value)}
                placeholder="Ex: 1. Não sugira aumentar máquinas.\n2. Forneça sintaxe exata em SQL.\n3. Indique trade-offs..."
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans resize-none"
              />
            </div>

            {/* Layer 5: Output Format */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-violet-400 flex items-center justify-between">
                <span>5. FORMATO DE SAÍDA (&lt;formato_de_saida&gt;)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'JSON, Markdown, tabela, snippets' : 'Structured format: Markdown/JSON'}
                </span>
              </label>
              <input
                type="text"
                value={builderOutputFormat}
                onChange={(e) => setBuilderOutputFormat(e.target.value)}
                placeholder="Ex: Tabela de trade-offs seguida por snippets de código prontos para produção"
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
              />
            </div>

            {/* Optional Few-Shot Example */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 flex items-center justify-between">
                <span>6. EXEMPLO DE REFERÊNCIA / FEW-SHOT (Opcional)</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {language === 'pt' ? 'Exemplo de entrada e saída esperada' : 'One good canonical example'}
                </span>
              </label>
              <textarea
                rows={2}
                value={builderFewShot}
                onChange={(e) => setBuilderFewShot(e.target.value)}
                placeholder="Entrada: {...} -> Saída: {...}"
                className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono resize-none"
              />
            </div>
          </div>

          {/* Right Preview: Live Generated Delimited Prompt */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl flex flex-col justify-between h-full shadow-2xl relative">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {language === 'pt' ? 'Prompt Gerado (Padrão Profissional)' : 'Generated Prompt Preview'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    XML Delimited
                  </span>
                </div>

                {/* Code Box */}
                <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-all">
                  {generatedPrompt}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => {
                    handleCopy(generatedPrompt, 'builder');
                    setBuilderCopied(true);
                    setTimeout(() => setBuilderCopied(false), 2500);
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {builderCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{builderCopied ? 'Copiado para Área de Transferência!' : 'Copiar Prompt Pronto'}</span>
                </button>

                <button
                  onClick={handleSimulateExecution}
                  disabled={isSimulatingAI}
                  className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Executar simulação de IA de alta performance"
                >
                  <Zap className={`w-4 h-4 text-amber-300 ${isSimulatingAI ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingAI ? 'Simulando Resposta...' : '⚡ Simular Resposta IA'}</span>
                </button>

                {onOpenChatWithPrompt && (
                  <button
                    onClick={() => onOpenChatWithPrompt(generatedPrompt)}
                    className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    title="Enviar este prompt direto para o Mentor IA no applet"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{language === 'pt' ? 'Testar no Mentor IA' : 'Test in AI Mentor'}</span>
                  </button>
                )}
              </div>

              {/* Simulated Output Card */}
              {simulatedResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Resposta Simulada de IA (Modelo Top-Tier com Raciocínio CoT)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      Padrão Staff Atendido
                    </span>
                  </div>
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {simulatedResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRAMEWORKS & PRINCIPLES */}
      {activeTab === 'frameworks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Principle 1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-cyan-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Role Framing de Alta Precisão
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Nunca diga apenas "Você é um programador". Diga: <em>"Você é um Staff Data Engineer especialista em OOM e Garbage Collection no Spark 3.5 com foco em alocação de memória Tungsten"</em>. A persona calibra o espaço latente do modelo para usar termos técnicos corretos e profundidade analítica.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300">
              💡 Impacto: Elimina respostas superficiais voltadas para iniciantes.
            </div>
          </div>

          {/* Principle 2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-emerald-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Delimitadores Estruturados (XML / Markdown)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              IAs modernas (Gemini 2.5, Claude, GPT-4) processam dados com precisão cirúrgica quando você envolve instruções em tags como <code>&lt;contexto&gt;</code>, <code>&lt;regras&gt;</code>, <code>&lt;schema&gt;</code> e <code>&lt;formato&gt;</code>. Isso impede "Prompt Injections" acidentais e evita que a IA confunda dados de entrada com comandos.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300">
              💡 Impacto: Previne confusão quando você cola logs com texto ambíguo.
            </div>
          </div>

          {/* Principle 3 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-amber-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Restrições Negativas & Anti-Alucinação
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              LLMs têm forte viés de complacência (querem agradar). Se você não definir proibições explícitas, eles inventam bibliotecas, tabelas e parâmetros. Sempre adicione: <em>"Se a resposta não estiver no contexto, declare explicitamente que não há dados suficientes. Não invente colunas."</em>
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-amber-300">
              💡 Impacto: Reduz alucinações em mais de 90% em cenários corporativos.
            </div>
          </div>

          {/* Principle 4 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-violet-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold font-mono">
              04
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Chain-of-Thought (CoT) Explícito
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Peça à IA para: <em>"Pense passo a passo e execute um raciocínio lógico interno antes de apresentar o código final"</em>. Forçar tokens de raciocínio intermediários reduz dramaticamente erros lógicos em algoritmos complexos, particionamento e cálculos matemáticos de FinOps.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-violet-300">
              💡 Impacto: Aumenta a acurácia matemática e de lógica algorítmica.
            </div>
          </div>

          {/* Principle 5 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-pink-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold font-mono">
              05
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Few-Shot Conditioning (Exemplos Canônicos)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Fornecer 1 único exemplo perfeito de entrada e saída (1-Shot) é mais eficaz do que escrever 5 parágrafos de regras. Mostre exatamente o formato de JSON, o padrão de comentários ou a estrutura de CTE SQL que você espera como saída.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-pink-300">
              💡 Impacto: Garante consistência de formatação determinística.
            </div>
          </div>

          {/* Principle 6 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-sky-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold font-mono">
              06
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Structured Outputs & JSON Enforcement
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Para pipelines de dados e integrações via API, instrua a IA a responder usando um JSON Schema rigoroso (com chaves tipadas, arrays e enums). Proíba preâmbulos do tipo "Aqui está sua resposta:". O resultado se torna 100% integrável com código Python e automações.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-sky-300">
              💡 Impacto: Permite integração direta com pipelines e scripts sem regex.
            </div>
          </div>

          {/* Principle 7 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-teal-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold font-mono">
              07
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Padrão ReAct (Reasoning + Action)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Para agentes autônomos de dados, estruture o prompt no loop ReAct: <code>Pensamento: &lt;o que preciso descobrir?&gt;</code> $\to$ <code>Ação: &lt;executar query ou inspecionar log&gt;</code> $\to$ <code>Observação: &lt;resultado da ação&gt;</code> $\to$ <code>Conclusão Final</code>. Isso impede saltos ilógicos e alucinações de causa raiz.
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-teal-300">
              💡 Impacto: Padrão ouro para agentes em LangChain, LlamaIndex e Databricks AI.
            </div>
          </div>

          {/* Principle 8 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 hover:border-rose-500/50 transition-all">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold font-mono">
              08
            </div>
            <h3 className="text-sm font-bold text-white font-mono">
              Tree-of-Thoughts (ToT) & Auto-Crítica
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Para decisões de alto risco (ex: migração de Lakehouse), instrua o modelo a explorar 3 ramos independentes de raciocínio, avaliar os prós e contras de cada um criticamente e descartar os caminhos sub-ótimos antes de redigir a recomendação final: <em>"Aponte 2 falhas graves nesta abordagem antes de aprová-la."</em>
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] font-mono text-rose-300">
              💡 Impacto: Produz pareceres técnicos com rigor de comitê de arquitetura.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BAD VS PRO COMPARISONS */}
      {activeTab === 'comparisons' && (
        <div className="flex flex-col gap-6">
          {COMPARISONS.map((comp) => (
            <div
              key={comp.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase font-bold">
                    {comp.category}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {comp.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bad Prompt Box */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold mb-2">
                      <XCircle className="w-4 h-4" />
                      <span>PROMPT INGENUO / RUIM (Como 90% escrevem)</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 italic mb-3">
                      "{comp.badPrompt}"
                    </div>
                    <div className="text-xs text-rose-200/80 leading-relaxed">
                      <strong>Por que falha:</strong> {comp.badReason}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-rose-900/40 text-[11px] text-slate-400 font-mono">
                    ⚠️ Resultado típico: {comp.badResult}
                  </div>
                </div>

                {/* Pro Prompt Box */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>PROMPT PROFISSIONAL / SÊNIOR (Engenharia Real)</span>
                      </div>
                      <button
                        onClick={() => handleCopy(comp.proPrompt, comp.id)}
                        className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                      >
                        {copiedId === comp.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === comp.id ? 'Copiado!' : 'Copiar Pro'}</span>
                      </button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-200 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto mb-3 select-all">
                      {comp.proPrompt}
                    </div>
                    <div className="text-xs text-emerald-200/80 leading-relaxed">
                      <strong>Por que vence:</strong> {comp.proReason}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-900/40 text-[11px] text-emerald-300 font-mono">
                    ✅ Resultado obtido: {comp.proResult}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PROMPT GYM CHALLENGES */}
      {activeTab === 'gym' && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Academia de Testes de Prompting (+50 XP por acerto)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Avalie cenários reais de engenharia de dados e identifique como arquitetar o prompt perfeito.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {GYM_EXERCISES.map((ex, index) => {
              const selected = gymAnswers[ex.id];
              const isSubmitted = gymSubmitted[ex.id];
              const isCorrect = selected === ex.correctIndex;

              return (
                <div
                  key={ex.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
                    <span>DESAFIO 0{index + 1}</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                    <strong>Cenário:</strong> {ex.scenario}
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {ex.question}
                  </h3>

                  <div className="flex flex-col gap-2">
                    {ex.options.map((opt, optIdx) => {
                      let itemStyle =
                        'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40';

                      if (selected === optIdx) {
                        itemStyle = 'bg-cyan-500/10 border-cyan-500/60 text-cyan-200';
                      }

                      if (isSubmitted) {
                        if (optIdx === ex.correctIndex) {
                          itemStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                        } else if (selected === optIdx && !isCorrect) {
                          itemStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectGymOption(ex.id, optIdx)}
                          disabled={isSubmitted}
                          className={`p-3.5 rounded-xl border text-left text-xs font-sans transition-all flex items-start gap-3 ${itemStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitGymExercise(ex.id)}
                      disabled={selected === undefined}
                      className="mt-2 py-2.5 px-5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl font-mono transition-all self-start"
                    >
                      Validar Resposta
                    </button>
                  ) : (
                    <div
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="font-bold font-mono mb-1">
                        {isCorrect ? '✅ Resposta Correta (+50 XP)!' : '❌ Resposta Incorreta!'}
                      </div>
                      <p>{ex.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: READY TEMPLATES LIBRARY */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between gap-4 backdrop-blur-xl shadow-xl hover:border-amber-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-bold">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-white">
                  {language === 'pt' ? tpl.titlePt : tpl.titleEn}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  {language === 'pt' ? tpl.descriptionPt : tpl.descriptionEn}
                </p>

                <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                  {tpl.promptText}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(tpl.promptText, tpl.id)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === tpl.id ? 'Copiado!' : 'Copiar Template'}</span>
                </button>

                {onOpenChatWithPrompt && (
                  <button
                    onClick={() => onOpenChatWithPrompt(tpl.promptText)}
                    className="py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    title="Testar prompt no Mentor IA"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Testar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
