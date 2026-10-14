import React, { useState, useEffect } from 'react';
import {
  Server,
  Zap,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../../utils/soundEffects';

interface ConsumerInstance {
  id: string;
  name: string;
  status: 'active' | 'dead' | 'rebalancing';
  assignedPartitions: number[];
  color: string;
}

export const KafkaRebalanceLab: React.FC = () => {
  const { language } = useLanguage();
  const [protocol, setProtocol] = useState<'cooperative' | 'eager'>('cooperative');
  const [incomingRate, setIncomingRate] = useState<number>(3000); // msgs/sec
  const [consumers, setConsumers] = useState<ConsumerInstance[]>([
    { id: 'c1', name: 'Consumer-A (Pod 1)', status: 'active', assignedPartitions: [0, 1], color: 'border-emerald-500 bg-emerald-950/30 text-emerald-400' },
    { id: 'c2', name: 'Consumer-B (Pod 2)', status: 'active', assignedPartitions: [2, 3], color: 'border-blue-500 bg-blue-950/30 text-blue-400' },
    { id: 'c3', name: 'Consumer-C (Pod 3)', status: 'active', assignedPartitions: [4, 5], color: 'border-purple-500 bg-purple-950/30 text-purple-400' },
  ]);
  const [partitionLags, setPartitionLags] = useState<number[]>([120, 95, 310, 80, 240, 110]);
  const [isRebalancing, setIsRebalancing] = useState<boolean>(false);
  const [rebalanceDowntimeMs, setRebalanceDowntimeMs] = useState<number>(0);
  const [rebalanceLog, setRebalanceLog] = useState<string[]>([]);

  // Simulation timer for lag dynamics
  useEffect(() => {
    const timer = setInterval(() => {
      setPartitionLags((prev) =>
        prev.map((lag, idx) => {
          // Check if partition is currently assigned to an active consumer
          const isConsumed = consumers.some(
            (c) => c.status === 'active' && c.assignedPartitions.includes(idx)
          );
          if (isConsumed) {
            // Processing keeps up or drains
            const drainRate = 500;
            const arrival = Math.floor(incomingRate / 6);
            const net = arrival - drainRate;
            return Math.max(10, lag + (net > 0 ? Math.floor(net / 10) : -30));
          } else {
            // Rapid lag accumulation when unassigned or consumer is dead
            return lag + Math.floor(incomingRate / 6 / 5);
          }
        })
      );
    }, 800);

    return () => clearInterval(timer);
  }, [consumers, incomingRate]);

  // Execute Rebalance Algorithm
  const triggerRebalance = (newConsumers: ConsumerInstance[], reason: string) => {
    setIsRebalancing(true);
    sound.playWarning();

    const timestamp = new Date().toLocaleTimeString();
    const activeSurvivors = newConsumers.filter((c) => c.status === 'active');

    if (protocol === 'eager') {
      // EAGER: Stop-the-world! Revoke all partitions first
      setRebalanceDowntimeMs(1850);
      setRebalanceLog((prev) => [
        `[${timestamp}] ⚠️ [EAGER] ${reason}. Stop-The-World: TODOS os consumidores revogam partições! Downtime total: 1850ms.`,
        ...prev.slice(0, 4),
      ]);

      // Set all to rebalancing
      setConsumers(
        newConsumers.map((c) => ({
          ...c,
          status: c.status === 'dead' ? 'dead' : 'rebalancing',
          assignedPartitions: [],
        }))
      );

      setTimeout(() => {
        // Redistribute all partitions equally
        if (activeSurvivors.length === 0) {
          setConsumers(newConsumers);
          setIsRebalancing(false);
          return;
        }

        const partitions = [0, 1, 2, 3, 4, 5];
        const reassigned: ConsumerInstance[] = newConsumers.map((c) => {
          if (c.status === 'dead') return { ...c, assignedPartitions: [] };
          return { ...c, status: 'active' as const, assignedPartitions: [] };
        });

        partitions.forEach((p, idx) => {
          const survivorIdx = idx % activeSurvivors.length;
          const target = reassigned.find((c) => c.id === activeSurvivors[survivorIdx].id);
          if (target) target.assignedPartitions.push(p);
        });

        setConsumers(reassigned);
        setIsRebalancing(false);
        sound.playSuccess();
      }, 1850);
    } else {
      // COOPERATIVE STICKY: Incremental! Only reassign displaced partitions without revoking stable ones
      setRebalanceDowntimeMs(85);
      setRebalanceLog((prev) => [
        `[${timestamp}] ⚡ [COOPERATIVE STICKY] ${reason}. Migração incremental sem pausar partições saudáveis! Downtime: ~85ms.`,
        ...prev.slice(0, 4),
      ]);

      setTimeout(() => {
        const partitions = [0, 1, 2, 3, 4, 5];
        if (activeSurvivors.length === 0) {
          setConsumers(newConsumers);
          setIsRebalancing(false);
          return;
        }

        const reassigned = newConsumers.map((c) => ({
          ...c,
          assignedPartitions: c.status === 'dead' ? [] : [...c.assignedPartitions],
        }));

        // Find orphan partitions
        const covered = new Set(
          reassigned.filter((c) => c.status === 'active').flatMap((c) => c.assignedPartitions)
        );
        const unassigned = partitions.filter((p) => !covered.has(p));

        // Assign unassigned partitions to the consumer with lowest count
        unassigned.forEach((p) => {
          const activeList = reassigned.filter((c) => c.status === 'active');
          activeList.sort((a, b) => a.assignedPartitions.length - b.assignedPartitions.length);
          activeList[0].assignedPartitions.push(p);
        });

        setConsumers(reassigned);
        setIsRebalancing(false);
        sound.playSuccess();
      }, 350);
    }
  };

  const toggleConsumerHealth = (id: string) => {
    const target = consumers.find((c) => c.id === id);
    if (!target) return;

    if (target.status === 'active') {
      // Kill consumer
      const updated = consumers.map((c) =>
        c.id === id ? { ...c, status: 'dead' as const, assignedPartitions: [] } : c
      );
      triggerRebalance(updated, `${target.name} sofreu colapso (OOM / Pod Eviction)`);
    } else {
      // Revive consumer
      const updated = consumers.map((c) =>
        c.id === id ? { ...c, status: 'active' as const } : c
      );
      triggerRebalance(updated, `${target.name} recuperou e registrou heartbeat no Group Coordinator`);
    }
  };

  const resetCluster = () => {
    setConsumers([
      { id: 'c1', name: 'Consumer-A (Pod 1)', status: 'active', assignedPartitions: [0, 1], color: 'border-emerald-500 bg-emerald-950/30 text-emerald-400' },
      { id: 'c2', name: 'Consumer-B (Pod 2)', status: 'active', assignedPartitions: [2, 3], color: 'border-blue-500 bg-blue-950/30 text-blue-400' },
      { id: 'c3', name: 'Consumer-C (Pod 3)', status: 'active', assignedPartitions: [4, 5], color: 'border-purple-500 bg-purple-950/30 text-purple-400' },
    ]);
    setPartitionLags([120, 95, 310, 80, 240, 110]);
    setIsRebalancing(false);
    setRebalanceDowntimeMs(0);
    sound.playClick();
  };

  const totalLag = partitionLags.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Server className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
              Laboratório Avançado • Kafka Internals
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              6 Partições • 3 Pods
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {language === 'pt'
              ? 'Simulador de Kafka Consumer Group & Partition Rebalancing'
              : 'Kafka Consumer Group & Partition Rebalance Simulator'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'pt'
              ? 'Experimente na prática como o Apache Kafka redistribui partições quando instâncias caem ou são adicionadas, e por que o Cooperative Sticky Rebalance revolucionou a latência em produção.'
              : 'Experience first-hand how Apache Kafka redistributes partitions when consumer instances crash, and why Cooperative Sticky Rebalance changed production pipelines.'}
          </p>
        </div>

        <button
          onClick={resetCluster}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Cluster</span>
        </button>
      </div>

      {/* Control Panel: Protocol & Ingestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-2 font-bold">
            Protocolo de Rebalanceamento:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setProtocol('cooperative');
                sound.playClick();
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                protocol === 'cooperative'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold">Cooperative Sticky</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                  KIP-429
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Incremental. Não pausa consumidores cujas partições não mudaram.
              </p>
            </button>

            <button
              onClick={() => {
                setProtocol('eager');
                sound.playClick();
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                protocol === 'eager'
                  ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold">Eager Rebalance</span>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                  Legado
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Stop-the-world. Revoga 100% das partições antes de redistribuir.
              </p>
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono text-slate-400 font-bold">
              Taxa de Ingestão de Mensagens:
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">
              {incomingRate.toLocaleString()} msgs/seg
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="12000"
            step="500"
            value={incomingRate}
            onChange={(e) => setIncomingRate(Number(e.target.value))}
            className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>500 msgs/s (Normal)</span>
            <span>6.000 msgs/s (Pico)</span>
            <span>12.000 msgs/s (Black Friday)</span>
          </div>
        </div>
      </div>

      {/* Cluster Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Lag Total Acumulado</span>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className={`text-lg font-black font-mono ${totalLag > 1500 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {totalLag.toLocaleString()} msgs
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Pods Ativos</span>
          <div className="flex items-center gap-2 mt-1">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-black font-mono text-white">
              {consumers.filter((c) => c.status === 'active').length} / 3
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Status do Rebalance</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRebalancing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-mono font-bold text-slate-200">
              {isRebalancing ? 'REBALANCING...' : 'STEADY STATE'}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Downtime Incorrido</span>
          <div className="flex items-center gap-2 mt-1">
            <Zap className={`w-4 h-4 ${rebalanceDowntimeMs > 500 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="text-lg font-black font-mono text-white">
              {rebalanceDowntimeMs} ms
            </span>
          </div>
        </div>
      </div>

      {/* Partitions Diagram (Kafka Topic: 'orders-stream') */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            Tópico Kafka: <span className="text-amber-400">orders-stream</span> (6 Partições Físicas)
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
            Hash(order_id) % 6
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((partitionIdx) => {
            const assignedConsumer = consumers.find(
              (c) => c.assignedPartitions.includes(partitionIdx) && c.status === 'active'
            );
            const lag = partitionLags[partitionIdx];
            const isHotLag = lag > 500;

            return (
              <div
                key={partitionIdx}
                className={`p-3 rounded-xl border transition-all ${
                  assignedConsumer
                    ? `${assignedConsumer.color}`
                    : 'border-rose-700/80 bg-rose-950/20 text-rose-400 animate-pulse'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-black">
                    P-{partitionIdx}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      isHotLag
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Lag: {lag}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full transition-all ${
                      isHotLag ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, (lag / 1000) * 100)}%` }}
                  />
                </div>

                <div className="text-[10px] font-mono truncate">
                  {assignedConsumer ? (
                    <span className="font-bold">{assignedConsumer.name.split(' ')[0]}</span>
                  ) : (
                    <span className="text-rose-400 font-bold">⚠️ Sem Consumidor!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consumer Instances Interactive Controls */}
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          Consumer Group: <span className="text-cyan-400">order-processing-group</span> (Pods)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {consumers.map((consumer) => {
            const isAlive = consumer.status === 'active';
            const isRebal = consumer.status === 'rebalancing';

            return (
              <div
                key={consumer.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAlive
                    ? 'bg-slate-900/90 border-slate-700'
                    : isRebal
                    ? 'bg-amber-950/20 border-amber-500/40 animate-pulse'
                    : 'bg-rose-950/20 border-rose-900 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAlive ? 'bg-emerald-400' : isRebal ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-xs font-mono font-bold text-white">
                      {consumer.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isAlive
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : isRebal
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isAlive ? 'HEALTHY' : isRebal ? 'SYNCING' : 'CRASHED'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 mb-3">
                  Partições atribuídas:{' '}
                  {consumer.assignedPartitions.length > 0 ? (
                    <span className="text-white font-bold">
                      {consumer.assignedPartitions.map((p) => `P-${p}`).join(', ')}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">Nenhuma</span>
                  )}
                </div>

                <button
                  onClick={() => toggleConsumerHealth(consumer.id)}
                  disabled={isRebalancing}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isAlive
                      ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isAlive ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Simular Falha (Kill Pod)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Reiniciar Pod (Reviver)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rebalance Log Console */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 mb-2 font-bold text-[11px] uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Event Log do Kafka Group Coordinator:
        </div>
        {rebalanceLog.length === 0 ? (
          <p className="text-slate-600 italic">
            Nenhum rebalanceamento recente. Clique em "Simular Falha" em um dos pods para acionar o protocolo.
          </p>
        ) : (
          <div className="space-y-1">
            {rebalanceLog.map((log, idx) => (
              <div key={idx} className="text-slate-300 leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Architectural Principle Box */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-indigo-300 font-mono uppercase block mb-0.5">
            Regra Arquitetural de Ouro no Kafka:
          </strong>
          {language === 'pt' ? (
            <>
              O número de consumidores ativos em um Consumer Group nunca deve exceder o número de partições (
              <em>Consumers ≤ Partitions</em>). Instâncias excedentes permanecem ociosas em stand-by. Além disso, prefira sempre o protocolo{' '}
              <strong className="text-white">CooperativeStickyAssignor</strong> (padrão a partir do Kafka 3.0), pois ele elimina o famigerado Stop-The-World, evitando explosão de latência e time-outs em cascata no Kubernetes.
            </>
          ) : (
            <>
              The number of active consumers in a consumer group must never exceed the number of partitions. Any extra consumer will sit completely idle. Always favor the{' '}
              <strong className="text-white">CooperativeStickyAssignor</strong> to eliminate costly Stop-The-World downtime.
            </>
          )}
        </div>
      </div>
    </div>
  );
};
