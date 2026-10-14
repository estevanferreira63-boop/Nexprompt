import React, { useState } from 'react';
import { Package, Play, RotateCcw, CheckCircle2, AlertTriangle, Layers, Clock } from 'lucide-react';

export const SmallFilesCompactionLab: React.FC = () => {
  const [isCompacted, setIsCompacted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const runCompaction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsCompacted(true);
      setIsProcessing(false);
    }, 700);
  };

  const reset = () => {
    setIsCompacted(false);
    setIsProcessing(false);
  };

  const fileCount = isCompacted ? 2 : 48;
  const avgFileSize = isCompacted ? '256 MB' : '4 KB';
  const queryLatencyMs = isCompacted ? 38 : 1240;
  const metadataRequests = isCompacted ? 2 : 48;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" /> Laboratório Visual 08 • Conceitos #30, #69
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de Small Files Problem & Compactação (OPTIMIZE)</h3>
          <p className="text-slate-400 text-sm mt-1">
            Observe como dezenas de micro-arquivos gerados por streaming asfixiam as chamadas de API do S3 e como o bin-packing restaura a velocidade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCompaction}
            disabled={isCompacted || isProcessing}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {isProcessing ? 'Compactando...' : 'Executar OPTIMIZE (Bin-Packing)'}
          </button>
          <button
            onClick={reset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Arquivos no S3:</span>
          <span className={`text-2xl font-bold font-mono ${isCompacted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {fileCount} arquivos
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Tamanho Médio:</span>
          <span className="text-2xl font-bold font-mono text-white">{avgFileSize}</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Latência de Query:</span>
          <span className={`text-2xl font-bold font-mono ${isCompacted ? 'text-emerald-400' : 'text-red-400'}`}>
            {queryLatencyMs} ms
          </span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Chamadas S3 GET Metadata:</span>
          <span className={`text-2xl font-bold font-mono ${isCompacted ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metadataRequests} calls
          </span>
        </div>
      </div>

      {/* Visual File System Box */}
      <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-4 text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase">
            {isCompacted ? 'Arquivos Parquet Compactados (Tamanho Ideal de 256MB)' : 'Micro-arquivos Fragmentados (Overhead Extremo)'}
          </span>
          <span className={isCompacted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isCompacted ? 'Status: Ótimo' : 'Status: Fragmentado'}
          </span>
        </div>

        {isCompacted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-emerald-950/30 border border-emerald-500/50 rounded-xl text-center">
              <span className="font-mono text-sm font-bold text-emerald-300 block mb-1">part-00000-compacted.parquet</span>
              <span className="text-xs text-slate-400 font-mono">Tamanho: 256 MB • 1.200.000 linhas • Alta compressão ZSTD</span>
            </div>
            <div className="p-6 bg-emerald-950/30 border border-emerald-500/50 rounded-xl text-center">
              <span className="font-mono text-sm font-bold text-emerald-300 block mb-1">part-00001-compacted.parquet</span>
              <span className="text-xs text-slate-400 font-mono">Tamanho: 256 MB • 1.200.000 linhas • Alta compressão ZSTD</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-900/60 rounded-lg border border-slate-800">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="p-2 bg-amber-950/20 border border-amber-500/30 rounded text-center text-[10px] font-mono text-amber-300 flex flex-col items-center justify-center hover:border-amber-400 transition-colors"
                title={`part-${i}.parquet (~4KB)`}
              >
                <div className="w-3 h-3 bg-amber-400 rounded-sm mb-1 opacity-70" />
                <span>4KB</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
          {isCompacted ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 48 micro-arquivos foram lidos e fundidos em 2 arquivos consolidados. Latência de query caiu em 97%!
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Cada pequeno arquivo exige abrir uma conexão de rede HTTP separada e ler headers/footers do Parquet repetidamente.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
