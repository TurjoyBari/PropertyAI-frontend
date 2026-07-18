import type { ApiSuccess } from "@/types/dashboard";
import type {
  AiStatus,
  ChatAgentResponse,
  MatchPropertiesResponse,
  ScoreLeadResponse,
} from "@/types/ai";
import type { PropertyType } from "@/types/property";

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "AI request failed");
  }
  return (payload as ApiSuccess<T>).data;
}

export async function getAiStatus() {
  const response = await fetch("/api/ai/status", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<AiStatus>(response);
}

export async function matchProperties(input: {
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  bedrooms?: number;
  propertyType?: PropertyType | "";
  notes?: string;
}) {
  const response = await fetch("/api/ai/match-properties", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      propertyType: input.propertyType || undefined,
    }),
  });
  return parse<MatchPropertiesResponse>(response);
}

export async function scoreLead(leadId: string) {
  const response = await fetch("/api/ai/score-lead", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId }),
  });
  return parse<ScoreLeadResponse>(response);
}

export async function chatWithAgent(input: {
  message: string;
  propertyId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<ChatAgentResponse>(response);
}
