import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Admin uploads may use local or external image URLs.
  images: { unoptimized: true },
  async rewrites() {
    return {
      // Keep existing database URLs working for legacy images shipped as assets.
      fallback: [
        { source: "/uploads/projects/:file", destination: "/portfolio/:file" },
      ],
    };
  },
};
export default nextConfig;
