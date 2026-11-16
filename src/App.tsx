import { useState, useEffect } from 'react';
import { UserProgress, Lesson, UserProfile, DailyTestAttempt } from './types';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import Sandbox from './components/Sandbox';
import Cheatsheet from './components/Cheatsheet';
import AboutWeb from './components/AboutWeb';
import LandingHub, { AppRouteTab } from './components/LandingHub';
import ContinuityRewardsModal from './components/ContinuityRewardsModal';
import DailyTestView from './components/DailyTestView';
import ProfileView from './components/ProfileView';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalFloatingChat from './components/GlobalFloatingChat';
import ProjectStudioView from './components/ProjectStudioView';
import { MODULES } from './data/lessons';
import {
  calculateNextStreak,
  evaluateDailyTestRewards,
  evaluateLessonAndContinuityRewards,
} from './utils/continuityRewards';
import { clearDailyTestRecord } from './utils/dailyTestEngine';
import { applySavedTheme } from './utils/themeManager';
import {
  BookOpen,
  Terminal,
  FileText,
  Sparkles,
  Flame,
  Coins,
  Zap,
  Menu,
  X,
  User,
  Code,
  ShieldCheck,
  Cpu,
  Rocket,
  HelpCircle,
  Home,
  ClipboardCheck,
  FolderGit2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_STORAGE_KEY = 'git_academy_progress_data';
const PROFILE_LOCAL_STORAGE_KEY = 'git_academy_profile_data';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Git Academy Cadet',
  email: 'cadet@gitmaster.academy',
  role: 'Git Apprentice',
  bio: 'Ready to write some history!',
  avatarIcon: 'terminal',
  avatarColor: 'orange',
};

export function getAvatarIcon(iconName: string) {
  switch (iconName) {
    case 'terminal':
      return Terminal;
    case 'code':
      return Code;
    case 'shield':
      return ShieldCheck;
    case 'cpu':
      return Cpu;
    case 'sparkles':
      return Sparkles;
    case 'rocket':
      return Rocket;
    default:
      return User;
  }
}

export function getAvatarColorClasses(colorName: string) {
  switch (colorName) {
    case 'green':
    case 'teal':
      return 'bg-[#1E6F50] border-[#111111] text-[#FAF7F0]';
    case 'amber':
      return 'bg-[#E6DFD1] border-[#111111] text-[#111111]';
    case 'purple':
      return 'bg-[#111111] border-[#111111] text-[#F3EEE3]';
    default:
      return 'bg-[#D9541E] border-[#111111] text-[#FAF7F0]';
  }
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  coins: 0,
  level: 1,
  streak: 0,
  lastActiveDate: '',
  completedLessons: [],
  unlockedBadges: [],
  notes: {},
  bookmarks: [],
  completedMissions: [],
  dailyTestHistory: [],
  missedLessonIds: [],
  simulatedCommitsCount: 0,
};

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<AppRouteTab>('home');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unlockedBadgeNotification, setUnlockedBadgeNotification] = useState<string | null>(null);
  const [streakPopping, setStreakPopping] = useState(false);

  const triggerStreakCelebration = () => {
    setStreakPopping(false);
    requestAnimationFrame(() => {
      setStreakPopping(true);
    });
    setTimeout(() => setStreakPopping(false), 950);
  };

  const activeModule = activeLesson
    ? MODULES.find((m) => m.id === activeLesson.moduleId)
    : null;

  useEffect(() => {
    applySavedTheme();

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: UserProgress = JSON.parse(saved);

        if (parsed.lastActiveDate) {
          const todayStr = new Date().toDateString();
          const d1 = new Date(parsed.lastActiveDate);
          const d2 = new Date(todayStr);
          d1.setHours(0, 0, 0, 0);
          d2.setHours(0, 0, 0, 0);
          const diffTime = d2.getTime() - d1.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            parsed.streak = 0;
          }
        } else {
          parsed.streak = 0;
        }

        setProgress({
          ...DEFAULT_PROGRESS,
          ...parsed,
        });
      } catch (err) {
        console.error('Failed to parse progress data:', err);
      }
    }

    const savedProfile = localStorage.getItem(PROFILE_LOCAL_STORAGE_KEY);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (err) {
        console.error('Failed to parse profile data:', err);
      }
    }
  }, []);

  const saveProgress = (updated: UserProgress) => {
    setProgress(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const saveProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem(PROFILE_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLessonCompleted = (
    lessonId: string,
    xpReward: number,
    coinReward: number
  ) => {
    const { newStreak, todayStr } = calculateNextStreak(
      progress.lastActiveDate,
      progress.streak
    );

    const { updatedCompletedLessons, updatedBadges, celebratoryBadgeId } =
      evaluateLessonAndContinuityRewards(lessonId, progress, newStreak);

    if (celebratoryBadgeId) {
      setUnlockedBadgeNotification(celebratoryBadgeId);
    }

    const commitIncrement = lessonId === 'lesson-git-commit' ? 1 : 0;

    const updatedProgress: UserProgress = {
      ...progress,
      completedLessons: updatedCompletedLessons,
      xp: progress.xp + xpReward,
      coins: progress.coins + coinReward,
      unlockedBadges: updatedBadges,
      streak: newStreak,
      lastActiveDate: todayStr,
      simulatedCommitsCount: (progress.simulatedCommitsCount || 0) + commitIncrement,
    };

    saveProgress(updatedProgress);
    triggerStreakCelebration();
    setActiveLesson(null);
    setActiveTab('roadmap');
  };

  const handleDailyTestCompleted = (payload: {
    tierLabel: string;
    score: number;
    total: number;
    xpEarned: number;
    coinsEarned: number;
    topicsCovered: string[];
    missedLessonIds: string[];
    simulatedCommitsDelta: number;
  }) => {
    const { newStreak, todayStr } = calculateNextStreak(
      progress.lastActiveDate,
      progress.streak
    );

    const { updatedBadges, celebratoryBadgeId } = evaluateDailyTestRewards(
      payload.score,
      payload.total,
      progress,
      newStreak
    );

    if (celebratoryBadgeId) {
      setUnlockedBadgeNotification(celebratoryBadgeId);
    }

    const attempt: DailyTestAttempt = {
      id: `dt-${Date.now()}`,
      date: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      tierLabel: payload.tierLabel,
      score: payload.score,
      total: payload.total,
      xpEarned: payload.xpEarned,
      coinsEarned: payload.coinsEarned,
      topicsCovered: payload.topicsCovered,
    };

    const updatedProgress: UserProgress = {
      ...progress,
      xp: progress.xp + payload.xpEarned,
      coins: progress.coins + payload.coinsEarned,
      streak: newStreak,
      lastActiveDate: todayStr,
      unlockedBadges: updatedBadges,
      dailyTestHistory: [...(progress.dailyTestHistory || []), attempt],
      missedLessonIds: payload.missedLessonIds,
      simulatedCommitsCount:
        (progress.simulatedCommitsCount || 0) + payload.simulatedCommitsDelta,
    };

    saveProgress(updatedProgress);
    triggerStreakCelebration();
  };

  const handleResetProgress = () => {
    clearDailyTestRecord();
    saveProgress(DEFAULT_PROGRESS);
    setActiveLesson(null);
    setActiveTab('home');
  };

  const navigateToTab = (tab: AppRouteTab) => {
    setActiveTab(tab);
    setActiveLesson(null);
    setSidebarOpen(false);
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveTab('roadmap');
    setActiveLesson(lesson);
    setSidebarOpen(false);
  };

  const navItems: { id: AppRouteTab; label: string; icon: typeof BookOpen }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
    { id: 'projects', label: 'Project Studio', icon: FolderGit2 },
    { id: 'daily-test', label: 'Daily Test', icon: ClipboardCheck },
    { id: 'sandbox', label: 'Sandbox', icon: Terminal },
    { id: 'cheatsheet', label: 'Cheatsheet', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about', label: 'How It Works', icon: HelpCircle },
  ];

  const tabHeadingMap: Record<AppRouteTab, string> = {
    home: 'GitMaster Hub',
    roadmap: 'Learning Roadmap',
    projects: 'Project Studio',
    'daily-test': 'Daily Test',
    sandbox: 'Sandbox Arena',
    cheatsheet: 'Command Cheatsheet',
    profile: 'Profile & Trophies',
    about: 'How It Works',
  };

  const ProfileAvatarIcon = getAvatarIcon(profile.avatarIcon);

  return (
    <>
      {activeTab === 'home' && !activeLesson ? (
        <LandingHub
          progress={progress}
          profile={profile}
          streakPopping={streakPopping}
          onNavigate={navigateToTab}
          onStartLesson={handleStartLesson}
        />
      ) : (
        <div
          className="min-h-screen bg-[#F3EEE3] text-[#111111] flex font-sans overflow-x-hidden antialiased"
          id="git-academy-root"
        >
          {/* Tablet Sidebar Overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-[#111111]/50 z-30 lg:hidden"
            />
          )}

          {/* Desktop Left Navigation Rail (256px) */}
          <aside
            className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#FAF7F0] border-r-2 border-[#111111] z-40 transform lg:transform-none transition-transform duration-200 flex flex-col justify-between shrink-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div>
              {/* Brand Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b-2 border-[#111111] bg-[#FAF7F0]">
                <button
                  onClick={() => navigateToTab('home')}
                  className="flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <div className="w-8 h-8 bg-[#D9541E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-md flex items-center justify-center font-mono font-extrabold text-xs text-[#FAF7F0] shrink-0">
                    GM
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight text-[#111111] leading-none">
                      GitMaster
                    </span>
                    <span className="text-[10px] text-[#524E48] font-mono mt-1 leading-none">
                      Git &amp; GitHub Academy
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-[#524E48] hover:text-[#111111] cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive =
                    item.id === activeTab && (!activeLesson || item.id === 'roadmap');
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateToTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-2 whitespace-nowrap ${
                        isActive
                          ? 'bg-[#D9541E] text-[#FAF7F0] border-[#111111] shadow-[3px_3px_0px_#111111]'
                          : 'bg-transparent text-[#524E48] border-transparent hover:text-[#111111] hover:bg-[#E6DFD1] hover:border-[#111111]'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User Profile Card Footer */}
            <div className="p-4 border-t-2 border-[#111111] bg-[#E6DFD1]/60">
              <button
                onClick={() => navigateToTab('profile')}
                className="w-full flex items-center gap-3 bg-[#FAF7F0] hover:bg-[#F3EEE3] transition-colors p-3 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-left cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0 ${getAvatarColorClasses(
                    profile.avatarColor
                  )}`}
                >
                  <ProfileAvatarIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#111111] truncate">
                    {profile.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#524E48] mt-0.5 truncate">
                    {profile.role}
                  </div>
                </div>
              </button>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto pb-20 md:pb-0">
            {/* Global Toolbar Header */}
            <header className="h-16 border-b-2 border-[#111111] bg-[#FAF7F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
              <div className="flex items-center min-w-0 gap-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden md:inline-flex lg:hidden p-2 hover:bg-[#E6DFD1] rounded-lg text-[#111111] cursor-pointer border-2 border-[#111111]"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Mobile Compact Brand Logo */}
                <button
                  onClick={() => navigateToTab('home')}
                  className="flex md:hidden items-center gap-2 cursor-pointer shrink-0"
                >
                  <span className="w-8 h-8 bg-[#D9541E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] rounded-md flex items-center justify-center font-mono font-extrabold text-xs text-[#FAF7F0]">
                    GM
                  </span>
                  <span className="font-extrabold text-sm text-[#111111]">
                    GitMaster
                  </span>
                </button>

                {activeLesson && activeModule ? (
                  <div className="hidden md:flex items-center gap-2 text-xs text-[#524E48] font-sans ml-1 truncate">
                    <span className="font-mono">{activeModule.title}</span>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#111111] font-extrabold truncate">
                      {activeLesson.title}
                    </span>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2 text-sm text-[#111111] font-extrabold ml-1">
                    <span>{tabHeadingMap[activeTab]}</span>
                  </div>
                )}
              </div>

              {/* Right Stats & Profile Avatar */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto font-mono text-[11px] sm:text-xs font-bold shrink-0 tabular-nums">
                <div
                  className="hidden sm:flex items-center gap-1.5 text-[#111111] bg-[#E6DFD1] border-2 border-[#111111] px-2.5 py-1 rounded-md"
                  title="Total XP"
                >
                  <Zap className="w-3.5 h-3.5 text-[#D9541E]" />
                  <span>{progress.xp} XP</span>
                </div>
                <div
                  className="hidden sm:flex items-center gap-1.5 text-[#111111] bg-[#E6DFD1] border-2 border-[#111111] px-2.5 py-1 rounded-md"
                  title="Total Coins"
                >
                  <Coins className="w-3.5 h-3.5 text-[#D9541E]" />
                  <span>{progress.coins}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-[#111111] transition-colors ${
                    progress.streak > 0
                      ? 'bg-[#1E6F50] text-[#FAF7F0]'
                      : 'bg-[#FAF7F0] text-[#524E48]'
                  } ${streakPopping ? 'streak-pill-pop' : ''}`}
                  title="Current Streak"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>
                    {progress.streak}
                    <span className="hidden sm:inline"> Day Streak</span>
                    <span className="sm:hidden">d</span>
                  </span>
                </div>

                <button
                  onClick={() => navigateToTab('profile')}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-0.5 ${getAvatarColorClasses(
                    profile.avatarColor
                  )}`}
                  title={`Profile: ${profile.name}`}
                  aria-label="Open Profile & Trophies"
                >
                  <ProfileAvatarIcon className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Dynamic Screen Routing Panel */}
            <div className="flex-1 p-4 sm:p-6 md:p-8 select-text">
              <AnimatePresence mode="wait">
                {activeLesson ? (
                  <LessonView
                    key={`lesson-${activeLesson.id}`}
                    lesson={activeLesson}
                    progress={progress}
                    onLessonCompleted={handleLessonCompleted}
                    onBackToDashboard={() => setActiveLesson(null)}
                  />
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="h-full"
                  >
                    {activeTab === 'roadmap' && (
                      <Dashboard
                        progress={progress}
                        onSelectLesson={(lesson) => setActiveLesson(lesson)}
                        onResetProgress={handleResetProgress}
                      />
                    )}
                    {activeTab === 'projects' && <ProjectStudioView />}
                    {activeTab === 'daily-test' && (
                      <DailyTestView
                        progress={progress}
                        onDailyTestCompleted={handleDailyTestCompleted}
                        onNavigateToProfile={() => navigateToTab('profile')}
                        onNavigateToRoadmap={() => navigateToTab('roadmap')}
                      />
                    )}
                    {activeTab === 'sandbox' && <Sandbox />}
                    {activeTab === 'cheatsheet' && <Cheatsheet />}
                    {activeTab === 'profile' && (
                      <ProfileView
                        progress={progress}
                        profile={profile}
                        onSaveProfile={saveProfile}
                        onResetProgress={handleResetProgress}
                        onNavigateToDailyTest={() => navigateToTab('daily-test')}
                        onNavigateToRoadmap={() => navigateToTab('roadmap')}
                      />
                    )}
                    {activeTab === 'about' && <AboutWeb />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      {/* Global Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        hasActiveLesson={Boolean(activeLesson)}
        onNavigate={navigateToTab}
      />

      {/* Global Floating Turing AI Chatbot (Available Everywhere, Including Home & Sandbox) */}
      <GlobalFloatingChat
        activeTab={activeTab}
        activeLesson={activeLesson}
        progress={progress}
        onNavigate={navigateToTab}
      />

      {/* Celebratory Badge / Continuity Milestone Modal */}
      <ContinuityRewardsModal
        badgeId={unlockedBadgeNotification}
        onClose={() => setUnlockedBadgeNotification(null)}
        onOpenCabinet={() => navigateToTab('profile')}
      />
    </>
  );
}
