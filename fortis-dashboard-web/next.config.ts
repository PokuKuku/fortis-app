import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the root directory for turbopack to avoid monorepo lockfile warnings
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
