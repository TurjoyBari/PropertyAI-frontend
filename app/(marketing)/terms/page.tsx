export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          PropertyAI is a discovery and CRM platform. Listings, prices, and availability are
          provided by agents and may change without notice.
        </p>
        <p>
          AI recommendations are decision support tools, not legal, financial, or investment advice.
          Always verify property details before booking or signing.
        </p>
        <p>
          Misuse of accounts, spam inquiries, or unauthorized scraping may result in access
          suspension. Contact us for partnership or data requests.
        </p>
      </div>
    </div>
  );
}
