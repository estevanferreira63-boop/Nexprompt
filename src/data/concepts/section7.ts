import { Concept } from '../../types/concept';

export const SECTION_7_CONCEPTS: Concept[] = [
  {
    id: 91,
    sectionId: 7,
    name: 'Data Governance',
    tagline: 'O conjunto de princípios, papéis e processos que garantem dados seguros, confiáveis e úteis.',
    difficulty: 'Iniciante',
    overview: 'Governança de Dados é o framework estratégico de pessoas, políticas e tecnologia que assegura que os ativos de dados de uma organização sejam íntegros, auditáveis, consistentes e usados em conformidade com as leis e objetivos de negócio.',
    whyItMatters: 'Sem governança, empresas acumulam dados em silos desorganizados, analistas calculam o mesmo KPI com 4 números conflitantes e a empresa fica exposta a multas regulatórias milionárias.',
    underTheHood: 'Envolve pilares centrais: Data Stewardship (curadores de dados), Glossário de Negócios (definição unificada do que é "Cliente Ativo"), Catálogo de Dados (DataHub, Unity Catalog, Alation), Gestão de Metadados e Políticas de Retenção.',
    realWorldExample: 'Definir uma regra corporativa estrita de que a métrica "Receita Líquida Recorrente (ARR)" possui uma única fórmula oficial mantida pelo comitê financeiro e catalogada para toda a empresa.',
    codeSnippet: {
      language: 'yaml',
      title: 'Definição de Ativo de Dados Governança no DataHub / OpenMetadata',
      code: `entity: dataset
urn: urn:li:dataset:(urn:li:dataPlatform:snowflake,dw.gold.faturamento_mensal,PROD)
description: Tabela oficial corporativa de receita mensal auditada pela controladoria
ownership:
  owners:
    - urn:li:corpuser:maria.controladoria
      type: TechnicalOwner
    - urn:li:corpuser:joao.diretor_financeiro
      type: BusinessOwner
tags:
  - FinanceiroOficial
  - CertificadoGold
glossaryTerms:
  - urn:li:glossaryTerm:ReceitaLiquida`,
    },
    antiPatterns: ['Tratar governança como um comitê burocrático de papel que apenas proíbe as pessoas de acessar dados em vez de viabilizar acessos seguros e catalogados.'],
    bestPractices: ['Implemente governança orientada a domínios (Data Mesh) com catálogos automatizados integrados aos pipelines de CI/CD.'],
    relatedIds: [60, 92, 93, 94, 95],
    quiz: {
      question: 'Qual é o principal objetivo de um Catálogo de Dados na Governança corporativa?',
      options: [
        'Atuar como um mecanismo de busca e documentação centralizado onde usuários descobrem quem é o dono, qual a linhagem, o que significa cada coluna e o nível de qualidade dos dados.',
        'Vender os dados da empresa na internet.',
        'Apagar tabelas antigas sem avisar.',
        'Impedir que programadores usem SQL.',
      ],
      correctIndex: 0,
      explanation: 'O catálogo de dados é a "biblioteca central" indexada: permite a qualquer colaborador descobrir, entender a proveniência e confiar nos dados disponíveis na organização.',
    },
  },
  {
    id: 92,
    sectionId: 7,
    name: 'Data Privacy',
    tagline: 'Conformidade legal: GDPR, LGPD e o direito de ser esquecido aplicado a sistemas distribuídos.',
    difficulty: 'Intermediário',
    overview: 'Privacidade de Dados refere-se às práticas e requisitos técnicos para garantir que os dados dos indivíduos sejam tratados com consentimento, transparência e em estrita conformidade com legislações de proteção de dados (como LGPD no Brasil e GDPR na Europa).',
    whyItMatters: 'Violações podem resultar em multas de até 2% do faturamento global da empresa (ou R$ 50 milhões por infração na LGPD), além de danos irreversíveis à reputação da marca.',
    underTheHood: 'Exige implementar requisitos técnicos complexos como: Direito ao Esquecimento (Right to be Forgotten - apagar todos os dados de um usuário sob demanda em terabytes de arquivos imutáveis no Lakehouse), Portabilidade de Dados e Gestão de Consentimento.',
    realWorldExample: 'Quando um usuário solicita a exclusão da sua conta pelo app, um pipeline de privacidade localiza e anonimiza todas as ocorrências do seu ID em bancos operacionais e tabelas do Lakehouse.',
    codeSnippet: {
      language: 'sql',
      title: 'Atendendo ao Direito ao Esquecimento (GDPR / LGPD) no Lakehouse',
      code: `-- Apagando ou anonimizando registros de um usuário que revogou consentimento:
DELETE FROM silver_clientes 
WHERE cliente_id = 948102;

-- Em seguida, o VACUUM é obrigatório para apagar os arquivos físicos antigos do S3:
VACUUM silver_clientes RETAIN 0 HOURS;`,
    },
    antiPatterns: ['Achar que backups e logs históricos estão isentos de leis de privacidade como LGPD e GDPR.'],
    bestPractices: ['Utilize Pseudonimização e Crypto-shredding: se você apagar a chave de criptografia do usuário, todos os seus dados históricos tornam-se indecifráveis instantaneamente.'],
    relatedIds: [91, 93, 95, 96],
    quiz: {
      question: 'O que é a técnica de "Crypto-shredding" em arquiteturas de privacidade de dados?',
      options: [
        'Destruir fisicamente os servidores da nuvem com marretas.',
        'Comprimir arquivos usando senha ZIP.',
        'Criptografar os dados de cada usuário com uma chave única individual; para atender ao direito ao esquecimento, basta deletar a chave de criptografia daquele usuário, tornando seus dados matematicamente irrecuperáveis.',
        'Impedir que usuários acessem o site.',
      ],
      correctIndex: 2,
      explanation: 'Crypto-shredding é a solução mais elegante para Big Data: em vez de reescrever petabytes de arquivos históricos para apagar 1 linha, apaga-se a chave criptográfica associada àquele usuário específico.',
    },
  },
  {
    id: 93,
    sectionId: 7,
    name: 'PII',
    tagline: 'Personally Identifiable Information: identificação, mascaramento dinâmico e tokenização de dados sensíveis.',
    difficulty: 'Iniciante',
    overview: 'PII (Informações Pessoalmente Identificáveis) é qualquer dado que possa ser usado isoladamente ou em combinação com outros para identificar diretamente um indivíduo específico: CPF, RG, Nome Completo, E-mail, Telefone, Endereço IP, Cartão de Crédito e Dados Biométricos.',
    whyItMatters: 'Cientistas de dados e analistas de BI precisam analisar padrões comportamentais, mas quase nunca precisam ver o CPF ou telefone real dos clientes. Expor PII sem necessidade é a maior causa de vazamentos de dados.',
    underTheHood: 'Técnicas de proteção em nível de coluna: 1) **Mascaramento Dinâmico** (`j***@gmail.com`, `***.451.982-**`); 2) **Tokenização** (substituir o valor por um hash irreversível); 3) **Hashing com Sal (Salted Hashing)**; 4) **Generalização** (trocar a data exata de nascimento por apenas a faixa etária "25-34 anos").',
    realWorldExample: 'Em um dashboard analítico, a coluna de e-mail é exibida como `c***@empresa.com` para analistas comuns, mas revelada integralmente para o time de suporte ao cliente autorizado.',
    labType: 'rbac-masking',
    codeSnippet: {
      language: 'sql',
      title: 'Mascaramento Dinâmico de Coluna PII no Snowflake / Databricks',
      code: `-- Criação de política de mascaramento dinâmico
CREATE OR REPLACE MASKING POLICY mascara_email_pii AS (val STRING) 
RETURNS STRING ->
  CASE 
    WHEN CURRENT_ROLE() IN ('COMPLIANCE_ADMIN', 'SUPORTE_N2') THEN val
    ELSE REGEXP_REPLACE(val, '(^[^@]{2})(.*)(@.*$)', '\\\\1****\\\\3')
  END;

-- Aplica a política na coluna da tabela analítica:
ALTER TABLE dim_clientes MODIFY COLUMN email SET MASKING POLICY mascara_email_pii;`,
    },
    antiPatterns: ['Gravar senhas de usuários usando hashing simples sem sal (como MD5 ou SHA1), que podem ser quebradas por Rainbow Tables em segundos.'],
    bestPractices: ['Identifique e classifique automaticamente colunas contendo PII durante o processo de ingestão na camada Bronze.'],
    relatedIds: [91, 92, 94, 95, 96],
    quiz: {
      question: 'Qual é o papel do Mascaramento Dinâmico de Dados (Dynamic Data Masking)?',
      options: [
        'Apagar permanentemente a coluna do banco de dados.',
        'Adicionar emojis nos nomes dos clientes.',
        'Mudar a cor do texto no terminal.',
        'Ocultar ou mascarar valores sensíveis em tempo de consulta com base no papel (Role) de quem está executando a query, preservando o dado original intacto no disco.',
      ],
      correctIndex: 3,
      explanation: 'O mascaramento dinâmico não altera o dado gravado no disco: ele intercepta a leitura e aplica uma máscara calculada em tempo real caso o usuário não tenha privilégios suficientes.',
    },
  },
  {
    id: 94,
    sectionId: 7,
    name: 'Access Control',
    tagline: 'O princípio do menor privilégio: controle quem pode ver quais tabelas, linhas e colunas.',
    difficulty: 'Intermediário',
    overview: 'Controle de Acesso (Access Control) é a disciplina de conceder e revogar permissões sobre recursos de dados. Varia de permissões amplas em nível de banco/tabela até controles refinados de segurança em nível de linha (Row-Level Security - RLS) e coluna (Column-Level Security - CLS).',
    whyItMatters: 'Garante o Princípio do Menor Privilégio (PoLP): cada colaborador deve ter acesso estritamente aos dados indispensáveis para executar seu trabalho diário, minimizando riscos de exfiltração ou acidentes operacionais.',
    underTheHood: 'Diferencia modelos: DAC (Discretionary Access Control), MAC (Mandatory), RBAC (Role-Based) e ABAC (Attribute-Based Access Control, onde permissões são avaliadas dinamicamente com base em atributos como departamento, horário de acesso e localização IP).',
    realWorldExample: 'Um gerente de vendas da filial do Rio de Janeiro só pode ver as linhas da tabela onde `regiao = "RJ"`, enquanto o diretor nacional tem visibilidade total.',
    labType: 'rbac-masking',
    codeSnippet: {
      language: 'sql',
      title: 'Segurança em Nível de Linha (Row-Level Security - RLS)',
      code: `-- Habilita RLS no PostgreSQL
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Cria política que restringe a visibilidade para a região do vendedor conectado:
CREATE POLICY politica_vendas_por_regiao ON vendas
FOR SELECT
USING (regiao_venda = current_setting('app.user_region'));`,
    },
    antiPatterns: ['Dar permissões de `SUPERUSER` ou `ADMIN` para todos os analistas e cientistas de dados por preguiça de configurar permissões granulares.'],
    bestPractices: ['Audite periodicamente os logs de acessos concedidos e remova privilégios de contas inativas ou colaboradores que trocaram de setor.'],
    relatedIds: [91, 93, 95, 96],
    quiz: {
      question: 'O que é Row-Level Security (RLS)?',
      options: [
        'A trava física das portas da sala de servidores.',
        'Um mecanismo de banco de dados que filtra automaticamente as linhas retornadas em uma consulta de acordo com as permissões do usuário logado.',
        'A ordenação de tabelas por tamanho.',
        'Um antivírus para planilhas Excel.',
      ],
      correctIndex: 1,
      explanation: 'RLS atua silenciosamente no motor SQL: a query SELECT * FROM tabela só devolve as linhas que aquele usuário em particular tem permissão de enxergar.',
    },
  },
  {
    id: 95,
    sectionId: 7,
    name: 'RBAC',
    tagline: 'Role-Based Access Control: gerencie permissões através de papéis e grupos funcionais.',
    difficulty: 'Iniciante',
    overview: 'RBAC (Controle de Acesso Baseado em Papéis) é o modelo de segurança onde privilégios de acesso não são concedidos diretamente a indivíduos, mas sim associados a "Papéis" funcionais (Roles, ex: `analista_marketing`, `engenheiro_dados`, `auditor_externo`), aos quais os usuários são então vinculados.',
    whyItMatters: 'Torna a gestão de segurança escalável para milhares de colaboradores. Quando um analista é contratado ou promovido, basta atribuir a Role correspondente em vez de conceder permissões manuais em 200 tabelas diferentes.',
    underTheHood: 'Usa uma matriz de herança hierárquica de papéis (`GRANT ROLE estagiario TO analista_junior TO analista_senior`). Integra com provedores corporativos de identidade (IdP) via SAML 2.0 / SCIM / Active Directory (Okta, Azure AD).',
    realWorldExample: 'No Snowflake: a Role `BI_READONLY` tem permissão de `SELECT` nas tabelas da camada Gold, mas zero permissão de escrita ou leitura na camada Bronze.',
    labType: 'rbac-masking',
    codeSnippet: {
      language: 'sql',
      title: 'Estruturação de RBAC no Snowflake / Banco Analítico',
      code: `-- 1. Criação de Roles funcionais
CREATE ROLE bi_analista;
CREATE ROLE data_engineer;

-- 2. Concessão de privilégios aos papéis
GRANT USAGE ON DATABASE data_lakehouse TO ROLE bi_analista;
GRANT USAGE ON SCHEMA data_lakehouse.gold TO ROLE bi_analista;
GRANT SELECT ON ALL TABLES IN SCHEMA data_lakehouse.gold TO ROLE bi_analista;

-- 3. Associação do papel ao usuário individual
GRANT ROLE bi_analista TO USER carlos_silva;`,
    },
    antiPatterns: ['Criar uma Role personalizada exclusiva para cada pessoa da empresa, recriando o caos do controle individual disfarçado de RBAC.'],
    bestPractices: ['Estruture Roles em duas camadas: Functional Roles (papéis de negócio) e Access Roles (papéis de objetos técnicos).'],
    relatedIds: [91, 93, 94],
    quiz: {
      question: 'Qual é o maior benefício do modelo RBAC em comparação ao gerenciamento de permissões diretas por usuário?',
      options: [
        'Aumenta a velocidade de download de arquivos grandes.',
        'Elimina a necessidade de criar senhas.',
        'Facilita a governança em escala, pois permissões são concedidas a papéis funcionais e não a indivíduos avulsos, simplificando admissões, trocas de setor e demissões.',
        'Substitui o uso de computadores por celulares.',
      ],
      correctIndex: 2,
      explanation: 'No RBAC, a concessão é modular: mudou de área, troca-se a Role do colaborador e ele herda instantaneamente o conjunto exato de acessos auditados.',
    },
  },
  {
    id: 96,
    sectionId: 7,
    name: 'Encryption',
    tagline: 'Criptografia em repouso e em trânsito: proteja os dados contra interceptações e vazamentos físicos.',
    difficulty: 'Intermediário',
    overview: 'Criptografia é a ciência de codificar dados legíveis (plain text) em cifras ininteligíveis (cipher text) usando chaves criptográficas matemáticas. Cobre duas dimensões inegociáveis: Encryption in Transit (em trânsito pela rede) e Encryption at Rest (em repouso no disco).',
    whyItMatters: 'Se alguém interceptar o tráfego de rede ou furtar fisicamente um disco rígido do data center da nuvem, os dados serão completamente inúteis sem a chave criptográfica.',
    underTheHood: 'Em trânsito: TLS 1.3 com criptografia assimétrica RSA/ECC para handshake e AES-GCM para transmissão. Em repouso: AES-256 gerenciado por HSM (Hardware Security Module) via serviços KMS (AWS KMS, Google Cloud KMS) com chaves do cliente (CMEK - Customer-Managed Encryption Keys).',
    realWorldExample: 'Buckets do S3 configurados com SSE-KMS com rotação automática anual de chaves criptográficas.',
    codeSnippet: {
      language: 'bash',
      title: 'Forçando Criptografia TLS e AES-256 via Terraform (AWS S3)',
      code: `resource "aws_s3_bucket_server_side_encryption_configuration" "lake_criptografado" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.chave_lake.arn
      sse_algorithm     = "aws:kms"
    }
  }
}`,
    },
    antiPatterns: ['Deixar portas de bancos abertas sem TLS/SSL obrigatório na conexão, transmitindo dados e senhas em texto puro pela internet.'],
    bestPractices: ['Utilize Customer-Managed Keys (CMEK) para garantir que a sua empresa mantenha a posse soberana das chaves de criptografia.'],
    relatedIds: [92, 93, 94],
    quiz: {
      question: 'Qual é a diferença entre Encryption at Rest e Encryption in Transit?',
      options: [
        'Encryption at Rest protege os dados gravados fisicamente no disco/storage; Encryption in Transit protege os dados durante o tráfego entre clientes e servidores através da rede (ex: TLS).',
        'Não há diferença alguma.',
        'Encryption in Transit é usada apenas em aviões e carros.',
        'Encryption at Rest é desligada durante a noite.',
      ],
      correctIndex: 0,
      explanation: 'A segurança corporativa exige a proteção contínua: em repouso (quando gravado nos discos) e em trânsito (quando viajando pelos cabos de rede).',
    },
  },
  {
    id: 97,
    sectionId: 7,
    name: 'Cost Optimization',
    tagline: 'Engenharia de precisão financeira: reduza custos de computação e armazenamento sem perder performance.',
    difficulty: 'Intermediário',
    overview: 'Otimização de Custos em dados é a prática contínua de identificar e eliminar desperdícios de infraestrutura: desligar clusters ociosos, converter dados para formatos colunares compactos, adotar instâncias Spot e aplicar ciclos de vida de armazenamento.',
    whyItMatters: 'Na nuvem, cada query mal escrita ou cluster esquecido ligado gera cobrança real em dólares no cartão da empresa. Equipes que não otimizam custos acabam tendo seus orçamentos cortados pela liderança executiva.',
    underTheHood: 'Táticas de alto impacto: 1) Auto-termination agressivo em clusters de desenvolvimento (ex: desligar após 15 minutos sem uso); 2) Uso de instâncias Spot / Preemptible para workers stateless (economia de até 70%); 3) Migração de storage de S3 Standard para Intelligent-Tiering e Glacier.',
    realWorldExample: 'Empresa que reduziu sua fatura do Databricks/AWS de US$ 80.000 para US$ 32.000 por mês ativando auto-termination e corrigindo full-table scans com Z-Ordering.',
    codeSnippet: {
      language: 'json',
      title: 'Política de Ciclo de Vida de Armazenamento no S3 (Lifecycle Rule)',
      code: `{
  "Rules": [
    {
      "ID": "MoverLogsParaGlacier",
      "Status": "Enabled",
      "Filter": { "Prefix": "bronze/logs_antigos/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 730 }
    }
  ]
}`,
    },
    antiPatterns: ['Deixar clusters de desenvolvimento de 64 nós ligados durante fins de semana sem nenhum job rodando.'],
    bestPractices: ['Implemente tags obrigatórias de centro de custo em todos os recursos de nuvem para atribuição clara de despesas.'],
    relatedIds: [24, 25, 48, 98, 99],
    quiz: {
      question: 'Por que o uso de instâncias Spot/Preemptible em nós Workers do Spark gera economia massiva de custos com baixo risco operacional?',
      options: [
        'Porque a capacidade ociosa dos provedores de nuvem é vendida com até 70-80% de desconto, e o Spark tolera quedas de workers graças ao seu grafo de linhagem resiliente.',
        'Porque instâncias Spot não usam memória RAM.',
        'Porque instâncias Spot são gratuitas para sempre.',
        'Porque elas só funcionam com software livre.',
      ],
      correctIndex: 0,
      explanation: 'A arquitetura resiliente do Spark permite tirar proveito de máquinas Spot baratíssimas: se um nó for revogado pela AWS/GCP, o Spark simplesmente recalcula as tarefas perdidas em outro nó.',
    },
  },
  {
    id: 98,
    sectionId: 7,
    name: 'FinOps',
    tagline: 'A cultura da responsabilidade financeira na nuvem: una engenharia, finanças e produto.',
    difficulty: 'Intermediário',
    overview: 'FinOps (Cloud Financial Operations) é a prática cultural e operacional que reúne engenheiros de dados, líderes de tecnologia e equipes financeiras para trazer visibilidade, responsabilidade compartilhada e controle em tempo real sobre os gastos com nuvem.',
    whyItMatters: 'Muda o paradigma: em vez de esperar a fatura da nuvem chegar com susto no fim do mês, engenheiros tomam decisões arquiteturais conscientes do custo unitário por pipeline e por cliente.',
    underTheHood: 'As 3 fases do ciclo FinOps: 1) **Inform** (visibilidade de custos em tempo real com tags granulares e dashboards); 2) **Optimize** (dimensionamento correto, reservas de instâncias de 1/3 anos, savings plans); 3) **Operate** (governança contínua, limites de orçamento e alertas automatizados de anomalia de gastos).',
    realWorldExample: 'Descobrir que o custo de processamento de dados por transação de checkout é de R$ 0,004 e que uma query malfeita no Snowflake elevou esse custo temporariamente para R$ 0,12.',
    codeSnippet: {
      language: 'sql',
      title: 'Auditoria de Custo de Queries no Snowflake (Account Usage)',
      code: `-- Identificando as queries mais caras que consumiram mais créditos no mês
SELECT 
    query_id,
    user_name,
    warehouse_name,
    execution_time / 1000 / 60 as minutos_execucao,
    credits_used_cloud_services,
    query_text
FROM snowflake.account_usage.query_history
WHERE start_time >= DATEADD('month', -1, CURRENT_TIMESTAMP())
ORDER BY execution_time DESC
LIMIT 10;`,
    },
    antiPatterns: ['Tratar FinOps apenas como "cortar custos a qualquer preço", prejudicando a inovação e velocidade de entrega do time.'],
    bestPractices: ['Apresente métricas de custo unitário (Unit Economics) para os times de desenvolvimento (ex: custo por pipeline vs valor de negócio gerado).'],
    relatedIds: [48, 49, 97, 99],
    quiz: {
      question: 'Qual é o princípio fundamental da cultura FinOps em Engenharia de Dados?',
      options: [
        'Proibir o uso da nuvem e voltar para servidores locais em todos os casos.',
        'Responsabilidade compartilhada: cada engenheiro tem visibilidade e responsabilidade pelo custo da infraestrutura e dos pipelines que coloca em produção.',
        'O time financeiro deve escrever as queries SQL no lugar dos engenheiros.',
        'Comprar o hardware mais barato do mercado.',
      ],
      correctIndex: 1,
      explanation: 'FinOps estabelece que o custo é uma dimensão de qualidade de software tão importante quanto performance e segurança: quem cria o pipeline deve entender e otimizar seu impacto financeiro.',
    },
  },
  {
    id: 99,
    sectionId: 7,
    name: 'Cloud Storage',
    tagline: 'Amazon S3, Google Cloud Storage, Azure ADLS Gen2: o alicerce infinito e inquebrável da nuvem.',
    difficulty: 'Iniciante',
    overview: 'Armazenamento de Objetos em Nuvem (Cloud Object Storage) é o serviço de armazenamento fundamental que guarda dados como objetos (chave, payload em bytes e metadados) em buckets globais, oferecendo escalabilidade praticamente infinita e durabilidade de 99.999999999% (11 noves).',
    whyItMatters: 'É o alicerce onde Data Lakes e Lakehouses existem. Custando frações de centavos por gigabyte, libertou as empresas da tirania de ter que comprar storages físicos SAN/NAS a cada novo projeto de dados.',
    underTheHood: 'Não é um sistema de arquivos hierárquico tradicional: "pastas" são apenas prefixos na chave (`bucket/prefixo/arquivo.parquet`). Oferece Strong Read-After-Write Consistency (desde 2020 no S3) e classes de temperatura (Hot, Cool, Cold, Archive).',
    realWorldExample: 'Amazon S3 sustentando exabytes de dados corporativos de milhões de organizações simultaneamente ao redor do planeta.',
    codeSnippet: {
      language: 'python',
      title: 'Acessando Cloud Storage de forma segura com Boto3',
      code: `import boto3

s3_client = boto3.client('s3')

# Upload direto de arquivo Parquet com metadados e tags de governança
s3_client.upload_file(
    Filename='dados_vendas.parquet',
    Bucket='empresa-data-lake-silver',
    Key='ano=2026/mes=10/vendas.parquet',
    ExtraArgs={
        'ServerSideEncryption': 'aws:kms',
        'Tagging': 'Ambiente=Producao&Confidencialidade=Interna'
    }
)`,
    },
    antiPatterns: ['Deixar buckets com permissão de leitura pública aberta para o mundo (`AllUsers: Read`), causando os maiores vazamentos de dados da história.'],
    bestPractices: ['Ative S3 Block Public Access em nível de conta inteira e configure políticas estritas de IAM Bucket Policy.'],
    relatedIds: [8, 9, 24, 96, 97],
    quiz: {
      question: 'O que significa a durabilidade de "11 noves" (99.999999999%) garantida por serviços como Amazon S3 e Google Cloud Storage?',
      options: [
        'Que o serviço nunca cobra nada nos primeiros 11 meses.',
        'Que o download demora 11 segundos.',
        'Que o sistema suporta 11 usuários simultâneos.',
        'Que a probabilidade estatística de perda física irreversível de um arquivo armazenado é de 1 em 100 bilhões ao ano, graças à replicação geográfica em múltiplas zonas de disponibilidade.',
      ],
      correctIndex: 3,
      explanation: 'A durabilidade extrema é alcançada replicando os dados de forma redundante em múltiplos datacenters e zonas de disponibilidade independentes.',
    },
  },
  {
    id: 100,
    sectionId: 7,
    name: 'Architecture',
    tagline: 'O ápice da engenharia: Lambda, Kappa, Medallion, Data Mesh e Enterprise Data Fabric.',
    difficulty: 'Avançado',
    overview: 'Arquitetura de Dados é o desenho sistêmico macro que conecta todas as peças: fontes, ingestão, processamento, governança e consumo. Evoluiu das complexas arquiteturas Lambda (caminhos batch e streaming duplicados) e Kappa (streaming-first) para a unificação no Lakehouse Medallion e na distribuição descentralizada do Data Mesh.',
    whyItMatters: '"Don\'t learn tools. Learn how systems work." Ferramentas surgem e morrem em poucos anos; os princípios fundamentais de arquitetura distribuída, desacoplamento e fluxo de dados permanecem sólidos por décadas.',
    underTheHood: 'Grandes paradigmas: 1) **Lambda**: Batch Layer lento e preciso + Speed Layer rápido e aproximado; 2) **Kappa**: tudo é um stream processado por uma única engine (Flink/Kafka); 3) **Medallion Lakehouse**: unificação de batch/streaming sobre tabelas ACID abertas (Delta/Iceberg); 4) **Data Mesh**: descentralização de dados como produto sob responsabilidade de domínios de negócio com governança federada.',
    realWorldExample: 'Uma corporação multinacional unificando seus 10 domínios de negócios sob uma arquitetura de Data Mesh baseada em Lakehouse aberto.',
    codeSnippet: {
      language: 'markdown',
      title: 'Evolução dos Paradigmas de Arquitetura de Dados',
      code: `1. Data Warehouse Tradicional (1980-2010):
   [Fontes] -> ETL -> [Data Warehouse Central Monolítico] -> BI

2. Data Lake + Warehouse (2010-2020):
   [Fontes] -> [Data Lake S3] -> Spark/ETL -> [Data Warehouse Proprietary] -> BI/ML

3. Lakehouse Medallion Moderno (2020-Hoje):
   [Fontes] -> Bronze (Raw) -> Silver (Clean) -> Gold (Agg) -> BI + ML + APIs
   * Unificado em formatos abertos (Delta/Iceberg) com transações ACID

4. Data Mesh & Decentralized Fabric (Fronteira):
   Domínio Vendas | Domínio Logística | Domínio Marketing
   Cada domínio é dono do seu "Data Product" com governança federada global`,
    },
    antiPatterns: ['Copiar a arquitetura de gigantes como Netflix ou Uber quando sua empresa tem 200MB de dados e um único servidor PostgreSQL atenderia perfeitamente.'],
    bestPractices: ['Escolha a arquitetura mais simples que atenda aos requisitos de negócio atuais com capacidade modular de expansão futura.'],
    relatedIds: [1, 7, 8, 9, 10, 16],
    quiz: {
      question: 'Qual é o pilar central do paradigma de arquitetura descentralizada conhecido como "Data Mesh"?',
      options: [
        'Centralizar todos os dados em um único computador no departamento de TI.',
        'Substituir bancos de dados por redes sociais.',
        'Tratar dados como um Produto gerenciado e de propriedade direta dos domínios funcionais de negócio (ex: Logística, Vendas), apoiados por uma plataforma de autosserviço e governança federada.',
        'Proibir o uso de nuvem.',
      ],
      correctIndex: 2,
      explanation: 'O Data Mesh propõe que equipes de domínio que geram o dado sejam as donas dos seus produtos de dados analíticos, eliminando o gargalo de um time de dados centralizado e sobrecarregado.',
    },
  },
];
