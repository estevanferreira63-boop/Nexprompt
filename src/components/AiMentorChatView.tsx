import React, { useState, useRef, useEffect } from 'react';
import { ALL_CONCEPTS } from '../data/concepts';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';
import { ChatMessage } from '../types/concept';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Code2,
  Briefcase,
  Terminal,
  Zap,
  Download,
  Share2,
  RefreshCw,
  Lightbulb,
  Cpu,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { generateDynamicMentorResponse } from '../utils/mentorEngine';

interface AiMentorChatViewProps {
  initialConceptId?: number | null;
  initialPromptText?: string | null;
}

export type MentorMode = 'architect' | 'code_review' | 'interview' | 'feynman';

interface PromptPreset {
  category: 'architecture' | 'performance' | 'interview' | 'troubleshooting';
  labelPt: string;
  labelEn: string;
  icon: string;
  questionPt: string;
  questionEn: string;
}

const PRESET_PROMPTS: PromptPreset[] = [
  {
    category: 'architecture',
    labelPt: 'Delta vs Iceberg vs Hudi',
    labelEn: 'Delta vs Iceberg vs Hudi',
    icon: '🏗️',
    questionPt: 'Qual o comparativo técnico e trade-offs de governança entre Delta Lake, Apache Iceberg e Apache Hudi para uma esteira de 50TB/dia?',
    questionEn: 'What is the technical breakdown and governance trade-offs between Delta Lake, Apache Iceberg, and Apache Hudi for a 50TB/day workload?',
  },
  {
    category: 'performance',
    labelPt: 'Spark Skew & Salt Keys',
    labelEn: 'Spark Skew & Salt Keys',
    icon: '⚡',
    questionPt: 'Como diagnosticar e resolver Data Skew no Spark usando Salt Keys e broadcast hints em joins complexos?',
    questionEn: 'How to diagnose and resolve Data Skew in Spark using Salt Keys and broadcast hints in skewed joins?',
  },
  {
    category: 'architecture',
    labelPt: 'OLTP vs OLAP em Baixo Nível',
    labelEn: 'OLTP vs OLAP Internals',
    icon: '💾',
    questionPt: 'Explique a mecânica física em memória e disco (Row vs Columnar Parquet) que torna OLAP centenas de vezes mais rápido para agregações que OLTP.',
    questionEn: 'Explain the low-level memory and disk mechanics (Row vs Columnar Parquet) that makes OLAP orders of magnitude faster for aggregates than OLTP.',
  },
  {
    category: 'interview',
    labelPt: 'System Design: Streaming 1M RPS',
    labelEn: 'System Design: 1M RPS',
    icon: '💼',
    questionPt: 'Simule uma pergunta socrática de entrevista de System Design para uma esteira em tempo real processando 1 milhão de eventos/segundo.',
    questionEn: 'Simulate a Socratic Big Tech System Design interview question for a real-time event pipeline processing 1 million events per second.',
  },
  {
    category: 'troubleshooting',
    labelPt: 'Spark OOM & Spill to Disk',
    labelEn: 'Spark OOM & Disk Spill',
    icon: '🐞',
    questionPt: 'Nosso cluster Spark está sofrendo com Spill (Memory) e Spill (Disk) na etapa de shuffle. Quais os parâmetros e cálculos exatos para estabilizar?',
    questionEn: 'Our Spark cluster is suffering from high Shuffle Spill (Memory) and Spill (Disk). What exact configuration tuning formulas resolve this?',
  },
  {
    category: 'architecture',
    labelPt: 'Pipeline RAG & Vector Embeddings',
    labelEn: 'RAG & Vector Embeddings',
    icon: '🤖',
    questionPt: 'Como arquitetar uma esteira de dados de ponta a ponta para RAG garantindo chunking semântico, busca HNSW vetorial e baixa latência de inferência?',
    questionEn: 'How to architect an end-to-end data pipeline for RAG ensuring semantic chunking, HNSW vector search, and sub-second retrieval latency?',
  },
];

// Helper to render markdown bold, inline code, headers, quotes, and code blocks
const RichMessageRenderer: React.FC<{
  content: string;
  onCopyCode: (code: string) => void;
}> = ({ content, onCopyCode }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3.5 font-sans leading-relaxed text-slate-100">
      {parts.map((part, index) => {
        // Fenced code block: ```lang ... ```
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = part.slice(3, firstLineEnd > 3 ? firstLineEnd : 3).trim() || 'code';
          const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

          return (
            <div key={index} className="my-3.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  {lang}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyCode(code.trim())}
                  className="hover:text-blue-300 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </button>
              </div>
              <pre className="p-4 sm:p-5 text-xs sm:text-[13px] font-mono text-emerald-300 overflow-x-auto leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }

        // Standard markdown lines
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-base font-bold text-blue-300 pt-3 pb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    {renderInline(trimmed.replace('### ', ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-lg font-bold text-white pt-4 pb-1.5 border-b border-slate-800">
                    {renderInline(trimmed.replace('## ', ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-xl font-bold text-amber-300 pt-4 pb-2 border-b border-amber-500/20">
                    {renderInline(trimmed.replace('# ', ''))}
                  </h2>
                );
              }

              // Bullet points
              if (/^[-*•]\s+/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-2 text-sm sm:text-[15px] leading-relaxed">
                    <span className="text-blue-400 mt-1 flex-shrink-0 font-bold">•</span>
                    <span className="flex-1 text-slate-100">{renderInline(trimmed.replace(/^[-*•]\s+/, ''))}</span>
                  </div>
                );
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-2 text-sm sm:text-[15px] leading-relaxed">
                    <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm mt-0.5 flex-shrink-0">{numMatch[1]}.</span>
                    <span className="flex-1 text-slate-100">{renderInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Blockquote / Callouts
              if (trimmed.startsWith('>')) {
                return (
                  <div key={lIdx} className="p-3 sm:p-4 rounded-xl bg-slate-900 border border-blue-500/30 text-sm sm:text-[15px] text-blue-100/90 italic my-2">
                    {renderInline(trimmed.replace(/^>\s*/, ''))}
                  </div>
                );
              }

              return (
                <p key={lIdx} className="text-sm sm:text-[15px] leading-relaxed text-slate-100 font-normal">
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-cyan-200">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 bg-slate-900 border border-slate-700/60 rounded text-[11px] font-mono text-amber-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const AiMentorChatView: React.FC<AiMentorChatViewProps> = ({
  initialConceptId = null,
  initialPromptText = null,
}) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [mentorMode, setMentorMode] = useState<MentorMode>('architect');
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(initialConceptId);
  const [inputMessage, setInputMessage] = useState<string>(initialPromptText || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('de_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: language === 'pt'
          ? '👋 Olá! Sou o seu **AI Data & Systems Mentor**.\n\nFui calibrado para responder dúvidas aprofundadas sobre **arquitetura de sistemas**, funcionamento em baixo nível (I/O, RAM, Shuffles, ACID), otimização de queries e preparação para **entrevistas técnicas de Big Tech**.\n\nEscolha um modo de mentoria acima ou use os atalhos rápidos abaixo para iniciarmos!'
          : '👋 Hello! I am your **AI Data & Systems Mentor**.\n\nI specialize in **system architecture**, low-level mechanics (I/O, RAM, Shuffles, ACID), query performance tuning, and **Big Tech technical interview** prep.\n\nSelect a mentor mode above or use the quick prompts below to begin!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_chat_history', JSON.stringify(messages));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const selectedConcept = selectedConceptId ? ALL_CONCEPTS.find((c) => c.id === selectedConceptId) : null;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conceptContext: selectedConcept ? { id: selectedConcept.id, name: selectedConcept.name } : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conceptId: selectedConcept?.id,
          conceptName: selectedConcept?.name,
          chatHistory: messages.slice(-6),
          mentorMode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: data.reply || data.explanation || 'Resposta recebida.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          conceptContext: selectedConcept ? { id: selectedConcept.id, name: selectedConcept.name } : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        sound.playSuccess();
        addXp(25, 'Pergunta Técnica Respondida pela IA (+25 XP)');
      } else {
        throw new Error('Server error');
      }
    } catch {
      const tailoredResponse = generateDynamicMentorResponse(text, selectedConcept?.name, mentorMode);
      const fallbackMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: tailoredResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conceptContext: selectedConcept ? { id: selectedConcept.id, name: selectedConcept.name } : undefined,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      sound.playSuccess();
      addXp(25, 'Pergunta Respondida pelo Mentor (+25 XP)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const welcomeMsg: ChatMessage = {
      id: `wlc_${Date.now()}`,
      sender: 'assistant',
      text: language === 'pt'
        ? 'Histórico limpo com sucesso! Qual tópico ou desafio de dados você quer desvendar agora?'
        : 'Chat history cleared! Which data system or challenge would you like to explore now?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
    setShowClearConfirm(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    const formattedTranscript = messages
      .map((m) => `### ${m.sender === 'user' ? '👤 Aluno' : '🤖 Mentor IA'} (${m.timestamp})\n${m.conceptContext ? `> Contexto: #${m.conceptContext.id} ${m.conceptContext.name}\n\n` : ''}${m.text}\n\n---\n`)
      .join('\n');

    const blob = new Blob([formattedTranscript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentoria_engenharia_de_dados_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentConcept = selectedConceptId ? ALL_CONCEPTS.find((c) => c.id === selectedConceptId) : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[calc(100vh-120px)] min-h-[560px] overflow-hidden">
      {/* 1. Header with Mode Switcher & Controls */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white font-mono">
                AI Data Systems Mentor
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-slate-400 text-xs hidden sm:block">
              {language === 'pt'
                ? 'Mentoria interativa sobre os 100 conceitos, arquitetura distribuída e preparação para entrevistas.'
                : 'Interactive mentoring across all 100 concepts, distributed architecture, and interview prep.'}
            </p>
          </div>
        </div>

        {/* Right side controls: Concept Anchor & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Concept Anchor Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedConceptId || ''}
              onChange={(e) => setSelectedConceptId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none max-w-[150px] sm:max-w-[180px] truncate font-mono"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                {language === 'pt' ? 'Geral (100 Conceitos)' : 'All 100 Concepts'}
              </option>
              {ALL_CONCEPTS.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  #{c.id} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Transcript */}
          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
            title="Exportar conversa em Markdown (.md)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              title="Limpar Histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-800 rounded-xl px-2 py-0.5 text-xs animate-fadeIn">
              <span className="text-[11px] text-rose-300">Limpar?</span>
              <button
                onClick={handleClearHistory}
                className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-500"
              >
                Sim
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white"
              >
                Não
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Persona Mode Selector Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[11px] font-mono text-slate-500 uppercase font-bold flex-shrink-0 hidden md:inline">
          Modo do Mentor:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'architect' as MentorMode, label: '🏛️ Arquiteto Principal', desc: 'Design, I/O e FinOps' },
            { id: 'code_review' as MentorMode, label: '💻 Code Tuning', desc: 'PySpark, SQL e OOM' },
            { id: 'interview' as MentorMode, label: '💼 Entrevista Big Tech', desc: 'STAR e System Design' },
            { id: 'feynman' as MentorMode, label: '🎓 Método Feynman', desc: 'Analogias Didáticas' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMentorMode(mode.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                mentorMode === mode.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Concept Focus Banner if selected */}
      {currentConcept && (
        <div className="bg-cyan-950/30 border-b border-cyan-900/40 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300 truncate">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">Contexto Ativo:</span>
            <span className="font-bold">#{currentConcept.id} {currentConcept.name}</span>
            <span className="text-slate-500 hidden sm:inline">— {currentConcept.tagline}</span>
          </div>
          <button
            onClick={() => setSelectedConceptId(null)}
            className="text-[11px] text-cyan-400 hover:text-cyan-200 underline flex-shrink-0 ml-2"
          >
            Remover Foco
          </button>
        </div>
      )}

      {/* 3. Messages Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold mt-1 ${
                isUser
                  ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 border border-slate-700 text-cyan-400'
              }`}>
                {isUser ? 'EU' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className="flex-1 space-y-2">
                <div className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed border transition-all ${
                  isUser
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-slate-950 text-slate-200 border-slate-800 shadow-xl'
                }`}>
                  {/* Context badge if present */}
                  {msg.conceptContext && (
                    <div className="mb-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <BookOpen className="w-3 h-3" />
                        #{msg.conceptContext.id} {msg.conceptContext.name}
                      </span>
                    </div>
                  )}

                  {/* Rich Rendered Message */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.text}</p>
                  ) : (
                    <RichMessageRenderer
                      content={msg.text}
                      onCopyCode={(code) => {
                        navigator.clipboard.writeText(code);
                        addXp(5, 'Snippet de Código Copiado');
                      }}
                    />
                  )}

                  {/* Footer with timestamp & copy button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-cyan-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
                        title="Copiar Resposta Completa"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Follow-up Quick Action Chips for Assistant Replies */}
                {!isUser && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
                    <button
                      onClick={() => handleSendMessage(`Explique isso com uma analogia simples e didática do cotidiano (Técnica de Feynman).`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-400" />
                      <span>Explicar com Analogia</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage(`Forneça a implementação prática em código de produção (PySpark ou SQL ANSI) para este caso.`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                    >
                      <Code2 className="w-3 h-3 text-cyan-400" />
                      <span>Ver Código PySpark/SQL</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage(`Quais são os trade-offs e impactos em custos na nuvem (FinOps) desta abordagem?`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span>Analisar Trade-offs & Custos</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Mentor processando arquitetura, I/O e diretrizes técnicas...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Categorized Prompt Suggestions Carousel */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0 font-bold">
          Sugestões:
        </span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(language === 'pt' ? p.questionPt : p.questionEn)}
            disabled={isLoading}
            className="text-[11px] font-mono whitespace-nowrap bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <span>{p.icon}</span>
            <span>{language === 'pt' ? p.labelPt : p.labelEn}</span>
          </button>
        ))}
      </div>

      {/* 5. Input Bar Form */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              placeholder={
                currentConcept
                  ? `Pergunte sobre #${currentConcept.id} ${currentConcept.name} no modo ${mentorMode.toUpperCase()}...`
                  : `Pergunte sobre arquitetura, Spark, Delta Lake, RAG, shuffles, SQL ou system design...`
              }
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-none max-h-32"
            />
            <div className="absolute right-3 bottom-2 text-[10px] font-mono text-slate-600 hidden sm:block">
              Enter ↵ para enviar
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20 flex-shrink-0"
          >
            <span>Enviar</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
