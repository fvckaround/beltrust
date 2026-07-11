"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Send,
  HandCoins,
  CreditCard,
  ShieldCheck,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Transfer Requests", href: "/admin/transfers", icon: Send },
  { label: "Loans", href: "/admin/loans", icon: HandCoins },
  { label: "Cards", href: "/admin/cards", icon: CreditCard },
  { label: "KYC Review", href: "/admin/kyc", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ admin }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${admin?.firstName?.[0] ?? "A"}${admin?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-navy-dark border-b border-background/10 flex items-center justify-between px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-navy-dark" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-background">
            Beltrust Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 text-background"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-navy-dark pt-16 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald text-navy-dark"
                    : "text-background/60 hover:bg-background/5 hover:text-background"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4"
          >
            <LogOut className="w-4.5 h-4.5" />
            Log out
          </button>
        </nav>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-navy-dark border-r border-background/10 z-40">
        <div className="h-16 flex items-center px-6 border-b border-background/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-navy-dark" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-background">
              Beltrust Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald text-navy-dark"
                    : "text-background/60 hover:bg-background/5 hover:text-background"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-background/10">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-emerald">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-background truncate">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-background/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-1"
          >
            <LogOut className="w-4.5 h-4.5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}