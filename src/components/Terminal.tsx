import React, { useState, useRef, useEffect } from 'react';
import { RepoState, VirtualFile, Commit } from '../types';
import { executeAdvancedGitCommand } from '../utils/advancedGitCommands';
import { Play, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';

function highlightCommand(text: string) {
  if (!text) return <span></span>;

  let displayPref = '';
  let commandText = text;
  if (text.startsWith('guest@gitmaster:~$ ')) {
    displayPref = 'guest@gitmaster:~$ ';
    commandText = text.substring('guest@gitmaster:~$ '.length);
  }

  const regex = /("[^"]*"|'[^']*'|[^\s"']+|[\s]+)/g;
  const tokens = commandText.match(regex) || [commandText];

  return (
    <span className="font-mono">
      {displayPref && <span className="text-[#D9541E] font-bold mr-2">{displayPref}</span>}
      {tokens.map((token, i) => {
        const trimmed = token.trim();
        if (!trimmed) {
          return <span key={i}>{token}</span>;
        }

        if (trimmed === 'git') {
          return (
            <span key={i} className="text-[#F3EEE3] font-bold">
              {token}
            </span>
          );
        }

        const subcommands = [
          'init',
          'status',
          'add',
          'commit',
          'branch',
          'checkout',
          'switch',
          'merge',
          'log',
          'restore',
          'stash',
          'clone',
          'diff',
          'revert',
          'reset',
          'rebase',
          'cherry-pick',
          'reflog',
          'tag',
          'fetch',
          'pull',
          'push',
          'help',
          'clear',
        ];
        if (subcommands.includes(trimmed)) {
          return (
            <span key={i} className="text-[#D9541E] font-bold">
              {token}
            </span>
          );
        }

        if (trimmed.startsWith('-')) {
          return (
            <span key={i} className="text-[#E6DFD1] underline decoration-[#D9541E]">
              {token}
            </span>
          );
        }

        if (
          (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
          return (
            <span key={i} className="text-[#FAF7F0] italic">
              {token}
            </span>
          );
        }

        if (trimmed.includes('.') || trimmed === 'recipe.txt' || trimmed === 'readme.md') {
          return (
            <span key={i} className="text-[#6EE7B7] font-semibold">
              {token}
            </span>
          );
        }

        return (
          <span key={i} className="text-[#F3EEE3]">
            {token}
          </span>
        );
      })}
    </span>
  );
}

interface TerminalProps {
  repoState: RepoState;
  setRepoState: React.Dispatch<React.SetStateAction<RepoState>>;
  onCommandExecuted?: (cmd: string, state: RepoState) => void;
  targetCommands?: string[];
  currentCommandIndex?: number;
  hints?: string[];
  quickCommands?: string[];
}

export default function Terminal({
  repoState,
  setRepoState,
  onCommandExecuted,
  targetCommands = [],
  currentCommandIndex = 0,
  hints = [],
  quickCommands,
}: TerminalProps) {
  const [history, setHistory] = useState<
    { type: 'input' | 'output' | 'error' | 'success'; text: string }[]
  >([
    { type: 'output', text: 'GitMaster Terminal Simulator' },
    { type: 'output', text: 'Type "git" or "help" to list available commands.' },
    { type: 'output', text: '' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const updatedCmdHistory = [trimmed, ...commandHistory];
    setCommandHistory(updatedCmdHistory);
    setHistoryPointer(-1);

    setHistory((prev) => [
      ...prev,
      { type: 'input', text: `guest@gitmaster:~$ ${trimmed}` },
    ]);

    const args = trimmed.split(/\s+/);
    const primary = args[0];

    if (primary === 'clear') {
      setHistory([]);
      setInputValue('');
      return;
    }

    if (primary === 'help') {
      setHistory((prev) => [
        ...prev,
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  git init              - Initialize a new repository' },
        {
          type: 'output',
          text: '  git status            - Check working directory & staging area status',
        },
        {
          type: 'output',
          text: '  git add <file>        - Stage a file (use "." to stage all files)',
        },
        { type: 'output', text: '  git commit -m "msg"   - Save your staged changes' },
        { type: 'output', text: '  git log               - View commit history timeline' },
        { type: 'output', text: '  git branch <name>     - Create/list branches' },
        {
          type: 'output',
          text: '  git checkout <name>   - Switch branches (use "-b" to create & switch)',
        },
        {
          type: 'output',
          text: '  git restore <file>    - Discard changes in a local file',
        },
        { type: 'output', text: '  git stash             - Shelf current work' },
        { type: 'output', text: '  git stash pop         - Retrieve shelved work' },
        { type: 'output', text: '  git clone <url>       - Clone a remote repository' },
        { type: 'output', text: '  git diff [--staged]   - Compare unstaged or staged line changes' },
        { type: 'output', text: '  git revert <sha>      - Safely undo a commit with an inverse commit' },
        { type: 'output', text: '  git reset <mode> ref  - Move HEAD (--soft, --mixed, --hard)' },
        { type: 'output', text: '  git rebase <branch>   - Replay branch commits onto target branch' },
        { type: 'output', text: '  git cherry-pick <sha> - Apply a single commit onto current branch' },
        { type: 'output', text: '  git reflog            - Inspect HEAD movement history' },
        { type: 'output', text: '  git fetch / git pull  - Check or merge remote origin updates' },
        { type: 'output', text: '  git push -u origin br - Publish branch & set upstream tracking' },
        { type: 'output', text: '  git tag -a v1 -m "m"  - Create an annotated release tag' },
        { type: 'output', text: '  clear                 - Clear terminal output' },
      ]);
      setInputValue('');
      return;
    }

    if (primary !== 'git') {
      if (
        primary === 'gitinit' ||
        primary === 'gitstatus' ||
        primary === 'gitadd' ||
        primary === 'gitcommit'
      ) {
        setHistory((prev) => [
          ...prev,
          {
            type: 'error',
            text: `Command not found: "${primary}". Did you forget a space after "git"?`,
          },
        ]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            type: 'error',
            text: `Command not found: "${primary}". Type "help" for a list of commands.`,
          },
        ]);
      }
      setInputValue('');
      return;
    }

    if (args.length < 2) {
      setHistory((prev) => [
        ...prev,
        { type: 'output', text: 'Git - Distributed Version Control System' },
        { type: 'output', text: 'Usage: git <command> [<args>]' },
        { type: 'output', text: 'Try "help" for a list of valid commands in this academy.' },
      ]);
      setInputValue('');
      onCommandExecuted?.(trimmed, repoState);
      return;
    }

    const subCommand = args[1];

    if (subCommand !== 'init' && subCommand !== 'clone' && !repoState.isInitialized) {
      setHistory((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'fatal: not a git repository (or any of the parent directories): .git',
        },
        {
          type: 'output',
          text: 'Hint: Run "git init" first to establish a local workspace repository.',
        },
      ]);
      setInputValue('');
      return;
    }

    let updatedState = { ...repoState };
    let outputLines: { type: 'output' | 'error' | 'success'; text: string }[] = [];

    switch (subCommand) {
      case 'init': {
        if (updatedState.isInitialized) {
          outputLines.push({
            type: 'output',
            text: 'Reinitialized existing Git repository in /workspace/.git/',
          });
        } else {
          updatedState.isInitialized = true;
          updatedState.branches = ['main'];
          updatedState.currentBranch = 'main';
          updatedState.workingDirectory = [...updatedState.workingDirectory];
          outputLines.push({
            type: 'success',
            text: 'Initialized empty Git repository in /workspace/.git/',
          });
        }
        break;
      }

      case 'status': {
        outputLines.push({ type: 'output', text: `On branch ${updatedState.currentBranch}` });

        const untracked = updatedState.workingDirectory.filter(
          (f) => f.status === 'untracked'
        );
        const modified = updatedState.workingDirectory.filter(
          (f) => f.status === 'modified'
        );
        const staged = updatedState.workingDirectory.filter((f) => f.status === 'staged');

        if (staged.length > 0) {
          outputLines.push({ type: 'success', text: 'Changes to be committed:' });
          outputLines.push({
            type: 'success',
            text: '  (use "git restore --staged <file>..." to unstage)',
          });
          staged.forEach((f) => {
            outputLines.push({ type: 'success', text: `\tnew file:   ${f.name}` });
          });
          outputLines.push({ type: 'output', text: '' });
        }

        if (modified.length > 0) {
          outputLines.push({ type: 'error', text: 'Changes not staged for commit:' });
          outputLines.push({
            type: 'error',
            text: '  (use "git add <file>..." to update what will be committed)',
          });
          outputLines.push({
            type: 'error',
            text: '  (use "git restore <file>..." to discard changes in working directory)',
          });
          modified.forEach((f) => {
            outputLines.push({ type: 'error', text: `\tmodified:   ${f.name}` });
          });
          outputLines.push({ type: 'output', text: '' });
        }

        if (untracked.length > 0) {
          outputLines.push({ type: 'error', text: 'Untracked files:' });
          outputLines.push({
            type: 'error',
            text: '  (use "git add <file>..." to include in what will be committed)',
          });
          untracked.forEach((f) => {
            outputLines.push({ type: 'error', text: `\t${f.name}` });
          });
          outputLines.push({ type: 'output', text: '' });
        }

        if (untracked.length === 0 && modified.length === 0 && staged.length === 0) {
          outputLines.push({
            type: 'output',
            text: 'nothing to commit, working tree clean',
          });
        }
        break;
      }

      case 'add': {
        if (args.length < 3) {
          outputLines.push({ type: 'error', text: 'Nothing specified, nothing added.' });
          outputLines.push({
            type: 'output',
            text: 'Maybe you wanted to say "git add ."?',
          });
          break;
        }

        const target = args[2];
        if (target === '.') {
          let count = 0;
          updatedState.workingDirectory = updatedState.workingDirectory.map((file) => {
            if (file.status === 'untracked' || file.status === 'modified') {
              count++;
              return { ...file, status: 'staged' };
            }
            return file;
          });
          updatedState.stagingArea = updatedState.workingDirectory
            .filter((f) => f.status === 'staged')
            .map((f) => f.name);

          outputLines.push({
            type: 'output',
            text: `Staged ${count} file(s) successfully.`,
          });
        } else {
          const fileIndex = updatedState.workingDirectory.findIndex(
            (f) => f.name === target
          );
          if (fileIndex === -1) {
            outputLines.push({
              type: 'error',
              text: `fatal: pathspec '${target}' did not match any files`,
            });
          } else {
            updatedState.workingDirectory[fileIndex].status = 'staged';
            updatedState.stagingArea = [...new Set([...updatedState.stagingArea, target])];
            outputLines.push({
              type: 'output',
              text: `Staged '${target}' successfully.`,
            });
          }
        }
        break;
      }

      case 'commit': {
        const fullText = args.slice(2).join(' ');
        const match = fullText.match(/-m\s+["']([^"']+)["']/);

        if (!match) {
          outputLines.push({
            type: 'error',
            text: "error: switch `m' requires a value",
          });
          outputLines.push({
            type: 'output',
            text: 'Usage: git commit -m "your descriptive snapshot message"',
          });
          break;
        }

        const message = match[1];
        const stagedFiles = updatedState.workingDirectory.filter(
          (f) => f.status === 'staged'
        );

        if (stagedFiles.length === 0) {
          outputLines.push({
            type: 'output',
            text: 'On branch ' + updatedState.currentBranch,
          });
          outputLines.push({
            type: 'output',
            text: 'nothing to commit, working tree clean',
          });
          break;
        }

        const hex = '0123456789abcdef';
        let sha = '';
        for (let i = 0; i < 7; i++) {
          sha += hex[Math.floor(Math.random() * 16)];
        }

        const commitFiles: { [filename: string]: string } = {};
        stagedFiles.forEach((f) => {
          commitFiles[f.name] = f.content;
        });

        const branchCommits = updatedState.commits.filter(
          (c) => c.branch === updatedState.currentBranch
        );
        const parentIds =
          branchCommits.length > 0 ? [branchCommits[branchCommits.length - 1].id] : [];

        const newCommit: Commit = {
          id: sha,
          parentIds,
          message,
          files: commitFiles,
          branch: updatedState.currentBranch,
        };

        updatedState.workingDirectory = updatedState.workingDirectory.map((f) => {
          if (f.status === 'staged') {
            return { ...f, status: 'committed' };
          }
          return f;
        });

        updatedState.stagingArea = [];
        updatedState.commits = [...updatedState.commits, newCommit];

        outputLines.push({
          type: 'success',
          text: `[${updatedState.currentBranch} ${sha}] ${message}`,
        });
        outputLines.push({
          type: 'output',
          text: ` ${stagedFiles.length} file(s) changed, ${stagedFiles.length} insertions(+)`,
        });
        break;
      }

      case 'log': {
        const branchCommits = [...updatedState.commits]
          .filter((c) => c.branch === updatedState.currentBranch)
          .reverse();

        if (branchCommits.length === 0) {
          outputLines.push({
            type: 'output',
            text: 'No commits yet. Run "git commit" to save a snapshot!',
          });
        } else {
          branchCommits.forEach((c) => {
            outputLines.push({
              type: 'success',
              text: `commit ${c.id} (HEAD -> ${updatedState.currentBranch})`,
            });
            outputLines.push({
              type: 'output',
              text: `Author: GitMaster Cadet <cadet@gitmaster.academy>`,
            });
            outputLines.push({
              type: 'output',
              text: `Date:   ${new Date().toLocaleDateString()} (Virtual)`,
            });
            outputLines.push({ type: 'output', text: `\n    ${c.message}\n` });
          });
        }
        break;
      }

      case 'branch': {
        if (args.length < 3) {
          updatedState.branches.forEach((b) => {
            if (b === updatedState.currentBranch) {
              outputLines.push({ type: 'success', text: `* ${b}` });
            } else {
              outputLines.push({ type: 'output', text: `  ${b}` });
            }
          });
        } else {
          const newBranch = args[2];
          if (updatedState.branches.includes(newBranch)) {
            outputLines.push({
              type: 'error',
              text: `fatal: A branch named '${newBranch}' already exists.`,
            });
          } else {
            updatedState.branches = [...updatedState.branches, newBranch];
            outputLines.push({
              type: 'success',
              text: `Created branch '${newBranch}' successfully.`,
            });
          }
        }
        break;
      }

      case 'checkout':
      case 'switch': {
        if (args.length < 3) {
          outputLines.push({ type: 'error', text: 'fatal: Branch name required.' });
          break;
        }

        let targetBranch = args[2];
        let createNew = false;

        if (targetBranch === '-b') {
          if (args.length < 4) {
            outputLines.push({
              type: 'error',
              text: 'fatal: Branch name required for "-b" creation.',
            });
            break;
          }
          targetBranch = args[3];
          createNew = true;
        }

        if (createNew) {
          if (updatedState.branches.includes(targetBranch)) {
            outputLines.push({
              type: 'error',
              text: `fatal: A branch named '${targetBranch}' already exists.`,
            });
          } else {
            updatedState.branches = [...updatedState.branches, targetBranch];
            updatedState.currentBranch = targetBranch;
            outputLines.push({
              type: 'success',
              text: `Switched to a new branch '${targetBranch}'`,
            });
          }
        } else {
          if (!updatedState.branches.includes(targetBranch)) {
            outputLines.push({
              type: 'error',
              text: `error: pathspec '${targetBranch}' did not match any file(s) known to git`,
            });
            outputLines.push({
              type: 'output',
              text: `Hint: Use "git branch ${targetBranch}" to create it first.`,
            });
          } else {
            updatedState.currentBranch = targetBranch;
            outputLines.push({
              type: 'success',
              text: `Switched to branch '${targetBranch}'`,
            });
          }
        }
        break;
      }

      case 'merge': {
        if (args.length < 3) {
          outputLines.push({ type: 'error', text: 'fatal: Branch name required to merge.' });
          break;
        }
        const sourceBranch = args[2];
        if (!updatedState.branches.includes(sourceBranch)) {
          outputLines.push({
            type: 'error',
            text: `merge: ${sourceBranch} - not something we can merge`,
          });
          break;
        }
        const sourceCommits = updatedState.commits.filter(
          (c) => c.branch === sourceBranch
        );
        if (sourceCommits.length === 0) {
          outputLines.push({ type: 'output', text: 'Already up to date.' });
        } else {
          const mergedCopies = sourceCommits.map((c) => ({
            ...c,
            branch: updatedState.currentBranch,
          }));
          updatedState.commits = [...updatedState.commits, ...mergedCopies];
          outputLines.push({
            type: 'success',
            text: `Fast-forward merge from '${sourceBranch}' into '${updatedState.currentBranch}' complete.`,
          });
        }
        break;
      }

      case 'restore': {
        if (args.length < 3) {
          outputLines.push({ type: 'error', text: 'fatal: pathspec is required' });
          break;
        }

        const file = args[2];
        const fileIndex = updatedState.workingDirectory.findIndex((f) => f.name === file);

        if (fileIndex === -1) {
          outputLines.push({
            type: 'error',
            text: `error: pathspec '${file}' did not match any file`,
          });
        } else {
          const currentFileInCommit = updatedState.commits
            .filter((c) => c.branch === updatedState.currentBranch)
            .reverse()
            .find((c) => c.files[file] !== undefined);

          if (currentFileInCommit) {
            updatedState.workingDirectory[fileIndex] = {
              name: file,
              content: currentFileInCommit.files[file],
              status: 'committed',
            };
            outputLines.push({
              type: 'success',
              text: `Discarded modifications in '${file}' and restored from commit.`,
            });
          } else {
            updatedState.workingDirectory = updatedState.workingDirectory.filter(
              (f) => f.name !== file
            );
            outputLines.push({
              type: 'success',
              text: `Discarded untracked changes for '${file}'.`,
            });
          }
        }
        break;
      }

      case 'stash': {
        if (args.length > 2 && args[2] === 'pop') {
          const lastStashedFiles = localStorage.getItem('git_stash_temp');
          if (!lastStashedFiles) {
            outputLines.push({ type: 'error', text: 'No stash entries found.' });
          } else {
            const files: VirtualFile[] = JSON.parse(lastStashedFiles);
            files.forEach((sf) => {
              const idx = updatedState.workingDirectory.findIndex(
                (f) => f.name === sf.name
              );
              if (idx > -1) {
                updatedState.workingDirectory[idx] = { ...sf, status: 'modified' };
              } else {
                updatedState.workingDirectory.push({ ...sf, status: 'modified' });
              }
            });
            localStorage.removeItem('git_stash_temp');
            outputLines.push({
              type: 'success',
              text: 'On branch ' + updatedState.currentBranch,
            });
            outputLines.push({
              type: 'success',
              text: 'Dropped refs/stash@{0} (a8c3d91)',
            });
          }
        } else {
          const modifiedFiles = updatedState.workingDirectory.filter(
            (f) => f.status === 'modified' || f.status === 'staged'
          );
          if (modifiedFiles.length === 0) {
            outputLines.push({ type: 'output', text: 'No local changes to save.' });
          } else {
            localStorage.setItem('git_stash_temp', JSON.stringify(modifiedFiles));
            updatedState.workingDirectory = updatedState.workingDirectory.filter(
              (f) => f.status !== 'modified' && f.status !== 'staged'
            );
            updatedState.stagingArea = [];
            outputLines.push({
              type: 'success',
              text: 'Saved working directory and index state WIP on main: a8c3d91 WIP',
            });
          }
        }
        break;
      }

      case 'clone': {
        if (args.length < 3) {
          outputLines.push({
            type: 'error',
            text: 'fatal: You must specify a repository to clone.',
          });
          break;
        }
        const url = args[2];
        updatedState.isInitialized = true;
        updatedState.branches = ['main'];
        updatedState.currentBranch = 'main';
        updatedState.workingDirectory = [
          {
            name: 'readme.md',
            content: '# Fresh Bakery Project\nDelicious drafts.',
            status: 'committed',
          },
          { name: 'recipe.txt', content: 'Secret flour blend.', status: 'committed' },
        ];
        updatedState.commits = [
          {
            id: 'b3d2f1e',
            parentIds: [],
            message: 'Initial remote setup',
            files: { 'readme.md': '# Fresh Bakery Project\nDelicious drafts.' },
            branch: 'main',
          },
        ];
        outputLines.push({ type: 'output', text: `Cloning into 'perfect-bread'...` });
        outputLines.push({ type: 'output', text: `remote: Enumerating objects: 5, done.` });
        outputLines.push({
          type: 'output',
          text: `remote: Counting objects: 100% (5/5), done.`,
        });
        outputLines.push({
          type: 'output',
          text: `remote: Total 5 (delta 0), reused 3 (delta 0), pack-reused 0`,
        });
        outputLines.push({ type: 'success', text: `Cloned successfully from: ${url}` });
        break;
      }

      default: {
        const advResult = executeAdvancedGitCommand(subCommand, args, updatedState);
        if (advResult.handled) {
          updatedState = advResult.updatedState;
          outputLines.push(...advResult.outputLines);
        } else {
          outputLines.push({
            type: 'error',
            text: `git: "${subCommand}" is not a recognized GitMaster command.`,
          });
          outputLines.push({
            type: 'output',
            text: 'Type "help" for a list of valid commands.',
          });
        }
        break;
      }
    }

    setRepoState(updatedState);
    setHistory((prev) => [...prev, ...outputLines, { type: 'output', text: '' }]);
    setInputValue('');

    onCommandExecuted?.(trimmed, updatedState);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyPointer < commandHistory.length - 1) {
        const nextPtr = historyPointer + 1;
        setHistoryPointer(nextPtr);
        setInputValue(commandHistory[nextPtr]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyPointer > 0) {
        const nextPtr = historyPointer - 1;
        setHistoryPointer(nextPtr);
        setInputValue(commandHistory[nextPtr]);
      } else if (historyPointer === 0) {
        setHistoryPointer(-1);
        setInputValue('');
      }
    }
  };

  const getTargetHint = () => {
    if (currentCommandIndex < targetCommands.length) {
      return `Target command: "${targetCommands[currentCommandIndex]}"`;
    }
    return '';
  };

  return (
    <div
      className="editorial-terminal-shell flex flex-col overflow-hidden h-[380px]"
      id="terminal-container"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#E6DFD1] border-b-2 border-[#111111] text-[#111111] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9541E] border border-[#111111]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FAF7F0] border border-[#111111]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E6F50] border border-[#111111]" />
          <span className="text-xs font-mono ml-2 font-extrabold text-[#111111] tracking-wider uppercase">
            Terminal Emulator
          </span>
        </div>
        <button
          onClick={() => {
            setHistory([
              { type: 'output', text: 'Terminal reset. Type "git" or "help" to start.' },
              { type: 'output', text: '' },
            ]);
          }}
          title="Reset Console"
          className="p-1.5 bg-[#FAF7F0] hover:bg-[#D9541E] hover:text-[#FAF7F0] border border-[#111111] rounded transition-colors text-[#111111] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inner Terminal Screen (#111111 Ink Black with #F3EEE3 Cream and #D9541E Burnt Orange) */}
      <div
        onClick={focusInput}
        className="flex-1 p-4 bg-[#111111] font-mono text-xs overflow-y-auto cursor-text text-[#F3EEE3] flex flex-col gap-1 select-text"
      >
        {history.map((log, idx) => {
          if (log.type === 'input') {
            return (
              <div key={idx} className="flex font-bold">
                {highlightCommand(log.text)}
              </div>
            );
          } else if (log.type === 'error') {
            return (
              <div key={idx} className="text-[#D9541E] leading-relaxed font-semibold">
                {log.text}
              </div>
            );
          } else if (log.type === 'success') {
            return (
              <div key={idx} className="text-[#6EE7B7] font-semibold leading-relaxed">
                {log.text}
              </div>
            );
          } else {
            return (
              <div key={idx} className="text-[#F3EEE3]/80 leading-relaxed whitespace-pre-wrap">
                {log.text}
              </div>
            );
          }
        })}

        {/* Mobile Horizontally Scrollable Quick-Command Pills */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-1.5 no-scrollbar shrink-0">
          {(
            quickCommands || [
              'git status',
              'git add .',
              'git commit -m ""',
              'git branch',
            ]
          ).map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputValue(cmd);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded bg-[#222222] hover:bg-[#D9541E] text-[#F3EEE3] border border-[#F3EEE3]/30 font-mono text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Active Input Line */}
        <div className="flex items-center text-[#D9541E] font-bold relative min-h-[1.5rem]">
          <span className="mr-2 shrink-0 select-none">guest@gitmaster:~$</span>
          <div className="flex-1 relative overflow-hidden flex items-center">
            <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none select-none flex items-center text-[#F3EEE3] overflow-hidden whitespace-pre">
              {highlightCommand(inputValue)}
            </div>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-none outline-none text-transparent font-mono caret-[#D9541E] focus:ring-0 p-0 relative z-10"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
        <div ref={terminalEndRef} />
      </div>

      {/* Helper Ribbon */}
      {targetCommands.length > 0 && (
        <div className="bg-[#FAF7F0] border-t-2 border-[#111111] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#111111]">
          <div className="flex items-center gap-2 text-[#1E6F50] font-mono font-bold">
            <Play className="w-3 h-3" />
            <span>{getTargetHint()}</span>
          </div>
          {hints.length > 0 && (
            <div className="flex items-center gap-1.5 text-[#524E48] font-sans">
              <HelpCircle className="w-3.5 h-3.5 text-[#D9541E]" />
              <span>Hint: {hints[currentCommandIndex] || hints[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
