"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function TransferForm({ accounts, onSuccess }) {
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?._id || "");
  const [transferType, setTransferType] = useState("internal");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [destinationBankName, setDestinationBankName] = useState("");
  const [destinationRoutingNumber, setDestinationRoutingNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientPreview, setRecipientPreview] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const otherAccounts = accounts.filter((a) => a._id !== sourceAccountId);

  useEffect(() => {
    if (transferType !== "beltrust" || destinationAccountNumber.length < 10) {
      setRecipientPreview(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await fetch(`/api/accounts/lookup?accountNumber=${destinationAccountNumber}`);
        if (res.ok) {
          const data = await res.json();
          setRecipientPreview(data);
        } else {
          setRecipientPreview(null);
        }
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [destinationAccountNumber, transferType]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceAccountId,
        transferType,
        destinationAccountId: transferType === "internal" ? destinationAccountId : undefined,
        destinationAccountNumber: transferType !== "internal" ? destinationAccountNumber : undefined,
        destinationBankName: transferType === "external_bank" ? destinationBankName : undefined,
        destinationRoutingNumber: transferType === "external_bank" ? destinationRoutingNumber : undefined,
        recipientName: transferType !== "internal" ? recipientName : undefined,
        amount,
        description,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Transfer failed");
      return;
    }

    setSuccess(true);
    setAmount("");
    setDescription("");
    setDestinationAccountNumber("");
    setDestinationBankName("");
    setDestinationRoutingNumber("");
    setRecipientName("");
    setRecipientPreview(null);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">From</label>
        <select
          value={sourceAccountId}
          onChange={(e) => setSourceAccountId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
        >
          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.nickname || acc.type} — •••• {acc.accountNumber.slice(-4)} (
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(acc.balance)})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-background border border-border w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setTransferType("internal")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            transferType === "internal" ? "bg-navy text-background" : "text-muted hover:text-ink"
          }`}
        >
          My accounts (instant)
        </button>
        <button
          type="button"
          onClick={() => setTransferType("beltrust")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            transferType === "beltrust" ? "bg-navy text-background" : "text-muted hover:text-ink"
          }`}
        >
          Another Beltrust account
        </button>
        <button
          type="button"
          onClick={() => setTransferType("external_bank")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            transferType === "external_bank" ? "bg-navy text-background" : "text-muted hover:text-ink"
          }`}
        >
          Another bank
        </button>
      </div>

      {transferType === "internal" && (
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">To</label>
          <select
            value={destinationAccountId}
            onChange={(e) => setDestinationAccountId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
          >
            <option value="">Select account</option>
            {otherAccounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.nickname || acc.type} — •••• {acc.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>
      )}

      {transferType === "beltrust" && (
        <div>
          <Input
            label="Recipient account number"
            value={destinationAccountNumber}
            onChange={(e) => setDestinationAccountNumber(e.target.value)}
            placeholder="10-digit Beltrust account number"
            required
          />
          {lookupLoading && (
            <p className="mt-1.5 text-xs text-muted">Looking up account...</p>
          )}
          {!lookupLoading && recipientPreview && (
            <p className="mt-1.5 text-xs text-emerald flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recipientPreview.name} — {recipientPreview.accountType} account
            </p>
          )}
          {!lookupLoading && destinationAccountNumber.length >= 10 && !recipientPreview && (
            <p className="mt-1.5 text-xs text-red-500">No matching account found</p>
          )}
        </div>
      )}

      {transferType === "external_bank" && (
        <div className="space-y-4">
          <Input
            label="Recipient name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Full name on the account"
            required
          />
          <Input
            label="Bank name"
            value={destinationBankName}
            onChange={(e) => setDestinationBankName(e.target.value)}
            placeholder="e.g. Chase, Wells Fargo"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Routing number"
              value={destinationRoutingNumber}
              onChange={(e) => setDestinationRoutingNumber(e.target.value)}
              placeholder="9 digits"
              required
            />
            <Input
              label="Account number"
              value={destinationAccountNumber}
              onChange={(e) => setDestinationAccountNumber(e.target.value)}
              placeholder="Recipient's account #"
              required
            />
          </div>
        </div>
      )}

      <Input
        label="Amount"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        required
      />

      <Input
        label="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this for?"
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 border ${
            transferType === "internal"
              ? "text-emerald bg-emerald-light border-emerald/20"
              : "text-amber bg-amber-light border-amber/20"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {transferType === "internal" ? "Transfer completed instantly" : "Transfer submitted — pending approval"}
        </motion.p>
      )}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Send transfer
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
}