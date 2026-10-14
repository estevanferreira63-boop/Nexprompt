import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  X,
  Sparkles,
  Cpu,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { TECHNICAL_DICTIONARY, DICTIONARY_CATEGORIES, DictionaryEntry } from '../data/technicalDictionary';
import { useLanguage } from '../context/LanguageContext';

interface TechnicalDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept?: (conceptId: number) => void;
}

export const TechnicalDictionaryModal: React.FC<TechnicalDictionaryModalProps> = ({
  isOpen,
  onClose,
  onSelectConcept,
}) => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'both' | 'simple' | 'technical'>('both');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    return TECHNICAL_DICTIONARY.filter((entry) => {
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        entry.term.toLowerCase().includes(q) ||
        (entry.englishTerm && entry.englishTerm.toLowerCase().includes(q)) ||
        entry.simpleAnalogy.toLowerCase().includes(q) ||
        entry.deepTechnical.toLowerCase().includes(q) ||
        entry.realWorldExample.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (entry: DictionaryEntry) => {
    const textToCopy = `[${entry.term} / ${entry.englishTerm || ''}]\n\n💡 Analogia Simples:\n${entry.simpleAnalogy}\n\n⚙️ No Baixo Nível:\n${entry.deepTechnical}\n\n🏢 Em Produção:\n${entry.realWorldExample}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog Container - Full screen on mobile, elegant card on tablet/desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-4xl bg-slate-900 sm:border sm:border-slate-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* 1. Header - Ultra-compact, space-saving */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-sans truncate">
                  {language === 'pt' ? 'Dicionário Técnico Descomplicado' : 'Plain-English Tech Dictionary'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                  {filteredEntries.length} {language === 'pt' ? 'termos' : 'terms'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {language === 'pt'
                  ? 'Jargões de Engenharia de Dados & IA explicados com analogias do cotidiano e funcionamento interno.'
                  : 'Data & AI jargon decoded with simple everyday metaphors and low-level internals.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex-shrink-0"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Search & Controls Bar - Highly optimized for vertical reading space */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-b border-slate-800/60 bg-slate-900/90 space-y-2.5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'pt'
                    ? 'Buscar termo, sigla ou analogia (ex: Shuffle, ACID, Spill, RAG, Idempotência)...'
                    : 'Search term or analogy (e.g. Shuffle, ACID, Spill, RAG, Idempotence)...'
                }
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Toggle (Analogia / Técnico / Ambos) */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono self-start sm:self-auto flex-shrink-0">
              <button
                onClick={() => setViewMode('simple')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'simple'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{language === 'pt' ? 'Analogias' : 'Metaphors'}</span>
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'technical'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>{language === 'pt' ? 'Baixo Nível' : 'Technical'}</span>
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'both'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'pt' ? 'Ambos' : 'Both'}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-mono scrollbar-none">
            {DICTIONARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all text-[11px] border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {language === 'pt' ? cat.labelPt : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Reading Pane - Maximum Vertical Space & High-Legibility Typography */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
              <p className="text-sm font-mono">
                {language === 'pt' ? 'Nenhum termo encontrado com os filtros atuais.' : 'No terms found for the current query.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                {language === 'pt' ? 'Limpar busca' : 'Clear search'}
              </button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3 shadow-lg"
              >
                {/* Term Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                      {entry.term}
                    </h4>
                    {entry.englishTerm && entry.englishTerm !== entry.term && (
                      <span className="text-xs text-slate-400 font-mono">
                        · {entry.englishTerm}
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold uppercase">
                      {entry.categoryLabelPt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(entry)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1 transition-colors"
                      title="Copiar definição completa"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {entry.relatedConceptIds.length > 0 && onSelectConcept && (
                      <button
                        onClick={() => {
                          onSelectConcept(entry.relatedConceptIds[0]);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                        title="Abrir no Roadmap de 100 Conceitos"
                      >
                        <span>#{entry.relatedConceptIds[0]}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Explanations - Spacious, high contrast, readable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Simple Metaphor Card */}
                  {(viewMode === 'both' || viewMode === 'simple') && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold uppercase">
                        <Lightbulb className="w-4 h-4 flex-shrink-0" />
                        <span>{language === 'pt' ? 'Como Explicar para Leigos (Analogia)' : 'Plain Metaphor'}</span>
                      </div>
                      <p className="text-sm sm:text-[15px] text-amber-100/95 leading-relaxed font-sans">
                        {entry.simpleAnalogy}
                      </p>
                    </div>
                  )}

                  {/* Deep Technical Internals Card */}
                  {(viewMode === 'both' || viewMode === 'technical') && (
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold uppercase">
                        <Cpu className="w-4 h-4 flex-shrink-0" />
                        <span>{language === 'pt' ? 'No Baixo Nível (Engenharia)' : 'Low-Level Internals'}</span>
                      </div>
                      <p className="text-sm sm:text-[15px] text-cyan-100/95 leading-relaxed font-sans">
                        {entry.deepTechnical}
                      </p>
                    </div>
                  )}
                </div>

                {/* Real-World Production Example */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'pt' ? 'Aplicação Real na Indústria:' : 'Production Reality:'}</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {entry.realWorldExample}
                  </p>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 4. Quiet Compact Footer (Only on desktop) */}
        <div className="hidden sm:flex px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/90 items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'pt' ? 'Atalho rápido: Alt + D para abrir ou fechar' : 'Quick shortcut: Alt + D to open/close'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            {language === 'pt' ? 'Fechar' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
