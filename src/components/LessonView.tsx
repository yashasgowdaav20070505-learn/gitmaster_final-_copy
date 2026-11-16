import { useState, useEffect } from 'react';
import { Lesson, RepoState, UserProgress } from '../types';
import Terminal from './Terminal';
import Visualizer from './Visualizer';
import AITutor from './AITutor';
import TopicIllustration from './TopicIllustration';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Award,
  Play,
  ArrowRight,
  Zap,
  Coins,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LessonViewProps {
  key?: string;
  lesson: Lesson;
  progress: UserProgress;
  onLessonCompleted: (lessonId: string, xpEarned: number, coinsEarned: number) => void;
  onBackToDashboard: () => void;
}

export default function LessonView({
  lesson,
  onLessonCompleted,
  onBackToDashboard,
}: LessonViewProps) {
  // Steps: 0 = Scenario & Why, 1 = Concept & Analogy, 2 = Quiz, 3 = Terminal Challenge, 4 = Celebration Summary
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);

  const [challengeState, setChallengeState] = useState<RepoState>({
    ...lesson.terminalChallenge.startingState,
  });
  const [challengeCommandHistory, setChallengeCommandHistory] = useState<string[]>([]);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [mobileVisualizerOpen, setMobileVisualizerOpen] = useState(false);

  useEffect(() => {
    setCurrentStep(0);
    setSelectedQuizIndex(null);
    setQuizSubmitted(false);
    setQuizIsCorrect(false);
    setChallengeState({ ...lesson.terminalChallenge.startingState });
    setChallengeCommandHistory([]);
    setChallengeSuccess(false);
  }, [lesson]);

  const handleQuizSubmit = () => {
    if (selectedQuizIndex === null) return;
    const isCorrect = selectedQuizIndex === lesson.quiz.correctAnswerIndex;
    setQuizIsCorrect(isCorrect);
    setQuizSubmitted(true);
  };

  const handleCommandExecuted = (cmd: string) => {
    const updatedHistory = [...challengeCommandHistory, cmd];
    setChallengeCommandHistory(updatedHistory);

    const targetCmds = lesson.terminalChallenge.targetCommands;

    if (lesson.terminalChallenge.validationType === 'commands') {
      const isSequenceMatch = targetCmds.every((target, idx) => {
        const matchingCmd = updatedHistory[idx];
        return (
          matchingCmd &&
          matchingCmd.toLowerCase().trim().replace(/\s+/g, ' ') ===
            target.toLowerCase().trim().replace(/\s+/g, ' ')
        );
      });

      if (isSequenceMatch) {
        setChallengeSuccess(true);
        setTimeout(() => {
          setCurrentStep(4);
        }, 1200);
      }
    }
  };

  const handleCompleteLesson = () => {
    onLessonCompleted(lesson.id, lesson.xpReward, lesson.coinReward);
  };

  const progressPercent = Math.round((currentStep / 4) * 100);

  return (
    <div className="flex flex-col gap-6" id="lesson-page">
      {/* Lesson Header Nav */}
      <div className="editorial-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs text-[#D9541E] hover:underline font-bold mb-1 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Academy Roadmap
          </button>
          <h2 className="text-lg font-extrabold text-[#111111] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D9541E]" />
            <span>{lesson.title}</span>
          </h2>
        </div>

        {/* Slider Indicator Tracker */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <div className="text-xs font-mono text-[#524E48] font-bold tabular-nums">
            Section Progress:{' '}
            <strong className="text-[#D9541E]">{currentStep + 1} / 5</strong>
          </div>
          <div className="w-44 h-2.5 bg-[#E6DFD1] rounded-sm overflow-hidden border-2 border-[#111111]">
            <div
              className="h-full bg-[#1E6F50] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slide Layout */}
      <AnimatePresence mode="wait">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[480px]">
          {/* Main Slide Content Left Column */}
          <div className="lg:col-span-8 editorial-card p-6 flex flex-col justify-between min-h-[460px]">
            {/* Step 0: Scenario & Why exists */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                    Step 1 · Real-World Scenario
                  </span>
                  <h3 className="text-xl font-extrabold text-[#111111] mt-1 leading-snug">
                    The Story Behind the Concept
                  </h3>
                </div>

                <div className="bg-[#F3EEE3] rounded-lg p-4 border-2 border-[#111111] leading-relaxed text-sm text-[#111111] italic">
                  &ldquo;{lesson.scenario}&rdquo;
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#E6DFD1] rounded-lg p-4 border-2 border-[#111111]">
                    <h4 className="text-xs font-mono font-bold text-[#D9541E] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> The Problem
                    </h4>
                    <p className="text-xs text-[#111111] mt-2 leading-relaxed">
                      {lesson.problem}
                    </p>
                  </div>
                  <div className="bg-[#F3EEE3] rounded-lg p-4 border-2 border-[#111111]">
                    <h4 className="text-xs font-mono font-bold text-[#1E6F50] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Why Git Exists
                    </h4>
                    <p className="text-xs text-[#111111] mt-2 leading-relaxed">
                      {lesson.whyExists}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Explanation & Example */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                    Step 2 · Mental Model
                  </span>
                  <h3 className="text-xl font-extrabold text-[#111111] mt-1">
                    Understanding How It Works
                  </h3>
                </div>

                <div className="bg-[#F3EEE3] p-5 rounded-lg border-2 border-[#111111] flex flex-col gap-3">
                  <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-line">
                    {lesson.explanation}
                  </p>
                </div>

                <div className="bg-[#E6DFD1] p-4 rounded-lg border-2 border-[#111111]">
                  <h4 className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
                    Relatable Example
                  </h4>
                  <p className="text-xs text-[#524E48] mt-1.5 leading-relaxed">
                    {lesson.realWorldExample}
                  </p>
                </div>

                <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111]">
                  <h4 className="text-xs font-mono font-bold text-[#D9541E] uppercase tracking-wider">
                    Key Concept Notes
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-[#111111] mt-1.5 flex flex-col gap-1 leading-relaxed">
                    {lesson.importantNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Step 2: Interactive Quiz */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                    Step 3 · Knowledge Check
                  </span>
                  <h3 className="text-xl font-extrabold text-[#111111] mt-1">
                    Test Your Understanding
                  </h3>
                  <p className="text-xs text-[#524E48] mt-1">
                    Answer correctly to unlock the hands-on terminal challenge.
                  </p>
                </div>

                <div className="bg-[#E6DFD1] p-4 rounded-lg border-2 border-[#111111] font-bold text-sm text-[#111111]">
                  {lesson.quiz.question}
                </div>

                <div className="flex flex-col gap-3">
                  {lesson.quiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizIndex === idx;
                    let optionStyle =
                      'bg-[#FAF7F0] border-[#111111] text-[#111111] hover:bg-[#E6DFD1]';

                    if (quizSubmitted) {
                      if (idx === lesson.quiz.correctAnswerIndex) {
                        optionStyle =
                          'bg-[#1E6F50] border-[#111111] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]';
                      } else if (isSelected) {
                        optionStyle =
                          'bg-[#D9541E] border-[#111111] text-[#FAF7F0]';
                      } else {
                        optionStyle =
                          'bg-[#E6DFD1]/60 border-[#111111]/40 text-[#524E48]';
                      }
                    } else if (isSelected) {
                      optionStyle =
                        'bg-[#D9541E] border-[#111111] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => !quizSubmitted && setSelectedQuizIndex(idx)}
                        disabled={quizSubmitted}
                        className={`p-3.5 rounded-lg border-2 text-left text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                      >
                        <span className="w-6 h-6 rounded border-2 border-[#111111] flex items-center justify-center font-mono font-bold text-[11px] bg-[#FAF7F0] text-[#111111] shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-2 border-[#111111] text-xs leading-relaxed ${
                      quizIsCorrect
                        ? 'bg-[#1E6F50] text-[#FAF7F0]'
                        : 'bg-[#E6DFD1] text-[#111111]'
                    }`}
                  >
                    <div className="font-extrabold mb-1 text-sm">
                      {quizIsCorrect
                        ? 'Correct! Well reasoned.'
                        : 'Not quite — review the explanation below.'}
                    </div>
                    <p>{lesson.quiz.explanation}</p>
                  </motion.div>
                )}

                {(!quizSubmitted || !quizIsCorrect) && (
                  <div className="flex gap-3">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedQuizIndex === null}
                        className="editorial-btn-primary w-full py-3 text-xs font-bold cursor-pointer"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedQuizIndex(null);
                        }}
                        className="editorial-btn-secondary w-full py-3 text-xs font-bold cursor-pointer"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Terminal challenge */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex flex-col gap-4 flex-1 justify-between"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#1E6F50]">
                    Step 4 · Terminal Challenge
                  </span>
                  <h3 className="text-xl font-extrabold text-[#111111]">
                    Active Sandbox Simulation
                  </h3>
                  <div className="bg-[#E6DFD1] p-4 rounded-lg border-2 border-[#111111] leading-relaxed text-xs text-[#111111]">
                    <div className="font-mono font-bold text-[#D9541E] uppercase tracking-wide text-[10px] mb-1 flex items-center gap-1">
                      <Play className="w-3.5 h-3.5" /> Instruction
                    </div>
                    <span className="font-semibold">
                      {lesson.terminalChallenge.instruction}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  {/* Mobile Collapsible Visualizer Toggle */}
                  <div className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileVisualizerOpen((v) => !v)}
                      className="editorial-btn-secondary w-full py-2 px-3 text-xs font-mono font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#D9541E]" />
                        <span>Repository Visualizer</span>
                      </span>
                      <span>{mobileVisualizerOpen ? 'Hide' : 'Show'}</span>
                    </button>
                    {mobileVisualizerOpen && (
                      <div className="mt-3">
                        <Visualizer repoState={challengeState} />
                      </div>
                    )}
                  </div>

                  <Terminal
                    repoState={challengeState}
                    setRepoState={setChallengeState}
                    onCommandExecuted={handleCommandExecuted}
                    targetCommands={lesson.terminalChallenge.targetCommands}
                    currentCommandIndex={challengeCommandHistory.length}
                    hints={lesson.terminalChallenge.hints}
                  />

                  {challengeSuccess && (
                    <div className="p-3 bg-[#1E6F50] border-2 border-[#111111] text-[#FAF7F0] text-xs rounded-lg font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Challenge solved! Advancing to completion summary...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Celebration Summary */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center gap-5 py-8"
              >
                <div className="w-16 h-16 rounded-xl bg-[#D9541E] text-[#FAF7F0] flex items-center justify-center border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
                  <Award className="w-9 h-9" />
                </div>

                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1E6F50]">
                    Lesson Complete
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#111111] mt-1">
                    Milestone Recorded
                  </h3>
                  <p className="text-xs text-[#524E48] mt-1 max-w-sm">
                    You completed{' '}
                    <strong className="text-[#111111]">{lesson.title}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-1">
                  <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111] text-center flex flex-col items-center">
                    <Zap className="w-5 h-5 text-[#D9541E] mb-1" />
                    <span className="text-base font-extrabold font-mono text-[#111111] tabular-nums">
                      +{lesson.xpReward}
                    </span>
                    <span className="text-[10px] text-[#524E48] font-mono font-bold uppercase">
                      XP Earned
                    </span>
                  </div>
                  <div className="bg-[#F3EEE3] p-4 rounded-lg border-2 border-[#111111] text-center flex flex-col items-center">
                    <Coins className="w-5 h-5 text-[#D9541E] mb-1" />
                    <span className="text-base font-extrabold font-mono text-[#111111] tabular-nums">
                      +{lesson.coinReward}
                    </span>
                    <span className="text-[10px] text-[#524E48] font-mono font-bold uppercase">
                      Coins Earned
                    </span>
                  </div>
                </div>

                <div className="bg-[#E6DFD1] p-4 rounded-lg border-2 border-[#111111] max-w-md w-full text-left">
                  <h4 className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Lesson Recap
                  </h4>
                  <p className="text-xs text-[#524E48] leading-relaxed">
                    You practiced core Git state transitions inside the simulator and verified the repository changes in real time.
                  </p>
                </div>

                <button
                  onClick={handleCompleteLesson}
                  className="editorial-btn-success px-8 py-3 text-xs font-bold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Claim Rewards &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Pagination Navigation Footer Controls */}
            {currentStep < 4 && (
              <div className="flex items-center justify-between border-t-2 border-[#111111] pt-4 mt-6">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="editorial-btn-secondary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentStep === 2 ? (
                  <button
                    onClick={() => quizIsCorrect && setCurrentStep(3)}
                    disabled={!quizIsCorrect}
                    className="editorial-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Proceed to Terminal Challenge</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : currentStep === 3 ? (
                  <button
                    onClick={() => challengeSuccess && setCurrentStep(4)}
                    disabled={!challengeSuccess}
                    className="editorial-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Proceed to Summary</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="editorial-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column Side Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {currentStep === 3 ? (
              <div className="hidden lg:block">
                <Visualizer repoState={challengeState} />
              </div>
            ) : (
              <TopicIllustration lessonId={lesson.id} />
            )}

            <AITutor currentLesson={lesson} />
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
