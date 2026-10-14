import React, { useState, useRef, useEffect } from 'react';
import { Clock, Play, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw, Calendar, ArrowRight } from 'lucide-react';

interface DagTask {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'retry_wait' | 'success' | 'failed';
  attempts: number;
  maxRetries: number;
}

export const AirflowDagSchedulerLab: React.FC = () => {
  const [injectFailure, setInjectFailure] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentDateRun, setCurrentDateRun] = useState<string>('2026-10-05');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const [tasks, setTasks] = useState<DagTask[]>([
    { id: 't_ingest', name: 'extract_crm_events', status: 'queued', attempts: 0, maxRetries: 3 },
    { id: 't_transform', name: 'dbt_transform_silver', status: 'queued', attempts: 0, maxRetries: 3 },
    { id: 't_load', name: 'load_gold_dw', status: 'queued', attempts: 0, maxRetries: 2 },
  ]);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const resetDag = () => {
    clearAllTimeouts();
    setIsRunning(false);
    setLogMessages([]);
    setTasks([
      { id: 't_ingest', name: 'extract_crm_events', status: 'queued', attempts: 0, maxRetries: 3 },
      { id: 't_transform', name: 'dbt_transform_silver', status: 'queued', attempts: 0, maxRetries: 3 },
      { id: 't_load', name: 'load_gold_dw', status: 'queued', attempts: 0, maxRetries: 2 },
    ]);
  };

  const runDag = (date = '2026-10-05') => {
    clearAllTimeouts();
    setIsRunning(true);
    setCurrentDateRun(date);
    setLogMessages([]);
    addLog(`Scheduler iniciou DAGRun para data lógica ds=${date}`);

    // Step 1: Task A
    setTasks([
      { id: 't_ingest', name: 'extract_crm_events', status: 'running', attempts: 1, maxRetries: 3 },
      { id: 't_transform', name: 'dbt_transform_silver', status: 'queued', attempts: 0, maxRetries: 3 },
      { id: 't_load', name: 'load_gold_dw', status: 'queued', attempts: 0, maxRetries: 2 },
    ]);
    addLog('Task extract_crm_events iniciada no worker...');

    const t1 = setTimeout(() => {
      // Task A Success
      addLog('Task extract_crm_events concluída com sucesso (Exit 0).');
      addLog('Scheduler disparando downstream: dbt_transform_silver');

      setTasks([
        { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
        { id: 't_transform', name: 'dbt_transform_silver', status: 'running', attempts: 1, maxRetries: 3 },
        { id: 't_load', name: 'load_gold_dw', status: 'queued', attempts: 0, maxRetries: 2 },
      ]);

      const t2 = setTimeout(() => {
        if (injectFailure) {
          // Task B fails on first attempt
          addLog('ERRO: Conexão interrompida com banco de staging (HTTP 503). Tentativa 1 falhou.');
          addLog('Scheduler aplicando Exponential Backoff: aguardando 1.5s antes da Tentativa 2...');

          setTasks([
            { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
            { id: 't_transform', name: 'dbt_transform_silver', status: 'retry_wait', attempts: 1, maxRetries: 3 },
            { id: 't_load', name: 'load_gold_dw', status: 'queued', attempts: 0, maxRetries: 2 },
          ]);

          const t3 = setTimeout(() => {
            // Task B retry attempt 2 succeeds!
            addLog('Retentativa 2/3: Conexão reestabelecida. dbt_transform_silver executou 12 modelos.');
            addLog('Task dbt_transform_silver concluída com SUCESSO na retentativa.');
            addLog('Scheduler disparando downstream: load_gold_dw');

            setTasks([
              { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
              { id: 't_transform', name: 'dbt_transform_silver', status: 'success', attempts: 2, maxRetries: 3 },
              { id: 't_load', name: 'load_gold_dw', status: 'running', attempts: 1, maxRetries: 2 },
            ]);

            const t4 = setTimeout(() => {
              // Task C completes
              addLog('Task load_gold_dw concluída. Tabela Gold atualizada.');
              addLog(`DAGRun ${date} finalizada com SUCESSO.`);
              setTasks([
                { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
                { id: 't_transform', name: 'dbt_transform_silver', status: 'success', attempts: 2, maxRetries: 3 },
                { id: 't_load', name: 'load_gold_dw', status: 'success', attempts: 1, maxRetries: 2 },
              ]);
              setIsRunning(false);
            }, 600);
            timeoutsRef.current.push(t4);
          }, 1500);
          timeoutsRef.current.push(t3);
        } else {
          // Task B direct success
          addLog('Task dbt_transform_silver concluída com sucesso.');
          setTasks([
            { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
            { id: 't_transform', name: 'dbt_transform_silver', status: 'success', attempts: 1, maxRetries: 3 },
            { id: 't_load', name: 'load_gold_dw', status: 'running', attempts: 1, maxRetries: 2 },
          ]);

          const t5 = setTimeout(() => {
            addLog('Task load_gold_dw concluída.');
            addLog(`DAGRun ${date} finalizada com SUCESSO.`);
            setTasks([
              { id: 't_ingest', name: 'extract_crm_events', status: 'success', attempts: 1, maxRetries: 3 },
              { id: 't_transform', name: 'dbt_transform_silver', status: 'success', attempts: 1, maxRetries: 3 },
              { id: 't_load', name: 'load_gold_dw', status: 'success', attempts: 1, maxRetries: 2 },
            ]);
            setIsRunning(false);
          }, 600);
          timeoutsRef.current.push(t5);
        }
      }, 700);
      timeoutsRef.current.push(t2);
    }, 600);
    timeoutsRef.current.push(t1);
  };



  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-violet-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" /> Laboratório Visual 10 • Conceitos #51, #53, #54, #55
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de Airflow: Dependências, Retry com Backoff & Backfill</h3>
          <p className="text-slate-400 text-sm mt-1">
            Veja como o Scheduler coordena upstream/downstream, lida com quedas transitórias de rede via Exponential Backoff e executa backfills históricos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runDag()}
            disabled={isRunning}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {isRunning ? 'Executando DAG...' : 'Disparar DAG Run'}
          </button>
          <button
            onClick={resetDag}
            disabled={isRunning}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toggles and Backfill action */}
      <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <input
            type="checkbox"
            checked={injectFailure}
            onChange={(e) => { setInjectFailure(e.target.checked); resetDag(); }}
            disabled={isRunning}
            className="w-4 h-4 rounded text-violet-500 focus:ring-violet-400 accent-violet-500"
          />
          <span className={injectFailure ? 'text-amber-400' : 'text-slate-400'}>
            Injetar Erro Transitório na Task de Transformação (Gera Retry com Backoff)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono">Backfill Rápido:</span>
          <button
            onClick={() => runDag('2026-10-01')}
            disabled={isRunning}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Reprocessar 01/10
          </button>
          <button
            onClick={() => runDag('2026-10-02')}
            disabled={isRunning}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            Reprocessar 02/10
          </button>
        </div>
      </div>

      {/* DAG Tasks Flow Graphic */}
      <div className="mt-6 bg-slate-950 p-6 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold">
            Grafo Topológico de Execução (DAG ID: pipeline_vendas)
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Data de Execução Lógica: <strong className="text-white">{currentDateRun}</strong>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
          {tasks.map((task, idx) => {
            let statusBadge = 'bg-slate-800 text-slate-400 border-slate-700';
            if (task.status === 'running') statusBadge = 'bg-blue-950 text-blue-300 border-blue-500 animate-pulse';
            if (task.status === 'retry_wait') statusBadge = 'bg-amber-950 text-amber-300 border-amber-500 animate-bounce';
            if (task.status === 'success') statusBadge = 'bg-emerald-950 text-emerald-300 border-emerald-500';

            return (
              <React.Fragment key={task.id}>
                <div className={`p-4 rounded-xl border min-w-[200px] text-center transition-all ${statusBadge}`}>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    Task #{idx + 1}
                  </span>
                  <span className="font-mono text-xs font-bold block mb-2">{task.name}</span>
                  <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 inline-block">
                    {task.status === 'queued' && 'Na Fila'}
                    {task.status === 'running' && 'Executando...'}
                    {task.status === 'retry_wait' && `Aguardando Retry (${task.attempts}/${task.maxRetries})`}
                    {task.status === 'success' && `Sucesso (${task.attempts} tentativa)`}
                  </div>
                </div>

                {idx < tasks.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Airflow Task Logs Console */}
      <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
        <span className="text-slate-500 uppercase font-bold block mb-2 text-[10px]">
          Logs do Airflow Scheduler & Worker:
        </span>
        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 max-h-40 overflow-y-auto space-y-1 text-slate-300">
          {logMessages.length > 0 ? (
            logMessages.map((log, i) => (
              <div key={i} className={log.includes('ERRO') ? 'text-amber-400' : log.includes('SUCESSO') ? 'text-emerald-400' : 'text-slate-300'}>
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">Dispare o DAG para visualizar os logs de execução em tempo real.</div>
          )}
        </div>
      </div>
    </div>
  );
};
