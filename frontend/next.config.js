/** @type {import('next').NextConfig} */
function normalizeApiOrigin(raw) {
  const value = (raw || "https://citationpilot-production.up.railway.app").trim().replace(/\/+$/, "");
  if (!value) return "https://citationpilot-production.up.railway.app";

  // Prevent mixed-content in production when an http URL is mistakenly configured.
  if (value.startsWith("http://")) {
    const withoutScheme = value.slice("http://".length);
    const isLocalhost = withoutScheme.startsWith("localhost") || withoutScheme.startsWith("127.0.0.1");
    if (!isLocalhost) return `https://${withoutScheme}`;
  }
  return value;
}

const API_ORIGIN = normalizeApiOrigin(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL);

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
