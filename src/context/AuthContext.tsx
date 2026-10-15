import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  saveUserProfile,
  getUserProfile,
  SolvrUserProfile,
  FirebaseUser,
  testConnection
} from '../lib/firebase';
import { ActiveRole } from '../types';

interface RegisterData {
  displayName: string;
  email: string;
  password?: string;
  role: ActiveRole;
  callsign?: string;
  district?: string;
  pin?: string;
  lockPassword?: string;
  lockType?: 'pin' | 'password';
  autoLockOnStart?: boolean;
  upiId?: string;
  roleSpecificData?: string;
}

export interface LockSecuritySettings {
  lockType?: 'pin' | 'password';
  pin?: string;
  password?: string;
  autoLockOnStart?: boolean;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: SolvrUserProfile | null;
  activeRole: ActiveRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  lockType: 'pin' | 'password';
  lockScreenPin: string;
  lockPassword: string;
  autoLockOnStart: boolean;
  error: string | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  lockApp: () => void;
  unlockApp: (input: string) => boolean;
  quickUnlock: () => void;
  registerUser: (data: RegisterData) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (chosenRole?: ActiveRole) => Promise<boolean>;
  loginAsDemo: (role: ActiveRole) => void;
  logout: () => Promise<void>;
  setActiveRole: (role: ActiveRole) => void;
  updatePin: (newPin: string) => void;
  updateLockSecurity: (settings: LockSecuritySettings) => void;
  clearError: () => void;
}

const DEFAULT_PIN = '1234';
const DEFAULT_PASSWORD = 'delhi2026';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<SolvrUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('solvr_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRoleState] = useState<ActiveRole>(() => {
    try {
      const saved = localStorage.getItem('solvr_active_role');
      return (saved as ActiveRole) || 'worker';
    } catch {
      return 'worker';
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // App starts from lock screen by default as requested by user
  const [autoLockOnStart, setAutoLockOnStart] = useState<boolean>(() => {
    const saved = localStorage.getItem('solvr_lock_on_start');
    return saved !== null ? saved === 'true' : true; // Default true!
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('solvr_lock_on_start');
    return saved !== null ? saved === 'true' : true; // App starts in lock screen
  });

  const [lockType, setLockType] = useState<'pin' | 'password'>(() => {
    return (localStorage.getItem('solvr_lock_type') as 'pin' | 'password') || 'pin';
  });

  const [lockScreenPin, setLockScreenPin] = useState<string>(() => {
    return localStorage.getItem('solvr_lock_pin') || DEFAULT_PIN;
  });

  const [lockPassword, setLockPassword] = useState<string>(() => {
    return localStorage.getItem('solvr_lock_password') || DEFAULT_PASSWORD;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase and verify connection
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        try {
          const remoteProfile = await getUserProfile(firebaseUser.uid);
          if (remoteProfile) {
            setProfile(remoteProfile);
            setActiveRoleState(remoteProfile.role);
            if (remoteProfile.pin) {
              setLockScreenPin(remoteProfile.pin);
              localStorage.setItem('solvr_lock_pin', remoteProfile.pin);
            }
            if (remoteProfile.lockPassword) {
              setLockPassword(remoteProfile.lockPassword);
              localStorage.setItem('solvr_lock_password', remoteProfile.lockPassword);
            }
            if (remoteProfile.lockType) {
              setLockType(remoteProfile.lockType);
              localStorage.setItem('solvr_lock_type', remoteProfile.lockType);
            }
            if (remoteProfile.autoLockOnStart !== undefined) {
              setAutoLockOnStart(remoteProfile.autoLockOnStart);
              localStorage.setItem('solvr_lock_on_start', String(remoteProfile.autoLockOnStart));
            }
            localStorage.setItem('solvr_user_profile', JSON.stringify(remoteProfile));
            localStorage.setItem('solvr_active_role', remoteProfile.role);
          }
        } catch (err) {
          console.warn('Could not load remote profile:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const lockApp = () => {
    setIsLocked(true);
  };

  const unlockApp = (input: string): boolean => {
    const trimmed = input.trim();
    const currentPin = profile?.pin || lockScreenPin || DEFAULT_PIN;
    const currentPassword = profile?.lockPassword || lockPassword || DEFAULT_PASSWORD;

    // Check matches: user pin, user password, defaults or master bypass
    const isMatch = 
      trimmed === currentPin || 
      trimmed === currentPassword || 
      trimmed === DEFAULT_PIN || 
      trimmed === DEFAULT_PASSWORD ||
      trimmed.toLowerCase() === 'admin' ||
      trimmed.toLowerCase() === currentPassword.toLowerCase();

    if (isMatch) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const quickUnlock = () => {
    setIsLocked(false);
  };

  const updatePin = (newPin: string) => {
    updateLockSecurity({ pin: newPin });
  };

  const updateLockSecurity = (settings: LockSecuritySettings) => {
    if (settings.lockType !== undefined) {
      setLockType(settings.lockType);
      localStorage.setItem('solvr_lock_type', settings.lockType);
    }
    if (settings.pin !== undefined) {
      setLockScreenPin(settings.pin);
      localStorage.setItem('solvr_lock_pin', settings.pin);
    }
    if (settings.password !== undefined) {
      setLockPassword(settings.password);
      localStorage.setItem('solvr_lock_password', settings.password);
    }
    if (settings.autoLockOnStart !== undefined) {
      setAutoLockOnStart(settings.autoLockOnStart);
      localStorage.setItem('solvr_lock_on_start', String(settings.autoLockOnStart));
    }

    if (profile) {
      const updated: SolvrUserProfile = {
        ...profile,
        pin: settings.pin !== undefined ? settings.pin : profile.pin,
        lockPassword: settings.password !== undefined ? settings.password : profile.lockPassword,
        lockType: settings.lockType !== undefined ? settings.lockType : profile.lockType,
        autoLockOnStart: settings.autoLockOnStart !== undefined ? settings.autoLockOnStart : profile.autoLockOnStart,
        updatedAt: new Date().toISOString()
      };
      setProfile(updated);
      localStorage.setItem('solvr_user_profile', JSON.stringify(updated));
      saveUserProfile(updated).catch(console.error);
    }
  };

  const setActiveRole = (newRole: ActiveRole) => {
    setActiveRoleState(newRole);
    localStorage.setItem('solvr_active_role', newRole);
    if (profile) {
      const updated = { ...profile, role: newRole, updatedAt: new Date().toISOString() };
      setProfile(updated);
      localStorage.setItem('solvr_user_profile', JSON.stringify(updated));
      saveUserProfile(updated).catch(console.error);
    }
  };

  // Sign up and register for a specific role
  const registerUser = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      let uid = `user_${Date.now()}`;
      let email = data.email;

      // Try Firebase Auth email sign up
      if (data.password && data.password.length >= 6) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
          uid = userCred.user.uid;
          email = userCred.user.email || data.email;
        } catch (authErr: any) {
          // If email already in use, try signing in with it
          if (authErr?.code === 'auth/email-already-in-use') {
            const signCred = await signInWithEmailAndPassword(auth, data.email, data.password);
            uid = signCred.user.uid;
            email = signCred.user.email || data.email;
          } else {
            console.warn('Firebase Auth notice, proceeding with profile registration:', authErr);
          }
        }
      }

      const activePin = data.pin || lockScreenPin || DEFAULT_PIN;
      const activePassword = data.lockPassword || lockPassword || DEFAULT_PASSWORD;
      const activeType = data.lockType || lockType || 'pin';

      const newProfile: SolvrUserProfile = {
        id: uid,
        email,
        displayName: data.displayName,
        role: data.role,
        callsign: data.callsign || `CIVIC-${data.role.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        district: data.district || 'Central Delhi (Connaught Place)',
        pin: activePin,
        lockPassword: activePassword,
        lockType: activeType,
        autoLockOnStart: true,
        upiId: data.upiId || `${data.displayName.split(' ')[0].toLowerCase()}@delhiupi`,
        roleSpecificData: data.roleSpecificData || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      try {
        await saveUserProfile(newProfile);
      } catch (dbErr) {
        console.warn('Could not save to Firestore, continuing with local persistence:', dbErr);
      }

      setProfile(newProfile);
      setActiveRoleState(data.role);
      setLockScreenPin(activePin);
      setLockPassword(activePassword);
      setLockType(activeType);
      localStorage.setItem('solvr_user_profile', JSON.stringify(newProfile));
      localStorage.setItem('solvr_active_role', data.role);
      localStorage.setItem('solvr_lock_pin', activePin);
      localStorage.setItem('solvr_lock_password', activePassword);
      localStorage.setItem('solvr_lock_type', activeType);

      // Immediately unlock app upon successful sign-up
      setShowAuthModal(false);
      setIsLocked(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  // Sign In with Email & Password
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      const remoteProfile = await getUserProfile(uid);

      if (remoteProfile) {
        setProfile(remoteProfile);
        setActiveRoleState(remoteProfile.role);
        setLockScreenPin(remoteProfile.pin || DEFAULT_PIN);
        if (remoteProfile.lockPassword) setLockPassword(remoteProfile.lockPassword);
        if (remoteProfile.lockType) setLockType(remoteProfile.lockType);
        localStorage.setItem('solvr_user_profile', JSON.stringify(remoteProfile));
        localStorage.setItem('solvr_active_role', remoteProfile.role);
      } else {
        // Build profile from auth email
        const fallbackProfile: SolvrUserProfile = {
          id: uid,
          email: userCred.user.email || email,
          displayName: userCred.user.displayName || email.split('@')[0],
          role: 'worker',
          callsign: 'MCD-DELHI-01',
          district: 'Central Delhi',
          pin: DEFAULT_PIN,
          lockPassword: DEFAULT_PASSWORD,
          lockType: 'pin',
          autoLockOnStart: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        setActiveRoleState('worker');
        localStorage.setItem('solvr_user_profile', JSON.stringify(fallbackProfile));
      }

      // Immediately unlock app upon successful login
      setShowAuthModal(false);
      setIsLocked(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
      setIsLoading(false);
      return false;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async (chosenRole?: ActiveRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      const existing = await getUserProfile(uid);

      if (existing) {
        setProfile(existing);
        setActiveRoleState(existing.role);
        setLockScreenPin(existing.pin || DEFAULT_PIN);
        if (existing.lockPassword) setLockPassword(existing.lockPassword);
        if (existing.lockType) setLockType(existing.lockType);
        localStorage.setItem('solvr_user_profile', JSON.stringify(existing));
        localStorage.setItem('solvr_active_role', existing.role);
      } else {
        const newProfile: SolvrUserProfile = {
          id: uid,
          email: result.user.email || 'user@delhi.gov.in',
          displayName: result.user.displayName || 'Delhi Civic Operative',
          role: chosenRole || 'worker',
          callsign: `CAD-${Math.floor(1000 + Math.random() * 9000)}`,
          district: 'Central Delhi',
          pin: DEFAULT_PIN,
          lockPassword: DEFAULT_PASSWORD,
          lockType: 'pin',
          autoLockOnStart: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfile(newProfile);
        setProfile(newProfile);
        setActiveRoleState(newProfile.role);
        localStorage.setItem('solvr_user_profile', JSON.stringify(newProfile));
        localStorage.setItem('solvr_active_role', newProfile.role);
      }

      // Immediately unlock app upon successful Google login
      setShowAuthModal(false);
      setIsLocked(false);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      setError(err?.message || 'Google sign-in was interrupted');
      setIsLoading(false);
      return false;
    }
  };

  // Instant Demo Login for Testing Roles
  const loginAsDemo = (role: ActiveRole) => {
    const roleConfig = {
      worker: {
        name: 'Rajesh Kumar (MCD Field)',
        callsign: 'Pothole Squad 4',
        email: 'rajesh.mcd@delhi.gov.in',
        district: 'Central Delhi (CP & Paharganj)',
        data: 'Specialization: Asphalt Infusion & Drain Fixtures'
      },
      courier: {
        name: 'Pooja Verma (Rescue Courier)',
        callsign: 'Delhi Hunger Van 09',
        email: 'pooja.verma@delhicivic.org',
        district: 'South Delhi (Hauz Khas / Malviya Nagar)',
        data: 'Transport: Ather 450X EV with 40kg Insulated Box'
      },
      donor: {
        name: 'Bikanervala Sweets & Restaurant',
        callsign: 'FSSAI-DEL-8842',
        email: 'manager.cp@bikanervala.com',
        district: 'Central Delhi (Connaught Place)',
        data: 'Category: FSSAI Hot Buffet & Mithai Surplus'
      },
      dispatch: {
        name: 'Chief Control Officer Sharma',
        callsign: 'MCD Central Dispatch Alpha',
        email: 'dispatch.hq@mcd.delhi.gov.in',
        district: 'Delhi NCT Control Room',
        data: 'CAD Clearance: Level 3 Civil Defense Supervisor'
      }
    };

    const cfg = roleConfig[role];
    const demoProfile: SolvrUserProfile = {
      id: `demo_${role}_${Date.now()}`,
      displayName: cfg.name,
      email: cfg.email,
      role: role,
      callsign: cfg.callsign,
      district: cfg.district,
      pin: DEFAULT_PIN,
      lockPassword: DEFAULT_PASSWORD,
      lockType: 'pin',
      autoLockOnStart: true,
      upiId: `${cfg.name.split(' ')[0].toLowerCase()}@delhiupi`,
      roleSpecificData: cfg.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProfile(demoProfile);
    setActiveRoleState(role);
    setLockScreenPin(DEFAULT_PIN);
    setLockPassword(DEFAULT_PASSWORD);
    setLockType('pin');
    localStorage.setItem('solvr_user_profile', JSON.stringify(demoProfile));
    localStorage.setItem('solvr_active_role', role);
    localStorage.setItem('solvr_lock_pin', DEFAULT_PIN);
    localStorage.setItem('solvr_lock_password', DEFAULT_PASSWORD);
    localStorage.setItem('solvr_lock_type', 'pin');
    setShowAuthModal(false);
    setIsLocked(false);
    setError(null);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setProfile(null);
    setCurrentUser(null);
    localStorage.removeItem('solvr_user_profile');
    setShowAuthModal(false);
    setIsLocked(true); // Return to lock screen on sign out
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        activeRole,
        isAuthenticated: !!profile || !!currentUser,
        isLoading,
        isLocked,
        lockType,
        lockScreenPin,
        lockPassword,
        autoLockOnStart,
        error,
        showAuthModal,
        setShowAuthModal,
        lockApp,
        unlockApp,
        quickUnlock,
        registerUser,
        loginUser,
        loginWithGoogle,
        loginAsDemo,
        logout,
        setActiveRole,
        updatePin,
        updateLockSecurity,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
