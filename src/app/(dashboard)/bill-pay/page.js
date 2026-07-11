"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, X, Receipt, Zap, Repeat } from "lucide-react";
import { format } from "date-fns";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const categoryLabels = {
  utilities: "Utilities",
  rent: "Rent",
  credit_card: "Credit card",
  insurance: "Insurance",
  subscription: "Subscription",
  other: "Other",
};

export default function BillPayPage() {
  const [bills, setBills] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    accountId: "",
    payeeName: "",
    category: "utilities",
    amount: "",
    frequency: "one_time",
    nextPaymentDate: "",
  });

  async function fetchAll() {
    const [billsRes, accountsRes] = await Promise.all([
      fetch("/api/bill-pay"),
      fetch("/api/accounts"),
    ]);
    const billsData = await billsRes.json();
    const accountsData = await accountsRes.json();
    setBills(billsData.bills || []);
    setAccounts(accountsData.accounts || []);
    if (accountsData.accounts?.length > 0) {
      setForm((f) => ({ ...f, accountId: accountsData.accounts[0]._id }));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/bill-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to schedule bill");
      return;
    }

    setBills((prev) => [...prev, data.bill].sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate)));
    setShowForm(false);
    setForm((f) => ({ ...f, payeeName: "", amount: "", nextPaymentDate: "" }));
  }

  async function handlePayNow(id) {
    setPayingId(id);
    const res = await fetch(`/api/bill-pay/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay" }),
    });
    const data = await res.json();
    setPayingId(null);

    if (res.ok) {
      setBills((prev) => prev.map((b) => (b._id === id ? data.bill : b)));
    } else {
      setError(data.error || "Payment failed");
    }
  }

  async function handleCancel(id) {
    const res = await fetch(`/api/bill-pay/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok) {
      const data = await res.json();
      setBills((prev) => prev.map((b) => (b._id === id ? data.bill : b)));
    }
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

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
          <h1 className="font-display font-bold text-2xl text-ink">Bill Pay</h1>
          <p className="mt-1 text-sm text-muted">
            Schedule and pay bills so nothing's ever late.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} disabled={accounts.length === 0}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Schedule a bill"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-7 rounded-2xl border border-border bg-surface max-w-lg space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Pay from</label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.nickname || acc.type} — •••• {acc.accountNumber.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Payee name"
            required
            value={form.payeeName}
            onChange={(e) => setForm({ ...form, payeeName: e.target.value })}
            placeholder="e.g. City Power & Light"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              {Object.entries(categoryLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Frequency</label>
            <div className="flex gap-2 p-1 rounded-xl bg-background border border-border w-fit">
              {[
                { val: "one_time", label: "One-time" },
                { val: "weekly", label: "Weekly" },
                { val: "monthly", label: "Monthly" },
              ].map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: f.val })}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    form.frequency === f.val ? "bg-navy text-background" : "text-muted hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="First payment date"
            type="date"
            required
            value={form.nextPaymentDate}
            onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule bill"}
          </Button>
        </form>
      )}

      {bills.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No bills scheduled yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {bills.map((bill, i) => (
            <motion.div
              key={bill._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0"
            >
              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                <Receipt className="w-4.5 h-4.5 text-navy" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{bill.payeeName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted">{categoryLabels[bill.category]}</span>
                  {bill.frequency !== "one_time" && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Repeat className="w-3 h-3" />
                      {bill.frequency}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-mono font-semibold text-sm text-ink">{currency(bill.amount)}</p>
                <p className="text-xs text-muted mt-0.5">
                  {bill.status === "paid"
                    ? "Paid"
                    : bill.status === "cancelled"
                    ? "Cancelled"
                    : `Due ${format(new Date(bill.nextPaymentDate), "MMM d")}`}
                </p>
              </div>

              {bill.status === "scheduled" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handlePayNow(bill._id)}
                    disabled={payingId === bill._id}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-navy text-background hover:bg-navy-light transition-colors disabled:opacity-50"
                  >
                    {payingId === bill._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    Pay now
                  </button>
                  <button
                    onClick={() => handleCancel(bill._id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border text-ink hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}