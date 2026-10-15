import React from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  Wrench, 
  Apple, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Flame, 
  Thermometer, 
  Package, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

interface TaskCardProps {
  task: CivicTask;
  isSelected: boolean;
  onSelect: () => void;
  onClaim: (taskId: string) => void;
  onOpenProofModal: (task: CivicTask) => void;
  worker: WorkerProfile;
  activeRole: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isSelected,
  onSelect,
  onClaim,
  onOpenProofModal,
  worker,
  activeRole,
}) => {
  const isFood = task.type === 'food_rescue';
  const isClaimedByMe = task.status === 'claimed' && worker.activeTaskId === task.id;
  const streakBonus = Math.round(task.baseBounty * (worker.streakMultiplier - 1));
  const totalBounty = Math.round(task.baseBounty + streakBonus);

  return (
    <div
      onClick={onSelect}
      className={`relative w-full rounded-2xl bg-white border-2 border-[#09090B] p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'shadow-[5px_5px_0px_#09090B] ring-2 ring-[#FACC15]'
          : 'shadow-[3px_3px_0px_#09090B] hover:shadow-[4px_4px_0px_#09090B] hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header: Unboxed Metadata & Category Tag */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 font-medium">
          <span className="font-bold text-[#09090B]">{task.district}</span>
          <span aria-hidden="true">·</span>
          <span>{task.distanceKm} km away</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            ~{task.estimatedMinutes}m
          </span>
          {task.urgency === 'critical' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#DC2626] font-extrabold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                CRITICAL
              </span>
            </>
          )}
        </div>

        {/* Type Identifier Badge */}
        <div
          className={`px-2 py-0.5 rounded-lg border-2 border-[#09090B] text-[11px] font-extrabold flex items-center gap-1 ${
            isFood ? 'bg-[#4ADE80] text-[#09090B]' : 'bg-[#FACC15] text-[#09090B]'
          }`}
        >
          {isFood ? (
            <>
              <Apple className="w-3 h-3" />
              Food Rescue
            </>
          ) : (
            <>
              <Wrench className="w-3 h-3" />
              Civic Repair
            </>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h3 className="font-extrabold text-base text-[#09090B] leading-snug mb-1.5">
        {task.title}
      </h3>

      {/* Task Description */}
      <p className="text-xs text-zinc-600 line-clamp-2 mb-3 leading-relaxed">
        {task.description}
      </p>

      {/* Domain-Specific Logistics Data */}
      {isFood && task.foodDetails && (
        <div className="mb-3.5 p-2.5 bg-[#FDF8EE] border border-[#09090B] rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-700">
            <span className="font-semibold text-[#09090B] flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-zinc-600" />
              Donor: {task.foodDetails.donorName}
            </span>
            <span className="font-mono font-bold text-zinc-900 bg-white px-1.5 py-0.5 border border-[#09090B] rounded">
              {task.foodDetails.weightKg} kg
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-600">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-blue-600" />
              Temp: {task.foodDetails.temperature}
            </span>
            <span className="text-[#DC2626] font-bold">
              Pickup window: {task.foodDetails.pickupWindowExpires}
            </span>
          </div>
          <div className="text-[11px] text-zinc-700 truncate pt-0.5 border-t border-zinc-200">
            Dest: <span className="font-medium text-[#09090B]">{task.foodDetails.destinationName}</span>
          </div>
        </div>
      )}

      {!isFood && task.maintenanceDetails && (
        <div className="mb-3.5 p-2.5 bg-[#FFFBEB] border border-[#09090B] rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#09090B] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#09090B]" />
              Type: {task.maintenanceDetails.infrastructureType}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-[#09090B] rounded font-bold">
              Hazard Lvl {task.maintenanceDetails.hazardRating}/3
            </span>
          </div>
          <div className="text-[11px] text-zinc-600 truncate">
            Kit Required: {task.maintenanceDetails.equipmentRequired.join(', ')}
          </div>
        </div>
      )}

      {/* Task Bounty & Actions Row */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 gap-2">
        {/* Payout Display in INR */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-extrabold text-lg text-[#09090B] tracking-tight">
              ₹{totalBounty.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              (₹{task.baseBounty.toLocaleString('en-IN')} base)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700">
            <Flame className="w-3 h-3 text-[#16A34A]" />
            <span>+{worker.streakMultiplier}x Streak Boost (+₹{streakBonus.toLocaleString('en-IN')})</span>
          </div>
        </div>

        {/* Action Button state */}
        <div className="flex items-center gap-2">
          {task.status === 'open' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim(task.id);
              }}
              className="px-3.5 py-1.5 bg-[#09090B] text-white text-xs font-bold rounded-xl neo-btn flex items-center gap-1.5"
            >
              <span>Claim Run</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
            </button>
          )}

          {isClaimedByMe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenProofModal(task);
              }}
              className="px-3.5 py-1.5 bg-[#4ADE80] text-[#09090B] text-xs font-bold rounded-xl neo-btn flex items-center gap-1.5 border-2 border-[#09090B]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Proof</span>
            </button>
          )}

          {task.status === 'in_review' && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              MCD Review
            </span>
          )}

          {task.status === 'completed' && (
            <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              UPI Disbursed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
