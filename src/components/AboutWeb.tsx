import { Terminal, Eye, BrainCircuit, BookOpen, CheckCircle2 } from 'lucide-react';

export default function AboutWeb() {
  const steps = [
    {
      title: 'Interactive Roadmap Lessons',
      desc: 'Step-by-step guidance starting with real-world scenarios, mental models, knowledge checks, and terminal drills.',
      icon: BookOpen,
    },
    {
      title: 'Live Terminal Emulator',
      desc: 'An isolated command-line simulator executing core Git syntax like init, status, add, commit, branch, and merge.',
      icon: Terminal,
    },
    {
      title: 'Interactive Graph Visualizer',
      desc: 'Watch your working directory, staging index, and commit tree update in real time as you run commands.',
      icon: Eye,
    },
    {
      title: 'AI Companion Turing',
      desc: 'Ask Turing anytime in the side panel for plain-language analogies or context-aware hints.',
      icon: BrainCircuit,
    },
  ];

  return (
    <div
      className="flex flex-col gap-8 max-w-5xl mx-auto py-2 text-[#111111] font-sans"
      id="about-web-container"
    >
      {/* Header Banner */}
      <div className="editorial-card p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex-1 space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#D9541E]">
            How It Works
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            Welcome to GitMaster Academy
          </h1>
          <p className="text-[#524E48] text-xs sm:text-sm leading-relaxed max-w-xl">
            GitMaster is an interactive simulated learning platform built to demystify Git. Practice commands safely in an isolated browser sandbox paired with live repository visualization and milestone continuity rewards.
          </p>
        </div>

        <div className="shrink-0 bg-[#111111] text-[#F3EEE3] border-2 border-[#111111] shadow-[4px_4px_0px_#D9541E] p-5 rounded-xl flex flex-col items-center justify-center gap-2 text-center w-48">
          <div className="w-11 h-11 rounded-lg bg-[#D9541E] text-[#FAF7F0] flex items-center justify-center font-mono font-extrabold text-sm">
            GM
          </div>
          <div className="text-[10px] font-mono text-[#F3EEE3]/70 uppercase tracking-wider">
            Curriculum
          </div>
          <div className="text-xs font-bold font-mono">8 Modules · 20 Lessons</div>
        </div>
      </div>

      {/* Sandbox Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-7 editorial-card p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#D9541E]">
              <Terminal className="w-5 h-5" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider font-mono">
                The Sandbox Arena
              </h2>
            </div>

            <h3 className="text-lg font-extrabold text-[#111111]">
              What is the Sandbox Arena?
            </h3>
            <p className="text-xs text-[#524E48] leading-relaxed">
              The Sandbox Arena is your unguided playground. Unlike roadmap lessons that validate a specific target command, the Sandbox lets you experiment freely with any Git workflow.
            </p>

            <ul className="space-y-3 mt-4 text-xs text-[#111111]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6F50] shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Risk Testbed:</strong> Practice{' '}
                  <code className="font-mono bg-[#E6DFD1] px-1 rounded">git add</code>,{' '}
                  <code className="font-mono bg-[#E6DFD1] px-1 rounded">git commit</code>, and{' '}
                  <code className="font-mono bg-[#E6DFD1] px-1 rounded">git branch</code> without affecting real files.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6F50] shrink-0 mt-0.5" />
                <span>
                  <strong>Real-Time State Mirror:</strong> Every command updates the working directory, staging area, and commit graph immediately.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1E6F50] shrink-0 mt-0.5" />
                <span>
                  <strong>One-Click Reset:</strong> Restore the sandbox workspace anytime to try a fresh scenario.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-5 bg-[#111111] text-[#F3EEE3] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-[10px] p-6 flex flex-col justify-between gap-4">
          <div className="font-mono text-xs text-[#D9541E] font-bold uppercase tracking-wider">
            Simulated Pipeline
          </div>
          <div className="font-mono text-xs space-y-2.5">
            <div>
              <span className="text-[#D9541E]">$</span> git status
              <div className="text-[#F3EEE3]/70 pl-3">Untracked: index.html</div>
            </div>
            <div>
              <span className="text-[#D9541E]">$</span> git add index.html
              <div className="text-[#F3EEE3]/70 pl-3">Staged &apos;index.html&apos;</div>
            </div>
            <div>
              <span className="text-[#D9541E]">$</span> git commit -m &quot;Initial&quot;
              <div className="text-[#6EE7B7] pl-3">[main 9f4a21b] Initial</div>
            </div>
          </div>
          <div className="pt-3 border-t border-[#F3EEE3]/20 text-[11px] font-mono text-[#F3EEE3]/80">
            Client-side virtual repository engine
          </div>
        </div>
      </div>

      {/* Core Components */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#524E48] text-center">
          Interactive Engine Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => {
            const IconComponent = st.icon;
            return (
              <div
                key={idx}
                className="editorial-card p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E6DFD1] border-2 border-[#111111] flex items-center justify-center shrink-0 text-[#D9541E]">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-[#111111] tracking-wide">
                    {st.title}
                  </h4>
                  <p className="text-xs text-[#524E48] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
