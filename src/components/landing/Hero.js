"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[750px] flex items-center pt-20">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-dark/70 via-navy-dark/50 to-navy-dark/80" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-background/20 bg-background/10 backdrop-blur-sm mb-8"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
          <span className="text-xs font-medium text-background/80 tracking-wide">
            FDIC-eligible accounts · Bank-grade encryption
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-background leading-[1.05]"
        >
          Banking you can
          <br />
          <span className="text-emerald">rely on.</span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-background/80 max-w-2xl mx-auto leading-relaxed"
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
            className="group inline-flex items-center gap-2 text-sm font-semibold text-navy bg-background hover:bg-background/90 transition-colors px-6 py-3.5 rounded-full w-full sm:w-auto justify-center"
          >
            Open an account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-sm font-semibold text-background border border-background/30 hover:border-background/50 hover:bg-background/10 transition-colors px-6 py-3.5 rounded-full w-full sm:w-auto justify-center"
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
          className="mt-16 pt-8 border-t border-background/20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-medium text-background/70"
        >
          <span>256-bit encryption</span>
          <span className="hidden sm:inline text-background/30">•</span>
          <span>Two-factor authentication</span>
          <span className="hidden sm:inline text-background/30">•</span>
          <span>24/7 fraud monitoring</span>
          <span className="hidden sm:inline text-background/30">•</span>
          <span>Licensed & regulated</span>
        </motion.div>
      </div>
    </section>
  );
}