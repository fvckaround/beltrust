"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Search, ArrowRight } from "lucide-react";

const statusConfig = {
  active: { color: "text-emerald", bg: "bg-emerald/10", label: "Active" },
  suspended: { color: "text-red-500", bg: "bg-red-50", label: "Suspended" },
  pending_verification: { color: "text-amber", bg: "bg-amber/10", label: "Pending" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchUsers(query = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const currency = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Users</h1>
        <p className="mt-1 text-sm text-muted">
          {users.length} customer{users.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-muted animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-surface text-center">
          <p className="text-sm text-muted">No users found.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted">Name</th>
                <th className="px-5 py-3 font-medium text-muted">Email</th>
                <th className="px-5 py-3 font-medium text-muted">Status</th>
                <th className="px-5 py-3 font-medium text-muted">KYC</th>
                <th className="px-5 py-3 font-medium text-muted text-right">Balance</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const config = statusConfig[user.status] || statusConfig.pending_verification;
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-b-0 hover:bg-background/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-ink whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-5 py-4 text-muted whitespace-nowrap">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted capitalize whitespace-nowrap">
                      {user.kycStatus.replace("_", " ")}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-ink whitespace-nowrap">
                      {currency(user.totalBalance)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy hover:underline"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}