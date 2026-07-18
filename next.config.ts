import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  /**
   * Proxy Better Auth through the Next.js origin so HTTP-only cookies
   * stay first-party (localhost:3000) instead of cross-port to :4000.
   */
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: "/api/dashboard/:path*",
        destination: `${apiUrl}/api/dashboard/:path*`,
      },
      {
        source: "/api/properties",
        destination: `${apiUrl}/api/properties`,
      },
      {
        source: "/api/properties/:path*",
        destination: `${apiUrl}/api/properties/:path*`,
      },
      {
        source: "/api/leads",
        destination: `${apiUrl}/api/leads`,
      },
      {
        source: "/api/leads/:path*",
        destination: `${apiUrl}/api/leads/:path*`,
      },
      {
        source: "/api/visits",
        destination: `${apiUrl}/api/visits`,
      },
      {
        source: "/api/visits/:path*",
        destination: `${apiUrl}/api/visits/:path*`,
      },
      {
        source: "/api/reports/:path*",
        destination: `${apiUrl}/api/reports/:path*`,
      },
      {
        source: "/api/notifications",
        destination: `${apiUrl}/api/notifications`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `${apiUrl}/api/notifications/:path*`,
      },
      {
        source: "/api/uploads/:path*",
        destination: `${apiUrl}/api/uploads/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiUrl}/uploads/:path*`,
      },
      {
        source: "/api/ai",
        destination: `${apiUrl}/api/ai`,
      },
      {
        source: "/api/ai/:path*",
        destination: `${apiUrl}/api/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;
