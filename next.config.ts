import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'sfbixmrmdfignczavzbw.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    // Keep pages cached client-side for instant back/forward navigation
    staleTimes: {
      dynamic: 30,   // dynamic routes: cache 30s
      static: 300,   // static routes: cache 5min
    },
  },
};

export default nextConfig;
