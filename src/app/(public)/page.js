import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SecuritySection from "@/components/landing/SecuritySection";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export const metadata = {
  title: "Beltrust Bank | Banking that moves with you",
  description:
    "Open a Beltrust account for checking, savings, cards, loans, transfers, and crypto — all secured with bank-grade encryption. Banking you can rely on.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <SecuritySection />
      <Testimonials />
      <CTA />
    </>
  );
}