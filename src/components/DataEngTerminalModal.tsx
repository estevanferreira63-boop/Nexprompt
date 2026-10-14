import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  Cpu,
  Layers,
  Palette,
  Tv,
  Check,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

interface TerminalHistoryItem {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'success' | 'system';
  text: string;
  prompt?: string;
}

type TerminalTheme = 'matrix' | 'cyan' | 'amber' | 'blood';

const KNOWN_COMMANDS = [
  'help',
  'spark-submit --master k8s --conf spark.sql.shuffle.partitions=200 etl_orders.py',
  'dbt run --select marts.finance',
  'dbt test --models staging.stg_payments',
  'kafka-consumer-groups --describe --group order-analytics',
  'kafka-topics --list',
  'lakehouse time-travel --table bronze.events --version 4',
  'duckdb "SELECT country, count(*) as txs, sum(amount) FROM read_parquet(\'s3://lake/orders/*.parquet\') GROUP BY 1 LIMIT 5"',
  'kubectl get pods -n data-platform',
  'cluster-top',
  'neofetch',
  'matrix',
  'cat /etc/architecture.yaml',
  'whoami',
  'uptime',
  'date',
  'history',
  'theme matrix',
  'theme cyan',
  'theme amber',
  'theme blood',
  'clear',
];

const THEME_STYLES: Record<
  TerminalTheme,
  {
    name: string;
    bg: string;
    border: string;
    headerBg: string;
    text: string;
    prompt: string;
    success: string;
    error: string;
    accent: string;
    cursor: string;
    glow: string;
  }
> = {
  matrix: {
    name: 'Matrix Green',
    bg: 'bg-black',
    border: 'border-emerald-500/60',
    headerBg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    prompt: 'text-emerald-300',
    success: 'text-green-300',
    error: 'text-rose-400',
    accent: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40',
    cursor: 'bg-emerald-400',
    glow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
  },
  cyan: {
    name: 'Cyber Cyan',
    bg: 'bg-slate-950',
    border: 'border-cyan-500/50',
    headerBg: 'bg-slate-900',
    text: 'text-cyan-300',
    prompt: 'text-cyan-400',
    success: 'text-emerald-300',
    error: 'text-rose-400',
    accent: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/40',
    cursor: 'bg-cyan-400',
    glow: 'shadow-[0_0_35px_rgba(6,182,212,0.2)]',
  },
  amber: {
    name: 'Retro CRT Amber',
    bg: 'bg-[#0f0b04]',
    border: 'border-amber-500/60',
    headerBg: 'bg-amber-950/50',
    text: 'text-amber-400',
    prompt: 'text-amber-300',
    success: 'text-yellow-200',
    error: 'text-red-400',
    accent: 'text-amber-300 bg-amber-950/80 border-amber-500/40',
    cursor: 'bg-amber-400',
    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.2)]',
  },
  blood: {
    name: 'DevSecOps Red',
    bg: 'bg-[#0d0406]',
    border: 'border-rose-600/60',
    headerBg: 'bg-rose-950/50',
    text: 'text-rose-300',
    prompt: 'text-rose-400',
    success: 'text-emerald-300',
    error: 'text-red-500',
    accent: 'text-rose-300 bg-rose-950/80 border-rose-500/40',
    cursor: 'bg-rose-500',
    glow: 'shadow-[0_0_35px_rgba(225,29,72,0.25)]',
  },
};

export const DataEngTerminalModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Terminal State
  const [inputVal, setInputVal] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'spark-submit --master k8s --conf spark.sql.shuffle.partitions=200 etl_orders.py',
    'dbt run --select marts.finance',
    'kubectl get pods -n data-platform',
  ]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [theme, setTheme] = useState<TerminalTheme>('matrix');
  const [hasScanlines, setHasScanlines] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [ghostSuggestion, setGhostSuggestion] = useState<string>('');

  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    {
      id: 'init-header',
      type: 'system',
      text: [
        '╔══════════════════════════════════════════════════════════════════════════════╗',
        '║  ⚡ NEXUS DATA PLATFORM - CLUSTER BASH TERMINAL v5.4-HACKER EDITION          ║',
        '║  Nodes: 12 (k8s-prod-us-east-1) | Engine: Spark 3.5.1 + DuckDB SIMD + Trino  ║',
        '║  Type "help" for manual · Press [Tab] to Autocomplete · [↑/↓] for History   ║',
        '╚══════════════════════════════════════════════════════════════════════════════╝',
      ].join('\n'),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isExecuting]);

  // Compute ghost autocomplete suggestion whenever input changes
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setGhostSuggestion('');
      setSuggestions([]);
      return;
    }

    const matches = KNOWN_COMMANDS.filter((cmd) =>
      cmd.toLowerCase().startsWith(trimmed.toLowerCase())
    );

    if (matches.length > 0 && matches[0].toLowerCase().startsWith(trimmed.toLowerCase())) {
      setGhostSuggestion(matches[0].slice(trimmed.length));
      setSuggestions(matches.slice(0, 5));
    } else {
      setGhostSuggestion('');
      setSuggestions([]);
    }
  }, [inputVal]);

  if (!isOpen) return null;

  const currentTheme = THEME_STYLES[theme];

  const handleAutocomplete = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const matches = KNOWN_COMMANDS.filter((cmd) =>
      cmd.toLowerCase().startsWith(trimmed.toLowerCase())
    );

    if (matches.length === 1) {
      setInputVal(matches[0]);
      sound.playClick();
      setGhostSuggestion('');
      setSuggestions([]);
    } else if (matches.length > 1) {
      // Find common prefix
      let commonPrefix = trimmed;
      const first = matches[0];
      for (let i = trimmed.length; i <= first.length; i++) {
        const candidate = first.slice(0, i);
        if (matches.every((m) => m.toLowerCase().startsWith(candidate.toLowerCase()))) {
          commonPrefix = candidate;
        } else {
          break;
        }
      }
      setInputVal(commonPrefix);
      setSuggestions(matches);
      sound.playClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab key for autocomplete
    if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
      return;
    }

    // Right Arrow to accept ghost completion
    if (e.key === 'ArrowRight' && ghostSuggestion && inputRef.current?.selectionStart === inputVal.length) {
      e.preventDefault();
      setInputVal((prev) => prev + ghostSuggestion);
      setGhostSuggestion('');
      return;
    }

    // Arrow Up: navigate backward in command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextPointer = historyPointer === -1 ? commandHistory.length - 1 : Math.max(0, historyPointer - 1);
      setHistoryPointer(nextPointer);
      setInputVal(commandHistory[nextPointer]);
      return;
    }

    // Arrow Down: navigate forward in command history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer === -1) return;
      const nextPointer = historyPointer + 1;
      if (nextPointer >= commandHistory.length) {
        setHistoryPointer(-1);
        setInputVal('');
      } else {
        setHistoryPointer(nextPointer);
        setInputVal(commandHistory[nextPointer]);
      }
      return;
    }

    // Enter: execute command
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleExecute = (cmdToRun?: string) => {
    const rawCmd = (cmdToRun || inputVal).trim();
    if (!rawCmd || isExecuting) return;

    sound.playClick();
    const cmdId = Date.now().toString();

    // Add to command history list
    setCommandHistory((prev) => [...prev.filter((c) => c !== rawCmd), rawCmd]);
    setHistoryPointer(-1);

    // Record user command in output stream
    setHistory((prev) => [
      ...prev,
      {
        id: `cmd-${cmdId}`,
        type: 'cmd',
        text: rawCmd,
        prompt: 'root@lakehouse-cluster-k8s:~#',
      },
    ]);

    setInputVal('');
    setGhostSuggestion('');
    setSuggestions([]);
    setIsExecuting(true);

    const lower = rawCmd.toLowerCase();

    setTimeout(() => {
      let outputLines: string[] = [];
      let outputType: 'output' | 'success' | 'error' | 'system' = 'output';

      if (lower === 'clear') {
        setHistory([]);
        setIsExecuting(false);
        return;
      }

      if (lower.startsWith('theme ')) {
        const targetTheme = lower.replace('theme ', '').trim() as TerminalTheme;
        if (['matrix', 'cyan', 'amber', 'blood'].includes(targetTheme)) {
          setTheme(targetTheme);
          outputLines = [`[✓] Terminal theme switched to ${THEME_STYLES[targetTheme].name}`];
          outputType = 'success';
          sound.playSuccess();
        } else {
          outputLines = ['Usage: theme <matrix | cyan | amber | blood>'];
          outputType = 'error';
        }
      } else if (lower === 'help') {
        outputLines = [
          '⚡ DATA PLATFORM CLI - COMMAND DIRECTORY:',
          '  spark-submit ...       Submit PySpark DAG job to Kubernetes cluster',
          '  dbt run ...            Execute SQL incremental/table transformations',
          '  dbt test ...           Run schema, nullability & referential integrity tests',
          '  kafka-consumer-groups  Audit consumer lag, partition offsets & group coordinator',
          '  kafka-topics --list    List all real-time topics and partition counts',
          '  lakehouse time-travel  Rollback Delta Lake / Iceberg table snapshot',
          '  duckdb "<SQL>"         Vectorized in-process SIMD query on Parquet files',
          '  kubectl get pods ...   Display k8s pod lifecycle, restarts, memory usage',
          '  cluster-top            Real-time live cluster CPU, Heap & IO utilization',
          '  neofetch               Display Lakehouse OS system architecture badge',
          '  matrix                 Trigger cyber rain sequence in the console',
          '  cat /etc/architecture.yaml  Print current platform infrastructure blueprint',
          '  whoami / date / uptime Print shell telemetry info',
          '  history                Display previous commands executed in this session',
          '  theme <name>           Switch theme: matrix, cyan, amber, blood',
          '  clear                  Clear buffer',
        ];
      } else if (lower === 'neofetch') {
        sound.playNotification();
        addXp(20, 'Terminal Hacker: Neofetch Descoberto (+20 XP)');
        outputLines = [
          '        .---.           OS: Nexus Data Engine OS v5.4.1 (x86_64)',
          '       /     \\          Host: Kubernetes EKS / GKE Hybrid v1.30',
          '      | () () |         Kernel: 6.9.1-data-lakehouse-rt',
          '       \\  -  /          Uptime: 42 days, 18 hours, 31 mins',
          '      /`-...-\'\\         Packages: 100 Data Concepts + 12 Visual Labs',
          '     / /     \\ \\        Shell: Bash 5.2.26 / Python 3.12 / Spark 3.5.1',
          '    ( (       ) )       Storage: Apache Iceberg + Delta Lake on S3/GCS',
          '     \\ \\_   _/ /        Query Engines: DuckDB SIMD, Trino, ClickHouse',
          '      \\__) (__/         Memory: 64.2 GiB / 128.0 GiB (50.1%)',
          '                        CPU: AMD EPYC 7763 (64) @ 3.50GHz (28.4% load)',
        ];
        outputType = 'system';
      } else if (lower === 'matrix') {
        sound.playSuccess();
        addXp(25, 'Easter Egg: Matrix Code Rain Executado (+25 XP)');
        outputLines = [
          '01001110 01000101 01011000 01010101 01010011 00100000 01000001 01001001',
          'Δ 0xFA4B ... PARQUET COMPACTION STREAM ACTIVE ... OK',
          'Δ 0xCC12 ... ICEBERG SNAPSHOT MANIFEST #104 COMMIT ... OK',
          'Δ 0x98BE ... KAFKA EXACTLY-ONCE 2PC TRANSACTION FLUSH ... OK',
          'Δ 0x44D1 ... RAG VECTOR EMBEDDING COSINE DISTANCE 0.942 ... OK',
          'Δ 0x2211 ... DUCKDB VECTORIZED MORPHOLOGY SCAN ... ZERO SPILL',
          '[ SYSTEM INTEGRITY: 100% SECURE · ALL 100 DATA PILLARS OPERATIONAL ]',
        ];
        outputType = 'success';
      } else if (lower.startsWith('spark-submit')) {
        sound.playSuccess();
        addXp(15);
        outputLines = [
          '26/10/14 11:20:01 INFO SparkContext: Initializing SparkContext with master k8s://api.internal:6443',
          '26/10/14 11:20:02 INFO DAGScheduler: Submitting 3 stages: Stage 0 (Map), Stage 1 (Shuffle Hash), Stage 2 (Delta Sink)',
          'Stage 0: [========================================>] 200/200 tasks (1.4s) | 240 MB/s scan',
          '26/10/14 11:20:04 INFO BlockManagerMaster: Shuffle spill: 0 bytes (AQE dynamic partition coalescing active)',
          'Stage 1: [========================================>] 64/64 tasks (1.8s) | Skew mitigated via salting',
          'Stage 2: [========================================>] 1/1 task (0.2s) | Delta Lake commit v43 completed',
          '✨ Spark Job Finished Successfully in 3.4s. Total records written: 1,842,000.',
        ];
        outputType = 'success';
      } else if (lower.startsWith('dbt run')) {
        sound.playSuccess();
        addXp(15);
        outputLines = [
          'Running with dbt=1.8.4',
          'Registered 18 models, 42 tests, 6 snapshots',
          'Concurrency: 8 threads (target: production_lakehouse)',
          '1 of 4 START sql incremental model marts.fct_orders .................... [RUN]',
          '1 of 4 OK created sql incremental model marts.fct_orders ............... [OK in 1.84s]',
          '2 of 4 START sql table model marts.dim_customers ....................... [RUN]',
          '2 of 4 OK created sql table model marts.dim_customers .................. [OK in 1.12s]',
          '3 of 4 START sql view model marts.finance_daily_pnl .................... [RUN]',
          '3 of 4 OK created sql view model marts.finance_daily_pnl ............... [OK in 0.38s]',
          '4 of 4 START sql incremental model marts.ai_feature_store .............. [RUN]',
          '4 of 4 OK created sql incremental model marts.ai_feature_store ......... [OK in 2.01s]',
          'Finished running 4 models in 5.35s. Completed successfully: 4 passed, 0 failed.',
        ];
        outputType = 'success';
      } else if (lower.startsWith('dbt test')) {
        sound.playSuccess();
        addXp(15);
        outputLines = [
          'Running with dbt=1.8.4',
          '1 of 3 PASS not_null_stg_payments_payment_id ............................ [PASS in 0.42s]',
          '2 of 3 PASS unique_stg_payments_payment_id .............................. [PASS in 0.58s]',
          '3 of 3 PASS relationships_stg_payments_order_id__order_id .............. [PASS in 0.91s]',
          '✨ All 3 dbt contract tests passed with 0 warnings.',
        ];
        outputType = 'success';
      } else if (lower.includes('kafka-consumer-groups')) {
        sound.playClick();
        addXp(10);
        outputLines = [
          'GROUP                TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG      STATUS',
          'order-analytics      orders-stream   0          1,482,910       1,482,925       15       HEALTHY',
          'order-analytics      orders-stream   1          1,519,200       1,519,210       10       HEALTHY',
          'order-analytics      orders-stream   2          1,391,000       1,391,040       40       HEALTHY',
          'order-analytics      orders-stream   3          1,440,112       1,440,120       8        HEALTHY',
          'order-analytics      orders-stream   4          1,612,040       1,612,070       30       HEALTHY',
          'order-analytics      orders-stream   5          1,501,900       1,501,905       5        HEALTHY',
          'Coordinator: broker-1.kafka.internal:9092 (State: Stable, Protocol: Cooperative-Sticky)',
        ];
      } else if (lower.includes('kafka-topics')) {
        outputLines = [
          'TOPIC NAME             PARTITIONS  REPLICATION  RETENTION_BYTES  CLEANUP_POLICY',
          'clickstream-events     12          3            107374182400     delete',
          'orders-stream          6           3            53687091200      compact,delete',
          'payment-transactions   6           3            -1               compact',
          'user-notifications     4           3            21474836480      delete',
          'ai-agent-telemetry     8           3            42949672960      delete',
        ];
      } else if (lower.includes('time-travel')) {
        sound.playSuccess();
        addXp(15);
        outputLines = [
          'Delta Lake Time-Travel Engine Initialized.',
          'Table: s3://lakehouse-prod/bronze/events',
          'Snapshot Request: VERSION AS OF 4',
          'Loading commit _delta_log/00000000000000000004.json...',
          'Commit timestamp: 2026-10-14 08:00:12 UTC | Author: pipeline-worker-pod3',
          'Matched files: 14 Parquet parts (842 MB) | Excluded 8 newer mutated files.',
          'Snapshot isolation verified: Exactly 4,210,900 rows locked in read-only audit state.',
        ];
        outputType = 'success';
      } else if (lower.startsWith('duckdb')) {
        sound.playSuccess();
        addXp(15);
        outputLines = [
          '┌──────────────┬─────────┬────────────────┬──────────────┐',
          '│   country    │   txs   │  sum(amount)   │ avg_latency  │',
          '│   varchar    │  int64  │    decimal     │    ms_p99    │',
          '├──────────────┼─────────┼────────────────┼──────────────┤',
          '│ Brazil (BR)  │ 242,810 │  24,421,900.50 │    12.4ms    │',
          '│ USA (US)     │ 198,120 │  38,180,240.00 │     8.2ms    │',
          '│ Germany (DE) │  88,450 │  14,210,800.75 │    10.1ms    │',
          '│ Japan (JP)   │  74,200 │  12,990,400.10 │     9.6ms    │',
          '│ UK (GB)      │  61,920 │   9,450,110.00 │     7.8ms    │',
          '└──────────────┴─────────┴────────────────┴──────────────┘',
          '5 rows fetched in 11.2ms via DuckDB SIMD Parquet Pushdown Scanner.',
        ];
        outputType = 'success';
      } else if (lower.includes('kubectl') || lower.includes('k8s get pods')) {
        outputLines = [
          'NAME                                READY   STATUS    RESTARTS   AGE     IP',
          'spark-operator-controller-74f8b-x   1/1     Running   0          14d     10.244.1.12',
          'spark-driver-orders-etl-4291        1/1     Running   0          4m      10.244.2.19',
          'spark-exec-orders-etl-4291-1        1/1     Running   0          4m      10.244.3.44',
          'spark-exec-orders-etl-4291-2        1/1     Running   0          4m      10.244.4.81',
          'kafka-broker-0                      1/1     Running   0          42d     10.244.1.8',
          'kafka-broker-1                      1/1     Running   0          42d     10.244.2.8',
          'kafka-broker-2                      1/1     Running   0          42d     10.244.3.8',
          'trino-coordinator-69bfb7-wz         1/1     Running   0          18d     10.244.5.10',
          'airflow-scheduler-5f9cb4-lk         2/2     Running   0          12d     10.244.1.33',
        ];
      } else if (lower === 'cluster-top' || lower === 'top') {
        outputLines = [
          'CLUSTER TELEMETRY - 12 NODES (K8S DATA PLATFORM)',
          'CPU: 28.4% user, 3.2% sys, 68.4% idle | MEM: 64.2 GiB / 128.0 GiB (50.1%)',
          '',
          'PID   ROLE         POD NAME             CPU%   HEAP_USED    SHUFFLE_IO   STATUS',
          '101   SparkDriver  spark-orders-4291    16.2%  4.2GB/8GB    140 MB/s     RUNNING',
          '102   SparkExec-1  spark-worker-pod1    58.1%  7.1GB/8GB    520 MB/s     COMPUTING',
          '103   SparkExec-2  spark-worker-pod2    54.4%  6.9GB/8GB    490 MB/s     COMPUTING',
          '201   KafkaBroker  kafka-broker-0       12.2%  3.4GB/6GB    125 MB/s     STABLE',
          '202   KafkaBroker  kafka-broker-1       11.0%  3.2GB/6GB    118 MB/s     STABLE',
          '301   TrinoWorker  trino-worker-0       24.0%  11.2GB/16GB  210 MB/s     SERVING',
          '401   DuckDB-SIMD  duckdb-local-proc    8.4%   1.8GB/4GB    890 MB/s     IDLE',
        ];
      } else if (lower.includes('cat /etc/architecture.yaml')) {
        outputLines = [
          '# Nexus Production Data Architecture Blueprint',
          'ingestion:',
          '  streaming: Apache Kafka (6 brokers, RF=3)',
          '  batch: Airflow 2.9 + Debezium CDC',
          'lakehouse_storage:',
          '  format: Apache Iceberg & Delta Lake 3.2',
          '  object_store: AWS S3 / Cloud Storage (Multi-AZ)',
          'compute_engines:',
          '  batch_heavy: Apache Spark 3.5 on Kubernetes',
          '  interactive_bi: Trino + DuckDB Vectorized',
          'data_governance:',
          '  catalog: Polaris / Unity / Great Expectations',
          '  lineage: OpenLineage + dbt docs',
        ];
        outputType = 'system';
      } else if (lower === 'whoami') {
        outputLines = ['lead-data-engineer@nexus-lakehouse-cloud (uid=1000 gid=1000 groups=wheel,k8s-admins,dataops)'];
      } else if (lower === 'uptime') {
        outputLines = ['11:24:18 up 42 days, 18:31, 3 users, load average: 1.84, 1.42, 1.10'];
      } else if (lower === 'date') {
        outputLines = [new Date().toUTCString()];
      } else if (lower === 'history') {
        outputLines = commandHistory.map((cmd, idx) => `  ${idx + 1}  ${cmd}`);
      } else {
        sound.playError();
        outputLines = [
          `bash: command not found: "${rawCmd}".`,
          'Type "help" to see all valid commands or press [Tab] to view completions.',
        ];
        outputType = 'error';
      }

      setHistory((prev) => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          type: outputType,
          text: outputLines.join('\n'),
        },
      ]);
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 350);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        className={`relative w-full ${currentTheme.bg} ${currentTheme.border} ${currentTheme.glow} border rounded-2xl overflow-hidden flex flex-col font-mono transition-all duration-300 ${
          isMaximized ? 'h-[96vh] max-w-[98vw]' : 'h-[640px] max-w-4xl'
        }`}
      >
        {/* Retro CRT Scanline Overlay */}
        {hasScanlines && (
          <div className="pointer-events-none absolute inset-0 z-30 opacity-15 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.8)_3px,rgba(0,0,0,0.8)_4px)]" />
        )}

        {/* Terminal Titlebar */}
        <div
          className={`px-4 py-3 ${currentTheme.headerBg} border-b ${currentTheme.border} flex items-center justify-between select-none z-20`}
        >
          {/* Window Buttons */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 cursor-pointer transition-colors shadow-sm"
              onClick={onClose}
              title="Close terminal"
            />
            <span
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 cursor-pointer transition-colors shadow-sm"
              onClick={() => setIsMaximized(!isMaximized)}
              title="Maximize"
            />
            <span
              className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 cursor-pointer transition-colors shadow-sm"
              onClick={() => setHasScanlines(!hasScanlines)}
              title="Toggle CRT Scanlines"
            />
            <span className="ml-2 text-xs font-bold flex items-center gap-2">
              <Terminal className={`w-3.5 h-3.5 ${currentTheme.prompt}`} />
              <span className="text-white">cluster-k8s-prod · bash</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/40 text-[10px] text-slate-400 border border-slate-700">
                TTY-1
              </span>
            </span>
          </div>

          {/* Controls: Theme Selector, CRT Toggle, Maximize, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme switcher button */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-slate-800 text-[10px]">
              {(['matrix', 'cyan', 'amber', 'blood'] as TerminalTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-2 py-0.5 rounded capitalize transition-all ${
                    theme === t
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* CRT Scanline Toggle */}
            <button
              onClick={() => setHasScanlines(!hasScanlines)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                hasScanlines
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle CRT Scanline Effect"
            >
              <Tv className="w-3.5 h-3.5" />
            </button>

            {/* Maximize */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
              title="Maximize Window"
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:text-rose-300 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Commands & Autocomplete Bar */}
        <div className="px-4 py-2 bg-black/70 border-b border-slate-900 flex items-center justify-between text-[11px] overflow-x-auto gap-2 z-20">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              {language === 'pt' ? 'Atalhos:' : 'Shortcuts:'}
            </span>
            {['spark-submit', 'dbt run', 'dbt test', 'duckdb', 'kafka-consumer-groups', 'cluster-top', 'neofetch', 'matrix'].map(
              (cmdPrefix) => {
                const fullCmd = KNOWN_COMMANDS.find((c) => c.startsWith(cmdPrefix)) || cmdPrefix;
                return (
                  <button
                    key={cmdPrefix}
                    onClick={() => handleExecute(fullCmd)}
                    disabled={isExecuting}
                    className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[10px] font-mono shrink-0"
                  >
                    {cmdPrefix}
                  </button>
                );
              }
            )}
          </div>

          <div className="text-[10px] text-slate-500 hidden md:flex items-center gap-2 shrink-0">
            <span>[Tab] Autocomplete</span>
            <span>·</span>
            <span>[↑/↓] Histórico</span>
          </div>
        </div>

        {/* Terminal History Output */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs font-mono leading-relaxed selection:bg-emerald-500 selection:text-black z-10 custom-scrollbar">
          {history.map((item) => (
            <div key={item.id} className="space-y-0.5">
              {item.type === 'cmd' ? (
                <div className="flex items-center gap-2">
                  <span className={`${currentTheme.prompt} font-black select-none shrink-0`}>
                    {item.prompt || 'engineer@lakehouse-k8s:~$'}
                  </span>
                  <span className="text-white font-bold">{item.text}</span>
                </div>
              ) : item.type === 'success' ? (
                <pre className={`${currentTheme.success} whitespace-pre-wrap font-mono text-[11.5px]`}>
                  {item.text}
                </pre>
              ) : item.type === 'error' ? (
                <pre className={`${currentTheme.error} whitespace-pre-wrap font-mono text-[11.5px]`}>
                  {item.text}
                </pre>
              ) : item.type === 'system' ? (
                <pre className="text-cyan-400/90 whitespace-pre-wrap font-mono text-[11px]">
                  {item.text}
                </pre>
              ) : (
                <pre className={`${currentTheme.text} whitespace-pre-wrap font-mono text-[11.5px]`}>
                  {item.text}
                </pre>
              )}
            </div>
          ))}

          {isExecuting && (
            <div className="flex items-center gap-2 text-amber-400 animate-pulse text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Processando transação nos nós executores do cluster...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Autocomplete Drop-Up Suggestions if multiple matches */}
        {suggestions.length > 1 && (
          <div className="px-4 py-1.5 bg-black/95 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 overflow-x-auto z-20">
            <span className="text-cyan-400 font-bold uppercase shrink-0">Tab Suggestions:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInputVal(s);
                  inputRef.current?.focus();
                }}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors font-mono shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar with Ghost Autocomplete */}
        <div
          className={`p-3.5 ${currentTheme.headerBg} border-t ${currentTheme.border} flex items-center gap-2 z-20`}
        >
          <span className={`${currentTheme.prompt} text-xs font-bold shrink-0 select-none`}>
            root@lakehouse-cluster-k8s:~#
          </span>

          <div className="relative flex-1 flex items-center">
            {/* Real Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'pt' ? 'Digite um comando ou pressione [Tab]...' : 'Type a command or press [Tab]...'}
              disabled={isExecuting}
              className={`w-full bg-transparent ${currentTheme.text} font-mono text-xs focus:outline-none placeholder:text-slate-600 relative z-10`}
            />

            {/* Ghost Autocomplete Overlay */}
            {ghostSuggestion && (
              <div className="absolute left-0 pointer-events-none text-xs font-mono select-none flex">
                <span className="invisible">{inputVal}</span>
                <span className="text-slate-600 font-bold">{ghostSuggestion}</span>
                <span className="text-[9px] ml-2 text-cyan-400/80 bg-cyan-950/60 px-1 rounded border border-cyan-700/40 font-mono">
                  Tab ⇥
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => handleExecute()}
            disabled={isExecuting || !inputVal.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Exec</span>
          </button>
        </div>
      </div>
    </div>
  );
};
