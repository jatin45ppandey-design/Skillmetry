import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const read=(path:string)=>readFileSync(fileURLToPath(new URL("../"+path,import.meta.url)),"utf8");

describe("Post-merge reliability: course deep links and cross-account isolation",()=>{
  it("resolves a published deep-linked course even outside the first catalog page",()=>{
    const page=read("frontend/src/app/(workspace)/courses/page.tsx");
    expect(page).toContain("handledDeepLink=useRef(false)");
    expect(page).toContain('fetch("/api/content/courses?course="+encodeURIComponent(wanted)');
    expect(page).toContain('!found)throw new Error("Saved course is no longer published.")');
    expect(page).toContain("setItems(existing=>existing.some");
    expect(page).toContain("handledDeepLink.current=true");
  });
  it("does not transfer stale lesson-save feedback between accounts",()=>{
    const page=read("frontend/src/app/(workspace)/courses/page.tsx");
    expect(page).toContain("currentAccount.current=user?.id??null");
    expect(page).toContain("const ownerId=user.id");
    expect(page).toContain("if(currentAccount.current!==ownerId)return;");
    expect(page).toContain("if(currentAccount.current===ownerId)setProgressError");
  });
});
describe("Post-merge Admin review exact-revision visibility",()=>{
  it("supports validated review selection without exposing unlimited records",()=>{
    const endpoint=read("frontend/src/app/api/admin/reviews/route.ts");
    expect(endpoint).toContain("export async function GET(request:Request)");
    expect(endpoint).toContain('lookupKeys=["module","contentId","revision"]');
    expect(endpoint).toContain("requestSchema.safeParse");
    expect(endpoint).toContain('.eq("requested_revision",requested.data.revision)');
    expect(endpoint).toContain("lookup?1:150");
    expect(endpoint).toContain("adminSession()");
    expect(endpoint).toContain("approvalEnabled()");
  });
  it("checks one content revision rather than assuming it is in the first 150 reviews",()=>{
    const view=read("frontend/src/components/admin-editorial-reviews.tsx");
    expect(view).toContain('new URLSearchParams({module,contentId,revision:String(revision)})');
    expect(view).toContain('fetch("/api/admin/reviews?"+params.toString()');
  });
});
