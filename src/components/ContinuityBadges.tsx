import { UserProgress } from '../types';
import {
  CONTINUITY_MILESTONES,
  ContinuityMilestone,
  getMilestoneProgress,
  isMilestoneUnlocked,
} from '../utils/continuityRewards';
import { Award, CheckCircle2, Flame, Lock, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

interface ContinuityBadgesProps {
  progress: UserProgress;
  compact?: boolean;
  onOpenCabinet?: () => void;
}

function getMilestoneIcon(icon: ContinuityMilestone['icon']) {
  switch (icon) {
    case 'Flame':
      return Flame;
    case 'ShieldCheck':
      return ShieldCheck;
    case 'Zap':
      return Zap;
    case 'Award':
      return Award;
  }
}

export default function ContinuityBadges({
  progress,
  compact = false,
  onOpenCabinet,
}: ContinuityBadgesProps) {
  const unlockedCount = CONTINUITY_MILESTONES.filter((m) =>
    isMilestoneUnlocked(m.id, progress)
  ).length;

  return (
    <section
      className="editorial-card p-6 flex flex-col gap-5"
      aria-label="Continuity and Milestone Rewards"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111111] pb-4">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
            Continuity &amp; Core Milestones
          </span>
          <h3 className="text-lg font-extrabold text-[#111111] tracking-tight mt-0.5">
            Practice Stamps &amp; Honors
          </h3>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs font-bold text-[#111111] bg-[#E6DFD1] border-2 border-[#111111] px-3 py-1 rounded-md tabular-nums whitespace-nowrap">
            {unlockedCount}/{CONTINUITY_MILESTONES.length} Stamped
          </span>
          {compact && onOpenCabinet && (
            <button
              onClick={onOpenCabinet}
              className="editorial-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Trophy Cabinet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTINUITY_MILESTONES.map((milestone) => {
          const unlocked = isMilestoneUnlocked(milestone.id, progress);
          const stat = getMilestoneProgress(milestone, progress);
          const IconComponent = getMilestoneIcon(milestone.icon);

          return (
            <div
              key={milestone.id}
              className={`rounded-[10px] border-2 border-[#111111] p-4 flex flex-col justify-between gap-4 transition-colors ${
                unlocked
                  ? 'bg-[#F3EEE3] shadow-[4px_4px_0px_#111111]'
                  : 'bg-[#E6DFD1]/65 text-[#524E48]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-10 h-10 rounded-lg border-2 border-[#111111] flex items-center justify-center shrink-0 ${
                    unlocked
                      ? milestone.id === 'badge-core-architect'
                        ? 'bg-[#1E6F50] text-[#FAF7F0]'
                        : 'bg-[#D9541E] text-[#FAF7F0]'
                      : 'bg-[#FAF7F0] text-[#524E48]'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 border-2 border-[#111111] rounded whitespace-nowrap ${
                    unlocked
                      ? 'bg-[#111111] text-[#F3EEE3]'
                      : 'bg-[#FAF7F0] text-[#524E48]'
                  }`}
                >
                  {milestone.stampCode}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wide">
                  {unlocked ? (
                    <span className="text-[#1E6F50] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[#524E48] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked · {milestone.requirementLabel}</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-extrabold text-[#111111] mt-1">
                  {milestone.title}
                </h4>
                <p className="text-xs text-[#524E48] leading-relaxed mt-1">
                  {milestone.description}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#111111]/20">
                <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#111111] tabular-nums">
                  <span>Progress</span>
                  <span>{stat.unitLabel}</span>
                </div>
                <div className="w-full h-2 bg-[#FAF7F0] border border-[#111111] rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      unlocked ? 'bg-[#1E6F50]' : 'bg-[#D9541E]'
                    }`}
                    style={{ width: `${stat.percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
