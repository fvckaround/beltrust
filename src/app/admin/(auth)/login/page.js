"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError(
        result.error === "CredentialsSignin" ? "Incorrect email or password" : result.error
      );
      return;
    }

    // Verify the logged-in user is actually an admin
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    setLoading(false);

    if (session?.user?.role !== "admin") {
      setError("This account doesn't have admin access.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-background" strokeWidth={2} />
          </div>
          <h1 className="font-display font-bold text-xl text-background">Beltrust Admin</h1>
          <p className="mt-1 text-sm text-background/60">Restricted access</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-background/5 border border-background/10 backdrop-blur-sm space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-background mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-background/15 bg-background/5 text-background text-sm placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald/40"
              placeholder="admin@beltrustbank.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-background mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-background/15 bg-background/5 text-background text-sm placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-emerald hover:bg-emerald/90">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-background/40">
          This portal is for authorized Beltrust staff only.
        </p>
      </motion.div>
    </div>
  );
}