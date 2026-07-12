"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "447397665462"; // no +, no spaces, per WhatsApp link format
const DEFAULT_MESSAGE = "Hi Beltrust, I have a question about my account.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-emerald text-background shadow-lg hover:bg-emerald/90 transition-colors sm:bottom-6 sm:left-6"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" strokeWidth={2} fill="currentColor" />
    </a>
  );
}