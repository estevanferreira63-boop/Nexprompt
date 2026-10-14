export type Language = 'pt' | 'en';

export type SectionId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export type ConceptStatus = 'not_started' | 'in_progress' | 'completed';

export type LabType =
  | 'oltp-olap'
  | 'medallion'
  | 'spark-dag'
  | 'time-travel'
  | 'z-ordering'
  | 'rag-vector'
  | 'drift-monitor'
  | 'small-files'
  | 'rbac-masking'
  | 'airflow-retry'
  | 'kafka-rebalance'
  | 'lsm-tree'
  | 'streaming-window'
  | 'sharding-hash'
  | 'sql-optimizer'
  | 'prompt-battle';

export interface SectionMeta {
  id: SectionId;
  name: string;
  namePt: string;
  nameEn: string;
  shortName: string;
  shortNamePt: string;
  shortNameEn: string;
  range: string;
  rangePt: string;
  rangeEn: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconName: string;
  description: string;
  descriptionPt: string;
  descriptionEn: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodeSample {
  language: string;
  title: string;
  code: string;
}

export interface Concept {
  id: number;
  sectionId: SectionId;
  name: string;
  tagline: string;
  difficulty: DifficultyLevel;
  overview: string;
  whyItMatters: string;
  underTheHood: string;
  realWorldExample: string;
  codeSnippet?: CodeSample;
  antiPatterns?: string[];
  bestPractices?: string[];
  relatedIds: number[];
  quiz?: QuizQuestion;
  labType?: LabType;
}

export interface StudyDay {
  day: number;
  week: number;
  title: string;
  conceptIds: number[];
  goal: string;
  practicalTask: string;
  estimatedMinutes: number;
}

export interface StudyTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  totalDays: number;
  days: StudyDay[];
}

export interface Achievement {
  id: string;
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
  icon: string;
  category: 'progress' | 'mastery' | 'labs' | 'quizzes' | 'streak';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface UserLevel {
  level: number;
  titlePt: string;
  titleEn: string;
  minXp: number;
  maxXp: number;
  badgeColor: string;
  iconName: string;
}

export interface DailyMission {
  id: string;
  titlePt: string;
  titleEn: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  type: 'concept' | 'quiz' | 'lab';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  conceptContext?: { id: number; name: string };
}

export interface UserProgress {
  statusMap: Record<number, ConceptStatus>;
  bookmarked: number[];
  notes: Record<number, string>;
  quizScores: Record<number, { completed: boolean; score: number; date: string }>;
  activeTrackId: string;
  completedDays: Record<string, boolean>; // e.g. "trackId_day"
  streak: number;
  lastActiveDate: string;
  xp: number;
  unlockedAchievements: string[];
  completedMissions: string[];
}
