"use client";

import { PageTransition } from "@/components/customer/page-transition";
import { MessagesView } from "@/components/messages/messages-view";

export default function CustomerMessagesPage() {
  return (
    <PageTransition>
      <MessagesView
        title="Messages"
        subtitle="Stay in touch with agents about listings and visits."
        peerLabel="Agent user ID"
        toUserPlaceholder="Paste agent ID from your contact"
        emptyInboxText="No conversations yet. Message an agent to get started."
      />
    </PageTransition>
  );
}
