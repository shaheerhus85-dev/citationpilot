/** @type {import('next').NextConfig} */
const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL || "https://citationpilot-production.up.railway.app").replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    webpackBuildWorker: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://citationpilot-production.up.railway.app",
    NEXT_PUBLIC_API_BASE_PATH:
      process.env.NEXT_PUBLIC_API_BASE_PATH || "/backend",
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
