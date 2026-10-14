import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, FileText } from 'lucide-react';

interface RawRecord {
  id: string;
  payload: string;
  ingested_at: string;
  error?: string;
}

interface SilverRecord {
  order_id: number;
  customer_name: string;
  total_amount: number;
  currency: string;
  status: string;
  cleaned_at: string;
}

interface GoldMetric {
  metric: string;
  value: string;
  description: string;
}

const BRONZE_SAMPLE: RawRecord[] = [
  { id: 'raw-1', payload: '{"order_id": 401, "customer": "Ana Lima", "amount": "150.00", "curr": "BRL", "status": "PAID"}', ingested_at: '08:14:01' },
  { id: 'raw-2', payload: '{"order_id": 402, "customer": "Carlos S.", "amount": "-50.00", "curr": "BRL", "status": "PAID"}', ingested_at: '08:14:02', error: 'Valor negativo inválido' },
  { id: 'raw-3', payload: '{"order_id": 401, "customer": "Ana Lima", "amount": "150.00", "curr": "BRL", "status": "PAID"}', ingested_at: '08:14:03', error: 'Duplicata exata de #401' },
  { id: 'raw-4', payload: '{"order_id": 403, "customer": "Beatriz D.", "amount": "890.50", "curr": "BRL", "status": "PAID"}', ingested_at: '08:14:05' },
  { id: 'raw-5', payload: '{"order_id": 404, "customer": "Diego R.", "amount": "null", "curr": "USD", "status": "PENDING"}', ingested_at: '08:14:07', error: 'Valor nulo descartado' },
  { id: 'raw-6', payload: '{"order_id": 405, "customer": "Elena Costa", "amount": "320.00", "curr": "BRL", "status": "PAID"}', ingested_at: '08:14:09' },
];

export const MedallionLab: React.FC = () => {
  const [stage, setStage] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [silverData, setSilverData] = useState<SilverRecord[]>([]);
  const [goldMetrics, setGoldMetrics] = useState<GoldMetric[]>([]);

  const runBronzeToSilver = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Clean, filter errors, cast types, deduplicate
      const cleaned: SilverRecord[] = [
        { order_id: 401, customer_name: 'Ana Lima', total_amount: 150.00, currency: 'BRL', status: 'PAID', cleaned_at: '08:14:15' },
        { order_id: 403, customer_name: 'Beatriz D.', total_amount: 890.50, currency: 'BRL', status: 'PAID', cleaned_at: '08:14:15' },
        { order_id: 405, customer_name: 'Elena Costa', total_amount: 320.00, currency: 'BRL', status: 'PAID', cleaned_at: '08:14:15' },
      ];
      setSilverData(cleaned);
      setStage('silver');
      setIsProcessing(false);
    }, 800);
  };

  const runSilverToGold = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const metrics: GoldMetric[] = [
        { metric: 'Faturamento Total Líquido', value: 'R$ 1.360,50', description: 'Soma dos pedidos válidos e pagos' },
        { metric: 'Ticket Médio', value: 'R$ 453,50', description: 'Média por pedido aprovado' },
        { metric: 'Volume de Pedidos Válidos', value: '3 pedidos', description: '100% deduplicados e confirmados' },
        { metric: 'Taxa de Rejeição Bronze', value: '50% (3 descartados)', description: 'Duplicatas e nulos isolados na quarentena' },
      ];
      setGoldMetrics(metrics);
      setStage('gold');
      setIsProcessing(false);
    }, 800);
  };

  const resetPipeline = () => {
    setStage('bronze');
    setSilverData([]);
    setGoldMetrics([]);
    setIsProcessing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Laboratório Visual 02 • Conceito #10
          </div>
          <h3 className="text-xl font-bold text-white">Simulador da Arquitetura Medallion: Bronze → Silver → Gold</h3>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe o saneamento de dados de payloads JSON caóticos até relatórios analíticos limpos e agregados de diretoria.
          </p>
        </div>

        <button
          onClick={resetPipeline}
          className="self-start md:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reiniciar Esteira
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => setStage('bronze')}
          className={`p-3 rounded-xl border text-left transition-all ${
            stage === 'bronze'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase mb-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Camada Bronze
            </span>
            <span>Raw Data</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">JSONs brutos, append-only, com erros e duplicatas</p>
        </button>

        <button
          onClick={() => silverData.length > 0 && setStage('silver')}
          disabled={silverData.length === 0}
          className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 ${
            stage === 'silver'
              ? 'bg-slate-800 border-slate-400 text-white shadow-lg'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase mb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Camada Silver
            </span>
            <span>Enriched / Cleaned</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">Tipada, deduplicada e padronizada</p>
        </button>

        <button
          onClick={() => goldMetrics.length > 0 && setStage('gold')}
          disabled={goldMetrics.length === 0}
          className={`p-3 rounded-xl border text-left transition-all disabled:opacity-40 ${
            stage === 'gold'
              ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-200 shadow-lg shadow-yellow-500/10'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase mb-1">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> Camada Gold
            </span>
            <span>Business Aggregates</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">Métricas de negócio para BI e executivos</p>
        </button>
      </div>

      {/* Main Content by Stage */}
      <div className="mt-6">
        {stage === 'bronze' && (
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold block">1. Camada Bronze (Lago Bruto)</span>
                <p className="text-xs text-slate-400">Payloads de webhooks recebidos em streaming no S3. Contém dados corrompidos e repetidos intencionais.</p>
              </div>
              <button
                onClick={runBronzeToSilver}
                disabled={isProcessing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {isProcessing ? 'Processando Limpeza...' : 'Executar Ingestão Bronze → Silver'}
              </button>
            </div>

            <div className="space-y-2">
              {BRONZE_SAMPLE.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                    item.error
                      ? 'bg-red-950/20 border-red-900/50 text-red-300'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                    <span className="text-slate-500 text-[10px]">[{item.ingested_at}]</span>
                    <span className="text-amber-400 font-bold">#{item.id}:</span>
                    <span className="text-slate-300 truncate">{item.payload}</span>
                  </div>
                  {item.error ? (
                    <span className="text-[11px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50 flex items-center gap-1 self-start md:self-auto">
                      <AlertTriangle className="w-3 h-3" /> {item.error}
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1 self-start md:self-auto">
                      <CheckCircle2 className="w-3 h-3" /> Válido
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'silver' && (
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-slate-300 font-bold block">2. Camada Silver (Tabela Curada)</span>
                <p className="text-xs text-slate-400">Dados filtrados, tipos de moeda convertidos para Float, duplicatas descartadas e timestamps padronizados.</p>
              </div>
              <button
                onClick={runSilverToGold}
                disabled={isProcessing}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {isProcessing ? 'Agregando Métricas...' : 'Executar Agregação Silver → Gold'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                    <th className="p-2.5">ORDER_ID</th>
                    <th className="p-2.5">CLIENTE</th>
                    <th className="p-2.5">VALOR</th>
                    <th className="p-2.5">MOEDA</th>
                    <th className="p-2.5">STATUS</th>
                    <th className="p-2.5">PROCESSADO_EM</th>
                  </tr>
                </thead>
                <tbody>
                  {silverData.map((row) => (
                    <tr key={row.order_id} className="border-b border-slate-900 hover:bg-slate-900/30">
                      <td className="p-2.5 text-cyan-400 font-bold">#{row.order_id}</td>
                      <td className="p-2.5 text-slate-200">{row.customer_name}</td>
                      <td className="p-2.5 font-bold text-emerald-400">R$ {row.total_amount.toFixed(2)}</td>
                      <td className="p-2.5 text-slate-400">{row.currency}</td>
                      <td className="p-2.5 text-emerald-400 bg-emerald-950/20 rounded font-semibold">{row.status}</td>
                      <td className="p-2.5 text-slate-500">{row.cleaned_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>3 registros passaram no contrato de qualidade. 2 registros descartados (1 duplicata, 1 nulo, 1 valor negativo).</span>
            </div>
          </div>
        )}

        {stage === 'gold' && (
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
            <div className="mb-4">
              <span className="text-xs font-mono uppercase text-yellow-400 font-bold block">3. Camada Gold (Data Mart / Consumo de BI)</span>
              <p className="text-xs text-slate-400">Tabelas sumarizadas prontas para consumo direto em dashboards executivos e algoritmos de ML.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {goldMetrics.map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-yellow-500/20 shadow-lg">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">{item.metric}</span>
                  <span className="text-xl font-bold font-mono text-yellow-400 block">{item.value}</span>
                  <p className="text-[11px] text-slate-500 mt-2">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-950/20 border border-yellow-500/30 rounded-xl">
              <h5 className="text-xs font-bold font-mono uppercase text-yellow-300 mb-1">O Valor da Arquitetura Medallion:</h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                Se uma regra de negócio mudar amanhã (ex: incluir pagamentos com cupons), a camada <strong>Bronze original</strong> nunca foi deletada. Você pode simplesmente reprocessar a transformação para Silver e Gold sem precisar reingerir dados das fontes transacionais!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
