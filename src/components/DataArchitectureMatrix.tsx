import React, { useState, useMemo } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Clock,
  Terminal,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';
import { PipelineCanvasStudio } from './PipelineCanvasStudio';
import { ProductionIncidentWarRoom } from './ProductionIncidentWarRoom';
import { SystemDesignChallenges } from './SystemDesignChallenges';

interface ArchitectureBattle {
  id: string;
  titlePt: string;
  titleEn: string;
  category: string;
  contenders: {
    name: string;
    taglinePt: string;
    taglineEn: string;
    bestForPt: string;
    bestForEn: string;
    latency: string;
    cost: 'Baixo' | 'Médio' | 'Alto';
    complexity: 'Baixa' | 'Média' | 'Alta' | 'Muito Alta';
    prosPt: string[];
    prosEn: string[];
    consPt: string[];
    consEn: string[];
  }[];
  architecturalRulePt: string;
  architecturalRuleEn: string;
}

const COMPARISON_BATTLES: ArchitectureBattle[] = [
  {
    id: 'streaming-vs-batch',
    titlePt: 'Streaming Contínuo vs Batch Processing',
    titleEn: 'Continuous Streaming vs Batch Processing',
    category: 'Ingestão & Processamento',
    contenders: [
      {
        name: 'Streaming (Flink / Spark Streaming)',
        taglinePt: 'Processamento de eventos em milissegundos / segundos',
        taglineEn: 'Event-by-event processing in milliseconds to seconds',
        bestForPt: 'Detecção de fraude, telemetria IoT, dashboards operacionais em tempo real e notificações imediatas.',
        bestForEn: 'Fraud detection, IoT telemetry, real-time operational dashboards, and immediate alerts.',
        latency: '< 100ms - 5s',
        cost: 'Alto',
        complexity: 'Alta',
        prosPt: [
          'Visibilidade operacional imediata',
          'Janelamento temporal dinâmico (Tumbling, Sliding, Session)',
          'Resolução de problemas antes de impactar o negócio',
        ],
        prosEn: [
          'Immediate operational visibility',
          'Dynamic event-time windowing (Tumbling, Sliding, Session)',
          'Incident mitigation before customer impact',
        ],
        consPt: [
          'Infraestrutura computacional ligada 24/7 (custo mais elevado)',
          'Depuração e reprocessamento histórico complexos',
          'Lidança com eventos atrasados (watermarks)',
        ],
        consEn: [
          'Infrastructure runs 24/7 (higher cloud compute bill)',
          'Historical backfill and debugging is harder',
          'Managing out-of-order data and watermarking overhead',
        ],
      },
      {
        name: 'Batch Processing (Spark Batch / DBT)',
        taglinePt: 'Processamento periódico em lotes (hora, dia)',
        taglineEn: 'Periodic scheduled processing in discrete chunks (hourly/daily)',
        bestForPt: 'Relatórios executivos diários, fechamento contábil, agregação massiva e treinamento de modelos de ML.',
        bestForEn: 'Daily executive BI reports, financial reconciliation, massive aggregations, and ML model training.',
        latency: 'Minutos a Horas',
        cost: 'Médio',
        complexity: 'Baixa',
        prosPt: [
          'Clusters sob demanda (scale-to-zero) barateiam custos',
          'Reprocessamento histórico (backfilling) trivial e previsível',
          'Otimização global de consultas com planos analíticos avançados',
        ],
        prosEn: [
          'On-demand compute clusters (scale-to-zero saves budget)',
          'Trivial and predictable historical backfilling',
          'Full global query optimization across bounded data',
        ],
        consPt: [
          'Dados obsoletos até a próxima execução agendada',
          'Picos violentos de carga na janela de ingestão',
          'Atraso na tomada de decisões em incidentes',
        ],
        consEn: [
          'Data is stale until the next batch executes',
          'Huge traffic spikes during scheduled cron windows',
          'Delayed reaction time for critical events',
        ],
      },
    ],
    architecturalRulePt:
      'Regra de Ouro: "Streaming é uma otimização de latência, não de capacidade". Se o tomador de decisão só consulta a métrica uma vez por manhã, você não precisa de um pipeline de streaming custando centenas de dólares por dia.',
    architecturalRuleEn:
      'Golden Rule: "Streaming is a latency optimization, not a throughput optimization". If business users only look at numbers at 9 AM, do not maintain a 24/7 streaming cluster burning cloud budget.',
  },
  {
    id: 'lakehouse-formats',
    titlePt: 'Apache Iceberg vs Delta Lake vs Apache Hudi',
    titleEn: 'Apache Iceberg vs Delta Lake vs Apache Hudi',
    category: 'Formatos de Tabela ACID no Lakehouse',
    contenders: [
      {
        name: 'Apache Iceberg',
        taglinePt: 'Padrão aberto universal desacoplado de engine',
        taglineEn: 'Universal open standard decoupled from any single compute engine',
        bestForPt: 'Ambientes multi-engine (Trino, Spark, Flink, Snowflake, ClickHouse) com governança estrita.',
        bestForEn: 'Multi-engine ecosystems (Trino, Spark, Flink, Snowflake, ClickHouse) demanding strict catalog neutrality.',
        latency: 'Sub-segundo (Metadados O(1))',
        cost: 'Baixo',
        complexity: 'Média',
        prosPt: [
          'Árvore de metadados em snapshots hierárquicos sem listar arquivos',
          'Evolução de partição oculta (Hidden Partitioning) sem reescrever tabelas',
          'Adoção massiva por Snowflake, AWS Athena, BigQuery e Starburst',
        ],
        prosEn: [
          'Hierarchical snapshot metadata avoiding costly filesystem LIST operations',
          'Hidden partitioning allows evolving partition schemes without table rewrites',
          'Universal adoption across Snowflake, Athena, BigQuery, and Starburst',
        ],
        consPt: [
          'Exige catálogo central robusto (Nessie, Polaris, AWS Glue ou REST Catalog)',
          'Operações de compactação periódicas necessárias para evitar pequenos arquivos',
        ],
        consEn: [
          'Requires a centralized catalog (Nessie, Polaris, Glue, or REST catalog)',
          'Requires background compaction jobs to clean orphaned files',
        ],
      },
      {
        name: 'Delta Lake (Databricks)',
        taglinePt: 'Formato ultra-maduro focado em ecossistema Spark',
        taglineEn: 'Ultra-mature format deeply optimized for Apache Spark & Databricks',
        bestForPt: 'Equipes que utilizam Apache Spark e Databricks intensamente com CDC e ACID nativo.',
        bestForEn: 'Teams heavily standardized on Apache Spark and Databricks with native CDC and ACID.',
        latency: 'Sub-segundo com Caching',
        cost: 'Médio',
        complexity: 'Baixa',
        prosPt: [
          'Log de transações (_delta_log) JSON com checkpoints Parquet atômicos',
          'Suporte nativo a Z-Order Clustering e Liquid Clustering',
          'Funcionalidade Change Data Feed (CDF) madura para streaming CDC',
        ],
        prosEn: [
          'JSON transaction log (_delta_log) with atomic Parquet checkpoints',
          'First-class Z-Order and Liquid Clustering optimization',
          'Mature Change Data Feed (CDF) for event-driven downstream pipelines',
        ],
        consPt: [
          'Historicamente mais acoplado ao Spark (Delta UniForm vem melhorando isso)',
          'Dependência maior de features proprietárias na versão comercial da Databricks',
        ],
        consEn: [
          'Historically Spark-centric (though Delta UniForm is bridging the gap)',
          'Certain performance knobs tied to commercial Databricks platform',
        ],
      },
      {
        name: 'Apache Hudi',
        taglinePt: 'Especialista em ingestão incremental e CDC em tempo real',
        taglineEn: 'Specialist in incremental updates, low-latency CDC and upserts',
        bestForPt: 'Pipelines com alto volume de UPSERTs/DELETEs frequentes vindos de bancos transacionais OLTP.',
        bestForEn: 'Pipelines with massive frequencies of UPSERTs and DELETEs streamed from operational OLTP databases.',
        latency: 'Near-real-time (MoR)',
        cost: 'Médio',
        complexity: 'Alta',
        prosPt: [
          'Merge-On-Read (MoR) nativo grava deltas em formato de log Avro sem reescrever Parquet',
          'Geração automática de chaves e índices de registro para deduplicação rápida',
          'Suporte avançado a ingestão de CDC com Debezium',
        ],
        prosEn: [
          'Merge-On-Read (MoR) writes delta logs in Avro without immediate Parquet rewriting',
          'Built-in record-level indexing for ultra-fast deduplication',
          'First-class Debezium CDC ingestion integration',
        ],
        consPt: [
          'Curva de aprendizado mais íngreme e configurações de índices complexas',
          'Menor tração no mercado analítico puro em comparação com Iceberg e Delta',
        ],
        consEn: [
          'Steeper configuration curve with dozens of internal indexing knobs',
          'Less mainstream analytical engine adoption than Iceberg and Delta',
        ],
      },
    ],
    architecturalRulePt:
      'Regra de Ouro: Se você tem várias ferramentas consultando o mesmo Lake (Trino + Spark + Snowflake), escolha Apache Iceberg. Se o seu ecossistema é 90% Databricks/Spark, Delta Lake é a escolha natural.',
    architecturalRuleEn:
      'Golden Rule: For diverse multi-engine setups (Trino + Snowflake + Spark), choose Apache Iceberg. If 90% of your stack is Databricks/Spark, Delta Lake provides the most seamless experience.',
  },
  {
    id: 'columnar-vs-row',
    titlePt: 'Armazenamento Colunar (Parquet/ClickHouse) vs Linha (PostgreSQL/OLTP)',
    titleEn: 'Columnar Storage (Parquet/ClickHouse) vs Row-Oriented (PostgreSQL/OLTP)',
    category: 'Layout de Memória & I/O de Disco',
    contenders: [
      {
        name: 'Colunar (Parquet / ORC / ClickHouse)',
        taglinePt: 'Dados do mesmo campo armazenados contíguos em disco',
        taglineEn: 'Values of the same column stored contiguously on disk',
        bestForPt: 'Consultas analíticas OLAP que agregam (SUM, AVG, COUNT) milhões de linhas em poucas colunas.',
        bestForEn: 'OLAP analytical queries aggregating millions of rows across a few projected columns.',
        latency: 'Micro-segundos por coluna',
        cost: 'Baixo',
        complexity: 'Média',
        prosPt: [
          'I/O de disco reduzido: lê apenas as colunas solicitadas no SELECT',
          'Compressão extrema (ZSTD, Snappy, RLE) pois dados do mesmo tipo ficam juntos',
          'Vetorização SIMD na CPU moderna para processamento de bilhões de linhas/seg',
        ],
        prosEn: [
          'Massive I/O reduction: reads strictly the columns declared in SELECT',
          'Extreme compression ratios (80%+) because identical data types sit together',
          'Modern CPU SIMD vectorization crunching billions of rows per second',
        ],
        consPt: [
          'Gravação de uma única linha (INSERT individual) é muito lenta e ineficiente',
          'Inadequado para sistemas transacionais OLTP com commits atômicos individuais',
        ],
        consEn: [
          'Single-row INSERT statements are slow and cause fragmentation',
          'Unusable for high-frequency point transaction OLTP applications',
        ],
      },
      {
        name: 'Orientado a Linhas (PostgreSQL / MySQL)',
        taglinePt: 'Registros completos armazenados sequencialmente em páginas de 8KB',
        taglineEn: 'Full row records stored sequentially in 8KB disk pages',
        bestForPt: 'Sistemas transacionais OLTP (e-commerce, bancos, cadastros) com busca por chave primária.',
        bestForEn: 'Transactional OLTP apps (e-commerce checkout, banking, user auth) with PK point lookups.',
        latency: '< 1ms para busca pontual',
        cost: 'Alto',
        complexity: 'Baixa',
        prosPt: [
          'INSERT, UPDATE e DELETE de registros individuais instantâneos com ACID',
          'Ideal para SELECT * WHERE id = 12345 (recupera todo o registro em 1 I/O)',
          'Índices B-Tree ultra-rápidos para integridade referencial',
        ],
        prosEn: [
          'Instantaneous single-row INSERT, UPDATE, and DELETE with full ACID isolation',
          'Optimal for SELECT * WHERE id = 12345 (reads entire row in one I/O seek)',
          'Robust B-Tree indexes enforcing relational foreign keys',
        ],
        consPt: [
          'Consultas analíticas de agregação precisam ler todas as colunas de todas as linhas do disco',
          'Compressão muito inferior devido à variedade de tipos de dados contíguos',
        ],
        consEn: [
          'Analytical aggregations must drag every unused column from disk to RAM',
          'Inferior compression because disparate data types sit adjacent on pages',
        ],
      },
    ],
    architecturalRulePt:
      'Regra de Ouro: Nunca execute relatórios analíticos de inteligência de mercado direto no banco PostgreSQL de produção. Faça CDC para Parquet no Lakehouse e consulte em formato colunar.',
    architecturalRuleEn:
      'Golden Rule: Never run analytical aggregate reports directly on production OLTP PostgreSQL. Stream CDC into Parquet in your Lakehouse and query column-oriented storage.',
  },
];

export const DataArchitectureMatrix: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Active view: battles, calculator, canvas studio, warroom incident simulator, or system design challenges
  const [activeSubView, setActiveSubView] = useState<'battles' | 'calculator' | 'canvas' | 'warroom' | 'challenges'>('battles');
  const [selectedBattleId, setSelectedBattleId] = useState<string>(COMPARISON_BATTLES[0].id);

  // Calculator Parameters
  const [throughput, setThroughput] = useState<number>(5000); // events per second
  const [latencyReq, setLatencyReq] = useState<'realtime' | 'near-realtime' | 'batch'>('near-realtime');
  const [mutationRate, setMutationRate] = useState<'append' | 'moderate' | 'high-cdc'>('moderate');
  const [queryPattern, setQueryPattern] = useState<'bi-dashboard' | 'ad-hoc' | 'ml-feature'>('bi-dashboard');
  const [cloudBudget, setCloudBudget] = useState<'low' | 'balanced' | 'enterprise'>('balanced');
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);

  const currentBattle = COMPARISON_BATTLES.find((b) => b.id === selectedBattleId) || COMPARISON_BATTLES[0];

  // Calculated Reference Architecture Recommendation
  const recommendation = useMemo(() => {
    let ingestionTool = 'Apache Kafka';
    let streamEngine = 'Spark Structured Streaming';
    let storageFormat = 'Apache Iceberg (Parquet)';
    let servingEngine = 'Trino / Starburst';
    let costTier = '$$$';
    let estimatedMonthly = '$800 - $2,500/mês';

    if (throughput < 1000 && latencyReq === 'batch') {
      ingestionTool = 'Airbyte / Fivetran + S3 Bucket';
      streamEngine = 'dbt Core + DuckDB / Postgres';
      storageFormat = 'Apache Parquet particionado';
      servingEngine = 'DuckDB / Superset';
      costTier = '$';
      estimatedMonthly = '$80 - $350/mês';
    } else if (latencyReq === 'realtime') {
      ingestionTool = 'Apache Kafka / Redpanda Cluster';
      streamEngine = 'Apache Flink (Stateful Streaming)';
      storageFormat = mutationRate === 'high-cdc' ? 'Apache Hudi (Merge-On-Read)' : 'Apache Iceberg v2';
      servingEngine = 'ClickHouse / Apache Pinot';
      costTier = '$$$$';
      estimatedMonthly = '$2,800 - $7,000/mês';
    } else if (cloudBudget === 'low') {
      ingestionTool = 'AWS Kinesis / Debezium CDC';
      streamEngine = 'Spark on AWS EMR Serverless (Micro-batch 5m)';
      storageFormat = 'Delta Lake com Z-Order';
      servingEngine = 'AWS Athena v3 (Presto engine)';
      costTier = '$$';
      estimatedMonthly = '$300 - $1,100/mês';
    } else if (mutationRate === 'high-cdc') {
      ingestionTool = 'Debezium CDC + Kafka';
      streamEngine = 'Spark Streaming (Delta CDF)';
      storageFormat = 'Apache Iceberg / Delta Lake';
      servingEngine = 'Trino + Snowflake Iceberg Tables';
      costTier = '$$$';
      estimatedMonthly = '$1,500 - $4,200/mês';
    }

    const architecturalSummary =
      `Arquitetura Recomendada: Ingestão com ${ingestionTool} -> Processamento via ${streamEngine} ` +
      `-> Camada de Armazenamento ACID ${storageFormat} -> Consulta Analítica via ${servingEngine}. ` +
      `Desenhado para suportar ${throughput.toLocaleString()} eventos/segundo com SLA de latência ${latencyReq}.`;

    return {
      ingestionTool,
      streamEngine,
      storageFormat,
      servingEngine,
      costTier,
      estimatedMonthly,
      summary: architecturalSummary,
    };
  }, [throughput, latencyReq, mutationRate, queryPattern, cloudBudget]);

  const handleCopyArchitecture = () => {
    navigator.clipboard.writeText(recommendation.summary);
    setCopiedBlueprint(true);
    sound.playSuccess();
    addXp(25);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-View Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
              {language === 'pt' ? 'Módulo Arquitetural Avançado' : 'Advanced Architectural Module'}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Trade-offs Reais
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {language === 'pt'
              ? 'Matriz de Arquitetura & Calculadora de Decisão'
              : 'Data Architecture Matrix & Sizing Calculator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {language === 'pt'
              ? 'Não existem soluções perfeitas em Engenharia de Dados, apenas trade-offs. Compare tecnologias lado a lado e dimensione o stack ideal para a escala do seu negócio.'
              : 'There are no silver bullets in Data Engineering, only trade-offs. Compare technologies side-by-side and size your optimal data stack.'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveSubView('battles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeSubView === 'battles'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Matriz de Trade-offs' : 'Trade-offs'}</span>
          </button>
          <button
            onClick={() => setActiveSubView('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeSubView === 'calculator'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Calculadora de Stack' : 'Sizing'}</span>
          </button>
          <button
            onClick={() => setActiveSubView('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeSubView === 'canvas'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Pipeline Canvas' : 'Pipeline'}</span>
          </button>
          <button
            onClick={() => {
              setActiveSubView('warroom');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeSubView === 'warroom'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'War Room SEV-1' : 'War Room SEV-1'}</span>
            <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 rounded uppercase font-bold">Crises</span>
          </button>
          <button
            onClick={() => {
              setActiveSubView('challenges');
              sound.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeSubView === 'challenges'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Desafios de Arquitetura' : 'System Design'}</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded uppercase font-bold">Puzzles</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRADE-OFF BATTLES */}
      {activeSubView === 'battles' && (
        <div className="space-y-6">
          {/* Battle Selector Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COMPARISON_BATTLES.map((battle) => (
              <button
                key={battle.id}
                onClick={() => {
                  setSelectedBattleId(battle.id);
                  sound.playClick();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                  selectedBattleId === battle.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                }`}
              >
                {language === 'pt' ? battle.titlePt : battle.titleEn}
              </button>
            ))}
          </div>

          {/* Active Battle Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {currentBattle.category}
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {language === 'pt' ? currentBattle.titlePt : currentBattle.titleEn}
              </h3>
            </div>

            {/* Contenders Grid */}
            <div className={`grid grid-cols-1 ${currentBattle.contenders.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {currentBattle.contenders.map((contender, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-extrabold text-white">
                        {contender.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {contender.latency}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {language === 'pt' ? contender.taglinePt : contender.taglineEn}
                    </p>

                    {/* Best For */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 mb-4">
                      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'pt' ? 'Quando Utilizar:' : 'Best Used For:'}
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">
                        {language === 'pt' ? contender.bestForPt : contender.bestForEn}
                      </p>
                    </div>

                    {/* Vantagens */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        {language === 'pt' ? 'Vantagens (Pros):' : 'Pros:'}
                      </div>
                      {(language === 'pt' ? contender.prosPt : contender.prosEn).map((pro, pIdx) => (
                        <div key={pIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{pro}</span>
                        </div>
                      ))}
                    </div>

                    {/* Desvantagens */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                        {language === 'pt' ? 'Trade-offs & Desvantagens:' : 'Cons & Trade-offs:'}
                      </div>
                      {(language === 'pt' ? contender.consPt : contender.consEn).map((con, cIdx) => (
                        <div key={cIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      <span>{language === 'pt' ? 'Custo:' : 'Cost:'} </span>
                      <span className={`font-bold ${
                        contender.cost === 'Baixo' ? 'text-emerald-400' : contender.cost === 'Médio' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {contender.cost}
                      </span>
                    </div>
                    <div>
                      <span>{language === 'pt' ? 'Complexidade:' : 'Complexity:'} </span>
                      <span className="text-slate-200 font-bold">
                        {contender.complexity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Golden Rule Insight */}
            <div className="p-4 bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                  {language === 'pt' ? currentBattle.architecturalRulePt : currentBattle.architecturalRuleEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ARCHITECTURE SIZING ENGINE / CALCULATOR */}
      {activeSubView === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel (Left) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                {language === 'pt' ? 'Parâmetros do Seu Cenário' : 'Scenario Parameters'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'pt'
                  ? 'Ajuste os parâmetros de negócio para simular a arquitetura ideal.'
                  : 'Tune operational parameters to compute your target reference architecture.'}
              </p>
            </div>

            {/* Slider 1: Throughput */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-bold">
                  {language === 'pt' ? 'Volume de Eventos / Ingestão:' : 'Throughput Rate:'}
                </span>
                <span className="text-cyan-400 font-bold">
                  {throughput.toLocaleString()} {language === 'pt' ? 'eventos/seg' : 'events/sec'}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="500"
                value={throughput}
                onChange={(e) => setThroughput(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>100 evt/s (Startup)</span>
                <span>10k evt/s (Mid)</span>
                <span>100k evt/s (Fintech)</span>
              </div>
            </div>

            {/* Selector 2: Latency SLA */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 block">
                {language === 'pt' ? 'Requisito de Latência de Dados:' : 'Latency SLA Requirement:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'realtime', labelPt: 'Sub-segundo', labelEn: '< 1s Real-time' },
                  { id: 'near-realtime', labelPt: '1-5 min', labelEn: '1-5 min Micro' },
                  { id: 'batch', labelPt: 'Horas/Dia', labelEn: 'Hours / Daily' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLatencyReq(item.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                      latencyReq === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {language === 'pt' ? item.labelPt : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 3: Mutation / CDC rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 block">
                {language === 'pt' ? 'Frequência de Atualizações (UPSERT/CDC):' : 'Mutation & CDC Frequency:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'append', labelPt: 'Append-Only', labelEn: 'Append-Only' },
                  { id: 'moderate', labelPt: 'Moderado', labelEn: 'Moderate' },
                  { id: 'high-cdc', labelPt: 'Alto CDC', labelEn: 'High CDC' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMutationRate(item.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                      mutationRate === item.id
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {language === 'pt' ? item.labelPt : item.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector 4: Budget tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 block">
                {language === 'pt' ? 'Orçamento de Nuvem Estimado:' : 'Target Cloud Budget Tier:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', labelPt: 'Econômico', labelEn: 'Frugal / Lean' },
                  { id: 'balanced', labelPt: 'Equilibrado', labelEn: 'Balanced' },
                  { id: 'enterprise', labelPt: 'Enterprise', labelEn: 'Enterprise' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCloudBudget(item.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                      cloudBudget === item.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {language === 'pt' ? item.labelPt : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blueprint Output Panel (Right) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {language === 'pt' ? 'Arquitetura Recomendada' : 'Computed Blueprint'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {language === 'pt' ? 'Blueprint de Referência' : 'Reference Target Stack'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {language === 'pt' ? 'Estimativa de Nuvem:' : 'Estimated Compute:'}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {recommendation.estimatedMonthly}
                  </span>
                </div>
              </div>

              {/* Visual Pipeline Flow Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Ingestion */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold mb-1">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-[11px]">1</span>
                    <span>{language === 'pt' ? 'Ingestão / Buffer' : 'Ingestion / Buffer'}</span>
                  </div>
                  <p className="text-sm font-black text-white">{recommendation.ingestionTool}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {throughput > 20000 ? 'Particionamento em 24 partições com log retention 7d' : 'Particionamento leve com auto-scaling'}
                  </p>
                </div>

                {/* 2. Compute */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold mb-1">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center text-[11px]">2</span>
                    <span>{language === 'pt' ? 'Motor de Computação' : 'Compute & Transformations'}</span>
                  </div>
                  <p className="text-sm font-black text-white">{recommendation.streamEngine}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {latencyReq === 'realtime' ? 'Processamento event-by-event com State Backend RocksDB' : 'Micro-batch incremental com checkpointing no Lake'}
                  </p>
                </div>

                {/* 3. Storage */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-[11px]">3</span>
                    <span>{language === 'pt' ? 'Camada Lakehouse (ACID)' : 'ACID Lakehouse Storage'}</span>
                  </div>
                  <p className="text-sm font-black text-white">{recommendation.storageFormat}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {mutationRate === 'high-cdc' ? 'Merge-On-Read para absorver mutações sem reescrever Parquet' : 'Copy-On-Write com Z-Order / MinMax pushdown'}
                  </p>
                </div>

                {/* 4. Serving */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold mb-1">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-[11px]">4</span>
                    <span>{language === 'pt' ? 'Camada Analítica / Serving' : 'Serving & Analytics Query'}</span>
                  </div>
                  <p className="text-sm font-black text-white">{recommendation.servingEngine}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {latencyReq === 'realtime' ? 'Consultas analíticas sub-segundo direto em RAM colunar' : 'Consultas federadas ANSI-SQL diretamente sobre o Lake'}
                  </p>
                </div>
              </div>

              {/* Textual Architecture Brief */}
              <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
                <span className="text-amber-400 font-bold">{'>'} Justificativa Arquitetural: </span>
                {recommendation.summary}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {language === 'pt' ? 'Ganha +25 XP ao copiar a especificação' : 'Earn +25 XP copying this spec'}
              </span>
              <button
                onClick={handleCopyArchitecture}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {copiedBlueprint ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBlueprint ? (language === 'pt' ? 'Copiado!' : 'Copied!') : (language === 'pt' ? 'Copiar Especificação' : 'Copy Spec')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PIPELINE CANVAS STUDIO */}
      {activeSubView === 'canvas' && <PipelineCanvasStudio />}

      {/* VIEW 4: WAR ROOM SEV-1 INCIDENT SIMULATOR */}
      {activeSubView === 'warroom' && <ProductionIncidentWarRoom />}

      {/* VIEW 5: SYSTEM DESIGN CHALLENGES & PUZZLES */}
      {activeSubView === 'challenges' && <SystemDesignChallenges />}
    </div>
  );
};
