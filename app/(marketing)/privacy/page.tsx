export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          PropertyAI collects account, inquiry, and usage data to provide property search, AI
          recommendations, visit booking, and agent communication.
        </p>
        <p>
          We do not sell personal data. Access is limited to authorized agents and admins working
          on your requests. You may request account updates or deletion via Contact.
        </p>
        <p>
          Cookies and session tokens are used for authentication and secure API access. Third-party
          map embeds may set their own cookies when you view location maps.
        </p>
      </div>
    </div>
  );
}
