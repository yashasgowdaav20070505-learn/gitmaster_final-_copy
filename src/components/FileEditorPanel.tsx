import { useState, type FormEvent } from 'react';
import { ProjectFile } from '../data/starterProjects';
import {
  FileCode2,
  FilePlus2,
  FolderOpen,
  AlertTriangle,
  Check,
  X,
  Lock,
} from 'lucide-react';

interface FileEditorPanelProps {
  workingDirectory: ProjectFile[];
  selectedFileName: string;
  onSelectFile: (name: string) => void;
  onUpdateFileContent: (name: string, content: string) => void;
  onCreateFile: (name: string) => { error?: string };
}

function getShortBadge(status: ProjectFile['status']): {
  short: string;
  label: string;
  className: string;
} {
  switch (status) {
    case 'untracked':
      return {
        short: 'U',
        label: 'Untracked',
        className: 'bg-[#D9541E] text-[#FAF7F0] border-[#111111]',
      };
    case 'modified':
      return {
        short: 'M',
        label: 'Modified',
        className: 'bg-[#E6DFD1] text-[#111111] border-[#111111]',
      };
    case 'staged':
      return {
        short: 'S',
        label: 'Staged',
        className: 'bg-[#111111] text-[#F3EEE3] border-[#111111]',
      };
    case 'committed':
      return {
        short: 'C',
        label: 'Committed',
        className: 'bg-[#1E6F50] text-[#FAF7F0] border-[#111111]',
      };
    case 'ignored':
      return {
        short: 'I',
        label: 'Ignored',
        className: 'bg-[#E6DFD1] text-[#524E48] border-[#111111]',
      };
    case 'conflicted':
      return {
        short: '!',
        label: 'Conflict',
        className: 'bg-[#D9541E] text-[#FAF7F0] border-[#111111]',
      };
  }
}

function resolveConflictContent(
  content: string,
  mode: 'current' | 'incoming' | 'both'
): string {
  const conflictRegex =
    /<<<<<<<[^\n]*\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>>[^\n]*/g;
  if (!conflictRegex.test(content)) return content;

  return content.replace(
    /<<<<<<<[^\n]*\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>>[^\n]*/g,
    (_match, currentBlock: string, incomingBlock: string) => {
      if (mode === 'current') return currentBlock;
      if (mode === 'incoming') return incomingBlock;
      return `${currentBlock}\n${incomingBlock}`;
    }
  );
}

export default function FileEditorPanel({
  workingDirectory,
  selectedFileName,
  onSelectFile,
  onUpdateFileContent,
  onCreateFile,
}: FileEditorPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const activeFile =
    workingDirectory.find((f) => f.name === selectedFileName) ||
    workingDirectory[0];

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onCreateFile(newFileName);
    if (res.error) {
      setCreateError(res.error);
      return;
    }
    const clean = newFileName.trim().replace(/^\/+/, '');
    setNewFileName('');
    setCreateError(null);
    setIsCreating(false);
    if (clean) {
      onSelectFile(clean);
    }
  };

  const lines = activeFile ? activeFile.content.split('\n') : [''];
  const activeBadge = activeFile ? getShortBadge(activeFile.status) : null;

  return (
    <div className="editorial-card overflow-hidden flex flex-col h-full min-h-[480px]">
      {/* Panel Top Bar */}
      <div className="px-4 py-3 bg-[#E6DFD1] border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[#D9541E]" />
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#111111]">
            Workspace Explorer &amp; Code Editor
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsCreating((prev) => !prev);
            setCreateError(null);
          }}
          className="editorial-btn-secondary px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <FilePlus2 className="w-3.5 h-3.5 text-[#D9541E]" />
          <span>+ New File</span>
        </button>
      </div>

      {/* Inline New File Creator */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="px-4 py-2.5 bg-[#F3EEE3] border-b-2 border-[#111111] flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
                setCreateError(null);
              }}
              placeholder="e.g. about.html or routes/auth.js"
              autoFocus
              className="editorial-input flex-1 px-2.5 py-1.5 font-mono text-xs min-w-0"
            />
            <button
              type="submit"
              className="editorial-btn-primary px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setCreateError(null);
              }}
              className="editorial-btn-secondary p-1.5 cursor-pointer shrink-0"
              aria-label="Cancel file creation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {createError && (
            <div className="text-[11px] font-mono font-bold text-[#D9541E]">
              {createError}
            </div>
          )}
        </form>
      )}

      {/* Split Explorer + Code Editor Body */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-0">
        {/* File Tree Sidebar */}
        <div className="sm:col-span-4 bg-[#F3EEE3] border-b-2 sm:border-b-0 sm:border-r-2 border-[#111111] p-2.5 flex flex-col gap-1.5 max-h-52 sm:max-h-none overflow-y-auto">
          <div className="px-1.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#524E48]">
            Project Files ({workingDirectory.length})
          </div>
          {workingDirectory.map((file) => {
            const isSelected = activeFile?.name === file.name;
            const badge = getShortBadge(file.status);
            return (
              <button
                key={file.name}
                type="button"
                onClick={() => onSelectFile(file.name)}
                className={`w-full px-2.5 py-2 rounded-lg border-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF7F0] border-[#111111] shadow-[2px_2px_0px_#111111]'
                    : 'bg-transparent border-transparent hover:bg-[#E6DFD1] hover:border-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {file.status === 'ignored' ? (
                    <Lock className="w-3.5 h-3.5 text-[#524E48] shrink-0" />
                  ) : (
                    <FileCode2 className="w-3.5 h-3.5 text-[#D9541E] shrink-0" />
                  )}
                  <span className="font-mono text-xs font-bold text-[#111111] truncate">
                    {file.name}
                  </span>
                </div>
                <span
                  title={badge.label}
                  className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded border shrink-0 leading-none ${badge.className}`}
                >
                  {badge.short}
                </span>
              </button>
            );
          })}
        </div>

        {/* Code Editor Area */}
        <div className="sm:col-span-8 bg-[#FAF7F0] flex flex-col min-h-[320px]">
          {activeFile && activeBadge ? (
            <>
              {/* Active File Status Header */}
              <div className="px-3.5 py-2.5 bg-[#FAF7F0] border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-extrabold text-[#111111] truncate">
                    {activeFile.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${activeBadge.className}`}
                  >
                    {activeBadge.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#524E48] shrink-0 tabular-nums">
                  {lines.length} {lines.length === 1 ? 'line' : 'lines'} &middot;{' '}
                  {activeFile.content.length} chars
                </span>
              </div>

              {/* Ignored Notice */}
              {activeFile.status === 'ignored' && (
                <div className="px-3.5 py-2 bg-[#E6DFD1] border-b-2 border-[#111111] font-mono text-[11px] text-[#524E48] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-[#111111]" />
                  <span>
                    Matched by <strong className="text-[#111111]">.gitignore</strong> — excluded from{' '}
                    <code className="font-bold text-[#111111]">git add .</code>
                  </span>
                </div>
              )}

              {/* Merge Conflict Quick-Resolve Toolbar */}
              {activeFile.status === 'conflicted' && (
                <div className="px-3.5 py-2.5 bg-[#E6DFD1] border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#D9541E]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Merge Conflict Detected</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFileContent(
                          activeFile.name,
                          resolveConflictContent(activeFile.content, 'current')
                        )
                      }
                      className="editorial-btn-secondary px-2 py-1 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Accept Current
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFileContent(
                          activeFile.name,
                          resolveConflictContent(activeFile.content, 'incoming')
                        )
                      }
                      className="editorial-btn-secondary px-2 py-1 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Accept Incoming
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFileContent(
                          activeFile.name,
                          resolveConflictContent(activeFile.content, 'both')
                        )
                      }
                      className="editorial-btn-primary px-2 py-1 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Keep Both
                    </button>
                  </div>
                </div>
              )}

              {/* Gutter + Textarea */}
              <div className="flex-1 flex min-h-[260px] overflow-hidden bg-[#FAF7F0]">
                <div
                  aria-hidden="true"
                  className="select-none py-3 px-2.5 bg-[#F3EEE3] border-r border-[#111111]/20 font-mono text-[11px] leading-5 text-[#524E48] text-right tabular-nums overflow-hidden shrink-0"
                >
                  {lines.map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <textarea
                  value={activeFile.content}
                  onChange={(e) =>
                    onUpdateFileContent(activeFile.name, e.target.value)
                  }
                  spellCheck={false}
                  aria-label={`Code editor for ${activeFile.name}`}
                  className="flex-1 w-full p-3 bg-[#FAF7F0] text-[#111111] font-mono text-xs leading-5 resize-none focus:outline-none overflow-auto"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 font-mono text-xs text-[#524E48]">
              Select a file from the explorer to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
