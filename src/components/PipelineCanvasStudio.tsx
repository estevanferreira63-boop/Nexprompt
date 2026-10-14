import React, { useState, useMemo } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Zap,
  Activity,
  Sliders,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Server,
  RefreshCw,
  HardDrive,
  Bot,
  Play,
  Pause,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

interface PipelineNode {
  id: string;
  name: string;
  category: 'source' | 'broker' | 'compute' | 'storage' | 'serving';
  descriptionPt: string;
  descriptionEn: string;
  tech: string;
  latencyMs: number;
  costPerHour: number;
  metrics: {
    label: string;
    value: string;
  }[];
}

export const PipelineCanvasStudio: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [streamEngine, setStreamEngine] = useState<'spark' | 'flink'>('flink');
  const [trafficVolume, setTrafficVolume] = useState<number>(50000); // msgs/sec
  const [selectedNodeId, setSelectedNodeId] = useState<string>('broker');
  const [isFlowActive, setIsFlowActive] = useState<boolean>(true);

  // Dynamic Metrics Calculation based on Traffic and Engine
  const pipelineMetrics = useMemo(() => {
    const isFlink = streamEngine === 'flink';
    const computeLatency = isFlink ? 45 : 1800; // ms
    const brokerLatency = 12; // ms
    const bronzeLatency = isFlink ? 120 : 1200; // ms
    const silverLatency = isFlink ? 250 : 2500; // ms
    const totalLatencyMs = brokerLatency + computeLatency + bronzeLatency + silverLatency;

    // Monthly Cost estimation ($)
    const trafficScale = trafficVolume / 10000;
    const baseBrokerCost = 140 * trafficScale;
    const computeCost = (isFlink ? 380 : 260) * trafficScale;
    const storageCost = 85 * trafficScale;
    const servingCost = 190;
    const totalMonthlyCost = Math.round(baseBrokerCost + computeCost + storageCost + servingCost);

    return {
      totalLatencyMs,
      totalMonthlyCost,
      dataThroughputMBs: (trafficVolume * 0.85) / 1024,
      totalPartitions: Math.max(6, Math.ceil(trafficVolume / 10000) * 2),
    };
  }, [trafficVolume, streamEngine]);

  const nodes: Record<string, PipelineNode> = {
    source: {
      id: 'source',
      name: 'Event Producers (CDC & IoT)',
      category: 'source',
      tech: 'Debezium + REST Gateways',
      descriptionPt: 'Transações OLTP capturadas via CDC do PostgreSQL e telemetria de aplicativos móveis.',
      descriptionEn: 'OLTP transactions captured via Postgres CDC alongside mobile application events.',
      latencyMs: 5,
      costPerHour: 0.15,
      metrics: [
        { label: 'Ingestion Protocol', value: 'HTTP/2 + Avro' },
        { label: 'Event Size', value: '~850 bytes' },
        { label: 'Failure Strategy', value: 'Exponential Backoff' },
      ],
    },
    broker: {
      id: 'broker',
      name: 'Message Broker (Event Hub)',
      category: 'broker',
      tech: 'Apache Kafka / Redpanda',
      descriptionPt: 'Log distribuído particionado por order_id. Absorve rajadas com garantia At-Least-Once.',
      descriptionEn: 'Distributed log partitioned by key. Absorbs peak traffic spikes with At-Least-Once durability.',
      latencyMs: 12,
      costPerHour: 0.45,
      metrics: [
        { label: 'Partições Ativas', value: `${pipelineMetrics.totalPartitions}` },
        { label: 'Replication Factor', value: 'RF=3 (ISR min=2)' },
        { label: 'Retention Period', value: '7 dias (Tiered S3)' },
      ],
    },
    compute: {
      id: 'compute',
      name: streamEngine === 'flink' ? 'Stream Processing (Flink Stateful)' : 'Micro-Batching (Spark Streaming)',
      category: 'compute',
      tech: streamEngine === 'flink' ? 'Apache Flink (RocksDB State)' : 'Spark 3.5 AQE Structured Streaming',
      descriptionPt:
        streamEngine === 'flink'
          ? 'Processamento evento-a-evento contínuo com janelas temporais de 5s e Exactly-Once via Chandy-Lamport.'
          : 'Micro-batches de 2 a 3 segundos com Adaptive Query Execution e checkpointing de offset.',
      descriptionEn:
        streamEngine === 'flink'
          ? 'Continuous event-by-event streaming with stateful 5s windows and Chandy-Lamport Exactly-Once.'
          : 'Micro-batches of 2-3 seconds with Adaptive Query Execution and offset checkpointing.',
      latencyMs: streamEngine === 'flink' ? 45 : 1800,
      costPerHour: streamEngine === 'flink' ? 1.2 : 0.85,
      metrics: [
        { label: 'Processing Semantics', value: 'Exactly-Once Atômico' },
        { label: 'State Backend', value: streamEngine === 'flink' ? 'RocksDB NVMe' : 'HDFS/S3 Checkpoint' },
        { label: 'Watermark Lag', value: '10 segundos tolerância' },
      ],
    },
    bronze: {
      id: 'bronze',
      name: 'Lakehouse Bronze Layer',
      category: 'storage',
      tech: 'Delta Lake / Apache Iceberg',
      descriptionPt: 'Dados crus imutáveis preservados em Parquet com metadados ACID. Permite replay histórico total.',
      descriptionEn: 'Immutable raw data in snappy Parquet with ACID metadata. Enables 100% historical replays.',
      latencyMs: streamEngine === 'flink' ? 120 : 1200,
      costPerHour: 0.35,
      metrics: [
        { label: 'Storage Format', value: 'Parquet + Snappy' },
        { label: 'Schema Enforcement', value: 'MergeSchema habilitado' },
        { label: 'Retention Policy', value: 'Time-travel 30 dias' },
      ],
    },
    silver: {
      id: 'silver',
      name: 'Lakehouse Silver Layer',
      category: 'storage',
      tech: 'dbt Core + Delta ACID Merges',
      descriptionPt: 'Camada limpa e desduplicada. CDC aplicado com SCD Tipo 2 e mascaramento dinâmico de PII.',
      descriptionEn: 'Clean, deduplicated layer. CDC applied via SCD Type 2 with dynamic PII masking applied.',
      latencyMs: 250,
      costPerHour: 0.45,
      metrics: [
        { label: 'Deduplication Key', value: 'order_id + event_time' },
        { label: 'Data Quality', value: 'Great Expectations (99.9%)' },
        { label: 'Z-Order Clustering', value: 'order_date, customer_id' },
      ],
    },
    gold: {
      id: 'gold',
      name: 'Lakehouse Gold & Serving',
      category: 'serving',
      tech: 'Trino + StarRocks + DuckDB',
      descriptionPt: 'Marts dimensionais agregados prontos para queries sub-segundo de BI, LLMs e detecção de fraude.',
      descriptionEn: 'Dimensional aggregated marts ready for sub-second queries by BI, LLM agents and fraud models.',
      latencyMs: 15,
      costPerHour: 0.65,
      metrics: [
        { label: 'Query Engine', value: 'Trino Vectorized C++' },
        { label: 'P95 Query SLA', value: '< 450ms' },
        { label: 'Downstream Consumers', value: 'PowerBI, Agents IA, Feature Store' },
      ],
    },
  };

  const selectedNode = nodes[selectedNodeId] || nodes.broker;

  const handleToggleFlow = () => {
    setIsFlowActive(!isFlowActive);
    sound.playClick();
    addXp(5);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Architecture Studio Visual
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Live Particle Canvas
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {language === 'pt'
              ? 'Studio de Arquitetura de Pipelines em Tempo Real'
              : 'Real-Time Pipeline Architecture Studio'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'pt'
              ? 'Arraste parâmetros de tráfego, troque a engine de streaming e inspecione a topologia completa de dados fluindo de ponta a ponta.'
              : 'Adjust traffic volume, switch stream engines and inspect data packet topology end-to-end.'}
          </p>
        </div>

        <button
          onClick={handleToggleFlow}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border self-start ${
            isFlowActive
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {isFlowActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isFlowActive ? 'Pausar Fluxo Visual' : 'Animar Partículas'}</span>
        </button>
      </div>

      {/* Top Architecture Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-2 font-bold">
            Engine de Computação em Streaming:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setStreamEngine('flink');
                sound.playClick();
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                streamEngine === 'flink'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold">Apache Flink</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
                  &lt; 50ms
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Streaming nativo contínuo, baixa latência e estado em RocksDB.
              </p>
            </button>

            <button
              onClick={() => {
                setStreamEngine('spark');
                sound.playClick();
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                streamEngine === 'spark'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold">Spark Streaming</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  ~1.8s
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Micro-batching com AQE, ideal para alto throughput e menor custo.
              </p>
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono text-slate-400 font-bold">
              Volume de Tráfego de Eventos:
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {trafficVolume.toLocaleString()} msgs/seg ({pipelineMetrics.dataThroughputMBs.toFixed(1)} MB/s)
            </span>
          </div>
          <input
            type="range"
            min="5000"
            max="200000"
            step="5000"
            value={trafficVolume}
            onChange={(e) => setTrafficVolume(Number(e.target.value))}
            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>5k/s (Startup)</span>
            <span>50k/s (Média)</span>
            <span>200k/s (Hiperescala)</span>
          </div>
        </div>
      </div>

      {/* SLA & Cost Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Latência Ponta a Ponta</span>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className={`text-lg font-black font-mono ${pipelineMetrics.totalLatencyMs > 2000 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pipelineMetrics.totalLatencyMs > 1000 ? `${(pipelineMetrics.totalLatencyMs / 1000).toFixed(2)}s` : `${pipelineMetrics.totalLatencyMs}ms`}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Custo Nuvem Estimado</span>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-black font-mono text-white">
              ${pipelineMetrics.totalMonthlyCost.toLocaleString()}/mês
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Throughput Sustentado</span>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-lg font-black font-mono text-white">
              {pipelineMetrics.dataThroughputMBs.toFixed(1)} MB/s
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Partições Kafka</span>
          <div className="flex items-center gap-2 mt-1">
            <Server className="w-4 h-4 text-orange-400" />
            <span className="text-lg font-black font-mono text-white">
              {pipelineMetrics.totalPartitions} Partições
            </span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Canvas */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Topologia do Pipeline (Clique em qualquer nó para inspecionar):
          </span>
          {isFlowActive && (
            <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Transmissão de Pacotes Ativa
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
          {Object.values(nodes).map((node, idx) => {
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  sound.playClick();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none relative ${
                  isSelected
                    ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-105 z-10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {/* Connecting Particle Line Indicator */}
                {idx < 5 && isFlowActive && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 animate-pulse z-20" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">#{idx + 1}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">
                      {node.latencyMs < 1000 ? `${node.latencyMs}ms` : `${(node.latencyMs / 1000).toFixed(1)}s`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight mb-1">
                    {node.name}
                  </h4>
                  <div className="text-[10px] font-mono text-indigo-400 truncate">
                    {node.tech}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                  <span>${(node.costPerHour * (trafficVolume / 10000)).toFixed(2)}/h</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Inspector */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">
                {selectedNode.name}
              </h4>
              <p className="text-xs font-mono text-cyan-400">
                Tecnologia: {selectedNode.tech}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg self-start">
            Latência do Nó: {selectedNode.latencyMs < 1000 ? `${selectedNode.latencyMs}ms` : `${(selectedNode.latencyMs / 1000).toFixed(1)}s`}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {language === 'pt' ? selectedNode.descriptionPt : selectedNode.descriptionEn}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {selectedNode.metrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">
                {m.label}
              </span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
