import {NextResponse} from "next/server";
import {adminSession} from "@skillmetry/backend/lib/admin/session.server";
import {adminMissionIdSchema} from "@skillmetry/shared/lib/admin-missions";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function GET(request:Request){
 if(process.env.SKILLMETRY_ADMIN_MISSIONS_ENABLED!=="true")
   return NextResponse.json({error:"Mission Builder is staged."},{status:503,headers});
 const session=await adminSession();
 if(session.status!=="ready")
   return NextResponse.json({error:"Not available."},{
      status:session.status==="unauthorized"?401:session.status==="forbidden"?403:503,headers});
 const params=new URL(request.url).searchParams;
 const id=params.get("id");
 if(params.getAll("id").length!==1||[...params.keys()].some(k=>k!=="id")||
   !adminMissionIdSchema.safeParse(id).success)
   return NextResponse.json({error:"Invalid mission."},{status:400,headers});
 const {data,error}=await session.admin.from("admin_mission_revisions")
   .select("revision,action,created_at").eq("mission_id",id!)
   .order("revision",{ascending:false}).limit(15);
 if(error)return NextResponse.json({error:"History unavailable."},{status:503,headers});
 return NextResponse.json({history:data??[]},{headers});
}
