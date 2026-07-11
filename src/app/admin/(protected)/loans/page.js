"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, HandCoins } from "lucide-react";
import { format } from "date-fns";
import Input from "@/components/ui/Input";

const statusConfig = {
  pending: { color: "text-amber", bg: "bg-amber/10", label: "Pending" },
  approved: { color: "text-emerald", bg: "bg-emerald/10", label: "Approved" },
  active: { color: "text-navy", bg: "bg-navy/10", label: "Active" },
  rejected: { color: "text-red-500", bg: "bg-red-50", label: "Rejected" },
  paid_off: { color: "text-muted", bg: "bg-ink/5", label: "Paid off" },
};

export default function AdminLoansPage() {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ amountApproved: "", interestRate: "", reviewNotes: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function fetchLoans() {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/loans${params}`);
    const data = await res.json();
    setLoans(data.loans || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  function openReview(loan) {
    setReviewingId(loan._id);
    setReviewForm({
      amountApproved: loan.amountRequested,
      interestRate: loan.type === "personal" ? "12" : "9",
      reviewNotes: "",
    });
    setError("");
  }

  async function handleApprove(loanId) {
    setProcessing(true);
    setError("");

    const res = await fetch(`/api/admin/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        amountApproved: reviewForm.amountApproved,
        interestRate: reviewForm.interestRate,
        reviewNotes: reviewForm.reviewNotes,
      }),
    });

    const data = await res.json();
    setProcessing(false);

    if (!res.ok) {
      setError(data.error || "Approval failed");
      return;
    }

    setReviewingId(null);
    fetchLoans();
  }

  async function handleReject(loanId) {
    setProcessing(true);
    const res = await fetch(`/api/admin/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reviewNotes: reviewForm.reviewNotes || "Not approved at this time" }),
    });
    setProcessing(false);

    if (res.ok) {
      setReviewingId(null);
      fetchLoans();
    }
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Loans</h1>
        <p className="mt-1 text-sm text-muted">Review and approve loan applications.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6 overflow-x-auto">
        {["pending", "active", "approved", "rejected", "paid_off", ""].map((s) => (
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
      ) : loans.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No loans found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const config = statusConfig[loan.status] || statusConfig.pending;
            const isReviewing = reviewingId === loan._id;

            return (
              <motion.div
                key={loan._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <HandCoins className="w-5 h-5 text-navy" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {loan.user?.firstName} {loan.user?.lastName}
                      </p>
                      <p className="text-xs text-muted">{loan.user?.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Type</p>
                    <p className="text-ink font-medium capitalize">{loan.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Requested</p>
                    <p className="text-ink font-medium font-mono">{currency(loan.amountRequested)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Term</p>
                    <p className="text-ink font-medium">{loan.termMonths} months</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Applied</p>
                    <p className="text-ink font-medium">{format(new Date(loan.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>

                {loan.purpose && (
                  <p className="text-sm text-muted mb-4">"{loan.purpose}"</p>
                )}

                {loan.status === "pending" && (
                  <>
                    {!isReviewing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReview(loan)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-navy text-background hover:bg-navy-light transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Review
                        </button>
                        <button
                          onClick={() => {
                            setReviewingId(loan._id);
                            setReviewForm({ amountApproved: "", interestRate: "", reviewNotes: "" });
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-border text-ink hover:bg-background transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Amount to approve"
                            type="number"
                            value={reviewForm.amountApproved}
                            onChange={(e) => setReviewForm({ ...reviewForm, amountApproved: e.target.value })}
                          />
                          <Input
                            label="Interest rate (% APR)"
                            type="number"
                            step="0.1"
                            value={reviewForm.interestRate}
                            onChange={(e) => setReviewForm({ ...reviewForm, interestRate: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Notes (optional)"
                          value={reviewForm.reviewNotes}
                          onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                          placeholder="Internal notes about this decision"
                        />

                        {error && (
                          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                            {error}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(loan._id)}
                            disabled={processing}
                            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                          >
                            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve & disburse
                          </button>
                          <button
                            onClick={() => handleReject(loan._id)}
                            disabled={processing}
                            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                          <button
                            onClick={() => setReviewingId(null)}
                            className="text-xs font-medium text-muted hover:text-ink px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {loan.status === "active" && (
                  <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted mb-0.5">Approved</p>
                      <p className="text-ink font-medium font-mono">{currency(loan.amountApproved)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Rate</p>
                      <p className="text-ink font-medium">{loan.interestRate}% APR</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Monthly payment</p>
                      <p className="text-ink font-medium font-mono">{currency(loan.monthlyPayment)}</p>
                    </div>
                  </div>
                )}

                {loan.status === "rejected" && loan.reviewNotes && (
                  <p className="pt-4 border-t border-border text-sm text-red-500">{loan.reviewNotes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}