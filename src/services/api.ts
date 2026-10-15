/**
 * SOLVR REST API Client
 * Connects frontend views to Express backend endpoints
 */

const API_BASE = '/api';

export const apiClient = {
  // Tasks
  async getTasks(params?: { status?: string; district?: string; type?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getTask(id: string) {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    return res.json();
  },

  async createTask(data: any) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async claimTask(id: string, workerId = 'WRK-42') {
    const res = await fetch(`${API_BASE}/tasks/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    return res.json();
  },

  async submitProof(id: string, proof: { workerId?: string; notes: string; verifiedWeightLbs?: number }) {
    const res = await fetch(`${API_BASE}/tasks/${id}/submit-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proof),
    });
    return res.json();
  },

  async verifyTask(id: string, dispatcherId = 'USR-DISPATCH') {
    const res = await fetch(`${API_BASE}/tasks/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispatcherId }),
    });
    return res.json();
  },

  // Food Rescues
  async getFoodRescues() {
    const res = await fetch(`${API_BASE}/food-rescues`);
    return res.json();
  },

  async createFoodRescue(data: any) {
    const res = await fetch(`${API_BASE}/food-rescues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async claimFoodRescue(id: string, workerId = 'WRK-42') {
    const res = await fetch(`${API_BASE}/food-rescues/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    return res.json();
  },

  async deliverFoodRescue(id: string, staffName?: string) {
    const res = await fetch(`${API_BASE}/food-rescues/${id}/deliver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffName }),
    });
    return res.json();
  },

  // Worker & Gamification
  async getWorker(id = 'WRK-42') {
    const res = await fetch(`${API_BASE}/workers/${id}`);
    return res.json();
  },

  async getGamification(id = 'WRK-42') {
    const res = await fetch(`${API_BASE}/workers/${id}/gamification`);
    return res.json();
  },

  // Wallets & Payouts
  async getWallet(id = 'WRK-42') {
    const res = await fetch(`${API_BASE}/wallets/${id}`);
    return res.json();
  },

  async getTransactions(id = 'WRK-42') {
    const res = await fetch(`${API_BASE}/wallets/${id}/transactions`);
    return res.json();
  },

  async triggerPayout(id = 'WRK-42') {
    const res = await fetch(`${API_BASE}/wallets/${id}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  // Municipal CAD
  async getMunicipalStats() {
    const res = await fetch(`${API_BASE}/municipal/stats`);
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/municipal/audit-logs`);
    return res.json();
  },

  // Geospatial Dispatch Engine (Google Maps API)
  async matchWorkers(params: { taskId?: string; coordinates?: { lat: number; lng: number } }) {
    const res = await fetch(`${API_BASE}/dispatch/match-workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async optimizeRoute(params: {
    origin: { latitude: number; longitude: number };
    destination: { latitude: number; longitude: number };
    intermediates?: Array<{ latitude: number; longitude: number }>;
  }) {
    const res = await fetch(`${API_BASE}/dispatch/route-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async verifyGeofence(params: { workerId: string; taskId: string; currentLat?: number; currentLng?: number }) {
    const res = await fetch(`${API_BASE}/dispatch/geofence-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getNearbyShelters(lat = 47.6062, lng = -122.3321) {
    const res = await fetch(`${API_BASE}/dispatch/shelters-nearby?lat=${lat}&lng=${lng}`);
    return res.json();
  },

  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
};
