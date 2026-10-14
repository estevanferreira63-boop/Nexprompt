import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  Trophy,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Gift,
  Check,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedConceptsToday?: number;
}

interface Quest {
  id: string;
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
  xpReward: number;
  current: number;
  target: number;
  claimed: boolean;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  completedConceptsToday = 1,
}) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const todayKey = new Date().toISOString().slice(0, 10);

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(`de_ai_daily_quests_${todayKey}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    return [
      {
        id: 'q1',
        titlePt: 'Dominar Novos Fundamentos',
        titleEn: 'Master New Foundations',
        descPt: 'Estude e conclua pelo menos 2 conceitos hoje',
        descEn: 'Study and mark at least 2 concepts as completed today',
        xpReward: 50,
        current: Math.min(completedConceptsToday, 2),
        target: 2,
        claimed: false,
      },
      {
        id: 'q2',
        titlePt: 'Desafio de System Design',
        titleEn: 'System Design Challenge',
        descPt: 'Resolva 1 quiz técnico ou desafio arquitetural',
        descEn: 'Pass 1 technical quiz or system design scenario',
        xpReward: 75,
        current: 1,
        target: 1,
        claimed: false,
      },
      {
        id: 'q3',
        titlePt: 'Revisão Ativa com Flashcards',
        titleEn: 'Active Recall Session',
        descPt: 'Pratique 5 cards com repetição espaçada',
        descEn: 'Review 5 spaced repetition flashcards',
        xpReward: 40,
        current: 3,
        target: 5,
        claimed: false,
      },
      {
        id: 'q4',
        titlePt: 'Arquitetura & Engenharia de Prompts',
        titleEn: 'Architecture & Prompts Lab',
        descPt: 'Experimente 1 prompt técnico ou dimensione um stack',
        descEn: 'Test 1 professional prompt or size an architecture stack',
        xpReward: 35,
        current: 1,
        target: 1,
        claimed: false,
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(`de_ai_daily_quests_${todayKey}`, JSON.stringify(quests));
    } catch (e) {
      console.error(e);
    }
  }, [quests, todayKey]);

  if (!isOpen) return null;

  const handleClaim = (questId: string, xpReward: number) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q))
    );
    addXp(xpReward);
    sound.playLevelUp();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const allCompleted = quests.every((q) => q.current >= q.target);
  const totalDailyXp = quests.reduce((acc, q) => acc + q.xpReward, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Flame Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Flame className="w-5 h-5 fill-amber-400" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                {language === 'pt' ? 'Missões Diárias & Bônus de Streak' : 'Daily Quests & Streak Bonus'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {language === 'pt' ? 'Complete metas diárias e ganhe até' : 'Complete daily goals and earn up to'}{' '}
                <span className="text-amber-400 font-bold">+{totalDailyXp} XP</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {quests.map((quest) => {
            const isReady = quest.current >= quest.target;
            const progressPct = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  quest.claimed
                    ? 'bg-slate-950/50 border-slate-800/60 opacity-75'
                    : isReady
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white font-sans">
                      {language === 'pt' ? quest.titlePt : quest.titleEn}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">
                    {language === 'pt' ? quest.descPt : quest.descEn}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-400 h-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {quest.current}/{quest.target}
                    </span>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="self-end sm:self-center flex-shrink-0">
                  {quest.claimed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" />
                      {language === 'pt' ? 'Resgatado' : 'Claimed'}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(quest.id, quest.xpReward)}
                      disabled={!isReady}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isReady
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20 animate-pulse'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{language === 'pt' ? 'Resgatar' : 'Claim'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{language === 'pt' ? 'Reinicia à meia-noite' : 'Resets daily at midnight'}</span>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:underline"
          >
            {language === 'pt' ? 'Fechar' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
