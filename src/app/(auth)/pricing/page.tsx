"use client";

import { PricingHeader } from "./PricingHeader";
import { PricingTableSection } from "./PricingTableSection";
import { PricingFooter } from "./PricingFooter";

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 pt-10 pb-20">
      <PricingHeader />
      <PricingTableSection />
      <PricingFooter />
    </main>
  );
}
