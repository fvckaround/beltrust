"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, UserPlus } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const tabs = ["Profile", "Password", "Promote admin"];

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your admin account.</p>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-surface border border-border w-fit mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-navy text-background" : "text-muted hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Profile" && <ProfileTab session={session} />}
      {activeTab === "Password" && <PasswordTab />}
      {activeTab === "Promote admin" && <PromoteTab />}
    </div>
  );
}

function ProfileTab({ session }) {
  const [form, setForm] = useState({ firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setForm({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
      });
    }
  }, [session]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
      return;
    }

    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-7 rounded-2xl border border-border bg-surface space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <Input
          label="Last name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
      </div>
      <Input label="Email" value={session?.user?.email || ""} disabled className="opacity-60" />

      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-emerald bg-emerald-light border border-emerald/20 rounded-xl px-4 py-2.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Profile updated
        </motion.p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
      </Button>
    </form>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }

    setSuccess(true);
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-7 rounded-2xl border border-border bg-surface space-y-4">
      <Input
        label="Current password"
        type="password"
        required
        value={form.currentPassword}
        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
      />
      <Input
        label="New password"
        type="password"
        required
        minLength={8}
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
      />
      <Input
        label="Confirm new password"
        type="password"
        required
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
      />

      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-emerald bg-emerald-light border border-emerald/20 rounded-xl px-4 py-2.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Password updated
        </motion.p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
      </Button>
    </form>
  );
}

function PromoteTab() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/admin/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Promotion failed");
      return;
    }

    setSuccess(data.message);
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-7 rounded-2xl border border-border bg-surface space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center">
          <UserPlus className="w-4.5 h-4.5 text-navy" strokeWidth={2} />
        </div>
        <p className="text-sm text-muted">
          Grant admin access to an existing Beltrust customer account.
        </p>
      </div>

      <Input
        label="Customer email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="customer@example.com"
      />

      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
      {success && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-emerald bg-emerald-light border border-emerald/20 rounded-xl px-4 py-2.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </motion.p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Grant admin access"}
      </Button>
    </form>
  );
}