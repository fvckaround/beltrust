import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import SecuritySection from "@/components/landing/SecuritySection";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

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