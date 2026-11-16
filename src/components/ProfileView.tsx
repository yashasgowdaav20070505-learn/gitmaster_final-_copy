import React, { useState, useEffect } from 'react';
import { UserProgress, UserProfile } from '../types';
import { ALL_BADGES, MODULES } from '../data/lessons';
import {
  CONTINUITY_MILESTONES,
  getCoreCompletionStats,
  getTotalCompletionStats,
  getMilestoneProgress,
  isMilestoneUnlocked,
} from '../utils/continuityRewards';
import ProfileThemeSelector from './ProfileThemeSelector';
import {
  User,
  Terminal,
  Code,
  ShieldCheck,
  Cpu,
  Sparkles,
  Rocket,
  Mail,
  Zap,
  Coins,
  Flame,
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Printer,
  ClipboardCheck,
  GitCommit,
  BookOpen,
  Edit3,
  RotateCcw,
  X,
} from 'lucide-react';

interface ProfileViewProps {
  progress: UserProgress;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onResetProgress: () => void;
  onNavigateToDailyTest: () => void;
  onNavigateToRoadmap: () => void;
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

export default function ProfileView({
  progress,
  profile,
  onSaveProfile,
  onResetProgress,
  onNavigateToDailyTest,
  onNavigateToRoadmap,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [saveToast, setSaveToast] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftProfile(profile);
    }
  }, [profile, isEditing]);

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

  const coreStats = getCoreCompletionStats(progress.completedLessons);
  const totalStats = getTotalCompletionStats(progress.completedLessons);
  const isEligibleForCertificate = coreStats.isComplete;
  const streakMilestones = CONTINUITY_MILESTONES.filter((m) => m.type === 'streak');
  const testHistory = progress.dailyTestHistory || [];
  const totalSimulatedCommits = progress.simulatedCommitsCount || 0;

  const handleEnterEditMode = () => {
    setDraftProfile(profile);
    setConfirmingReset(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftProfile(profile);
    setConfirmingReset(false);
    setIsEditing(false);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedProfile: UserProfile = {
      ...draftProfile,
      name: draftProfile.name.trim() || 'Git Academy Cadet',
      role: draftProfile.role.trim() || 'Git Apprentice',
      bio: draftProfile.bio.trim() || 'Ready to write some history!',
    };
    onSaveProfile(cleanedProfile);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2600);
  };

  const ActiveAvatarIcon = getAvatarIcon(
    isEditing ? draftProfile.avatarIcon : profile.avatarIcon
  );
  const activeAvatarColorClass = getAvatarColorClasses(
    isEditing ? draftProfile.avatarColor : profile.avatarColor
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto" id="profile-view">
      {/* Save Confirmation Toast */}
      {saveToast && (
        <div
          role="status"
          className="bg-[#1E6F50] text-[#FAF7F0] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rounded-lg px-4 py-3 flex items-center justify-between gap-3 font-mono text-xs font-bold"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile changes saved to your Cadet dossier!</span>
          </span>
          <button
            onClick={() => setSaveToast(false)}
            className="hover:opacity-80 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: PROFILE CARD (Read-Only by Default, Toggleable Edit Mode) */}
      <section className="editorial-card p-6">
        {!isEditing ? (
          <div className="flex flex-col gap-6">
            {/* Top Row: Identity + Edit Profile Button */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
                <div
                  className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 shadow-[3px_3px_0px_#111111] relative shrink-0 ${activeAvatarColorClass}`}
                >
                  <ActiveAvatarIcon className="w-10 h-10" />
                  <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-md bg-[#FAF7F0] text-[#111111] flex items-center justify-center border-2 border-[#111111] font-bold text-xs font-mono tabular-nums">
                    {currentLevel}
                  </span>
                </div>

                <div className="min-w-0 flex flex-col gap-1">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
                    {profile.role}
                  </div>
                  <h2 className="text-2xl font-black text-[#111111] tracking-tight truncate">
                    {profile.name}
                  </h2>
                  <p className="text-xs text-[#524E48] leading-relaxed max-w-xl">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                  {profile.email && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#524E48] mt-1">
                      <Mail className="w-3.5 h-3.5 text-[#D9541E]" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnterEditMode}
                className="self-start px-4 py-2 bg-[#FAF7F0] hover:bg-[#E6DFD1] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] rounded-lg font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D9541E]" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Key Stats Row + XP Progress */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-2 border-[#111111]">
              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3.5">
                <div className="font-mono text-[10px] font-bold uppercase text-[#524E48]">
                  Cadet Level
                </div>
                <div className="font-mono text-xl font-black text-[#111111] mt-0.5 tabular-nums">
                  Level {currentLevel}
                </div>
              </div>

              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3.5">
                <div className="font-mono text-[10px] font-bold uppercase text-[#524E48] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#D9541E]" /> Total XP
                </div>
                <div className="font-mono text-xl font-black text-[#D9541E] mt-0.5 tabular-nums">
                  {progress.xp} XP
                </div>
              </div>

              <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3.5">
                <div className="font-mono text-[10px] font-bold uppercase text-[#524E48] flex items-center gap-1">
                  <Coins className="w-3 h-3 text-[#D9541E]" /> Coins
                </div>
                <div className="font-mono text-xl font-black text-[#111111] mt-0.5 tabular-nums">
                  {progress.coins}
                </div>
              </div>

              <div
                className={`border-2 border-[#111111] rounded-lg p-3.5 ${
                  progress.streak > 0
                    ? 'bg-[#1E6F50] text-[#FAF7F0]'
                    : 'bg-[#F3EEE3] text-[#111111]'
                }`}
              >
                <div
                  className={`font-mono text-[10px] font-bold uppercase flex items-center gap-1 ${
                    progress.streak > 0 ? 'text-[#FAF7F0]/85' : 'text-[#524E48]'
                  }`}
                >
                  <Flame className="w-3 h-3" /> Current Streak
                </div>
                <div className="font-mono text-xl font-black mt-0.5 tabular-nums">
                  {progress.streak} Days
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#524E48] uppercase tracking-wider tabular-nums">
                <span>Progress to Level {currentLevel + 1}</span>
                <span className="text-[#111111]">
                  {progress.xp} / {xpNeededForNext} XP
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E6DFD1] rounded-sm overflow-hidden border-2 border-[#111111]">
                <div
                  className="h-full bg-[#1E6F50] transition-all duration-300"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <form onSubmit={handleSaveChanges} className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#D9541E]" />
                <h2 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                  Edit Cadet Profile
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="editorial-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="editorial-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Live Avatar Preview */}
              <div className="lg:col-span-3 flex flex-col items-center text-center gap-3 bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-5">
                <div
                  className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 shadow-[3px_3px_0px_#111111] ${activeAvatarColorClass}`}
                >
                  <ActiveAvatarIcon className="w-10 h-10" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-sm font-extrabold text-[#111111] truncate">
                    {draftProfile.name || 'Git Academy Cadet'}
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[#D9541E] truncate">
                    {draftProfile.role || 'Git Apprentice'}
                  </div>
                </div>
              </div>

              {/* Editable Form Fields */}
              <div className="lg:col-span-9 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="profile-name-input"
                      className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono"
                    >
                      Cadet / Certificate Name
                    </label>
                    <input
                      id="profile-name-input"
                      type="text"
                      value={draftProfile.name}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter full name"
                      className="editorial-input w-full px-3 py-2.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-role-input"
                      className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono"
                    >
                      Role Title
                    </label>
                    <input
                      id="profile-role-input"
                      type="text"
                      value={draftProfile.role}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="e.g. Branch Architect"
                      className="editorial-input w-full px-3 py-2.5 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-bio-input"
                    className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1 font-mono"
                  >
                    Bio / Engineering Motto
                  </label>
                  <textarea
                    id="profile-bio-input"
                    rows={2}
                    value={draftProfile.bio}
                    onChange={(e) =>
                      setDraftProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Tell your story in a sentence..."
                    className="editorial-input w-full px-3 py-2 text-xs font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1.5 font-mono">
                      Avatar Icon
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const IconComp = item.icon;
                        const isSelected = draftProfile.avatarIcon === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setDraftProfile((prev) => ({ ...prev, avatarIcon: item.id }))
                            }
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
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-[#524E48] mb-1.5 font-mono">
                      Avatar Color Accent
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_COLORS.map((col) => {
                        const isSelected = draftProfile.avatarColor === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() =>
                              setDraftProfile((prev) => ({
                                ...prev,
                                avatarColor: col.id,
                              }))
                            }
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

                {/* Progress Reset Controls inside Edit Mode */}
                <div className="border-t-2 border-[#111111] pt-4 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-[#111111]">
                      Reset Learning Progress
                    </div>
                    <p className="text-[11px] text-[#524E48]">
                      Wipes XP, coins, streak, completed lessons, and Daily Test lock.
                    </p>
                  </div>

                  {!confirmingReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(true)}
                      className="editorial-btn-secondary px-3.5 py-2 text-xs font-bold text-[#D9541E] flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Progress</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onResetProgress();
                          setConfirmingReset(false);
                          setIsEditing(false);
                        }}
                        className="editorial-btn-primary px-3 py-2 text-xs font-bold cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingReset(false)}
                        className="editorial-btn-secondary px-3 py-2 text-xs font-bold cursor-pointer"
                      >
                        Keep Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* APPEARANCE & COLOR THEME PICKER (Profile Only) */}
      <ProfileThemeSelector />

      {/* SECTION 2: TROPHY CABINET & COMPLETED WORK */}
      <section className="editorial-card p-6 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#111111] pb-4">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#D9541E]">
              Trophy Cabinet &amp; Completed Work
            </span>
            <h3 className="text-xl font-extrabold text-[#111111] tracking-tight mt-0.5">
              Streaks, Milestone Badges &amp; Certificate
            </h3>
          </div>

          <button
            disabled={!isEligibleForCertificate}
            onClick={() => setShowCertificate(true)}
            className="editorial-btn-success px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            <span>
              {isEligibleForCertificate
                ? 'View Official GitMaster Certificate'
                : `Certificate Locked (${coreStats.completedCount}/${coreStats.totalCount} Lessons)`}
            </span>
          </button>
        </div>

        {/* Continuity Streak Milestones (3-Day, 7-Day, 10-Day) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streakMilestones.map((milestone) => {
            const unlocked = isMilestoneUnlocked(milestone.id, progress);
            const stat = getMilestoneProgress(milestone, progress);
            const daysRemaining = Math.max(0, milestone.targetValue - stat.current);

            return (
              <div
                key={milestone.id}
                className={`rounded-lg border-2 border-[#111111] p-4 flex flex-col justify-between gap-4 ${
                  unlocked
                    ? 'bg-[#F3EEE3] shadow-[4px_4px_0px_#111111]'
                    : 'bg-[#E6DFD1]/65'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 border-2 border-[#111111] rounded bg-[#111111] text-[#F3EEE3]">
                    {milestone.stampCode}
                  </span>
                  {unlocked ? (
                    <span className="font-mono text-[11px] font-bold text-[#1E6F50] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stamped
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] font-bold text-[#524E48] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {daysRemaining}d left
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-[#111111]">
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-[#524E48] mt-1 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-[#111111]/20">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#111111] tabular-nums">
                    <span>{stat.current} days completed</span>
                    <span>Target: {stat.target}d</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAF7F0] border border-[#111111] rounded-sm overflow-hidden">
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

        {/* Earned & Locked Milestone Badge Gallery */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D9541E]" />
              <span>Earned &amp; Locked Milestone Badges</span>
            </h4>
            <span className="font-mono text-xs font-bold text-[#524E48] tabular-nums">
              {progress.unlockedBadges.length} Earned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Core Architect Master Stamp */}
            {(() => {
              const coreMilestone = CONTINUITY_MILESTONES.find(
                (m) => m.id === 'badge-core-architect'
              )!;
              const unlocked = isMilestoneUnlocked(coreMilestone.id, progress);
              return (
                <div
                  className={`p-4 rounded-lg border-2 border-[#111111] flex items-start gap-3 ${
                    unlocked
                      ? 'bg-[#1E6F50] text-[#FAF7F0] shadow-[3px_3px_0px_#111111]'
                      : 'bg-[#E6DFD1]/65 text-[#111111]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg border-2 border-[#111111] flex items-center justify-center shrink-0 ${
                      unlocked
                        ? 'bg-[#FAF7F0] text-[#1E6F50]'
                        : 'bg-[#FAF7F0] text-[#524E48]'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider">
                      {unlocked
                        ? 'UNLOCKED · CORE-11'
                        : `LOCKED · ${coreStats.completedCount}/${coreStats.totalCount}`}
                    </div>
                    <div className="text-sm font-extrabold mt-0.5">
                      {coreMilestone.title}
                    </div>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        unlocked ? 'text-[#FAF7F0]/90' : 'text-[#524E48]'
                      }`}
                    >
                      {coreMilestone.description}
                    </p>
                  </div>
                </div>
              );
            })()}

            {ALL_BADGES.map((badge) => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 border-[#111111] flex items-start gap-3 ${
                    isUnlocked
                      ? 'bg-[#F3EEE3] shadow-[3px_3px_0px_#111111]'
                      : 'bg-[#E6DFD1]/65 text-[#524E48]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg border-2 border-[#111111] flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-[#D9541E] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#524E48]'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#524E48]">
                      {isUnlocked ? (
                        <span className="text-[#1E6F50]">UNLOCKED</span>
                      ) : (
                        <span>LOCKED · {badge.category}</span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-[#111111] mt-0.5">
                      {badge.title}
                    </div>
                    <p className="text-[11px] text-[#524E48] leading-relaxed mt-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPLETED LESSONS & DAILY TESTS LOG */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 editorial-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D9541E]" />
              <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                Completed Lessons Breakdown
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-[#1E6F50] tabular-nums">
              {totalStats.completedCount}/{totalStats.totalCount} Lessons
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
              <div className="font-mono text-lg font-black text-[#111111] tabular-nums">
                {totalStats.percent}%
              </div>
              <div className="font-mono text-[10px] text-[#524E48] uppercase font-bold">
                Mastery
              </div>
            </div>
            <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
              <div className="font-mono text-lg font-black text-[#111111] tabular-nums">
                {testHistory.length}
              </div>
              <div className="font-mono text-[10px] text-[#524E48] uppercase font-bold">
                Daily Tests
              </div>
            </div>
            <div className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3">
              <div className="font-mono text-lg font-black text-[#111111] tabular-nums flex items-center gap-1">
                <GitCommit className="w-4 h-4 text-[#D9541E]" />
                <span>{totalSimulatedCommits}</span>
              </div>
              <div className="font-mono text-[10px] text-[#524E48] uppercase font-bold">
                Commits
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {MODULES.map((mod) => {
              const doneInMod = mod.lessons.filter((l) =>
                progress.completedLessons.includes(l.id)
              );
              return (
                <div
                  key={mod.id}
                  className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#111111]">
                      {mod.title}
                    </div>
                    <div className="text-[11px] text-[#524E48] mt-0.5 truncate">
                      {doneInMod.length === 0
                        ? 'Not started yet'
                        : doneInMod.map((l) => l.title).join(' · ')}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded border-2 border-[#111111] shrink-0 tabular-nums ${
                      doneInMod.length === mod.lessons.length
                        ? 'bg-[#1E6F50] text-[#FAF7F0]'
                        : 'bg-[#FAF7F0] text-[#111111]'
                    }`}
                  >
                    {doneInMod.length}/{mod.lessons.length}
                  </span>
                </div>
              );
            })}
          </div>

          {coreStats.completedCount === 0 && (
            <button
              onClick={onNavigateToRoadmap}
              className="editorial-btn-primary self-start px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Start First Lesson
            </button>
          )}
        </div>

        {/* Daily Tests History */}
        <div className="lg:col-span-5 editorial-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#D9541E]" />
              <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                Daily Test Log
              </h3>
            </div>
            <button
              onClick={onNavigateToDailyTest}
              className="font-mono text-xs font-bold text-[#D9541E] hover:underline cursor-pointer"
            >
              Open Daily Test &rarr;
            </button>
          </div>

          {testHistory.length === 0 ? (
            <div className="bg-[#E6DFD1]/65 border-2 border-[#111111] rounded-lg p-6 text-center flex flex-col items-center gap-3 my-auto">
              <ClipboardCheck className="w-8 h-8 text-[#524E48]" />
              <div>
                <div className="text-xs font-extrabold text-[#111111]">
                  No Daily Tests completed yet
                </div>
                <p className="text-[11px] text-[#524E48] mt-1">
                  Attend today&apos;s adaptive 5-question Daily Test to earn XP, Coins, and build your streak.
                </p>
              </div>
              <button
                onClick={onNavigateToDailyTest}
                className="editorial-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Take Daily Test
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {[...testHistory].reverse().map((attempt) => {
                const pct = Math.round((attempt.score / attempt.total) * 100);
                return (
                  <div
                    key={attempt.id}
                    className="bg-[#F3EEE3] border-2 border-[#111111] rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#111111] truncate">
                        {attempt.tierLabel}
                      </div>
                      <div className="font-mono text-[10px] text-[#524E48] mt-0.5">
                        {attempt.date} · +{attempt.xpEarned} XP
                      </div>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-1 rounded border-2 border-[#111111] shrink-0 tabular-nums ${
                        pct >= 80
                          ? 'bg-[#1E6F50] text-[#FAF7F0]'
                          : 'bg-[#FAF7F0] text-[#111111]'
                      }`}
                    >
                      {attempt.score}/{attempt.total} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Official GitMaster Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/80 p-4 print:p-0 overflow-y-auto">
          <div className="bg-[#FAF7F0] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] rounded-xl p-6 max-w-4xl w-full flex flex-col gap-6 print:border-none print:shadow-none print:bg-white">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4 print:hidden">
              <div className="flex items-center gap-2 text-[#111111]">
                <Award className="w-5 h-5 text-[#D9541E]" />
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  Official GitMaster Graduation Credential
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
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
