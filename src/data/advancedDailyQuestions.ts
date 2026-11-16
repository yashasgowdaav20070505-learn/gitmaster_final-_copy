import { DailyTestQuestion } from './dailyTestBank';

export const ADVANCED_DRILL_SOLUTION_MAP: Record<string, string> = {
  'dt-diff-drill': 'git diff --staged',
  'dt-revert-drill': 'git revert b445566',
  'dt-reset-drill': 'git reset --soft HEAD~1',
  'dt-rebase-drill': 'git rebase main',
  'dt-cherry-pick-drill': 'git cherry-pick c888fix',
  'dt-fetch-pull-drill': 'git pull',
  'dt-push-pr-drill': 'git push -u origin feature-api',
  'dt-tag-drill': 'git tag -a v1.0.0 -m "Release v1.0.0"',
};

export const ADVANCED_DAILY_TEST_BANK: DailyTestQuestion[] = [
  // =========================================================
  // MODULE 6: INSPECTING & REWRITING HISTORY
  // =========================================================
  {
    id: 'dt-diff-recall',
    lessonId: 'lesson-git-diff',
    topicTitle: 'Inspecting Staged Diffs',
    mode: 'command-recall',
    difficulty: 'intermediate',
    prompt:
      'Compare line-by-line changes currently in the Staging Area against your last commit.',
    goal: 'Inspect staged modifications before running git commit.',
    blankTemplate: 'git diff ________',
    acceptedAnswers: ['git diff --staged', 'git diff --cached'],
    hint: 'Add the "--staged" flag to git diff.',
    explanation:
      '"git diff --staged" prints exact added (+) and removed (-) lines sitting in the Staging Area.',
  },
  {
    id: 'dt-diff-drill',
    lessonId: 'lesson-git-diff',
    topicTitle: 'Audit Staged Config Drill',
    mode: 'terminal-drill',
    difficulty: 'intermediate',
    prompt: 'Inspect the staged changes in "config.json" before committing.',
    scenario:
      'You staged config.json earlier and want to verify the exact line changes compared to the previous commit.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        {
          name: 'config.json',
          content: '{"mode":"production"}',
          status: 'staged',
        },
      ],
      stagingArea: ['config.json'],
      commits: [
        {
          id: 'c110011',
          parentIds: [],
          message: 'Initial config',
          files: { 'config.json': '{"mode":"dev"}' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git status', 'git diff --staged'],
    hints: ['Run "git diff --staged" in the terminal.'],
    validateState: (_state, history) =>
      history.some(
        (cmd) =>
          cmd.trim().toLowerCase() === 'git diff --staged' ||
          cmd.trim().toLowerCase() === 'git diff --cached'
      ),
    explanation:
      'Running "git diff --staged" reveals the exact line replacement before sealing the commit.',
  },
  {
    id: 'dt-revert-recall',
    lessonId: 'lesson-git-revert',
    topicTitle: 'Safe Public Undo',
    mode: 'command-recall',
    difficulty: 'advanced',
    prompt:
      'Safely undo pushed commit "f9e8d7c" on main by creating a new inverse commit.',
    goal: 'Undo a shared commit without rewriting branch history.',
    blankTemplate: 'git ______ f9e8d7c',
    acceptedAnswers: ['git revert f9e8d7c'],
    hint: 'Use the "revert" subcommand followed by the commit SHA.',
    explanation:
      '"git revert <sha>" records a new commit with opposite changes so teammates stay cleanly in sync.',
  },
  {
    id: 'dt-revert-drill',
    lessonId: 'lesson-git-revert',
    topicTitle: 'Revert Broken Commit Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Safely revert commit "b445566" on main without deleting history.',
    scenario:
      'Commit b445566 introduced a bug in pricing.ts on the shared main branch. Revert it cleanly.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'pricing.ts', content: 'return 0;', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a112233',
          parentIds: [],
          message: 'Valid pricing',
          files: { 'pricing.ts': 'return price;' },
          branch: 'main',
        },
        {
          id: 'b445566',
          parentIds: ['a112233'],
          message: 'Break pricing calculation',
          files: { 'pricing.ts': 'return 0;' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git log', 'git revert b445566'],
    hints: ['Run "git revert b445566".'],
    validateState: (state) =>
      state.commits.some((c) => c.message.startsWith('Revert "Break pricing')),
    explanation:
      '"git revert b445566" created a new inverse commit restoring pricing.ts while preserving the audit trail.',
  },
  {
    id: 'dt-reset-visual',
    lessonId: 'lesson-git-reset',
    topicTitle: 'Reset Modes Comparison',
    mode: 'visual-prediction',
    difficulty: 'advanced',
    prompt:
      'You run "git reset --soft HEAD~1" on a branch with 2 commits. What happens to the files from the undone commit?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [
        { name: 'auth.ts', content: 'tokenCheck()', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a101010',
          parentIds: [],
          message: 'Init repo',
          files: {},
          branch: 'main',
        },
        {
          id: 'b202020',
          parentIds: ['a101010'],
          message: 'WIP auth',
          files: { 'auth.ts': 'tokenCheck()' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    commandToRun: 'git reset --soft HEAD~1',
    options: [
      'HEAD moves back 1 commit and auth.ts stays in the Staging Area ready to re-commit.',
      'auth.ts is permanently deleted from both Staging and Working Directory.',
      'A brand new Revert commit is added on top of b202020.',
    ],
    correctIndex: 0,
    explanation:
      '--soft rewinds the branch pointer while preserving your edits inside the Staging Area.',
  },
  {
    id: 'dt-reset-drill',
    lessonId: 'lesson-git-reset',
    topicTitle: 'Soft Reset Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Undo the last commit using --soft so its changes remain staged.',
    scenario:
      'You committed login.ts too early locally. Rewind one commit with --soft so you can amend your work.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'login.ts', content: 'verifyUser()', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a100100',
          parentIds: [],
          message: 'Base app',
          files: {},
          branch: 'main',
        },
        {
          id: 'b200200',
          parentIds: ['a100100'],
          message: 'Too early commit',
          files: { 'login.ts': 'verifyUser()' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git log', 'git reset --soft HEAD~1'],
    hints: ['Run "git reset --soft HEAD~1".'],
    validateState: (state) =>
      state.commits.length === 1 &&
      state.workingDirectory.some(
        (f) => f.name === 'login.ts' && f.status === 'staged'
      ),
    explanation:
      '"git reset --soft HEAD~1" removed the premature commit while keeping login.ts safely staged.',
  },

  // =========================================================
  // MODULE 7: ADVANCED BRANCH SURGERY
  // =========================================================
  {
    id: 'dt-rebase-recall',
    lessonId: 'lesson-git-rebase',
    topicTitle: 'Linear Rebase Workflow',
    mode: 'command-recall',
    difficulty: 'advanced',
    prompt:
      'While on "feature-ui", replay your branch commits cleanly onto the latest tip of "main".',
    goal: 'Maintain a linear commit history without merge commits.',
    blankTemplate: 'git ______ main',
    acceptedAnswers: ['git rebase main'],
    hint: 'Think of moving the "base" of your branch onto main.',
    explanation:
      '"git rebase main" replays your current branch commits on top of the newest commit on main.',
  },
  {
    id: 'dt-rebase-drill',
    lessonId: 'lesson-git-rebase',
    topicTitle: 'Rebase onto Main Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Rebase your current "feature-nav" branch onto "main".',
    scenario:
      'Main received a security update after you branched. Rebase feature-nav onto main for a linear timeline.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'nav.ts', content: 'renderNav()', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a111111',
          parentIds: [],
          message: 'Initial',
          files: {},
          branch: 'main',
        },
        {
          id: 'b222222',
          parentIds: ['a111111'],
          message: 'Security update',
          files: { 'sec.ts': 'ok' },
          branch: 'main',
        },
        {
          id: 'c333333',
          parentIds: ['a111111'],
          message: 'Add navbar',
          files: { 'nav.ts': 'renderNav()' },
          branch: 'feature-nav',
        },
      ],
      currentBranch: 'feature-nav',
      branches: ['main', 'feature-nav'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git rebase main', 'git log'],
    hints: ['Run "git rebase main".'],
    validateState: (state) => {
      const featureCommit = state.commits.find(
        (c) => c.branch === 'feature-nav' && c.message === 'Add navbar'
      );
      return Boolean(featureCommit && featureCommit.parentIds.includes('b222222'));
    },
    explanation:
      'Rebasing updated the parent of your feature commit to point directly at main\'s latest commit b222222.',
  },
  {
    id: 'dt-cherry-pick-drill',
    lessonId: 'lesson-git-cherry-pick',
    topicTitle: 'Surgical Hotfix Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Cherry-pick ONLY commit "c888fix" onto your active "main" branch.',
    scenario:
      'A crash fix (c888fix) lives on feature-beta alongside unfinished code. Bring only c888fix onto main.',
    startingState: {
      isInitialized: true,
      workingDirectory: [],
      stagingArea: [],
      commits: [
        {
          id: 'a100001',
          parentIds: [],
          message: 'Prod v1',
          files: {},
          branch: 'main',
        },
        {
          id: 'b555wip',
          parentIds: ['a100001'],
          message: 'Unfinished beta UI',
          files: { 'beta.ts': 'wip' },
          branch: 'feature-beta',
        },
        {
          id: 'c888fix',
          parentIds: ['b555wip'],
          message: 'Fix crash on null user',
          files: { 'user.ts': 'if (!u) return;' },
          branch: 'feature-beta',
        },
      ],
      currentBranch: 'main',
      branches: ['main', 'feature-beta'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git cherry-pick c888fix', 'git log'],
    hints: ['Run "git cherry-pick c888fix".'],
    validateState: (state) =>
      state.commits.some(
        (c) =>
          c.branch === 'main' && c.message === 'Fix crash on null user'
      ),
    explanation:
      '"git cherry-pick c888fix" copied only the crash fix commit onto main without dragging in b555wip.',
  },
  {
    id: 'dt-reflog-recall',
    lessonId: 'lesson-git-reflog',
    topicTitle: 'Recovering Lost Commits',
    mode: 'command-recall',
    difficulty: 'advanced',
    prompt:
      'Print the local reference log of all recent HEAD movements to locate an accidentally reset commit.',
    goal: 'Inspect HEAD@{n} history entries.',
    blankTemplate: 'git ______',
    acceptedAnswers: ['git reflog'],
    hint: 'Short for "reference log".',
    explanation:
      '"git reflog" records every HEAD movement locally so you can find and recover orphaned commits.',
  },

  // =========================================================
  // MODULE 8: GITHUB COLLABORATION & RELEASE WORKFLOWS
  // =========================================================
  {
    id: 'dt-fetch-pull-visual',
    lessonId: 'lesson-git-fetch-pull',
    topicTitle: 'Fetch vs Pull Behavior',
    mode: 'visual-prediction',
    difficulty: 'advanced',
    prompt:
      'Your teammate pushed a new commit to origin/main. You run "git fetch". What happens to your local main branch?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [
        { name: 'app.ts', content: 'v1', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a1b2c3d',
          parentIds: [],
          message: 'Initial commit',
          files: { 'app.ts': 'v1' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [
        {
          id: 'a1b2c3d',
          parentIds: [],
          message: 'Initial commit',
          files: { 'app.ts': 'v1' },
          branch: 'main',
        },
        {
          id: 'r909090',
          parentIds: ['a1b2c3d'],
          message: 'Remote hotfix',
          files: { 'fix.ts': 'ok' },
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
    },
    commandToRun: 'git fetch',
    options: [
      'Remote updates are downloaded to origin/main tracking pointers, while local main stays untouched.',
      'Your local main branch immediately merges r909090 and overwrites uncommitted edits.',
      'Your local commits are pushed to GitHub.',
    ],
    correctIndex: 0,
    explanation:
      '"git fetch" is purely a safe download of remote metadata—it never alters your local branch until you merge or pull.',
  },
  {
    id: 'dt-fetch-pull-drill',
    lessonId: 'lesson-git-fetch-pull',
    topicTitle: 'Pull Remote Updates Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Integrate the new commit from origin/main into your local main branch.',
    scenario:
      'You already inspected origin/main. Now pull the remote commit r778899 into your local main branch.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'app.ts', content: 'v1', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a1b2c3d',
          parentIds: [],
          message: 'Base',
          files: { 'app.ts': 'v1' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [
        {
          id: 'a1b2c3d',
          parentIds: [],
          message: 'Base',
          files: { 'app.ts': 'v1' },
          branch: 'main',
        },
        {
          id: 'r778899',
          parentIds: ['a1b2c3d'],
          message: 'Teammate: Add docs',
          files: { 'docs.md': '# Guide' },
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
    },
    quickCommands: ['git fetch', 'git pull'],
    hints: ['Run "git pull" to merge remote commits into local main.'],
    validateState: (state) =>
      state.commits.some((c) => c.id === 'r778899' && c.branch === 'main'),
    explanation:
      '"git pull" merged the fetched remote commit r778899 cleanly into local main.',
  },
  {
    id: 'dt-push-pr-drill',
    lessonId: 'lesson-git-push-pr',
    topicTitle: 'Publish Feature Branch Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt:
      'Push your local "feature-api" branch to origin with upstream tracking (-u).',
    scenario:
      'Your feature-api branch is ready for a GitHub Pull Request. Publish it to origin now.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'api.ts', content: 'export const v2 = true;', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a100001',
          parentIds: [],
          message: 'Base',
          files: {},
          branch: 'main',
        },
        {
          id: 'p998877',
          parentIds: ['a100001'],
          message: 'Add v2 API',
          files: { 'api.ts': 'export const v2 = true;' },
          branch: 'feature-api',
        },
      ],
      currentBranch: 'feature-api',
      branches: ['main', 'feature-api'],
      remoteCommits: [
        {
          id: 'a100001',
          parentIds: [],
          message: 'Base',
          files: {},
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
    },
    quickCommands: ['git status', 'git push -u origin feature-api'],
    hints: ['Run "git push -u origin feature-api".'],
    validateState: (state) =>
      state.remoteBranches.includes('origin/feature-api') &&
      state.remoteCommits.some((c) => c.id === 'p998877'),
    explanation:
      '"git push -u origin feature-api" published your branch to GitHub so you can open a Pull Request.',
  },
  {
    id: 'dt-tag-drill',
    lessonId: 'lesson-git-tag',
    topicTitle: 'Annotated Release Tag Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt:
      'Create an annotated release tag "v1.0.0" with message "Release v1.0.0".',
    scenario:
      'Your production release commit is ready on main. Stamp it with an annotated semantic version tag.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        {
          name: 'package.json',
          content: '{"version":"1.0.0"}',
          status: 'committed',
        },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'f001000',
          parentIds: [],
          message: 'Prepare v1.0.0',
          files: { 'package.json': '{"version":"1.0.0"}' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
      tags: [],
    },
    quickCommands: ['git tag', 'git tag -a v1.0.0 -m "Release v1.0.0"'],
    hints: ['Run: git tag -a v1.0.0 -m "Release v1.0.0"'],
    validateState: (state) =>
      Boolean(
        state.tags?.some(
          (t) => t.name === 'v1.0.0' && t.message === 'Release v1.0.0'
        )
      ),
    explanation:
      '"git tag -a v1.0.0 -m \\"Release v1.0.0\\"" permanently labeled the release commit for deployment.',
  },
];
