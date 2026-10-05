import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:43124";

const nextConfig: NextConfig = {
  turbopack: {
    // R3F 9 constructs THREE.Clock. Serve a Timer-backed Clock instead.
    resolveAlias: {
      three: "./src/lib/three-entry.js",
    },
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.cursor.sh",
    "*.cursor.com",
    "*.ngrok-free.app",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
