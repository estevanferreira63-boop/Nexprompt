import React, { useState } from 'react';
import { LabType } from '../../types/concept';
import { useLanguage } from '../../context/LanguageContext';
import { useGamification } from '../../context/GamificationContext';
import { OltpVsOlapLab } from './OltpVsOlapLab';
import { MedallionLab } from './MedallionLab';
import { SparkDagShuffleLab } from './SparkDagShuffleLab';
import { LakehouseTimeTravelLab } from './LakehouseTimeTravelLab';
import { RagVectorLab } from './RagVectorLab';
import { DriftMonitoringLab } from './DriftMonitoringLab';
import { ZOrderingSkippingLab } from './ZOrderingSkippingLab';
import { SmallFilesCompactionLab } from './SmallFilesCompactionLab';
import { DataMaskingRbacLab } from './DataMaskingRbacLab';
import { AirflowDagSchedulerLab } from './AirflowDagSchedulerLab';
import { KafkaRebalanceLab } from './KafkaRebalanceLab';
import { LsmTreeStorageLab } from './LsmTreeStorageLab';
import { StreamingWatermarkLab } from './StreamingWatermarkLab';
import { ConsistentHashingRingLab } from './ConsistentHashingRingLab';
import { SqlOptimizerLab } from './SqlOptimizerLab';
import { PromptBattleArenaLab } from './PromptBattleArenaLab';
import {
  Database,
  Layers,
  Cpu,
  History,
  Bot,
  Activity,
  Compass,
  Package,
  ShieldCheck,
  Clock,
  Sparkles,
  Server,
  HardDrive,
  Radio,
  Zap,
  Swords,
} from 'lucide-react';

interface VisualLabHubProps {
  initialLab?: LabType;
}

interface LabItem {
  type: LabType;
  titlePt: string;
  titleEn: string;
  conceptNumber: string;
  categoryPt: string;
  categoryEn: string;
  icon: React.ElementType;
  badgeColor: string;
}

const LABS_LIST: LabItem[] = [
  { type: 'oltp-olap', titlePt: 'Varredura de Disco OLTP vs OLAP', titleEn: 'OLTP vs OLAP Storage Scan', conceptNumber: '#2', categoryPt: 'Fundamentos', categoryEn: 'Fundamentals', icon: Database, badgeColor: 'text-blue-400 bg-blue-950/50 border-blue-800' },
  { type: 'medallion', titlePt: 'Medallion Bronze → Silver → Gold', titleEn: 'Medallion Bronze → Silver → Gold', conceptNumber: '#10', categoryPt: 'Arquitetura', categoryEn: 'Architecture', icon: Layers, badgeColor: 'text-amber-400 bg-amber-950/50 border-amber-800' },
  { type: 'spark-dag', titlePt: 'Spark DAG, Shuffles & Skew Handling', titleEn: 'Spark DAG, Shuffles & Skew Handling', conceptNumber: '#35, #42', categoryPt: 'Distribuído', categoryEn: 'Distributed', icon: Cpu, badgeColor: 'text-orange-400 bg-orange-950/50 border-orange-800' },
  { type: 'time-travel', titlePt: 'ACID Lakehouse & Rollback Time Travel', titleEn: 'Lakehouse ACID & Time Travel Rollback', conceptNumber: '#61, #65', categoryPt: 'Lakehouse', categoryEn: 'Lakehouse', icon: History, badgeColor: 'text-cyan-400 bg-cyan-950/50 border-cyan-800' },
  { type: 'rag-vector', titlePt: 'RAG & Embeddings Vetoriais', titleEn: 'RAG & Vector Embeddings Playground', conceptNumber: '#81, #83', categoryPt: 'Sistemas IA', categoryEn: 'AI Systems', icon: Bot, badgeColor: 'text-fuchsia-400 bg-fuchsia-950/50 border-fuchsia-800' },
  { type: 'drift-monitor', titlePt: 'Monitor de Data Drift & PSI em Tempo Real', titleEn: 'Data Drift & PSI Real-Time Monitor', conceptNumber: '#76, #77', categoryPt: 'MLOps', categoryEn: 'MLOps', icon: Activity, badgeColor: 'text-rose-400 bg-rose-950/50 border-rose-800' },
  { type: 'z-ordering', titlePt: 'Z-Ordering & Data Skipping (Curva Morton)', titleEn: 'Z-Ordering & Data Skipping (Morton Curve)', conceptNumber: '#28, #29', categoryPt: 'Pipelines', categoryEn: 'Pipelines', icon: Compass, badgeColor: 'text-teal-400 bg-teal-950/50 border-teal-800' },
  { type: 'small-files', titlePt: 'Small Files & Compactação Bin-Packing', titleEn: 'Small Files & Bin-Packing Compaction', conceptNumber: '#30, #69', categoryPt: 'Armazenamento', categoryEn: 'Storage', icon: Package, badgeColor: 'text-amber-400 bg-amber-950/50 border-amber-800' },
  { type: 'rbac-masking', titlePt: 'Mascaramento Dinâmico de PII & RBAC', titleEn: 'Dynamic PII Masking & RBAC Roles', conceptNumber: '#93, #95', categoryPt: 'Governança', categoryEn: 'Governance', icon: ShieldCheck, badgeColor: 'text-red-400 bg-red-950/50 border-red-800' },
  { type: 'airflow-retry', titlePt: 'Airflow DAG, Retry com Backoff & Backfill', titleEn: 'Airflow DAG, Exponential Backoff & Backfill', conceptNumber: '#51, #54', categoryPt: 'Orquestração', categoryEn: 'Orchestration', icon: Clock, badgeColor: 'text-violet-400 bg-violet-950/50 border-violet-800' },
  { type: 'kafka-rebalance', titlePt: 'Kafka Consumer Rebalance & Lag', titleEn: 'Kafka Consumer Rebalance & Lag', conceptNumber: '#21, #25', categoryPt: 'Streaming', categoryEn: 'Streaming', icon: Server, badgeColor: 'text-orange-400 bg-orange-950/50 border-orange-800' },
  { type: 'lsm-tree', titlePt: 'LSM-Tree vs B+Tree Storage Engine', titleEn: 'LSM-Tree vs B+Tree Storage Engine', conceptNumber: '#4, #27', categoryPt: 'Armazenamento', categoryEn: 'Storage', icon: HardDrive, badgeColor: 'text-teal-400 bg-teal-950/50 border-teal-800' },
  { type: 'streaming-window', titlePt: 'Streaming Watermarks & Janelas de Tempo', titleEn: 'Streaming Watermarks & Out-of-Order Windows', conceptNumber: '#22, #23', categoryPt: 'Streaming', categoryEn: 'Streaming', icon: Radio, badgeColor: 'text-cyan-400 bg-cyan-950/50 border-cyan-800' },
  { type: 'sharding-hash', titlePt: 'Consistent Hashing & V-Nodes Ring', titleEn: 'Consistent Hashing & V-Nodes Ring', conceptNumber: '#8, #26', categoryPt: 'Distribuído', categoryEn: 'Distributed', icon: Compass, badgeColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800' },
  { type: 'sql-optimizer', titlePt: 'Cost-Based Optimizer (CBO) & Planos SQL', titleEn: 'Cost-Based Optimizer & Physical Plans', conceptNumber: '#7, #13', categoryPt: 'Query Engine', categoryEn: 'Query Engine', icon: Zap, badgeColor: 'text-yellow-400 bg-yellow-950/50 border-yellow-800' },
  { type: 'prompt-battle', titlePt: 'Batalha de Prompts: Zero-Shot vs CoT vs XML', titleEn: 'Prompt Battle: Zero-Shot vs CoT vs XML', conceptNumber: '#85, #88', categoryPt: 'Engenharia IA', categoryEn: 'AI Engineering', icon: Swords, badgeColor: 'text-fuchsia-400 bg-fuchsia-950/50 border-fuchsia-800' },
];

export const VisualLabHub: React.FC<VisualLabHubProps> = ({ initialLab = 'oltp-olap' }) => {
  const { language, t } = useLanguage();
  const { recordLabInteraction } = useGamification();
  const [activeLab, setActiveLab] = useState<LabType>(initialLab);

  const handleSelectLab = (type: LabType) => {
    setActiveLab(type);
    recordLabInteraction(type);
  };

  return (
    <div className="space-y-6">
      {/* Title & Hub Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" /> {t('labsBannerTag')}
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {t('labsBannerTitle')}
        </h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          {t('labsBannerDesc')}
        </p>
      </div>

      {/* Lab Selector Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {LABS_LIST.map((lab) => {
          const Icon = lab.icon;
          const isActive = activeLab === lab.type;
          const title = language === 'pt' ? lab.titlePt : lab.titleEn;
          const category = language === 'pt' ? lab.categoryPt : lab.categoryEn;

          return (
            <button
              key={lab.type}
              onClick={() => handleSelectLab(lab.type)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                  : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded-lg border text-xs font-mono font-bold ${lab.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-slate-500">{lab.conceptNumber}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-snug line-clamp-2">
                  {title}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block mt-1 uppercase">
                  {category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Active Lab */}
      <div className="transition-all">
        {activeLab === 'oltp-olap' && <OltpVsOlapLab />}
        {activeLab === 'medallion' && <MedallionLab />}
        {activeLab === 'spark-dag' && <SparkDagShuffleLab />}
        {activeLab === 'time-travel' && <LakehouseTimeTravelLab />}
        {activeLab === 'rag-vector' && <RagVectorLab />}
        {activeLab === 'drift-monitor' && <DriftMonitoringLab />}
        {activeLab === 'z-ordering' && <ZOrderingSkippingLab />}
        {activeLab === 'small-files' && <SmallFilesCompactionLab />}
        {activeLab === 'rbac-masking' && <DataMaskingRbacLab />}
        {activeLab === 'airflow-retry' && <AirflowDagSchedulerLab />}
        {activeLab === 'kafka-rebalance' && <KafkaRebalanceLab />}
        {activeLab === 'lsm-tree' && <LsmTreeStorageLab />}
        {activeLab === 'streaming-window' && <StreamingWatermarkLab />}
        {activeLab === 'sharding-hash' && <ConsistentHashingRingLab />}
        {activeLab === 'sql-optimizer' && <SqlOptimizerLab />}
        {activeLab === 'prompt-battle' && <PromptBattleArenaLab />}
      </div>
    </div>
  );
};
