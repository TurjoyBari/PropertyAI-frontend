import type { ApiSuccess } from "@/types/dashboard";
import type {
  AiStatus,
  ChatAgentResponse,
  GenerateDescriptionResponse,
  LeadSummaryResponse,
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
  query?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType | "";
  nearMetro?: boolean;
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

export async function generatePropertyDescription(input: {
  title: string;
  location: string;
  features?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  currency?: string;
  amenities?: string[];
}) {
  const response = await fetch("/api/ai/generate-description", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<GenerateDescriptionResponse>(response);
}

export async function summarizeLead(leadId: string) {
  const response = await fetch("/api/ai/summarize-lead", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId }),
  });
  return parse<LeadSummaryResponse>(response);
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
  lastShownPropertyIds?: string[];
}) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<ChatAgentResponse>(response);
}

export async function publicChatWithAgent(input: {
  message: string;
  propertyId?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  lastShownPropertyIds?: string[];
}) {
  const response = await fetch("/api/public/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<ChatAgentResponse>(response);
}

export type ChatHistoryPayload = {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    at?: string | Date;
    matches?: unknown[];
  }>;
  lastShownPropertyIds?: string[];
  quickReplies?: string[];
};

export async function getChatHistory() {
  const response = await fetch("/api/ai/chat-history", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<ChatHistoryPayload>(response);
}

export async function saveChatHistory(body: ChatHistoryPayload) {
  const response = await fetch("/api/ai/chat-history", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parse<ChatHistoryPayload>(response);
}

export async function clearChatHistory() {
  const response = await fetch("/api/ai/chat-history", {
    method: "DELETE",
    credentials: "include",
  });
  return parse<{ cleared: boolean }>(response);
}
