import { Commit, RepoTag, ReflogEntry } from '../types';

export interface ProjectFile {
  name: string;
  content: string;
  status: 'untracked' | 'modified' | 'staged' | 'committed' | 'ignored' | 'conflicted';
  stagedContent?: string;
}

export interface ProjectWorkspaceState {
  projectId: string;
  repoName: string;
  title: string;
  subtitle: string;
  techStack: string;
  isInitialized: boolean;
  workingDirectory: ProjectFile[];
  stagingArea: string[];
  commits: Commit[];
  currentBranch: string;
  branches: string[];
  upstreamMap: Record<string, string>;
  remoteCommits: Commit[];
  remoteBranches: string[];
  tags: RepoTag[];
  reflog: ReflogEntry[];
  commandLog: string[];
  lastUpdatedAt: string;
}

export interface ProjectTicket {
  id: string;
  title: string;
  description: string;
  suggestedCommand: string;
  checkCompleted: (ws: ProjectWorkspaceState) => boolean;
}

export interface StarterProjectBlueprint {
  id: string;
  repoName: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Collaborative';
  techStack: string;
  tickets: ProjectTicket[];
  createInitialState: () => ProjectWorkspaceState;
}

export const STARTER_PROJECTS: StarterProjectBlueprint[] = [
  {
    id: 'portfolio-site',
    repoName: 'portfolio-site',
    title: 'Portfolio Website',
    subtitle: 'Edit HTML/CSS, create new pages, inspect real diffs, and push to origin/main.',
    difficulty: 'Beginner',
    techStack: 'HTML · CSS · JS',
    tickets: [
      {
        id: 'ps-t1',
        title: 'Inspect workspace & edit a file',
        description: 'Modify style.css or index.html in the Code Editor, then run git status.',
        suggestedCommand: 'git status',
        checkCompleted: (ws) =>
          ws.commandLog.some((c) => c.trim().toLowerCase().startsWith('git status')) &&
          (ws.commits.length > 1 ||
            ws.workingDirectory.some(
              (f) => f.status === 'modified' || f.status === 'staged' || f.status === 'untracked'
            )),
      },
      {
        id: 'ps-t2',
        title: 'Inspect line-by-line diff',
        description: 'Run git diff to preview your exact + / - code changes before staging.',
        suggestedCommand: 'git diff',
        checkCompleted: (ws) =>
          ws.commandLog.some((c) => c.trim().toLowerCase().startsWith('git diff')),
      },
      {
        id: 'ps-t3',
        title: 'Stage & commit your update',
        description: 'Run git add . and commit your changes with a clear message.',
        suggestedCommand: 'git commit -m "Update portfolio styling"',
        checkCompleted: (ws) => ws.commits.length >= 2,
      },
      {
        id: 'ps-t4',
        title: 'Add a new file via + New File',
        description: 'Create a new file (e.g. about.html) in the Explorer and commit it.',
        suggestedCommand: 'git add .',
        checkCompleted: (ws) =>
          ws.workingDirectory.length >= 5 &&
          ws.commits.some((c) => Object.keys(c.files).length >= 1 && c.id !== 'a10f42b'),
      },
      {
        id: 'ps-t5',
        title: 'Publish commits to GitHub',
        description: 'Push your local main commits to origin/main.',
        suggestedCommand: 'git push',
        checkCompleted: (ws) => ws.remoteCommits.length >= 2,
      },
    ],
    createInitialState: () => ({
      projectId: 'portfolio-site',
      repoName: 'portfolio-site',
      title: 'Portfolio Website',
      subtitle: 'Frontend Web App',
      techStack: 'HTML · CSS · JS',
      isInitialized: true,
      workingDirectory: [
        {
          name: 'index.html',
          content:
            '<!doctype html>\n<html>\n  <head>\n    <title>Alex Rivera — Developer</title>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <header class="hero">\n      <h1>Alex Rivera</h1>\n      <p>Full-Stack Engineer &amp; Open-Source Builder</p>\n    </header>\n  </body>\n</html>',
          status: 'committed',
        },
        {
          name: 'style.css',
          content:
            ':root {\n  --accent: #D9541E;\n  --bg: #F3EEE3;\n}\n\nbody {\n  font-family: Inter, sans-serif;\n  background: var(--bg);\n  margin: 0;\n  padding: 2rem;\n}',
          status: 'committed',
        },
        {
          name: 'script.js',
          content:
            'const projects = ["GitMaster", "CliKit", "PixelGrid"];\nconsole.log("Loaded portfolio projects:", projects.length);',
          status: 'committed',
        },
        {
          name: 'README.md',
          content:
            '# Portfolio Site\n\nPersonal developer portfolio built with semantic HTML, CSS, and vanilla JS.',
          status: 'committed',
        },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'a10f42b',
          parentIds: [],
          message: 'Initial portfolio scaffold',
          files: {
            'index.html':
              '<!doctype html>\n<html>\n  <head>\n    <title>Alex Rivera — Developer</title>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <header class="hero">\n      <h1>Alex Rivera</h1>\n      <p>Full-Stack Engineer &amp; Open-Source Builder</p>\n    </header>\n  </body>\n</html>',
            'style.css':
              ':root {\n  --accent: #D9541E;\n  --bg: #F3EEE3;\n}\n\nbody {\n  font-family: Inter, sans-serif;\n  background: var(--bg);\n  margin: 0;\n  padding: 2rem;\n}',
            'script.js':
              'const projects = ["GitMaster", "CliKit", "PixelGrid"];\nconsole.log("Loaded portfolio projects:", projects.length);',
            'README.md':
              '# Portfolio Site\n\nPersonal developer portfolio built with semantic HTML, CSS, and vanilla JS.',
          },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      upstreamMap: { main: 'origin/main' },
      remoteCommits: [
        {
          id: 'a10f42b',
          parentIds: [],
          message: 'Initial portfolio scaffold',
          files: {
            'index.html':
              '<!doctype html>\n<html>\n  <head>\n    <title>Alex Rivera — Developer</title>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <header class="hero">\n      <h1>Alex Rivera</h1>\n      <p>Full-Stack Engineer &amp; Open-Source Builder</p>\n    </header>\n  </body>\n</html>',
            'style.css':
              ':root {\n  --accent: #D9541E;\n  --bg: #F3EEE3;\n}\n\nbody {\n  font-family: Inter, sans-serif;\n  background: var(--bg);\n  margin: 0;\n  padding: 2rem;\n}',
            'script.js':
              'const projects = ["GitMaster", "CliKit", "PixelGrid"];\nconsole.log("Loaded portfolio projects:", projects.length);',
            'README.md':
              '# Portfolio Site\n\nPersonal developer portfolio built with semantic HTML, CSS, and vanilla JS.',
          },
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
      tags: [],
      reflog: [
        {
          id: 'a10f42b',
          action: 'commit (initial): Initial portfolio scaffold',
          target: 'main',
        },
      ],
      commandLog: [],
      lastUpdatedAt: new Date().toISOString(),
    }),
  },
  {
    id: 'task-api',
    repoName: 'task-api',
    title: 'REST API Backend',
    subtitle: 'Practice feature branching (feature/auth), .gitignore rules, and Express routes.',
    difficulty: 'Intermediate',
    techStack: 'Node · Express',
    tickets: [
      {
        id: 'ta-t1',
        title: 'Create feature/auth branch',
        description: 'Branch off main so API auth changes stay isolated.',
        suggestedCommand: 'git checkout -b feature/auth',
        checkCompleted: (ws) => ws.branches.includes('feature/auth'),
      },
      {
        id: 'ta-t2',
        title: 'Verify .gitignore filters secrets',
        description: 'Notice secrets.env is ignored in git status. Try creating another *.env file if desired.',
        suggestedCommand: 'git status',
        checkCompleted: (ws) =>
          ws.commandLog.some((c) => c.trim().toLowerCase().startsWith('git status')),
      },
      {
        id: 'ta-t3',
        title: 'Edit routes/tasks.js or add auth.js',
        description: 'Edit routes/tasks.js or add middleware/auth.js in the Code Editor.',
        suggestedCommand: 'git diff',
        checkCompleted: (ws) =>
          ws.workingDirectory.some(
            (f) => f.status === 'modified' || f.status === 'staged' || f.name.includes('auth')
          ) || ws.commits.some((c) => c.branch === 'feature/auth'),
      },
      {
        id: 'ta-t4',
        title: 'Commit changes on feature/auth',
        description: 'Stage and commit your new API code on the feature branch.',
        suggestedCommand: 'git commit -m "Add auth middleware"',
        checkCompleted: (ws) => ws.commits.some((c) => c.branch === 'feature/auth'),
      },
      {
        id: 'ta-t5',
        title: 'Push feature/auth with upstream tracking',
        description: 'Publish feature/auth to GitHub for Pull Request review.',
        suggestedCommand: 'git push -u origin feature/auth',
        checkCompleted: (ws) => ws.remoteBranches.includes('origin/feature/auth'),
      },
    ],
    createInitialState: () => ({
      projectId: 'task-api',
      repoName: 'task-api',
      title: 'REST API Backend',
      subtitle: 'Node / Express Service',
      techStack: 'Node · Express',
      isInitialized: true,
      workingDirectory: [
        {
          name: 'server.js',
          content:
            'import express from "express";\nimport tasksRouter from "./routes/tasks.js";\n\nconst app = express();\napp.use(express.json());\napp.use("/api/tasks", tasksRouter);\n\napp.listen(3000, () => console.log("Task API listening on 3000"));',
          status: 'committed',
        },
        {
          name: 'routes/tasks.js',
          content:
            'import { Router } from "express";\nconst router = Router();\n\nconst tasks = [{ id: 1, title: "Ship v1", done: false }];\n\nrouter.get("/", (_req, res) => {\n  res.json({ tasks });\n});\n\nexport default router;',
          status: 'committed',
        },
        {
          name: '.env.example',
          content: 'PORT=3000\nJWT_SECRET=replace_with_dev_secret',
          status: 'committed',
        },
        {
          name: '.gitignore',
          content: '*.env\nnode_modules/\n.DS_Store',
          status: 'committed',
        },
        {
          name: 'secrets.env',
          content: 'JWT_SECRET=super_secret_local_key_do_not_commit',
          status: 'ignored',
        },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'b28c91d',
          parentIds: [],
          message: 'Bootstrap Express task API',
          files: {
            'server.js':
              'import express from "express";\nimport tasksRouter from "./routes/tasks.js";\n\nconst app = express();\napp.use(express.json());\napp.use("/api/tasks", tasksRouter);\n\napp.listen(3000, () => console.log("Task API listening on 3000"));',
            'routes/tasks.js':
              'import { Router } from "express";\nconst router = Router();\n\nconst tasks = [{ id: 1, title: "Ship v1", done: false }];\n\nrouter.get("/", (_req, res) => {\n  res.json({ tasks });\n});\n\nexport default router;',
            '.env.example': 'PORT=3000\nJWT_SECRET=replace_with_dev_secret',
            '.gitignore': '*.env\nnode_modules/\n.DS_Store',
          },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      upstreamMap: { main: 'origin/main' },
      remoteCommits: [
        {
          id: 'b28c91d',
          parentIds: [],
          message: 'Bootstrap Express task API',
          files: {
            'server.js':
              'import express from "express";\nimport tasksRouter from "./routes/tasks.js";\n\nconst app = express();\napp.use(express.json());\napp.use("/api/tasks", tasksRouter);\n\napp.listen(3000, () => console.log("Task API listening on 3000"));',
            'routes/tasks.js':
              'import { Router } from "express";\nconst router = Router();\n\nconst tasks = [{ id: 1, title: "Ship v1", done: false }];\n\nrouter.get("/", (_req, res) => {\n  res.json({ tasks });\n});\n\nexport default router;',
            '.env.example': 'PORT=3000\nJWT_SECRET=replace_with_dev_secret',
            '.gitignore': '*.env\nnode_modules/\n.DS_Store',
          },
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
      tags: [],
      reflog: [
        {
          id: 'b28c91d',
          action: 'commit (initial): Bootstrap Express task API',
          target: 'main',
        },
      ],
      commandLog: [],
      lastUpdatedAt: new Date().toISOString(),
    }),
  },
  {
    id: 'weather-cli',
    repoName: 'weather-cli',
    title: 'Weather CLI Tool',
    subtitle: 'origin/main is ahead by 1 teammate commit—practice fetch, pull, conflicts & push.',
    difficulty: 'Collaborative',
    techStack: 'Node CLI · Open-Source',
    tickets: [
      {
        id: 'wc-t1',
        title: 'Inspect remote status with git fetch',
        description: 'Download origin/main updates safely and check branch tracking with git status.',
        suggestedCommand: 'git fetch',
        checkCompleted: (ws) =>
          ws.commandLog.some((c) => c.trim().toLowerCase().startsWith('git fetch')),
      },
      {
        id: 'wc-t2',
        title: 'Edit cli.js & commit locally',
        description: 'Edit cli.js locally (or test pushing first to see rejection), then commit it.',
        suggestedCommand: 'git commit -m "Add city caching"',
        checkCompleted: (ws) =>
          ws.commits.some((c) => c.id !== 'c31d88a' && c.id !== 'd94e21c'),
      },
      {
        id: 'wc-t3',
        title: 'Sync teammate commit via git pull',
        description: 'Run git pull to merge origin/main commit d94e21c (resolve conflicts if cli.js diverged).',
        suggestedCommand: 'git pull',
        checkCompleted: (ws) =>
          ws.commits.some((c) => c.id === 'd94e21c') &&
          !ws.workingDirectory.some((f) => f.status === 'conflicted'),
      },
      {
        id: 'wc-t4',
        title: 'Inspect commit graph',
        description: 'View the merged branch history with git log --oneline --graph.',
        suggestedCommand: 'git log --oneline --graph',
        checkCompleted: (ws) =>
          ws.commandLog.some((c) => c.trim().toLowerCase().includes('--graph')),
      },
      {
        id: 'wc-t5',
        title: 'Push synced main to origin',
        description: 'Push your integrated local main branch up to origin/main.',
        suggestedCommand: 'git push',
        checkCompleted: (ws) =>
          ws.commits.length >= 2 &&
          ws.commits
            .filter((c) => c.branch === 'main')
            .every((c) => ws.remoteCommits.some((rc) => rc.id === c.id)),
      },
    ],
    createInitialState: () => ({
      projectId: 'weather-cli',
      repoName: 'weather-cli',
      title: 'Weather CLI Tool',
      subtitle: 'Collaborative Open-Source Tool',
      techStack: 'Node CLI · Open-Source',
      isInitialized: true,
      workingDirectory: [
        {
          name: 'cli.js',
          content:
            '#!/usr/bin/env node\nimport { formatForecast } from "./formatter.js";\n\nconst city = process.argv[2] || "San Francisco";\nconsole.log(formatForecast(city, 18, "C"));',
          status: 'committed',
        },
        {
          name: 'formatter.js',
          content:
            'export function formatForecast(city, temp, unit) {\n  return `${city}: ${temp}°${unit} · Clear Skies`;\n}',
          status: 'committed',
        },
        {
          name: 'package.json',
          content:
            '{\n  "name": "weather-cli",\n  "version": "0.4.0",\n  "type": "module"\n}',
          status: 'committed',
        },
        {
          name: 'README.md',
          content:
            '# weather-cli\n\nUsage: `weather <city>`\n\nNote: origin/main already has a teammate commit waiting to be pulled!',
          status: 'committed',
        },
      ],
      stagingArea: [],
      commits: [
        {
          id: 'c31d88a',
          parentIds: [],
          message: 'Initial weather CLI',
          files: {
            'cli.js':
              '#!/usr/bin/env node\nimport { formatForecast } from "./formatter.js";\n\nconst city = process.argv[2] || "San Francisco";\nconsole.log(formatForecast(city, 18, "C"));',
            'formatter.js':
              'export function formatForecast(city, temp, unit) {\n  return `${city}: ${temp}°${unit} · Clear Skies`;\n}',
            'package.json':
              '{\n  "name": "weather-cli",\n  "version": "0.4.0",\n  "type": "module"\n}',
            'README.md':
              '# weather-cli\n\nUsage: `weather <city>`\n\nNote: origin/main already has a teammate commit waiting to be pulled!',
          },
          branch: 'main',
        },
      ],
      currentBranch: 'main',
      branches: ['main'],
      upstreamMap: { main: 'origin/main' },
      remoteCommits: [
        {
          id: 'c31d88a',
          parentIds: [],
          message: 'Initial weather CLI',
          files: {
            'cli.js':
              '#!/usr/bin/env node\nimport { formatForecast } from "./formatter.js";\n\nconst city = process.argv[2] || "San Francisco";\nconsole.log(formatForecast(city, 18, "C"));',
            'formatter.js':
              'export function formatForecast(city, temp, unit) {\n  return `${city}: ${temp}°${unit} · Clear Skies`;\n}',
            'package.json':
              '{\n  "name": "weather-cli",\n  "version": "0.4.0",\n  "type": "module"\n}',
            'README.md':
              '# weather-cli\n\nUsage: `weather <city>`\n\nNote: origin/main already has a teammate commit waiting to be pulled!',
          },
          branch: 'main',
        },
        {
          id: 'd94e21c',
          parentIds: ['c31d88a'],
          message: 'Teammate: Add Fahrenheit flag (-f)',
          files: {
            'cli.js':
              '#!/usr/bin/env node\nimport { formatForecast } from "./formatter.js";\n\nconst city = process.argv[2] || "San Francisco";\nconst useFahrenheit = process.argv.includes("-f");\nconst temp = useFahrenheit ? 64 : 18;\nconst unit = useFahrenheit ? "F" : "C";\nconsole.log(formatForecast(city, temp, unit));',
          },
          branch: 'main',
        },
      ],
      remoteBranches: ['origin/main'],
      tags: [],
      reflog: [
        {
          id: 'c31d88a',
          action: 'commit (initial): Initial weather CLI',
          target: 'main',
        },
      ],
      commandLog: [],
      lastUpdatedAt: new Date().toISOString(),
    }),
  },
];
