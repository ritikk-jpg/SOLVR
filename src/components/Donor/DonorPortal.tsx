import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  UtensilsCrossed, 
  PackagePlus, 
  Heart, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Scale, 
  Award,
  Download,
  Building,
  ArrowRight
} from 'lucide-react';

interface DonorPortalProps {
  tasks: CivicTask[];
  onLogDonation: (donationTask: Partial<CivicTask>) => void;
  worker: WorkerProfile;
}

export const DonorPortal: React.FC<DonorPortalProps> = ({
  tasks,
  onLogDonation,
  worker,
}) => {
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [donorName, setDonorName] = useState('Royal Dawat Banquets & Catering (Chattarpur)');
  const [itemsTitle, setItemsTitle] = useState('');
  const [foodType, setFoodType] = useState<'cooked_meals' | 'bakery' | 'mandi_produce' | 'mithai_dairy' | 'pantry_staples'>('cooked_meals');
  const [weightKg, setWeightKg] = useState('35');
  const [temperature, setTemperature] = useState<'ambient' | 'refrigerated' | 'hot'>('hot');
  const [deadlineMins, setDeadlineMins] = useState('45');
  const [destinationShelter, setDestinationShelter] = useState('DUSIB Rain Basera (Night Shelter #18, Sarai Kale Khan)');
  const [notes, setNotes] = useState('');
  const [showTaxReceipt, setShowTaxReceipt] = useState(false);

  // Filter tasks created as food rescues
  const foodRescueTasks = tasks.filter((t) => t.type === 'food_rescue');
  const activeRescues = foodRescueTasks.filter((t) => t.status === 'claimed' || t.status === 'in_progress');
  const openRescues = foodRescueTasks.filter((t) => t.status === 'open');
  const deliveredRescues = foodRescueTasks.filter((t) => t.status === 'completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemsTitle) return;

    const parsedWeight = parseFloat(weightKg) || 30;
    const baseBounty = Math.max(450, Math.round(parsedWeight * 12 + 250));

    onLogDonation({
      type: 'food_rescue',
      title: itemsTitle,
      description: notes || `${parsedWeight} kg surplus freshly prepared food packed in insulated containers ready for dispatch to ${destinationShelter}.`,
      foodCategory: foodType,
      urgency: parseInt(deadlineMins) <= 45 ? 'critical' : 'priority',
      district: 'South Delhi (Hauz Khas & Saket)',
      address: 'Silver Oak Farm Road, Chattarpur Mandir Lane',
      baseBounty,
      estimatedMinutes: 30,
      distanceKm: 2.8,
      coordinates: {
        x: Math.floor(Math.random() * 30) + 35,
        y: Math.floor(Math.random() * 30) + 40,
      },
      foodDetails: {
        donorName: donorName,
        donorType: 'Wedding & Banquet Caterer',
        weightKg: parsedWeight,
        temperature: temperature,
        pickupWindowExpires: `Within ${deadlineMins} mins`,
        destinationName: destinationShelter,
        destinationAddress: 'Near Sarai Kale Khan ISBT Terminal',
        perishableTimerMinutes: parseInt(deadlineMins) || 45,
      },
      status: 'open',
    });

    setItemsTitle('');
    setNotes('');
    setShowLogDrawer(false);
  };

  return (
    <div className="space-y-6">
      {/* Donor Banner */}
      <div className="bg-white border-2 border-[#09090B] rounded-2xl p-5 shadow-[4px_4px_0px_#09090B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-zinc-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4ADE80] text-[#09090B] flex items-center justify-center border-2 border-[#09090B]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#09090B] tracking-tight">
                  Delhi Food Rescue & Donor Portal (Annapurna Network)
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded border border-emerald-300">
                  FSSAI REGISTERED DONOR
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Surplus Food Rescue Coordination · DUSIB Rain Basera Shelters & Sec 80G Receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaxReceipt(true)}
              className="px-3 py-2 bg-white border-2 border-[#09090B] text-zinc-800 text-xs font-bold rounded-xl neo-btn flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-zinc-700" />
              <span>Section 80G Tax Ledger</span>
            </button>

            <button
              onClick={() => setShowLogDrawer(true)}
              className="px-4 py-2 bg-[#4ADE80] text-[#09090B] text-xs font-extrabold rounded-xl neo-btn flex items-center gap-2 border-2 border-[#09090B]"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Log Surplus Food Batch</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-[#FDF8EE] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Total Delhi Food Donated
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-[#09090B]">1,480 kg</span>
              <span className="text-[10px] font-bold text-emerald-700">~3,250 meals</span>
            </div>
          </div>

          <div className="p-3 bg-[#F0FDF4] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Active Rescue Runs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {activeRescues.length}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">In Transit</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFFBEB] border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Open Broadcasts
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-amber-700">
                {openRescues.length}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">Awaiting Worker</span>
            </div>
          </div>

          <div className="p-3 bg-white border-2 border-[#09090B] rounded-xl shadow-[2px_2px_0px_#09090B]">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block">
              Section 80G Value
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold font-mono text-[#09090B]">₹1,65,000</span>
              <span className="text-[10px] font-bold text-emerald-700">IT Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Food Rescue Broadcast Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#09090B] flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Surplus Food Rescue Manifests ({foodRescueTasks.length})</span>
            </h3>
            <span className="text-xs text-zinc-500 font-medium">
              Chain-of-custody tracking with temperature logging
            </span>
          </div>

          <div className="space-y-3">
            {foodRescueTasks.map((rescue) => (
              <div
                key={rescue.id}
                className="bg-white border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B]"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1">
                      <span className="font-bold text-[#09090B]">{rescue.district}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-zinc-800">{rescue.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-emerald-700">
                        {rescue.foodDetails?.weightKg || 35} kg
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-[#09090B]">
                      {rescue.title}
                    </h4>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
                      rescue.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : rescue.status === 'claimed'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    {rescue.status === 'completed'
                      ? 'Delivered to Shelter'
                      : rescue.status === 'claimed'
                      ? 'Courier En Route'
                      : 'Open for Claim'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 p-2.5 bg-[#FDF8EE] border border-[#09090B] rounded-xl text-xs">
                  <div>
                    <span className="text-zinc-500 font-mono text-[10px] block">PICKUP POINT</span>
                    <span className="font-bold text-[#09090B]">{rescue.foodDetails?.donorName}</span>
                    <p className="text-[11px] text-zinc-600 truncate">{rescue.address}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono text-[10px] block">DESTINATION SHELTER</span>
                    <span className="font-bold text-[#09090B]">{rescue.foodDetails?.destinationName}</span>
                    <p className="text-[11px] text-zinc-600 truncate">{rescue.foodDetails?.destinationAddress}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200 text-xs">
                  <div className="flex items-center gap-3 text-zinc-600">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                      {rescue.foodDetails?.temperature}
                    </span>
                    <span className="text-[#DC2626] font-bold">
                      {rescue.foodDetails?.pickupWindowExpires}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#09090B]">
                    Escrow Bounty: ₹{rescue.baseBounty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Donor Recognition & Impact Certificate */}
        <div className="space-y-4">
          <div className="bg-[#FFFBEB] border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <Award className="w-5 h-5 text-amber-700" />
              <h4 className="font-extrabold text-sm text-[#09090B]">
                Annapurna Hero Recognition
              </h4>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed">
              Your venue has diverted <strong>1,480 kg</strong> of banquet meals from landfills in Delhi, preventing ~1.9 tonnes of methane emissions.
            </p>
            <div className="p-3 bg-white border border-[#09090B] rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#09090B] block">Current Tier: Gold Donor</span>
                <span className="text-[11px] text-zinc-500">MCD Green Partner Rating</span>
              </div>
              <span className="text-2xl">🥇</span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#09090B] rounded-2xl p-4 shadow-[3px_3px_0px_#09090B] space-y-2.5">
            <h5 className="font-extrabold text-xs text-[#09090B] uppercase tracking-wider">
              Delhi Rescue Guidelines
            </h5>
            <ul className="text-xs text-zinc-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Hot gravies and biryanis must be packaged at &gt; 60°C.</li>
              <li>Only unserved banquet/kitchen items may be logged.</li>
              <li>DUSIB Rain Basera shelters receive deliveries until 23:30 IST.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Log Surplus Batch Modal */}
      {showLogDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-lg w-full p-5 shadow-[6px_6px_0px_#09090B] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="font-extrabold text-base text-[#09090B]">
                  Log Surplus Food for Rescue
                </h3>
              </div>
              <button
                onClick={() => setShowLogDrawer(false)}
                className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Surplus Food Batch Description
                </label>
                <input
                  type="text"
                  required
                  value={itemsTitle}
                  onChange={(e) => setItemsTitle(e.target.value)}
                  placeholder="e.g. 50 Servings Dal Makhani, Shahi Paneer & 80 Rotis"
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4ADE80]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Food Category
                  </label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] rounded-xl"
                  >
                    <option value="cooked_meals">Cooked Meals / Banquets</option>
                    <option value="bakery">Bakery & Breads</option>
                    <option value="mandi_produce">Fresh Mandi Produce</option>
                    <option value="mithai_dairy">Mithai & Dairy Items</option>
                    <option value="pantry_staples">Pantry Grains & Staples</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Estimated Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-[#09090B] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Temperature Requirements
                  </label>
                  <select
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] rounded-xl"
                  >
                    <option value="hot">Hot Insulated (&gt; 60°C)</option>
                    <option value="ambient">Ambient / Shelf Stable</option>
                    <option value="refrigerated">Keep Refrigerated (&lt; 4°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                    Pickup Window Deadline
                  </label>
                  <select
                    value={deadlineMins}
                    onChange={(e) => setDeadlineMins(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] rounded-xl"
                  >
                    <option value="45">Urgent: Within 45 mins</option>
                    <option value="60">Within 60 mins</option>
                    <option value="90">Within 90 mins</option>
                    <option value="120">Within 2 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Destination Partner Delhi Shelter / NGO
                </label>
                <select
                  value={destinationShelter}
                  onChange={(e) => setDestinationShelter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] rounded-xl"
                >
                  <option value="DUSIB Rain Basera (Night Shelter #18, Sarai Kale Khan)">
                    DUSIB Rain Basera (Night Shelter #18, Sarai Kale Khan)
                  </option>
                  <option value="Robin Hood Army Community Kitchen (Kalkaji)">
                    Robin Hood Army Community Kitchen (Kalkaji)
                  </option>
                  <option value="Delhi Langar Sewa Society Kitchen (Kashmiri Gate)">
                    Delhi Langar Sewa Society Kitchen (Kashmiri Gate)
                  </option>
                  <option value="Goonj Community Hub (Sarita Vihar)">
                    Goonj Community Hub (Sarita Vihar)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#09090B] mb-1">
                  Packaging / Pickup Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Loading dock 2, 4 aluminium containers packed, security gate clearance done."
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setShowLogDrawer(false)}
                  className="px-4 py-2 border-2 border-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4ADE80] text-[#09090B] text-xs font-extrabold rounded-xl neo-btn border-2 border-[#09090B]"
                >
                  Broadcast to Delhi Workers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Deduction Ledger Modal */}
      {showTaxReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-lg w-full p-5 shadow-[6px_6px_0px_#09090B] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#09090B]" />
                <h3 className="font-extrabold text-base text-[#09090B]">
                  Section 80G Food Donation Tax Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowTaxReceipt(false)}
                className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#FDF8EE] border-2 border-[#09090B] rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-zinc-300 pb-1">
                <span>DONOR ENTITY:</span>
                <span className="font-bold">Royal Dawat Banquets & Catering</span>
              </div>
              <div className="flex justify-between border-b border-zinc-300 pb-1">
                <span>GSTIN / PAN:</span>
                <span>07AAAAA1234A1Z5 / AABCR1234D</span>
              </div>
              <div className="flex justify-between border-b border-zinc-300 pb-1">
                <span>REGISTERED RECIPIENT:</span>
                <span>DUSIB Rain Basera / Robin Hood Army (80G Reg)</span>
              </div>
              <div className="flex justify-between border-b border-zinc-300 pb-1">
                <span>TOTAL DONATED WEIGHT:</span>
                <span className="font-bold text-[#09090B]">1,480 KG</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 text-[#09090B]">
                <span>INCOME TAX SEC 80G EXEMPTION:</span>
                <span>₹1,65,000 INR</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Receipt authenticated by electronic Delhi municipal audit hash. Compliant with FSSAI Surplus Food Regulations, 2019 and Indian Income Tax Act, Section 80G.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <button
                onClick={() => setShowTaxReceipt(false)}
                className="px-4 py-2 bg-[#09090B] text-white text-xs font-bold rounded-xl neo-btn"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
