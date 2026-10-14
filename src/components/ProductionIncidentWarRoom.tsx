import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  Zap,
  RotateCcw,
  Trophy,
  ArrowRight,
  Terminal,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

interface IncidentPhase {
  id: number;
  titlePt: string;
  titleEn: string;
  problemPt: string;
  problemEn: string;
  options: {
    letter: string;
    actionPt: string;
    actionEn: string;
    isCorrect: boolean;
    consequencePt: string;
    consequenceEn: string;
    command: string;
  }[];
}

const INCIDENT_PHASES: IncidentPhase[] = [
  {
    id: 1,
    titlePt: 'Fase 1: Estancamento de Custos & Colapso de Cluster',
    titleEn: 'Phase 1: Cost Containment & Cluster Crash Triage',
    problemPt:
      'ALERTA SEV-1: O cluster Spark no Kubernetes deu OOM em 16 executores. O autoscaler entrou em loop infinito provisionando nós caros On-Demand ($4.820/hora). O que fazer imediatamente?',
    problemEn:
      'SEV-1 ALERT: Spark cluster crashed with OOM across 16 executors. The autoscaler entered a runaway loop provisioning On-Demand nodes ($4,820/hr). Immediate action?',
    options: [
      {
        letter: 'A',
        actionPt: 'Desativar o autoscaler irrestrito e fixar o teto do cluster em 24 workers com Spot instances.',
        actionEn: 'Disable unbounded autoscaler and cap cluster at 24 workers with Spot instances.',
        isCorrect: true,
        consequencePt: 'Estancou o estouro de budget da nuvem e evitou o banimento da conta AWS da empresa!',
        consequenceEn: 'Stopped cloud budget bleed and stabilized Kubernetes node pool!',
        command: 'kubectl scale deployment spark-cluster --replicas=24 && aws ec2 modify-fleet',
      },
      {
        letter: 'B',
        actionPt: 'Reiniciar o cluster com 128 executores maiores de 256GB de RAM.',
        actionEn: 'Restart cluster with 128 larger executors of 256GB RAM.',
        isCorrect: false,
        consequencePt: 'O budget da empresa estourou em 10 minutos e a cota de instâncias da nuvem foi atingida.',
        consequenceEn: 'Cloud quota exceeded within 10 minutes, failing the entire region.',
        command: 'helm upgrade spark --set memory=256G',
      },
      {
        letter: 'C',
        actionPt: 'Ignorar o cluster e deletar todas as mensagens do tópico do Kafka.',
        actionEn: 'Ignore the cluster and purge all messages from Kafka topic.',
        isCorrect: false,
        consequencePt: 'Desastre! Houve perda irreversível de dados financeiros de milhares de clientes.',
        consequenceEn: 'Catastrophe! Irreversible financial data loss incurred.',
        command: 'kafka-topics --delete --topic orders-stream',
      },
    ],
  },
  {
    id: 2,
    titlePt: 'Fase 2: Alívio do Backpressure no Apache Kafka',
    titleEn: 'Phase 2: Kafka Backpressure Relief',
    problemPt:
      'Com o cluster Spark reiniciando, o Kafka acumula 2.450.000 mensagens presas. Os produtores continuam enviando 18.000 eventos/s. O broker está a 94% de disco.',
    problemEn:
      'Kafka has 2.45M queued messages while producers push 18k events/s. Broker storage is at 94%. How to mitigate?',
    options: [
      {
        letter: 'A',
        actionPt: 'Aplicar rate limiting no API Gateway dos produtores e aumentar temporariamente o max.poll.records dos consumidores.',
        actionEn: 'Apply rate limiting on API Gateway and temporarily raise max.poll.records on consumers.',
        isCorrect: true,
        consequencePt: 'O tráfego de entrada estabilizou e os consumidores conseguiram processar sem estourar heap!',
        consequenceEn: 'Traffic stabilized and consumer batches processed without blowing JVM heap!',
        command: 'kong rate-limit apply 8000/s && export SPARK_KAFKA_MAX_POLL=5000',
      },
      {
        letter: 'B',
        actionPt: 'Diminuir a retenção do Kafka de 7 dias para 10 segundos.',
        actionEn: 'Drop Kafka retention from 7 days to 10 seconds.',
        isCorrect: false,
        consequencePt: 'Milhares de transações válidas foram apagadas antes de serem processadas!',
        consequenceEn: 'Valid pending transactions were dropped prematurely!',
        command: 'kafka-configs --alter --add-config retention.ms=10000',
      },
    ],
  },
  {
    id: 3,
    titlePt: 'Fase 3: Eliminação do Data Skew no Spark',
    titleEn: 'Phase 3: Eliminating Spark Data Skew & OOM',
    problemPt:
      'O job Spark iniciou, mas 199 tarefas terminam em 5 segundos e a tarefa 200 congela em 99% por causa de 800.000 registros com a chave de cliente nula (Data Skew violento).',
    problemEn:
      'Job starts, 199 tasks finish in 5s, but task 200 hangs at 99% due to 800k rows on a null key skew. Resolution?',
    options: [
      {
        letter: 'A',
        actionPt: 'Habilitar spark.sql.adaptive.skewJoin.enabled=true e aplicar Salting na chave de partição.',
        actionEn: 'Enable spark.sql.adaptive.skewJoin.enabled=true and apply Salting on the partition key.',
        isCorrect: true,
        consequencePt: 'O Spark AQE dividiu a partição gigante em 12 sub-tarefas paralelas! Tempo caiu de 3 horas para 40s!',
        consequenceEn: 'AQE split the skewed partition into 12 sub-tasks in parallel! Duration plummeted to 40s!',
        command: 'spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")',
      },
      {
        letter: 'B',
        actionPt: 'Aumentar o timeout do heartbeat do Spark de 120s para 10.000s.',
        actionEn: 'Increase Spark heartbeat timeout from 120s to 10,000s.',
        isCorrect: false,
        consequencePt: 'O job ficou congelado o dia inteiro sem falhar nem terminar.',
        consequenceEn: 'Job stalled for hours without ever completing.',
        command: 'spark.conf.set("spark.network.timeout", "10000s")',
      },
    ],
  },
  {
    id: 4,
    titlePt: 'Fase 4: Destravando Conflito ACID no Delta Lake',
    titleEn: 'Phase 4: Resolving Delta Lake ACID Concurrency Conflict',
    problemPt:
      'Ao gravar no Delta Lake Silver, o job falhou com: ConcurrentAppendException. Múltiplos pipelines paralelos tentaram atualizar a mesma partição ao mesmo tempo.',
    problemEn:
      'Writing to Delta Lake Silver failed with ConcurrentAppendException due to parallel pipelines writing to the same partition.',
    options: [
      {
        letter: 'A',
        actionPt: 'Usar isolamento de snapshot e particionar o MERGE por data com predicados de poda idempotentes.',
        actionEn: 'Use Snapshot Isolation and partition MERGE by date with idempotent partition pruning predicates.',
        isCorrect: true,
        consequencePt: 'Sucesso total! A gravação ACID foi confirmada na versão 105 sem conflito de locks.',
        consequenceEn: 'Full success! ACID commit succeeded on version 105 with zero lock contention.',
        command: 'ALTER TABLE silver_orders SET TBLPROPERTIES (\'delta.isolationLevel\' = \'SnapshotIsolation\');',
      },
      {
        letter: 'B',
        actionPt: 'Remover o arquivo _delta_log/00000000000000000104.json manualmente com rm -rf.',
        actionEn: 'Manually delete _delta_log JSON commit file with rm -rf.',
        isCorrect: false,
        consequencePt: 'Corrompeu o log de transações atômico da tabela inteira do Lakehouse!',
        consequenceEn: 'Corrupted atomic transaction metadata across the entire lake table!',
        command: 'rm -rf _delta_log/*',
      },
    ],
  },
];

export const ProductionIncidentWarRoom: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [hasResolved, setHasResolved] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [incidentLog, setIncidentLog] = useState<string[]>([
    '09:00:00 [SEV-1] Incident Commander mobilizado na War Room.',
    '09:00:01 [ALERT] PagerDuty disparado: spark-executor OOM killer ativado.',
  ]);

  // Countdown timer
  useEffect(() => {
    if (!isTimerActive || isVictory || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          setIsGameOver(true);
          sound.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, isVictory, isGameOver]);

  const currentPhase = INCIDENT_PHASES[currentPhaseIdx];

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIdx !== null || isGameOver || isVictory) return;

    setSelectedOptionIdx(idx);
    const chosen = currentPhase.options[idx];

    if (chosen.isCorrect) {
      sound.playSuccess();
      addXp(35);
      setIncidentLog((prev) => [
        `[CORRECT] ${chosen.command} -> ${chosen.consequencePt}`,
        ...prev,
      ]);

      setTimeout(() => {
        if (currentPhaseIdx + 1 < INCIDENT_PHASES.length) {
          setCurrentPhaseIdx((prev) => prev + 1);
          setSelectedOptionIdx(null);
        } else {
          setIsVictory(true);
          setIsTimerActive(false);
          sound.playLevelUp();
          addXp(150);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
      }, 1600);
    } else {
      sound.playError();
      setTimeLeft((prev) => Math.max(10, prev - 30)); // 30s penalty!
      setIncidentLog((prev) => [
        `[ERRO CRÍTICO -30s] ${chosen.command} -> ${chosen.consequencePt}`,
        ...prev,
      ]);
    }
  };

  const restartIncident = () => {
    setCurrentPhaseIdx(0);
    setTimeLeft(180);
    setIsTimerActive(true);
    setSelectedOptionIdx(null);
    setIsGameOver(false);
    setIsVictory(false);
    setIncidentLog(['Incident Room Reiniciada. Cronômetro de 3 minutos resetado.']);
    sound.playClick();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Red Flare */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* War Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <Flame className="w-4 h-4 fill-rose-500" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              Modo War Room • Simulação de Incidente SEV-1
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              3 Minutos para Evitar o Colapso
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            Batalha de Produção: Cluster Spark OOM & Kafka Backpressure
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Você é o Staff Data Engineer de plantão. Tome decisões arquiteturais cirúrgicas sob pressão antes do cronômetro zerar.
          </p>
        </div>

        {/* Live Crisis Timer */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`p-3 rounded-xl border flex items-center gap-3 font-mono transition-all ${
            timeLeft < 45
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-amber-300'
          }`}>
            <Clock className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Tempo Restante</span>
              <span className="text-xl font-black">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <button
            onClick={restartIncident}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Reiniciar Incidente"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incident Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/60">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Status Spark</span>
          <div className="flex items-center gap-2 mt-1">
            <Cpu className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-mono font-bold text-rose-300">
              {currentPhaseIdx >= 3 ? 'RECOVERED (AQE)' : 'OOM (Exit 137)'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/60">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Kafka Backlog</span>
          <div className="flex items-center gap-2 mt-1">
            <Server className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {currentPhaseIdx >= 2 ? '54.200 (Draining)' : '2.450.000 msgs'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/60">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Delta Lake Lock</span>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              {currentPhaseIdx >= 4 ? 'COMMITTED v105' : 'CONCURRENT_APPEND'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/60">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Progresso da Crise</span>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white">
              Fase {currentPhaseIdx + 1} de {INCIDENT_PHASES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Game State: VICTORY */}
      {isVictory ? (
        <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">
              INCIDENT RESOLVED! MISSÃO CUMPRIDA!
            </h4>
            <p className="text-slate-300 text-sm mt-1 max-w-xl mx-auto">
              Você estabilizou o cluster Spark com AQE, aplicou backpressure no Kafka, resolveu a concorrência no Delta Lake e salvou a empresa de um prejuízo astronômico!
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              +150 XP Concedido
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              Distintivo: Incident Commander
            </span>
          </div>
          <button
            onClick={restartIncident}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            Jogar Novamente
          </button>
        </div>
      ) : isGameOver ? (
        /* Game State: GAME OVER */
        <div className="p-8 rounded-2xl bg-rose-950/60 border border-rose-500 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">
              OUTAGE TOTAL! O TEMPO ACABOU!
            </h4>
            <p className="text-slate-300 text-sm mt-1 max-w-xl mx-auto">
              O cluster permaneceu instável por mais de 3 minutos. O pipeline de dados caiu, gerando violação de SLA contratual e prejuízo de milhões de reais.
            </p>
          </div>
          <button
            onClick={restartIncident}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        /* Active Phase Decision Card */
        <div className="space-y-4">
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                {currentPhase.titlePt}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Decisão {currentPhase.id} de 4
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {currentPhase.problemPt}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentPhase.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;

              return (
                <button
                  key={opt.letter}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOptionIdx !== null}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? opt.isCorrect
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {opt.letter}
                  </span>

                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {opt.actionPt}
                    </p>
                    <div className="text-[11px] font-mono text-cyan-400 truncate">
                      $ {opt.command}
                    </div>

                    {isSelected && (
                      <div
                        className={`text-xs font-mono mt-2 p-2 rounded-lg border ${
                          opt.isCorrect
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {opt.consequencePt}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident Log Terminal */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-bold">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Terminal de Incident Response & PagerDuty:
        </div>
        <div className="max-h-28 overflow-y-auto space-y-1">
          {incidentLog.map((log, idx) => (
            <div
              key={idx}
              className={`text-[11px] leading-relaxed ${
                log.includes('[CORRECT]')
                  ? 'text-emerald-400 font-bold'
                  : log.includes('[ERRO')
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
