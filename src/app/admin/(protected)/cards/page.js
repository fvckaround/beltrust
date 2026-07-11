"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Ban, X } from "lucide-react";
import Input from "@/components/ui/Input";

const statusConfig = {
  pending_approval: { color: "text-amber", bg: "bg-amber/10", label: "Pending approval" },
  pending_activation: { color: "text-navy", bg: "bg-navy/10", label: "Pending activation" },
  active: { color: "text-emerald", bg: "bg-emerald/10", label: "Active" },
  frozen: { color: "text-amber", bg: "bg-amber/10", label: "Frozen" },
  cancelled: { color: "text-muted", bg: "bg-ink/5", label: "Cancelled" },
  declined: { color: "text-red-500", bg: "bg-red-50", label: "Declined" },
};

export default function AdminCardsPage() {
  const [cards, setCards] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  async function fetchCards() {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/cards${params}`);
    const data = await res.json();
    setCards(data.cards || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCards();
  }, [statusFilter]);

  async function handleAction(cardId, action, reviewNotes) {
    setProcessingId(cardId);
    const res = await fetch(`/api/admin/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes }),
    });
    setProcessingId(null);

    if (res.ok) {
      setDecliningId(null);
      setDeclineReason("");
      fetchCards();
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Cards</h1>
        <p className="mt-1 text-sm text-muted">Review card requests and manage issued cards.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6 overflow-x-auto">
        {["pending_approval", "pending_activation", "active", "frozen", "declined", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === s ? "bg-navy text-background" : "text-muted hover:text-ink"
            }`}
          >
            {statusConfig[s]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No cards found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => {
            const config = statusConfig[card.status] || statusConfig.pending_approval;
            const isDeclining = decliningId === card._id;

            return (
              <motion.div
                key={card._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {card.user?.firstName} {card.user?.lastName}
                    </p>
                    <p className="text-xs text-muted">{card.user?.email}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Type</p>
                    <p className="text-ink font-medium capitalize">{card.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Network</p>
                    <p className="text-ink font-medium capitalize">{card.network}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Card</p>
                    <p className="text-ink font-medium font-mono">•••• {card.cardNumberLast4}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Linked account</p>
                    <p className="text-ink font-medium font-mono">
                      {card.account?.type} •••• {card.account?.accountNumber?.slice(-4)}
                    </p>
                  </div>
                </div>

                {card.purpose && <p className="text-sm text-muted mb-4">"{card.purpose}"</p>}

                {card.status === "declined" && card.reviewNotes && (
                  <p className="mb-4 text-sm text-red-500">{card.reviewNotes}</p>
                )}

                {card.status === "pending_approval" && (
                  <>
                    {!isDeclining ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(card._id, "approve")}
                          disabled={processingId === card._id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                        >
                          {processingId === card._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setDecliningId(card._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border space-y-3">
                        <Input
                          label="Reason for declining"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="e.g. Account not verified, unusual request"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(card._id, "decline", declineReason)}
                            disabled={processingId === card._id}
                            className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500 text-background hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {processingId === card._id ? "Declining..." : "Confirm decline"}
                          </button>
                          <button
                            onClick={() => {
                              setDecliningId(null);
                              setDeclineReason("");
                            }}
                            className="text-xs font-medium text-muted hover:text-ink px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {card.status === "pending_activation" && (
                  <button
                    onClick={() => handleAction(card._id, "activate")}
                    disabled={processingId === card._id}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                  >
                    {processingId === card._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Mark shipped & activate
                  </button>
                )}

                {["active", "frozen"].includes(card.status) && (
                  <button
                    onClick={() => handleAction(card._id, "cancel")}
                    disabled={processingId === card._id}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-3 h-3" />
                    Cancel card
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}