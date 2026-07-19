import { MessagesView } from "@/components/messages/messages-view";

/** Ops messages for agents (and admins using the ops console). */
export default function OpsMessagesPage() {
  return (
    <MessagesView
      title="Messages"
      subtitle="Chat with customers and teammates about listings and visits."
      peerLabel="Recipient user ID"
      toUserPlaceholder="Customer or teammate user ID"
      emptyInboxText="No conversations yet."
    />
  );
}
