"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share, Plus, Smartphone, X } from "lucide-react";

export default function InstallSection() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const iosCheck = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIos(iosCheck);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowIosModal(true);
  }

  if (isStandalone) return null;

  return (
    <section className="py-24 md:py-32 bg-surface">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-navy p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-emerald/10 blur-3xl" />

          <div className="relative z-10 shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-background/10 border border-background/15 flex items-center justify-center">
              <Smartphone className="w-11 h-11 text-emerald" strokeWidth={1.5} />
            </div>
          </div>

          <div className="relative z-10 flex-1 text-center md:text-left">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-background leading-tight mb-2">
              Take Beltrust with you.
            </h2>
            <p className="text-background/70 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
              Install the app on your phone for instant access to your
              accounts, cards, and transfers — right from your home screen.
            </p>

            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy bg-background hover:bg-background/90 transition-colors px-6 py-3.5 rounded-full"
            >
              <Download className="w-4 h-4" />
              Install the app
            </button>
          </div>
        </motion.div>
      </div>

      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => setShowIosModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-background border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Install Beltrust</h3>
              <button onClick={() => setShowIosModal(false)} className="text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIos ? (
              <ol className="space-y-4 text-sm text-ink">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">1</span>
                  <span className="flex items-center gap-1.5">
                    Tap the Share icon <Share className="w-4 h-4 inline text-navy" /> in Safari's toolbar
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">2</span>
                  <span className="flex items-center gap-1.5">
                    Scroll down and tap <strong>Add to Home Screen</strong> <Plus className="w-4 h-4 inline text-navy" />
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner</span>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-muted leading-relaxed">
                To install, open your browser's menu and look for
                "Install app" or "Add to Home screen." This works best in
                Chrome, Edge, or Safari on mobile.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}