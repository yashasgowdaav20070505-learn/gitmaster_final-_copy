import { RepoState } from '../types';
import {
  Folder,
  Inbox,
  Database,
  Shield,
  Terminal,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';

interface VisualizerProps {
  repoState: RepoState;
}

export default function Visualizer({ repoState }: VisualizerProps) {
  const { isInitialized, workingDirectory, commits, currentBranch } = repoState;

  const stagedFiles = workingDirectory.filter((f) => f.status === 'staged');

  return (
    <div className="editorial-card p-5 flex flex-col gap-5" id="repo-visualizer">
      {/* Visualizer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#D9541E]" />
          <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[#111111]">
            Interactive Repository State
          </h3>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-mono px-2.5 py-1 bg-[#E6DFD1] text-[#111111] rounded-md border-2 border-[#111111]">
            Branch:{' '}
            <strong className="font-bold">
              {isInitialized ? currentBranch : 'None'}
            </strong>
          </span>
          <span
            className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border-2 border-[#111111] ${
              isInitialized
                ? 'bg-[#1E6F50] text-[#FAF7F0]'
                : 'bg-[#FAF7F0] text-[#524E48]'
            }`}
          >
            {isInitialized ? 'Git Active' : 'Not Initialized'}
          </span>
        </div>
      </div>

      {!isInitialized ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-[#524E48]">
          <Terminal className="w-10 h-10 text-[#111111] mb-3" />
          <p className="font-bold text-[#111111] text-xs">
            Git repository is not active.
          </p>
          <p className="text-xs max-w-xs mt-1.5 text-[#524E48]">
            Type{' '}
            <code className="bg-[#111111] text-[#F3EEE3] px-1.5 py-0.5 rounded font-mono text-[11px]">
              git init
            </code>{' '}
            in the terminal to unlock the local workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* Pipeline Stage 1: Working Directory */}
          <div className="bg-[#F3EEE3] rounded-lg p-4 border-2 border-[#111111] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-[#111111] font-mono font-bold text-[11px] uppercase tracking-wider pb-2 border-b-2 border-[#111111]">
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#D9541E]" />
                <span>Working Directory</span>
              </span>
              <span className="text-[10px] text-[#524E48] font-mono normal-case">
                {workingDirectory.length} {workingDirectory.length === 1 ? 'file' : 'files'}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {workingDirectory.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#524E48] font-mono italic">
                  No files exist
                </div>
              ) : (
                workingDirectory.map((file) => {
                  let badgeStyle = 'bg-[#D9541E] text-[#F3EEE3]';
                  let statusLabel = 'Untracked';
                  if (file.status === 'modified') {
                    badgeStyle = 'bg-[#E6DFD1] text-[#111111]';
                    statusLabel = 'Modified';
                  } else if (file.status === 'staged') {
                    badgeStyle = 'bg-[#111111] text-[#F3EEE3]';
                    statusLabel = 'Staged';
                  } else if (file.status === 'committed') {
                    badgeStyle = 'bg-[#1E6F50] text-[#FAF7F0]';
                    statusLabel = 'Committed';
                  }

                  return (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 rounded-lg bg-[#FAF7F0] border-2 border-[#111111] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <FileText className="w-3.5 h-3.5 text-[#D9541E] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono font-bold text-[#111111] truncate">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-[#524E48] italic truncate">
                            {file.content}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-[#111111] shrink-0 whitespace-nowrap ${badgeStyle}`}
                      >
                        {statusLabel}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="text-[10px] text-[#524E48] leading-relaxed font-mono bg-[#FAF7F0] px-3 py-2 rounded border border-[#111111]/30">
              <span className="font-bold text-[#111111]">Legend:</span>{' '}
              <span className="text-[#D9541E] font-bold">Untracked</span> &bull;{' '}
              <span className="text-[#111111] font-bold">Staged</span> &bull;{' '}
              <span className="text-[#1E6F50] font-bold">Committed</span>
            </div>
          </div>

          {/* Pipeline Stage 2: Staging Area */}
          <div className="bg-[#F3EEE3] rounded-lg p-4 border-2 border-[#111111] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-[#111111] font-mono font-bold text-[11px] uppercase tracking-wider pb-2 border-b-2 border-[#111111]">
              <span className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-[#D9541E]" />
                <span>Staging Area (Index)</span>
              </span>
              <span className="text-[10px] text-[#524E48] font-mono normal-case">
                {stagedFiles.length} staged
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {stagedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-5 text-center text-[#524E48] text-xs">
                  <p className="font-mono italic text-[#111111]">Staging index is empty</p>
                  <p className="text-[11px] mt-1 text-[#524E48] leading-relaxed">
                    Use <strong className="text-[#111111]">git add &lt;file&gt;</strong> to package files for a commit.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-mono text-[#FAF7F0] font-bold text-center bg-[#1E6F50] py-1 rounded border-2 border-[#111111]">
                    READY TO COMMIT
                  </div>
                  {stagedFiles.map((file) => (
                    <motion.div
                      key={file.name}
                      layoutId={`stage-${file.name}`}
                      className="p-2.5 rounded-lg bg-[#FAF7F0] border-2 border-[#111111] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="w-3.5 h-3.5 text-[#1E6F50] shrink-0" />
                        <span className="text-xs font-mono font-bold text-[#111111] truncate">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-[#F3EEE3] bg-[#111111] px-2.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                        Staged
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pipeline Stage 3: Local Vault & Commits */}
          <div className="bg-[#F3EEE3] rounded-lg p-4 border-2 border-[#111111] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-[#111111] font-mono font-bold text-[11px] uppercase tracking-wider pb-2 border-b-2 border-[#111111]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#1E6F50]" />
                <span>Local Repo (Commits)</span>
              </span>
              <span className="text-[10px] text-[#524E48] font-mono normal-case">
                {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
              {commits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-5 text-center text-[#524E48] text-xs">
                  <p className="font-mono italic text-[#111111]">No commits yet</p>
                  <p className="text-[11px] mt-1 text-[#524E48] leading-relaxed">
                    Stage files, then run <strong className="text-[#111111]">git commit</strong> to record a snapshot.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-l-2 border-[#111111] pl-4 ml-2 my-1 relative">
                  {commits.map((c) => (
                    <div key={c.id} className="relative group">
                      <div className="absolute -left-[22px] top-2 w-2.5 h-2.5 rounded-full bg-[#1E6F50] border-2 border-[#111111]" />

                      <div className="p-2.5 rounded-lg bg-[#FAF7F0] border-2 border-[#111111] flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                          <span className="text-[#D9541E] font-bold">{c.id}</span>
                          <span className="text-[#524E48] truncate">branch: {c.branch}</span>
                        </div>
                        <div className="text-xs text-[#111111] font-bold leading-tight">
                          {c.message}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.keys(c.files).map((fn) => (
                            <span
                              key={fn}
                              className="text-[9px] font-mono bg-[#E6DFD1] border border-[#111111] text-[#111111] px-1.5 py-0.5 rounded"
                            >
                              {fn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
