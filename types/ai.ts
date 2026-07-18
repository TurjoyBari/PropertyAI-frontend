export type AiStatus = {
  configured: boolean;
  features: string[];
  model: string;
};

export type MatchPropertyResult = {
  propertyId: string;
  matchScore: number;
  reason: string;
  highlights?: string[];
  property: {
    _id: string;
    title: string;
    type: string;
    status: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    location?: {
      city?: string;
      area?: string;
      address?: string;
    };
    images?: string[];
  };
};

export type MatchPropertiesResponse = {
  criteria: Record<string, unknown>;
  matches: MatchPropertyResult[];
  alternatives: MatchPropertyResult[];
  summary: string;
  mode: "empty" | "live";
};

export type ScoreLeadResponse = {
  leadId: string;
  score: number;
  temperature: "hot" | "warm" | "cold";
  conversionProbability: number;
  recommendedNextAction: string;
  rationale: string;
  factors: string[];
};

export type ChatAgentResponse = {
  reply: string;
  propertyId: string | null;
  mode: "text-agent";
};
