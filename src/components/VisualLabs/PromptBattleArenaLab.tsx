import React, { useState } from 'react';
import {
  Swords,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Play,
  Copy,
  Check,
  ShieldAlert,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { sound } from '../../utils/soundEffects';

interface BattleScenario {
  id: string;
  title: string;
  goal: string;
  testInput: string;
}

const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: 'sql_etl',
    title: 'Geração de Pipeline SQL sem Alucinação de Colunas',
    goal: 'Escrever uma query analítica calculando receita por cliente sem inventar campos que não existem na tabela.',
    testInput: 'Tabela: orders (id, customer_id, order_date, amount, status). Calcule ticket médio de 2026.',
  },
  {
    id: 'pii_extractor',
    title: 'Extração Estruturada de PII em JSON Puro',
    goal: 'Extrair entidades sensíveis em formato JSON Schema estrito sem adicionar texto introdutório ou markdown extra.',
    testInput: 'Texto: "Cliente João Silva, CPF 123.456.789-00, solicitou reembolso de R$ 450 no cartão final 4291."',
  },
  {
    id: 'react_agent',
    title: 'Raciocínio ReAct (Thought → Action → Observation)',
    goal: 'Planejar consultas recursivas para investigar pico de latência no Kafka sem looping infinito.',
    testInput: 'Alerta: p99 latency subiu para 14.2s no tópico telemetry-events. Partição 3 acumula 80k lag.',
  },
];

export const PromptBattleArenaLab: React.FC = () => {
  const { language } = useLanguage();
  const { addXp } = useGamification();

  const [selectedScenario, setSelectedScenario] = useState<BattleScenario>(BATTLE_SCENARIOS[0]);
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [battleCompleted, setBattleCompleted] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const PROMPT_CONTENDERS = [
    {
      name: 'Lutador A: Zero-Shot Ingênuo',
      subtitle: 'Sem persona, sem restrições negativas, alta taxa de alucinação',
      color: 'from-slate-700 to-slate-800 border-slate-700 text-slate-300',
      prompt: `Escreva o código SQL para o cálculo solicitado: ${selectedScenario.testInput}`,
      hallucinationRate: '34%',
      schemaScore: '68/100',
      tokenCost: '$0.0004',
      verdict: 'Alucinou coluna "client_name" e incluiu preâmbulo "Aqui está sua query: ..."',
    },
    {
      name: 'Lutador B: Few-Shot + Chain-of-Thought',
      subtitle: 'Exemplo positivo de entrada/saída + raciocínio passo a passo',
      color: 'from-blue-900/60 to-indigo-900/60 border-blue-600/50 text-blue-200',
      prompt: `Você é um Staff Data Engineer. Analise o schema fornecido passo a passo:
<context>
${selectedScenario.testInput}
</context>
1. Verifique as colunas disponíveis.
2. Formule a cláusula WHERE para filtros temporais.
3. Use apenas as colunas informadas.`,
      hallucinationRate: '8%',
      schemaScore: '92/100',
      tokenCost: '$0.0012',
      verdict: 'Excelente lógica e conformidade, mas consumiu mais tokens de raciocínio intermediário.',
    },
    {
      name: 'Lutador C: XML Grounding + Guardrails Estritos',
      subtitle: 'Tags delimitadas, restrição negativa explícita e saída em JSON/SQL puro',
      color: 'from-emerald-950/70 to-cyan-950/70 border-emerald-500/60 text-emerald-200',
      prompt: `<system_instructions>
Você é um gerador de código determinístico.
REGRA INVIOLÁVEL: É expressamente proibido referenciar qualquer coluna que não conste na tag <schema>.
SAÍDA: Emita APENAS o bloco de código puro, sem introduções ou explicações.
</system_instructions>
<schema>
${selectedScenario.testInput}
</schema>`,
      hallucinationRate: '1.2%',
      schemaScore: '99/100',
      tokenCost: '$0.0007',
      verdict: 'Campeão da Arena: zero alucinações, parse direto em CI/CD sem quebra de pipeline.',
    },
  ];

  const handleRunBattle = () => {
    setIsBattling(true);
    setBattleCompleted(false);
    sound.playClick();

    setTimeout(() => {
      setIsBattling(false);
      setBattleCompleted(true);
      sound.playSuccess();
      addXp(25, 'Batalha de Prompts Concluída com Sucesso (+25 XP)');
    }, 1200);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    sound.playClick();
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-fuchsia-950/40 to-slate-900 p-5 rounded-2xl border border-fuchsia-900/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Swords className="w-4 h-4 text-fuchsia-400" />
              <span>Laboratório #16 · Arena de Avaliação de IA & Prompt Engineering</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Batalha de Prompts: Zero-Shot vs CoT vs XML Guardrails
            </h3>
            <p className="text-slate-300 text-xs mt-1 max-w-3xl leading-relaxed">
              Compare 3 estratégias de engenharia de prompts lado a lado. Avalie taxas de alucinação,
              aderência a contratos de saída (JSON/SQL) e custo financeiro de tokens em escala de produção.
            </p>
          </div>

          <button
            onClick={handleRunBattle}
            disabled={isBattling}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-500/25"
          >
            <Play className={`w-3.5 h-3.5 ${isBattling ? 'animate-spin' : ''}`} />
            <span>{isBattling ? 'Avaliando Modelos...' : 'Batalhar Prompts'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Picker */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase">
          Selecione o Cenário de Avaliação (Benchmark Scenario):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {BATTLE_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setBattleCompleted(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedScenario.id === sc.id
                  ? 'bg-fuchsia-950/60 border-fuchsia-500 text-white shadow'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-mono font-bold text-xs">{sc.title}</div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{sc.goal}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Arena Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROMPT_CONTENDERS.map((contender, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border bg-gradient-to-b ${contender.color} flex flex-col justify-between space-y-4 relative shadow-lg`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-black text-white">{contender.name}</span>
                {idx === 2 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold font-mono">
                    ★ RECOMENDADO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{contender.subtitle}</p>

              {/* Prompt Codebox */}
              <div className="mt-3 relative">
                <pre className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {contender.prompt}
                </pre>
                <button
                  onClick={() => handleCopy(contender.prompt, idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copiar prompt"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Metrics & Verdict */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Taxa de Alucinação:</span>
                <span className={idx === 2 ? 'text-emerald-400 font-black' : idx === 1 ? 'text-blue-400 font-bold' : 'text-rose-400 font-bold'}>
                  {contender.hallucinationRate}
                </span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Aderência ao Schema:</span>
                <span className="text-white font-bold">{contender.schemaScore}</span>
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Custo Estimado / Req:</span>
                <span className="text-slate-300">{contender.tokenCost}</span>
              </div>

              {battleCompleted && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 animate-fadeIn font-sans">
                  <strong>Veredito:</strong> {contender.verdict}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
