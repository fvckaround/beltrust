"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CardRequestModal({ accounts, onClose, onSuccess }) {
  const [form, setForm] = useState({
    accountId: accounts[0]?._id || "",
    type: "virtual",
    network: "visa",
    spendingLimit: "",
    purpose: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prefill shipping address from profile if available
    async function fetchProfile() {
      const res = await fetch("/api/settings/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.address) {
          setForm((f) => ({
            ...f,
            street: data.user.address.street || "",
            city: data.user.address.city || "",
            state: data.user.address.state || "",
            zipCode: data.user.address.zipCode || "",
            country: data.user.address.country || "US",
          }));
        }
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.accountId) {
      setError("Select an account to link this card to");
      return;
    }

    if (!form.purpose.trim()) {
      setError("Tell us what this card is for");
      return;
    }

    if (form.type === "physical" && (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.zipCode.trim())) {
      setError("A complete shipping address is required for physical cards");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: form.accountId,
        type: form.type,
        network: form.network,
        spendingLimit: form.spendingLimit || null,
        purpose: form.purpose,
        shippingAddress:
          form.type === "physical"
            ? {
                street: form.street,
                city: form.city,
                state: form.state,
                zipCode: form.zipCode,
                country: form.country,
              }
            : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create card");
      return;
    }

    onSuccess(data.card);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-ink">Request a new card</h3>
          <button onClick={onClose} className="text-muted hover:text-ink" type="button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Card type</label>
            <div className="flex gap-2 p-1 rounded-xl bg-background border border-border w-fit">
              {["virtual", "physical"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    form.type === t ? "bg-navy text-background" : "text-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.type === "physical" && (
              <p className="mt-1.5 text-xs text-muted">
                Physical cards ship to the address below and activate on arrival.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Card network</label>
            <div className="flex gap-2 p-1 rounded-xl bg-background border border-border w-fit">
              {["visa", "mastercard"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, network: n })}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    form.network === n ? "bg-navy text-background" : "text-muted hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Link to account</label>
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
            label="Spending limit (optional)"
            type="number"
            min="0"
            value={form.spendingLimit}
            onChange={(e) => setForm({ ...form, spendingLimit: e.target.value })}
            placeholder="Leave blank for no limit"
          />

          <Input
            label="What's this card for?"
            required
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="e.g. Online subscriptions, travel, business expenses"
          />

          {form.type === "physical" && (
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-ink">Shipping address</p>
              <Input
                label="Street address"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="State"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ZIP code"
                  required
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                />
                <Input
                  label="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request card"}
          </Button>
        </form>
      </div>
    </div>
  );
}