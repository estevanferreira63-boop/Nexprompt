import React, { useState, useEffect } from 'react';
import { ALL_CONCEPTS, SECTIONS } from '../data/concepts';
import { SectionId, ConceptStatus } from '../types/concept';
import { SystemDesignChallenges } from './SystemDesignChallenges';
import { ProductionIncidentWarRoom } from './ProductionIncidentWarRoom';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { shuffleQuizOptions, ShuffledQuiz } from '../utils/quizUtils';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface QuizHubViewProps {
  statusMap: Record<number, ConceptStatus>;
  onStatusChange: (conceptId: number, status: ConceptStatus) => void;
  onSelectConcept: (conceptId: number) => void;
}

export const QuizHubView: React.FC<QuizHubViewProps> = ({
  onStatusChange,
  onSelectConcept,
}) => {
  const { language, t } = useLanguage();
  const { recordQuizCorrect } = useGamification();
  const [activeSubTab, setActiveSubTab] = useState<'flash' | 'system_design' | 'war_room'>('flash');
  const [selectedSection, setSelectedSection] = useState<SectionId | 'all'>('all');

  // Filter concepts that actually have quizzes
  const quizConcepts = ALL_CONCEPTS.filter((c) => c.quiz && (selectedSection === 'all' || c.sectionId === selectedSection));

  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);

  const currentConcept = quizConcepts[currentQuizIdx] || quizConcepts[0];
  const [quiz, setQuiz] = useState<ShuffledQuiz | null>(null);

  useEffect(() => {
    if (currentConcept?.quiz) {
      setQuiz(shuffleQuizOptions(currentConcept.quiz));
    } else {
      setQuiz(null);
    }
  }, [currentConcept?.id, currentQuizIdx]);

  const handleSelectOption = (idx: number) => {
    if (hasAnswered || !quiz) return;
    setSelectedAnswer(idx);
    setHasAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    if (idx === quiz.correctIndex) {
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
      recordQuizCorrect();
      if (currentConcept?.id) {
        onStatusChange(currentConcept.id, 'completed');
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuizIdx < quizConcepts.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      setCurrentQuizIdx(0);
    }
    setSelectedAnswer(null);
    setHasAnswered(false);
  };

  const resetQuizSession = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setScore(0);
    setTotalAnswered(0);
  };

  return (
    <div className="space-y-6">
      {/* Switch between Flash Quizzes and System Design */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start inline-flex">
        <button
          onClick={() => setActiveSubTab('flash')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'flash'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> {t('quizHubFlashTab')}
        </button>
        <button
          onClick={() => setActiveSubTab('system_design')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'system_design'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" /> {t('quizHubDesignTab')}
        </button>
        <button
          onClick={() => setActiveSubTab('war_room')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'war_room'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-400" />
          <span>{language === 'pt' ? 'War Room (Incidente)' : 'War Room (Outage)'}</span>
        </button>
      </div>

      {activeSubTab === 'war_room' ? (
        <ProductionIncidentWarRoom />
      ) : activeSubTab === 'system_design' ? (
        <SystemDesignChallenges />
      ) : (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" /> {t('quizHubBannerTag')}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {t('quizHubBannerTitle')}
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                {t('quizHubBannerDesc')}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="text-center font-mono">
                <span className="text-[10px] text-slate-500 uppercase block">{t('quizScoreCorrect')}</span>
                <span className="text-xl font-bold text-emerald-400">{score}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center font-mono">
                <span className="text-[10px] text-slate-500 uppercase block">{t('quizScoreTotal')}</span>
                <span className="text-xl font-bold text-white">{totalAnswered}</span>
              </div>
              <button
                onClick={resetQuizSession}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
            <span className="text-slate-500 flex-shrink-0">Filtrar:</span>
            <button
              onClick={() => { setSelectedSection('all'); resetQuizSession(); }}
              className={`px-3 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
                selectedSection === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {language === 'pt' ? 'Todas as Seções' : 'All Sections'} ({ALL_CONCEPTS.filter((c) => c.quiz).length})
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => { setSelectedSection(sec.id); resetQuizSession(); }}
                className={`px-3 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
                  selectedSection === sec.id
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {language === 'pt' ? `Seção ${sec.id}` : `Section ${sec.id}`}
              </button>
            ))}
          </div>

          {/* Quiz Card */}
          {quiz && (
            <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              {/* Question metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                    #{currentConcept.id}: {currentConcept.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {t('quizQuestionOf')} {currentQuizIdx + 1} {t('of')} {quizConcepts.length}
                  </span>
                </div>

                <button
                  onClick={() => onSelectConcept(currentConcept.id)}
                  className="text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 self-start sm:self-auto"
                >
                  {t('quizViewTheory')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* The Question */}
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {quiz.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {quiz.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === quiz.correctIndex;

                  let style = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-medium';
                    } else if (isSelected) {
                      style = 'bg-red-950/50 border-red-500 text-red-200';
                    } else {
                      style = 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasAnswered}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 ${style}`}
                    >
                      <span className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon answer */}
              {hasAnswered && (
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 animate-fadeIn space-y-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    {selectedAnswer === quiz.correctIndex ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> {t('modalQuizCorrect')}
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> {t('modalQuizIncorrect')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {quiz.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/10"
                    >
                      {t('quizNextQuestion')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
