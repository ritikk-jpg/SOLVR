/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CivicTask, 
  WorkerProfile, 
  PayoutTransaction, 
  ActiveRole 
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_WORKER, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { Header } from './components/Header';
import { WorkerFullShell } from './components/Worker/WorkerFullShell';
import { DonorMinimalView } from './components/Donor/DonorMinimalView';
import { DispatchConsole } from './components/Dispatch/DispatchConsole';
import { StreamlinedBottomNav, NavigationTab } from './components/Navigation/StreamlinedBottomNav';
import { ProofSubmissionModal } from './components/Modals/ProofSubmissionModal';
import { PayoutModal } from './components/Modals/PayoutModal';
import { ProfileModal } from './components/Modals/ProfileModal';
import { ApiExplorerModal } from './components/Backend/ApiExplorerModal';
import { LockScreen } from './components/LockScreen/LockScreen';
import { AuthModal } from './components/Auth/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiClient } from './services/api';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { activeRole, setActiveRole, profile, lockApp } = useAuth();
  const [tasks, setTasks] = useState<CivicTask[]>(INITIAL_TASKS);
  const [worker, setWorker] = useState<WorkerProfile>(INITIAL_WORKER);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('TASK-101');
  const [navTab, setNavTab] = useState<NavigationTab>('map');
  
  // Modals state
  const [proofModalTask, setProofModalTask] = useState<CivicTask | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Check for deep-linked task query param on smartphone/browser open
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const taskIdParam = params.get('task');
      if (taskIdParam) {
        setSelectedTaskId(taskIdParam);
        const match = tasks.find((t) => t.id === taskIdParam);
        if (match) {
          if (match.type === 'food_rescue') {
            setActiveRole('courier');
          } else {
            setActiveRole('worker');
          }
          showToast(`Opened shared run: ${match.title}`);
        }
      }
    } catch (err) {
      console.warn('Deep link parsing error:', err);
    }
  }, [tasks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Synchronize profile details from AuthContext
  useEffect(() => {
    if (profile) {
      setWorker((prev) => ({
        ...prev,
        name: profile.displayName || prev.name,
        callsign: profile.callsign || prev.callsign,
        upiId: profile.upiId || prev.upiId,
      }));
    }
  }, [profile]);

  // Keyboard Shortcuts for Contextual Minimalism
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') {
        setActiveRole('worker');
        showToast('Role: Maintenance Worker');
      } else if (e.key === '2') {
        setActiveRole('courier');
        showToast('Role: Food Rescue Courier');
      } else if (e.key === '3') {
        setActiveRole('donor');
        showToast('Role: Commercial Food Donor');
      } else if (e.key === '4') {
        setActiveRole('dispatch');
        showToast('Role: Municipal Admin (MCD CAD)');
      } else if (e.key.toLowerCase() === 'w') {
        setShowPayoutModal(true);
      } else if (e.key.toLowerCase() === 'p') {
        setShowProfileModal(true);
      } else if (e.key.toLowerCase() === 'l') {
        lockApp();
        showToast('Terminal Locked');
      } else if (e.key === 'Escape') {
        setShowPayoutModal(false);
        setShowProfileModal(false);
        setShowApiModal(false);
        setProofModalTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveRole, lockApp]);

  // Sync initial state from live Express backend if reachable
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [taskRes, workerRes, txnRes] = await Promise.all([
          apiClient.getTasks(),
          apiClient.getWorker(worker.id),
          apiClient.getTransactions(worker.id),
        ]);

        if (taskRes?.success && Array.isArray(taskRes.data) && taskRes.data.length > 0) {
          const mappedTasks: CivicTask[] = taskRes.data.map((t: any) => ({
            id: t.id,
            type: t.type === 'food_rescue' ? 'food_rescue' : 'civic_repair',
            title: t.title,
            description: t.description,
            civicCategory: t.civicCategory,
            urgency: t.urgency,
            status: t.status === 'VERIFIED' ? 'completed' : t.status === 'SUBMITTED' ? 'in_review' : t.status === 'ASSIGNED' ? 'claimed' : 'open',
            district: t.district,
            coordinates: {
              x: t.coordinates?.mapX || 44,
              y: t.coordinates?.mapY || 46,
            },
            address: t.address,
            baseBounty: t.baseBountyInr || t.baseBounty || 650,
            estimatedMinutes: t.estimatedMinutes || 30,
            distanceKm: t.distanceKm || 2.4,
            maintenanceDetails: t.type !== 'food_rescue' ? {
              infrastructureType: t.equipmentRequired?.[0] || 'Civic Infrastructure',
              equipmentRequired: t.equipmentRequired || ['Standard PWD Safety Kit'],
              reportedBy: t.reportedBy || 'MCD Control Room Dispatch',
              hazardRating: t.urgency === 'critical' ? 3 : t.urgency === 'priority' ? 2 : 1,
            } : undefined,
            foodDetails: t.type === 'food_rescue' ? {
              donorName: t.reportedBy || 'Royal Dawat Banquets & Catering',
              donorType: 'Food Business & Caterer',
              weightKg: t.foodDetails?.weightKg || 35,
              temperature: t.foodDetails?.temperature || 'hot',
              pickupWindowExpires: 'Within 45 mins',
              destinationName: 'DUSIB Rain Basera (Night Shelter #18)',
              destinationAddress: 'Near Sarai Kale Khan ISBT Terminal',
              perishableTimerMinutes: 45,
            } : undefined,
            assignedWorkerId: t.assignedWorkerId,
            proofSubmission: t.proofSubmission ? {
              workerId: t.proofSubmission.workerId,
              workerName: 'Aarav Sharma',
              submittedAt: t.proofSubmission.submittedAt,
              notes: t.proofSubmission.notes,
              verifiedWeightKg: t.proofSubmission.verifiedWeightKg,
            } : undefined,
          }));
          setTasks(mappedTasks);
        }

        if (workerRes?.success && workerRes.data) {
          const w = workerRes.data;
          setWorker((prev) => ({
            ...prev,
            callsign: w.callsign || prev.callsign,
            activeStreakDays: w.activeStreakDays || prev.currentStreakDays,
            streakMultiplier: w.streakMultiplier || prev.streakMultiplier,
            totalTasksCompleted: w.totalTasksCompleted || prev.totalTasksCompleted,
            foodRescuedKg: w.totalFoodRescuedKg || prev.foodRescuedKg,
          }));
        }

        if (txnRes?.success && Array.isArray(txnRes.data)) {
          const mappedTxns: PayoutTransaction[] = txnRes.data.map((tx: any) => ({
            id: tx.id,
            date: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            taskTitle: tx.description,
            type: tx.type === 'STREAK_BONUS' ? 'streak_bonus' : 'civic_task',
            amount: tx.amountInr || tx.amount || 0,
            status: tx.status === 'CLEARED' ? 'cleared' : 'pending',
            paymentMode: 'UPI',
          }));
          setTransactions(mappedTxns);
        }
      } catch (err) {
        console.warn('Backend sync initializing with local state:', err);
      }
    }
    syncBackendData();
  }, []);

  // Handler: Claim task
  const handleClaimTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'claimed' } : t))
    );
    setWorker((prev) => ({
      ...prev,
      activeTaskId: taskId,
    }));
    setSelectedTaskId(taskId);
    showToast(`Claimed "${task.title}". State machine: PENDING -> ASSIGNED!`);

    try {
      await apiClient.claimTask(taskId, worker.id);
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handler: Submit proof
  const handleSubmitProof = async (
    taskId: string, 
    notes: string, 
    verifiedWeight?: number
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const streakBonus = Math.round(task.baseBounty * (worker.streakMultiplier - 1));
    const totalEarned = Math.round(task.baseBounty + streakBonus);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed',
              completedAt: 'Just now',
              proofSubmission: {
                workerId: worker.id,
                workerName: worker.name,
                submittedAt: 'Just now',
                notes: notes,
                verifiedWeightKg: verifiedWeight,
              },
            }
          : t
      )
    );

    setWorker((prev) => ({
      ...prev,
      pendingPayout: prev.pendingPayout + totalEarned,
      lifetimeEarnings: prev.lifetimeEarnings + totalEarned,
      totalTasksCompleted: prev.totalTasksCompleted + 1,
      tierProgress: Math.min(100, prev.tierProgress + 4),
      foodRescuedKg: verifiedWeight ? prev.foodRescuedKg + verifiedWeight : prev.foodRescuedKg,
      activeTaskId: null,
    }));

    const newTx: PayoutTransaction = {
      id: `TXN-${Math.floor(Math.random() * 900) + 100}`,
      date: 'Just now',
      taskTitle: task.title,
      type: task.type === 'food_rescue' ? 'food_rescue' : 'civic_task',
      amount: totalEarned,
      status: 'pending',
      paymentMode: 'UPI',
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`Proof submitted! +₹${totalEarned.toLocaleString('en-IN')} credited to Friday UPI ledger.`);

    try {
      await apiClient.submitProof(taskId, {
        workerId: worker.id,
        notes,
        verifiedWeightLbs: verifiedWeight,
      });
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handler: Approve proof (MCD CAD)
  const handleApproveProof = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
    );
    showToast(`MCD escrow released for ${task.title}. Field payout cleared to UPI.`);

    try {
      await apiClient.verifyTask(taskId);
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handler: Create task
  const handleCreateTask = async (newTaskPartial: Partial<CivicTask>) => {
    const newId = `TASK-${Math.floor(Math.random() * 800) + 200}`;
    const newTask: CivicTask = {
      id: newId,
      type: newTaskPartial.type || 'civic_repair',
      title: newTaskPartial.title || 'Emergency Civic Directive',
      description: newTaskPartial.description || 'Priority municipal order.',
      urgency: newTaskPartial.urgency || 'critical',
      status: 'open',
      district: newTaskPartial.district || 'Central Delhi (Connaught Place)',
      coordinates: newTaskPartial.coordinates || { x: 48, y: 44 },
      address: newTaskPartial.address || 'Central Delhi Sector',
      baseBounty: newTaskPartial.baseBounty || 800,
      estimatedMinutes: newTaskPartial.estimatedMinutes || 30,
      distanceKm: newTaskPartial.distanceKm || 2.1,
      maintenanceDetails: {
        infrastructureType: 'Emergency Public Safety Hazard',
        equipmentRequired: ['High-Vis Gear', 'Rapid Mitigation Kit'],
        reportedBy: 'MCD / NDMC Control Room Dispatch',
        hazardRating: 3,
      },
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newId);
    showToast(`Hazard bounty broadcasted to Delhi CAD!`);

    try {
      await apiClient.createTask({
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        district: newTask.district,
        baseBountyInr: newTask.baseBounty,
        urgency: newTask.urgency,
      });
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handler: Log donation
  const handleLogDonation = async (donationPartial: Partial<CivicTask>) => {
    const newId = `RESCUE-${Math.floor(Math.random() * 800) + 300}`;
    const newDonation: CivicTask = {
      id: newId,
      type: 'food_rescue',
      title: donationPartial.title || 'Surplus Fresh Food Batch',
      description: donationPartial.description || 'Surplus batch ready for immediate food shelter pickup.',
      foodCategory: donationPartial.foodCategory || 'cooked_meals',
      urgency: donationPartial.urgency || 'priority',
      status: 'open',
      district: donationPartial.district || 'South Delhi (Hauz Khas & Saket)',
      coordinates: donationPartial.coordinates || { x: 42, y: 58 },
      address: donationPartial.address || 'Silver Oak Farm Road, Chattarpur',
      baseBounty: donationPartial.baseBounty || 650,
      estimatedMinutes: donationPartial.estimatedMinutes || 30,
      distanceKm: donationPartial.distanceKm || 2.8,
      foodDetails: donationPartial.foodDetails,
    };

    setTasks((prev) => [newDonation, ...prev]);
    setSelectedTaskId(newId);
    showToast(`Surplus rescue pickup broadcasted to Delhi Annapurna Network!`);

    try {
      await apiClient.createFoodRescue({
        itemsSummary: newDonation.title,
        foodCategory: newDonation.foodCategory,
        estimatedWeightKg: newDonation.foodDetails?.weightKg || 35,
        temperatureRequired: newDonation.foodDetails?.temperature || 'hot',
        destinationShelterName: newDonation.foodDetails?.destinationName,
      });
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handler: Payout disbursement
  const handleDisbursePayout = async () => {
    if (worker.pendingPayout <= 0) return;

    const disbursedAmount = worker.pendingPayout;
    setWorker((prev) => ({
      ...prev,
      pendingPayout: 0,
    }));

    setTransactions((prev) =>
      prev.map((tx) => ({ ...tx, status: 'cleared' as const }))
    );

    showToast(`Weekly Payout Disbursed: ₹${disbursedAmount.toLocaleString('en-IN')} transferred to ${worker.upiId}.`);

    try {
      await apiClient.triggerPayout(worker.id);
    } catch (err) {
      console.warn('API sync fallback active:', err);
    }
  };

  // Handle Bottom Nav Tab clicks
  const handleBottomNavChange = (tab: NavigationTab) => {
    setNavTab(tab);
    if (tab === 'wallet') {
      setShowPayoutModal(true);
    } else if (tab === 'profile') {
      setShowProfileModal(true);
    } else if (tab === 'active') {
      if (worker.activeTaskId) {
        const currentActive = tasks.find((t) => t.id === worker.activeTaskId);
        if (currentActive) {
          setProofModalTask(currentActive);
        }
      } else {
        showToast('No active run currently claimed. Select a task on the map.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EBF5EE] text-[#09090B] selection:bg-[#4ADE80] selection:text-black">
      {/* Google Maps Platform Quota Notice Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-50">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              maps developer site
            </a>.
          </span>
        </div>
      )}

      {/* 1. Contextual Minimalist Header (Clean Wordmark & Dynamic Shell Switcher) */}
      <Header
        activeRole={activeRole}
        onSelectRole={(role) => {
          setActiveRole(role);
          setNavTab('map');
        }}
        worker={worker}
        onOpenPayoutModal={() => setShowPayoutModal(true)}
        onOpenApiExplorer={() => setShowApiModal(true)}
      />

      {/* 2. Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#09090B] text-[#4ADE80] border-2 border-black px-4 py-2.5 rounded-full shadow-[4px_4px_0px_#000] text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FACC15]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Role-Specific Dynamic Shells (Contextual Minimalism) */}
      <main className="flex-1 w-full relative">
        {/* Maintenance Worker & Food Rescue Courier Views */}
        {(activeRole === 'worker' || activeRole === 'courier') && (
          <WorkerFullShell
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onClaimTask={handleClaimTask}
            onOpenProofModal={(task) => setProofModalTask(task)}
            worker={worker}
            activeRole={activeRole}
            onToggleRole={(role) => setActiveRole(role)}
            onNotifyToast={showToast}
          />
        )}

        {/* Commercial Food Donor View: Hyper-minimalist one-tap dashboard */}
        {activeRole === 'donor' && (
          <div className="pb-28">
            <DonorMinimalView
              tasks={tasks}
              onLogDonation={handleLogDonation}
              worker={worker}
            />
          </div>
        )}

        {/* Municipal Operations Console (MCD CAD) */}
        {activeRole === 'dispatch' && (
          <div className="max-w-7xl mx-auto px-4 py-6 pb-28">
            <DispatchConsole
              tasks={tasks}
              onApproveProof={handleApproveProof}
              onCreateTask={handleCreateTask}
              worker={worker}
            />
          </div>
        )}
      </main>

      {/* 4. Streamlined 4-Tab Floating Bottom Navigation Bar (Thumb-Friendly Pill) */}
      <StreamlinedBottomNav
        activeTab={navTab}
        onChangeTab={handleBottomNavChange}
        worker={worker}
        hasActiveTask={!!worker.activeTaskId}
      />

      {/* 5. Progressive Disclosure Modals */}
      {proofModalTask && (
        <ProofSubmissionModal
          task={proofModalTask}
          worker={worker}
          onClose={() => setProofModalTask(null)}
          onSubmitProof={handleSubmitProof}
        />
      )}

      {showPayoutModal && (
        <PayoutModal
          worker={worker}
          transactions={transactions}
          onClose={() => setShowPayoutModal(false)}
          onDisbursePayout={handleDisbursePayout}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          worker={worker}
          onClose={() => setShowProfileModal(false)}
          onOpenPayout={() => {
            setShowProfileModal(false);
            setShowPayoutModal(true);
          }}
        />
      )}

      {showApiModal && (
        <ApiExplorerModal
          onClose={() => setShowApiModal(false)}
        />
      )}

      {/* 6. Tactical Lock Screen Overlay (Contextual Field Terminal) */}
      <LockScreen
        activeTask={tasks.find((t) => t.id === worker.activeTaskId) || null}
      />

      {/* 7. Firebase Auth & Role-Based Registration Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
