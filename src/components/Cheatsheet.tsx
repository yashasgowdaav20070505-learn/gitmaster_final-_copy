import { useState } from 'react';
import { Search, Copy, Check, Terminal } from 'lucide-react';

interface CheatCommand {
  command: string;
  description: string;
  category: 'basics' | 'history' | 'branching' | 'remote' | 'undo' | 'advanced';
  example: string;
}

const CHEAT_DATA: CheatCommand[] = [
  {
    command: 'git init',
    description: 'Initialize a local Git repository in your current directory.',
    category: 'basics',
    example: 'git init',
  },
  {
    command: 'git status',
    description: 'Check modified files, untracked files, and staged files.',
    category: 'basics',
    example: 'git status',
  },
  {
    command: 'git add <file>',
    description: 'Stage changes in a specific file. Use "." to stage all files.',
    category: 'basics',
    example: 'git add index.html\ngit add .',
  },
  {
    command: 'git commit -m "<message>"',
    description: 'Permanently save your staged snapshots with a text description.',
    category: 'history',
    example: 'git commit -m "Add shopping cart login features"',
  },
  {
    command: 'git log',
    description: 'Show commit history list in reverse chronological order.',
    category: 'history',
    example: 'git log\ngit log --oneline',
  },
  {
    command: 'git diff',
    description: 'Show differences in lines between your files and last commit.',
    category: 'history',
    example: 'git diff',
  },
  {
    command: 'git branch <branch-name>',
    description: 'Create a new branch pointing to your current HEAD commit.',
    category: 'branching',
    example: 'git branch feature-login',
  },
  {
    command: 'git checkout <branch-name>',
    description: 'Switch to a branch. Use "-b" flag to create and switch immediately.',
    category: 'branching',
    example: 'git checkout main\ngit checkout -b feature-lasers',
  },
  {
    command: 'git merge <branch-name>',
    description: 'Merge commits from another branch into your active branch.',
    category: 'branching',
    example: 'git checkout main\ngit merge feature-lasers',
  },
  {
    command: 'git clone <url>',
    description: 'Clone (download) a remote repository onto your computer.',
    category: 'remote',
    example: 'git clone https://github.com/friend/perfect-bread.git',
  },
  {
    command: 'git push <remote> <branch>',
    description: 'Upload local commits to a remote hosting platform like GitHub.',
    category: 'remote',
    example: 'git push origin main',
  },
  {
    command: 'git pull <remote> <branch>',
    description: 'Fetch and immediately merge changes from remote branch.',
    category: 'remote',
    example: 'git pull origin main',
  },
  {
    command: 'git restore <file>',
    description: 'Discard uncommitted changes in your working directory.',
    category: 'undo',
    example: 'git restore cookie-recipe.txt',
  },
  {
    command: 'git reset --hard <commit>',
    description: 'DANGEROUS: Wipes all modifications, resetting workspace to specified commit.',
    category: 'undo',
    example: 'git reset --hard a1b2c3d',
  },
  {
    command: 'git stash',
    description: 'Shelf current unstaged work and clean the directory.',
    category: 'advanced',
    example: 'git stash',
  },
  {
    command: 'git stash pop',
    description: 'Restore the most recently stashed changes back into directory.',
    category: 'advanced',
    example: 'git stash pop',
  },
  {
    command: 'git diff --staged',
    description: 'Compare staged changes line-by-line against your last commit.',
    category: 'history',
    example: 'git diff\ngit diff --staged',
  },
  {
    command: 'git revert <sha>',
    description: 'Safely undo a pushed commit by creating a new inverse commit.',
    category: 'undo',
    example: 'git revert f9e8d7c',
  },
  {
    command: 'git rebase <branch>',
    description: 'Replay your current branch commits cleanly onto the target branch tip.',
    category: 'branching',
    example: 'git rebase main',
  },
  {
    command: 'git cherry-pick <sha>',
    description: 'Apply a single commit from another branch onto your active branch.',
    category: 'advanced',
    example: 'git cherry-pick h777fix',
  },
  {
    command: 'git reflog',
    description: 'Inspect local HEAD movement history to locate and rescue lost commits.',
    category: 'undo',
    example: 'git reflog\ngit reset --hard e9f8a7b',
  },
  {
    command: 'git fetch',
    description: 'Download remote origin updates safely without altering local branches.',
    category: 'remote',
    example: 'git fetch',
  },
  {
    command: 'git push -u origin <branch>',
    description: 'Publish a feature branch to GitHub and set upstream tracking for Pull Requests.',
    category: 'remote',
    example: 'git push -u origin feature-oauth',
  },
  {
    command: 'git tag -a <ver> -m "<msg>"',
    description: 'Create an annotated semantic release tag (e.g. v1.0.0) on the current commit.',
    category: 'advanced',
    example: 'git tag -a v1.0.0 -m "Release v1.0.0"',
  },
];

export default function Cheatsheet() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = CHEAT_DATA.filter((item) => {
    const matchesSearch =
      item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'basics', label: 'Foundations' },
    { id: 'history', label: 'History & Logs' },
    { id: 'branching', label: 'Branch & Merge' },
    { id: 'remote', label: 'Remote & GitHub' },
    { id: 'undo', label: 'Undo Errors' },
    { id: 'advanced', label: 'Advanced Powers' },
  ];

  return (
    <div className="flex flex-col gap-5" id="cheatsheet-page">
      {/* Search Header Banner */}
      <div className="editorial-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#111111] flex items-center gap-2 uppercase tracking-wide font-mono">
            <Terminal className="w-5 h-5 text-[#D9541E]" />
            <span>Interactive Command Cheatsheet</span>
          </h2>
          <p className="text-xs text-[#524E48] mt-1">
            Search, filter, and copy essential Git syntax and usage examples.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#524E48]" />
          <input
            type="text"
            className="editorial-input w-full pl-10 pr-4 py-2 text-xs font-medium"
            placeholder="Search commands or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-2 border-[#111111] transition-all whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[2px_2px_0px_#111111]'
                : 'bg-[#FAF7F0] text-[#111111] hover:bg-[#E6DFD1]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Command Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#524E48] text-xs editorial-card-flat">
            No matching commands found. Try adjusting your search or filter.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const cardId = `cmd-${idx}`;
            return (
              <div
                key={cardId}
                className="editorial-card p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-[#D9541E]">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleCopy(item.command, cardId)}
                      className="text-[#111111] p-1.5 bg-[#F3EEE3] hover:bg-[#E6DFD1] border border-[#111111] rounded-md transition-colors cursor-pointer"
                      title="Copy command to clipboard"
                    >
                      {copiedId === cardId ? (
                        <Check className="w-3.5 h-3.5 text-[#1E6F50]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-mono text-sm font-extrabold text-[#111111] select-all mt-1">
                    {item.command}
                  </h3>

                  <p className="text-xs text-[#524E48] leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                {/* Inner Ink Black Terminal Example */}
                <div className="bg-[#111111] p-3 rounded-lg border-2 border-[#111111] font-mono text-[11px] text-[#F3EEE3]">
                  <div className="text-[9px] text-[#D9541E] uppercase tracking-wider font-bold mb-1 select-none">
                    Example
                  </div>
                  <pre className="whitespace-pre-wrap">{item.example}</pre>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
