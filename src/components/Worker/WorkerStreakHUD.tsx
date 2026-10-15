import React from 'react';
import { WorkerProfile } from '../../types';
import { Flame, Trophy, Award, TrendingUp, Calendar, Zap, HeartHandshake } from 'lucide-react';

interface WorkerStreakHUDProps {
  worker: WorkerProfile;
  onOpenPayoutModal: () => void;
}

export const WorkerStreakHUD: React.FC<WorkerStreakHUDProps> = ({ worker, onOpenPayoutModal }) => {
  return (
    <div className="w-full bg-white border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Tier & Profile */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15] border-2 border-[#09090B] shadow-[2px_2px_0px_#09090B] flex items-center justify-center text-[#09090B] shrink-0 font-extrabold text-sm">
            T-2
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-[#09090B]">{worker.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 border border-[#09090B] rounded font-bold">
                {worker.callsign}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-700 block">
              {worker.tier}
            </span>
            <div className="w-28 bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-1 border border-zinc-300">
              <div
                className="bg-[#09090B] h-full rounded-full"
                style={{ width: `${worker.tierProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {worker.tierProgress}% to Master Coordinator
            </span>
          </div>
        </div>

        {/* Streak Flame & Multiplier */}
        <div className="p-2.5 bg-[#FFFBEB] border-2 border-[#09090B] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
              Dilli Streak Engine
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-extrabold text-xl text-[#09090B]">
                {worker.currentStreakDays} Days
              </span>
              <span className="text-xs font-bold text-emerald-600">
                +{worker.streakMultiplier}x Boost
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FACC15] border border-[#09090B] flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-700 fill-amber-500" />
          </div>
        </div>

        {/* Impact Counters (in KG) */}
        <div className="p-2.5 bg-[#F0FDF4] border-2 border-[#09090B] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
              Verified Food Rescued
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-extrabold text-xl text-[#09090B]">
                {worker.foodRescuedKg} kg
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                (~{Math.round(worker.foodRescuedKg * 2.2)} meals)
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#4ADE80] border border-[#09090B] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-emerald-950" />
          </div>
        </div>

        {/* Next Scheduled Payout (UPI Rails) */}
        <div className="p-2.5 bg-[#F8FAFC] border-2 border-[#09090B] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-zinc-600 tracking-wider block">
              Scheduled Cycle
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-extrabold text-sm text-[#09090B]">
                Fri 18:00 IST
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                Direct UPI
              </span>
            </div>
            <button
              onClick={onOpenPayoutModal}
              className="text-[11px] font-bold text-zinc-900 underline hover:text-black mt-0.5 block text-left"
            >
              ₹{worker.pendingPayout.toLocaleString('en-IN')} Staged →
            </button>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-[#09090B] flex items-center justify-center text-xs font-mono font-extrabold text-zinc-700">
            UPI
          </div>
        </div>
      </div>
    </div>
  );
};
