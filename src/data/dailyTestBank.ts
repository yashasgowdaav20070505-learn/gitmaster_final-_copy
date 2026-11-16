import { RepoState } from '../types';

export type DailyQuestionMode = 'command-recall' | 'visual-prediction' | 'terminal-drill';

export interface CommandRecallQuestion {
  id: string;
  lessonId: string;
  topicTitle: string;
  mode: 'command-recall';
  difficulty: 'scratch' | 'intermediate' | 'advanced';
  prompt: string;
  goal: string;
  blankTemplate: string;
  acceptedAnswers: string[];
  hint: string;
  explanation: string;
}

export interface VisualPredictionQuestion {
  id: string;
  lessonId: string;
  topicTitle: string;
  mode: 'visual-prediction';
  difficulty: 'scratch' | 'intermediate' | 'advanced';
  prompt: string;
  repoSnapshot: RepoState;
  commandToRun: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TerminalDrillQuestion {
  id: string;
  lessonId: string;
  topicTitle: string;
  mode: 'terminal-drill';
  difficulty: 'scratch' | 'intermediate' | 'advanced';
  prompt: string;
  scenario: string;
  startingState: RepoState;
  quickCommands: string[];
  hints: string[];
  validateState: (state: RepoState, commandHistory: string[]) => boolean;
  explanation: string;
}

export type DailyTestQuestion =
  | CommandRecallQuestion
  | VisualPredictionQuestion
  | TerminalDrillQuestion;

export const DAILY_TEST_BANK: DailyTestQuestion[] = [
  // =========================================================
  // MODULE 1: SCRATCH FOUNDATIONS (why-vc, git-init, git-status, git-add)
  // =========================================================
  {
    id: 'dt-why-vc-recall',
    lessonId: 'lesson-why-vc',
    topicTitle: 'Version Control Basics',
    mode: 'command-recall',
    difficulty: 'scratch',
    prompt: 'Verify that Git is installed and inspect its usage summary in the terminal.',
    goal: 'Print the core Git CLI help overview.',
    blankTemplate: '___',
    acceptedAnswers: ['git', 'git --help', 'git help'],
    hint: 'It is the single three-letter base command for every Git operation.',
    explanation:
      'Running "git" by itself confirms Git is installed and prints its command summary.',
  },
  {
    id: 'dt-why-vc-visual',
    lessonId: 'lesson-why-vc',
    topicTitle: 'Three Git Areas',
    mode: 'visual-prediction',
    difficulty: 'scratch',
    prompt:
      'Before running git add on a brand-new file "recipe.txt", where does that file live?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [
        { name: 'recipe.txt', content: 'Flour, sugar, butter.', status: 'untracked' },
      ],
      stagingArea: [],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    commandToRun: 'git status',
    options: [
      'In the Working Directory as an untracked file.',
      'Locked inside the Local Repository as a permanent commit.',
      'Uploaded automatically to GitHub.',
    ],
    correctIndex: 0,
    explanation:
      'New files start in the Working Directory as untracked until you explicitly stage them with git add.',
  },
  {
    id: 'dt-init-recall',
    lessonId: 'lesson-git-init',
    topicTitle: 'Repository Initialization',
    mode: 'command-recall',
    difficulty: 'scratch',
    prompt: 'Turn a regular project folder into a tracked Git repository.',
    goal: 'Create the hidden .git vault inside the current folder.',
    blankTemplate: 'git ____',
    acceptedAnswers: ['git init'],
    hint: 'Short for "initialize".',
    explanation:
      '"git init" creates the hidden .git directory and establishes the default main branch.',
  },
  {
    id: 'dt-init-drill',
    lessonId: 'lesson-git-init',
    topicTitle: 'Initialize Workspace Drill',
    mode: 'terminal-drill',
    difficulty: 'scratch',
    prompt: 'Activate Git tracking in this uninitialized project folder.',
    scenario:
      'You created a new folder for your portfolio site, but Git is not tracking it yet. Initialize the repository now.',
    startingState: {
      isInitialized: false,
      workingDirectory: [
        { name: 'index.html', content: '<h1>Portfolio</h1>', status: 'untracked' },
      ],
      stagingArea: [],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git init', 'git status'],
    hints: ['Type "git init" to initialize the .git vault.'],
    validateState: (state) => state.isInitialized === true,
    explanation:
      'Once "git init" runs, isInitialized becomes true and the Working Directory becomes ready for staging.',
  },
  {
    id: 'dt-status-recall',
    lessonId: 'lesson-git-status',
    topicTitle: 'Checking Workspace Status',
    mode: 'command-recall',
    difficulty: 'scratch',
    prompt: 'Inspect which files are untracked, modified, or staged without changing anything.',
    goal: 'Display the live workspace status manifest.',
    blankTemplate: 'git ______',
    acceptedAnswers: ['git status'],
    hint: 'Ask Git for the current "status" of your folder.',
    explanation:
      '"git status" safely reports untracked, modified, and staged files on the active branch.',
  },
  {
    id: 'dt-status-visual',
    lessonId: 'lesson-git-status',
    topicTitle: 'Reading Status Output',
    mode: 'visual-prediction',
    difficulty: 'scratch',
    prompt: 'Inspect the repository below. What will Git report when you run the command?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [
        { name: 'notes.txt', content: 'Draft notes', status: 'untracked' },
        { name: 'index.html', content: '<h1>Home</h1>', status: 'staged' },
      ],
      stagingArea: ['index.html'],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    commandToRun: 'git status',
    options: [
      'index.html under "Changes to be committed" and notes.txt under "Untracked files".',
      'Nothing to commit, working tree clean.',
      'Both files already sealed inside commit history.',
    ],
    correctIndex: 0,
    explanation:
      'Staged files appear under "Changes to be committed", while untracked files appear separately under "Untracked files".',
  },
  {
    id: 'dt-add-recall',
    lessonId: 'lesson-git-add',
    topicTitle: 'Staging Files',
    mode: 'command-recall',
    difficulty: 'scratch',
    prompt: 'Stage all untracked and modified files in the current directory at once.',
    goal: 'Move every pending file into the Staging Area.',
    blankTemplate: 'git ___ _',
    acceptedAnswers: ['git add .', 'git add --all', 'git add -A'],
    hint: 'Use the "add" subcommand followed by a single dot "." for the current directory.',
    explanation:
      '"git add ." stages all untracked and modified files in the current workspace.',
  },
  {
    id: 'dt-add-drill',
    lessonId: 'lesson-git-add',
    topicTitle: 'Selective Staging Drill',
    mode: 'terminal-drill',
    difficulty: 'intermediate',
    prompt: 'Stage ONLY "styles.css" for the next commit while leaving "draft.txt" untracked.',
    scenario:
      'Your stylesheet is finished, but draft.txt is messy. Stage styles.css without staging draft.txt.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'styles.css', content: 'body { color: #111; }', status: 'untracked' },
        { name: 'draft.txt', content: 'WIP thoughts...', status: 'untracked' },
      ],
      stagingArea: [],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git status', 'git add styles.css'],
    hints: ['Run "git add styles.css" rather than "git add .".'],
    validateState: (state) => {
      const css = state.workingDirectory.find((f) => f.name === 'styles.css');
      const draft = state.workingDirectory.find((f) => f.name === 'draft.txt');
      return css?.status === 'staged' && draft?.status === 'untracked';
    },
    explanation:
      'Naming a specific file with "git add styles.css" lets you keep unfinished drafts out of the commit.',
  },

  // =========================================================
  // MODULE 2: COMMITS & HISTORY (git-commit, git-log)
  // =========================================================
  {
    id: 'dt-commit-recall',
    lessonId: 'lesson-git-commit',
    topicTitle: 'Recording Commits',
    mode: 'command-recall',
    difficulty: 'intermediate',
    prompt: 'Commit your staged files with the exact message "Add navbar".',
    goal: 'Seal staged files into the Local Repository.',
    blankTemplate: 'git ______ __ "Add navbar"',
    acceptedAnswers: ['git commit -m "Add navbar"', "git commit -m 'Add navbar'"],
    hint: 'Use "commit" with the "-m" message flag.',
    explanation:
      '"git commit -m \\"Add navbar\\"" snapshots everything in the Staging Area into the commit timeline.',
  },
  {
    id: 'dt-commit-visual',
    lessonId: 'lesson-git-commit',
    topicTitle: 'Staging vs Commit State',
    mode: 'visual-prediction',
    difficulty: 'intermediate',
    prompt: 'What happens to the Staging Area right after running the command below?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [
        { name: 'app.js', content: 'console.log("ready");', status: 'staged' },
      ],
      stagingArea: ['app.js'],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    commandToRun: 'git commit -m "Initialize app"',
    options: [
      'A new commit appears in Local Repo, app.js becomes Committed, and Staging Area clears.',
      'app.js is deleted from the Working Directory.',
      'Staging Area stays filled with app.js and no commit is created.',
    ],
    correctIndex: 0,
    explanation:
      'Committing moves staged changes into a permanent snapshot in Local Repo and clears the Staging Area for your next batch of edits.',
  },
  {
    id: 'dt-commit-drill',
    lessonId: 'lesson-git-commit',
    topicTitle: 'Stage & Commit Incident Drill',
    mode: 'terminal-drill',
    difficulty: 'intermediate',
    prompt: 'Stage "readme.md" and commit it to the repository with any descriptive message.',
    scenario:
      'You wrote readme.md, but it is still untracked. Stage it and record a permanent commit.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'readme.md', content: '# GitMaster Project', status: 'untracked' },
      ],
      stagingArea: [],
      commits: [],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git status', 'git add readme.md', 'git commit -m "Add readme"'],
    hints: ['First run "git add readme.md", then run git commit -m "Add readme".'],
    validateState: (state) => {
      const readme = state.workingDirectory.find((f) => f.name === 'readme.md');
      return state.commits.length >= 1 && readme?.status === 'committed';
    },
    explanation:
      'Staging with git add followed by git commit -m "..." turns untracked files into permanent repository snapshots.',
  },
  {
    id: 'dt-log-recall',
    lessonId: 'lesson-git-log',
    topicTitle: 'Inspecting Commit History',
    mode: 'command-recall',
    difficulty: 'intermediate',
    prompt: 'List the chronological history of commits made on the current branch.',
    goal: 'Print the commit ledger.',
    blankTemplate: 'git ___',
    acceptedAnswers: ['git log', 'git log --oneline'],
    hint: 'Think of reading your project\'s "log" book.',
    explanation:
      '"git log" displays commit hashes, authors, dates, and messages in reverse chronological order.',
  },

  // =========================================================
  // MODULE 3: BRANCHING & MERGING (git-branch, git-merge)
  // =========================================================
  {
    id: 'dt-branch-recall',
    lessonId: 'lesson-git-branch',
    topicTitle: 'Creating & Switching Branches',
    mode: 'command-recall',
    difficulty: 'intermediate',
    prompt: 'Create and immediately switch to a new branch named "feature-auth".',
    goal: 'Spawn and enter a parallel feature branch in one command.',
    blankTemplate: 'git ________ __ feature-auth',
    acceptedAnswers: ['git checkout -b feature-auth', 'git switch -c feature-auth'],
    hint: 'Use "checkout -b" (or "switch -c") followed by the branch name.',
    explanation:
      '"git checkout -b feature-auth" creates the branch and moves HEAD onto it in a single step.',
  },
  {
    id: 'dt-branch-drill',
    lessonId: 'lesson-git-branch',
    topicTitle: 'Isolate Experiment Drill',
    mode: 'terminal-drill',
    difficulty: 'intermediate',
    prompt: 'Create a branch named "experiment" and switch onto it.',
    scenario:
      'Before testing risky changes, leave main untouched and switch onto a brand-new "experiment" branch.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'index.html', content: '<h1>Stable v1</h1>', status: 'committed' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'c101a2b',
          parentIds: [],
          message: 'Stable v1 release',
          files: { 'index.html': '<h1>Stable v1</h1>' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git branch experiment', 'git checkout -b experiment'],
    hints: ['Run "git checkout -b experiment" or "git branch experiment" then "git checkout experiment".'],
    validateState: (state) =>
      state.branches.includes('experiment') && state.currentBranch === 'experiment',
    explanation:
      'Creating and switching to "experiment" guarantees your main branch remains clean and deployable.',
  },
  {
    id: 'dt-merge-visual',
    lessonId: 'lesson-git-merge',
    topicTitle: 'Branch Merge Direction',
    mode: 'visual-prediction',
    difficulty: 'advanced',
    prompt:
      'You are currently on "feature-lasers". You want to merge its commits INTO "main". Which command sequence is right?',
    repoSnapshot: {
      isInitialized: true,
      workingDirectory: [],
      stagingArea: [],
      commits: [
        {
          id: 'a1b2c3d',
          parentIds: [],
          message: 'Initial commit',
          files: {},
          branch: 'main',
        },
        {
          id: 'b2c3d4e',
          parentIds: ['a1b2c3d'],
          message: 'Add lasers',
          files: { 'lasers.txt': 'Online' },
          branch: 'feature-lasers',
        },
      ],
      currentBranch: 'feature-lasers',
      branches: ['main', 'feature-lasers'],
      remoteCommits: [],
      remoteBranches: [],
    },
    commandToRun: 'git checkout main && git merge feature-lasers',
    options: [
      'Switch to main first, then merge feature-lasers into main.',
      'Stay on feature-lasers and run git merge main.',
      'Run git init main to overwrite main with feature-lasers.',
    ],
    correctIndex: 0,
    explanation:
      'Always switch to the receiving branch (main) first, then run git merge <source-branch>.',
  },
  {
    id: 'dt-merge-drill',
    lessonId: 'lesson-git-merge',
    topicTitle: 'Merge to Production Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Switch back to "main" and merge "feature-ui" into it.',
    scenario:
      'The "feature-ui" branch is tested and ready. Bring its commit into the "main" branch.',
    startingState: {
      isInitialized: true,
      workingDirectory: [],
      stagingArea: [],
      commits: [
        {
          id: 'a101010',
          parentIds: [],
          message: 'Base app',
          files: {},
          branch: 'main',
        },
        {
          id: 'b202020',
          parentIds: ['a101010'],
          message: 'Add editorial theme',
          files: { 'theme.css': 'cream & ink' },
          branch: 'feature-ui',
        },
      ],
      currentBranch: 'feature-ui',
      branches: ['main', 'feature-ui'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git checkout main', 'git merge feature-ui'],
    hints: ['First run "git checkout main", then "git merge feature-ui".'],
    validateState: (state) =>
      state.currentBranch === 'main' &&
      state.commits.some((c) => c.branch === 'main' && c.id === 'b202020'),
    explanation:
      'Checking out main and merging feature-ui integrates the new commit onto main.',
  },

  // =========================================================
  // MODULE 4: REMOTES & GITHUB (git-clone)
  // =========================================================
  {
    id: 'dt-clone-recall',
    lessonId: 'lesson-git-clone',
    topicTitle: 'Cloning Remote Repos',
    mode: 'command-recall',
    difficulty: 'intermediate',
    prompt:
      'Download a remote repository from "https://github.com/gitmaster/starter" to your machine.',
    goal: 'Clone the full remote history and configure origin.',
    blankTemplate: 'git _____ https://github.com/gitmaster/starter',
    acceptedAnswers: ['git clone https://github.com/gitmaster/starter'],
    hint: 'Use the "clone" subcommand.',
    explanation:
      '"git clone <url>" copies the remote repository, initializes .git, and sets up the origin remote.',
  },

  // =========================================================
  // MODULE 5: TIME TRAVEL & TOOLS (git-restore, git-stash)
  // =========================================================
  {
    id: 'dt-restore-recall',
    lessonId: 'lesson-git-restore',
    topicTitle: 'Undoing Local Edits',
    mode: 'command-recall',
    difficulty: 'advanced',
    prompt: 'Discard uncommitted broken edits in "config.json" and revert to the last commit.',
    goal: 'Restore config.json cleanly.',
    blankTemplate: 'git _______ config.json',
    acceptedAnswers: ['git restore config.json', 'git checkout -- config.json'],
    hint: 'Think of "restoring" the file back to its last committed version.',
    explanation:
      '"git restore config.json" overwrites uncommitted local edits with the clean snapshot from the latest commit.',
  },
  {
    id: 'dt-restore-drill',
    lessonId: 'lesson-git-restore',
    topicTitle: 'Revert Broken File Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Discard the accidental edits in "cookie-recipe.txt" using git restore.',
    scenario:
      'You accidentally typed gibberish into cookie-recipe.txt. Restore it back to the last committed version.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        {
          name: 'cookie-recipe.txt',
          content: 'CORRUPTED KEYBOARD SPAM!!!',
          status: 'modified',
        },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'd4e5f6a',
          parentIds: [],
          message: 'Golden recipe',
          files: { 'cookie-recipe.txt': 'Flour, butter, dark chocolate.' },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git status', 'git restore cookie-recipe.txt'],
    hints: ['Run "git restore cookie-recipe.txt".'],
    validateState: (state) => {
      const file = state.workingDirectory.find((f) => f.name === 'cookie-recipe.txt');
      return file?.status === 'committed' && file.content === 'Flour, butter, dark chocolate.';
    },
    explanation:
      '"git restore cookie-recipe.txt" safely brought back the committed content.',
  },
  {
    id: 'dt-stash-drill',
    lessonId: 'lesson-git-stash',
    topicTitle: 'Shelving Unfinished Work Drill',
    mode: 'terminal-drill',
    difficulty: 'advanced',
    prompt: 'Temporarily shelve your modified "cart.txt" so the working tree is clean.',
    scenario:
      'An urgent hotfix is needed on main, but cart.txt is half-finished. Stash your work without committing a broken draft.',
    startingState: {
      isInitialized: true,
      workingDirectory: [
        { name: 'cart.txt', content: 'Half-done checkout logic...', status: 'modified' },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'e1f2a3b',
          parentIds: [],
          message: 'Initial store',
          files: {},
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      remoteCommits: [],
      remoteBranches: [],
    },
    quickCommands: ['git status', 'git stash'],
    hints: ['Run "git stash" to shelve modified files.'],
    validateState: (state) =>
      state.workingDirectory.every((f) => f.status !== 'modified' && f.status !== 'staged'),
    explanation:
      '"git stash" tucked your modified draft onto the stash stack, leaving a clean working directory.',
  },
];
