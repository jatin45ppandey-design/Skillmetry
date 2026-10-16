import { NextResponse } from "next/server";
import { authenticatedRequest } from "@skillmetry/backend/lib/supabase/request-auth";

export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated") return NextResponse.json({error:"Sign in to connect GitHub."},{status:401});
  const {data,error}=await auth.supabase.auth.getUser();
  if(error||data.user?.id!==auth.userId) return NextResponse.json({error:"Unable to verify your account."},{status:401});
  const identity=data.user.identities?.find(item=>item.provider==="github");
  const githubName=identity?.identity_data?.user_name;
  return NextResponse.json({
    connected:Boolean(identity),
    account:typeof githubName==="string"?githubName:null,
    scope:"Supabase-linked GitHub identity only. No private repository access is requested."
  },{headers});
}

export async function DELETE() {
  const auth=await authenticatedRequest();
  if(auth.status!=="authenticated") return NextResponse.json({error:"Sign in to disconnect GitHub."},{status:401});
  const {data,error}=await auth.supabase.auth.getUser();
  if(error||data.user?.id!==auth.userId) return NextResponse.json({error:"Unable to verify your account."},{status:401});
  const identity=data.user.identities?.find(item=>item.provider==="github");
  if(!identity) return NextResponse.json({disconnected:true},{headers});
  if((data.user.identities?.length??0)<2)
    return NextResponse.json({error:"Add another sign-in method before disconnecting your only identity."},{status:409});
  const result=await auth.supabase.auth.unlinkIdentity(identity);
  if(result.error) return NextResponse.json({error:"Could not disconnect GitHub identity. Retry from Account settings."},{status:503});
  return NextResponse.json({disconnected:true},{headers});
}
