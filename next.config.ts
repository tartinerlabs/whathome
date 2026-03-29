import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // TODO: update hostname to custom domain after Vercel Blob domain migration
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
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
    viewTransition: true,
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
