import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  Cpu, 
  Layers, 
  Send, 
  CheckCircle, 
  Clock, 
  FileCode, 
  ShieldAlert, 
  X, 
  RefreshCw 
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface ApiExplorerModalProps {
  onClose: () => void;
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schema' | 'statemachine' | 'audit'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/tasks');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const endpoints = [
    { method: 'GET', path: '/api/tasks', desc: 'List Delhi civic tasks with geospatial & status filters' },
    { method: 'POST', path: '/api/dispatch/match-workers', desc: 'Google Maps Distance Matrix: match closest workers to Delhi task', body: { taskId: 'TASK-102' } },
    { method: 'POST', path: '/api/dispatch/route-optimize', desc: 'Google Maps Routes API: multi-stop Delhi route calculation', body: { origin: { latitude: 28.6139, longitude: 77.2090 }, destination: { latitude: 28.502, longitude: 77.185 }, intermediates: [{ latitude: 28.586, longitude: 77.242 }] } },
    { method: 'POST', path: '/api/dispatch/geofence-verify', desc: 'GPS Geofencing: on-site physical proof verification in Delhi', body: { workerId: 'DL-SOLV-42', taskId: 'TASK-102', currentLat: 28.586, currentLng: 77.242 } },
    { method: 'GET', path: '/api/dispatch/shelters-nearby', desc: 'Google Places API: nearby DUSIB Rain Basera & food shelters in Delhi' },
    { method: 'GET', path: '/api/food-rescues', desc: 'List surplus food batches with FSSAI & Section 80G tracking' },
    { method: 'GET', path: '/api/workers/DL-SOLV-42', desc: 'Delhi worker profile, UPI ID & active streak' },
    { method: 'GET', path: '/api/workers/DL-SOLV-42/gamification', desc: 'Streak multiplier engine & milestone badges (Dilli Blaze)' },
    { method: 'GET', path: '/api/wallets/DL-SOLV-42', desc: 'Digital UPI wallet balance & pending cycle in INR' },
    { method: 'GET', path: '/api/wallets/DL-SOLV-42/transactions', desc: 'UPI ledger audit trail with itemized transactions' },
    { method: 'GET', path: '/api/municipal/stats', desc: 'MCD/NDMC live CAD municipal resilience metrics & escrow' },
    { method: 'GET', path: '/api/municipal/audit-logs', desc: 'System-wide compliance & state change audit trail' },
    { method: 'GET', path: '/api/health', desc: 'Module health diagnostics & engine status' },
  ];

  const handleExecuteRequest = async (ep: { method: string; path: string; body?: any }) => {
    setSelectedEndpoint(ep.path);
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(ep.path, {
        method: ep.method,
        headers: ep.body ? { 'Content-Type': 'application/json' } : undefined,
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      const data = await res.json();
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse(data);
    } catch (err: any) {
      setLatencyMs(Math.round(performance.now() - start));
      setApiResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-[8px_8px_0px_#09090B] space-y-4 animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09090B] text-[#FACC15] flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#09090B] leading-none">
                  Delhi Backend Architecture & REST API Console
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded border border-emerald-300">
                  EXPRESS REST CORE · NCT DELHI
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Inspect live operational endpoints, MCD/NDMC schemas, and UPI escrow state machines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 border-2 border-[#09090B] rounded-xl overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'endpoints'
                ? 'bg-[#09090B] text-white'
                : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Interactive REST Client</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'bg-[#09090B] text-white'
                : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL & Document Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('statemachine')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'statemachine'
                ? 'bg-[#09090B] text-white'
                : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Task State Machine & Escrow</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-[#09090B] text-white'
                : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Live Audit Trail Ledger</span>
          </button>
        </div>

        {/* Tab 1: Interactive REST Client */}
        {activeTab === 'endpoints' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden min-h-0">
            {/* Endpoints Menu */}
            <div className="space-y-2 overflow-y-auto pr-1">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
                Available REST Endpoints ({endpoints.length})
              </span>
              <div className="space-y-1.5">
                {endpoints.map((ep) => (
                  <button
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => handleExecuteRequest(ep)}
                    className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-start gap-2 text-xs ${
                      selectedEndpoint === ep.path
                        ? 'border-[#09090B] bg-[#FFFBEB] shadow-[2px_2px_0px_#09090B]'
                        : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <span
                      className={`font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono font-bold text-[#09090B] block truncate">
                        {ep.path}
                      </span>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {ep.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Output Inspector */}
            <div className="flex flex-col h-full bg-[#09090B] text-zinc-200 rounded-xl p-3 border-2 border-[#09090B] overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-zinc-300">
                    {selectedEndpoint}
                  </span>
                </div>
                {latencyMs !== null && (
                  <span className="text-[10px] font-mono bg-zinc-800 text-emerald-400 px-1.5 py-0.5 rounded">
                    {latencyMs}ms latency
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto font-mono text-[11px] leading-relaxed p-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-zinc-500 gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FACC15]" />
                    <span>Executing Express Route Handler...</span>
                  </div>
                ) : apiResponse ? (
                  <pre className="text-emerald-400 whitespace-pre-wrap">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center p-4">
                    <Send className="w-6 h-6 mb-2 text-zinc-700" />
                    <span>Click any REST route on the left to fire a live query against the running Express backend.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PostgreSQL / Doc Schema */}
        {activeTab === 'schema' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <div className="p-4 bg-[#FDF8EE] border-2 border-[#09090B] rounded-xl space-y-2">
              <h4 className="font-extrabold text-sm text-[#09090B] flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                Relational & Document Entities for Delhi NCT
              </h4>
              <p className="text-zinc-600">
                SQL table definitions with foreign keys and index strategies for high-frequency civic CAD dispatches and food rescue routes.
              </p>
            </div>

            <div className="space-y-3 font-mono">
              <div className="p-3 bg-zinc-900 text-zinc-200 rounded-xl border border-zinc-800 text-[11px]">
                <div className="text-[#FACC15] font-bold mb-1">TABLE civic_tasks (MCD / NDMC / PWD):</div>
                <div className="text-zinc-400">
                  id UUID PRIMARY KEY,<br />
                  type VARCHAR(32) NOT NULL, -- 'civic_repair' | 'food_rescue'<br />
                  title VARCHAR(255) NOT NULL,<br />
                  civic_category VARCHAR(64), -- 'pothole', 'storm_drain', 'waste_dhalao'<br />
                  urgency VARCHAR(32) DEFAULT 'normal',<br />
                  status VARCHAR(32) DEFAULT 'PENDING',<br />
                  district VARCHAR(64) NOT NULL, -- Delhi NCT Districts<br />
                  latitude NUMERIC(9,6) NOT NULL, longitude NUMERIC(9,6) NOT NULL,<br />
                  base_bounty_inr NUMERIC(10,2) NOT NULL, -- in INR (₹)<br />
                  assigned_worker_id UUID REFERENCES workers(id),<br />
                  escrow_status VARCHAR(32) DEFAULT 'BONDED'<br />
                </div>
              </div>

              <div className="p-3 bg-zinc-900 text-zinc-200 rounded-xl border border-zinc-800 text-[11px]">
                <div className="text-[#4ADE80] font-bold mb-1">TABLE workers (Delhi Gig Workforce & UPI Rails):</div>
                <div className="text-zinc-400">
                  id UUID PRIMARY KEY,<br />
                  user_id UUID REFERENCES users(id),<br />
                  callsign VARCHAR(32) UNIQUE, -- e.g. DL-SOLV-42<br />
                  upi_id VARCHAR(128) NOT NULL, -- e.g. aarav.sharma@okhdfcbank<br />
                  tier VARCHAR(32) DEFAULT 'cadet', -- cadet | guardian | coordinator<br />
                  reputation_rating NUMERIC(3,2) DEFAULT 5.00,<br />
                  active_streak_days INT DEFAULT 0,<br />
                  streak_multiplier NUMERIC(3,2) DEFAULT 1.00,<br />
                  total_tasks_completed INT DEFAULT 0,<br />
                  total_food_rescued_kg NUMERIC(10,2) DEFAULT 0.00<br />
                </div>
              </div>

              <div className="p-3 bg-zinc-900 text-zinc-200 rounded-xl border border-zinc-800 text-[11px]">
                <div className="text-sky-400 font-bold mb-1">TABLE food_rescues & tax_certificates (FSSAI & Sec 80G):</div>
                <div className="text-zinc-400">
                  id UUID PRIMARY KEY,<br />
                  donor_name VARCHAR(255) NOT NULL,<br />
                  food_category VARCHAR(64) NOT NULL,<br />
                  weight_kg NUMERIC(8,2) NOT NULL,<br />
                  destination_shelter VARCHAR(255) NOT NULL, -- DUSIB Rain Basera #18<br />
                  status VARCHAR(32) DEFAULT 'AVAILABLE',<br />
                  tax_certificate_id VARCHAR(128) -- Section 80G deduction token<br />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: State Machine Diagram */}
        {activeTab === 'statemachine' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <div className="p-4 bg-[#FFFBEB] border-2 border-[#09090B] rounded-xl space-y-2">
              <h4 className="font-extrabold text-sm text-[#09090B] flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Deterministic State Machine Engine
              </h4>
              <p className="text-zinc-600">
                Guarantees zero double-claims, bonded escrow holds before task dispatch, and strict photo proof & geofence validation before payout release.
              </p>
            </div>

            <div className="p-4 bg-white border-2 border-[#09090B] rounded-xl space-y-3 font-mono">
              <div className="text-xs font-bold text-[#09090B] pb-2 border-b border-zinc-200">
                TASK LIFECYCLE TRANSITION GRAPH
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs">
                <div className="p-2.5 bg-zinc-100 border border-[#09090B] rounded-lg w-full">
                  <span className="font-bold text-[#09090B]">1. PENDING</span>
                  <span className="text-[10px] text-zinc-500 block">Escrow Bonded</span>
                </div>
                <span className="text-zinc-400">→</span>
                <div className="p-2.5 bg-amber-100 border border-[#09090B] rounded-lg w-full">
                  <span className="font-bold text-amber-900">2. ASSIGNED</span>
                  <span className="text-[10px] text-zinc-500 block">Worker Locked</span>
                </div>
                <span className="text-zinc-400">→</span>
                <div className="p-2.5 bg-blue-100 border border-[#09090B] rounded-lg w-full">
                  <span className="font-bold text-blue-900">3. IN_PROGRESS</span>
                  <span className="text-[10px] text-zinc-500 block">On-Site Geofenced</span>
                </div>
                <span className="text-zinc-400">→</span>
                <div className="p-2.5 bg-purple-100 border border-[#09090B] rounded-lg w-full">
                  <span className="font-bold text-purple-900">4. SUBMITTED</span>
                  <span className="text-[10px] text-zinc-500 block">Photo Proof Uploaded</span>
                </div>
                <span className="text-zinc-400">→</span>
                <div className="p-2.5 bg-emerald-100 border border-[#09090B] rounded-lg w-full">
                  <span className="font-bold text-emerald-900">5. VERIFIED</span>
                  <span className="text-[10px] text-zinc-500 block">UPI Escrow Disbursed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="p-3 bg-[#FDF8EE] border-2 border-[#09090B] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[#09090B]">
                MCD/NDMC Municipal Compliance & Audit Trail Ledger
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                IMMUTABLE HASH LOG
              </span>
            </div>

            <div className="border-2 border-[#09090B] rounded-xl overflow-hidden bg-white divide-y divide-zinc-200 font-mono text-[11px]">
              <div className="p-2.5 bg-zinc-50 flex justify-between font-bold text-zinc-700">
                <span>EVENT / ACTION</span>
                <span>ENTITY / ACTOR</span>
                <span>STATUS</span>
              </div>
              <div className="p-2.5 flex justify-between items-center hover:bg-zinc-50">
                <div>
                  <span className="font-bold text-[#09090B]">TASK_CREATED (Monsoon Nala Clearance)</span>
                  <span className="text-zinc-500 block text-[10px]">TASK-102 · Jangpura Barapullah</span>
                </div>
                <span className="text-zinc-600">PWD_DELHI_CAD</span>
                <span className="text-emerald-700 font-bold">ESCROW_BONDED</span>
              </div>
              <div className="p-2.5 flex justify-between items-center hover:bg-zinc-50">
                <div>
                  <span className="font-bold text-[#09090B]">GEOFENCE_CHECK_PASSED</span>
                  <span className="text-zinc-500 block text-[10px]">DL-SOLV-42 within 65m of site</span>
                </div>
                <span className="text-zinc-600">GOOGLE_ROUTES_V2</span>
                <span className="text-emerald-700 font-bold">VERIFIED_GPS</span>
              </div>
              <div className="p-2.5 flex justify-between items-center hover:bg-zinc-50">
                <div>
                  <span className="font-bold text-[#09090B]">FOOD_RESCUE_DELIVERY_CONFIRMED</span>
                  <span className="text-zinc-500 block text-[10px]">45 kg Biryani delivered to DUSIB #18</span>
                </div>
                <span className="text-zinc-600">SHELTER_STAFF</span>
                <span className="text-emerald-700 font-bold">SEC_80G_ISSUED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
