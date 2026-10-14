import React, { useState } from 'react';
import {
  FileCode,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Zap,
  CheckCircle2,
  Sliders,
  Layers,
  Activity,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { sound } from '../../utils/soundEffects';

interface QueryPreset {
  id: string;
  name: string;
  sql: string;
  smallTableRows: number;
  bigTableRows: number;
}

const QUERY_PRESETS: QueryPreset[] = [
  {
    id: 'join_filter',
    name: 'Filtro Temporal + JOIN Dimensão',
    sql: `SELECT c.name, SUM(o.amount) as total_spent
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date >= '2026-01-01' AND c.tier = 'VIP'
GROUP BY c.name`,
    smallTableRows: 50_000,
    bigTableRows: 10_000_000,
  },
  {
    id: 'multi_join',
    name: '3-Way Join com Agregação e Window',
    sql: `SELECT p.category, c.region, AVG(o.amount)
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN customers c ON o.customer_id = c.id
WHERE p.is_active = true
GROUP BY p.category, c.region`,
    smallTableRows: 100_000,
    bigTableRows: 25_000_000,
  },
];

export const SqlOptimizerLab: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [selectedPreset, setSelectedPreset] = useState<QueryPreset>(QUERY_PRESETS[0]);
  const [predicatePushdownEnabled, setPredicatePushdownEnabled] = useState<boolean>(true);
  const [projectionPruningEnabled, setProjectionPruningEnabled] = useState<boolean>(true);
  const [joinStrategy, setJoinStrategy] = useState<'broadcast' | 'shuffle_hash' | 'sort_merge' | 'nested_loop'>('broadcast');

  // Compute Cost & Metrics dynamically
  const metrics = React.useMemo(() => {
    const rawRows = selectedPreset.bigTableRows;
    const filterReduction = predicatePushdownEnabled ? 0.05 : 1.0; // 95% filtered early if pushed down
    const processedRows = rawRows * filterReduction;

    const columnWidth = projectionPruningEnabled ? 24 : 180; // bytes per row (24 bytes for 3 cols vs 180 for all cols)
    const scanIoBytes = processedRows * columnWidth;

    let shuffleBytes = 0;
    let cpuCostFactor = 1.0;
    let memoryRequiredMb = 64;

    switch (joinStrategy) {
      case 'broadcast':
        shuffleBytes = selectedPreset.smallTableRows * 40; // small table broadcast to all workers
        cpuCostFactor = 1.2;
        memoryRequiredMb = 120;
        break;
      case 'shuffle_hash':
        shuffleBytes = processedRows * 24 + selectedPreset.smallTableRows * 40; // both partitioned
        cpuCostFactor = 2.4;
        memoryRequiredMb = 512;
        break;
      case 'sort_merge':
        shuffleBytes = processedRows * 24 + selectedPreset.smallTableRows * 40;
        cpuCostFactor = 3.8; // sort overhead
        memoryRequiredMb = 256;
        break;
      case 'nested_loop':
        shuffleBytes = 0;
        cpuCostFactor = 25.0; // catastrophic O(N*M)
        memoryRequiredMb = 64;
        break;
    }

    const estimatedExecutionTimeMs = Math.max(
      120,
      Math.round((scanIoBytes / (500 * 1024 * 1024)) * 1000 + (shuffleBytes / (100 * 1024 * 1024)) * 1000 + cpuCostFactor * 80)
    );

    return {
      processedRows,
      scanIoMb: (scanIoBytes / (1024 * 1024)).toFixed(1),
      shuffleMb: (shuffleBytes / (1024 * 1024)).toFixed(1),
      memoryMb: memoryRequiredMb,
      execTimeMs: estimatedExecutionTimeMs,
      relativeCost: (estimatedExecutionTimeMs * 1.5).toFixed(0),
    };
  }, [selectedPreset, predicatePushdownEnabled, projectionPruningEnabled, joinStrategy]);

  const handleRunPlan = () => {
    sound.playSuccess();
    addXp(20, 'Otimização de Plano Físico SQL Executada (+20 XP)');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-5 rounded-2xl border border-emerald-900/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Laboratório #15 · Compiladores & Otimizadores SQL</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Cost-Based Query Optimizer (CBO) & Planos de Execução
            </h3>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              Veja o interior dos motores como <strong className="text-emerald-300">Trino, Spark Catalyst, DuckDB e BigQuery</strong>.
              Descubra por que <strong className="text-emerald-300">Predicate Pushdown</strong> e a escolha correta
              de operador de JOIN (Broadcast vs Shuffle Hash) transformam uma query de 40 minutos em 3 segundos.
            </p>
          </div>

          <button
            onClick={handleRunPlan}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simular Plano Físico</span>
          </button>
        </div>
      </div>

      {/* SQL Query Selector & Editor Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              Query SQL de Entrada (Input AST)
            </span>
            <div className="flex gap-2">
              {QUERY_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    selectedPreset.id === p.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {selectedPreset.sql}
          </pre>

          {/* Optimizer Rules Toggle Switches */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
              Regras do Otimizador Lógico (Logical Rewrite Rules):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono text-slate-200">Predicate Pushdown</span>
                <input
                  type="checkbox"
                  checked={predicatePushdownEnabled}
                  onChange={(e) => setPredicatePushdownEnabled(e.target.checked)}
                  className="accent-emerald-400 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs font-mono text-slate-200">Projection Pruning</span>
                <input
                  type="checkbox"
                  checked={projectionPruningEnabled}
                  onChange={(e) => setProjectionPruningEnabled(e.target.checked)}
                  className="accent-emerald-400 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Physical Operator & Strategy Selection */}
        <div className="lg:col-span-6 bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Seleção de Operador Físico de JOIN
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'broadcast', name: 'Broadcast Hash Join', desc: 'Replica tabela menor em memória para todos nós (Zero Shuffle na tabela grande)' },
              { id: 'shuffle_hash', name: 'Shuffle Hash Join', desc: 'Reparticiona ambas tabelas pela chave de JOIN via rede (Shuffle pesado)' },
              { id: 'sort_merge', name: 'Sort Merge Join', desc: 'Ordena ambas partições em disco/memória e mescla sequencialmente' },
              { id: 'nested_loop', name: 'Nested Loop Join', desc: 'Varre cada linha da tabela B para cada linha da tabela A (O(N*M) - Catastrófico)' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setJoinStrategy(st.id as any)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  joinStrategy === st.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono font-bold text-xs">{st.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {st.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Real-Time Cost Scorecard */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-2">
              <span>Custo Estimado (CBO Units):</span>
              <strong className="text-emerald-400 text-base">{metrics.relativeCost} pts</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500">I/O Varredura de Disco:</span>
                <div className="text-white font-bold">{metrics.scanIoMb} MB</div>
              </div>
              <div>
                <span className="text-slate-500">Tráfego de Shuffle de Rede:</span>
                <div className="text-cyan-400 font-bold">{metrics.shuffleMb} MB</div>
              </div>
              <div>
                <span className="text-slate-500">Linhas no Pipeline:</span>
                <div className="text-white font-bold">{metrics.processedRows.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-slate-500">Tempo Estimado:</span>
                <div className={metrics.execTimeMs > 5000 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {(metrics.execTimeMs / 1000).toFixed(2)}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Execution Plan Graph */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Grafo de Execução Física Gerado pelo Otimizador</span>
        </h4>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
          {/* Node 1: Storage Scan */}
          <div className="w-full md:w-1/4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-bold text-[11px]">1. FileScan (Parquet S3)</div>
            <div className="text-[10px] text-slate-400">
              {predicatePushdownEnabled
                ? '✓ Filtro aplicado no driver/storage (Data Skipping ativo)'
                : '⚠ Sem pushdown: lê 10M linhas do disco'}
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

          {/* Node 2: Projection & Filter */}
          <div className="w-full md:w-1/4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-indigo-400 font-bold text-[11px]">2. Project & Filter</div>
            <div className="text-[10px] text-slate-400">
              {projectionPruningEnabled
                ? '✓ Apenas colunas customer_id, amount lidas (SIMD)'
                : '⚠ Todas 40 colunas trafegam pela memória'}
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

          {/* Node 3: Join Operator */}
          <div className="w-full md:w-1/4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-bold text-[11px]">
              3. {joinStrategy === 'broadcast' ? 'BroadcastHashJoin' : joinStrategy === 'shuffle_hash' ? 'ShuffleHashJoin' : joinStrategy === 'sort_merge' ? 'SortMergeJoin' : 'NestedLoopJoin'}
            </div>
            <div className="text-[10px] text-slate-400">
              Shuffle de rede: <strong className="text-white">{metrics.shuffleMb} MB</strong>
            </div>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

          {/* Node 4: HashAggregate */}
          <div className="w-full md:w-1/4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold text-[11px]">4. HashAggregate & Sink</div>
            <div className="text-[10px] text-slate-400">
              Cálculo de SUM() e streaming do cursor de saída
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
