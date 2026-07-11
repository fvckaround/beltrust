"use client";

import { motion } from "framer-motion";
import { Landmark, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function BalanceCard({ account }) {
  const [hidden, setHidden] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account.currency || "USD",
  }).format(account.balance);

  async function handleToggleDetails(e) {
    e.stopPropagation();

    if (showDetails) {
      setShowDetails(false);
      return;
    }

    if (details) {
      setShowDetails(true);
      return;
    }

    setLoadingDetails(true);
    const res = await fetch(`/api/accounts/${account._id}`);
    setLoadingDetails(false);

    if (res.ok) {
      const data = await res.json();
      setDetails(data);
      setShowDetails(true);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-navy" strokeWidth={2} />
        </div>
        <button
          onClick={() => setHidden((v) => !v)}
          className="text-muted hover:text-ink transition-colors"
          aria-label={hidden ? "Show balance" : "Hide balance"}
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-sm text-muted mb-1">
        {account.nickname || (account.type === "checking" ? "Checking" : "Savings")}
      </p>
      <p className="font-mono font-bold text-2xl text-ink tracking-tight">
        {hidden ? "••••••" : formattedBalance}
      </p>
      <p className="mt-2 text-xs text-muted font-mono">
        •••• {account.accountNumber.slice(-4)}
      </p>

      <button
        onClick={handleToggleDetails}
        disabled={loadingDetails}
        className="mt-3 pt-3 border-t border-border text-xs font-semibold text-navy hover:underline block w-full text-left"
      >
        {loadingDetails
          ? "Loading..."
          : showDetails
          ? "Hide account details"
          : "View account & routing number"}
      </button>

      {showDetails && details && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted">
            Account number: <span className="font-mono text-ink">{details.accountNumber}</span>
          </p>
          <p className="text-xs text-muted">
            Routing number: <span className="font-mono text-ink">{details.routingNumber}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}