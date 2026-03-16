import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["baileys"],
  async headers() {
    return [
      {
        source: "/view",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
