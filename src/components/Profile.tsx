import { useState } from 'react';
import { UserProgress, UserProfile } from '../types';
import { ALL_BADGES } from '../data/lessons';
import { getCoreCompletionStats } from '../utils/continuityRewards';
import ContinuityBadges from './ContinuityBadges';
import {
  Trophy,
  Award,
  Mail,
  Sparkles,
  Printer,
  User,
  Terminal,
  Code,
  ShieldCheck,
  Cpu,
  Rocket,
  Settings,
  CheckCircle2,
} from 'lucide-react';

interface ProfileProps {
  progress: UserProgress;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

const AVAILABLE_ICONS = [
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'code', label: 'Code Dev', icon: Code },
  { id: 'shield', label: 'Shield', icon: ShieldCheck },
  { id: 'cpu', label: 'Core CPU', icon: Cpu },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'user', label: 'Cadet Profile', icon: User },
];

const AVAILABLE_COLORS = [
  {
    id: 'orange',
    label: 'Burnt Orange',
    class: 'bg-[#D9541E] border-[#111111] text-[#FAF7F0]',
  },
  {
    id: 'green',
    label: 'Committed Green',
    class: 'bg-[#1E6F50] border-[#111111] text-[#FAF7F0]',
  },
  {
    id: 'amber',
    label: 'Warm Cream',
    class: 'bg-[#E6DFD1] border-[#111111] text-[#111111]',
  },
  {
    id: 'purple',
    label: 'Ink Black',
    class: 'bg-[#111111] border-[#111111] text-[#F3EEE3]',
  },
];

function getAvatarIcon(iconName: string) {
  switch (iconName) {
    case 'terminal':
      return Terminal;
    case 'code':
      return Code;
    case 'shield':
      return ShieldCheck;
    case 'cpu':
      return Cpu;
    case 'sparkles':
      return Sparkles;
    case 'rocket':
      return Rocket;
    default:
      return User;
  }
}

function getAvatarColorClasses(colorName: string) {
  switch (colorName) {
    case 'green':
    case 'teal':
      return 'bg-[#1E6F50] border-[#111111] text-[#FAF7F0]';
    case 'amber':
      return 'bg-[#E6DFD1] border-[#111111] text-[#111111]';
    case 'purple':
      return 'bg-[#111111] border-[#111111] text-[#F3EEE3]';
    default:
      return 'bg-[#D9541E] border-[#111111] text-[#FAF7F0]';
  }
}

export default function Profile({
  progress,
  profile,
  onSaveProfile,
}: ProfileProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const coreStats = getCoreCompletionStats(progress.completedLessons);
  const isEligibleForCertificate = coreStats.isComplete;

  const currentLevel = Math.floor(progress.xp / 300) + 1;
  const xpNeededForNext = currentLevel * 300;
  const previousLevelXp = (currentLevel - 1) * 300;
  const xpProgressPercent = Math.min(
    100,
    Math.max(
      0,
      ((progress.xp - previousLevelXp) / (xpNeededForNext - previousLevelXp)) * 100
    )
  );

  const handlePrint = () => {
    window.print();
  };

  const handleProfileUpdate = (fields: Partial<UserProfile>) => {
    onSaveProfile({
      ...profile,
      ...fields,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6" id="profile-view">
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Main Identity Card */}
        <div className="lg:col-span-1 editorial-card p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 shadow-[3px_3px_0px_#111111] relative ${getAvatarColorClasses(
                profile.avatarColor
              )}`}
            >
              {(() => {
                const IconComp = getAvatarIcon(profile.avatarIcon);
                return <IconComp className="w-10 h-10" />;
              })()}
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-md bg-[#FAF7F0] text-[#111111] flex items-center justify-center border-2 border-[#111111] font-bold text-xs font-mono tabular-nums">
                {currentLevel}
              </span>
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-lg font-extrabold text-[#111111] truncate">
              {profile.name}
            </h2>
            <div className="text-xs text-[#D9541E] font-mono font-bold mt-0.5">
              {profile.role}
            </div>

            <p className="text-xs text-[#524E48] italic mt-3 max-w-xs mx-auto px-4 leading-normal bg-[#F3EEE3] py-2 rounded-lg border-2 border-[#111111]">
              &ldquo;{profile.bio}&rdquo;
            </p>

            <div className="text-[11px] text-[#524E48] mt-3 flex items-center justify-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#D9541E]" />
              <span className="truncate max-w-[200px]">{profile.email}</span>
            </div>
          </div>

          <div className="w-full mt-2 pt-4 border-t-2 border-[#111111]">
            <div className="flex items-center justify-between font-bold font-mono text-[10px] text-[#524E48] uppercase tracking-wider mb-1.5 tabular-nums">
              <span>Level {currentLevel} Progress</span>
              <span className="text-[#111111]">{progress.xp} Total XP</span>
            </div>
            <div className="w-full h-2.5 bg-[#E6DFD1] rounded-sm overflow-hidden border-2 border-[#111111]">
              <div
                className="h-full bg-[#1E6F50]"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Profile Settings and Certificate */}
        <div className="lg:col-span-2 editorial-card p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2.5">
              <h3 className="font-mono font-bold text-[#111111] text-xs uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#D9541E]" /> Profile Settings &amp; Avatar
              </h3>
              {saveToast && (
                <span className="text-[10px] font-mono font-bold text-[#1E6F50] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono">
                  Graduation Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleProfileUpdate({ name: e.target.value })}
                  placeholder="Enter full name"
                  className="editorial-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileUpdate({ email: e.target.value })}
                  placeholder="email@example.com"
                  className="editorial-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono">
                  Academy Role Title
                </label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => handleProfileUpdate({ role: e.target.value })}
                  placeholder="e.g. Branch Architect"
                  className="editorial-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono">
                  Motto / Status Bio
                </label>
                <input
                  type="text"
                  value={profile.bio}
                  onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
                  placeholder="e.g. Ready to commit!"
                  className="editorial-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1.5 font-mono">
                  Choose Avatar Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = profile.avatarIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleProfileUpdate({ avatarIcon: item.id })}
                        title={item.label}
                        className={`w-9 h-9 rounded-lg border-2 border-[#111111] flex items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#D9541E] text-[#FAF7F0] shadow-[2px_2px_0px_#111111]'
                            : 'bg-[#F3EEE3] text-[#111111] hover:bg-[#E6DFD1]'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1.5 font-mono">
                  Choose Avatar Accent
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((col) => {
                    const isSelected = profile.avatarColor === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => handleProfileUpdate({ avatarColor: col.id })}
                        title={col.label}
                        className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-lg border-2 transition-all cursor-pointer ${
                          col.class
                        } ${
                          isSelected
                            ? 'shadow-[3px_3px_0px_#111111] -translate-y-0.5'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[#111111] pt-4 mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-[#524E48] max-w-md leading-relaxed">
              Complete all 5 Core Modules ({coreStats.completedCount}/{coreStats.totalCount}{' '}
              lessons) to unlock the Core Architect badge and claim your printable{' '}
              <strong className="text-[#111111]">
                Official GitMaster Certificate of Achievement
              </strong>{' '}
              signed by Turing.
            </p>
            <button
              disabled={!isEligibleForCertificate}
              onClick={() => setShowCertificate(true)}
              className="editorial-btn-success w-full sm:w-auto px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>Claim Official Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continuity & Core Completion Milestones */}
      <ContinuityBadges progress={progress} />

      {/* Lesson Mastery Trophy Cabinet */}
      <div className="editorial-card p-6">
        <h3 className="font-mono font-bold text-[#111111] text-xs uppercase tracking-wider border-b-2 border-[#111111] pb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#D9541E]" /> Curriculum Mastery Stamps
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 border-[#111111] transition-all flex items-center gap-4 ${
                  isUnlocked
                    ? 'bg-[#F3EEE3] shadow-[3px_3px_0px_#111111]'
                    : 'bg-[#E6DFD1]/65 text-[#524E48]'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg border-2 border-[#111111] flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-[#D9541E] text-[#FAF7F0]'
                      : 'bg-[#FAF7F0] text-[#524E48]'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#111111]">
                    {badge.title}
                  </div>
                  <div className="text-[11px] text-[#524E48] leading-normal mt-0.5">
                    {badge.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official GitMaster Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/80 p-4 print:p-0 overflow-y-auto">
          <div className="bg-[#FAF7F0] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] rounded-xl p-6 max-w-4xl w-full flex flex-col gap-6 print:border-none print:shadow-none print:bg-white">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4 print:hidden">
              <div className="flex items-center gap-2 text-[#111111]">
                <Award className="w-5 h-5 text-[#D9541E]" />
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  Official GitMaster Graduation Credential
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="editorial-btn-success px-4 py-2 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="editorial-btn-secondary px-4 py-2 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Certificate Canvas Sheet */}
            <div className="bg-[#F3EEE3] border-4 border-[#111111] rounded-lg p-10 md:p-16 text-center relative flex flex-col items-center justify-center gap-6 print:bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#D9541E] text-[#FAF7F0] border-2 border-[#111111] flex items-center justify-center">
                  <Award className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">
                  Official GitMaster Certificate of Achievement
                </h1>
                <div className="h-0.5 w-24 bg-[#D9541E]" />
                <p className="text-xs uppercase tracking-widest font-mono text-[#D9541E] font-bold">
                  GitMaster · Git &amp; GitHub Academy
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-[#524E48] italic">
                  This credential certifies that
                </p>
                <h2 className="text-2xl font-extrabold text-[#111111] tracking-wide underline decoration-[#D9541E] underline-offset-8 py-2">
                  {profile.name}
                </h2>
                <p className="text-xs text-[#524E48] max-w-md mx-auto leading-relaxed mt-2">
                  has completed all 5 Core Modules (11/11 lessons) of the GitMaster curriculum, demonstrating fluency in local initialization, staging, commits, branching, merging, remote cloning, and state recovery.
                </p>
              </div>

              {/* Signature Row */}
              <div className="grid grid-cols-2 gap-12 mt-8 w-full max-w-lg border-t-2 border-[#111111] pt-6">
                <div>
                  <div className="font-serif italic text-lg font-bold text-[#111111]">
                    Turing
                  </div>
                  <div className="text-[11px] text-[#524E48] font-mono mt-1">
                    Git AI Mentor Sign-off
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[#111111]">
                    {new Date().toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-[11px] text-[#524E48] font-mono mt-1">
                    Completion Date
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
