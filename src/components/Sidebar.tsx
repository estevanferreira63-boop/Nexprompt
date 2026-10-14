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
  Brain,
  Search,
  Zap,
  BookOpen,
  ArrowRight,
  X,
  Globe,
  Award,
  Cpu,
  Terminal,
  Code2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { AppLogo } from './AppLogo';
import { MainNavTab } from './Header';

interface SidebarProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  completedCount: number;
  streak: number;
  onOpenTerminal?: () => void;
  onOpenDictionary?: () => void;
  onOpenFlashcards: () => void;
  onOpenSearch: () => void;
  onStudyNextRecommended: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDailyQuests?: () => void;
  onOpenCertificate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  completedCount,
  streak,
  onOpenTerminal,
  onOpenDictionary,
  onOpenFlashcards,
  onOpenSearch,
  onStudyNextRecommended,
  isMobileOpen,
  onCloseMobile,
  onOpenDailyQuests,
  onOpenCertificate,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const {
    xp,
    currentLevel,
    levelProgressPct,
    unlockedCount,
    setIsAchievementsOpen,
    soundMuted,
    toggleSound,
  } = useGamification();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const progressPct = ((completedCount / 100) * 100).toFixed(0);

  const handleNavClick = (tab: MainNavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'prompts' as MainNavTab,
      label: language === 'pt' ? 'Gerador de Prompts IA' : 'AI Prompt Studio Pro',
      icon: Sparkles,
      badge: '★ Pro',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'coding' as MainNavTab,
      label: language === 'pt' ? 'Code Arena (Programação)' : 'Code Arena (Coding)',
      icon: Code2,
      badge: '🎮 Quests',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'matrix' as MainNavTab,
      label: language === 'pt' ? 'Hub de Estudos (100)' : 'Study Hub (100)',
      icon: Database,
      badge: '100',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'graph' as MainNavTab,
      label: language === 'pt' ? 'Grafo de Rede (D3)' : 'Knowledge Graph (D3)',
      icon: Network,
      badge: 'D3',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'labs' as MainNavTab,
      label: language === 'pt' ? 'Laboratórios Visuais' : 'Visual Labs',
      icon: Layers,
      badge: '12',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'architecture' as MainNavTab,
      label: language === 'pt' ? 'Arquitetura & Trade-offs' : 'Architecture & Trade-offs',
      icon: Cpu,
      badge: 'Calc',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'schedule' as MainNavTab,
      label: language === 'pt' ? 'Cronograma de Estudo' : 'Study Schedule',
      icon: Calendar,
      badge: '3 Trilhas',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'quizzes' as MainNavTab,
      label: language === 'pt' ? 'Quizzes & Desafios' : 'Quizzes & Challenges',
      icon: HelpCircle,
      badge: 'XP',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    {
      id: 'chat' as MainNavTab,
      label: language === 'pt' ? 'Mentor IA (Tirar Dúvidas)' : 'AI Study Mentor',
      icon: Bot,
      badge: 'Live',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Bar */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('matrix')}
              className="text-left group flex items-center gap-3"
            >
              <AppLogo size="md" showText={true} />
            </button>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Progression / Gamification Card */}
          <div className="p-3.5 mx-3 mt-3 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800/90 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs flex-shrink-0">
                  {currentLevel.level}
                </span>
                <span className="text-xs font-bold text-white truncate font-sans">
                  {language === 'pt' ? currentLevel.titlePt : currentLevel.titleEn}
                </span>
              </div>
              <button
                onClick={() => setIsAchievementsOpen(true)}
                className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex-shrink-0"
                title="Ver Medalhas e Conquistas"
              >
                <Trophy className="w-4 h-4" />
              </button>
            </div>

            {/* XP Meter Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>{xp} XP</span>
              <span className="text-cyan-400 font-bold">{levelProgressPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
              <div
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>

            {/* Streak & Mastery Stats */}
            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold">{streak} {language === 'pt' ? 'dias' : 'days'}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-bold">{completedCount}/100</span>
              </div>
            </div>
          </div>

          {/* Quick Search Shortcut Bar */}
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                onOpenSearch();
                onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white flex items-center justify-between transition-colors font-mono"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'pt' ? 'Buscar conceito...' : 'Search concept...'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                ⌘K
              </span>
            </button>
          </div>

          {/* Main Navigation Menu */}
          <div className="px-3 py-3">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
              {language === 'pt' ? 'Navegação Principal' : 'Main Navigation'}
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border flex-shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Learning Accelerators & Tools */}
          <div className="px-3 py-2 border-t border-slate-800/80">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 mb-1.5">
              {language === 'pt' ? 'Aceleradores de Estudo' : 'Learning Boosters'}
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              {/* Study Next Recommended */}
              <button
                onClick={() => {
                  onStudyNextRecommended();
                  onCloseMobile();
                }}
                className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:animate-bounce" />
                  <span>{language === 'pt' ? 'Próximo Conceito' : 'Next Concept'}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Spaced Repetition / Flashcards */}
              <button
                onClick={() => {
                  onOpenFlashcards();
                  onCloseMobile();
                }}
                className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{language === 'pt' ? 'Revisão Ativa (Flashcards)' : 'Active Recall (Flashcards)'}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  Revisar
                </span>
              </button>

              {/* Daily Quests Modal Trigger */}
              {onOpenDailyQuests && (
                <button
                  onClick={() => {
                    onOpenDailyQuests();
                    onCloseMobile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{language === 'pt' ? 'Missões Diárias (XP)' : 'Daily Quests (XP)'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Bônus
                  </span>
                </button>
              )}

              {/* Official Certificate Trigger */}
              {onOpenCertificate && (
                <button
                  onClick={() => {
                    onOpenCertificate();
                    onCloseMobile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'pt' ? 'Certificado Oficial' : 'Official Certificate'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    PDF
                  </span>
                </button>
              )}

              {/* Technical Dictionary Trigger */}
              {onOpenDictionary && (
                <button
                  onClick={() => {
                    onOpenDictionary();
                    onCloseMobile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'pt' ? 'Dicionário de Termos' : 'Technical Dictionary'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    A-Z
                  </span>
                </button>
              )}

              {/* Data Eng CLI Terminal Trigger */}
              {onOpenTerminal && (
                <button
                  onClick={() => {
                    onOpenTerminal();
                    onCloseMobile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-900 transition-colors flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'pt' ? 'Terminal CLI (Bash/K8s)' : 'CLI Terminal (Bash/K8s)'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    CLI
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center justify-between gap-2">
            {/* Language Switcher */}
            <div className="relative flex-1">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'pt' ? 'Português' : 'English'}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-30 font-mono text-xs">
                  <button
                    onClick={() => {
                      setLanguage('pt');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between ${
                      language === 'pt' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>🇧🇷 PT-BR</span>
                    {language === 'pt' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between ${
                      language === 'en' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>🇺🇸 EN-US</span>
                    {language === 'en' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundMuted
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}
              title={soundMuted ? 'Ativar efeitos sonoros' : 'Silenciar sons'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
