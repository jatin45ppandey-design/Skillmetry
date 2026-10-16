import {describe,expect,it} from "vitest";
import {parsePublicRepositoryUrl} from "@skillmetry/shared/lib/github-evidence";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const route=readFileSync(fileURLToPath(new URL("../frontend/src/app/api/github/repository/route.ts",import.meta.url)),"utf8");
describe("read-only GitHub evidence",()=>{
  it("accepts direct public GitHub repository pointers",()=>{
    expect(parsePublicRepositoryUrl("https://github.com/example/project")).toEqual({owner:"example",repo:"project"});
    expect(parsePublicRepositoryUrl("https://github.com/example/project.git")).toEqual({owner:"example",repo:"project"});
  });
  it("rejects SSRF, subpaths, tokens and redirects",()=>{
    for(const url of ["http://github.com/a/b","https://github.com.evil.test/a/b",
      "https://github.com/a/b/tree/main","https://github.com/a/b?token=secret",
      "https://admin:pwd@github.com/a/b","https://127.0.0.1/a/b","https://github.com/a/.."])
      expect(parsePublicRepositoryUrl(url)).toBeNull();
  });
  it("does not allow arbitrary fetch hosts or claim ownership",()=>{
    expect(route).toContain("api.github.com/repos/");
    expect(route).toContain('redirect:"error"');
    expect(route).toContain("authenticatedRequest()");
    expect(route).toContain("does not prove");
  });
});
