import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: currentDirectory });
const frontendDirectory = fileURLToPath(new URL("./frontend", import.meta.url));

export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/next-env.d.ts",
      "database/supabase/.temp/**",
      "database/supabase/.branches/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { settings: { next: { rootDir: frontendDirectory } } }
];
