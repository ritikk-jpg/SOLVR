import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { TaskCard } from './TaskCard';
import { Search, SlidersHorizontal, AlertCircle, Sparkles, Filter, X, ArrowUpDown } from 'lucide-react';

interface TaskFeedProps {
  tasks: CivicTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onClaimTask: (taskId: string) => void;
  onOpenProofModal: (task: CivicTask) => void;
  worker: WorkerProfile;
  activeRole: string;
  districtFilter?: string;
  onClearDistrictFilter?: () => void;
  searchFilter?: string;
  layoutMode?: 'split' | 'map_focus' | 'feed_focus';
}

export const TaskFeed: React.FC<TaskFeedProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClaimTask,
  onOpenProofModal,
  worker,
  activeRole,
  districtFilter = 'ALL',
  onClearDistrictFilter,
  searchFilter = '',
  layoutMode = 'split',
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'civic' | 'food' | 'critical' | 'my_active'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'bounty' | 'time'>('distance');

  const effectiveSearch = searchFilter || internalSearch;

  // Filter tasks
  const filtered = tasks.filter((task) => {
    // District filter
    if (districtFilter && districtFilter !== 'ALL') {
      const matchDistrict = task.district.toLowerCase().includes(districtFilter.toLowerCase().split(' ')[0]);
      if (!matchDistrict) return false;
    }

    // Search query
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(q) ||
        task.district.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.address.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Filter tab
    if (filterTab === 'civic') return task.type === 'civic_repair';
    if (filterTab === 'food') return task.type === 'food_rescue';
    if (filterTab === 'critical') return task.urgency === 'critical';
    if (filterTab === 'my_active') return task.status === 'claimed' && worker.activeTaskId === task.id;

    return true;
  });

  // Sort tasks
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    if (sortBy === 'bounty') return b.baseBounty - a.baseBounty;
    if (sortBy === 'time') return a.estimatedMinutes - b.estimatedMinutes;
    return 0;
  });

  const civicCount = tasks.filter((t) => t.type === 'civic_repair' && t.status !== 'completed').length;
  const foodCount = tasks.filter((t) => t.type === 'food_rescue' && t.status !== 'completed').length;
  const criticalCount = tasks.filter((t) => t.urgency === 'critical' && t.status !== 'completed').length;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Search Delhi runs (CP, Hauz Khas, Chandni Chowk)..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border-2 border-[#09090B] rounded-xl placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#FACC15] shadow-[2px_2px_0px_#09090B] font-medium"
          />
          {internalSearch && (
            <button
              onClick={() => setInternalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-white border-2 border-[#09090B] rounded-xl px-2.5 py-1.5 shadow-[2px_2px_0px_#09090B]">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="distance">Nearest (km)</option>
              <option value="bounty">Highest Bounty (₹)</option>
              <option value="time">Fastest Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator Badge if district is filtered */}
      {districtFilter !== 'ALL' && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#FFFBEB] border border-amber-300 rounded-xl text-xs font-medium text-amber-900">
          <span>
            Filtering by Delhi Zone: <strong>{districtFilter}</strong> ({filtered.length} found)
          </span>
          {onClearDistrictFilter && (
            <button
              onClick={onClearDistrictFilter}
              className="font-bold underline text-xs text-amber-950 hover:text-black ml-2"
            >
              Show All Delhi
            </button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 font-bold rounded-xl border-2 border-[#09090B] whitespace-nowrap transition-colors ${
            filterTab === 'all'
              ? 'bg-[#09090B] text-white shadow-[2px_2px_0px_#09090B]'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          All Runs ({tasks.length})
        </button>

        <button
          onClick={() => setFilterTab('civic')}
          className={`px-3 py-1.5 font-bold rounded-xl border-2 border-[#09090B] whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterTab === 'civic'
              ? 'bg-[#FACC15] text-[#09090B] shadow-[2px_2px_0px_#09090B]'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <span>MCD Civic</span>
          <span className="font-mono text-[10px] bg-black/10 px-1 rounded font-extrabold">
            {civicCount}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('food')}
          className={`px-3 py-1.5 font-bold rounded-xl border-2 border-[#09090B] whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterTab === 'food'
              ? 'bg-[#4ADE80] text-[#09090B] shadow-[2px_2px_0px_#09090B]'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <span>Food Rescue</span>
          <span className="font-mono text-[10px] bg-black/10 px-1 rounded font-extrabold">
            {foodCount}
          </span>
        </button>

        <button
          onClick={() => setFilterTab('critical')}
          className={`px-3 py-1.5 font-bold rounded-xl border-2 border-[#09090B] whitespace-nowrap transition-colors flex items-center gap-1 ${
            filterTab === 'critical'
              ? 'bg-[#DC2626] text-white shadow-[2px_2px_0px_#09090B]'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <span>Priority Alert</span>
          <span className="font-mono text-[10px] bg-black/15 px-1 rounded font-extrabold">
            {criticalCount}
          </span>
        </button>

        {worker.activeTaskId && (
          <button
            onClick={() => setFilterTab('my_active')}
            className={`px-3 py-1.5 font-bold rounded-xl border-2 border-[#09090B] whitespace-nowrap transition-colors flex items-center gap-1 ${
              filterTab === 'my_active'
                ? 'bg-amber-400 text-[#09090B] shadow-[2px_2px_0px_#09090B]'
                : 'bg-white text-amber-900 border-amber-400 hover:bg-amber-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>My Active Task</span>
          </button>
        )}
      </div>

      {/* Task Cards List */}
      <div className={`flex-1 overflow-y-auto space-y-3 pr-1 pb-6 ${
        layoutMode === 'feed_focus' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''
      }`}>
        {sorted.length > 0 ? (
          sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={() => onSelectTask(task.id)}
              onClaim={onClaimTask}
              onOpenProofModal={onOpenProofModal}
              worker={worker}
              activeRole={activeRole}
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center bg-white border-2 border-[#09090B] rounded-2xl shadow-[3px_3px_0px_#09090B]">
            <AlertCircle className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <h4 className="font-bold text-sm text-[#09090B]">No tasks found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No tasks match your current zone or search query. Try switching zones to "All Delhi NCT" or clear your filter.
            </p>
            {districtFilter !== 'ALL' && onClearDistrictFilter && (
              <button
                onClick={onClearDistrictFilter}
                className="mt-3 px-3.5 py-1.5 bg-[#09090B] text-white text-xs font-bold rounded-xl neo-btn"
              >
                Reset to All Delhi NCT
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
