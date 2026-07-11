"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Placeholder content — replace with real customer testimonials before launch
const testimonials = [
  {
    quote:
      "Switched over my business account and the whole setup took less time than my lunch break. Transfers actually land instantly.",
    name: "Jordan M.",
    role: "Small business owner",
  },
  {
    quote:
      "First bank app where I've actually understood every fee before it hit me. The security alerts caught a card issue before I even noticed.",
    name: "Priya S.",
    role: "Freelance designer",
  },
  {
    quote:
      "Having my crypto and my checking account in the same dashboard sounds small until you've tried it. Haven't opened a separate app in months.",
    name: "Chidi O.",
    role: "Software engineer",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            What people are saying
          </span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-ink leading-tight">
            Built for people who'd rather bank and move on.
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              className="p-7 rounded-2xl border border-border bg-surface"
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber fill-amber"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <p className="text-sm text-ink leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}