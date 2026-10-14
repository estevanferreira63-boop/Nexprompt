import React, { useState } from 'react';
import { StudyTrack, ConceptStatus } from '../types/concept';
import { STUDY_TRACKS } from '../data/studyTracks';
import { CONCEPTS_BY_ID } from '../data/concepts';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface ScheduleViewProps {
  completedDays: Record<string, boolean>;
  statusMap: Record<number, ConceptStatus>;
  onToggleDayCompleted: (dayKey: string) => void;
  onSelectConcept: (conceptId: number) => void;
  activeTrackId: string;
  onSelectTrack: (trackId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  completedDays,
  onToggleDayCompleted,
  onSelectConcept,
  activeTrackId,
  onSelectTrack,
}) => {
  const { language, t } = useLanguage();
  const currentTrack = STUDY_TRACKS.find((t) => t.id === activeTrackId) || STUDY_TRACKS[0];
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  const completedCount = currentTrack.days.filter(
    (d) => completedDays[`${currentTrack.id}_${d.day}`]
  ).length;

  const progressPct = ((completedCount / currentTrack.totalDays) * 100).toFixed(0);

  // Group days by week
  const weeks = Array.from(new Set(currentTrack.days.map((d) => d.week)));

  const handleCheckDay = (dayNum: number) => {
    const key = `${currentTrack.id}_${dayNum}`;
    const nextState = !completedDays[key];
    onToggleDayCompleted(key);

    if (nextState) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
  };

  const filteredDays = selectedWeek === 'all'
    ? currentTrack.days
    : currentTrack.days.filter((d) => d.week === selectedWeek);

  return (
    <div className="space-y-6">
      {/* Track Selector Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4" /> {t('scheduleTitle')}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {currentTrack.title}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              {currentTrack.description}
            </p>
          </div>

          {/* Track Switcher Pills */}
          <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1 self-start md:self-auto">
            {STUDY_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  onSelectTrack(track.id);
                  setSelectedWeek('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  track.id === currentTrack.id
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {track.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Track Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">{t('scheduleCompletedDays')}</span>
              <span className="font-bold text-cyan-400">{completedCount} {t('of')} {currentTrack.totalDays}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-900/40">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{t('scheduleRhythm')}</span>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week Selector Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-mono">
        <span className="text-slate-500 flex-shrink-0">{t('scheduleFilterWeek')}</span>
        <button
          onClick={() => setSelectedWeek('all')}
          className={`px-3 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
            selectedWeek === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {t('scheduleAllWeeks')} ({currentTrack.days.length} {t('daysCount')})
        </button>
        {weeks.map((w) => (
          <button
            key={w}
            onClick={() => setSelectedWeek(w)}
            className={`px-3 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
              selectedWeek === w
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {t('scheduleWeek')} {w}
          </button>
        ))}
      </div>

      {/* Days List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDays.map((day) => {
          const isDone = completedDays[`${currentTrack.id}_${day.day}`];

          return (
            <div
              key={day.day}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-950/60 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCheckDay(day.day)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current stroke-slate-950" />
                    </button>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {t('scheduleWeek')} {day.week} • {t('scheduleDay')} {day.day}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{day.estimatedMinutes} {t('scheduleEstTime')}</span>
                  </div>
                </div>

                <h3 className={`text-sm font-bold mt-1 ${isDone ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {day.title}
                </h3>

                {/* Concept Pills */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {day.conceptIds.map((cid) => {
                    const c = CONCEPTS_BY_ID[cid];
                    if (!c) return null;
                    return (
                      <button
                        key={cid}
                        onClick={() => onSelectConcept(cid)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <span>#{c.id}</span>
                        <span className="font-bold">{c.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    );
                  })}
                </div>

                {/* Daily Goal */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    {t('scheduleGoal')}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {day.goal}
                  </p>
                </div>

                {/* Practical Task */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block mb-1">
                    {t('scheduleTask')}
                  </span>
                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    {day.practicalTask}
                  </p>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                <button
                  onClick={() => onSelectConcept(day.conceptIds[0])}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  {t('scheduleStudyConcept')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCheckDay(day.day)}
                  className={`text-xs font-mono font-semibold px-3 py-1 rounded-lg transition-colors ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isDone ? t('scheduleMarkedDone') : t('scheduleMarkDone')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
