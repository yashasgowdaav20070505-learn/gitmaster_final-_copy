import { Module, Badge } from '../types';

export const ADVANCED_BADGES: Badge[] = [
  {
    id: 'badge-advanced-grandmaster',
    title: 'Advanced Git Grandmaster',
    description:
      'Completed all 8 Modules (20/20 lessons), mastering history surgery, rebasing, and GitHub release workflows.',
    category: 'advanced',
    icon: 'Award',
  },
];

export const ADVANCED_MODULES: Module[] = [
  {
    id: 'module-rewrite',
    title: '6. Inspecting & Rewriting History',
    description:
      'Compare line-by-line diffs, safely revert public mistakes, and move HEAD pointers with reset.',
    icon: 'History',
    lessons: [
      {
        id: 'lesson-git-diff',
        moduleId: 'module-rewrite',
        title: 'Comparing Changes: git diff',
        description:
          'Inspect unstaged and staged (--staged) line-by-line differences before committing.',
        scenario:
          'You edited "app.ts" and staged "config.json" before lunch. Now you are back at your desk and cannot remember which exact lines you changed. Committing blindly could ship a debug flag to production! You need an exact line-by-line comparison.',
        problem:
          'Running "git status" tells you WHICH files changed, but not WHAT lines inside those files were added or removed.',
        whyExists:
          'The "git diff" command prints a line-by-line comparison between your Working Directory, Staging Area, and last Commit so you can audit every edit before sealing a snapshot.',
        explanation:
          '1. `git diff` compares your Working Directory against the Staging Area (shows unstaged changes).\n2. `git diff --staged` (or `--cached`) compares the Staging Area against the last Commit (shows what will be committed next).',
        realWorldExample:
          'Think of proofreading a contract with red and green highlighter marks showing deleted sentences (-) and newly inserted clauses (+) before signing.',
        importantNotes: [
          'Lines starting with "-" in red were removed; lines starting with "+" in green were added.',
          'Always run "git diff --staged" right before "git commit" to catch accidental console logs or secrets.',
        ],
        quiz: {
          question:
            'Which command displays the exact line-by-line changes that are ALREADY staged for the next commit?',
          options: [
            'git diff',
            'git diff --staged',
            'git status --lines',
          ],
          correctAnswerIndex: 1,
          explanation:
            '"git diff --staged" compares the Staging Area against HEAD, showing exactly what your next commit will record.',
        },
        terminalChallenge: {
          instruction:
            'First inspect unstaged changes with "git diff", then inspect staged changes with "git diff --staged".',
          description:
            'Compare both your Working Directory and Staging Area line-by-line.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              {
                name: 'app.ts',
                content: 'export const retries = 5;',
                status: 'modified',
              },
              {
                name: 'config.json',
                content: '{"theme":"cherry"}',
                status: 'staged',
              },
            ],
            stagingArea: ['config.json'],
            commits: [
              {
                id: 'c101a11',
                parentIds: [],
                message: 'Initial app config',
                files: {
                  'app.ts': 'export const retries = 3;',
                  'config.json': '{"theme":"cream"}',
                },
                branch: 'main',
              },
            ],
            currentBranch: 'main',
            branches: ['main'],
            remoteCommits: [],
            remoteBranches: [],
          },
          targetCommands: ['git diff', 'git diff --staged'],
          validationType: 'commands',
          hints: [
            'First run "git diff" to see unstaged edits in app.ts.',
            'Next run "git diff --staged" to inspect staged edits in config.json.',
          ],
        },
        xpReward: 170,
        coinReward: 35,
      },
      {
        id: 'lesson-git-revert',
        moduleId: 'module-rewrite',
        title: 'Safe Public Undo: git revert',
        description:
          'Create a new inverse commit to safely undo a bad commit on shared branches without rewriting history.',
        scenario:
          'A teammate pushed commit "f9e8d7c" to the shared "main" branch, and it accidentally broke the checkout discount math! Five other engineers have already pulled that commit. If you erase history, everyone else\'s repository will break.',
        problem:
          'Deleting commits from a shared public branch causes severe sync conflicts for everyone else on the team.',
        whyExists:
          'The "git revert <sha>" command creates a brand-new commit that applies the exact opposite changes of the bad commit. History moves forward cleanly without erasing past records.',
        explanation:
          'Run `git revert f9e8d7c` to generate an inverse commit such as `Revert "Break checkout discount"`. Every teammate can pull this new commit smoothly.',
        realWorldExample:
          'In accounting, you never rip a page out of a public ledger with white-out; you write a new balancing correction entry underneath.',
        importantNotes: [
          'Use "git revert" for any commit that has ALREADY been pushed to a shared branch like main.',
          'Unlike reset, revert preserves the full audit trail of what happened and when it was fixed.',
        ],
        quiz: {
          question:
            'Why should you use "git revert" instead of "git reset --hard" on a shared branch like main?',
          options: [
            'git revert creates a safe new inverse commit without rewriting shared history.',
            'git revert deletes the .git folder so teammates cannot see the bug.',
            'git revert only works on untracked local files.',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"git revert" leaves existing commits untouched and adds a new inverse commit, keeping shared team history intact.',
        },
        terminalChallenge: {
          instruction:
            'Safely undo the faulty commit "f9e8d7c" on main using git revert.',
          description:
            'Create an inverse commit that restores checkout.ts without rewriting history.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              {
                name: 'checkout.ts',
                content: 'return total * 999;',
                status: 'committed',
              },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a1b2c3d',
                parentIds: [],
                message: 'Initial checkout',
                files: { 'checkout.ts': 'return total;' },
                branch: 'main',
              },
              {
                id: 'f9e8d7c',
                parentIds: ['a1b2c3d'],
                message: 'Break checkout discount',
                files: { 'checkout.ts': 'return total * 999;' },
                branch: 'main',
              },
            ],
            currentBranch: 'main',
            branches: ['main'],
            remoteCommits: [],
            remoteBranches: [],
          },
          targetCommands: ['git revert f9e8d7c'],
          validationType: 'commands',
          hints: ['Type "git revert f9e8d7c" and press Enter.'],
        },
        xpReward: 180,
        coinReward: 35,
      },
      {
        id: 'lesson-git-reset',
        moduleId: 'module-rewrite',
        title: 'Moving HEAD: git reset',
        description:
          'Move branch pointers backward and control Staging vs. Working Directory with --soft, --mixed, and --hard.',
        scenario:
          'You committed "WIP premature commit" locally on your private feature branch before pushing, and realized you forgot to include two helper functions. You want to step the branch pointer back one commit while keeping your edits staged so you can finish cleanly.',
        problem:
          'Sometimes you want to undo a local unpushed commit completely, or uncommit it while keeping your code intact in Staging or Working Directory.',
        whyExists:
          'The "git reset" command rewinds your current branch pointer (HEAD) to an earlier commit, with three modes controlling what happens to your Staging Area and Working Directory.',
        explanation:
          '• `git reset --soft HEAD~1`: Moves HEAD back 1 commit, keeping changes **Staged**.\n• `git reset --mixed HEAD~1` (default): Moves HEAD back, unstages changes into **Working Directory**.\n• `git reset --hard HEAD~1`: Moves HEAD back and **deletes** uncommitted edits.',
        realWorldExample:
          'Rewinding a DVR: "--soft" pauses with your snacks still on the tray (staged); "--mixed" puts them back in the kitchen (working dir); "--hard" throws the snacks away.',
        importantNotes: [
          'Only use "git reset" on local, unpushed commits—never rewrite shared history.',
          '"HEAD~1" means "one commit before the current HEAD tip".',
        ],
        quiz: {
          question:
            'Which git reset mode moves HEAD back 1 commit while keeping your files in the Staging Area?',
          options: [
            'git reset --hard HEAD~1',
            'git reset --soft HEAD~1',
            'git reset --delete HEAD~1',
          ],
          correctAnswerIndex: 1,
          explanation:
            '"--soft" rewinds the commit pointer while leaving your changes staged and ready to re-commit.',
        },
        terminalChallenge: {
          instruction:
            'Rewind your last local commit using "git reset --soft HEAD~1" so its files return to the Staging Area.',
          description:
            'Move HEAD back one commit while keeping changes staged.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              {
                name: 'login.ts',
                content: 'auth(); // draft',
                status: 'committed',
              },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a101b20',
                parentIds: [],
                message: 'Add login form',
                files: { 'login.ts': 'auth()' },
                branch: 'main',
              },
              {
                id: 'e456f78',
                parentIds: ['a101b20'],
                message: 'WIP premature commit',
                files: { 'login.ts': 'auth(); // draft' },
                branch: 'main',
              },
            ],
            currentBranch: 'main',
            branches: ['main'],
            remoteCommits: [],
            remoteBranches: [],
          },
          targetCommands: ['git reset --soft HEAD~1'],
          validationType: 'commands',
          hints: ['Run "git reset --soft HEAD~1".'],
        },
        xpReward: 190,
        coinReward: 40,
      },
    ],
  },
  {
    id: 'module-surgery',
    title: '7. Advanced Branch Surgery',
    description:
      'Maintain razor-clean linear timelines with rebase, cherry-pick urgent hotfixes, and rescue lost commits with reflog.',
    icon: 'GitBranch',
    lessons: [
      {
        id: 'lesson-git-rebase',
        moduleId: 'module-surgery',
        title: 'Clean Linear History: git rebase',
        description:
          'Replay your feature branch commits cleanly on top of the latest main branch tip.',
        scenario:
          'While you were building "feature-search", your team merged an important security patch onto "main". Your branch is now based on an outdated snapshot. Instead of creating noisy merge commits, your team prefers a clean, straight-line commit history.',
        problem:
          'Frequent back-and-forth merges from main into feature branches create a tangled web of "Merge branch main" commits.',
        whyExists:
          'The "git rebase <branch>" command picks up your feature commits, fast-forwards your branch base to the latest tip of main, and replays your commits neatly on top.',
        explanation:
          'While standing on your feature branch (`feature-search`), run `git rebase main`. Git detaches your unique commits, moves the base to `main`\'s newest commit, and reapplies them one by one.',
        realWorldExample:
          'Rebasing is like unplugging a Lego tower from an old table and snapping the exact same tower cleanly onto a newer, updated table.',
        importantNotes: [
          'Rebasing rewrites commit hashes on your feature branch—follow the Golden Rule: never rebase public branches others are working on!',
          'The result is a crisp, linear history that is easy to bisect and review.',
        ],
        quiz: {
          question:
            'If you are currently on "feature-search" and want to replay its commits onto the tip of "main", what should you run?',
          options: [
            'git rebase main',
            'git rebase feature-search',
            'git branch --rebase main',
          ],
          correctAnswerIndex: 0,
          explanation:
            'Running "git rebase main" while checked out on feature-search moves feature-search onto the latest tip of main.',
        },
        terminalChallenge: {
          instruction:
            'You are on "feature-search". Rebase your branch onto the latest "main" commit.',
          description:
            'Replay feature-search commits cleanly on top of main.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              {
                name: 'search.ts',
                content: 'export const search = () => {};',
                status: 'committed',
              },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a111111',
                parentIds: [],
                message: 'Initial app',
                files: {},
                branch: 'main',
              },
              {
                id: 'b222222',
                parentIds: ['a111111'],
                message: 'Patch security header',
                files: { 'security.ts': 'headers()' },
                branch: 'main',
              },
              {
                id: 'c333333',
                parentIds: ['a111111'],
                message: 'Build search bar',
                files: { 'search.ts': 'export const search = () => {};' },
                branch: 'feature-search',
              },
            ],
            currentBranch: 'feature-search',
            branches: ['main', 'feature-search'],
            remoteCommits: [],
            remoteBranches: [],
          },
          targetCommands: ['git rebase main'],
          validationType: 'commands',
          hints: ['Type "git rebase main" while on feature-search.'],
        },
        xpReward: 200,
        coinReward: 40,
      },
      {
        id: 'lesson-git-cherry-pick',
        moduleId: 'module-surgery',
        title: 'Surgical Commits: git cherry-pick',
        description:
          'Pick a single hotfix commit from one branch and apply it directly onto another.',
        scenario:
          'On the experimental "feature-payments" branch, someone committed a massive unfinished cart redesign ("d400004") AND a tiny, critical tax calculation fix ("h777fix"). Production on "main" needs ONLY the tax fix immediately—not the unfinished redesign!',
        problem:
          'Running "git merge feature-payments" would drag in the entire unfinished redesign alongside the hotfix.',
        whyExists:
          'The "git cherry-pick <sha>" command plucks a single chosen commit by its hash from anywhere in the repository and applies just that commit onto your active branch.',
        explanation:
          'Switch to the receiving branch (`main`), copy the exact commit hash (`h777fix`), and run `git cherry-pick h777fix`. Git creates a fresh copy of that single fix on `main`.',
        realWorldExample:
          'Think of picking one ripe cherry off a tree branch without chopping down and dragging the whole branch into your basket.',
        importantNotes: [
          'Cherry-picked commits receive a brand-new commit SHA on the target branch.',
          'Ideal for emergency production hotfixes that cannot wait for a full feature release.',
        ],
        quiz: {
          question:
            'When should you use "git cherry-pick <sha>" instead of "git merge"?',
          options: [
            'When you want to copy one specific commit from another branch without merging all its other commits.',
            'When you want to delete a remote branch permanently.',
            'When you want to initialize a brand new repository.',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"git cherry-pick" applies only the targeted commit onto your current branch, leaving unrelated commits behind.',
        },
        terminalChallenge: {
          instruction:
            'You are on "main". Surgically apply only the tax hotfix commit "h777fix" from feature-payments.',
          description:
            'Cherry-pick commit h777fix onto main without merging d400004.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              { name: 'app.ts', content: 'v1.0', status: 'committed' },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a100001',
                parentIds: [],
                message: 'Production v1.0',
                files: { 'app.ts': 'v1.0' },
                branch: 'main',
              },
              {
                id: 'd400004',
                parentIds: ['a100001'],
                message: 'Redesign cart layout',
                files: { 'cart.tsx': 'WIP' },
                branch: 'feature-payments',
              },
              {
                id: 'h777fix',
                parentIds: ['d400004'],
                message: 'Fix critical tax rounding',
                files: { 'tax.ts': 'roundCents(val)' },
                branch: 'feature-payments',
              },
            ],
            currentBranch: 'main',
            branches: ['main', 'feature-payments'],
            remoteCommits: [],
            remoteBranches: [],
          },
          targetCommands: ['git cherry-pick h777fix'],
          validationType: 'commands',
          hints: ['Type "git cherry-pick h777fix".'],
        },
        xpReward: 200,
        coinReward: 40,
      },
      {
        id: 'lesson-git-reflog',
        moduleId: 'module-surgery',
        title: 'The Safety Net: git reflog',
        description:
          'Inspect HEAD movement history to locate and recover "lost" commits after an accidental reset.',
        scenario:
          'Panic strikes! You ran "git reset --hard HEAD~1" and wiped out your commit "Add payment gateway". Now "git log" does not show it at all! Did you lose hours of work forever? Not in Git—Git keeps a secret flight recorder of every place HEAD has ever pointed.',
        problem:
          'Commands like "git reset --hard" or bad rebases remove commits from "git log", making them look permanently deleted.',
        whyExists:
          'The "git reflog" (Reference Log) records every local movement of HEAD—commits, checkouts, resets, and rebases—giving you the exact SHA hash needed to rescue "lost" work.',
        explanation:
          'Run `git reflog` to inspect entries like `HEAD@{0}: reset: moving to HEAD~1` and `HEAD@{1}: commit: Add payment gateway (e9f8a7b)`. Once you spot the lost hash, `git reset --hard e9f8a7b` brings it straight back!',
        realWorldExample:
          'If "git log" is your published photo album, "git reflog" is the security camera tape in your studio showing every frame you ever touched.',
        importantNotes: [
          'Committed work is almost NEVER truly lost in Git for at least 30–90 days thanks to the reflog.',
          'Reflog is purely local to your machine—it is not shared on GitHub.',
        ],
        quiz: {
          question:
            'After accidentally running "git reset --hard HEAD~1", how do you find the SHA of the missing commit?',
          options: [
            'Run "git reflog" to inspect the local history of HEAD movements.',
            'Run "git init" to rebuild the missing commits.',
            'Run "git status --lost" to restore deleted commits.',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"git reflog" lists recent HEAD positions including commits that are no longer reachable from any branch tip.',
        },
        terminalChallenge: {
          instruction:
            'Inspect the local HEAD movement ledger with "git reflog" to locate the missing payment gateway commit.',
          description:
            'Display the reflog entries to reveal lost commit hashes.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              { name: 'app.ts', content: 'init', status: 'committed' },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a1b2c3d',
                parentIds: [],
                message: 'Initial app',
                files: { 'app.ts': 'init' },
                branch: 'main',
              },
            ],
            currentBranch: 'main',
            branches: ['main'],
            remoteCommits: [],
            remoteBranches: [],
            reflog: [
              {
                id: 'a1b2c3d',
                action: 'reset: moving to HEAD~1',
                target: 'main',
              },
              {
                id: 'e9f8a7b',
                action: 'commit: Add payment gateway',
                target: 'main',
                message: 'Add payment gateway',
                files: { 'pay.ts': 'charge()' },
              },
              {
                id: 'a1b2c3d',
                action: 'commit (initial): Initial app',
                target: 'main',
              },
            ],
          },
          targetCommands: ['git reflog'],
          validationType: 'commands',
          hints: ['Type "git reflog" and press Enter.'],
        },
        xpReward: 210,
        coinReward: 45,
      },
    ],
  },
  {
    id: 'module-github-pro',
    title: '8. GitHub Collaboration & Release Workflows',
    description:
      'Sync safely with remote teams using fetch & pull, publish Pull Request branches, and ship versioned release tags.',
    icon: 'Globe',
    lessons: [
      {
        id: 'lesson-git-fetch-pull',
        moduleId: 'module-github-pro',
        title: 'Syncing Remotes: git fetch vs. git pull',
        description:
          'Safely download remote origin updates with fetch before integrating them with pull.',
        scenario:
          'Your teammate pushed new API updates to GitHub ("origin/main"). Before blindly merging their changes into your local work, you want to download the latest remote metadata to inspect what changed, and then integrate those updates cleanly.',
        problem:
          'Jumping straight to merging unknown remote changes can surprise you with unexpected conflicts in the middle of your work.',
        whyExists:
          '"git fetch" downloads new remote commits safely into tracking pointers (like origin/main) WITHOUT touching your local branch. "git pull" downloads AND immediately merges them into your active branch.',
        explanation:
          '• `git fetch`: Safe reconnaissance. Updates `origin/main` so you can review changes first.\n• `git pull`: Effectively `git fetch` + `git merge`, bringing remote commits directly into your active local branch.',
        realWorldExample:
          '"git fetch" is checking your mailbox and reading the envelopes on the porch; "git pull" is opening the mail and filing it straight into your active binder.',
        importantNotes: [
          'Running "git fetch" is 100% non-destructive—it never modifies your Working Directory.',
          'Always commit or stash local edits before running "git pull".',
        ],
        quiz: {
          question:
            'What is the key difference between "git fetch" and "git pull"?',
          options: [
            'git fetch downloads remote updates without modifying your current local branch, while git pull downloads and immediately merges them.',
            'git fetch uploads your code to GitHub, while git pull deletes remote branches.',
            'There is no difference; both overwrite uncommitted files.',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"git fetch" updates remote-tracking references safely, whereas "git pull" performs a fetch followed by a merge.',
        },
        terminalChallenge: {
          instruction:
            'First run "git fetch" to check remote origin updates, then run "git pull" to merge them into main.',
          description:
            'Fetch remote metadata first, then pull remote commits into local main.',
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
                message: 'Initial setup',
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
                message: 'Initial setup',
                files: { 'app.ts': 'v1' },
                branch: 'main',
              },
              {
                id: 'r889900',
                parentIds: ['a1b2c3d'],
                message: 'Teammate: Update API endpoint',
                files: { 'api.ts': 'fetch("/v2")' },
                branch: 'main',
              },
            ],
            remoteBranches: ['origin/main'],
          },
          targetCommands: ['git fetch', 'git pull'],
          validationType: 'commands',
          hints: [
            'First type "git fetch" to inspect origin updates.',
            'Next type "git pull" to merge commit r889900 into local main.',
          ],
        },
        xpReward: 190,
        coinReward: 40,
      },
      {
        id: 'lesson-git-push-pr',
        moduleId: 'module-github-pro',
        title: 'Publishing Branches & PRs: git push',
        description:
          'Publish local feature branches to GitHub with -u upstream tracking to open Pull Requests.',
        scenario:
          'You finished building the "feature-oauth" login flow on your laptop. Right now, that branch only exists locally—your teammates on GitHub cannot review it or open a Pull Request yet! You need to publish the branch to "origin" and link upstream tracking.',
        problem:
          'A newly created local branch has no remote counterpart on GitHub until you explicitly push it.',
        whyExists:
          'Running "git push -u origin <branch>" uploads your branch commits to GitHub and sets the upstream tracking link (-u) so future pushes and pulls only require "git push" or "git pull".',
        explanation:
          'Use `git push -u origin feature-oauth`. Once pushed, GitHub provides a direct link to open a Pull Request (PR) so teammates can review diffs, run CI checks, and approve merging into `main`.',
        realWorldExample:
          'Pushing with "-u" is like uploading your manuscript draft to a shared editorial portal and bookmarking the exact folder for all future revisions.',
        importantNotes: [
          'The "-u" flag stands for "--set-upstream". You only need it the first time you push a new branch.',
          'Never push directly to protected production branches when your team uses Pull Requests.',
        ],
        quiz: {
          question:
            'What does the "-u" flag do in "git push -u origin feature-oauth"?',
          options: [
            'It links your local branch to the remote branch as its upstream tracker for future pushes and pulls.',
            'It unstages all files before uploading.',
            'It forces GitHub to merge your code without a Pull Request.',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"-u" (--set-upstream) establishes a tracking relationship between your local branch and origin/feature-oauth.',
        },
        terminalChallenge: {
          instruction:
            'Publish your local "feature-oauth" branch to GitHub with upstream tracking.',
          description:
            'Push feature-oauth to origin using the -u flag.',
          startingState: {
            isInitialized: true,
            workingDirectory: [
              {
                name: 'oauth.ts',
                content: 'export const login = () => {};',
                status: 'committed',
              },
            ],
            stagingArea: [],
            commits: [
              {
                id: 'a1b2c3d',
                parentIds: [],
                message: 'Base app',
                files: {},
                branch: 'main',
              },
              {
                id: 'p445566',
                parentIds: ['a1b2c3d'],
                message: 'Add OAuth login flow',
                files: { 'oauth.ts': 'export const login = () => {};' },
                branch: 'feature-oauth',
              },
            ],
            currentBranch: 'feature-oauth',
            branches: ['main', 'feature-oauth'],
            remoteCommits: [
              {
                id: 'a1b2c3d',
                parentIds: [],
                message: 'Base app',
                files: {},
                branch: 'main',
              },
            ],
            remoteBranches: ['origin/main'],
          },
          targetCommands: ['git push -u origin feature-oauth'],
          validationType: 'commands',
          hints: ['Type "git push -u origin feature-oauth".'],
        },
        xpReward: 200,
        coinReward: 40,
      },
      {
        id: 'lesson-git-tag',
        moduleId: 'module-github-pro',
        title: 'Semantic Releases: git tag',
        description:
          'Mark permanent production release milestones like v1.0.0 with annotated Git tags.',
        scenario:
          'Your app passed every test and is ready for its official v1.0.0 launch! Commit hashes like "f001000" are impossible for users and release managers to remember. You need to stamp a permanent, human-readable version marker onto this exact release commit.',
        problem:
          'Branches move forward with every new commit, whereas release versions must stay permanently pinned to one specific snapshot.',
        whyExists:
          'The "git tag" command attaches an immutable milestone label (like v1.0.0) to a commit. Annotated tags (-a) store the tagger, date, and release message for official GitHub Releases.',
        explanation:
          'Create an annotated release tag with `git tag -a v1.0.0 -m "Release v1.0.0"`. Following Semantic Versioning (MAJOR.MINOR.PATCH) communicates breaking changes (1.x.x), new features (x.1.x), and bug fixes (x.x.1).',
        realWorldExample:
          'If a branch is a moving train, a tag is a brass plaque bolted directly onto Milepost 100—it never moves.',
        importantNotes: [
          'Semantic Versioning format: MAJOR.MINOR.PATCH (e.g., v1.0.0, v1.2.0, v1.2.1).',
          'To publish tags to GitHub, run "git push origin --tags" or "git push origin v1.0.0".',
        ],
        quiz: {
          question:
            'Which command creates an annotated release tag named "v1.0.0" with a release message?',
          options: [
            'git tag -a v1.0.0 -m "Release v1.0.0"',
            'git branch -tag v1.0.0',
            'git commit --tag v1.0.0',
          ],
          correctAnswerIndex: 0,
          explanation:
            '"git tag -a <version> -m <message>" creates a full annotated tag object ideal for production releases.',
        },
        terminalChallenge: {
          instruction:
            'Stamp the current commit on main with the annotated release tag v1.0.0 and message "Release v1.0.0".',
          description:
            'Create an annotated semantic version tag on the release commit.',
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
                id: 'a1b2c3d',
                parentIds: [],
                message: 'Core app',
                files: {},
                branch: 'main',
              },
              {
                id: 'f001000',
                parentIds: ['a1b2c3d'],
                message: 'Prepare v1.0.0 release',
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
          targetCommands: ['git tag -a v1.0.0 -m "Release v1.0.0"'],
          validationType: 'commands',
          hints: ['Type: git tag -a v1.0.0 -m "Release v1.0.0"'],
        },
        xpReward: 220,
        coinReward: 50,
      },
    ],
  },
];
