export type TaskType = 'civic_repair' | 'food_rescue' | 'hazard_alert';

export type CivicCategory =
  | 'pothole'
  | 'storm_drain'
  | 'waste_dhalao'
  | 'dust_mitigation'
  | 'park_fixture'
  | 'street_light'
  | 'greenery';

export type FoodCategory =
  | 'cooked_meals'
  | 'bakery'
  | 'mandi_produce'
  | 'mithai_dairy'
  | 'pantry_staples';

export type UrgencyLevel = 'normal' | 'priority' | 'critical';

export type TaskStatus = 'open' | 'claimed' | 'in_progress' | 'in_review' | 'completed';

export interface ProofSubmission {
  workerId: string;
  workerName: string;
  submittedAt: string;
  notes: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  verifiedWeightKg?: number;
  verifiedBy?: string;
}

export interface CivicTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  civicCategory?: CivicCategory;
  foodCategory?: FoodCategory;
  urgency: UrgencyLevel;
  status: TaskStatus;
  district: string; // e.g. 'Central Delhi (CP)', 'South Delhi (Hauz Khas)', etc.
  coordinates: { x: number; y: number }; // Percentage 0 - 100 within map grid
  address: string;
  baseBounty: number; // in INR (₹)
  estimatedMinutes: number;
  distanceKm: number;
  foodDetails?: {
    donorName: string;
    donorType: string;
    weightKg: number;
    temperature: 'ambient' | 'refrigerated' | 'hot';
    pickupWindowExpires: string;
    destinationName: string;
    destinationAddress: string;
    perishableTimerMinutes: number;
  };
  maintenanceDetails?: {
    infrastructureType: string;
    equipmentRequired: string[];
    reportedBy: string;
    hazardRating: 1 | 2 | 3;
  };
  proofSubmission?: ProofSubmission;
  claimedAt?: string;
  completedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  description: string;
  earnedDate?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  callsign: string;
  upiId: string;
  tier: 'Civic Cadet' | 'Street Guardian' | 'Master Coordinator';
  tierProgress: number; // 0 - 100%
  currentStreakDays: number;
  streakMultiplier: number; // e.g. 1.35
  pendingPayout: number; // in INR (₹)
  lifetimeEarnings: number; // in INR (₹)
  totalTasksCompleted: number;
  foodRescuedKg: number;
  carbonOffsetKg: number;
  activeTaskId: string | null;
  badges: Badge[];
}

export interface PayoutTransaction {
  id: string;
  date: string;
  taskTitle: string;
  type: 'civic_task' | 'food_rescue' | 'streak_bonus' | 'hazard_pay';
  amount: number; // in INR (₹)
  status: 'pending' | 'cleared';
  paymentMode?: 'UPI' | 'NEFT';
}

export type ActiveRole = 'worker' | 'courier' | 'donor' | 'dispatch';
