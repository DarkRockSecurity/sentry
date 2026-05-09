import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode helps surface effect-cleanup bugs in dev
  reactStrictMode: true,

  // Remote images we serve through next/image — no remote sources today,
  // but listing the marketing screenshot path makes future swaps trivial.
  images: {
    remotePatterns: [],
  },

  // Generated Prisma client lives outside node_modules; mark it serverExternal
  // so Next doesn't try to bundle it for the edge runtime.
  serverExternalPackages: ["@prisma/client", "@/generated/prisma", "bcryptjs"],

  // Larger body for file uploads (forensic evidence, etc.) on server actions.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
