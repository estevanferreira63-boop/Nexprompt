import React, { useState } from 'react';
import { Compass, Play, RotateCcw, CheckCircle2, Sliders, HardDrive, Layers } from 'lucide-react';

type LayoutMode = 'random' | 'linear' | 'zorder';

interface ParquetFile {
  id: number;
  minData: number;
  maxData: number;
  minValor: number;
  maxValor: number;
}

export const ZOrderingSkippingLab: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('zorder');
  const [queryDataMin, setQueryDataMin] = useState<number>(20);
  const [queryDataMax, setQueryDataMax] = useState<number>(30);
  const [queryValorMin, setQueryValorMin] = useState<number>(600);
  const [queryValorMax, setQueryValorMax] = useState<number>(900);

  // 16 simulated Parquet files in a 4x4 grid
  // Mode affects the bounding box distribution
  const getFiles = (): ParquetFile[] => {
    if (layoutMode === 'random') {
      // Random dispersion: wide overlapping ranges in both dimensions
      return Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        minData: 1 + (i % 3) * 5,
        maxData: 25 + (i % 4) * 2,
        minValor: 100 + (i % 2) * 50,
        maxValor: 850 + (i % 3) * 40,
      }));
    } else if (layoutMode === 'linear') {
      // Linear sort on Data: Data is tightly clustered, but Valor is widely dispersed in all files
      return Array.from({ length: 16 }, (_, i) => {
        const dMin = 1 + Math.floor(i * 1.9);
        const dMax = dMin + 4;
        return {
          id: i + 1,
          minData: dMin,
          maxData: dMax,
          minValor: 50,
          maxValor: 1000, // Dispersed across entire range!
        };
      });
    } else {
      // Z-Order (Morton Space-Filling Curve): 2D spatial clustering!
      // Both Data and Valor are localized into compact 2D bounding boxes
      return [
        { id: 1, minData: 1, maxData: 8, minValor: 50, maxValor: 250 },
        { id: 2, minData: 9, maxData: 16, minValor: 50, maxValor: 250 },
        { id: 3, minData: 1, maxData: 8, minValor: 251, maxValor: 500 },
        { id: 4, minData: 9, maxData: 16, minValor: 251, maxValor: 500 },
        { id: 5, minData: 17, maxData: 24, minValor: 50, maxValor: 250 },
        { id: 6, minData: 25, maxData: 31, minValor: 50, maxValor: 250 },
        { id: 7, minData: 17, maxData: 24, minValor: 251, maxValor: 500 },
        { id: 8, minData: 25, maxData: 31, minValor: 251, maxValor: 500 },
        { id: 9, minData: 1, maxData: 8, minValor: 501, maxValor: 750 },
        { id: 10, minData: 9, maxData: 16, minValor: 501, maxValor: 750 },
        { id: 11, minData: 1, maxData: 8, minValor: 751, maxValor: 1000 },
        { id: 12, minData: 9, maxData: 16, minValor: 751, maxValor: 1000 },
        { id: 13, minData: 17, maxData: 24, minValor: 501, maxValor: 750 },
        { id: 14, minData: 25, maxData: 31, minValor: 501, maxValor: 750 },
        { id: 15, minData: 17, maxData: 24, minValor: 751, maxValor: 1000 },
        { id: 16, minData: 25, maxData: 31, minValor: 751, maxValor: 1000 },
      ];
    }
  };

  const files = getFiles();

  // Test if a file can be SKIPPED
  // A file can be skipped if its range does NOT overlap with the query filter range!
  const isFileRead = (file: ParquetFile): boolean => {
    const dataOverlap = !(file.maxData < queryDataMin || file.minData > queryDataMax);
    const valorOverlap = !(file.maxValor < queryValorMin || file.minValor > queryValorMax);
    return dataOverlap && valorOverlap;
  };

  const readFilesCount = files.filter(isFileRead).length;
  const skippedFilesCount = files.length - readFilesCount;
  const skipPercentage = ((skippedFilesCount / files.length) * 100).toFixed(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> Laboratório Visual 07 • Conceitos #28, #29
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de Data Skipping & Z-Ordering (Curva de Morton)</h3>
          <p className="text-slate-400 text-sm mt-1">
            Descubra por que ordenar por duas colunas com Z-Order permite pular até 80% dos arquivos Parquet em consultas analíticas.
          </p>
        </div>

        {/* Layout Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setLayoutMode('random')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              layoutMode === 'random' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sem Ordenação
          </button>
          <button
            onClick={() => setLayoutMode('linear')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              layoutMode === 'linear' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Linear Sort (Data)
          </button>
          <button
            onClick={() => setLayoutMode('zorder')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              layoutMode === 'zorder' ? 'bg-teal-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Z-Order (Morton)
          </button>
        </div>
      </div>

      {/* Query Filter Controls */}
      <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold">Filtro SQL WHERE:</span>
          <code className="text-xs font-mono text-teal-300 bg-teal-950/40 px-2.5 py-1 rounded border border-teal-800/40">
            WHERE data BETWEEN {queryDataMin} AND {queryDataMax} AND valor BETWEEN {queryValorMin} AND {queryValorMax}
          </code>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Data ({queryDataMin} a {queryDataMax}):</span>
            <input
              type="range"
              min="1"
              max="20"
              value={queryDataMin}
              onChange={(e) => setQueryDataMin(Number(e.target.value))}
              className="accent-teal-500 w-20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Valor (R$ {queryValorMin} a R$ {queryValorMax}):</span>
            <input
              type="range"
              min="100"
              max="700"
              step="50"
              value={queryValorMin}
              onChange={(e) => setQueryValorMin(Number(e.target.value))}
              className="accent-teal-500 w-24"
            />
          </div>
        </div>
      </div>

      {/* Visualization Grid: 16 Parquet Files */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4x4 Parquet Files Grid */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-4 text-xs">
            <span className="font-mono text-slate-400 uppercase font-bold">
              16 Arquivos Parquet no S3 (Caixas Delimitadoras Min/Max)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded bg-red-500" /> Lido do Disco ({readFilesCount})
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Pulado com Sucesso ({skippedFilesCount})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {files.map((file) => {
              const read = isFileRead(file);
              return (
                <div
                  key={file.id}
                  className={`p-3 rounded-lg border text-center transition-all flex flex-col justify-between ${
                    read
                      ? 'bg-red-950/20 border-red-500/50 text-red-200'
                      : 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold">file-{file.id}.parquet</span>
                    <span className={`px-1 rounded text-[9px] font-bold ${read ? 'bg-red-900/60 text-red-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
                      {read ? 'LIDO' : 'PULADO'}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5 mt-1">
                    <div>d: [{file.minData}..{file.maxData}]</div>
                    <div>v: [{file.minValor}..{file.maxValor}]</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skipping Statistics */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-4">
              Métricas de I/O e Data Skipping
            </span>

            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-center mb-4">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Taxa de Arquivos Pulados:</span>
              <span className="text-4xl font-extrabold font-mono text-teal-400 block">
                {skipPercentage}%
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                {skippedFilesCount} de 16 arquivos ignorados via Min/Max
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Estratégia Atual:</span>
                <span className="font-bold text-teal-300">
                  {layoutMode === 'zorder'
                    ? 'Z-Ordering (Curva Multidimensional)'
                    : layoutMode === 'linear'
                    ? 'Linear Sort na coluna Data'
                    : 'Sem Ordenação (Arquivos Dispersos)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-teal-400 font-bold block mb-1">A Mágica do Z-Order:</span>
            Ao intercalar bits das colunas, ele agrupa dados próximos no espaço 2D. Dessa forma, consultas com filtros compostos (`WHERE data = X AND valor = Y`) conseguem descartar arquivos em ambas as dimensões simultaneamente!
          </div>
        </div>
      </div>
    </div>
  );
};
