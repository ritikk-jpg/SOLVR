import React, { useState } from 'react';
import { CivicTask, WorkerProfile } from '../../types';
import { 
  Camera, 
  CheckCircle2, 
  Scale, 
  Flame, 
  AlertCircle, 
  UploadCloud, 
  Sparkles,
  X
} from 'lucide-react';

interface ProofSubmissionModalProps {
  task: CivicTask | null;
  worker: WorkerProfile;
  onClose: () => void;
  onSubmitProof: (taskId: string, notes: string, verifiedWeightKg?: number) => void;
}

export const ProofSubmissionModal: React.FC<ProofSubmissionModalProps> = ({
  task,
  worker,
  onClose,
  onSubmitProof,
}) => {
  if (!task) return null;

  const isFood = task.type === 'food_rescue';
  const [notes, setNotes] = useState(
    isFood
      ? 'Collected from banquet loading dock in thermal insulated containers. Delivered directly to DUSIB Rain Basera night shelter staff.'
      : 'Asphalt cold patch poured, compacted flush with road level using tamper. PWD reflective caution cones removed.'
  );
  const [photoUploaded, setPhotoUploaded] = useState(true);
  const [verifiedWeight, setVerifiedWeight] = useState(
    task.foodDetails?.weightKg ? task.foodDetails.weightKg.toString() : '35'
  );

  const streakBonus = Math.round(task.baseBounty * (worker.streakMultiplier - 1));
  const totalBounty = Math.round(task.baseBounty + streakBonus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProof(
      task.id,
      notes,
      isFood ? parseFloat(verifiedWeight) || undefined : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#09090B] rounded-2xl max-w-lg w-full p-5 shadow-[6px_6px_0px_#09090B] space-y-4 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4ADE80] border border-[#09090B] flex items-center justify-center text-[#09090B]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#09090B] leading-none">
                Submit Delhi Proof of Completion
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">
                {task.id} · {task.district}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border-2 border-[#09090B] flex items-center justify-center hover:bg-zinc-100 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="p-3 bg-[#FFFBEB] border-2 border-[#09090B] rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-xs text-[#09090B]">{task.title}</h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <span className="font-mono font-bold text-[#09090B]">
                Base: ₹{task.baseBounty}
              </span>
              <span className="text-amber-800 font-bold flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-600" />
                Streak Bonus: +₹{streakBonus}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">
              Total Payout
            </span>
            <span className="text-lg font-mono font-extrabold text-[#09090B]">
              ₹{totalBounty.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Proof Simulation */}
          <div>
            <label className="block text-xs font-extrabold text-[#09090B] mb-1.5 flex items-center justify-between">
              <span>Geo-Tagged Completion Photos (Delhi)</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                ✓ GPS Coordinates Verified
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Before Slot */}
              <div className="p-3 bg-zinc-50 border-2 border-[#09090B] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-zinc-600 block">
                  1. BEFORE STATE
                </span>
                <div className="h-20 bg-zinc-200 border border-zinc-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-zinc-600 p-1">
                  <Camera className="w-4 h-4 mb-1 text-zinc-500" />
                  <span>[Timestamped Delhi Site Log]</span>
                </div>
              </div>

              {/* After Slot */}
              <div className="p-3 bg-[#F0FDF4] border-2 border-[#09090B] rounded-xl text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-800 block">
                  2. RESTORED STATE
                </span>
                <div className="h-20 bg-emerald-100 border border-emerald-300 rounded-lg flex flex-col items-center justify-center text-[10px] text-emerald-900 p-1">
                  <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-700" />
                  <span>[Photo Verified ✓]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Food Scale Weight (if food rescue) */}
          {isFood && (
            <div>
              <label className="block text-xs font-extrabold text-[#09090B] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  Verified Food Weight (kg)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Kitchen scale ticket or crate manifest
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={verifiedWeight}
                onChange={(e) => setVerifiedWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold border-2 border-[#09090B] rounded-xl focus:outline-hidden"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-extrabold text-[#09090B] mb-1">
              Field Verification Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border-2 border-[#09090B] rounded-xl focus:outline-hidden"
              placeholder="Detail actions taken, equipment restored, or shelter drop-off signature..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4ADE80] text-[#09090B] text-xs font-extrabold rounded-xl neo-btn border-2 border-[#09090B] flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Complete & Claim ₹{totalBounty.toLocaleString('en-IN')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
