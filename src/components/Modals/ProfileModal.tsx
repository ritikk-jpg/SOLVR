import React, { useState } from 'react';
import { WorkerProfile } from '../../types';
import { 
  Flame, 
  X, 
  Shield, 
  Lock, 
  KeyRound, 
  UserPlus, 
  LogOut, 
  Check, 
  Wallet,
  Building2,
  UtensilsCrossed,
  Wrench,
  Radio,
  Settings2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  worker: WorkerProfile;
  onClose: () => void;
  onOpenPayout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  worker,
  onClose,
  onOpenPayout,
}) => {
  const { 
    profile, 
    activeRole, 
    lockScreenPin, 
    lockPassword,
    lockType,
    autoLockOnStart,
    updateLockSecurity,
    lockApp, 
    setShowAuthModal, 
    logout 
  } = useAuth();
  
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [selectedLockType, setSelectedLockType] = useState<'pin' | 'password'>(lockType || 'pin');
  const [customPin, setCustomPin] = useState(lockScreenPin || '1234');
  const [customPassword, setCustomPassword] = useState(lockPassword || 'delhi2026');
  const [startOnLock, setStartOnLock] = useState(autoLockOnStart);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateLockSecurity({
      lockType: selectedLockType,
      pin: customPin.trim() || '1234',
      password: customPassword.trim() || 'delhi2026',
      autoLockOnStart: startOnLock
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setEditingSecurity(false);
    }, 1000);
  };

  const roleLabels = {
    worker: { title: 'Civic Maintenance Worker', icon: Wrench, badge: 'MCD Crew' },
    courier: { title: 'Food Rescue Courier', icon: UtensilsCrossed, badge: 'Rescue Courier' },
    donor: { title: 'Surplus Food Donor', icon: Building2, badge: 'Commercial Donor' },
    dispatch: { title: 'Municipal Admin CAD', icon: Radio, badge: 'MCD Command' }
  };

  const currentRoleMeta = roleLabels[activeRole] || roleLabels.worker;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white border-3 border-[#09090B] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-[6px_6px_0px_#09090B] space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" />
            <h3 className="font-black text-base text-[#09090B]">
              Field Profile & Terminal Security
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-black font-bold active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Worker Identity & Role Card */}
        <div className="p-4 bg-[#FDF8EE] border-2 border-black rounded-2xl shadow-[2px_2px_0px_#09090B]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-black text-[#4ADE80]">
                  {currentRoleMeta.badge}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {profile?.callsign || worker.callsign}
                </span>
              </div>
              <h4 className="font-black text-lg text-[#09090B]">
                {profile?.displayName || worker.name}
              </h4>
              <p className="text-xs text-zinc-600 font-medium">
                {profile?.email || 'delhi.operative@delhi.gov.in'}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {profile?.district || 'Central Delhi (Connaught Place)'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-amber-700 font-black text-base justify-end">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-600 animate-pulse" />
                <span>{worker.currentStreakDays}D Streak</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-700 bg-amber-100 px-1.5 py-0.5 rounded">
                {worker.streakMultiplier}x Bounty Boost
              </span>
            </div>
          </div>

          {profile?.roleSpecificData && (
            <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-[11px] font-mono text-zinc-700">
              <span className="font-bold">Role Details: </span>
              {profile.roleSpecificData}
            </div>
          )}
        </div>

        {/* Lock Screen Security Settings */}
        <div className="bg-[#EBF5EE] border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_#09090B]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-zinc-800" />
              <span className="text-xs font-black uppercase text-[#09090B]">
                Terminal Lock Security
              </span>
            </div>
            <button
              onClick={() => setEditingSecurity(!editingSecurity)}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{editingSecurity ? 'Cancel' : 'Change Password/PIN'}</span>
            </button>
          </div>

          {editingSecurity ? (
            <form onSubmit={handleSaveSecurity} className="space-y-3 mt-2 pt-2 border-t border-emerald-200">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLockType('pin')}
                  className={`py-1.5 px-2 rounded-xl border-2 border-black text-xs font-black font-mono text-center transition-all ${
                    selectedLockType === 'pin'
                      ? 'bg-[#4ADE80] text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50 shadow-[1.5px_1.5px_0px_#000]'
                  }`}
                >
                  Numeric PIN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLockType('password')}
                  className={`py-1.5 px-2 rounded-xl border-2 border-black text-xs font-black font-mono text-center transition-all ${
                    selectedLockType === 'password'
                      ? 'bg-[#4ADE80] text-black shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-zinc-700 hover:bg-zinc-50 shadow-[1.5px_1.5px_0px_#000]'
                  }`}
                >
                  Password
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono font-black text-black uppercase block mb-1">
                  Terminal PIN (4-digit)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={customPin}
                  onChange={(e) => setCustomPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full font-mono text-xs px-3 py-1.5 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-black text-black uppercase block mb-1">
                  Custom Password
                </label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="delhi2026"
                  className="w-full font-mono text-xs px-3 py-1.5 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#000]"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 p-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
                <span className="font-mono text-xs font-black">Start app on Lock Screen</span>
                <input
                  type="checkbox"
                  checked={startOnLock}
                  onChange={(e) => setStartOnLock(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#4ADE80] hover:bg-[#3ec472] text-black text-xs font-black font-mono uppercase tracking-wider rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Security Updated!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Save Lock Options</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs font-bold text-zinc-700">
                Mode: <span className="uppercase text-black">{lockType || 'pin'}</span> •{' '}
                <span className="tracking-widest">
                  {lockType === 'password' ? '•••• (Password active)' : `•••• (${lockScreenPin || '1234'})`}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  lockApp();
                }}
                className="px-2.5 py-1 bg-zinc-900 text-[#FACC15] hover:bg-black rounded-lg text-xs font-black flex items-center gap-1 active:scale-95 transition-all"
              >
                <Lock className="w-3 h-3" />
                <span>Lock Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Impact Numbers */}
        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div className="p-2.5 bg-zinc-50 border-2 border-black rounded-xl">
            <span className="text-lg font-black text-[#09090B] block">{worker.totalTasksCompleted}</span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-bold">Completed Runs</span>
          </div>
          <div className="p-2.5 bg-emerald-50 border-2 border-black rounded-xl">
            <span className="text-lg font-black text-emerald-800 block">{worker.foodRescuedKg} kg</span>
            <span className="text-[10px] text-emerald-700 uppercase tracking-wide font-bold">Food Rescued</span>
          </div>
        </div>

        {/* Wallet & Auth Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenPayout();
            }}
            className="w-full py-2.5 bg-[#4ADE80] hover:bg-emerald-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Wallet className="w-4 h-4 text-black" />
            <span>Open UPI Wallet (₹{worker.pendingPayout.toLocaleString('en-IN')})</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                setShowAuthModal(true);
              }}
              className="py-2.5 px-2 bg-white hover:bg-zinc-100 text-[#09090B] font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-black" />
              <span>Register / Switch</span>
            </button>

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="py-2.5 px-2 bg-zinc-100 hover:bg-rose-100 hover:text-rose-700 text-zinc-700 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
