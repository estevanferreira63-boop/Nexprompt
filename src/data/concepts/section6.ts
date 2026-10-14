import { Concept } from '../../types/concept';

export const SECTION_6_CONCEPTS: Concept[] = [
  {
    id: 71,
    sectionId: 6,
    name: 'Feature Engineering',
    tagline: 'A arte de transformar dados brutos nos atributos matemáticos mais preditivos para modelos de IA.',
    difficulty: 'Iniciante',
    overview: 'Feature Engineering é o processo de selecionar, manipular e transformar variáveis brutas (como timestamps, textos, valores monetários) em características numéricas estruturadas (features) que maximizam a acurácia de modelos de Machine Learning.',
    whyItMatters: '"Bons modelos com dados ruins perdem de modelos simples com excelentes features". Criar features informativas (ex: proporção de gastos nos fins de semana) é o que diferencia previsões medíocres de modelos de alta precisão.',
    underTheHood: 'Técnicas clássicas: 1) Normalização e Padronização (MinMax, Z-score); 2) One-Hot Encoding e Target Encoding para categóricas; 3) Janelas temporais móveis (média dos últimos 30 dias); 4) Embeddings densos para texto e imagem; 5) Interação de variáveis (razão entre dívida e renda).',
    realWorldExample: 'Previsão de fraude bancária: em vez de passar apenas o valor da compra, calcular a feature `desvio_padrao_em_relacao_a_media_do_cliente` e `tempo_desde_ultima_transacao`.',
    codeSnippet: {
      language: 'python',
      title: 'Cálculo de Features com PySpark Window Functions',
      code: `from pyspark.sql.window import Window
from pyspark.sql.functions import avg, count, col

# Janela móvel dos últimos 30 dias por cliente
janela_30d = Window.partitionBy("cliente_id") \\
    .orderBy(col("timestamp_transacao").cast("long")) \\
    .rangeBetween(-30 * 86400, 0)

df_features = df_transacoes.withColumn("media_gasto_30d", avg("valor").over(janela_30d)) \\
                           .withColumn("qtd_transacoes_30d", count("id").over(janela_30d))`,
    },
    antiPatterns: ['Data Leakage: usar informações do futuro (que não estariam disponíveis no momento da predição real) para calcular features no treino.'],
    bestPractices: ['Isole o cálculo de features usando pipelines reproduzíveis com controle de tempo estrito (point-in-time correctness).'],
    relatedIds: [72, 73, 76, 77],
    quiz: {
      question: 'O que é "Data Leakage" (Vazamento de Dados) em Feature Engineering?',
      options: [
        'Quando variáveis que contêm informações do futuro (indisponíveis no momento real da inferência) são acidentalmente incluídas no conjunto de treino do modelo.',
        'Quando alguém rouba os dados da empresa pela internet.',
        'Quando o banco de dados desliga por falta de memória.',
        'Quando o modelo é salvo em formato texto.',
      ],
      correctIndex: 0,
      explanation: 'O vazamento de dados faz o modelo parecer milagrosamente perfeito nos testes de treino, mas falhar miseravelmente na produção onde o futuro ainda não aconteceu.',
    },
  },
  {
    id: 72,
    sectionId: 6,
    name: 'Feature Store',
    tagline: 'O catálogo central de features: consistência garantida entre treino em batch e inferência em tempo real.',
    difficulty: 'Intermediário',
    overview: 'Feature Store (como Feast, Hopsworks, Tecton) é um repositório centralizado projetado para armazenar, versionar, documentar e servir features de Machine Learning tanto para treinamento (Offline Store em Parquet/Lakehouse) quanto para predições online (Online Store em Redis/DynamoDB).',
    whyItMatters: 'Resolve o pesadelo do "Training-Serving Skew": a feature de média de gastos era calculada em SQL pelo engenheiro de dados para treino, mas reimplementada em Python pelo desenvolvedor na API com sutis diferenças de lógica.',
    underTheHood: 'Dupla camada de armazenamento: 1) **Offline Store**: tabelas Lakehouse (Delta/Iceberg) com suporte a point-in-time joins para gerar datasets de treino sem data leakage; 2) **Online Store**: banco chave-valor em memória com latência sub-10ms para alimentar APIs de inferência em tempo real.',
    realWorldExample: 'Uber (Michelangelo) e Nubank usando Feature Stores para reutilizar milhares de features calculadas uma única vez por múltiplos modelos de crédito e fraude.',
    codeSnippet: {
      language: 'python',
      title: 'Definição de Feature View no Feast',
      code: `from feast import Entity, Field, FeatureView, ValueType
from feast.types import Float32, Int64

cliente = Entity(name="cliente_id", value_type=ValueType.INT64)

cliente_features = FeatureView(
    name="cliente_metricas_credito",
    entities=[cliente],
    ttl=timedelta(days=365),
    schema=[
        Field(name="score_credito", dtype=Float32),
        Field(name="media_gasto_mensal", dtype=Float32),
        Field(name="atrasos_ultimos_12m", dtype=Int64),
    ],
    online=True, # Sincroniza automaticamente com Redis!
    source=fonte_lakehouse_parquet
)`,
    },
    antiPatterns: ['Cada cientista de dados calcular suas próprias features em notebooks locais isolados sem compartilhamento ou versionamento.'],
    bestPractices: ['Utilize point-in-time correctness nativo da Feature Store ao gerar datasets de treino históricos.'],
    relatedIds: [71, 73, 75, 79],
    quiz: {
      question: 'Qual problema crônico o Feature Store resolve com sua arquitetura dual (Offline Store + Online Store)?',
      options: [
        'A necessidade de comprar licenças de software caras.',
        'A perda de pacotes de rede Wi-Fi.',
        'O Training-Serving Skew: divergências na lógica de cálculo de features entre o ambiente de treino (batch) e o ambiente de produção em tempo real (online).',
        'O limite de conexões USB no servidor.',
      ],
      correctIndex: 2,
      explanation: 'O Feature Store unifica a definição das features em uma única fonte da verdade, garantindo que o valor usado no treino offline seja idêntico ao consultado na inferência online.',
    },
  },
  {
    id: 73,
    sectionId: 6,
    name: 'Training vs Inference',
    tagline: 'Os dois hemisférios do ciclo de vida de IA: aprender com o passado vs prever o presente.',
    difficulty: 'Iniciante',
    overview: 'Treinamento (Training) é a fase pesada onde o modelo aprende padrões a partir de dados históricos ajustando milhões ou bilhões de parâmetros (pesos) através de otimização matemática (Backpropagation). Inferência (Inference) é a fase operacional onde o modelo já treinado recebe novos dados e gera predições.',
    whyItMatters: 'Possuem requisitos de infraestrutura e engenharia de dados completamente opostos: Treino exige paralelismo massivo em GPUs/TPUs durante dias; Inferência exige baixíssima latência, concorrência e custo enxuto por requisição.',
    underTheHood: 'Treino otimiza funções de perda (Loss Function) com gradiente descendente estocástico (SGD/Adam) em batches. Inferência executa apenas o Forward Pass (multiplicação de matrizes) com o grafo congelado, frequentemente acelerado via quantização (FP16, INT8, INT4).',
    realWorldExample: 'Treinar um LLM de 70 bilhões de parâmetros consome semanas em clusters de GPUs H100; fazer inferência de uma resposta para o usuário leva 800 milissegundos via vLLM.',
    codeSnippet: {
      language: 'python',
      title: 'Distinção de Modo em PyTorch',
      code: `# 1. FASE DE TREINO (ajuste de pesos, consome muita memória de GPU):
modelo.train()
for batch_x, batch_y in dataloader:
    optimizer.zero_grad()
    saida = modelo(batch_x)
    loss = criterio(saida, batch_y)
    loss.backward() # Backpropagation
    optimizer.step()

# 2. FASE DE INFERÊNCIA (apenas predição, grafo congelado, sem gradiente):
modelo.eval()
with torch.no_grad():
    predicao = modelo(novo_dado_cliente)`,
    },
    antiPatterns: ['Rodar inferência mantendo o grafo de cálculo de gradientes ativo (`torch.no_grad()` esquecido), gastando o dobro de memória e tempo.'],
    bestPractices: ['Aplique técnicas de otimização de inferência (como ONNX Runtime, TensorRT ou vLLM) antes de colocar modelos em produção.'],
    relatedIds: [71, 74, 75, 79],
    quiz: {
      question: 'Por que a fase de Treinamento costuma ser muito mais cara computacionalmente do que a fase de Inferência?',
      options: [
        'Porque inferência não usa computadores.',
        'Porque o treino é cobrado em dólares e a inferência em reais.',
        'Porque na inferência o modelo inventa os pesos.',
        'Porque o treino exige processar terabytes de dados históricos em múltiplas passagens (épocas) calculando derivadas parciais e gradientes para atualizar bilhões de pesos.',
      ],
      correctIndex: 3,
      explanation: 'O treinamento envolve o Forward Pass e o Backward Pass (cálculo de gradientes via Backpropagation) repetidos milhões de vezes, exigindo infraestrutura de supercomputação.',
    },
  },
  {
    id: 74,
    sectionId: 6,
    name: 'Batch ML',
    tagline: 'Predições em escala industrial: calcule scores de milhões de clientes de uma só vez.',
    difficulty: 'Iniciante',
    overview: 'Batch ML (Inferência em Lote) é a execução de predições do modelo em grandes conjuntos estáticos de dados em intervalos agendados (ex: todas as noites). Os scores preditos são gravados em tabelas do Lakehouse ou bancos para consulta posterior.',
    whyItMatters: 'É extremamente simples e barato de operar. Se você precisa calcular o score de propensão de churn de 20 milhões de clientes, não faz sentido ter uma API em tempo real: basta rodar um job Spark noturno em 30 minutos.',
    underTheHood: 'Utiliza clusters distribuídos (Spark com Pandas UDFs ou Ray Core) para particionar o dataset e carregar o modelo de ML na memória de cada core da CPU/GPU, computando predições vetorizadas de alta vazão.',
    realWorldExample: 'Netflix calculando as recomendações personalizadas da página inicial de 200 milhões de usuários durante a madrugada.',
    codeSnippet: {
      language: 'python',
      title: 'Batch Scoring no PySpark com Pandas UDF',
      code: `import pandas as pd
from pyspark.sql.functions import pandas_udf
import mlflow.pyfunc

# Carrega modelo registrado no MLflow
modelo_carregado = mlflow.pyfunc.load_model("models:/PrevisaoChurn/Production")

@pandas_udf("double")
def prever_churn_batch(features_series: pd.Series) -> pd.Series:
    return pd.Series(modelo_carregado.predict(features_series))

# Aplica em 50 milhões de linhas em paralelo no cluster:
df_com_score = df_clientes.withColumn("probabilidade_churn", prever_churn_batch("features"))
df_com_score.write.mode("overwrite").parquet("s3://scores/churn_diario/")`,
    },
    antiPatterns: ['Usar arquiteturas complexas de streaming e microsserviços caros para casos onde uma previsão noturna atende 100% da necessidade de negócio.'],
    bestPractices: ['Aproveite bibliotecas de inferência em lote vetorizadas para maximizar o uso de instruções AVX da CPU.'],
    relatedIds: [11, 73, 75, 78],
    quiz: {
      question: 'Quando é mais recomendado utilizar Batch ML em vez de Real-time ML?',
      options: [
        'Quando a decisão precisa ser tomada em menos de 50 milissegundos enquanto o usuário clica em um botão.',
        'Quando as predições podem ser pré-calculadas periodicamente (ex: diário ou semanal) e consultadas posteriormente em um banco ou dashboard.',
        'Quando não existem dados de treino.',
        'Quando o modelo não tem parâmetros.',
      ],
      correctIndex: 1,
      explanation: 'Batch ML é a escolha ideal quando a aplicação não exige latência imediata no momento exato da interação do usuário, permitindo pré-computar predições com alto rendimento e baixo custo.',
    },
  },
  {
    id: 75,
    sectionId: 6,
    name: 'Real-time ML',
    tagline: 'Decisões em milissegundos: modelos servidos via API para predições instantâneas.',
    difficulty: 'Intermediário',
    overview: 'Real-time ML (Inferência Online em Tempo Real) é o padrão onde o modelo de IA é exposto como um microsserviço de baixa latência (HTTP/gRPC) que recebe dados do contexto atual do usuário, consulta features frescas e retorna uma predição em sub-100 milissegundos.',
    whyItMatters: 'Indispensável quando a decisão depende do contexto efêmero do exato segundo presente: aprovação de pagamento no cartão de crédito, lances de leilão em anúncios (RTB) ou preços dinâmicos de corridas de app.',
    underTheHood: 'Arquitetura de microsserviço otimizada: a requisição chega no Gateway, a API busca features históricas no Online Feature Store (Redis) em 3ms, monta o vetor de entrada e passa pelo runtime otimizado (ONNX Runtime, Triton Inference Server) em 10ms.',
    realWorldExample: 'Detecção de fraude do cartão de crédito no momento da compra na maquininha.',
    codeSnippet: {
      language: 'python',
      title: 'API de Inferência em Tempo Real com FastAPI e ONNX Runtime',
      code: `from fastapi import FastAPI
import onnxruntime as ort
import numpy as np

app = FastAPI()
# Runtime C++ ultra veloz carregado na inicialização
session = ort.InferenceSession("modelo_fraude.onnx")

@app.post("/v1/predict/fraude")
def prever_fraude(dados: dict):
    # Transforma payload em array numpy
    vetor_entrada = np.array([[dados["valor"], dados["distancia_km"], dados["tentativas_senha"]]], dtype=np.float32)
    # Executa inferência em < 5 milissegundos
    outputs = session.run(None, {"input": vetor_entrada})
    probabilidade = float(outputs[0][0][1])
    
    return {"bloquear_transacao": probabilidade > 0.85, "score": probabilidade}`,
    },
    antiPatterns: ['Calcular agregações históricas pesadas de 90 dias diretamente dentro da rota da API em tempo de execução, estourando o timeout de 100ms.'],
    bestPractices: ['Separe as features pré-computadas (no Redis) dos dados de contexto em tempo real que chegam no payload da requisição.'],
    relatedIds: [12, 72, 73, 79],
    quiz: {
      question: 'Qual é o maior desafio de engenharia em sistemas de Real-time ML?',
      options: [
        'A cor do botão da interface.',
        'Instalar o sistema operacional.',
        'Garantir latências p99 extremamente baixas (<100ms) sob alta concorrência de requisições, unindo busca de features em tempo real com inferência eficiente.',
        'Escrever arquivos em formato CSV.',
      ],
      correctIndex: 2,
      explanation: 'O desafio central é a latência e a concorrência: a API precisa buscar features em caches de memória e rodar a matemática do modelo antes do timeout do cliente.',
    },
  },
  {
    id: 76,
    sectionId: 6,
    name: 'Model Drift',
    tagline: 'A obsolescência silenciosa: quando a relação entre as features e o mundo real muda.',
    difficulty: 'Intermediário',
    overview: 'Model Drift (ou Concept Drift) ocorre quando a relação matemática fundamental entre as variáveis preditoras (features) e a variável alvo (target) se altera no mundo real ao longo do tempo, degradando a acurácia do modelo mesmo que a distribuição das variáveis de entrada pareça normal.',
    whyItMatters: 'Modelos de machine learning não avisam quando ficam burros. Um modelo de precificação imobiliária treinado antes de uma crise econômica passará a errar grosseiramente porque o comportamento dos compradores mudou.',
    underTheHood: 'Formalmente, ocorre quando a probabilidade condicional muda: `P(Y | X)` se altera. Monitorado comparando métricas reais de performance (RMSE, F1-Score, AUC-ROC) à medida que as etiquetas verdadeiras (Ground Truth) chegam com o passar dos dias.',
    realWorldExample: 'Pandemia de 2020: modelos preditivos de demanda de passagens aéreas e hotéis tornaram-se instantaneamente inúteis do dia para a noite.',
    labType: 'drift-monitor',
    codeSnippet: {
      language: 'python',
      title: 'Monitoramento de Concept Drift com Evidently AI',
      code: `from evidently.report import Report
from evidently.metric_preset import ClassificationPreset

# Compara as métricas do modelo no mês de lançamento vs mês atual:
report = Report(metrics=[ClassificationPreset()])
report.run(reference_data=df_producao_mes_passado, current_data=df_producao_mes_atual)

# Se a acurácia ou F1-score cair abaixo do limiar, dispara alerta para retreinamento:
# report.save_html("relatorio_concept_drift.html")`,
    },
    antiPatterns: ['Colocar um modelo em produção e nunca mais medir sua acurácia real, assumindo que ele continuará funcionando para sempre.'],
    bestPractices: ['Estabeleça loops contínuos de coleta de Ground Truth para recalcular métricas de negócio periodicamente.'],
    relatedIds: [77, 78, 79],
    quiz: {
      question: 'O que define o Concept Drift (Model Drift)?',
      options: [
        'A alteração da relação entre as features de entrada e a variável alvo no mundo real ao longo do tempo (P(Y | X)), fazendo o modelo perder acurácia.',
        'A quebra física dos discos do servidor.',
        'A falta de eletricidade no data center.',
        'A remoção de uma coluna da tabela.',
      ],
      correctIndex: 0,
      explanation: 'O Concept Drift acontece quando o comportamento do mundo muda: os mesmos inputs agora levam a resultados diferentes, exigindo retreinamento do modelo com dados recentes.',
    },
  },
  {
    id: 77,
    sectionId: 6,
    name: 'Data Drift',
    tagline: 'Covariate Shift: quando as variáveis de entrada mudam de distribuição antes mesmo do resultado ser conhecido.',
    difficulty: 'Intermediário',
    overview: 'Data Drift (ou Covariate Shift) ocorre quando a distribuição estatística das variáveis preditoras de entrada `P(X)` se altera significativamente entre os dados de treinamento e os dados que estão chegando em produção no momento.',
    whyItMatters: 'A grande vantagem do Data Drift é que ele pode ser detectado instantaneamente, sem esperar semanas pelas etiquetas verdadeiras (Ground Truth). Se o público do app mudar de jovens de 20 anos para idosos de 70 anos, você sabe imediatamente que o modelo operará fora de sua zona de calibração.',
    underTheHood: 'Utiliza testes estatísticos rigorosos: Kolmogorov-Smirnov (KS-test) para variáveis numéricas contínuas, Chi-Square para variáveis categóricas, e Population Stability Index (PSI). Um PSI > 0.2 geralmente indica drift severo exigindo ação.',
    realWorldExample: 'Uma fintech expande suas operações para um novo país: a distribuição de salários e padrões de gastos dos novos usuários é completamente diferente da base inicial.',
    labType: 'drift-monitor',
    codeSnippet: {
      language: 'python',
      title: 'Detecção de Data Drift com PSI (Population Stability Index)',
      code: `import numpy as np

def calculate_psi(esperado, atual, buckets=10):
    # Calcula a estabilidade da distribuição entre treino e produção
    # PSI < 0.1: Sem mudança significativa
    # 0.1 <= PSI < 0.2: Mudança moderada (alerta)
    # PSI >= 0.2: Mudança severa (disparar retreino obrigatório!)
    pass # Implementação estatística de divergência de Kullback-Leibler`,
    },
    antiPatterns: ['Ignorar desvios de distribuição de features até que os clientes reclamem de decisões incorretas do sistema.'],
    bestPractices: ['Configure alertas automáticos de PSI e KS-test nos pipelines diários de ingestão de features.'],
    relatedIds: [76, 78, 79],
    quiz: {
      question: 'Por que detectar Data Drift é tão valioso mesmo antes de receber o Ground Truth (os resultados reais)?',
      options: [
        'Porque permite alertar proativamente sobre anomalias e desvios de distribuição nos dados de entrada no exato momento da inferência, sem esperar dias ou meses.',
        'Porque dispensa a necessidade de ter cientistas de dados.',
        'Porque corrige os dados automaticamente sem código.',
        'Porque converte os modelos em arquivos PDF.',
      ],
      correctIndex: 0,
      explanation: 'O Data Drift analisa puramente os dados de entrada: se a distribuição mudou radicalmente em relação ao treino, sabemos de imediato que as predições estão comprometidas.',
    },
  },
  {
    id: 78,
    sectionId: 6,
    name: 'Model Monitoring',
    tagline: 'O painel de controle de MLOps: latência de inferência, vazão, drift e impacto de negócio.',
    difficulty: 'Intermediário',
    overview: 'Model Monitoring é a disciplina contínua de rastrear a saúde operacional (latência p99, taxa de erros, consumo de GPU) e a integridade estatística (acurácia, viés, drift de dados) de modelos de Machine Learning em produção.',
    whyItMatters: 'Garante que modelos de IA operem como sistemas de engenharia confiáveis. Um modelo com 99% de acurácia que demora 5 segundos para responder é tão inútil quanto um modelo milissegundo que erra 80% das previsões.',
    underTheHood: 'Pilhas de monitoramento modernas (Prometheus + Grafana + Evidently/Arize) combinam métricas de infraestrutura (RED: Rate, Errors, Duration) com métricas de negócio (taxa de conversão do modelo) e métricas de distribuição estatística em streaming.',
    realWorldExample: 'Dashboard central de MLOps monitorando 40 modelos de crédito com alertas integrados no Slack se o PSI de qualquer feature ultrapassar 0.25.',
    codeSnippet: {
      language: 'python',
      title: 'Envio de Métricas de Monitoramento de Modelo',
      code: `from prometheus_client import Counter, Histogram

INFERENCE_TIME = Histogram('ml_modelo_inferencia_segundos', 'Tempo de execução da predição')
DRIFT_ALERTS = Counter('ml_alerta_data_drift_total', 'Contador de anomalias de distribuição detectadas')

@INFERENCE_TIME.time()
def executar_predicao(payload):
    # Executa inferência e registra telemetria de latência
    resultado = modelo.predict(payload)
    return resultado`,
    },
    antiPatterns: ['Monitorar apenas CPU e RAM do container, ignorando se o modelo está devolvendo NaN ou previsões absurdas para os usuários.'],
    bestPractices: ['Crie alertas acionáveis com playbooks claros: se o monitor de drift apitar, o sistema deve acionar retreinamento automático em sandbox.'],
    relatedIds: [57, 76, 77, 79],
    quiz: {
      question: 'Quais são as três dimensões essenciais de um monitoramento robusto de modelos de Machine Learning (MLOps)?',
      options: [
        'Preço do computador, marca do teclado e sistema de refrigeração.',
        'Saúde Operacional de Software (latência/erros), Integridade Estatística (data/concept drift) e Impacto Real de Negócio (KPIs/conversão).',
        'Número de linhas de código, quantidade de comentários e tamanho dos arquivos.',
        'Cor dos gráficos, número de telas e velocidade de digitação.',
      ],
      correctIndex: 1,
      explanation: 'O monitoramento eficaz de IA exige acompanhar tanto a infraestrutura tradicional de software quanto a validade matemática estatística e os resultados reais de negócio.',
    },
  },
  {
    id: 79,
    sectionId: 6,
    name: 'Model Serving',
    tagline: 'Expondo modelos em escala: Triton, TorchServe, vLLM e otimização de matrizes.',
    difficulty: 'Avançado',
    overview: 'Model Serving é a infraestrutura de software especializada em carregar modelos treinados em memória (RAM/VRAM) e expor endpoints de inferência otimizados para alta concorrência, dynamic batching e latência mínima.',
    whyItMatters: 'Colocar um modelo PyTorch puro dentro de uma API Flask básica aguenta no máximo 5 requisições por segundo antes de travar a CPU. Engines especializadas de Model Serving aumentam a vazão em 15x a 30x no mesmo hardware.',
    underTheHood: 'Técnicas de aceleração: 1) **Dynamic Batching**: agrupa requisições assíncronas concorrentes de múltiplos usuários em uma única matriz para processamento simultâneo na GPU; 2) **PagedAttention (vLLM)**: elimina fragmentação de memória VRAM ao gerenciar o KV-Cache de LLMs como memória virtual paginada; 3) **Quantização**: reduz pesos de FP32 para INT8/INT4 sem perda perceptível de qualidade.',
    realWorldExample: 'OpenAI e Anthropic usando servidores de inferência customizados com PagedAttention para atender milhões de tokens por segundo em escala global.',
    codeSnippet: {
      language: 'bash',
      title: 'Iniciando Servidor de Inferência vLLM para LLM de Código Aberto',
      code: `# Sobe endpoint compatível com OpenAI API com Dynamic Batching e PagedAttention:
python3 -m vllm.entrypoints.openai.api_server \\
    --model mistralai/Mistral-7B-Instruct-v0.3 \\
    --tensor-parallel-size 2 \\
    --gpu-memory-utilization 0.90 \\
    --max-model-len 8192 \\
    --port 8000`,
    },
    antiPatterns: ['Carregar o modelo do disco repetidamente dentro de cada requisição da API em vez de mantê-lo residente em memória.'],
    bestPractices: ['Utilize dynamic batching para maximizar a saturação de GPU em sistemas de alta demanda.'],
    relatedIds: [73, 75, 87, 89],
    quiz: {
      question: 'O que o recurso de Dynamic Batching em servidores de Model Serving (como NVIDIA Triton) faz para acelerar a inferência?',
      options: [
        'Desliga as conexões de rede dos outros usuários.',
        'Reinicia os nós da nuvem periodicamente.',
        'Apaga os pesos menos importantes do modelo.',
        'Aguarda alguns milissegundos para acumular requisições individuais concorrentes e as envia como um único lote compacto para a GPU, maximizando o throughput de computação paralela.',
      ],
      correctIndex: 3,
      explanation: 'GPUs são extremamente eficientes em multiplicar matrizes grandes em lote. O Dynamic Batching combina requisições pontuais em um batch único na memória sem que os clientes percebam atraso.',
    },
  },
  {
    id: 80,
    sectionId: 6,
    name: 'Vector ID',
    tagline: 'Indexação em espaços de alta dimensão: conectando identificadores relacionais aos vetores densos.',
    difficulty: 'Intermediário',
    overview: 'Vector ID é o identificador único e o sistema de chave primária que conecta representações vetoriais de alta dimensão (embeddings) aos seus metadados de negócio correspondentes no banco relacional ou Data Lake (ex: ID do produto, ID do cliente, timestamp do documento).',
    whyItMatters: 'Permite operações híbridas de filtragem e recuperação (Hybrid Search / Filtered Vector Search): você busca os 5 produtos visualmente mais similares mas restringe apenas aos itens em que `preco < 100` e `em_estoque = true`.',
    underTheHood: 'Estruturas de índices vetoriais (HNSW, IVF) mantêm grafos navegáveis ou centroides de Voronoi indexados por Vector IDs internos inteiros de 32/64 bits para travessia em cache de CPU ultrarrápido, mapeando posteriormente para os IDs canônicos da aplicação.',
    realWorldExample: 'Sistemas de busca visual do Pinterest: cada foto possui um Vector ID que referencia a imagem original no S3 e os metadados de compra do lojista.',
    codeSnippet: {
      language: 'python',
      title: 'Associação de Vector ID e Metadados no Qdrant / Chroma',
      code: `import qdrant_client
from qdrant_client.models import PointStruct

client = qdrant_client.QdrantClient(":memory:")

# Ponto indexado com Vector ID único e Metadados ricos
client.upsert(
    collection_name="artigos_tecnicos",
    points=[
        PointStruct(
            id=1001, # Vector ID
            vector=[0.05, -0.42, 0.88, 0.12], # Embedding simplificado
            payload={
                "titulo": "Otimização no Apache Spark",
                "autor": "Engenharia de Dados",
                "ano": 2026,
                "categoria": "Big Data"
            }
        )
    ]
)`,
    },
    antiPatterns: ['Armazenar embeddings isolados sem identificadores ou metadados de proveniência, impossibilitando auditoria e atualizações incrementais.'],
    bestPractices: ['Mantenha sincronização estrita entre o Vector ID na base vetorial e a Surrogate Key na tabela analítica do Lakehouse.'],
    relatedIds: [81, 82, 83],
    quiz: {
      question: 'Por que o mapeamento eficiente entre Vector IDs e metadados estruturados é crítico em sistemas modernos de IA?',
      options: [
        'Porque apaga as imagens que não possuem descrição.',
        'Porque computadores só conseguem somar letras se houver um ID.',
        'Porque permite realizar buscas híbridas combinando similaridade semântica com filtros relacionais rígidos de negócio (como preço, data ou categoria).',
        'Porque reduz a velocidade da internet.',
      ],
      correctIndex: 2,
      explanation: 'O Vector ID amarra o vetor numérico ao mundo dos negócios, permitindo que a busca vetorial filtre registros por atributos relacionais antes ou durante a varredura semântica.',
    },
  },
  {
    id: 81,
    sectionId: 6,
    name: 'Vector DB',
    tagline: 'O banco de dados da era da IA: busca por similaridade vetorial em bilhões de dimensões.',
    difficulty: 'Intermediário',
    overview: 'Vector Database (como Pinecone, Milvus, Qdrant, Chroma ou extensões como pgvector) é um banco especializado em armazenar, indexar e realizar buscas por similaridade semântica sobre vetores densos multidimensionais (embeddings).',
    whyItMatters: 'Bancos relacionais tradicionais são projetados para correspondência exata (`WHERE id = 5` ou `LIKE "%termo%"`). Vector DBs encontram os vizinhos mais próximos em conceitos semânticos ("encontre documentos com significado similar a este parágrafo") em milissegundos.',
    underTheHood: 'Utiliza algoritmos de Busca de Vizinhos Mais Próximos Aproximados (ANN - Approximate Nearest Neighbors), como **HNSW** (Hierarchical Navigable Small World - grafos multicamadas) e **IVF-PQ** (Inverted File with Product Quantization), reduzindo a complexidade de varredura exata O(N) para O(log N).',
    realWorldExample: 'Sistemas de RAG empresarial da Salesforce buscando trechos relevantes de manuais técnicos de 500 páginas para embasar respostas de chatbots corporativos.',
    labType: 'rag-vector',
    codeSnippet: {
      language: 'sql',
      title: 'Busca por Similaridade de Cosseno com pgvector no PostgreSQL',
      code: `-- Habilita extensão vetorial no Postgres
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela com coluna vetorial de 1536 dimensões (tamanho de embeddings OpenAI/Gemini)
CREATE TABLE documentos_ia (
    id BIGINT PRIMARY KEY,
    conteudo TEXT,
    embedding vector(1536)
);

-- Busca os 5 documentos mais similares usando distância de cosseno (<=>)
SELECT id, conteudo, (1 - (embedding <=> '[0.021, -0.045, ...]'::vector)) AS similaridade
FROM documentos_ia
ORDER BY embedding <=> '[0.021, -0.045, ...]'::vector ASC
LIMIT 5;`,
    },
    antiPatterns: ['Fazer varredura linear exata (KNN exato) em bases com milhões de vetores sem criar índices aproximados (HNSW/IVFFlat), causando queries de minutos.'],
    bestPractices: ['Crie índices HNSW com parâmetros calibrados (`m=16`, `ef_construction=64`) para obter equilíbrio entre velocidade e recall.'],
    relatedIds: [80, 82, 83, 84],
    quiz: {
      question: 'Como o algoritmo HNSW (Hierarchical Navigable Small World) permite buscas de similaridade ultrarrápidas em bancos vetoriais?',
      options: [
        'Ele constrói um grafo multicamadas onde as camadas superiores dão saltos longos rápidos no espaço vetorial e as camadas inferiores refinam a busca localmente.',
        'Ele converte todas as palavras em código Morse.',
        'Ele desliga a placa de vídeo para economizar energia.',
        'Ele compara o vetor com todas as linhas do banco uma por uma.',
      ],
      correctIndex: 0,
      explanation: 'O HNSW funciona como uma rede de rodovias expressas no topo para aproximação rápida de região, afunilando para ruas locais na base para encontrar os vizinhos mais próximos em tempo logarítmico.',
    },
  },
  {
    id: 82,
    sectionId: 6,
    name: 'Embeddings',
    tagline: 'A ponte entre linguagem humana e álgebra linear: vetores numéricos densos que capturam significado.',
    difficulty: 'Iniciante',
    overview: 'Embeddings são representações numéricas densas (listas de centenas ou milhares de números decimais contínuos, como `[0.23, -0.81, 0.45, ...]`) que capturam o significado semântico, contexto e nuances de textos, imagens, áudios ou entidades em um espaço geométrico contínuo.',
    whyItMatters: 'Permitem que computadores façam matemática com conceitos: frases com significados idênticos mas palavras completamente diferentes (ex: "O cachorro latiu no quintal" e "O cão fez barulho no jardim") terminam quase no mesmo ponto do espaço vetorial.',
    underTheHood: 'Gerados por redes neurais treinadas (como modelos Transformer). A distância angular entre dois vetores (medida pela Similaridade de Cosseno ou Distância Euclidiana) reflete o grau de similaridade semântica entre os conceitos.',
    realWorldExample: 'A famosa equação conceitual vetorial: `Vetor("Rei") - Vetor("Homem") + Vetor("Mulher") ≈ Vetor("Rainha")`.',
    labType: 'rag-vector',
    codeSnippet: {
      language: 'python',
      title: 'Cálculo de Similaridade de Cosseno entre Embeddings',
      code: `import numpy as np

def cosine_similarity(v1, v2):
    # Fórmula: (A . B) / (||A|| * ||B||)
    # Varia de -1 (opostos) a +1 (idênticos no espaço semântico)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

vetor_gato = np.array([0.91, 0.12, -0.34])
vetor_felino = np.array([0.89, 0.15, -0.31])
vetor_trator = np.array([-0.55, 0.78, 0.42])

print("Similaridade Gato vs Felino:", cosine_similarity(vetor_gato, vetor_felino)) # ~0.99
print("Similaridade Gato vs Trator:", cosine_similarity(vetor_gato, vetor_trator)) # ~ -0.40`,
    },
    antiPatterns: ['Misturar embeddings gerados por modelos de embedding diferentes (ex: comparar um vetor da OpenAI com um vetor do Gemini ou BERT na mesma base).'],
    bestPractices: ['Normalize seus vetores para comprimento unitário (L2 norm = 1.0) para que o produto escalar (dot product) seja matematicamente idêntico à similaridade de cosseno com máxima performance.'],
    relatedIds: [80, 81, 83, 86],
    quiz: {
      question: 'O que representa o valor da Similaridade de Cosseno próxima de 1.0 entre dois vetores de embedding?',
      options: [
        'Os arquivos são exatamente do mesmo tamanho em megabytes.',
        'Ocorreu um erro de divisão por zero.',
        'Os vetores apontam na mesma direção no espaço vetorial, indicando altíssima afinidade semântica entre os conteúdos.',
        'O modelo de IA foi desligado.',
      ],
      correctIndex: 2,
      explanation: 'A similaridade de cosseno mede o cosseno do ângulo entre os dois vetores. Um valor próximo de 1.0 significa que os conceitos apontam na mesma direção conceitual.',
    },
  },
  {
    id: 83,
    sectionId: 6,
    name: 'RAG',
    tagline: 'Retrieval-Augmented Generation: enriqueça o LLM com o conhecimento factual e privado da sua empresa.',
    difficulty: 'Intermediário',
    overview: 'RAG (Geração Aumentada por Recuperação) é a arquitetura que combina um sistema de busca/recuperação de informações (geralmente sobre Vector DBs) com um modelo de linguagem (LLM). Quando o usuário faz uma pergunta, o sistema recupera os trechos mais relevantes da base interna e os injeta no prompt antes do LLM gerar a resposta.',
    whyItMatters: 'Resolve os dois maiores problemas dos LLMs: 1) Elimina Alucinações (o modelo responde embasado em fatos citados); 2) Elimina o corte temporal de conhecimento (permite ao modelo responder sobre documentos criados há 5 minutos sem precisar de retreino multimilionário).',
    underTheHood: 'Fluxo em 4 etapas: 1) Ingestão & Chunking de documentos e geração de embeddings; 2) Na query do usuário, faz busca de similaridade e recupera os Top-K chunks; 3) Monta o prompt contextual: "Com base exclusivamente nos fatos abaixo, responda..."; 4) O LLM gera a resposta citando as fontes recuperadas.',
    realWorldExample: 'Chatbot interno de Recursos Humanos respondendo dúvidas sobre a política de benefícios da empresa consultando o PDF oficial de 2026.',
    labType: 'rag-vector',
    codeSnippet: {
      language: 'python',
      title: 'Fluxo RAG Básico em Python',
      code: `def pipeline_rag(pergunta_usuario):
    # 1. Converte a pergunta em embedding
    query_vector = embed_model.get_embedding(pergunta_usuario)
    
    # 2. Recupera os 3 trechos mais relevantes do Vector DB
    documentos_relevantes = vector_db.search(query_vector, top_k=3)
    contexto = "\\n---\\n".join([doc.text for doc in documentos_relevantes])
    
    # 3. Monta o prompt aumentado com contexto factual
    prompt_aumentado = f"""Você é um assistente técnico factual.
Responda à pergunta do usuário utilizando ESTRITAMENTE as informações do Contexto abaixo.
Se a resposta não estiver no contexto, diga claramente que não possui essa informação.

Contexto:
{contexto}

Pergunta: {pergunta_usuario}
Resposta:"""

    # 4. Gera a resposta fundamentada
    return llm.generate(prompt_aumentado)`,
    },
    antiPatterns: ['Passar chunks gigantescos de 20 páginas de uma vez, excedendo a janela de contexto e introduzindo ruído ("Lost in the Middle").'],
    bestPractices: ['Combine busca vetorial semântica com busca léxica por palavras-chave (Hybrid Search com BM25 + Re-ranking) para máxima precisão.'],
    relatedIds: [81, 82, 84, 85, 87],
    quiz: {
      question: 'Por que a arquitetura RAG é amplamente preferida em relação ao Fine-Tuning de modelos para conhecimento factual corporativo?',
      options: [
        'Porque RAG é mais caro e consome mais tempo.',
        'Porque RAG permite atualização instantânea de documentos sem custo de treino, inclui citação verificável de fontes e previne alucinações de forma transparente.',
        'Porque Fine-Tuning só pode ser feito em computadores quânticos.',
        'Porque RAG desliga a criatividade do computador.',
      ],
      correctIndex: 1,
      explanation: 'O Fine-Tuning ajusta o estilo ou tarefas especializadas, mas é péssimo para fatos mutáveis. O RAG permite adicionar novos PDFs a qualquer segundo sem re-treinar o modelo.',
    },
  },
  {
    id: 84,
    sectionId: 6,
    name: 'LLM Pipelines',
    tagline: 'Orquestração de modelos generativos: encadeando parsers, validadores, ferramentas e prompts.',
    difficulty: 'Intermediário',
    overview: 'LLM Pipelines estruturam o fluxo de execução de aplicações baseadas em modelos de linguagem (usando frameworks como LangChain, LlamaIndex ou soluções customizadas), encadeando etapas como carregamento de dados, formatação de templates, chamadas ao modelo e validação estrita de saídas estruturadas.',
    whyItMatters: 'Aplicações reais de IA nunca são uma simples chamada de texto: exigem sanitização de entradas, injeção de contexto dinâmico, validação de schema JSON (Pydantic) e tratamento de falhas.',
    underTheHood: 'Organiza componentes como um grafo acíclico executável com suporte a streaming de tokens (Server-Sent Events), paralelismo de chamadas assíncronas e observabilidade de passos intermediários (LangSmith, OpenTelemetry).',
    realWorldExample: 'Pipeline de atendimento ao cliente: 1) Classifica o sentimento do e-mail; 2) Se for urgente, extrai número do pedido em JSON; 3) Consulta API do SAP; 4) Gera rascunho de resposta para o atendente.',
    codeSnippet: {
      language: 'python',
      title: 'Pipeline com LangChain Expression Language (LCEL)',
      code: `from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough

# Encadeamento declarativo de componentes do pipeline:
pipeline = (
    {"contexto": retriever, "pergunta": RunnablePassthrough()}
    | prompt_template
    | modelo_llm
    | JsonOutputParser(pydantic_object=RespostaEstruturada)
)

resultado_validado = pipeline.invoke("Qual o status da NF 4021?")`,
    },
    antiPatterns: ['Confiar cegamente na saída crua em texto livre de um LLM para alimentar diretamente um comando de UPDATE no banco de dados sem validação prévia de schema.'],
    bestPractices: ['Utilize saída estruturada garantida (Structured Outputs / JSON Schema enforcement) nativa das APIs modernas de LLM.'],
    relatedIds: [83, 85, 88, 89],
    quiz: {
      question: 'Qual é o papel de um Output Parser em um pipeline de LLM?',
      options: [
        'Aumentar o volume do áudio do computador.',
        'Enviar e-mail para o usuário a cada token gerado.',
        'Desligar o modelo se a resposta for longa.',
        'Transformar a resposta textual do LLM em objetos estruturados e validados (como JSON, dicionários tipados ou Pydantic models) prontos para consumo por outros sistemas.',
      ],
      correctIndex: 3,
      explanation: 'O Output Parser garante que a saída gerada pela IA siga estritamente o formato esperado pela aplicação (ex: um JSON com campos e tipos definidos), disparando validações e retentativas se o formato for inválido.',
    },
  },
  {
    id: 85,
    sectionId: 6,
    name: 'Prompt Engineering',
    tagline: 'A arte e a ciência de instruir LLMs: Few-Shot, Chain-of-Thought e restrições de comportamento.',
    difficulty: 'Iniciante',
    overview: 'Prompt Engineering é a disciplina de estruturar, formular e otimizar as instruções de entrada enviadas a um modelo de linguagem para obter respostas com a maior precisão, consistência e aderência às regras do sistema.',
    whyItMatters: 'A qualidade da resposta de um LLM é diretamente proporcional à clareza e estrutura do prompt. Prompts bem construídos reduzem erros e alucinações em mais de 70% sem alterar uma linha dos pesos do modelo.',
    underTheHood: 'Técnicas consolidadas pela ciência da computação: 1) **Role Prompting** (definir persona e autoridade); 2) **Few-Shot Prompting** (fornecer 2 a 3 exemplos perfeitos de entrada e saída esperadas); 3) **Chain-of-Thought (CoT)** ("Pense passo a passo antes de dar a resposta final"); 4) **Delimiters** (usar `###` ou XML `<context>` para isolar dados de instruções e prevenir Prompt Injection).',
    realWorldExample: 'Instruir um modelo a atuar como auditor contábil sênior que deve seguir uma lista rígida de 5 verificações antes de emitir um parecer fiscal.',
    codeSnippet: {
      language: 'markdown',
      title: 'Estrutura de Prompt com Few-Shot e Chain-of-Thought',
      code: `Você é um Analista de Dados Sênior especialista em SQL.
Sua tarefa é converter perguntas de negócio em consultas PostgreSQL seguras.

Regras Estritas:
1. Sempre use alias para todas as tabelas.
2. NUNCA gere comandos de mutação (DROP, DELETE, UPDATE).
3. Pense passo a passo dentro das tags <raciocinio> antes de escrever o SQL final.

Exemplo 1:
Pergunta: Total de vendas em SP em 2026.
<raciocinio>Filtrar estado='SP', extrair ano da data, somar valor.</raciocinio>
SQL: SELECT SUM(v.valor) FROM vendas v JOIN lojas l ON v.loja_id = l.id WHERE l.estado = 'SP' AND EXTRACT(YEAR FROM v.data) = 2026;

Agora resolva:
Pergunta: {pergunta_usuario}`,
    },
    antiPatterns: ['Misturar comandos do sistema com entradas não sanitizadas de usuários sem delimitadores claros, abrindo brecha para ataques de Prompt Injection.'],
    bestPractices: ['Forneça exemplos concretos (Few-Shot) e solicite raciocínio explícito estruturado (Chain-of-Thought) para problemas lógicos complexos.'],
    relatedIds: [83, 84, 86, 87, 88],
    quiz: {
      question: 'Por que a técnica de Chain-of-Thought ("Pense passo a passo") melhora drasticamente o desempenho de LLMs em raciocínio lógico e matemático?',
      options: [
        'Porque ela apaga as instruções de segurança do sistema.',
        'Porque ela acelera a conexão de internet com a API.',
        'Porque ela força o modelo a alocar tokens de computação intermediários para decompor o problema antes de tentar emitir a resposta conclusiva.',
        'Porque ela reduz o tamanho do modelo no disco.',
      ],
      correctIndex: 2,
      explanation: 'LLMs geram tokens autorregressivamente. Ao forçar o modelo a "pensar em voz alta", os passos intermediários servem como contexto de trabalho para guiar a conclusão lógica final.',
    },
  },
  {
    id: 86,
    sectionId: 6,
    name: 'Tokenization',
    tagline: 'Os blocos de Lego da IA: fatiando texto em números inteiros através de BPE e WordPiece.',
    difficulty: 'Iniciante',
    overview: 'Tokenização é o processo fundamental de converter sequências de caracteres de texto bruto em pedaços discretos chamados tokens (que podem ser palavras inteiras, sílabas ou pedaços de palavras), mapeados para IDs numéricos em um vocabulário fixo.',
    whyItMatters: 'Modelos de linguagem não entendem letras ou palavras em português; eles operam exclusivamente com matrizes de IDs de tokens. O custo, a velocidade e o limite de tamanho de qualquer API de IA são medidos e cobrados em número de tokens.',
    underTheHood: 'Algoritmos modernos usam Byte-Pair Encoding (BPE) ou WordPiece. Em média, no inglês 1 token ≈ 4 caracteres ou 0.75 palavras. Em português e outras línguas latinas, palavras com acentuação frequente podem ser fragmentadas em múltiplos sub-tokens, consumindo mais contexto.',
    realWorldExample: 'A palavra "Engenharia" pode ser dividida pelo tokenizer em 2 tokens: `["Engen", "haria"]` associados aos IDs numéricos `[34102, 1982]`.',
    codeSnippet: {
      language: 'python',
      title: 'Tokenização com Tiktoken (Algoritmo BPE da OpenAI)',
      code: `import tiktoken

# Carrega o codificador padrão
encoding = tiktoken.get_encoding("cl100k_base")

texto = "Engenharia de Dados e Inteligência Artificial"
tokens = encoding.encode(texto)

print("Tokens numéricos:", tokens) # [38212, 1021, 8921, ...]
print("Quantidade de tokens:", len(tokens))

# Decodificando token por token para ver a fragmentação física:
for t in tokens:
    print(f"ID {t} -> '{encoding.decode([t])}'")`,
    },
    antiPatterns: ['Assumir que a quantidade de palavras é igual à quantidade de tokens, subestimando o custo de APIs em textos longos com código ou JSON.'],
    bestPractices: ['Utilize bibliotecas de contagem de tokens locais no cliente para validar limites antes de despachar requisições para a API.'],
    relatedIds: [82, 85, 87],
    quiz: {
      question: 'Por que um texto com muitos caracteres especiais, código fonte ou acentuação tende a consumir mais tokens do que um texto simples em inglês?',
      options: [
        'Porque algoritmos de subword (como BPE) fragmentam palavras desconhecidas ou caracteres especiais em múltiplos sub-tokens menores de bytes.',
        'Porque o modelo de IA rejeita textos com acento.',
        'Porque a internet no Brasil é mais lenta.',
        'Porque números não são suportados por tokenizers.',
      ],
      correctIndex: 0,
      explanation: 'O vocabulário dos tokenizers é treinado primariamente em dados comuns. Palavras complexas, códigos e caracteres especiais são divididos em frações menores, aumentando a contagem total de tokens.',
    },
  },
  {
    id: 87,
    sectionId: 6,
    name: 'Context Window',
    tagline: 'A memória de curto prazo do LLM: quantos tokens o modelo consegue enxergar de uma só vez.',
    difficulty: 'Intermediário',
    overview: 'A Janela de Contexto (Context Window) é o número máximo de tokens (somando prompt de entrada + resposta de saída) que um modelo consegue processar simultaneamente em uma única chamada de atenção.',
    whyItMatters: 'Define a capacidade do modelo de analisar livros inteiros, repositórios de código ou relatórios financeiros de uma só vez. Janelas evoluíram de 4.000 tokens (GPT-3) para 1 milhão ou mais de tokens (Gemini 1.5/2.0).',
    underTheHood: 'O mecanismo clássico de Multi-Head Attention escala quadraticamente com o tamanho do contexto `O(N²)`. Modelos com janelas massivas utilizam inovações como FlashAttention, RoPE (Rotary Position Embeddings) e RingAttention para escalar linearmente ou com memória compartilhada.',
    realWorldExample: 'Passar uma base de código inteira de 80.000 linhas de código (500.000 tokens) para o Gemini e pedir: "Onde está a vulnerabilidade de SQL Injection?".',
    codeSnippet: {
      language: 'python',
      title: 'Gerenciamento de Janela de Contexto com Buffer de Mensagens',
      code: `def manter_janela_contexto(historico_mensagens, max_tokens=8000):
    total_tokens = sum([contar_tokens(m["conteudo"]) for m in historico_mensagens])
    
    # Se estourar a janela, descarta as mensagens mais antigas preservando o System Prompt:
    while total_tokens > max_tokens and len(historico_mensagens) > 2:
        removido = historico_mensagens.pop(1) # Remove a mensagem de usuário mais antiga
        total_tokens -= contar_tokens(removido["conteudo"])
        
    return historico_mensagens`,
    },
    antiPatterns: ['Ignorar o fenômeno "Lost in the Middle": modelos tendem a lembrar muito bem do início e do final do contexto, mas podem ignorar detalhes sutis jogados no meio de 200 páginas.'],
    bestPractices: ['Posicione instruções e perguntas críticas no final do prompt, imediatamente antes da geração da resposta.'],
    relatedIds: [83, 85, 86, 90],
    quiz: {
      question: 'O que descreve o fenômeno de "Lost in the Middle" em modelos com janelas de contexto gigantescas?',
      options: [
        'O modelo desliga no meio da geração.',
        'O modelo esquece o idioma original.',
        'O computador perde a conexão de rede.',
        'A acurácia na recuperação de informações sutis tende a ser maior no início e no fim do contexto, diminuindo para fatos posicionados no meio de documentos massivos.',
      ],
      correctIndex: 3,
      explanation: 'Pesquisas comprovam que os mecanismos de atenção dão peso desproporcional ao começo (recency do sistema) e ao fim do prompt, exigindo cuidado com fatos enterrados no meio do texto.',
    },
  },
  {
    id: 88,
    sectionId: 6,
    name: 'Agents',
    tagline: 'Sistemas autônomos orientados a objetivos: percepção, raciocínio, ferramentas e reflexão em loop.',
    difficulty: 'Avançado',
    overview: 'Agentes de IA são sistemas onde o modelo de linguagem não apenas responde uma pergunta estática, mas atua como o cérebro de um ciclo autônomo: ele planeja passos, decide quais ferramentas acionar, analisa os retornos da execução e itera até atingir um objetivo complexo.',
    whyItMatters: 'Permite automatizar tarefas de engenharia de ponta a ponta que antes exigiam supervisão humana: investigar uma falha em um pipeline, escrever a correção, rodar os testes e abrir um Pull Request no GitHub.',
    underTheHood: 'Implementado com padrões como **ReAct** (Reason + Act), onde a cada iteração o agente gera: `Pensamento -> Ação (Tool Call) -> Observação (Retorno da Tool) -> Reflexão`. O loop continua até que o agente decida emitir a `Resposta Final`.',
    realWorldExample: 'Um agente que recebe a instrução: "Verifique por que o faturamento de ontem caiu 20%". O agente consulta o SQL, identifica que o gateway de pagamentos caiu por 2 horas, e resume a causa raiz no canal da diretoria.',
    codeSnippet: {
      language: 'python',
      title: 'Estrutura Básica do Loop de um Agente Autônomo (ReAct)',
      code: `def ciclo_agente(objetivo_usuario):
    historico = [f"Objetivo: {objetivo_usuario}"]
    while True:
        # 1. Pensa e decide a próxima ação
        decisao = llm.decidir_acao(historico)
        if decisao.tipo == "RESPOSTA_FINAL":
            return decisao.conteudo
            
        # 2. Executa a ferramenta escolhida no ambiente
        resultado_tool = executar_ferramenta(decisao.nome_tool, decisao.argumentos)
        
        # 3. Observa e reflete adicionando ao contexto
        historico.append(f"Ação: {decisao.nome_tool} | Retorno: {resultado_tool}")`,
    },
    antiPatterns: ['Criar loops de agentes sem limites rígidos de iterações (`max_iterations = 10`), gerando loops infinitos que torram milhares de dólares em chamadas de API.'],
    bestPractices: ['Implemente restrições de permissão estritas (sandboxing) e aprovação humana (Human-in-the-Loop) para ações destrutivas.'],
    relatedIds: [84, 85, 89, 90],
    quiz: {
      question: 'O que diferencia um Agente Autônomo de uma chamada simples de LLM?',
      options: [
        'O agente tem corpo físico robótico.',
        'O agente opera em um loop contínuo onde ele mesmo avalia o progresso, decide quais ferramentas chamar e reflete sobre os resultados até cumprir a meta.',
        'O agente é escrito obrigatoriamente em linguagem Assembly.',
        'O agente não utiliza modelos de linguagem.',
      ],
      correctIndex: 1,
      explanation: 'Enquanto uma chamada simples de LLM é unidirecional (prompt -> resposta), um agente possui autonomia para raciocinar, interagir com ferramentas do mundo real e ajustar sua estratégia com base no feedback recebido.',
    },
  },
  {
    id: 89,
    sectionId: 6,
    name: 'Tool Calling',
    tagline: 'Function Calling: a habilidade do modelo de emitir chamadas estruturadas de código e APIs.',
    difficulty: 'Intermediário',
    overview: 'Tool Calling (ou Function Calling) é a capacidade de um modelo de linguagem de receber uma lista de funções disponíveis (com nomes, descrições e schemas JSON de argumentos) e decidir, com base na mensagem do usuário, emitir um payload JSON estruturado solicitando a execução daquela função específica.',
    whyItMatters: 'Conecta o raciocínio do LLM com o mundo exterior. Permite que o modelo consulte o banco de dados em tempo real, execute cálculos matemáticos sem errar na aritmética e dispare automações reais.',
    underTheHood: 'O modelo não executa o código por conta própria (o que seria perigoso). Ele apenas cospe um JSON rigoroso: `{"name": "consultar_saldo", "arguments": {"cliente_id": 401}}`. A aplicação servidora intercepta o JSON, roda a função real no banco com credenciais seguras, e devolve o resultado de volta para o modelo concluir a resposta.',
    realWorldExample: 'O usuário diz: "Transfira 150 reais para o João". O modelo emite a tool call `executar_pix(destino="João", valor=150.00)` em vez de apenas responder em texto.',
    codeSnippet: {
      language: 'python',
      title: 'Definição de Ferramenta para Tool Calling (OpenAI / Gemini SDK)',
      code: `ferramentas = [
    {
        "type": "function",
        "function": {
            "name": "consultar_pedidos_cliente",
            "description": "Retorna os últimos pedidos e status de entrega de um cliente específico",
            "parameters": {
                "type": "object",
                "properties": {
                    "cliente_id": {"type": "integer", "description": "ID numérico do cliente no banco"},
                    "limite": {"type": "integer", "default": 5}
                },
                "required": ["cliente_id"]
            }
        }
    }
]`,
    },
    antiPatterns: ['Executar o JSON de retorno do modelo sem validar previamente os tipos e permissões, confiando cegamente que o LLM não foi manipulado.'],
    bestPractices: ['Escreva descrições detalhadas e semânticas nas docstrings das ferramentas; o LLM escolhe qual tool rodar lendo essas descrições.'],
    relatedIds: [84, 88, 90],
    quiz: {
      question: 'Quem realmente executa o código ou chamada de API durante um fluxo de Tool Calling?',
      options: [
        'Os servidores da OpenAI ou Google executam o código diretamente dentro dos chips da GPU.',
        'A sua própria aplicação/servidor recebe o JSON estruturado gerado pelo modelo, valida os parâmetros e executa o código localmente com suas credenciais seguras.',
        'O usuário digita o comando na mão.',
        'O navegador de internet desliga.',
      ],
      correctIndex: 1,
      explanation: 'O modelo apenas atua como planejador emitindo a intenção estruturada em JSON; a responsabilidade de executar a função no banco ou API permanece 100% sob controle seguro da sua aplicação.',
    },
  },
  {
    id: 90,
    sectionId: 6,
    name: 'Memory',
    tagline: 'Memória em IA: curto prazo no buffer vs longo prazo em bancos relacionais e vetoriais.',
    difficulty: 'Intermediário',
    overview: 'Memory em sistemas de IA refere-se aos mecanismos que permitem ao modelo reter informações entre diferentes turnos de conversação ou entre sessões independentes ao longo de semanas e meses.',
    whyItMatters: 'Sem memória, cada chamada a um LLM é completamente sem estado (stateless): o modelo esquece o nome do usuário e as preferências acordadas na mensagem anterior.',
    underTheHood: '1) **Short-term Memory (Curto Prazo)**: buffer de histórico recente injetado diretamente na janela de contexto; 2) **Working Memory**: resumos compactados gerados periodicamente por outro LLM; 3) **Long-term Memory (Longo Prazo)**: fatos, preferências e memórias episódicas armazenados em Vector DBs ou bancos relacionais, recuperados via busca de similaridade quando relevantes.',
    realWorldExample: 'O assistente de programação lembra que você programa em TypeScript com Tailwind CSS e prefere respostas em português, mesmo após você abrir uma nova conversa 3 semanas depois.',
    codeSnippet: {
      language: 'python',
      title: 'Arquitetura de Memória Híbrida',
      code: `class SistemaMemoriaIA:
    def __init__(self, cliente_id):
        self.cliente_id = cliente_id
        self.buffer_recente = [] # Curto prazo (na janela de contexto)
        
    def recuperar_contexto_completo(self, nova_mensagem):
        # 1. Busca preferências históricas no banco de longo prazo (Vector DB / SQL)
        fatos_historicos = db_longo_prazo.buscar_fatos(self.cliente_id, nova_mensagem)
        
        # 2. Une histórico imediato + fatos de longo prazo relevantes
        contexto = f"Memórias Históricas do Usuário: {fatos_historicos}\\n"
        contexto += "\\n".join(self.buffer_recente)
        return contexto`,
    },
    antiPatterns: ['Guardar o log de chat de 6 meses inteiro dentro do prompt, estourando a janela de contexto e gastando fortunas em tokens repetidos.'],
    bestPractices: ['Utilize estratégias de sumarização periódica para compactar conversas longas em pequenos perfis de memória de longo prazo.'],
    relatedIds: [83, 87, 88],
    quiz: {
      question: 'Como sistemas modernos de IA gerenciam memória de Longo Prazo sem estourar o limite de tokens da Janela de Contexto?',
      options: [
        'Eles salvam tudo em arquivos de texto no desktop do usuário.',
        'Eles apagam todas as conversas anteriores.',
        'Eles forçam o modelo a re-treinar seus pesos toda noite.',
        'Eles extraem fatos essenciais e os gravam em um banco de dados externo (relacional ou vetorial), recuperando dinamicamente apenas os fragmentos relevantes para a conversa atual.',
      ],
      correctIndex: 3,
      explanation: 'A memória de longo prazo externa extrai declarações atômicas de interesse e as consulta sob demanda, mantendo a janela de contexto enxuta e focada.',
    },
  },
];
