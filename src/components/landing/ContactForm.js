"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Contact us
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl tracking-tight text-ink leading-tight">
            We're here to help.
          </h1>
          <p className="mt-4 text-base text-muted leading-relaxed">
            Questions about your account, a transaction, or just want to say
            hello — send us a message and we'll get back to you.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="p-7 rounded-2xl border border-border bg-surface space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <Input
            label="Subject"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40 resize-none"
              placeholder="How can we help?"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-emerald bg-emerald-light border border-emerald/20 rounded-xl px-4 py-2.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Message sent — we'll be in touch soon.
            </motion.p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send message"
            )}
          </Button>
        </motion.form>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Or email us directly at{" "}
            <a href="mailto:beltrusts@outlook.com" className="text-navy hover:underline">
              beltrusts@outlook.com
            </a>
          </div>
          <a
            href="https://wa.me/447397665462"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald hover:underline"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}