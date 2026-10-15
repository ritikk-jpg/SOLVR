import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Shield, 
  Wrench, 
  UtensilsCrossed, 
  Building2, 
  Radio, 
  Lock, 
  Mail, 
  User, 
  Check, 
  ArrowRight, 
  Sparkles, 
  CreditCard,
  KeyRound,
  AlertCircle,
  Truck,
  Bike
} from 'lucide-react';
import { ActiveRole } from '../../types';

interface AuthModalProps {
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    registerUser, 
    loginUser, 
    loginWithGoogle, 
    loginAsDemo,
    isLoading,
    error,
    clearError,
    profile
  } = useAuth();

  const [mode, setMode] = useState<'register' | 'login' | 'demo'>('register');
  const [selectedRole, setSelectedRole] = useState<ActiveRole>('worker');

  // Register Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('1234');
  const [district, setDistrict] = useState('Central Delhi (Connaught Place)');
  const [callsign, setCallsign] = useState('');
  const [upiId, setUpiId] = useState('');
  const [roleData, setRoleData] = useState('');

  // Login Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  if (!showAuthModal) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !email || !password) return;

    await registerUser({
      displayName,
      email,
      password,
      role: selectedRole,
      callsign: callsign || `${selectedRole.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      district,
      pin: pin.length === 4 ? pin : '1234',
      lockPassword: password,
      lockType: 'pin',
      upiId: upiId || `${displayName.toLowerCase().replace(/\s+/g, '')}@upi`,
      roleSpecificData: roleData
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    await loginUser(loginEmail, loginPassword);
  };

  const handleClose = () => {
    clearError();
    setShowAuthModal(false);
    if (onClose) onClose();
  };

  const roles = [
    {
      id: 'worker' as const,
      name: 'Civic Maintenance Worker',
      badge: 'MCD Field Crew',
      icon: Wrench,
      tagline: 'Pothole repairs, storm drains, streetlights & civic hazards',
      accent: 'border-[#FACC15] bg-[#FACC15]/10 text-amber-900',
      badgeBg: 'bg-[#FACC15] text-black',
      fieldPrompt: 'Preferred Equipment / Specialization',
      fieldPlaceholder: 'e.g. Cold Asphalt Tampers, Drain Snake, High-vis Kit'
    },
    {
      id: 'courier' as const,
      name: 'Food Rescue Courier',
      badge: 'Delhi Hunger Project',
      icon: UtensilsCrossed,
      tagline: 'Rescue surplus restaurant food & deliver to Delhi shelters',
      accent: 'border-[#4ADE80] bg-[#4ADE80]/10 text-emerald-950',
      badgeBg: 'bg-[#4ADE80] text-black',
      fieldPrompt: 'Transport Vehicle / Courier Kit',
      fieldPlaceholder: 'e.g. Ather EV Scooter with 35kg Insulated Carrier'
    },
    {
      id: 'donor' as const,
      name: 'Surplus Food Donor',
      badge: 'FSSAI Commercial',
      icon: Building2,
      tagline: 'Restaurants, banquet halls & kitchens dispatching fresh meals',
      accent: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      badgeBg: 'bg-emerald-400 text-black',
      fieldPrompt: 'Commercial Outlet / FSSAI License',
      fieldPlaceholder: 'e.g. Haldiram CP Outlet #42 / FSSAI-2024-DEL'
    },
    {
      id: 'dispatch' as const,
      name: 'Municipal Admin (CAD)',
      badge: 'Central Command',
      icon: Radio,
      tagline: 'MCD civil defense oversight, live routes & proof approvals',
      accent: 'border-zinc-800 bg-zinc-100 text-zinc-900',
      badgeBg: 'bg-zinc-900 text-white',
      fieldPrompt: 'MCD Division / Desk Number',
      fieldPlaceholder: 'e.g. MCD Ward 48 Central Operations Desk'
    }
  ];

  const currentRoleMeta = roles.find(r => r.id === selectedRole)!;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#EBF5EE] border-3 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#09090B] relative max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border-2 border-black flex items-center justify-center text-black hover:bg-zinc-100 active:scale-95 shadow-[2px_2px_0px_#09090B] transition-all"
          aria-label="Close Authentication Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 pr-10">
          <div className="w-10 h-10 rounded-2xl bg-[#09090B] border-2 border-black flex items-center justify-center text-[#FACC15] shadow-[2px_2px_0px_#09090B] shrink-0">
            <Shield className="w-5 h-5 fill-[#FACC15]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#09090B] tracking-tight">
                SOLVR ID
              </h2>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-black text-[#4ADE80] rounded">
                FIREBASE AUTH
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Delhi Civic Logistics, Maintenance & Food Rescue
            </p>
          </div>
        </div>

        {/* Top Segmented Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_#09090B] mb-4 shrink-0">
          <button
            onClick={() => { setMode('register'); clearError(); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
              mode === 'register' 
                ? 'bg-[#09090B] text-white shadow-xs' 
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Register Role
          </button>
          <button
            onClick={() => { setMode('login'); clearError(); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
              mode === 'login' 
                ? 'bg-[#09090B] text-white shadow-xs' 
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Operative Login
          </button>
          <button
            onClick={() => { setMode('demo'); clearError(); }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all ${
              mode === 'demo' 
                ? 'bg-[#4ADE80] text-[#09090B] shadow-xs' 
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            ⚡ Quick Demo
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-900 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 flex-1">
          {/* MODE 1: REGISTER WITH ROLE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#09090B] mb-1.5">
                  1. Select Your Delhi Active Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        className={`text-left p-2.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-black bg-white shadow-[3px_3px_0px_#09090B] ring-2 ring-black'
                            : 'border-zinc-300 bg-white/70 hover:bg-white hover:border-black'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-7 h-7 rounded-xl bg-zinc-100 border border-black flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-black" />
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${r.badgeBg}`}>
                            {r.badge}
                          </span>
                        </div>
                        <div className="text-xs font-black text-[#09090B]">{r.name}</div>
                        <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{r.tagline}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role-Specific Field */}
              <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_#09090B]">
                <label className="block text-xs font-black text-[#09090B] mb-1">
                  {currentRoleMeta.fieldPrompt}
                </label>
                <input
                  type="text"
                  value={roleData}
                  onChange={(e) => setRoleData(e.target.value)}
                  placeholder={currentRoleMeta.fieldPlaceholder}
                  className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                />
              </div>

              {/* Account Credentials */}
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_#09090B] space-y-2.5">
                <div className="text-xs font-black uppercase text-[#09090B] mb-1 font-mono">
                  2. Operative Profile & Terminal Security
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5">
                      Full Name / Commercial Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5">
                      Delhi District / Ward
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2.5 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    >
                      <option value="Central Delhi (Connaught Place)">Central Delhi (CP & Paharganj)</option>
                      <option value="South Delhi (Hauz Khas)">South Delhi (Hauz Khas / Malviya)</option>
                      <option value="East Delhi (Laxmi Nagar)">East Delhi (Laxmi Nagar / Anand Vihar)</option>
                      <option value="North Delhi (Civil Lines)">North Delhi (Civil Lines / Kashmere Gate)</option>
                      <option value="West Delhi (Rajouri Garden)">West Delhi (Rajouri Garden / Janakpuri)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@delhi.gov.in"
                      className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5">
                      Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t-2 border-black/10">
                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5 font-mono">
                      Lock Screen 4-Digit PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234"
                      className="w-full text-xs font-mono font-black tracking-widest px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-zinc-800 mb-0.5 font-mono">
                      Bounty UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="operative@okhdfcbank"
                      className="w-full text-xs font-mono font-medium px-3 py-2 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#4ADE80] hover:bg-[#3ec472] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black rounded-2xl font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#09090B] transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Registering Operative Profile...</span>
                ) : (
                  <>
                    <span>Complete Registration & Deploy Shell</span>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: OPERATOR LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] space-y-3">
                <div className="text-xs font-black uppercase text-[#09090B] font-mono">
                  Enter Firebase Credentials
                </div>

                <div>
                  <label className="block text-[11px] font-black text-zinc-800 mb-1">
                    Operative Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-black absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="operative@delhi.gov.in"
                      className="w-full text-xs font-mono font-medium pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-zinc-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-black absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-mono font-medium pl-9 pr-3 py-2.5 bg-white border-2 border-black rounded-xl outline-none shadow-[2px_2px_0px_#09090B]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#FACC15] hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black rounded-2xl font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#09090B] transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t-2 border-black/20"></div>
                <span className="shrink mx-3 text-[10px] font-mono font-bold text-zinc-600 uppercase">Or Continue With</span>
                <div className="grow border-t-2 border-black/20"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
                className="w-full py-2.5 bg-white hover:bg-zinc-100 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none text-black rounded-2xl font-black font-mono text-xs flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#09090B] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google Account</span>
              </button>
            </form>
          )}

          {/* MODE 3: QUICK DEMO ACCOUNTS */}
          {mode === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-700 font-medium bg-white/80 p-2.5 rounded-xl border border-zinc-300">
                Instantly launch pre-configured Delhi operative profiles with custom badges, bounty wallets, and live roles:
              </p>

              <div className="space-y-2">
                {[
                  {
                    role: 'worker' as const,
                    name: 'Rajesh Kumar',
                    title: 'Civic Maintenance Worker',
                    details: 'MCD Pothole Squad 4 • Ward 102 (Karol Bagh)',
                    icon: Wrench,
                    badge: 'MCD Crew',
                    badgeColor: 'bg-[#FACC15] text-black'
                  },
                  {
                    role: 'courier' as const,
                    name: 'Pooja Verma',
                    title: 'Food Rescue Courier',
                    details: 'Delhi Hunger Van 09 • Ather 450X EV Carrier (South Delhi)',
                    icon: UtensilsCrossed,
                    badge: 'Food Rescue',
                    badgeColor: 'bg-[#4ADE80] text-black'
                  },
                  {
                    role: 'donor' as const,
                    name: 'Bikanervala Sweets & Restaurant',
                    title: 'Commercial Food Donor',
                    details: 'Connaught Place Outer Circle • FSSAI Hot Buffet & Mithai',
                    icon: Building2,
                    badge: 'FSSAI Donor',
                    badgeColor: 'bg-emerald-400 text-black'
                  },
                  {
                    role: 'dispatch' as const,
                    name: 'Chief Control Officer Sharma',
                    title: 'Municipal Admin (CAD)',
                    details: 'MCD Central Dispatch Alpha • Telemetry & Approval Desk',
                    icon: Radio,
                    badge: 'Admin CAD',
                    badgeColor: 'bg-zinc-900 text-white'
                  }
                ].map((demo) => {
                  const DemoIcon = demo.icon;
                  return (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => loginAsDemo(demo.role)}
                      className="w-full text-left p-3 rounded-2xl bg-white border-2 border-black hover:bg-zinc-50 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none shadow-[3px_3px_0px_#09090B] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-black border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
                          <DemoIcon className="w-4 h-4 text-[#FACC15]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#09090B]">{demo.name}</span>
                            <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded-sm border border-black shadow-[1px_1px_0px_#000] ${demo.badgeColor}`}>
                              {demo.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-600 font-bold truncate max-w-[220px] sm:max-w-xs font-mono">
                            {demo.details}
                          </p>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-[#4ADE80] border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-zinc-300 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
          <span>Terminal PIN: 1234</span>
          <span>Delhi NCT Civil Defense</span>
        </div>
      </div>
    </div>
  );
};
