"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Snowflake, RotateCw, Eye, EyeOff, Loader2, Trash2, Clock } from "lucide-react";

export default function CardVisual({ card, onToggleFreeze, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [revealData, setRevealData] = useState(null);
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const frozen = card.status === "frozen";
  const pendingApproval = card.status === "pending_approval";
  const pendingActivation = card.status === "pending_activation";
  const declined = card.status === "declined";
  const canReveal = card.status === "active" || card.status === "frozen";
  const canFreeze = card.status === "active" || card.status === "frozen";
  const canDelete = !["active", "frozen"].includes(card.status) || true; // deletion always allowed by owner

  async function handleReveal(e) {
    e.stopPropagation();
    setRevealError("");

    if (revealed) {
      setRevealed(false);
      return;
    }

    if (revealData?.cardNumber) {
      setRevealed(true);
      return;
    }

    setRevealing(true);

    try {
      const res = await fetch(`/api/cards/${card._id}/reveal`);
      const data = await res.json();

      if (!res.ok) {
        setRevealError(data.error || `Error ${res.status}`);
        return;
      }

      if (data?.cardNumber) {
        setRevealData(data);
        setRevealed(true);
      } else {
        setRevealError("No card data returned");
      }
    } catch (err) {
      setRevealError("Network error — check your connection");
    } finally {
      setRevealing(false);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();

    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/cards/${card._id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      onDelete(card._id);
    }
  }

  const displayNumber =
    revealed && revealData?.cardNumber
      ? revealData.cardNumber.replace(/(.{4})/g, "$1 ").trim()
      : `•••• •••• •••• ${card.cardNumberLast4 || "----"}`;

  const displayCvv = revealed && revealData?.cvv ? revealData.cvv : "•••";

  const statusBadge = pendingApproval
    ? { label: "Awaiting approval", icon: Clock }
    : declined
    ? { label: "Declined", icon: null }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      <div
        className="relative aspect-[1.586/1] cursor-pointer [perspective:1000px]"
        onClick={() => setFlipped((v) => !v)}
      >
        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          {/* FRONT */}
          <div
            className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] transition-opacity ${
              frozen || pendingApproval || declined ? "opacity-50" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #14213D 0%, #1F3358 60%, #0B1526 100%)",
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-emerald/10 blur-2xl -mr-10 -mt-10" />

            <div className="flex items-center justify-between relative z-10">
              <span className="font-display font-bold text-background text-sm tracking-tight">
                Beltrust
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReveal}
                  disabled={revealing || !canReveal}
                  className="text-background/70 hover:text-background disabled:opacity-30 transition-colors"
                  aria-label={revealed ? "Hide card number" : "Reveal card number"}
                  type="button"
                >
                  {revealing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : revealed ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <Wifi className="w-5 h-5 text-background/70 rotate-90" />
                <RotateCw className="w-3.5 h-3.5 text-background/40" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="font-mono text-background text-base sm:text-lg tracking-[0.1em]">
                {displayNumber}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-[10px] text-background/50 uppercase tracking-wide">Cardholder</p>
                  <p className="text-xs text-background font-medium">{card.cardholderName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-background/50 uppercase tracking-wide">Expires</p>
                  <p className="text-xs text-background font-medium font-mono">
                    {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
                  </p>
                </div>
                <NetworkMark network={card.network} />
              </div>
            </div>

            {frozen && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/40 backdrop-blur-[2px] z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90">
                  <Snowflake className="w-3.5 h-3.5 text-navy" />
                  <span className="text-xs font-semibold text-navy">Frozen</span>
                </div>
              </div>
            )}

            {statusBadge && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/40 backdrop-blur-[2px] z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90">
                  {statusBadge.icon && <statusBadge.icon className="w-3.5 h-3.5 text-navy" />}
                  <span className="text-xs font-semibold text-navy">{statusBadge.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{
              background: "linear-gradient(135deg, #14213D 0%, #1F3358 60%, #0B1526 100%)",
            }}
          >
            <div className="w-full h-11 bg-black/60 mt-6" />

            <div className="px-6 mt-6">
              <div className="flex items-center justify-end gap-3 bg-background/90 rounded-md px-3 py-2">
                <span className="text-[10px] text-navy/60 font-medium tracking-wide">CVV</span>
                <span className="font-mono text-sm text-navy font-semibold tracking-widest">
                  {displayCvv}
                </span>
              </div>
              <p className="mt-4 text-[10px] text-background/50 leading-relaxed">
                This card is property of Beltrust Bank. If found, please
                contact beltrusts@outlook.com. Use of this card is
                subject to the cardholder agreement.
              </p>
            </div>

            <div className="absolute bottom-4 right-6">
              <NetworkMark network={card.network} muted />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-ink capitalize">{card.type} card</p>
          <p className="text-xs text-muted capitalize">
            {card.status.replace("_", " ")}
          </p>
        </div>
        {canFreeze && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFreeze(card);
            }}
            type="button"
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
              frozen
                ? "border-emerald text-emerald hover:bg-emerald-light"
                : "border-border text-ink hover:bg-background"
            }`}
          >
            {frozen ? "Unfreeze" : "Freeze"}
          </button>
        )}
      </div>

      {card.status === "declined" && card.reviewNotes && (
        <p className="text-xs text-red-500 px-1">{card.reviewNotes}</p>
      )}

      {revealError && <p className="text-xs text-red-500 px-1">{revealError}</p>}

      <div className="px-1">
        {!confirmingDelete ? (
          <button
            onClick={handleDelete}
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete card
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink">Delete this card permanently?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              type="button"
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmingDelete(false);
              }}
              type="button"
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NetworkMark({ network, muted = false }) {
  if (network === "mastercard") {
    return (
      <div className="flex items-center" aria-label="Mastercard">
        <div className={`w-6 h-6 rounded-full ${muted ? "bg-red-500/40" : "bg-red-500/90"}`} />
        <div
          className={`w-6 h-6 rounded-full -ml-3 mix-blend-screen ${
            muted ? "bg-amber-400/40" : "bg-amber-400/90"
          }`}
        />
      </div>
    );
  }

  return (
    <span
      className={`font-display italic font-extrabold text-lg tracking-tight ${
        muted ? "text-background/30" : "text-background"
      }`}
      aria-label="Visa"
    >
      VISA
    </span>
  );
}