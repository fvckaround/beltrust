"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CreditCard, Check, Ban } from "lucide-react";

const statusConfig = {
  active: { color: "text-emerald", bg: "bg-emerald/10", label: "Active" },
  frozen: { color: "text-amber", bg: "bg-amber/10", label: "Frozen" },
  pending_activation: { color: "text-navy", bg: "bg-navy/10", label: "Pending activation" },
  cancelled: { color: "text-muted", bg: "bg-ink/5", label: "Cancelled" },
};

export default function AdminCardsPage() {
  const [cards, setCards] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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

  async function handleAction(cardId, action) {
    setProcessingId(cardId);
    const res = await fetch(`/api/admin/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setProcessingId(null);

    if (res.ok) {
      const data = await res.json();
      setCards((prev) => prev.map((c) => (c._id === cardId ? { ...c, ...data.card } : c)));
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Cards</h1>
        <p className="mt-1 text-sm text-muted">All cards issued across Beltrust.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6 overflow-x-auto">
        {["", "pending_activation", "active", "frozen", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === s ? "bg-navy text-background" : "text-muted hover:text-ink"
            }`}
          >
            {s ? statusConfig[s]?.label : "All"}
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
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted">Customer</th>
                <th className="px-5 py-3 font-medium text-muted">Card</th>
                <th className="px-5 py-3 font-medium text-muted">Type</th>
                <th className="px-5 py-3 font-medium text-muted">Linked account</th>
                <th className="px-5 py-3 font-medium text-muted">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, i) => {
                const config = statusConfig[card.status] || statusConfig.pending_activation;
                return (
                  <motion.tr
                    key={card._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-b-0 hover:bg-background/50 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-ink">
                        {card.user?.firstName} {card.user?.lastName}
                      </p>
                      <p className="text-xs text-muted">{card.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted whitespace-nowrap">
                      •••• {card.cardNumberLast4}
                    </td>
                    <td className="px-5 py-4 text-muted capitalize whitespace-nowrap">{card.type}</td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {card.account?.type} •••• {card.account?.accountNumber?.slice(-4)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {card.status === "pending_activation" && (
                        <button
                          onClick={() => handleAction(card._id, "activate")}
                          disabled={processingId === card._id}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                        >
                          {processingId === card._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
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
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}