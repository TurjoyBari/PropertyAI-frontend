import type { ApiSuccess } from "@/types/dashboard";
import type { AppNotification, SendNotificationInput } from "@/types/notification";

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }
  return (payload as ApiSuccess<T>).data;
}

export async function listNotifications() {
  const response = await fetch("/api/notifications", {
    credentials: "include",
    cache: "no-store",
  });
  return parse<AppNotification[]>(response);
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  return parse<AppNotification | null>(response);
}

export async function sendNotification(input: SendNotificationInput) {
  const response = await fetch("/api/notifications/send", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<AppNotification>(response);
}
