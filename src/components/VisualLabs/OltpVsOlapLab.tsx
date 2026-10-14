import React, { useState, useRef, useEffect } from 'react';
import { Database, Play, RotateCcw, Zap, HardDrive, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RowRecord {
  id: number;
  cliente: string;
  categoria: string;
  produto: string;
  valor: number;
  data: string;
}

const SAMPLE_DATA: readonly RowRecord[] = Object.freeze([
  { id: 101, cliente: 'Ana Lima', categoria: 'Tech', produto: 'Notebook Pro', valor: 4500, data: '2026-10-01' },
  { id: 102, cliente: 'Carlos Silva', categoria: 'Móveis', produto: 'Mesa Esculpir', valor: 850, data: '2026-10-01' },
  { id: 103, cliente: 'Beatriz Dias', categoria: 'Tech', produto: 'Monitor 4K', valor: 2100, data: '2026-10-02' },
  { id: 104, cliente: 'Diego Rocha', categoria: 'Livros', produto: 'Data Engineering Bible', valor: 140, data: '2026-10-02' },
  { id: 105, cliente: 'Elena Costa', categoria: 'Tech', produto: 'Teclado Mecânico', valor: 450, data: '2026-10-03' },
  { id: 106, cliente: 'Fernando Paz', categoria: 'Móveis', produto: 'Cadeira Ergonômica', valor: 1200, data: '2026-10-03' },
  { id: 107, cliente: 'Gabriela Vaz', categoria: 'Tech', produto: 'Mouse Sem Fio', valor: 190, data: '2026-10-04' },
  { id: 108, cliente: 'Helena Ramos', categoria: 'Tech', produto: 'Headset Noise-Cancelling', valor: 980, data: '2026-10-04' },
]);

export const OltpVsOlapLab: React.FC = () => {
  const { language } = useLanguage();
  const [activeEngine, setActiveEngine] = useState<'oltp' | 'olap'>('oltp');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [scannedItems, setScannedItems] = useState<{ rows: number[]; cols: string[] }>({ rows: [], cols: [] });
  const [completed, setCompleted] = useState<boolean>(false);
  const [queryFilter, setQueryFilter] = useState<'Tech' | 'Móveis'>('Tech');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const reset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setCompleted(false);
    setScannedItems({ rows: [], cols: [] });
  };

  const runQuery = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(true);
    setCompleted(false);
    setScannedItems({ rows: [], cols: [] });

    if (activeEngine === 'oltp') {
      let currentStep = 0;
      timerRef.current = setInterval(() => {
        if (currentStep < SAMPLE_DATA.length) {
          const item = SAMPLE_DATA[currentStep];
          if (item && typeof item.id === 'number') {
            const currentId = item.id;
            setScannedItems((prev) => {
              const prevRows = Array.isArray(prev?.rows) ? prev.rows : [];
              return {
                rows: prevRows.includes(currentId) ? prevRows : [...prevRows, currentId],
                cols: ['id', 'cliente', 'categoria', 'produto', 'valor', 'data'],
              };
            });
          }
          currentStep++;
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRunning(false);
          setCompleted(true);
        }
      }, 250);
    } else {
      let colStep = 0;
      const allRowIds = SAMPLE_DATA.filter((d): d is RowRecord => Boolean(d && typeof d.id === 'number')).map((d) => d.id);
      timerRef.current = setInterval(() => {
        if (colStep === 0) {
          setScannedItems({ rows: allRowIds, cols: ['categoria'] });
          colStep++;
        } else if (colStep === 1) {
          setScannedItems({ rows: allRowIds, cols: ['categoria', 'valor'] });
          colStep++;
        } else {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRunning(false);
          setCompleted(true);
        }
      }, 450);
    }
  };

  const matchingRecords = SAMPLE_DATA.filter((r) => r && r.categoria === queryFilter);
  const totalValor = matchingRecords.reduce((acc, curr) => acc + (curr?.valor ?? 0), 0);
  const mediaValor = matchingRecords.length > 0 ? (totalValor / matchingRecords.length).toFixed(2) : '0.00';

  const rowsScannedCount = scannedItems?.rows?.length ?? 0;
  const colsScannedCount = scannedItems?.cols?.length ?? 0;
  const totalFields = 48;
  const fieldsRead = activeEngine === 'oltp'
    ? (completed ? 48 : rowsScannedCount * 6)
    : (completed ? 16 : colsScannedCount * 8);

  const ioReduction = activeEngine === 'olap'
    ? (language === 'pt' ? '66.7% menos I/O' : '66.7% less I/O')
    : (language === 'pt' ? '100% dos dados lidos (Full Row Scan)' : '100% of data read (Full Row Scan)');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" /> {language === 'pt' ? 'Laboratório Visual 01 • Conceito #2' : 'Visual Lab 01 • Concept #2'}
          </div>
          <h3 className="text-xl font-bold text-white">
            {language === 'pt'
              ? 'Simulador de Storage Engine: OLTP (Linha) vs OLAP (Coluna)'
              : 'Storage Engine Simulator: OLTP (Row) vs OLAP (Column)'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {language === 'pt'
              ? 'Veja fisicamente como blocos de disco são varridos para calcular uma agregação: '
              : 'Physically observe how disk blocks are scanned to compute an aggregation: '}
            <code className="text-cyan-300 font-mono">AVG(valor) WHERE categoria = '{queryFilter}'</code>.
          </p>
        </div>

        {/* Engine switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => { setActiveEngine('oltp'); reset(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEngine === 'oltp'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" /> OLTP ({language === 'pt' ? 'Por Linha' : 'Row-Oriented'})
          </button>
          <button
            onClick={() => { setActiveEngine('olap'); reset(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeEngine === 'olap'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> OLAP ({language === 'pt' ? 'Colunar' : 'Columnar'})
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="mt-6 bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold">
            {language === 'pt' ? 'Consulta Analítica:' : 'Analytical Query:'}
          </span>
          <code className="text-sm font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            SELECT AVG(valor) FROM vendas WHERE categoria = '{queryFilter}';
          </code>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400">
            {language === 'pt' ? 'Filtrar Categoria:' : 'Filter Category:'}
          </label>
          <select
            value={queryFilter}
            onChange={(e) => { setQueryFilter(e.target.value as any); reset(); }}
            disabled={isRunning}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="Tech">Tech</option>
            <option value="Móveis">Móveis</option>
          </select>

          <button
            onClick={runQuery}
            disabled={isRunning}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning
              ? (language === 'pt' ? 'Varrendo Disco...' : 'Scanning Disk...')
              : (language === 'pt' ? 'Executar Query' : 'Run Query')}
          </button>

          <button
            onClick={reset}
            disabled={isRunning}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-all"
            title={language === 'pt' ? 'Resetar' : 'Reset'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Disk Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View with highlight */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              {activeEngine === 'oltp'
                ? (language === 'pt' ? 'Layout Físico em Linha (PostgreSQL/MySQL)' : 'Row Physical Layout (PostgreSQL/MySQL)')
                : (language === 'pt' ? 'Layout Físico Colunar (Parquet/ClickHouse/Snowflake)' : 'Columnar Physical Layout (Parquet/ClickHouse/Snowflake)')}
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {activeEngine === 'oltp'
                ? (language === 'pt' ? 'Lê todos os bytes da linha contígua' : 'Reads all contiguous bytes in row')
                : (language === 'pt' ? 'Lê apenas as colunas solicitadas contíguas' : 'Reads only queried contiguous columns')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('id') ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>ID</th>
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('cliente') ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>CLIENTE</th>
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('categoria') ? 'bg-cyan-500/20 text-cyan-300 font-bold border-b-2 border-cyan-400' : ''}`}>CATEGORIA (Filtro)</th>
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('produto') ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>PRODUTO</th>
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('valor') ? 'bg-cyan-500/20 text-cyan-300 font-bold border-b-2 border-cyan-400' : ''}`}>VALOR (Agregação)</th>
                  <th className={`p-2 transition-colors ${activeEngine === 'olap' && scannedItems?.cols?.includes('data') ? 'bg-cyan-500/20 text-cyan-300' : ''}`}>DATA</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DATA.map((row) => {
                  if (!row || typeof row.id !== 'number') return null;
                  const isRowScanned = activeEngine === 'oltp' && (scannedItems?.rows || []).includes(row.id);
                  const isMatch = row.categoria === queryFilter;

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-900 transition-all ${
                        isRowScanned
                          ? isMatch
                            ? 'bg-emerald-950/40 text-emerald-200'
                            : 'bg-red-950/20 text-slate-500 line-through opacity-60'
                          : 'hover:bg-slate-900/30'
                      }`}
                    >
                      <td className={`p-2 font-mono ${activeEngine === 'oltp' && isRowScanned ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        #{row.id}
                      </td>
                      <td className={`p-2 ${activeEngine === 'olap' ? 'opacity-30' : ''}`}>{row.cliente}</td>
                      <td
                        className={`p-2 font-semibold ${
                          activeEngine === 'olap' && (scannedItems?.cols || []).includes('categoria')
                            ? isMatch
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'bg-slate-800 text-slate-500'
                            : ''
                        }`}
                      >
                        {row.categoria}
                      </td>
                      <td className={`p-2 ${activeEngine === 'olap' ? 'opacity-30' : ''}`}>{row.produto}</td>
                      <td
                        className={`p-2 font-bold ${
                          activeEngine === 'olap' && (scannedItems?.cols || []).includes('valor') && isMatch
                            ? 'bg-cyan-500/30 text-cyan-300'
                            : ''
                        }`}
                      >
                        R$ {row.valor.toFixed(2)}
                      </td>
                      <td className={`p-2 text-slate-500 ${activeEngine === 'olap' ? 'opacity-30' : ''}`}>{row.data}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time I/O Metrics card */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              {language === 'pt' ? 'Métricas de Desempenho de Disco' : 'Disk Performance Metrics'}
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{language === 'pt' ? 'Campos Lidos do Disco:' : 'Fields Read from Disk:'}</span>
                  <span className="font-mono font-bold text-white">{fieldsRead} de {totalFields}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeEngine === 'oltp' ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${(fieldsRead / totalFields) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {language === 'pt' ? 'Eficiência de I/O de Storage:' : 'Storage I/O Efficiency:'}
                </span>
                <span className={`text-sm font-bold font-mono ${activeEngine === 'olap' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ioReduction}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {language === 'pt' ? 'Resultado da Agregação (Média):' : 'Aggregation Result (Average):'}
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {completed ? `R$ ${mediaValor}` : isRunning ? (language === 'pt' ? 'Calculando...' : 'Calculating...') : '—'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {matchingRecords.length} {language === 'pt' ? `registros correspondentes na categoria '${queryFilter}'` : `records matching '${queryFilter}'`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-bold block mb-1">
              {language === 'pt' ? 'Por que isso acontece?' : 'Why does this happen?'}
            </span>
            {activeEngine === 'oltp'
              ? (language === 'pt'
                ? 'No modelo Row, cada registro é um bloco indivisível. Para ler o valor de 1 coluna, a cabeça de leitura é obrigada a carregar cliente, produto, data e id na memória RAM.'
                : 'In row storage, each row is an indivisible disk block. Reading one column forces reading client, product, date, and id into RAM.')
              : (language === 'pt'
                ? 'No formato Colunar, colunas são arquivos separados contíguos. O motor lê apenas os vetores de categoria e valor, economizando transferências de rede e SSD.'
                : 'In columnar format, columns are separate contiguous blocks. The engine reads only category and amount, saving SSD and network I/O.')}
          </div>
        </div>
      </div>
    </div>
  );
};
