import { MessagesView } from "@/components/messages/messages-view";

export default function AdminMessagesPage() {
  return (
    <MessagesView
      title="Messages"
      subtitle="Communicate with agents and customers from the admin console."
      peerLabel="Recipient user ID"
      toUserPlaceholder="Agent or customer user ID"
      emptyInboxText="No conversations yet. Start a message to an agent or customer."
    />
  );
}
