import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/docs", destination: "/docs.html" },
      { source: "/foda", destination: "/foda.html" },
    ];
  },
};

export default nextConfig;
