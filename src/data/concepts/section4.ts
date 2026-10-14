import { Concept } from '../../types/concept';

export const SECTION_4_CONCEPTS: Concept[] = [
  {
    id: 51,
    sectionId: 4,
    name: 'Airflow',
    tagline: 'O padrão da indústria para programar, orquestrar e monitorar pipelines de dados complexos em Python.',
    difficulty: 'Iniciante',
    overview: 'Apache Airflow é uma plataforma open-source de orquestração de workflows. Permite definir pipelines como código Python (Configuration as Code), oferecendo agendamento determinístico, monitoramento visual, operadores integrados para centenas de serviços e tratamento de falhas.',
    whyItMatters: 'Substitui o caos de dezenas de crontabs em servidores isolados por um plano de controle centralizado, auditável, visual e com gerenciamento de dependências entre times.',
    underTheHood: 'Arquitetura composta por 5 componentes fundamentais: 1) **Webserver**: UI moderna para inspecionar DAGs; 2) **Scheduler**: processo contínuo que monitora tarefas e despacha para a fila; 3) **Metastore DB**: banco relacional (Postgres) com o histórico de execuções; 4) **Workers**: nós executores (Celery, KubernetesPodOperator); 5) **Triggerer**: para sensores assíncronos leves sem bloquear workers.',
    realWorldExample: 'Airbnb, Uber e milhares de empresas rodando mais de 50.000 tarefas diárias orquestradas via Apache Airflow.',
    codeSnippet: {
      language: 'python',
      title: 'Estrutura Básica de DAG no Apache Airflow',
      code: `from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-eng',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='pipeline_vendas_diario',
    default_args=default_args,
    start_date=datetime(2026, 1, 1),
    schedule='@daily',
    catchup=False
) as dag:
    # Definição de tarefas e dependências
    pass`,
    },
    antiPatterns: ['Processar terabytes de dados pesados diretamente dentro do nó do worker do Airflow em vez de despachar a carga para Spark, Snowflake ou Kubernetes.'],
    bestPractices: ['Trate o Airflow como um orquestrador (maestro), nunca como a máquina de processamento pesado (trabalhador braçal).'],
    relatedIds: [16, 52, 53, 54, 55],
    quiz: {
      question: 'Qual é o papel correto do Apache Airflow em uma arquitetura de dados moderna?',
      options: [
        'Atuar como orquestrador que agenda, dispara e monitora tarefas distribuídas, sem executar o processamento pesado de dados em sua própria CPU.',
        'Substituir o Data Lake e guardar todos os arquivos brutos em seu banco interno.',
        'Funcionar exclusivamente como servidor de streaming de vídeo.',
        'Compilar código C++ para dispositivos embarcados.',
      ],
      correctIndex: 0,
      explanation: 'O Airflow é o maestro da orquestração: ele coordena quando e como as etapas do pipeline disparam, delegando o processamento pesado para engines como Spark, dbt, Trino ou Snowflake.',
    },
  },
  {
    id: 52,
    sectionId: 4,
    name: 'DAG Scheduling',
    tagline: 'Cronograma determinístico: intervalos de dados, data de execução lógica e frequências de disparo.',
    difficulty: 'Intermediário',
    overview: 'DAG Scheduling define o cronograma de ativação periódica de um pipeline. No Airflow moderno, utiliza o conceito de Data Interval (`data_interval_start` e `data_interval_end`), garantindo que o pipeline processe a janela exata de dados fechada.',
    whyItMatters: 'Compreender o agendamento previne o famoso "Airflow scheduling paradox": um job diário agendado para o dia 5 só roda fisicamente às 00:00 do dia 6, porque ele precisa que todos os dados do dia 5 já tenham terminado de acontecer.',
    underTheHood: 'O Scheduler calcula os limites temporais de cada `DagRun`. Usa expressões Cron (ex: `0 2 * * *`), Timetables dinâmicas (ex: rodar apenas em dias úteis no horário de fechamento da B3) ou datasets/event-based triggers.',
    realWorldExample: 'Um pipeline que roda de hora em hora e processa exatamente os eventos gerados entre `14:00:00` e `14:59:59` usando os parâmetros de contexto injetados.',
    codeSnippet: {
      language: 'python',
      title: 'Uso de Parâmetros de Intervalo no Airflow 2+',
      code: `def extrair_janela_fechada(**context):
    # Pega exatamente o início e fim da janela lógica da execução:
    inicio = context['data_interval_start'].to_iso8601_string()
    fim = context['data_interval_end'].to_iso8601_string()
    print(f"Extraindo dados pontuais entre {inicio} e {fim}")

task_extracao = PythonOperator(
    task_id='extrair_lote_hora',
    python_callable=extrair_janela_fechada
)`,
    },
    antiPatterns: ['Usar `datetime.now()` dentro da lógica da tarefa em vez de usar os timestamps lógicos injetados pelo orquestrador, quebrando a capacidade de reprocessamento histórico.'],
    bestPractices: ['Sempre parametrize queries e caminhos usando as macros `ds`, `data_interval_start` e `data_interval_end`.'],
    relatedIds: [16, 51, 55],
    quiz: {
      question: 'Por que usar datetime.now() dentro de tarefas agendadas é considerado uma má prática no Airflow?',
      options: [
        'Porque datetime.now() atrasa o computador.',
        'Porque o Python não suporta relógios.',
        'Porque ao fazer um reprocessamento (backfill) de uma data de 3 meses atrás, o código usará a data de hoje em vez da data histórica que deveria ser reprocessada.',
        'Porque gera cobrança duplicada na nuvem.',
      ],
      correctIndex: 2,
      explanation: 'Para garantir idempotência e replay histórico (backfill), a tarefa deve sempre utilizar as variáveis temporais do contexto de execução providas pelo Airflow.',
    },
  },
  {
    id: 53,
    sectionId: 4,
    name: 'Task Dependencies',
    tagline: 'Ordem estrita de execução: operadores upstream, downstream e regras de gatilho (Trigger Rules).',
    difficulty: 'Iniciante',
    overview: 'Dependências definem a topologia de precedência entre tarefas: a Tarefa B só pode iniciar após a conclusão da Tarefa A (`A >> B`). Regras de gatilho (`trigger_rule`) permitem ramificações condicionais e tolerância a caminhos com falha.',
    whyItMatters: 'Garante que transformações analíticas nunca rodem se a ingestão dos dados brutos tiver falhado, impedindo a geração de métricas parciais ou corrompidas.',
    underTheHood: 'Operadores `>>` e `<<` conectam nós no grafo. O Scheduler avalia os estados dos nós pais (Upstream) usando a `trigger_rule`: `all_success` (padrão), `all_done` (roda mesmo se falhar), `one_failed` (para alertas), ou `none_failed_min_one_success`.',
    realWorldExample: 'Ingerir Clientes e Ingerir Pedidos em paralelo; ao final de ambos, disparar o Cálculo de Churn; se qualquer um falhar, disparar tarefa de Alerta no Slack.',
    labType: 'airflow-retry',
    codeSnippet: {
      language: 'python',
      title: 'Topologia de Dependências e Trigger Rules',
      code: `from airflow.operators.bash import BashOperator

t_ingestao_a = BashOperator(task_id='ingestao_crm', bash_command='...')
t_ingestao_b = BashOperator(task_id='ingestao_erp', bash_command='...')
t_transformacao = BashOperator(task_id='dbt_run', bash_command='...')
t_alerta_falha = BashOperator(
    task_id='alerta_slack',
    bash_command='...',
    trigger_rule='one_failed' # Dispara se qualquer uma das anteriores falhar
)

# Topologia: A e B rodam em paralelo; se ambos derem certo, roda C:
[t_ingestao_a, t_ingestao_b] >> t_transformacao
[t_ingestao_a, t_ingestao_b] >> t_alerta_falha`,
    },
    antiPatterns: ['Construir pipelines sem definir dependências explícitas, confiando que um job vai terminar antes do outro só por ter começado 10 minutos mais cedo no relógio.'],
    bestPractices: ['Utilize tarefas "dummy" ou EmptyOperator como pontos de convergência para fan-in e fan-out complexos.'],
    relatedIds: [38, 51, 54],
    quiz: {
      question: 'Qual trigger_rule do Airflow deve ser usada em uma tarefa de limpeza de recursos temporários que DEVE rodar obrigatoriamente, independentemente de sucesso ou falha das tarefas anteriores?',
      options: [
        'all_success',
        'never_run',
        'only_failure',
        'all_done',
      ],
      correctIndex: 3,
      explanation: 'A trigger_rule all_done instrui o scheduler a disparar a tarefa assim que todas as tarefas upstream tiverem terminado suas tentativas, ignorando se tiveram sucesso ou falha.',
    },
  },
  {
    id: 54,
    sectionId: 4,
    name: 'Retry Logic',
    tagline: 'Sobrevivendo ao caos da rede: retentativas automáticas com Exponential Backoff e Jitter.',
    difficulty: 'Intermediário',
    overview: 'Políticas de Retry definem quantas vezes e com que intervalo uma tarefa que falhou deve ser automaticamente reexecutada antes de ser declarada como falha permanente no pipeline.',
    whyItMatters: 'Falhas transitórias em APIs de terceiros, timeouts breves de rede ou reinícios momentâneos de bancos acontecem toda hora. O retry automático resolve mais de 80% das falhas operacionais sem intervenção humana no meio da noite.',
    underTheHood: 'Exponential Backoff dobra o tempo de espera a cada nova tentativa (ex: 1min, 2min, 4min, 8min), evitando sobrecarregar uma API que já está sob estresse (Thundering Herd Problem). O Jitter adiciona uma variação aleatória de segundos para descentralizar requisições simultâneas.',
    realWorldExample: 'Consumir uma API bancária que retorna erro HTTP 429 (Too Many Requests); o Airflow aguarda com retry exponencial e obtém sucesso na 2ª tentativa.',
    labType: 'airflow-retry',
    codeSnippet: {
      language: 'python',
      title: 'Configurando Exponential Backoff no Airflow',
      code: `default_args = {
    'retries': 4,                                    # 4 tentativas
    'retry_delay': timedelta(seconds=30),            # Espera inicial
    'retry_exponential_backoff': True,               # 30s -> 60s -> 120s -> 240s
    'max_retry_delay': timedelta(minutes=15)         # Teto máximo de espera
}`,
    },
    antiPatterns: ['Configurar 10 retentativas com delay de zero segundos, disparando um ataque de negação de serviço (DDoS) contra seu próprio banco de dados.'],
    bestPractices: ['Combine retry com tarefas estritamente idempotentes para evitar duplicar inserções na repetição.'],
    relatedIds: [16, 51, 53],
    quiz: {
      question: 'Por que o uso de Exponential Backoff com Jitter é superior a retentativas imediatas (immediate retries)?',
      options: [
        'Porque reduz o tamanho do banco de dados.',
        'Porque evita bombardear um serviço externo que já está instável ou sofrendo rate-limiting, dando tempo para o sistema se recuperar gradualmente.',
        'Porque faz a tarefa rodar em segundo plano sem gastar CPU.',
        'Porque impede que o programador receba emails.',
      ],
      correctIndex: 1,
      explanation: 'O crescimento exponencial do tempo de espera e a aleatoriedade (jitter) impedem que múltiplos nós sobrecarreguem serviços já fragilizados ao mesmo tempo.',
    },
  },
  {
    id: 55,
    sectionId: 4,
    name: 'Backfill',
    tagline: 'Viaje no tempo: execute e recalcule meses de histórico com total consistência e paralelismo.',
    difficulty: 'Intermediário',
    overview: 'Backfill é a operação de executar um pipeline retrospectivamente para uma faixa contínua de datas no passado, seja para preencher dados históricos recém-adquiridos ou para recalcular métricas após a correção de um bug na regra de negócio.',
    whyItMatters: 'Sem suporte a backfill nativo, uma equipe levaria semanas disparando scripts manuais e correndo sério risco de sobrescrever datas erradas. Com Airflow, um comando recalcula 3 anos de dados em poucas horas.',
    underTheHood: 'O scheduler cria instâncias de `DagRun` para cada data dentro do intervalo especificado com status retroativo. Se o pipeline for idempotente, os dados antigos são substituídos de forma atômica sem duplicatas.',
    realWorldExample: 'A fórmula de cálculo de imposto mudou: você dispara um backfill do pipeline financeiro para recalcular todos os dias entre 01/01/2026 e 30/09/2026.',
    labType: 'airflow-retry',
    codeSnippet: {
      language: 'bash',
      title: 'Disparando Backfill via CLI no Airflow',
      code: `# Roda o pipeline para todos os dias entre 1 de Janeiro e 1 de Março com até 8 tarefas simultâneas:
airflow dags backfill \\
    --start-date 2026-01-01 \\
    --end-date 2026-03-01 \\
    --max-active-runs 4 \\
    --reset-dagruns \\
    pipeline_vendas_diario`,
    },
    antiPatterns: ['Ativar `catchup=True` em uma DAG com `start_date` em 2015 sem limite de concorrência, disparando 4.000 DagRuns de uma vez só e derrubando o cluster.'],
    bestPractices: ['Mantenha `catchup=False` por padrão nas DAGs e use o comando CLI explícito de backfill quando precisar de reprocessamento.'],
    relatedIds: [16, 51, 52],
    quiz: {
      question: 'Qual é o pré-requisito indispensável no código de um pipeline para que um Backfill seja realizado com total segurança?',
      options: [
        'O código precisa estar escrito em C++.',
        'O pipeline deve ter menos de 10 linhas de código.',
        'O pipeline deve ser Idempotente (usar partições por data e substituição determinística sem duplicar dados se reexecutado).',
        'Não pode usar banco de dados relacional.',
      ],
      correctIndex: 2,
      explanation: 'Se o pipeline não for estritamente idempotente (por exemplo, fizer append cego sem limpar a partição correspondente), o backfill duplicará todas as métricas históricas.',
    },
  },
  {
    id: 56,
    sectionId: 4,
    name: 'SLA',
    tagline: 'Service Level Agreement: o compromisso formal de entrega de dados dentro do prazo acordado.',
    difficulty: 'Iniciante',
    overview: 'SLA (Acordo de Nível de Serviço) em Engenharia de Dados estabelece o horário limite ou a duração máxima aceitável para que um conjunto de dados esteja processado, validado e disponível para o negócio (ex: "Dashboard financeiro disponível impreterivelmente até as 07h00 da manhã").',
    whyItMatters: 'Se o time de precificação dinâmica não receber os preços atualizados antes da abertura do mercado financeiro, a empresa perde milhões. O SLA formaliza a prioridade e as consequências de atraso.',
    underTheHood: 'Airflow possui suporte nativo a `sla` nos operadores e `sla_miss_callback`. Monitores avaliam o tempo decorrido desde o `execution_date` planejado e disparam alertas imediatos (PagerDuty, Opsgenie, Slack) se a barreira de SLA for violada.',
    realWorldExample: 'Tabelas regulatórias do Banco Central que devem ser transmitidas até as 09:00: o pipeline dispara às 05:00 com SLA de 3 horas; se não concluir até as 08:00, o engenheiro de plantão é acionado no PagerDuty.',
    codeSnippet: {
      language: 'python',
      title: 'Configurando Alerta de Violação de SLA no Airflow',
      code: `def alerta_sla_violado(dag, task_list, blocking_task_list, slas, blocking_tis):
    msg = f"ALERTA CRÍTICO: SLA violado para as tarefas: {task_list}"
    enviar_pagerduty(msg)

with DAG(
    dag_id='relatorio_diretoria',
    sla_miss_callback=alerta_sla_violado,
    ...
) as dag:
    task_final = EmptyOperator(
        task_id='entrega_final',
        sla=timedelta(hours=2) # Deve terminar em até 2h após o disparo do DAG
    )`,
    },
    antiPatterns: ['Definir SLAs irreais sem folga técnica (ex: pipeline que demora 58 minutos com SLA de 60 minutos).'],
    bestPractices: ['Acompanhe tendências históricas de tempo de execução para identificar degradação antes do SLA estourar.'],
    relatedIds: [51, 57, 58],
    quiz: {
      question: 'O que mede o SLA de pontualidade (Freshness SLA) em pipelines de dados?',
      options: [
        'A defasagem de tempo entre a ocorrência do evento no mundo real e sua disponibilidade limpa e consumível na tabela final.',
        'A temperatura física dos processadores.',
        'O número de desenvolvedores no time de dados.',
        'A velocidade de download da internet.',
      ],
      correctIndex: 0,
      explanation: 'O Freshness SLA mede a "frescura" dos dados: quanto tempo se passou desde o momento em que a transação aconteceu até ela estar disponível para relatórios de negócio.',
    },
  },
  {
    id: 57,
    sectionId: 4,
    name: 'Observability',
    tagline: 'Além do monitoramento básico: métricas, logs, traces e detecção proativa de anomalias em dados.',
    difficulty: 'Intermediário',
    overview: 'Data Observability é a capacidade de entender a saúde interna dos sistemas e pipelines de dados a partir das suas saídas externas. Cobre os 5 pilares do ecossistema: Frescor (Freshness), Volume, Distribuição (Distribution), Schema e Linhagem (Lineage).',
    whyItMatters: 'Permite descobrir que a ingestão de pedidos caiu 90% hoje às 10h da manhã ANTES que o Diretor Financeiro abra o dashboard e descubra que os números estão errados.',
    underTheHood: 'Ferramentas de observabilidade (Monte Carlo, Datadog, Prometheus/Grafana) coletam metadados sem inspecionar dados sensíveis, aplicando modelos estatísticos (z-score, moving averages) para detectar anomalias volumétricas e anomalias de schema.',
    realWorldExample: 'Alertar automaticamente o time quando uma tabela que normalmente recebe 50.000 linhas diárias recebe apenas 200 linhas hoje.',
    codeSnippet: {
      language: 'python',
      title: 'Emissão de Métricas de Observabilidade para o Prometheus/StatsD',
      code: `from datadog import statsd
import time

def process_batch_with_telemetry(batch_data):
    start = time.time()
    num_rows = len(batch_data)
    
    # Processa os dados...
    duration = time.time() - start
    
    # Emite métricas de observabilidade:
    statsd.gauge('pipeline.vendas.volume_linhas', num_rows, tags=['env:prod'])
    statsd.histogram('pipeline.vendas.tempo_execucao_segundos', duration)
    statsd.increment('pipeline.vendas.sucessos')`,
    },
    antiPatterns: ['Confiar apenas no status "Job Success" do Airflow; um job pode rodar com sucesso técnico gravando zero linhas na tabela.'],
    bestPractices: ['Monitore volume de linhas inseridas e desvios de média móvel além do mero código de saída HTTP/Zero.'],
    relatedIds: [56, 58, 60],
    quiz: {
      question: 'Qual dos seguintes cenários NÃO é detectado por monitoramento tradicional de infraestrutura, mas É capturado por Data Observability?',
      options: [
        'O pipeline concluiu com código de sucesso (Exit 0), porém inseriu 0 linhas na tabela final devido a um filtro quebrado na origem.',
        'O servidor do banco de dados caiu por falta de energia.',
        'A placa de rede do servidor queimou.',
        'O disco rígido encheu 100%.',
      ],
      correctIndex: 0,
      explanation: 'O monitoramento de infraestrutura só vê que o processo terminou sem erro técnico (Exit 0), mas a observabilidade de dados analisa o conteúdo e percebe a anomalia volumétrica catastrófica de zero linhas.',
    },
  },
  {
    id: 58,
    sectionId: 4,
    name: 'Data Quality',
    tagline: 'Testes automatizados contínuos: garanta que valores nulos, duplicatas e regras de negócio não passem.',
    difficulty: 'Iniciante',
    overview: 'Data Quality é a prática de aplicar testes automatizados de asserção sobre os dados em cada etapa do pipeline (usando ferramentas como Great Expectations, Soda Core ou dbt tests) para validar completude, unicidade, consistência e validade.',
    whyItMatters: 'Dados ruins geram decisões de negócio desastrosas ("Garbage in, garbage out"). Previne que clientes recebam cobranças com valor negativo ou que relatórios somem idades nulas.',
    underTheHood: 'Testes rodam queries SQL de checagem: `COUNT(*) WHERE coluna IS NULL` deve ser 0; `COUNT(DISTINCT id) / COUNT(*)` deve ser 1.0; valores devem estar dentro de intervalos razoáveis (ex: `idade BETWEEN 0 AND 120`). Se o teste falha, o pipeline é interrompido antes de promover os dados para a camada Gold.',
    realWorldExample: 'Validação no dbt: `unique` e `not_null` na chave primária `cliente_id` e teste de integridade referencial com a tabela de cidades.',
    codeSnippet: {
      language: 'yaml',
      title: 'Testes de Qualidade Declarativos com dbt / Soda',
      code: `version: 2
models:
  - name: silver_pedidos
    columns:
      - name: pedido_id
        tests:
          - unique
          - not_null
      - name: valor_total
        tests:
          - not_null
          - dbt_expectations.expect_column_values_to_be_between:
              min_value: 0.01
              max_value: 1000000.00
      - name: status
        tests:
          - accepted_values:
              values: ['PENDENTE', 'PAGO', 'CANCELADO']`,
    },
    antiPatterns: ['Executar testes de qualidade apenas em ambiente de desenvolvimento e desativá-los na produção "para economizar tempo".'],
    bestPractices: ['Bloqueie a promoção de dados para camadas de consumo público caso os testes críticos de Data Quality falhem.'],
    relatedIds: [10, 27, 57, 59],
    quiz: {
      question: 'O que o framework Great Expectations faz na esteira de engenharia de dados?',
      options: [
        'Acelera a placa de vídeo do servidor.',
        'Permite escrever asserções e testes automatizados detalhados sobre as colunas do dataset, gerando relatórios de validação de qualidade dos dados.',
        'Converte arquivos SQL para Python automaticamente.',
        'Remove a necessidade de criar tabelas.',
      ],
      correctIndex: 1,
      explanation: 'Great Expectations é o padrão de mercado para definir "expectativas" (testes) sobre conjuntos de dados, gerando documentação e travando pipelines quando asserções falham.',
    },
  },
  {
    id: 59,
    sectionId: 4,
    name: 'Data Contracts',
    tagline: 'O pacto formal: acordos de API entre times de engenharia de software e times de dados.',
    difficulty: 'Intermediário',
    overview: 'Data Contract é um acordo formal versionado (geralmente em YAML ou Protobuf) entre o time produtor dos dados (engenharia de software dos microsserviços) e o time consumidor (engenharia de dados e analistas), definindo schema, tipos, SLA e semântica de negócio.',
    whyItMatters: 'Acaba com a eterna reclamação: o desenvolvedor de backend renomeia uma coluna no PostgreSQL de `user_id` para `id_usuario` na sexta-feira à tarde e derruba 40 dashboards da empresa inteira sem aviso.',
    underTheHood: 'O contrato de dados é integrado na esteira de CI/CD do backend. Se um Pull Request alterar uma coluna coberta pelo contrato sem gerar uma nova versão semântica de compatibilidade, o pipeline de build do GitHub Actions do backend quebra antes de subir para produção.',
    realWorldExample: 'O time de pagamentos compromete-se via Data Contract com o schema do evento `transacao_pix.v2`, garantindo tipagem estrita de cada campo e SLA de envio.',
    codeSnippet: {
      language: 'yaml',
      title: 'Exemplo de Data Contract Declarativo',
      code: `dataContractSpecification: 0.9.3
id: checkout:pagamentos-realizados
version: 2.1.0
dataset:
  - table: pagamentos
    description: Pagamentos aprovados no gateway
    columns:
      - name: id_transacao
        type: uuid
        required: true
        unique: true
      - name: valor
        type: numeric(10,2)
        required: true
      - name: moeda
        type: string
        enum: ['BRL', 'USD']
serviceLevelAgreement:
  freshness: 15 minutes`,
    },
    antiPatterns: ['Tratar Data Contracts como meros PDFs de documentação que ninguém lê, em vez de validá-los via CI/CD no código produtor.'],
    bestPractices: ['Implemente versionamento semântico (SemVer: Major, Minor, Patch) nos seus Data Contracts.'],
    relatedIds: [26, 27, 58, 60],
    quiz: {
      question: 'Qual problema crônico das organizações os Data Contracts resolvem?',
      options: [
        'A lentidão de conexão Wi-Fi nos escritórios.',
        'A necessidade de aprender SQL.',
        'A falta de espaço em disco rígido.',
        'Quebras inesperadas em pipelines de dados causadas por mudanças unilaterais de esquema feitas por desenvolvedores no backend de produção.',
      ],
      correctIndex: 3,
      explanation: 'Os contratos de dados estabelecem responsabilidade compartilhada: alterações no backend são validadas contra o contrato, evitando surpresas que quebram pipelines a jusante.',
    },
  },
  {
    id: 60,
    sectionId: 4,
    name: 'Lineage',
    tagline: 'A árvore genealógica do dado: rastreabilidade completa da origem ao relatório final.',
    difficulty: 'Intermediário',
    overview: 'Data Lineage (Linhagem de Dados) mapeia o caminho completo percorrido pela informação: de qual banco ou tabela de origem ela partiu, por quais pipelines e transformações passou, e quais colunas em dashboards ou modelos de IA são alimentadas por ela.',
    whyItMatters: 'Permite análise de impacto instantânea ("Se eu alterar a tabela X, quais dashboards vão quebrar?") e auditoria regulatória para LGPD/GDPR ("Onde exatamente o CPF deste usuário está armazenado em toda a empresa?").',
    underTheHood: 'Padrões abertos como OpenLineage capturam metadados em tempo de execução via plugins no Spark, Airflow e dbt, enviando eventos padronizados para catálogos como Marquez, DataHub, Atlan ou Unity Catalog. A linhagem pode ser em nível de tabela ou em nível fino de coluna (Column-Level Lineage).',
    realWorldExample: 'Ao investigar um número estranho no PowerBI, o analista clica na métrica e visualiza o grafo completo rastreando o valor até o arquivo JSON bruto no bucket S3.',
    codeSnippet: {
      language: 'json',
      title: 'Evento OpenLineage emitido por um Job',
      code: `{
  "eventType": "COMPLETE",
  "eventTime": "2026-10-05T08:30:00Z",
  "job": { "namespace": "airflow", "name": "dag_vendas.job_silver" },
  "inputs": [
    { "namespace": "s3://lake-bronze", "name": "pedidos_raw" }
  ],
  "outputs": [
    { "namespace": "s3://lake-silver", "name": "pedidos_limpos" }
  ]
}`,
    },
    antiPatterns: ['Tentar manter diagramas de linhagem desenhados manualmente no PowerPoint ou Miro, que ficam desatualizados no dia seguinte.'],
    bestPractices: ['Utilize ferramentas que capturem linhagem automaticamente por análise de AST (Abstract Syntax Tree) do SQL e eventos em tempo de execução.'],
    relatedIds: [10, 16, 51, 91, 92],
    quiz: {
      question: 'O que é Column-Level Lineage (Linhagem em Nível de Coluna)?',
      options: [
        'A contagem do número de colunas de uma planilha.',
        'A ordenação alfabética dos nomes das tabelas.',
        'O mapeamento detalhado que mostra exatamente quais colunas de entrada deram origem a uma coluna de saída específica após operações de transformação.',
        'A criptografia de senhas no banco de dados.',
      ],
      correctIndex: 2,
      explanation: 'A linhagem em nível de coluna rastreia as transformações e dependências com granularidade fina, permitindo saber quais colunas exatas da origem geraram uma métrica derivada.',
    },
  },
];
