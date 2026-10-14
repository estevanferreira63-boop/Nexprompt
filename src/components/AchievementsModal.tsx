import React from 'react';
import { useGamification, USER_LEVELS } from '../context/GamificationContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Trophy,
  Award,
  Zap,
  Target,
  CheckCircle2,
  Lock,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AchievementsModal: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    xp,
    currentLevel,
    nextLevel,
    levelProgressPct,
    achievements,
    dailyMissions,
    unlockedCount,
    isAchievementsOpen,
    setIsAchievementsOpen,
    soundMuted,
    toggleSound,
  } = useGamification();

  if (!isAchievementsOpen) return null;

  const handleCelebrate = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Gradient Bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${currentLevel.badgeColor}`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'pt' ? 'Centro de Carreira & Gamificação' : 'Career Hub & Gamification'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unlockedCount}/{achievements.length} {language === 'pt' ? 'Conquistas' : 'Badges'}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                {language === 'pt'
                  ? 'Evolua de Estagiário até Arquiteto Principal dominando conceitos e sistemas reais.'
                  : 'Progress from Data Intern to Principal Architect by mastering real systems.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundMuted
                  ? 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
              }`}
              title={soundMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos Sonoros'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsAchievementsOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Level Progress Banner */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-amber-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                  {language === 'pt' ? 'PATENTE ATUAL • NÍVEL' : 'CURRENT RANK • LEVEL'} {currentLevel.level}
                </span>
                <h3 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <span>{language === 'pt' ? currentLevel.titlePt : currentLevel.titleEn}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950">
                    {xp.toLocaleString()} XP
                  </span>
                </h3>
              </div>

              {nextLevel ? (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">
                    {language === 'pt' ? 'Próximo Nível:' : 'Next Level:'}
                  </span>
                  <span className="text-sm font-bold text-cyan-400 flex items-center justify-end gap-1">
                    {language === 'pt' ? nextLevel.titlePt : nextLevel.titleEn}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {Math.max(0, nextLevel.minXp - xp)} XP {language === 'pt' ? 'restantes' : 'remaining'}
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                    👑 {language === 'pt' ? 'Nível Máximo Atingido!' : 'Maximum Level Reached!'}
                  </span>
                </div>
              )}
            </div>

            {/* Level Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400">
                <span>{xp.toLocaleString()} XP</span>
                <span className="text-amber-400 font-bold">{levelProgressPct}%</span>
                <span>{nextLevel ? `${nextLevel.minXp.toLocaleString()} XP` : 'MAX'}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800 p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentLevel.badgeColor} transition-all duration-500 shadow-lg`}
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Missions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                {language === 'pt' ? 'Missões Diárias de Aprendizado' : 'Daily Learning Quests'}
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                {language === 'pt' ? 'Resetam à meia-noite' : 'Resets at midnight'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dailyMissions.map((mission) => {
                const title = language === 'pt' ? mission.titlePt : mission.titleEn;
                const isDone = mission.completed;

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/80 border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          +{mission.xpReward} XP
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-xs font-mono text-slate-400">
                            {mission.progress}/{mission.target}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold leading-relaxed ${isDone ? 'text-emerald-200' : 'text-slate-200'}`}>
                        {title}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${isDone ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges & Achievements Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                {language === 'pt' ? 'Mural de Conquistas & Medalhas' : 'Achievements & Badges Showcase'}
              </h4>
              <button
                onClick={handleCelebrate}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'pt' ? 'Celebrar Progresso' : 'Celebrate Progress'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((ach) => {
                const title = language === 'pt' ? ach.titlePt : ach.titleEn;
                const desc = language === 'pt' ? ach.descPt : ach.descEn;
                const isUnlocked = ach.isUnlocked;

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border transition-all flex gap-3.5 ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/60 border-slate-850 opacity-75'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40'
                        : 'bg-slate-900 border border-slate-800 grayscale'
                    }`}>
                      {ach.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold truncate ${isUnlocked ? 'text-amber-300' : 'text-slate-300'}`}>
                          {title}
                        </span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex-shrink-0">✓ OK</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5 flex-shrink-0">
                            <Lock className="w-2.5 h-2.5" /> {ach.progress}/{ach.maxProgress}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {desc}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-amber-400 font-bold">+{ach.xpReward} XP</span>
                        {isUnlocked && ach.unlockedAt && (
                          <span className="text-slate-500">
                            {new Date(ach.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {!isUnlocked && (
                        <div className="mt-1.5 w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                          <div
                            className="h-full bg-amber-500/60"
                            style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Path Stepper */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              {language === 'pt' ? 'Trilha Completa de Evolução Profissional' : 'Full Professional Career Hierarchy'}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {USER_LEVELS.map((lvl) => {
                const isCurrent = lvl.level === currentLevel.level;
                const isPast = lvl.level < currentLevel.level;
                const title = language === 'pt' ? lvl.titlePt : lvl.titleEn;

                return (
                  <div
                    key={lvl.level}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-slate-900 border-amber-500 shadow-md shadow-amber-500/10'
                        : isPast
                        ? 'bg-slate-950 border-emerald-900/60 text-slate-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold block ${
                      isCurrent ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-slate-600'
                    }`}>
                      Nív. {lvl.level}
                    </span>
                    <span className={`text-[11px] font-semibold block leading-tight mt-1 line-clamp-2 ${
                      isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">
                      {lvl.minXp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
