import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {careers} from "@skillmetry/shared/data/catalog";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request){
 const session=await adminSession();
 if(session.status!=="ready")return NextResponse.json({error:"Not available."},{
   status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers});
 const params=new URL(request.url).searchParams;
 const careerId=params.get("career");
 if(!careerId||params.getAll("career").length!==1||[...params.keys()].some(k=>k!=="career")
   ||!careers.some(c=>c.id===careerId))return NextResponse.json({error:"Unknown career."},{status:400,headers});
 const {data,error}=await session.admin.from("admin_career_roadmap_revisions")
  .select("revision,action,created_at").eq("career_id",careerId)
  .order("revision",{ascending:false}).limit(15);
 if(error)return NextResponse.json({error:"Roadmap history unavailable."},{status:503,headers});
 return NextResponse.json({history:data??[]},{headers});
}
