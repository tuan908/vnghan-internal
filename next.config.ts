import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    authInterrupts: true,
    inlineCss: true,
    middlewarePrefetch: "flexible",
    optimizeCss: true,
    appNavFailHandling: true,
    appDocumentPreloading: true,
    optimisticClientCache: true,
    optimizePackageImports: ["exceljs"],
    optimizeServerReact: true,
    parallelServerCompiles: true,
    typedEnv: true,
    useEarlyImport: true,
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
