import { Concept } from '../../types/concept';

export const SECTION_1_CONCEPTS: Concept[] = [
  {
    id: 1,
    sectionId: 1,
    name: 'Data Modeling',
    tagline: 'A arte de desenhar como entidades, relações e regras de negócio se estruturam no banco.',
    difficulty: 'Iniciante',
    overview: 'Data Modeling é o processo de estruturar visualmente e logicamente os dados de uma organização. Ele define como tabelas, colunas, chaves primárias e relacionamentos (1:1, 1:N, N:N) representam o mundo real, garantindo integridade e facilidade de consulta.',
    whyItMatters: 'Sem uma modelagem sólida, sistemas sofrem com duplicações inconsistentes, queries lentas de milhares de linhas e incapacidade de responder a novas perguntas de negócio sem reescrever todo o banco.',
    underTheHood: 'Diferencia modelos conceituais (alto nível para stakeholders), lógicos (com tipos e relações sem dependência de SGBD) e físicos (DDL com tipos de dados específicos, índices, partições e storage engines). Em bancos analíticos, favorece modelagem dimensional (Kimball/Inmon); em transacionais, modelo relacional formal (Codd).',
    realWorldExample: 'No e-commerce, o modelo precisa representar Pedido, ItemPedido, Cliente, Pagamento e Produto sem duplicar o preço histórico do produto quando o catálogo for atualizado.',
    codeSnippet: {
      language: 'sql',
      title: 'Modelagem Conceitual vs Física em SQL',
      code: `-- Tabela Fato com chaves estrangeiras para dimensões
CREATE TABLE orders (
  order_id BIGINT PRIMARY KEY,
  customer_id BIGINT REFERENCES dim_customer(customer_id),
  product_id BIGINT REFERENCES dim_product(product_id),
  order_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);`,
    },
    antiPatterns: [
      'Criar tabelas "tudo-em-um" com 100 colunas nulas misturando conceitos de domínio diferentes.',
      'Armazenar strings JSON gigantes em bancos relacionais para evitar criar relações formais quando as propriedades precisam ser filtradas com frequência.',
    ],
    bestPractices: [
      'Sempre use chaves substitutas (Surrogate Keys) nas dimensões para isolar chaves naturais do sistema de origem.',
      'Documente cardinalidades e restrições de integridade referencial explicitamente.',
    ],
    relatedIds: [2, 3, 4, 5, 6],
    quiz: {
      question: 'Qual é o principal benefício do modelo dimensional (Kimball) em relação à 3ª Forma Normal em ambientes analíticos?',
      options: [
        'Minimiza o número de JOINs complexos e simplifica consultas agregadas de negócio.',
        'Elimina completamente qualquer redundância de dados.',
        'Garante transações ACID mais rápidas para gravações de 1 registro por vez.',
        'Permite criar tabelas sem definir tipos de dados.',
      ],
      correctIndex: 0,
      explanation: 'O modelo dimensional foi desenhado para facilitar a escrita de queries analíticas intuitivas por analistas de BI, reduzindo o número de JOINs necessários através de tabelas de fatos e dimensões pré-desnormalizadas.',
    },
  },
  {
    id: 2,
    sectionId: 1,
    name: 'OLTP vs OLAP',
    tagline: 'Transacional por linha vs Analítico por coluna: o divisor de águas da engenharia de dados.',
    difficulty: 'Iniciante',
    overview: 'OLTP (Online Transaction Processing) foca em operações rápidas de leitura/escrita de registros individuais (ex: passar cartão de crédito). OLAP (Online Analytical Processing) processa agregações em bilhões de registros para relatórios (ex: receita média por categoria nos últimos 5 anos).',
    whyItMatters: 'Tentar rodar relatórios pesados no banco OLTP de produção derruba o aplicativo dos usuários. Usar um banco analítico colunar (DuckDB, BigQuery, Snowflake, ClickHouse) lê 100x menos dados do disco para agregações.',
    underTheHood: 'OLTP usa armazenamento orientado a linhas (Row-Oriented): todos os campos de um registro ficam juntos no mesmo bloco de disco. OLAP usa armazenamento colunar (Columnar): todos os valores da mesma coluna ficam contíguos no disco, permitindo compressão extrema (RLE, Dictionary) e Data Skipping.',
    realWorldExample: 'Uber: O app do motorista grava coordenadas em tempo real em um banco OLTP de baixa latência. No final do mês, analistas consultam o faturamento de milhões de corridas no OLAP.',
    labType: 'oltp-olap',
    codeSnippet: {
      language: 'sql',
      title: 'Diferença de I/O em OLTP vs OLAP',
      code: `-- Consulta típica OLAP:
-- Em Row-Store (OLTP): o disco precisa ler nome, endereço, senha, CPF de 10 milhões de linhas.
-- Em Column-Store (OLAP): o disco lê apenas os blocos das colunas 'categoria' e 'valor'.
SELECT 
    categoria, 
    COUNT(*) as total_vendas, 
    AVG(valor) as ticket_medio
FROM vendas
WHERE ano = 2026
GROUP BY categoria;`,
    },
    antiPatterns: [
      'Executar queries com SELECT * em bancos colunares OLAP, anulando a vantagem da leitura seletiva de colunas.',
      'Usar banco OLAP para criar tela de login ou cadastros unitários frequentes.',
    ],
    bestPractices: [
      'Separe estritamente as cargas de trabalho operacionais das analíticas via CDC ou réplicas analíticas.',
      'Projete índices B-Tree para OLTP e esquemas de particionamento/Z-Order para OLAP.',
    ],
    relatedIds: [1, 7, 8, 24],
    quiz: {
      question: 'Por que formatos colunares (OLAP) são ordens de grandeza mais rápidos para consultas como AVG(salario)?',
      options: [
        'Porque eles desativam a memória RAM e gravam direto em SSD.',
        'Porque não suportam operações de WHERE.',
        'Porque lêem apenas os blocos de disco referentes à coluna solicitada, comprimindo-a de forma contígua.',
        'Porque convertem os dados em arquivos de texto simples.',
      ],
      correctIndex: 2,
      explanation: 'No formato colunar, apenas as colunas envolvidas na query são lidas do disco. Para AVG(salario), o banco ignora completamente as outras 50 colunas da tabela, economizando até 95% do I/O.',
    },
  },
  {
    id: 3,
    sectionId: 1,
    name: 'Star Schema',
    tagline: 'O esquema estrela: Fatos mensuráveis no centro, Dimensões contextuais nos raios.',
    difficulty: 'Iniciante',
    overview: 'No Star Schema, uma tabela de fatos central (contendo métricas numéricas e chaves estrangeiras) se conecta diretamente a múltiplas tabelas de dimensão desnormalizadas (tempo, cliente, produto, local). Visualmente, o diagrama assemelha-se a uma estrela.',
    whyItMatters: 'É o padrão ouro da modelagem dimensional (Kimball) para Data Warehouses. Oferece queries extremamente intuitivas, com apenas 1 nível de JOIN entre fato e dimensão, facilitando a vida das ferramentas de BI e acelerando filtros.',
    underTheHood: 'Ao dispensar a normalização das dimensões, o otimizador do banco pode usar técnicas de Star Join / Bitmap Index Scans para filtrar a tabela fato com altíssima velocidade antes de ler os registros detalhados.',
    realWorldExample: 'Tabela Fato Vendas conectada a Dim_Tempo, Dim_Loja, Dim_Cliente e Dim_Promocao.',
    codeSnippet: {
      language: 'sql',
      title: 'Estrutura de Fato e Dimensões',
      code: `-- Consulta típica no Star Schema: 1 join simples por dimensão
SELECT 
    d.nome_mes,
    p.categoria,
    SUM(f.quantidade_vendida) AS total_itens,
    SUM(f.valor_total) AS receita
FROM fato_vendas f
JOIN dim_tempo d ON f.tempo_id = d.tempo_id
JOIN dim_produto p ON f.produto_id = p.produto_id
WHERE d.ano = 2026 AND p.marca = 'Acme'
GROUP BY d.nome_mes, p.categoria;`,
    },
    antiPatterns: [
      'Colocar atributos contextuais (como nome do cliente) dentro da tabela fato em vez de na dimensão.',
      'Deixar fatos sem chaves substitutas, usando chaves compostas de 6 colunas como PK.',
    ],
    bestPractices: [
      'Mantenha a granularidade da tabela fato (o significado de uma única linha) estritamente definida e imutável.',
      'Use Surrogate Keys inteiras (BIGINT) nas dimensões para joins mais rápidos.',
    ],
    relatedIds: [1, 4, 6, 7],
    quiz: {
      question: 'Qual é a principal característica visual e estrutural do Star Schema?',
      options: [
        'Todas as tabelas são normalizadas até a 3ª Forma Normal com múltiplos níveis de sub-tabelas.',
        'Uma tabela fato central se conecta diretamente a tabelas de dimensão sem sub-hierarquias normalizadas.',
        'Não existem tabelas, apenas coleções noSQL.',
        'As dimensões ficam no centro e a tabela fato fica nas pontas.',
      ],
      correctIndex: 1,
      explanation: 'O Star Schema possui uma tabela fato central rodeada por dimensões 1-hop (diretas), sem que as dimensões se desdobrem em outras tabelas normalizadas.',
    },
  },
  {
    id: 4,
    sectionId: 1,
    name: 'Snowflake Schema',
    tagline: 'A versão normalizada do Star Schema: dimensões divididas em sub-hierarquias.',
    difficulty: 'Intermediário',
    overview: 'No Snowflake Schema, as tabelas de dimensões são normalizadas em múltiplas tabelas relacionadas (ex: Dim_Produto conecta a Dim_Subcategoria, que conecta a Dim_Categoria). O diagrama ramifica-se como um floco de neve.',
    whyItMatters: 'Reduz a redundância de dados e previne inconsistências de atualização em ambientes com dimensões muito grandes ou com regras de negócio rígidas de hierarquia.',
    underTheHood: 'Enquanto o Star Schema gasta mais disco duplicando atributos na dimensão para evitar JOINs, o Snowflake economiza espaço normalizando, mas obriga o motor SQL a executar múltiplos JOINs em cadeia para resolver consultas simples.',
    realWorldExample: 'Sistemas ERP complexos (SAP) onde categorias, fornecedores e fabricantes possuem seus próprios ciclos de vida independentes.',
    codeSnippet: {
      language: 'sql',
      title: 'JOINs no Snowflake Schema',
      code: `-- Consulta no Snowflake exige múltiplos joins para alcançar o nível mais alto
SELECT 
    cat.nome_categoria,
    pais.nome_pais,
    SUM(f.valor_total) as receita
FROM fato_vendas f
JOIN dim_produto prod ON f.produto_id = prod.produto_id
JOIN dim_subcategoria sub ON prod.subcategoria_id = sub.subcategoria_id
JOIN dim_categoria cat ON sub.categoria_id = cat.categoria_id
JOIN dim_loja loja ON f.loja_id = loja.loja_id
JOIN dim_cidade cid ON loja.cidade_id = cid.cidade_id
JOIN dim_pais pais ON cid.pais_id = pais.pais_id
GROUP BY cat.nome_categoria, pais.nome_pais;`,
    },
    antiPatterns: [
      'Normalizar dimensões excessivamente em Data Warehouses modernos de nuvem, onde armazenamento é barato e JOINs pesados degradam o tempo de resposta.',
    ],
    bestPractices: [
      'Adote Snowflake apenas quando a dimensão tiver cardinalidade explosiva e alterações frequentes que justificam evitar anomalias de atualização.',
    ],
    relatedIds: [1, 3, 5, 6],
    quiz: {
      question: 'Qual é a principal contrapartida (trade-off) ao escolher Snowflake Schema em vez de Star Schema?',
      options: [
        'Impede a criação de chaves estrangeiras.',
        'Não permite armazenar números decimais.',
        'Torna a escrita de relatórios em ferramentas de BI muito mais simples.',
        'Economiza armazenamento normalizando dimensões, mas adiciona complexidade e custo de múltiplos JOINs nas queries.',
      ],
      correctIndex: 3,
      explanation: 'O Snowflake reduz redundância, mas adiciona JOINs adicionais (dimensão -> sub-dimensão), o que encarece o plano de execução e complica a vida do analista.',
    },
  },
  {
    id: 5,
    sectionId: 1,
    name: 'Normalization',
    tagline: 'Organizar dados para eliminar anomalias de inserção, exclusão e atualização.',
    difficulty: 'Iniciante',
    overview: 'Normalização é a técnica formal de decompor tabelas para que cada fato seja armazenado em exatamente um lugar. É governada pelas Formas Normais: 1NF (valores atômicos), 2NF (dependência funcional total da PK) e 3NF (sem dependências transitivas).',
    whyItMatters: 'Impede erros catastróficos onde alterar o endereço de um cliente exige atualizar 500 pedidos antigos, sob risco de inconsistência se um falhar.',
    underTheHood: 'Na 3NF, qualquer coluna não-chave depende "da chave, de toda a chave e de nada além da chave" (lema de Codd). Isso otimiza para operações transacionais ACID com locks minúsculos por registro.',
    realWorldExample: 'Sistemas bancários: A conta corrente do cliente é uma entidade separada da transação bancária para evitar duplicar o saldo a cada transferência.',
    codeSnippet: {
      language: 'sql',
      title: 'Transição para 3NF',
      code: `-- Não normalizado (anomalia de redundância):
-- pedidos(pedido_id, data, cliente_id, nome_cliente, endereco_cliente)

-- 3NF: Separado em entidades atômicas
CREATE TABLE clientes (
    cliente_id BIGINT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE pedidos (
    pedido_id BIGINT PRIMARY KEY,
    cliente_id BIGINT REFERENCES clientes(cliente_id),
    criado_em TIMESTAMP NOT NULL
);`,
    },
    antiPatterns: [
      'Normalizar até 3NF dentro de pipelines de agregação analítica no Data Lake, forçando shuffles desnecessários no Spark.',
    ],
    bestPractices: [
      'Mantenha OLTP na 3NF e transforme para modelo dimensional desnormalizado na camada analítica.',
    ],
    relatedIds: [1, 2, 6],
    quiz: {
      question: 'O que define uma tabela na 3ª Forma Normal (3NF)?',
      options: [
        'Possuir 3 chaves estrangeiras apontando para o mesmo banco.',
        'Conter no máximo 3 colunas por tabela.',
        'Estar na 2NF e não possuir dependências transitivas (atributos não-chave dependendo de outros atributos não-chave).',
        'Guardar todas as informações em uma única linha.',
      ],
      correctIndex: 2,
      explanation: 'Para atingir a 3NF, a tabela deve estar na 2NF e garantir que nenhum atributo não-chave dependa de outro atributo não-chave (eliminação de dependência transitiva).',
    },
  },
  {
    id: 6,
    sectionId: 1,
    name: 'Denormalization',
    tagline: 'Duplicar dados intencionalmente para maximizar a velocidade de leitura.',
    difficulty: 'Intermediário',
    overview: 'Desnormalização é a estratégia de reintroduzir redundância de dados em tabelas analíticas para evitar JOINs custosos em tempo de execução, fundindo entidades relacionadas em tabelas amplas (Wide Tables / OBT - One Big Table).',
    whyItMatters: 'Em motores modernos (BigQuery, ClickHouse, Snowflake), tabelas desnormalizadas em formato colunar têm leitura vetorial veloz e eliminam operações de Shuffle e Broadcast Joins distribuídos.',
    underTheHood: 'Como formatos colunares (Parquet, ORC) usam compressão Run-Length Encoding (RLE) e Dictionary Encoding, valores repetidos em colunas desnormalizadas ocupam quase zero espaço adicional em bytes no disco.',
    realWorldExample: 'Google Analytics ou Mixpanel: OBT contendo evento, timestamp, user_agent, país, cidade, id_sessao e versão do app na mesma linha.',
    codeSnippet: {
      language: 'sql',
      title: 'Criação de OBT (One Big Table) desnormalizada',
      code: `-- Tabela ampla analítica para consumo direto no Tableau / PowerBI
CREATE TABLE obt_pedidos_analitico AS
SELECT 
    p.pedido_id,
    p.data_pedido,
    c.cliente_id,
    c.nome_cliente,
    c.cidade,
    c.estado,
    prod.nome_produto,
    prod.categoria,
    i.quantidade,
    i.preco_unitario,
    (i.quantidade * i.preco_unitario) as valor_total
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.cliente_id
JOIN itens_pedido i ON p.pedido_id = i.pedido_id
JOIN produtos prod ON i.produto_id = prod.produto_id;`,
    },
    antiPatterns: [
      'Desnormalizar no banco transacional primário sem mecanismos automáticos de sincronização, gerando dados órfãos.',
    ],
    bestPractices: [
      'Aplique desnormalização nas camadas finais de consumo (camada Gold / Data Marts) preservando os dados brutos normalizados na camada intermediária.',
    ],
    relatedIds: [2, 3, 5, 10],
    quiz: {
      question: 'Por que a desnormalização não explode o tamanho em disco em Data Warehouses modernos colunares?',
      options: [
        'Porque a compressão colunar (como Dictionary Encoding) codifica valores repetidos com poucos bits.',
        'Porque os motores apagam os dados antigos automaticamente.',
        'Porque o banco salva apenas números.',
        'Porque a memória RAM armazena tudo sem ir ao disco.',
      ],
      correctIndex: 0,
      explanation: 'Em armazenamento colunar, se um país "Brasil" se repete 1 milhão de vezes na mesma coluna contígua, o dicionário salva "Brasil" uma única vez e representa as repetições como ponteiros leves de bits.',
    },
  },
  {
    id: 7,
    sectionId: 1,
    name: 'Data Warehouse',
    tagline: 'O repositório analítico central, altamente estruturado e otimizado para BI.',
    difficulty: 'Iniciante',
    overview: 'Data Warehouse (DW) é um sistema de banco de dados projetado especificamente para análise e relatórios de dados históricos agregados de múltiplas fontes. Opera sob o paradigma "Schema-on-Write" (esquema rígido na gravação).',
    whyItMatters: 'Permite que tomadores de decisão consultem métricas de negócios confiáveis (fonte única da verdade) com velocidade e governança centralizada sem impactar os sistemas transacionais operacionais.',
    underTheHood: 'DWs modernos (Snowflake, BigQuery, Redshift) desacoplam armazenamento de computação. Armazenamento em nuvem durável (S3/GCS) + nós de computação efêmeros (Warehouses virtuais) que escalam dinamicamente.',
    realWorldExample: 'Grandes varejistas integrando dados de PDV físico, e-commerce, ERP e sistemas de frete em um único DW para calcular a margem líquida de lucro em tempo real.',
    codeSnippet: {
      language: 'sql',
      title: 'Query analítica típica em Data Warehouse',
      code: `-- Análise de retenção de clientes por coorte
WITH coortes AS (
  SELECT 
    cliente_id,
    DATE_TRUNC('month', MIN(data_primeira_compra)) as mes_coorte
  FROM dim_clientes
  GROUP BY 1
)
SELECT 
  c.mes_coorte,
  DATE_TRUNC('month', v.data_venda) as mes_atividade,
  COUNT(DISTINCT v.cliente_id) as clientes_ativos,
  SUM(v.valor) as faturamento_total
FROM fato_vendas v
JOIN coortes c ON v.cliente_id = c.cliente_id
GROUP BY 1, 2
ORDER BY 1, 2;`,
    },
    antiPatterns: [
      'Tratar o DW como um "lixão de dados" inserindo JSONs não estruturados sem modelagem ou curadoria prévia.',
      'Fazer ingestão linha a linha (single inserts) em vez de micro-batches ou bulk loading.',
    ],
    bestPractices: [
      'Defina contratos de dados e testes de qualidade na entrada do Data Warehouse.',
      'Aproveite clustering keys e partition pruning para controlar custos de queries.',
    ],
    relatedIds: [2, 3, 8, 9],
    quiz: {
      question: 'Qual é o paradigma fundamental de ingestão de dados em um Data Warehouse tradicional?',
      options: [
        'Schema-on-Read: grava qualquer arquivo e só valida ao ler.',
        'Dynamic-Schema: cada linha pode ter tipos e colunas arbitrários.',
        'No-Schema: schemas são proibidos em DW.',
        'Schema-on-Write: os dados precisam obedecer a uma estrutura e tipos estritos antes de serem gravados.',
      ],
      correctIndex: 3,
      explanation: 'Data Warehouses tradicionais utilizam Schema-on-Write, garantindo consistência, tipagem e validação rigorosa na etapa de carregamento para manter a integridade dos relatórios.',
    },
  },
  {
    id: 8,
    sectionId: 1,
    name: 'Data Lake',
    tagline: 'O oceano de dados brutos: armazene tudo em formato nativo a custo ultra baixo.',
    difficulty: 'Iniciante',
    overview: 'Data Lake é um repositório centralizado que permite armazenar dados estruturados, semi-estruturados (JSON, Parquet, Avro) e não estruturados (áudios, imagens, PDFs, logs) em qualquer escala, baseado no paradigma "Schema-on-Read".',
    whyItMatters: 'Permite ingerir dados imediatamente sem esperar meses por modelagens de banco, viabilizando casos de uso de Machine Learning, exploração de cientistas de dados e arquivamento de logs volumosos a custo muito inferior ao DW.',
    underTheHood: 'Baseia-se em armazenamento de objetos em nuvem (Amazon S3, Google Cloud Storage, Azure Data Lake Gen2). Não possui um motor de computação nativo embutido: motores externos (Spark, Presto, Trino, Athena) lêem os arquivos diretamente via storage APIs.',
    realWorldExample: 'Sistemas de IoT em carros autônomos que transmitem terabytes diários de telemetria, vídeos de câmeras e leituras de sensores LIDAR para um bucket S3.',
    codeSnippet: {
      language: 'python',
      title: 'Leitura Schema-on-Read no Data Lake com PySpark',
      code: `from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("DataLakeIngestion").getOrCreate()

# Schema-on-read: O Spark infere ou aplica o schema sobre arquivos brutos no S3
raw_df = spark.read.json("s3a://empresa-data-lake-raw/telemetria/ano=2026/mes=10/*.json")

# Filtrando dados brutos sem necessidade de carregar em banco relacional
cleaned_df = raw_df.filter(raw_df["status"] == "OPERATIONAL")
cleaned_df.write.parquet("s3a://empresa-data-lake-processed/telemetria_parquet/")`,
    },
    antiPatterns: [
      'Falta de catálogo e governança, transformando o Data Lake em um "Data Swamp" (pântano de dados ilegíveis e sem dono).',
      'Gerar milhões de micro-arquivos de 2KB, degradando as chamadas de API do S3.',
    ],
    bestPractices: [
      'Estruture diretórios com particionamento temporal padronizado (`year=YYYY/month=MM/day=DD/`).',
      'Converta dados brutos para formatos colunares comprimidos (Parquet) o mais cedo possível.',
    ],
    relatedIds: [7, 9, 21, 30],
    quiz: {
      question: 'O que diferencia o paradigma Schema-on-Read de um Data Lake do Schema-on-Write de um Data Warehouse?',
      options: [
        'Schema-on-Read significa que ninguém pode ler os dados.',
        'No Schema-on-Read, os dados são gravados no formato nativo bruto e a validação/estrutura só é aplicada no momento da leitura.',
        'Data Lakes exigem criação prévia de DDL com CREATE TABLE antes de fazer upload de arquivos.',
        'Schema-on-Read é exclusivo para bancos de dados em memória RAM.',
      ],
      correctIndex: 1,
      explanation: 'No Schema-on-Read os arquivos são salvos como chegam da fonte (JSON, CSV, binários), cabendo ao leitor interpretar os campos e tipos no momento da consulta.',
    },
  },
  {
    id: 9,
    sectionId: 1,
    name: 'Lakehouse',
    tagline: 'O melhor dos dois mundos: transações ACID e governança sobre armazenamento aberto de Lake.',
    difficulty: 'Intermediário',
    overview: 'Lakehouse é uma arquitetura moderna que combina a flexibilidade e o baixo custo de armazenamento do Data Lake com o gerenciamento, confiabilidade, governança e suporte a transações ACID de um Data Warehouse tradicional.',
    whyItMatters: 'Elimina a necessidade da arquitetura duplicada clássica (Lake para dados brutos + DW separado para BI), reduzindo custos de replicação e prevenindo divergências de números entre relatórios e modelos de Machine Learning.',
    underTheHood: 'Implementado através de camadas de metadados abertas (Delta Lake, Apache Iceberg, Apache Hudi) posicionadas sobre arquivos Parquet no object storage. Um log de transações atômico grava cada commit (INSERT/UPDATE/DELETE), garantindo isolamento Snapshot e Time Travel.',
    realWorldExample: 'Databricks Lakehouse Platform ou Snowflake Iceberg Tables unificando pipelines de Engenharia de Dados, BI no PowerBI e modelos generativos de IA na mesma base.',
    codeSnippet: {
      language: 'sql',
      title: 'Operações ACID em Lakehouse (Delta Lake / Iceberg)',
      code: `-- Em um Lake tradicional isso exigiria reescrever todos os arquivos da pasta!
-- No Lakehouse, o log de transações gerencia a mutabilidade com ACID:
MERGE INTO lakehouse.clientes_gold AS target
USING clientes_atualizados_silver AS source
ON target.cliente_id = source.cliente_id
WHEN MATCHED AND source.excluido = true THEN
  DELETE
WHEN MATCHED THEN
  UPDATE SET target.email = source.email, target.atualizado_em = current_timestamp()
WHEN NOT MATCHED THEN
  INSERT (cliente_id, nome, email, criado_em)
  VALUES (source.cliente_id, source.nome, source.email, current_timestamp());`,
    },
    antiPatterns: [
      'Substituir arquivos diretamente no bucket S3 via AWS CLI sem passar pelo catálogo ou driver de transação do Lakehouse, corrompendo os metadados.',
    ],
    bestPractices: [
      'Execute rotinas periódicas de COMPACT/OPTIMIZE e VACUUM para manter arquivos limpos e organizados.',
      'Aproveite o Time Travel para auditorias e testes de regressão de pipelines.',
    ],
    relatedIds: [7, 8, 10, 61, 62, 63, 64, 65],
    quiz: {
      question: 'Qual camada técnica permite ao Lakehouse fornecer transações ACID sobre arquivos estáticos no S3/GCS?',
      options: [
        'Um servidor de banco relacional MySQL oculto que copia os arquivos para a memória.',
        'Um Transaction Log atômico baseado em commits de metadados (como o Delta Log ou Iceberg Metadata Tree).',
        'Hardware proprietário especial na nuvem.',
        'A desativação do protocolo HTTP.',
      ],
      correctIndex: 1,
      explanation: 'O Lakehouse utiliza uma camada de metadados transacional (ex: Delta Log ou manifests Iceberg) que registra commits atômicos, permitindo leituras consistentes e isoladas mesmo enquanto gravações ocorrem.',
    },
  },
  {
    id: 10,
    sectionId: 1,
    name: 'Medallion',
    tagline: 'Bronze (Bruto), Silver (Limpo & Tipado), Gold (Agregado & Negócio): a arquitetura multicamadas.',
    difficulty: 'Iniciante',
    overview: 'A arquitetura Medallion organiza os dados em três camadas de qualidade incremental dentro de um Lakehouse: Bronze (dados brutos append-only), Silver (dados limpos, filtrados, deduplicados e enriquecidos) e Gold (tabelas de consumo de negócio agregadas e prontas para BI/ML).',
    whyItMatters: 'Cria uma esteira previsível de saneamento e linhagem de dados. Se uma regra de negócio mudar ou um bug for detectado no Silver, a camada Bronze preserva a integridade original para reprocessamento completo.',
    underTheHood: 'Bronze atua como buffer histórico imutável. Silver aplica contratos de dados, regras de chave única, descarte de nulos inválidos e joins de referência. Gold aplica métricas sumarizadas em Star Schema ou OBTs preparadas para query engines.',
    realWorldExample: 'Sistemas de streaming de pagamentos: Bronze recebe payloads JSON crus do Kafka; Silver filtra fraudes e normaliza moedas para BRL; Gold calcula o volume financeiro transacionado por minuto para a diretoria.',
    labType: 'medallion',
    codeSnippet: {
      language: 'python',
      title: 'Fluxo Medallion em PySpark',
      code: `# 1. BRONZE -> SILVER: Limpeza, tipagem e descarte de duplicados
bronze_df = spark.readStream.table("lakehouse.bronze_pedidos_raw")

silver_df = bronze_df \\
    .filter("status IS NOT NULL AND valor > 0") \\
    .dropDuplicates(["pedido_id"]) \\
    .withColumn("processado_em", current_timestamp())

silver_df.writeStream.table("lakehouse.silver_pedidos")

# 2. SILVER -> GOLD: Agregação de KPIs de negócio
gold_df = spark.read.table("lakehouse.silver_pedidos") \\
    .groupBy("categoria", "data_pedido") \\
    .agg(sum("valor").alias("faturamento_total"), count("*").alias("qtd_vendas"))

gold_df.write.format("delta").mode("overwrite").saveAsTable("lakehouse.gold_faturamento_diario")`,
    },
    antiPatterns: [
      'Permitir que usuários finais ou dashboards de BI consumam diretamente da camada Bronze.',
      'Apagar os dados da camada Bronze após processar para a Silver, perdendo a capacidade de reprocessamento (replayability).',
    ],
    bestPractices: [
      'Mantenha a camada Bronze estritamente append-only e com retenção calculada.',
      'Aplique testes automatizados de Data Quality nas fronteiras entre Bronze -> Silver e Silver -> Gold.',
    ],
    relatedIds: [8, 9, 16, 58],
    quiz: {
      question: 'Qual é o papel da camada Silver na arquitetura Medallion?',
      options: [
        'Apenas arquivar backups compactados em fitas magnéticas.',
        'Receber dumps de bancos sem nenhuma transformação.',
        'Servir exclusivamente tabelas agregadas finais para gráficos de diretoria.',
        'Limpar, tipar, deduplicar e padronizar os dados brutos da Bronze, tornando-os uma visão limpa e enriquecida da verdade.',
      ],
      correctIndex: 3,
      explanation: 'A camada Silver é a fase de saneamento onde os dados brutos da Bronze são validados, enriquecidos, deduplicados e estruturados com esquemas bem definidos.',
    },
  },
];
