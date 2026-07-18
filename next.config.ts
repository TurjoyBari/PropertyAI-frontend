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
    ];
  },
};

export default nextConfig;
