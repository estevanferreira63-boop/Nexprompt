import React, { useState } from 'react';
import {
  Layers,
  Database,
  Calendar,
  HelpCircle,
  Flame,
  CheckCircle2,
  ChevronDown,
  Bot,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Network,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';

export type MainNavTab = 'matrix' | 'graph' | 'labs' | 'coding' | 'prompts' | 'architecture' | 'schedule' | 'quizzes' | 'chat';

interface HeaderProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  completedCount: number;
  streak: number;
  onOpenPrompts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  completedCount,
  streak,
  onOpenPrompts,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const {
    xp,
    currentLevel,
    levelProgressPct,
    unlockedCount,
    achievements,
    setIsAchievementsOpen,
    soundMuted,
    toggleSound,
  } = useGamification();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const progressPct = ((completedCount / 100) * 100).toFixed(0);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('matrix')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <span className="font-mono text-sm tracking-tighter">100</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-sans">
                  {t('appTitle')}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {t('appBadge')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
                {t('appSubtitle')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-mono font-bold">
            <button
              onClick={() => onTabChange('prompts')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'prompts'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {t('navPromptEngineering')}
            </button>

            <button
              onClick={() => onTabChange('matrix')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" /> {t('navMatrix')}
            </button>

            <button
              onClick={() => onTabChange('graph')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'graph'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-cyan-400" /> {t('navGraph')}
            </button>

            <button
              onClick={() => onTabChange('labs')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'labs'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> {t('navLabs')}
            </button>

            <button
              onClick={() => onTabChange('architecture')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> {t('navArchitecture')}
            </button>

            <button
              onClick={() => onTabChange('schedule')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> {t('navSchedule')}
            </button>

            <button
              onClick={() => onTabChange('quizzes')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'quizzes'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> {t('navQuizzes')}
            </button>

            <button
              onClick={() => onTabChange('chat')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'pt' ? 'Chat IA Mentor' : 'AI Mentor'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
          </nav>

          {/* Right Controls: Gamification, Prompts, Language, Sound */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Gamification Level & XP pill */}
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all text-left shadow-sm"
              title={language === 'pt' ? 'Clique para abrir Conquistas & Carreira' : 'Click to open Career & Achievements'}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                {currentLevel.level}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1 text-[10px] font-mono leading-none">
                  <span className="text-amber-400 font-bold">{xp.toLocaleString()} XP</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 truncate max-w-[110px]">
                    {language === 'pt' ? currentLevel.titlePt : currentLevel.titleEn}
                  </span>
                </div>
                <div className="w-24 bg-slate-950 rounded-full h-1 mt-1 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${levelProgressPct}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Achievements Trophy Badge */}
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/40 text-amber-300 font-mono text-xs font-bold transition-colors"
              title={language === 'pt' ? 'Conquistas Desbloqueadas' : 'Unlocked Badges'}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{unlockedCount}/{achievements.length}</span>
            </button>

            {/* UI Prompts Guide button */}
            <button
              onClick={onOpenPrompts}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-fuchsia-950/30 hover:bg-fuchsia-950/50 border border-fuchsia-900/40 text-fuchsia-300 font-mono text-xs font-bold transition-colors"
              title={language === 'pt' ? 'Prompts para Melhorar o App' : 'Prompts to Improve App'}
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Prompts</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-xl border transition-colors ${
                soundMuted
                  ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-850'
              }`}
              title={soundMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos Sonoros'}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-400 font-mono text-xs font-bold"
              title={t('streakTooltip')}
            >
              <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
              <span>{streak}d</span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold transition-colors"
                title={t('selectLanguage')}
              >
                <span>{language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn text-xs font-mono"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setLanguage('pt');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      language === 'pt' ? 'text-cyan-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>🇧🇷 Português (Brasil)</span>
                    {language === 'pt' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      language === 'en' ? 'text-cyan-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>🇺🇸 English (US)</span>
                    {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex lg:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-[11px] font-mono font-bold">
          <button
            onClick={() => onTabChange('matrix')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'matrix' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{language === 'pt' ? 'Pôster' : 'Poster'}</span>
          </button>

          <button
            onClick={() => onTabChange('graph')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'graph' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{language === 'pt' ? 'Grafo' : 'Graph'}</span>
          </button>

          <button
            onClick={() => onTabChange('labs')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'labs' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Labs (10)</span>
          </button>

          <button
            onClick={() => onTabChange('prompts')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'prompts' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Prompts</span>
          </button>

          <button
            onClick={() => onTabChange('schedule')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'schedule' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'pt' ? 'Trilhas' : 'Tracks'}</span>
          </button>

          <button
            onClick={() => onTabChange('quizzes')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'quizzes' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'chat' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Mentor IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};

