import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Play, RotateCcw, AlertTriangle, CheckCircle2, Network, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TaskProgress {
  id: number;
  records: number;
  progress: number;
  status: 'idle' | 'running' | 'completed' | 'skewed';
  timeMs: number;
}

export const SparkDagShuffleLab: React.FC = () => {
  const { language } = useLanguage();
  const [hasSkew, setHasSkew] = useState<boolean>(true);
  const [applySalting, setApplySalting] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 'done'>(1);

  const timer1Ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (timer1Ref.current) {
      clearInterval(timer1Ref.current);
      timer1Ref.current = null;
    }
    if (timer2Ref.current) {
      clearInterval(timer2Ref.current);
      timer2Ref.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const [tasksStage1, setTasksStage1] = useState<TaskProgress[]>([
    { id: 1, records: 25000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 2, records: 25000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 3, records: 25000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 4, records: 25000, progress: 0, status: 'idle', timeMs: 0 },
  ]);

  const [tasksStage2, setTasksStage2] = useState<TaskProgress[]>([
    { id: 1, records: 10000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 2, records: 12000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 3, records: 11000, progress: 0, status: 'idle', timeMs: 0 },
    { id: 4, records: 67000, progress: 0, status: 'idle', timeMs: 0 }, // Skewed task
  ]);

  const runSimulation = () => {
    clearTimers();
    setIsRunning(true);
    setCurrentStage(1);

    // Reset progress
    setTasksStage1((prev) => prev.map((t) => ({ ...t, progress: 0, status: 'running' })));
    setTasksStage2((prev) => prev.map((t) => ({ ...t, progress: 0, status: 'idle' })));

    // Stage 1 (Narrow) completes fast in parallel
    let p1 = 0;
    timer1Ref.current = setInterval(() => {
      p1 += 25;
      setTasksStage1((prev) =>
        prev.map((t) => ({
          ...t,
          progress: Math.min(100, p1),
          status: p1 >= 100 ? 'completed' : 'running',
          timeMs: 12,
        }))
      );

      if (p1 >= 100) {
        if (timer1Ref.current) {
          clearInterval(timer1Ref.current);
          timer1Ref.current = null;
        }
        setCurrentStage(2);

        // Stage 2 (Wide - GroupByKey com Shuffle)
        // If salting is enabled, task 4 is balanced
        const stage2Records = applySalting
          ? [25000, 24000, 26000, 25000]
          : hasSkew
          ? [5000, 6000, 5000, 84000]
          : [25000, 25000, 25000, 25000];

        let p2Normal = 0;
        let p2Skewed = 0;

        timer2Ref.current = setInterval(() => {
          p2Normal += 20;
          p2Skewed += applySalting || !hasSkew ? 20 : 5;

          setTasksStage2([
            { id: 1, records: stage2Records[0], progress: Math.min(100, p2Normal), status: p2Normal >= 100 ? 'completed' : 'running', timeMs: 15 },
            { id: 2, records: stage2Records[1], progress: Math.min(100, p2Normal), status: p2Normal >= 100 ? 'completed' : 'running', timeMs: 16 },
            { id: 3, records: stage2Records[2], progress: Math.min(100, p2Normal), status: p2Normal >= 100 ? 'completed' : 'running', timeMs: 14 },
            {
              id: 4,
              records: stage2Records[3],
              progress: Math.min(100, p2Skewed),
              status: p2Skewed >= 100 ? 'completed' : hasSkew && !applySalting ? 'skewed' : 'running',
              timeMs: applySalting ? 18 : hasSkew ? 120 : 15,
            },
          ]);

          if (p2Skewed >= 100) {
            if (timer2Ref.current) {
              clearInterval(timer2Ref.current);
              timer2Ref.current = null;
            }
            setIsRunning(false);
            setCurrentStage('done');
          }
        }, 120);
      }
    }, 150);
  };

  const resetAll = () => {
    clearTimers();
    setIsRunning(false);
    setCurrentStage(1);
    setTasksStage1((prev) => prev.map((t) => ({ ...t, progress: 0, status: 'idle', timeMs: 0 })));
    setTasksStage2((prev) => prev.map((t) => ({ ...t, progress: 0, status: 'idle', timeMs: 0 })));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" /> Laboratório Visual 03 • Conceitos #35, #36, #38, #42
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de DAG, Shuffles e Data Skew no Apache Spark</h3>
          <p className="text-slate-400 text-sm mt-1">
            Veja a divisão física entre transformações Narrow (locais) e Wide (Shuffle de rede) e como o Data Skew trava o cluster inteiro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {isRunning ? 'Executando DAG...' : 'Executar Job Spark'}
          </button>
          <button
            onClick={resetAll}
            disabled={isRunning}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Toggles */}
      <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={hasSkew}
              onChange={(e) => { setHasSkew(e.target.checked); resetAll(); }}
              disabled={isRunning}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500"
            />
            <span className={hasSkew ? 'text-amber-400' : 'text-slate-400'}>
              Simular Hot Key (Data Skew na chave 'Cliente #99')
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={applySalting}
              onChange={(e) => { setApplySalting(e.target.checked); resetAll(); }}
              disabled={isRunning}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
            />
            <span className={applySalting ? 'text-emerald-400' : 'text-slate-400'}>
              Aplicar Salting / AQE Skew Join (Otimização)
            </span>
          </label>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Status: {currentStage === 1 ? 'Stage 1 (Map/Filter)' : currentStage === 2 ? 'Stage 2 (Shuffle GroupBy)' : 'Job Finalizado'}
        </div>
      </div>

      {/* DAG Visualization Layout */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Shuffle Network Boundary indicator */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center">
          <div className="bg-purple-950/80 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold shadow-xl flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 animate-pulse" /> SHUFFLE BOUNDARY
          </div>
        </div>

        {/* STAGE 1: NARROW */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block">
                Stage 1 • Transformações NARROW
              </span>
              <h4 className="text-sm font-bold text-white">map() & filter(status = 'VALIDO')</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
              Zero tráfego de rede
            </span>
          </div>

          <div className="space-y-3">
            {tasksStage1.map((task) => (
              <div key={task.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300">Task #{task.id} (Executor {task.id})</span>
                  <span className="text-slate-400">{task.records.toLocaleString()} linhas</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Cada partição roda isolada na CPU local do nó executor sem depender de outros nós.
          </p>
        </div>

        {/* STAGE 2: WIDE */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-purple-400 font-bold block">
                Stage 2 • Transformações WIDE
              </span>
              <h4 className="text-sm font-bold text-white">groupBy('cliente_id').sum('valor')</h4>
            </div>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
              Redistribuição via Rede
            </span>
          </div>

          <div className="space-y-3">
            {tasksStage2.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border transition-all ${
                  task.status === 'skewed'
                    ? 'bg-red-950/30 border-red-500/50 text-red-200'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="flex items-center gap-1.5 font-bold">
                    Task #{task.id} (Partition {task.id})
                    {task.status === 'skewed' && (
                      <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-sans flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> DATA SKEW
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400">{task.records.toLocaleString()} linhas</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-150 ${
                      task.status === 'skewed' ? 'bg-red-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] leading-relaxed">
            {applySalting ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Salting Ativado: A hot key foi fatiada com sufixos aleatórios (_0, _1, _2), distribuindo os dados perfeitamente entre todas as 4 tasks!
              </span>
            ) : hasSkew ? (
              <span className="text-red-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> O Problema da Slowest Task: As tasks 1, 2 e 3 terminaram em 15ms, mas o job inteiro fica bloqueado esperando a Task 4 processar 84.000 linhas sozinha.
              </span>
            ) : (
              <span className="text-slate-400">Distribuição balanceada comum sem assimetria.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
