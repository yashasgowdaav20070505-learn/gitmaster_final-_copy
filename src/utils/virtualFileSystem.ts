import { Commit } from '../types';
import {
  ProjectFile,
  ProjectWorkspaceState,
  STARTER_PROJECTS,
} from '../data/starterProjects';

export const PROJECT_WORKSPACES_STORAGE_KEY = 'gitmaster_project_workspaces';

export interface DiffLine {
  type: 'context' | 'removed' | 'added';
  text: string;
}

export function loadAllProjectWorkspaces(): Record<string, ProjectWorkspaceState> {
  try {
    const raw = localStorage.getItem(PROJECT_WORKSPACES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveWorkspace(workspace: ProjectWorkspaceState): void {
  try {
    const all = loadAllProjectWorkspaces();
    all[workspace.projectId] = {
      ...workspace,
      lastUpdatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROJECT_WORKSPACES_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to persist project workspace:', err);
  }
}

export function getOrInitWorkspace(projectId: string): ProjectWorkspaceState {
  const all = loadAllProjectWorkspaces();
  if (all[projectId]) {
    return all[projectId];
  }
  const blueprint =
    STARTER_PROJECTS.find((p) => p.id === projectId) || STARTER_PROJECTS[0];
  const initial = blueprint.createInitialState();
  saveWorkspace(initial);
  return initial;
}

export function resetWorkspace(projectId: string): ProjectWorkspaceState {
  const blueprint =
    STARTER_PROJECTS.find((p) => p.id === projectId) || STARTER_PROJECTS[0];
  const fresh = blueprint.createInitialState();
  saveWorkspace(fresh);
  return fresh;
}

export function isIgnoredByGitignore(
  fileName: string,
  workingDirectory: ProjectFile[]
): boolean {
  const gitignore = workingDirectory.find((f) => f.name === '.gitignore');
  if (!gitignore) return false;

  const patterns = gitignore.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  return patterns.some((pattern) => {
    if (pattern.endsWith('/')) {
      const folderPrefix = pattern.slice(0, -1);
      return (
        fileName === folderPrefix || fileName.startsWith(`${folderPrefix}/`)
      );
    }
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1); // e.g. ".env"
      return fileName.endsWith(ext);
    }
    return fileName === pattern || fileName.endsWith(`/${pattern}`);
  });
}

export function getCommittedFileContent(
  commits: Commit[],
  branch: string,
  fileName: string
): string | undefined {
  // Check commits on current branch first (latest to oldest), then ancestor commits
  const branchCommits = commits.filter((c) => c.branch === branch);
  for (let i = branchCommits.length - 1; i >= 0; i--) {
    if (branchCommits[i].files[fileName] !== undefined) {
      return branchCommits[i].files[fileName];
    }
  }
  for (let i = commits.length - 1; i >= 0; i--) {
    if (commits[i].files[fileName] !== undefined) {
      return commits[i].files[fileName];
    }
  }
  return undefined;
}

export function updateFileContent(
  ws: ProjectWorkspaceState,
  fileName: string,
  newContent: string
): ProjectWorkspaceState {
  const ignored = isIgnoredByGitignore(fileName, ws.workingDirectory);
  const committedContent = getCommittedFileContent(
    ws.commits,
    ws.currentBranch,
    fileName
  );

  const nextWorkingDirectory = ws.workingDirectory.map((file) => {
    if (file.name !== fileName) return file;

    if (ignored) {
      return {
        ...file,
        content: newContent,
        status: 'ignored' as const,
      };
    }

    const hasConflictMarkers =
      newContent.includes('<<<<<<<') &&
      newContent.includes('=======') &&
      newContent.includes('>>>>>>>');

    if (file.status === 'conflicted' && hasConflictMarkers) {
      return { ...file, content: newContent };
    }

    if (file.status === 'conflicted' && !hasConflictMarkers) {
      return {
        ...file,
        content: newContent,
        status: 'modified' as const,
      };
    }

    if (committedContent === undefined) {
      if (file.status === 'staged') {
        return {
          ...file,
          content: newContent,
          status:
            file.stagedContent === newContent
              ? ('staged' as const)
              : ('modified' as const),
        };
      }
      return {
        ...file,
        content: newContent,
        status: 'untracked' as const,
      };
    }

    if (newContent === committedContent) {
      return {
        ...file,
        content: newContent,
        status: 'committed' as const,
        stagedContent: undefined,
      };
    }

    if (file.status === 'staged' && file.stagedContent === newContent) {
      return {
        ...file,
        content: newContent,
        status: 'staged' as const,
      };
    }

    return {
      ...file,
      content: newContent,
      status: 'modified' as const,
    };
  });

  const nextStagingArea = nextWorkingDirectory
    .filter((f) => f.status === 'staged')
    .map((f) => f.name);

  const updated: ProjectWorkspaceState = {
    ...ws,
    workingDirectory: nextWorkingDirectory,
    stagingArea: nextStagingArea,
  };
  saveWorkspace(updated);
  return updated;
}

export function createNewFile(
  ws: ProjectWorkspaceState,
  rawName: string,
  initialContent?: string
): { workspace: ProjectWorkspaceState; error?: string } {
  const cleanName = rawName.trim().replace(/^\/+/, '');
  if (!cleanName) {
    return { workspace: ws, error: 'Please enter a valid file name.' };
  }
  if (cleanName.includes('..')) {
    return { workspace: ws, error: 'Relative ".." paths are not allowed.' };
  }
  if (ws.workingDirectory.some((f) => f.name === cleanName)) {
    return {
      workspace: ws,
      error: `A file named "${cleanName}" already exists.`,
    };
  }

  const ignored = isIgnoredByGitignore(cleanName, ws.workingDirectory);
  const defaultContent =
    initialContent ??
    (cleanName.endsWith('.html')
      ? '<!doctype html>\n<html>\n  <body>\n    <h1>New Page</h1>\n  </body>\n</html>'
      : cleanName.endsWith('.css')
      ? '/* New stylesheet */\n'
      : cleanName.endsWith('.js') || cleanName.endsWith('.ts')
      ? '// New module\nexport const ready = true;\n'
      : `# ${cleanName}\n`);

  const newFile: ProjectFile = {
    name: cleanName,
    content: defaultContent,
    status: ignored ? 'ignored' : 'untracked',
  };

  const updated: ProjectWorkspaceState = {
    ...ws,
    workingDirectory: [...ws.workingDirectory, newFile],
  };
  saveWorkspace(updated);
  return { workspace: updated };
}

export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1];
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({ type: 'context', text: oldLines[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', text: oldLines[i] });
      i++;
    } else {
      result.push({ type: 'added', text: newLines[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: 'removed', text: oldLines[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: 'added', text: newLines[j] });
    j++;
  }

  return result;
}
