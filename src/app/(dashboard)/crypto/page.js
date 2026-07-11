"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import CryptoTradeModal from "@/components/dashboard/CryptoTradeModal";

export default function CryptoPage() {
  const [prices, setPrices] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { coin, action }

  async function fetchAll() {
    const [pricesRes, walletRes, accountsRes] = await Promise.all([
      fetch("/api/crypto/prices"),
      fetch("/api/crypto"),
      fetch("/api/accounts"),
    ]);
    const pricesData = await pricesRes.json();
    const walletData = await walletRes.json();
    const accountsData = await accountsRes.json();
    setPrices(pricesData.prices || []);
    setWallet(walletData.wallet);
    setAccounts(accountsData.accounts || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const holdingsValue =
    wallet?.holdings.reduce((sum, h) => {
      const coin = prices.find((p) => p.symbol === h.symbol);
      return sum + (coin ? coin.price * h.quantity : 0);
    }, 0) || 0;

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
        <h1 className="font-display font-bold text-2xl text-ink">Crypto</h1>
        <p className="mt-1 text-sm text-muted">
          Buy and hold major cryptocurrencies alongside your cash.
        </p>
      </div>

      {/* Portfolio summary */}
      <div className="mb-8 p-6 rounded-2xl bg-navy text-background">
        <p className="text-sm text-background/70 mb-1">Portfolio value</p>
        <p className="font-mono font-bold text-3xl tracking-tight">{currency(holdingsValue)}</p>
      </div>

      {/* Holdings */}
      {wallet?.holdings.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-ink mb-4">Your holdings</h2>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {wallet.holdings.map((h) => {
              const coin = prices.find((p) => p.symbol === h.symbol);
              const value = coin ? coin.price * h.quantity : 0;
              return (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{h.name}</p>
                    <p className="text-xs text-muted font-mono">
                      {h.quantity} {h.symbol}
                    </p>
                  </div>
                  <p className="font-mono font-semibold text-sm text-ink">{currency(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Market list */}
      <h2 className="text-sm font-semibold text-ink mb-4">Market</h2>
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {prices.map((coin, i) => {
          const up = coin.change24h >= 0;
          return (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{coin.name}</p>
                <p className="text-xs text-muted">{coin.symbol}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-mono font-semibold text-sm text-ink">{currency(coin.price)}</p>
                  <p className={`text-xs flex items-center gap-0.5 justify-end ${up ? "text-emerald" : "text-red-500"}`}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(coin.change24h).toFixed(2)}%
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ coin, action: "buy" })}
                    disabled={accounts.length === 0}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-navy text-background hover:bg-navy-light transition-colors disabled:opacity-40"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setModal({ coin, action: "sell" })}
                    disabled={!wallet?.holdings.some((h) => h.symbol === coin.symbol)}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border text-ink hover:bg-background transition-colors disabled:opacity-40"
                  >
                    Sell
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {modal && (
        <CryptoTradeModal
          coin={modal.coin}
          action={modal.action}
          accounts={accounts}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}