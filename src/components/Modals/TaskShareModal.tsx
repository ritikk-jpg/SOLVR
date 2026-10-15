import React, { useState } from 'react';
import { CivicTask } from '../../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Send, 
  ExternalLink,
  MapPin,
  UtensilsCrossed,
  Wrench,
  Smartphone
} from 'lucide-react';

interface TaskShareModalProps {
  task: CivicTask;
  onClose: () => void;
  onNotifyToast?: (msg: string) => void;
}

export const TaskShareModal: React.FC<TaskShareModalProps> = ({
  task,
  onClose,
  onNotifyToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate shareable URL and formatted message
  const shareUrl = `${window.location.origin}${window.location.pathname}?task=${encodeURIComponent(task.id)}`;
  
  const isFoodRescue = task.type === 'food_rescue';
  const roleLabel = isFoodRescue ? 'Surplus Food Rescue' : 'Civic Repair Run';
  const bountyText = `₹${task.baseBounty.toLocaleString('en-IN')}`;
  
  const shareMessage = [
    `🚨 SOLVR Delhi: ${roleLabel} Needed!`,
    `📍 ${task.title}`,
    `📌 Location: ${task.address} (${task.district})`,
    `💰 Bounty: ${bountyText} | Est. ${task.estimatedMinutes} mins (${task.distanceKm} km)`,
    isFoodRescue && task.foodDetails
      ? `🍱 Details: ${task.foodDetails.weightKg} kg fresh surplus → Deliver to ${task.foodDetails.destinationName}`
      : null,
    ``,
    `Claim or rally volunteers on SOLVR:`,
    shareUrl,
  ]
    .filter(Boolean)
    .join('\n');

  // 1. Copy to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareMessage);
      } else {
        // Fallback for older webview
        const textarea = document.createElement('textarea');
        textarea.value = shareMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (onNotifyToast) onNotifyToast('Task briefing & link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy', err);
    }
  };

  // 2. Native Web Share API (Smartphone Android / iOS native bottom sheet)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SOLVR Delhi: ${task.title}`,
          text: shareMessage,
          url: shareUrl,
        });
        if (onNotifyToast) onNotifyToast('Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // 3. WhatsApp Deep Link
  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // 4. Telegram Deep Link
  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // 5. SMS Deep Link
  const handleSmsShare = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.location.href = smsUrl;
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white border-t-2 sm:border-2 border-[#09090B] rounded-t-3xl sm:rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)] sm:shadow-[0_16px_40px_rgba(0,0,0,0.3)] overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Header with drag pill and close */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-[#EBF5EE]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#09090B] text-[#FACC15] flex items-center justify-center shadow-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#09090B]">
                Share Run with Volunteers
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                Delhi Civic Logistics & Volunteer Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close Share Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Task Preview Card (Chunky Pure White with clean border) */}
          <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-zinc-200 bg-white shadow-sm space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800">
                {isFoodRescue ? (
                  <UtensilsCrossed className="w-3 h-3 text-[#22C55E]" />
                ) : (
                  <Wrench className="w-3 h-3 text-[#FACC15]" />
                )}
                {task.id}
              </span>
              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-[#FACC15] text-[#09090B] border border-black/10">
                {bountyText} Bounty
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-[#09090B] leading-snug">
              {task.title}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{task.address} · {task.district}</span>
            </div>

            {isFoodRescue && task.foodDetails && (
              <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200 text-xs">
                <p className="font-semibold">🍱 Surplus Food Rescue</p>
                <p className="text-[11px] text-emerald-800">
                  {task.foodDetails.weightKg} kg ready for drop-off at {task.foodDetails.destinationName}
                </p>
              </div>
            )}
          </div>

          {/* Social Platform Actions (Thumb-Friendly Buttons) */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block px-1">
              Quick Share Channels
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp (Primary in Delhi) */}
              <button
                onClick={handleWhatsAppShare}
                className="py-3 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-2xl border-2 border-black/20 shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-2 transition-transform active:scale-95 min-h-[48px]"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegramShare}
                className="py-3 px-3.5 bg-[#229ED9] hover:bg-[#1d8bc0] text-white font-extrabold text-xs rounded-2xl border-2 border-black/20 shadow-[2px_2px_0px_#09090B] flex items-center justify-center gap-2 transition-transform active:scale-95 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Native Smartphone Share (Android / iOS) */}
              {hasNativeShare ? (
                <button
                  onClick={handleNativeShare}
                  className="py-3 px-3.5 bg-[#09090B] hover:bg-zinc-800 text-white font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#FACC15] flex items-center justify-center gap-2 transition-transform active:scale-95 min-h-[48px]"
                >
                  <Smartphone className="w-4 h-4 text-[#FACC15]" />
                  <span>Device Share</span>
                </button>
              ) : (
                <button
                  onClick={handleSmsShare}
                  className="py-3 px-3.5 bg-zinc-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl border-2 border-black shadow-[2px_2px_0px_#FACC15] flex items-center justify-center gap-2 transition-transform active:scale-95 min-h-[48px]"
                >
                  <MessageSquare className="w-4 h-4 text-[#FACC15]" />
                  <span>SMS Direct</span>
                </button>
              )}

              {/* Copy Deep Link & Text */}
              <button
                onClick={handleCopyLink}
                className={`py-3 px-3.5 font-extrabold text-xs rounded-2xl border-2 border-[#09090B] flex items-center justify-center gap-2 transition-all min-h-[48px] ${
                  copied
                    ? 'bg-[#22C55E] text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white hover:bg-zinc-50 text-[#09090B] shadow-[2px_2px_0px_#09090B] active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-600" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Deep Link Preview Bar */}
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[11px] text-zinc-500 truncate select-all">
              {shareUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 text-zinc-700 hover:text-black font-bold p-1"
              title="Copy URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer info pill */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 text-center shrink-0">
          <p className="text-[11px] text-zinc-500 font-medium">
            Volunteers who click this link can directly view and claim this run in Delhi NCT.
          </p>
        </div>
      </div>
    </div>
  );
};
