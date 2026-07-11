"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import TransferForm from "@/components/dashboard/TransferForm";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber", bg: "bg-amber/10", label: "Pending approval" },
  approved: { icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald/10", label: "Approved" },
  declined: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Declined" },
};

const typeLabels = {
  internal: "Between my accounts",
  beltrust: "To Beltrust account",
  external_bank: "To another bank",
};

export default function TransfersPage() {
  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    const [accountsRes, transfersRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/transfers"),
    ]);
    const accountsData = await accountsRes.json();
    const transfersData = await transfersRes.json();
    setAccounts(accountsData.accounts || []);
    setTransfers(transfersData.transfers || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Transfers</h1>
        <p className="mt-1 text-sm text-muted">
          Transfers between your own accounts complete instantly. Transfers to other
          Beltrust customers or another bank are reviewed before completing.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : accounts.length < 1 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">You need at least one account to make a transfer.</p>
        </div>
      ) : (
        <>
          <div className="max-w-lg p-7 rounded-2xl border border-border bg-surface mb-10">
            <TransferForm accounts={accounts} onSuccess={fetchAll} />
          </div>

          <h2 className="text-sm font-semibold text-ink mb-4">Transfer history</h2>
          {transfers.length === 0 ? (
            <div className="p-8 rounded-2xl border border-border bg-surface text-center">
              <p className="text-sm text-muted">No transfers yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {transfers.map((t, i) => {
                const config = statusConfig[t.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0"
                  >
                    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">
                        {t.description || typeLabels[t.transferType]}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {format(new Date(t.createdAt), "MMM d, yyyy · h:mm a")} · {typeLabels[t.transferType]}
                      </p>
                      {t.status === "declined" && t.reviewNotes && (
                        <p className="text-xs text-red-500 mt-1">{t.reviewNotes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-semibold text-sm text-ink">{currency(t.amount)}</p>
                      <p className={`text-xs mt-0.5 ${config.color}`}>{config.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}