import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    authInterrupts: true,
    inlineCss: true,
    proxyPrefetch: "flexible",
    optimizeCss: true,
    appNavFailHandling: true,
    optimisticClientCache: true,
    optimizePackageImports: ["exceljs"],
    optimizeServerReact: true,
    parallelServerCompiles: true,
    typedEnv: true,
    useWasmBinary: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  transpilePackages: ["fstream", "rimraf"],
};

export default nextConfig;
