import { PublicShell } from "@/components/public/public-shell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
