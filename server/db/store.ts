/**
 * In-Memory Database Store with Repository Helpers & Initial Seeds
 * Localized for Delhi NCT, India (MCD, NDMC, FSSAI, Section 80G, and UPI Rails)
 */

import {
  User,
  Worker,
  CivicTask,
  FoodRescue,
  Wallet,
  Transaction,
  Badge,
  AuditLog,
} from './schema';

class DatabaseStore {
  public users: Map<string, User> = new Map();
  public workers: Map<string, Worker> = new Map();
  public tasks: Map<string, CivicTask> = new Map();
  public foodRescues: Map<string, FoodRescue> = new Map();
  public wallets: Map<string, Wallet> = new Map();
  public transactions: Map<string, Transaction> = new Map();
  public badges: Map<string, Badge[]> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Users (Delhi Context)
    const workerUser: User = {
      id: 'USR-AARAV',
      email: 'aarav.sharma@solvr.delhi.gov.in',
      name: 'Aarav Sharma',
      role: 'worker',
      phone: '+91-98110-42091',
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-10-12T14:00:00Z',
    };
    const dispatcherUser: User = {
      id: 'USR-DISPATCH',
      email: 'control.room@mcd.delhi.gov.in',
      name: 'Inspector Vikram Malhotra (MCD Zone Control)',
      role: 'dispatcher',
      createdAt: '2026-08-15T08:00:00Z',
      updatedAt: '2026-10-12T14:00:00Z',
    };
    const donorUser: User = {
      id: 'USR-DONOR-01',
      email: 'banquets@royaldawat.in',
      name: 'Chef Rajesh Aggarwal (Royal Dawat Banquets)',
      role: 'donor_partner',
      createdAt: '2026-08-20T08:00:00Z',
      updatedAt: '2026-10-12T14:00:00Z',
    };

    this.users.set(workerUser.id, workerUser);
    this.users.set(dispatcherUser.id, dispatcherUser);
    this.users.set(donorUser.id, donorUser);

    // 2. Seed Worker (Delhi NCT Anchor)
    const worker: Worker = {
      id: 'DL-SOLV-42',
      userId: workerUser.id,
      callsign: 'DL-SOLV-42',
      upiId: 'aarav.sharma@okhdfcbank',
      tier: 'guardian',
      tierScore: 68,
      reputationRating: 4.94,
      skills: ['cold_bitumen_patch', 'storm_drain_desilt', 'food_safety_fssai', 'tree_prune'],
      currentStatus: 'available',
      activeStreakDays: 7,
      streakMultiplier: 1.35,
      currentLocation: {
        district: 'Central Delhi (Connaught Place)',
        lat: 28.6139,
        lng: 77.2090,
        mapX: 44,
        mapY: 46,
      },
      totalTasksCompleted: 54,
      totalFoodRescuedKg: 740,
      carbonOffsetKg: 980,
      activeTaskId: null,
      verifiedAt: '2026-09-02T10:00:00Z',
    };
    this.workers.set(worker.id, worker);

    // 3. Seed Badges
    const workerBadges: Badge[] = [
      {
        id: 'B-01',
        badgeKey: 'streak_7_days',
        title: '7-Day Dilli Blaze',
        icon: 'flame',
        description: 'Completed at least 1 task daily in NCT Delhi for 7 consecutive days. 1.35x Multiplier active.',
        unlocked: true,
        earnedDate: 'Yesterday',
      },
      {
        id: 'B-02',
        badgeKey: 'annapurna_champion',
        title: 'Annapurna Sewak',
        icon: 'utensils',
        description: 'Rescued over 500 kg of edible surplus food for Delhi Night Shelters (Rain Basera).',
        unlocked: true,
        earnedDate: '3 days ago',
      },
      {
        id: 'B-03',
        badgeKey: 'monsoon_sentinel',
        title: 'Monsoon Rakshak',
        icon: 'shield',
        description: 'Cleared 10+ critical flood drains and storm catch basins before Delhi flash rains.',
        unlocked: true,
        earnedDate: 'Last week',
      },
      {
        id: 'B-04',
        badgeKey: 'tier_coordinator',
        title: 'Master Coordinator',
        icon: 'crown',
        description: 'Reach 75 completed tasks with a 98%+ MCD/NDMC municipal rating.',
        unlocked: false,
      },
    ];
    this.badges.set(worker.id, workerBadges);

    // 4. Seed Wallet & Transactions in INR (₹)
    const wallet: Wallet = {
      id: 'WLT-42',
      userId: workerUser.id,
      workerId: worker.id,
      balanceInr: 4850,
      pendingPayoutInr: 4850,
      lifetimeEarnedInr: 32400,
      currency: 'INR',
      payoutMethod: {
        type: 'upi',
        upiId: 'aarav.sharma@okhdfcbank',
        bankIfsc: 'HDFC0000123',
        accountLast4: '4402',
      },
      updatedAt: new Date().toISOString(),
    };
    this.wallets.set(wallet.id, wallet);

    const initialTxns: Transaction[] = [
      {
        id: 'TXN-901',
        walletId: wallet.id,
        type: 'TASK_BOUNTY',
        amountInr: 877.5,
        status: 'PENDING',
        description: 'Okhla Tech Canteen Fresh Meal Rescue (45 kg) + 1.35x Streak Boost',
        paymentMode: 'UPI',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'TXN-902',
        walletId: wallet.id,
        type: 'TASK_BOUNTY',
        amountInr: 945.0,
        status: 'PENDING',
        description: 'Janpath Peepal Branch Trimming & Cycle Track Clearance',
        paymentMode: 'UPI',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'TXN-903',
        walletId: wallet.id,
        type: 'STREAK_BONUS',
        amountInr: 500.0,
        status: 'PENDING',
        description: '7-Day Dilli Consistency Streak Milestone Bonus Reward',
        paymentMode: 'UPI',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'TXN-904',
        walletId: wallet.id,
        type: 'SCHEDULED_PAYOUT',
        amountInr: 4250.0,
        status: 'CLEARED',
        description: 'Weekly Scheduled UPI Payout Cycle #41 to aarav.sharma@okhdfcbank',
        paymentMode: 'UPI',
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      },
    ];
    initialTxns.forEach((tx) => this.transactions.set(tx.id, tx));

    // 5. Seed Civic Tasks in Delhi NCT
    const initialTasks: CivicTask[] = [
      {
        id: 'TASK-101',
        type: 'food_rescue',
        title: 'Surplus Banquet Biryani & Fresh Naan Roti Trays',
        description: 'Freshly prepared dum biryani, paneer gravies, and 120 tandoori rotis packed in insulated containers from Chattarpur wedding farm.',
        urgency: 'critical',
        status: 'PENDING',
        district: 'South Delhi (Hauz Khas & Saket)',
        address: 'Silver Oak Farm Road, Chattarpur Mandir Lane',
        coordinates: { lat: 28.502, lng: 77.185, mapX: 42, mapY: 58 },
        baseBountyInr: 650,
        estimatedMinutes: 30,
        distanceKm: 2.4,
        equipmentRequired: ['Insulated Food Carrier Box', 'Two-Wheeler Cargo Straps'],
        reportedBy: 'Royal Dawat Banquet & Catering',
        assignedWorkerId: null,
        escrowStatus: 'BONDED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'TASK-102',
        type: 'civic_repair',
        title: 'Barapullah Catchment Monsoon Nala Grate Clearance',
        description: 'Heavy plastic polybag obstruction blocking stormwater runoff catch basin before monsoon rain surge.',
        civicCategory: 'storm_drain',
        urgency: 'priority',
        status: 'PENDING',
        district: 'Central Delhi (Connaught Place)',
        address: 'Near Barapullah Elevated Flyover Drain Entry, Jangpura',
        coordinates: { lat: 28.586, lng: 77.242, mapX: 50, mapY: 44 },
        baseBountyInr: 850,
        estimatedMinutes: 35,
        distanceKm: 3.1,
        equipmentRequired: ['High-Vis Vest', 'MCD Heavy Grate Hook', 'Bio-Waste Sacks'],
        reportedBy: 'PWD Delhi Rapid Flood Monitor',
        assignedWorkerId: null,
        escrowStatus: 'BONDED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'TASK-103',
        type: 'civic_repair',
        title: 'Deep Pothole Asphalt Cold-Patch Fill on Ring Road',
        description: 'Motorcycle & scooter hazard: 15-inch crater in designated two-wheeler lane opposite IIT Delhi.',
        civicCategory: 'pothole',
        urgency: 'critical',
        status: 'PENDING',
        district: 'South Delhi (Hauz Khas & Saket)',
        address: 'Outer Ring Road (Opposite IIT Delhi Main Gate)',
        coordinates: { lat: 28.545, lng: 77.192, mapX: 46, mapY: 64 },
        baseBountyInr: 1100,
        estimatedMinutes: 40,
        distanceKm: 4.2,
        equipmentRequired: ['Bitumen Hand Tamper', 'Reflective Cones (3)', 'Warning Baton'],
        reportedBy: 'Delhi Traffic Police Safety Unit',
        assignedWorkerId: null,
        escrowStatus: 'BONDED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'TASK-107',
        type: 'civic_repair',
        title: 'Fallen Peepal Tree Branch Blocking Cycle Track',
        description: 'Storm damaged branch (approx. 5 inches thick) blocking NDMC dedicated non-motorised transit track on Janpath.',
        civicCategory: 'greenery',
        urgency: 'priority',
        status: 'SUBMITTED',
        district: 'Central Delhi (Connaught Place)',
        address: 'Janpath Road, Near Tolstoy Marg Crossing',
        coordinates: { lat: 28.625, lng: 77.218, mapX: 52, mapY: 40 },
        baseBountyInr: 700,
        estimatedMinutes: 30,
        distanceKm: 1.8,
        equipmentRequired: ['Hedge Saw', 'Heavy Safety Gloves', 'Nylon Ropes'],
        reportedBy: 'NDMC Smart City Command Center',
        assignedWorkerId: 'DL-SOLV-42',
        escrowStatus: 'BONDED',
        proofSubmission: {
          workerId: 'DL-SOLV-42',
          submittedAt: 'Today, 14:15 IST',
          notes: 'Branch sawed into three 2-foot logs and neatly stacked along the tree basin. Pedestrian and cycle track 100% obstruction free.',
          gpsVerified: true,
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    initialTasks.forEach((t) => this.tasks.set(t.id, t));

    // 6. Seed Food Rescue Operations in Delhi
    const initialRescues: FoodRescue[] = [
      {
        id: 'RESCUE-201',
        donorId: donorUser.id,
        donorName: 'Royal Dawat Banquet & Catering',
        donorType: 'Wedding & Event Caterer',
        foodCategory: 'cooked_meals',
        itemsSummary: '45 kg surplus dum biryani, dal makhani, and tandoori rotis',
        estimatedWeightKg: 45,
        temperatureRequired: 'hot',
        pickupWindowExpires: new Date(Date.now() + 45 * 60000).toISOString(),
        pickupAddress: 'Silver Oak Farm Road, Chattarpur Mandir Lane',
        destinationShelterId: 'SHLTR-01',
        destinationShelterName: 'DUSIB Rain Basera (Night Shelter #18)',
        destinationAddress: 'Near Sarai Kale Khan ISBT Terminal',
        district: 'South Delhi (Hauz Khas & Saket)',
        coordinates: { lat: 28.502, lng: 77.185, mapX: 42, mapY: 58 },
        baseBountyInr: 650,
        status: 'AVAILABLE',
        assignedWorkerId: null,
        chainOfCustody: [
          {
            event: 'BATCH_LOGGED',
            timestamp: new Date().toISOString(),
            actorId: donorUser.id,
            actorName: 'Chef Rajesh Aggarwal',
            notes: 'Packed in food-grade thermal containers at 68°C under FSSAI surplus guidelines.',
            temperatureReadingC: 68,
          },
        ],
        donorTaxCertificateId: 'CERT-80G-DELHI-2026-901',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'RESCUE-202',
        donorId: 'USR-DONOR-02',
        donorName: 'Sodexo Metro Canteen Services',
        donorType: 'Corporate Food Service',
        foodCategory: 'cooked_meals',
        itemsSummary: '80 sealed rajma chawal and aloo gobi meals',
        estimatedWeightKg: 52,
        temperatureRequired: 'hot',
        pickupWindowExpires: new Date(Date.now() + 60 * 60000).toISOString(),
        pickupAddress: 'Okhla Industrial Area Phase-III, Tech Center B',
        destinationShelterId: 'SHLTR-02',
        destinationShelterName: 'Robin Hood Army Community Kitchen',
        destinationAddress: 'Kalkaji Slum Cluster Community Center',
        district: 'South Delhi (Hauz Khas & Saket)',
        coordinates: { lat: 28.535, lng: 77.272, mapX: 62, mapY: 68 },
        baseBountyInr: 750,
        status: 'AVAILABLE',
        assignedWorkerId: null,
        chainOfCustody: [
          {
            event: 'BATCH_LOGGED',
            timestamp: new Date().toISOString(),
            actorId: 'USR-DONOR-02',
            actorName: 'Canteen Operations Lead Sunil',
            notes: 'Clean batch packed in insulated insulated hot containers.',
            temperatureReadingC: 65,
          },
        ],
        donorTaxCertificateId: 'CERT-80G-DELHI-2026-902',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    initialRescues.forEach((r) => this.foodRescues.set(r.id, r));

    this.logAudit('DISPATCH', 'SYS-INIT', 'SYSTEM_BOOTSTRAP_DELHI_NCT', 'MCD_CAD', { 
      status: 'READY',
      region: 'Delhi NCT, India'
    });
  }

  public logAudit(
    entityType: AuditLog['entityType'],
    entityId: string,
    action: string,
    actorId: string,
    metadata?: Record<string, any>
  ): AuditLog {
    const log: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType,
      entityId,
      action,
      actorId,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
}

export const db = new DatabaseStore();
