"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Landmark, HandCoins, ShieldAlert } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  const cards = [
    { label: "Total customers", value: stats?.totalUsers ?? 0, icon: Users },
    { label: "Total deposits", value: currency(stats?.totalDeposits), icon: Landmark },
    { label: "Pending loans", value: stats?.pendingLoans ?? 0, icon: HandCoins },
    { label: "Pending KYC", value: stats?.pendingKyc ?? 0, icon: ShieldAlert },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Overview</h1>
        <p className="mt-1 text-sm text-muted">Beltrust Bank at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-6 rounded-2xl border border-border bg-surface">
              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-navy" strokeWidth={2} />
              </div>
              <p className="text-sm text-muted mb-1">{card.label}</p>
              <p className="font-mono font-bold text-2xl text-ink tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}