import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-initialize Gemini AI
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn(
        '[GitMaster] Warning: GEMINI_API_KEY is not defined. Using input-aware local tutor fallback.'
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function buildSmartFallbackReply(rawMessage: string): string {
  const q = rawMessage.toLowerCase();

  if (q.includes('gitignore') || q.includes('.gitignore')) {
    return (
      'A **`.gitignore`** file is a "do not pack" list inside your project folder telling Git which files (like `node_modules/`, `.env` secrets, or OS junk files) to never track or upload.\n' +
      '- Create a `.gitignore` file in your root folder and list one pattern per line:\n' +
      '```bash\necho "node_modules/" >> .gitignore\necho ".env" >> .gitignore\n```'
    );
  }

  if (q.includes('pull request') || /\bpr\b/.test(q)) {
    return (
      'A **Pull Request (PR)** on GitHub is how you propose merging your feature branch into `main` so teammates can review your code first—like submitting a draft chapter to an editor.\n' +
      '- Push your branch to GitHub, then click **Compare & pull request** on your repository page:\n' +
      '```bash\ngit checkout -b feature-navbar\ngit push -u origin feature-navbar\n```'
    );
  }

  if (q.includes('fork')) {
    return (
      'A **Fork** creates your own personal copy of someone else\'s GitHub repository under your GitHub account so you can edit freely without needing write access to their repo.\n' +
      '- Fork on GitHub, clone your fork locally, make a branch, push, and open a Pull Request back to the original repo:\n' +
      '```bash\ngit clone https://github.com/your-username/forked-repo.git\n```'
    );
  }

  if (q.includes('fetch') && q.includes('pull')) {
    return (
      '**`git fetch`** downloads updates from GitHub safely in the background without changing your current files, whereas **`git pull`** downloads *and immediately merges* those changes into your active branch.\n' +
      '- Use `git fetch` when you want to preview teammate changes first:\n' +
      '```bash\ngit fetch origin\ngit pull origin main\n```'
    );
  }

  if (q.includes('fetch')) {
    return (
      '**`git fetch`** checks GitHub for new commits and downloads them into your local tracking cache without altering your working directory.\n' +
      '```bash\ngit fetch origin\n```'
    );
  }

  if (q.includes('pull')) {
    return (
      '**`git pull`** grabs the latest commits from a remote branch on GitHub and merges them straight into your current local branch (it equals `git fetch` + `git merge`).\n' +
      '```bash\ngit pull origin main\n```'
    );
  }

  if (q.includes('push')) {
    return (
      '**`git push`** uploads your saved local commits from your computer up to your remote repository on GitHub so teammates (or your backup) stay synced.\n' +
      '```bash\ngit push -u origin main\n```'
    );
  }

  if (q.includes('conflict')) {
    return (
      'A **merge conflict** happens when two branches edit the exact same lines of a file—Git pauses and asks you to pick which lines to keep.\n' +
      '- Open the file, delete the `<<<<<<<`, `=======`, `>>>>>>>` markers leaving your chosen code, then stage and commit:\n' +
      '```bash\ngit add resolved-file.txt\ngit commit -m "Resolve merge conflict"\n```'
    );
  }

  if (q.includes('rebase')) {
    return (
      '**`git rebase`** moves your feature branch commits so they sit cleanly on top of the latest `main` commit—like moving your sticky notes to the top of an updated notebook page.\n' +
      '```bash\ngit checkout feature-branch\ngit rebase main\n```'
    );
  }

  if (q.includes('stash')) {
    return (
      '**`git stash`** temporarily tucks your unfinished local edits onto a shelf so you can switch branches with a clean desk without making a messy commit.\n' +
      '- Bring those saved edits back anytime with `git stash pop`:\n' +
      '```bash\ngit stash\ngit stash pop\n```'
    );
  }

  if (q.includes('restore') || q.includes('reset') || q.includes('undo') || q.includes('revert') || q.includes('last commit')) {
    return (
      'How you undo depends on where the change lives:\n' +
      '- **Discard uncommitted edits in a file:** `git restore <file>`\n' +
      '- **Undo your last commit while keeping edits ready to re-commit:** `git reset --soft HEAD~1`\n' +
      '```bash\ngit restore styles.css\n# or undo last commit:\ngit reset --soft HEAD~1\n```'
    );
  }

  if (q.includes('merge')) {
    return (
      '**`git merge`** combines commits from another branch into the branch you are currently on.\n' +
      '- Always switch onto the receiving branch (`main`) first, then merge your feature branch in:\n' +
      '```bash\ngit checkout main\ngit merge feature-login\n```'
    );
  }

  if (q.includes('checkout') || q.includes('switch') || q.includes('branch')) {
    return (
      'A **branch** is a safe parallel timeline where you can build and test ideas without touching `main`.\n' +
      '- Create and switch onto a new branch in one command with `git checkout -b` (or `git switch -c`):\n' +
      '```bash\ngit checkout -b feature-navbar\n```'
    );
  }

  if (q.includes('clone')) {
    return (
      '**`git clone <url>`** downloads an entire GitHub repository—including all its files, branches, and commit history—into a new folder on your computer.\n' +
      '```bash\ngit clone https://github.com/user/project.git\n```'
    );
  }

  if (q.includes('log') || q.includes('history')) {
    return (
      '**`git log`** prints your repository\'s timeline of saved commits—showing each commit ID, author, date, and message.\n' +
      '```bash\ngit log --oneline\n```'
    );
  }

  if (q.includes('commit')) {
    return (
      'A **commit** seals everything in your Staging Area into a permanent save point inside your Local Repository—like locking a snapshot in a time capsule with a short note.\n' +
      '```bash\ngit commit -m "Add homepage header"\n```'
    );
  }

  if (q.includes('add') || q.includes('stage') || q.includes('staging')) {
    return (
      '**`git add`** moves new or edited files from your Working Directory into the **Staging Area** (your shipping box) so they are included in your next commit.\n' +
      '```bash\ngit add index.html   # or stage all files: git add .\n```'
    );
  }

  if (q.includes('status')) {
    return (
      '**`git status`** safely inspects your folder and tells you which branch you are on plus which files are untracked, modified, or staged.\n' +
      '```bash\ngit status\n```'
    );
  }

  if (q.includes('init')) {
    return (
      '**`git init`** turns an ordinary project folder into a tracked Git repository by creating the hidden `.git` vault inside it.\n' +
      '```bash\ngit init\n```'
    );
  }

  if (q.includes('what is git') || q.includes('simple words')) {
    return (
      '**Git** is a save-point system for project folders: you edit files on your desk (`Working Directory`), pack the ones you want (`git add`), and seal a permanent checkpoint (`git commit`).\n' +
      '```bash\ngit status\n```'
    );
  }

  return (
    `Here is how to approach **"${rawMessage}"** in Git:\n` +
    '- First inspect where your files and branches stand with `git status` and `git log --oneline`.\n' +
    '- Let me know which specific command (`commit`, `branch`, `merge`, `pull request`, `stash`, `reset`) you want to walk through step-by-step!\n' +
    '```bash\ngit status\n```'
  );
}

// AI Git Tutor Assistant API Endpoint
app.post('/api/chat', async (req, res) => {
  const {
    message,
    prompt,
    history = [],
    context = {},
    lessonContext = '',
  } = req.body || {};

  const userMessage = (typeof message === 'string' ? message : prompt || '').trim();

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Fallback immediately if GEMINI_API_KEY is missing
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      '[GitMaster] GEMINI_API_KEY missing; serving tailored local fallback for:',
      userMessage
    );
    const reply = buildSmartFallbackReply(userMessage);
    return res.status(200).json({ reply, text: reply });
  }

  try {
    const ai = getAiClient();

    const rawContext =
      Object.keys(context || {}).length > 0
        ? JSON.stringify(context)
        : typeof lessonContext === 'string'
        ? lessonContext
        : JSON.stringify(lessonContext);

    const systemInstruction = `You are Turing, a friendly, expert Git and GitHub tutor for GitMaster. Always answer the exact question the user just asked—never reply with a generic canned introduction. Explain any Git or GitHub concept (commits, branches, merging, pull requests, forks, remotes, resolving conflicts, stashing, rebasing, GitHub workflows) in simple, plain English with an everyday analogy and a clear command example. Keep answers concise, structured with short bullet points or a single code block, and easy to read inside a compact chat window. Current context: ${rawContext || 'GitMaster Workspace'}.`;

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    if (Array.isArray(history)) {
      history.forEach(
        (msg: {
          role?: string;
          content?: string;
          sender?: string;
          text?: string;
        }) => {
          const textVal = (msg?.content ?? msg?.text ?? '').trim();
          if (!textVal) return;
          const isUser = msg.role === 'user' || msg.sender === 'user';
          contents.push({
            role: isUser ? 'user' : 'model',
            parts: [{ text: textVal }],
          });
        }
      );
    }

    const lastTurn = contents[contents.length - 1];
    if (!lastTurn || lastTurn.role !== 'user' || lastTurn.parts[0]?.text !== userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const replyText =
      response.text?.trim() || buildSmartFallbackReply(userMessage);

    return res.status(200).json({ reply: replyText, text: replyText });
  } catch (error) {
    console.error('[GitMaster] Gemini API Error in /api/chat:', error);
    const fallbackReply = buildSmartFallbackReply(userMessage);
    return res.status(200).json({ reply: fallbackReply, text: fallbackReply });
  }
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start Full-Stack Server
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    Boolean(process.env.K_SERVICE);

  const distPath = path.resolve(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distIndex)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    app.get('*', (_req, res) => {
      res.status(503).send('Production build not found. Run npm run build first.');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
