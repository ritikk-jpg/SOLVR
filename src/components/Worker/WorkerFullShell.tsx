import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { TacticalMap } from '../Map/TacticalMap';
import { TaskShareModal } from '../Modals/TaskShareModal';
import { 
  Navigation, 
  Compass, 
  Wrench, 
  UtensilsCrossed, 
  MapPin, 
  Search,
  Sparkles,
  ChevronDown,
  Share2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Apple,
  Filter,
  Check,
  X,
  Layers,
  Map as MapIcon,
  List
} from 'lucide-react';

interface WorkerFullShellProps {
  tasks: CivicTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onClaimTask: (taskId: string) => void;
  onOpenProofModal: (task: CivicTask) => void;
  worker: WorkerProfile;
  activeRole: 'worker' | 'courier';
  onToggleRole?: (role: 'worker' | 'courier') => void;
  onNotifyToast?: (msg: string) => void;
}

export const WorkerFullShell: React.FC<WorkerFullShellProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClaimTask,
  onOpenProofModal,
  worker,
  activeRole,
  onToggleRole,
  onNotifyToast,
}) => {
  // Mobile Tab State: 'map' (Unobstructed Tactical Map) vs 'feed' (Dedicated Task List)
  const [mobileTab, setMobileTab] = useState<'map' | 'feed'>('map');
  const [selectedHub, setSelectedHub] = useState<'CP' | 'NehruPlace' | 'Saket'>('CP');
  const [showHubPicker, setShowHubPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<'all' | 'urgent' | 'high_bounty'>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(selectedTaskId);
  const [shareModalTask, setShareModalTask] = useState<CivicTask | null>(null);

  const hubs = [
    { id: 'CP', name: 'Connaught Place', zone: 'Central Delhi', dist: '0.4 km away' },
    { id: 'NehruPlace', name: 'Nehru Place Hub', zone: 'South East', dist: '1.8 km away' },
    { id: 'Saket', name: 'Saket District Centre', zone: 'South Delhi', dist: '2.5 km away' },
  ] as const;

  // Filter tasks based on search & active role
  const roleFilteredTasks = tasks.filter((t) => {
    if (activeRole === 'courier') return t.type === 'food_rescue';
    return t.type !== 'food_rescue';
  });

  const searchedTasks = roleFilteredTasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q) ||
      t.district.toLowerCase().includes(q)
    );
  });

  const filteredTasks = searchedTasks.filter((t) => {
    if (feedFilter === 'urgent') return t.urgency === 'critical';
    if (feedFilter === 'high_bounty') return t.baseBounty >= 350;
    return true;
  });

  const activeTask = tasks.find((t) => t.id === worker.activeTaskId);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const primaryTask = activeTask || selectedTask;

  const handleSelectFromMap = (taskId: string) => {
    onSelectTask(taskId);
    setExpandedCardId(taskId);
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#EBF5EE]">
      {/* 1. Mobile Tabbed Navigation Bar (Dedicated Map vs Task Feed) */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-white/95 border-b-2 border-black z-30 shrink-0">
        <div className="flex items-center gap-1 p-1 bg-[#EBF5EE] border-2 border-black rounded-full shadow-[1.5px_1.5px_0px_#09090B]">
          <button
            onClick={() => setMobileTab('map')}
            className={`px-3 py-1.5 text-xs font-black rounded-full transition-all flex items-center gap-1.5 ${
              mobileTab === 'map'
                ? 'bg-[#09090B] text-[#FACC15] shadow-xs'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Tactical Map</span>
          </button>
          <button
            onClick={() => setMobileTab('feed')}
            className={`px-3 py-1.5 text-xs font-black rounded-full transition-all flex items-center gap-1.5 ${
              mobileTab === 'feed'
                ? 'bg-[#09090B] text-[#4ADE80] shadow-xs'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Task Feed ({filteredTasks.length})</span>
          </button>
        </div>

        {/* Delhi Dispatch Anchor Pill on Mobile */}
        <div className="relative">
          <button
            onClick={() => setShowHubPicker((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-black rounded-full shadow-[1.5px_1.5px_0px_#09090B] text-xs font-extrabold"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            <span className="text-[11px] font-bold">{selectedHub}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showHubPicker && (
            <div className="absolute right-0 top-10 w-48 bg-white border-2 border-black rounded-2xl p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] z-50 space-y-1 animate-in fade-in zoom-in-95">
              {hubs.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => {
                    setSelectedHub(hub.id);
                    setShowHubPicker(false);
                    if (onNotifyToast) onNotifyToast(`Anchored to ${hub.name}`);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    selectedHub === hub.id ? 'bg-[#EBF5EE] text-black border border-emerald-300' : 'hover:bg-zinc-100'
                  }`}
                >
                  <div className="truncate">{hub.name}</div>
                  <div className="text-[10px] text-zinc-500 font-normal">{hub.dist}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Body Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col md:flex-row">
        
        {/* DESKTOP SPLIT VIEW: Left Feed Column (hidden on mobile when tab is 'map') */}
        <div className={`w-full md:w-[420px] lg:w-[460px] h-full flex flex-col border-r-2 border-black bg-white shrink-0 z-20 ${
          mobileTab === 'map' ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Feed Header Controls & Search */}
          <div className="p-3 sm:p-4 border-b-2 border-zinc-200 bg-[#FDF8EE] shrink-0 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-2 ring-emerald-300 animate-pulse" />
                <h2 className="font-black text-sm text-[#09090B] tracking-tight">
                  {activeRole === 'courier' ? 'Surplus Food Pickups' : 'Civic Repair Waypoints'}
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-black text-[#FACC15] rounded-full">
                {filteredTasks.length} Available
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Delhi runs (Saket, CP, pothole)..."
                className="w-full pl-8 pr-7 py-2 bg-white border-2 border-black rounded-xl text-xs font-bold text-black placeholder:text-zinc-400 shadow-[2px_2px_0px_#09090B] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-zinc-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Feed Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                  feedFilter === 'all'
                    ? 'bg-[#09090B] text-white border-[#09090B]'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFeedFilter('urgent')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  feedFilter === 'urgent'
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                <span>Urgent</span>
              </button>
              <button
                onClick={() => setFeedFilter('high_bounty')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all ${
                  feedFilter === 'high_bounty'
                    ? 'bg-[#FACC15] text-black border-black font-extrabold'
                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>High Bounty (₹350+)</span>
              </button>
            </div>
          </div>

          {/* Scrollable Task Feed Cards List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-28 md:pb-20">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Compass className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
                <p className="font-extrabold text-sm text-zinc-700">No waypoints found</p>
                <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query or filter tags</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                const isExpanded = expandedCardId === task.id;
                const isClaimedByMe = worker.activeTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task.id);
                      setExpandedCardId((prev) => (prev === task.id ? null : task.id));
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-[#FFFBEB] shadow-[3px_3px_0px_#09090B]'
                        : 'border-zinc-300 bg-white hover:border-zinc-500 shadow-[1px_1px_0px_#09090B]'
                    }`}
                  >
                    {/* Header Row: Badges, Bounty & Share */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.type === 'food_rescue' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#4ADE80] text-black border border-black flex items-center gap-1">
                            <Apple className="w-3 h-3" />
                            Food Rescue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FACC15] text-black border border-black flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            MCD Civic
                          </span>
                        )}

                        {task.urgency === 'critical' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-red-600" />
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareModalTask(task);
                          }}
                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-black/20 flex items-center justify-center text-zinc-700 active:scale-95"
                          title="Share Task Link"
                          aria-label="Share Task"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-sm text-[#09090B] bg-[#EBF5EE] px-2 py-0.5 rounded-lg border border-black">
                          ₹{task.baseBounty}
                        </span>
                      </div>
                    </div>

                    {/* Task Title & Address */}
                    <h3 className="font-extrabold text-sm text-[#09090B] leading-snug mb-1">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-600 mb-2">
                      <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{task.address} · <span className="font-bold text-zinc-800">{task.district}</span></span>
                    </div>

                    {/* Distance & Transit Meta */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 pt-2 border-t border-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-emerald-600" />
                          {task.distanceKm} km away
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          ~{task.estimatedMinutes} mins
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCardId((prev) => (prev === task.id ? null : task.id));
                        }}
                        className="text-zinc-500 hover:text-black font-bold flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? 'Less' : 'Details'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Expanded Progressive Disclosure */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t-2 border-dashed border-zinc-300 space-y-2.5 animate-in fade-in duration-150">
                        <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                          {task.description}
                        </p>

                        {task.foodDetails && (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1">
                              <Apple className="w-3.5 h-3.5" />
                              Surplus Spec: {task.foodDetails.weightKg} kg (~{Math.round(task.foodDetails.weightKg * 2.5)} meals)
                            </div>
                            <div className="text-[11px] text-emerald-800">
                              Dropoff target: {task.foodDetails.destinationName} ({task.foodDetails.destinationAddress})
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {isClaimedByMe ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProofModal(task);
                              }}
                              className="flex-1 py-2 px-3 bg-[#4ADE80] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Submit Completion Proof</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClaimTask(task.id);
                              }}
                              className="flex-1 py-2 px-3 bg-[#09090B] text-[#FACC15] font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <span>Claim Run (₹{task.baseBounty})</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Switch to map button on mobile */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task.id);
                              setMobileTab('map');
                            }}
                            className="md:hidden py-2 px-3 bg-white text-black font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1"
                          >
                            <MapIcon className="w-3.5 h-3.5" />
                            <span>Map</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAP VIEWPORT: Full-screen on desktop, or active tab on mobile */}
        <div className={`flex-1 h-full relative overflow-hidden bg-[#E8E2D2] ${
          mobileTab === 'feed' ? 'hidden md:flex' : 'flex'
        }`}>
          <TacticalMap
            tasks={filteredTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectFromMap}
            worker={worker}
            activeRole={activeRole}
            layoutMode="map_focus"
            showOverlayHud={false}
          />

          {/* Floating Selected Task Card on Mobile (Thumb-Friendly, non-intrusive) */}
          {primaryTask && (
            <div className="md:hidden absolute bottom-20 left-3 right-3 z-30 pointer-events-auto">
              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      primaryTask.type === 'food_rescue' ? 'bg-[#4ADE80]' : 'bg-[#FACC15]'
                    }`} />
                    <h4 className="font-black text-xs text-[#09090B] truncate">
                      {primaryTask.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-[#EBF5EE] text-black border border-black rounded">
                      ₹{primaryTask.baseBounty}
                    </span>
                    <button
                      onClick={() => setShareModalTask(primaryTask)}
                      className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 flex items-center justify-center"
                      title="Share Task"
                    >
                      <Share2 className="w-3.5 h-3.5 text-zinc-700" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600">
                  <span className="truncate max-w-[200px]">{primaryTask.address} ({primaryTask.district})</span>
                  <span className="font-bold text-black">{primaryTask.distanceKm} km</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      if (worker.activeTaskId === primaryTask.id) {
                        onOpenProofModal(primaryTask);
                      } else {
                        onClaimTask(primaryTask.id);
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#09090B] text-[#FACC15] font-black text-xs rounded-xl border border-black shadow-[1.5px_1.5px_0px_#09090B] flex items-center justify-center gap-1"
                  >
                    {worker.activeTaskId === primaryTask.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                        <span>Submit Proof</span>
                      </>
                    ) : (
                      <>
                        <span>Claim Run</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setMobileTab('feed');
                      setExpandedCardId(primaryTask.id);
                    }}
                    className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-xl border border-zinc-300"
                  >
                    Full Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Sharing Modal */}
      {shareModalTask && (
        <TaskShareModal
          task={shareModalTask}
          onClose={() => setShareModalTask(null)}
          onNotifyToast={onNotifyToast}
        />
      )}
    </div>
  );
};
