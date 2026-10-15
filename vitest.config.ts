import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"]
  },
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: fileURLToPath(new URL("./frontend/src/$1", import.meta.url)) },
      { find: "server-only", replacement: fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) }
    ]
  }
});
