import React, { useState, useEffect } from 'react';
import { Concept, ConceptStatus, LabType } from '../types/concept';
import { SECTIONS } from '../data/concepts/sections';
import { CONCEPTS_BY_ID } from '../data/concepts';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  Code2,
  CheckCircle,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  Layers,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Edit3,
  Play,
  Download,
  Terminal,
  Cpu,
  Workflow,
  RotateCcw,
  BarChart3,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { IllustratedMiniCourseView } from './IllustratedMiniCourseView';
import { shuffleQuizOptions, ShuffledQuiz } from '../utils/quizUtils';

interface ConceptDetailModalProps {
  concept: Concept;
  status: ConceptStatus;
  isBookmarked: boolean;
  onClose: () => void;
  onStatusChange: (conceptId: number, status: ConceptStatus) => void;
  onBookmarkToggle: (conceptId: number) => void;
  onSelectConcept: (conceptId: number) => void;
  onOpenLab?: (labType: LabType) => void;
  onOpenPromptStudio?: (promptTopic: string) => void;
  initialTab?: 'course' | 'overview' | 'code' | 'playground' | 'architecture' | 'benchmarks' | 'notes' | 'quiz' | 'tutor';
}

export const ConceptDetailModal: React.FC<ConceptDetailModalProps> = ({
  concept,
  status,
  isBookmarked,
  onClose,
  onStatusChange,
  onBookmarkToggle,
  onSelectConcept,
  onOpenLab,
  onOpenPromptStudio,
  initialTab = 'course',
}) => {
  const { language, t } = useLanguage();
  const { recordQuizCorrect, recordConceptCompleted, addXp } = useGamification();
  const [activeTab, setActiveTab] = useState<'course' | 'overview' | 'code' | 'playground' | 'architecture' | 'benchmarks' | 'notes' | 'quiz' | 'tutor'>(initialTab);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [concept.id, initialTab]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Personal Notes State
  const [personalNotes, setPersonalNotes] = useState<string>(() => {
    try {
      return localStorage.getItem(`de_ai_concept_notes_${concept.id}`) || '';
    } catch {
      return '';
    }
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Interactive Playground Simulation State
  const [playgroundCode, setPlaygroundCode] = useState<string>(concept.codeSnippet?.code || '-- Digite sua query SQL ou código de transformação aqui...');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<{
    status: 'success';
    execTime: string;
    partitions: string;
    memory: string;
    rows: string;
  } | null>(null);

  // AI Tutor prompt state
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [shuffledQuiz, setShuffledQuiz] = useState<ShuffledQuiz | null>(null);

  // Lock body scroll to prevent page jumping
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Sync state when concept changes
  useEffect(() => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setTutorResponse(null);
    setTutorQuery('');
    setPlaygroundCode(concept.codeSnippet?.code || '-- Digite sua query SQL ou código de transformação aqui...');
    setSimulationResult(null);
    if (concept.quiz) {
      setShuffledQuiz(shuffleQuizOptions(concept.quiz));
    } else {
      setShuffledQuiz(null);
    }
    try {
      const savedNote = localStorage.getItem(`de_ai_concept_notes_${concept.id}`) || '';
      setPersonalNotes(savedNote);
    } catch {
      setPersonalNotes('');
    }
  }, [concept.id]);

  const handleSaveNotes = (text: string) => {
    setPersonalNotes(text);
    try {
      localStorage.setItem(`de_ai_concept_notes_${concept.id}`, text);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInsertNoteTemplate = () => {
    const template =
      `# Anotações de Estudo: ${concept.name}\n\n` +
      `## 📌 Resumo em 1 Frase\n${concept.tagline}\n\n` +
      `## ⚙️ Como funciona por baixo dos panos\n${concept.underTheHood}\n\n` +
      `## 💡 Caso de Uso Real no Mercado\n${concept.realWorldExample}\n\n` +
      `## ⚠️ Armadilha Comum (Anti-Pattern)\n${concept.antiPatterns?.[0] || 'Atenção aos gargalos de I/O e serialização.'}\n\n` +
      `## 🎯 Pergunta Típica de Entrevista Técnica\nComo você otimizaria a latência e o particionamento ao usar ${concept.name} em produção?`;
    handleSaveNotes(template);
  };

  const handleExportNotes = () => {
    const blob = new Blob([personalNotes || `# ${concept.name}\n${concept.overview}`], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anotacoes_conceito_${concept.id}_${concept.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
    sound.playSuccess();
  };

  const handleRunPlayground = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationStep('Otimizando Logical Plan & Catalyst Analyzer...');

    setTimeout(() => {
      setSimulationStep('Aplicando Partition Pruning & Predicate Pushdown...');
    }, 600);

    setTimeout(() => {
      setSimulationStep('Executando operadores vetoriais SIMD em RAM...');
    }, 1200);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        status: 'success',
        execTime: `${(Math.random() * 120 + 35).toFixed(1)} ms`,
        partitions: '16 / 128 (87.5% pruning)',
        memory: `${(Math.random() * 45 + 18).toFixed(1)} MB`,
        rows: '1.240.500 linhas processadas',
      });
      sound.playSuccess();
      addXp(15);
    }, 1800);
  };

  const section = SECTIONS.find((s) => s.id === concept.sectionId);
  const sectionTitle = section ? (language === 'pt' ? section.namePt : section.nameEn) : '';

  const handleCopyCode = () => {
    if (concept.codeSnippet) {
      navigator.clipboard.writeText(concept.codeSnippet.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(index);
    setQuizSubmitted(true);

    const activeQuiz = shuffledQuiz || concept.quiz;
    if (activeQuiz && index === activeQuiz.correctIndex) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      recordQuizCorrect();
      recordConceptCompleted(concept.id, 1);
      onStatusChange(concept.id, 'completed');
    }
  };

  const handleAskTutor = async (customPrompt?: string) => {
    const question = customPrompt || tutorQuery;
    if (!question.trim()) return;

    setIsTutorLoading(true);
    setTutorResponse(null);

    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptName: concept.name,
          conceptOverview: concept.overview,
          userQuestion: question,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTutorResponse(data.explanation || data.answer);
      } else {
        setTutorResponse(
          `**Aprofundamento Didático sobre ${concept.name}:**\n\n` +
          `• **Em Sistemas Reais:** ${concept.underTheHood}\n\n` +
          `• **Dica de Entrevista Técnica:** Sempre relacione ${concept.name} aos trade-offs fundamentais de latência vs custo financeiro na nuvem. Sistemas distribuídos nunca oferecem almoço grátis: ao otimizar para throughput (Batch), você sacrifica latência imediata; ao otimizar para baixa latência (Streaming/Real-time), aumentam a complexidade e o custo de infraestrutura contínua.`
        );
      }
    } catch {
      setTutorResponse(
        `**Análise Prática para ${concept.name}:**\n\n` +
        `O segredo de dominar este conceito é entender onde ele se posiciona no fluxo ponta a ponta: ${concept.underTheHood}\n\n` +
        `Caso de uso emblemático: ${concept.realWorldExample}.`
      );
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${isFocusMode ? 'p-0' : 'p-0 sm:p-4 md:p-6'} bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fadeIn`}
    >
      <div className={`relative w-full ${isFocusMode ? 'max-w-none h-screen rounded-none border-none max-h-none' : 'max-w-5xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-2xl border-0 sm:border border-slate-800'} bg-slate-900 shadow-2xl overflow-hidden flex flex-col`}>
        {/* Header with Category Color Top Bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${section?.color || 'from-cyan-500 to-blue-600'}`} />

        {/* Compact, Highly-Optimized Header */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 border-b border-slate-800/80 bg-slate-900/95 flex flex-col gap-1.5 sm:gap-2">
          {/* Top Line: Badges on Left, Actions on Right */}
          <div className="flex items-center justify-between gap-2">
            {/* Badges Cluster */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-mono text-[11px] font-black text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex-shrink-0">
                #{concept.id}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border truncate max-w-[140px] sm:max-w-none ${section?.badgeBg || 'text-cyan-400 border-cyan-800 bg-cyan-950/40'}`}>
                {sectionTitle}
              </span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                concept.difficulty === 'Iniciante'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                  : concept.difficulty === 'Intermediário'
                  ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
              }`}>
                {concept.difficulty}
              </span>
              {isFocusMode && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse hidden sm:inline-block">
                  Foco
                </span>
              )}
            </div>

            {/* Actions Cluster (Compact, aligned on the same top line) */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Status Select */}
              <select
                value={status}
                onChange={(e) => onStatusChange(concept.id, e.target.value as ConceptStatus)}
                className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-lg border focus:outline-none transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : status === 'in_progress'
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-slate-950 text-slate-400 border-slate-700'
                }`}
              >
                <option value="not_started">{t('statusNotStartedLabel')}</option>
                <option value="in_progress">{t('statusInProgressLabel')}</option>
                <option value="completed">{t('statusCompletedLabel')}</option>
              </select>

              {/* Bookmark button */}
              <button
                onClick={() => onBookmarkToggle(concept.id)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Favoritar Conceito"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Focus Mode button */}
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-1.5 rounded-lg border transition-all hidden sm:block ${
                  isFocusMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title={isFocusMode ? 'Sair do Modo Foco' : 'Ativar Modo Foco (Tela Inteira)'}
              >
                {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-all"
                title="Fechar (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title and Tagline Row */}
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
              {concept.name}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 leading-snug line-clamp-1 sm:line-clamp-2">
              {concept.tagline}
            </p>
          </div>
        </div>

        {/* Tab Navigation - Compact, sleek scrollable bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-3 sm:px-6 gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('course')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'course'
                ? 'border-blue-400 text-blue-300 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'pt' ? 'Mini-Curso' : 'Course'}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              5 Mód
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Visão Geral' : 'Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Código' : 'Code'}</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'playground'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'pt' ? 'Sandbox' : 'Sandbox'}</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'pt' ? 'Arquitetura' : 'Architecture'}</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'benchmarks'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'pt' ? 'Benchmarks' : 'Benchmarks'}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'pt' ? 'Anotações' : 'Notes'}</span>
          </button>

          {concept.quiz && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('tutor')}
            className={`py-2 px-2.5 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tutor'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>{language === 'pt' ? 'Tutor IA' : 'AI Tutor'}</span>
          </button>
        </div>

        {/* Tab Body with Scroll */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-slate-200">
          {/* TAB: MINI-CURSO ILUSTRADO (5 MÓDULOS) */}
          {activeTab === 'course' && (
            <IllustratedMiniCourseView
              concept={concept}
              onCompleteCourse={() => onStatusChange(concept.id, 'completed')}
            />
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Lab shortcut callout if this concept has a simulator */}
              {concept.labType && onOpenLab && (
                <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                      <Layers className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase text-cyan-300">
                        {t('modalLabAvailable')}
                      </h4>
                      <p className="text-xs text-slate-300">
                        {t('modalLabDesc')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLab(concept.labType!);
                    }}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all flex-shrink-0"
                  >
                    {t('modalOpenLab')} <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Primary Definition Hero Card - High Readability */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-blue-950/30 via-slate-900 to-slate-950 border border-blue-500/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {t('modalDef')}
                  </span>
                  {onOpenPromptStudio && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPromptStudio(concept.name);
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      title="Abrir o Estúdio de Prompts com este conceito carregado"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar Prompt IA</span>
                    </button>
                  )}
                </div>
                <p className="text-base sm:text-[17px] leading-relaxed text-slate-100 font-medium font-sans">
                  {concept.overview}
                </p>
              </div>

              {/* Side-by-Side Reading Grid: Why It Matters & Real World Industry Example */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Why It Matters */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> {t('modalWhy')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200 font-sans">
                    {concept.whyItMatters}
                  </p>
                </div>

                {/* Real World Example */}
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {t('modalRealWorld')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200 font-sans">
                    {concept.realWorldExample}
                  </p>
                </div>
              </div>

              {/* Under the Hood (Architecture Internals) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-mono uppercase text-purple-400 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" /> {t('modalUnderHood')}
                </h3>
                <p className="text-sm leading-relaxed text-slate-200 font-sans">
                  {concept.underTheHood}
                </p>
              </div>

              {/* Anti-Patterns & Best Practices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concept.antiPatterns && concept.antiPatterns.length > 0 && (
                  <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-2xl space-y-2">
                    <h4 className="text-xs font-mono uppercase text-red-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {t('modalAntiPatterns')}
                    </h4>
                    <ul className="text-xs sm:text-sm text-red-200/90 space-y-2 list-disc list-inside leading-relaxed">
                      {concept.antiPatterns.map((ap, i) => (
                        <li key={i}>{ap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {concept.bestPractices && concept.bestPractices.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-2xl space-y-2">
                    <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> {t('modalBestPractices')}
                    </h4>
                    <ul className="text-xs sm:text-sm text-emerald-200/90 space-y-2 list-disc list-inside leading-relaxed">
                      {concept.bestPractices.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Related Concepts */}
              {concept.relatedIds && concept.relatedIds.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
                    {t('modalRelated')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {concept.relatedIds.map((relId) => {
                      const relConcept = CONCEPTS_BY_ID[relId];
                      if (!relConcept) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => onSelectConcept(relId)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
                        >
                          <span>#{relId}</span>
                          <span>{relConcept.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-6 animate-fadeIn">
              {concept.codeSnippet ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                      {concept.codeSnippet.title} ({concept.codeSnippet.language.toUpperCase()})
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono flex items-center gap-1.5 transition-all"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? t('modalCopied') : t('modalCopyCode')}
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
                    <code>{concept.codeSnippet.code}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  {t('modalNoCode')}
                </div>
              )}
            </div>
          )}

          {/* TAB: PLAYGROUND / SIMULADOR DE CÓDIGO */}
          {activeTab === 'playground' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {language === 'pt' ? 'Sandbox de Execução Distribuída' : 'Distributed Execution Sandbox'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Spark / SQL Simulator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlaygroundCode(concept.codeSnippet?.code || '-- Digite sua query SQL...')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono flex items-center gap-1"
                    title="Restaurar código original"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRunPlayground}
                    disabled={isSimulating}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSimulating ? (language === 'pt' ? 'Executando...' : 'Running...') : (language === 'pt' ? 'Executar Query (+15 XP)' : 'Run Query (+15 XP)')}</span>
                  </button>
                </div>
              </div>

              {/* Code Input Area */}
              <div className="relative">
                <textarea
                  value={playgroundCode}
                  onChange={(e) => setPlaygroundCode(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y selection:bg-emerald-500 selection:text-slate-950"
                  placeholder="Escreva ou edite sua query..."
                />
              </div>

              {/* Animated Simulation Progress */}
              {isSimulating && (
                <div className="p-4 bg-slate-950/90 rounded-xl border border-emerald-500/30 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>{simulationStep}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Simulation Result Output */}
              {simulationResult && !isSimulating && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Execution Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Tempo de Execução</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{simulationResult.execTime}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Partições Tocadas</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">{simulationResult.partitions}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Memória RAM Alocada</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{simulationResult.memory}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Linhas Escaneadas</span>
                      <span className="text-xs font-mono font-bold text-purple-400">{simulationResult.rows}</span>
                    </div>
                  </div>

                  {/* Mock Result Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                    <div className="px-4 py-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Resultado da Consulta (Primeiros 4 registros retornados):</span>
                      <span className="text-emerald-400">✓ Status: 200 OK</span>
                    </div>
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">id</th>
                          <th className="p-2.5">partition_dt</th>
                          <th className="p-2.5">entity_key</th>
                          <th className="p-2.5">metric_value</th>
                          <th className="p-2.5">processing_engine</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        <tr>
                          <td className="p-2.5 text-cyan-400">#001</td>
                          <td className="p-2.5">2026-10-07</td>
                          <td className="p-2.5 font-bold">session_98231</td>
                          <td className="p-2.5 text-emerald-400">142.85</td>
                          <td className="p-2.5">SIMD-Vectorized</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-cyan-400">#002</td>
                          <td className="p-2.5">2026-10-07</td>
                          <td className="p-2.5 font-bold">session_98232</td>
                          <td className="p-2.5 text-emerald-400">98.10</td>
                          <td className="p-2.5">SIMD-Vectorized</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-cyan-400">#003</td>
                          <td className="p-2.5">2026-10-07</td>
                          <td className="p-2.5 font-bold">session_98233</td>
                          <td className="p-2.5 text-emerald-400">312.44</td>
                          <td className="p-2.5">SIMD-Vectorized</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PIPELINE & ARQUITETURA */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Visão Sistêmica Ponta a Ponta
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Onde {concept.name} se posiciona na Arquitetura de Dados Moderna
                </h3>
              </div>

              {/* Visual Architecture Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 1, name: '1. Ingestão', subtitle: 'Kafka / CDC / APIs', isTarget: concept.sectionId === 4 },
                  { id: 2, name: '2. Processamento', subtitle: 'Spark / Flink / dbt', isTarget: concept.sectionId === 1 || concept.sectionId === 5 },
                  { id: 3, name: '3. Lakehouse ACID', subtitle: 'Iceberg / Delta / Parquet', isTarget: concept.sectionId === 2 || concept.sectionId === 3 },
                  { id: 4, name: '4. Serving & OLAP', subtitle: 'Trino / ClickHouse', isTarget: concept.sectionId === 6 },
                  { id: 5, name: '5. IA & Consumo', subtitle: 'Vector DB / RAG / BI', isTarget: concept.sectionId === 7 },
                ].map((step) => (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      step.isTarget
                        ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-slate-950/70 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold block ${step.isTarget ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {step.name}
                    </span>
                    <p className={`text-xs font-bold mt-1 ${step.isTarget ? 'text-white' : 'text-slate-300'}`}>
                      {step.subtitle}
                    </p>
                    {step.isTarget && (
                      <span className="inline-block mt-2 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 animate-pulse">
                        📍 Atuação do Conceito
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Architectural Under the Hood Deep Dive */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Mecanismo de Execução & I/O
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {concept.underTheHood}
                </p>
              </div>

              {/* Production Gotcha / Anti-pattern Callout */}
              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Armadilha Crítica em Produção
                </h4>
                <p className="text-xs text-red-200/90 leading-relaxed font-sans">
                  {concept.antiPatterns?.[0] || 'Atenção aos gargalos de I/O de disco, spill de memória e skew em chaves particionadas.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB: BENCHMARKS & STAFF INTERVIEW TRAPS */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Engenharia de Produção & Entrevistas Staff
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Métricas de Throughput, Custos de Nuvem & Pegadinhas Técnicas: {concept.name}
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  Produção Real
                </span>
              </div>

              {/* 1. Production Benchmark Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Throughput Típico</span>
                  <span className="text-xs font-mono font-black text-emerald-400 mt-1 block">180 - 950 MB/s</span>
                  <span className="text-[10px] text-slate-500">Por nó worker</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">SLA de Latência</span>
                  <span className="text-xs font-mono font-black text-cyan-400 mt-1 block">P50: 45ms • P99: 380ms</span>
                  <span className="text-[10px] text-slate-500">Garantia percentil</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Consumo de Memória</span>
                  <span className="text-xs font-mono font-black text-amber-400 mt-1 block">4GB - 16GB Heap</span>
                  <span className="text-[10px] text-slate-500">80% data, 20% overhead</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">I/O de Armazenamento</span>
                  <span className="text-xs font-mono font-black text-purple-400 mt-1 block">3.000 - 12.000 IOPS</span>
                  <span className="text-[10px] text-slate-500">NVMe / S3 API limits</span>
                </div>
              </div>

              {/* 2. Cloud Cost Comparison Matrix */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Comparativo de Custos em Produção na Nuvem
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Base: 10 TB / mês</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-400 font-bold">AWS EMR (Spot)</span>
                      <span className="text-emerald-400 font-bold">$</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      ~$0.048 / vCPU-h. Custo mais baixo, porém exige equipe dedicada para gerenciar autoscaling, warm-up e preemptions.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">Databricks Serverless</span>
                      <span className="text-amber-400 font-bold">$$</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      ~$0.55 / DBU. Motor Photon ultra-otimizado com boot em &lt; 15 segundos. Custo equilibrado para produtividade rápida.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 font-bold">Snowflake / ClickHouse</span>
                      <span className="text-rose-400 font-bold">$$$</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      ~$2.00 - $4.00 / crédito. Zero administração de infraestrutura. Excelente para consultas analíticas pontuais de BI.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Top 3 Staff Data Engineer Technical Interview Pitfalls */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  3 Perguntas de Pegadinha em Entrevistas para Staff Data Engineer
                </span>

                <div className="space-y-2">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-bold font-mono">
                      <span>#1</span>
                      <span>"Como {concept.name} se comporta quando a rede sofre partição ou lag súbito?"</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 font-sans">
                      <strong className="text-cyan-300 font-mono">Resposta ideal:</strong> Avalie sempre sob o Teorema CAP ou PACELC. Identifique se o sistema prioriza Consistência estrita (com backpressure e recusa de gravações) ou Disponibilidade contínua (com eventual consistency e reconciliação tardia). Em pipelines financeiros, consistência é inegociável.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-bold font-mono">
                      <span>#2</span>
                      <span>"Quando NÃO devemos utilizar {concept.name} em produção?"</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 font-sans">
                      <strong className="text-cyan-300 font-mono">Resposta ideal:</strong> {concept.antiPatterns?.[0] || 'Quando o volume de dados for modesto e um banco relacional simples atender a latência sem custo de manutenção distribuída.'} Arquiteturas superdimensionadas para problemas pequenos geram débito técnico desnecessário.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-rose-300 font-bold font-mono">
                      <span>#3</span>
                      <span>"Qual é o impacto de Write Amplification vs Read Amplification neste padrão?"</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 font-sans">
                      <strong className="text-cyan-300 font-mono">Resposta ideal:</strong> O trade-off clássico: organizar dados na escrita (índices, sorting, z-ordering) acelera leituras, mas desacelera a ingestão. Se a carga for 99% escrita com poucas leituras, minimize reordenações no ingestion path.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MINHAS ANOTAÇÕES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {language === 'pt' ? 'Caderno de Anotações Pessoais' : 'Personal Study Notebook'}
                  </span>
                  {noteSavedFeedback && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-fadeIn">
                      ✓ Salvo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInsertNoteTemplate}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition-colors"
                  >
                    {language === 'pt' ? 'Inserir Modelo' : 'Insert Template'}
                  </button>
                  <button
                    onClick={handleExportNotes}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'pt' ? 'Baixar (.md)' : 'Export (.md)'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={personalNotes}
                onChange={(e) => handleSaveNotes(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed resize-y placeholder:text-slate-600"
                placeholder={
                  language === 'pt'
                    ? 'Escreva suas anotações, insights de entrevistas técnicas, comandos úteis ou clique em "Inserir Modelo"...'
                    : 'Write your personal study notes, interview takeaways, commands, or click "Insert Template"...'
                }
              />
              <p className="text-[11px] font-mono text-slate-500">
                {language === 'pt'
                  ? '🔒 Suas anotações são salvas automaticamente no armazenamento local do seu navegador.'
                  : '🔒 Your notes are saved automatically in your browser local storage.'}
              </p>
            </div>
          )}

          {activeTab === 'quiz' && (concept.quiz || shuffledQuiz) && (() => {
            const activeQuiz = shuffledQuiz || concept.quiz!;
            return (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-2">
                    {t('modalQuizTitle')}
                  </span>
                  <h3 className="text-base font-bold text-white mb-6 leading-relaxed">
                    {activeQuiz.question}
                  </h3>

                  <div className="space-y-3">
                    {activeQuiz.options.map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      const isCorrect = idx === activeQuiz.correctIndex;

                      let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-950/60 border-red-500 text-red-200';
                        } else {
                          btnStyle = 'bg-slate-950 border-slate-900 text-slate-600 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={quizSubmitted}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-800 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold">
                        {selectedQuizOption === activeQuiz.correctIndex ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> {t('modalQuizCorrect')}
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> {t('modalQuizIncorrect')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeQuiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'tutor' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-fuchsia-400 font-bold mb-2">
                  <Sparkles className="w-4 h-4" /> {t('modalTutorTitle')}
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  {t('modalTutorDesc')}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    placeholder={t('modalTutorPlaceholder')}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 font-sans"
                    onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
                  />
                  <button
                    onClick={() => handleAskTutor()}
                    disabled={isTutorLoading}
                    className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {isTutorLoading ? t('modalTutorThinking') : t('modalTutorButton')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleAskTutor(`Quais são as principais perguntas de entrevista técnica sobre ${concept.name}?`)}
                    className="text-[11px] font-mono text-fuchsia-300 bg-fuchsia-950/30 hover:bg-fuchsia-950/60 px-2.5 py-1 rounded border border-fuchsia-900/40 transition-colors"
                  >
                    {t('modalTutorInterviewBtn')}
                  </button>
                  <button
                    onClick={() => handleAskTutor(`Qual a diferença prática entre ${concept.name} e outras alternativas de mercado?`)}
                    className="text-[11px] font-mono text-fuchsia-300 bg-fuchsia-950/30 hover:bg-fuchsia-950/60 px-2.5 py-1 rounded border border-fuchsia-900/40 transition-colors"
                  >
                    {t('modalTutorTradeoffsBtn')}
                  </button>
                </div>
              </div>

              {tutorResponse && (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 leading-relaxed text-xs text-slate-300 whitespace-pre-line font-sans animate-fadeIn">
                  {tutorResponse}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
