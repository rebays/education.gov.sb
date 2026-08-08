import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone with a minimal server for the Docker image.
  output: "standalone",
  experimental: {
    viewTransition: true,
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
