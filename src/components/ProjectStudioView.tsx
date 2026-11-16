import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  ProjectFile,
  ProjectWorkspaceState,
  STARTER_PROJECTS,
} from '../data/starterProjects';
import {
  createNewFile,
  getOrInitWorkspace,
  resetWorkspace,
  updateFileContent,
} from '../utils/virtualFileSystem';
import {
  executeRealisticGitCommand,
  getAheadBehindCounts,
  GitTerminalLine,
  simulateTeammatePush,
} from '../utils/realisticGitOutput';
import FileEditorPanel from './FileEditorPanel';
import AnimatedRobotHelper from './AnimatedRobotHelper';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Cloud,
  FolderGit2,
  GitBranch,
  GitCommit,
  RefreshCw,
  Terminal as TerminalIcon,
  Users,
  FileCode2,
} from 'lucide-react';

function getInitialTerminalLines(ws: ProjectWorkspaceState): GitTerminalLine[] {
  const { behind } = getAheadBehindCounts(ws, ws.currentBranch);
  const lines: GitTerminalLine[] = [
    {
      type: 'output',
      text: `Opened persistent workspace ~/${ws.repoName} on branch (${ws.currentBranch}).`,
    },
    {
      type: 'output',
      text: 'Edit files in the Code Editor, then run git status, git diff, git add ., commit, pull, or push.',
    },
  ];
  if (behind > 0) {
    lines.push({
      type: 'error',
      text: `Notice: origin/${ws.currentBranch} is ahead by ${behind} teammate commit(s). Try "git fetch" or "git pull".`,
    });
  }
  return lines;
}

function getStatusPillProps(status: ProjectFile['status']): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'untracked':
      return { label: 'Untracked', className: 'bg-[#D9541E] text-[#FAF7F0]' };
    case 'modified':
      return { label: 'Modified', className: 'bg-[#E6DFD1] text-[#111111]' };
    case 'staged':
      return { label: 'Staged', className: 'bg-[#111111] text-[#F3EEE3]' };
    case 'committed':
      return { label: 'Committed', className: 'bg-[#1E6F50] text-[#FAF7F0]' };
    case 'ignored':
      return { label: 'Ignored', className: 'bg-[#E6DFD1] text-[#524E48]' };
    case 'conflicted':
      return { label: 'Conflict', className: 'bg-[#D9541E] text-[#FAF7F0]' };
  }
}

export default function ProjectStudioView() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    STARTER_PROJECTS[0].id
  );
  const [workspace, setWorkspace] = useState<ProjectWorkspaceState>(() =>
    getOrInitWorkspace(STARTER_PROJECTS[0].id)
  );
  const [selectedFileName, setSelectedFileName] = useState<string>(
    () => getOrInitWorkspace(STARTER_PROJECTS[0].id).workingDirectory[0]?.name || ''
  );

  const [terminalLines, setTerminalLines] = useState<GitTerminalLine[]>(() =>
    getInitialTerminalLines(getOrInitWorkspace(STARTER_PROJECTS[0].id))
  );
  const [terminalInput, setTerminalInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastExecution, setLastExecution] = useState<{
    lastCommand: string;
    exitCode: 0 | 1 | null;
    stderrSummary?: string;
  }>({ lastCommand: '', exitCode: null });

  const [mobileTab, setMobileTab] = useState<'files' | 'terminal'>('files');
  const [showTickets, setShowTickets] = useState(true);

  const outputScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputScrollRef.current) {
      outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const activeBlueprint =
    STARTER_PROJECTS.find((p) => p.id === selectedProjectId) || STARTER_PROJECTS[0];

  const handleSelectProject = (projectId: string) => {
    const loaded = getOrInitWorkspace(projectId);
    setSelectedProjectId(projectId);
    setWorkspace(loaded);
    setSelectedFileName(loaded.workingDirectory[0]?.name || '');
    setTerminalLines(getInitialTerminalLines(loaded));
    setTerminalInput('');
    setLastExecution({ lastCommand: '', exitCode: null });
  };

  const handleResetProject = () => {
    const fresh = resetWorkspace(selectedProjectId);
    setWorkspace(fresh);
    setSelectedFileName(fresh.workingDirectory[0]?.name || '');
    setTerminalLines([
      ...getInitialTerminalLines(fresh),
      { type: 'success', text: `Reset "${fresh.repoName}" back to starter snapshot.` },
    ]);
    setLastExecution({ lastCommand: '', exitCode: null });
  };

  const handleSimulateTeammatePush = () => {
    const { workspace: nextWs, newCommit } = simulateTeammatePush(workspace);
    setWorkspace(nextWs);
    setTerminalLines((prev) => [
      ...prev,
      {
        type: 'success',
        text: `remote: Teammate pushed [${newCommit.id}] "${newCommit.message}" to origin/main.`,
      },
      {
        type: 'output',
        text: 'hint: Run "git fetch" or "git pull" to pull remote work, or try "git push" to observe rejection.',
      },
    ]);
  };

  const handleUpdateFileContent = (fileName: string, content: string) => {
    const updated = updateFileContent(workspace, fileName, content);
    setWorkspace(updated);
  };

  const handleCreateFile = (fileName: string) => {
    const res = createNewFile(workspace, fileName);
    if (!res.error) {
      setWorkspace(res.workspace);
    }
    return { error: res.error };
  };

  const handleInsertSuggestedCommand = (cmd: string) => {
    setTerminalInput(cmd);
    setMobileTab('terminal');
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const handleTerminalSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = terminalInput.trim();
    if (!trimmed) return;

    setCommandHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);

    if (trimmed === 'clear') {
      setTerminalLines([]);
      setTerminalInput('');
      return;
    }

    const result = executeRealisticGitCommand(trimmed, workspace);
    setWorkspace(result.workspace);
    setTerminalLines((prev) => [
      ...prev,
      { type: 'input', text: trimmed },
      ...result.lines,
    ]);
    setLastExecution({
      lastCommand: result.lastCommand,
      exitCode: result.exitCode,
      stderrSummary: result.stderrSummary,
    });
    setTerminalInput('');
  };

  const handleTerminalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setTerminalInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setTerminalInput(commandHistory[nextIdx]);
      } else {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  const { ahead, behind, remoteRef } = getAheadBehindCounts(
    workspace,
    workspace.currentBranch
  );

  const completedTicketsCount = activeBlueprint.tickets.filter((t) =>
    t.checkCompleted(workspace)
  ).length;

  const localBranchCommits = workspace.commits.filter(
    (c) => c.branch === workspace.currentBranch
  );
  const remoteBranchCommits = workspace.remoteCommits.filter(
    (c) => c.branch === workspace.currentBranch
  );

  const quickCommands = [
    'git status',
    'git diff',
    'git add .',
    'git commit -m "Update project"',
    'git fetch',
    'git pull',
    'git push',
  ];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-5 pb-6">
      {/* Studio Top Bar & Project Selector */}
      <div className="editorial-card p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D9541E] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#FAF7F0] shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111]">
                  Project Studio
                </h1>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#E6DFD1] border border-[#111111] text-[#111111]">
                  Persistent Multi-File Workspaces
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#524E48] mt-0.5">
                Edit real multi-file starter projects, test genuine diffs &amp; merge conflicts, and sync with GitHub{' '}
                <code className="font-mono font-bold text-[#111111]">origin</code>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSimulateTeammatePush}
              className="editorial-btn-secondary px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-[#D9541E]" />
              <span>Simulate Teammate Push</span>
            </button>
            <button
              type="button"
              onClick={handleResetProject}
              className="editorial-btn-secondary px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Project</span>
            </button>
          </div>
        </div>

        {/* 3 Starter Repository Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STARTER_PROJECTS.map((proj) => {
            const wsSnapshot =
              proj.id === selectedProjectId ? workspace : getOrInitWorkspace(proj.id);
            const isSelected = proj.id === selectedProjectId;
            const doneCount = proj.tickets.filter((t) =>
              t.checkCompleted(wsSnapshot)
            ).length;
            const sync = getAheadBehindCounts(wsSnapshot, wsSnapshot.currentBranch);

            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => handleSelectProject(proj.id)}
                className={`p-3.5 rounded-lg border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#FAF7F0] border-[#111111] shadow-[4px_4px_0px_#D9541E]'
                    : 'bg-[#F3EEE3] border-[#111111] hover:bg-[#FAF7F0]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-extrabold text-[#111111] truncate">
                      {proj.repoName}
                    </div>
                    <div className="text-xs font-bold text-[#524E48] mt-0.5">
                      {proj.title}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-[#111111] shrink-0 ${
                      isSelected
                        ? 'bg-[#D9541E] text-[#FAF7F0]'
                        : 'bg-[#E6DFD1] text-[#111111]'
                    }`}
                  >
                    {proj.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#111111]/15 font-mono text-[10px] text-[#524E48]">
                  <span>{proj.techStack}</span>
                  <div className="flex items-center gap-2 font-bold text-[#111111]">
                    {sync.behind > 0 && (
                      <span className="text-[#D9541E]">
                        {sync.behind} behind
                      </span>
                    )}
                    {sync.ahead > 0 && (
                      <span className="text-[#1E6F50]">
                        {sync.ahead} ahead
                      </span>
                    )}
                    <span>
                      {doneCount}/{proj.tickets.length} tickets
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guided Project Tickets Strip */}
      <div className="editorial-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111]">
              Project Tickets ({completedTicketsCount}/{activeBlueprint.tickets.length})
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-[#524E48]">
              &middot; Click any ticket command to load it into the terminal
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTickets((prev) => !prev)}
            className="font-mono text-[11px] font-bold text-[#D9541E] hover:underline cursor-pointer"
          >
            {showTickets ? 'Hide Tickets' : 'Show Tickets'}
          </button>
        </div>

        {showTickets && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {activeBlueprint.tickets.map((ticket) => {
              const done = ticket.checkCompleted(workspace);
              return (
                <div
                  key={ticket.id}
                  className={`p-3 rounded-lg border-2 flex flex-col justify-between gap-2 ${
                    done
                      ? 'bg-[#E6DFD1]/70 border-[#111111]'
                      : 'bg-[#F3EEE3] border-[#111111]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E6F50] shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#524E48] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#111111] leading-snug">
                        {ticket.title}
                      </div>
                      <p className="text-[11px] text-[#524E48] leading-snug mt-1">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleInsertSuggestedCommand(ticket.suggestedCommand)
                    }
                    className="w-full text-left px-2 py-1 rounded bg-[#FAF7F0] hover:bg-[#E6DFD1] border border-[#111111]/40 font-mono text-[10px] font-bold text-[#D9541E] truncate cursor-pointer"
                    title={`Insert: ${ticket.suggestedCommand}`}
                  >
                    $ {ticket.suggestedCommand}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Workspace Switcher (< lg) */}
      <div className="lg:hidden grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab('files')}
          className={`py-2.5 px-3 rounded-lg border-2 border-[#111111] font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'files'
              ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]'
              : 'bg-[#FAF7F0] text-[#111111]'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Files &amp; Code</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('terminal')}
          className={`py-2.5 px-3 rounded-lg border-2 border-[#111111] font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
            mobileTab === 'terminal'
              ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]'
              : 'bg-[#FAF7F0] text-[#111111]'
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
          <span>Terminal &amp; Repo</span>
        </button>
      </div>

      {/* Main Split Workspace: Code Editor + Realistic Terminal & Dual Local/Origin Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Multi-File Explorer + Code Editor */}
        <div
          className={`lg:col-span-6 ${
            mobileTab === 'files' ? 'block' : 'hidden lg:block'
          }`}
        >
          <FileEditorPanel
            workingDirectory={workspace.workingDirectory}
            selectedFileName={selectedFileName}
            onSelectFile={setSelectedFileName}
            onUpdateFileContent={handleUpdateFileContent}
            onCreateFile={handleCreateFile}
          />
        </div>

        {/* Right: Realistic Terminal + Local/Origin State Visualizer */}
        <div
          className={`lg:col-span-6 flex flex-col gap-5 ${
            mobileTab === 'terminal' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Realistic Terminal Shell with Corner Animated Robot Helper */}
          <div
            className="editorial-terminal-shell flex flex-col overflow-visible"
            id="terminal-container"
          >
            {/* Terminal Top Bar */}
            <div className="px-4 py-2.5 border-b border-[#F3EEE3]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#F3EEE3] min-w-0">
                <TerminalIcon className="w-4 h-4 text-[#D9541E] shrink-0" />
                <span className="truncate">
                  {workspace.repoName} ({workspace.currentBranch})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {remoteRef && (
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-[#222222] border border-[#F3EEE3]/25 text-[#F3EEE3]">
                    {ahead > 0 && (
                      <span className="text-[#6EE7B7] inline-flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        {ahead}
                      </span>
                    )}
                    {behind > 0 && (
                      <span className="text-[#D9541E] inline-flex items-center gap-0.5">
                        <ArrowDown className="w-3 h-3" />
                        {behind}
                      </span>
                    )}
                    {ahead === 0 && behind === 0 && <span>synced</span>}
                  </span>
                )}

                <AnimatedRobotHelper
                  lastCommand={lastExecution.lastCommand}
                  lastExitCode={lastExecution.exitCode}
                  stderrSummary={lastExecution.stderrSummary}
                  onInsertCommand={handleInsertSuggestedCommand}
                />
              </div>
            </div>

            {/* Scrollable Terminal History */}
            <div
              ref={outputScrollRef}
              onClick={() => inputRef.current?.focus()}
              className="p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed flex flex-col gap-1.5 bg-[#111111] cursor-text"
            >
              {terminalLines.map((line, idx) => {
                if (line.type === 'input') {
                  return (
                    <div key={idx} className="flex items-start gap-2 pt-1">
                      <span className="text-[#D9541E] font-bold shrink-0">
                        $
                      </span>
                      <span className="text-[#F3EEE3] font-bold break-all">
                        {line.text}
                      </span>
                    </div>
                  );
                }

                let colorClass = 'text-[#F3EEE3]/80';
                if (line.type === 'error') colorClass = 'text-[#D9541E] font-bold';
                if (line.type === 'success') colorClass = 'text-[#6EE7B7] font-bold';
                if (line.type === 'diff-add')
                  colorClass = 'text-[#6EE7B7] bg-[#1E6F50]/25 px-1.5 rounded';
                if (line.type === 'diff-del')
                  colorClass = 'text-[#D9541E] bg-[#D9541E]/15 px-1.5 rounded';
                if (line.type === 'diff-meta')
                  colorClass = 'text-[#F3EEE3] font-bold opacity-85';

                return (
                  <pre
                    key={idx}
                    className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed ${colorClass}`}
                  >
                    {line.text}
                  </pre>
                );
              })}
            </div>

            {/* Quick Commands Bar */}
            <div className="px-3 py-2 bg-[#111111] border-t border-[#F3EEE3]/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickCommands.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => {
                    setTerminalInput(cmd);
                    inputRef.current?.focus();
                  }}
                  className="bg-[#222222] text-[#F3EEE3] border border-[#F3EEE3]/25 px-2 py-1 rounded font-mono text-[10px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Prompt Input */}
            <form
              onSubmit={handleTerminalSubmit}
              className="px-4 py-2.5 bg-[#111111] border-t border-[#F3EEE3]/20 flex items-center gap-2 rounded-b-[8px]"
            >
              <span className="font-mono text-xs font-bold text-[#D9541E] shrink-0 whitespace-nowrap">
                cadet@studio:~/{workspace.repoName}$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                placeholder="Type a git command..."
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-[#F3EEE3] caret-[#D9541E] font-mono text-xs focus:outline-none min-w-0"
              />
            </form>
          </div>

          {/* Local Working Tree & GitHub origin Sync Visualizer */}
          <div className="editorial-card p-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#D9541E]" />
                <h2 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                  Local &harr; GitHub origin State
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#E6DFD1] border border-[#111111] font-bold text-[#111111]">
                  {workspace.currentBranch}
                </span>
                {remoteRef ? (
                  <span className="px-2 py-0.5 rounded bg-[#1E6F50] border border-[#111111] font-bold text-[#FAF7F0]">
                    {remoteRef}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#111111] font-bold text-[#524E48]">
                    no upstream
                  </span>
                )}
              </div>
            </div>

            {/* Working Directory Status Rows */}
            <div className="bg-[#F3EEE3] rounded-lg p-3 border-2 border-[#111111] flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-[#524E48]">
                <span>Working Directory</span>
                <span>{workspace.workingDirectory.length} files</span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {workspace.workingDirectory.map((file) => {
                  const pill = getStatusPillProps(file.status);
                  return (
                    <button
                      key={file.name}
                      type="button"
                      onClick={() => {
                        setSelectedFileName(file.name);
                        setMobileTab('files');
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-[#FAF7F0] hover:bg-[#E6DFD1] border border-[#111111] flex items-center justify-between gap-2 text-left cursor-pointer"
                    >
                      <span className="font-mono text-xs font-bold text-[#111111] truncate min-w-0 flex-1">
                        {file.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#111111] shrink-0 whitespace-nowrap ${pill.className}`}
                      >
                        {pill.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dual Local vs Remote Origin Commit Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Local Branch History */}
              <div className="bg-[#F3EEE3] rounded-lg p-3 border-2 border-[#111111] flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111]">
                  <span className="flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-[#D9541E]" />
                    <span>Local ({workspace.currentBranch})</span>
                  </span>
                  <span className="text-[#524E48]">{localBranchCommits.length}</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {localBranchCommits.length === 0 ? (
                    <div className="font-mono text-[11px] italic text-[#524E48] py-2">
                      No commits on {workspace.currentBranch} yet.
                    </div>
                  ) : (
                    [...localBranchCommits].reverse().map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded bg-[#FAF7F0] border border-[#111111] flex flex-col gap-0.5"
                      >
                        <span className="font-mono text-[10px] font-bold text-[#D9541E]">
                          {c.id}
                        </span>
                        <span className="text-[11px] font-bold text-[#111111] leading-snug">
                          {c.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Remote Origin History */}
              <div className="bg-[#F3EEE3] rounded-lg p-3 border-2 border-[#111111] flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111]">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#1E6F50]" />
                    <span>GitHub origin/{workspace.currentBranch}</span>
                  </span>
                  <span className="text-[#524E48]">{remoteBranchCommits.length}</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                  {remoteBranchCommits.length === 0 ? (
                    <div className="font-mono text-[11px] italic text-[#524E48] py-2">
                      Not pushed to origin yet. Run{' '}
                      <code className="font-bold text-[#111111]">
                        git push -u origin {workspace.currentBranch}
                      </code>
                    </div>
                  ) : (
                    [...remoteBranchCommits].reverse().map((c) => {
                      const isMissingLocally = !localBranchCommits.some(
                        (lc) => lc.id === c.id
                      );
                      return (
                        <div
                          key={c.id}
                          className={`p-2 rounded border flex flex-col gap-0.5 ${
                            isMissingLocally
                              ? 'bg-[#E6DFD1] border-[#D9541E]'
                              : 'bg-[#FAF7F0] border-[#111111]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold">
                            <span className="text-[#1E6F50]">{c.id}</span>
                            {isMissingLocally && (
                              <span className="text-[#D9541E]">incoming</span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#111111] leading-snug">
                            {c.message}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
