import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import InstallAppButton from "@/components/InstallAppButton";
import StructuredData from "@/components/StructuredData";
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
  manifest: "/manifest.json",
  themeColor: "#14213D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Beltrust",
  },
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${mono.variable}`}>
      <body className="bg-background text-ink font-body antialiased">
        <StructuredData />
        <SessionWrapper>{children}</SessionWrapper>
        <InstallAppButton />
      </body>
    </html>
  );
}