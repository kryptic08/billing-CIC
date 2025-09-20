import { PricingCreative } from "@/Components/Modern Pricing";
import NavBar from "@/Components/Nav";
import { HeroSectionOne } from "@/Components/Showcase Hero";
import { Footer } from "@/Components/Footer";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import React from "react";
import StatsSection from "@/Components/StatsSection";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex w-full flex-col font-sans overflow-x-hidden">
      {/* Navigation */}
      <NavBar />

      {/* Main Content */}
      <main className="flex-1 flex w-full flex-col items-center pt-16 sm:pt-20 overflow-x-hidden">
        {/* Hero Section with Enhanced Spacing */}
        <div className="w-full flex flex-col px-2 mt-4 sm:px-4 max-w-full overflow-hidden">
          <HeroSectionOne user={user} />
        </div>

        {/* Pricing Section with Better Spacing */}
        <StatsSection />

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <PricingCreative />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
