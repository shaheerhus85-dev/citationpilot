/** @type {import('next').NextConfig} */
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://citationpilot-production.up.railway.app"
)
  .replace("http://", "https://")
  .replace(/\/+$/, "");

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
    NEXT_PUBLIC_API_BASE_URL: API_ORIGIN,
    NEXT_PUBLIC_API_URL: API_ORIGIN,
  },
};

module.exports = nextConfig;
