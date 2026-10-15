import React, { useState } from 'react';
import { ActiveRole, WorkerProfile } from '../types';
import { 
  Shield, 
  Wallet, 
  Building2, 
  UtensilsCrossed, 
  Terminal, 
  Wrench, 
  ChevronDown, 
  Check, 
  X, 
  Lock, 
  UserCheck, 
  Radio,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeRole: ActiveRole;
  onSelectRole: (role: ActiveRole) => void;
  worker: WorkerProfile;
  onOpenPayoutModal: () => void;
  onOpenApiExplorer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onSelectRole,
  worker,
  onOpenPayoutModal,
  onOpenApiExplorer,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const { lockApp, setShowAuthModal, profile, isAuthenticated } = useAuth();

  const roleMeta = {
    worker: {
      name: 'Civic Maintenance',
      shortName: 'Worker',
      badge: 'MCD Field',
      icon: Wrench,
      accentColor: 'text-[#FACC15]',
      desc: 'Repair Delhi potholes, streetlights, and drainage waypoints'
    },
    courier: {
      name: 'Food Courier',
      shortName: 'Courier',
      badge: 'Food Rescue',
      icon: UtensilsCrossed,
      accentColor: 'text-[#22C55E]',
      desc: 'Route commercial surplus food to Delhi night shelters'
    },
    donor: {
      name: 'Surplus Donor',
      shortName: 'Donor',
      badge: 'FSSAI Certified',
      icon: Building2,
      accentColor: 'text-emerald-500',
      desc: 'Schedule instant food rescue pickups for Delhi restaurants'
    },
    dispatch: {
      name: 'MCD Operations CAD',
      shortName: 'MCD CAD',
      badge: 'Central CAD',
      icon: Radio,
      accentColor: 'text-zinc-600',
      desc: 'Review live worker telemetry, proofs, and route allocations'
    }
  };

  const currentRole = roleMeta[activeRole];
  const CurrentIcon = currentRole.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#EBF5EE]/95 backdrop-blur-md border-b-2 border-[#09090B] px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Wordmark & Location */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#09090B] border-2 border-black flex items-center justify-center text-[#FACC15] shadow-[2px_2px_0px_#FACC15]">
              <Shield className="w-4 h-4 fill-[#FACC15]" />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#09090B]">
                SOLVR
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 bg-black text-[#4ADE80] rounded">
                DELHI
              </span>
            </div>
          </div>

          {/* Mobile: Compact Role Selector Trigger & Quick Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Lock Button */}
            <button
              onClick={lockApp}
              className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-[#FACC15] shadow-[1.5px_1.5px_0px_#09090B] active:scale-95"
              aria-label="Lock Operative Terminal"
              title="Lock Terminal Screen"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Role Trigger */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-1.5 bg-white border-2 border-black rounded-full py-1.5 px-3 text-xs font-bold transition-all active:scale-95 shadow-[2px_2px_0px_#09090B]"
              aria-label="Switch User Role"
            >
              <CurrentIcon className={`w-3.5 h-3.5 ${currentRole.accentColor}`} />
              <span className="text-[#09090B] text-xs font-black truncate max-w-[80px]">
                {profile?.callsign?.split('-')[0] || currentRole.shortName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </button>

            {/* Quick Wallet Pill on Mobile */}
            <button
              onClick={onOpenPayoutModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#4ADE80] border-2 border-black rounded-full text-xs font-black shadow-[1.5px_1.5px_0px_#09090B] active:scale-95"
            >
              <Wallet className="w-3 h-3 text-black" />
              <span className="font-mono text-zinc-900 text-xs">
                ₹{worker.pendingPayout.toLocaleString('en-IN')}
              </span>
            </button>
          </div>

          {/* Desktop: Full Segmented Role Shell Switcher */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#09090B]">
            {(['worker', 'courier', 'donor', 'dispatch'] as const).map((role) => {
              const meta = roleMeta[role];
              const RoleIcon = meta.icon;
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => onSelectRole(role)}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#09090B] text-white shadow-xs'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <RoleIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FACC15]' : meta.accentColor}`} />
                  <span>{meta.name}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Right Utilities (Lock, Auth, API, Wallet) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Terminal Lock Button */}
            <button
              onClick={lockApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#FACC15] transition-all cursor-pointer"
              title="Lock Screen Page"
            >
              <Lock className="w-3.5 h-3.5 text-[#FACC15]" />
              <span className="font-mono text-[11px] text-[#FACC15]">LOCK</span>
            </button>

            {/* Auth Sign Up / Log In trigger */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 text-[#09090B] rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#09090B] transition-all"
              title="Sign Up or Log In with Role"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span className="truncate max-w-[100px]">
                {profile ? profile.displayName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            <button
              onClick={onOpenApiExplorer}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[#09090B] rounded-lg text-xs font-bold transition-colors"
              title="Inspect REST Endpoints"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">API</span>
            </button>

            <button
              onClick={onOpenPayoutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4ADE80] border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#09090B] hover:translate-y-0.5 transition-all"
            >
              <Wallet className="w-3.5 h-3.5 text-black" />
              <span className="font-mono text-zinc-900">
                ₹{worker.pendingPayout.toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Compact Mobile Role & Terminal Modal */}
      {showRoleModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowRoleModal(false)}
        >
          <div 
            className="w-full sm:max-w-md bg-white border-t-4 sm:border-4 border-[#09090B] rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_-8px_32px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-4 duration-200 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-200 mb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
                  Contextual Minimalist Shell
                </span>
                <h3 className="text-base font-black text-[#09090B]">
                  Select Active Delhi Role
                </h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold"
                aria-label="Close Role Switcher"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Lock & Auth buttons inside mobile drawer */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  lockApp();
                }}
                className="py-2.5 px-3 rounded-2xl bg-zinc-900 border-2 border-black text-[#FACC15] text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#09090B] active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Lock Screen</span>
              </button>

              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setShowAuthModal(true);
                }}
                className="py-2.5 px-3 rounded-2xl bg-[#4ADE80] border-2 border-black text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#09090B] active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up / Log In</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(['worker', 'courier', 'donor', 'dispatch'] as const).map((role) => {
                const meta = roleMeta[role];
                const RoleIcon = meta.icon;
                const isCurrent = activeRole === role;

                return (
                  <button
                    key={role}
                    onClick={() => {
                      onSelectRole(role);
                      setShowRoleModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border-2 text-left flex items-start gap-3 transition-all min-h-[58px] ${
                      isCurrent
                        ? 'border-black bg-[#EBF5EE] shadow-[3px_3px_0px_#09090B]'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/10 ${
                      isCurrent ? 'bg-black text-[#FACC15]' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-sm text-[#09090B]">
                          {meta.name}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-[#09090B] text-[#4ADE80] text-[10px] font-mono font-bold rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">
                        {meta.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile API Explorer Access */}
            <div className="mt-4 pt-3 border-t border-zinc-200">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  onOpenApiExplorer();
                }}
                className="w-full py-2.5 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-700" />
                <span>Open Developer API Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
