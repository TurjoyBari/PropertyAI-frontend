import Link from "next/link";
import { BLOG_POSTS } from "@/lib/home-content";

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Guides, market notes, and AI tips for smarter property decisions.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--accent)]">{post.tag}</p>
            <h2 className="mt-3 font-semibold">{post.title}</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Full articles will publish here soon. Contact us if you want early access tips.
            </p>
            <Link href="/contact" className="mt-4 inline-flex text-sm text-[var(--accent)] hover:underline">
              Ask an expert
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
