import { Commit } from '../types';
import { ProjectFile, ProjectWorkspaceState } from '../data/starterProjects';
import {
  computeLineDiff,
  getCommittedFileContent,
  isIgnoredByGitignore,
  saveWorkspace,
} from './virtualFileSystem';
import { executeAdvancedGitCommand } from './advancedGitCommands';

export interface GitTerminalLine {
  type:
    | 'input'
    | 'output'
    | 'error'
    | 'success'
    | 'diff-add'
    | 'diff-del'
    | 'diff-meta';
  text: string;
}

export interface GitExecutionResult {
  workspace: ProjectWorkspaceState;
  lines: GitTerminalLine[];
  exitCode: 0 | 1;
  stderrSummary?: string;
  lastCommand: string;
}

function generateShortSha(): string {
  const hex = '0123456789abcdef';
  let sha = '';
  for (let i = 0; i < 7; i++) {
    sha += hex[Math.floor(Math.random() * 16)];
  }
  return sha;
}

export function getAheadBehindCounts(
  ws: ProjectWorkspaceState,
  branch: string
): { ahead: number; behind: number; remoteRef?: string } {
  const remoteRef = ws.upstreamMap[branch] || (ws.remoteBranches.includes(`origin/${branch}`) ? `origin/${branch}` : undefined);
  if (!remoteRef) {
    return { ahead: 0, behind: 0 };
  }
  const remoteBranchName = remoteRef.replace(/^origin\//, '');
  const localBranchCommits = ws.commits.filter((c) => c.branch === branch);
  const remoteBranchCommits = ws.remoteCommits.filter(
    (c) => c.branch === remoteBranchName
  );

  const localIds = new Set(localBranchCommits.map((c) => c.id));
  const remoteIds = new Set(remoteBranchCommits.map((c) => c.id));

  const ahead = localBranchCommits.filter((c) => !remoteIds.has(c.id)).length;
  const behind = remoteBranchCommits.filter((c) => !localIds.has(c.id)).length;
  return { ahead, behind, remoteRef };
}

export function simulateTeammatePush(
  ws: ProjectWorkspaceState
): { workspace: ProjectWorkspaceState; newCommit: Commit } {
  const remoteMainCommits = ws.remoteCommits.filter((c) => c.branch === 'main');
  const tip =
    remoteMainCommits.length > 0
      ? remoteMainCommits[remoteMainCommits.length - 1]
      : undefined;

  const targetFile =
    ws.workingDirectory.find((f) => f.name === 'README.md') ||
    ws.workingDirectory[0];
  const fileName = targetFile ? targetFile.name : 'TEAMMATE_NOTE.md';
  const baseContent =
    getCommittedFileContent(ws.remoteCommits, 'main', fileName) ||
    targetFile?.content ||
    '# Project Notes';

  const newSha = generateShortSha();
  const teammateMessages = [
    'Teammate: Improve documentation & usage notes',
    'Teammate: Add CI badge and contributor guide',
    'Teammate: Patch edge-case handling',
  ];
  const message =
    teammateMessages[remoteMainCommits.length % teammateMessages.length];

  const updatedContent = `${baseContent}\n\n<!-- Remote update (${newSha}): ${message} -->`;

  const newCommit: Commit = {
    id: newSha,
    parentIds: tip ? [tip.id] : [],
    message,
    files: { [fileName]: updatedContent },
    branch: 'main',
  };

  const nextRemoteBranches = ws.remoteBranches.includes('origin/main')
    ? ws.remoteBranches
    : [...ws.remoteBranches, 'origin/main'];

  const updated: ProjectWorkspaceState = {
    ...ws,
    remoteCommits: [...ws.remoteCommits, newCommit],
    remoteBranches: nextRemoteBranches,
  };
  saveWorkspace(updated);
  return { workspace: updated, newCommit };
}

function formatDiffLines(
  fileName: string,
  oldContent: string,
  newContent: string
): GitTerminalLine[] {
  const lines: GitTerminalLine[] = [
    { type: 'diff-meta', text: `diff --git a/${fileName} b/${fileName}` },
    { type: 'diff-meta', text: `--- a/${fileName}` },
    { type: 'diff-meta', text: `+++ b/${fileName}` },
    {
      type: 'diff-meta',
      text: `@@ -1,${oldContent.split('\n').length} +1,${newContent.split('\n').length} @@`,
    },
  ];

  const diff = computeLineDiff(oldContent, newContent);
  diff.forEach((d) => {
    if (d.type === 'added') {
      lines.push({ type: 'diff-add', text: `+${d.text}` });
    } else if (d.type === 'removed') {
      lines.push({ type: 'diff-del', text: `-${d.text}` });
    } else {
      lines.push({ type: 'output', text: ` ${d.text}` });
    }
  });
  return lines;
}

export function executeRealisticGitCommand(
  rawInput: string,
  currentWorkspace: ProjectWorkspaceState
): GitExecutionResult {
  const trimmed = rawInput.trim();
  const args = trimmed.split(/\s+/);
  const primary = args[0];

  let ws: ProjectWorkspaceState = {
    ...currentWorkspace,
    workingDirectory: [...currentWorkspace.workingDirectory],
    stagingArea: [...currentWorkspace.stagingArea],
    commits: [...currentWorkspace.commits],
    branches: [...currentWorkspace.branches],
    upstreamMap: { ...currentWorkspace.upstreamMap },
    remoteCommits: [...currentWorkspace.remoteCommits],
    remoteBranches: [...currentWorkspace.remoteBranches],
    tags: [...currentWorkspace.tags],
    reflog: [...currentWorkspace.reflog],
    commandLog: [...currentWorkspace.commandLog, trimmed],
  };

  const lines: GitTerminalLine[] = [];

  if (primary === 'help') {
    lines.push(
      { type: 'output', text: 'Project Studio Git CLI — Supported Commands:' },
      { type: 'output', text: '  git status                     Show branch tracking & working tree status' },
      { type: 'output', text: '  git diff [--staged]            Show real + / - line diffs from editor' },
      { type: 'output', text: '  git add <file | .>             Stage changes (respects .gitignore)' },
      { type: 'output', text: '  git commit -m "<msg>"          Record a permanent snapshot' },
      { type: 'output', text: '  git log [--oneline --graph]    Inspect commit graph' },
      { type: 'output', text: '  git branch [-vv | <name>]      List tracking branches or create branch' },
      { type: 'output', text: '  git checkout [-b] <branch>     Switch or create & switch branch' },
      { type: 'output', text: '  git fetch / git pull           Sync remote origin updates' },
      { type: 'output', text: '  git push [-u origin <branch>]  Push local commits to origin' },
      { type: 'output', text: '  git restore [--staged] <file>  Discard or unstage file edits' },
      { type: 'output', text: '  clear                          Clear terminal output' }
    );
    saveWorkspace(ws);
    return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
  }

  if (primary !== 'git') {
    lines.push({
      type: 'error',
      text: `bash: ${primary}: command not found`,
    });
    saveWorkspace(ws);
    return {
      workspace: ws,
      lines,
      exitCode: 1,
      stderrSummary: `unknown-command:${primary}`,
      lastCommand: trimmed,
    };
  }

  if (args.length < 2) {
    lines.push(
      { type: 'output', text: 'usage: git [-v | --version] [-h | --help] <command> [<args>]' },
      { type: 'output', text: 'Common commands: status, diff, add, commit, log, branch, checkout, fetch, pull, push' }
    );
    saveWorkspace(ws);
    return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
  }

  const sub = args[1];

  switch (sub) {
    case 'status': {
      const { ahead, behind, remoteRef } = getAheadBehindCounts(
        ws,
        ws.currentBranch
      );
      lines.push({ type: 'output', text: `On branch ${ws.currentBranch}` });

      if (remoteRef) {
        if (ahead === 0 && behind === 0) {
          lines.push({
            type: 'output',
            text: `Your branch is up to date with '${remoteRef}'.`,
          });
        } else if (ahead > 0 && behind === 0) {
          lines.push({
            type: 'output',
            text: `Your branch is ahead of '${remoteRef}' by ${ahead} commit${ahead > 1 ? 's' : ''}.`,
          });
          lines.push({
            type: 'output',
            text: '  (use "git push" to publish your local commits)',
          });
        } else if (behind > 0 && ahead === 0) {
          lines.push({
            type: 'error',
            text: `Your branch is behind '${remoteRef}' by ${behind} commit${behind > 1 ? 's' : ''}, and can be fast-forwarded.`,
          });
          lines.push({
            type: 'output',
            text: '  (use "git pull" to update your local branch)',
          });
        } else {
          lines.push({
            type: 'error',
            text: `Your branch and '${remoteRef}' have diverged, and have ${ahead} and ${behind} different commits each, respectively.`,
          });
          lines.push({
            type: 'output',
            text: '  (use "git pull" to merge the remote branch into yours)',
          });
        }
      }

      const conflicted = ws.workingDirectory.filter(
        (f) => f.status === 'conflicted'
      );
      const staged = ws.workingDirectory.filter((f) => f.status === 'staged');
      const modified = ws.workingDirectory.filter(
        (f) => f.status === 'modified'
      );
      const untracked = ws.workingDirectory.filter(
        (f) =>
          f.status === 'untracked' &&
          !isIgnoredByGitignore(f.name, ws.workingDirectory)
      );

      if (conflicted.length > 0) {
        lines.push({ type: 'error', text: 'You have unmerged paths.' });
        lines.push({
          type: 'output',
          text: '  (fix conflicts and run "git commit")',
        });
        lines.push({ type: 'error', text: 'Unmerged paths:' });
        conflicted.forEach((f) => {
          lines.push({
            type: 'error',
            text: `\tboth modified:   ${f.name}`,
          });
        });
      }

      if (staged.length > 0) {
        lines.push({ type: 'success', text: 'Changes to be committed:' });
        lines.push({
          type: 'output',
          text: '  (use "git restore --staged <file>..." to unstage)',
        });
        staged.forEach((f) => {
          const isNew =
            getCommittedFileContent(ws.commits, ws.currentBranch, f.name) ===
            undefined;
          lines.push({
            type: 'success',
            text: `\t${isNew ? 'new file:  ' : 'modified:  '} ${f.name}`,
          });
        });
      }

      if (modified.length > 0) {
        lines.push({ type: 'error', text: 'Changes not staged for commit:' });
        lines.push({
          type: 'output',
          text: '  (use "git add <file>..." to update what will be committed)',
        });
        lines.push({
          type: 'output',
          text: '  (use "git restore <file>..." to discard changes in working directory)',
        });
        modified.forEach((f) => {
          lines.push({ type: 'error', text: `\tmodified:   ${f.name}` });
        });
      }

      if (untracked.length > 0) {
        lines.push({ type: 'error', text: 'Untracked files:' });
        lines.push({
          type: 'output',
          text: '  (use "git add <file>..." to include in what will be committed)',
        });
        untracked.forEach((f) => {
          lines.push({ type: 'error', text: `\t${f.name}` });
        });
      }

      if (
        conflicted.length === 0 &&
        staged.length === 0 &&
        modified.length === 0 &&
        untracked.length === 0
      ) {
        lines.push({
          type: 'output',
          text: 'nothing to commit, working tree clean',
        });
      }

      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'diff': {
      const isStaged =
        args.includes('--staged') || args.includes('--cached');
      const targetFiles = ws.workingDirectory.filter((f) =>
        isStaged ? f.status === 'staged' : f.status === 'modified'
      );

      if (targetFiles.length === 0) {
        lines.push({
          type: 'output',
          text: isStaged
            ? '(no staged differences against HEAD)'
            : '(no unstaged changes in working tree)',
        });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      targetFiles.forEach((file) => {
        const baseContent = isStaged
          ? getCommittedFileContent(ws.commits, ws.currentBranch, file.name) ?? ''
          : file.stagedContent ??
            getCommittedFileContent(ws.commits, ws.currentBranch, file.name) ??
            '';
        const compareContent = isStaged
          ? file.stagedContent ?? file.content
          : file.content;
        lines.push(...formatDiffLines(file.name, baseContent, compareContent));
      });

      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'add': {
      if (args.length < 3) {
        lines.push({
          type: 'error',
          text: 'Nothing specified, nothing added.\nhint: Maybe you wanted to say "git add ."?',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'add-missing-pathspec',
          lastCommand: trimmed,
        };
      }

      const target = args[2];
      if (target === '.' || target === '-A' || target === '--all') {
        let count = 0;
        ws.workingDirectory = ws.workingDirectory.map((f) => {
          if (f.status === 'ignored' || isIgnoredByGitignore(f.name, ws.workingDirectory)) {
            return { ...f, status: 'ignored' };
          }
          if (
            f.status === 'untracked' ||
            f.status === 'modified' ||
            f.status === 'conflicted'
          ) {
            if (
              f.status === 'conflicted' &&
              f.content.includes('<<<<<<<') &&
              f.content.includes('>>>>>>>')
            ) {
              return f;
            }
            count++;
            return { ...f, status: 'staged', stagedContent: f.content };
          }
          return f;
        });

        const stillConflicted = ws.workingDirectory.filter(
          (f) => f.status === 'conflicted'
        );
        if (stillConflicted.length > 0) {
          lines.push({
            type: 'error',
            text: `warning: ${stillConflicted.map((f) => f.name).join(', ')} still contains conflict markers (<<<<<<< / >>>>>>>). Resolve them in the editor first.`,
          });
          saveWorkspace(ws);
          return {
            workspace: ws,
            lines,
            exitCode: 1,
            stderrSummary: 'unresolved-conflict-markers',
            lastCommand: trimmed,
          };
        }

        ws.stagingArea = ws.workingDirectory
          .filter((f) => f.status === 'staged')
          .map((f) => f.name);
        lines.push({
          type: 'success',
          text: `Staged ${count} file(s). Run "git status" or "git commit -m \\"...\\"" next.`,
        });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      const idx = ws.workingDirectory.findIndex((f) => f.name === target);
      if (idx === -1) {
        lines.push({
          type: 'error',
          text: `fatal: pathspec '${target}' did not match any files`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: `pathspec-not-found:${target}`,
          lastCommand: trimmed,
        };
      }

      const targetFile = ws.workingDirectory[idx];
      if (
        targetFile.status === 'ignored' ||
        isIgnoredByGitignore(targetFile.name, ws.workingDirectory)
      ) {
        lines.push({
          type: 'error',
          text: `The following paths are ignored by one of your .gitignore files:\n${targetFile.name}\nhint: Use -f if you really want to add them.`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'file-ignored-by-gitignore',
          lastCommand: trimmed,
        };
      }

      ws.workingDirectory[idx] = {
        ...targetFile,
        status: 'staged',
        stagedContent: targetFile.content,
      };
      ws.stagingArea = ws.workingDirectory
        .filter((f) => f.status === 'staged')
        .map((f) => f.name);

      lines.push({
        type: 'success',
        text: `Staged '${target}' for commit.`,
      });
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'commit': {
      const conflicted = ws.workingDirectory.filter(
        (f) => f.status === 'conflicted'
      );
      if (conflicted.length > 0) {
        lines.push({
          type: 'error',
          text: 'error: Committing is not possible because you have unmerged files.',
        });
        lines.push({
          type: 'output',
          text: 'hint: Fix them up in the Code Editor, and then use "git add <file>".',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'unmerged-files-commit',
          lastCommand: trimmed,
        };
      }

      const fullText = args.slice(2).join(' ');
      const msgMatch = fullText.match(/-m\s+["']([^"']+)["']/);
      if (!msgMatch) {
        lines.push({
          type: 'error',
          text: `error: switch 'm' requires a value (e.g. git commit -m "Describe changes")`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'commit-missing-message',
          lastCommand: trimmed,
        };
      }

      const stagedFiles = ws.workingDirectory.filter(
        (f) => f.status === 'staged'
      );
      if (stagedFiles.length === 0) {
        const hasPending = ws.workingDirectory.some(
          (f) => f.status === 'modified' || f.status === 'untracked'
        );
        lines.push({ type: 'output', text: `On branch ${ws.currentBranch}` });
        lines.push({
          type: 'error',
          text: hasPending
            ? 'Changes not staged for commit. Use "git add ." before committing.'
            : 'nothing to commit, working tree clean',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: hasPending ? 'nothing-staged-to-commit' : 'clean-tree-commit',
          lastCommand: trimmed,
        };
      }

      const sha = generateShortSha();
      const message = msgMatch[1];
      const branchCommits = ws.commits.filter(
        (c) => c.branch === ws.currentBranch
      );
      const parentIds =
        branchCommits.length > 0
          ? [branchCommits[branchCommits.length - 1].id]
          : [];

      const filesSnapshot: Record<string, string> = {};
      let insertions = 0;
      let deletions = 0;

      stagedFiles.forEach((f) => {
        const prev =
          getCommittedFileContent(ws.commits, ws.currentBranch, f.name) ?? '';
        const diff = computeLineDiff(prev, f.content);
        insertions += diff.filter((d) => d.type === 'added').length;
        deletions += diff.filter((d) => d.type === 'removed').length;
        filesSnapshot[f.name] = f.content;
      });

      const newCommit: Commit = {
        id: sha,
        parentIds,
        message,
        files: filesSnapshot,
        branch: ws.currentBranch,
      };

      ws.commits.push(newCommit);
      ws.workingDirectory = ws.workingDirectory.map((f) =>
        f.status === 'staged'
          ? { ...f, status: 'committed', stagedContent: undefined }
          : f
      );
      ws.stagingArea = [];
      ws.reflog = [
        {
          id: sha,
          action: `commit: ${message}`,
          target: ws.currentBranch,
          message,
          files: filesSnapshot,
        },
        ...ws.reflog,
      ];

      lines.push({
        type: 'success',
        text: `[${ws.currentBranch} ${sha}] ${message}`,
      });
      lines.push({
        type: 'output',
        text: ` ${stagedFiles.length} file(s) changed, ${insertions} insertions(+), ${deletions} deletions(-)`,
      });
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'log': {
      const isOneline = args.includes('--oneline');
      const isGraph = args.includes('--graph');
      const branchCommits = ws.commits
        .filter((c) => c.branch === ws.currentBranch)
        .reverse();

      if (branchCommits.length === 0) {
        lines.push({
          type: 'output',
          text: `fatal: your current branch '${ws.currentBranch}' does not have any commits yet`,
        });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      const remoteIds = new Set(ws.remoteCommits.map((rc) => rc.id));

      branchCommits.forEach((c, idx) => {
        const refs: string[] = [];
        if (idx === 0) refs.push(`HEAD -> ${ws.currentBranch}`);
        const isRemoteTip =
          remoteIds.has(c.id) &&
          ws.remoteCommits.filter((rc) => rc.branch === ws.currentBranch).slice(-1)[0]
            ?.id === c.id;
        if (isRemoteTip) refs.push(`origin/${ws.currentBranch}`);
        const tag = ws.tags.find((t) => t.commitId === c.id);
        if (tag) refs.push(`tag: ${tag.name}`);

        const refDecor = refs.length > 0 ? ` (${refs.join(', ')})` : '';

        if (isOneline || isGraph) {
          const prefix = isGraph ? (c.parentIds.length > 1 ? '*   ' : '* ') : '';
          lines.push({
            type: idx === 0 ? 'success' : 'output',
            text: `${prefix}${c.id}${refDecor} ${c.message}`,
          });
          if (isGraph && c.parentIds.length > 1) {
            lines.push({ type: 'diff-meta', text: '|\\' });
          } else if (isGraph && idx < branchCommits.length - 1) {
            lines.push({ type: 'diff-meta', text: '|' });
          }
        } else {
          lines.push({
            type: 'success',
            text: `commit ${c.id}${refDecor}`,
          });
          lines.push({
            type: 'output',
            text: 'Author: Cadet <cadet@gitmaster.academy>',
          });
          lines.push({
            type: 'output',
            text: `Date:   ${new Date().toUTCString()}`,
          });
          lines.push({ type: 'output', text: `\n    ${c.message}\n` });
        }
      });

      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'branch': {
      const showVerbose = args.includes('-vv') || args.includes('-v');
      const positional = args.slice(2).filter((a) => !a.startsWith('-'));

      if (positional.length === 0) {
        ws.branches.forEach((b) => {
          const isCurr = b === ws.currentBranch;
          const prefix = isCurr ? '* ' : '  ';
          const branchCommits = ws.commits.filter((c) => c.branch === b);
          const tip = branchCommits[branchCommits.length - 1];
          if (showVerbose && tip) {
            const { ahead, behind, remoteRef } = getAheadBehindCounts(ws, b);
            let trackText = '';
            if (remoteRef) {
              if (ahead > 0 && behind > 0) {
                trackText = `[${remoteRef}: ahead ${ahead}, behind ${behind}] `;
              } else if (ahead > 0) {
                trackText = `[${remoteRef}: ahead ${ahead}] `;
              } else if (behind > 0) {
                trackText = `[${remoteRef}: behind ${behind}] `;
              } else {
                trackText = `[${remoteRef}] `;
              }
            }
            lines.push({
              type: isCurr ? 'success' : 'output',
              text: `${prefix}${b.padEnd(16)} ${tip.id} ${trackText}${tip.message}`,
            });
          } else {
            lines.push({
              type: isCurr ? 'success' : 'output',
              text: `${prefix}${b}`,
            });
          }
        });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      const newBranch = positional[0];
      if (ws.branches.includes(newBranch)) {
        lines.push({
          type: 'error',
          text: `fatal: a branch named '${newBranch}' already exists`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'branch-already-exists',
          lastCommand: trimmed,
        };
      }

      ws.branches.push(newBranch);
      lines.push({
        type: 'success',
        text: `Created branch '${newBranch}'.`,
      });
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'checkout':
    case 'switch': {
      if (args.length < 3) {
        lines.push({
          type: 'error',
          text: `fatal: missing branch name (e.g. git ${sub} -b feature/auth)`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'missing-branch-name',
          lastCommand: trimmed,
        };
      }

      const createFlag = args[2] === '-b' || args[2] === '-c';
      const targetBranch = createFlag ? args[3] : args[2];
      if (!targetBranch) {
        lines.push({
          type: 'error',
          text: 'fatal: branch name required after flag',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'missing-branch-name',
          lastCommand: trimmed,
        };
      }

      if (createFlag) {
        if (ws.branches.includes(targetBranch)) {
          lines.push({
            type: 'error',
            text: `fatal: a branch named '${targetBranch}' already exists`,
          });
          saveWorkspace(ws);
          return {
            workspace: ws,
            lines,
            exitCode: 1,
            stderrSummary: 'branch-already-exists',
            lastCommand: trimmed,
          };
        }
        ws.branches.push(targetBranch);
        ws.currentBranch = targetBranch;
        lines.push({
          type: 'success',
          text: `Switched to a new branch '${targetBranch}'`,
        });
      } else {
        if (!ws.branches.includes(targetBranch)) {
          lines.push({
            type: 'error',
            text: `error: pathspec '${targetBranch}' did not match any branch known to git`,
          });
          saveWorkspace(ws);
          return {
            workspace: ws,
            lines,
            exitCode: 1,
            stderrSummary: `branch-not-found:${targetBranch}`,
            lastCommand: trimmed,
          };
        }
        ws.currentBranch = targetBranch;
        lines.push({
          type: 'success',
          text: `Switched to branch '${targetBranch}'`,
        });
      }

      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'fetch': {
      const { behind } = getAheadBehindCounts(ws, ws.currentBranch);
      lines.push({
        type: 'output',
        text: `From https://github.com/gitmaster/${ws.repoName}`,
      });
      if (behind > 0) {
        const remoteMain = ws.remoteCommits.filter(
          (c) => c.branch === ws.currentBranch
        );
        const latestRemote = remoteMain[remoteMain.length - 1];
        const firstLocal = ws.commits.filter(
          (c) => c.branch === ws.currentBranch
        )[0];
        lines.push({
          type: 'success',
          text: `   ${firstLocal?.id || '0000000'}..${latestRemote?.id || 'origin'}  ${ws.currentBranch} -> origin/${ws.currentBranch}`,
        });
        lines.push({
          type: 'output',
          text: `Fetched ${behind} new remote commit(s). Run "git pull" to integrate.`,
        });
      } else {
        lines.push({
          type: 'output',
          text: ` * [up to date]      ${ws.currentBranch} -> origin/${ws.currentBranch}`,
        });
      }
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'pull': {
      const targetBranch = args[3] || ws.currentBranch;
      const localIds = new Set(ws.commits.map((c) => c.id));
      const incoming = ws.remoteCommits.filter(
        (rc) => rc.branch === targetBranch && !localIds.has(rc.id)
      );

      if (incoming.length === 0) {
        lines.push({ type: 'output', text: 'Already up to date.' });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      const { ahead } = getAheadBehindCounts(ws, ws.currentBranch);
      const localUniqueCommits = ws.commits.filter(
        (c) =>
          c.branch === ws.currentBranch &&
          !ws.remoteCommits.some((rc) => rc.id === c.id)
      );

      // Check for content conflict if local and remote diverged on the same file
      let conflictFound = false;
      if (ahead > 0) {
        const localTouched = new Set<string>();
        localUniqueCommits.forEach((c) =>
          Object.keys(c.files).forEach((fn) => localTouched.add(fn))
        );

        incoming.forEach((rc) => {
          Object.entries(rc.files).forEach(([fn, incomingContent]) => {
            if (localTouched.has(fn)) {
              const localFile = ws.workingDirectory.find((f) => f.name === fn);
              const localContent = localFile ? localFile.content : '';
              if (localContent !== incomingContent) {
                conflictFound = true;
                const conflictText = `<<<<<<< HEAD (Current Change)\n${localContent}\n=======\n${incomingContent}\n>>>>>>> origin/${targetBranch} (Incoming Change)`;
                ws.workingDirectory = ws.workingDirectory.map((f) =>
                  f.name === fn
                    ? { ...f, content: conflictText, status: 'conflicted' }
                    : f
                );
                lines.push({
                  type: 'error',
                  text: `Auto-merging ${fn}`,
                });
                lines.push({
                  type: 'error',
                  text: `CONFLICT (content): Merge conflict in ${fn}`,
                });
              }
            }
          });
        });
      }

      // Add incoming remote commits to local branch history
      ws.commits = [
        ...ws.commits,
        ...incoming.map((rc) => ({ ...rc, branch: ws.currentBranch })),
      ];

      if (conflictFound) {
        lines.push({
          type: 'error',
          text: 'Automatic merge failed; fix conflicts in the Code Editor and then commit the result.',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'merge-conflict-pull',
          lastCommand: trimmed,
        };
      }

      // Clean fast-forward / non-conflicting merge
      incoming.forEach((rc) => {
        Object.entries(rc.files).forEach(([name, content]) => {
          const idx = ws.workingDirectory.findIndex((f) => f.name === name);
          if (idx > -1) {
            ws.workingDirectory[idx] = {
              name,
              content,
              status: 'committed',
            };
          } else {
            ws.workingDirectory.push({
              name,
              content,
              status: 'committed',
            });
          }
        });
      });

      lines.push({
        type: 'output',
        text: `From https://github.com/gitmaster/${ws.repoName}`,
      });
      lines.push({
        type: 'success',
        text: `Updating ${ws.currentBranch}..origin/${targetBranch}\nFast-forward: Integrated ${incoming.length} remote commit(s).`,
      });
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'push': {
      const hasUpstreamFlag =
        args.includes('-u') || args.includes('--set-upstream');
      const positional = args
        .slice(2)
        .filter((a) => a !== '-u' && a !== '--set-upstream');
      const remoteName = positional[0] || 'origin';
      const targetBranch = positional[1] || ws.currentBranch;

      if (!ws.branches.includes(targetBranch)) {
        lines.push({
          type: 'error',
          text: `error: src refspec ${targetBranch} does not match any`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'push-branch-not-found',
          lastCommand: trimmed,
        };
      }

      const { ahead, behind } = getAheadBehindCounts(ws, targetBranch);

      // Non-fast-forward rejection if remote is ahead!
      if (behind > 0) {
        lines.push({
          type: 'error',
          text: `To https://github.com/gitmaster/${ws.repoName}.git`,
        });
        lines.push({
          type: 'error',
          text: ` ! [rejected]        ${targetBranch} -> ${targetBranch} (fetch first)`,
        });
        lines.push({
          type: 'error',
          text: `error: failed to push some refs to 'https://github.com/gitmaster/${ws.repoName}.git'`,
        });
        lines.push({
          type: 'output',
          text: `hint: Updates were rejected because the remote contains work that you do not have locally.\nhint: Run 'git pull' first to integrate the remote changes before pushing again.`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'push-rejected-behind',
          lastCommand: trimmed,
        };
      }

      const branchCommits = ws.commits.filter((c) => c.branch === targetBranch);
      const remoteIds = new Set(ws.remoteCommits.map((rc) => rc.id));
      const toPush = branchCommits.filter((c) => !remoteIds.has(c.id));

      if (toPush.length === 0 && ws.remoteBranches.includes(`${remoteName}/${targetBranch}`)) {
        lines.push({ type: 'output', text: 'Everything up-to-date' });
        saveWorkspace(ws);
        return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
      }

      ws.remoteCommits.push(...toPush);
      const remoteRef = `${remoteName}/${targetBranch}`;
      if (!ws.remoteBranches.includes(remoteRef)) {
        ws.remoteBranches.push(remoteRef);
      }
      if (hasUpstreamFlag || !ws.upstreamMap[targetBranch]) {
        ws.upstreamMap[targetBranch] = remoteRef;
      }

      lines.push({
        type: 'output',
        text: `Enumerating objects: ${Math.max(2, toPush.length * 4)}, done.`,
      });
      lines.push({
        type: 'success',
        text: `To https://github.com/gitmaster/${ws.repoName}.git`,
      });
      lines.push({
        type: 'success',
        text: `   ${ahead > 0 ? 'local..origin' : '[new branch]'}      ${targetBranch} -> ${remoteRef}`,
      });
      if (hasUpstreamFlag) {
        lines.push({
          type: 'output',
          text: `branch '${targetBranch}' set up to track '${remoteRef}'.`,
        });
      }
      if (targetBranch !== 'main') {
        lines.push({
          type: 'output',
          text: `remote: Create a pull request for '${targetBranch}' on GitHub:\nremote:   https://github.com/gitmaster/${ws.repoName}/pull/new/${targetBranch}`,
        });
      }
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    case 'restore': {
      const isStaged = args.includes('--staged');
      const targetFile = args.slice(2).find((a) => !a.startsWith('-'));
      if (!targetFile) {
        lines.push({
          type: 'error',
          text: 'fatal: you must specify path(s) to restore',
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: 'restore-missing-file',
          lastCommand: trimmed,
        };
      }

      const idx = ws.workingDirectory.findIndex((f) => f.name === targetFile);
      if (idx === -1) {
        lines.push({
          type: 'error',
          text: `error: pathspec '${targetFile}' did not match any file(s) known to git`,
        });
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines,
          exitCode: 1,
          stderrSummary: `pathspec-not-found:${targetFile}`,
          lastCommand: trimmed,
        };
      }

      const committed = getCommittedFileContent(
        ws.commits,
        ws.currentBranch,
        targetFile
      );

      if (isStaged) {
        ws.workingDirectory[idx] = {
          ...ws.workingDirectory[idx],
          status: committed === undefined ? 'untracked' : 'modified',
          stagedContent: undefined,
        };
        ws.stagingArea = ws.workingDirectory
          .filter((f) => f.status === 'staged')
          .map((f) => f.name);
        lines.push({
          type: 'success',
          text: `Unstaged '${targetFile}'.`,
        });
      } else if (committed !== undefined) {
        ws.workingDirectory[idx] = {
          name: targetFile,
          content: committed,
          status: 'committed',
        };
        lines.push({
          type: 'success',
          text: `Restored '${targetFile}' to last committed snapshot.`,
        });
      } else {
        ws.workingDirectory = ws.workingDirectory.filter(
          (f) => f.name !== targetFile
        );
        lines.push({
          type: 'success',
          text: `Removed untracked '${targetFile}'.`,
        });
      }
      saveWorkspace(ws);
      return { workspace: ws, lines, exitCode: 0, lastCommand: trimmed };
    }

    default: {
      // Delegate merge/reset/revert/rebase/cherry-pick/reflog/tag to shared handler
      const adv = executeAdvancedGitCommand(sub, args, {
        isInitialized: ws.isInitialized,
        workingDirectory: ws.workingDirectory.map((f) => ({
          name: f.name,
          content: f.content,
          status:
            f.status === 'ignored' || f.status === 'conflicted'
              ? 'modified'
              : f.status,
        })),
        stagingArea: ws.stagingArea,
        commits: ws.commits,
        currentBranch: ws.currentBranch,
        branches: ws.branches,
        remoteCommits: ws.remoteCommits,
        remoteBranches: ws.remoteBranches,
        tags: ws.tags,
        reflog: ws.reflog,
      });

      if (adv.handled) {
        const mergedWorking: ProjectFile[] = adv.updatedState.workingDirectory.map(
          (vf) => ({
            name: vf.name,
            content: vf.content,
            status: isIgnoredByGitignore(vf.name, ws.workingDirectory)
              ? 'ignored'
              : vf.status,
          })
        );
        ws = {
          ...ws,
          workingDirectory: mergedWorking,
          stagingArea: adv.updatedState.stagingArea,
          commits: adv.updatedState.commits,
          currentBranch: adv.updatedState.currentBranch,
          branches: adv.updatedState.branches,
          remoteCommits: adv.updatedState.remoteCommits,
          remoteBranches: adv.updatedState.remoteBranches,
          tags: adv.updatedState.tags || ws.tags,
          reflog: adv.updatedState.reflog || ws.reflog,
        };
        const hasError = adv.outputLines.some((l) => l.type === 'error');
        saveWorkspace(ws);
        return {
          workspace: ws,
          lines: adv.outputLines.map((l) => ({ type: l.type, text: l.text })),
          exitCode: hasError ? 1 : 0,
          stderrSummary: hasError ? `advanced-error:${sub}` : undefined,
          lastCommand: trimmed,
        };
      }

      lines.push({
        type: 'error',
        text: `git: '${sub}' is not a git command. See 'git --help' or type 'help'.`,
      });
      saveWorkspace(ws);
      return {
        workspace: ws,
        lines,
        exitCode: 1,
        stderrSummary: `git-typo:${sub}`,
        lastCommand: trimmed,
      };
    }
  }
}
