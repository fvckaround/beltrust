"use client";

import { useState, useEffect } from "react";
import { Download, Share, X, Plus } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already running as installed app
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS Safari never fires beforeinstallprompt — detect iOS Safari specifically
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios/i.test(window.navigator.userAgent);
    if (isIos && isSafari) {
      setShowButton(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowButton(false);
      }
      setDeferredPrompt(null);
      return;
    }

    // No deferredPrompt available — must be iOS Safari, show manual instructions
    setShowIosModal(true);
  }

  if (isStandalone || !showButton) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-navy text-background text-sm font-semibold shadow-lg hover:bg-navy-light transition-colors sm:bottom-6 sm:right-6"
      >
        <Download className="w-4 h-4" />
        Install app
      </button>

      {showIosModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => setShowIosModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-ink">Install Beltrust</h3>
              <button onClick={() => setShowIosModal(false)} className="text-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-4 text-sm text-ink">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-navy/10 text-navy text-xs font-bold flex items-center justify-center">1</span>
                <span className="flex items-center gap-1.5">
                  Tap the Share icon <Share className="w-4 h-4 inline text-navy" /> in your browser toolbar
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
          </div>
        </div>
      )}
    </>
  );
}