import React, { useState, useMemo } from 'react';
import { Concept, ConceptStatus, SectionId } from '../types/concept';
import { ALL_CONCEPTS, SECTIONS } from '../data/concepts';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  CheckCircle,
  Bookmark,
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ConceptMatrixProps {
  statusMap: Record<number, ConceptStatus>;
  bookmarked: number[];
  onSelectConcept: (conceptId: number, initialTab?: 'course' | 'overview') => void;
  onStatusChange: (conceptId: number, status: ConceptStatus) => void;
  onBookmarkToggle: (conceptId: number) => void;
  onOpenPrompts?: () => void;
  onOpenDictionary?: () => void;
}

export const ConceptMatrix: React.FC<ConceptMatrixProps> = ({
  statusMap,
  bookmarked,
  onSelectConcept,
  onStatusChange,
  onBookmarkToggle,
  onOpenPrompts,
  onOpenDictionary,
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<SectionId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'poster' | 'compact'>('poster');

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return ALL_CONCEPTS.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTagline = c.tagline.toLowerCase().includes(q);
        const matchesNumber = c.id.toString() === q.replace('#', '');
        if (!matchesName && !matchesTagline && !matchesNumber) return false;
      }

      // Section
      if (selectedSection !== 'all' && c.sectionId !== selectedSection) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all') {
        const diffMap: Record<string, string> = {
          Iniciante: 'Iniciante',
          Beginner: 'Iniciante',
          Intermediário: 'Intermediário',
          Intermediate: 'Intermediário',
          Avançado: 'Avançado',
          Advanced: 'Avançado',
        };
        if (c.difficulty !== diffMap[selectedDifficulty]) return false;
      }

      // Status
      const currentStatus = statusMap[c.id] || 'not_started';
      if (selectedStatus === 'completed' && currentStatus !== 'completed') return false;
      if (selectedStatus === 'in_progress' && currentStatus !== 'in_progress') return false;
      if (selectedStatus === 'not_started' && currentStatus !== 'not_started') return false;
      if (selectedStatus === 'bookmarked' && !bookmarked.includes(c.id)) return false;

      return true;
    });
  }, [searchQuery, selectedSection, selectedDifficulty, selectedStatus, statusMap, bookmarked]);

  // Overall Stats
  const completedCount = ALL_CONCEPTS.filter((c) => statusMap[c.id] === 'completed').length;
  const inProgressCount = ALL_CONCEPTS.filter((c) => statusMap[c.id] === 'in_progress').length;
  const progressPct = ((completedCount / 100) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Hero Header matching the infographic */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> {t('roadmapTag')}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
          {t('roadmapTitle')}
        </h1>
        <p className="text-cyan-400 font-mono text-sm sm:text-base mt-2 font-bold">
          {t('roadmapQuote')}
        </p>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl mx-auto font-medium">
          {t('roadmapDesc')}
        </p>

        {/* Global Progress Bar */}
        <div className="max-w-md mx-auto mt-6 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5 px-1">
            <span className="text-slate-400">{t('progressText')}</span>
            <span className="text-cyan-400 font-bold">{completedCount} {t('of')} 100 ({progressPct}%)</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Dynamic Feature Highlights Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-blue-500/30 flex items-start gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-mono font-bold text-white flex items-center gap-1">
                <span>100 Mini-Cursos Ilustrados</span>
                <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">5 Módulos</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Cada conceito possui anatomia arquitetural, mecânica interna, código e checkpoint prático.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPrompts}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-blue-500/30 hover:border-blue-500/60 transition-all flex items-start gap-2.5 text-left group"
          >
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold text-blue-300 flex items-center justify-between">
                <span>Gerador de Prompts IA (Pro)</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Construa prompts detalhados, refine com Gemini 3.8 Flash e teste em tempo real.
              </p>
            </div>
          </button>

          <button
            onClick={onOpenDictionary}
            className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex items-start gap-2.5 text-left group"
          >
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                <span>Dicionário Técnico</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Termos difíceis explicados com analogias do cotidiano e detalhes de baixo nível.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value === 'all' ? 'all' : Number(e.target.value) as SectionId)}
            className="bg-slate-950 text-slate-300 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{t('allSections')}</option>
            {SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {language === 'pt' ? `Seção ${sec.id}: ${sec.shortNamePt}` : `Section ${sec.id}: ${sec.shortNameEn}`}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{t('allDifficulties')}</option>
            <option value="Iniciante">{t('diffBeginner')}</option>
            <option value="Intermediário">{t('diffIntermediate')}</option>
            <option value="Avançado">{t('diffAdvanced')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 text-slate-300 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="completed">🟢 {t('statusCompleted')} ({completedCount})</option>
            <option value="in_progress">🟡 {t('statusInProgress')} ({inProgressCount})</option>
            <option value="not_started">⚪ {t('statusNotStarted')}</option>
            <option value="bookmarked">⭐ {t('statusBookmarked')} ({bookmarked.length})</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 ml-auto">
            <button
              onClick={() => setViewMode('poster')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === 'poster' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('viewPoster')}
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === 'compact' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('viewCards')}
            </button>
          </div>
        </div>
      </div>

      {/* Render Sections or Filtered Grid */}
      {viewMode === 'poster' && selectedSection === 'all' && !searchQuery.trim() && selectedDifficulty === 'all' && selectedStatus === 'all' ? (
        // Full Infographic 7 Sections Flow (Exact Poster Layout with Generous Spacing!)
        <div className="space-y-8">
          {SECTIONS.map((sec) => {
            const secConcepts = ALL_CONCEPTS.filter((c) => c.sectionId === sec.id);
            const secCompleted = secConcepts.filter((c) => statusMap[c.id] === 'completed').length;
            const secTitle = language === 'pt' ? sec.namePt : sec.nameEn;
            const secRange = language === 'pt' ? sec.rangePt : sec.rangeEn;

            return (
              <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${sec.color} shadow-sm`} />
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      {secTitle}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">{secRange}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">
                      {secCompleted} {t('of')} {secConcepts.length} {t('completedLabel')}
                    </span>
                    <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full bg-gradient-to-r ${sec.color}`}
                        style={{ width: `${(secCompleted / secConcepts.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grid for this Section - Well spaced responsive columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                  {secConcepts.map((concept) => {
                    const st = statusMap[concept.id] || 'not_started';
                    const isFav = bookmarked.includes(concept.id);

                    return (
                      <button
                        type="button"
                        key={concept.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectConcept(concept.id, 'course');
                        }}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between items-center group relative min-h-[110px] ${
                          st === 'completed'
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-sm'
                            : st === 'in_progress'
                            ? 'bg-amber-950/20 border-amber-500/40 text-amber-200 shadow-sm'
                            : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:bg-slate-900 shadow-sm hover:scale-[1.02]'
                        }`}
                      >
                        {/* Number & Bookmark */}
                        <div className="w-full flex items-center justify-between text-[11px] font-mono mb-1.5">
                          <span className={`font-black ${
                            st === 'completed' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-cyan-400'
                          }`}>
                            #{concept.id}
                          </span>
                          {isFav ? (
                            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          ) : (
                            <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400">
                              {concept.difficulty.slice(0, 3)}
                            </span>
                          )}
                        </div>

                        {/* Concept Name matching the poster */}
                        <span className="text-xs font-bold leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2 px-0.5">
                          {concept.name}
                        </span>

                        {/* Bottom Row: Mini-course pill + Status Dot */}
                        <div className="w-full mt-2 pt-1.5 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500 group-hover:text-blue-300 flex items-center gap-0.5">
                            <GraduationCap className="w-3 h-3 text-blue-400" />
                            <span>5 Mód</span>
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            st === 'completed' ? 'bg-emerald-400' : st === 'in_progress' ? 'bg-amber-400' : 'bg-slate-700'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Rich Cards View (when toggled to 'Cards' or when searching/filtering)
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-3 border-b border-slate-800">
            <span className="font-bold text-white">
              {filteredConcepts.length} {t('conceptsFound')}
            </span>
            <span className="text-slate-500">
              Modo de Exibição Expandido • Clique para Abrir Mini-Curso ou Visão Geral
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredConcepts.map((concept) => {
              const st = statusMap[concept.id] || 'not_started';
              const isFav = bookmarked.includes(concept.id);
              const sec = SECTIONS.find((s) => s.id === concept.sectionId);

              return (
                <div
                  key={concept.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectConcept(concept.id, 'course')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectConcept(concept.id, 'course');
                    }
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between group relative cursor-pointer hover:scale-[1.01] active:scale-[0.99] select-none ${
                    st === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                      : st === 'in_progress'
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200 hover:border-amber-400'
                      : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-cyan-500/10'
                  }`}
                >
                  <div>
                    {/* Header: ID, Section, Difficulty, Bookmark */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          #{concept.id}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 truncate max-w-[120px]">
                          {sec ? (language === 'pt' ? sec.shortNamePt : sec.shortNameEn) : `Seção ${concept.sectionId}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          concept.difficulty === 'Iniciante'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                            : concept.difficulty === 'Intermediário'
                            ? 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                        }`}>
                          {concept.difficulty}
                        </span>
                        {isFav && <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                      </div>
                    </div>

                    {/* Concept Name */}
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {concept.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {concept.tagline}
                    </p>
                  </div>

                  {/* Actions & Status Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-900 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Status:</span>
                      <span className={st === 'completed' ? 'text-emerald-400 font-bold' : st === 'in_progress' ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {st === 'completed' ? t('statusCompletedLabel') : st === 'in_progress' ? t('statusInProgressLabel') : t('statusNotStartedLabel')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectConcept(concept.id, 'course');
                        }}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Mini-Curso</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectConcept(concept.id, 'overview');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Visão Geral</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
