import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { careers, skills } from "@skillmetry/shared/data/catalog";
import { learningResources } from "@skillmetry/shared/data/learning-resources";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("restructured module boundaries", () => {
  it("preserves the complete curated product catalogs", () => {
    expect(careers).toHaveLength(4);
    expect(skills).toHaveLength(18);
    expect(learningResources).toHaveLength(50);
  });

  it("keeps one canonical protected assessment implementation", () => {
    expect(existsSync(join(repositoryRoot, "backend/lib/assessments/question-bank.server.ts"))).toBe(true);
    expect(existsSync(join(repositoryRoot, "backend/lib/assessments/grading.server.ts"))).toBe(true);
    expect(existsSync(join(repositoryRoot, "frontend/src/lib/assessments/question-bank.server.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "frontend/src/lib/assessments/grading.server.ts"))).toBe(false);
    expect(existsSync(join(repositoryRoot, "shared/lib/assessments/question-bank.server.ts"))).toBe(false);
  });

  it("prevents client components from importing server-only packages", () => {
    for (const path of sourceFiles(join(repositoryRoot, "frontend/src"))) {
      const source = readFileSync(path, "utf8");
      if (source.startsWith('"use client"') || source.startsWith("'use client'")) {
        expect(source, path).not.toContain("@skillmetry/backend");
      }
    }
  });

  it("keeps service-role configuration outside browser-safe source", () => {
    for (const root of ["frontend/src", "shared"]) {
      for (const path of sourceFiles(join(repositoryRoot, root))) {
        const source = readFileSync(path, "utf8");
        expect(source, path).not.toContain("SUPABASE_SECRET_KEY");
        expect(source, path).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      }
    }
  });
});
