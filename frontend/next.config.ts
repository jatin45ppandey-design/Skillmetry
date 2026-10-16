import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ["@skillmetry/shared", "@skillmetry/backend"],
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        {key:"X-Content-Type-Options",value:"nosniff"},
        {key:"X-Frame-Options",value:"DENY"},
        {key:"Referrer-Policy",value:"no-referrer"},
        {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
        {key:"X-DNS-Prefetch-Control",value:"off"}
      ]
    }];
  }
};
export default nextConfig;
