import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["app", "lib", "prisma"], // Directories to run ESLint on
  },
};

export default nextConfig;
