import { AiStudioView } from "@/components/ai/ai-studio-view";

export default function CustomerAiPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Customer AI Finder — use the Property Matching tab. Lead scoring is for staff only.
      </p>
      <AiStudioView />
    </div>
  );
}
