"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, User as UserIcon, Landmark, CreditCard, HandCoins } from "lucide-react";

const statusConfig = {
  active: { color: "text-emerald", bg: "bg-emerald/10", label: "Active" },
  suspended: { color: "text-red-500", bg: "bg-red-50", label: "Suspended" },
  pending_verification: { color: "text-amber", bg: "bg-amber/10", label: "Pending" },
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function fetchUser() {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) {
        console.error("Failed to fetch user:", res.status);
        setData({ user: null });
        setLoading(false);
        return;
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
      setData({ user: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    if (res.ok) {
      const result = await res.json();
      setData((prev) => ({ ...prev, user: result.user }));
    }
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  if (!data?.user) {
    return <p className="text-sm text-muted">User not found.</p>;
  }

  const { user, accounts, cards, loans, recentTransactions } = data;
  const config = statusConfig[user.status] || statusConfig.pending_verification;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center">
            <span className="text-lg font-bold text-navy">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-ink">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
            {config.label}
          </span>
          {user.status === "active" ? (
            <button
              onClick={() => handleStatusChange("suspended")}
              disabled={updating}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange("active")}
              disabled={updating}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-emerald/30 text-emerald hover:bg-emerald-light transition-colors"
            >
              Activate
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-2xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Total balance</p>
          <p className="font-mono font-bold text-lg text-ink">{currency(totalBalance)}</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Accounts</p>
          <p className="font-mono font-bold text-lg text-ink">{accounts.length}</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Cards</p>
          <p className="font-mono font-bold text-lg text-ink">{cards.length}</p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">KYC status</p>
          <p className="font-mono font-bold text-lg text-ink capitalize">{user.kycStatus.replace("_", " ")}</p>
        </div>
      </div>

      {/* Accounts */}
      <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
        <Landmark className="w-4 h-4" /> Accounts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {accounts.map((acc) => (
          <AccountCard key={acc._id} account={acc} onRefresh={fetchUser} />
        ))}
      </div>

      {/* Cards */}
      <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Cards
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {cards.length === 0 ? (
          <p className="text-sm text-muted">No cards issued.</p>
        ) : (
          cards.map((card) => (
            <div key={card._id} className="p-5 rounded-2xl border border-border bg-surface flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink capitalize">{card.type} card</p>
                <p className="text-xs text-muted font-mono">•••• {card.cardNumberLast4}</p>
              </div>
              <span className="text-xs font-semibold text-muted capitalize">{card.status}</span>
            </div>
          ))
        )}
      </div>

      {/* Loans */}
      <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
        <HandCoins className="w-4 h-4" /> Loans
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {loans.length === 0 ? (
          <p className="text-sm text-muted">No loan applications.</p>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="p-5 rounded-2xl border border-border bg-surface flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink capitalize">{loan.type} loan</p>
                <p className="text-xs text-muted font-mono">{currency(loan.amountRequested)}</p>
              </div>
              <span className="text-xs font-semibold text-muted capitalize">{loan.status}</span>
            </div>
          ))
        )}
      </div>

      {/* Recent transactions */}
      <h2 className="text-sm font-semibold text-ink mb-4">Recent transactions</h2>
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted p-5">No transactions yet.</p>
        ) : (
          recentTransactions.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
              <div>
                <p className="text-sm font-medium text-ink">{tx.description || tx.type}</p>
                <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="font-mono font-semibold text-sm text-ink">{currency(tx.amount)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AccountCard({ account, onRefresh }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  const frozen = account.status === "frozen";
  const closed = account.status === "closed";

  async function handleToggleFreeze() {
    setProcessing(true);
    setError("");

    const res = await fetch(`/api/admin/accounts/${account._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: frozen ? "active" : "frozen" }),
    });

    const data = await res.json();
    setProcessing(false);

    if (!res.ok) {
      setError(data.error || "Failed to update account");
      return;
    }

    onRefresh();
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setProcessing(true);
    setError("");

    const res = await fetch(`/api/admin/accounts/${account._id}`, { method: "DELETE" });
    const data = await res.json();
    setProcessing(false);

    if (!res.ok) {
      setError(data.error || "Failed to delete account");
      setConfirmingDelete(false);
      return;
    }

    onRefresh();
  }

  return (
    <div className={`p-5 rounded-2xl border border-border bg-surface ${closed ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted capitalize mb-1">{account.type}</p>
          <p className="font-mono font-bold text-lg text-ink">{currency(account.balance)}</p>
          <p className="text-xs text-muted font-mono mt-1">•••• {account.accountNumber.slice(-4)}</p>
        </div>
        {frozen && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber/10 text-amber">
            Frozen
          </span>
        )}
        {closed && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink/5 text-muted">
            Closed
          </span>
        )}
      </div>

      {!closed && <AddMoneyForm account={account} onSuccess={onRefresh} />}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {!closed && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={handleToggleFreeze}
            disabled={processing}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
              frozen
                ? "border-emerald/30 text-emerald hover:bg-emerald-light"
                : "border-border text-ink hover:bg-background"
            }`}
          >
            {frozen ? "Unfreeze" : "Freeze"}
          </button>

          {!confirmingDelete ? (
            <button
              onClick={handleDelete}
              disabled={processing}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete account
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink">Confirm delete?</span>
              <button
                onClick={handleDelete}
                disabled={processing}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                {processing ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-xs font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMoneyForm({ account, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch(`/api/admin/accounts/${account._id}/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to add funds");
      return;
    }

    setSuccess(true);
    setAmount("");
    setDescription("");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 mt-3 pt-3 border-t border-border">
      <div className="flex-1 min-w-[100px]">
        <input
          type="number"
          min="0.01"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "Adding..." : "Add funds"}
      </button>
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
      {success && <p className="w-full text-xs text-emerald">Funds added</p>}
    </form>
  );
}