import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  logging: {
    browserToTerminal: true,
  },
  typedRoutes: true,
  experimental: {
    cachedNavigations: true,
    mcpServer: true,
    turbopackFileSystemCacheForBuild: true,
    typedEnv: true,
  },
};

export default nextConfig;
