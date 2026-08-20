import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/*": ["./public/geo/barrios.geojson"],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json",
    });
    return config;
  },
};

export default nextConfig;
