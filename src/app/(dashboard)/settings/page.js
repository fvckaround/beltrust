"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const tabs = ["Profile", "Password", "Identity verification"];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account and security preferences.</p>
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
      {activeTab === "Identity verification" && <KYCTab />}
    </div>
  );
}

function ProfileTab({ session }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setForm({
        firstName: session.user.firstName || "",
        lastName: session.user.lastName || "",
        phone: session.user.phone || "",
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
      <Input
        label="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="+1 (555) 000-0000"
      />

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

const kycStatusConfig = {
  not_started: { icon: ShieldAlert, color: "text-muted", bg: "bg-ink/5", label: "Not started" },
  pending: { icon: Clock, color: "text-amber", bg: "bg-amber/10", label: "Under review" },
  approved: { icon: CheckCircle2, color: "text-emerald", bg: "bg-emerald/10", label: "Verified" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Rejected" },
};

function KYCTab() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ idType: "passport", idNumber: "" });
  const [frontFile, setFrontFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchKyc() {
      const res = await fetch("/api/kyc");
      const data = await res.json();
      setKyc(data.kyc);
      setLoading(false);
    }
    fetchKyc();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!frontFile) {
      setError("Please upload a photo of your ID");
      return;
    }

    setSubmitting(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", frontFile);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idType: form.idType,
          idNumber: form.idNumber,
          idFrontImage: uploadData.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setKyc(data.kyc);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 text-muted animate-spin" />
      </div>
    );
  }

  const config = kycStatusConfig[kyc?.status || "not_started"];
  const Icon = config.icon;

  return (
    <div className="max-w-lg space-y-6">
      <div className={`flex items-center gap-3 p-4 rounded-2xl ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.color}`} strokeWidth={2} />
        <div>
          <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          {kyc?.status === "rejected" && kyc.rejectionReason && (
            <p className="text-xs text-muted mt-0.5">{kyc.rejectionReason}</p>
          )}
        </div>
      </div>

      {(!kyc || kyc.status === "rejected") && (
        <form onSubmit={handleSubmit} className="p-7 rounded-2xl border border-border bg-surface space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">ID type</label>
            <select
              value={form.idType}
              onChange={(e) => setForm({ ...form, idType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-ink text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's license</option>
              <option value="national_id">National ID</option>
            </select>
          </div>

          <Input
            label="ID number"
            required
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Photo of ID (front)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFrontFile(e.target.files[0])}
              className="w-full text-sm text-muted file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-navy file:text-background file:text-xs file:font-semibold"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for verification"}
          </Button>
        </form>
      )}
    </div>
  );
}