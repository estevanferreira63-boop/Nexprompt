import React, { useState, useMemo } from 'react';
import {
  Brain,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  X,
  Eye,
  EyeOff,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  BookOpen,
} from 'lucide-react';
import { ALL_CONCEPTS, CONCEPTS_BY_ID } from '../data/concepts';
import { Concept, ConceptStatus } from '../types/concept';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

interface SpacedRepetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusMap: Record<number, ConceptStatus>;
  onStatusChange: (conceptId: number, status: ConceptStatus) => void;
  onOpenConceptDetail: (conceptId: number) => void;
}

export const SpacedRepetitionModal: React.FC<SpacedRepetitionModalProps> = ({
  isOpen,
  onClose,
  statusMap,
  onStatusChange,
  onOpenConceptDetail,
}) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Pick learning deck prioritizing concepts that are in progress or not started
  const deck = useMemo(() => {
    const inProgress = ALL_CONCEPTS.filter((c) => statusMap[c.id] === 'in_progress');
    const notStarted = ALL_CONCEPTS.filter((c) => !statusMap[c.id] || statusMap[c.id] === 'not_started');
    const completed = ALL_CONCEPTS.filter((c) => statusMap[c.id] === 'completed');

    // Combine: inProgress first, then sample notStarted, then sample completed for review
    return [...inProgress, ...notStarted.slice(0, 20), ...completed.slice(0, 10)];
  }, [statusMap]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionCardsReviewed, setSessionCardsReviewed] = useState<number>(0);

  if (!isOpen || deck.length === 0) return null;

  const currentConcept = deck[currentIndex] || deck[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleRate = (difficulty: 'easy' | 'medium' | 'hard') => {
    const xpReward = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 12 : 5;
    addXp(xpReward, `Revisão Ativa (${difficulty}): ${currentConcept.name}`);
    sound.playSuccess();
    setSessionCardsReviewed((prev) => prev + 1);

    if (difficulty === 'easy' && statusMap[currentConcept.id] !== 'completed') {
      onStatusChange(currentConcept.id, 'completed');
    } else if (difficulty === 'medium' && (!statusMap[currentConcept.id] || statusMap[currentConcept.id] === 'not_started')) {
      onStatusChange(currentConcept.id, 'in_progress');
    }

    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * deck.length);
    setCurrentIndex(randomIndex);
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  {language === 'pt' ? 'Revisão Ativa & Flashcards' : 'Active Recall Flashcards'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  +{sessionCardsReviewed * 15} XP nesta sessão
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'pt'
                  ? 'Teste sua memória antes de virar o card para consolidar o conhecimento.'
                  : 'Test your memory before flipping the card to reinforce long-term retention.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Embaralhar conceitos"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Canvas */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between gap-5">
          {/* Deck Counter Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Card {currentIndex + 1} de {deck.length}
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>{sessionCardsReviewed} revisados</span>
            </span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => {
              setIsFlipped(!isFlipped);
              sound.playClick();
            }}
            className="cursor-pointer bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[320px] transition-all relative overflow-hidden group shadow-xl"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Front of Card */}
            {!isFlipped ? (
              <div className="flex flex-col justify-between h-full gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                      #{currentConcept.id} • Seção {currentConcept.sectionId}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {currentConcept.difficulty}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
                    {currentConcept.name}
                  </h2>
                  <p className="text-sm text-slate-400 italic mt-2">
                    "{currentConcept.tagline}"
                  </p>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 mt-4">
                  <div className="text-xs font-mono text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Desafio de Memorização Ativa:</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    Você consegue explicar com suas próprias palavras como esse conceito funciona "por debaixo dos panos" e qual o problema que ele resolve?
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors pt-2">
                  <Eye className="w-4 h-4" />
                  <span>Clique para virar o card e conferir a resposta</span>
                </div>
              </div>
            ) : (
              /* Back of Card */
              <div className="flex flex-col justify-between h-full gap-4 animate-fadeIn">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      Resposta & Mecânica
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      #{currentConcept.id} {currentConcept.name}
                    </span>
                  </div>

                  <h4 className="text-xs font-mono text-cyan-400 font-bold mt-2">
                    O que é & Visão Geral:
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    {currentConcept.overview}
                  </p>

                  <h4 className="text-xs font-mono text-amber-400 font-bold mt-3">
                    Under The Hood (Como funciona por dentro):
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    {currentConcept.underTheHood}
                  </p>

                  <h4 className="text-xs font-mono text-emerald-400 font-bold mt-3">
                    Caso Real de Produção:
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans text-[11px]">
                    {currentConcept.realWorldExample}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenConceptDetail(currentConcept.id);
                      onClose();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline font-bold flex items-center gap-1"
                  >
                    <span>Ver Teoria Completa & Código</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-500">Clique no card para desvirar</span>
                </div>
              </div>
            )}
          </div>

          {/* Self-Rating Feedback Buttons (Only when flipped) */}
          {isFlipped ? (
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-mono text-slate-400">
                Como foi sua lembrança deste conceito?
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleRate('hard')}
                  className="py-2.5 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold transition-all"
                >
                  😕 Difícil (+5 XP)
                </button>
                <button
                  onClick={() => handleRate('medium')}
                  className="py-2.5 px-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold transition-all"
                >
                  🤔 Médio (+12 XP)
                </button>
                <button
                  onClick={() => handleRate('easy')}
                  className="py-2.5 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                >
                  ⚡ Fácil (+20 XP)
                </button>
              </div>
            </div>
          ) : (
            /* Navigation Controls */
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={() => {
                  setIsFlipped(true);
                  sound.playClick();
                }}
                className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                Virar Card
              </button>

              <button
                onClick={handleNext}
                className="py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
