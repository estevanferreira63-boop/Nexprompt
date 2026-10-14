import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  Play,
  RotateCcw,
  BookOpen,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  Code2,
  Download,
  Share2,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Cpu,
  ArrowRight,
  Database,
  Terminal,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

export interface PromptTemplate {
  id: string;
  category: 'architecture' | 'coding' | 'data' | 'ai_rag' | 'business' | 'creative';
  categoryLabel: string;
  title: string;
  description: string;
  role: string;
  context: string;
  task: string;
  constraints: string;
  outputFormat: string;
  fewShot?: string;
  tags: string[];
}

const CURATED_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl_staff_arch',
    category: 'architecture',
    categoryLabel: 'Arquitetura de Sistemas',
    title: 'Design de Sistema Distribuído para 100k RPS',
    description: 'Estruturação socrática de arquitetura com cálculo de I/O, partição e tolerância a falhas.',
    role: 'Staff Systems Architect & Principal Cloud Engineer',
    context: 'Estamos redesenhando a camada de ingestão de eventos da nossa plataforma. Esperamos um pico de 100.000 eventos/segundo com SLA de persistência em < 200ms.',
    task: 'Projete uma arquitetura em 4 camadas (Ingestão, Buffer/Stream, Processamento e Serving) indicando tecnologias recomendadas, cálculos de throughput e estratégias de particionamento.',
    constraints: '1. Não sugira soluções de vendor-lock sem justificar a alternativa open-source.\n2. Aponte explicitamente os pontos únicos de falha (SPOF) e como mitigá-los.\n3. Calcule estimativa de custos de tráfego de rede (egress/ingress).',
    outputFormat: 'Diagrama textual em blocos ASCII/Markdown, seguido pela especificação técnica de cada camada e matriz de riscos com mitigação.',
    fewShot: 'Exemplo de métrica exigida: "Buffer Kafka: 3 brokers c5.2xlarge sustentando 85 MB/s de write com replication factor = 3".',
    tags: ['Arquitetura', 'Streaming', 'Alta Escala', 'FinOps'],
  },
  {
    id: 'tpl_code_refactor',
    category: 'coding',
    categoryLabel: 'Engenharia de Software',
    title: 'Refatoração Crítica & Otimização de Performance',
    description: 'Transforma código imperativo lento em pipelines eficientes com benchmarks e testes unitários.',
    role: 'Principal Software Engineer & Algorithmic Specialist',
    context: 'Uma rotina crítica de processamento em lote em Python/PySpark está causando gargalo e alto uso de memória (OOM).',
    task: 'Refatore o código para reduzir o consumo de memória em no mínimo 60% e acelerar a execução, aplicando vetorização e evitando coletas desnecessárias para a máquina local.',
    constraints: '1. O código deve ser 100% tipado com Type Hints modernos.\n2. Forneça testes unitários com pytest para cobrir casos de borda (dados nulos e arrays vazios).\n3. Inclua comentários explicativos nas linhas onde a melhoria de performance ocorre.',
    outputFormat: '1. Análise da complexidade de tempo/espaço (Big-O)\n2. Código refatorado completo e pronto para produção\n3. Suíte de testes unitários com asserções rigorosas.',
    tags: ['Python', 'Performance', 'Refatoração', 'Testes'],
  },
  {
    id: 'tpl_sql_tuning',
    category: 'data',
    categoryLabel: 'Bancos de Dados & SQL',
    title: 'Tuning Extremo de Query SQL Analítica',
    description: 'Elimina full table scans, converte subconsultas em Window Functions e projeta índices/partições.',
    role: 'Lead Database Administrator & Query Optimization Expert',
    context: 'Uma consulta SQL analítica em BigQuery/Snowflake sobre 500 milhões de registros está demorando 12 minutos e consumindo cota excessiva de computação.',
    task: 'Reescreva a consulta aplicando poda de partições, Window Functions e eliminação de joins em leque (fan-out joins).',
    constraints: '1. Mantenha 100% de paridade com o resultado lógico da query original.\n2. Não use tabelas temporárias se uma CTE ou Window Function puder resolver em memória.\n3. Explique a economia estimada de bytes escaneados.',
    outputFormat: '1. Query reescrita e formatada em SQL ANSI\n2. Tabela comparativa "Antes vs Depois"\n3. Recomendações de Particionamento e Clusterização DDL.',
    tags: ['SQL', 'BigQuery', 'Otimização', 'Custos'],
  },
  {
    id: 'tpl_rag_strict',
    category: 'ai_rag',
    categoryLabel: 'Inteligência Artificial & RAG',
    title: 'Agente RAG com Zero Alucinação e Citações Estritas',
    description: 'Prompt de sistema blindado com salvaguardas que impedem a IA de extrapolar o contexto recuperado.',
    role: 'Strict Information Retrieval & Grounded AI Agent',
    context: 'Você opera integrado a uma base de conhecimento corporativa via Vector Database.',
    task: 'Responda à pergunta do usuário utilizando ÚNICA E EXCLUSIVAMENTE as evidências presentes nos trechos de contexto recuperados.',
    constraints: '1. É EXPRESSAMENTE PROIBIDO supor, extrapolar ou usar conhecimentos prévios não documentados.\n2. Se o contexto não contiver a resposta com 100% de certeza, declare imediatamente: "As fontes fornecidas não possuem dados suficientes para responder a esta solicitação."\n3. Para toda informação declarada, anexe a citação da fonte no formato [Fonte: ID_DO_CHUNK, Pág X].',
    outputFormat: 'Resposta concisa em tópicos numerados, acompanhada da lista de fontes auditáveis utilizadas.',
    tags: ['RAG', 'Vector DB', 'Groundedness', 'Anti-Hallucination'],
  },
  {
    id: 'tpl_business_strategy',
    category: 'business',
    categoryLabel: 'Negócios & Estratégia',
    title: 'Análise Estratégica Executiva e Modelo de Decisão',
    description: 'Estruturação de recomendação executiva para C-Level com análise de ROI e riscos de implementação.',
    role: 'Chief Technology Officer (CTO) & Strategic Enterprise Advisor',
    context: 'Nossa empresa está avaliando migrar a infraestrutura de dados local (on-premises) para uma arquitetura Lakehouse moderna totalmente gerenciada em nuvem.',
    task: 'Desenvolva um memorando executivo de decisão com matriz de trade-offs, projeção de ROI em 3 anos e cronograma de transição sem downtime.',
    constraints: '1. Adote o formato de comunicação "Executive Summary first" (BLUF - Bottom Line Up Front).\n2. Aborde riscos de segurança da informação, conformidade LGPD/GDPR e requalificação da equipe.\n3. Linguagem sóbria, objetiva e orientada a métricas financeiras.',
    outputFormat: '1. Resumo Executivo (1 parágrafo com a recomendação chave)\n2. Análise Financeira (Custos CapEx vs OpEx)\n3. Matriz de Riscos e Cronograma em Fases.',
    tags: ['Estratégia', 'C-Level', 'FinOps', 'ROI'],
  },
  {
    id: 'tpl_creative_copy',
    category: 'creative',
    categoryLabel: 'Conteúdo Técnico & Artigos',
    title: 'Artigo Técnico Aprofundado de Engenharia (Estilo Tech Blog)',
    description: 'Gera publicações no padrão dos blogs de engenharia da Netflix, Uber ou Databricks.',
    role: 'Staff Technical Writer & Principal Engineering Evangelist',
    context: 'Queremos publicar um artigo no blog de engenharia da empresa explicando como resolvemos um incidente complexo de concorrência de escrita no Lakehouse.',
    task: 'Escreva um artigo técnico engajador e aprofundado, cobrindo o problema inicial, o diagnóstico com primeiros princípios e a arquitetura da solução implementada.',
    constraints: '1. Tom profissional, respeitoso e intelectualmente estimulante (sem sensacionalismo ou buzzwords vazias).\n2. Inclua diagramas conceituais em texto e snippets de configuração realistas.\n3. Estruture para leitura dinâmica com subtítulos claros.',
    outputFormat: 'Artigo completo em Markdown pronto para publicação, com introdução, lições aprendidas e conclusão.',
    tags: ['Artigos', 'Tech Blog', 'Didático', 'Storytelling'],
  },
];

interface FrameworkGuide {
  id: string;
  name: string;
  badge: string;
  description: string;
  structure: string;
}

const FRAMEWORKS: FrameworkGuide[] = [
  {
    id: 'costar',
    name: 'CO-STAR (Padrão de Ouro)',
    badge: 'Recomendado',
    description: 'Context, Objective, Style, Tone, Audience, Response format. Garante alinhamento total.',
    structure: 'Contexto · Objetivo · Estilo · Tom · Público-Alvo · Formato de Resposta',
  },
  {
    id: 'rtf',
    name: 'RTF (Rápido e Preciso)',
    badge: 'Prático',
    description: 'Role, Task, Format. Ideal para tarefas diretas de código, consultas e análises.',
    structure: 'Papel do Especialista · Tarefa Principal · Formato de Entrega',
  },
  {
    id: 'cot',
    name: 'Chain-of-Thought (Cadeia de Raciocínio)',
    badge: 'Lógica Complexa',
    description: 'Obriga a IA a pensar passo a passo antes de concluir, evitando alucinações e erros lógicos.',
    structure: 'Passo 1: Entendimento · Passo 2: Decomposição · Passo 3: Solução Fundamentada',
  },
  {
    id: 'fewshot',
    name: 'Few-Shot (Aprendizado por Exemplos)',
    badge: 'Consistência Máxima',
    description: 'Fornece 1 ou 2 exemplos de entrada/saída para a IA seguir exatamente o padrão esperado.',
    structure: 'Entrada Exemplo → Saída Esperada → Sua Entrada Atual',
  },
];

export const PromptStudioView: React.FC<{
  onOpenChatWithPrompt?: (promptText: string) => void;
}> = ({ onOpenChatWithPrompt }) => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  // Mode: 'builder' (guided wizard) | 'optimizer' (fast AI refiner) | 'library' (templates)
  const [activeMode, setActiveMode] = useState<'builder' | 'optimizer' | 'library'>('builder');

  // Builder States
  const [role, setRole] = useState<string>('Staff Data & AI Systems Engineer');
  const [context, setContext] = useState<string>(
    'Estamos desenhando uma esteira de dados analítica de alto volume processando eventos em streaming e gerando métricas em tempo real.'
  );
  const [task, setTask] = useState<string>(
    'Desenvolva a especificação técnica completa, apontando componentes de ingestão, partição física, tratamento de skew e formato de armazenamento colunar.'
  );
  const [constraints, setConstraints] = useState<string>(
    '1. Não assuma infraestrutura proprietária sem justificar custos.\n2. Forneça exemplos práticos de código/configuração.\n3. Trate explicitamente possíveis falhas e reprocessamento.'
  );
  const [outputFormat, setOutputFormat] = useState<string>(
    'Documento técnico em Markdown com seções hierárquicas, diagramas conceituais em texto e tabelas de trade-offs.'
  );
  const [fewShot, setFewShot] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('costar');

  // AI Optimizer States
  const [rawPromptInput, setRawPromptInput] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationGoal, setOptimizationGoal] = useState<string>('Tornar profissional com rigor de engenharia e sem alucinação');

  // Live Test States
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testMetrics, setTestMetrics] = useState<{ latencyMs: number; estimatedTokens: number; qualityScore: number } | null>(null);

  // General States
  const [copied, setCopied] = useState<boolean>(false);
  const [generatedPromptText, setGeneratedPromptText] = useState<string>('');
  const [customPromptEdited, setCustomPromptEdited] = useState<boolean>(false);

  // Re-assemble generated prompt whenever fields change (unless manually edited)
  React.useEffect(() => {
    if (customPromptEdited) return;

    const assembled = `Você atuará com o papel de: ${role}.
Framework de Engenharia de Prompt: ${selectedFramework.toUpperCase()}.

<contexto>
${context}
</contexto>

<tarefa_principal>
${task}
</tarefa_principal>

<regras_e_restricoes_estritas>
${constraints}
- NUNCA invente parâmetros ou fatos não embasados; declare premissas com clareza.
- Realize raciocínio interno passo a passo antes de emitir a resposta final.
</regras_e_restricoes_estritas>

<formato_de_saida>
${outputFormat}
</formato_de_saida>${
      fewShot.trim()
        ? `\n\n<exemplos_de_referencia_few_shot>\n${fewShot}\n</exemplos_de_referencia_few_shot>`
        : ''
    }

Inicie a resposta com a execução rigorosa das instruções acima.`;

    setGeneratedPromptText(assembled);
  }, [role, context, task, constraints, outputFormat, fewShot, selectedFramework, customPromptEdited]);

  // Prompt Health Score Calculation
  const healthScore = React.useMemo(() => {
    let score = 0;
    if (role.trim().length >= 10) score += 20;
    if (context.trim().length >= 30) score += 20;
    if (task.trim().length >= 25) score += 25;
    if (constraints.trim().length >= 25) score += 20;
    if (outputFormat.trim().length >= 15) score += 15;
    return Math.min(score, 100);
  }, [role, context, task, constraints, outputFormat]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPromptText);
    setCopied(true);
    sound.playSuccess();
    addXp(10, 'Prompt Profissional Copiado (+10 XP)');
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadPrompt = () => {
    const blob = new Blob([generatedPromptText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prompt_profissional_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    sound.playClick();
  };

  const handleOptimizeWithAI = async () => {
    const inputToOptimize = activeMode === 'optimizer' ? rawPromptInput : generatedPromptText;
    if (!inputToOptimize.trim() || isOptimizing) return;

    setIsOptimizing(true);
    sound.playClick();

    try {
      const res = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: inputToOptimize,
          goal: optimizationGoal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const optimized = data.optimizedPrompt || data.reply || inputToOptimize;
        setGeneratedPromptText(optimized);
        setCustomPromptEdited(true);
        sound.playSuccess();
        addXp(30, 'Prompt Otimizado por IA (+30 XP)');
      }
    } catch {
      // Fallback enhancement
      const fallbackOptimized = `Você é um Especialista Sênior no domínio requisitado.

<contexto_e_enquadramento>
${inputToOptimize}
</contexto_e_enquadramento>

<instrucoes_de_execucao>
1. Decomponha o problema em primeiros princípios antes de fornecer a recomendação.
2. Identifique os trade-offs e métricas de desempenho chave.
3. Forneça exemplos práticos e aplicáveis sem rodeios.
</instrucoes_de_execucao>

<restricoes_estritas>
- NUNCA invente termos fictícios ou parâmetros inexistentes.
- Garanta precisão técnica cirúrgica.
</restricoes_estritas>

<formato_de_entrega>
Markdown estruturado com tópicos, tabelas comparativas e código pronto para uso.
</formato_de_entrega>`;
      setGeneratedPromptText(fallbackOptimized);
      setCustomPromptEdited(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunLiveTest = async () => {
    if (!generatedPromptText.trim() || isTesting) return;

    setIsTesting(true);
    setTestResult(null);
    setTestMetrics(null);
    sound.playClick();

    try {
      const res = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: generatedPromptText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data.output);
        setTestMetrics(data.metrics || { latencyMs: 420, estimatedTokens: 350, qualityScore: 95 });
        sound.playSuccess();
        addXp(25, 'Teste do Prompt Executado com Sucesso (+25 XP)');
      }
    } catch {
      setTestResult('Não foi possível obter resposta do servidor no momento. Verifique a conexão.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleApplyTemplate = (tpl: PromptTemplate) => {
    setRole(tpl.role);
    setContext(tpl.context);
    setTask(tpl.task);
    setConstraints(tpl.constraints);
    setOutputFormat(tpl.outputFormat);
    setFewShot(tpl.fewShot || '');
    setCustomPromptEdited(false);
    setActiveMode('builder');
    sound.playSuccess();
    addXp(15, `Template Carregado: ${tpl.title} (+15 XP)`);
  };

  const handleResetToDefault = () => {
    setCustomPromptEdited(false);
    setRole('Staff Data & AI Systems Engineer');
    setContext('Estamos desenhando uma esteira de dados analítica de alto volume processando eventos em streaming e gerando métricas em tempo real.');
    setTask('Desenvolva a especificação técnica completa, apontando componentes de ingestão, partição física, tratamento de skew e formato de armazenamento colunar.');
    setConstraints('1. Não assuma infraestrutura proprietária sem justificar custos.\n2. Forneça exemplos práticos de código/configuração.\n3. Trate explicitamente possíveis falhas e reprocessamento.');
    setOutputFormat('Documento técnico em Markdown com seções hierárquicas, diagramas conceituais em texto e tabelas de trade-offs.');
    setFewShot('');
    setTestResult(null);
    setTestMetrics(null);
    sound.playClick();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner & Mode Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Wand2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Estúdio de Engenharia de Prompts Pro
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Construa Prompts Profissionais para IA com Estrutura de Elite
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Elimine alucinações, especifique personas calibradas, use frameworks industriais (CO-STAR, RTF, Few-Shot) e teste seus prompts em tempo real com o motor Gemini 3.8 Flash.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-center flex-wrap gap-1">
            <button
              onClick={() => setActiveMode('builder')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                activeMode === 'builder'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Construtor Guiado</span>
            </button>

            <button
              onClick={() => setActiveMode('optimizer')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                activeMode === 'optimizer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Refinador Inteligente</span>
            </button>

            <button
              onClick={() => setActiveMode('library')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
                activeMode === 'library'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Galeria de Elite ({CURATED_TEMPLATES.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Studio Work Area: Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Creator Tools (Guided Builder / Optimizer / Library) */}
        <div className="lg:col-span-7 space-y-6">
          {/* MODE A: GUIDED BUILDER */}
          {activeMode === 'builder' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold text-white">
                    Parâmetros Estruturais do Prompt
                  </h2>
                </div>
                <button
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1 transition-colors"
                  title="Restaurar valores padrão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
              </div>

              {/* Framework Selector Pills */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  1. Framework de Prompting
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FRAMEWORKS.map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedFramework === fw.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold">{fw.name.split(' ')[0]}</span>
                        <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">
                          {fw.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {fw.structure}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                {/* 1. Persona / Role */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>2. Papel / Persona do Especialista</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Quem a IA representará</span>
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Ex: Staff Data Architect & Distributed Systems Specialist"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Staff Systems Architect',
                      'Principal Data Engineer',
                      'Staff AI / MLOps Specialist',
                      'Query Optimization Guru',
                      'Chief Technology Officer',
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setRole(sug);
                          setCustomPromptEdited(false);
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-blue-300 border border-slate-800 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Context & Input Data */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      3. Contexto & Dados de Entrada
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Cenário, tecnologia e métricas atuais</span>
                  </div>
                  <textarea
                    rows={3}
                    value={context}
                    onChange={(e) => {
                      setContext(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Descreva o contexto, volume de dados, stack tecnológica atual e restrições de negócio..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all leading-relaxed font-sans"
                  />
                </div>

                {/* 3. Objective & Task */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      4. Tarefa Principal & Entregáveis
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">O que exatamente a IA deve realizar</span>
                  </div>
                  <textarea
                    rows={3}
                    value={task}
                    onChange={(e) => {
                      setTask(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Especifique a meta clara e as etapas necessárias..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all leading-relaxed font-sans"
                  />
                </div>

                {/* 4. Strict Constraints & Negative Rules */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>5. Restrições Estritas & Salvaguardas</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">O que a IA NÃO DEVE fazer</span>
                  </div>
                  <textarea
                    rows={3}
                    value={constraints}
                    onChange={(e) => {
                      setConstraints(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Regras de segurança, proibições de alucinação, restrições orçamentárias..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all leading-relaxed font-sans"
                  />
                </div>

                {/* 5. Output Format */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      6. Formato de Saída Exigido
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Ex: JSON Schema, Markdown, Código</span>
                  </div>
                  <input
                    type="text"
                    value={outputFormat}
                    onChange={(e) => {
                      setOutputFormat(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Ex: Tabela comparativa em Markdown seguida por código executável com docstrings..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono"
                  />
                </div>

                {/* 6. Optional Few-Shot Examples */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      7. Exemplos de Referência (Few-Shot - Opcional)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Aumenta precisão em até 40%</span>
                  </div>
                  <textarea
                    rows={2}
                    value={fewShot}
                    onChange={(e) => {
                      setFewShot(e.target.value);
                      setCustomPromptEdited(false);
                    }}
                    placeholder="Insira um modelo de pergunta e resposta ideal para guiar a IA..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE B: AI OPTIMIZER */}
          {activeMode === 'optimizer' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold text-white">
                    Refinador Inteligente com Gemini 3.8 Flash
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Escreva um rascunho de prompt comum e nossa IA o transformará instantaneamente em uma diretriz estruturada de nível Staff/Principal com tags XML e salvaguardas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    Seu Prompt Atual ou Ideia Básica
                  </label>
                  <textarea
                    rows={5}
                    value={rawPromptInput}
                    onChange={(e) => setRawPromptInput(e.target.value)}
                    placeholder="Ex: Como eu faço para particionar uma tabela enorme no delta lake e evitar arquivos pequenos?"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all leading-relaxed font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                    Objetivo do Refinamento
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      'Eliminar alucinações e exigir fontes',
                      'Transformar em padrão Staff Engineer',
                      'Exigir código pronto com testes unitários',
                    ].map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setOptimizationGoal(g)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          optimizationGoal === g
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleOptimizeWithAI}
                  disabled={!rawPromptInput.trim() || isOptimizing}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>{isOptimizing ? 'Refinando Prompt com Gemini 3.8...' : 'Otimizar & Expandir Prompt com IA'}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE C: CURATED TEMPLATES LIBRARY */}
          {activeMode === 'library' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold text-white">
                    Biblioteca de Prompts de Elite para Produção
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Modelos rigorosamente testados para arquitetura distribuída, code review, RAG e tomada de decisão estratégica.
                </p>
              </div>

              <div className="space-y-4">
                {CURATED_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
                          {tpl.categoryLabel}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">
                          {tpl.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyTemplate(tpl)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 flex-shrink-0"
                      >
                        <span>Carregar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-slate-300 line-clamp-2">
                      <strong className="text-blue-400">Persona:</strong> {tpl.role}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tpl.tags.map((tg, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generated Prompt Preview, Health Score & Live Test Execution */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* 1. Prompt Health Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Pontuação de Eficácia do Prompt
                </span>
              </div>
              <span className={`text-sm font-mono font-black ${
                healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {healthScore}/100
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  healthScore >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                    : healthScore >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-slate-600 to-slate-400'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={role.length > 5 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>✓</span>
                <span>Persona Definida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={context.length > 20 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>✓</span>
                <span>Contexto Delimitado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={constraints.length > 20 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>✓</span>
                <span>Regras Negativas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={outputFormat.length > 10 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>✓</span>
                <span>Formato de Saída</span>
              </div>
            </div>
          </div>

          {/* 2. Assembled Output Viewer */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Prompt Final Montado
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownloadPrompt}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                  title="Baixar em Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prompt Codebox */}
            <div className="relative">
              <textarea
                value={generatedPromptText}
                onChange={(e) => {
                  setGeneratedPromptText(e.target.value);
                  setCustomPromptEdited(true);
                }}
                rows={14}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-blue-200 leading-relaxed focus:outline-none focus:border-blue-500 resize-y selection:bg-blue-500 selection:text-slate-950"
              />
            </div>

            {/* Quick Actions Footer: Test with AI or Send to Mentor Chat */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRunLiveTest}
                disabled={isTesting || !generatedPromptText.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 fill-current ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Executando Teste no Gemini 3.8...' : 'Testar Prompt com IA Agora'}</span>
              </button>

              {onOpenChatWithPrompt && (
                <button
                  onClick={() => onOpenChatWithPrompt(generatedPromptText)}
                  className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>Enviar para Chat com Mentor de IA</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Live Test Result Output Box (if tested) */}
          {testResult && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                    Resposta da IA ao Seu Prompt
                  </span>
                </div>
                {testMetrics && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{testMetrics.latencyMs}ms</span>
                    <span>·</span>
                    <span>~{testMetrics.estimatedTokens} tokens</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-80 overflow-y-auto text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
                {testResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
