import React, { useState } from 'react';
import {
  Database,
  Layers,
  HardDrive,
  Cpu,
  Search,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../../utils/soundEffects';

interface MemTableRecord {
  key: string;
  value: string;
  timestamp: number;
}

interface SStable {
  id: string;
  level: number;
  keys: string[];
  bloomFilterSize: number;
  bloomFilterHits: number;
}

export const LsmTreeStorageLab: React.FC = () => {
  const { language } = useLanguage();
  const [engineType, setEngineType] = useState<'lsm' | 'btree'>('lsm');

  // LSM State
  const [walLogs, setWalLogs] = useState<string[]>([
    'WAL #1: SET usr_101 = "Alice"',
    'WAL #2: SET usr_102 = "Bob"',
    'WAL #3: SET usr_103 = "Charlie"',
  ]);

  const [memTable, setMemTable] = useState<MemTableRecord[]>([
    { key: 'usr_101', value: 'Alice', timestamp: 1 },
    { key: 'usr_102', value: 'Bob', timestamp: 2 },
    { key: 'usr_103', value: 'Charlie', timestamp: 3 },
  ]);

  const [sstables, setSstables] = useState<SStable[]>([
    { id: 'sst_l0_1', level: 0, keys: ['usr_080', 'usr_092', 'usr_099'], bloomFilterSize: 256, bloomFilterHits: 12 },
    { id: 'sst_l1_1', level: 1, keys: ['usr_001', 'usr_020', 'usr_045'], bloomFilterSize: 512, bloomFilterHits: 38 },
    { id: 'sst_l1_2', level: 1, keys: ['usr_050', 'usr_065', 'usr_075'], bloomFilterSize: 512, bloomFilterHits: 41 },
  ]);

  const [inputKey, setInputKey] = useState<string>('usr_104');
  const [inputValue, setInputValue] = useState<string>('David');
  const [searchKey, setSearchKey] = useState<string>('usr_101');
  const [readTrace, setReadTrace] = useState<string[]>([]);
  const [stats, setStats] = useState({
    writesCount: 3,
    readsCount: 0,
    flushesCount: 0,
    compactionsCount: 0,
  });

  // Handle Write Operation (PUT)
  const handleWrite = () => {
    if (!inputKey.trim()) return;

    sound.playClick();
    const newRecord: MemTableRecord = {
      key: inputKey.trim(),
      value: inputValue.trim() || 'default',
      timestamp: Date.now(),
    };

    // 1. Write to WAL (Sequential append)
    setWalLogs((prev) => [`WAL #${stats.writesCount + 1}: SET ${newRecord.key} = "${newRecord.value}"`, ...prev.slice(0, 5)]);

    // 2. Insert into MemTable (SkipList sorted order)
    const updatedMemTable = [...memTable.filter((r) => r.key !== newRecord.key), newRecord].sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    setMemTable(updatedMemTable);
    setStats((prev) => ({ ...prev, writesCount: prev.writesCount + 1 }));

    // Auto-flush when MemTable reaches threshold (e.g. 5 keys)
    if (updatedMemTable.length >= 5) {
      setTimeout(() => triggerFlush(updatedMemTable), 600);
    } else {
      sound.playSuccess();
    }
  };

  // Trigger MemTable Flush to Disk L0 SSTable
  const triggerFlush = (tableToFlush = memTable) => {
    if (tableToFlush.length === 0) return;

    sound.playNotification();
    const newSst: SStable = {
      id: `sst_l0_${Date.now().toString().slice(-4)}`,
      level: 0,
      keys: tableToFlush.map((r) => r.key),
      bloomFilterSize: 256,
      bloomFilterHits: 0,
    };

    setSstables((prev) => [newSst, ...prev]);
    setMemTable([]);
    setWalLogs((prev) => [`[WAL CHECKPOINT] Truncated WAL after flush to ${newSst.id}`, ...prev.slice(0, 4)]);
    setStats((prev) => ({ ...prev, flushesCount: prev.flushesCount + 1 }));
  };

  // Trigger Leveled Compaction (merge L0 SSTables into L1)
  const triggerCompaction = () => {
    sound.playLevelUp();
    const l0Tables = sstables.filter((s) => s.level === 0);
    if (l0Tables.length === 0) return;

    const allKeys = Array.from(new Set(sstables.flatMap((s) => s.keys))).sort();
    const half = Math.ceil(allKeys.length / 2);

    const compactedL1: SStable[] = [
      { id: `sst_l1_merged_a`, level: 1, keys: allKeys.slice(0, half), bloomFilterSize: 512, bloomFilterHits: 10 },
      { id: `sst_l1_merged_b`, level: 1, keys: allKeys.slice(half), bloomFilterSize: 512, bloomFilterHits: 14 },
    ];

    setSstables(compactedL1);
    setStats((prev) => ({ ...prev, compactionsCount: prev.compactionsCount + 1 }));
  };

  // Handle Read Operation (GET)
  const handleRead = () => {
    if (!searchKey.trim()) return;
    sound.playClick();

    const trace: string[] = [];
    const target = searchKey.trim();

    // 1. Check MemTable in RAM (Fastest)
    const inMem = memTable.find((r) => r.key === target);
    if (inMem) {
      trace.push(`[1] ⚡ RAM HIT: Encontrado instantaneamente na MemTable (Valor: "${inMem.value}").`);
      setReadTrace(trace);
      sound.playSuccess();
      setStats((prev) => ({ ...prev, readsCount: prev.readsCount + 1 }));
      return;
    }
    trace.push(`[1] ℹ️ MemTable: chave "${target}" não está na RAM.`);

    // 2. Check L0 and L1 SSTables using Bloom Filters
    let foundInDisk = false;
    sstables.forEach((sst) => {
      // Mock bloom filter test
      const maybeInSst = sst.keys.includes(target) || Math.random() < 0.05; // 5% false positive rate
      if (maybeInSst) {
        if (sst.keys.includes(target)) {
          trace.push(`[2] 🎯 SSTable (${sst.id}, L${sst.level}): Bloom Filter = POSITIVO. Chave encontrada no bloco de dados!`);
          foundInDisk = true;
        } else {
          trace.push(`[2] ⚠️ SSTable (${sst.id}): Falso Positivo do Bloom Filter! Verificado disco e não encontrado.`);
        }
      } else {
        trace.push(`[2] 🛡️ SSTable (${sst.id}): Bloom Filter = NEGATIVO. Disco PULADO sem fazer I/O!`);
      }
    });

    if (!foundInDisk) {
      trace.push(`[3] ❌ Chave "${target}" não existe no storage.`);
    }

    setReadTrace(trace);
    setStats((prev) => ({ ...prev, readsCount: prev.readsCount + 1 }));
  };

  const handleReset = () => {
    setMemTable([
      { key: 'usr_101', value: 'Alice', timestamp: 1 },
      { key: 'usr_102', value: 'Bob', timestamp: 2 },
    ]);
    setSstables([
      { id: 'sst_l0_1', level: 0, keys: ['usr_080', 'usr_092'], bloomFilterSize: 256, bloomFilterHits: 5 },
      { id: 'sst_l1_1', level: 1, keys: ['usr_001', 'usr_020', 'usr_045'], bloomFilterSize: 512, bloomFilterHits: 18 },
    ]);
    setReadTrace([]);
    setWalLogs(['WAL reset.']);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HardDrive className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Laboratório Avançado • Storage Engines
            </span>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              RocksDB • Cassandra • ClickHouse • DuckDB
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {language === 'pt'
              ? 'Simulador de LSM-Tree (Log-Structured Merge-Tree) vs B+Tree'
              : 'LSM-Tree vs B+Tree Storage Engine Simulator'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'pt'
              ? 'Visualize como gravações sequenciais em RAM (MemTable) e no WAL são transformadas em arquivos imutáveis no disco (SSTables), otimizadas por Bloom Filters e Compactação Leveled.'
              : 'Visualize how sequential in-memory writes and WAL flush to immutable disk SSTables, optimized by Bloom Filters and Leveled Compaction.'}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Lab</span>
        </button>
      </div>

      {/* Engine Comparison Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => {
            setEngineType('lsm');
            sound.playClick();
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            engineType === 'lsm'
              ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-black">LSM-Tree (Append-Only)</span>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
              Escrita 10x Mais Rápida
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            Zero random writes no disco. Toda escrita vai para WAL sequencial e MemTable em RAM. O disco recebe apenas streams ordenados imutáveis (SSTables).
          </p>
        </button>

        <button
          onClick={() => {
            setEngineType('btree');
            sound.playClick();
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            engineType === 'btree'
              ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-black">B+Tree (In-Place Update)</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
              Leitura Ponto O(log N)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            Usado por PostgreSQL, MySQL InnoDB. Atualiza páginas de 8KB/16KB diretamente no disco. Excelente para leituras pontuais, mas sofre com Random I/O sob alta carga de escrita.
          </p>
        </button>
      </div>

      {/* Interactive Controls: Write PUT vs Read GET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        {/* Write Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
            <Plus className="w-3.5 h-3.5" />
            Operação de Escrita (PUT)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-500 block">Chave (Key):</label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="usr_105"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 block">Valor (Payload):</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: David"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWrite}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gravar (PUT no WAL + MemTable)</span>
            </button>
            <button
              onClick={() => triggerFlush()}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition-colors"
              title="Forçar flush para SSTable L0"
            >
              Flush RAM
            </button>
          </div>
        </div>

        {/* Read Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
            <Search className="w-3.5 h-3.5" />
            Operação de Consulta (GET)
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-500 block">Buscar Chave:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="usr_101"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRead}
                className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Consultar</span>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Sugestões rápidas:</span>
            <div className="flex gap-1.5">
              {['usr_101', 'usr_080', 'usr_999'].map((k) => (
                <button
                  key={k}
                  onClick={() => setSearchKey(k)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual LSM Memory & Disk Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Component 1: RAM (WAL + MemTable) */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase">
              <Cpu className="w-4 h-4" />
              1. Memória RAM (Volátil)
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Sub-Microsegundo
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-500 block mb-1">
              MemTable (SkipList Ordenada) [{memTable.length}/5]:
            </span>
            {memTable.length === 0 ? (
              <div className="p-3 rounded-lg border border-dashed border-slate-800 text-center text-xs font-mono text-slate-600">
                MemTable Vazia (Flushed para L0)
              </div>
            ) : (
              <div className="space-y-1">
                {memTable.map((item) => (
                  <div
                    key={item.key}
                    className="flex justify-between items-center p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono"
                  >
                    <span className="text-emerald-300 font-bold">{item.key}</span>
                    <span className="text-slate-400">"{item.value}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-500 block mb-1">
              Write-Ahead Log (WAL em Disco Sequencial):
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {walLogs.map((log, idx) => (
                <div key={idx} className="text-[10px] font-mono text-slate-400 truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Component 2: Level 0 SSTables (Disk) */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
              <HardDrive className="w-4 h-4" />
              2. Nível L0 no Disco (SSTables)
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
              Imutáveis
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Arquivos imutáveis gerados a cada flush. Podem conter faixas de chaves sobrepostas.
          </p>

          <div className="space-y-2">
            {sstables
              .filter((s) => s.level === 0)
              .map((sst) => (
                <div
                  key={sst.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300 font-bold">{sst.id}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                      Bloom: {sst.bloomFilterSize} bits
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Chaves: {sst.keys.join(', ')}
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={triggerCompaction}
            disabled={sstables.filter((s) => s.level === 0).length === 0}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Executar Leveled Compaction (L0 → L1)</span>
          </button>
        </div>

        {/* Component 3: Level 1+ Compacted SSTables */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase">
              <Layers className="w-4 h-4" />
              3. Nível L1 no Disco (Compactado)
            </div>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
              Faixas Não Sobrepostas
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Chaves desduplicadas e ordenadas globalmente. Consultas precisam ler no máximo 1 arquivo por nível!
          </p>

          <div className="space-y-2">
            {sstables
              .filter((s) => s.level === 1)
              .map((sst) => (
                <div
                  key={sst.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-purple-900/60 text-xs font-mono space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-bold">{sst.id}</span>
                    <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800">
                      Non-overlapping
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Chaves: {sst.keys.join(', ')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Read Trace Inspector */}
      {readTrace.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px] mb-1">
            <Search className="w-3.5 h-3.5" />
            Trace de Execução da Consulta GET "{searchKey}":
          </div>
          {readTrace.map((line, idx) => (
            <div key={idx} className="text-slate-300">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Deep Engineering Insight Box */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-indigo-300 font-mono uppercase block mb-0.5">
            Por que LSM-Trees dominam o Big Data moderno:
          </strong>
          {language === 'pt' ? (
            <>
              Em discos NVMe e SSDs modernos, <strong>gravações sequenciais são até 50x mais rápidas que gravações randômicas</strong>. O LSM-Tree transforma todas as inserções e updates em gravações sequenciais no WAL e na MemTable. O custo disso é a <em>Write Amplification</em> durante a compactação e a necessidade de <em>Bloom Filters</em> para evitar que leituras varram dezenas de SSTables desnecessariamente. É a fundação do <strong>RocksDB, Cassandra, ClickHouse, Apache Hudi e CockroachDB</strong>.
            </>
          ) : (
            <>
              Sequential writes are up to 50x faster than random writes. LSM-Tree turns all incoming writes into sequential appends. Bloom filters prevent unnecessary disk lookups. This architecture powers RocksDB, Cassandra, and ClickHouse.
            </>
          )}
        </div>
      </div>
    </div>
  );
};
