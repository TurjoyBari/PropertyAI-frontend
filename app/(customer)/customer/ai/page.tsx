"use client";

import { AiPropertyFinder } from "@/components/public/ai-property-finder";
import { CustomerPageHeader } from "@/components/customer/page-header";
import { PageTransition } from "@/components/customer/page-transition";

export default function CustomerAiPage() {
  return (
    <PageTransition>
      <div className="space-y-8">
        <CustomerPageHeader
          title="AI Property Finder"
          subtitle="Describe your budget, neighborhood, and lifestyle — we’ll rank verified homes for you."
        />
        <AiPropertyFinder compact />
      </div>
    </PageTransition>
  );
}
