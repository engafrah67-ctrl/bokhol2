import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

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
      ...(supabaseHost ? [{ protocol: 'https' as const, hostname: supabaseHost }] : []),
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
