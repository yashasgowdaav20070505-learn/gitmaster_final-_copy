import { motion } from 'motion/react';
import {
  Database,
  ShieldCheck,
  Globe,
  RotateCcw,
  Archive,
  Cookie,
  RefreshCw,
  Tag,
  History,
  GitBranch,
  GitCommit,
} from 'lucide-react';

interface TopicIllustrationProps {
  lessonId: string;
}

export default function TopicIllustration({ lessonId }: TopicIllustrationProps) {
  const renderContent = () => {
    switch (lessonId) {
      case 'lesson-why-vc':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-xl bg-[#D9541E] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center text-[#FAF7F0]"
            >
              <Cookie className="w-7 h-7" />
            </motion.div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                The Recipe Time-Machine
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Jump safely between nut-free originals and experimental drafts without losing history.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#111111] text-[#F3EEE3] px-3 py-1.5 rounded-md font-mono text-[10px]">
              <span className="text-[#6EE7B7]">v1.0 Original</span>
              <span>&rarr;</span>
              <span className="text-[#D9541E] line-through">v1.1 Draft</span>
            </div>
          </div>
        );

      case 'lesson-git-init':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-[#1E6F50] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center text-[#FAF7F0]">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Initializing .git Vault
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Creates a hidden tracker database inside your project folder to record snapshots.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-status':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3 w-full">
            <div className="flex gap-2.5">
              <span className="w-8 h-8 rounded-md bg-[#D9541E] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0] text-xs font-bold font-mono">
                U
              </span>
              <span className="w-8 h-8 rounded-md bg-[#E6DFD1] border-2 border-[#111111] flex items-center justify-center text-[#111111] text-xs font-bold font-mono">
                M
              </span>
              <span className="w-8 h-8 rounded-md bg-[#1E6F50] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0] text-xs font-bold font-mono">
                S
              </span>
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Workspace Status Radar
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Audit which files are untracked, modified, or staged for your next commit.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-add':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="flex items-center gap-3 font-mono text-xs font-bold">
              <div className="px-3 py-2 rounded bg-[#FAF7F0] border-2 border-[#111111] text-[#111111]">
                Work
              </div>
              <span className="text-[#D9541E]">git add &rarr;</span>
              <div className="px-3 py-2 rounded bg-[#1E6F50] border-2 border-[#111111] text-[#FAF7F0]">
                Staged
              </div>
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                The Staging Cargo Crate
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Selectively pack files into the staging area before sealing them in history.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-commit':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-[#1E6F50] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center text-[#FAF7F0]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Sealed Vault Commit
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Saves a permanent snapshot with a unique hash and descriptive message.
              </p>
            </div>
            <div className="px-2.5 py-1 bg-[#111111] text-[#6EE7B7] rounded text-[10px] font-mono">
              commit a1b2c3d (HEAD)
            </div>
          </div>
        );

      case 'lesson-git-log':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3 w-full">
            <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
              <div className="bg-[#111111] text-[#F3EEE3] p-2 rounded flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#D9541E] font-bold">f7e8d9c</span>
                <span className="truncate max-w-[120px]">Add kitten details</span>
              </div>
              <div className="bg-[#FAF7F0] border border-[#111111] p-2 rounded flex items-center justify-between text-[10px] font-mono text-[#111111]">
                <span className="text-[#1E6F50] font-bold">a1b2c3d</span>
                <span className="truncate max-w-[120px]">Initial commit</span>
              </div>
            </div>
            <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
              Chronological Ledger
            </h4>
          </div>
        );

      case 'lesson-git-branch':
      case 'lesson-git-merge':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
              <span className="px-2.5 py-1 bg-[#111111] text-[#F3EEE3] rounded">
                main
              </span>
              <span className="text-[#D9541E]">
                {lessonId === 'lesson-git-branch' ? '↗' : '↘'}
              </span>
              <span className="px-2.5 py-1 bg-[#D9541E] text-[#FAF7F0] border border-[#111111] rounded">
                feature-lasers
              </span>
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                {lessonId === 'lesson-git-branch'
                  ? 'Parallel Branching'
                  : 'Branch Integration'}
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                {lessonId === 'lesson-git-branch'
                  ? 'Isolate new features safely without touching your stable main branch.'
                  : 'Bring completed branch commits seamlessly back into main.'}
              </p>
            </div>
          </div>
        );

      case 'lesson-git-clone':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="flex items-center gap-4">
              <Globe className="w-8 h-8 text-[#D9541E]" />
              <span className="font-mono font-bold text-[#111111]">&rarr;</span>
              <Database className="w-8 h-8 text-[#1E6F50]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Remote Cloning
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Copy an entire remote repository and its commit timeline to your machine.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-restore':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D9541E] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Local History Restore
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Discard uncommitted errors and revert instantly to your last safe commit.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-stash':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#111111] border-2 border-[#111111] flex items-center justify-center text-[#F3EEE3]">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                The Stash Shelf
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Shelve half-finished edits temporarily so you can switch branches cleanly.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-diff':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3 w-full">
            <div className="w-full max-w-[230px] bg-[#111111] text-[#F3EEE3] p-2.5 rounded-lg font-mono text-[10px] text-left border-2 border-[#111111]">
              <div className="text-[#D9541E]">- retries: 3</div>
              <div className="text-[#6EE7B7]">+ retries: 5</div>
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Line-by-Line Diff Audit
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Inspect unstaged and staged edits before sealing them into a commit.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-revert':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
              <span className="px-2 py-1 bg-[#D9541E] text-[#FAF7F0] rounded border border-[#111111]">
                f9e8d7c (Bug)
              </span>
              <span className="text-[#111111]">&rarr;</span>
              <span className="px-2 py-1 bg-[#1E6F50] text-[#FAF7F0] rounded border border-[#111111]">
                Revert Commit
              </span>
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Safe Public Undo
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Moves history forward with a clean inverse commit so teammates stay synced.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-reset':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D9541E] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Rewinding HEAD (--soft / --mixed / --hard)
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Move branch pointers backward while controlling Staging vs. Working Directory.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-rebase':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1E6F50] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0]">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Linear History Rebase
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Replay feature branch commits neatly on top of the latest main tip.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-cherry-pick':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D9541E] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0]">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Surgical Cherry-Pick
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Pluck a single critical hotfix commit onto another branch cleanly.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-reflog':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#111111] border-2 border-[#111111] flex items-center justify-center text-[#F3EEE3]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                HEAD Flight Recorder
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Recover lost commits from local HEAD history after accidental resets.
              </p>
            </div>
          </div>
        );

      case 'lesson-git-fetch-pull':
      case 'lesson-git-push-pr':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="flex items-center gap-4">
              <Database className="w-7 h-7 text-[#1E6F50]" />
              <span className="font-mono font-bold text-[#D9541E]">
                {lessonId === 'lesson-git-fetch-pull' ? '←' : '→'}
              </span>
              <Globe className="w-7 h-7 text-[#D9541E]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                {lessonId === 'lesson-git-fetch-pull'
                  ? 'Remote Fetch & Pull'
                  : 'Push & Pull Requests'}
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                {lessonId === 'lesson-git-fetch-pull'
                  ? 'Inspect origin updates safely before merging into local branches.'
                  : 'Publish feature branches with -u upstream tracking for code review.'}
              </p>
            </div>
          </div>
        );

      case 'lesson-git-tag':
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1E6F50] border-2 border-[#111111] flex items-center justify-center text-[#FAF7F0]">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-extrabold text-[#111111] uppercase tracking-wider">
                Semantic Release Tags
              </h4>
              <p className="text-[11px] text-[#524E48] mt-1 max-w-[230px] mx-auto leading-relaxed">
                Stamp permanent v1.0.0 release milestones onto production commits.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-5 h-full text-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#524E48]" />
            <h4 className="text-xs font-bold text-[#111111]">Interactive Concept</h4>
          </div>
        );
    }
  };

  return (
    <div
      className="editorial-card overflow-hidden aspect-video w-full flex flex-col relative bg-[#F3EEE3]"
      id="topic-illustration"
    >
      <div className="flex-1 bg-[#F3EEE3]">{renderContent()}</div>

      <div className="h-8 bg-[#E6DFD1] border-t-2 border-[#111111] px-3.5 flex items-center justify-between text-[10px] font-mono font-bold text-[#111111]">
        <span>GITMASTER VISUAL MODEL</span>
        <span className="text-[#1E6F50]">ACTIVE</span>
      </div>
    </div>
  );
}
