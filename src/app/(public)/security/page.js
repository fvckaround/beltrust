"use client";

import { motion } from "framer-motion";
import { Lock, KeyRound, Eye, ShieldCheck, Server, Bell } from "lucide-react";

const measures = [
  {
    icon: Lock,
    title: "256-bit encryption",
    description:
      "All data in transit and at rest is encrypted using industry-standard AES-256 encryption, the same level trusted by major financial institutions worldwide.",
  },
  {
    icon: KeyRound,
    title: "Two-factor authentication",
    description:
      "Add a second layer of verification to your account so a leaked password alone is never enough to gain access.",
  },
  {
    icon: Eye,
    title: "24/7 fraud monitoring",
    description:
      "Every transaction is screened against unusual activity patterns in real time, with instant alerts the moment something looks out of place.",
  },
  {
    icon: ShieldCheck,
    title: "Account freeze controls",
    description:
      "Freeze your cards or accounts instantly from your dashboard the moment you suspect something is wrong — no phone call required.",
  },
  {
    icon: Server,
    title: "Isolated infrastructure",
    description:
      "Customer data is stored in access-controlled systems separate from public-facing infrastructure, with strict internal permission boundaries.",
  },
  {
    icon: Bell,
    title: "Real-time alerts",
    description:
      "Get notified immediately for logins, transfers, and account changes so you're never the last to know what's happening with your money.",
  },
];

export default function SecurityPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Security
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-ink leading-tight">
            How we protect your money.
          </h1>
          <p className="mt-4 text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Trust isn't a feature we bolted on — it's the foundation everything
            else at Beltrust is built on top of.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {measures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="p-6 rounded-2xl border border-border bg-surface"
              >
                <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-navy" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-base text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-2xl border border-border bg-surface"
        >
          <h2 className="font-display font-bold text-xl text-ink mb-3">
            Something look wrong on your account?
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-4">
            If you notice a transaction you don't recognize or suspect
            unauthorized access, freeze your account immediately from your
            dashboard and reach out to our support team.
          </p>
          <a
            href="/contact"
            className="inline-flex text-sm font-semibold text-navy hover:underline"
          >
            Contact support →
          </a>
        </motion.div>
      </div>
    </div>
  );
}