import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Achievement, UserLevel, DailyMission, LabType } from '../types/concept';
import { sound } from '../utils/soundEffects';

export const USER_LEVELS: UserLevel[] = [
  { level: 1, titlePt: 'Estagiário de Dados', titleEn: 'Data Intern', minXp: 0, maxXp: 300, badgeColor: 'from-slate-500 to-slate-700', iconName: 'Terminal' },
  { level: 2, titlePt: 'Analista de Pipelines', titleEn: 'Pipeline Analyst', minXp: 301, maxXp: 800, badgeColor: 'from-blue-500 to-indigo-600', iconName: 'Cpu' },
  { level: 3, titlePt: 'Engenheiro de Dados Jr', titleEn: 'Junior Data Engineer', minXp: 801, maxXp: 1600, badgeColor: 'from-cyan-500 to-blue-600', iconName: 'Database' },
  { level: 4, titlePt: 'Engenheiro de Dados Pleno', titleEn: 'Mid Data Engineer', minXp: 1601, maxXp: 3000, badgeColor: 'from-emerald-500 to-teal-600', iconName: 'Zap' },
  { level: 5, titlePt: 'Especialista Spark & Lakehouse', titleEn: 'Spark & Lakehouse Specialist', minXp: 3001, maxXp: 5000, badgeColor: 'from-amber-500 to-orange-600', iconName: 'Flame' },
  { level: 6, titlePt: 'Engenheiro de Dados Sênior', titleEn: 'Senior Data Engineer', minXp: 5001, maxXp: 7500, badgeColor: 'from-purple-500 to-indigo-700', iconName: 'Layers' },
  { level: 7, titlePt: 'Arquiteto de Big Data & IA', titleEn: 'Big Data & AI Architect', minXp: 7501, maxXp: 11000, badgeColor: 'from-pink-500 to-rose-600', iconName: 'Bot' },
  { level: 8, titlePt: 'Principal Systems Architect', titleEn: 'Principal Systems Architect', minXp: 11001, maxXp: 20000, badgeColor: 'from-amber-400 via-rose-500 to-cyan-400', iconName: 'Crown' },
];

export const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first_concept',
    titlePt: 'Primeiro Passo Arquitetural',
    titleEn: 'First Architectural Step',
    descPt: 'Domine o seu 1º conceito no roadmap de 100.',
    descEn: 'Master your 1st concept on the 100 roadmap.',
    icon: '🎯',
    category: 'progress',
    xpReward: 100,
    maxProgress: 1,
  },
  {
    id: 'ten_concepts',
    titlePt: 'Base Sólida',
    titleEn: 'Solid Foundation',
    descPt: 'Domine 10 conceitos fundamentais.',
    descEn: 'Master 10 fundamental concepts.',
    icon: '⚡',
    category: 'progress',
    xpReward: 250,
    maxProgress: 10,
  },
  {
    id: 'fundamentals_master',
    titlePt: 'Mestre dos Fundamentos',
    titleEn: 'Fundamentals Master',
    descPt: 'Complete todos os conceitos da Seção 1 (Conceitos 1-10).',
    descEn: 'Complete all concepts from Section 1 (Concepts 1-10).',
    icon: '🏛️',
    category: 'mastery',
    xpReward: 350,
    maxProgress: 10,
  },
  {
    id: 'streaming_pro',
    titlePt: 'Engenheiro de Fluxos',
    titleEn: 'Stream & CDC Pro',
    descPt: 'Domine a Seção 2 de Pipelines & Processamento.',
    descEn: 'Master Section 2 of Pipelines & Processing.',
    icon: '🌊',
    category: 'mastery',
    xpReward: 400,
    maxProgress: 20,
  },
  {
    id: 'spark_wizard',
    titlePt: 'Feiticeiro do Apache Spark',
    titleEn: 'Spark Wizard',
    descPt: 'Domine a Seção 3 e execute a simulação de Shuffles e Skew.',
    descEn: 'Master Section 3 and execute the Shuffle & Skew simulation.',
    icon: '✨',
    category: 'mastery',
    xpReward: 450,
    maxProgress: 20,
  },
  {
    id: 'lakehouse_guru',
    titlePt: 'Guru do Lakehouse ACID',
    titleEn: 'ACID Lakehouse Guru',
    descPt: 'Domine Delta Lake, Iceberg e teste Time Travel.',
    descEn: 'Master Delta Lake, Iceberg and test Time Travel.',
    icon: '🧊',
    category: 'mastery',
    xpReward: 400,
    maxProgress: 10,
  },
  {
    id: 'ai_architect',
    titlePt: 'Arquiteto de IA & MLOps',
    titleEn: 'AI & MLOps Architect',
    descPt: 'Domine RAG, Vetores, Feature Store e Data Drift.',
    descEn: 'Master RAG, Vectors, Feature Store and Data Drift.',
    icon: '🤖',
    category: 'mastery',
    xpReward: 500,
    maxProgress: 20,
  },
  {
    id: 'lab_explorer',
    titlePt: 'Cientista de Laboratório',
    titleEn: 'Lab Scientist',
    descPt: 'Interaja com pelo menos 5 dos 10 simuladores visuais.',
    descEn: 'Interact with at least 5 of the 10 visual simulators.',
    icon: '🧪',
    category: 'labs',
    xpReward: 300,
    maxProgress: 5,
  },
  {
    id: 'quiz_sniper',
    titlePt: 'Gabarito Técnico',
    titleEn: 'Technical Ace',
    descPt: 'Acerte 10 questões de fixação nos quizzes.',
    descEn: 'Answer 10 retention questions correctly in quizzes.',
    icon: '🏹',
    category: 'quizzes',
    xpReward: 300,
    maxProgress: 10,
  },
  {
    id: 'system_designer',
    titlePt: 'Arquiteto de Decisões',
    titleEn: 'Decision Architect',
    descPt: 'Resolva 3 desafios práticos de trade-offs de System Design.',
    descEn: 'Solve 3 practical System Design trade-off challenges.',
    icon: '📐',
    category: 'quizzes',
    xpReward: 350,
    maxProgress: 3,
  },
  {
    id: 'streak_flame',
    titlePt: 'Disciplina de Aço',
    titleEn: 'Discipline of Steel',
    descPt: 'Mantenha uma sequência de 5 dias ativos de estudo.',
    descEn: 'Maintain an active study streak of 5 days.',
    icon: '🔥',
    category: 'streak',
    xpReward: 300,
    maxProgress: 5,
  },
  {
    id: 'centurion',
    titlePt: 'O Grande Centurião dos Dados',
    titleEn: 'Grand Data Centurion',
    descPt: 'Domine todos os 100 conceitos da imagem do roadmap.',
    descEn: 'Master all 100 concepts from the roadmap poster.',
    icon: '👑',
    category: 'progress',
    xpReward: 2000,
    maxProgress: 100,
  },
];

interface ToastNotice {
  id: string;
  title: string;
  message: string;
  type: 'xp' | 'level' | 'achievement';
}

interface GamificationContextType {
  xp: number;
  currentLevel: UserLevel;
  nextLevel: UserLevel | null;
  levelProgressPct: number;
  achievements: Achievement[];
  dailyMissions: DailyMission[];
  unlockedCount: number;
  isAchievementsOpen: boolean;
  setIsAchievementsOpen: (open: boolean) => void;
  soundMuted: boolean;
  toggleSound: () => void;
  toasts: ToastNotice[];
  removeToast: (id: string) => void;
  addXp: (amount: number, reason?: string) => void;
  recordConceptCompleted: (conceptId: number, allCompletedCount: number) => void;
  recordQuizCorrect: () => void;
  recordLabInteraction: (lab: LabType) => void;
  recordSystemDesignSolved: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('de_ai_gamification_xp');
      return saved ? parseInt(saved, 10) : 150; // Welcome starter XP
    } catch {
      return 150;
    }
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => sound.getMuted());
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  // Persistent tracked metrics
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('de_ai_unlocked_achievements');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [testedLabs, setTestedLabs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('de_ai_tested_labs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quizSuccessCount, setQuizSuccessCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('de_ai_quiz_success_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [systemDesignSolvedCount, setSystemDesignSolvedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('de_ai_sd_solved_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Daily missions tracking
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('de_ai_mission_date');
      const savedMissions = localStorage.getItem('de_ai_daily_missions');

      if (savedDate === today && savedMissions) {
        return JSON.parse(savedMissions);
      }
    } catch {}

    return [
      { id: 'm1', titlePt: 'Dominar 2 novos conceitos no roadmap', titleEn: 'Master 2 new roadmap concepts', xpReward: 100, progress: 0, target: 2, completed: false, type: 'concept' },
      { id: 'm2', titlePt: 'Acertar 1 quiz de fixação', titleEn: 'Answer 1 retention quiz correctly', xpReward: 75, progress: 0, target: 1, completed: false, type: 'quiz' },
      { id: 'm3', titlePt: 'Executar 1 laboratório visual interativo', titleEn: 'Run 1 interactive visual lab', xpReward: 120, progress: 0, target: 1, completed: false, type: 'lab' },
    ];
  });

  // Calculate current and next level
  const currentLevel = USER_LEVELS.slice().reverse().find((lvl) => xp >= lvl.minXp) || USER_LEVELS[0];
  const nextLevel = USER_LEVELS.find((lvl) => lvl.level === currentLevel.level + 1) || null;

  const currentLevelSpan = nextLevel ? nextLevel.minXp - currentLevel.minXp : 1000;
  const currentLevelProgress = nextLevel ? xp - currentLevel.minXp : currentLevelSpan;
  const levelProgressPct = Math.min(100, Math.max(0, Math.round((currentLevelProgress / currentLevelSpan) * 100)));

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('de_ai_gamification_xp', xp.toString());
    } catch {}
  }, [xp]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_unlocked_achievements', JSON.stringify(unlockedAchievementIds));
    } catch {}
  }, [unlockedAchievementIds]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_tested_labs', JSON.stringify(testedLabs));
    } catch {}
  }, [testedLabs]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_quiz_success_count', quizSuccessCount.toString());
    } catch {}
  }, [quizSuccessCount]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_sd_solved_count', systemDesignSolvedCount.toString());
    } catch {}
  }, [systemDesignSolvedCount]);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('de_ai_mission_date', today);
      localStorage.setItem('de_ai_daily_missions', JSON.stringify(dailyMissions));
    } catch {}
  }, [dailyMissions]);

  const showToast = (title: string, message: string, type: 'xp' | 'level' | 'achievement') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.setMuted(next);
  };

  const addXp = (amount: number, reason: string = 'Atividade de Estudo') => {
    setXp((prev) => {
      const nextXp = prev + amount;
      const oldLvl = USER_LEVELS.slice().reverse().find((lvl) => prev >= lvl.minXp) || USER_LEVELS[0];
      const newLvl = USER_LEVELS.slice().reverse().find((lvl) => nextXp >= lvl.minXp) || USER_LEVELS[0];

      if (newLvl.level > oldLvl.level) {
        sound.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
        showToast(
          '🎉 SUBIU DE NÍVEL!',
          `Você agora é "${newLvl.titlePt}" (Nível ${newLvl.level})!`,
          'level'
        );
      } else {
        sound.playSuccess();
        showToast(`+${amount} XP`, reason, 'xp');
      }

      return nextXp;
    });
  };

  const checkUnlockAchievement = (id: string, currentVal: number) => {
    if (unlockedAchievementIds[id]) return;
    const base = INITIAL_ACHIEVEMENTS.find((a) => a.id === id);
    if (!base) return;

    if (currentVal >= base.maxProgress) {
      setUnlockedAchievementIds((prev) => ({
        ...prev,
        [id]: new Date().toISOString(),
      }));
      addXp(base.xpReward, `Conquista Desbloqueada: ${base.titlePt}`);
      sound.playLevelUp();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
      });
      showToast(
        `🏆 CONQUISTA DESBLOQUEADA!`,
        `${base.icon} ${base.titlePt}: +${base.xpReward} XP`,
        'achievement'
      );
    }
  };

  const advanceDailyMission = (type: 'concept' | 'quiz' | 'lab') => {
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.type === type && !m.completed) {
          const nextProg = m.progress + 1;
          const completed = nextProg >= m.target;
          if (completed) {
            addXp(m.xpReward, `Missão Diária Concluída: ${m.titlePt}`);
          }
          return { ...m, progress: nextProg, completed };
        }
        return m;
      })
    );
  };

  const recordConceptCompleted = (_conceptId: number, allCompletedCount: number) => {
    advanceDailyMission('concept');
    addXp(50, 'Conceito Dominado');
    checkUnlockAchievement('first_concept', allCompletedCount);
    checkUnlockAchievement('ten_concepts', allCompletedCount);
    checkUnlockAchievement('centurion', allCompletedCount);
  };

  const recordQuizCorrect = () => {
    advanceDailyMission('quiz');
    addXp(75, 'Quiz de Fixação Acertado');
    const nextCount = quizSuccessCount + 1;
    setQuizSuccessCount(nextCount);
    checkUnlockAchievement('quiz_sniper', nextCount);
  };

  const recordLabInteraction = (lab: LabType) => {
    advanceDailyMission('lab');
    if (!testedLabs.includes(lab)) {
      const nextList = [...testedLabs, lab];
      setTestedLabs(nextList);
      addXp(100, `Laboratório Executado: ${lab}`);
      checkUnlockAchievement('lab_explorer', nextList.length);
      if (lab === 'spark-dag') {
        checkUnlockAchievement('spark_wizard', 20);
      }
      if (lab === 'time-travel') {
        checkUnlockAchievement('lakehouse_guru', 10);
      }
    } else {
      addXp(30, 'Simulação de Laboratório Reexecutada');
    }
  };

  const recordSystemDesignSolved = () => {
    const nextCount = systemDesignSolvedCount + 1;
    setSystemDesignSolvedCount(nextCount);
    addXp(120, 'Desafio de System Design Resolvido');
    checkUnlockAchievement('system_designer', nextCount);
  };

  // Compile achievements with live progress
  const achievements: Achievement[] = INITIAL_ACHIEVEMENTS.map((base) => {
    const isUnlocked = Boolean(unlockedAchievementIds[base.id]);
    const unlockedAt = unlockedAchievementIds[base.id];

    let progress = 0;
    if (base.id === 'lab_explorer') progress = testedLabs.length;
    else if (base.id === 'quiz_sniper') progress = quizSuccessCount;
    else if (base.id === 'system_designer') progress = systemDesignSolvedCount;
    else if (base.id === 'first_concept' || base.id === 'ten_concepts' || base.id === 'centurion') {
      try {
        const savedStatus = localStorage.getItem('de_ai_concept_status');
        const map = savedStatus ? JSON.parse(savedStatus) : {};
        progress = Object.values(map).filter((s) => s === 'completed').length;
      } catch {
        progress = isUnlocked ? base.maxProgress : 0;
      }
    } else {
      progress = isUnlocked ? base.maxProgress : 0;
    }

    return {
      ...base,
      isUnlocked,
      unlockedAt,
      progress: Math.min(base.maxProgress, progress),
    };
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <GamificationContext.Provider
      value={{
        xp,
        currentLevel,
        nextLevel,
        levelProgressPct,
        achievements,
        dailyMissions,
        unlockedCount,
        isAchievementsOpen,
        setIsAchievementsOpen,
        soundMuted,
        toggleSound,
        toasts,
        removeToast,
        addXp,
        recordConceptCompleted,
        recordQuizCorrect,
        recordLabInteraction,
        recordSystemDesignSolved,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
