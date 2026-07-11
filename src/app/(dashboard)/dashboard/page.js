"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Send,
  CreditCard,
  Receipt,
  Bitcoin,
  HandCoins,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionList from "@/components/dashboard/TransactionList";

const quickActions = [
  { label: "Send money", href: "/transfers", icon: Send },
  { label: "Pay a bill", href: "/bill-pay", icon: Receipt },
  { label: "Manage cards", href: "/cards", icon: CreditCard },
  { label: "Trade crypto", href: "/crypto", icon: Bitcoin },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loans, setLoans] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [cryptoValue, setCryptoValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountsRes, txRes, billsRes, loansRes, walletRes, pricesRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/transactions?limit=6"),
          fetch("/api/bill-pay"),
          fetch("/api/loans"),
          fetch("/api/crypto"),
          fetch("/api/crypto/prices"),
        ]);

        const accountsData = await accountsRes.json();
        const txData = await txRes.json();
        const billsData = await billsRes.json();
        const loansData = await loansRes.json();
        const walletData = await walletRes.json();
        const pricesData = await pricesRes.json();

        setAccounts(accountsData.accounts || []);
        setTransactions(txData.transactions || []);
        setBills((billsData.bills || []).filter((b) => b.status === "scheduled").slice(0, 3));
        setLoans((loansData.loans || []).filter((l) => l.status === "active"));
        setWallet(walletData.wallet);

        if (walletData.wallet?.holdings?.length > 0 && pricesData.prices) {
          const value = walletData.wallet.holdings.reduce((sum, h) => {
            const coin = pricesData.prices.find((p) => p.symbol === h.symbol);
            return sum + (coin ? coin.price * h.quantity : 0);
          }, 0);
          setCryptoValue(value);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const thisMonthIn = transactions
    .filter((t) => ["deposit", "transfer_in"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthOut = transactions
    .filter((t) => ["withdrawal", "transfer_out", "bill_pay", "card_purchase"].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

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
        <h1 className="font-display font-bold text-2xl text-ink">
          Welcome back, {session?.user?.firstName || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here's what's happening with your money today.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No accounts found yet.</p>
        </div>
      ) : (
        <>
          {/* Total balance + quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <div className="sm:col-span-1 p-6 rounded-2xl bg-navy text-background">
              <p className="text-sm text-background/70 mb-1">Total balance</p>
              <p className="font-mono font-bold text-3xl tracking-tight">
                {currency(totalBalance)}
              </p>
              <p className="text-xs text-background/50 mt-2">
                Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald" />
                <p className="text-sm text-muted">Recent money in</p>
              </div>
              <p className="font-mono font-bold text-xl text-ink tracking-tight">
                {currency(thisMonthIn)}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-muted" />
                <p className="text-sm text-muted">Recent money out</p>
              </div>
              <p className="font-mono font-bold text-xl text-ink tracking-tight">
                {currency(thisMonthOut)}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-border bg-surface hover:border-navy/30 hover:bg-navy/5 transition-colors text-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-navy" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-semibold text-ink">{action.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Account cards */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Your accounts</h2>
            <Link href="/accounts" className="text-xs font-medium text-navy hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {accounts.map((account) => (
              <BalanceCard key={account._id} account={account} />
            ))}
          </div>

          {/* Secondary widgets: bills, loans, crypto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            {/* Upcoming bills */}
            <div className="p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-navy" />
                  Upcoming bills
                </h3>
                <Link href="/bill-pay" className="text-xs text-navy hover:underline">
                  View all
                </Link>
              </div>
              {bills.length === 0 ? (
                <p className="text-xs text-muted">No bills scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div key={bill._id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{bill.payeeName}</p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(bill.nextPaymentDate), "MMM d")}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-medium text-ink shrink-0">
                        {currency(bill.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active loans */}
            <div className="p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <HandCoins className="w-4 h-4 text-navy" />
                  Active loans
                </h3>
                <Link href="/loans" className="text-xs text-navy hover:underline">
                  View all
                </Link>
              </div>
              {loans.length === 0 ? (
                <p className="text-xs text-muted">No active loans.</p>
              ) : (
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <div key={loan._id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-ink capitalize truncate">{loan.type} loan</p>
                        <p className="text-xs text-muted">{loan.interestRate}% APR</p>
                      </div>
                      <p className="font-mono text-sm font-medium text-ink shrink-0">
                        {currency(loan.remainingBalance)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Crypto snapshot */}
            <div className="p-6 rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-navy" />
                  Crypto portfolio
                </h3>
                <Link href="/crypto" className="text-xs text-navy hover:underline">
                  View all
                </Link>
              </div>
              {!wallet?.holdings || wallet.holdings.length === 0 ? (
                <p className="text-xs text-muted">No crypto holdings yet.</p>
              ) : (
                <>
                  <p className="font-mono font-bold text-xl text-ink mb-3">{currency(cryptoValue)}</p>
                  <div className="space-y-2">
                    {wallet.holdings.slice(0, 3).map((h) => (
                      <div key={h.symbol} className="flex items-center justify-between text-xs">
                        <span className="text-muted">{h.name}</span>
                        <span className="font-mono text-ink">{h.quantity} {h.symbol}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
            <Link href="/accounts" className="text-xs font-medium text-navy hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <TransactionList transactions={transactions} />
        </>
      )}
    </div>
  );
}