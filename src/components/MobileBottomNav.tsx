import { AppRouteTab } from './LandingHub';
import { Home, Map, FolderGit2, ClipboardCheck, Terminal, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: AppRouteTab;
  hasActiveLesson: boolean;
  onNavigate: (tab: AppRouteTab) => void;
}

export default function MobileBottomNav({
  activeTab,
  hasActiveLesson,
  onNavigate,
}: MobileBottomNavProps) {
  const items: { id: AppRouteTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'projects', label: 'Studio', icon: FolderGit2 },
    { id: 'daily-test', label: 'Daily Test', icon: ClipboardCheck },
    { id: 'sandbox', label: 'Sandbox', icon: Terminal },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FAF7F0] border-t-2 border-[#111111] px-1 py-1 grid grid-cols-6 gap-0.5 print:hidden"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const IconComp = item.icon;
        const isActive =
          (hasActiveLesson && item.id === 'roadmap') ||
          (!hasActiveLesson && activeTab === item.id);

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] sm:text-[10px] font-mono font-bold transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#D9541E] text-[#FAF7F0] border-2 border-[#111111]'
                : 'text-[#524E48] hover:text-[#111111] hover:bg-[#E6DFD1] border-2 border-transparent'
            }`}
          >
            <IconComp className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-full leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
