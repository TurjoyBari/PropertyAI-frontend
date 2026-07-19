export type AiStatus = {
  configured: boolean;
  features: string[];
  model: string;
  provider?: string;
  philosophy?: string;
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
    areaSqFt?: number;
  };
};

export type MatchPropertiesResponse = {
  criteria: Record<string, unknown>;
  matches: MatchPropertyResult[];
  alternatives: MatchPropertyResult[];
  summary: string;
  mode: "empty" | "live" | "fallback" | "cache";
  notice?: string;
  aiUsed?: boolean;
  suggestions?: string[];
};

export type ScoreLeadResponse = {
  leadId: string;
  score: number;
  temperature: "hot" | "warm" | "cold";
  conversionProbability: number;
  recommendedNextAction: string;
  rationale: string;
  factors: string[];
  customerInterest?: string;
  budget?: string;
  preferredLocation?: string;
  conversationSummary?: string;
  mode?: "empty" | "live" | "fallback" | "cache";
  notice?: string;
};

export type LeadSummaryResponse = ScoreLeadResponse & {
  customerInterest: string;
  budget: string;
  preferredLocation: string;
  conversationSummary: string;
};

export type GenerateDescriptionResponse = {
  description: string;
  seoDescription: string;
  marketingCaption: string;
  mode: "empty" | "live" | "fallback" | "cache";
  notice?: string;
};

export type ChatAgentResponse = {
  reply: string;
  propertyId: string | null;
  mode: "text-agent" | "fallback";
  intent?: string;
  notice?: string;
  criteria?: Record<string, unknown>;
  matches?: MatchPropertyResult[];
  lastShownPropertyIds?: string[];
  quickReplies?: string[];
  bookVisitUrl?: string;
  bookVisitLabel?: string;
  favoritesUrl?: string;
  propertyDetail?: {
    id: string;
    title: string;
    price: number;
    currency: string;
    priceLabel: string;
    locationLabel: string;
    bedrooms: number;
    bathrooms: number;
    areaLabel: string;
    description: string;
    features: string;
    agentName: string;
    availability: string;
    images: string[];
  };
};
