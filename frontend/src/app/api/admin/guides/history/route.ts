import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {skills} from "@skillmetry/shared/data/catalog";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const session=await adminSession();
 const headers={"Cache-Control":"private, no-store"};
 if(session.status!=="ready")return NextResponse.json({error:"Not available."},
  {status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers});
 const id=new URL(request.url).searchParams.get("skill");
 if(!id||!skills.some(s=>s.id===id))return NextResponse.json({error:"Unknown skill."},{status:400,headers});
 const {data,error}=await session.admin.from("admin_guide_revisions")
   .select("revision,action,created_at").eq("skill_id",id)
   .order("revision",{ascending:false}).limit(15);
 if(error)return NextResponse.json({error:"Revision history unavailable."},{status:503,headers});
 return NextResponse.json({history:data??[]},{headers});
}
