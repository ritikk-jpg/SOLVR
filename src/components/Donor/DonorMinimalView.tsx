import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  UtensilsCrossed, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Award, 
  Heart, 
  Sparkles,
  ArrowRight,
  X,
  Share2
} from 'lucide-react';

interface DonorMinimalViewProps {
  tasks: CivicTask[];
  onLogDonation: (donation: Partial<CivicTask>) => void;
  worker: WorkerProfile;
}

export const DonorMinimalView: React.FC<DonorMinimalViewProps> = ({
  tasks,
  onLogDonation,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedPickupId, setExpandedPickupId] = useState<string | null>(null);

  // Form state for scheduling
  const [itemsTitle, setItemsTitle] = useState('');
  const [weightKg, setWeightKg] = useState('35');
  const [foodType, setFoodType] = useState<'cooked_meals' | 'bakery' | 'mandi_produce' | 'mithai_dairy' | 'pantry_staples'>('cooked_meals');
  const [destinationShelter, setDestinationShelter] = useState('DUSIB Rain Basera (Night Shelter #18, Sarai Kale Khan)');
  const [pickupMins, setPickupMins] = useState('45');

  // Filter donor's food rescue tasks
  const foodRescues = tasks.filter((t) => t.type === 'food_rescue');
  const totalWeightKg = foodRescues.reduce((sum, t) => sum + (t.foodDetails?.weightKg || 30), 0);
  const totalMeals = totalWeightKg * 3;
  const taxValueInr = totalWeightKg * 180; // Estimated 80G fair market deduction value

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemsTitle) return;

    const parsedWeight = parseFloat(weightKg) || 30;
    const baseBounty = Math.max(500, Math.round(parsedWeight * 12 + 250));

    onLogDonation({
      type: 'food_rescue',
      title: itemsTitle,
      description: `${parsedWeight} kg surplus freshly prepared meals ready for courier pickup and dispatch to ${destinationShelter}.`,
      foodCategory: foodType,
      urgency: parseInt(pickupMins) <= 45 ? 'critical' : 'priority',
      district: 'South Delhi (Hauz Khas & Saket)',
      address: 'Silver Oak Farm Road, Chattarpur Mandir Lane',
      baseBounty,
      estimatedMinutes: 30,
      distanceKm: 2.8,
      coordinates: { x: 42, y: 58 },
      foodDetails: {
        donorName: 'Royal Dawat Banquets & Catering',
        donorType: 'Wedding & Event Caterer',
        weightKg: parsedWeight,
        temperature: 'hot',
        pickupWindowExpires: `Within ${pickupMins} mins`,
        destinationName: destinationShelter,
        destinationAddress: 'Near Sarai Kale Khan ISBT Terminal',
        perishableTimerMinutes: parseInt(pickupMins) || 45,
      },
      status: 'open',
    });

    setItemsTitle('');
    setShowScheduleModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* 1. Header & Identity: Calm, Contextual Minimalism */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-emerald-900 border-2 border-black/10 rounded-full text-xs font-extrabold mb-1 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span>Annapurna Donor Network · Delhi NCT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B] tracking-tight">
          Food Rescue Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
          Distribute surplus commercial meals to verified DUSIB night shelters across Delhi with complete chain-of-custody.
        </p>
      </div>

      {/* 2. Clean Impact Counter: Pure White Chunky Card with Generous Whitespace */}
      <div className="bg-white border-2 border-[#09090B] rounded-3xl p-5 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center divide-x divide-zinc-200">
          <div className="space-y-1 px-1 sm:px-2">
            <span className="text-2xl sm:text-4xl font-black text-[#09090B] tracking-tight block">
              {totalWeightKg}
              <span className="text-xs sm:text-sm font-bold text-zinc-500 ml-1">kg</span>
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-zinc-500 block uppercase tracking-wider">
              Food Rescued
            </span>
          </div>

          <div className="space-y-1 px-1 sm:px-2">
            <span className="text-2xl sm:text-4xl font-black text-[#22C55E] tracking-tight block">
              {totalMeals.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-zinc-500 block uppercase tracking-wider">
              Meals Saved
            </span>
          </div>

          <div className="space-y-1 px-1 sm:px-2">
            <span className="text-2xl sm:text-4xl font-black text-[#09090B] tracking-tight block font-mono">
              ₹{taxValueInr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-zinc-500 block uppercase tracking-wider">
              80G Tax Credit
            </span>
          </div>
        </div>
      </div>

      {/* 3. Hero One-Tap Primary Action: Floating Pill Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowScheduleModal(true)}
          className="w-full sm:w-auto px-8 py-4 bg-[#4ADE80] hover:bg-[#22C55E] text-[#09090B] font-black text-base rounded-full border-2 border-[#09090B] shadow-[4px_4px_0px_#09090B] hover:translate-y-0.5 transition-all flex items-center justify-center gap-3 min-h-[56px] active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Schedule Surplus Pickup</span>
        </button>
      </div>

      {/* 4. Recent Pickups & Progressive Disclosure Cards */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-zinc-600 px-1">
          <span>Active Pickups & Audit Receipts</span>
          <span className="bg-white px-2 py-0.5 rounded-full border border-black/10 text-zinc-800">
            {foodRescues.length} logged
          </span>
        </div>

        <div className="space-y-2.5">
          {foodRescues.map((rescue) => {
            const isExpanded = expandedPickupId === rescue.id;
            const weight = rescue.foodDetails?.weightKg || 35;
            const isCompleted = rescue.status === 'completed';

            return (
              <div
                key={rescue.id}
                onClick={() => setExpandedPickupId(isExpanded ? null : rescue.id)}
                className="bg-white border-2 border-[#09090B] rounded-3xl p-4 shadow-[2px_2px_0px_#09090B] cursor-pointer hover:border-zinc-800 transition-all"
              >
                {/* Summary Row (Zero Clutter) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-[#4ADE80]/30 text-emerald-950 border border-emerald-400'
                          : 'bg-[#FACC15] text-[#09090B] border border-black/10'
                      }`}>
                        {isCompleted ? 'Delivered & Certified' : 'Courier Dispatched'}
                      </span>
                      <span className="font-mono text-xs text-zinc-700 font-black">
                        {weight} kg
                      </span>
                      <span className="text-zinc-300">·</span>
                      <span className="text-xs text-zinc-500 truncate">
                        {rescue.district.split('(')[0]}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#09090B] truncate">
                      {rescue.title}
                    </h4>
                  </div>

                  <div className="shrink-0 text-zinc-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-black" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Progressive Disclosure (Tap to Expand Details) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-100 space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="space-y-1 text-zinc-700">
                      <p><strong>Destination:</strong> {rescue.foodDetails?.destinationName || 'DUSIB Rain Basera'}</p>
                      <p><strong>Pickup Address:</strong> {rescue.address}</p>
                      <p><strong>Courier Bounty:</strong> ₹{rescue.baseBounty} (Guaranteed Escrow)</p>
                    </div>

                    {isCompleted && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-950">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-700" />
                          <span>Section 80G Certificate: <strong>#80G-DEL-{rescue.id}</strong></span>
                        </div>
                        <span className="font-bold text-emerald-800 underline cursor-pointer">
                          View Receipt
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Minimal Schedule Surplus Pickup Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-[#09090B] rounded-3xl max-w-md w-full p-6 shadow-[6px_6px_0px_#09090B] space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4ADE80] border-2 border-black flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-[#09090B]" />
                </div>
                <h3 className="font-extrabold text-base text-[#09090B]">
                  Schedule Surplus Food Pickup
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-zinc-400 hover:text-black rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-zinc-800 block mb-1">
                  Surplus Food Description
                </label>
                <input
                  type="text"
                  required
                  value={itemsTitle}
                  onChange={(e) => setItemsTitle(e.target.value)}
                  placeholder="e.g. 150 Portions Dum Biryani & Dal Makhani"
                  className="w-full p-3 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-zinc-800 block mb-1">
                    Est. Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold font-mono focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-zinc-800 block mb-1">
                    Pickup Window
                  </label>
                  <select
                    value={pickupMins}
                    onChange={(e) => setPickupMins(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                  >
                    <option value="30">Within 30 mins (Urgent)</option>
                    <option value="45">Within 45 mins (Fresh)</option>
                    <option value="90">Within 90 mins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-zinc-800 block mb-1">
                  Food Category
                </label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value as any)}
                  className="w-full p-3 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                >
                  <option value="cooked_meals">Hot Cooked Meals (Banquets/Restaurants)</option>
                  <option value="bakery">Bakery & Breads</option>
                  <option value="mandi_produce">Azadpur Mandi Fruits & Veggies</option>
                  <option value="mithai_dairy">Mithai & Dairy Surplus</option>
                  <option value="pantry_staples">Pantry & Grains</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-zinc-800 block mb-1">
                  Designated Night Shelter
                </label>
                <select
                  value={destinationShelter}
                  onChange={(e) => setDestinationShelter(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:bg-white"
                >
                  <option value="DUSIB Rain Basera (Night Shelter #18, Sarai Kale Khan)">
                    DUSIB Rain Basera #18 (Sarai Kale Khan)
                  </option>
                  <option value="DUSIB Rain Basera (Yamuna Pushta Kashmere Gate)">
                    DUSIB Rain Basera (Yamuna Pushta, Kashmere Gate)
                  </option>
                  <option value="DUSIB Rain Basera (AIIMS Trauma Centre Colony)">
                    DUSIB Rain Basera (AIIMS Trauma Centre)
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4ADE80] hover:bg-[#22C55E] text-[#09090B] font-black text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_#09090B] transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-95"
                >
                  <span>Dispatch Volunteer Courier</span>
                  <ArrowRight className="w-4 h-4 text-[#09090B]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
