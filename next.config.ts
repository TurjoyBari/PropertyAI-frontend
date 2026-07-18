import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
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
      {
        source: "/api/public",
        destination: `${apiUrl}/api/public`,
      },
      {
        source: "/api/public/:path*",
        destination: `${apiUrl}/api/public/:path*`,
      },
      {
        source: "/api/favorites",
        destination: `${apiUrl}/api/favorites`,
      },
      {
        source: "/api/favorites/:path*",
        destination: `${apiUrl}/api/favorites/:path*`,
      },
      {
        source: "/api/messages",
        destination: `${apiUrl}/api/messages`,
      },
      {
        source: "/api/messages/:path*",
        destination: `${apiUrl}/api/messages/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${apiUrl}/api/admin/:path*`,
      },
      {
        source: "/api/account/:path*",
        destination: `${apiUrl}/api/account/:path*`,
      },
    ];
  },
};

export default nextConfig;
