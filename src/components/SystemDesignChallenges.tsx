import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Trophy, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGamification } from '../context/GamificationContext';

interface DesignChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Intermediário' | 'Avançado' | 'Especialista';
  scenario: string;
  options: {
    letter: string;
    description: string;
    isOptimal: boolean;
    tradeoffs: string;
    explanation: string;
  }[];
  architecturalInsight: string;
}

const CHALLENGES: DesignChallenge[] = [
  {
    id: 'ch-1',
    title: 'Desafio 1: Ingestão de 100.000 Eventos/Seg com Deduplicação',
    category: 'Streaming & Ingestão',
    difficulty: 'Avançado',
    scenario:
      'Uma fintech em crescimento precisa processar 100k transações Pix por segundo em streaming contínuo. ' +
      'A rede do Banco Central pode reenviar eventos duplicados em rajadas (At-Least-Once). Os analistas precisam ' +
      'de métricas com atraso máximo de 5 segundos e zero duplicatas nos relatórios financeiros.',
    options: [
      {
        letter: 'A',
        description: 'Gravar direto no PostgreSQL transacional usando INSERT ON CONFLICT DO UPDATE em lote a cada 100ms.',
        isOptimal: false,
        tradeoffs: 'O PostgreSQL entrará em colapso de I/O e contenção de locks de página com 100.000 writes/segundo.',
        explanation: 'Bancos OLTP relacionais não foram desenhados para sustentar 100k gravações concorrentes por segundo sem degradar completamente.',
      },
      {
        letter: 'B',
        description: 'Apache Kafka particionado por chave_transacao -> Spark Structured Streaming (micro-batch de 3s) -> Delta Lake com checkpointing e MERGE incremental deduplicado por ID.',
        isOptimal: true,
        tradeoffs: 'Adiciona ~3 segundos de latência (micro-batch), mas entrega throughput maciço, tolerância a falhas e ACID com custo computacional previsível.',
        explanation: 'Esta é a arquitetura padrão da indústria: Kafka absorve os picos de tráfego e o Delta Lake garante Exactly-Once atômico via logs de transação.',
      },
      {
        letter: 'C',
        description: 'Enviar direto para um bucket S3 gravando 1 arquivo JSON por evento, usando Airflow agendado a cada 1 minuto para consolidar.',
        isOptimal: false,
        tradeoffs: 'Gera 6 milhões de micro-arquivos por minuto no S3 (Small Files Nightmare) e custará milhares de dólares em chamadas HTTP PUT.',
        explanation: 'Criar milhões de micro-arquivos causa o pior colapso de metadados possível na nuvem e o Airflow não suporta agendamento sub-minuto.',
      },
    ],
    architecturalInsight:
      'Em alta escala, o desacoplamento via broker de log (Kafka) com micro-batches idempotentes no Lakehouse é imbatível. ' +
      'A garantia de Exactly-Once é alcançada combinando At-Least-Once na transmissão com Idempotência na gravação.',
  },
  {
    id: 'ch-2',
    title: 'Desafio 2: Job Spark Travado por Data Skew na Chave de Cliente',
    category: 'Spark & Distribuído',
    difficulty: 'Avançado',
    scenario:
      'Um pipeline diário no Databricks que une 500 milhões de pedidos com uma tabela de clientes está levando 3 horas e falhando com ' +
      '"Container killed by YARN for exceeding memory limits". Na Spark UI, 199 tarefas terminam em 10 segundos e a tarefa 200 processa ' +
      '95% dos dados porque o ID "000000" (clientes não cadastrados) acumula 80 milhões de linhas.',
    options: [
      {
        letter: 'A',
        description: 'Aumentar a memória do executor de 16GB para 128GB e o tempo de timeout do heartbeat para 1 hora.',
        isOptimal: false,
        tradeoffs: 'Custo na nuvem quadruplica e a tarefa continuará rodando em apenas 1 CPU core enquanto as outras 199 CPUs do cluster ficam ociosas.',
        explanation: 'Escalar verticalmente (mais RAM) mascara o problema sem resolver a assimetria: o paralelismo continua destruído.',
      },
      {
        letter: 'B',
        description: 'Aplicar a técnica de Salting: filtrar os IDs nulos/padrão separadamente OU concatenar um número aleatório (0 a 9) na chave de skew e duplicar a dimensão com 10 réplicas antes do JOIN.',
        isOptimal: true,
        tradeoffs: 'Aumenta ligeiramente o tamanho da tabela menor no join, mas redistribui a hot key entre 10 executores perfeitamente em paralelo, reduzindo o tempo para 2 minutos.',
        explanation: 'O Salting espalha a chave gigante entre múltiplos nós do cluster, restaurando o paralelismo e eliminando o OutOfMemory.',
      },
      {
        letter: 'C',
        description: 'Chamar df.repartition(1000) imediatamente antes do join.',
        isOptimal: false,
        tradeoffs: 'O repartition por chave continuará mandando todos os registros com a mesma chave "000000" para a mesmíssima partição após a função de hash.',
        explanation: 'Hash partitioning garante que chaves iguais vão para a mesma partição; portanto, aumentar partições não resolve skew na mesma chave.',
      },
    ],
    architecturalInsight:
      'No Apache Spark 3+, habilite também `spark.sql.adaptive.skewJoin.enabled = true`. O AQE detecta partições assimétricas ' +
      'automaticamente e as divide em tempo de execução sem exigir código manual de salting.',
  },
  {
    id: 'ch-3',
    title: 'Desafio 3: Implementar LGPD Right-to-be-Forgotten em 500TB no Lakehouse',
    category: 'Governança & Lakehouse',
    difficulty: 'Especialista',
    scenario:
      'Um usuário solicita formalmente a exclusão permanente de todos os seus dados pessoais (LGPD/GDPR). ' +
      'Os dados do cliente estão espalhados em milhares de arquivos Parquet históricos acumulados nos últimos 4 anos no S3.',
    options: [
      {
        letter: 'A',
        description: 'Executar um DELETE SQL na tabela Delta/Iceberg filtrando pelo ID do usuário e, em seguida, rodar VACUUM com janela de retenção expirada para purgar snapshots antigos.',
        isOptimal: true,
        tradeoffs: 'Reescreve apenas os arquivos Parquet que continham o registro do usuário e o VACUUM remove os snapshots históricos que continham o dado antigo.',
        explanation: 'Esta é a abordagem nativa e auditável do Lakehouse moderno para cumprir o direito ao esquecimento sem recriar o lago.',
      },
      {
        letter: 'B',
        description: 'Baixar todos os 500TB para uma máquina local, rodar um script Python com Pandas e fazer re-upload para o S3.',
        isOptimal: false,
        tradeoffs: 'Inviável em petabytes: causará dias de downtime, custo estratosférico de egress de rede e risco massivo de perda de dados.',
        explanation: 'Nunca se reprocessa o lago inteiro para uma exclusão individual.',
      },
      {
        letter: 'C',
        description: 'Adicionar uma flag "excluido = true" na tabela e manter os arquivos Parquet intactos no storage.',
        isOptimal: false,
        tradeoffs: 'Soft-delete não atende aos requisitos rígidos de leis como LGPD/GDPR para expurgo físico dos dados pessoais.',
        explanation: 'Se os dados continuarem gravados no disco, a empresa permanece sujeita a multas em caso de vazamento ou auditoria regulatória.',
      },
    ],
    architecturalInsight:
      'Para máxima elegância arquitetural, utilize Crypto-shredding: armazene campos PII criptografados com uma chave exclusiva ' +
      'por usuário no KMS. Ao receber a solicitação de exclusão, destrua a chave criptográfica daquele usuário, tornando seus dados irreversivelmente indecifráveis.',
  },
];

export const SystemDesignChallenges: React.FC = () => {
  const { recordSystemDesignSolved } = useGamification();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CHALLENGES[0].id);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const activeChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIndex(idx);
    setHasSubmitted(true);

    if (activeChallenge?.options?.[idx]?.isOptimal) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      recordSystemDesignSolved();
    }
  };

  const handleSwitchChallenge = (id: string) => {
    setSelectedChallengeId(id);
    setSelectedOptionIndex(null);
    setHasSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" /> Desafios Reais de Arquitetura & System Design
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Cenários Práticos de Engenheiro de Dados Sênior
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Tome decisões de arquitetura sob restrições reais de latência, volume de petabytes, custos de nuvem e compliance.
          Avalie trade-offs de cada caminho e veja a resolução recomendada.
        </p>
      </div>

      {/* Challenge Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CHALLENGES.map((ch) => {
          const isActive = ch.id === activeChallenge.id;
          return (
            <button
              key={ch.id}
              onClick={() => handleSwitchChallenge(ch.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-800 border-purple-500 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                <span className="text-purple-400 uppercase font-bold">{ch.category}</span>
                <span className="text-slate-500">{ch.difficulty}</span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-2">
                {ch.title}
              </h4>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Box */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/50 px-2.5 py-1 rounded border border-purple-800/40">
              {activeChallenge.category}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Dificuldade: <strong className="text-white">{activeChallenge.difficulty}</strong>
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-3">
            {activeChallenge.title}
          </h3>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
            <strong className="text-amber-400 block mb-1 font-mono uppercase text-xs">Cenário do Problema:</strong>
            {activeChallenge.scenario}
          </div>
        </div>

        {/* Options */}
        <div>
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-3">
            Qual arquitetura você escolheria como Engenheiro(a) Líder?
          </h4>

          <div className="space-y-3">
            {activeChallenge.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;

              let cardStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300';
              if (hasSubmitted) {
                if (opt.isOptimal) {
                  cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium';
                } else if (isSelected) {
                  cardStyle = 'bg-red-950/40 border-red-500 text-red-200';
                } else {
                  cardStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${cardStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                      {opt.letter}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm leading-relaxed">{opt.description}</p>

                      {hasSubmitted && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs font-sans leading-relaxed">
                          <span className={`font-bold block mb-1 ${opt.isOptimal ? 'text-emerald-400' : 'text-red-400'}`}>
                            {opt.isOptimal ? '✓ Escolha Ideal' : '✗ Armadilha Arquitetural'}:
                          </span>
                          <span className="text-slate-300">{opt.tradeoffs}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architectural Insight Box */}
        {hasSubmitted && (
          <div className="p-5 bg-gradient-to-r from-purple-950/30 via-slate-950 to-purple-950/30 rounded-2xl border border-purple-500/40 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase font-bold mb-2">
              <Lightbulb className="w-4 h-4" /> Insight Arquitetural Sênior
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {activeChallenge.architecturalInsight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
