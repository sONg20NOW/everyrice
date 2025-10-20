import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "@prisma/client": require.resolve("@prisma/client"),
      },
    },
  },
};

export default nextConfig;
