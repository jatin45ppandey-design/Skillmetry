import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repositoryRoot,
  transpilePackages: ["@skillmetry/shared", "@skillmetry/backend"]
};
export default nextConfig;
