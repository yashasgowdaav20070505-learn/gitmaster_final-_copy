import { UserProgress } from '../types';
import { MODULES } from '../data/lessons';
import { DAILY_TEST_BANK, DailyTestQuestion } from '../data/dailyTestBank';
import {
  ADVANCED_DAILY_TEST_BANK,
  ADVANCED_DRILL_SOLUTION_MAP,
} from '../data/advancedDailyQuestions';

const COMBINED_DAILY_TEST_BANK: DailyTestQuestion[] = [
  ...DAILY_TEST_BANK,
  ...ADVANCED_DAILY_TEST_BANK,
];

export const DAILY_TEST_RECORD_KEY = 'gitmaster_daily_test_record';

export interface TopicCoverageAnalysis {
  tierLabel: string;
  tierDescription: string;
  isScratchWarmup: boolean;
  completedCount: number;
  totalCoreLessons: number;
  eligibleLessonIds: string[];
  frontierLessonId: string | null;
}

export interface GeneratedDailyTest {
  coverage: TopicCoverageAnalysis;
  questions: DailyTestQuestion[];
}

export interface DailyTestUserAnswer {
  questionId: string;
  topicTitle: string;
  mode: DailyTestQuestion['mode'];
  prompt: string;
  submittedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DailyTestRecord {
  date: string;
  tierLabel: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
  questions: {
    id: string;
    lessonId: string;
    topicTitle: string;
    mode: DailyTestQuestion['mode'];
    prompt: string;
  }[];
  userAnswers: DailyTestUserAnswer[];
}

const SCRATCH_WARMUP_LESSON_IDS = [
  'lesson-why-vc',
  'lesson-git-init',
  'lesson-git-status',
];

const DRILL_SOLUTION_MAP: Record<string, string> = {
  'dt-init-drill': 'git init',
  'dt-add-drill': 'git add styles.css',
  'dt-commit-drill': 'git add readme.md && git commit -m "Add readme"',
  'dt-branch-drill': 'git checkout -b experiment',
  'dt-merge-drill': 'git checkout main && git merge feature-ui',
  'dt-restore-drill': 'git restore cookie-recipe.txt',
  'dt-stash-drill': 'git stash',
  ...ADVANCED_DRILL_SOLUTION_MAP,
};

export function getQuestionCorrectAnswer(q: DailyTestQuestion): string {
  if (q.mode === 'command-recall') {
    return q.acceptedAnswers[0];
  }
  if (q.mode === 'visual-prediction') {
    return q.options[q.correctIndex] || '';
  }
  return (
    DRILL_SOLUTION_MAP[q.id] ||
    q.quickCommands[q.quickCommands.length - 1] ||
    q.hints[0] ||
    'Verify target repository state'
  );
}

export function getTodayDailyTestRecord(): DailyTestRecord | null {
  try {
    const raw = localStorage.getItem(DAILY_TEST_RECORD_KEY);
    if (!raw) return null;
    const parsed: DailyTestRecord = JSON.parse(raw);
    const todayStr = new Date().toDateString();
    if (parsed && parsed.date === todayStr && Array.isArray(parsed.userAnswers)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveTodayDailyTestRecord(record: DailyTestRecord): void {
  try {
    localStorage.setItem(DAILY_TEST_RECORD_KEY, JSON.stringify(record));
  } catch (err) {
    console.error('Failed to save daily test lock record:', err);
  }
}

export function clearDailyTestRecord(): void {
  try {
    localStorage.removeItem(DAILY_TEST_RECORD_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function analyzeTopicCoverage(progress: UserProgress): TopicCoverageAnalysis {
  const allLessonIds = MODULES.flatMap((m) => m.lessons.map((l) => l.id));
  const completedSet = new Set(progress.completedLessons);
  const completedCount = allLessonIds.filter((id) => completedSet.has(id)).length;
  const totalCoreLessons = allLessonIds.length;

  const frontierLessonId =
    allLessonIds.find((id) => !completedSet.has(id)) || null;

  if (completedCount === 0) {
    return {
      tierLabel: 'Scratch Foundations Warmup',
      tierDescription:
        'Tailored for first-time learners covering version control basics, git init, and git status.',
      isScratchWarmup: true,
      completedCount: 0,
      totalCoreLessons,
      eligibleLessonIds: SCRATCH_WARMUP_LESSON_IDS,
      frontierLessonId: allLessonIds[0] || null,
    };
  }

  const eligibleSet = new Set<string>(progress.completedLessons);
  if (frontierLessonId) {
    eligibleSet.add(frontierLessonId);
  }

  let tierLabel = 'Core Fundamentals';
  let tierDescription =
    'Testing your completed lessons plus your current frontier topic.';

  if (completedCount >= 14) {
    tierLabel = 'Advanced Git Mastery';
    tierDescription =
      'Full-spectrum mastery including rebasing, cherry-picking, reflog recovery, and GitHub releases.';
  } else if (completedCount >= 11) {
    tierLabel = 'History Surgery & Remotes';
    tierDescription =
      'Integrating core mastery with diffs, reverts, resets, and advanced collaboration workflows.';
  } else if (completedCount >= 9) {
    tierLabel = 'Time Travel & Mastery';
    tierDescription =
      'Full-spectrum practice spanning initialization, branching, merging, cloning, and recovery.';
  } else if (completedCount >= 5) {
    tierLabel = 'History & Branching';
    tierDescription =
      'Adaptive mix of commits, history logs, branching, and state prediction.';
  }

  return {
    tierLabel,
    tierDescription,
    isScratchWarmup: false,
    completedCount,
    totalCoreLessons,
    eligibleLessonIds: Array.from(eligibleSet),
    frontierLessonId,
  };
}

export function generateDailyTest(progress: UserProgress): GeneratedDailyTest {
  const coverage = analyzeTopicCoverage(progress);
  const eligibleSet = new Set(coverage.eligibleLessonIds);
  const missedSet = new Set(progress.missedLessonIds || []);
  const recentCompleted = new Set(progress.completedLessons.slice(-3));

  const pool = COMBINED_DAILY_TEST_BANK.filter((q) => eligibleSet.has(q.lessonId));

  const scored = pool.map((q) => {
    let weight = 1;
    if (missedSet.has(q.lessonId)) weight += 5;
    if (q.lessonId === coverage.frontierLessonId) weight += 3;
    if (recentCompleted.has(q.lessonId)) weight += 2;
    if (q.mode === 'terminal-drill') weight += 1;
    return { q, weight, tieBreaker: Math.random() };
  });

  scored.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return a.tieBreaker - b.tieBreaker;
  });

  const selected: DailyTestQuestion[] = [];
  const selectedIds = new Set<string>();

  const pickByMode = (mode: DailyTestQuestion['mode']) => {
    const match = scored.find(
      (item) => item.q.mode === mode && !selectedIds.has(item.q.id)
    );
    if (match) {
      selected.push(match.q);
      selectedIds.add(match.q.id);
    }
  };

  pickByMode('command-recall');
  pickByMode('visual-prediction');
  pickByMode('terminal-drill');

  for (const item of scored) {
    if (selected.length >= 5) break;
    if (!selectedIds.has(item.q.id)) {
      selected.push(item.q);
      selectedIds.add(item.q.id);
    }
  }

  return {
    coverage,
    questions: selected.slice(0, 5),
  };
}

export function calculateDailyTestRewards(score: number, total: number) {
  const baseXp = 75;
  const perfectBonusXp = total === 5 && score === 5 ? 25 : 0;
  const coinsEarned = 25;

  return {
    xpEarned: baseXp + perfectBonusXp,
    perfectBonusXp,
    coinsEarned,
    passed: score >= Math.ceil(total * 0.6),
    isPerfect: total > 0 && score === total,
  };
}
