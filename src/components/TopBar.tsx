import React from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Brain,
  Zap,
  Bot,
  Flame,
  Trophy,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { MainNavTab } from './Header';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { BookOpen } from 'lucide-react';

interface TopBarProps {
  activeTab: MainNavTab;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenFlashcards: () => void;
  onOpenDictionary?: () => void;
  onStudyNextRecommended: () => void;
  onOpenChat: () => void;
  completedCount: number;
  streak: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenFlashcards,
  onOpenDictionary,
  onStudyNextRecommended,
  onOpenChat,
  completedCount,
  streak,
}) => {
  const { language } = useLanguage();
  const { xp, currentLevel, setIsAchievementsOpen } = useGamification();

  const tabTitles: Record<MainNavTab, { pt: string; en: string; subtitlePt: string; subtitleEn: string }> = {
    prompts: {
      pt: 'Estúdio & Gerador de Prompts para IA (Pro)',
      en: 'AI Prompt Studio & Generator (Pro)',
      subtitlePt: 'Construa, refine com IA e teste prompts profissionais com frameworks industriais (CO-STAR, RTF, Few-Shot)',
      subtitleEn: 'Build, refine with AI, and live-test professional prompts with industrial frameworks (CO-STAR, RTF, Few-Shot)',
    },
    coding: {
      pt: 'Code Arena • Programação Prática & Algoritmos',
      en: 'Code Arena • Hands-on Programming & Algorithms',
      subtitlePt: 'Desafios de código interativos em PySpark, SQL, Algoritmos de Armazenamento e Agentes de IA',
      subtitleEn: 'Interactive code challenges in PySpark, SQL, Storage Algorithms, and AI Agents',
    },
    matrix: {
      pt: 'Plataforma de Estudos • 100 Conceitos Fundamentais',
      en: 'Learning Platform • 100 Core Concepts',
      subtitlePt: 'Mini-cursos ilustrados, arquitetura de sistemas e fundamentos de IA & Dados',
      subtitleEn: 'Illustrated mini-courses, systems architecture, and core AI & Data fundamentals',
    },
    graph: {
      pt: 'Grafo de Conhecimento Interativo (D3.js)',
      en: 'Interactive Knowledge Graph (D3.js)',
      subtitlePt: 'Mapa mental interconectado com trilhas de dependência e pré-requisitos',
      subtitleEn: 'Interconnected network map showing dependencies and prerequisites',
    },
    labs: {
      pt: 'Laboratórios Visuais & Didáticos (12 Simuladores)',
      en: 'Visual & Interactive Labs (12 Simulators)',
      subtitlePt: 'Aprenda como os sistemas funcionam "por debaixo dos panos"',
      subtitleEn: 'Learn how systems work under the hood with real-time simulations',
    },
    architecture: {
      pt: 'Matriz de Arquitetura & Calculadora de Trade-offs',
      en: 'Data Architecture Matrix & Trade-off Calculator',
      subtitlePt: 'Compare Streaming vs Batch, Lakehouse vs Warehouse e dimensione seu stack',
      subtitleEn: 'Compare Streaming vs Batch, Lakehouse vs Warehouse, and size your data stack',
    },
    schedule: {
      pt: 'Cronogramas Estruturados de Estudo',
      en: 'Structured Study Schedules',
      subtitlePt: 'Trilhas diárias com objetivos conceituais e tarefas práticas',
      subtitleEn: 'Daily learning tracks with conceptual goals and practical tasks',
    },
    quizzes: {
      pt: 'Quizzes de Fixação & Desafios de System Design',
      en: 'Retention Quizzes & System Design Challenges',
      subtitlePt: 'Teste sua retenção em tempo real e acumule XP',
      subtitleEn: 'Test your knowledge in real time and level up your career rank',
    },
    chat: {
      pt: 'Mentor IA • Tirar Dúvidas de Engenharia de Dados',
      en: 'AI Mentor • Data Engineering Q&A',
      subtitlePt: 'Tire dúvidas pontuais sobre Spark, Lakehouse, RAG e arquitetura',
      subtitleEn: 'Ask targeted questions about Spark, Lakehouse, RAG, and architecture',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.matrix;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Tab Breadcrumb / Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 lg:hidden flex-shrink-0"
            title="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo on small screens */}
          <div className="lg:hidden flex-shrink-0">
            <AppLogo size="sm" showText={false} />
          </div>

          {/* Breadcrumb Title */}
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate font-sans">
              {language === 'pt' ? currentTabInfo.pt : currentTabInfo.en}
            </h1>
            <p className="text-[11px] text-slate-400 font-mono truncate hidden sm:block">
              {language === 'pt' ? currentTabInfo.subtitlePt : currentTabInfo.subtitleEn}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Learning Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">{language === 'pt' ? 'Busca Rápida' : 'Quick Search'}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-500">
              ⌘K
            </span>
          </button>

          {/* Next Concept Recommendation Button */}
          <button
            onClick={onStudyNextRecommended}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition-all"
            title="Avançar para o próximo conceito recomendado da sua trilha"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'pt' ? 'Próximo' : 'Next'}</span>
          </button>

          {/* Technical Dictionary Button */}
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all"
              title="Abrir Dicionário Técnico Descomplicado (Alt+D)"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">{language === 'pt' ? 'Dicionário' : 'Dictionary'}</span>
            </button>
          )}

          {/* Flashcards / Spaced Repetition Button */}
          <button
            onClick={onOpenFlashcards}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold transition-all"
            title="Abrir sessão rápida de Flashcards e memorização ativa"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{language === 'pt' ? 'Revisão' : 'Flashcards'}</span>
          </button>

          {/* Level Pill (Click opens achievements) */}
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-mono text-slate-300 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-400">{xp} XP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
