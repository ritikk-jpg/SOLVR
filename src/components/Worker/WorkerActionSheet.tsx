import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  ChevronUp, 
  ChevronDown, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Flame, 
  Wrench, 
  Apple, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Share2
} from 'lucide-react';
import { TaskShareModal } from '../Modals/TaskShareModal';

interface WorkerActionSheetProps {
  tasks: CivicTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onClaimTask: (taskId: string) => void;
  onOpenProofModal: (task: CivicTask) => void;
  worker: WorkerProfile;
  roleFilter: 'maintenance' | 'courier';
  onNotifyToast?: (msg: string) => void;
}

export const WorkerActionSheet: React.FC<WorkerActionSheetProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClaimTask,
  onOpenProofModal,
  worker,
  roleFilter,
  onNotifyToast,
}) => {
  // Sheet states: 'peek' (bottom summary pill) | 'expanded' (scrollable stacked cards)
  const [sheetState, setSheetState] = useState<'peek' | 'expanded'>('peek');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(selectedTaskId);
  const [sortBy, setSortBy] = useState<'distance' | 'bounty'>('distance');
  const [shareModalTask, setShareModalTask] = useState<CivicTask | null>(null);

  // Filter tasks matching the active role
  const relevantTasks = tasks.filter((t) => {
    if (roleFilter === 'courier') return t.type === 'food_rescue';
    return t.type !== 'food_rescue';
  });

  // Sort tasks
  const sortedTasks = [...relevantTasks].sort((a, b) => {
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    return b.baseBounty - a.baseBounty;
  });

  const activeTask = tasks.find((t) => t.id === worker.activeTaskId);
  const primaryTask = activeTask || sortedTasks.find((t) => t.id === selectedTaskId) || sortedTasks[0];

  const toggleSheet = () => {
    setSheetState((prev) => (prev === 'peek' ? 'expanded' : 'peek'));
  };

  const toggleCardExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardId((prev) => (prev === taskId ? null : taskId));
    onSelectTask(taskId);
  };

  return (
    <>
      <div 
        className={`fixed left-0 right-0 z-30 transition-all duration-300 ease-out flex justify-center pointer-events-none ${
          sheetState === 'peek' 
            ? 'bottom-20 sm:bottom-24' 
            : 'bottom-20 sm:bottom-24 top-16 sm:top-20'
        }`}
      >
        <div 
          className={`w-[94%] max-w-lg bg-white border-2 border-[#09090B] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.22)] flex flex-col pointer-events-auto overflow-hidden transition-all duration-300 ${
            sheetState === 'peek' ? 'max-h-[170px]' : 'h-full max-h-[82vh]'
          }`}
        >
          {/* Drag / Expand Handle - Thumb Friendly Touch Target */}
          <div 
            onClick={toggleSheet}
            className="w-full pt-2.5 pb-2 px-4 cursor-pointer hover:bg-zinc-50 flex flex-col items-center select-none shrink-0 border-b border-zinc-100"
          >
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 hover:bg-zinc-400 mb-1" />
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] ring-2 ring-emerald-300/50 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-600">
                  {activeTask ? 'Active Assignment In Progress' : `${sortedTasks.length} Available in Delhi NCT`}
                </span>
              </div>
              <button 
                className="text-zinc-500 hover:text-black flex items-center gap-0.5 text-xs font-bold min-h-[36px]"
                aria-label={sheetState === 'peek' ? 'Expand Sheet' : 'Collapse Sheet'}
              >
                <span>{sheetState === 'peek' ? 'View Tasks' : 'Minimize'}</span>
                {sheetState === 'peek' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Peek Mode: Single Compact Summary Pill with Social Sharing & Action Button */}
          {sheetState === 'peek' && primaryTask && (
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs mb-1">
                  {/* High contrast Hazard Yellow badge for bounty */}
                  <span className="bg-[#FACC15] text-[#09090B] font-mono font-black text-xs px-2 py-0.5 rounded-md border border-black/20 shrink-0">
                    ₹{primaryTask.baseBounty}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px] shrink-0">
                    {primaryTask.distanceKm} km
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-zinc-500 text-[11px] truncate">
                    {primaryTask.district.split('(')[0]}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#09090B] truncate">
                  {primaryTask.title}
                </h4>
              </div>

              {/* Action Buttons: Social Share + Contextual Claim/Proof Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Social Sharing Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShareModalTask(primaryTask);
                  }}
                  className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-[#09090B] font-bold rounded-2xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center min-h-[44px] min-w-[44px] transition-transform active:scale-95"
                  title="Share run with volunteers via WhatsApp / Telegram / Link"
                  aria-label="Share Run"
                >
                  <Share2 className="w-4 h-4 text-[#09090B]" />
                </button>

                {/* Primary Action Button */}
                {activeTask && activeTask.id === primaryTask.id ? (
                  <button
                    onClick={() => onOpenProofModal(primaryTask)}
                    className="px-3.5 sm:px-4 py-2.5 bg-[#4ADE80] hover:bg-[#22C55E] text-[#09090B] font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all min-h-[44px] active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#09090B]" />
                    <span>Submit Proof</span>
                  </button>
                ) : primaryTask.status === 'open' ? (
                  <button
                    onClick={() => onClaimTask(primaryTask.id)}
                    className="px-3.5 sm:px-4 py-2.5 bg-[#09090B] hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#FACC15] flex items-center gap-1.5 transition-all min-h-[44px] active:scale-95"
                  >
                    <span>Claim</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
                  </button>
                ) : (
                  <button
                    onClick={toggleSheet}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs rounded-2xl border border-zinc-300 min-h-[44px]"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Expanded Mode: Progressive Disclosure Stacked Cards */}
          {sheetState === 'expanded' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Quick Sort Bar */}
              <div className="px-4 py-2 bg-[#EBF5EE]/50 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
                <span className="font-extrabold text-zinc-700">
                  {roleFilter === 'courier' ? 'Surplus Food Pickups' : 'Civic Repair Orders'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px]">Sort:</span>
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`px-2 py-1 rounded-lg font-extrabold text-xs transition-colors min-h-[32px] ${
                      sortBy === 'distance' ? 'bg-[#09090B] text-white' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Nearest
                  </button>
                  <button
                    onClick={() => setSortBy('bounty')}
                    className={`px-2 py-1 rounded-lg font-extrabold text-xs transition-colors min-h-[32px] ${
                      sortBy === 'bounty' ? 'bg-[#09090B] text-white' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Highest ₹
                  </button>
                </div>
              </div>

              {/* Scrollable List of Stacked Summary Cards */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {sortedTasks.map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  const isExpanded = expandedCardId === task.id;
                  const isClaimedByMe = worker.activeTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => toggleCardExpansion(task.id, e)}
                      className={`rounded-2xl border-2 transition-all cursor-pointer p-3.5 ${
                        isClaimedByMe
                          ? 'bg-emerald-50/80 border-[#4ADE80] shadow-[2px_2px_0px_#22C55E]'
                          : isSelected
                          ? 'bg-amber-50/80 border-[#09090B] shadow-[2px_2px_0px_#09090B]'
                          : 'bg-white border-zinc-200 hover:border-black shadow-sm'
                      }`}
                    >
                      {/* Compact Card Header */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
                            {/* High contrast Hazard Yellow badge for bounty */}
                            <span className="bg-[#FACC15] text-[#09090B] font-mono font-black text-xs px-2 py-0.5 rounded-md border border-black/20">
                              ₹{task.baseBounty}
                            </span>

                            <span className="text-zinc-500 font-mono text-xs">
                              {task.distanceKm} km
                            </span>

                            {task.urgency === 'critical' && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#DC2626] text-white px-2 py-0.5 rounded-md shadow-xs">
                                Critical
                              </span>
                            )}

                            {isClaimedByMe && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-[#4ADE80] text-[#09090B] px-2 py-0.5 rounded-md border border-black/10">
                                In Progress
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm text-[#09090B] leading-snug">
                            {task.title}
                          </h4>

                          <p className="text-xs text-zinc-500 mt-0.5 truncate">
                            {task.address}
                          </p>
                        </div>

                        {/* Top-Right Card Controls: Quick Share + Accordion Arrow */}
                        <div className="shrink-0 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareModalTask(task);
                            }}
                            className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                            title="Share run with volunteers"
                            aria-label="Share Task"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <div className="p-1 text-zinc-400">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-black" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progressive Disclosure Section (Smoothly revealed on tap) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-zinc-200/80 space-y-3 animate-in fade-in duration-200">
                          <p className="text-xs text-zinc-700 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Domain-specific details */}
                          {task.type === 'food_rescue' && task.foodDetails && (
                            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between font-bold text-emerald-950">
                                <span>Donor: {task.foodDetails.donorName}</span>
                                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                                  {task.foodDetails.weightKg} kg
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-800">
                                Delivery to: <strong>{task.foodDetails.destinationName}</strong>
                              </div>
                              <div className="text-[10px] text-emerald-700 font-mono">
                                Window: {task.foodDetails.pickupWindowExpires}
                              </div>
                            </div>
                          )}

                          {task.maintenanceDetails && (
                            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs space-y-1">
                              <div className="font-extrabold text-amber-950">
                                PWD Standard Kit: {task.maintenanceDetails.equipmentRequired.join(', ')}
                              </div>
                              <div className="text-[11px] text-amber-800">
                                Reported By: {task.maintenanceDetails.reportedBy}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Row: Social Share + Claim/Complete */}
                          <div className="flex items-center gap-2 pt-1">
                            {/* Share button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareModalTask(task);
                              }}
                              className="py-2.5 px-3.5 bg-white hover:bg-zinc-50 text-[#09090B] font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1.5 min-h-[44px] transition-transform active:scale-95 shrink-0"
                              title="Share with volunteers"
                            >
                              <Share2 className="w-4 h-4 text-zinc-700" />
                              <span className="hidden xs:inline">Share</span>
                            </button>

                            {isClaimedByMe ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenProofModal(task);
                                }}
                                className="flex-1 py-2.5 px-4 bg-[#4ADE80] hover:bg-[#22C55E] text-[#09090B] font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-2 min-h-[44px] active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Submit Completion Proof</span>
                              </button>
                            ) : task.status === 'open' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClaimTask(task.id);
                                }}
                                className="flex-1 py-2.5 px-4 bg-[#09090B] hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#FACC15] flex items-center justify-center gap-2 min-h-[44px] active:scale-95"
                              >
                                <span>Claim This Run (+₹{task.baseBounty})</span>
                                <ArrowRight className="w-4 h-4 text-[#FACC15]" />
                              </button>
                            ) : (
                              <div className="text-xs text-zinc-500 font-medium py-1">
                                Task is currently {task.status}.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Sharing Modal Popup */}
      {shareModalTask && (
        <TaskShareModal
          task={shareModalTask}
          onClose={() => setShareModalTask(null)}
          onNotifyToast={onNotifyToast}
        />
      )}
    </>
  );
};
