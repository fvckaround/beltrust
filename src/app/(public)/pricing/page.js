"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Personal",
    price: "Free",
    description: "Everyday banking with no monthly fees.",
    features: [
      "Checking & savings accounts",
      "Free virtual debit card",
      "Unlimited transfers between your accounts",
      "Bill pay & scheduling",
      "Mobile & web access",
    ],
    cta: "Open an account",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "$9/mo",
    description: "For customers who want more from their money.",
    features: [
      "Everything in Personal",
      "2.5% APY on savings",
      "Free physical card, no shipping fee",
      "Crypto trading with no per-trade fee",
      "Priority support",
    ],
    cta: "Get started",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Business",
    price: "Custom",
    description: "Built for teams and growing companies.",
    features: [
      "Everything in Plus",
      "Multiple team member access",
      "Business loans with dedicated review",
      "Higher transfer limits",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Pricing
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-ink leading-tight">
            Simple pricing, no surprises.
          </h1>
          <p className="mt-4 text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Pick the plan that fits how you bank. Upgrade or downgrade
            anytime — no fees for switching.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-8 rounded-2xl border ${
                plan.highlighted
                  ? "border-navy bg-navy text-background relative"
                  : "border-border bg-surface"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-emerald text-background text-xs font-semibold">
                  Most popular
                </span>
              )}
              <h3 className={`font-display font-bold text-lg mb-1 ${plan.highlighted ? "text-background" : "text-ink"}`}>
                {plan.name}
              </h3>
              <p className={`text-3xl font-display font-extrabold mb-2 ${plan.highlighted ? "text-background" : "text-ink"}`}>
                {plan.price}
              </p>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-background/70" : "text-muted"}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-emerald" : "text-emerald"}`}
                      strokeWidth={2.5}
                    />
                    <span className={`text-sm ${plan.highlighted ? "text-background/90" : "text-ink"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center text-sm font-semibold px-6 py-3 rounded-full transition-colors ${
                  plan.highlighted
                    ? "bg-emerald text-background hover:bg-emerald/90"
                    : "bg-navy text-background hover:bg-navy-light"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}