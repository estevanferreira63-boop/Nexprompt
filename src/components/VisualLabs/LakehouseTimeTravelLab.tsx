import React, { useState } from 'react';
import { History, Play, Trash2, RotateCcw, CheckCircle2, Clock, FileCode, HardDrive } from 'lucide-react';

interface CommitVersion {
  version: number;
  operation: string;
  timestamp: string;
  description: string;
  activeRows: number;
  activeFiles: string[];
  obsoleteFiles: string[];
}

const COMMIT_HISTORY: CommitVersion[] = [
  {
    version: 0,
    operation: 'CREATE TABLE',
    timestamp: '2026-10-05 10:00:00',
    description: 'Carga inicial de 1.000 clientes',
    activeRows: 1000,
    activeFiles: ['part-000-v0.parquet', 'part-001-v0.parquet'],
    obsoleteFiles: [],
  },
  {
    version: 1,
    operation: 'UPDATE',
    timestamp: '2026-10-05 11:30:00',
    description: 'Aumento de 20% no limite de crédito dos VIPs',
    activeRows: 1000,
    activeFiles: ['part-000-v0.parquet', 'part-001-v1.parquet'],
    obsoleteFiles: ['part-001-v0.parquet'],
  },
  {
    version: 2,
    operation: 'DELETE (BUG)',
    timestamp: '2026-10-05 14:15:00',
    description: 'Acidente! DELETE executado sem WHERE adequado (perda de 600 clientes)',
    activeRows: 400,
    activeFiles: ['part-000-v2.parquet'],
    obsoleteFiles: ['part-000-v0.parquet', 'part-001-v0.parquet', 'part-001-v1.parquet'],
  },
  {
    version: 3,
    operation: 'RESTORE TABLE',
    timestamp: '2026-10-05 14:18:00',
    description: 'Restauração atômica para o estado da Versão 1 via Time Travel!',
    activeRows: 1000,
    activeFiles: ['part-000-v0.parquet', 'part-001-v1.parquet'],
    obsoleteFiles: ['part-000-v2.parquet', 'part-001-v0.parquet'],
  },
];

export const LakehouseTimeTravelLab: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<number>(3);
  const [isVacuumed, setIsVacuumed] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const currentCommit = COMMIT_HISTORY.find((c) => c.version === selectedVersion) || COMMIT_HISTORY[0];

  const runVacuum = () => {
    setIsVacuumed(true);
    setNotification('VACUUM executado com sucesso: Arquivos Parquet obsoletos foram purgados fisicamente do bucket S3.');
    setTimeout(() => setNotification(null), 4000);
  };

  const restoreToVersion = (v: number) => {
    setSelectedVersion(v);
    setNotification(`Consulta executada: SELECT * FROM clientes VERSION AS OF ${v}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const resetLab = () => {
    setSelectedVersion(3);
    setIsVacuumed(false);
    setNotification(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" /> Laboratório Visual 04 • Conceitos #61, #64, #65, #70
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de ACID Log, Time Travel & Vacuum no Lakehouse</h3>
          <p className="text-slate-400 text-sm mt-1">
            Navegue pelo log atômico de commits, restaure dados de acidentes humanos instantaneamente e limpe arquivos órfãos com Vacuum.
          </p>
        </div>

        <button
          onClick={resetLab}
          className="self-start md:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Resetar
        </button>
      </div>

      {notification && (
        <div className="mt-4 p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2 animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Commit History Timeline */}
      <div className="mt-6">
        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" /> Log de Transações (_delta_log/ ou Iceberg Manifests)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMMIT_HISTORY.map((commit) => {
            const isSelected = selectedVersion === commit.version;
            return (
              <button
                key={commit.version}
                onClick={() => restoreToVersion(commit.version)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    commit.version === 2 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    v{commit.version} • {commit.operation}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{commit.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mb-2">{commit.description}</p>
                <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-900">
                  <span>Linhas Ativas:</span>
                  <span className="font-bold text-white">{commit.activeRows.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Inspection & Disk State */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SQL Time Travel Query View */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Consulta no Snapshot v{selectedVersion}
            </span>
            <code className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
              SELECT * FROM clientes VERSION AS OF {selectedVersion};
            </code>
          </div>

          <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 font-mono text-xs">
            <div className="text-slate-400 mb-2">// Metadados da Versão Ativa no Lakehouse:</div>
            <div className="text-slate-300"><span className="text-cyan-400">commit_version:</span> {currentCommit.version}</div>
            <div className="text-slate-300"><span className="text-cyan-400">operation:</span> "{currentCommit.operation}"</div>
            <div className="text-slate-300"><span className="text-cyan-400">total_records:</span> {currentCommit.activeRows}</div>
            <div className="text-slate-300"><span className="text-cyan-400">active_parquet_files:</span> {JSON.stringify(currentCommit.activeFiles)}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => restoreToVersion(1)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> RESTORE TO VERSION 1
            </button>
            <button
              onClick={runVacuum}
              disabled={isVacuumed}
              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-bold rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" /> {isVacuumed ? 'Arquivos Purgados (VACUUM)' : 'Executar VACUUM RETAIN 0 HOURS'}
            </button>
          </div>
        </div>

        {/* Physical Storage Layout (S3 Object Storage) */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" /> Arquivos Físicos no Bucket S3
          </h4>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-500 mb-1">Arquivos Ativos referenciados pelo log:</div>
            {currentCommit.activeFiles.map((file) => (
              <div key={file} className="p-2 bg-emerald-950/20 border border-emerald-800/40 rounded text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span>{file}</span>
                <span className="text-[10px] text-emerald-400">ATIVO</span>
              </div>
            ))}

            <div className="text-[11px] font-mono text-slate-500 mt-4 mb-1">Arquivos Obsoletos (Histórico / Lixo):</div>
            {!isVacuumed ? (
              currentCommit.obsoleteFiles.length > 0 ? (
                currentCommit.obsoleteFiles.map((file) => (
                  <div key={file} className="p-2 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-400 flex items-center justify-between opacity-70">
                    <span>{file}</span>
                    <span className="text-[10px] text-amber-400">RETIDO (Time Travel)</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-2">Nenhum arquivo órfão nesta versão.</div>
              )
            ) : (
              <div className="p-2 bg-red-950/20 border border-red-900/30 rounded text-xs font-mono text-red-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Arquivos deletados fisicamente do S3 pelo VACUUM!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
