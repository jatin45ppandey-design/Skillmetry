import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";
import { parsePublicRepositoryUrl } from "@skillmetry/shared/lib/github-evidence";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated") return NextResponse.json({error:"Sign in to inspect project evidence."},{status:401});
  const parsed=z.string().max(250).safeParse(request.nextUrl.searchParams.get("url"));
  const repo=parsed.success?parsePublicRepositoryUrl(parsed.data):null;
  if(!repo) return NextResponse.json({error:"Enter a direct public https://github.com/owner/repository URL."},{status:400});
  try {
    const headers:Record<string,string>={"Accept":"application/vnd.github+json","User-Agent":"Skillmetry-Public-Evidence-Reader"};
    const publicToken=process.env.GITHUB_PUBLIC_METADATA_TOKEN?.trim();
    if(publicToken) headers.Authorization="Bearer "+publicToken;
    // Fixed GitHub API host; user input is strict path components, never a fetch URL.
    const response=await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`,{
      headers,cache:"no-store",signal:AbortSignal.timeout(6000),redirect:"error"
    });
    if(response.status===404) return NextResponse.json({error:"Public repository was not found or is private."},{status:404});
    if(response.status===403||response.status===429) return NextResponse.json({error:"GitHub metadata rate limit reached. Try later."},{status:429});
    if(!response.ok) return NextResponse.json({error:"GitHub metadata is temporarily unavailable."},{status:502});
    const result=await response.json() as {
      full_name?:string;html_url?:string;private?:boolean;description?:string|null;archived?:boolean;
      stargazers_count?:number;pushed_at?:string|null;default_branch?:string;owner?:{id?:number;login?:string}
    };
    if(result.private || result.full_name?.toLowerCase()!==`${repo.owner}/${repo.repo}`.toLowerCase()) {
      return NextResponse.json({error:"Repository metadata could not be validated."},{status:502});
    }
    const session=await auth.supabase.auth.getUser();
    const identity=session.data.user?.id===auth.userId
      ? session.data.user.identities?.find(i=>i.provider==="github") : null;
    const linkedId=identity?.provider_id;
    const ownershipMatched=Boolean(linkedId && result.owner?.id &&
      String(linkedId)===String(result.owner.id));
    return NextResponse.json({repository:{
      name:result.full_name,
      url:`https://github.com/${repo.owner}/${repo.repo}`,
      description:typeof result.description==="string"?result.description.slice(0,300):null,
      archived:Boolean(result.archived),
      stars:Number.isFinite(result.stargazers_count)?result.stargazers_count:0,
      lastPush:result.pushed_at??null,
      defaultBranch:result.default_branch??null,
      linkedGitHubOwner:ownershipMatched
    },disclaimer:"Matching a linked GitHub identity proves the public repository owner account ID, not who wrote the code, reviewed the project, or mastered the skill."},
    {headers:{"Cache-Control":"private, no-store"}});
  }catch {
    return NextResponse.json({error:"Public GitHub metadata could not be fetched."},{status:502});
  }
}
