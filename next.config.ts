import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  reactStrictMode: false,
};

// Sentry Webpack Plugin Configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs
  silent: true,

  // Auth token for Sentry CLI
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // URL to your Sentry instance (defaults to sentry.io)
  // url: process.env.SENTRY_URL,
};

// Only wrap with Sentry config if DSN is configured
const isSentryEnabled = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.SENTRY_AUTH_TOKEN;

// Export the wrapped config if Sentry is enabled, otherwise export the base config
const config = isSentryEnabled
  ? withSentryConfig(nextConfig, {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: false,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
      // (increases server load, but may improve error capture rates)
      tunnelRoute: "/api/monitoring/sentry",

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors
      automaticVercelMonitors: true,
    })
  : nextConfig;

export default config;
