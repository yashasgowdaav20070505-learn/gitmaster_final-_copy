import { Lesson, UserProgress, UserProfile } from '../types';
import { MODULES } from '../data/lessons';
import {
  getTotalCompletionStats,
  getNextRecommendedLesson,
} from '../utils/continuityRewards';
import ContinuityBadges from './ContinuityBadges';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  Flame,
  Map,
  Terminal,
  Trophy,
  CheckCircle2,
  User,
  FolderGit2,
} from 'lucide-react';

export type AppRouteTab =
  | 'home'
  | 'roadmap'
  | 'projects'
  | 'daily-test'
  | 'sandbox'
  | 'cheatsheet'
  | 'profile'
  | 'about';

interface LandingHubProps {
  progress: UserProgress;
  profile: UserProfile;
  streakPopping?: boolean;
  onNavigate: (tab: AppRouteTab) => void;
  onStartLesson: (lesson: Lesson) => void;
}

export default function LandingHub({
  progress,
  profile,
  streakPopping = false,
  onNavigate,
  onStartLesson,
}: LandingHubProps) {
  const isReturningUser = progress.completedLessons.length > 0 || progress.xp > 0;
  const nextRecommendation = getNextRecommendedLesson(progress.completedLessons);
  const totalStats = getTotalCompletionStats(progress.completedLessons);
  const firstLesson = MODULES[0]?.lessons[0];

  const handlePrimaryCTA = () => {
    if (!isReturningUser && firstLesson) {
      onStartLesson(firstLesson);
      return;
    }
    if (nextRecommendation) {
      onStartLesson(nextRecommendation.lesson);
      return;
    }
    onNavigate('roadmap');
  };

  const featureCards: {
    id: AppRouteTab;
    index: string;
    title: string;
    description: string;
    actionLabel: string;
    icon: typeof BookOpen;
  }[] = [
    {
      id: 'roadmap',
      index: '01',
      title: 'Visual Roadmap',
      description:
        'Interactive 8-module learning path with real-world analogies, quizzes, and guided terminal drills.',
      actionLabel: 'Open Roadmap',
      icon: Map,
    },
    {
      id: 'projects',
      index: '02',
      title: 'Project Studio',
      description:
        'Edit persistent multi-file starter repos, inspect real diffs, resolve conflicts, and sync with origin.',
      actionLabel: 'Open Studio',
      icon: FolderGit2,
    },
    {
      id: 'sandbox',
      index: '03',
      title: 'Zero-Risk Sandbox',
      description:
        'In-browser Git simulator paired with a live working directory, staging index, and commit visualizer.',
      actionLabel: 'Launch Sandbox',
      icon: Terminal,
    },
    {
      id: 'cheatsheet',
      index: '04',
      title: 'Command Cheatsheet',
      description:
        'Searchable Git reference organized by workflow stage with syntax examples and one-click copy.',
      actionLabel: 'Browse Commands',
      icon: FileText,
    },
    {
      id: 'profile',
      index: '05',
      title: 'Profile & Trophies',
      description:
        'Track 3-day, 7-day, and 10-day streak stamps, earned badges, and your official GitMaster certificate.',
      actionLabel: 'Open Profile',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3EEE3] text-[#111111] flex flex-col pb-20 md:pb-0">
      {/* Editorial 3-Zone Top Navigation Bar */}
      <header className="border-b-2 border-[#111111] bg-[#FAF7F0] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark + GM Logo Badge */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span className="w-9 h-9 bg-[#D9541E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-md flex items-center justify-center font-mono font-extrabold text-sm text-[#FAF7F0] tracking-tight">
              GM
            </span>
            <span className="text-lg font-extrabold tracking-tight text-[#111111] whitespace-nowrap">
              GitMaster
            </span>
          </button>

          {/* Zone 2: Minimal Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-semibold text-[#524E48]">
            <button
              onClick={() => onNavigate('roadmap')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Roadmap
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Project Studio
            </button>
            <button
              onClick={() => onNavigate('daily-test')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Daily Test
            </button>
            <button
              onClick={() => onNavigate('sandbox')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Sandbox
            </button>
            <button
              onClick={() => onNavigate('cheatsheet')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Cheatsheet
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="hover:text-[#111111] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Profile
            </button>
          </nav>

          {/* Zone 3: Live Streak Pill + Compact Profile Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {progress.streak > 0 ? (
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-1.5 bg-[#E6DFD1] hover:bg-[#FAF7F0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] px-2.5 sm:px-3 py-1.5 rounded-md font-mono text-xs font-bold text-[#111111] cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  streakPopping ? 'streak-pill-pop' : ''
                }`}
                title="Current Active Streak"
              >
                <Flame className="w-4 h-4 text-[#D9541E] fill-[#D9541E]" />
                <span>
                  {progress.streak}
                  <span className="hidden sm:inline"> Day Streak</span>
                  <span className="sm:hidden">d</span>
                </span>
              </button>
            ) : (
              <button
                onClick={handlePrimaryCTA}
                className="hidden md:inline-flex editorial-btn-primary px-4 py-2 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
              >
                Start Learning
              </button>
            )}

            <button
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-lg bg-[#E6DFD1] hover:bg-[#D9541E] hover:text-[#FAF7F0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#111111] cursor-pointer transition-colors"
              title={`Profile: ${profile.name}`}
              aria-label="Open Profile & Trophies"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-14 flex flex-col gap-10 md:gap-12">
        {/* Hero Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Hero Copy & Dynamic CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center gap-5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold text-[#524E48]">
              <span className="text-[#D9541E]">Git &amp; GitHub Academy</span>
              <span aria-hidden="true">&middot;</span>
              <span>8 Modules &bull; 20 Interactive Labs</span>
              <span aria-hidden="true">&middot;</span>
              <span className="tabular-nums">
                {totalStats.completedCount}/{totalStats.totalCount} Lessons Completed
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111111] leading-[1.08] text-balance">
              Master Git through hands-on practice, not guesswork.
            </h1>

            <p className="text-sm sm:text-base text-[#524E48] leading-relaxed max-w-xl">
              Learn version control in an isolated browser terminal with live repository state visualization, adaptive Daily Tests, and milestone continuity rewards.
            </p>

            {/* Conditional Start vs Resume CTA + Daily Test Action */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {!isReturningUser ? (
                <button
                  onClick={handlePrimaryCTA}
                  className="editorial-btn-primary px-6 py-3.5 text-sm font-bold flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePrimaryCTA}
                  className="editorial-btn-primary px-6 py-3.5 text-sm font-bold flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 max-w-full"
                >
                  <span className="truncate">
                    Resume: {nextRecommendation?.lesson.title ?? 'Continue Academy'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              )}

              <button
                onClick={() => onNavigate('daily-test')}
                className="editorial-btn-secondary px-5 py-3.5 text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <ClipboardCheck className="w-4 h-4 text-[#D9541E]" />
                <span>Take Daily Test</span>
              </button>

              <button
                onClick={() => onNavigate('roadmap')}
                className="editorial-btn-secondary px-4 py-3.5 text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Full Roadmap</span>
              </button>
            </div>

            {isReturningUser && (
              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-[#524E48] tabular-nums">
                <span className="flex items-center gap-1.5 text-[#1E6F50] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{totalStats.percent}% Curriculum Mastery</span>
                </span>
                <span aria-hidden="true">&middot;</span>
                <span>{progress.xp} XP Earned</span>
                <span aria-hidden="true">&middot;</span>
                <span>{progress.coins} Coins</span>
              </div>
            )}
          </div>

          {/* Right Hero Card: Tactile Editorial Terminal Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between editorial-terminal-shell overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3EEE3]/20">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#F3EEE3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9541E]" />
                <span>gitmaster-simulator</span>
              </div>
              <span className="font-mono text-[11px] text-[#F3EEE3]/70">
                branch: main
              </span>
            </div>

            <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed flex flex-col gap-3 text-[#F3EEE3] flex-1 justify-center">
              <div>
                <span className="text-[#D9541E] font-bold">guest@gitmaster:~$</span>{' '}
                <span>git init</span>
                <div className="text-[#F3EEE3]/75 mt-1 pl-2 border-l-2 border-[#D9541E]">
                  Initialized empty Git repository in /workspace/.git/
                </div>
              </div>

              <div>
                <span className="text-[#D9541E] font-bold">guest@gitmaster:~$</span>{' '}
                <span>git add about-kittens.txt</span>
              </div>

              <div>
                <span className="text-[#D9541E] font-bold">guest@gitmaster:~$</span>{' '}
                <span>git commit -m &quot;Add safe snapshot&quot;</span>
                <div className="text-[#6EE7B7] mt-1 pl-2 border-l-2 border-[#1E6F50]">
                  [main a1b2c3d] Add safe snapshot (1 file committed)
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-[#F3EEE3] text-[#111111] border-t-2 border-[#111111] flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-bold">
                Safe local simulation &middot; No setup needed
              </span>
              <button
                onClick={() => onNavigate('sandbox')}
                className="font-mono text-xs font-bold text-[#D9541E] hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Try Sandbox &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Feature Showcase Grid (4 Clickable Cards) */}
        <section className="flex flex-col gap-5" aria-label="Platform Features">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                Explore the Workspace
              </span>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight mt-0.5">
                Five ways to build lasting Git fluency
              </h2>
            </div>
            <span className="font-mono text-xs text-[#524E48]">
              Select any card to jump right in
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {featureCards.map((card) => {
              const IconComp = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => onNavigate(card.id)}
                  className="editorial-card-interactive p-5 text-left flex flex-col justify-between gap-5 cursor-pointer group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-lg bg-[#E6DFD1] border-2 border-[#111111] flex items-center justify-center text-[#111111] group-hover:bg-[#D9541E] group-hover:text-[#FAF7F0] transition-colors">
                        <IconComp className="w-5 h-5" />
                      </span>
                      <span className="font-mono text-xs font-bold text-[#524E48]">
                        {card.index}.
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#111111] leading-snug">
                      {card.title}
                    </h3>

                    <p className="text-xs text-[#524E48] leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#111111]/15 flex items-center justify-between font-mono text-xs font-bold text-[#D9541E]">
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Continuity Milestones Preview */}
        <ContinuityBadges
          progress={progress}
          compact
          onOpenCabinet={() => onNavigate('profile')}
        />
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t-2 border-[#111111] bg-[#FAF7F0] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#524E48]">
          <div className="font-mono font-bold text-[#111111]">
            GitMaster &middot; Git &amp; GitHub Academy
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <button
              onClick={() => onNavigate('roadmap')}
              className="hover:text-[#111111] cursor-pointer"
            >
              Curriculum
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="hover:text-[#111111] cursor-pointer"
            >
              Project Studio
            </button>
            <button
              onClick={() => onNavigate('daily-test')}
              className="hover:text-[#111111] cursor-pointer"
            >
              Daily Test
            </button>
            <button
              onClick={() => onNavigate('sandbox')}
              className="hover:text-[#111111] cursor-pointer"
            >
              Sandbox
            </button>
            <button
              onClick={() => onNavigate('cheatsheet')}
              className="hover:text-[#111111] cursor-pointer"
            >
              Cheatsheet
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-[#111111] cursor-pointer"
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
