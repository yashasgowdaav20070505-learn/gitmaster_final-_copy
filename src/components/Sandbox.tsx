import { useState } from 'react';
import { RepoState } from '../types';
import Terminal from './Terminal';
import Visualizer from './Visualizer';
import { HelpCircle, TerminalSquare, Eye, Terminal as TerminalIcon } from 'lucide-react';

const SANDBOX_START_STATE: RepoState = {
  isInitialized: true,
  workingDirectory: [
    { name: 'index.html', content: '<h1>My Kitten Sanctuary</h1>', status: 'untracked' },
    { name: 'styles.css', content: 'body { background: #F3EEE3; }', status: 'untracked' },
    { name: 'app.js', content: 'console.log("Kittens loaded!");', status: 'untracked' },
  ],
  stagingArea: [],
  commits: [],
  currentBranch: 'main',
  branches: ['main'],
  remoteCommits: [],
  remoteBranches: [],
};

export default function Sandbox() {
  const [sandboxState, setSandboxState] = useState<RepoState>({ ...SANDBOX_START_STATE });
  const [mobilePane, setMobilePane] = useState<'terminal' | 'visualizer'>('terminal');

  return (
    <div className="flex flex-col gap-6" id="sandbox-view">
      {/* Unboxed Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-extrabold text-[#111111] flex items-center gap-2 uppercase tracking-wide font-mono">
          <TerminalSquare className="w-5 h-5 text-[#D9541E]" />
          <span>Git Sandbox Arena</span>
        </h2>
        <p className="text-xs text-[#524E48]">
          Experiment freely with Git commands and watch your working directory, staging index, and commit tree update live. Tap <strong className="text-[#D9541E]">Ask Turing</strong> anytime for help.
        </p>
      </div>

      {/* Mobile Toggle Tabs for Terminal vs Visualizer */}
      <div className="flex lg:hidden items-center gap-2 bg-[#E6DFD1] p-1 rounded-lg border-2 border-[#111111]">
        <button
          onClick={() => setMobilePane('terminal')}
          className={`flex-1 py-2.5 px-3 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
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
          className={`flex-1 py-2.5 px-3 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
            mobilePane === 'visualizer'
              ? 'bg-[#111111] text-[#F3EEE3]'
              : 'text-[#111111]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Repo Visualizer</span>
        </button>
      </div>

      {/* Spacious Full-Width Split View on Desktop, Stacked Toggle on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`lg:col-span-6 ${mobilePane === 'visualizer' ? 'block' : 'hidden lg:block'}`}>
          <Visualizer repoState={sandboxState} />
        </div>
        <div className={`lg:col-span-6 ${mobilePane === 'terminal' ? 'block' : 'hidden lg:block'}`}>
          <Terminal repoState={sandboxState} setRepoState={setSandboxState} />
        </div>
      </div>

      {/* Compact Command Reference Strip */}
      <div className="editorial-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h4 className="font-mono font-bold text-[#111111] flex items-center gap-1.5 uppercase tracking-wider text-xs shrink-0">
          <HelpCircle className="w-4 h-4 text-[#D9541E]" /> Try These Commands:
        </h4>
        <div className="flex flex-wrap gap-2 font-mono text-[11px] text-[#111111]">
          {[
            'git status',
            'git add index.html',
            'git commit -m "Initial page"',
            'git log',
            'git branch feature-kittens',
            'git checkout feature-kittens',
          ].map((cmd) => (
            <span
              key={cmd}
              className="px-2.5 py-1 rounded bg-[#E6DFD1] border border-[#111111] font-semibold"
            >
              {cmd}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
