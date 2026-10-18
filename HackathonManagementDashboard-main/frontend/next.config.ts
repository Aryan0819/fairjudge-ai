import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow network IP access (e.g. from another device on the same WiFi)
  allowedDevOrigins: ["192.168.1.9"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "https://backend-rho-lemon-54.vercel.app"}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/csrf-token",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" }],
      },
    ];
  },
};

export default nextConfig;
