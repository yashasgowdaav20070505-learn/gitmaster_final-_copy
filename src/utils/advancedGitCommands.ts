import { RepoState, Commit, VirtualFile, RepoTag, ReflogEntry } from '../types';

export interface CommandLineEntry {
  type: 'output' | 'error' | 'success';
  text: string;
}

export interface CommandHandlerResult {
  handled: boolean;
  updatedState: RepoState;
  outputLines: CommandLineEntry[];
}

function generateShortSha(): string {
  const hex = '0123456789abcdef';
  let sha = '';
  for (let i = 0; i < 7; i++) {
    sha += hex[Math.floor(Math.random() * 16)];
  }
  return sha;
}

function getLatestCommitMapForBranch(
  commits: Commit[],
  branch: string
): { [filename: string]: string } {
  const merged: { [filename: string]: string } = {};
  commits
    .filter((c) => c.branch === branch)
    .forEach((c) => {
      Object.entries(c.files).forEach(([k, v]) => {
        merged[k] = v;
      });
    });
  return merged;
}

function getBranchTip(commits: Commit[], branch: string): Commit | undefined {
  const list = commits.filter((c) => c.branch === branch);
  return list.length > 0 ? list[list.length - 1] : undefined;
}

function appendReflog(
  state: RepoState,
  entry: ReflogEntry
): ReflogEntry[] {
  const existing = state.reflog || [];
  return [entry, ...existing];
}

export function executeAdvancedGitCommand(
  subCommand: string,
  args: string[],
  currentState: RepoState
): CommandHandlerResult {
  let updatedState: RepoState = {
    ...currentState,
    workingDirectory: [...currentState.workingDirectory],
    stagingArea: [...currentState.stagingArea],
    commits: [...currentState.commits],
    branches: [...currentState.branches],
    remoteCommits: [...currentState.remoteCommits],
    remoteBranches: [...currentState.remoteBranches],
    tags: currentState.tags ? [...currentState.tags] : [],
    reflog: currentState.reflog ? [...currentState.reflog] : [],
  };

  const outputLines: CommandLineEntry[] = [];

  switch (subCommand) {
    case 'diff': {
      const isStaged =
        args.includes('--staged') || args.includes('--cached');
      const committedFiles = getLatestCommitMapForBranch(
        updatedState.commits,
        updatedState.currentBranch
      );

      const targetFiles = updatedState.workingDirectory.filter((f) =>
        isStaged ? f.status === 'staged' : f.status === 'modified'
      );

      if (targetFiles.length === 0) {
        outputLines.push({
          type: 'output',
          text: isStaged
            ? 'No staged differences against HEAD.'
            : 'No unstaged working directory differences.',
        });
        return { handled: true, updatedState, outputLines };
      }

      targetFiles.forEach((file) => {
        const oldContent = committedFiles[file.name] ?? '';
        outputLines.push({
          type: 'output',
          text: `diff --git a/${file.name} b/${file.name}`,
        });
        outputLines.push({
          type: 'output',
          text: `--- a/${file.name}`,
        });
        outputLines.push({
          type: 'output',
          text: `+++ b/${file.name}`,
        });
        if (oldContent) {
          outputLines.push({
            type: 'error',
            text: `-${oldContent}`,
          });
        }
        outputLines.push({
          type: 'success',
          text: `+${file.content}`,
        });
      });

      return { handled: true, updatedState, outputLines };
    }

    case 'revert': {
      if (args.length < 3) {
        outputLines.push({
          type: 'error',
          text: 'fatal: Please specify a commit hash to revert (e.g. git revert f9e8d7c).',
        });
        return { handled: true, updatedState, outputLines };
      }

      const targetSha = args[2];
      const targetIndex = updatedState.commits.findIndex(
        (c) => c.id === targetSha
      );

      if (targetIndex === -1) {
        outputLines.push({
          type: 'error',
          text: `fatal: bad revision '${targetSha}'`,
        });
        return { handled: true, updatedState, outputLines };
      }

      const targetCommit = updatedState.commits[targetIndex];
      const parentCommit =
        targetCommit.parentIds.length > 0
          ? updatedState.commits.find(
              (c) => c.id === targetCommit.parentIds[0]
            )
          : undefined;

      const restoredFiles: { [filename: string]: string } = {};
      Object.keys(targetCommit.files).forEach((fileName) => {
        if (parentCommit && parentCommit.files[fileName] !== undefined) {
          restoredFiles[fileName] = parentCommit.files[fileName];
        } else {
          // Search earlier commits for prior content
          const earlier = [...updatedState.commits]
            .slice(0, targetIndex)
            .reverse()
            .find((c) => c.files[fileName] !== undefined);
          if (earlier) {
            restoredFiles[fileName] = earlier.files[fileName];
          }
        }
      });

      const tip = getBranchTip(updatedState.commits, updatedState.currentBranch);
      const newSha = generateShortSha();
      const revertMessage = `Revert "${targetCommit.message}"`;

      const revertCommit: Commit = {
        id: newSha,
        parentIds: tip ? [tip.id] : [],
        message: revertMessage,
        files: restoredFiles,
        branch: updatedState.currentBranch,
      };

      updatedState.commits.push(revertCommit);

      // Update working directory files to match reverted state
      Object.entries(restoredFiles).forEach(([name, content]) => {
        const idx = updatedState.workingDirectory.findIndex(
          (f) => f.name === name
        );
        if (idx > -1) {
          updatedState.workingDirectory[idx] = {
            name,
            content,
            status: 'committed',
          };
        } else {
          updatedState.workingDirectory.push({
            name,
            content,
            status: 'committed',
          });
        }
      });

      updatedState.reflog = appendReflog(updatedState, {
        id: newSha,
        action: `commit: ${revertMessage}`,
        target: updatedState.currentBranch,
        message: revertMessage,
        files: restoredFiles,
      });

      outputLines.push({
        type: 'success',
        text: `[${updatedState.currentBranch} ${newSha}] ${revertMessage}`,
      });
      outputLines.push({
        type: 'output',
        text: `Safely reverted ${targetSha} with a new inverse commit.`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'reset': {
      let mode: 'soft' | 'mixed' | 'hard' = 'mixed';
      const remainingArgs: string[] = [];

      for (const arg of args.slice(2)) {
        if (arg === '--soft') mode = 'soft';
        else if (arg === '--mixed') mode = 'mixed';
        else if (arg === '--hard') mode = 'hard';
        else remainingArgs.push(arg);
      }

      const targetRef = remainingArgs[0] || 'HEAD';
      const branchCommits = updatedState.commits.filter(
        (c) => c.branch === updatedState.currentBranch
      );

      // Handle HEAD~N syntax
      const tildeMatch = targetRef.match(/^HEAD~(\d+)$/i);
      if (tildeMatch) {
        const steps = parseInt(tildeMatch[1], 10);
        if (steps <= 0 || branchCommits.length < steps) {
          outputLines.push({
            type: 'error',
            text: `fatal: ambiguous argument '${targetRef}': unknown revision or too few commits`,
          });
          return { handled: true, updatedState, outputLines };
        }

        const poppedCommits = branchCommits.slice(branchCommits.length - steps);
        const poppedIds = new Set(poppedCommits.map((c) => c.id));
        const newTip =
          branchCommits.length - steps > 0
            ? branchCommits[branchCommits.length - steps - 1]
            : undefined;

        updatedState.commits = updatedState.commits.filter(
          (c) => !poppedIds.has(c.id)
        );

        // Save popped commits to reflog for recovery
        poppedCommits.forEach((pc) => {
          updatedState.reflog = appendReflog(updatedState, {
            id: pc.id,
            action: `commit: ${pc.message}`,
            target: updatedState.currentBranch,
            message: pc.message,
            files: pc.files,
          });
        });
        updatedState.reflog = appendReflog(updatedState, {
          id: newTip ? newTip.id : '0000000',
          action: `reset: moving to ${targetRef}`,
          target: updatedState.currentBranch,
        });

        const poppedFiles: { [filename: string]: string } = {};
        poppedCommits.forEach((pc) => {
          Object.entries(pc.files).forEach(([k, v]) => {
            poppedFiles[k] = v;
          });
        });

        if (mode === 'soft') {
          const nextWorking: VirtualFile[] = [...updatedState.workingDirectory];
          Object.entries(poppedFiles).forEach(([name, content]) => {
            const idx = nextWorking.findIndex((f) => f.name === name);
            if (idx > -1) {
              nextWorking[idx] = { name, content, status: 'staged' };
            } else {
              nextWorking.push({ name, content, status: 'staged' });
            }
          });
          updatedState.workingDirectory = nextWorking;
          updatedState.stagingArea = nextWorking
            .filter((f) => f.status === 'staged')
            .map((f) => f.name);
          outputLines.push({
            type: 'success',
            text: `HEAD is now at ${newTip ? `${newTip.id} ${newTip.message}` : 'initial state'} (--soft: changes kept staged)`,
          });
        } else if (mode === 'mixed') {
          const nextWorking: VirtualFile[] = [...updatedState.workingDirectory];
          Object.entries(poppedFiles).forEach(([name, content]) => {
            const idx = nextWorking.findIndex((f) => f.name === name);
            if (idx > -1) {
              nextWorking[idx] = { name, content, status: 'modified' };
            } else {
              nextWorking.push({ name, content, status: 'modified' });
            }
          });
          updatedState.workingDirectory = nextWorking;
          updatedState.stagingArea = [];
          outputLines.push({
            type: 'success',
            text: `Unstaged changes after reset (--mixed). HEAD is now at ${newTip ? `${newTip.id} ${newTip.message}` : 'initial state'}`,
          });
        } else {
          // --hard
          const baseFiles = getLatestCommitMapForBranch(
            updatedState.commits,
            updatedState.currentBranch
          );
          updatedState.workingDirectory = Object.entries(baseFiles).map(
            ([name, content]) => ({
              name,
              content,
              status: 'committed' as const,
            })
          );
          updatedState.stagingArea = [];
          outputLines.push({
            type: 'success',
            text: `HEAD is now at ${newTip ? `${newTip.id} ${newTip.message}` : 'initial state'} (--hard)`,
          });
        }

        return { handled: true, updatedState, outputLines };
      }

      // Handle reset to specific SHA (including recovering a lost commit from reflog!)
      const existingIdx = branchCommits.findIndex((c) => c.id === targetRef);
      if (existingIdx > -1) {
        const keepIds = new Set(
          branchCommits.slice(0, existingIdx + 1).map((c) => c.id)
        );
        updatedState.commits = updatedState.commits.filter(
          (c) => c.branch !== updatedState.currentBranch || keepIds.has(c.id)
        );
        if (mode === 'hard') {
          const baseFiles = getLatestCommitMapForBranch(
            updatedState.commits,
            updatedState.currentBranch
          );
          updatedState.workingDirectory = Object.entries(baseFiles).map(
            ([name, content]) => ({
              name,
              content,
              status: 'committed' as const,
            })
          );
          updatedState.stagingArea = [];
        }
        outputLines.push({
          type: 'success',
          text: `HEAD is now at ${targetRef} ${branchCommits[existingIdx].message}`,
        });
        return { handled: true, updatedState, outputLines };
      }

      const reflogMatch = (updatedState.reflog || []).find(
        (r) => r.id === targetRef && r.files
      );
      if (reflogMatch) {
        const tip = getBranchTip(
          updatedState.commits,
          updatedState.currentBranch
        );
        const recoveredCommit: Commit = {
          id: reflogMatch.id,
          parentIds: tip ? [tip.id] : [],
          message: reflogMatch.message || 'Recovered commit',
          files: reflogMatch.files || {},
          branch: updatedState.currentBranch,
        };
        updatedState.commits.push(recoveredCommit);
        const baseFiles = getLatestCommitMapForBranch(
          updatedState.commits,
          updatedState.currentBranch
        );
        updatedState.workingDirectory = Object.entries(baseFiles).map(
          ([name, content]) => ({
            name,
            content,
            status: 'committed' as const,
          })
        );
        updatedState.stagingArea = [];
        outputLines.push({
          type: 'success',
          text: `HEAD is now at ${recoveredCommit.id} ${recoveredCommit.message} (recovered from reflog)`,
        });
        return { handled: true, updatedState, outputLines };
      }

      outputLines.push({
        type: 'error',
        text: `fatal: ambiguous argument '${targetRef}': unknown revision`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'rebase': {
      if (args.length < 3) {
        outputLines.push({
          type: 'error',
          text: 'fatal: Please specify an upstream branch to rebase onto (e.g. git rebase main).',
        });
        return { handled: true, updatedState, outputLines };
      }

      const targetBranch = args[2];
      if (!updatedState.branches.includes(targetBranch)) {
        outputLines.push({
          type: 'error',
          text: `fatal: invalid upstream '${targetBranch}'`,
        });
        return { handled: true, updatedState, outputLines };
      }

      if (targetBranch === updatedState.currentBranch) {
        outputLines.push({
          type: 'output',
          text: `Current branch ${updatedState.currentBranch} is up to date.`,
        });
        return { handled: true, updatedState, outputLines };
      }

      const targetTip = getBranchTip(updatedState.commits, targetBranch);
      const currentCommits = updatedState.commits.filter(
        (c) => c.branch === updatedState.currentBranch
      );
      const otherCommits = updatedState.commits.filter(
        (c) => c.branch !== updatedState.currentBranch
      );

      let prevParentId = targetTip ? targetTip.id : '';
      const rebasedCommits: Commit[] = currentCommits.map((c) => {
        const newSha = generateShortSha();
        const rebased: Commit = {
          ...c,
          id: newSha,
          parentIds: prevParentId ? [prevParentId] : [],
          branch: updatedState.currentBranch,
        };
        prevParentId = newSha;
        return rebased;
      });

      updatedState.commits = [...otherCommits, ...rebasedCommits];
      updatedState.reflog = appendReflog(updatedState, {
        id: prevParentId || (targetTip?.id ?? '0000000'),
        action: `rebase (finish): returning to refs/heads/${updatedState.currentBranch}`,
        target: updatedState.currentBranch,
      });

      outputLines.push({
        type: 'success',
        text: `Successfully rebased and updated refs/heads/${updatedState.currentBranch} onto ${targetBranch}.`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'cherry-pick': {
      if (args.length < 3) {
        outputLines.push({
          type: 'error',
          text: 'fatal: Specify a commit SHA to cherry-pick (e.g. git cherry-pick h777fix).',
        });
        return { handled: true, updatedState, outputLines };
      }

      const targetSha = args[2];
      const sourceCommit = updatedState.commits.find((c) => c.id === targetSha);
      if (!sourceCommit) {
        outputLines.push({
          type: 'error',
          text: `fatal: bad revision '${targetSha}'`,
        });
        return { handled: true, updatedState, outputLines };
      }

      const tip = getBranchTip(updatedState.commits, updatedState.currentBranch);
      const newSha = generateShortSha();
      const pickedCommit: Commit = {
        id: newSha,
        parentIds: tip ? [tip.id] : [],
        message: sourceCommit.message,
        files: { ...sourceCommit.files },
        branch: updatedState.currentBranch,
      };

      updatedState.commits.push(pickedCommit);
      Object.entries(sourceCommit.files).forEach(([name, content]) => {
        const idx = updatedState.workingDirectory.findIndex(
          (f) => f.name === name
        );
        if (idx > -1) {
          updatedState.workingDirectory[idx] = {
            name,
            content,
            status: 'committed',
          };
        } else {
          updatedState.workingDirectory.push({
            name,
            content,
            status: 'committed',
          });
        }
      });

      updatedState.reflog = appendReflog(updatedState, {
        id: newSha,
        action: `cherry-pick: ${sourceCommit.message}`,
        target: updatedState.currentBranch,
        message: sourceCommit.message,
        files: sourceCommit.files,
      });

      outputLines.push({
        type: 'success',
        text: `[${updatedState.currentBranch} ${newSha}] ${sourceCommit.message}`,
      });
      outputLines.push({
        type: 'output',
        text: `Cherry-picked ${targetSha} cleanly onto '${updatedState.currentBranch}'.`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'reflog': {
      const entries: ReflogEntry[] =
        updatedState.reflog && updatedState.reflog.length > 0
          ? updatedState.reflog
          : [...updatedState.commits].reverse().map((c) => ({
              id: c.id,
              action: `commit: ${c.message}`,
              target: c.branch,
            }));

      if (entries.length === 0) {
        outputLines.push({
          type: 'output',
          text: 'No HEAD reflog entries recorded yet.',
        });
      } else {
        entries.forEach((entry, idx) => {
          outputLines.push({
            type: idx === 1 ? 'success' : 'output',
            text: `${entry.id} HEAD@{${idx}}: ${entry.action}`,
          });
        });
      }
      return { handled: true, updatedState, outputLines };
    }

    case 'tag': {
      const tags: RepoTag[] = updatedState.tags || [];
      if (args.length < 3) {
        if (tags.length === 0) {
          outputLines.push({
            type: 'output',
            text: '(no tags created yet)',
          });
        } else {
          tags.forEach((t) => {
            outputLines.push({
              type: 'success',
              text: t.message ? `${t.name}  (${t.commitId}) - ${t.message}` : t.name,
            });
          });
        }
        return { handled: true, updatedState, outputLines };
      }

      const fullArgsText = args.slice(2).join(' ');
      const annotatedMatch = fullArgsText.match(
        /-a\s+([^\s]+)\s+-m\s+["']([^"']+)["']/
      );
      const tip = getBranchTip(updatedState.commits, updatedState.currentBranch);

      if (!tip) {
        outputLines.push({
          type: 'error',
          text: 'fatal: Failed to resolve HEAD as a valid ref (create a commit first).',
        });
        return { handled: true, updatedState, outputLines };
      }

      if (annotatedMatch) {
        const tagName = annotatedMatch[1];
        const tagMessage = annotatedMatch[2];
        if (tags.some((t) => t.name === tagName)) {
          outputLines.push({
            type: 'error',
            text: `fatal: tag '${tagName}' already exists`,
          });
          return { handled: true, updatedState, outputLines };
        }
        updatedState.tags = [
          ...tags,
          { name: tagName, commitId: tip.id, message: tagMessage },
        ];
        outputLines.push({
          type: 'success',
          text: `Created annotated release tag '${tagName}' at ${tip.id}: "${tagMessage}"`,
        });
        return { handled: true, updatedState, outputLines };
      }

      if (args[2] === '-a') {
        outputLines.push({
          type: 'error',
          text: 'Usage: git tag -a v1.0.0 -m "Release v1.0.0"',
        });
        return { handled: true, updatedState, outputLines };
      }

      const lightweightTag = args[2];
      if (tags.some((t) => t.name === lightweightTag)) {
        outputLines.push({
          type: 'error',
          text: `fatal: tag '${lightweightTag}' already exists`,
        });
        return { handled: true, updatedState, outputLines };
      }
      updatedState.tags = [
        ...tags,
        { name: lightweightTag, commitId: tip.id },
      ];
      outputLines.push({
        type: 'success',
        text: `Created tag '${lightweightTag}' at ${tip.id}`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'fetch': {
      const localIds = new Set(updatedState.commits.map((c) => c.id));
      const unseenRemote = updatedState.remoteCommits.filter(
        (rc) => !localIds.has(rc.id)
      );

      outputLines.push({
        type: 'output',
        text: 'From https://github.com/gitmaster/academy-repo',
      });
      if (unseenRemote.length > 0) {
        const latest = unseenRemote[unseenRemote.length - 1];
        outputLines.push({
          type: 'success',
          text: `   origin/${latest.branch} -> fetched ${unseenRemote.length} new commit(s) (latest: ${latest.id} "${latest.message}")`,
        });
        outputLines.push({
          type: 'output',
          text: 'Run "git pull" to merge fetched remote commits into your local branch.',
        });
      } else {
        outputLines.push({
          type: 'output',
          text: ' * [up to date] origin/main -> origin/main',
        });
      }
      return { handled: true, updatedState, outputLines };
    }

    case 'pull': {
      const targetBranch = args[3] || updatedState.currentBranch;
      const localIds = new Set(updatedState.commits.map((c) => c.id));
      const newRemoteCommits = updatedState.remoteCommits.filter(
        (rc) => rc.branch === targetBranch && !localIds.has(rc.id)
      );

      if (newRemoteCommits.length === 0) {
        outputLines.push({
          type: 'output',
          text: 'Already up to date.',
        });
        return { handled: true, updatedState, outputLines };
      }

      updatedState.commits = [
        ...updatedState.commits,
        ...newRemoteCommits.map((c) => ({
          ...c,
          branch: updatedState.currentBranch,
        })),
      ];

      newRemoteCommits.forEach((rc) => {
        Object.entries(rc.files).forEach(([name, content]) => {
          const idx = updatedState.workingDirectory.findIndex(
            (f) => f.name === name
          );
          if (idx > -1) {
            updatedState.workingDirectory[idx] = {
              name,
              content,
              status: 'committed',
            };
          } else {
            updatedState.workingDirectory.push({
              name,
              content,
              status: 'committed',
            });
          }
        });
      });

      outputLines.push({
        type: 'output',
        text: `Updating ${updatedState.currentBranch}..origin/${targetBranch}`,
      });
      outputLines.push({
        type: 'success',
        text: `Fast-forward: Pulled ${newRemoteCommits.length} commit(s) cleanly into '${updatedState.currentBranch}'.`,
      });
      return { handled: true, updatedState, outputLines };
    }

    case 'push': {
      const filteredArgs = args.slice(2).filter((a) => a !== '-u' && a !== '--set-upstream');
      const remoteName = filteredArgs[0] || 'origin';
      const targetBranch = filteredArgs[1] || updatedState.currentBranch;

      if (!updatedState.branches.includes(targetBranch)) {
        outputLines.push({
          type: 'error',
          text: `error: src refspec ${targetBranch} does not match any`,
        });
        return { handled: true, updatedState, outputLines };
      }

      const branchCommits = updatedState.commits.filter(
        (c) => c.branch === targetBranch
      );
      const existingRemoteIds = new Set(
        updatedState.remoteCommits.map((c) => c.id)
      );
      const commitsToPush = branchCommits.filter(
        (c) => !existingRemoteIds.has(c.id)
      );

      updatedState.remoteCommits = [
        ...updatedState.remoteCommits,
        ...commitsToPush,
      ];
      const remoteRef = `${remoteName}/${targetBranch}`;
      if (!updatedState.remoteBranches.includes(remoteRef)) {
        updatedState.remoteBranches.push(remoteRef);
      }

      outputLines.push({
        type: 'output',
        text: `Enumerating objects: ${Math.max(1, commitsToPush.length * 3)}, done.`,
      });
      outputLines.push({
        type: 'success',
        text: `To https://github.com/gitmaster/academy-repo.git`,
      });
      outputLines.push({
        type: 'success',
        text: ` * [new branch]      ${targetBranch} -> ${remoteRef}`,
      });
      if (args.includes('-u') || args.includes('--set-upstream')) {
        outputLines.push({
          type: 'output',
          text: `branch '${targetBranch}' set up to track '${remoteRef}'.`,
        });
      }
      if (targetBranch !== 'main') {
        outputLines.push({
          type: 'output',
          text: `remote: Create a pull request for '${targetBranch}' on GitHub.`,
        });
      }
      return { handled: true, updatedState, outputLines };
    }

    default:
      return { handled: false, updatedState: currentState, outputLines: [] };
  }
}
