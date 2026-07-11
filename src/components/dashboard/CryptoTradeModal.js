"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CryptoTradeModal({ coin, action, accounts, onClose, onSuccess }) {
  const [accountId, setAccountId] = useState(accounts[0]?._id || "");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = (Number(quantity) || 0) * coin.price;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/crypto/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        action,
        symbol: coin.symbol,
        name: coin.name,
        quantity,
        price: coin.price,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Trade failed");
      return;
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-ink capitalize">
            {action} {coin.name}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted mb-5">
          Current price:{" "}
          <span className="font-mono font-semibold text-ink">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(coin.price)}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
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
            label={`Quantity of ${coin.symbol}`}
            type="number"
            step="any"
            min="0"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
          />

          <div className="flex justify-between text-sm p-3 rounded-xl bg-background">
            <span className="text-muted">Total</span>
            <span className="font-mono font-semibold text-ink">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}
            </span>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ${action}`}
          </Button>
        </form>
      </div>
    </div>
  );
}