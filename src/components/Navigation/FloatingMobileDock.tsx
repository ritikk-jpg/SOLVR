import React from 'react';
import { ActiveRole, WorkerProfile } from '../../types';
import { Users, Building2, UtensilsCrossed, Wallet, Terminal } from 'lucide-react';

interface FloatingMobileDockProps {
  activeRole: ActiveRole;
  onSelectRole: (role: ActiveRole) => void;
  worker: WorkerProfile;
  onOpenPayoutModal: () => void;
  onOpenApiExplorer: () => void;
}

export const FloatingMobileDock: React.FC<FloatingMobileDockProps> = ({
  activeRole,
  onSelectRole,
  worker,
  onOpenPayoutModal,
  onOpenApiExplorer,
}) => {
  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#09090B] border-2 border-[#09090B] rounded-2xl p-1.5 shadow-[4px_4px_0px_#FACC15] flex items-center justify-between text-white">
      <button
        onClick={() => onSelectRole('worker')}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeRole === 'worker' ? 'bg-[#FACC15] text-[#09090B] font-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Users className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Worker</span>
      </button>

      <button
        onClick={() => onSelectRole('dispatch')}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeRole === 'dispatch' ? 'bg-[#FACC15] text-[#09090B] font-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <Building2 className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">MCD</span>
      </button>

      <button
        onClick={() => onSelectRole('donor')}
        className={`flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeRole === 'donor' ? 'bg-[#4ADE80] text-[#09090B] font-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <UtensilsCrossed className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">Donors</span>
      </button>

      <button
        onClick={onOpenPayoutModal}
        className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-zinc-300 hover:text-white"
      >
        <Wallet className="w-4 h-4 mb-0.5 text-[#FACC15]" />
        <span className="text-[10px] font-mono leading-tight font-bold">
          ₹{worker.pendingPayout.toLocaleString('en-IN')}
        </span>
      </button>

      <button
        onClick={onOpenApiExplorer}
        className="flex-1 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-zinc-300 hover:text-[#FACC15]"
      >
        <Terminal className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">API</span>
      </button>
    </div>
  );
};
