import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownToLine, Sparkles, X } from 'lucide-react';

interface AnimatedRobotHelperProps {
  lastCommand: string;
  lastExitCode: 0 | 1 | null;
  stderrSummary?: string;
  onInsertCommand: (cmd: string) => void;
}

interface RobotDiagnosis {
  title: string;
  explanation: string;
  suggestedCommand: string;
}

const TYPO_MAP: Record<string, { label: string; fix: string }> = {
  comit: { label: 'git commit', fix: 'git commit -m "Update project files"' },
  commmit: { label: 'git commit', fix: 'git commit -m "Update project files"' },
  cmmit: { label: 'git commit', fix: 'git commit -m "Update project files"' },
  staus: { label: 'git status', fix: 'git status' },
  statsu: { label: 'git status', fix: 'git status' },
  statu: { label: 'git status', fix: 'git status' },
  stats: { label: 'git status', fix: 'git status' },
  chckout: { label: 'git checkout', fix: 'git checkout ' },
  checout: { label: 'git checkout', fix: 'git checkout ' },
  chekout: { label: 'git checkout', fix: 'git checkout ' },
  brnch: { label: 'git branch', fix: 'git branch' },
  branck: { label: 'git branch', fix: 'git branch' },
  psuh: { label: 'git push', fix: 'git push' },
  puhs: { label: 'git push', fix: 'git push' },
  pul: { label: 'git pull', fix: 'git pull' },
  plul: { label: 'git pull', fix: 'git pull' },
  dif: { label: 'git diff', fix: 'git diff' },
  fetc: { label: 'git fetch', fix: 'git fetch' },
  fecth: { label: 'git fetch', fix: 'git fetch' },
  ad: { label: 'git add .', fix: 'git add .' },
  lgo: { label: 'git log', fix: 'git log --oneline' },
  mrege: { label: 'git merge', fix: 'git merge ' },
  mrge: { label: 'git merge', fix: 'git merge ' },
};

const COMPACT_GIT_COMMANDS: Record<string, string> = {
  gitstatus: 'git status',
  gitadd: 'git add .',
  gitcommit: 'git commit -m "Update project files"',
  gitdiff: 'git diff',
  gitpush: 'git push',
  gitpull: 'git pull',
  gitfetch: 'git fetch',
  gitlog: 'git log --oneline',
  gitbranch: 'git branch',
};

function analyzeTerminalError(
  lastCommand: string,
  stderrSummary?: string
): RobotDiagnosis {
  const trimmed = lastCommand.trim();
  const lower = trimmed.toLowerCase();

  if (stderrSummary === 'push-rejected-behind') {
    return {
      title: 'Push Rejected (Remote Ahead)',
      explanation:
        'GitHub origin has newer commits from a teammate that your local branch does not have yet. Pull and merge them first before pushing.',
      suggestedCommand: 'git pull',
    };
  }

  if (stderrSummary === 'nothing-staged-to-commit') {
    return {
      title: 'Nothing Staged Yet',
      explanation:
        'You edited or created files, but they are still in the Working Directory. Stage them into the Index before running commit.',
      suggestedCommand: 'git add .',
    };
  }

  if (stderrSummary === 'clean-tree-commit') {
    return {
      title: 'Working Tree Clean',
      explanation:
        'No files have been modified yet. Edit a file in the Code Editor or check current tracking state first.',
      suggestedCommand: 'git status',
    };
  }

  if (stderrSummary === 'commit-missing-message') {
    return {
      title: 'Commit Message Missing',
      explanation:
        'Always wrap your commit description in quotes after the -m flag so teammates understand what changed.',
      suggestedCommand: 'git commit -m "Update project files"',
    };
  }

  if (
    stderrSummary === 'merge-conflict-pull' ||
    stderrSummary === 'unresolved-conflict-markers' ||
    stderrSummary === 'unmerged-files-commit'
  ) {
    return {
      title: 'Merge Conflict Needs Resolution',
      explanation:
        'Use "Accept Current", "Accept Incoming", or "Keep Both" in the Code Editor to remove conflict markers, then stage the resolved file.',
      suggestedCommand: 'git add .',
    };
  }

  if (stderrSummary === 'file-ignored-by-gitignore') {
    return {
      title: 'Protected by .gitignore',
      explanation:
        'That file matches a rule inside .gitignore (such as *.env) to keep local secrets out of GitHub.',
      suggestedCommand: 'git status',
    };
  }

  if (stderrSummary === 'add-missing-pathspec') {
    return {
      title: 'Specify Which Files to Stage',
      explanation:
        'Pass a filename (like git add index.html) or "." to stage all modified and untracked files at once.',
      suggestedCommand: 'git add .',
    };
  }

  if (stderrSummary?.startsWith('git-typo:')) {
    const sub = stderrSummary.split(':')[1]?.toLowerCase() || '';
    const match = TYPO_MAP[sub];
    if (match) {
      return {
        title: `Typo Detected: "${sub}"`,
        explanation: `Did you mean "${match.label}"? Insert the corrected command below.`,
        suggestedCommand: match.fix,
      };
    }
  }

  if (stderrSummary?.startsWith('unknown-command:')) {
    const cmd = stderrSummary.split(':')[1]?.toLowerCase() || '';
    if (COMPACT_GIT_COMMANDS[cmd]) {
      return {
        title: 'Missing Space After "git"',
        explanation: `Git commands require a space between "git" and the subcommand.`,
        suggestedCommand: COMPACT_GIT_COMMANDS[cmd],
      };
    }
    if (TYPO_MAP[cmd] || ['status', 'add', 'commit', 'push', 'pull', 'diff', 'fetch', 'log', 'branch'].includes(cmd)) {
      const fix = TYPO_MAP[cmd]?.fix || `git ${cmd}`;
      return {
        title: 'Prefix Command With "git"',
        explanation: `In the terminal, version control commands start with "git ", e.g. "${fix}".`,
        suggestedCommand: fix,
      };
    }
  }

  if (stderrSummary?.startsWith('branch-not-found:')) {
    const missing = stderrSummary.split(':')[1] || 'feature/update';
    return {
      title: 'Branch Does Not Exist Yet',
      explanation: `Add the -b flag to create "${missing}" and switch to it in one step.`,
      suggestedCommand: `git checkout -b ${missing}`,
    };
  }

  if (stderrSummary?.startsWith('pathspec-not-found:')) {
    return {
      title: 'File Not Found in Workspace',
      explanation:
        'Double-check the exact spelling and folder path of the file with git status.',
      suggestedCommand: 'git status',
    };
  }

  if (lower.includes('commit') && !lower.includes('-m')) {
    return {
      title: 'Add Commit Flag -m',
      explanation: 'Include -m "Your message" to record the commit cleanly.',
      suggestedCommand: 'git commit -m "Update project files"',
    };
  }

  return {
    title: 'Command Check',
    explanation:
      'That command returned an error. Run git status to inspect your branch and working directory.',
    suggestedCommand: 'git status',
  };
}

export default function AnimatedRobotHelper({
  lastCommand,
  lastExitCode,
  stderrSummary,
  onInsertCommand,
}: AnimatedRobotHelperProps) {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [manualTipOpen, setManualTipOpen] = useState(false);

  useEffect(() => {
    if (lastExitCode === 1) {
      setBubbleOpen(true);
      setManualTipOpen(false);
    } else if (lastExitCode === 0) {
      setBubbleOpen(false);
    }
  }, [lastCommand, lastExitCode, stderrSummary]);

  const isError = lastExitCode === 1;
  const isSuccess = lastExitCode === 0;
  const diagnosis = isError
    ? analyzeTerminalError(lastCommand, stderrSummary)
    : null;

  const visorColor = isError
    ? '#D9541E'
    : isSuccess
    ? '#6EE7B7'
    : '#F3EEE3';

  return (
    <div className="relative flex items-center">
      {/* Compact Speech Bubble Overlay Anchored Above/Left of Corner Robot */}
      <AnimatePresence>
        {(bubbleOpen && diagnosis) || manualTipOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 bottom-full mb-2.5 w-72 sm:w-80 z-30 bg-[#FAF7F0] text-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[#111111]/20">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-extrabold text-[#D9541E]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {diagnosis ? diagnosis.title : 'BitBot Terminal Helper'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBubbleOpen(false);
                  setManualTipOpen(false);
                }}
                className="text-[#524E48] hover:text-[#111111] cursor-pointer shrink-0"
                aria-label="Dismiss robot tip"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-[#524E48] leading-relaxed mt-2">
              {diagnosis
                ? diagnosis.explanation
                : 'I watch your terminal output in real time. If a command fails or gets rejected by GitHub, I will suggest an instant fix!'}
            </p>

            <div className="mt-2.5 flex flex-col gap-1.5">
              <code className="block px-2 py-1 rounded bg-[#E6DFD1] border border-[#111111]/30 font-mono text-[10px] font-bold text-[#111111] truncate">
                $ {diagnosis ? diagnosis.suggestedCommand : 'git status'}
              </code>
              <button
                type="button"
                onClick={() => {
                  onInsertCommand(
                    diagnosis ? diagnosis.suggestedCommand : 'git status'
                  );
                  setBubbleOpen(false);
                  setManualTipOpen(false);
                }}
                className="editorial-btn-primary w-full px-2.5 py-1.5 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Insert Suggested Command</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Floating Compact Robot Character Button */}
      <motion.button
        type="button"
        onClick={() => {
          if (isError && diagnosis) {
            setBubbleOpen((prev) => !prev);
            setManualTipOpen(false);
          } else {
            setManualTipOpen((prev) => !prev);
          }
        }}
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        title="BitBot Terminal Assistant"
        aria-label="Toggle BitBot Terminal Assistant"
        className={`relative flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 cursor-pointer transition-colors ${
          isError
            ? 'bg-[#D9541E] border-[#FAF7F0] text-[#FAF7F0]'
            : isSuccess
            ? 'bg-[#1E6F50] border-[#FAF7F0] text-[#FAF7F0]'
            : 'bg-[#222222] border-[#F3EEE3]/40 text-[#F3EEE3]'
        }`}
      >
        {/* SVG Robot Face with Blinking Visor Eyes */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          {/* Antenna */}
          <line
            x1="14"
            y1="2"
            x2="14"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            cx="14"
            cy="2.5"
            r="2"
            fill={visorColor}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
          {/* Head Frame */}
          <rect
            x="4"
            y="6.5"
            width="20"
            height="16"
            rx="4"
            fill="#111111"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Ear Bolts */}
          <rect x="1.5" y="12" width="2.5" height="5" rx="1" fill="currentColor" />
          <rect x="24" y="12" width="2.5" height="5" rx="1" fill="currentColor" />
          {/* Animated Visor Eyes */}
          <motion.rect
            x="8.5"
            y="11"
            width="3.2"
            height="4"
            rx="1"
            fill={visorColor}
            animate={{ scaleY: [1, 1, 0.15, 1] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.9, 0.94, 0.98],
            }}
          />
          <motion.rect
            x="16.3"
            y="11"
            width="3.2"
            height="4"
            rx="1"
            fill={visorColor}
            animate={{ scaleY: [1, 1, 0.15, 1] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.9, 0.94, 0.98],
            }}
          />
          {/* Mouth / State Expression */}
          {isError ? (
            <path
              d="M10 19.2L12.2 17.4L14 19.2L15.8 17.4L18 19.2"
              stroke={visorColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : isSuccess ? (
            <path
              d="M10 17.5C11.4 19.5 16.6 19.5 18 17.5"
              stroke={visorColor}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ) : (
            <line
              x1="10.5"
              y1="18.2"
              x2="17.5"
              y2="18.2"
              stroke={visorColor}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          )}
        </svg>

        <span className="font-mono text-[10px] font-bold whitespace-nowrap hidden sm:inline">
          {isError ? 'Fix Hint' : isSuccess ? 'Synced' : 'BitBot'}
        </span>

        {isError && (
          <span className="w-2 h-2 rounded-full bg-[#FAF7F0] animate-ping shrink-0" />
        )}
      </motion.button>
    </div>
  );
}
