"use client";

import { motion } from "framer-motion";
import {
  Landmark,
  CreditCard,
  HandCoins,
  Bitcoin,
  Receipt,
  ArrowLeftRight,
} from "lucide-react";

const features = [
  {
    id: "accounts",
    icon: Landmark,
    title: "Accounts",
    description:
      "Checking and savings accounts with no hidden fees, real-time balances, and same-day access to your money.",
  },
  {
    id: "transfers",
    icon: ArrowLeftRight,
    title: "Transfers",
    description:
      "Move money instantly between your accounts or to anyone else's bank, with full visibility on every transfer.",
  },
  {
    id: "cards",
    icon: CreditCard,
    title: "Cards",
    description:
      "Virtual and physical debit cards you can freeze, set limits on, and track spending from in real time.",
  },
  {
    id: "loans",
    icon: HandCoins,
    title: "Loans",
    description:
      "Personal and business loans with transparent rates and a decision in minutes, not weeks.",
  },
  {
    id: "crypto",
    icon: Bitcoin,
    title: "Crypto",
    description:
      "Buy, hold, and track major cryptocurrencies alongside your cash — one dashboard, one login.",
  },
  {
    id: "bill-pay",
    icon: Receipt,
    title: "Bill pay",
    description:
      "Schedule and automate recurring payments so nothing's ever late, with reminders before every due date.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="accounts" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Everything, in one place
          </span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-ink leading-tight">
            One login. Every part of your money.
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed">
            No juggling apps between your bank, your broker, and your crypto
            wallet. Beltrust brings all of it under one roof — and one standard
            of security.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={item}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative p-7 rounded-2xl border border-border bg-surface hover:border-navy/20 hover:shadow-[0_8px_30px_rgba(20,33,61,0.08)] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-navy/5 flex items-center justify-center mb-5 group-hover:bg-navy/10 transition-colors">
                  <Icon className="w-5 h-5 text-navy" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-lg text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}