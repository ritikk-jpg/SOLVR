import React from 'react';
import { WorkerProfile } from '../../types';
import { Compass, Zap, Wallet, User, Flame } from 'lucide-react';

export type NavigationTab = 'map' | 'active' | 'wallet' | 'profile';

interface StreamlinedBottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  worker: WorkerProfile;
  hasActiveTask: boolean;
}

export const StreamlinedBottomNav: React.FC<StreamlinedBottomNavProps> = ({
  activeTab,
  onChangeTab,
  worker,
  hasActiveTask,
}) => {
  return (
    <nav 
      aria-label="Primary Mobile Navigation"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="bg-[#09090B]/95 backdrop-blur-md text-white border-2 border-black rounded-full p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-between gap-1">
        {/* Tab 1: Map / Radar Feed */}
        <button
          onClick={() => onChangeTab('map')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-black transition-all min-h-[46px] active:scale-95 ${
            activeTab === 'map'
              ? 'bg-[#4ADE80] text-[#09090B] shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Map View"
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span className="inline">Map</span>
        </button>

        {/* Tab 2: Active Run (with live task indicator) */}
        <button
          onClick={() => onChangeTab('active')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-black transition-all min-h-[46px] relative active:scale-95 ${
            activeTab === 'active'
              ? 'bg-[#4ADE80] text-[#09090B] shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Active Run"
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span className="inline">Active</span>
          {hasActiveTask && (
            <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-[#4ADE80] ring-2 ring-[#09090B] animate-ping" />
          )}
          {hasActiveTask && (
            <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-[#4ADE80] ring-2 ring-[#09090B]" />
          )}
        </button>

        {/* Tab 3: UPI Wallet */}
        <button
          onClick={() => onChangeTab('wallet')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-black transition-all min-h-[46px] active:scale-95 ${
            activeTab === 'wallet'
              ? 'bg-[#4ADE80] text-[#09090B] shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          aria-label="UPI Wallet"
        >
          <Wallet className="w-4 h-4 shrink-0" />
          <span className="font-mono text-xs font-black inline">
            ₹{worker.pendingPayout.toLocaleString('en-IN')}
          </span>
        </button>

        {/* Tab 4: Profile & Streaks */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-black transition-all min-h-[46px] active:scale-95 ${
            activeTab === 'profile'
              ? 'bg-[#4ADE80] text-[#09090B] shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Volunteer Profile & Streaks"
        >
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-xs font-black inline">
              {worker.currentStreakDays}D
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
