import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { sound } from '../../utils/soundEffects';

interface StreamEvent {
  id: string;
  eventTime: number; // e.g. second 12
  ingestTime: number; // e.g. second 15 (arrived 3s late)
  value: number;
  key: string;
  isLate: boolean;
  status: 'pending' | 'in_window' | 'dropped' | 'side_output';
}

interface WindowBucket {
  start: number;
  end: number;
  events: StreamEvent[];
  isMaterialized: boolean;
}

export const StreamingWatermarkLab: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Configuration
  const [windowType, setWindowType] = useState<'tumbling' | 'sliding'>('tumbling');
  const [windowSize, setWindowSize] = useState<number>(10); // 10 seconds
  const [slideSize, setSlideSize] = useState<number>(5); // 5 seconds
  const [allowedLateness, setAllowedLateness] = useState<number>(3); // 3 seconds
  const [watermarkDelay, setWatermarkDelay] = useState<number>(4); // Watermark = MaxEventTime - 4s

  // Live Stream State
  const [currentClock, setCurrentClock] = useState<number>(0);
  const [maxEventTimeSeen, setMaxEventTimeSeen] = useState<number>(0);
  const [watermark, setWatermark] = useState<number>(0);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [windows, setWindows] = useState<WindowBucket[]>([]);
  const [droppedCount, setDroppedCount] = useState<number>(0);
  const [sideOutputCount, setSideOutputCount] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Initialize Windows
  const resetLab = () => {
    setCurrentClock(0);
    setMaxEventTimeSeen(0);
    setWatermark(0);
    setEvents([]);
    setDroppedCount(0);
    setSideOutputCount(0);
    setIsAutoPlaying(false);

    // Initial 4 windows
    const initialWindows: WindowBucket[] = [];
    for (let i = 0; i < 4; i++) {
      const start = i * (windowType === 'tumbling' ? windowSize : slideSize);
      initialWindows.push({
        start,
        end: start + windowSize,
        events: [],
        isMaterialized: false,
      });
    }
    setWindows(initialWindows);
  };

  useEffect(() => {
    resetLab();
  }, [windowType, windowSize, slideSize]);

  // Emit an event (either on-time or out-of-order)
  const emitEvent = (isOutdated: boolean = false) => {
    sound.playClick();
    const nextClock = currentClock + 1;
    setCurrentClock(nextClock);

    // Event Time calculation: out of order arrives with older timestamp
    const lag = isOutdated ? Math.floor(Math.random() * 6) + 4 : Math.floor(Math.random() * 2);
    const eventTime = Math.max(1, nextClock - lag);

    // New max event time
    const newMax = Math.max(maxEventTimeSeen, eventTime);
    setMaxEventTimeSeen(newMax);

    // Watermark = MaxEventTime - watermarkDelay
    const nextWatermark = Math.max(watermark, newMax - watermarkDelay);
    setWatermark(nextWatermark);

    // Check if event is too late for all windows + allowed lateness
    const isTooLateForWatermark = eventTime < nextWatermark;
    const isBeyondAllowedLateness = eventTime + allowedLateness < nextWatermark;

    let status: StreamEvent['status'] = 'in_window';
    if (isBeyondAllowedLateness) {
      status = 'dropped';
      setDroppedCount((p) => p + 1);
      sound.playError();
    } else if (isTooLateForWatermark) {
      status = 'side_output';
      setSideOutputCount((p) => p + 1);
      sound.playNotification();
    } else {
      sound.playSuccess();
    }

    const newEvent: StreamEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventTime,
      ingestTime: nextClock,
      value: Math.floor(Math.random() * 90) + 10,
      key: ['user_A', 'user_B', 'user_C'][Math.floor(Math.random() * 3)],
      isLate: isOutdated || lag > 2,
      status,
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 20));

    // Distribute into matching windows
    setWindows((prevWindows) =>
      prevWindows.map((w) => {
        const belongsToWindow = eventTime >= w.start && eventTime < w.end;
        const shouldMaterialize = nextWatermark >= w.end && !w.isMaterialized;

        return {
          ...w,
          events: belongsToWindow && status !== 'dropped' ? [...w.events, newEvent] : w.events,
          isMaterialized: w.isMaterialized || shouldMaterialize,
        };
      })
    );

    addXp(5);
  };

  // Auto-play interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        const isOut = Math.random() > 0.65;
        emitEvent(isOut);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentClock, maxEventTimeSeen, watermark, watermarkDelay, allowedLateness]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 rounded-2xl border border-indigo-900/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
              <span>Laboratório #13 · Streaming de Eventos em Tempo Real</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Janelas de Tempo (Windowing) & Watermarks com Dados Fora de Ordem
            </h3>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              Descubra na prática por que relógios físicos (Wall Clock) falham em dados distribuídos e
              como o <strong className="text-cyan-300">Watermark</strong> permite ao Apache Flink,
              Spark Streaming e Kafka Streams disparar cálculos agregados mesmo com atrasos de rede.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isAutoPlaying
                  ? 'bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isAutoPlaying ? 'animate-spin' : ''}`} />
              <span>{isAutoPlaying ? 'Pausar Simulação' : 'Auto Ingestão'}</span>
            </button>

            <button
              onClick={resetLab}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Resetar Lab"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel & Config */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Window Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">
            Tipo de Janela
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setWindowType('tumbling')}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                windowType === 'tumbling'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tumbling
            </button>
            <button
              onClick={() => setWindowType('sliding')}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                windowType === 'sliding'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sliding
            </button>
          </div>
        </div>

        {/* Watermark Delay */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400 font-bold">Atraso Tolerado (Watermark):</span>
            <span className="text-cyan-400 font-black">{watermarkDelay}s</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={watermarkDelay}
            onChange={(e) => setWatermarkDelay(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Watermark = MaxEventTime - {watermarkDelay}s</p>
        </div>

        {/* Allowed Lateness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400 font-bold">Allowed Lateness:</span>
            <span className="text-amber-400 font-black">{allowedLateness}s</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            value={allowedLateness}
            onChange={(e) => setAllowedLateness(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">Janelas aceitam retificação por mais {allowedLateness}s</p>
        </div>

        {/* Manual Emission Buttons */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => emitEvent(false)}
              className="py-2 px-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Evento No Prazo</span>
            </button>
            <button
              onClick={() => emitEvent(true)}
              className="py-2 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Fora de Ordem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Watermark Progress Timeline */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Relógio Ingestão: <strong className="text-white text-sm">{currentClock}s</strong>
            </span>
            <span className="text-slate-400">
              Max Event-Time: <strong className="text-indigo-300 text-sm">{maxEventTimeSeen}s</strong>
            </span>
            <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Watermark Atual: <strong className="text-sm font-black">{watermark}s</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-400">
              ✓ Processados: <strong>{events.filter((e) => e.status === 'in_window').length}</strong>
            </span>
            <span className="text-amber-400">
              ⚡ Side-Output (Atrasados): <strong>{sideOutputCount}</strong>
            </span>
            <span className="text-rose-400">
              ✗ Descartados: <strong>{droppedCount}</strong>
            </span>
          </div>
        </div>

        {/* Windows Buckets Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {windows.map((w, idx) => {
            const isFired = watermark >= w.end;
            const sumValues = w.events.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isFired
                    ? 'bg-slate-950/80 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-white">
                      Janela [{w.start}s - {w.end}s]
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isFired
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {isFired ? 'Materializada (Fired)' : 'Acumulando...'}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Eventos no Bucket:</span>
                      <strong className="text-white">{w.events.length}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Soma Agregada (SUM):</span>
                      <strong className="text-cyan-300">{sumValues}</strong>
                    </div>
                  </div>

                  {/* Micro list of events inside */}
                  <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {w.events.length === 0 ? (
                      <span className="text-[10px] text-slate-600 font-mono italic">
                        Nenhum evento registrado nesta janela
                      </span>
                    ) : (
                      w.events.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono"
                        >
                          <span className={e.isLate ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            t={e.eventTime}s ({e.key})
                          </span>
                          <span className="text-cyan-400">val: {e.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                  {isFired
                    ? 'Disparada quando Watermark ultrapassou ' + w.end + 's'
                    : 'Aguardando Watermark atingir ' + w.end + 's'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stream Events Log Feed */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fila de Chegada de Eventos (Event Ingestion Log)</span>
        </h4>

        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
          {events.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono py-4 text-center">
              Clique em "Evento No Prazo" ou "Fora de Ordem" para iniciar o fluxo.
            </p>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  e.status === 'dropped'
                    ? 'bg-rose-950/30 border-rose-800 text-rose-300'
                    : e.status === 'side_output'
                    ? 'bg-amber-950/30 border-amber-800 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{e.key}</span>
                  <span className="text-[11px] text-slate-400">
                    Event-Time: <strong>{e.eventTime}s</strong> | Ingestão: {e.ingestTime}s
                  </span>
                  {e.isLate && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                      Atrasado ({e.ingestTime - e.eventTime}s)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold">Payload: {e.value}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      e.status === 'dropped'
                        ? 'bg-rose-900 text-rose-100'
                        : e.status === 'side_output'
                        ? 'bg-amber-900 text-amber-100'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {e.status === 'dropped'
                      ? 'Descartado (> Allowed Lateness)'
                      : e.status === 'side_output'
                      ? 'Side-Output DLQ'
                      : 'Alocado na Janela'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
