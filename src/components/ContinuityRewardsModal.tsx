import { Award, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { getRewardDisplayMeta } from '../utils/continuityRewards';

interface ContinuityRewardsModalProps {
  badgeId: string | null;
  onClose: () => void;
  onOpenCabinet?: () => void;
}

export default function ContinuityRewardsModal({
  badgeId,
  onClose,
  onOpenCabinet,
}: ContinuityRewardsModalProps) {
  if (!badgeId) return null;

  const meta = getRewardDisplayMeta(badgeId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/75 p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
    >
      <div className="bg-[#FAF7F0] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] rounded-[12px] max-w-md w-full p-6 flex flex-col items-center text-center gap-5 relative">
        <div className="w-full flex items-center justify-between border-b-2 border-[#111111] pb-3">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
            {meta.isContinuity ? 'Continuity Milestone' : 'Mastery Stamp'}
          </span>
          <span className="font-mono text-[11px] font-bold bg-[#111111] text-[#F3EEE3] px-2.5 py-0.5 rounded">
            {meta.stampCode}
          </span>
        </div>

        <div
          className={`w-16 h-16 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center ${
            meta.unlocksCertificate
              ? 'bg-[#1E6F50] text-[#FAF7F0]'
              : 'bg-[#D9541E] text-[#FAF7F0]'
          }`}
        >
          {meta.unlocksCertificate ? (
            <Award className="w-8 h-8" />
          ) : (
            <Trophy className="w-8 h-8" />
          )}
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1E6F50] mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Badge Stamped to Your Cabinet</span>
          </div>
          <h3
            id="reward-modal-title"
            className="text-xl font-extrabold text-[#111111] tracking-tight"
          >
            {meta.title}
          </h3>
          <p className="text-sm text-[#524E48] leading-relaxed mt-2">
            {meta.description}
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
          {meta.unlocksCertificate && onOpenCabinet && (
            <button
              onClick={() => {
                onClose();
                onOpenCabinet();
              }}
              className="editorial-btn-success flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>View Certificate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="editorial-btn-primary flex-1 py-2.5 px-4 text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
