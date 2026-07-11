"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, KeyRound } from "lucide-react";

const pillars = [
  {
    icon: Lock,
    title: "256-bit encryption",
    description:
      "Every transaction, login, and stored detail is encrypted to the same standard used by major financial institutions.",
  },
  {
    icon: KeyRound,
    title: "Two-factor authentication",
    description:
      "A second layer of verification on every sign-in, so your account stays yours even if a password leaks.",
  },
  {
    icon: Eye,
    title: "24/7 fraud monitoring",
    description:
      "Every transaction is screened in real time, with instant alerts the moment something looks out of place.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed & regulated",
    description:
      "Beltrust operates under full regulatory oversight, with deposits held to FDIC-eligible standards.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security-preview" className="py-24 md:py-32 bg-navy relative overflow-hidden">
      {/* Ambient background accent */}
      <div className="absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald/10 blur-3xl animate-float" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Security first
          </span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-background leading-tight">
            Trust isn&apos;t a feature here. It&apos;s the foundation.
          </h2>
          <p className="mt-4 text-base text-background/70 leading-relaxed">
            Your money and your data are protected by the same layered
            security practices used by institutions holding billions in
            deposits — not bolted on, built in from day one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald/15 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-emerald" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-base text-background mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-background/60 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}