"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, Users2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            About Beltrust
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-ink leading-tight">
            Banking, rebuilt around trust.
          </h1>
          <p className="mt-4 text-base text-muted max-w-2xl mx-auto leading-relaxed">
            We started Beltrust with a simple premise: a bank should be as
            transparent with your money as it expects you to be honest with
            it. No hidden fees, no fine print designed to confuse — just a
            clear, secure place to hold and move your money.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: ShieldCheck,
              title: "Security first",
              description:
                "Every feature is built with your money's safety as the starting constraint, not an afterthought.",
            },
            {
              icon: Target,
              title: "No hidden fees",
              description:
                "What you see when you open an account is what you'll experience for as long as you bank with us.",
            },
            {
              icon: Users2,
              title: "Built for real people",
              description:
                "Our features come from what actual customers need, not what looks good in a pitch deck.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
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
          className="p-8 sm:p-12 rounded-2xl bg-navy text-background text-center"
        >
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-4">
            Our commitment to you
          </h2>
         
        </motion.div>
      </div>
    </div>
  );
}