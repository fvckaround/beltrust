"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, Bitcoin } from "lucide-react";
import { format } from "date-fns";
import Input from "@/components/ui/Input";

export default function AdminCryptoPage() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [processing, setProcessing] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch(`/api/admin/crypto?status=${statusFilter}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function handleAction(id, action, reviewNotes) {
    setProcessing(true);
    const res = await fetch(`/api/admin/crypto/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNotes }),
    });
    setProcessing(false);

    if (res.ok) {
      setDecliningId(null);
      setDeclineReason("");
      fetchOrders();
    }
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Crypto Orders</h1>
        <p className="mt-1 text-sm text-muted">Review and approve buy/sell requests.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-6">
        {["pending", "approved", "declined"].map((s) => (
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
      ) : orders.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No {statusFilter} orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDeclining = decliningId === order._id;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                      <Bitcoin className="w-5 h-5 text-navy" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-muted">{order.user?.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                      order.action === "buy" ? "bg-emerald/10 text-emerald" : "bg-amber/10 text-amber"
                    }`}
                  >
                    {order.action}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Asset</p>
                    <p className="text-ink font-medium">{order.name} ({order.symbol})</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Quantity</p>
                    <p className="text-ink font-medium font-mono">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Total</p>
                    <p className="text-ink font-medium font-mono">{currency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Submitted</p>
                    <p className="text-ink font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>

                {order.status === "declined" && order.reviewNotes && (
                  <p className="mb-4 text-sm text-red-500">{order.reviewNotes}</p>
                )}

                {order.status === "pending" && (
                  <>
                    {!isDeclining ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(order._id, "approve")}
                          disabled={processing}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-emerald text-background hover:bg-emerald/90 transition-colors disabled:opacity-50"
                        >
                          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => setDecliningId(order._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-border space-y-3">
                        <Input
                          label="Reason for declining"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="e.g. Unusual trading pattern"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(order._id, "decline", declineReason)}
                            disabled={processing}
                            className="text-xs font-semibold px-4 py-2 rounded-full bg-red-500 text-background hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {processing ? "Declining..." : "Confirm decline"}
                          </button>
                          <button
                            onClick={() => {
                              setDecliningId(null);
                              setDeclineReason("");
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