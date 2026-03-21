import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  logging: {
    browserToTerminal: true,
  },
  skipTrailingSlashRedirect: true,
  typedRoutes: true,
  experimental: {
    cachedNavigations: true,
    mcpServer: true,
    turbopackFileSystemCacheForBuild: true,
    typedEnv: true,
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default withWorkflow(nextConfig);
