import { Concept } from '../types/concept';

export interface MiniCourseModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  readTimeMinutes: number;
  content: {
    lead: string;
    keyPoints: { label: string; detail: string }[];
    visualType: 'architecture_diagram' | 'data_flow' | 'memory_layout' | 'comparison_matrix' | 'storage_internals';
    diagramMeta: {
      title: string;
      caption: string;
      nodes: { id: string; label: string; desc: string; type: 'source' | 'process' | 'storage' | 'output' | 'alert' }[];
      connections: { from: string; to: string; label?: string }[];
    };
    deepDiveText: string;
    proTip: string;
  };
}

export interface IllustratedMiniCourse {
  conceptId: number;
  conceptName: string;
  tagline: string;
  sectionName: string;
  difficulty: string;
  totalDurationMinutes: number;
  xpReward: number;
  modules: [
    MiniCourseModule, // Mod 1: Anatomia Arquitetural & Esquema Ilustrado
    MiniCourseModule, // Mod 2: Mecânica Interna & Baixo Nível (Deep Dive)
    MiniCourseModule, // Mod 3: Masterclass em Código de Produção
    MiniCourseModule, // Mod 4: Trade-offs de Produção & FinOps
    MiniCourseModule  // Mod 5: Desafio Prático & Checkpoint Interativo
  ];
  practicalCheckpoint: {
    scenario: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    keyTakeaway: string;
  };
}

// Diagram themes based on section
const SECTION_DIAGRAM_TEMPLATES: Record<number, {
  visualType: 'architecture_diagram' | 'data_flow' | 'memory_layout' | 'comparison_matrix' | 'storage_internals';
  flowPattern: { from: string; to: string; label?: string }[];
}> = {
  1: {
    visualType: 'comparison_matrix',
    flowPattern: [
      { from: 'client', to: 'buffer', label: 'Write I/O' },
      { from: 'buffer', to: 'engine', label: 'WAL / B-Tree' },
      { from: 'engine', to: 'storage', label: 'Disk Persistence' },
    ],
  },
  2: {
    visualType: 'data_flow',
    flowPattern: [
      { from: 'producers', to: 'broker', label: 'Zero-Copy Append' },
      { from: 'broker', to: 'partitions', label: 'Partition Hash Key' },
      { from: 'partitions', to: 'consumers', label: 'Consumer Group Lag' },
    ],
  },
  3: {
    visualType: 'storage_internals',
    flowPattern: [
      { from: 'source', to: 'bronze', label: 'Raw Append' },
      { from: 'bronze', to: 'silver', label: 'Cleanse & Schema' },
      { from: 'silver', to: 'gold', label: 'Aggregates & Metrics' },
    ],
  },
  4: {
    visualType: 'architecture_diagram',
    flowPattern: [
      { from: 'driver', to: 'dag', label: 'Catalyst Logical Plan' },
      { from: 'dag', to: 'executors', label: 'Task Serialization' },
      { from: 'executors', to: 'shuffle', label: 'Off-Heap / Spill' },
    ],
  },
  5: {
    visualType: 'data_flow',
    flowPattern: [
      { from: 'scheduler', to: 'task_queue', label: 'CRON Trigger' },
      { from: 'task_queue', to: 'worker', label: 'Idempotent Run' },
      { from: 'worker', to: 'metadata_db', label: 'State Commit & Alert' },
    ],
  },
  6: {
    visualType: 'architecture_diagram',
    flowPattern: [
      { from: 'query', to: 'embedding', label: 'Vectorization' },
      { from: 'embedding', to: 'ann_search', label: 'HNSW / Cosine' },
      { from: 'ann_search', to: 'llm_context', label: 'Grounded Prompt' },
    ],
  },
  7: {
    visualType: 'storage_internals',
    flowPattern: [
      { from: 'ingest', to: 'gateway', label: 'Authentication / RBAC' },
      { from: 'gateway', to: 'mesh_node', label: 'Domain Data Product' },
      { from: 'mesh_node', to: 'finops_audit', label: 'Cost & SLA Monitor' },
    ],
  },
};

/**
 * Generates or retrieves a rich 5-Module Illustrated Mini-Course for ANY of the 100 concepts.
 */
export function getIllustratedMiniCourse(concept: Concept): IllustratedMiniCourse {
  const secTemplate = SECTION_DIAGRAM_TEMPLATES[concept.sectionId] || SECTION_DIAGRAM_TEMPLATES[1];

  // Specific tailored nodes based on concept and section
  const nodeDefs = [
    {
      id: 'node_inflow',
      label: `Entrada / Ingestão (${concept.name})`,
      desc: 'Recepção de eventos, dados brutos ou chamadas transacionais de clientes.',
      type: 'source' as const,
    },
    {
      id: 'node_engine',
      label: `Mecanismo de Execução & I/O`,
      desc: concept.underTheHood.slice(0, 110) + '...',
      type: 'process' as const,
    },
    {
      id: 'node_storage',
      label: `Persistência & Formato Físico`,
      desc: 'Organização em disco (Parquet, LSM, B-Tree, Row vs Colunar).',
      type: 'storage' as const,
    },
    {
      id: 'node_serving',
      label: `Saída / Serving Layer & SLAs`,
      desc: 'Disponibilização para analistas, aplicações críticas e modelos de ML.',
      type: 'output' as const,
    },
  ];

  // Module 1: Anatomia Arquitetural & Esquema Ilustrado
  const mod1: MiniCourseModule = {
    id: `course_${concept.id}_mod1`,
    number: 1,
    title: 'Anatomia Arquitetural & Esquema Ilustrado',
    subtitle: 'Visão panorâmica, fluxo de dados e topologia de componentes em produção',
    icon: 'Layers',
    readTimeMinutes: 3,
    content: {
      lead: `${concept.name} atua como peça fundamental na engenharia moderna. ${concept.tagline}`,
      keyPoints: [
        {
          label: 'Papel no Pipeline',
          detail: concept.overview,
        },
        {
          label: 'Por que foi Inventado?',
          detail: concept.whyItMatters,
        },
        {
          label: 'Impacto nos SLAs',
          detail: 'Garante previsibilidade em tempo de resposta (P99) e integridade dos dados durante picos de tráfego.',
        },
      ],
      visualType: secTemplate.visualType,
      diagramMeta: {
        title: `Esquema Arquitetural de ${concept.name}`,
        caption: 'Topologia ponta a ponta mostrando ingestão, processamento em memória, persistência física e serving.',
        nodes: nodeDefs,
        connections: [
          { from: 'node_inflow', to: 'node_engine', label: 'Streaming / Batch I/O' },
          { from: 'node_engine', to: 'node_storage', label: 'Commit Transacional' },
          { from: 'node_storage', to: 'node_serving', label: 'Queries Sub-segundo' },
        ],
      },
      deepDiveText: `Na prática de arquiteturas distribuídas, ${concept.name} resolve o dilema entre throughput e latência. Em escala de petabytes, a coordenação entre nós exige separação estrita de responsabilidades para evitar contenção de I/O e amplificação de escrita.`,
      proTip: `💡 Regra de Ouro: Nunca implemente ${concept.name} isoladamente sem observar a camada de monitoramento e retenção de metadados correspondente.`,
    },
  };

  // Module 2: Mecânica Interna & Baixo Nível (Deep Dive)
  const mod2: MiniCourseModule = {
    id: `course_${concept.id}_mod2`,
    number: 2,
    title: 'Mecânica Interna & Baixo Nível (Deep Dive)',
    subtitle: 'Por debaixo dos panos: alocação de memória, I/O de disco e protocolos de rede',
    icon: 'Cpu',
    readTimeMinutes: 4,
    content: {
      lead: `Para dominar ${concept.name} no nível Staff/Principal, é imperativo compreender o que acontece na CPU, no Heap de memória e nos blocos físicos de armazenamento.`,
      keyPoints: [
        {
          label: 'Mecanismo de Execução',
          detail: concept.underTheHood,
        },
        {
          label: 'Estruturas de Dados Críticas',
          detail: 'Utiliza estruturas otimizadas para hardware moderno (vetores colunares contíguos na memória L1/L2/L3 cache, buffers off-heap e índices esparsos).',
        },
        {
          label: 'Gargalo Físico Primário',
          detail: 'I/O de disco (IOPS) e transferência de rede durante trocas de estado (Shuffle / Serialization).',
        },
      ],
      visualType: 'memory_layout',
      diagramMeta: {
        title: `Fluxo de Memória & I/O: ${concept.name}`,
        caption: 'Mapeamento entre User Space, JVM/Runtime Memory, Page Cache do SO e NVMe/Object Storage.',
        nodes: [
          { id: 'mem_heap', label: 'Executors / Heap RAM', desc: 'Processamento ativo de tuplas e estruturas de agregação em memória.', type: 'process' },
          { id: 'mem_offheap', label: 'Off-Heap / Arrow Buffer', desc: 'Zero-copy buffers que evitam pausas de Garbage Collector (GC).', type: 'storage' },
          { id: 'io_pagecache', label: 'Linux OS Page Cache', desc: 'Acelera re-leituras frequentes sem acessar fisicamente o disco.', type: 'source' },
          { id: 'disk_cold', label: 'Object Storage (S3/GCS)', desc: 'Persistência durável com custos reduzidos mas latência de ~50ms TTFB.', type: 'storage' },
        ],
        connections: [
          { from: 'mem_heap', to: 'mem_offheap', label: 'Off-heap Serialization' },
          { from: 'mem_offheap', to: 'io_pagecache', label: 'Sequential Flush' },
          { from: 'io_pagecache', to: 'disk_cold', label: 'Multipart Upload' },
        ],
      },
      deepDiveText: `Sistemas distribuídos eficientes minimizam a serialização de objetos. Em vez de transformar registros em structs e depois em bytes repetidas vezes, ${concept.name} favorece protocolos orientados a blocos contíguos com compressão de alta performance (Snappy, Zstandard, LZ4).`,
      proTip: `⚡ Dica Staff: Fique atento ao ratio de compressão e ao custo de descompressão na CPU; se a CPU for o gargalo, use algoritmos mais rápidos como LZ4 em vez de Gzip.`,
    },
  };

  // Module 3: Masterclass em Código de Produção
  const sampleCode = concept.codeSnippet
    ? concept.codeSnippet.code
    : `-- Exemplo Prático de Produção para ${concept.name}\nSELECT \n  date_trunc('day', event_time) AS event_date,\n  category_id,\n  COUNT(DISTINCT user_id) AS unique_active_users,\n  SUM(transaction_value) AS gross_revenue\nFROM lakehouse.gold_metrics\nWHERE event_time >= CURRENT_DATE - INTERVAL 30 DAY\nGROUP BY 1, 2\nORDER BY event_date DESC;`;

  const mod3: MiniCourseModule = {
    id: `course_${concept.id}_mod3`,
    number: 3,
    title: 'Masterclass em Código de Produção',
    subtitle: 'Implementação real comentada linha por linha com boas práticas defensivas',
    icon: 'FileCode',
    readTimeMinutes: 3,
    content: {
      lead: `Código de brinquedo não sobrevive à produção. Abaixo está o padrão canônico utilizado por empresas de tecnologia para ${concept.name}.`,
      keyPoints: [
        {
          label: 'Linguagem / Stack',
          detail: concept.codeSnippet ? concept.codeSnippet.language.toUpperCase() : 'SQL / PySpark',
        },
        {
          label: 'Princípio de Idempotência',
          detail: 'Toda execução deve produzir exatamente o mesmo resultado sem duplicar registros, independentemente de re-execuções manuais ou retries automáticos.',
        },
        {
          label: 'Tratamento de Exceções',
          detail: 'Validação de schema em tempo de execução e isolamento de linhas corrompidas (Dead Letter Queue ou badRecordsPath).',
        },
      ],
      visualType: 'data_flow',
      diagramMeta: {
        title: `Pipeline de Execução de Código (${concept.name})`,
        caption: 'Passagem de parâmetros, compilação de plano físico e validação de schema.',
        nodes: [
          { id: 'c_input', label: 'Validação de Schema DDL', desc: 'Garante tipos estritos antes de qualquer computação.', type: 'source' },
          { id: 'c_transform', label: 'Transformação Vetorizada', desc: 'Execução de transformações lógicas sem loops iterativos.', type: 'process' },
          { id: 'c_merge', label: 'Merge / Commit Atômico', desc: 'Atualização ACID sem lock exclusivo de tabela inteira.', type: 'storage' },
        ],
        connections: [
          { from: 'c_input', to: 'c_transform', label: 'Schema Enforced' },
          { from: 'c_transform', to: 'c_merge', label: 'ACID Transaction' },
        ],
      },
      deepDiveText: `Observe as melhores práticas recomendadas para este conceito:\n• ${concept.bestPractices?.[0] || 'Sempre defina tipos explícitos e evite casting implícito em filtros.'}\n• ${concept.bestPractices?.[1] || 'Monitore métricas de runtime via logs estruturados em JSON.'}`,
      proTip: `🛠️ Anti-Pattern Crítico: ${concept.antiPatterns?.[0] || 'Evite loops manuais em frameworks distribuídos; sempre utilize operações declarativas e vetorizadas.'}`,
    },
  };

  // Module 4: Trade-offs de Produção & FinOps
  const mod4: MiniCourseModule = {
    id: `course_${concept.id}_mod4`,
    number: 4,
    title: 'Trade-offs de Produção & FinOps',
    subtitle: 'Quando usar, quando NÃO usar, custos na nuvem e o Teorema CAP/PACELC',
    icon: 'ShieldCheck',
    readTimeMinutes: 3,
    content: {
      lead: `Em engenharia de dados sênior, não existem soluções perfeitas; existem apenas escolhas conscientes de trade-offs.`,
      keyPoints: [
        {
          label: 'Vantagem Primária',
          detail: 'Escalabilidade previsível e separação desacoplada entre armazenamento e computação.',
        },
        {
          label: 'Custo Oculto (FinOps)',
          detail: 'Taxas de transferência entre zonas de disponibilidade (cross-AZ traffic) e sobretaxas de chamadas LIST/GET em buckets de objetos.',
        },
        {
          label: 'Quando NÃO Adotar',
          detail: `${concept.antiPatterns?.[1] || 'Quando o volume for inferior a alguns gigabytes e um SQLite ou PostgreSQL atender perfeitamente sem complexidade operacional.'}`,
        },
      ],
      visualType: 'comparison_matrix',
      diagramMeta: {
        title: `Matriz de Trade-offs: ${concept.name}`,
        caption: 'Comparação de latência, complexidade de manutenção e custos operacionais.',
        nodes: [
          { id: 'to_fast', label: 'Latência Sub-segundo', desc: 'Atende dashboards em tempo real e APIs de recomendação.', type: 'process' },
          { id: 'to_cost', label: 'Custo de Infraestrutura ($)', desc: 'Exige instâncias dedicadas de memória e clusters com warm-up.', type: 'alert' },
          { id: 'to_ops', label: 'Sobrecarga de Manutenção (Ops)', desc: 'Requer monitoramento de réplicas, compactação e retenção.', type: 'storage' },
        ],
        connections: [
          { from: 'to_fast', to: 'to_cost', label: 'Gera custo proporcional' },
          { from: 'to_cost', to: 'to_ops', label: 'Exige governança ativa' },
        ],
      },
      deepDiveText: `Equipes de alta maturidade analisam o TCO (Total Cost of Ownership). Adotar ${concept.name} agrega imenso valor quando a organização precisa de confiabilidade e alta taxa de ingestão, mas exige treinamento da equipe para evitar desperdício de instâncias na nuvem.`,
      proTip: `💰 Dica FinOps: Configure alertas de billing baseados em anomalias diárias de I/O em vez de limites mensais estáticos para capturar vazamentos de recursos em menos de 24 horas.`,
    },
  };

  // Module 5: Desafio Prático & Checkpoint Interativo
  const checkpoint = concept.quiz || {
    question: `Em uma arquitetura de alta escala envolvendo ${concept.name}, qual estratégia garante a melhor relação entre custo e performance?`,
    options: [
      'Aumentar o cluster indefinidamente sem analisar o plano de execução.',
      'Otimizar o particionamento, aplicar poda de dados (pruning) e evitar shuffles desnecessários.',
      'Desativar todos os backups e auditorias de schema para ganhar velocidade.',
      'Converter todos os dados para JSON em formato texto.',
    ],
    correctIndex: 1,
    explanation: 'A otimização de I/O por particionamento e eliminação de shuffles reduz o processamento na raiz, economizando memória e custos de computação na nuvem.',
  };

  const mod5: MiniCourseModule = {
    id: `course_${concept.id}_mod5`,
    number: 5,
    title: 'Desafio Prático & Checkpoint de Fixação',
    subtitle: 'Validação de domínio técnico com cenário realista e recompensa em XP',
    icon: 'Trophy',
    readTimeMinutes: 2,
    content: {
      lead: `Chegou a hora de provar que você domina ${concept.name}. Analise o cenário prático e selecione a resposta correta para certificar o mini-curso.`,
      keyPoints: [
        {
          label: 'Cenário da Pergunta',
          detail: checkpoint.question,
        },
        {
          label: 'Recompensa de Conclusão',
          detail: '+60 XP e selo de competência técnica para o seu perfil.',
        },
        {
          label: 'Aplicação Imediata',
          detail: 'Este mesmo conceito é frequentemente tema de entrevista técnica para posições Sênior e Staff.',
        },
      ],
      visualType: 'data_flow',
      diagramMeta: {
        title: `Checkpoint de Conhecimento: ${concept.name}`,
        caption: 'Responda a questão para consolidar a memória de longo prazo e desbloquear XP.',
        nodes: [
          { id: 'ch_question', label: 'Desafio de Cenário Real', desc: 'Situação de produção com trade-off arquitetural.', type: 'process' },
          { id: 'ch_validate', label: 'Validação Lógica', desc: 'Avaliação da resposta e raciocínio técnico.', type: 'source' },
          { id: 'ch_badge', label: 'Conquista & XP', desc: '+60 XP computados no seu ranking de engenheiro.', type: 'output' },
        ],
        connections: [
          { from: 'ch_question', to: 'ch_validate', label: 'Submissão de Opção' },
          { from: 'ch_validate', to: 'ch_badge', label: 'Aprovação' },
        ],
      },
      deepDiveText: `O aprendizado ativo e testes de retenção com feedback imediato aumentam em mais de 70% a retenção na memória de longo prazo de acordo com a neurociência cognitiva.`,
      proTip: `🎯 Conclusão: Após responder, revise suas anotações pessoais e pratique este conceito nos Laboratórios Visuais!`,
    },
  };

  return {
    conceptId: concept.id,
    conceptName: concept.name,
    tagline: concept.tagline,
    sectionName: `Trilha #${concept.sectionId}`,
    difficulty: concept.difficulty,
    totalDurationMinutes: 15,
    xpReward: 60,
    modules: [mod1, mod2, mod3, mod4, mod5],
    practicalCheckpoint: {
      scenario: `Cenário de Produção em Alta Escala: A equipe de engenharia está operando ${concept.name} com centenas de gigabytes por dia e precisa garantir estabilidade contínua.`,
      question: checkpoint.question,
      options: checkpoint.options,
      correctIndex: checkpoint.correctIndex,
      explanation: checkpoint.explanation,
      keyTakeaway: `${concept.name} exige compreensão de baixo nível para evitar desperdício de infraestrutura e garantir alta confiabilidade em produção.`,
    },
  };
}
