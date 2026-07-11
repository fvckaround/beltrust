"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Signature gradient orb */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-navy/10 blur-3xl animate-float" />
        <div className="absolute top-[10%] left-[60%] w-[500px] h-[500px] rounded-full bg-emerald/10 blur-3xl animate-float [animation-delay:-4s]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm mb-8"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
          <span className="text-xs font-medium text-muted tracking-wide">
            FDIC-eligible accounts · Bank-grade encryption
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-ink leading-[1.05]"
        >
          Banking you can
          <br />
          <span className="text-navy">rely on.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Accounts, cards, loans, transfers, and crypto — held to the same
          standard of security and clarity, in one place built to earn your trust.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-background bg-navy hover:bg-navy-light transition-colors px-6 py-3.5 rounded-full w-full sm:w-auto justify-center"
          >
            Open an account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink border border-border hover:border-navy/30 hover:bg-surface transition-colors px-6 py-3.5 rounded-full w-full sm:w-auto justify-center"
          >
            <Lock className="w-4 h-4" />
            How we protect you
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-medium text-muted"
        >
          <span>256-bit encryption</span>
          <span className="hidden sm:inline text-border">•</span>
          <span>Two-factor authentication</span>
          <span className="hidden sm:inline text-border">•</span>
          <span>24/7 fraud monitoring</span>
          <span className="hidden sm:inline text-border">•</span>
          <span>Licensed & regulated</span>
        </motion.div>
      </div>
    </section>
  );
}