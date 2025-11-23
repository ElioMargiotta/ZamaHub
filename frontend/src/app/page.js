"use client";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#E8DCC4] via-[#7FAFCE] to-[#E8DCC4]">
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </main>
  );
}
