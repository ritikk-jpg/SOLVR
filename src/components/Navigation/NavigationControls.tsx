import React from 'react';
import { ActiveRole, WorkerProfile, CivicTask } from '../../types';
import { DISTRICTS } from '../../data/initialData';
import { 
  Users, 
  Building2, 
  UtensilsCrossed, 
  Terminal, 
  Wallet, 
  Flame, 
  MapPin, 
  Compass, 
  Columns, 
  Map as MapIcon, 
  ListFilter, 
  Search, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Navigation,
  Sparkles,
  Command
} from 'lucide-react';

export type ViewLayoutMode = 'split' | 'map_focus' | 'feed_focus';

interface NavigationControlsProps {
  activeRole: ActiveRole;
  onSelectRole: (role: ActiveRole) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  layoutMode: ViewLayoutMode;
  onChangeLayoutMode: (mode: ViewLayoutMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tasks: CivicTask[];
  selectedTask: CivicTask | null;
  onSelectTask: (taskId: string | null) => void;
  onClaimTask: (taskId: string) => void;
  onOpenProofModal: (task: CivicTask) => void;
  worker: WorkerProfile;
  onOpenPayoutModal: () => void;
  onOpenApiExplorer: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  activeRole,
  onSelectRole,
  selectedDistrict,
  onSelectDistrict,
  layoutMode,
  onChangeLayoutMode,
  searchQuery,
  onSearchChange,
  tasks,
  selectedTask,
  onSelectTask,
  onClaimTask,
  onOpenProofModal,
  worker,
  onOpenPayoutModal,
  onOpenApiExplorer,
}) => {
  // Counts for role badges
  const openTasksCount = tasks.filter((t) => t.status === 'open').length;
  const inReviewCount = tasks.filter((t) => t.status === 'in_review' || t.proofSubmission).length;
  const foodSurplusCount = tasks.filter((t) => t.type === 'food_rescue' && t.status !== 'completed').length;
  const myActiveTask = tasks.find((t) => t.id === worker.activeTaskId);

  // District counts
  const getDistrictTaskCount = (districtName: string) => {
    if (districtName === 'ALL') return tasks.length;
    return tasks.filter((t) => t.district.toLowerCase().includes(districtName.toLowerCase().split(' ')[0])).length;
  };

  const districtList = [
    { id: 'ALL', label: 'All Delhi NCT', icon: '🇮🇳' },
    { id: DISTRICTS[0], label: 'Central (CP)', icon: '📍' },
    { id: DISTRICTS[1], label: 'South (Saket/Hauz Khas)', icon: '📍' },
    { id: DISTRICTS[2], label: 'Old Delhi (Chandni Chowk)', icon: '📍' },
    { id: DISTRICTS[3], label: 'West (Rajouri/Janakpuri)', icon: '📍' },
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* 1. Main Role Bar with Rich Status Badges */}
      <div className="bg-white border-2 border-[#09090B] rounded-2xl p-2 sm:p-2.5 shadow-[3px_3px_0px_#09090B]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Primary View Switcher Tabs */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 overflow-x-auto p-1 bg-[#FDF8EE] rounded-xl border border-zinc-200">
            {/* Field Worker Tab */}
            <button
              onClick={() => onSelectRole('worker')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeRole === 'worker'
                  ? 'bg-[#09090B] text-white shadow-sm ring-1 ring-black'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-[#FACC15] shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-left">
                <span>Field Worker</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeRole === 'worker' ? 'bg-[#FACC15] text-[#09090B]' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {openTasksCount} Open
                </span>
              </div>
            </button>

            {/* MCD / Municipal CAD Tab */}
            <button
              onClick={() => onSelectRole('dispatch')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeRole === 'dispatch'
                  ? 'bg-[#09090B] text-white shadow-sm ring-1 ring-black'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#FACC15] shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-left">
                <span>MCD Dispatch</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeRole === 'dispatch' ? 'bg-[#FACC15] text-[#09090B]' : 'bg-amber-100 text-amber-900'
                }`}>
                  {inReviewCount} Escrow
                </span>
              </div>
            </button>

            {/* Food Donor Network Tab */}
            <button
              onClick={() => onSelectRole('donor')}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeRole === 'donor'
                  ? 'bg-[#09090B] text-white shadow-sm ring-1 ring-black'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-[#4ADE80] shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-left">
                <span>Food Donors</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                  activeRole === 'donor' ? 'bg-[#4ADE80] text-[#09090B]' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {foodSurplusCount} Active
                </span>
              </div>
            </button>
          </div>

          {/* Quick Actions: API Docs & UPI Wallet */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* View Mode Layout (Only in Worker View) */}
            {activeRole === 'worker' && (
              <div className="hidden md:flex items-center gap-1 p-1 bg-[#FDF8EE] border border-zinc-300 rounded-xl">
                <button
                  onClick={() => onChangeLayoutMode('split')}
                  title="Side-by-side Map and Task Feed"
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    layoutMode === 'split' ? 'bg-[#09090B] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden xl:inline">Split</span>
                </button>
                <button
                  onClick={() => onChangeLayoutMode('map_focus')}
                  title="Expand Tactical Radar Map"
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    layoutMode === 'map_focus' ? 'bg-[#09090B] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden xl:inline">Map View</span>
                </button>
                <button
                  onClick={() => onChangeLayoutMode('feed_focus')}
                  title="Expand Task Card Feed"
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    layoutMode === 'feed_focus' ? 'bg-[#09090B] text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden xl:inline">List View</span>
                </button>
              </div>
            )}

            {/* API Explorer Shortcut */}
            <button
              onClick={onOpenApiExplorer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#09090B] text-[#FACC15] border-2 border-[#09090B] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#09090B] neo-btn"
              title="Test backend REST APIs, schemas & state machines"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="font-mono">API Docs</span>
            </button>

            {/* UPI Wallet Shortcut */}
            <button
              onClick={onOpenPayoutModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-[#09090B] rounded-xl text-xs font-bold shadow-[2px_2px_0px_#09090B] neo-btn transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-zinc-700" />
              <span className="font-mono text-zinc-900 font-extrabold">
                ₹{worker.pendingPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold bg-[#FACC15] text-[#09090B] border border-[#09090B] px-1 py-0.2 rounded hidden sm:inline">
                UPI Ledger
              </span>
            </button>
          </div>
        </div>

        {/* 2. District Filter Ribbon & Universal Search */}
        <div className="mt-2.5 pt-2 border-t border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Delhi NCT Zone Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-[#09090B]" />
              <span>Zone:</span>
            </span>

            {districtList.map((dist) => {
              const isSelected =
                dist.id === 'ALL'
                  ? selectedDistrict === 'ALL'
                  : selectedDistrict.toLowerCase().includes(dist.id.toLowerCase().split(' ')[0]);

              return (
                <button
                  key={dist.id}
                  onClick={() => onSelectDistrict(dist.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-[#09090B] text-white border-[#09090B] shadow-[1.5px_1.5px_0px_#FACC15]'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-black hover:bg-zinc-100'
                  }`}
                >
                  <span>{dist.icon}</span>
                  <span>{dist.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {getDistrictTaskCount(dist.id)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[220px] lg:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter tasks, roads, shelters..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#FDF8EE] border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-hidden focus:border-[#09090B] focus:ring-1 focus:ring-[#09090B] font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Persistent Quick-Action Drawer when a Task is Selected */}
      {selectedTask && (
        <div className="bg-[#09090B] text-white border-2 border-[#09090B] rounded-2xl p-3 shadow-[3px_3px_0px_#FACC15] animate-in fade-in slide-in-from-top-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              selectedTask.type === 'food_rescue' 
                ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                : 'bg-amber-950 border-amber-500 text-amber-400'
            }`}>
              {selectedTask.type === 'food_rescue' ? (
                <UtensilsCrossed className="w-4 h-4" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold text-[#FACC15]">
                  {selectedTask.id}
                </span>
                <span className="text-[10px] uppercase font-bold bg-white/10 px-1.5 py-0.2 rounded border border-white/20">
                  {selectedTask.district}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  selectedTask.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedTask.status === 'claimed'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  Status: {selectedTask.status.toUpperCase()}
                </span>
              </div>
              <h4 className="font-extrabold text-sm truncate text-white mt-0.5">
                {selectedTask.title}
              </h4>
              <p className="text-xs text-zinc-400 truncate">
                {selectedTask.address} · {selectedTask.distanceKm} km away · ₹{selectedTask.baseBounty.toLocaleString('en-IN')} Bounty
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {selectedTask.status === 'open' && (
              <button
                onClick={() => onClaimTask(selectedTask.id)}
                className="px-3.5 py-1.5 bg-[#FACC15] text-[#09090B] font-extrabold text-xs rounded-xl border-2 border-black hover:bg-yellow-300 shadow-[2px_2px_0px_#ffffff] transition-all flex items-center gap-1.5"
              >
                <span>Claim Run (+₹{selectedTask.baseBounty})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedTask.status === 'claimed' && (
              <button
                onClick={() => onOpenProofModal(selectedTask)}
                className="px-3.5 py-1.5 bg-emerald-400 text-[#09090B] font-extrabold text-xs rounded-xl border-2 border-black hover:bg-emerald-300 shadow-[2px_2px_0px_#ffffff] transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit Proof & Payout</span>
              </button>
            )}

            <button
              onClick={() => onSelectTask(null)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
