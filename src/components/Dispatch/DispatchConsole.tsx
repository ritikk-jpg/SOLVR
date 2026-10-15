import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { DISTRICTS } from '../../data/initialData';
import { 
  Building2, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle, 
  PlusCircle, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  FileCheck, 
  ChevronRight, 
  TrendingUp, 
  X,
  Compass,
  Zap,
  Navigation
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface DispatchConsoleProps {
  tasks: CivicTask[];
  onApproveProof: (taskId: string) => void;
  onCreateTask: (newTask: Partial<CivicTask>) => void;
  worker: WorkerProfile;
}

export const DispatchConsole: React.FC<DispatchConsoleProps> = ({
  tasks,
  onApproveProof,
  onCreateTask,
  worker,
}) => {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDistrict, setBroadcastDistrict] = useState<string>(DISTRICTS[0]);
  const [broadcastBounty, setBroadcastBounty] = useState('850');
  const [broadcastType, setBroadcastType] = useState<'civic_repair' | 'food_rescue'>('civic_repair');
  const [broadcastDescription, setBroadcastDescription] = useState('');

  // Geospatial Dispatch Matching State (Google Maps Distance Matrix)
  const [selectedIncidentForMatch, setSelectedIncidentForMatch] = useState<string>('TASK-102');
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const runGeospatialMatching = async () => {
    setIsMatching(true);
    try {
      const res = await apiClient.matchWorkers({ taskId: selectedIncidentForMatch });
      if (res?.success && res.data?.rankedWorkers) {
        setMatchingResults(res.data.rankedWorkers);
      }
    } catch (err) {
      console.warn('Geospatial match error:', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Tasks awaiting proof review
  const pendingReviews = tasks.filter((t) => t.status === 'in_review');
  const openTasks = tasks.filter((t) => t.status === 'open');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle) return;

    onCreateTask({
      title: broadcastTitle,
      type: broadcastType,
      urgency: 'critical',
      district: broadcastDistrict,
      baseBounty: parseFloat(broadcastBounty) || 800,
      description: broadcastDescription || 'Immediate municipal dispatch order broadcasted by MCD / NDMC operations room.',
      address: `Priority Incident at ${broadcastDistrict}`,
      estimatedMinutes: 30,
      distanceKm: 2.1,
      coordinates: {
        x: Math.floor(Math.random() * 50) + 25,
        y: Math.floor(Math.random() * 50) + 25,
      },
      status: 'open',
    });

    setBroadcastTitle('');
    setBroadcastDescription('');
    setShowBroadcastModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Dispatch Operations Top Banner */}
      <div className="bg-white border-2 border-[#09090B] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#09090B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09090B] text-[#FACC15] flex items-center justify-center border-2 border-[#09090B]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#09090B] tracking-tight">
                  Delhi Municipal Operations Dispatch (MCD · NDMC)
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded border border-emerald-300">
                  LIVE CAD ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                PWD Infrastructure Remediation & Food Rescue Logistics Escrow (NCT of Delhi)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-[#DC2626] text-white text-xs font-extrabold rounded-xl neo-btn flex items-center gap-2 whitespace-nowrap"
          >
            <AlertOctagon className="w-4 h-4 text-white" />
            Broadcast Emergency Hazard Bounty
          </button>
        </div>

        {/* Operational Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-[#FDF8EE] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Active Delhi Field Units
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-[#09090B]">24 Units</span>
              <span className="text-[10px] font-bold text-emerald-700">94% on-time</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFFBEB] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Awaiting MCD Verification
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-amber-700">
                {pendingReviews.length}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">Proof staged</span>
            </div>
          </div>

          <div className="p-3 bg-[#F0FDF4] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Total Escrow Disbursed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-[#09090B]">₹1,84,500</span>
              <span className="text-[10px] font-bold text-emerald-700">Budget Safe</span>
            </div>
          </div>

          <div className="p-3 bg-white border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Avg Delhi SLA Time
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-[#09090B]">34 min</span>
              <span className="text-[10px] font-bold text-emerald-700">-62% vs Dept Avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Pending Proof Reviews & District Grid Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Verification Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#09090B]" />
              <h3 className="font-extrabold text-base text-[#09090B]">
                Proof-of-Work Verification Queue ({pendingReviews.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Review before/after evidence to release escrow via UPI
            </span>
          </div>

          {pendingReviews.length > 0 ? (
            <div className="space-y-3">
              {pendingReviews.map((task) => (
                <div
                  key={task.id}
                  className="bg-white border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B]"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1">
                        <span className="font-bold text-[#09090B]">{task.district}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-zinc-800">{task.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-800 font-bold">
                          Worker: {task.proofSubmission?.workerName || 'Aarav Sharma'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#09090B]">
                        {task.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-extrabold text-base text-[#09090B] block">
                        ₹{task.baseBounty.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">Escrow Locked</span>
                    </div>
                  </div>

                  {/* Proof Submission Details */}
                  {task.proofSubmission && (
                    <div className="my-3 p-3 bg-[#FDF8EE] border border-[#09090B] rounded-xl space-y-2">
                      <div className="text-xs text-zinc-700">
                        <span className="font-bold text-[#09090B]">Field Notes: </span>
                        {task.proofSubmission.notes}
                      </div>

                      {/* Photo Comparison Strip */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg border border-[#09090B] overflow-hidden bg-zinc-100">
                          <div className="text-[10px] font-mono font-bold p-1 bg-zinc-200 text-zinc-700">
                            BEFORE REMEDIATION
                          </div>
                          <div className="h-24 bg-zinc-300 flex items-center justify-center text-xs font-mono text-zinc-600">
                            [Photo: Initial Incident]
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#09090B] overflow-hidden bg-zinc-100">
                          <div className="text-[10px] font-mono font-bold p-1 bg-emerald-200 text-emerald-900">
                            AFTER REPAIR PROOF
                          </div>
                          <div className="h-24 bg-emerald-100 flex items-center justify-center text-xs font-mono text-emerald-800">
                            [Photo: Cleared & Restored]
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                    <button
                      onClick={() => onApproveProof(task.id)}
                      className="px-4 py-2 bg-[#4ADE80] text-[#09090B] text-xs font-extrabold rounded-xl neo-btn flex items-center gap-1.5 border-2 border-[#09090B]"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-950" />
                      Approve Proof & Release Escrow (₹{task.baseBounty.toLocaleString('en-IN')})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border-2 border-[#09090B] rounded-2xl shadow-[3px_3px_0px_#09090B]">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <h4 className="font-bold text-sm text-[#09090B]">Verification Queue Clear</h4>
              <p className="text-xs text-zinc-500 mt-1">
                All submitted proof-of-work evidence for Delhi NCT has been audited and approved.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (1 span): Geospatial Dispatch Engine & District Status */}
        <div className="space-y-4">
          {/* Geospatial Dispatch Engine (Distance Matrix) */}
          <div className="bg-white border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#09090B]" />
                <h4 className="font-extrabold text-sm text-[#09090B]">
                  Geospatial Match Engine
                </h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 border border-[#09090B] rounded font-bold">
                DISTANCE MATRIX
              </span>
            </div>

            <p className="text-xs text-zinc-600">
              Calculate closest field workers to a reported Delhi incident using Google Maps Distance Matrix.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Target Incident:
              </label>
              <select
                value={selectedIncidentForMatch}
                onChange={(e) => setSelectedIncidentForMatch(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold border-2 border-[#09090B] rounded-xl bg-[#FFFBEB]"
              >
                {openTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.title.slice(0, 36)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={runGeospatialMatching}
              disabled={isMatching}
              className="w-full py-2 bg-[#09090B] text-white text-xs font-bold rounded-xl neo-btn flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-[#FACC15]" />
              {isMatching ? 'Calculating Matrix...' : 'Dispatch Closest Delhi Unit'}
            </button>

            {matchingResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
                  Ranked Worker ETA Matches
                </span>
                {matchingResults.map((m, idx) => (
                  <div
                    key={m.workerId}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                      idx === 0
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-[#09090B]">
                        <span>{m.callsign}</span>
                        {idx === 0 && (
                          <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 rounded font-bold">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {m.currentDistrict} · ⭐ {m.reputation}
                      </span>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <span className="block text-emerald-700">{m.durationMinutes} min ETA</span>
                      <span className="text-[10px] text-zinc-500">{m.distanceKm || m.distanceMiles} km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Municipal Guidelines */}
          <div className="bg-[#FFFBEB] border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] text-xs space-y-1.5">
            <h5 className="font-extrabold text-sm text-[#09090B]">MCD / NDMC Regulatory Standards</h5>
            <p className="text-zinc-600 leading-relaxed">
              Civic maintenance bounties are held in bonded escrow until geo-tagged photo proof meets Municipal Corporation of Delhi (MCD) & PWD engineering guidelines. Food rescues must adhere to FSSAI hygiene standards.
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast Emergency Hazard Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-lg w-full p-5 shadow-[6px_6px_0px_#09090B] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-[#09090B]">
                  Broadcast Delhi Micro-Bounty
                </h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Incident Title / Directive
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Ring Road Pothole Hazard near AIIMS Flyover"
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Delhi District Sector
                  </label>
                  <select
                    value={broadcastDistrict}
                    onChange={(e) => setBroadcastDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] rounded-xl"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Bounty Escrow (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="3000"
                    step="50"
                    value={broadcastBounty}
                    onChange={(e) => setBroadcastBounty(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-[#09090B] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Operation Category
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastType('civic_repair')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border-2 border-[#09090B] ${
                      broadcastType === 'civic_repair'
                        ? 'bg-[#FACC15] text-[#09090B]'
                        : 'bg-white text-zinc-600'
                    }`}
                  >
                    Civic Infrastructure
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastType('food_rescue')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border-2 border-[#09090B] ${
                      broadcastType === 'food_rescue'
                        ? 'bg-[#4ADE80] text-[#09090B]'
                        : 'bg-white text-zinc-600'
                    }`}
                  >
                    Urgent Food Rescue
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Specific Instructions / Equipment
                </label>
                <textarea
                  rows={2}
                  value={broadcastDescription}
                  onChange={(e) => setBroadcastDescription(e.target.value)}
                  placeholder="Detail tools, caution flags or safety precautions..."
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 border-2 border-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#DC2626] text-white text-xs font-extrabold rounded-xl neo-btn"
                >
                  Broadcast Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
