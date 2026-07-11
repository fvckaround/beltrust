"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";

const typeLabels = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  bill_pay: "Bill payment",
  card_purchase: "Card purchase",
};

const statusConfig = {
  completed: { color: "text-emerald", bg: "bg-emerald/10" },
  pending: { color: "text-amber", bg: "bg-amber/10" },
  failed: { color: "text-red-500", bg: "bg-red-50" },
  reversed: { color: "text-muted", bg: "bg-ink/5" },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);

    const res = await fetch(`/api/admin/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchTransactions, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Transactions</h1>
        <p className="mt-1 text-sm text-muted">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
        >
          <option value="">All types</option>
          {Object.entries(typeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No transactions found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted">Reference</th>
                <th className="px-5 py-3 font-medium text-muted">Customer</th>
                <th className="px-5 py-3 font-medium text-muted">Type</th>
                <th className="px-5 py-3 font-medium text-muted">Description</th>
                <th className="px-5 py-3 font-medium text-muted">Status</th>
                <th className="px-5 py-3 font-medium text-muted text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => {
                const config = statusConfig[tx.status] || statusConfig.pending;
                return (
                  <motion.tr
                    key={tx._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="border-b border-border last:border-b-0 hover:bg-background/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-muted whitespace-nowrap">
                      {tx.reference}
                    </td>
                    <td className="px-5 py-4 text-ink whitespace-nowrap">
                      {tx.user ? `${tx.user.firstName} ${tx.user.lastName}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {typeLabels[tx.type] || tx.type}
                    </td>
                    <td className="px-5 py-4 text-muted max-w-[200px] truncate">
                      {tx.description || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} capitalize`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-ink whitespace-nowrap">
                      {currency(tx.amount)}
                    </td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">
                      {format(new Date(tx.createdAt), "MMM d, yyyy")}
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