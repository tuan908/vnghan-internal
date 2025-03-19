import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        reactCompiler: true,
        ppr: true
    },
    logging: {
        fetches: {
            fullUrl: true
        }
    }
}

export default nextConfig;