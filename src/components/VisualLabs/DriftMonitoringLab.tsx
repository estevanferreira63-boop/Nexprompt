import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Sliders, RefreshCw, BarChart2 } from 'lucide-react';

export const DriftMonitoringLab: React.FC = () => {
  // Baseline training values: Salário médio 4500, Idade média 32, Noturno 10%
  const [salarioMedio, setSalarioMedio] = useState<number>(4500);
  const [idadeMedia, setIdadeMedia] = useState<number>(32);
  const [transacoesNoturnas, setTransacoesNoturnas] = useState<number>(12);

  // Baseline reference
  const BASE_SALARIO = 4500;
  const BASE_IDADE = 32;
  const BASE_NOTURNO = 10;

  // Calculate simulated PSI (Population Stability Index)
  const driftSalario = Math.abs(salarioMedio - BASE_SALARIO) / BASE_SALARIO;
  const driftIdade = Math.abs(idadeMedia - BASE_IDADE) / BASE_IDADE;
  const driftNoturno = Math.abs(transacoesNoturnas - BASE_NOTURNO) / 50;

  const psiScore = Number((driftSalario * 0.4 + driftIdade * 0.35 + driftNoturno * 0.25).toFixed(3));

  let statusText = 'Distribuição Estável';
  let statusColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
  let badgeClass = 'bg-emerald-500';

  if (psiScore >= 0.2) {
    statusText = 'ALERTA CRÍTICO: Data Drift Severo Detectado! (Disparar Retreino)';
    statusColor = 'text-red-400 bg-red-950/40 border-red-500/40';
    badgeClass = 'bg-red-500';
  } else if (psiScore >= 0.1) {
    statusText = 'AVISO: Mudança Moderada de Distribuição (Monitorar Acurácia)';
    statusColor = 'text-amber-400 bg-amber-950/40 border-amber-500/40';
    badgeClass = 'bg-amber-500';
  }

  const resetBaseline = () => {
    setSalarioMedio(4500);
    setIdadeMedia(32);
    setTransacoesNoturnas(10);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> Laboratório Visual 06 • Conceitos #76, #77, #78
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de Data Drift & PSI (Population Stability Index)</h3>
          <p className="text-slate-400 text-sm mt-1">
            Altere a distribuição das variáveis dos clientes em produção e veja o cálculo em tempo real de Covariate Shift e alertas de MLOps.
          </p>
        </div>

        <button
          onClick={resetBaseline}
          className="self-start md:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Restaurar Baseline de Treino
        </button>
      </div>

      {/* Main Grid: Controls vs Indicators */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Control Panel */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Variáveis de Entrada em Produção (Live Data)
            </span>
            <span className="text-[11px] text-slate-500">Mova para simular drift</span>
          </div>

          {/* Salário Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Renda Média do Cliente:</span>
              <span className="font-bold text-cyan-400">R$ {salarioMedio.toLocaleString()} <span className="text-slate-500 font-normal">(Base: R$ 4.500)</span></span>
            </div>
            <input
              type="range"
              min="2000"
              max="9000"
              step="100"
              value={salarioMedio}
              onChange={(e) => setSalarioMedio(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Idade Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Idade Média do Usuário:</span>
              <span className="font-bold text-purple-400">{idadeMedia} anos <span className="text-slate-500 font-normal">(Base: 32 anos)</span></span>
            </div>
            <input
              type="range"
              min="18"
              max="65"
              step="1"
              value={idadeMedia}
              onChange={(e) => setIdadeMedia(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Transações Noturnas Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">% de Transações Noturnas (Fraude Risk):</span>
              <span className="font-bold text-rose-400">{transacoesNoturnas}% <span className="text-slate-500 font-normal">(Base: 10%)</span></span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="2"
              value={transacoesNoturnas}
              onChange={(e) => setTransacoesNoturnas(Number(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Drift Meter */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-rose-400" /> Métrica Oficial PSI (Population Stability Index)
              </span>
              <span className="text-[11px] font-mono text-slate-400">Padrão da Indústria</span>
            </div>

            {/* Big PSI Score Display */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-center mb-4">
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Índice PSI Calculado:</span>
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                psiScore >= 0.2 ? 'text-red-400' : psiScore >= 0.1 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {psiScore}
              </span>
              <div className="w-full bg-slate-950 rounded-full h-3 mt-3 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${badgeClass}`}
                  style={{ width: `${Math.min(100, (psiScore / 0.4) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.0 (Idêntico)</span>
                <span>0.1 (Alerta)</span>
                <span>0.2+ (Drift Severo)</span>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`p-3 rounded-lg border text-xs font-mono font-semibold flex items-center gap-2 ${statusColor}`}>
              {psiScore >= 0.2 ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{statusText}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <span className="text-rose-400 font-bold block mb-1">Impacto em Produção:</span>
            Quando o PSI ultrapassa 0.2, o modelo de IA está operando em um território estatístico onde quase não viu dados parecidos durante o treinamento. A taxa de acertos cai silenciosamente sem nenhum erro de código de software.
          </div>
        </div>
      </div>
    </div>
  );
};
