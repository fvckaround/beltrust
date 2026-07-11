"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Landmark } from "lucide-react";
import TransactionList from "@/components/dashboard/TransactionList";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setSelectedId(data.accounts[0]._id);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    async function fetchTransactions() {
      setLoadingTx(true);
      try {
        const res = await fetch(`/api/accounts/${selectedId}/transactions`);
        const data = await res.json();
        setTransactions(data.transactions || []);
      } finally {
        setLoadingTx(false);
      }
    }
    fetchTransactions();
  }, [selectedId]);

  const selectedAccount = accounts.find((a) => a._id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Accounts</h1>
        <p className="mt-1 text-sm text-muted">
          View balances and transaction history for each account.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No accounts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account selector list */}
          <div className="lg:col-span-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {accounts.map((account) => {
              const active = account._id === selectedId;
              return (
                <button
                  key={account._id}
                  onClick={() => setSelectedId(account._id)}
                  className={`shrink-0 lg:shrink text-left p-5 rounded-2xl border transition-all min-w-[220px] lg:min-w-0 ${
                    active
                      ? "border-navy bg-navy text-background"
                      : "border-border bg-surface text-ink hover:border-navy/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark
                      className={`w-4 h-4 ${active ? "text-background" : "text-navy"}`}
                    />
                    <span className="text-xs font-medium capitalize opacity-80">
                      {account.type}
                    </span>
                  </div>
                  <p className="font-mono font-bold text-lg tracking-tight">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(account.balance)}
                  </p>
                  <p className={`text-xs mt-1 font-mono ${active ? "opacity-70" : "text-muted"}`}>
                    •••• {account.accountNumber.slice(-4)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Transaction history */}
          <div className="lg:col-span-2">
            <motion.h2
              key={selectedId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-semibold text-ink mb-4"
            >
              Recent activity
              {selectedAccount?.nickname ? ` — ${selectedAccount.nickname}` : ""}
            </motion.h2>
            {loadingTx ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-muted animate-spin" />
              </div>
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}