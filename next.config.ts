import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's dev server rejects cross-origin requests to /_next/* and the HMR websocket with
  // "Unauthorized" unless the origin is whitelisted here. When the app is reached through a
  // Cloudflare quick tunnel (*.trycloudflare.com) the Host is foreign, so without this the
  // client bundle never loads and the UI hangs on the loading state. Quick-tunnel subdomains
  // change on every restart, hence the wildcard. Dev-only; ignored in production builds.
  allowedDevOrigins: ["*.trycloudflare.com"],

  async rewrites() {
    return [
      { source: "/docs", destination: "/docs.html" },
      { source: "/foda", destination: "/foda.html" },
    ];
  },
};

export default nextConfig;
