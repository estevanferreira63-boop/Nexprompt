import React, { useState, useEffect } from 'react';
import { MainNavTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ConceptMatrix } from './components/ConceptMatrix';
import { ConceptGraphMap } from './components/ConceptGraphMap';
import { PromptEngineeringAcademy } from './components/PromptEngineeringAcademy';
import { PromptStudioView } from './components/PromptStudioView';
import { CodeArenaLab } from './components/CodeArenaLab';
import { DataArchitectureMatrix } from './components/DataArchitectureMatrix';
import { VisualLabHub } from './components/VisualLabs/VisualLabHub';
import { ScheduleView } from './components/ScheduleView';
import { QuizHubView } from './components/QuizHubView';
import { ConceptDetailModal } from './components/ConceptDetailModal';
import { AiMentorChatView } from './components/AiMentorChatView';
import { AchievementsModal } from './components/AchievementsModal';
import { DataEngTerminalModal } from './components/DataEngTerminalModal';
import { SpacedRepetitionModal } from './components/SpacedRepetitionModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { CertificateModal } from './components/CertificateModal';
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { TechnicalDictionaryModal } from './components/TechnicalDictionaryModal';
import { CONCEPTS_BY_ID, ALL_CONCEPTS } from './data/concepts';
import { ConceptStatus, LabType } from './types/concept';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { Bot, Sparkles, X, Trophy } from 'lucide-react';

function AppContent() {
  const { language, t } = useLanguage();
  const {
    toasts,
    removeToast,
    recordConceptCompleted,
    setIsAchievementsOpen,
  } = useGamification();

  const [activeTab, setActiveTab] = useState<MainNavTab>('matrix');
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'course' | 'overview'>('course');
  const [initialLab, setInitialLab] = useState<LabType>('oltp-olap');
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [testPromptText, setTestPromptText] = useState<string | null>(null);

  // Learning Tools Modal States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  const [isDailyQuestsOpen, setIsDailyQuestsOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Cmd+K, Alt+F, Alt+D, Alt+T, Escape, 1-8 tab navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // Cmd+K or Ctrl+K: Quick Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Alt+F or Ctrl+Shift+F: Flashcards
      if ((e.altKey && e.key.toLowerCase() === 'f') || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setIsFlashcardsOpen((prev) => !prev);
        return;
      }

      // Alt+D: Technical Dictionary
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDictionaryOpen((prev) => !prev);
        return;
      }

      // Alt+T or Ctrl+`: Toggle Data Eng CLI Terminal
      if ((e.altKey && e.key.toLowerCase() === 't') || ((e.metaKey || e.ctrlKey) && e.key === '`')) {
        e.preventDefault();
        setIsTerminalOpen((prev) => !prev);
        return;
      }

      // Escape: Close any open modal
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsFlashcardsOpen(false);
        setIsDictionaryOpen(false);
        setIsTerminalOpen(false);
        setIsCertificateOpen(false);
        setIsDailyQuestsOpen(false);
        setIsMobileSidebarOpen(false);
        setSelectedConceptId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistence in LocalStorage
  const [statusMap, setStatusMap] = useState<Record<number, ConceptStatus>>(() => {
    try {
      const saved = localStorage.getItem('de_ai_concept_status');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [bookmarked, setBookmarked] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('de_ai_concept_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('de_ai_completed_days');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    try {
      return localStorage.getItem('de_ai_active_track') || 'master-100';
    } catch {
      return 'master-100';
    }
  });

  const [streak] = useState<number>(() => {
    try {
      const s = localStorage.getItem('de_ai_streak');
      return s ? parseInt(s, 10) : 3;
    } catch {
      return 3;
    }
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('de_ai_concept_status', JSON.stringify(statusMap));
    } catch (e) {
      console.error(e);
    }
  }, [statusMap]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_concept_bookmarks', JSON.stringify(bookmarked));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarked]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_completed_days', JSON.stringify(completedDays));
    } catch (e) {
      console.error(e);
    }
  }, [completedDays]);

  useEffect(() => {
    try {
      localStorage.setItem('de_ai_active_track', activeTrackId);
    } catch (e) {
      console.error(e);
    }
  }, [activeTrackId]);

  // Status and Bookmark Handlers
  const handleStatusChange = (conceptId: number, status: ConceptStatus) => {
    setStatusMap((prev) => {
      const isNewlyCompleted = status === 'completed' && prev[conceptId] !== 'completed';
      const updated = {
        ...prev,
        [conceptId]: status,
      };

      if (isNewlyCompleted) {
        const nextCompletedCount = Object.values(updated).filter((s) => s === 'completed').length;
        recordConceptCompleted(conceptId, nextCompletedCount);
      }

      return updated;
    });
  };

  const handleBookmarkToggle = (conceptId: number) => {
    setBookmarked((prev) =>
      prev.includes(conceptId) ? prev.filter((id) => id !== conceptId) : [...prev, conceptId]
    );
  };

  const handleToggleDayCompleted = (dayKey: string) => {
    setCompletedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const handleOpenLab = (labType: LabType) => {
    setInitialLab(labType);
    setActiveTab('labs');
    setSelectedConceptId(null);
  };

  // Learning Recommendation Engine: find the next concept to study
  const handleStudyNextRecommended = () => {
    // 1. Look for in-progress first
    const inProgress = ALL_CONCEPTS.find((c) => statusMap[c.id] === 'in_progress');
    if (inProgress) {
      setSelectedConceptId(inProgress.id);
      return;
    }
    // 2. Otherwise look for first not started
    const notStarted = ALL_CONCEPTS.find((c) => !statusMap[c.id] || statusMap[c.id] === 'not_started');
    if (notStarted) {
      setSelectedConceptId(notStarted.id);
      return;
    }
    // 3. Fallback: concept 1
    setSelectedConceptId(1);
  };

  const completedCount = ALL_CONCEPTS.filter((c) => statusMap[c.id] === 'completed').length;
  const selectedConcept = selectedConceptId ? CONCEPTS_BY_ID[selectedConceptId] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans relative">
      {/* Left Sidebar Menu (replaces old top header) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        completedCount={completedCount}
        streak={streak}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onStudyNextRecommended={handleStudyNextRecommended}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDailyQuests={() => setIsDailyQuestsOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Main Content Area (padded on left for fixed sidebar on lg screens) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Bar with mobile trigger, breadcrumb & quick actions */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
          onStudyNextRecommended={handleStudyNextRecommended}
          onOpenChat={() => setActiveTab('chat')}
          completedCount={completedCount}
          streak={streak}
        />

        {/* Main View Container */}
        <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 ${activeTab === 'chat' ? 'py-2 sm:py-3 flex flex-col min-h-0' : 'py-6 sm:py-8'}`}>
          {activeTab === 'matrix' && (
            <ConceptMatrix
              statusMap={statusMap}
              bookmarked={bookmarked}
              onSelectConcept={(conceptId, initialTab = 'course') => {
                setModalInitialTab(initialTab);
                setSelectedConceptId(conceptId);
              }}
              onStatusChange={handleStatusChange}
              onBookmarkToggle={handleBookmarkToggle}
              onOpenPrompts={() => setActiveTab('prompts')}
              onOpenDictionary={() => setIsDictionaryOpen(true)}
            />
          )}

          {activeTab === 'graph' && (
            <ConceptGraphMap
              statusMap={statusMap}
              bookmarked={bookmarked}
              onSelectConcept={(conceptId) => {
                setModalInitialTab('course');
                setSelectedConceptId(conceptId);
              }}
              onStatusChange={handleStatusChange}
              onBookmarkToggle={handleBookmarkToggle}
              onOpenLab={handleOpenLab}
              onOpenChatWithConcept={(conceptId) => {
                setSelectedConceptId(conceptId);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'labs' && (
            <VisualLabHub initialLab={initialLab} />
          )}

          {activeTab === 'prompts' && (
            <PromptStudioView
              onOpenChatWithPrompt={(promptText) => {
                setTestPromptText(promptText);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'coding' && (
            <CodeArenaLab
              onOpenChatWithCode={(codeSnippet) => {
                setTestPromptText(codeSnippet);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'architecture' && (
            <DataArchitectureMatrix />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              completedDays={completedDays}
              statusMap={statusMap}
              onToggleDayCompleted={handleToggleDayCompleted}
              onSelectConcept={(conceptId) => {
                setModalInitialTab('course');
                setSelectedConceptId(conceptId);
              }}
              activeTrackId={activeTrackId}
              onSelectTrack={setActiveTrackId}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizHubView
              statusMap={statusMap}
              onStatusChange={handleStatusChange}
              onSelectConcept={(conceptId) => {
                setModalInitialTab('course');
                setSelectedConceptId(conceptId);
              }}
            />
          )}

          {activeTab === 'chat' && (
            <AiMentorChatView
              initialConceptId={selectedConceptId}
              initialPromptText={testPromptText}
            />
          )}
        </main>
      </div>

      {/* Concept Detail Modal */}
      {selectedConcept && (
        <ConceptDetailModal
          concept={selectedConcept}
          status={statusMap[selectedConcept.id] || 'not_started'}
          isBookmarked={bookmarked.includes(selectedConcept.id)}
          onClose={() => setSelectedConceptId(null)}
          onStatusChange={handleStatusChange}
          onBookmarkToggle={handleBookmarkToggle}
          onSelectConcept={(conceptId) => {
            setModalInitialTab('course');
            setSelectedConceptId(conceptId);
          }}
          onOpenLab={handleOpenLab}
          onOpenPromptStudio={(_topic) => {
            setActiveTab('prompts');
          }}
          initialTab={modalInitialTab}
        />
      )}

      {/* Gamification Achievements & Career Modal */}
      <AchievementsModal />

      {/* Spaced Repetition Active Recall Flashcards Modal */}
      <SpacedRepetitionModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        statusMap={statusMap}
        onStatusChange={handleStatusChange}
        onOpenConceptDetail={(id) => setSelectedConceptId(id)}
      />

      {/* Quick Search Modal (Cmd+K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectConcept={(id) => setSelectedConceptId(id)}
        statusMap={statusMap}
      />

      {/* Data Eng Interactive CLI Terminal Modal */}
      <DataEngTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      {/* Technical Dictionary Modal (Plain-English & Deep Tech) */}
      <TechnicalDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onSelectConcept={(id) => {
          setSelectedConceptId(id);
          setActiveTab('matrix');
        }}
      />

      {/* Official Mastery Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        completedCount={completedCount}
      />

      {/* Daily Quests & Streak Modal */}
      <DailyQuestsModal
        isOpen={isDailyQuestsOpen}
        onClose={() => setIsDailyQuestsOpen(false)}
        completedConceptsToday={completedCount}
      />

      {/* Floating Quick Action: Open AI Chat or Badges */}
      {activeTab !== 'chat' && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
            title={language === 'pt' ? 'Tirar Dúvidas com o Mentor IA' : 'Ask AI Data Mentor'}
          >
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-mono hidden sm:inline">
              {language === 'pt' ? 'Dúvidas com IA' : 'Ask AI Mentor'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      )}

      {/* Toast Notifications Overlay */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-fadeIn transition-all ${
              toast.type === 'level'
                ? 'bg-slate-900/95 border-amber-500 shadow-amber-500/20 text-amber-200'
                : toast.type === 'achievement'
                ? 'bg-slate-900/95 border-cyan-500 shadow-cyan-500/20 text-cyan-200'
                : 'bg-slate-900/95 border-emerald-500 shadow-emerald-500/20 text-emerald-200'
            }`}
          >
            <div className="flex gap-2.5">
              <span className="text-xl">
                {toast.type === 'level' ? '⭐' : toast.type === 'achievement' ? '🏆' : '⚡'}
              </span>
              <div>
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  {toast.title}
                </h5>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer with Infographic Attribution (padded for left sidebar on lg) */}
      {activeTab !== 'chat' && (
        <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 font-mono space-y-2 lg:pl-72">
          <p className="text-slate-400 font-bold">
            {t('footerQuote')}
          </p>
          <p>
            {t('footerAttribution')}
          </p>
          <p className="text-[11px] text-slate-600">
            {t('footerSub')}
          </p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </LanguageProvider>
  );
}

