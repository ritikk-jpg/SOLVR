import React from 'react';
import { WorkerProfile, PayoutTransaction } from '../../types';
import { 
  Trophy, 
  Flame, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Award, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  CreditCard,
  ArrowDownLeft,
  X
} from 'lucide-react';

interface PayoutModalProps {
  worker: WorkerProfile;
  transactions: PayoutTransaction[];
  onClose: () => void;
  onDisbursePayout: () => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  worker,
  transactions,
  onClose,
  onDisbursePayout,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-[6px_6px_0px_#09090B] space-y-5 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-[#09090B] flex items-center justify-center text-[#09090B] font-extrabold text-sm shadow-[2px_2px_0px_#09090B]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#09090B] leading-none">
                Gamified Payouts & Tier Engine (UPI Rails)
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Delhi NCT civic rewards, streak multipliers, and transparent scheduled cycles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-4 bg-[#FFFBEB] border-2 border-[#09090B] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[3px_3px_0px_#09090B]">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              Accrued Pending Earnings (Delhi Escrow)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-[#09090B]">
                ₹{worker.pendingPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-mono text-zinc-600">
                (₹{worker.lifetimeEarnings.toLocaleString('en-IN')} lifetime)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                Next Scheduled Payout: <strong>Friday, 18:00 IST</strong> to <code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">{worker.upiId}</code>
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={onDisbursePayout}
              disabled={worker.pendingPayout <= 0}
              className={`w-full sm:w-auto px-4 py-2.5 text-xs font-extrabold rounded-xl neo-btn flex items-center justify-center gap-2 ${
                worker.pendingPayout > 0
                  ? 'bg-[#09090B] text-white shadow-[2px_2px_0px_#FACC15]'
                  : 'bg-zinc-200 text-zinc-400 border-2 border-zinc-300 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#FACC15]" />
              <span>Simulate Instant UPI Transfer</span>
            </button>
          </div>
        </div>

        {/* Multi-Tiered Progression System */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#09090B] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              Delhi Workforce Tier Progression (Tier 2 of 3)
            </h4>
            <span className="text-xs font-mono font-bold text-zinc-700">
              {worker.tierProgress}% to Master Coordinator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Tier 1 */}
            <div className="p-3 bg-zinc-50 border-2 border-[#09090B] rounded-xl text-xs space-y-1 opacity-70">
              <div className="flex justify-between items-center font-bold">
                <span className="text-zinc-600">Tier 1: Civic Cadet</span>
                <span className="text-[10px] bg-zinc-200 px-1 rounded">Passed</span>
              </div>
              <p className="text-[11px] text-zinc-500">Base bounties + 1.1x multiplier</p>
            </div>

            {/* Tier 2 (Current) */}
            <div className="p-3 bg-[#FEF08A] border-2 border-[#09090B] rounded-xl text-xs space-y-1 shadow-[2px_2px_0px_#09090B]">
              <div className="flex justify-between items-center font-extrabold text-[#09090B]">
                <span>Tier 2: Street Guardian</span>
                <span className="text-[10px] bg-[#09090B] text-[#FACC15] px-1.5 py-0.2 rounded font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-800 font-medium">
                1.35x Multiplier · Priority PWD & Food Runs
              </p>
            </div>

            {/* Tier 3 (Locked) */}
            <div className="p-3 bg-white border-2 border-dashed border-zinc-400 rounded-xl text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-zinc-500">
                <span>Tier 3: Master Coordinator</span>
                <span className="text-[10px] text-zinc-400">Locked</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                1.50x Multiplier · MCD Self-Audit Privileges
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Badges Cabinet */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-sm text-[#09090B] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Delhi Civic & Rescue Milestone Badges
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {worker.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border-2 border-[#09090B] flex items-start gap-2.5 ${
                  badge.unlocked ? 'bg-[#FDF8EE]' : 'bg-zinc-100 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg border-2 border-[#09090B] flex items-center justify-center shrink-0 font-bold text-sm ${
                    badge.unlocked ? 'bg-[#FACC15]' : 'bg-zinc-300 text-zinc-500'
                  }`}
                >
                  {badge.icon === 'flame' && <Flame className="w-4 h-4 text-amber-700" />}
                  {badge.icon === 'utensils' && <Award className="w-4 h-4 text-emerald-800" />}
                  {badge.icon === 'shield' && <Shield className="w-4 h-4 text-blue-800" />}
                  {badge.icon === 'crown' && <Trophy className="w-4 h-4 text-zinc-600" />}
                  {badge.icon === 'sparkles' && <Sparkles className="w-4 h-4 text-zinc-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#09090B]">
                      {badge.title}
                    </span>
                    {badge.unlocked && (
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">
                        {badge.earnedDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="space-y-2.5 pt-2 border-t border-zinc-200">
          <h4 className="font-extrabold text-sm text-[#09090B] flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4" />
            Itemized UPI Payout Audit Trail
          </h4>

          <div className="divide-y divide-zinc-200 border-2 border-[#09090B] rounded-xl overflow-hidden bg-white">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50"
              >
                <div>
                  <span className="font-bold text-[#09090B] block">{tx.taskTitle}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                    <span>{tx.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{tx.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-zinc-700 font-bold">{tx.paymentMode || 'UPI'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-sm text-[#09090B] block">
                    +₹{Math.round(tx.amount).toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      tx.status === 'pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {tx.status === 'pending' ? 'Pending Friday UPI Cycle' : 'Cleared to UPI'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#09090B] text-white text-xs font-bold rounded-xl neo-btn"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
