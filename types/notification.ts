export type AppNotification = {
  _id: string;
  title: string;
  body: string;
  channel: "in_app" | "email" | "whatsapp";
  status: "pending" | "sent" | "failed" | "read";
  recipient?: string;
  createdAt?: string;
};

export type SendNotificationInput = {
  title: string;
  body: string;
  channel: "in_app" | "email" | "whatsapp";
  email?: string;
  phone?: string;
};
