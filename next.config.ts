import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents is off on purpose: pages are DB-driven and must read fresh data.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
