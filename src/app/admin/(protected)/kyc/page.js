"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import Input from "@/components/ui/Input";

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function fetchSubmissions() {
    setLoading(true);
    const res = await fetch(`/api/admin/kyc?status=${statusFilter}`);
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  async function handleApprove(id) {
    setProcessing(true);
    setError("");

    const res = await fetch(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });

    setProcessing(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Approval failed");
      return;
    }

    fetchSubmissions();
  }

  async function handleReject(id) {
    if (!rejectionReason.trim()) {
      setError("Enter a reason for rejection");
      return;
    }

    setProcessing(true);
    setError("");

    const res = await fetch(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", rejectionReason }),
    });

    setProcessing(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Rejection failed");
      return;
    }

    setReviewingId(null);
    setRejectionReason("");
    fetchSubmissions();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Identity Verification</h1>
        <p className="mt-1 text-sm text-muted">Review submitted KYC documents.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6">
        {["pending", "approved", "rejected"].map((s) => (
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
      ) : submissions.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No {statusFilter} submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isReviewing = reviewingId === sub._id;

            return (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-navy" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {sub.user?.firstName} {sub.user?.lastName}
                      </p>
                      <p className="text-xs text-muted">{sub.user?.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    Submitted {format(new Date(sub.createdAt), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">ID type</p>
                    <p className="text-ink font-medium capitalize">{sub.idType.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">ID number</p>
                    <p className="text-ink font-medium font-mono">{sub.idNumber}</p>
                  </div>
                </div>

                {sub.idFrontImage && (
                  <div className="mb-5">
                    <p className="text-xs text-muted mb-2">ID document</p>
                    <img
                      src={sub.idFrontImage}
                      alt="Submitted ID"
                      className="max-w-xs rounded-xl border border-border"
                    />
                  </div>
                )}

                {sub.status === "rejected" && sub.rejectionReason && (
                  <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    {sub.rejectionReason}
                  </p>
                )}

                {sub.status === "pending" && (
                  <>
                    {error && (
                      <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                        {error}
                      </p>
                    )}

                    {!isReviewing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sub._id)}
                          disabled={processing}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                        >
                          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewingId(sub._id);
                            setError("");
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border space-y-3">
                        <Input
                          label="Reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Document image unclear, ID expired"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(sub._id)}
                            disabled={processing}
                            className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500 text-background hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {processing ? "Rejecting..." : "Confirm rejection"}
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setRejectionReason("");
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}