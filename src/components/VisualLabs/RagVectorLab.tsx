import React, { useState } from 'react';
import { Bot, Play, Search, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

interface KnowledgeChunk {
  id: number;
  title: string;
  category: string;
  text: string;
  vector: number[];
}

const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: 1,
    title: 'Tratamento de Data Skew com Salting',
    category: 'Spark',
    text: 'Data Skew no Spark é resolvido adicionando um prefixo ou sufixo aleatório (salting) na chave de partição para distribuir hot keys entre múltiplos executores, complementado pelo AQE skew join.',
    vector: [0.88, 0.12, -0.45, 0.65],
  },
  {
    id: 2,
    title: 'Formatos de Arquivo Colunar (Parquet e ZSTD)',
    category: 'Storage',
    text: 'Apache Parquet organiza dados em colunas com compressão Snappy ou ZSTD. Seu rodapé armazena metadados de min/max que viabilizam Data Skipping eficiente sem ler o arquivo todo.',
    vector: [0.15, 0.92, 0.33, -0.18],
  },
  {
    id: 3,
    title: 'Transações ACID e Time Travel no Lakehouse',
    category: 'Lakehouse',
    text: 'Formatos como Delta Lake e Apache Iceberg usam logs de transações atômicos para permitir isolamento snapshot, MERGE seguro e consultas retroativas com VERSION AS OF.',
    vector: [-0.32, 0.45, 0.89, 0.41],
  },
  {
    id: 4,
    title: 'Feature Store e Training-Serving Skew',
    category: 'MLOps',
    text: 'Feature Stores mantêm uma Offline Store para treino histórico e uma Online Store de baixíssima latência (Redis) para inferência, eliminando divergências de features em produção.',
    vector: [0.22, -0.31, 0.74, 0.85],
  },
];

function cosineSimilarity(v1: number[], v2: number[]): number {
  const dot = v1.reduce((sum, val, i) => sum + val * (v2[i] || 0), 0);
  const norm1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  return norm1 && norm2 ? dot / (norm1 * norm2) : 0;
}

export const RagVectorLab: React.FC = () => {
  const [query, setQuery] = useState<string>('Como resolver o problema de tarefas lentas por causa de hot keys no Spark?');
  const [topK, setTopK] = useState<number>(2);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<{ chunk: KnowledgeChunk; score: number }[]>([]);

  // Simulated query vector based on keyword presence
  const getQueryVector = (q: string): number[] => {
    const lower = q.toLowerCase();
    if (lower.includes('spark') || lower.includes('skew') || lower.includes('salting') || lower.includes('tarefas')) {
      return [0.85, 0.15, -0.40, 0.60];
    } else if (lower.includes('parquet') || lower.includes('colunar') || lower.includes('compressao')) {
      return [0.18, 0.89, 0.30, -0.20];
    } else if (lower.includes('lakehouse') || lower.includes('acid') || lower.includes('time travel') || lower.includes('delta')) {
      return [-0.30, 0.42, 0.87, 0.40];
    } else {
      return [0.20, -0.28, 0.70, 0.82];
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const qVec = getQueryVector(query);
      const scored = KNOWLEDGE_BASE.map((chunk) => ({
        chunk,
        score: Math.max(0, cosineSimilarity(qVec, chunk.vector)),
      })).sort((a, b) => b.score - a.score);

      setResults(scored.slice(0, topK));
      setIsSearching(false);
    }, 400);
  };

  const currentQVec = getQueryVector(query);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" /> Laboratório Visual 05 • Conceitos #81, #82, #83
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de RAG, Embeddings & Busca Vetorial</h3>
          <p className="text-slate-400 text-sm mt-1">
            Experimente o pipeline completo: vetorização da query, cálculo de Similaridade de Cosseno no Vector DB e injeção contextual no LLM.
          </p>
        </div>
      </div>

      {/* Query Input Section */}
      <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="text-xs font-mono uppercase text-slate-400 font-bold block">
          Pergunta do Usuário (Query de Entrada):
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500 font-sans"
            placeholder="Digite sua dúvida técnica..."
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> {isSearching ? 'Buscando...' : 'Executar RAG Pipeline'}
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] text-slate-500">Exemplos rápidos:</span>
          <button
            onClick={() => { setQuery('Como resolver o problema de tarefas lentas por causa de hot keys no Spark?'); }}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-fuchsia-300 px-2.5 py-1 rounded border border-slate-800 transition-colors"
          >
            Data Skew no Spark
          </button>
          <button
            onClick={() => { setQuery('Como funcionam os metadados do Parquet para pular arquivos?'); }}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-fuchsia-300 px-2.5 py-1 rounded border border-slate-800 transition-colors"
          >
            Parquet & Data Skipping
          </button>
          <button
            onClick={() => { setQuery('Como o Delta Lake garante ACID e rollback com Time Travel?'); }}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-fuchsia-300 px-2.5 py-1 rounded border border-slate-800 transition-colors"
          >
            ACID Lakehouse
          </button>
        </div>
      </div>

      {/* RAG Flow Steps */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 & 2: Embedding & Vector DB */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-bold mb-3">
              <span className="w-5 h-5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-[10px]">1</span>
              Vetor de Embedding da Query
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-fuchsia-300 mb-4">
              <span className="text-slate-500 block text-[10px] mb-1">Embedding denso (4 dimensões simplificadas):</span>
              [{currentQVec.map((n) => n.toFixed(2)).join(', ')}]
            </div>

            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-bold mb-2">
              <span className="w-5 h-5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center text-[10px]">2</span>
              Base de Conhecimento Vetorial
            </div>

            <div className="space-y-2">
              {KNOWLEDGE_BASE.map((chunk) => {
                const isSelected = results.some((r) => r.chunk.id === chunk.id);
                return (
                  <div
                    key={chunk.id}
                    className={`p-2.5 rounded-lg border text-xs font-sans transition-all ${
                      isSelected
                        ? 'bg-fuchsia-950/30 border-fuchsia-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-200">{chunk.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {chunk.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{chunk.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Top-K Retrieval Results */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[10px]">3</span>
              Chunks Recuperados (Top-{topK})
            </div>
            <span className="text-[10px] font-mono text-pink-300">Similaridade Cosseno</span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(({ chunk, score }) => (
                <div key={chunk.id} className="p-3 bg-pink-950/20 border border-pink-500/40 rounded-xl">
                  <div className="flex justify-between items-center mb-1 font-mono text-xs">
                    <span className="font-bold text-pink-300">{chunk.title}</span>
                    <span className="font-bold bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded text-[11px]">
                      {(score * 100).toFixed(1)}% match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{chunk.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl">
              Clique em "Executar RAG Pipeline" para computar similaridade e recuperar os chunks mais relevantes.
            </div>
          )}
        </div>

        {/* Step 4: Synthesized Prompt for the LLM */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-bold mb-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">4</span>
              Prompt Aumentado com Contexto (Grounding)
            </div>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-72">
              <span className="text-emerald-400 block font-bold mb-1">// Prompt final enviado para o LLM:</span>
              <span className="text-slate-500">"Você é um tutor técnico. Responda baseado ESTRITAMENTE no contexto:</span>
              <div className="my-2 p-2 bg-slate-950 rounded border border-slate-800 text-yellow-300/90">
                [CONTEXTO RECUPERADO]:
                {results.map((r, i) => `\nDoc ${i + 1}: ${r.chunk.text}`).join('\n')}
              </div>
              <span className="text-cyan-400">Pergunta: "{query}"</span>
              <br />
              <span className="text-slate-400">Resposta Fundamentada:"</span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Zero alucinação: o modelo responde com citação direta dos documentos do Vector DB!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
