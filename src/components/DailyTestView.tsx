import React, { useState, useMemo, useEffect } from 'react';
import { RepoState, UserProgress } from '../types';
import {
  DailyTestQuestion,
  CommandRecallQuestion,
  VisualPredictionQuestion,
  TerminalDrillQuestion,
} from '../data/dailyTestBank';
import {
  DailyTestRecord,
  DailyTestUserAnswer,
  generateDailyTest,
  calculateDailyTestRewards,
  getTodayDailyTestRecord,
  saveTodayDailyTestRecord,
  getQuestionCorrectAnswer,
} from '../utils/dailyTestEngine';
import Terminal from './Terminal';
import Visualizer from './Visualizer';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  Coins,
  Flame,
  Folder,
  Inbox,
  Shield,
  Terminal as TerminalIcon,
  Eye,
  Lock,
  CalendarCheck,
} from 'lucide-react';

interface DailyTestResultPayload {
  tierLabel: string;
  score: number;
  total: number;
  xpEarned: number;
  coinsEarned: number;
  topicsCovered: string[];
  missedLessonIds: string[];
  simulatedCommitsDelta: number;
}

interface DailyTestViewProps {
  progress: UserProgress;
  onDailyTestCompleted: (payload: DailyTestResultPayload) => void;
  onNavigateToProfile: () => void;
  onNavigateToRoadmap: () => void;
}

function normalizeCmd(cmd: string): string {
  return cmd.trim().replace(/\s+/g, ' ');
}

export default function DailyTestView({
  progress,
  onDailyTestCompleted,
  onNavigateToProfile,
  onNavigateToRoadmap,
}: DailyTestViewProps) {
  const [lockedRecord, setLockedRecord] = useState<DailyTestRecord | null>(() =>
    getTodayDailyTestRecord()
  );

  // Accordion state for Reviewing Questions & Answers when locked
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    () => getTodayDailyTestRecord()?.userAnswers[0]?.questionId ?? null
  );

  // Keep lock state synced if progress is reset
  useEffect(() => {
    const fresh = getTodayDailyTestRecord();
    setLockedRecord(fresh);
    if (fresh && fresh.userAnswers.length > 0) {
      setExpandedQuestionId((prev) => prev || fresh.userAnswers[0].questionId);
    }
  }, [progress.dailyTestHistory]);

  const generated = useMemo(
    () => generateDailyTest(progress),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lockedRecord === null]
  );

  const { coverage, questions } = generated;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState<DailyTestUserAnswer[]>([]);
  const [rewardsSaved, setRewardsSaved] = useState(false);

  // Mode 1: Command Recall state
  const [recallInput, setRecallInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [questionCorrect, setQuestionCorrect] = useState(false);

  // Mode 2: Visual Prediction state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Mode 3: Terminal Drill state
  const currentQuestion = questions[currentIndex];
  const [drillRepoState, setDrillRepoState] = useState<RepoState>(() =>
    currentQuestion?.mode === 'terminal-drill'
      ? JSON.parse(JSON.stringify(currentQuestion.startingState))
      : {
          isInitialized: false,
          workingDirectory: [],
          stagingArea: [],
          commits: [],
          currentBranch: 'main',
          branches: ['main'],
          remoteCommits: [],
          remoteBranches: [],
        }
  );
  const [drillHistory, setDrillHistory] = useState<string[]>([]);
  const [simulatedCommitsDelta, setSimulatedCommitsDelta] = useState(0);
  const [mobilePane, setMobilePane] = useState<'terminal' | 'visualizer'>('terminal');

  useEffect(() => {
    if (currentQuestion?.mode === 'terminal-drill') {
      setDrillRepoState(JSON.parse(JSON.stringify(currentQuestion.startingState)));
    }
  }, [currentQuestion?.id]);

  const resetQuestionState = (nextQ?: DailyTestQuestion) => {
    setRecallInput('');
    setShowHint(false);
    setQuestionSubmitted(false);
    setQuestionCorrect(false);
    setSelectedOption(null);
    setDrillHistory([]);
    setMobilePane('terminal');
    if (nextQ && nextQ.mode === 'terminal-drill') {
      setDrillRepoState(JSON.parse(JSON.stringify(nextQ.startingState)));
    }
  };

  const recordAnswerAndAdvance = (
    question: DailyTestQuestion,
    isCorrect: boolean,
    submittedAnswer: string
  ) => {
    const answerEntry: DailyTestUserAnswer = {
      questionId: question.id,
      topicTitle: question.topicTitle,
      mode: question.mode,
      prompt: question.prompt,
      submittedAnswer,
      correctAnswer: getQuestionCorrectAnswer(question),
      isCorrect,
      explanation: question.explanation,
    };

    const updatedAnswers = [...recordedAnswers, answerEntry];
    setRecordedAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      resetQuestionState(nextQ);
    } else {
      const score = updatedAnswers.filter((a) => a.isCorrect).length;
      const totalQuestions = updatedAnswers.length;
      const rewardInfo = calculateDailyTestRewards(score, totalQuestions);
      const missedIds: string[] = Array.from(
        new Set<string>(
          questions
            .filter((_, idx) => !updatedAnswers[idx]?.isCorrect)
            .map((q) => q.lessonId)
        )
      );
      const topicsCovered: string[] = Array.from(
        new Set<string>(questions.map((q) => q.topicTitle))
      );

      const newRecord: DailyTestRecord = {
        date: new Date().toDateString(),
        tierLabel: coverage.tierLabel,
        score,
        totalQuestions,
        xpEarned: rewardInfo.xpEarned,
        coinsEarned: rewardInfo.coinsEarned,
        questions: questions.map((q) => ({
          id: q.id,
          lessonId: q.lessonId,
          topicTitle: q.topicTitle,
          mode: q.mode,
          prompt: q.prompt,
        })),
        userAnswers: updatedAnswers,
      };

      saveTodayDailyTestRecord(newRecord);
      setLockedRecord(newRecord);
      setExpandedQuestionId(updatedAnswers[0]?.questionId ?? null);

      if (!rewardsSaved) {
        setRewardsSaved(true);
        onDailyTestCompleted({
          tierLabel: coverage.tierLabel,
          score,
          total: totalQuestions,
          xpEarned: rewardInfo.xpEarned,
          coinsEarned: rewardInfo.coinsEarned,
          topicsCovered,
          missedLessonIds: missedIds,
          simulatedCommitsDelta,
        });
      }
    }
  };

  // Mode 1 submission
  const handleRecallSubmit = (q: CommandRecallQuestion, e: React.FormEvent) => {
    e.preventDefault();
    if (questionSubmitted || !recallInput.trim()) return;
    const normalized = normalizeCmd(recallInput);
    const isMatch = q.acceptedAnswers.some(
      (ans) => normalizeCmd(ans).toLowerCase() === normalized.toLowerCase()
    );
    setQuestionCorrect(isMatch);
    setQuestionSubmitted(true);
  };

  // Mode 2 submission
  const handleVisualSubmit = (q: VisualPredictionQuestion) => {
    if (questionSubmitted || selectedOption === null) return;
    const isMatch = selectedOption === q.correctIndex;
    setQuestionCorrect(isMatch);
    setQuestionSubmitted(true);
  };

  // Mode 3 live command validation
  const handleDrillCommand = (
    q: TerminalDrillQuestion,
    cmd: string,
    updatedState: RepoState
  ) => {
    const nextHistory = [...drillHistory, cmd];
    setDrillHistory(nextHistory);

    if (cmd.trim().toLowerCase().startsWith('git commit')) {
      setSimulatedCommitsDelta((c) => c + 1);
    }

    if (!questionSubmitted && q.validateState(updatedState, nextHistory)) {
      setQuestionCorrect(true);
      setQuestionSubmitted(true);
    }
  };

  // LOCKED STATE: Daily Test Closed for Today + Answer Key Review
  if (lockedRecord) {
    const accuracy =
      lockedRecord.totalQuestions > 0
        ? Math.round((lockedRecord.score / lockedRecord.totalQuestions) * 100)
        : 0;

    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6" id="daily-test-locked">
        {/* Status Banner */}
        <div className="bg-[#111111] text-[#F3EEE3] border-2 border-[#111111] shadow-[4px_4px_0px_#D9541E] rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-[#1E6F50] text-[#FAF7F0] border border-[#FAF7F0]/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <div className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#D9541E]">
                Daily Test Closed for Today
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#FAF7F0]">
                Completed Today &bull; Come Back Tomorrow for a New Test
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold bg-[#FAF7F0] text-[#111111] px-3 py-1.5 rounded-md border border-[#111111] shrink-0 self-start sm:self-center">
            <CalendarCheck className="w-3.5 h-3.5 text-[#1E6F50]" />
            <span>{lockedRecord.date}</span>
          </span>
        </div>

        {/* Summary Scorecard */}
        <div className="editorial-card p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-4">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                {lockedRecord.tierLabel}
              </span>
              <h2 className="text-2xl font-black text-[#111111] mt-0.5">
                Today&apos;s Final Scorecard
              </h2>
            </div>

            <div className="font-mono text-sm font-black px-4 py-2 rounded-lg bg-[#1E6F50] text-[#FAF7F0] border-2 border-[#111111] tabular-nums self-start sm:self-center">
              {lockedRecord.score} / {lockedRecord.totalQuestions} Correct ({accuracy}%)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111] text-center">
              <div className="font-mono text-xl font-black text-[#111111] tabular-nums">
                {lockedRecord.score}/{lockedRecord.totalQuestions}
              </div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#524E48] mt-0.5">
                Final Score
              </div>
            </div>

            <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111] text-center">
              <div className="font-mono text-xl font-black text-[#D9541E] tabular-nums flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />+{lockedRecord.xpEarned}
              </div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#524E48] mt-0.5">
                XP Awarded
              </div>
            </div>

            <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111] text-center">
              <div className="font-mono text-xl font-black text-[#111111] tabular-nums flex items-center justify-center gap-1">
                <Coins className="w-4 h-4 text-[#D9541E]" />+{lockedRecord.coinsEarned}
              </div>
              <div className="font-mono text-[10px] font-bold uppercase text-[#524E48] mt-0.5">
                Coins Awarded
              </div>
            </div>

            <div className="bg-[#1E6F50] text-[#FAF7F0] p-4 rounded-lg border-2 border-[#111111] text-center">
              <div className="font-mono text-xl font-black tabular-nums flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" />
                {progress.streak}d
              </div>
              <div className="font-mono text-[10px] font-bold uppercase mt-0.5">
                Active Streak
              </div>
            </div>
          </div>

          {/* Review Questions & Answers Accordion */}
          <div className="flex flex-col gap-3 pt-2 border-t-2 border-[#111111]">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#D9541E]" />
                <span>Review Questions &amp; Answers</span>
              </h3>
              <span className="font-mono text-[11px] text-[#524E48]">
                Click any item to inspect
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {lockedRecord.userAnswers.map((item, idx) => {
                const isExpanded = expandedQuestionId === item.questionId;
                return (
                  <div
                    key={item.questionId}
                    className="rounded-lg border-2 border-[#111111] bg-[#F3EEE3] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedQuestionId(isExpanded ? null : item.questionId)
                      }
                      className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#E6DFD1] transition-colors cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[#1E6F50] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#D9541E] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#111111] truncate">
                            0{idx + 1}. {item.topicTitle}
                          </div>
                          <div className="text-[11px] text-[#524E48] truncate mt-0.5">
                            {item.prompt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-[#111111] ${
                            item.isCorrect
                              ? 'bg-[#1E6F50] text-[#FAF7F0]'
                              : 'bg-[#D9541E] text-[#FAF7F0]'
                          }`}
                        >
                          {item.isCorrect ? 'CORRECT' : 'MISSED'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#111111] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-[#FAF7F0] border-t-2 border-[#111111] flex flex-col gap-3 text-xs">
                        <div>
                          <div className="font-mono text-[10px] font-bold uppercase text-[#524E48]">
                            Question Prompt
                          </div>
                          <p className="text-[#111111] font-semibold mt-0.5 leading-relaxed">
                            {item.prompt}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg border-2 border-[#111111] bg-[#E6DFD1]/70">
                            <div className="font-mono text-[10px] font-bold uppercase text-[#524E48]">
                              Your Submission
                            </div>
                            <div className="font-mono text-xs font-bold text-[#111111] mt-1 break-words">
                              {item.submittedAnswer || 'No input recorded'}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border-2 border-[#111111] bg-[#1E6F50] text-[#FAF7F0]">
                            <div className="font-mono text-[10px] font-bold uppercase text-[#FAF7F0]/85">
                              Exact Correct Command / Answer
                            </div>
                            <div className="font-mono text-xs font-extrabold mt-1 break-words">
                              {item.correctAnswer}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#111111]/30 bg-[#F3EEE3] text-[#111111] leading-relaxed">
                          <span className="font-mono text-[10px] font-bold uppercase text-[#D9541E] mr-2">
                            Why it works:
                          </span>
                          <span>{item.explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Footer (no retake option) */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t-2 border-[#111111]">
            <button
              onClick={onNavigateToRoadmap}
              className="editorial-btn-secondary px-4 py-2.5 text-xs font-bold cursor-pointer"
            >
              Back to Roadmap
            </button>
            <button
              onClick={onNavigateToProfile}
              className="editorial-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
            >
              View Profile &amp; Trophies
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const modeLabelMap = {
    'command-recall': 'Mode 1 · Command Recall',
    'visual-prediction': 'Mode 2 · Visual State Prediction',
    'terminal-drill': 'Mode 3 · Live Terminal Drill',
  };

  const getSubmittedSummaryForCurrent = () => {
    if (currentQuestion.mode === 'command-recall') {
      return recallInput.trim() || '(blank)';
    }
    if (currentQuestion.mode === 'visual-prediction') {
      return selectedOption !== null
        ? currentQuestion.options[selectedOption]
        : 'No option selected';
    }
    if (drillHistory.length > 0) {
      return drillHistory.join(' ; ');
    }
    return questionCorrect ? 'Verified in terminal' : 'Skipped drill';
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6" id="daily-test-view">
      {/* Topic Coverage Header */}
      <div className="editorial-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
            <span className="text-[#D9541E] uppercase tracking-wider">
              Daily Test (1 Attempt / Day)
            </span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-[#111111]">{coverage.tierLabel}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-[#524E48] tabular-nums">
              {coverage.completedCount}/{coverage.totalCoreLessons} Lessons Covered
            </span>
          </div>
          <p className="text-xs text-[#524E48] mt-1">{coverage.tierDescription}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-start md:items-end gap-1">
            <div className="font-mono text-xs font-bold text-[#111111] tabular-nums">
              Question {currentIndex + 1} / {questions.length}
            </div>
            <div className="w-36 h-2.5 bg-[#E6DFD1] border-2 border-[#111111] rounded-sm overflow-hidden">
              <div
                className="h-full bg-[#D9541E] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="editorial-card p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#111111] pb-3">
          <span className="font-mono text-xs font-bold text-[#D9541E] uppercase tracking-wider">
            {modeLabelMap[currentQuestion.mode]}
          </span>
          <span className="font-mono text-[11px] font-bold bg-[#E6DFD1] border-2 border-[#111111] px-2.5 py-0.5 rounded text-[#111111]">
            Topic: {currentQuestion.topicTitle}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#111111] leading-snug">
          {currentQuestion.prompt}
        </h3>

        {/* MODE 1: Fading-Hint Command Recall */}
        {currentQuestion.mode === 'command-recall' && (
          <form
            onSubmit={(e) => handleRecallSubmit(currentQuestion, e)}
            className="flex flex-col gap-4"
          >
            <div className="bg-[#E6DFD1] border-2 border-[#111111] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#524E48]">
                  Goal
                </div>
                <div className="text-xs font-semibold text-[#111111] mt-0.5">
                  {currentQuestion.goal}
                </div>
              </div>
              <div className="bg-[#111111] text-[#F3EEE3] font-mono text-xs font-bold px-3 py-2 rounded border border-[#111111] shrink-0">
                {currentQuestion.blankTemplate}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={recallInput}
                onChange={(e) => setRecallInput(e.target.value)}
                disabled={questionSubmitted}
                placeholder="Type the exact Git command..."
                className="editorial-input flex-1 px-4 py-3 font-mono text-sm font-bold"
                autoComplete="off"
                spellCheck={false}
              />
              {!questionSubmitted && (
                <button
                  type="submit"
                  disabled={!recallInput.trim()}
                  className="editorial-btn-primary px-6 py-3 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Check Command
                </button>
              )}
            </div>

            {!questionSubmitted && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#D9541E] hover:underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
                {showHint && (
                  <p className="mt-2 p-3 bg-[#F3EEE3] border-2 border-[#111111] rounded-lg text-xs text-[#111111]">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>
            )}

            {questionSubmitted && (
              <div
                className={`p-4 rounded-lg border-2 border-[#111111] text-xs leading-relaxed ${
                  questionCorrect
                    ? 'bg-[#1E6F50] text-[#FAF7F0]'
                    : 'bg-[#E6DFD1] text-[#111111]'
                }`}
              >
                <div className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                  {questionCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#D9541E]" />
                      <span>
                        Expected:{' '}
                        <code className="font-mono bg-[#111111] text-[#F3EEE3] px-1.5 py-0.5 rounded">
                          {currentQuestion.acceptedAnswers[0]}
                        </code>
                      </span>
                    </>
                  )}
                </div>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </form>
        )}

        {/* MODE 2: Visual State Prediction */}
        {currentQuestion.mode === 'visual-prediction' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#111111] border-b border-[#111111]/20 pb-1.5 mb-2">
                  <Folder className="w-3.5 h-3.5 text-[#D9541E]" />
                  <span>Working Directory</span>
                </div>
                {currentQuestion.repoSnapshot.workingDirectory.length === 0 ? (
                  <div className="font-mono text-[11px] text-[#524E48] italic">Clean</div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {currentQuestion.repoSnapshot.workingDirectory.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between text-[11px] font-mono bg-[#FAF7F0] px-2 py-1 rounded border border-[#111111]"
                      >
                        <span className="font-bold text-[#111111]">{f.name}</span>
                        <span className="text-[10px] text-[#D9541E] font-bold">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#111111] border-b border-[#111111]/20 pb-1.5 mb-2">
                  <Inbox className="w-3.5 h-3.5 text-[#D9541E]" />
                  <span>Staging Area</span>
                </div>
                {currentQuestion.repoSnapshot.stagingArea.length === 0 ? (
                  <div className="font-mono text-[11px] text-[#524E48] italic">Empty</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {currentQuestion.repoSnapshot.stagingArea.map((name) => (
                      <span
                        key={name}
                        className="font-mono text-[11px] font-bold bg-[#111111] text-[#F3EEE3] px-2 py-0.5 rounded"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#111111] border-b border-[#111111]/20 pb-1.5 mb-2">
                  <Shield className="w-3.5 h-3.5 text-[#1E6F50]" />
                  <span>
                    Local Repo ({currentQuestion.repoSnapshot.currentBranch})
                  </span>
                </div>
                {currentQuestion.repoSnapshot.commits.length === 0 ? (
                  <div className="font-mono text-[11px] text-[#524E48] italic">
                    No commits yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {currentQuestion.repoSnapshot.commits.map((c) => (
                      <div
                        key={c.id}
                        className="font-mono text-[10px] bg-[#FAF7F0] px-2 py-1 rounded border border-[#111111] truncate"
                      >
                        <span className="text-[#D9541E] font-bold">{c.id}</span> &middot;{' '}
                        {c.message} ({c.branch})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#111111] text-[#F3EEE3] px-4 py-3 rounded-lg font-mono text-xs flex items-center gap-2">
              <span className="text-[#D9541E] font-bold">$</span>
              <span>{currentQuestion.commandToRun}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let style =
                  'bg-[#FAF7F0] border-[#111111] text-[#111111] hover:bg-[#E6DFD1]';
                if (questionSubmitted) {
                  if (idx === currentQuestion.correctIndex) {
                    style = 'bg-[#1E6F50] border-[#111111] text-[#FAF7F0]';
                  } else if (isSelected) {
                    style = 'bg-[#D9541E] border-[#111111] text-[#FAF7F0]';
                  } else {
                    style = 'bg-[#E6DFD1]/60 border-[#111111]/40 text-[#524E48]';
                  }
                } else if (isSelected) {
                  style =
                    'bg-[#D9541E] border-[#111111] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !questionSubmitted && setSelectedOption(idx)}
                    disabled={questionSubmitted}
                    className={`p-3.5 rounded-lg border-2 text-left text-xs font-semibold flex items-center gap-3 cursor-pointer transition-all ${style}`}
                  >
                    <span className="w-6 h-6 rounded border-2 border-[#111111] bg-[#FAF7F0] text-[#111111] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {!questionSubmitted && (
              <button
                onClick={() => handleVisualSubmit(currentQuestion)}
                disabled={selectedOption === null}
                className="editorial-btn-primary self-start px-6 py-2.5 text-xs font-bold cursor-pointer"
              >
                Verify Prediction
              </button>
            )}

            {questionSubmitted && (
              <div
                className={`p-4 rounded-lg border-2 border-[#111111] text-xs leading-relaxed ${
                  questionCorrect
                    ? 'bg-[#1E6F50] text-[#FAF7F0]'
                    : 'bg-[#E6DFD1] text-[#111111]'
                }`}
              >
                <div className="font-extrabold text-sm mb-1">
                  {questionCorrect ? 'Prediction Spot-On!' : 'Not quite right.'}
                </div>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Live Terminal Incident Drill */}
        {currentQuestion.mode === 'terminal-drill' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#E6DFD1] border-2 border-[#111111] rounded-lg p-3.5 text-xs text-[#111111]">
              <span className="font-mono font-bold uppercase text-[#D9541E] mr-2">
                Incident Scenario:
              </span>
              <span className="font-medium">{currentQuestion.scenario}</span>
            </div>

            {/* Mobile Toggle Tabs for Terminal vs Visualizer */}
            <div className="flex lg:hidden items-center gap-2 bg-[#E6DFD1] p-1 rounded-lg border-2 border-[#111111]">
              <button
                onClick={() => setMobilePane('terminal')}
                className={`flex-1 py-2 px-3 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobilePane === 'terminal'
                    ? 'bg-[#111111] text-[#F3EEE3]'
                    : 'text-[#111111]'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>Terminal</span>
              </button>
              <button
                onClick={() => setMobilePane('visualizer')}
                className={`flex-1 py-2 px-3 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  mobilePane === 'visualizer'
                    ? 'bg-[#111111] text-[#F3EEE3]'
                    : 'text-[#111111]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Repo Visualizer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div
                className={`lg:col-span-6 ${
                  mobilePane === 'visualizer' ? 'block' : 'hidden lg:block'
                }`}
              >
                <Visualizer repoState={drillRepoState} />
              </div>

              <div
                key={currentQuestion.id}
                className={`lg:col-span-6 ${
                  mobilePane === 'terminal' ? 'block' : 'hidden lg:block'
                }`}
              >
                <Terminal
                  repoState={drillRepoState}
                  setRepoState={setDrillRepoState}
                  onCommandExecuted={(cmd, state) =>
                    handleDrillCommand(currentQuestion, cmd, state)
                  }
                  hints={currentQuestion.hints}
                  quickCommands={currentQuestion.quickCommands}
                />
              </div>
            </div>

            {questionSubmitted ? (
              <div
                className={`p-4 rounded-lg border-2 border-[#111111] text-xs leading-relaxed ${
                  questionCorrect
                    ? 'bg-[#1E6F50] text-[#FAF7F0]'
                    : 'bg-[#E6DFD1] text-[#111111]'
                }`}
              >
                <div className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                  {questionCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Repository State Verified!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-[#D9541E]" />
                      <span>Solution Revealed</span>
                    </>
                  )}
                </div>
                <p>{currentQuestion.explanation}</p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-[#524E48]">
                  Run commands in the terminal — repository state validates automatically.
                </span>
                <button
                  onClick={() => {
                    setQuestionCorrect(false);
                    setQuestionSubmitted(true);
                  }}
                  className="font-mono text-xs font-bold text-[#524E48] hover:text-[#111111] underline cursor-pointer"
                >
                  Skip &amp; Show Solution
                </button>
              </div>
            )}
          </div>
        )}

        {/* Next / Lock & Save Footer */}
        {questionSubmitted && (
          <div className="pt-4 border-t-2 border-[#111111] flex justify-end">
            <button
              onClick={() =>
                recordAnswerAndAdvance(
                  currentQuestion,
                  questionCorrect,
                  getSubmittedSummaryForCurrent()
                )
              }
              className="editorial-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>
                {currentIndex + 1 < questions.length
                  ? 'Next Question'
                  : 'Complete & Lock Daily Test'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
