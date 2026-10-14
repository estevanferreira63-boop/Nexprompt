import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  FileCode,
  ShieldCheck,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Info,
  Copy,
  Check,
  Flame,
  Award,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Concept } from '../types/concept';
import { getIllustratedMiniCourse, IllustratedMiniCourse } from '../data/illustratedMiniCourseEngine';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';
import { shuffleQuizOptions, ShuffledQuiz } from '../utils/quizUtils';

interface IllustratedMiniCourseViewProps {
  concept: Concept;
  onCompleteCourse?: () => void;
}

export const IllustratedMiniCourseView: React.FC<IllustratedMiniCourseViewProps> = ({
  concept,
  onCompleteCourse,
}) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const course: IllustratedMiniCourse = React.useMemo(() => {
    return getIllustratedMiniCourse(concept);
  }, [concept]);

  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Checkpoint Quiz State with Shuffled Options
  const [shuffledCheckpoint, setShuffledCheckpoint] = useState<ShuffledQuiz>(() =>
    shuffleQuizOptions({
      question: course.practicalCheckpoint.question,
      options: course.practicalCheckpoint.options,
      correctIndex: course.practicalCheckpoint.correctIndex,
      explanation: course.practicalCheckpoint.explanation,
    })
  );

  React.useEffect(() => {
    setShuffledCheckpoint(
      shuffleQuizOptions({
        question: course.practicalCheckpoint.question,
        options: course.practicalCheckpoint.options,
        correctIndex: course.practicalCheckpoint.correctIndex,
        explanation: course.practicalCheckpoint.explanation,
      })
    );
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCourseCompleted(false);
  }, [concept.id, course.practicalCheckpoint]);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState<boolean>(false);

  const currentModule = course.modules[activeModuleIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === shuffledCheckpoint.correctIndex;
    if (isCorrect) {
      sound.playSuccess();
      addXp(course.xpReward, `Mini-Curso Concluído: ${concept.name}`);
      setIsCourseCompleted(true);
      if (onCompleteCourse) onCompleteCourse();
    } else {
      sound.playError();
    }
  };

  const handleNextModule = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex((prev) => prev + 1);
      setSelectedNodeId(null);
    }
  };

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex((prev) => prev - 1);
      setSelectedNodeId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Course Header Banner - Ultra Compact & Responsive */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-cyan-950/50 border border-blue-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              MASTERCLASS • 5 MÓDULOS
            </span>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {course.sectionName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>~{course.totalDurationMinutes} min</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>+{course.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* 5-Step Progress Stepper */}
        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2 relative z-10">
          {course.modules.map((mod, idx) => {
            const isActive = idx === activeModuleIndex;
            const isPassed = idx < activeModuleIndex;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveModuleIndex(idx);
                  setSelectedNodeId(null);
                }}
                className={`p-1.5 sm:p-2 rounded-xl text-left transition-all border ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                    : isPassed
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold">
                    MÓD. {mod.number}
                  </span>
                  {isPassed && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />}
                </div>
                <p className="text-[10px] font-bold truncate mt-0.5 hidden sm:block">
                  {mod.title.split('&')[0]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Module Content Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 sm:space-y-6">
        
        {/* Module Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Módulo {currentModule.number} de 5 • {currentModule.readTimeMinutes} min de leitura
            </span>
            <h3 className="text-lg font-bold text-white font-mono">
              {currentModule.title}
            </h3>
            <p className="text-xs text-slate-400">
              {currentModule.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevModule}
              disabled={activeModuleIndex === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              onClick={handleNextModule}
              disabled={activeModuleIndex === course.modules.length - 1}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shadow-md shadow-blue-500/20"
            >
              <span>Próximo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lead Summary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm sm:text-base text-slate-100 leading-relaxed font-sans shadow-md">
          {currentModule.content.lead}
        </div>

        {/* ILLUSTRATED VISUAL ARCHITECTURE CANVAS / DIAGRAM */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                {currentModule.content.diagramMeta.title}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Clique em qualquer nó para inspecionar
            </span>
          </div>

          {/* Interactive Illustrated Diagram Area */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currentModule.content.diagramMeta.nodes.map((node, nIdx) => {
                const isSelected = selectedNodeId === node.id;
                const nodeColors = {
                  source: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                  process: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                  storage: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                  output: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
                  alert: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
                }[node.type] || 'border-slate-700 bg-slate-900 text-slate-200';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${nodeColors} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                        : 'hover:border-slate-500 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-slate-400">
                      <span>Passo {nIdx + 1}</span>
                      <span className="capitalize">{node.type}</span>
                    </div>
                    <h5 className="text-xs font-mono font-bold text-white mt-1">
                      {node.label}
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-snug">
                      {node.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Connection Arrows & Labels */}
            <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-slate-400">
              {currentModule.content.diagramMeta.connections.map((conn, cIdx) => (
                <div key={cIdx} className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
                  <span className="text-slate-300">{conn.label || 'Fluxo de Dados'}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </div>
              ))}
            </div>

            {/* Selected Node Detailed Inspector */}
            {selectedNodeId && (() => {
              const selectedNode = currentModule.content.diagramMeta.nodes.find((n) => n.id === selectedNodeId);
              if (!selectedNode) return null;
              return (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Nó Inspecionado: {selectedNode.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 capitalize">
                      Camada: {selectedNode.type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                    {selectedNode.desc}
                  </p>
                </div>
              );
            })()}

            <p className="text-[11px] text-slate-500 italic text-center mt-2 font-mono">
              {currentModule.content.diagramMeta.caption}
            </p>
          </div>
        </div>

        {/* Key Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {currentModule.content.keyPoints.map((kp, kpIdx) => (
            <div key={kpIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {kp.label}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {kp.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Deep Dive Section */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <h4 className="text-xs sm:text-sm font-mono font-bold uppercase text-indigo-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Análise Aprofundada & Detalhes de Implementação
          </h4>
          <p className="text-sm sm:text-[15px] text-slate-100 leading-relaxed font-sans whitespace-pre-line">
            {currentModule.content.deepDiveText}
          </p>
        </div>

        {/* Pro Tip Callout */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs sm:text-sm text-amber-100 leading-relaxed font-sans">
          <strong className="text-amber-400 font-mono font-bold block mb-1">💡 DICA PRÁTICA:</strong>
          {currentModule.content.proTip}
        </div>

        {/* CHECKPOINT QUIZ (IF ON MODULE 5) */}
        {currentModule.number === 5 && (
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 to-indigo-950/30 border border-indigo-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white">
                  Desafio de Validação & Certificação do Mini-Curso
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                +60 XP
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {course.practicalCheckpoint.scenario}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white">
              {course.practicalCheckpoint.question}
            </div>

            <div className="space-y-2">
              {shuffledCheckpoint.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === shuffledCheckpoint.correctIndex;

                let optClass = 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-rose-950/50 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  optClass = 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/20';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-sans transition-all flex items-start gap-3 ${optClass}`}
                  >
                    <span className="font-mono font-bold text-slate-400">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={selectedOption === null}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
              >
                Confirmar Resposta & Finalizar Mini-Curso
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  {selectedOption === shuffledCheckpoint.correctIndex ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Parabéns! Resposta Correta (+60 XP)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Resposta Incorreta. Revise o raciocínio abaixo:
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {shuffledCheckpoint.explanation}
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono">
                  🔑 Lição Principal: {course.practicalCheckpoint.keyTakeaway}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
