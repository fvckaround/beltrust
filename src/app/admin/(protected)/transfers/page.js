"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import Input from "@/components/ui/Input";

const typeLabels = {
  internal: "Between own accounts",
  beltrust: "To Beltrust account",
  external_bank: "To another bank",
};

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  async function fetchTransfers() {
    setLoading(true);
    const res = await fetch(`/api/admin/transfers?status=${statusFilter}`);
    const data = await res.json();
    setTransfers(data.transfers || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  async function handleAction(id, action) {
    setProcessing(true);
    const res = await fetch(`/api/admin/transfers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes }),
    });
    setProcessing(false);

    if (res.ok) {
      setReviewingId(null);
      setReviewNotes("");
      fetchTransfers();
    }
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Transfer Requests</h1>
        <p className="mt-1 text-sm text-muted">Review and approve outgoing transfers.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6">
        {["pending", "approved", "declined"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
              statusFilter === s ? "bg-navy text-background" : "text-muted hover:text-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : transfers.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No {statusFilter} transfers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((t) => {
            const isReviewing = reviewingId === t._id;
            return (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <ArrowLeftRight className="w-5 h-5 text-navy" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {t.user?.firstName} {t.user?.lastName}
                      </p>
                      <p className="text-xs text-muted">{t.user?.email}</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-lg text-ink">{currency(t.amount)}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Type</p>
                    <p className="text-ink font-medium">{typeLabels[t.transferType]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">From</p>
                    <p className="text-ink font-medium font-mono">•••• {t.sourceAccount?.accountNumber?.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">To</p>
                    <p className="text-ink font-medium font-mono">
                      {t.transferType === "internal"
                        ? `•••• ${t.destinationAccountId?.accountNumber?.slice(-4)}`
                        : `•••• ${t.destinationAccountNumber?.slice(-4) || "----"}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Submitted</p>
                    <p className="text-ink font-medium">{format(new Date(t.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>

                {t.transferType === "external_bank" && (
                  <div className="mb-4 p-4 rounded-xl bg-background text-sm space-y-1">
                    <p><span className="text-muted">Recipient:</span> <span className="text-ink font-medium">{t.recipientName}</span></p>
                    <p><span className="text-muted">Bank:</span> <span className="text-ink font-medium">{t.destinationBankName}</span></p>
                    <p><span className="text-muted">Routing:</span> <span className="text-ink font-mono">{t.destinationRoutingNumber}</span></p>
                  </div>
                )}

                {t.description && <p className="text-sm text-muted mb-4">"{t.description}"</p>}

                {t.status === "pending" && (
                  <>
                    {!isReviewing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(t._id, "approve")}
                          disabled={processing}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                        >
                          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewingId(t._id)}
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
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="e.g. Suspicious activity, insufficient verification"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(t._id, "decline")}
                            disabled={processing}
                            className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500 text-background hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {processing ? "Declining..." : "Confirm decline"}
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setReviewNotes("");
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

                {t.status === "declined" && t.reviewNotes && (
                  <p className="pt-4 border-t border-border text-sm text-red-500">{t.reviewNotes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}