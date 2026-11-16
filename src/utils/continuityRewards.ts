import { Lesson, Module, UserProgress } from '../types';
import { MODULES, CORE_MODULES, ALL_BADGES } from '../data/lessons';

export interface ContinuityMilestone {
  id: string;
  title: string;
  description: string;
  requirementLabel: string;
  stampCode: string;
  type: 'streak' | 'completion';
  targetValue: number;
  icon: 'Flame' | 'ShieldCheck' | 'Zap' | 'Award';
}

export const CONTINUITY_MILESTONES: ContinuityMilestone[] = [
  {
    id: 'badge-streak-3',
    title: 'Spark Ignited',
    description: 'Maintained active Git practice for 3 consecutive days.',
    requirementLabel: '3-Day Streak',
    stampCode: 'DAY-03',
    type: 'streak',
    targetValue: 3,
    icon: 'Flame',
  },
  {
    id: 'badge-streak-7',
    title: '7-Day Ironclad',
    description: 'Committed to daily version control mastery for 7 consecutive days.',
    requirementLabel: '7-Day Streak',
    stampCode: 'DAY-07',
    type: 'streak',
    targetValue: 7,
    icon: 'ShieldCheck',
  },
  {
    id: 'badge-streak-10',
    title: '10-Day Cadence',
    description: 'Forged an unbreakable 10-day continuous engineering habit.',
    requirementLabel: '10-Day Streak',
    stampCode: 'DAY-10',
    type: 'streak',
    targetValue: 10,
    icon: 'Zap',
  },
  {
    id: 'badge-core-architect',
    title: 'Core Architect',
    description: 'Completed all 5 Core Modules (11/11 lessons), unlocking your Official GitMaster Certificate.',
    requirementLabel: '11/11 Core Lessons',
    stampCode: 'CORE-11',
    type: 'completion',
    targetValue: 11,
    icon: 'Award',
  },
];

export function getAllCoreLessonIds(): string[] {
  return CORE_MODULES.flatMap((mod) => mod.lessons.map((lesson) => lesson.id));
}

export function getCoreCompletionStats(completedLessons: string[]) {
  const coreIds = getAllCoreLessonIds();
  const completedCount = coreIds.filter((id) => completedLessons.includes(id)).length;
  const totalCount = coreIds.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    isComplete,
    percent,
  };
}

export function getTotalCompletionStats(completedLessons: string[]) {
  const allIds = MODULES.flatMap((mod) => mod.lessons.map((lesson) => lesson.id));
  const completedCount = allIds.filter((id) => completedLessons.includes(id)).length;
  const totalCount = allIds.length;
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    isComplete,
    percent,
  };
}

export function isMilestoneUnlocked(milestoneId: string, progress: UserProgress): boolean {
  if (progress.unlockedBadges.includes(milestoneId)) {
    return true;
  }

  const milestone = CONTINUITY_MILESTONES.find((m) => m.id === milestoneId);
  if (!milestone) return false;

  if (milestone.type === 'streak') {
    return progress.streak >= milestone.targetValue;
  }

  if (milestone.type === 'completion') {
    return getCoreCompletionStats(progress.completedLessons).isComplete;
  }

  return false;
}

export function getMilestoneProgress(milestone: ContinuityMilestone, progress: UserProgress) {
  if (milestone.type === 'streak') {
    const current = Math.min(progress.streak, milestone.targetValue);
    return {
      current,
      target: milestone.targetValue,
      percent: Math.round((current / milestone.targetValue) * 100),
      unitLabel: `${current}/${milestone.targetValue} days`,
    };
  }

  const stats = getCoreCompletionStats(progress.completedLessons);
  return {
    current: stats.completedCount,
    target: stats.totalCount,
    percent: stats.percent,
    unitLabel: `${stats.completedCount}/${stats.totalCount} lessons`,
  };
}

export function getNextRecommendedLesson(
  completedLessons: string[]
): { lesson: Lesson; module: Module; isAllCompleted: boolean } | null {
  for (const mod of MODULES) {
    for (const les of mod.lessons) {
      if (!completedLessons.includes(les.id)) {
        return { lesson: les, module: mod, isAllCompleted: false };
      }
    }
  }

  if (MODULES.length > 0 && MODULES[0].lessons.length > 0) {
    return { lesson: MODULES[0].lessons[0], module: MODULES[0], isAllCompleted: true };
  }

  return null;
}

export function getLessonBadgeId(lessonId: string): string | undefined {
  if (lessonId === 'lesson-why-vc' || lessonId === 'lesson-git-init') return 'badge-init';
  if (lessonId === 'lesson-git-commit') return 'badge-commit';
  if (lessonId === 'lesson-git-branch') return 'badge-branch';
  if (lessonId === 'lesson-git-clone') return 'badge-github';
  if (lessonId === 'lesson-git-stash') return 'badge-stash';
  return undefined;
}

export function evaluateLessonAndContinuityRewards(
  lessonId: string,
  currentProgress: UserProgress,
  newStreak: number
): {
  updatedCompletedLessons: string[];
  updatedBadges: string[];
  newlyUnlockedIds: string[];
  celebratoryBadgeId: string | null;
} {
  const updatedCompletedLessons = [...new Set([...currentProgress.completedLessons, lessonId])];
  const updatedBadges = [...currentProgress.unlockedBadges];
  const newlyUnlockedIds: string[] = [];

  const addIfNew = (badgeId?: string) => {
    if (badgeId && !updatedBadges.includes(badgeId)) {
      updatedBadges.push(badgeId);
      newlyUnlockedIds.push(badgeId);
    }
  };

  // 1. Lesson milestone badge
  addIfNew(getLessonBadgeId(lessonId));

  // 2. Continuity streak badges
  if (newStreak >= 3) addIfNew('badge-streak-3');
  if (newStreak >= 7) addIfNew('badge-streak-7');
  if (newStreak >= 10) addIfNew('badge-streak-10');

  // 3. Full Core Curriculum completion (all 5 core modules / 11 lessons)
  const coreStats = getCoreCompletionStats(updatedCompletedLessons);
  if (coreStats.isComplete) {
    addIfNew('badge-graduate');
    addIfNew('badge-core-architect');
  }

  // 4. Complete Mastery across all 8 Modules (20/20 lessons)
  const totalStats = getTotalCompletionStats(updatedCompletedLessons);
  if (totalStats.isComplete) {
    addIfNew('badge-advanced-grandmaster');
  }

  // Prioritize celebratory modal for major continuity/completion unlocks
  const priorityOrder = [
    'badge-advanced-grandmaster',
    'badge-core-architect',
    'badge-streak-10',
    'badge-streak-7',
    'badge-streak-3',
  ];

  const priorityUnlock = priorityOrder.find((id) => newlyUnlockedIds.includes(id));
  const celebratoryBadgeId = priorityUnlock || newlyUnlockedIds[0] || null;

  return {
    updatedCompletedLessons,
    updatedBadges,
    newlyUnlockedIds,
    celebratoryBadgeId,
  };
}

export function getRewardDisplayMeta(badgeId: string): {
  id: string;
  title: string;
  description: string;
  stampCode: string;
  isContinuity: boolean;
  unlocksCertificate: boolean;
} {
  const continuity = CONTINUITY_MILESTONES.find((m) => m.id === badgeId);
  if (continuity) {
    return {
      id: continuity.id,
      title: continuity.title,
      description: continuity.description,
      stampCode: continuity.stampCode,
      isContinuity: true,
      unlocksCertificate: continuity.id === 'badge-core-architect',
    };
  }

  const lessonBadge = ALL_BADGES.find((b) => b.id === badgeId);
  if (lessonBadge) {
    return {
      id: lessonBadge.id,
      title: lessonBadge.title,
      description: lessonBadge.description,
      stampCode: lessonBadge.category.toUpperCase(),
      isContinuity: false,
      unlocksCertificate: lessonBadge.id === 'badge-graduate',
    };
  }

  return {
    id: badgeId,
    title: 'Milestone Unlocked',
    description: 'You earned a new GitMaster achievement stamp.',
    stampCode: 'MILESTONE',
    isContinuity: false,
    unlocksCertificate: false,
  };
}

export function calculateNextStreak(lastActiveDate: string, currentStreak: number): {
  newStreak: number;
  todayStr: string;
} {
  const todayStr = new Date().toDateString();
  let newStreak = currentStreak;

  if (!lastActiveDate) {
    newStreak = 1;
  } else {
    const d1 = new Date(lastActiveDate);
    const d2 = new Date(todayStr);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    } else if (diffDays === 0 && newStreak === 0) {
      newStreak = 1;
    }
  }

  return { newStreak, todayStr };
}

export function evaluateDailyTestRewards(
  score: number,
  total: number,
  currentProgress: UserProgress,
  newStreak: number
): {
  updatedBadges: string[];
  celebratoryBadgeId: string | null;
} {
  const updatedBadges = [...currentProgress.unlockedBadges];
  const newlyUnlockedIds: string[] = [];

  const addIfNew = (badgeId?: string) => {
    if (badgeId && !updatedBadges.includes(badgeId)) {
      updatedBadges.push(badgeId);
      newlyUnlockedIds.push(badgeId);
    }
  };

  if (total > 0 && score / total >= 0.8) {
    addIfNew('badge-daily-ace');
  }

  if (newStreak >= 3) addIfNew('badge-streak-3');
  if (newStreak >= 7) addIfNew('badge-streak-7');
  if (newStreak >= 10) addIfNew('badge-streak-10');

  const priorityOrder = [
    'badge-streak-10',
    'badge-streak-7',
    'badge-streak-3',
    'badge-daily-ace',
  ];

  const celebratoryBadgeId =
    priorityOrder.find((id) => newlyUnlockedIds.includes(id)) ||
    newlyUnlockedIds[0] ||
    null;

  return { updatedBadges, celebratoryBadgeId };
}
