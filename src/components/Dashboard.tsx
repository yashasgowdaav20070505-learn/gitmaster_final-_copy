import { useState } from 'react';
import { UserProgress, Lesson } from '../types';
import { MODULES, ALL_BADGES } from '../data/lessons';
import {
  getTotalCompletionStats,
  getNextRecommendedLesson,
} from '../utils/continuityRewards';
import {
  Trophy,
  Flame,
  Coins,
  Zap,
  Star,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onResetProgress: () => void;
}

export default function Dashboard({
  progress,
  onSelectLesson,
  onResetProgress,
}: DashboardProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const nextActive = getNextRecommendedLesson(progress.completedLessons);
  const totalStats = getTotalCompletionStats(progress.completedLessons);
  const hasStarted = progress.completedLessons.length > 0 || progress.xp > 0;

  const currentLevel = Math.floor(progress.xp / 300) + 1;
  const xpNeededForNext = currentLevel * 300;
  const previousLevelXp = (currentLevel - 1) * 300;
  const xpProgressPercent = Math.min(
    100,
    Math.max(
      0,
      ((progress.xp - previousLevelXp) / (xpNeededForNext - previousLevelXp)) * 100
    )
  );

  const missions = [
    {
      id: 'm1',
      title: 'Daily Explorer',
      desc: 'Complete 1 Git lesson',
      target: 1,
      current: progress.completedLessons.length > 0 ? 1 : 0,
      reward: 50,
    },
    {
      id: 'm2',
      title: 'XP Collector',
      desc: 'Accumulate 250 XP',
      target: 250,
      current: Math.min(250, progress.xp),
      reward: 80,
    },
    {
      id: 'm3',
      title: 'Commit Maestro',
      desc: 'Solve a history or branch lesson',
      target: 1,
      current:
        progress.completedLessons.filter(
          (id) => id.includes('commit') || id.includes('branch')
        ).length > 0
          ? 1
          : 0,
      reward: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="dashboard-view">
      {/* Left Column: Progress Roadmap Tree */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="editorial-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <span className="font-mono text-[11px] font-bold text-[#D9541E] uppercase tracking-wider">
              Full Curriculum · {totalStats.completedCount}/{totalStats.totalCount} Lessons
            </span>
            <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight mt-1">
              {hasStarted ? 'Continue Your Git Journey' : 'Begin Your Git Journey'}
            </h2>
            <p className="text-[#524E48] text-xs mt-1.5 max-w-md leading-relaxed">
              Work through eight structured modules from repository initialization and branching to history rewriting, rebasing, and GitHub release workflows.
            </p>
            {nextActive && (
              <button
                onClick={() => onSelectLesson(nextActive.lesson)}
                className="editorial-btn-primary mt-4 px-4 py-2.5 text-xs font-bold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>
                  {hasStarted
                    ? `Resume: ${nextActive.lesson.title}`
                    : `Start: ${nextActive.lesson.title}`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Level Stats Block */}
          <div className="bg-[#E6DFD1] p-4 rounded-lg border-2 border-[#111111] shrink-0 w-full md:w-64">
            <div className="flex items-center justify-between font-mono font-bold text-xs text-[#111111] tabular-nums">
              <span>LEVEL {currentLevel}</span>
              <span className="text-[#D9541E]">
                {progress.xp} / {xpNeededForNext} XP
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#FAF7F0] rounded-sm mt-2.5 overflow-hidden border-2 border-[#111111]">
              <div
                className="h-full bg-[#1E6F50] transition-all duration-500"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-[#524E48] mt-2 font-mono text-right tabular-nums">
              {xpNeededForNext - progress.xp} XP to next level
            </div>
          </div>
        </div>

        {/* Modules Roadmap Node Tree */}
        <div className="flex flex-col gap-6">
          {MODULES.map((module, mIdx) => {
            const moduleCompletedLessons = module.lessons.filter((les) =>
              progress.completedLessons.includes(les.id)
            );
            const modulePercent =
              module.lessons.length > 0
                ? Math.round((moduleCompletedLessons.length / module.lessons.length) * 100)
                : 0;

            return (
              <div key={module.id} className="editorial-card p-5 flex flex-col gap-5">
                {/* Module Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D9541E] uppercase tracking-wider">
                      Module 0{mIdx + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-[#111111] mt-0.5">
                      {module.title}
                    </h3>
                    <p className="text-xs text-[#524E48] mt-0.5">{module.description}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#111111] bg-[#E6DFD1] border-2 border-[#111111] px-2.5 py-1 rounded-md shrink-0 tabular-nums self-start sm:self-center">
                    {modulePercent}% Complete
                  </span>
                </div>

                {/* Vertical roadmap layout */}
                <div className="flex flex-col items-center gap-6 py-4 relative">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-[#111111]/25 z-0" />

                  {module.lessons.map((lesson, lIdx) => {
                    const isCompleted = progress.completedLessons.includes(lesson.id);
                    let isUnlocked = false;
                    if (lIdx === 0) {
                      if (mIdx === 0) {
                        isUnlocked = true;
                      } else {
                        const prevModule = MODULES[mIdx - 1];
                        isUnlocked = prevModule.lessons.every((l) =>
                          progress.completedLessons.includes(l.id)
                        );
                      }
                    } else {
                      isUnlocked = progress.completedLessons.includes(
                        module.lessons[lIdx - 1].id
                      );
                    }

                    const alignClass =
                      lIdx % 2 === 0 ? 'md:translate-x-14' : 'md:-translate-x-14';

                    return (
                      <div
                        key={lesson.id}
                        className={`z-10 flex flex-col items-center gap-2 max-w-xs transition-transform ${alignClass}`}
                      >
                        <button
                          onClick={() => isUnlocked && onSelectLesson(lesson)}
                          disabled={!isUnlocked}
                          className={`w-13 h-13 rounded-full flex items-center justify-center border-2 border-[#111111] relative transition-all ${
                            isCompleted
                              ? 'bg-[#1E6F50] text-[#FAF7F0] shadow-[3px_3px_0px_#111111] cursor-pointer hover:-translate-y-0.5'
                              : isUnlocked
                              ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[3px_3px_0px_#111111] cursor-pointer hover:-translate-y-0.5'
                              : 'bg-[#E6DFD1] text-[#524E48] cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isUnlocked ? (
                            <Star className="w-5 h-5 fill-[#FAF7F0]" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}

                          {isUnlocked && !isCompleted && (
                            <span className="absolute -top-2 -right-3 px-1.5 py-0.5 bg-[#FAF7F0] border-2 border-[#111111] text-[#111111] font-mono text-[9px] font-bold rounded tabular-nums">
                              +{lesson.xpReward}
                            </span>
                          )}
                        </button>

                        <div className="text-center bg-[#FAF7F0] px-3 py-1.5 rounded-lg border border-[#111111]/20">
                          <div
                            className={`text-xs font-extrabold leading-tight ${
                              isUnlocked ? 'text-[#111111]' : 'text-[#524E48]'
                            }`}
                          >
                            {lesson.title}
                          </div>
                          <div className="text-[11px] text-[#524E48] max-w-[190px] truncate mx-auto mt-0.5">
                            {lesson.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Gamification Widgets */}
      <div className="flex flex-col gap-6">
        {/* Quick Stats Panel */}
        <div className="editorial-card p-5 flex flex-col gap-4">
          <h3 className="font-mono font-bold text-[#111111] text-xs uppercase tracking-wider border-b-2 border-[#111111] pb-2.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D9541E]" /> Academy Ledger
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#F3EEE3] p-3 rounded-lg border-2 border-[#111111] text-center flex flex-col items-center">
              <Zap className="w-4 h-4 text-[#D9541E] mb-1" />
              <div className="font-bold font-mono text-sm text-[#111111] tabular-nums">
                {progress.xp}
              </div>
              <div className="text-[10px] text-[#524E48] font-mono font-bold uppercase">
                XP
              </div>
            </div>
            <div className="bg-[#F3EEE3] p-3 rounded-lg border-2 border-[#111111] text-center flex flex-col items-center">
              <Coins className="w-4 h-4 text-[#D9541E] mb-1" />
              <div className="font-bold font-mono text-sm text-[#111111] tabular-nums">
                {progress.coins}
              </div>
              <div className="text-[10px] text-[#524E48] font-mono font-bold uppercase">
                Coins
              </div>
            </div>
            <div className="bg-[#F3EEE3] p-3 rounded-lg border-2 border-[#111111] text-center flex flex-col items-center">
              <Flame className="w-4 h-4 text-[#D9541E] mb-1" />
              <div className="font-bold font-mono text-sm text-[#111111] tabular-nums">
                {progress.streak}d
              </div>
              <div className="text-[10px] text-[#524E48] font-mono font-bold uppercase">
                Streak
              </div>
            </div>
          </div>
        </div>

        {/* Daily Missions Widget */}
        <div className="editorial-card p-5 flex flex-col gap-4">
          <h3 className="font-mono font-bold text-[#111111] text-xs uppercase tracking-wider border-b-2 border-[#111111] pb-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E6F50]" /> Active Missions
          </h3>
          <div className="flex flex-col gap-3">
            {missions.map((m) => {
              const percent = Math.min(100, Math.round((m.current / m.target) * 100));
              return (
                <div
                  key={m.id}
                  className="bg-[#F3EEE3] p-3 rounded-lg border-2 border-[#111111] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-[#111111]">{m.title}</div>
                      <div className="text-[11px] text-[#524E48] mt-0.5">{m.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#111111] bg-[#E6DFD1] px-2 py-0.5 rounded border border-[#111111] shrink-0 tabular-nums">
                      +{m.reward} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 bg-[#FAF7F0] rounded-sm overflow-hidden border border-[#111111]">
                      <div
                        className="h-full bg-[#1E6F50]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#111111] font-bold shrink-0 tabular-nums">
                      {m.current}/{m.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unlocked Badges Trophy Cabinet */}
        <div className="editorial-card p-5 flex flex-col gap-4">
          <h3 className="font-mono font-bold text-[#111111] text-xs uppercase tracking-wider border-b-2 border-[#111111] pb-2.5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D9541E]" /> Lesson Stamps
          </h3>

          <div className="grid grid-cols-4 gap-2.5">
            {ALL_BADGES.map((badge) => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  title={`${badge.title}: ${badge.description}`}
                  className={`aspect-square rounded-lg border-2 border-[#111111] flex flex-col items-center justify-center p-1.5 transition-transform hover:-translate-y-0.5 ${
                    isUnlocked
                      ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[2px_2px_0px_#111111]'
                      : 'bg-[#E6DFD1] text-[#524E48]'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <div className="text-[9px] mt-1 font-bold font-mono text-center truncate max-w-full">
                    {badge.title.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#524E48] text-center font-medium">
            Complete terminal challenges to stamp badges into your cabinet.
          </p>
        </div>

        {/* Safe Reset Control */}
        <div className="editorial-card-flat p-4 flex flex-col items-center gap-2 text-center">
          {!confirmingReset ? (
            <button
              onClick={() => setConfirmingReset(true)}
              className="text-xs text-[#D9541E] hover:underline cursor-pointer font-mono font-bold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress Data</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <p className="text-[11px] text-[#111111] font-semibold">
                Erase XP, streak, and completed lessons?
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setConfirmingReset(false);
                  }}
                  className="px-3 py-1.5 bg-[#D9541E] text-[#FAF7F0] border-2 border-[#111111] rounded text-xs font-bold cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="px-3 py-1.5 bg-[#E6DFD1] text-[#111111] border-2 border-[#111111] rounded text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
