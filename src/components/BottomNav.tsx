import { Home, Search, PlusSquare, Film, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  user: any;
}

export function BottomNav({ activeTab, onTabChange, onAddClick, user }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around py-3 px-2 shadow-2xl">
        <button
          onClick={() => onTabChange('feed')}
          className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === 'feed' ? "text-blue-400 bg-blue-400/10" : "text-blue-100/50 hover:text-blue-100"
          )}
        >
          <Home className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => onTabChange('reels')}
          className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === 'reels' ? "text-blue-400 bg-blue-400/10" : "text-blue-100/50 hover:text-blue-100"
          )}
        >
          <Film className="w-6 h-6" />
        </button>

        <button
          onClick={onAddClick}
          className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <PlusSquare className="w-6 h-6" />
        </button>

        <button
          onClick={() => onTabChange('search')}
          className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === 'search' ? "text-blue-400 bg-blue-400/10" : "text-blue-100/50 hover:text-blue-100"
          )}
        >
          <Search className="w-6 h-6" />
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === 'profile' ? "text-blue-400 bg-blue-400/10" : "text-blue-100/50 hover:text-blue-100"
          )}
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
