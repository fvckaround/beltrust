import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Beltrust Bank | Banking that moves with you",
  description:
    "Accounts, transfers, cards, loans, and crypto — all in one trusted place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="bg-background text-ink font-body antialiased">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}