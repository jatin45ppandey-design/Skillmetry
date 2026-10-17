import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {courseSlugSchema} from "@skillmetry/shared/lib/admin-courses";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request){
 const s=await adminSession();
 if(s.status!=="ready")return NextResponse.json({error:"Not available."},{
   status:s.status==="unauthorized"?401:s.status==="forbidden"?403:503,headers});
 const params=new URL(request.url).searchParams;
 const slug=params.get("slug");
 if(params.getAll("slug").length!==1||[...params.keys()].some(k=>k!=="slug")||
   !courseSlugSchema.safeParse(slug).success)return NextResponse.json({error:"Invalid course."},{status:400,headers});
 const {data,error}=await s.admin.from("admin_course_revisions")
   .select("revision,action,created_at").eq("slug",slug!)
   .order("revision",{ascending:false}).limit(15);
 if(error)return NextResponse.json({error:"History unavailable."},{status:503,headers});
 return NextResponse.json({history:data??[]},{headers});
}
