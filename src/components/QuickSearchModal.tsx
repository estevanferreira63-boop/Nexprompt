import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { ALL_CONCEPTS } from '../data/concepts';
import { Concept, ConceptStatus } from '../types/concept';
import { useLanguage } from '../context/LanguageContext';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConcept: (conceptId: number) => void;
  statusMap: Record<number, ConceptStatus>;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectConcept,
  statusMap,
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredConcepts = query.trim()
    ? ALL_CONCEPTS.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.overview.toLowerCase().includes(q) ||
          `#${c.id}`.includes(q) ||
          `${c.id}` === q
        );
      }).slice(0, 12)
    : ALL_CONCEPTS.slice(0, 8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'pt'
                ? 'Buscar por qualquer conceito, ID (#42) ou tecnologia (Spark, Lakehouse, DuckDB)...'
                : 'Search any concept, ID (#42), or technology...'
            }
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredConcepts.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              Nenhum conceito encontrado para "{query}".
            </div>
          ) : (
            filteredConcepts.map((concept) => {
              const status = statusMap[concept.id] || 'not_started';
              return (
                <button
                  key={concept.id}
                  onClick={() => {
                    onSelectConcept(concept.id);
                    onClose();
                  }}
                  className="p-3 rounded-2xl hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 transition-all text-left flex items-center justify-between group gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/50">
                      #{concept.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {concept.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 rounded bg-slate-800 text-slate-400">
                          Seção {concept.sectionId}
                        </span>
                        {status === 'completed' && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            ✓ Dominado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5 font-sans">
                        {concept.tagline}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>{filteredConcepts.length} conceitos listados</span>
          <span>Dica: Use as setas e Enter para selecionar</span>
        </div>
      </div>
    </div>
  );
};
