"use client";

import { motion } from "framer-motion";
import { HandCoins, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber", bg: "bg-amber/10", label: "Under review" },
  approved: { icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald/10", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Not approved" },
  active: { icon: TrendingUp, color: "text-navy", bg: "bg-navy/10", label: "Active" },
  paid_off: { icon: CheckCircle2, color: "text-muted", bg: "bg-ink/5", label: "Paid off" },
};

export default function LoanCard({ loan }) {
  const config = statusConfig[loan.status] || statusConfig.pending;
  const Icon = config.icon;

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-2xl border border-border bg-surface"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
          <HandCoins className="w-5 h-5 text-navy" strokeWidth={2} />
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} strokeWidth={2.5} />
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-1 capitalize">{loan.type} loan</p>
      <p className="font-mono font-bold text-2xl text-ink tracking-tight mb-4">
        {currency(loan.amountApproved || loan.amountRequested)}
      </p>

      <div className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-muted">Term</span>
          <span className="text-ink font-medium">{loan.termMonths} months</span>
        </div>
        {loan.interestRate && (
          <div className="flex justify-between">
            <span className="text-muted">Interest rate</span>
            <span className="text-ink font-medium">{loan.interestRate}% APR</span>
          </div>
        )}
        {loan.monthlyPayment && (
          <div className="flex justify-between">
            <span className="text-muted">Monthly payment</span>
            <span className="text-ink font-medium font-mono">{currency(loan.monthlyPayment)}</span>
          </div>
        )}
        {loan.status === "active" && loan.remainingBalance != null && (
          <div className="flex justify-between">
            <span className="text-muted">Remaining balance</span>
            <span className="text-ink font-medium font-mono">{currency(loan.remainingBalance)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted">Applied</span>
          <span className="text-ink font-medium">{format(new Date(loan.createdAt), "MMM d, yyyy")}</span>
        </div>
        {loan.status === "rejected" && loan.reviewNotes && (
          <p className="text-xs text-red-500 mt-2">{loan.reviewNotes}</p>
        )}
      </div>
    </motion.div>
  );
}