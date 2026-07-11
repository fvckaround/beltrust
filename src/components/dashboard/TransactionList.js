"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Receipt, CreditCard } from "lucide-react";
import { format } from "date-fns";

const typeConfig = {
  deposit: { icon: ArrowDownLeft, color: "text-emerald", bg: "bg-emerald/10" },
  transfer_in: { icon: ArrowDownLeft, color: "text-emerald", bg: "bg-emerald/10" },
  withdrawal: { icon: ArrowUpRight, color: "text-ink", bg: "bg-ink/5" },
  transfer_out: { icon: ArrowUpRight, color: "text-ink", bg: "bg-ink/5" },
  bill_pay: { icon: Receipt, color: "text-amber", bg: "bg-amber/10" },
  card_purchase: { icon: CreditCard, color: "text-ink", bg: "bg-ink/5" },
};

const isCredit = (type) => type === "deposit" || type === "transfer_in";

export default function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-surface text-center">
        <p className="text-sm text-muted">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {transactions.map((tx, i) => {
        const config = typeConfig[tx.type] || typeConfig.withdrawal;
        const Icon = config.icon;
        const credit = isCredit(tx.type);

        return (
          <motion.div
            key={tx._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-b-0 hover:bg-background/50 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${config.color}`} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">
                {tx.description || tx.counterpartyName || "Transaction"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {format(new Date(tx.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-mono font-semibold text-sm ${credit ? "text-emerald" : "text-ink"}`}>
                {credit ? "+" : "-"}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(Math.abs(tx.amount))}
              </p>
              <p className="text-xs text-muted mt-0.5 capitalize">{tx.status}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}