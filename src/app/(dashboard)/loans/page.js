"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import LoanCard from "@/components/dashboard/LoanCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "personal",
    amountRequested: "",
    termMonths: "",
    purpose: "",
  });

  async function fetchLoans() {
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(data.loans || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLoans();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to submit application");
      return;
    }

    setLoans((prev) => [data.loan, ...prev]);
    setShowForm(false);
    setForm({ type: "personal", amountRequested: "", termMonths: "", purpose: "" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Loans</h1>
          <p className="mt-1 text-sm text-muted">
            Apply for a personal or business loan with a decision in minutes.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Apply for a loan"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-7 rounded-2xl border border-border bg-surface max-w-lg space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Loan type</label>
            <div className="flex gap-2 p-1 rounded-xl bg-background border border-border w-fit">
              {["personal", "business"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    form.type === t ? "bg-navy text-background" : "text-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount requested"
            type="number"
            min="1"
            required
            value={form.amountRequested}
            onChange={(e) => setForm({ ...form, amountRequested: e.target.value })}
            placeholder="10000"
          />

          <Input
            label="Term (months)"
            type="number"
            min="1"
            required
            value={form.termMonths}
            onChange={(e) => setForm({ ...form, termMonths: e.target.value })}
            placeholder="24"
          />

          <Input
            label="Purpose (optional)"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="What's this loan for?"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit application"}
          </Button>
        </form>
      )}

      {loans.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No loan applications yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <LoanCard key={loan._id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}