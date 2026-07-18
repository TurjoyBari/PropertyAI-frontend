import type { ApiSuccess } from "@/types/dashboard";

export type AppMessage = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  propertyId?: string;
  isRead: boolean;
  createdAt?: string;
};

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.message || "Request failed");
  return (payload as ApiSuccess<T>).data;
}

export async function listMessages() {
  const response = await fetch("/api/messages", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<AppMessage[]>(response);
}

export async function sendMessage(input: {
  toUserId: string;
  body: string;
  propertyId?: string;
}) {
  const response = await fetch("/api/messages", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<AppMessage>(response);
}
