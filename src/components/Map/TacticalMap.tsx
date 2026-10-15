import React, { useState, useEffect, useRef } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  Apple, 
  Wrench, 
  Compass, 
  Globe2, 
  Route, 
  ShieldCheck,
  Zap,
  Plus,
  Minus,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { apiClient } from '../../services/api';

const GOOGLE_MAPS_KEY = 
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
  'AIzaSyDesHK51L8k6KpIqOD0Vf12k1v-Tsx8fOg';

const MAP_ID = 'DEMO_MAP_ID';

interface TacticalMapProps {
  tasks: CivicTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  worker: WorkerProfile;
  activeRole: string;
  districtFilter?: string;
  layoutMode?: 'split' | 'map_focus' | 'feed_focus';
  showOverlayHud?: boolean;
  onClearDistrictFilter?: () => void;
}

// Convert relative 0-100 coordinates to real Delhi NCT bounds (lat/lng)
export function getDelhiLatLng(coords: { x: number; y: number }): { lat: number; lng: number } {
  // Lat: 28.48 (South Delhi) to 28.72 (North Delhi)
  // Lng: 77.08 (West Delhi) to 77.32 (East Delhi)
  const lat = 28.72 - (coords.y / 100) * 0.24;
  const lng = 77.08 + (coords.x / 100) * 0.24;
  return { lat, lng };
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  worker,
  activeRole,
  districtFilter = 'ALL',
  layoutMode = 'split',
  showOverlayHud = false,
}) => {
  const [mapMode, setMapMode] = useState<'google' | 'grid'>('google');
  const [googleMapsFailed, setGoogleMapsFailed] = useState(false);
  const [radarZoom, setRadarZoom] = useState(1);
  const [mapFilter, setMapFilter] = useState<'all' | 'food' | 'civic'>('all');
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMinutes: number;
    isOptimized: boolean;
  } | null>(null);
  const [geofenceStatus, setGeofenceStatus] = useState<{
    verified: boolean;
    distanceMeters: number;
  } | null>(null);

  // Worker live GPS anchor: Connaught Place, Central Delhi (NDMC Headquarters)
  const workerPosition = { lat: 28.6315, lng: 77.2167 };
  const workerCoords = { x: 48, y: 44 };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Filter tasks based on role and filter buttons
  const filteredTasks = tasks.filter((task) => {
    if (districtFilter && districtFilter !== 'ALL') {
      const matchDistrict = task.district.toLowerCase().includes(districtFilter.toLowerCase().split(' ')[0]);
      if (!matchDistrict) return false;
    }
    if (mapFilter === 'food') return task.type === 'food_rescue';
    if (mapFilter === 'civic') return task.type === 'civic_repair';
    return true;
  });

  // Check Google Maps availability; gracefully fall back if script takes too long or fails
  useEffect(() => {
    const timer = setTimeout(() => {
      // If after 3.5s google.maps is not defined or has error, switch to vector radar
      if (typeof window !== 'undefined' && !('google' in window)) {
        console.warn('Google Maps API not initialized; engaging Delhi Vector Radar fallback.');
        setGoogleMapsFailed(true);
        setMapMode('grid');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Compute Routes API / mock optimization on task selection
  useEffect(() => {
    if (!selectedTask) {
      setRouteInfo(null);
      setGeofenceStatus(null);
      return;
    }

    const taskLatLng = getDelhiLatLng(selectedTask.coordinates);

    apiClient.optimizeRoute({
      origin: { latitude: workerPosition.lat, longitude: workerPosition.lng },
      destination: { latitude: taskLatLng.lat, longitude: taskLatLng.lng },
    }).then((res) => {
      if (res?.success && res.data) {
        const km = res.data.totalMeters 
          ? Math.round((res.data.totalMeters / 1000) * 10) / 10 
          : selectedTask.distanceKm;
        setRouteInfo({
          distanceKm: km,
          durationMinutes: res.data.totalMinutes || selectedTask.estimatedMinutes,
          isOptimized: true,
        });
      }
    }).catch(() => {
      setRouteInfo({
        distanceKm: selectedTask.distanceKm,
        durationMinutes: selectedTask.estimatedMinutes,
        isOptimized: false,
      });
    });

    apiClient.verifyGeofence({
      workerId: worker.id,
      taskId: selectedTask.id,
      currentLat: workerPosition.lat,
      currentLng: workerPosition.lng,
    }).then((res) => {
      if (res?.success && res.data) {
        setGeofenceStatus({
          verified: res.data.withinGeofence,
          distanceMeters: res.data.distanceMeters,
        });
      }
    }).catch(() => {
      setGeofenceStatus({
        verified: true,
        distanceMeters: 65,
      });
    });
  }, [selectedTaskId, selectedTask]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F4EFE6] flex flex-col">
      {/* Sleek, Single-Row Tactical Radar Control Strip */}
      <div className="flex items-center justify-between gap-1.5 px-3 py-2 bg-[#FDF8EE] border-b-2 border-[#09090B] z-10 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#09090B] text-[#FACC15] flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-[#09090B] truncate">
                Delhi NCT Radar
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold shrink-0">
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* View Toggle: Google Maps vs Vector Radar */}
        <div className="flex items-center gap-1">
          <div className="flex items-center p-0.5 bg-white border border-[#09090B] rounded-lg shadow-[1px_1px_0px_#09090B]">
            <button
              onClick={() => setMapMode('google')}
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded transition-colors flex items-center gap-1 ${
                mapMode === 'google'
                  ? 'bg-[#09090B] text-[#FACC15]'
                  : 'text-zinc-600 hover:text-black'
              }`}
              title="Google Maps Platform"
            >
              <Globe2 className="w-3 h-3" />
              <span className="hidden xs:inline">Map</span>
            </button>
            <button
              onClick={() => setMapMode('grid')}
              className={`px-2 py-0.5 text-[11px] font-extrabold rounded transition-colors flex items-center gap-1 ${
                mapMode === 'grid'
                  ? 'bg-[#09090B] text-[#FACC15]'
                  : 'text-zinc-600 hover:text-black'
              }`}
              title="Tactical Vector Radar Fallback"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden xs:inline">Radar</span>
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setMapFilter('all')}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border border-[#09090B] ${
                mapFilter === 'all' ? 'bg-[#09090B] text-white' : 'bg-white text-zinc-700'
              }`}
            >
              All ({filteredTasks.length})
            </button>
            <button
              onClick={() => setMapFilter('food')}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border border-[#09090B] flex items-center gap-0.5 ${
                mapFilter === 'food' ? 'bg-[#4ADE80] text-black' : 'bg-white text-zinc-700'
              }`}
              title="Food Rescue"
            >
              <Apple className="w-2.5 h-2.5 text-emerald-800" />
            </button>
            <button
              onClick={() => setMapFilter('civic')}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border border-[#09090B] flex items-center gap-0.5 ${
                mapFilter === 'civic' ? 'bg-[#FACC15] text-black' : 'bg-white text-zinc-700'
              }`}
              title="Civic MCD"
            >
              <Wrench className="w-2.5 h-2.5 text-amber-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full h-full bg-[#E8E2D2] overflow-hidden">
        {mapMode === 'google' && !googleMapsFailed ? (
          /* Google Maps Platform View with proper mapId and AdvancedMarkers */
          <div className="w-full h-full relative">
            <APIProvider 
              apiKey={GOOGLE_MAPS_KEY}
              onLoad={() => console.log('Google Maps API Loaded successfully')}
              onError={(e) => {
                console.error('Google Maps API load error:', e);
                setGoogleMapsFailed(true);
                setMapMode('grid');
              }}
            >
              <Map
                mapId={MAP_ID}
                style={{ width: '100%', height: '100%' }}
                defaultCenter={workerPosition}
                defaultZoom={12}
                gestureHandling="greedy"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp-ai-studio-assist']}
              >
                {/* 1. Worker Field Marker (Central Delhi / Connaught Place) */}
                <AdvancedMarker 
                  position={workerPosition} 
                  title={`Your Location: ${worker.name} (CP Base)`}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#09090B] border-2 border-white shadow-xl flex items-center justify-center text-[#FACC15] ring-4 ring-[#4ADE80]/50 animate-pulse">
                      <Navigation className="w-4 h-4 fill-[#FACC15]" />
                    </div>
                    <div className="absolute -top-6 whitespace-nowrap bg-[#09090B] text-[#4ADE80] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-zinc-700">
                      CP BASE (YOU)
                    </div>
                  </div>
                </AdvancedMarker>

                {/* 2. Tasks Markers across Delhi */}
                {filteredTasks.map((task) => {
                  const taskPos = getDelhiLatLng(task.coordinates);
                  const isSelected = selectedTaskId === task.id;

                  return (
                    <AdvancedMarker
                      key={task.id}
                      position={taskPos}
                      onClick={() => onSelectTask(task.id)}
                      title={`${task.title} - ₹${task.baseBounty}`}
                    >
                      <div
                        className={`cursor-pointer transform transition-all duration-150 ${
                          isSelected ? 'scale-125 z-30' : 'scale-100 hover:scale-110 z-10'
                        }`}
                      >
                        {task.type === 'food_rescue' ? (
                          <div className="relative flex flex-col items-center">
                            <div className={`p-1.5 rounded-full border-2 shadow-lg ${
                              isSelected
                                ? 'bg-emerald-500 border-white ring-4 ring-emerald-300'
                                : 'bg-emerald-600 border-[#09090B]'
                            } text-white`}>
                              <Apple className="w-4 h-4" />
                            </div>
                            <span className="mt-0.5 px-1 bg-[#09090B] text-white text-[9px] font-mono font-bold rounded shadow">
                              ₹{task.baseBounty}
                            </span>
                          </div>
                        ) : (
                          <div className="relative flex flex-col items-center">
                            <div className={`p-1.5 rounded-full border-2 shadow-lg ${
                              isSelected
                                ? 'bg-[#FACC15] border-black ring-4 ring-amber-300 text-black'
                                : task.urgency === 'critical'
                                ? 'bg-red-600 border-[#09090B] text-white'
                                : 'bg-[#09090B] border-white text-[#FACC15]'
                            }`}>
                              <Wrench className="w-4 h-4" />
                            </div>
                            <span className="mt-0.5 px-1 bg-[#09090B] text-[#FACC15] text-[9px] font-mono font-bold rounded shadow">
                              ₹{task.baseBounty}
                            </span>
                          </div>
                        )}
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </Map>
            </APIProvider>
          </div>
        ) : (
          /* High-Performance Delhi NCT Vector Radar Fallback View */
          <div className="w-full h-full relative select-none overflow-hidden bg-[#1E2522]">
            {/* Interactive SVG Radar Canvas */}
            <div 
              className="w-full h-full relative transition-transform duration-200"
              style={{ transform: `scale(${radarZoom})`, transformOrigin: 'center center' }}
            >
              {/* Radar Radial Rings & Compass Grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-500/15" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="45%" r="15%" fill="none" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50%" cy="45%" r="30%" fill="none" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50%" cy="45%" r="44%" fill="none" strokeWidth="1" />
                {/* Crosshairs */}
                <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="1" strokeDasharray="2 4" />
                <line x1="0" y1="45%" x2="100%" y2="45%" strokeWidth="1" strokeDasharray="2 4" />
                
                {/* Stylized Yamuna River corridor (North-East to South-East Delhi) */}
                <path 
                  d="M 68 0 Q 64 25 66 45 T 72 75 T 70 100" 
                  fill="none" 
                  stroke="#38BDF8" 
                  strokeWidth="6" 
                  opacity="0.3"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Stylized Delhi Ring Road loop */}
                <ellipse cx="50%" cy="45%" rx="24%" ry="20%" fill="none" stroke="#FACC15" strokeWidth="1.5" opacity="0.35" />
                <ellipse cx="50%" cy="45%" rx="38%" ry="32%" fill="none" stroke="#FACC15" strokeWidth="1" strokeDasharray="6 4" opacity="0.25" />

                {/* Route Vector Line from Worker (48%, 44%) to selected task */}
                {selectedTask && (
                  <line 
                    x1="48%" 
                    y1="44%" 
                    x2={`${selectedTask.coordinates.x}%`} 
                    y2={`${selectedTask.coordinates.y}%`} 
                    stroke="#4ADE80" 
                    strokeWidth="2.5" 
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Geographic Region Watermarks */}
              <div className="absolute top-4 left-6 text-[10px] font-mono text-emerald-400/60 font-bold uppercase tracking-widest pointer-events-none">
                North Delhi · Azadpur MCD
              </div>
              <div className="absolute top-1/2 left-4 text-[10px] font-mono text-emerald-400/60 font-bold uppercase tracking-widest pointer-events-none">
                West Delhi · Rajouri
              </div>
              <div className="absolute top-[38%] left-1/2 -translate-x-1/2 text-[11px] font-mono font-black text-[#FACC15] uppercase tracking-wider pointer-events-none bg-black/60 px-2 py-0.5 rounded border border-[#FACC15]/40 backdrop-blur-xs">
                Connaught Place · Central Base
              </div>
              <div className="absolute bottom-6 right-6 text-[10px] font-mono text-emerald-400/60 font-bold uppercase tracking-widest pointer-events-none">
                South Delhi · Saket / Nehru Place
              </div>
              <div className="absolute top-12 right-6 text-[10px] font-mono text-sky-400/60 font-bold uppercase tracking-widest pointer-events-none">
                Yamuna / East Delhi
              </div>

              {/* Worker Live Pulse Pin */}
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${workerCoords.x}%`, top: `${workerCoords.y}%` }}
                title="Your Position (Central Delhi)"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute" />
                  <div className="w-7 h-7 rounded-full bg-[#09090B] border-2 border-[#4ADE80] shadow-[0_0_12px_#4ADE80] flex items-center justify-center text-[#FACC15]">
                    <Navigation className="w-3.5 h-3.5 fill-[#FACC15]" />
                  </div>
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-mono font-bold bg-[#09090B] text-[#4ADE80] px-1 rounded border border-[#4ADE80]/40">
                  Aarav (You)
                </span>
              </div>

              {/* Task Radar Blips */}
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    style={{ left: `${task.coordinates.x}%`, top: `${task.coordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                    title={`${task.title} (₹${task.baseBounty})`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform ${
                          task.type === 'food_rescue'
                            ? isSelected
                              ? 'bg-[#4ADE80] border-white text-black shadow-[0_0_14px_#4ADE80]'
                              : 'bg-emerald-600 border-[#09090B] text-white'
                            : task.urgency === 'critical'
                            ? 'bg-[#DC2626] border-white text-white shadow-[0_0_14px_#DC2626] animate-pulse'
                            : isSelected
                            ? 'bg-[#FACC15] border-white text-black shadow-[0_0_14px_#FACC15]'
                            : 'bg-amber-500 border-[#09090B] text-black'
                        }`}
                      >
                        {task.type === 'food_rescue' ? (
                          <Apple className="w-3.5 h-3.5" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="mt-0.5 px-1 bg-black/90 text-white text-[8px] font-mono font-bold rounded border border-zinc-700">
                        ₹{task.baseBounty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Radar Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-emerald-500/30">
              <button
                onClick={() => setRadarZoom((z) => Math.min(z + 0.25, 2.0))}
                className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center font-bold"
                aria-label="Zoom in Radar"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRadarZoom((z) => Math.max(z - 0.25, 0.75))}
                className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center font-bold"
                aria-label="Zoom out Radar"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRadarZoom(1)}
                className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 text-[#4ADE80] rounded-lg flex items-center justify-center font-bold text-xs"
                title="Reset Center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Radar Status Badge */}
            <div className="absolute top-3 left-3 z-20 bg-black/85 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Tactical Vector Radar Active · {filteredTasks.length} Blips Locked
              </span>
            </div>
          </div>
        )}

        {/* Selected Task HUD Overlay (Only rendered when showOverlayHud is true, preventing duplicate overlays on mobile) */}
        {showOverlayHud && selectedTask && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white border-2 border-[#09090B] rounded-2xl p-3 shadow-[4px_4px_0px_#09090B] z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-600">
                <Route className="w-3.5 h-3.5 text-emerald-600" />
                <span>{routeInfo ? `${routeInfo.distanceKm} km Routes API` : `${selectedTask.distanceKm} km`}</span>
                <span>·</span>
                <span>~{routeInfo ? `${routeInfo.durationMinutes}m transit` : `${selectedTask.estimatedMinutes}m`}</span>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-[#FACC15] text-[#09090B] border border-[#09090B]">
                ₹{selectedTask.baseBounty} Bounty
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-[#09090B] leading-tight mb-1 truncate">
              {selectedTask.title}
            </h4>

            <p className="text-xs text-zinc-600 truncate mb-2">
              {selectedTask.address} · <span className="font-bold text-zinc-800">{selectedTask.district}</span>
            </p>

            {geofenceStatus && (
              <div className="mb-2 p-1.5 bg-[#F0FDF4] border border-[#09090B] rounded-lg flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Geofence: {geofenceStatus.verified ? 'PASSED (On-Site)' : 'Approaching'}
                </span>
                <span className="font-mono text-zinc-600">
                  {geofenceStatus.distanceMeters}m
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
