import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Wrench, 
  UtensilsCrossed, 
  Building2, 
  Radio, 
  Delete, 
  AlertTriangle,
  Fingerprint,
  Zap,
  PhoneCall,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  Settings2,
  Check,
  X,
  LogIn,
  ArrowRight
} from 'lucide-react';
import { CivicTask, ActiveRole } from '../../types';

interface LockScreenProps {
  activeTask?: CivicTask | null;
}

export const LockScreen: React.FC<LockScreenProps> = ({ activeTask }) => {
  const { 
    isLocked, 
    unlockApp, 
    quickUnlock, 
    profile, 
    activeRole, 
    setShowAuthModal,
    lockType,
    lockScreenPin,
    lockPassword,
    autoLockOnStart,
    updateLockSecurity,
    loginAsDemo,
    isAuthenticated
  } = useAuth();
  
  // Active unlock mode: 'pin' | 'password'
  const [activeMode, setActiveMode] = useState<'pin' | 'password'>(lockType || 'pin');
  const [pinInput, setPinInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingLockType, setSettingLockType] = useState<'pin' | 'password'>(lockType || 'pin');
  const [newPin, setNewPin] = useState<string>(lockScreenPin || '1234');
  const [newPassword, setNewPassword] = useState<string>(lockPassword || 'delhi2026');
  const [settingAutoLock, setSettingAutoLock] = useState<boolean>(autoLockOnStart);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState<boolean>(false);

  // Sync mode with lockType if lockType changes from context
  useEffect(() => {
    if (lockType) {
      setActiveMode(lockType);
      setSettingLockType(lockType);
    }
  }, [lockType]);

  // Live Delhi Clock (IST)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard listener for typing PIN or Enter for password
  useEffect(() => {
    if (!isLocked || showSettingsModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (activeMode === 'pin') {
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          handlePinDigit(e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          handleBackspace();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleClear();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, activeMode, pinInput, showSettingsModal]);

  if (!isLocked) return null;

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        verifyUnlock(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setUnlockMessage(null);
  };

  const handleClear = () => {
    setPinInput('');
    setUnlockMessage(null);
  };

  const verifyUnlock = (credential: string) => {
    const success = unlockApp(credential);
    if (!success) {
      setErrorShake(true);
      const hint = activeMode === 'pin' 
        ? `Incorrect PIN (Default: 1234)` 
        : `Incorrect Password (Default: delhi2026)`;
      setUnlockMessage(hint);
      setTimeout(() => {
        setErrorShake(false);
        if (activeMode === 'pin') setPinInput('');
      }, 700);
    } else {
      setPinInput('');
      setPasswordInput('');
      setUnlockMessage(null);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    verifyUnlock(passwordInput.trim());
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateLockSecurity({
      lockType: settingLockType,
      pin: newPin.trim() || '1234',
      password: newPassword.trim() || 'delhi2026',
      autoLockOnStart: settingAutoLock
    });
    setActiveMode(settingLockType);
    setSettingsSavedSuccess(true);
    setTimeout(() => {
      setSettingsSavedSuccess(false);
      setShowSettingsModal(false);
    }, 900);
  };

  const roleMeta = {
    worker: {
      name: 'MCD Civic Maintenance',
      badge: 'Hazard Unit',
      color: 'bg-[#FACC15] text-black',
      border: 'border-black',
      icon: Wrench,
    },
    courier: {
      name: 'Delhi Food Courier',
      badge: 'Rescue Runner',
      color: 'bg-[#4ADE80] text-black',
      border: 'border-black',
      icon: UtensilsCrossed,
    },
    donor: {
      name: 'Surplus Food Donor',
      badge: 'Commercial Partner',
      color: 'bg-emerald-300 text-black',
      border: 'border-black',
      icon: Building2,
    },
    dispatch: {
      name: 'MCD Central Operations CAD',
      badge: 'Command Dispatch',
      color: 'bg-rose-300 text-black',
      border: 'border-black',
      icon: Radio,
    },
  };

  const currentRoleInfo = roleMeta[activeRole] || roleMeta.worker;
  const RoleIcon = currentRoleInfo.icon;

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#EBF5EE] text-[#09090B] flex flex-col justify-between p-3 sm:p-5 select-none overflow-y-auto"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Top Neo-Brutalist Status Bar */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black text-[#4ADE80] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Shield className="w-4 h-4 fill-[#4ADE80]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-black text-xs font-black tracking-tight">SOLVR NCT</span>
              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-[#FACC15] text-black border-2 border-black rounded shadow-[1px_1px_0px_#000]">
                SECURE
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-wider">Delhi Civic Grid</p>
          </div>
        </div>

        {/* Lock Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSettingLockType(lockType || 'pin');
              setNewPin(lockScreenPin || '1234');
              setNewPassword(lockPassword || 'delhi2026');
              setSettingAutoLock(autoLockOnStart);
              setShowSettingsModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-zinc-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-black rounded-lg text-black transition-all text-[11px] font-black shadow-[2px_2px_0px_#000]"
            title="Configure Lock Screen Password, PIN & Options"
          >
            <Settings2 className="w-3.5 h-3.5 text-black" />
            <span>Options</span>
          </button>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FACC15] border-2 border-black rounded-lg text-black shadow-[2px_2px_0px_#000]">
            <Lock className="w-3 h-3 text-black" />
            <span className="text-[10px] font-mono font-black uppercase">
              Locked
            </span>
          </div>
        </div>
      </div>

      {/* Center Body: Clock, Operative Card & Unlock Methods */}
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col items-center text-center py-2">
        {/* Real-time IST Clock Box */}
        <div className="w-full bg-white border-2 border-black rounded-2xl p-3.5 mb-2.5 shadow-[4px_4px_0px_#000]">
          <div className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-black">
            {formattedTime}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#EBF5EE] border-2 border-black rounded-md text-[11px] font-mono font-black mt-1.5 text-black shadow-[1.5px_1.5px_0px_#000]">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>DELHI IST</span>
          </div>
        </div>

        {/* Operative Card / Active Mission Badge */}
        <div className="w-full bg-white border-2 border-black rounded-2xl p-3 mb-2.5 shadow-[4px_4px_0px_#000] text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black rounded-md shadow-[1px_1px_0px_#000] ${currentRoleInfo.color}`}>
              {currentRoleInfo.badge}
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-600">
              {profile?.callsign || 'MCD-OPERATIVE-STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              <RoleIcon className="w-4 h-4 text-[#FACC15]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-black text-black truncate">
                {profile?.displayName || (isAuthenticated ? 'Delhi Operative' : 'Civic Field Terminal (Guest)')}
              </h3>
              <p className="text-[10px] font-mono font-bold text-zinc-500 truncate">
                {profile?.district || 'Central Delhi • Connaught Place Sector'}
              </p>
            </div>
          </div>

          {/* Active Task or Standby status */}
          <div className="mt-2 pt-1.5 border-t-2 border-black/10 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-600 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-black fill-[#4ADE80]" />
              {activeTask ? 'Mission:' : 'Grid Status:'}
            </span>
            <span className="font-black text-black truncate max-w-[170px]">
              {activeTask ? activeTask.title : 'Ready for Dispatch'}
            </span>
          </div>
        </div>

        {/* Neo-Brutalist Unlock Mode Switcher: PIN vs Password */}
        <div className="w-full grid grid-cols-2 gap-2 mb-2.5">
          <button
            onClick={() => {
              setActiveMode('pin');
              setUnlockMessage(null);
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black font-mono transition-all border-2 border-black flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] ${
              activeMode === 'pin'
                ? 'bg-[#4ADE80] text-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-zinc-700 hover:bg-zinc-50 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>4-Digit PIN</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('password');
              setUnlockMessage(null);
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black font-mono transition-all border-2 border-black flex items-center justify-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] ${
              activeMode === 'password'
                ? 'bg-[#4ADE80] text-black shadow-[3px_3px_0px_#000]'
                : 'bg-white text-zinc-700 hover:bg-zinc-50 shadow-[2px_2px_0px_#000]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>

        {/* 1. PIN Mode UI: Neo-Brutalist Keypad */}
        {activeMode === 'pin' && (
          <div className="w-full flex flex-col items-center">
            {/* PIN Indicator Dots */}
            <div className="mb-2.5">
              <div className={`flex items-center justify-center gap-3 mb-1 transition-transform ${errorShake ? 'animate-bounce' : ''}`}>
                {[0, 1, 2, 3].map((index) => {
                  const filled = pinInput.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-150 border-2 border-black ${
                        filled
                          ? 'bg-black scale-110 shadow-[1.5px_1.5px_0px_#000]'
                          : 'bg-white shadow-[1px_1px_0px_#000]'
                      }`}
                    />
                  );
                })}
              </div>

              {unlockMessage ? (
                <div className="inline-block px-2 py-0.5 bg-[#FEE2E2] border-2 border-black rounded-md text-[11px] font-mono font-black text-rose-700 shadow-[2px_2px_0px_#000]">
                  {unlockMessage}
                </div>
              ) : (
                <p className="text-[11px] font-mono font-bold text-zinc-600">
                  Enter 4-Digit Quick PIN (Default: 1234)
                </p>
              )}
            </div>

            {/* 10-Key Tactile Pinpad with Hard Shadows */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handlePinDigit(digit)}
                  className="h-11 rounded-xl bg-white hover:bg-[#FACC15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-black font-mono text-lg font-black transition-all shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}

              {/* Clear */}
              <button
                onClick={handleClear}
                className="h-11 rounded-xl bg-[#FEE2E2] hover:bg-rose-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-rose-950 font-mono text-xs font-black transition-all shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center"
              >
                CLEAR
              </button>

              {/* Zero */}
              <button
                onClick={() => handlePinDigit('0')}
                className="h-11 rounded-xl bg-white hover:bg-[#FACC15] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-black font-mono text-lg font-black transition-all shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center"
              >
                0
              </button>

              {/* Backspace */}
              <button
                onClick={handleBackspace}
                className="h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-black font-mono text-xs font-black transition-all shadow-[2.5px_2.5px_0px_#000] flex items-center justify-center"
              >
                <Delete className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Password Mode UI: Neo-Brutalist Input */}
        {activeMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="w-full max-w-[280px] flex flex-col items-center">
            <div className="w-full relative mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setUnlockMessage(null);
                }}
                placeholder="Enter Lock Password..."
                autoFocus
                className={`w-full py-2.5 px-3 pr-9 rounded-xl bg-white border-2 border-black text-black font-mono font-bold text-sm placeholder:text-zinc-400 focus:outline-none shadow-[2.5px_2.5px_0px_#000] transition-all ${
                  errorShake ? 'bg-rose-50 border-rose-600 animate-bounce' : 'focus:bg-amber-50'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-zinc-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {unlockMessage ? (
              <div className="px-2 py-0.5 bg-[#FEE2E2] border-2 border-black rounded-md text-[11px] font-mono font-black text-rose-700 shadow-[2px_2px_0px_#000] mb-2">
                {unlockMessage}
              </div>
            ) : (
              <p className="text-[11px] font-mono font-bold text-zinc-600 mb-2">
                Type password & press Unlock (Default: delhi2026)
              </p>
            )}

            <button
              type="submit"
              disabled={!passwordInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#3ec472] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-black font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4 text-black" />
              <span>Unlock Terminal</span>
            </button>
          </form>
        )}

        {/* Tactile Quick Actions */}
        <div className="flex items-center gap-2 mt-2.5 w-full max-w-[280px]">
          <button
            onClick={quickUnlock}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white hover:bg-zinc-100 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none border-2 border-black text-black text-xs font-black shadow-[2.5px_2.5px_0px_#000] transition-all"
            title="Bypass code for field operatives wearing thick work gloves"
          >
            <Fingerprint className="w-3.5 h-3.5 text-black" />
            <span>Glove Bypass</span>
          </button>

          <button
            onClick={() => setShowAuthModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#FACC15] hover:bg-amber-300 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none border-2 border-black text-black text-xs font-black shadow-[2.5px_2.5px_0px_#000] transition-all"
            title="Open Sign In or Register Role modal"
          >
            <LogIn className="w-3.5 h-3.5 text-black" />
            <span>Sign In / Join</span>
          </button>
        </div>

        {/* Quick Demo Switcher on Lock Screen */}
        <div className="w-full max-w-[280px] mt-2.5 pt-2 border-t-2 border-black/15">
          <p className="text-[10px] font-mono font-black text-zinc-600 mb-1 text-center uppercase tracking-wider">
            One-Tap Operative Login & Unlock:
          </p>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => loginAsDemo('worker')}
              className="py-1 px-1 rounded-lg bg-white hover:bg-black hover:text-[#FACC15] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-black text-black text-[10px] font-mono font-black text-center truncate shadow-[1.5px_1.5px_0px_#000] transition-all"
              title="Demo MCD Maintenance Worker"
            >
              Worker
            </button>
            <button
              onClick={() => loginAsDemo('courier')}
              className="py-1 px-1 rounded-lg bg-white hover:bg-black hover:text-[#4ADE80] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-black text-black text-[10px] font-mono font-black text-center truncate shadow-[1.5px_1.5px_0px_#000] transition-all"
              title="Demo Food Rescue Courier"
            >
              Courier
            </button>
            <button
              onClick={() => loginAsDemo('donor')}
              className="py-1 px-1 rounded-lg bg-white hover:bg-black hover:text-emerald-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-black text-black text-[10px] font-mono font-black text-center truncate shadow-[1.5px_1.5px_0px_#000] transition-all"
              title="Demo Surplus Food Donor"
            >
              Donor
            </button>
            <button
              onClick={() => loginAsDemo('dispatch')}
              className="py-1 px-1 rounded-lg bg-white hover:bg-black hover:text-rose-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-black text-black text-[10px] font-mono font-black text-center truncate shadow-[1.5px_1.5px_0px_#000] transition-all"
              title="Demo Central CAD Dispatch"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Emergency Help & Switch Operator */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-between pt-2 border-t-2 border-black/15">
        <button
          onClick={() => setShowAuthModal(true)}
          className="text-xs font-black text-zinc-800 hover:text-black flex items-center gap-1.5 transition-colors py-1"
        >
          <UserCheck className="w-3.5 h-3.5 text-black" />
          <span>Switch / Register</span>
        </button>

        <a
          href="tel:155304"
          className="text-[11px] font-mono font-black text-rose-700 hover:text-rose-900 flex items-center gap-1 transition-colors py-1"
          title="Delhi Civic Emergency Helpline"
        >
          <PhoneCall className="w-3 h-3 text-rose-700" />
          <span>MCD SOS 155304</span>
        </a>
      </div>

      {/* Security Options Neo-Brutalist Modal Sheet */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-3">
          <div 
            className="w-full max-w-sm bg-[#EBF5EE] border-3 border-black rounded-2xl p-5 shadow-[6px_6px_0px_#000] relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                  <Settings2 className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-tight">Lock Screen Options</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-lg bg-white border-2 border-black text-black hover:bg-zinc-100 flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              {/* Unlock Method */}
              <div>
                <label className="text-[11px] font-mono font-black text-black uppercase block mb-1">
                  Default Unlock Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingLockType('pin')}
                    className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black font-mono flex items-center justify-center gap-1.5 transition-all ${
                      settingLockType === 'pin'
                        ? 'bg-[#4ADE80] text-black shadow-[3px_3px_0px_#000]'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-black" />
                    <span>Numeric PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingLockType('password')}
                    className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black font-mono flex items-center justify-center gap-1.5 transition-all ${
                      settingLockType === 'password'
                        ? 'bg-[#4ADE80] text-black shadow-[3px_3px_0px_#000]'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-black" />
                    <span>Password</span>
                  </button>
                </div>
              </div>

              {/* Configure 4-digit PIN */}
              <div>
                <label className="text-[11px] font-mono font-black text-black uppercase block mb-1">
                  Terminal Quick PIN (4 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full py-2 px-3 rounded-xl bg-white border-2 border-black text-black font-mono font-bold text-sm tracking-widest focus:outline-none shadow-[2px_2px_0px_#000]"
                />
                <span className="text-[10px] text-zinc-600 font-mono font-bold mt-0.5 block">
                  Current PIN: {lockScreenPin || '1234'}
                </span>
              </div>

              {/* Configure Custom Password */}
              <div>
                <label className="text-[11px] font-mono font-black text-black uppercase block mb-1">
                  Custom Lock Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. delhi2026 or secretpass"
                  className="w-full py-2 px-3 rounded-xl bg-white border-2 border-black text-black font-mono font-bold text-sm focus:outline-none shadow-[2px_2px_0px_#000]"
                />
                <span className="text-[10px] text-zinc-600 font-mono font-bold mt-0.5 block">
                  Current Password: {lockPassword || 'delhi2026'}
                </span>
              </div>

              {/* Auto Lock on App Start Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                <div>
                  <span className="text-xs font-black text-black block">Start App on Lock Screen</span>
                  <span className="text-[10px] text-zinc-600 font-mono font-bold">
                    Always prompt for PIN/Password on launch
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingAutoLock}
                  onChange={(e) => setSettingAutoLock(e.target.checked)}
                  className="w-5 h-5 accent-black rounded cursor-pointer"
                />
              </div>

              {/* Master Recovery Hint */}
              <div className="p-2 rounded-lg bg-[#FACC15] border-2 border-black text-[11px] text-black font-mono font-bold shadow-[2px_2px_0px_#000]">
                💡 Master unlock keys: <span className="underline">1234</span>, <span className="underline">delhi2026</span>, or <span className="underline">admin</span>.
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#3ec472] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black text-black font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                {settingsSavedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Apply Lock Options</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
