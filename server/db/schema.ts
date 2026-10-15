/**
 * Database Schemas & Types for SOLVR Delhi (NCT of Delhi, India)
 * Relational PostgreSQL / Document models adapted for Indian civic infrastructure & UPI rails
 */

export type UserRole = 'citizen' | 'worker' | 'dispatcher' | 'donor_partner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkerTier = 'cadet' | 'guardian' | 'coordinator';
export type WorkerStatus = 'offline' | 'available' | 'on_route' | 'busy';

export interface Worker {
  id: string;
  userId: string;
  callsign: string;
  upiId: string;
  tier: WorkerTier;
  tierScore: number; // 0 - 100 towards next tier
  reputationRating: number; // 1.0 - 5.0
  skills: string[]; // e.g., ['cold_bitumen_patch', 'storm_drain_desilt', 'food_safety_fssai', 'tree_prune']
  currentStatus: WorkerStatus;
  activeStreakDays: number;
  streakMultiplier: number; // e.g. 1.35
  currentLocation: {
    district: string;
    lat: number;
    lng: number;
    mapX: number; // Grid percent 0-100
    mapY: number; // Grid percent 0-100
  };
  totalTasksCompleted: number;
  totalFoodRescuedKg: number;
  carbonOffsetKg: number;
  activeTaskId: string | null;
  verifiedAt: string;
}

export type TaskStatus = 
  | 'PENDING'      // Broadcasted on MCD/NDMC board, awaiting claim
  | 'ASSIGNED'     // Worker matched / claimed
  | 'IN_PROGRESS'  // Worker checked in on-site
  | 'SUBMITTED'    // Worker uploaded completion proof
  | 'VERIFIED'     // Municipal dispatch verified & escrow released
  | 'CANCELLED';

export type TaskUrgency = 'normal' | 'priority' | 'critical';
export type CivicCategory = 
  | 'pothole' 
  | 'storm_drain' 
  | 'waste_dhalao' 
  | 'dust_mitigation' 
  | 'park_fixture' 
  | 'street_light' 
  | 'greenery';

export interface TaskProof {
  workerId: string;
  submittedAt: string;
  notes: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  gpsVerified: boolean;
  verifiedWeightKg?: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface CivicTask {
  id: string;
  type: 'civic_repair' | 'hazard_mitigation' | 'food_rescue';
  title: string;
  description: string;
  civicCategory?: CivicCategory;
  urgency: TaskUrgency;
  status: TaskStatus;
  district: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // Grid coordinate percentage
    mapY: number;
  };
  baseBountyInr: number; // in INR (₹)
  estimatedMinutes: number;
  distanceKm: number;
  equipmentRequired: string[];
  reportedBy: string;
  assignedWorkerId: string | null;
  proofSubmission?: TaskProof;
  escrowStatus: 'BONDED' | 'DISBURSED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type FoodCategory = 
  | 'cooked_meals' 
  | 'bakery' 
  | 'mandi_produce' 
  | 'mithai_dairy' 
  | 'pantry_staples';

export type TemperatureRequirement = 'ambient' | 'refrigerated' | 'hot';
export type FoodRescueStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED_VERIFIED' | 'EXPIRED';

export interface CustodyEvent {
  event: 'BATCH_LOGGED' | 'COURIER_ASSIGNED' | 'KITCHEN_PICKUP' | 'SHELTER_DELIVERY' | 'TEMPERATURE_CHECK';
  timestamp: string;
  actorId: string;
  actorName: string;
  notes: string;
  temperatureReadingC?: number;
}

export interface FoodRescue {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  foodCategory: FoodCategory;
  itemsSummary: string;
  estimatedWeightKg: number;
  temperatureRequired: TemperatureRequirement;
  pickupWindowExpires: string;
  pickupAddress: string;
  destinationShelterId: string;
  destinationShelterName: string;
  destinationAddress: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number;
    mapY: number;
  };
  baseBountyInr: number;
  status: FoodRescueStatus;
  assignedWorkerId: string | null;
  chainOfCustody: CustodyEvent[];
  donorTaxCertificateId?: string; // Section 80G Indian Income Tax Certificate
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  workerId: string;
  balanceInr: number; // Current accrued unreleased in INR
  pendingPayoutInr: number; // Staged for Friday scheduled UPI disbursement
  lifetimeEarnedInr: number;
  currency: 'INR';
  payoutMethod: {
    type: 'upi' | 'bank_neft';
    upiId: string;
    bankIfsc?: string;
    accountLast4: string;
  };
  updatedAt: string;
}

export type TransactionType = 
  | 'TASK_BOUNTY'
  | 'STREAK_BONUS'
  | 'HAZARD_PAY'
  | 'SCHEDULED_PAYOUT'
  | 'DONATION_TAX_CREDIT';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amountInr: number;
  status: 'PENDING' | 'CLEARED' | 'REJECTED';
  referenceTaskId?: string;
  description: string;
  paymentMode: 'UPI' | 'NEFT';
  createdAt: string;
}

export interface Badge {
  id: string;
  badgeKey: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  earnedDate?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'TASK' | 'FOOD_RESCUE' | 'WALLET' | 'DISPATCH' | 'WORKER';
  entityId: string;
  action: string;
  actorId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
